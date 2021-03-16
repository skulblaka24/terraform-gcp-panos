import Hero from '@hashicorp/react-hero'
import SectionHeader from '@hashicorp/react-section-header'
import UseCases from '@hashicorp/react-use-cases'
import TextSplits from '@hashicorp/react-text-splits'
import Button from '@hashicorp/react-button'
import BeforeAfterDiagram from '../../components/before-after-diagram'
//  Imports below are used in getStaticProps only
import RAW_CONTENT from './content.json'
import highlightData from '@hashicorp/nextjs-scripts/prism/highlight-data'

export async function getStaticProps() {
  const content = await highlightData(RAW_CONTENT)
  return { props: { content } }
}

export default function Homepage({ content }) {
  return (
    <div id="page-home">
      <div className="g-section-block page-wrap">
        {/* Hero */}
        <Hero
          data={{
            backgroundImage: {
              alt: null,
              size: 55617,
              url:
                'https://www.datocms-assets.com/2885/1539894412-vault-bg.jpg',
              width: 3196,
            },
            backgroundTheme: 'light',
            buttons: [
              {
                external: false,
                title: 'Download',
                url: 'https://www.vaultproject.io/downloads',
              },
              {
                external: false,
                title: 'Get Started with Vault',
                url: 'https://www.vaultproject.io/intro/getting-started',
              },
            ],
            centered: false,
            description:
              'Secure, store and tightly control access to tokens, passwords, certificates, encryption keys for protecting secrets and other sensitive data using a UI, CLI, or HTTP API.',
            theme: 'vault-gray',
            title: 'Manage Secrets and Protect Sensitive Data',
            videos: [
              {
                name: 'UI',
                playbackRate: 2,
                src: [
                  {
                    srcType: 'mp4',
                    url:
                      'https://www.datocms-assets.com/2885/1543956852-vault-v1-0-ui-opt.mp4',
                  },
                ],
              },
              {
                name: 'CLI',
                playbackRate: 2,
                src: [
                  {
                    srcType: 'mp4',
                    url:
                      'https://www.datocms-assets.com/2885/1543956847-vault-v1-0-cli-opt.mp4',
                  },
                ],
              },
            ],
          }}
        />

        {/* Text Section */}

        <section className="g-container remove-bottom-padding">
          <SectionHeader
            headline="Secure dynamic infrastructure across clouds and environments"
            description="The shift from static, on-premise infrastructure to dynamic, multi-provider infrastructure changes the approach to security. Security in static infrastructure relies on dedicated servers, static IP addresses, and a clear network perimeter. Security in dynamic infrastructure is defined by ephemeral applications and servers, trusted sources of user and application identity, and software-based encryption."
          />
        </section>

        {/* Before-After Diagram */}

        <section className="g-container before-after">
          <BeforeAfterDiagram
            beforeImage={{
              url:
                'https://www.datocms-assets.com/2885/1579635889-static-infrastructure.svg',
              format: 'svg',
            }}
            beforeHeadline="Static Infrastructure"
            beforeContent={`Datacenters with inherently high-trust networks with clear network perimeters.

#### Traditional Approach

- High trust networks
- A clear network perimeter
- Security enforced by IP Address`}
            afterImage={{
              url:
                'https://www.datocms-assets.com/2885/1579635892-dynamic-infrastructure.svg',
              format: 'svg',
            }}
            afterHeadline="Dynamic Infrastructure"
            afterContent={`Multiple clouds and private datacenters without a clear network perimeter.

#### Vault Approach


- Low-trust networks in public clouds
- Unknown network perimeter across clouds
- Security enforced by Identity`}
          />
        </section>

        {/* Use cases */}

        <section>
          <div className="g-container">
            <UseCases
              theme="vault"
              items={[
                {
                  title: 'Secrets Management',
                  description:
                    'Audit access, automatically Centrally store, access, and deploy secrets across applications, systems, and infrastructure',
                  image: {
                    alt: null,
                    format: 'png',
                    url:
                      'https://www.datocms-assets.com/2885/1575422126-secrets.png',
                  },
                  link: {
                    external: false,
                    title: 'Learn more',
                    url: '/use-cases/secrets-management',
                  },
                },
                {
                  title: 'Data Encryption',
                  description:
                    'Keep secrets and application data secure with one centralized workflow to encrypt data in flight and at rest',
                  image: {
                    alt: null,
                    format: 'png',
                    url:
                      'https://www.datocms-assets.com/2885/1575422166-encryption.png',
                  },
                  link: {
                    external: false,
                    title: 'Learn more',
                    url: '/use-cases/data-encryption',
                  },
                },
                {
                  title: 'Identity-based Access',
                  description:
                    'Authenticate and access different clouds, systems, and endpoints using trusted identities',
                  image: {
                    alt: null,
                    format: 'png',
                    url:
                      'https://www.datocms-assets.com/2885/1575422201-identity.png',
                  },
                  link: {
                    external: false,
                    title: 'Learn more',
                    url: '/use-cases/identity-based-access',
                  },
                },
              ]}
            />
          </div>
        </section>

        {/* Principles / Text & Content Blocks */}
        <section className="no-section-spacing">
          <div className="g-grid-container">
            <SectionHeader headline="Vault Principles" />
          </div>
          <TextSplits textSplits={content.principles} />
        </section>

        <section className="g-container">
          <SectionHeader
            headline="Open Source and Enterprise"
            description="Vault Open Source addresses the technical complexity of managing secrets by leveraging trusted identities across distributed infrastructure and clouds. Vault Enterprise addresses the organizational complexity of large user bases and compliance requirements with collaboration and governance features."
          />
          <div className="button-container">
            <Button
              title="Learn More"
              url="https://www.hashicorp.com/products/vault/enterprise"
            />
          </div>
        </section>
      </div>
    </div>
  )
}
