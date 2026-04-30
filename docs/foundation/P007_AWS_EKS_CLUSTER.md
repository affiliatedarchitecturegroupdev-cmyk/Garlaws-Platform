# Phase P007 — AWS EKS Cluster Provisioning

## Status: Pending

**Title:** AWS EKS Cluster Provisioning  
**Stack:** Terraform, AWS EKS  
**Deliverable:** Kubernetes 1.30 cluster in af-south-1

```hcl
module "eks" {
  source  = "terraform-aws-modules/eks/aws"
  version = "~> 20.0"

  cluster_name    = "garlaws-eks-${var.environment}"
  cluster_version = "1.30"

  vpc_id     = var.vpc_id
  subnet_ids = var.private_subnet_ids

  cluster_endpoint_public_access = true

  eks_managed_node_groups = {
    baseline = {
      min_size     = 3
      max_size     = 6
      desired_size = 3
      instance_types = ["m6i.xlarge"]
      capacity_type  = "ON_DEMAND"
    }
  }

  enable_irsa = true
}
```

## Next Phase
[P008 — EKS Node Group — Baseline](./P008_EKS_NODE_GROUP.md)

---

# Phase P008 — EKS Node Group — Baseline

```hcl
# Already included in P007 eks_managed_node_groups
# Additional node groups for specific workloads
eks_managed_node_groups = {
  memory = {
    instance_types = ["r6i.xlarge"]
    min_size = 2
    max_size = 10
  }
  compute = {
    instance_types = ["c6i.xlarge"]
    min_size = 2
    max_size = 20
  }
}
```

## Next Phase
[P009 — Karpenter Autoscaler Installation](./P009_KARPENTER_AUTOSCALER.md)

---

# Phase P009 — Karpenter Autoscaler Installation

```hcl
resource "helm_release" "karpenter" {
  name       = "karpenter"
  repository = "oci://public.ecr.aws/karpenter"
  chart      = "karpenter"
  namespace  = "karpenter"

  set { name = "settings.clusterName"; value = module.eks.cluster_name }
}
```

## Next Phase
[P010 — Istio Service Mesh Installation](./P010_ISTIO_SERVICE_MESH.md)

---

# Phase P010 — Istio Service Mesh Installation

```hcl
resource "helm_release" "istio" {
  name       = "istio-base"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "base"
  namespace  = "istio-system"
}

resource "helm_release" "istiod" {
  name       = "istiod"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "istiod"
  namespace  = "istio-system"
}

# Istio Gateway
resource "helm_release" "istio_ingress" {
  name       = "istio-ingress"
  repository = "https://istio-release.storage.googleapis.com/charts"
  chart      = "gateway"
  namespace  = "istio-ingress"
}
```

## Next Phase
[P011 — Kubernetes Namespace Structure](./P011_K8S_NAMESPACES.md)

---

# Phase P011 — Kubernetes Namespace Structure

```yaml
# namespaces.yaml
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-core
---
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-drivers
---
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-fleet
---
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-storefronts
---
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-ai
---
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-blockchain
---
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-payments
---
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-comms
---
apiVersion: v1
kind: Namespace
metadata:
  name: garlaws-monitoring
---
apiVersion: v1
kind: Namespace
metadata:
  name: karpenter
```

## Next Phase
[P012 — ArgoCD Installation & Configuration](./P012_ARGOCD_INSTALL.md)