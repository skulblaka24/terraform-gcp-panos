# Palo Alto rule management

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
    name = "allow-int-to-ext"
    source_zones = ["Zone-vm-1"]
    source_addresses = ["any"]
    source_users = ["any"]
    hip_profiles = ["any"]
    destination_zones = ["Zone-internet"]
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
    command = "./commit.sh ${var.fw_ip} ${var.password}"
  }
  depends_on = [panos_security_policy.rule1]
}