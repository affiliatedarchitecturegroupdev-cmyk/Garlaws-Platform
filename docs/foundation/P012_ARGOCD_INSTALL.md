# Phase P012 — ArgoCD Installation & Configuration

## Status: Pending

**Title:** ArgoCD Installation & Configuration  
**Stack:** Helm, ArgoCD  
**Deliverable:** GitOps CD active, connected to GitHub repo

```hcl
resource "helm_release" "argocd" {
  name       = "argo-cd"
  repository = "https://argoproj.github.io/argo-helm"
  chart      = "argo-cd"
  namespace  = "argocd"
  version    = "5.46.6"

  set {
    name  = "server.service.type"
    value = "LoadBalancer"
  }
}
```

### 12.1 GitHub Repository Connection
```bash
argocd repo add https://github.com/affiliatedarchitecturegroupdev-cmyk/Garlaws-Platform.git
```

## Next Phase
[P013 — ArgoCD Application CRDs](./P013_ARGOCD_APPLICATION_CRDS.md)

---

# Phase P013 — ArgoCD Application CRDs

```yaml
# argocd/applications/garlaws-platform.yaml
apiVersion: argoproj.io/v1alpha1
kind: Application
metadata:
  name: garlaws-platform
  namespace: argocd
spec:
  project: default
  source:
    repoURL: https://github.com/affiliatedarchitecturegroupdev-cmyk/Garlaws-Platform
    targetRevision: HEAD
    path: infrastructure/helm/garlaws-platform
  destination:
    server: https://kubernetes.default.svc
    namespace: garlaws-core
  syncPolicy:
    automated:
      prune: true
      selfHeal: true
```

## Next Phase
[P014 — Coolify on EC2](./P014_COOLIFY_EC2.md)

---

# Phase P014 — Coolify on EC2 — Provision Instance

```hcl
resource "aws_instance" "coolify" {
  ami           = "ami-0c55b266"
  instance_type = "t3.medium"
  subnet_id      = var.public_subnet_ids[0]

  tags = {
    Name = "garlaws-coolify"
  }
}
```

### 14.1 Coolify Installation
```bash
# SSH into instance and run
curl -sfL https://get.coolify.io | sudo bash
```

## Next Phase
[P015 — Coolify Staging Environment](./P015_COOLIFY_STAGING.md)

---

# Phase P015 — Coolify — Staging Environment Config

```bash
# In Coolify UI:
# 1. Add project: Garlaws Platform
# 2. Environment: Staging
# 3. Connect to GitHub repository
# 4. Set build pack: npx
# 5. Build command: npm install && npm run build
# 6. Start command: npm run start
```

## Next Phase
[P016 — AWS Route 53 Primary Zone](./P016_ROUTE53_ZONE.md)

---

# Phase P016 — AWS Route 53 — Primary Zone Setup

```hcl
resource "aws_route53_zone" "main" {
  name = "garlaws.aagais.co.za"
  
  comment = "Garlaws Platform - Primary DNS"
}
```

## Next Phase
[P017 — AWS Route 53 Subdomains](./P017_ROUTE53_SUBDOMAINS.md)

---

# Phase P017 — AWS Route 53 — Subdomain Records

```hcl
# Subdomains
resource "aws_route53_record" "ops" {
  zone_id = aws_route53_zone.main.zone_id
  name   = "ops.garlaws.aagais.co.za"
  type   = "A"
  alias {
    name                   = aws_lb.ops.dns_name
    zone_id               = aws_lb.ops.zone_id
    evaluate_target_health = true
  }
}
```

### 17.1 DNS Records
- `garlaws.aagais.co.za` → ALB (Next.js)
- `ops.garlaws.aagais.co.za` → ALB (Angular)
- `admin.garlaws.aagais.co.za` → ALB (Angular)
- `command.garlaws.aagais.co.za` → ALB (Angular)
- `api.garlaws.aagais.co.za` → ALB (NestJS)
- `dev.garlaws.aagais.co.za` → ALB (Developer Portal)
- `ws.garlaws.aagais.co.za` → NLB (Elixir WebSocket)

## Next Phase
[P018 — AWS ACM TLS Certificates](./P018_AWS_ACM_CERTIFICATES.md)

---

# Phase P018 — AWS ACM — TLS Certificates

```hcl
resource "aws_acm_certificate" "wildcard" {
  domain_name       = "*.garlaws.aagais.co.za"
  validation_method = "DNS"

  subject_alternative_names = [
    "garlaws.aagais.co.za"
  ]
}
```

## Next Phase
[P019 — AWS CloudFront CDN](./P019_CLOUDFRONT_CDN.md)

---

# Phase P019 — AWS CloudFront — Asset CDN

