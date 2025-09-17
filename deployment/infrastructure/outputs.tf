# TyreHero Emergency Service - Terraform Outputs

# Regional Infrastructure Outputs
output "primary_infrastructure" {
  description = "Primary region infrastructure details"
  value = {
    region             = var.primary_region
    vpc_id            = module.primary_infrastructure.vpc_id
    vpc_cidr          = module.primary_infrastructure.vpc_cidr
    public_subnets    = module.primary_infrastructure.public_subnet_ids
    private_subnets   = module.primary_infrastructure.private_subnet_ids
    database_subnets  = module.primary_infrastructure.database_subnet_ids
    
    # Load Balancer
    alb_arn           = module.primary_infrastructure.alb_arn
    alb_dns_name      = module.primary_infrastructure.alb_dns_name
    alb_zone_id       = module.primary_infrastructure.alb_zone_id
    
    # ECS Cluster
    ecs_cluster_id    = module.primary_infrastructure.ecs_cluster_id
    ecs_cluster_name  = module.primary_infrastructure.ecs_cluster_name
    ecs_service_name  = module.primary_infrastructure.ecs_service_name
    
    # Database
    database_endpoint = module.primary_infrastructure.database_endpoint
    database_port     = module.primary_infrastructure.database_port
    
    # Cache
    cache_endpoint    = module.primary_infrastructure.cache_endpoint
    cache_port        = module.primary_infrastructure.cache_port
  }
  sensitive = true
}

output "secondary_infrastructure" {
  description = "Secondary region infrastructure details"
  value = {
    region             = var.secondary_region
    vpc_id            = module.secondary_infrastructure.vpc_id
    vpc_cidr          = module.secondary_infrastructure.vpc_cidr
    alb_dns_name      = module.secondary_infrastructure.alb_dns_name
    ecs_cluster_name  = module.secondary_infrastructure.ecs_cluster_name
    database_endpoint = module.secondary_infrastructure.database_endpoint
  }
  sensitive = true
}

# Global Resources
output "global_resources" {
  description = "Global infrastructure resources"
  value = {
    # Route 53
    primary_hosted_zone_id   = module.global_resources.primary_hosted_zone_id
    api_record_name         = module.global_resources.api_record_name
    emergency_record_name   = module.global_resources.emergency_record_name
    
    # CloudFront
    cloudfront_distribution_id  = module.global_resources.cloudfront_distribution_id
    cloudfront_domain_name      = module.global_resources.cloudfront_domain_name
    
    # SSL Certificates
    primary_certificate_arn     = module.primary_infrastructure.certificate_arn
    certificate_validation_records = module.global_resources.certificate_validation_records
  }
}

# Application Endpoints
output "application_endpoints" {
  description = "Application endpoints for different environments"
  value = {
    # Primary endpoints
    primary_api_url      = "https://${var.api_subdomain}.${var.domain_name}"
    primary_emergency_url = "https://${var.emergency_subdomain}.${var.domain_name}"
    primary_health_url   = "https://${var.api_subdomain}.${var.domain_name}${var.health_check_path}"
    
    # Secondary endpoints (failover)
    secondary_api_url    = "https://${module.secondary_infrastructure.alb_dns_name}"
    secondary_health_url = "https://${module.secondary_infrastructure.alb_dns_name}${var.health_check_path}"
    
    # CloudFront URLs
    cdn_api_url         = "https://${module.global_resources.cloudfront_domain_name}/api"
    cdn_static_url      = "https://${module.global_resources.cloudfront_domain_name}/static"
  }
}

# Database Connection Information
output "database_connections" {
  description = "Database connection details"
  value = {
    primary = {
      endpoint    = module.primary_infrastructure.database_endpoint
      port        = module.primary_infrastructure.database_port
      database    = module.primary_infrastructure.database_name
      username    = module.primary_infrastructure.database_username
    }
    
    read_replicas = {
      secondary = {
        endpoint = module.secondary_infrastructure.database_endpoint
        port     = module.secondary_infrastructure.database_port
      }
    }
    
    connection_strings = {
      primary_app     = "postgresql://${module.primary_infrastructure.database_username}:${module.primary_infrastructure.database_password}@${module.primary_infrastructure.database_endpoint}:${module.primary_infrastructure.database_port}/${module.primary_infrastructure.database_name}"
      secondary_readonly = "postgresql://${module.primary_infrastructure.database_username}:${module.primary_infrastructure.database_password}@${module.secondary_infrastructure.database_endpoint}:${module.secondary_infrastructure.database_port}/${module.primary_infrastructure.database_name}"
    }
  }
  sensitive = true
}

