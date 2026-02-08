# Quick Start Guide: Phase IV Kubernetes Deployment

**Feature**: Local Container Orchestration for Todo Application
**Branch**: 001-k8s-deployment
**Date**: 2026-02-07

This guide provides step-by-step instructions to deploy the Phase II Todo application with AI chatbot on a local Kubernetes cluster using Minikube.

---

## Prerequisites

### Required Tools

- **Docker Desktop 4.53+** - Container runtime with Gordon AI (optional)
  - Download: https://www.docker.com/products/docker-desktop
  - Verify: `docker --version`
  - Check Gordon: `docker gordon --version` (optional)

- **Minikube** - Local Kubernetes cluster
  - Download: https://minikube.sigs.k8s.io/docs/start/
  - Verify: `minikube version`

- **kubectl** - Kubernetes CLI
  - Download: https://kubernetes.io/docs/tasks/tools/
  - Verify: `kubectl version --client`

- **Helm 3.x** - Kubernetes package manager
  - Download: https://helm.sh/docs/intro/install/
  - Verify: `helm version`

### Optional AI Tools (for bonus points)

- **kubectl-ai** - AI-assisted Kubernetes operations
  - Install: `brew install sozercan/kubectl-ai/kubectl-ai` (macOS) or see https://github.com/sozercan/kubectl-ai
  - Verify: `kubectl-ai --version`

- **kagent** - Kubernetes diagnostics agent
  - Install: See https://github.com/kubeshop/kagent
  - Verify: `kagent version`

### System Requirements

- **RAM**: Minimum 8GB (4GB allocated to Minikube)
- **CPU**: Minimum 4 cores (2 cores allocated to Minikube)
- **Disk**: 20GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux

### Application Prerequisites

- Phase II application code in `phase2/` directory
- Phase II application tested and working locally
- Access to Neon PostgreSQL database
- Cohere API key for chatbot functionality
- Better Auth secret for authentication

---

## Step 1: Environment Setup

### 1.1 Start Minikube Cluster

```bash
# Start Minikube with appropriate resources
minikube start --memory=4096 --cpus=2 --driver=docker

# Expected output:
# 😄  minikube v1.32.0 on Darwin 14.0
# ✨  Using the docker driver based on user configuration
# 👍  Starting control plane node minikube in cluster minikube
# 🚜  Pulling base image ...
# 🔥  Creating docker container (CPUs=2, Memory=4096MB) ...
# 🐳  Preparing Kubernetes v1.28.3 on Docker 24.0.7 ...
# 🔗  Configuring bridge CNI (Container Networking Interface) ...
# 🔎  Verifying Kubernetes components...
# 🌟  Enabled addons: storage-provisioner, default-storageclass
# 🏄  Done! kubectl is now configured to use "minikube" cluster
```

### 1.2 Verify Cluster

```bash
# Check cluster status
minikube status

# Expected output:
# minikube
# type: Control Plane
# host: Running
# kubelet: Running
# apiserver: Running
# kubeconfig: Configured

# Verify kubectl connection
kubectl cluster-info

# Expected output:
# Kubernetes control plane is running at https://127.0.0.1:xxxxx
# CoreDNS is running at https://127.0.0.1:xxxxx/api/v1/namespaces/kube-system/services/kube-dns:dns/proxy

# Check nodes
kubectl get nodes

# Expected output:
# NAME       STATUS   ROLES           AGE   VERSION
# minikube   Ready    control-plane   1m    v1.28.3
```

### 1.3 Configure Docker to Use Minikube's Daemon

```bash
# Set Docker environment to use Minikube's Docker daemon
# This allows building images directly in Minikube without pushing to registry

# For bash/zsh:
eval $(minikube docker-env)

# For PowerShell:
minikube docker-env | Invoke-Expression

# For Windows CMD:
@FOR /f "tokens=*" %i IN ('minikube docker-env') DO @%i

# Verify configuration
docker ps

# You should see Minikube's Kubernetes containers running
```

