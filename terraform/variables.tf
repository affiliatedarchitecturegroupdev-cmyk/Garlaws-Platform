variable "aws_region" {
  description = "AWS region"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be one of: dev, staging, prod"
  }
}

variable "vpc_cidr" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

variable "private_subnets" {
  description = "Private subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
}

variable "public_subnets" {
  description = "Public subnet CIDR blocks"
  type        = list(string)
  default     = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
}

# Database variables
variable "db_instance_class" {
  description = "RDS instance class"
  type        = string
  default     = "db.t3.micro"

  validation {
    condition = contains([
      "db.t3.micro", "db.t3.small", "db.t3.medium", "db.t3.large",
      "db.t4g.micro", "db.t4g.small", "db.t4g.medium", "db.t4g.large",
      "db.r6g.large", "db.r6g.xlarge", "db.r6g.2xlarge"
    ], var.db_instance_class)
    error_message = "Invalid RDS instance class"
  }
}

variable "db_allocated_storage" {
  description = "RDS allocated storage in GB"
  type        = number
  default     = 20

  validation {
    condition     = var.db_allocated_storage >= 20 && var.db_allocated_storage <= 65536
    error_message = "Allocated storage must be between 20 and 65536 GB"
  }
}

variable "db_max_allocated_storage" {
  description = "RDS maximum allocated storage in GB"
  type        = number
  default     = 100
}

variable "db_username" {
  description = "RDS master username"
  type        = string
  default     = "garlaws"
}

variable "db_password" {
  description = "RDS master password"
  type        = string
  sensitive   = true
}

# Redis variables
variable "redis_node_type" {
  description = "Redis node type"
  type        = string
  default     = "cache.t3.micro"

  validation {
    condition = contains([
      "cache.t3.micro", "cache.t3.small", "cache.t3.medium",
      "cache.t4g.micro", "cache.t4g.small", "cache.t4g.medium",
      "cache.r6g.large", "cache.r6g.xlarge"
    ], var.redis_node_type)
    error_message = "Invalid Redis node type"
  }
}

# ECS variables
variable "ecs_cpu" {
  description = "ECS task CPU units"
  type        = number
  default     = 512

  validation {
    condition     = contains([256, 512, 1024, 2048, 4096], var.ecs_cpu)
    error_message = "CPU must be one of: 256, 512, 1024, 2048, 4096"
  }
}

variable "ecs_memory" {
  description = "ECS task memory in MB"
  type        = number
  default     = 1024

  validation {
    condition     = var.ecs_memory >= 512 && var.ecs_memory <= 30720
    error_message = "Memory must be between 512 and 30720 MB"
  }
}

variable "ecs_desired_count" {
  description = "Desired number of ECS tasks"
  type        = number
  default     = 1

  validation {
    condition     = var.ecs_desired_count >= 0 && var.ecs_desired_count <= 10
    error_message = "Desired count must be between 0 and 10"
  }
}

variable "ecs_min_capacity" {
  description = "Minimum number of ECS tasks for auto scaling"
  type        = number
  default     = 1

  validation {
    condition     = var.ecs_min_capacity >= 0 && var.ecs_min_capacity <= 10
    error_message = "Min capacity must be between 0 and 10"
  }
}

variable "ecs_max_capacity" {
  description = "Maximum number of ECS tasks for auto scaling"
  type        = number
  default     = 5

  validation {
    condition     = var.ecs_max_capacity >= 1 && var.ecs_max_capacity <= 50
    error_message = "Max capacity must be between 1 and 50"
  }
}

# Domain and SSL
variable "domain_name" {
  description = "Domain name for SSL certificate"
  type        = string
  default     = ""
}

variable "route53_zone_id" {
  description = "Route 53 hosted zone ID"
  type        = string
  default     = ""
}

# ECR
variable "ecr_repository_url" {
  description = "ECR repository URL for Docker images"
  type        = string
  default     = "123456789012.dkr.ecr.us-east-1.amazonaws.com/garlaws/platform"
}

# Tags
variable "tags" {
  description = "Additional tags for resources"
  type        = map(string)
  default     = {}
}