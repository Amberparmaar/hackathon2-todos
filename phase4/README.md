# Phase 4: Local Kubernetes Deployment

This phase containerizes the Phase 2 Todo application and deploys it to a local Minikube Kubernetes cluster using Helm.

## Overview

- **Status**: ✅ Deployed and Running
- **Cluster**: Minikube (local)
- **Package Manager**: Helm 3.x
- **Container Runtime**: Docker
- **Application URL**: http://127.0.0.1:64799 (via `minikube service`)

## Architecture

```
┌─────────────────────────────────────────────────┐
│           Minikube Cluster (Local)              │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │  Frontend Pods   │  │  Backend Pods    │   │
│  │  (2 replicas)    │  │  (2 replicas)    │   │
│  │                  │  │                  │   │
│  │  Next.js:3000    │  │  FastAPI:7860    │   │
│  │  Health: /api/   │  │  Health: /health │   │
│  │         health   │  │                  │   │
│  └────────┬─────────┘  └────────┬─────────┘   │
│           │                     │              │
│  ┌────────▼─────────┐  ┌────────▼─────────┐   │
│  │ Frontend Service │  │ Backend Service  │   │
│  │ NodePort:30080   │  │ ClusterIP:7860   │   │
│  └──────────────────┘  └──────────────────┘   │
│                                                 │
│  ┌──────────────────┐  ┌──────────────────┐   │
│  │   ConfigMap      │  │    Secrets       │   │
│  │  (Environment)   │  │  (Credentials)   │   │
│  └──────────────────┘  └──────────────────┘   │
└─────────────────────────────────────────────────┘
                    │
                    ▼
        ┌───────────────────────┐
        │  Neon PostgreSQL      │
        │  (External Database)  │
        └───────────────────────┘
```

## Prerequisites

- Docker Desktop installed and running
- Minikube v1.38.0+
- kubectl v1.29.0+
- Helm 3.14.0+
- Phase 2 application working locally

## Quick Start

### 1. Start Minikube

```bash
minikube start --memory=3072 --cpus=2 --driver=docker
```

### 2. Build Docker Images in Minikube

```bash
# Configure Docker to use Minikube's daemon
eval $(minikube docker-env)

# Build backend image
docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .

# Build frontend image
docker build -f phase4/docker/frontend/Dockerfile -t todo-frontend:latest .
```

### 3. Deploy with Helm

```bash
helm install todo-app phase4/helm/todo-app \
  --set secrets.databaseUrl="<YOUR_DATABASE_URL>" \
  --set secrets.cohereApiKey="<YOUR_COHERE_API_KEY>" \
  --set secrets.betterAuthSecret="<YOUR_BETTER_AUTH_SECRET>"
```

### 4. Access the Application

```bash
# Get the service URL (runs in background)
minikube service todo-frontend --url

# Open in browser
# http://127.0.0.1:<PORT>
```

## Deployment Components

### Docker Images

- **Backend**: `todo-backend:latest` (436MB)
  - Base: Python 3.11-slim
  - Multi-stage build
  - Health check: `/health`

- **Frontend**: `todo-frontend:latest` (291MB)
  - Base: Node 20-alpine
  - Multi-stage build with standalone output
  - Health check: `/api/health`

### Helm Chart

Located in `phase4/helm/todo-app/`:

