data "aws_route53_zone" "domain" {
  name         = var.domain_name
  private_zone = false
}

resource "aws_amplify_app" "portfolio" {
  name       = var.app_name
  repository = var.repository_url
  build_spec = replace(file("${path.module}/../../amplify.yml"), "\r\n", "\n")

  custom_rule {
    source = "https://www.${var.domain_name}"
    target = "https://${var.domain_name}"
    status = "301"
  }

}

resource "aws_amplify_branch" "main" {
  app_id            = aws_amplify_app.portfolio.id
  branch_name       = var.branch_name
  framework         = "Web"
  stage             = "PRODUCTION"
  enable_auto_build = true
}

resource "aws_amplify_domain_association" "portfolio" {
  app_id                = aws_amplify_app.portfolio.id
  domain_name           = var.domain_name
  wait_for_verification = true

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = ""
  }

  sub_domain {
    branch_name = aws_amplify_branch.main.branch_name
    prefix      = "www"
  }

  lifecycle {
    precondition {
      condition     = trimsuffix(data.aws_route53_zone.domain.name, ".") == trimsuffix(var.domain_name, ".")
      error_message = "The existing public Route 53 hosted zone was not found."
    }
  }
}
