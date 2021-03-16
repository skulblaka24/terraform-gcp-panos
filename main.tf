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

resource "panos_ethernet_interface" "eth1" {
  name = "ethernet1/1"
  vsys = "vsys1"
  mode = "layer3"
  static_ips = ["10.133.0.3/24"]
}

resource "panos_ethernet_interface" "eth2" {
  name = "ethernet1/2"
  vsys = "vsys1"
  mode = "layer3"
  static_ips = ["10.135.0.3/24"]
  depends_on = [panos_ethernet_interface.eth1]
}

resource "panos_virtual_router" "vr" {
  name = "default"
  interfaces = [
        "${panos_ethernet_interface.eth1.name}",
        "${panos_ethernet_interface.eth2.name}"
  ]
  depends_on = [panos_ethernet_interface.eth2]
}

resource "panos_zone" "int" {
  name = "L3-trust"
  mode = "layer3"
  interfaces = ["${panos_ethernet_interface.eth1.name}"]
  depends_on = [panos_virtual_router.vr]
}

resource "panos_zone" "ext" {
  name = "L3-untrust"
  mode = "layer3"
  interfaces = ["${panos_ethernet_interface.eth2.name}"]
  depends_on = [panos_zone.ext]
}

resource "panos_security_policy" "rule1" {
  rule {
    name = "allow-int-to-ext"
    source_zones = ["L3-trust"]
    source_addresses = ["any"]
    source_users = ["any"]
    hip_profiles = ["any"]
    destination_zones = ["L3-untrust"]
    destination_addresses = ["any"]
    applications = ["any"]
    services = ["application-default"]
    categories = ["any"]
    action = "allow"
  }
  depends_on = [panos_zone.ext]
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