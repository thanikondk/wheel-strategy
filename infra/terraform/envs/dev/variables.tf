variable "aws_region" {
  description = "AWS region for WheelDesk."
  type        = string
  default     = "us-east-1"
}

variable "project_name" {
  description = "Project name used in AWS resource names."
  type        = string
  default     = "wheeldesk"
}

variable "environment" {
  description = "Deployment environment."
  type        = string
  default     = "dev"
}

variable "vpc_cidr" {
  description = "CIDR block for the WheelDesk VPC."
  type        = string
  default     = "10.42.0.0/16"
}

variable "availability_zones" {
  description = "Availability zones to use. Leave empty to use the first two available AZs."
  type        = list(string)
  default     = []
}

variable "app_image_tag" {
  description = "ECR image tag deployed to ECS."
  type        = string
  default     = "bootstrap"
}

variable "desired_count" {
  description = "Number of ECS web tasks. Use 0 before the first container image is pushed."
  type        = number
  default     = 0
}

variable "app_cpu" {
  description = "Fargate task CPU units."
  type        = number
  default     = 512
}

variable "app_memory" {
  description = "Fargate task memory in MiB."
  type        = number
  default     = 1024
}

variable "container_port" {
  description = "Container port exposed by the Next.js standalone server."
  type        = number
  default     = 3000
}

variable "health_check_path" {
  description = "ALB health check path."
  type        = string
  default     = "/"
}

variable "certificate_arn" {
  description = "Optional ACM certificate ARN. When set, an HTTPS listener is created."
  type        = string
  default     = ""
}

variable "nextauth_url" {
  description = "Public application URL. Leave empty for the ALB DNS name."
  type        = string
  default     = ""
}

variable "wheel_market_data_provider" {
  description = "Market data provider used by the app."
  type        = string
  default     = "yahoo-dev"
}

variable "wheel_account_value" {
  description = "Account value used by the decision engine."
  type        = string
  default     = ""
}

variable "wheel_cash_available" {
  description = "Cash available used by the decision engine."
  type        = string
  default     = ""
}

variable "wheel_watchlist_tickers" {
  description = "Comma-separated watchlist tickers."
  type        = string
  default     = ""
}

variable "wheel_ownable_tickers" {
  description = "Comma-separated tickers the user is willing to own."
  type        = string
  default     = ""
}

variable "wheel_covered_call_positions" {
  description = "JSON array of owned share positions for covered-call screening."
  type        = string
  default     = ""
  sensitive   = true
}

variable "polygon_api_key" {
  description = "Optional Polygon API key."
  type        = string
  default     = ""
  sensitive   = true
}

variable "tradier_api_key" {
  description = "Optional Tradier API key."
  type        = string
  default     = ""
  sensitive   = true
}

variable "alpha_vantage_api_key" {
  description = "Optional Alpha Vantage API key."
  type        = string
  default     = ""
  sensitive   = true
}

variable "fmp_api_key" {
  description = "Optional Financial Modeling Prep API key."
  type        = string
  default     = ""
  sensitive   = true
}

variable "rds_instance_class" {
  description = "RDS PostgreSQL instance class."
  type        = string
  default     = "db.t4g.micro"
}

variable "rds_allocated_storage" {
  description = "RDS allocated storage in GiB."
  type        = number
  default     = 20
}

variable "enable_deletion_protection" {
  description = "Enable deletion protection for RDS."
  type        = bool
  default     = false
}

variable "enable_daily_scheduler" {
  description = "Enable the EventBridge Scheduler daily ECS task placeholder."
  type        = bool
  default     = false
}
