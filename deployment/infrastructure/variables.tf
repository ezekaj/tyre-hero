# TyreHero Emergency Service - Terraform Variables

# Environment Configuration
variable "environment" {
  description = "Environment name (production, staging, development)"
  type        = string
  default     = "production"
  
  validation {
    condition     = contains(["production", "staging", "development"], var.environment)
    error_message = "Environment must be production, staging, or development."
  }
}

# Region Configuration
variable "primary_region" {
  description = "Primary AWS region for deployment"
  type        = string
  default     = "eu-west-2"
}

variable "secondary_region" {
  description = "Secondary AWS region for disaster recovery"
  type        = string
  default     = "eu-west-1"
}

variable "tertiary_region" {
  description = "Tertiary AWS region for additional backup"
  type        = string
  default     = "eu-central-1"
}

# Domain Configuration
variable "domain_name" {
  description = "Primary domain name for the application"
  type        = string
  default     = "tyrehero.com"
}

variable "api_subdomain" {
  description = "Subdomain for API endpoints"
  type        = string
  default     = "api"
}

variable "emergency_subdomain" {
  description = "Subdomain for emergency services"
  type        = string
  default     = "emergency"
}

# Database Configuration
variable "db_instance_class" {
  description = "RDS instance class for primary database"
  type        = string
  default     = "db.r6g.2xlarge"
}

variable "secondary_db_instance_class" {
  description = "RDS instance class for secondary region"
  type        = string
  default     = "db.r6g.xlarge"
}

variable "db_allocated_storage" {
  description = "Initial storage allocation for RDS instance (GB)"
  type        = number
  default     = 100
}

variable "db_max_allocated_storage" {
  description = "Maximum storage allocation for RDS instance (GB)"
  type        = number
  default     = 1000
}

variable "db_backup_retention" {
  description = "Number of days to retain database backups"
  type        = number
  default     = 30
}

variable "db_backup_window" {
  description = "Preferred backup window for RDS"
  type        = string
  default     = "03:00-04:00"
}

variable "db_maintenance_window" {
  description = "Preferred maintenance window for RDS"
  type        = string
  default     = "sun:04:00-sun:05:00"
}

# ECS Configuration
variable "ecs_desired_count" {
  description = "Desired number of ECS tasks for primary region"
  type        = number
  default     = 6
}

variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks"
  type        = number
  default     = 6
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks"
  type        = number
  default     = 50
}

variable "ecs_cpu" {
  description = "CPU units for ECS task"
  type        = number
  default     = 1024
}

variable "ecs_memory" {
  description = "Memory (MB) for ECS task"
  type        = number
  default     = 2048
}

# Application Configuration
variable "app_image_url" {
  description = "Docker image URL for the application"
  type        = string
  default     = "tyrehero/emergency-api:latest"
}

variable "app_port" {
  description = "Port on which the application listens"
  type        = number
  default     = 3000
}

variable "health_check_path" {
  description = "Health check endpoint path"
  type        = string
  default     = "/health"
}

variable "health_check_interval" {
  description = "Health check interval in seconds"
  type        = number
  default     = 30
}

variable "health_check_timeout" {
  description = "Health check timeout in seconds"
  type        = number
  default     = 5
}

variable "health_check_healthy_threshold" {
  description = "Number of consecutive successful health checks"
  type        = number
  default     = 2
}

variable "health_check_unhealthy_threshold" {
  description = "Number of consecutive failed health checks"
  type        = number
  default     = 3
}

# Auto Scaling Configuration
variable "scale_up_threshold" {
  description = "CPU threshold for scaling up"
  type        = number
  default     = 60
}

variable "scale_down_threshold" {
  description = "CPU threshold for scaling down"
  type        = number
  default     = 30
}

variable "scale_up_cooldown" {
  description = "Cooldown period after scaling up (seconds)"
  type        = number
  default     = 300
}

variable "scale_down_cooldown" {
  description = "Cooldown period after scaling down (seconds)"
  type        = number
  default     = 300
}

# Cache Configuration
variable "cache_node_type" {
  description = "ElastiCache node type"
  type        = string
  default     = "cache.r6g.xlarge"
}

variable "cache_num_nodes" {
  description = "Number of cache nodes"
  type        = number
  default     = 3
}

variable "cache_parameter_group" {
  description = "Cache parameter group name"
  type        = string
  default     = "default.redis7"
}

# Security Configuration
variable "allowed_countries" {
  description = "List of allowed country codes for WAF geo-blocking"
  type        = list(string)
  default     = ["GB", "IE"]
}

