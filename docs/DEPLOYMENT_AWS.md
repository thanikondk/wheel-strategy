# AWS Deployment

Preferred deployment target: ECS Fargate behind an application load balancer, with RDS PostgreSQL and Secrets Manager.

Included artifacts:

- `Dockerfile`
- `docker-compose.yml`
- `buildspec.yml`
- `appspec.yml`
- `infra/aws/template.yml`

Suggested pipeline:

1. Source: GitHub or CodeCommit.
2. Build: CodeBuild runs install, tests, lint, Next.js build, Docker build, and ECR push.
3. Deploy: CodeDeploy updates the ECS service from `imagedefinitions.json`.
4. Runtime: ECS Fargate reads database secrets from Secrets Manager and logs to CloudWatch.

Security notes:

- Keep RDS private.
- Scope ECS task role to required secrets only.
- Use HTTPS at the load balancer or CloudFront.
- Enable WAF for public production deployments.
