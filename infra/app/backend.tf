terraform {
  backend "s3" {
    key          = "portfolio-caique-rezende/production.tfstate"
    region       = "sa-east-1"
    encrypt      = true
    use_lockfile = true
  }
}
