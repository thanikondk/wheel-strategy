output "aws_account_id" {
  description = "AWS account ID used by Terraform."
  value       = data.aws_caller_identity.current.account_id
}

output "aws_region" {
  description = "AWS region."
  value       = var.aws_region
}

output "alb_dns_name" {
  description = "Public ALB DNS name."
  value       = aws_lb.web.dns_name
}

output "application_url" {
  description = "Application URL."
  value       = local.app_url
}

output "ecr_repository_url" {
  description = "ECR repository URL for the WheelDesk web image."
  value       = aws_ecr_repository.web.repository_url
}

output "ecs_cluster_name" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service_name" {
  description = "ECS service name."
  value       = aws_ecs_service.web.name
}

output "database_endpoint" {
  description = "RDS PostgreSQL endpoint."
  value       = aws_db_instance.postgres.address
}

output "redis_endpoint" {
  description = "ElastiCache Redis endpoint."
  value       = aws_elasticache_replication_group.redis.primary_endpoint_address
}

output "database_url_secret_arn" {
  description = "Secrets Manager ARN for DATABASE_URL."
  value       = aws_secretsmanager_secret.database_url.arn
}