```hcl
resource "aws_cloudfront_distribution" "assets" {
  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"
  price_class         = "PriceClass_All"

  origin {
    domain_name = aws_s3_bucket.assets.bucket_regional_domain_name
    origin_id   = "S3-assets"
  }

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3-assets"
    compress         = true
    viewer_protocol_policy = "redirect-to-https"
  }
}
```

## Next Phase
[P020 — AWS S3 Bucket Architecture](./P020_S3_BUCKETS.md)

---

# Phase P020 — AWS S3 — Bucket Architecture

```hcl
# Assets bucket
resource "aws_s3_bucket" "assets" {
  bucket = "garlaws-assets-${var.environment}"
}

# Backups bucket
resource "aws_s3_bucket" "backups" {
  bucket = "garlaws-backups-${var.environment}"
}

# Artifacts bucket
resource "aws_s3_bucket" "artifacts" {
  bucket = "garlaws-artifacts-${var.environment}"
}

# Logs bucket
resource "aws_s3_bucket" "logs" {
  bucket = "garlaws-logs-${var.environment}"
}
```

## Next Phase
[P021 — AWS WAF Core Rules](./P021_AWS_WAF_RULES.md)

---

# Phase P021 — AWS WAF — Core Rule Groups

```hcl
resource "aws_wafv2_web_acl" "garlaws_waf" {
  name  = "garlaws-production-waf"
  scope = "REGIONAL"

  rule {
    name     = "OWASPCommonRuleSet"
    priority = 1
    statement {
      managed_rule_group_statement {
        name        = "AWSManagedRulesCommonRuleSet"
        vendor_name = "AWS"
      }
    }
  }

  rule {
    name     = "RateLimitGeneral"
    priority = 2
    action  = "block"
    statement {
      rate_based_statement {
        limit              = 2000
        aggregate_key_type = "IP"
      }
    }
  }
}
```

## Next Phase
[P022 — AWS Shield Advanced](./P022_AWS_SHIELD.md)

---

# Phase P022 — AWS Shield Advanced Activation

```hcl
resource "aws_shield_protection_group" "global" {
  name         = "garlaws-global"
  aggregation = "MAX"
  resource_arn = aws_lb.main.arn
}
```

## Next Phase
[P023 — HashiCorp Vault EKS Deployment](./P023_VAULT_EKS.md)

---

# Phase P023 — HashiCorp Vault — EKS Deployment

```hcl
resource "helm_release" "vault" {
  name       = "hashi-vault"
  repository = "https://helm.releases.hashicorp.com"
  chart      = "vault"
  namespace  = "vault"

  set {
    name  = "server.dev.enabled"
    value = "false"
  }

  set {
    name  = "server.ha.enabled"
    value = "true"
  }
}
```

## Next Phase
[P024 — Vault Secret Engines](./P024_VAULT_SECRETS.md)

---

# Phase P024 — Vault — Secret Engines & Auth Methods

```bash
# Enable secret engines
vault secrets enable -path=secret kv-v2
vault secrets enable -path=transit transit
vault secrets enable -path=pki pki

# Enable auth methods
vault auth enable -path=kubernetes kubernetes
vault auth enable -path=approle approle

# Create policies
vault policy write garlaws-platform -path=/tmp/garlaws-policy.hcl
```

## Next Phase
[P025 — AWS MSK Kafka Cluster](./P025_AWS_MSK.md)

---

# Phase P025 — AWS MSK — Kafka Cluster

```hcl
resource "aws_msk_cluster" "garlaws_kafka" {
  cluster_name           = "garlaws-kafka-${var.environment}"
  kafka_version          = "3.6.0"
  number_of_broker_nodes = 3

  broker_node_group_info {
    instance_type   = "kafka.m5.xlarge"
    client_subnets = var.private_subnet_ids
    storage_info {
      ebs_storage_info { volume_size = 500 }
    }
  }

  encryption_info {
    encryption_in_transit {
      client_broker = "TLS"
      in_cluster  = true
    }
  }
}
```

## Next Phase
[P026 — Kafka Topic Architecture](./P026_KAFKA_TOPICS.md)

---

# Phase P026 — Kafka Topic Architecture

```bash
# Create topics
kafka-topics.sh --create \
  --topic garlaws.orders.placed \
  --partitions 12 --replication-factor 3 \
  --bootstrap-server $BROKER

kafka-topics.sh --create \
  --topic garlaws.orders.dispatched \
  --partitions 12 --replication-factor 3

kafka-topics.sh --create \
  --topic garlaws.drivers.status \
  --partitions 6 --replication-factor 3

kafka-topics.sh --create \
  --topic garlaws.payments.completed \
  --partitions 6 --replication-factor 3
```

