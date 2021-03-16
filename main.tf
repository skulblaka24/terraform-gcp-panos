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

resource "panos_vlan" "example" {
    name = "myVlan"
    vlan_interface = panos_vlan_interface.vli.name
}
resource "panos_vlan_interface" "vli" {
    name = "vlan.6"
    vsys = "vsys1"
}
