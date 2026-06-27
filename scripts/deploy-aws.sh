#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_DIR="$ROOT_DIR/infra/terraform/envs/dev"
IMAGE_TAG="${1:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"

cd "$TF_DIR"

AWS_REGION="$(terraform output -raw aws_region)"
ECR_REPOSITORY_URL="$(terraform output -raw ecr_repository_url)"

aws ecr get-login-password --region "$AWS_REGION" \
  | docker login --username AWS --password-stdin "$ECR_REPOSITORY_URL"

docker build --platform linux/amd64 -t "$ECR_REPOSITORY_URL:$IMAGE_TAG" "$ROOT_DIR"
docker push "$ECR_REPOSITORY_URL:$IMAGE_TAG"

terraform apply \
  -var="app_image_tag=$IMAGE_TAG" \
  -var="desired_count=1"

terraform output application_url
