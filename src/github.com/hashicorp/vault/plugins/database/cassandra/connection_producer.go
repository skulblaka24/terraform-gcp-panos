package cassandra

import (
	"context"
	"crypto/tls"
	"fmt"
	"strings"
	"sync"
	"time"

	"github.com/gocql/gocql"
	"github.com/hashicorp/errwrap"
	dbplugin "github.com/hashicorp/vault/sdk/database/dbplugin/v5"
	"github.com/hashicorp/vault/sdk/database/helper/connutil"
	"github.com/hashicorp/vault/sdk/database/helper/dbutil"
	"github.com/hashicorp/vault/sdk/helper/certutil"
	"github.com/hashicorp/vault/sdk/helper/parseutil"
	"github.com/hashicorp/vault/sdk/helper/tlsutil"
	"github.com/mitchellh/mapstructure"
)

// cassandraConnectionProducer implements ConnectionProducer and provides an
// interface for cassandra databases to make connections.
type cassandraConnectionProducer struct {
	Hosts              string      `json:"hosts" structs:"hosts" mapstructure:"hosts"`
	Port               int         `json:"port" structs:"port" mapstructure:"port"`
	Username           string      `json:"username" structs:"username" mapstructure:"username"`
	Password           string      `json:"password" structs:"password" mapstructure:"password"`
	TLS                bool        `json:"tls" structs:"tls" mapstructure:"tls"`
	InsecureTLS        bool        `json:"insecure_tls" structs:"insecure_tls" mapstructure:"insecure_tls"`
	ProtocolVersion    int         `json:"protocol_version" structs:"protocol_version" mapstructure:"protocol_version"`
	ConnectTimeoutRaw  interface{} `json:"connect_timeout" structs:"connect_timeout" mapstructure:"connect_timeout"`
	SocketKeepAliveRaw interface{} `json:"socket_keep_alive" structs:"socket_keep_alive" mapstructure:"socket_keep_alive"`
	TLSMinVersion      string      `json:"tls_min_version" structs:"tls_min_version" mapstructure:"tls_min_version"`
	Consistency        string      `json:"consistency" structs:"consistency" mapstructure:"consistency"`
	LocalDatacenter    string      `json:"local_datacenter" structs:"local_datacenter" mapstructure:"local_datacenter"`
	PemBundle          string      `json:"pem_bundle" structs:"pem_bundle" mapstructure:"pem_bundle"`
	PemJSON            string      `json:"pem_json" structs:"pem_json" mapstructure:"pem_json"`
	SkipVerification   bool        `json:"skip_verification" structs:"skip_verification" mapstructure:"skip_verification"`

	connectTimeout  time.Duration
	socketKeepAlive time.Duration
	certificate     string
	privateKey      string
	issuingCA       string
	rawConfig       map[string]interface{}

	Initialized bool
	Type        string
	session     *gocql.Session
	sync.Mutex
}

func (c *cassandraConnectionProducer) Initialize(ctx context.Context, req dbplugin.InitializeRequest) (dbplugin.InitializeResponse, error) {
	c.Lock()
	defer c.Unlock()

	c.rawConfig = req.Config

	err := mapstructure.WeakDecode(req.Config, c)
	if err != nil {
		return dbplugin.InitializeResponse{}, err
	}

	if c.ConnectTimeoutRaw == nil {
		c.ConnectTimeoutRaw = "0s"
	}
	c.connectTimeout, err = parseutil.ParseDurationSecond(c.ConnectTimeoutRaw)
	if err != nil {
		return dbplugin.InitializeResponse{}, errwrap.Wrapf("invalid connect_timeout: {{err}}", err)
	}

	if c.SocketKeepAliveRaw == nil {
		c.SocketKeepAliveRaw = "0s"
	}
	c.socketKeepAlive, err = parseutil.ParseDurationSecond(c.SocketKeepAliveRaw)
	if err != nil {
		return dbplugin.InitializeResponse{}, errwrap.Wrapf("invalid socket_keep_alive: {{err}}", err)
	}

	switch {
	case len(c.Hosts) == 0:
		return dbplugin.InitializeResponse{}, fmt.Errorf("hosts cannot be empty")
	case len(c.Username) == 0:
		return dbplugin.InitializeResponse{}, fmt.Errorf("username cannot be empty")
	case len(c.Password) == 0:
		return dbplugin.InitializeResponse{}, fmt.Errorf("password cannot be empty")
	}

	var certBundle *certutil.CertBundle
	var parsedCertBundle *certutil.ParsedCertBundle
	switch {
	case len(c.PemJSON) != 0:
		parsedCertBundle, err = certutil.ParsePKIJSON([]byte(c.PemJSON))
		if err != nil {
			return dbplugin.InitializeResponse{}, errwrap.Wrapf("could not parse given JSON; it must be in the format of the output of the PKI backend certificate issuing command: {{err}}", err)
		}
		certBundle, err = parsedCertBundle.ToCertBundle()
		if err != nil {
			return dbplugin.InitializeResponse{}, errwrap.Wrapf("Error marshaling PEM information: {{err}}", err)
		}
		c.certificate = certBundle.Certificate
		c.privateKey = certBundle.PrivateKey
		c.issuingCA = certBundle.IssuingCA
		c.TLS = true

	case len(c.PemBundle) != 0:
		parsedCertBundle, err = certutil.ParsePEMBundle(c.PemBundle)
		if err != nil {
			return dbplugin.InitializeResponse{}, errwrap.Wrapf("Error parsing the given PEM information: {{err}}", err)
		}
		certBundle, err = parsedCertBundle.ToCertBundle()
		if err != nil {
			return dbplugin.InitializeResponse{}, errwrap.Wrapf("Error marshaling PEM information: {{err}}", err)
		}
		c.certificate = certBundle.Certificate
		c.privateKey = certBundle.PrivateKey
		c.issuingCA = certBundle.IssuingCA
		c.TLS = true
	}

	// Set initialized to true at this point since all fields are set,
	// and the connection can be established at a later time.
	c.Initialized = true

	if req.VerifyConnection {
		if _, err := c.Connection(ctx); err != nil {
			return dbplugin.InitializeResponse{}, errwrap.Wrapf("error verifying connection: {{err}}", err)
		}
	}

	resp := dbplugin.InitializeResponse{
		Config: req.Config,
	}

	return resp, nil
}

