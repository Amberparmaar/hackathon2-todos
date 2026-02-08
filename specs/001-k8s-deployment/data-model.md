# Infrastructure Data Models: Phase IV Kubernetes Deployment

**Feature**: Local Container Orchestration for Todo Application
**Branch**: 001-k8s-deployment
**Date**: 2026-02-07

This document defines the infrastructure resource models for Phase IV containerization and Kubernetes deployment. Unlike application data models, these models describe container images, Kubernetes resources, and deployment configurations.

---

## Container Image Models

### Backend Container Image

**Image Name**: `todo-backend:latest`

**Base Image**: `python:3.11-slim`

**Build Stages**:
1. **Builder Stage**: Install dependencies
   - Copy requirements.txt
   - Install Python packages
   - No source code (for layer caching)

2. **Runner Stage**: Application runtime
   - Copy installed packages from builder
   - Copy application source code from phase2/backend/
   - Set working directory to /app
   - Expose port 7860

**Exposed Ports**:
- 7860 (HTTP) - FastAPI application server

**Environment Variables**:
- `DATABASE_URL` (required) - PostgreSQL connection string with SSL
- `COHERE_API_KEY` (required) - Cohere API key for chatbot
- `BETTER_AUTH_SECRET` (required) - Better Auth JWT secret
- `PORT` (optional, default: 7860) - Server port
- `PYTHONUNBUFFERED` (set to 1) - Disable Python output buffering

**Volume Mounts**: None (stateless application)

**Health Check**:
- Endpoint: GET /health
- Expected Response: 200 OK with JSON {"status": "healthy"}

**Resource Requirements**:
- Memory Request: 512Mi
- Memory Limit: 1Gi
- CPU Request: 250m (0.25 cores)
- CPU Limit: 500m (0.5 cores)

**Build Context**: Repository root (to access phase2/backend/)

**Dockerfile Location**: `phase4/docker/backend/Dockerfile`

---

### Frontend Container Image

**Image Name**: `todo-frontend:latest`

**Base Image**: `node:20-alpine`

**Build Stages**:
1. **Dependencies Stage**: Install node_modules
   - Copy package.json and package-lock.json
   - Run npm ci --only=production
   - Separate stage for caching

2. **Builder Stage**: Build Next.js application
   - Copy dependencies from deps stage
   - Copy source code from phase2/frontend/
   - Run npm run build
   - Generate standalone output

3. **Runner Stage**: Production runtime
   - Copy standalone output from builder
   - Copy public assets and .next/static
   - Create non-root user (nextjs:nodejs)
   - Set NODE_ENV=production

**Exposed Ports**:
- 3000 (HTTP) - Next.js application server

