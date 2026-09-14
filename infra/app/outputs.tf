output "amplify_app_id" {
  description = "Operational identifier of the Amplify application."
  value       = aws_amplify_app.portfolio.id
}

output "amplify_default_domain" {
  description = "Default Amplify domain available before custom-domain cutover."
  value       = aws_amplify_app.portfolio.default_domain
}

output "custom_domain" {
  description = "Canonical custom domain associated with the Amplify application."
  value       = aws_amplify_domain_association.portfolio.domain_name
}

output "route53_zone_id" {
  description = "Identifier of the existing read-only public Route 53 hosted zone."
  value       = data.aws_route53_zone.domain.zone_id
}
