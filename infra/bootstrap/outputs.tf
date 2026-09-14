output "state_bucket_name" {
  description = "S3 bucket used by infra/app."
  value       = aws_s3_bucket.terraform_state.id
}

output "state_bucket_region" {
  description = "Region used by the remote backend."
  value       = var.aws_region
}
