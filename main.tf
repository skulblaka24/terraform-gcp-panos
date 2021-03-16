terraform {
  required_providers {
    panos = {
      source = "PaloAltoNetworks/panos"
      version = "1.8.0"
    }
  }
}

provider "panos" {
  # Configuration options
  hostname = var.fw_ip
  username = var.username
  password = var.password
  port = 443
  verify_certificate = false
  logging = ["action", "op", "uid"]
}

resource "panos_security_policy" "rule1" {
  rule {
    name = "allow"
    source_zones = ["any"]
    source_addresses = ["any"]
    source_users = ["any"]
    hip_profiles = ["any"]
    destination_zones = ["any"]
    destination_addresses = ["any"]
    applications = ["any"]
    services = ["application-default"]
    categories = ["any"]
    action = "allow"
  }
}

resource "null_resource" "commit_fw" {
#  triggers {
#    version = "0.1"
#  }

  provisioner "local-exec" {
    #command = "./commit.sh ${var.fw_ip} ${var.password}"

    command = "pwd"

    #command = "./go get github.com/PaloAltoNetworks/pango && ./go build firewall-commit.go && ls -la && ./firewall-commit -host ${var.fw_ip} -user admin -pass ${var.password}"


  }
}