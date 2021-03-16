variable "fw_ip" {}
variable "username" {}
variable "password" {
  type = string
  sensitive = true
  default = "secret"
}