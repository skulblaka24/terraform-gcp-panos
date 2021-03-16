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
    name = "allow-all"
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

resource "panos_security_policy" "rule2" {
  rule {
    name = "allow-nginx-http"
    source_zones = ["any"]
    source_addresses = ["any"]
    source_users = ["any"]
    hip_profiles = ["any"]
    destination_zones = ["Zone-vm-1"]
    destination_addresses = ["any"]
    applications = ["any"]
    services = ["service-http"]
    categories = ["any"]
    action = "allow"
  }
  depends_on = [panos_security_policy.rule1]
}

resource "panos_security_policy" "rule3" {
  rule {
    name = "allow-nginx-https"
    source_zones = ["any"]
    source_addresses = ["any"]
    source_users = ["any"]
    hip_profiles = ["any"]
    destination_zones = ["Zone-vm-1"]
    destination_addresses = ["any"]
    applications = ["any"]
    services = ["service-https"]
    categories = ["any"]
    action = "allow"
  }
  depends_on = [panos_security_policy.rule2]
}

resource "panos_security_policy" "rule4" {
  rule {
    name = "allow-all-nginx-ssh-access"
    source_zones = ["any"]
    source_addresses = ["any"]
    source_users = ["any"]
    hip_profiles = ["any"]
    destination_zones = ["Zone-vm-1"]
    destination_addresses = ["any"]
    applications = ["any"]
    services = ["service-ssh"]
    categories = ["any"]
    action = "allow"
  }
  depends_on = [panos_security_policy.rule3]
}

resource "null_resource" "commit_fw" {
#  triggers {
#    version = "0.1"
#  }

  provisioner "local-exec" {
    command = "./commit.sh ${var.fw_ip} ${var.password}"
  }
  depends_on = [panos_security_policy.rule4]
}