func (c *cassandraConnectionProducer) Connection(ctx context.Context) (interface{}, error) {
	if !c.Initialized {
		return nil, connutil.ErrNotInitialized
	}

	// If we already have a DB, return it
	if c.session != nil && !c.session.Closed() {
		return c.session, nil
	}

	session, err := c.createSession(ctx)
	if err != nil {
		return nil, err
	}

	//  Store the session in backend for reuse
	c.session = session

	return session, nil
}

func (c *cassandraConnectionProducer) Close() error {
	c.Lock()
	defer c.Unlock()

	if c.session != nil {
		c.session.Close()
	}

	c.session = nil

	return nil
}

func (c *cassandraConnectionProducer) createSession(ctx context.Context) (*gocql.Session, error) {
	hosts := strings.Split(c.Hosts, ",")
	clusterConfig := gocql.NewCluster(hosts...)
	clusterConfig.Authenticator = gocql.PasswordAuthenticator{
		Username: c.Username,
		Password: c.Password,
	}

	if c.Port != 0 {
		clusterConfig.Port = c.Port
	}

	clusterConfig.ProtoVersion = c.ProtocolVersion
	if clusterConfig.ProtoVersion == 0 {
		clusterConfig.ProtoVersion = 2
	}

	clusterConfig.Timeout = c.connectTimeout
	clusterConfig.SocketKeepalive = c.socketKeepAlive
	if c.TLS {
		var tlsConfig *tls.Config
		if len(c.certificate) > 0 || len(c.issuingCA) > 0 {
			if len(c.certificate) > 0 && len(c.privateKey) == 0 {
				return nil, fmt.Errorf("found certificate for TLS authentication but no private key")
			}

			certBundle := &certutil.CertBundle{}
			if len(c.certificate) > 0 {
				certBundle.Certificate = c.certificate
				certBundle.PrivateKey = c.privateKey
			}
			if len(c.issuingCA) > 0 {
				certBundle.IssuingCA = c.issuingCA
			}

			parsedCertBundle, err := certBundle.ToParsedCertBundle()
			if err != nil {
				return nil, errwrap.Wrapf("failed to parse certificate bundle: {{err}}", err)
			}

			tlsConfig, err = parsedCertBundle.GetTLSConfig(certutil.TLSClient)
			if err != nil || tlsConfig == nil {
				return nil, errwrap.Wrapf(fmt.Sprintf("failed to get TLS configuration: tlsConfig:%#v err:{{err}}", tlsConfig), err)
			}
			tlsConfig.InsecureSkipVerify = c.InsecureTLS

			if c.TLSMinVersion != "" {
				var ok bool
				tlsConfig.MinVersion, ok = tlsutil.TLSLookup[c.TLSMinVersion]
				if !ok {
					return nil, fmt.Errorf("invalid 'tls_min_version' in config")
				}
			} else {
				// MinVersion was not being set earlier. Reset it to
				// zero to gracefully handle upgrades.
				tlsConfig.MinVersion = 0
			}
		}

		clusterConfig.SslOpts = &gocql.SslOptions{
			Config: tlsConfig,
		}
	}

	if c.LocalDatacenter != "" {
		clusterConfig.PoolConfig.HostSelectionPolicy = gocql.DCAwareRoundRobinPolicy(c.LocalDatacenter)
	}

	session, err := clusterConfig.CreateSession()
	if err != nil {
		return nil, errwrap.Wrapf("error creating session: {{err}}", err)
	}

	if c.Consistency != "" {
		consistencyValue, err := gocql.ParseConsistencyWrapper(c.Consistency)
		if err != nil {
			session.Close()
			return nil, err
		}

		session.SetConsistency(consistencyValue)
	}

	if !c.SkipVerification {
		err = session.Query(`LIST ALL`).WithContext(ctx).Exec()
		if err != nil && len(c.Username) != 0 && strings.Contains(err.Error(), "not authorized") {
			rowNum := session.Query(dbutil.QueryHelper(`LIST CREATE ON ALL ROLES OF '{{username}}';`, map[string]string{
				"username": c.Username,
			})).Iter().NumRows()

			if rowNum < 1 {
				session.Close()
				return nil, errwrap.Wrapf("error validating connection info: No role create permissions found, previous error: {{err}}", err)
			}
		} else if err != nil {
			session.Close()
			return nil, errwrap.Wrapf("error validating connection info: {{err}}", err)
		}
	}

	return session, nil
}

func (c *cassandraConnectionProducer) secretValues() map[string]string {
	return map[string]string{
		c.Password:  "[password]",
		c.PemBundle: "[pem_bundle]",
		c.PemJSON:   "[pem_json]",
	}
}
