terraform {
  required_providers {
    panos = {
      source = "PaloAltoNetworks/panos"
      version = "1.6.3"
    }
  }
}

provider "panos" {
  hostname = "${var.fw_ip}"
  username = "${var.username}"
  password = "${var.password}"
}