---

## Step 2: Build Container Images

### 2.1 Build Backend Image

**Option A: Using Gordon (AI-assisted, recommended)**

```bash
# Generate optimized Dockerfile with Gordon
docker gordon generate "FastAPI backend with Python 3.11, expose port 7860, copy from phase2/backend" > phase4/docker/backend/Dockerfile

# Build image with Gordon optimization
docker gordon build phase4/docker/backend/Dockerfile -t todo-backend:latest

# Expected output:
# [+] Building 45.2s (12/12) FINISHED
# => [internal] load build definition
# => [internal] load .dockerignore
# => [internal] load metadata
# => [1/6] FROM docker.io/library/python:3.11-slim
# => [2/6] WORKDIR /app
# => [3/6] COPY phase2/backend/requirements.txt .
# => [4/6] RUN pip install --no-cache-dir -r requirements.txt
# => [5/6] COPY phase2/backend/server.py .
# => [6/6] COPY phase2/backend/main.py .
# => exporting to image
# => => naming to docker.io/library/todo-backend:latest
```

**Option B: Standard Docker (fallback)**

```bash
# Build using standard Docker CLI
docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .

# Monitor build progress
# Build time: ~3-5 minutes (first build), ~30 seconds (cached)
```

### 2.2 Build Frontend Image

**Option A: Using Gordon**

```bash
# Generate optimized Dockerfile with Gordon
docker gordon generate "Next.js frontend with Node 20, multi-stage build, standalone output, copy from phase2/frontend" > phase4/docker/frontend/Dockerfile

# Build image with Gordon optimization
docker gordon build phase4/docker/frontend/Dockerfile -t todo-frontend:latest
```

**Option B: Standard Docker**

```bash
# Build using standard Docker CLI
docker build -f phase4/docker/frontend/Dockerfile -t todo-frontend:latest .

# Build time: ~5-8 minutes (first build), ~1 minute (cached)
```

### 2.3 Verify Images

```bash
# List built images
docker images | grep todo

# Expected output:
# todo-backend     latest    abc123def456   2 minutes ago   450MB
# todo-frontend    latest    def456ghi789   5 minutes ago   280MB

# Test backend image locally (optional)
docker run --rm -p 7860:7860 -e DATABASE_URL="your-db-url" -e COHERE_API_KEY="your-key" -e BETTER_AUTH_SECRET="your-secret" todo-backend:latest

# Test frontend image locally (optional)
docker run --rm -p 3000:3000 -e NEXT_PUBLIC_API_URL="http://localhost:7860" todo-frontend:latest
```

---

## Step 3: Configure Secrets

### 3.1 Create Values File

```bash
# Copy example values file
cp phase4/helm/todo-app/values.example.yaml phase4/helm/todo-app/values.yaml

# Edit values.yaml with your secrets
# DO NOT commit this file to git!
```

### 3.2 Fill in Required Secrets

Edit `phase4/helm/todo-app/values.yaml`:

```yaml
secrets:
  # PostgreSQL connection string from Neon
  # Format: postgresql://user:password@host/database?sslmode=require
  databaseUrl: "postgresql://user:pass@ep-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

  # Cohere API key for chatbot
  cohereApiKey: "your-cohere-api-key-here"

  # Better Auth JWT secret (same as Phase II)
  betterAuthSecret: "your-better-auth-secret-here"
```

**Security Note**: Never commit `values.yaml` with real secrets to git. Add to `.gitignore`:

```bash
echo "phase4/helm/todo-app/values.yaml" >> .gitignore
```

---

## Step 4: Deploy with Helm

### 4.1 Install Helm Chart

