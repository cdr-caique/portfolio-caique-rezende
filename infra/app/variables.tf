variable "aws_region" {
  type    = string
  default = "sa-east-1"

  validation {
    condition     = var.aws_region == "sa-east-1"
    error_message = "This portfolio must be managed in sa-east-1."
  }
}

variable "app_name" {
  type    = string
  default = "caique-rezende-dev"
}

variable "repository_url" {
  type    = string
  default = "https://github.com/cdr-caique/caique-rezende-dev"
}

variable "branch_name" {
  type    = string
  default = "main"
}

variable "domain_name" {
  type    = string
  default = "caique-rezende.dev"
}