# Cache Configuration
output "cache_configuration" {
  description = "Cache cluster configuration details"
  value = {
    primary = {
      endpoint         = module.primary_infrastructure.cache_endpoint
      port            = module.primary_infrastructure.cache_port
      node_type       = var.cache_node_type
      num_nodes       = var.cache_num_nodes
      parameter_group = var.cache_parameter_group
    }
    
    connection_urls = {
      primary = "redis://${module.primary_infrastructure.cache_endpoint}:${module.primary_infrastructure.cache_port}"
    }
  }
  sensitive = true
}

# Security Configuration
output "security_configuration" {
  description = "Security-related resource information"
  value = {
    # WAF
    waf_web_acl_id         = module.security.waf_web_acl_id
    waf_web_acl_arn        = module.security.waf_web_acl_arn
    
    # Security Groups
    alb_security_group_id  = module.primary_infrastructure.alb_security_group_id
    ecs_security_group_id  = module.primary_infrastructure.ecs_security_group_id
    rds_security_group_id  = module.primary_infrastructure.rds_security_group_id
    
    # KMS Keys
    database_kms_key_id    = module.primary_infrastructure.database_kms_key_id
    s3_kms_key_id         = module.primary_infrastructure.s3_kms_key_id
    
    # IAM Roles
    ecs_task_role_arn      = module.primary_infrastructure.ecs_task_role_arn
    ecs_execution_role_arn = module.primary_infrastructure.ecs_execution_role_arn
  }
}

# Monitoring Resources
output "monitoring_resources" {
  description = "Monitoring and alerting resources"
  value = {
    # CloudWatch
    log_group_name           = module.monitoring.log_group_name
    log_group_arn           = module.monitoring.log_group_arn
    
    # SNS Topics
    emergency_sns_topic_arn  = module.primary_infrastructure.emergency_sns_topic_arn
    operations_sns_topic_arn = module.primary_infrastructure.operations_sns_topic_arn
    
    # CloudWatch Dashboards
    main_dashboard_url       = module.monitoring.main_dashboard_url
    emergency_dashboard_url  = module.monitoring.emergency_dashboard_url
    
    # Alarms
    critical_alarms         = module.monitoring.critical_alarm_names
    warning_alarms          = module.monitoring.warning_alarm_names
  }
}

# Backup Configuration
output "backup_configuration" {
  description = "Backup and disaster recovery configuration"
  value = {
    # Database Backups
    automated_backup_window     = var.db_backup_window
    backup_retention_period     = var.db_backup_retention
    point_in_time_recovery     = module.primary_infrastructure.point_in_time_recovery_enabled
    
    # S3 Backup Buckets
    backup_bucket_name         = module.backup.backup_bucket_name
    backup_bucket_arn          = module.backup.backup_bucket_arn
    
    # Cross-region replication
    replication_bucket_name    = module.backup.replication_bucket_name
    replication_status         = module.backup.replication_status
    
    # Snapshot schedules
    database_snapshot_schedule = module.backup.snapshot_schedule
    ec2_snapshot_schedule      = module.backup.ec2_snapshot_schedule
  }
}

# Cost Optimization
output "cost_optimization" {
  description = "Cost optimization configuration and estimates"
  value = {
    # Instance types and sizing
    database_instance_class    = var.db_instance_class
    ecs_cpu_memory            = "${var.ecs_cpu}/${var.ecs_memory}"
    cache_node_type           = var.cache_node_type
    
    # Scaling configuration
    min_capacity              = var.ecs_min_capacity
    max_capacity              = var.ecs_max_capacity
    current_desired_count     = var.ecs_desired_count
    
    # Reserved instance usage
    reserved_instance_percentage = var.reserved_instance_percentage
    spot_instance_percentage     = var.spot_instance_percentage
    
    # Storage optimization
    database_storage_encrypted   = module.primary_infrastructure.database_storage_encrypted
    s3_intelligent_tiering      = module.primary_infrastructure.s3_intelligent_tiering_enabled
  }
}

