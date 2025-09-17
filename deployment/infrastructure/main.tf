# TyreHero Emergency Service - Infrastructure as Code
# Main Terraform configuration for multi-region deployment

terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  
  backend "s3" {
    bucket         = "tyrehero-terraform-state"
    key            = "production/terraform.tfstate"
    region         = "eu-west-2"
    encrypt        = true
    dynamodb_table = "tyrehero-terraform-locks"
  }
}

# Configure AWS Provider for Primary Region (London)
provider "aws" {
  alias  = "primary"
  region = var.primary_region
  
  default_tags {
    tags = {
      Project     = "TyreHero"
      Environment = var.environment
      Service     = "EmergencyService"
      ManagedBy   = "Terraform"
      CostCenter  = "Production"
    }
  }
}

# Configure AWS Provider for Secondary Region (Ireland)
provider "aws" {
  alias  = "secondary"
  region = var.secondary_region
  
  default_tags {
    tags = {
      Project     = "TyreHero"
      Environment = var.environment
      Service     = "EmergencyService"
      ManagedBy   = "Terraform"
      CostCenter  = "Production"
    }
  }
}

# Configure AWS Provider for Tertiary Region (Frankfurt)
provider "aws" {
  alias  = "tertiary"
  region = var.tertiary_region
  
  default_tags {
    tags = {
      Project     = "TyreHero"
      Environment = var.environment
      Service     = "EmergencyService"
      ManagedBy   = "Terraform"
      CostCenter  = "Production"
    }
  }
}

# Data Sources
data "aws_availability_zones" "primary" {
  provider = aws.primary
  state    = "available"
}

data "aws_availability_zones" "secondary" {
  provider = aws.secondary
  state    = "available"
}

data "aws_availability_zones" "tertiary" {
  provider = aws.tertiary
  state    = "available"
}

# Local values for common configurations
locals {
  vpc_cidr = "10.0.0.0/16"
  
  # Subnet CIDR blocks for primary region
  primary_public_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  primary_private_subnets = ["10.0.11.0/24", "10.0.12.0/24", "10.0.13.0/24"]
  primary_db_subnets      = ["10.0.21.0/24", "10.0.22.0/24", "10.0.23.0/24"]
  
  # Common tags
  common_tags = {
    Project     = "TyreHero"
    Environment = var.environment
    Service     = "EmergencyService"
  }
}

# Primary Region Infrastructure
module "primary_infrastructure" {
  source = "./modules/infrastructure"
  
  providers = {
    aws = aws.primary
  }
  
  region                = var.primary_region
  environment          = var.environment
  vpc_cidr            = local.vpc_cidr
  public_subnets      = local.primary_public_subnets
  private_subnets     = local.primary_private_subnets
  database_subnets    = local.primary_db_subnets
  availability_zones  = data.aws_availability_zones.primary.names
  
  # Database configuration
  db_instance_class     = var.db_instance_class
  db_allocated_storage  = var.db_allocated_storage
  db_backup_retention   = var.db_backup_retention
  
  # ECS configuration
  ecs_desired_count    = var.ecs_desired_count
  ecs_min_capacity     = var.ecs_min_capacity
  ecs_max_capacity     = var.ecs_max_capacity
  
  # Application configuration
  app_image_url        = var.app_image_url
  app_port            = var.app_port
  
  tags = local.common_tags
}

# Secondary Region Infrastructure (Ireland)
module "secondary_infrastructure" {
  source = "./modules/infrastructure"
  
  providers = {
    aws = aws.secondary
  }
  
  region               = var.secondary_region
  environment         = var.environment
  vpc_cidr           = "10.1.0.0/16"
  public_subnets     = ["10.1.1.0/24", "10.1.2.0/24", "10.1.3.0/24"]
  private_subnets    = ["10.1.11.0/24", "10.1.12.0/24", "10.1.13.0/24"]
  database_subnets   = ["10.1.21.0/24", "10.1.22.0/24", "10.1.23.0/24"]
  availability_zones = data.aws_availability_zones.secondary.names
  
  # Reduced configuration for secondary region
  db_instance_class    = var.secondary_db_instance_class
  db_allocated_storage = var.db_allocated_storage
  db_backup_retention  = 7  # Shorter retention for read replica
  
  ecs_desired_count    = 2  # Smaller deployment
  ecs_min_capacity     = 2
  ecs_max_capacity     = 20
  
  app_image_url        = var.app_image_url
  app_port            = var.app_port
  
  # Mark as secondary region
  is_primary_region    = false
  primary_region_name  = var.primary_region
  
  tags = merge(local.common_tags, {
    RegionType = "secondary"
  })
}

# Global Resources
module "global_resources" {
  source = "./modules/global"
  
  providers = {
    aws.primary   = aws.primary
    aws.secondary = aws.secondary
    aws.tertiary  = aws.tertiary
  }
  
  domain_name           = var.domain_name
  certificate_arn       = module.primary_infrastructure.certificate_arn
  primary_alb_dns       = module.primary_infrastructure.alb_dns_name
  secondary_alb_dns     = module.secondary_infrastructure.alb_dns_name
  
  # Health check endpoints
  primary_health_check_url   = "https://${module.primary_infrastructure.alb_dns_name}/health"
  secondary_health_check_url = "https://${module.secondary_infrastructure.alb_dns_name}/health"
  
  tags = local.common_tags
}

# Monitoring and Alerting
module "monitoring" {
  source = "./modules/monitoring"
  
  providers = {
    aws = aws.primary
  }
  
  environment              = var.environment
  primary_cluster_name     = module.primary_infrastructure.ecs_cluster_name
  secondary_cluster_name   = module.secondary_infrastructure.ecs_cluster_name
  database_instance_id     = module.primary_infrastructure.database_instance_id
  
  # SNS topics for alerts
  emergency_sns_topic      = module.primary_infrastructure.emergency_sns_topic_arn
  operations_sns_topic     = module.primary_infrastructure.operations_sns_topic_arn
  
  # Slack webhook for critical alerts
  slack_webhook_url        = var.slack_webhook_url
  pagerduty_integration_key = var.pagerduty_integration_key
  
  tags = local.common_tags
}

# Backup and Disaster Recovery
module "backup" {
  source = "./modules/backup"
  
  providers = {
    aws.primary   = aws.primary
    aws.secondary = aws.secondary
  }
  
  database_instance_id      = module.primary_infrastructure.database_instance_id
  s3_static_bucket_id      = module.primary_infrastructure.s3_static_bucket_id
  backup_retention_days    = var.backup_retention_days
  
  # Cross-region replication targets
  secondary_region         = var.secondary_region
  
  tags = local.common_tags
}

# Security Configuration
module "security" {
  source = "./modules/security"
  
  providers = {
    aws = aws.primary
  }
  
  vpc_id                  = module.primary_infrastructure.vpc_id
  alb_arn                = module.primary_infrastructure.alb_arn
  cloudfront_distribution_id = module.global_resources.cloudfront_distribution_id
  
  # WAF configuration
  allowed_countries       = var.allowed_countries
  rate_limit_requests     = var.rate_limit_requests
  
  # Security scanning
  enable_guardduty        = var.enable_guardduty
  enable_security_hub     = var.enable_security_hub
  
  tags = local.common_tags
}