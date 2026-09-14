variable "aws_region" {
  description = "AWS region for the state bucket and Amplify resources."
  type        = string
  default     = "sa-east-1"

  validation {
    condition     = var.aws_region == "sa-east-1"
    error_message = "This portfolio must be managed in sa-east-1."
  }
}

variable "project_name" {
  description = "Stable project identifier used in names and tags."
  type        = string
  default     = "portfolio-caique-rezende"
}