# Emergency Service Specific Outputs
output "emergency_service_config" {
  description = "Emergency service specific configuration"
  value = {
    # SLA Configuration
    response_sla_minutes          = var.emergency_response_sla_minutes
    uptime_target_percentage      = 99.9
    
    # Cache TTL Configuration
    technician_location_ttl       = var.technician_location_cache_ttl
    service_area_ttl             = var.service_area_cache_ttl
    pricing_ttl                  = var.pricing_cache_ttl
    
    # Geographic Configuration
    allowed_countries            = var.allowed_countries
    primary_service_region       = var.primary_region
    
    # Contact Information
    emergency_contact_email      = var.emergency_contact_email
    operations_contact_email     = var.operations_contact_email
    
    # Health Check Configuration
    health_check_path           = var.health_check_path
    health_check_interval       = var.health_check_interval
    health_check_timeout        = var.health_check_timeout
  }
}

# Deployment Information
output "deployment_info" {
  description = "Deployment and CI/CD related information"
  value = {
    # Docker Configuration
    app_image_url               = var.app_image_url
    app_port                   = var.app_port
    
    # ECS Service Configuration
    ecs_cluster_arn            = module.primary_infrastructure.ecs_cluster_arn
    ecs_service_arn            = module.primary_infrastructure.ecs_service_arn
    task_definition_family     = module.primary_infrastructure.task_definition_family
    
    # ECR Repository
    ecr_repository_url         = module.primary_infrastructure.ecr_repository_url
    ecr_repository_arn         = module.primary_infrastructure.ecr_repository_arn
    
    # Blue-Green Deployment
    blue_green_enabled         = var.enable_blue_green_deployment
    target_group_blue_arn      = module.primary_infrastructure.target_group_blue_arn
    target_group_green_arn     = module.primary_infrastructure.target_group_green_arn
  }
}

# Compliance and Audit
output "compliance_config" {
  description = "Compliance and audit configuration"
  value = {
    # Encryption
    encryption_at_rest_enabled    = var.enable_encryption_at_rest
    encryption_in_transit_enabled = var.enable_encryption_in_transit
    
    # Audit Logging
    audit_logging_enabled        = var.enable_audit_logging
    cloudtrail_bucket_name       = module.security.cloudtrail_bucket_name
    
    # Data Retention
    data_retention_days          = var.data_retention_days
    log_retention_days           = var.log_retention_days
    
    # Security Services
    guardduty_enabled           = var.enable_guardduty
    security_hub_enabled        = var.enable_security_hub
    
    # Compliance Standards
    gdpr_compliant              = true
    pci_dss_compliant          = true
    iso_27001_compliant        = true
  }
}

# Quick Reference URLs
output "quick_reference" {
  description = "Quick reference URLs and commands"
  value = {
    # Management URLs
    aws_console_primary        = "https://console.aws.amazon.com/ecs/home?region=${var.primary_region}#/clusters/${module.primary_infrastructure.ecs_cluster_name}"
    cloudwatch_dashboard       = module.monitoring.main_dashboard_url
    
    # Health Check URLs
    primary_health_check       = "https://${var.api_subdomain}.${var.domain_name}${var.health_check_path}"
    secondary_health_check     = "https://${module.secondary_infrastructure.alb_dns_name}${var.health_check_path}"
    
    # Emergency Contacts
    emergency_escalation       = var.emergency_contact_email
    operations_team           = var.operations_contact_email
    
    # Documentation
    deployment_strategy_url    = "https://github.com/tyrehero/infrastructure/blob/main/docs/deployment-strategy.md"
    incident_response_url      = "https://github.com/tyrehero/infrastructure/blob/main/docs/incident-response.md"
    runbook_url               = "https://github.com/tyrehero/infrastructure/blob/main/docs/operations-runbook.md"
  }
}