- **Chart.yaml**: Chart metadata (v1.0.0)
- **values.yaml**: Configuration values
- **templates/**: Kubernetes manifests
  - `deployment-backend.yaml`: Backend deployment (2 replicas)
  - `deployment-frontend.yaml`: Frontend deployment (2 replicas)
  - `service-backend.yaml`: ClusterIP service (port 7860)
  - `service-frontend.yaml`: NodePort service (port 3000:30080)
  - `secret.yaml`: Sensitive credentials
  - `configmap.yaml`: Environment configuration
  - `_helpers.tpl`: Template helpers

### Kubernetes Resources

```bash
# View all resources
kubectl get all -l app=todo-app

# Check pod status
kubectl get pods -l app=todo-app

# View logs
kubectl logs -l app=todo-app --tail=50

# Describe resources
kubectl describe deployment todo-backend
kubectl describe deployment todo-frontend
```

## Configuration

### Environment Variables

**Backend** (via ConfigMap and Secrets):
- `DATABASE_URL`: PostgreSQL connection string (secret)
- `COHERE_API_KEY`: Cohere API key (secret)
- `BETTER_AUTH_SECRET`: Better Auth secret (secret)
- `PORT`: 7860

**Frontend** (via ConfigMap):
- `NEXT_PUBLIC_API_URL`: Backend service URL
- `NODE_ENV`: production
- `PORT`: 3000

### Secrets Management

Secrets are stored in Kubernetes secrets (base64 encoded):

```bash
# View secrets (values are hidden)
kubectl get secrets -l app=todo-app

# Update secrets
helm upgrade todo-app phase4/helm/todo-app \
  --set secrets.databaseUrl="<NEW_VALUE>" \
  --reuse-values
```

## Health Checks

Both services have readiness and liveness probes:

**Backend**:
- Endpoint: `http://localhost:7860/health`
- Initial delay: 10s
- Period: 5s
- Timeout: 3s

**Frontend**:
- Endpoint: `http://localhost:3000/api/health`
- Initial delay: 10s
- Period: 5s
- Timeout: 3s

## Troubleshooting

### Pods Not Ready

```bash
# Check pod status
kubectl get pods -l app=todo-app

# View pod logs
kubectl logs <pod-name>

# Describe pod for events
kubectl describe pod <pod-name>
```

### Image Pull Issues

```bash
# Verify images exist in Minikube
eval $(minikube docker-env)
docker images | grep todo

# Rebuild if needed
docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .
```

### Service Not Accessible

```bash
# Check service status
kubectl get services -l app=todo-app

# Get service URL
minikube service todo-frontend --url

# Port forward as alternative
kubectl port-forward service/todo-frontend 3000:3000
```

### Database Connection Issues

```bash
# Check backend logs
kubectl logs -l component=backend --tail=50

# Verify secrets
kubectl get secret todo-secrets -o yaml

# Test database connectivity from pod
kubectl exec deployment/todo-backend -- sh -c "python -c 'import os; print(os.getenv(\"DATABASE_URL\")[:30])'"
```

## Maintenance

### Update Deployment

```bash
# Rebuild images
eval $(minikube docker-env)
docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .
docker build -f phase4/docker/frontend/Dockerfile -t todo-frontend:latest .

# Restart deployments
kubectl rollout restart deployment/todo-backend
kubectl rollout restart deployment/todo-frontend

# Check rollout status
kubectl rollout status deployment/todo-backend
kubectl rollout status deployment/todo-frontend
```

### Scale Replicas

```bash
# Scale backend
kubectl scale deployment/todo-backend --replicas=3

# Scale frontend
kubectl scale deployment/todo-frontend --replicas=3

# Or via Helm
helm upgrade todo-app phase4/helm/todo-app \
  --set backend.replicas=3 \
  --set frontend.replicas=3 \
  --reuse-values
```

### Uninstall

```bash
# Remove Helm release
helm uninstall todo-app

# Verify cleanup
kubectl get all -l app=todo-app

# Stop Minikube
minikube stop

# Delete Minikube cluster
minikube delete
```

## Monitoring

### View Logs

```bash
# All pods
kubectl logs -l app=todo-app --tail=100 -f

# Specific component
kubectl logs -l component=backend --tail=50 -f
kubectl logs -l component=frontend --tail=50 -f

# Specific pod
kubectl logs <pod-name> -f
```

### Resource Usage

```bash
# Pod resource usage
kubectl top pods -l app=todo-app

# Node resource usage
kubectl top nodes
```

## Testing

### Health Endpoints

```bash
# Backend health
kubectl exec deployment/todo-backend -- wget -qO- http://localhost:7860/health

# Frontend health
kubectl exec deployment/todo-frontend -- wget -qO- http://localhost:3000/api/health
```

### API Testing

```bash
# Access backend API docs
kubectl port-forward service/todo-backend 7860:7860
# Open http://localhost:7860/docs in browser
```

## Files Structure

```
phase4/
├── docker/
│   ├── backend/
│   │   ├── Dockerfile          # Backend multi-stage build
│   │   └── .dockerignore       # Backend exclusions
│   └── frontend/
│       └── Dockerfile          # Frontend multi-stage build
├── helm/
│   └── todo-app/
│       ├── Chart.yaml          # Chart metadata
│       ├── values.yaml         # Configuration values
│       ├── values.example.yaml # Example configuration
│       └── templates/          # Kubernetes manifests
│           ├── _helpers.tpl
│           ├── deployment-backend.yaml
│           ├── deployment-frontend.yaml
│           ├── service-backend.yaml
│           ├── service-frontend.yaml
│           ├── secret.yaml
│           └── configmap.yaml
├── specs/                      # Phase 4 specifications
│   ├── spec.md                 # User stories
│   ├── plan.md                 # Architecture design
│   ├── tasks.md                # Implementation tasks
│   └── implement.md            # Implementation tracking
└── README.md                   # This file
```

## Success Metrics

- ✅ Both deployments: 2/2 READY
- ✅ All pods: Running and healthy
- ✅ Health probes: Passing
- ✅ Application: Accessible via browser
- ✅ Database: Connected and functional
- ✅ Helm chart: Validated and deployed

## Next Steps

- **Phase 5**: Advanced cloud deployment with Dapr, Kafka, and cloud Kubernetes
- Add monitoring with Prometheus/Grafana
- Implement CI/CD pipeline
- Add ingress controller for production-like routing

## References

- [Minikube Documentation](https://minikube.sigs.k8s.io/docs/)
- [Helm Documentation](https://helm.sh/docs/)
- [Kubernetes Documentation](https://kubernetes.io/docs/)
- Phase 2 README: `../phase2/README.md`
- Specifications: `specs/spec.md`
