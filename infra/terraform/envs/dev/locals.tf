data "aws_caller_identity" "current" {}

data "aws_availability_zones" "available" {
  state = "available"
}

locals {
  name = "${var.project_name}-${var.environment}"
  azs  = length(var.availability_zones) > 0 ? var.availability_zones : slice(data.aws_availability_zones.available.names, 0, 2)

  public_subnet_cidrs  = [for index, _ in local.azs : cidrsubnet(var.vpc_cidr, 8, index)]
  private_subnet_cidrs = [for index, _ in local.azs : cidrsubnet(var.vpc_cidr, 8, index + 10)]
  db_subnet_cidrs      = [for index, _ in local.azs : cidrsubnet(var.vpc_cidr, 8, index + 20)]

  app_url = var.nextauth_url != "" ? var.nextauth_url : "http://${aws_lb.web.dns_name}"

  app_environment = [
    { name = "NODE_ENV", value = "production" },
    { name = "NEXTAUTH_URL", value = local.app_url },
    { name = "AWS_REGION", value = var.aws_region },
    { name = "WHEEL_MARKET_DATA_PROVIDER", value = var.wheel_market_data_provider },
    { name = "WHEEL_ACCOUNT_VALUE", value = var.wheel_account_value },
    { name = "WHEEL_CASH_AVAILABLE", value = var.wheel_cash_available },
    { name = "WHEEL_WATCHLIST_TICKERS", value = var.wheel_watchlist_tickers },
    { name = "WHEEL_OWNABLE_TICKERS", value = var.wheel_ownable_tickers },
    { name = "WHEEL_EVENT_WINDOW_DAYS", value = "7" },
    { name = "REDIS_URL", value = "redis://${aws_elasticache_replication_group.redis.primary_endpoint_address}:6379" }
  ]

  app_secrets = [
    { name = "DATABASE_URL", valueFrom = aws_secretsmanager_secret.database_url.arn },
    { name = "NEXTAUTH_SECRET", valueFrom = aws_secretsmanager_secret.nextauth_secret.arn },
    { name = "WHEEL_COVERED_CALL_POSITIONS", valueFrom = aws_secretsmanager_secret.covered_call_positions.arn },
    { name = "POLYGON_API_KEY", valueFrom = aws_secretsmanager_secret.polygon_api_key.arn },
    { name = "TRADIER_API_KEY", valueFrom = aws_secretsmanager_secret.tradier_api_key.arn },
    { name = "ALPHA_VANTAGE_API_KEY", valueFrom = aws_secretsmanager_secret.alpha_vantage_api_key.arn },
    { name = "FMP_API_KEY", valueFrom = aws_secretsmanager_secret.fmp_api_key.arn }
  ]

  tags = {
    Project     = var.project_name
    Environment = var.environment
    ManagedBy   = "terraform"
    Application = "WheelDesk"
  }
}
