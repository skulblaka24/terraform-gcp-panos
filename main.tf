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
}

resource "panos_security_policy" "example" {
    rule {
        name = "allow everything lolwat"
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