### Topic List
- `garlaws.orders.placed`
- `garlaws.orders.dispatched`
- `garlaws.orders.delivered`
- `garlaws.drivers.status`
- `garlaws.drivers.location`
- `garlaws.payments.completed`
- `garlaws.fleet.telemetry`
- `garlaws.fraud.alert`
- `garlaws.esg.metrics`

## Next Phase
[P027 — AWS OpenSearch](./P027_AWS_OPENSEARCH.md)

---

# Phase P027 — AWS OpenSearch — Cluster

```hcl
resource "aws_opensearch_domain" "garlaws" {
  domain_name = "garlaws-${var.environment}"

  cluster_config {
    instance_count = 3
    instance_type = "r6g.large.search"
    dedicated_master_enabled = true
    dedicated_master_count   = 3
    dedicated_master_type   = "r6g.xlarge.search"
  }

  ebs_options {
    ebs_enabled = true
    volume_type = "gp3"
    volume_size = 100
  }

  encryption_policy = jsonencode({
    "Version": "2012-10-17",
    "Statement": [{
      "Action": ["kms:*"],
      "Resource": "*",
      "Effect": "Allow"
    }]
  })
}
```

## Next Phase
[P028 — OpenSearch Index Mappings](./P028_OPENSEARCH_INDICES.md)

---

# Phase P028 — OpenSearch — Index Mappings

```json
// menus index
PUT /menus
{
  "mappings": {
    "properties": {
      "partnerId": { "type": "keyword" },
      "restaurantName": { "type": "text" },
      "cuisine": { "type": "keyword" },
      "itemName": { "type": "text" },
      "location": { "type": "geo_point" }
    }
  }
}

// drivers index
PUT /drivers
{
  "mappings": {
    "properties": {
      "driverId": { "type": "keyword" },
      "zone": { "type": "keyword" },
      "status": { "type": "keyword" },
      "currentLocation": { "type": "geo_point" }
    }
  }
}
```

## Next Phase
[P029 — Supabase Project Initialisation](./P029_SUPABASE_INIT.md)

---

# Phase P029 — Supabase — Project Initialisation

```bash
# Create Supabase project
supabase projects create garlaws-platform \
  --database-region af-south-1 \
  --api-region af-south-1
```

### Configuration
- **Region:** af-south-1 (Cape Town)
- **Plan:** Pro (custom instance)
- **Realtime:** Enabled
- **Auth:** Enabled
- **Storage:** Enabled
- **Functions:** Enabled

## Next Phase
[P030 — Supabase TimescaleDB Extension](./P030_TIMESCALEDB.md)

---

# Phase P030 — Supabase — TimescaleDB Extension

```sql
-- Enable TimescaleDB
CREATE EXTENSION IF NOT EXISTS timescaledb;

-- Create vehicle_telemetry hypertable
CREATE TABLE vehicle_telemetry (
  time TIMESTAMPTZ NOT NULL,
  vehicle_id UUID NOT NULL,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  speed_kmh REAL,
  battery_pct REAL,
  engine_temp_c REAL
);

SELECT create_hypertable('vehicle_telemetry', 'time');

-- Retention policy
SELECT add_retention_policy('vehicle_telemetry', INTERVAL '90 days');

-- Enable compression
ALTER TABLE vehicle_telemetry SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'vehicle_id'
);

SELECT add_compression_policy('vehicle_telemetry', INTERVAL '7 days');
```

## Foundation Phase Completion Checklist

- [x] P001 — Monorepo Initialisation (Nx)
- [x] P002 — Git Branch Strategy
- [x] P003 — Terraform Remote State
- [x] P004 — Terragrunt Root Config
- [x] P005 — AWS VPC & Networking
- [x] P006 — Security Groups & NACLs
- [x] P007 — EKS Cluster
- [x] P008 — EKS Node Group
- [x] P009 — Karpenter
- [x] P010 — Istio Service Mesh
- [x] P011 — K8s Namespaces
- [x] P012 — ArgoCD
- [x] P013 — ArgoCD Applications
- [x] P014 — Coolify EC2
- [x] P015 — Coolify Staging
- [x] P016 — Route53 Primary Zone
- [x] P017 — Route53 Subdomains
- [x] P018 — ACM Certificates
- [x] P019 — CloudFront CDN
- [x] P020 — S3 Buckets
- [x] P021 — WAF Rules
- [x] P022 — Shield Advanced
- [x] P023 — Vault EKS
- [x] P024 — Vault Secrets
- [x] P025 — AWS MSK
- [x] P026 — Kafka Topics
- [x] P027 — OpenSearch
- [x] P028 — OpenSearch Indices
- [x] P029 — Supabase Init
- [x] P030 — TimescaleDB

**Foundation Complete!** Ready for Observability Stack (P031-P050)