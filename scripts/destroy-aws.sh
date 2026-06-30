#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TF_DIR="$ROOT_DIR/infra/terraform/envs/dev"
AUTO_APPROVE="false"

for arg in "$@"; do
  case "$arg" in
    --yes|-y)
      AUTO_APPROVE="true"
      ;;
    *)
      echo "Unknown argument: $arg" >&2
      echo "Usage: AWS_PROFILE=wheeldesk scripts/destroy-aws.sh [--yes]" >&2
      exit 2
      ;;
  esac
done

if ! command -v terraform >/dev/null 2>&1; then
  echo "terraform is required but was not found." >&2
  exit 1
fi

if ! command -v aws >/dev/null 2>&1; then
  echo "aws CLI is required but was not found." >&2
  exit 1
fi

cd "$TF_DIR"

if [[ ! -d ".terraform" ]]; then
  terraform init
fi

echo "AWS identity:"
aws sts get-caller-identity
echo

echo "Terraform workspace: $(terraform workspace show)"
echo "Terraform directory: $TF_DIR"
echo

if [[ "$(terraform workspace show)" != "default" ]]; then
  echo "Refusing to destroy from a non-default Terraform workspace." >&2
  exit 1
fi

if [[ "$AUTO_APPROVE" != "true" ]]; then
  read -r -p "Destroy all WheelDesk dev AWS resources managed by Terraform? Type 'destroy wheeldesk-dev': " confirmation
  if [[ "$confirmation" != "destroy wheeldesk-dev" ]]; then
    echo "Destroy canceled."
    exit 0
  fi
fi

terraform destroy -auto-approve

remaining_resources="$(terraform state list)"
if [[ -n "$remaining_resources" ]]; then
  echo "Terraform destroy finished, but state still contains resources:" >&2
  echo "$remaining_resources" >&2
  exit 1
fi

echo "WheelDesk dev AWS resources destroyed. Terraform state is empty."
