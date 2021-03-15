# 
# PANOS_HOSTNAME
# PANOS_USERNAME
# PANOS_PASSWORD

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
}

resource "panos_security_policy" "rule1" {
  rule {
    name = "allow"
    source_zones = ["any"]
    source_addresses = ["any"]
    source_users = ["any"]
    hip_profiles = ["any"]
    destination_zones = ["all"]
    destination_addresses = ["any"]
    applications = ["any"]
    services = ["application-default"]
    categories = ["any"]
    action = "allow"
  }
}