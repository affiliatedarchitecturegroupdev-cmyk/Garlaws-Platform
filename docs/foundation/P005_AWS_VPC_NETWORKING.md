# Phase P005 — AWS VPC & Multi-AZ Networking

## Status: Pending

## Phase Overview
**Title:** AWS VPC & Multi-AZ Networking  
**Stack:** Terraform, AWS VPC  
**Deliverable:** VPC, 3 private subnets, 3 public subnets, NAT GW

## Implementation Details

```hcl
module "vpc" {
  source  = "terraform-aws-modules/vpc/aws"
  version = "~> 5.0"

  name = "garlaws-vpc-${var.environment}"
  cidr = "10.0.0.0/16"

  azs             = ["af-south-1a", "af-south-1b", "af-south-1c"]
  private_subnets = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  public_subnets  = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]

  enable_nat_gateway   = true
  single_nat_gateway   = false
  enable_dns_hostnames = true
  enable_dns_support   = true
}
```

## Next Phase
[P006 — Security Groups & NACLs](./P006_SECURITY_GROUPS_NACLS.md)

---

# Phase P006 — Security Groups & NACLs

## Status: Pending

```hcl
resource "aws_security_group" "eks_workers" {
  name        = "garlaws-eks-workers"
  description = "Security group for EKS worker nodes"
  vpc_id      = module.vpc.vpc_id

  ingress {
    from_port   = 0
    to_port     = 0
    protocol   = "-1"
    cidr_blocks = ["10.0.0.0/16"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol   = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

## Next Phase
[P007 — AWS EKS Cluster Provisioning](./P007_AWS_EKS_CLUSTER.md)