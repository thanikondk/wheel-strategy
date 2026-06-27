# WheelDesk AWS Dev Environment

This Terraform environment provisions a real AWS baseline for WheelDesk:

- VPC with public, private, and database subnets across two AZs
- Internet gateway and one NAT gateway
- Application Load Balancer
- ECS Fargate cluster, task definition, and service
- ECR repository for the web image
- RDS PostgreSQL in private database subnets
- ElastiCache Redis in private subnets
- Secrets Manager entries for app secrets and provider keys
- CloudWatch log groups
- EventBridge Scheduler placeholder for future snapshot jobs

## First-Time Deploy

Authenticate to AWS first:

```bash
aws sts get-caller-identity
```

Create a local tfvars file:

```bash
cp terraform.tfvars.example terraform.tfvars
```

Edit `terraform.tfvars` with your real account inputs. Do not commit it.

Provision the base infrastructure with ECS scaled to zero:

```bash
terraform init
terraform plan
terraform apply
```

Build and push the container, then scale the service to one task:

```bash
../../../../scripts/deploy-aws.sh
```

Print the app URL:

```bash
terraform output application_url
```

## Updating the App

After code changes:

```bash
../../../../scripts/deploy-aws.sh
```

The script builds the Docker image, pushes it to ECR with the current Git SHA, then reapplies Terraform with that image tag.

## HTTPS

Create or import an ACM certificate in the same region, then set:

```hcl
certificate_arn = "arn:aws:acm:..."
nextauth_url    = "https://your-domain.example.com"
```

Terraform will create an HTTPS listener and redirect HTTP to HTTPS.

## Cost Notes

This is real infrastructure and will incur AWS charges. The highest baseline costs are usually NAT Gateway, RDS, ECS/Fargate runtime, and ALB. Destroy when not needed:

```bash
terraform destroy
```

For RDS production use, set `enable_deletion_protection = true` and manage final snapshots deliberately.

## Security Notes

- RDS and Redis are not public.
- ECS tasks run in private subnets.
- API keys and database URLs are injected from Secrets Manager.
- The public surface is the ALB only.
- Yahoo development provider is suitable for local/dev research, not production data licensing.
