#!/usr/bin/env bash
# deploy.sh — runs inside the deploy container
# Usage: docker run --rm -v ~/.kube/config:/root/.kube/config beta-code-deploy

set -euo pipefail

# ── Colours ────────────────────────────────────────────────────────────────────
GREEN='\033[0;32m'; YELLOW='\033[1;33m'; RED='\033[0;31m'; NC='\033[0m'
info()  { echo -e "${GREEN}[INFO]${NC}  $*"; }
warn()  { echo -e "${YELLOW}[WARN]${NC}  $*"; }
die()   { echo -e "${RED}[ERR]${NC}   $*"; exit 1; }

# ── Require SERVER1_IP ─────────────────────────────────────────────────────────
if [[ -z "${SERVER1_IP:-}" ]]; then
  die "Set SERVER1_IP before running.\n  docker run -e SERVER1_IP=1.2.3.4 ..."
fi

info "Deploying beta-code to cluster (registry: ${SERVER1_IP}:5000)"

# ── Patch image placeholders ───────────────────────────────────────────────────
info "Patching image references → ${SERVER1_IP}:5000"
find /k8s -name "*.yaml" -exec sed -i "s/SERVER1_IP/${SERVER1_IP}/g" {} +

# ── Wait for cluster ───────────────────────────────────────────────────────────
info "Checking cluster connection..."
kubectl cluster-info || die "Cannot reach cluster. Is ~/.kube/config mounted?"

# ── NGINX Ingress ──────────────────────────────────────────────────────────────
if ! kubectl get ns ingress-nginx &>/dev/null; then
  info "Installing NGINX Ingress Controller..."
  kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.10.1/deploy/static/provider/cloud/deploy.yaml
  info "Waiting for NGINX ingress controller to be ready..."
  kubectl wait --namespace ingress-nginx \
    --for=condition=ready pod \
    --selector=app.kubernetes.io/component=controller \
    --timeout=180s
else
  info "NGINX Ingress already installed — skipping"
fi

# ── KEDA ───────────────────────────────────────────────────────────────────────
if ! kubectl get ns keda &>/dev/null; then
  info "Installing KEDA..."
  kubectl apply --server-side -f https://github.com/kedacore/keda/releases/download/v2.15.0/keda-2.15.0.yaml
  info "Waiting for KEDA operator to be ready..."
  kubectl wait --namespace keda \
    --for=condition=ready pod \
    --selector=app=keda-operator \
    --timeout=180s
else
  info "KEDA already installed — skipping"
fi

# ── NFS Provisioner ────────────────────────────────────────────────────────────
if [[ -z "${NFS_SERVER:-}" ]]; then
  warn "NFS_SERVER not set — skipping NFS provisioner install."
  warn "Set -e NFS_SERVER=SERVER1_IP if you need shared storage for the frontend."
else
  if ! helm status nfs-subdir-external-provisioner &>/dev/null; then
    info "Installing NFS provisioner (server: ${NFS_SERVER})..."
    helm repo add nfs-subdir-external-provisioner \
      https://kubernetes-sigs.github.io/nfs-subdir-external-provisioner/ --force-update
    helm install nfs-subdir-external-provisioner \
      nfs-subdir-external-provisioner/nfs-subdir-external-provisioner \
      --set nfs.server="${NFS_SERVER}" \
      --set nfs.path=/srv/beta-code-data \
      --set storageClass.name=nfs-client
  else
    info "NFS provisioner already installed — skipping"
  fi
fi

# ── Apply manifests ────────────────────────────────────────────────────────────
info "Applying core manifests..."
kubectl apply -k /k8s/

# ── KEDA ScaledObject ──────────────────────────────────────────────────────────
info "Applying KEDA ScaledObject for runner autoscaling..."
kubectl apply -f /k8s/keda-scaledobject.yaml

# ── Done ───────────────────────────────────────────────────────────────────────
info "Waiting for pods to start (up to 3 min)..."
kubectl wait --namespace beta-code \
  --for=condition=ready pod \
  --selector=app=frontend \
  --timeout=180s || warn "Frontend pods not ready yet — check: kubectl get pods -n beta-code"

echo ""
info "Deployment complete!"
echo ""
kubectl get pods -n beta-code
echo ""
kubectl get ingress -n beta-code
echo ""
info "Site should be reachable at: http://${SERVER1_IP}"