variable "rate_limit_requests" {
  description = "Rate limit for WAF (requests per 5 minutes)"
  type        = number
  default     = 2000
}

variable "enable_guardduty" {
  description = "Enable AWS GuardDuty for threat detection"
  type        = bool
  default     = true
}

variable "enable_security_hub" {
  description = "Enable AWS Security Hub for compliance monitoring"
  type        = bool
  default     = true
}

# Monitoring Configuration
variable "slack_webhook_url" {
  description = "Slack webhook URL for emergency alerts"
  type        = string
  sensitive   = true
}

variable "pagerduty_integration_key" {
  description = "PagerDuty integration key for critical alerts"
  type        = string
  sensitive   = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention period in days"
  type        = number
  default     = 90
}

# Backup Configuration
variable "backup_retention_days" {
  description = "Number of days to retain automated backups"
  type        = number
  default     = 30
}

variable "snapshot_retention_days" {
  description = "Number of days to retain manual snapshots"
  type        = number
  default     = 90
}

# Certificate Configuration
variable "certificate_validation_method" {
  description = "Method for SSL certificate validation"
  type        = string
  default     = "DNS"
}

# CloudFront Configuration
variable "cloudfront_price_class" {
  description = "CloudFront price class"
  type        = string
  default     = "PriceClass_100"
  
  validation {
    condition     = contains(["PriceClass_All", "PriceClass_200", "PriceClass_100"], var.cloudfront_price_class)
    error_message = "Price class must be PriceClass_All, PriceClass_200, or PriceClass_100."
  }
}

variable "cloudfront_minimum_protocol_version" {
  description = "Minimum TLS protocol version for CloudFront"
  type        = string
  default     = "TLSv1.2_2021"
}

# Emergency Service Specific Configuration
variable "emergency_response_sla_minutes" {
  description = "Emergency response SLA in minutes"
  type        = number
  default     = 90
}

variable "technician_location_cache_ttl" {
  description = "TTL for technician location cache in seconds"
  type        = number
  default     = 30
}

variable "service_area_cache_ttl" {
  description = "TTL for service area cache in seconds"
  type        = number
  default     = 3600
}

variable "pricing_cache_ttl" {
  description = "TTL for pricing data cache in seconds"
  type        = number
  default     = 86400
}

# Feature Flags
variable "enable_blue_green_deployment" {
  description = "Enable blue-green deployment strategy"
  type        = bool
  default     = true
}

variable "enable_cross_region_replication" {
  description = "Enable cross-region replication for disaster recovery"
  type        = bool
  default     = true
}

variable "enable_automated_scaling" {
  description = "Enable automated scaling based on metrics"
  type        = bool
  default     = true
}

variable "enable_performance_insights" {
  description = "Enable RDS Performance Insights"
  type        = bool
  default     = true
}

variable "enable_enhanced_monitoring" {
  description = "Enable enhanced monitoring for RDS"
  type        = bool
  default     = true
}

# Cost Optimization
variable "spot_instance_percentage" {
  description = "Percentage of Spot instances to use in ECS (0-100)"
  type        = number
  default     = 0  # No spot instances for emergency service
  
  validation {
    condition     = var.spot_instance_percentage >= 0 && var.spot_instance_percentage <= 100
    error_message = "Spot instance percentage must be between 0 and 100."
  }
}

variable "reserved_instance_percentage" {
  description = "Percentage of Reserved instances to use"
  type        = number
  default     = 80
}

# Compliance Configuration
variable "enable_encryption_at_rest" {
  description = "Enable encryption at rest for all data stores"
  type        = bool
  default     = true
}

variable "enable_encryption_in_transit" {
  description = "Enable encryption in transit for all communications"
  type        = bool
  default     = true
}

variable "data_retention_days" {
  description = "Data retention period for GDPR compliance"
  type        = number
  default     = 30
}

variable "enable_audit_logging" {
  description = "Enable comprehensive audit logging"
  type        = bool
  default     = true
}

# Emergency Contact Configuration
variable "emergency_contact_email" {
  description = "Emergency contact email for critical alerts"
  type        = string
  default     = "emergency@tyrehero.com"
}

variable "operations_contact_email" {
  description = "Operations team email for alerts"
  type        = string
  default     = "ops@tyrehero.com"
}

variable "management_contact_email" {
  description = "Management team email for escalations"
  type        = string
  default     = "management@tyrehero.com"
}