```bash
# Install the application
helm install todo-app phase4/helm/todo-app -f phase4/helm/todo-app/values.yaml

# Expected output:
# NAME: todo-app
# LAST DEPLOYED: Fri Feb  7 15:30:00 2026
# NAMESPACE: default
# STATUS: deployed
# REVISION: 1
# TEST SUITE: None
# NOTES:
# Thank you for installing todo-app!
#
# Your application is being deployed...
```

### 4.2 Watch Deployment Progress

```bash
# Watch pods starting up
kubectl get pods -w

# Expected progression:
# NAME                             READY   STATUS              RESTARTS   AGE
# todo-backend-xxx-yyy             0/1     ContainerCreating   0          5s
# todo-backend-xxx-zzz             0/1     ContainerCreating   0          5s
# todo-frontend-aaa-bbb            0/1     ContainerCreating   0          5s
# todo-frontend-aaa-ccc            0/1     ContainerCreating   0          5s
# todo-backend-xxx-yyy             0/1     Running             0          15s
# todo-backend-xxx-zzz             0/1     Running             0          15s
# todo-frontend-aaa-bbb            0/1     Running             0          15s
# todo-frontend-aaa-ccc            0/1     Running             0          15s
# todo-backend-xxx-yyy             1/1     Running             0          25s
# todo-backend-xxx-zzz             1/1     Running             0          25s
# todo-frontend-aaa-bbb            1/1     Running             0          25s
# todo-frontend-aaa-ccc            1/1     Running             0          25s

# Press Ctrl+C to stop watching
```

### 4.3 Verify Deployment

```bash
# Check deployment status
helm status todo-app

# Check all resources
kubectl get all -l app=todo-app

# Expected output:
# NAME                                 READY   STATUS    RESTARTS   AGE
# pod/todo-backend-xxx-yyy             1/1     Running   0          2m
# pod/todo-backend-xxx-zzz             1/1     Running   0          2m
# pod/todo-frontend-aaa-bbb            1/1     Running   0          2m
# pod/todo-frontend-aaa-ccc            1/1     Running   0          2m
#
# NAME                    TYPE        CLUSTER-IP      EXTERNAL-IP   PORT(S)          AGE
# service/todo-backend    ClusterIP   10.96.100.50    <none>        7860/TCP         2m
# service/todo-frontend   NodePort    10.96.100.51    <none>        3000:30080/TCP   2m
#
# NAME                            READY   UP-TO-DATE   AVAILABLE   AGE
# deployment.apps/todo-backend    2/2     2            2           2m
# deployment.apps/todo-frontend   2/2     2            2           2m
```

---

## Step 5: Access Application

### 5.1 Get Frontend URL

```bash
# Get the frontend service URL
minikube service todo-frontend --url

# Expected output:
# http://192.168.49.2:30080

# Or use fixed NodePort:
echo "http://$(minikube ip):30080"
```

### 5.2 Open in Browser

```bash
# Open frontend in default browser
minikube service todo-frontend

# Or manually open the URL from step 5.1
```

### 5.3 Test Application

1. **Sign Up / Sign In**: Create account or log in
2. **Create Task**: Add a new task via UI
3. **Test Chatbot**: Open chatbot and try commands:
   - "Add a task to buy groceries"
   - "Show me my tasks"
   - "Mark task 1 as complete"
   - "Delete task 2"
4. **Verify Persistence**: Refresh page, tasks should persist
5. **Check Database**: Verify data in Neon PostgreSQL

---

## Step 6: AI-Assisted Operations (Bonus)

### 6.1 Using kubectl-ai

```bash
# Scale backend deployment
kubectl-ai scale deployment todo-backend to 3 replicas

# Check pod status
kubectl-ai show me the status of all pods in the default namespace

# Get logs from backend
kubectl-ai show me logs from todo-backend deployment

# Describe service
kubectl-ai describe the todo-frontend service
```

### 6.2 Using kagent

```bash
# Analyze deployment health
kagent analyze deployment todo-backend

# Diagnose pod issues
kagent diagnose pod todo-backend-xxx-yyy

# Check resource usage
kagent analyze resource usage for todo-app

# Get optimization suggestions
kagent suggest optimizations for deployment todo-backend
```

