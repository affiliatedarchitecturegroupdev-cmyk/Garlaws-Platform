# Phase P003 — Terraform Remote State Backend

## Status: Pending

## Phase Overview
**Title:** Terraform Remote State Backend  
**Stack:** Terraform, AWS S3, DynamoDB  
**Deliverable:** S3 state bucket + DynamoDB lock table

## Implementation Details

### 3.1 S3 Bucket for State
```hcl
resource "aws_s3_bucket" "terraform_state" {
  bucket = "garlaws-terraform-state-${var.environment}"
  
  versioning {
    enabled = true
  }
  
  server_side_encryption_configuration {
    rule {
      apply_server_side_encryption_by_default {
        sse_algorithm = "AES256"
      }
    }
  }
}
```

### 3.2 DynamoDB for Locking
```hcl
resource "aws_dynamodb_table" "terraform_locks" {
  name           = "garlaws-terraform-locks"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key      = "LockID"

  attribute {
    name = "LockID"
    type = "S"
  }
}
```

### 3.3 Backend Configuration
```hcl
terraform {
  backend "s3" {
    bucket         = "garlaws-terraform-state-prod"
    key            = "garlaws-platform/terraform.tfstate"
    region         = "af-south-1"
    encrypt        = true
    dynamodb_table = "garlaws-terraform-locks"
  }
}
```

## Success Criteria
- [ ] S3 bucket created and accessible
- [ ] DynamoDB table created
- [ ] Remote state working
- [ ] Locking prevents concurrent applies

## Next Phase
[P004 — Terragrunt Root Configuration](./P004_TERRAGRUNT_ROOT_CONFIG.md)