**Environment Variables**:
- `NEXT_PUBLIC_API_URL` (required) - Backend API URL (http://todo-backend:7860)
- `NODE_ENV` (set to production) - Node environment
- `PORT` (optional, default: 3000) - Server port

**Volume Mounts**: None (stateless application)

**Health Check**:
- Endpoint: GET /api/health
- Expected Response: 200 OK with JSON {"status": "healthy"}

**Resource Requirements**:
- Memory Request: 256Mi
- Memory Limit: 512Mi
- CPU Request: 100m (0.1 cores)
- CPU Limit: 250m (0.25 cores)

**Build Context**: Repository root (to access phase2/frontend/)

**Dockerfile Location**: `phase4/docker/frontend/Dockerfile`

---

## Kubernetes Resource Models

### Deployment Resource

**Purpose**: Manages pod replicas, rolling updates, and pod template specification

**Backend Deployment** (`todo-backend`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-backend
  labels:
    app: todo-app
    component: backend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-app
      component: backend
  template:
    metadata:
      labels:
        app: todo-app
        component: backend
    spec:
      containers:
      - name: backend
        image: todo-backend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 7860
        env:
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: database-url
        - name: COHERE_API_KEY
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: cohere-api-key
        - name: BETTER_AUTH_SECRET
          valueFrom:
            secretKeyRef:
              name: todo-secrets
              key: better-auth-secret
        resources:
          requests:
            memory: "512Mi"
            cpu: "250m"
          limits:
            memory: "1Gi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 7860
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /health
            port: 7860
          initialDelaySeconds: 10
          periodSeconds: 5
```

**Frontend Deployment** (`todo-frontend`):
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: todo-frontend
  labels:
    app: todo-app
    component: frontend
spec:
  replicas: 2
  selector:
    matchLabels:
      app: todo-app
      component: frontend
  template:
    metadata:
      labels:
        app: todo-app
        component: frontend
    spec:
      containers:
      - name: frontend
        image: todo-frontend:latest
        imagePullPolicy: Never
        ports:
        - containerPort: 3000
        env:
        - name: NEXT_PUBLIC_API_URL
          value: "http://todo-backend:7860"
        resources:
          requests:
            memory: "256Mi"
            cpu: "100m"
          limits:
            memory: "512Mi"
            cpu: "250m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
```

---

### Service Resource

**Purpose**: Provides stable network endpoint for pod access

**Backend Service** (`todo-backend`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-backend
  labels:
    app: todo-app
    component: backend
spec:
  type: ClusterIP
  selector:
    app: todo-app
    component: backend
  ports:
  - port: 7860
    targetPort: 7860
    protocol: TCP
    name: http
```

**DNS Name**: `todo-backend.default.svc.cluster.local` (or `todo-backend` within same namespace)

**Frontend Service** (`todo-frontend`):
```yaml
apiVersion: v1
kind: Service
metadata:
  name: todo-frontend
  labels:
    app: todo-app
    component: frontend
spec:
  type: NodePort
  selector:
    app: todo-app
    component: frontend
  ports:
  - port: 3000
    targetPort: 3000
    nodePort: 30080
    protocol: TCP
    name: http
```

**Access URL**: `http://<minikube-ip>:30080` or via `minikube service todo-frontend --url`

---

### ConfigMap Resource

**Purpose**: Store non-sensitive configuration data

**ConfigMap** (`todo-config`):
```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: todo-config
  labels:
    app: todo-app
data:
  BACKEND_URL: "http://todo-backend:7860"
  FRONTEND_URL: "http://todo-frontend:3000"
  LOG_LEVEL: "info"
```

**Usage**: Optional - currently all config via environment variables or Secrets

---

### Secret Resource

**Purpose**: Store sensitive configuration data (base64 encoded)

**Secret** (`todo-secrets`):
```yaml
apiVersion: v1
kind: Secret
metadata:
  name: todo-secrets
  labels:
    app: todo-app
type: Opaque
data:
  database-url: <base64-encoded-connection-string>
  cohere-api-key: <base64-encoded-api-key>
  better-auth-secret: <base64-encoded-secret>
```

**Keys**:
- `database-url`: PostgreSQL connection string (format: `postgresql://user:pass@host/db?sslmode=require`)
- `cohere-api-key`: Cohere API key for AI chatbot
- `better-auth-secret`: JWT signing secret for authentication

**Security Notes**:
- Never commit actual secrets to git
- Use Helm values.yaml for secret injection
- Secrets are base64 encoded (not encrypted) - use RBAC for access control

---

## Helm Chart Model

### Chart Metadata

**Chart.yaml**:
```yaml
apiVersion: v2
name: todo-app
description: Todo application with AI chatbot - Phase IV Kubernetes deployment
type: application
version: 1.0.0
appVersion: "1.0.0"
keywords:
  - todo
  - chatbot
  - fastapi
  - nextjs
maintainers:
  - name: Phase IV Team
```

---

### Values Schema

**values.yaml** (default configuration):
```yaml
# Backend configuration
backend:
  replicas: 2
  image:
    repository: todo-backend
    tag: latest
    pullPolicy: Never
  resources:
    requests:
      memory: "512Mi"
      cpu: "250m"
    limits:
      memory: "1Gi"
      cpu: "500m"
  service:
    type: ClusterIP
    port: 7860

# Frontend configuration
frontend:
  replicas: 2
  image:
    repository: todo-frontend
    tag: latest
    pullPolicy: Never
  resources:
    requests:
      memory: "256Mi"
      cpu: "100m"
    limits:
      memory: "512Mi"
      cpu: "250m"
  service:
    type: NodePort
    port: 3000
    nodePort: 30080

# Secrets (must be provided via values override)
secrets:
  databaseUrl: ""  # Required: PostgreSQL connection string
  cohereApiKey: ""  # Required: Cohere API key
  betterAuthSecret: ""  # Required: Better Auth secret

# Health check configuration
healthCheck:
  liveness:
    initialDelaySeconds: 30
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
  readiness:
    initialDelaySeconds: 10
    periodSeconds: 5
    timeoutSeconds: 3
    failureThreshold: 2
```

---

### Template Helpers

**_helpers.tpl** (Helm template functions):
```yaml
{{/*
Expand the name of the chart.
*/}}
{{- define "todo-app.name" -}}
{{- default .Chart.Name .Values.nameOverride | trunc 63 | trimSuffix "-" }}
{{- end }}

{{/*
Create a default fully qualified app name.
*/}}
{{- define "todo-app.fullname" -}}
{{- if .Values.fullnameOverride }}
{{- .Values.fullnameOverride | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- $name := default .Chart.Name .Values.nameOverride }}
{{- if contains $name .Release.Name }}
{{- .Release.Name | trunc 63 | trimSuffix "-" }}
{{- else }}
{{- printf "%s-%s" .Release.Name $name | trunc 63 | trimSuffix "-" }}
{{- end }}
{{- end }}
{{- end }}

{{/*
Common labels
*/}}
{{- define "todo-app.labels" -}}
helm.sh/chart: {{ include "todo-app.chart" . }}
{{ include "todo-app.selectorLabels" . }}
{{- if .Chart.AppVersion }}
app.kubernetes.io/version: {{ .Chart.AppVersion | quote }}
{{- end }}
app.kubernetes.io/managed-by: {{ .Release.Service }}
{{- end }}

{{/*
Selector labels
*/}}
{{- define "todo-app.selectorLabels" -}}
app.kubernetes.io/name: {{ include "todo-app.name" . }}
app.kubernetes.io/instance: {{ .Release.Name }}
{{- end }}
```

---

## Resource Relationships

```
Helm Chart (todo-app)
├── Deployment: todo-backend
│   ├── ReplicaSet (managed by Deployment)
│   │   └── Pods (2 replicas)
│   │       └── Container: backend
│   │           ├── Image: todo-backend:latest
│   │           ├── Env from Secret: todo-secrets
│   │           └── Health Probes: /health
│   └── Service: todo-backend (ClusterIP)
│       └── Exposes: port 7860
│
├── Deployment: todo-frontend
│   ├── ReplicaSet (managed by Deployment)
│   │   └── Pods (2 replicas)
│   │       └── Container: frontend
│   │           ├── Image: todo-frontend:latest
│   │           ├── Env: NEXT_PUBLIC_API_URL
│   │           └── Health Probes: /api/health
│   └── Service: todo-frontend (NodePort)
│       └── Exposes: port 3000 → nodePort 30080
│
└── Secret: todo-secrets
    ├── database-url
    ├── cohere-api-key
    └── better-auth-secret
```

---

## Deployment Flow

1. **Build Phase**: Docker images built locally using Minikube's Docker daemon
2. **Configuration Phase**: Secrets created from Helm values
3. **Deployment Phase**: Helm creates Deployments, Services, Secrets
4. **Scheduling Phase**: Kubernetes schedules pods on Minikube node
5. **Startup Phase**: Containers start, health probes begin
6. **Ready Phase**: Pods pass readiness probes, added to Service endpoints
7. **Running Phase**: Application accessible via NodePort (frontend) and ClusterIP (backend)

---

## Summary

Infrastructure models defined for:
- 2 container images (backend, frontend) with multi-stage builds
- 2 Kubernetes Deployments with 2 replicas each
- 2 Kubernetes Services (ClusterIP for backend, NodePort for frontend)
- 1 Kubernetes Secret for sensitive configuration
- 1 Helm Chart packaging all resources with configurable values

Total resource allocation: ~1.5Gi memory, ~0.7 CPU cores (within 4GB/2CPU constraint)

**Status**: ✅ Phase 1.1 Complete - Infrastructure models documented