### 6.3 Using Gordon

```bash
# Optimize existing images
docker gordon optimize todo-backend:latest

# Get security scan
docker gordon scan todo-backend:latest

# Generate improved Dockerfile
docker gordon improve phase4/docker/backend/Dockerfile
```

**Document all AI commands used in `phase4/CLAUDE.md` for bonus points!**

---

## Step 7: Development Workflow

### 7.1 Make Code Changes

```bash
# Edit application code in phase2/
# Example: Modify phase2/backend/server.py
```

### 7.2 Rebuild Image

```bash
# Ensure using Minikube's Docker daemon
eval $(minikube docker-env)

# Rebuild only the changed service
docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .

# Build time: ~30 seconds with caching
```

### 7.3 Redeploy

```bash
# Upgrade Helm release
helm upgrade todo-app phase4/helm/todo-app --reuse-values

# Watch rollout
kubectl rollout status deployment/todo-backend

# Expected output:
# Waiting for deployment "todo-backend" rollout to finish: 1 old replicas are pending termination...
# Waiting for deployment "todo-backend" rollout to finish: 1 old replicas are pending termination...
# deployment "todo-backend" successfully rolled out
```

### 7.4 Verify Changes

```bash
# Check new pods are running
kubectl get pods -l component=backend

# Test changes in browser
# Refresh application and verify new functionality
```

---

## Step 8: Monitoring and Debugging

### 8.1 View Logs

```bash
# Stream logs from backend
kubectl logs -f deployment/todo-backend

# Stream logs from frontend
kubectl logs -f deployment/todo-frontend

# View logs from specific pod
kubectl logs todo-backend-xxx-yyy

# View logs from all backend pods
kubectl logs -l component=backend --all-containers=true
```

### 8.2 Check Pod Status

```bash
# Describe pod for detailed info
kubectl describe pod todo-backend-xxx-yyy

# Check events
kubectl get events --sort-by='.lastTimestamp'

# Check resource usage
kubectl top pods
```

### 8.3 Debug Container

```bash
# Execute shell in running container
kubectl exec -it todo-backend-xxx-yyy -- /bin/bash

# Inside container:
# - Check environment variables: env
# - Test database connection: python -c "import asyncpg; print('OK')"
# - Check files: ls -la
# - Exit: exit
```

### 8.4 Port Forward (Alternative Access)

```bash
# Forward backend port to localhost
kubectl port-forward deployment/todo-backend 7860:7860

# Access backend at http://localhost:7860

# Forward frontend port to localhost
kubectl port-forward deployment/todo-frontend 3000:3000

# Access frontend at http://localhost:3000
```

---

## Step 9: Troubleshooting

### Common Issues

#### Issue: Pods stuck in "ImagePullBackOff"

**Cause**: Kubernetes trying to pull images from remote registry

**Solution**:
```bash
# Verify imagePullPolicy is set to Never
kubectl get deployment todo-backend -o yaml | grep imagePullPolicy

# If not set, update values.yaml:
# backend.image.pullPolicy: Never
# frontend.image.pullPolicy: Never

# Upgrade deployment
helm upgrade todo-app phase4/helm/todo-app -f phase4/helm/todo-app/values.yaml
```

#### Issue: Pods stuck in "CrashLoopBackOff"

**Cause**: Application failing to start (usually database connection or missing secrets)

**Solution**:
```bash
# Check pod logs for errors
kubectl logs todo-backend-xxx-yyy

# Common errors:
# - "connection refused" → Check DATABASE_URL in secrets
# - "invalid API key" → Check COHERE_API_KEY in secrets
# - "module not found" → Rebuild image with correct dependencies

# Verify secrets exist
kubectl get secret todo-secrets -o yaml

# Decode secret to verify (for debugging only)
kubectl get secret todo-secrets -o jsonpath='{.data.database-url}' | base64 --decode
```

#### Issue: Frontend can't connect to backend

**Cause**: Incorrect NEXT_PUBLIC_API_URL or backend service not ready

**Solution**:
```bash
# Verify backend service exists
kubectl get service todo-backend

# Check backend pods are ready
kubectl get pods -l component=backend

# Verify frontend environment variable
kubectl get deployment todo-frontend -o yaml | grep NEXT_PUBLIC_API_URL

# Should be: http://todo-backend:7860 (not localhost!)
```

#### Issue: "Insufficient memory" error

**Cause**: Minikube doesn't have enough resources

**Solution**:
```bash
# Stop Minikube
minikube stop

# Delete and recreate with more resources
minikube delete
minikube start --memory=6144 --cpus=3

# Or reduce replicas in values.yaml:
# backend.replicas: 1
# frontend.replicas: 1
```

---

## Step 10: Cleanup

### 10.1 Uninstall Application

```bash
# Uninstall Helm release
helm uninstall todo-app

# Expected output:
# release "todo-app" uninstalled

# Verify all resources deleted
kubectl get all -l app=todo-app

# Should return: No resources found
```

### 10.2 Stop Minikube

```bash
# Stop Minikube cluster (preserves state)
minikube stop

# Expected output:
# ✋  Stopping node "minikube"  ...
# 🛑  Powering off "minikube" via SSH ...
# 🛑  1 node stopped.
```

### 10.3 Delete Minikube (Optional)

```bash
# Completely delete Minikube cluster
minikube delete

# Expected output:
# 🔥  Deleting "minikube" in docker ...
# 🔥  Deleting container "minikube" ...
# 🔥  Removing /Users/username/.minikube/machines/minikube ...
# 💀  Removed all traces of the "minikube" cluster.
```

### 10.4 Clean Docker Images (Optional)

```bash
# Remove built images
docker rmi todo-backend:latest
docker rmi todo-frontend:latest

# Clean up dangling images
docker image prune -f
```

---

## Performance Benchmarks

Expected performance metrics:

| Metric | Target | Typical |
|--------|--------|---------|
| Image build time (backend) | < 5 min | 3-4 min (first), 30s (cached) |
| Image build time (frontend) | < 5 min | 5-7 min (first), 1 min (cached) |
| Deployment time | < 3 min | 1-2 min |
| Pod startup time | < 30s | 15-20s |
| Frontend response time | < 500ms | 100-200ms |
| Backend API response time | < 200ms | 50-100ms |
| Chatbot response time | < 3s | 1-2s |
| Memory usage (total) | < 4GB | 2-3GB |
| CPU usage (total) | < 2 cores | 0.5-1 core |

---

## Next Steps

1. **Proceed to `/sp.tasks`**: Generate atomic task breakdown for implementation
2. **Execute tasks**: Use `/sp.implement` to execute tasks with AI assistance
3. **Document AI usage**: Record all Gordon, kubectl-ai, kagent commands in CLAUDE.md
4. **Test thoroughly**: Verify all Phase II functionality works in Kubernetes
5. **Optimize**: Use AI tools to optimize images and resource allocation
6. **Prepare for Phase V**: Document lessons learned for cloud deployment

---

## Additional Resources

- **Minikube Documentation**: https://minikube.sigs.k8s.io/docs/
- **Helm Documentation**: https://helm.sh/docs/
- **Kubernetes Documentation**: https://kubernetes.io/docs/
- **Docker Best Practices**: https://docs.docker.com/develop/dev-best-practices/
- **kubectl-ai GitHub**: https://github.com/sozercan/kubectl-ai
- **kagent GitHub**: https://github.com/kubeshop/kagent
- **Gordon Documentation**: https://docs.docker.com/desktop/extensions/gordon/

---

**Status**: ✅ Quick Start Guide Complete - Ready for Implementation
