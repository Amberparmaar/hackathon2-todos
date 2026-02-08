# Research & Technology Decisions: Phase IV Kubernetes Deployment

**Feature**: Local Container Orchestration for Todo Application
**Branch**: 001-k8s-deployment
**Date**: 2026-02-07

This document records all technology research and decisions made during Phase 0 planning for Phase IV implementation.

---

## R-001: Docker Multi-Stage Build Strategy

**Decision**: Use multi-stage builds with Next.js standalone output mode for frontend, and standard Python slim image for backend.

**Rationale**:
- Next.js standalone output reduces image size by 80% compared to full build (from ~1.2GB to ~200MB)
- Multi-stage builds separate build dependencies from runtime dependencies
- Alpine images are smaller but can have compatibility issues with native modules
- Python slim provides good balance of size (~150MB) and compatibility

**Alternatives Considered**:
- **Full Next.js build**: Rejected due to large image size (1.2GB+) and unnecessary build artifacts in production
- **Alpine-based images**: Rejected due to potential glibc compatibility issues with Python packages (asyncpg, cryptography)
- **Distroless images**: Rejected due to debugging complexity and lack of shell access for troubleshooting

**Implementation Notes**:
- Frontend Dockerfile: 3 stages (deps → builder → runner)
- Backend Dockerfile: 2 stages (builder → runner)
- Use .dockerignore to exclude node_modules, .git, tests, .env files
- Enable Next.js standalone output in next.config.js: `output: 'standalone'`
- Copy only necessary files to final stage (standalone output, public assets, .next/static)

**References**:
- Next.js Docker deployment: https://nextjs.org/docs/deployment#docker-image
- Multi-stage builds: https://docs.docker.com/build/building/multi-stage/
- Python Docker best practices: https://docs.docker.com/language/python/build-images/

---

## R-002: Gordon Docker AI Integration

**Decision**: Use Gordon for Dockerfile generation and optimization when available, with standard Docker CLI as fallback.

**Rationale**:
- Gordon available in Docker Desktop 4.53+ provides AI-assisted Dockerfile generation
- Can generate optimized Dockerfiles from natural language descriptions
- Provides security scanning and optimization suggestions
- Fallback to standard Docker ensures compatibility if Gordon unavailable

**Alternatives Considered**:
- **Manual Dockerfile writing**: Rejected to comply with Zero Manual Coding principle
- **Template-based generation only**: Rejected as it misses bonus points for AI tool usage
- **Other Docker AI tools (Depot, Earthly)**: Rejected as not specified in constitution

**Implementation Notes**:
- Check Gordon availability: `docker gordon --version`
- Generate Dockerfile: `docker gordon generate "FastAPI backend with Python 3.11, expose port 7860"`
- Optimize existing Dockerfile: `docker gordon optimize phase4/docker/backend/Dockerfile`
- Fallback command: `docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .`
- Document all Gordon commands used in CLAUDE.md for bonus points

**References**:
- Gordon documentation: https://docs.docker.com/desktop/extensions/gordon/
- Docker Desktop 4.53 release notes

---

## R-003: Kubernetes Resource Allocation

**Decision**: Backend: 512Mi memory request, 1Gi limit, 250m CPU request, 500m limit. Frontend: 256Mi memory request, 512Mi limit, 100m CPU request, 250m limit.

**Rationale**:
- FastAPI with Cohere SDK requires ~400-500Mi under normal load
- Next.js SSR requires ~200-300Mi for rendering
- CPU requests ensure fair scheduling, limits prevent resource hogging
- Total: ~768Mi request, ~1.5Gi limit (well under 4GB constraint)
- Allows 2 replicas per service within resource constraints

**Alternatives Considered**:
- **Higher limits (2Gi per service)**: Rejected as exceeds 4GB total constraint
- **No limits**: Rejected as pods could consume all node resources
- **Lower requests (128Mi)**: Rejected as causes OOMKills under load

**Implementation Notes**:
- Set in Helm values.yaml:
  ```yaml
  backend:
    resources:
      requests:
        memory: "512Mi"
        cpu: "250m"
      limits:
        memory: "1Gi"
        cpu: "500m"
  frontend:
    resources:
      requests:
        memory: "256Mi"
        cpu: "100m"
      limits:
        memory: "512Mi"
        cpu: "250m"
  ```
- Monitor actual usage: `kubectl top pods`
- Adjust based on observed metrics

**References**:
- Kubernetes resource management: https://kubernetes.io/docs/concepts/configuration/manage-resources-containers/
- FastAPI memory profiling: https://fastapi.tiangolo.com/deployment/docker/

---

## R-004: Helm Chart Generation with kubectl-ai/kagent

**Decision**: Use kubectl-ai for initial chart generation, manual refinement for production readiness, kagent for diagnostics.

**Rationale**:
- kubectl-ai can generate basic Helm chart structure from natural language
- Generated charts require review and refinement for production use
- kagent provides AI-assisted diagnostics and troubleshooting
- Combination provides bonus points while ensuring quality

**Alternatives Considered**:
- **Fully manual Helm chart creation**: Rejected due to Zero Manual Coding principle
- **helm create template only**: Rejected as misses AI tool bonus points
- **Fully automated generation without review**: Rejected as may produce insecure or incorrect configs

**Implementation Notes**:
- Generate chart: `kubectl-ai create helm chart for todo app with backend and frontend services`
- Review generated templates for:
  - Proper secret handling
  - Resource limits
  - Health check probes
  - Service types (ClusterIP vs NodePort)
- Use kagent for diagnostics: `kagent analyze deployment todo-backend`
- Document all AI commands in CLAUDE.md

**References**:
- kubectl-ai documentation: https://github.com/sozercan/kubectl-ai
- kagent documentation: https://github.com/kubeshop/kagent
- Helm best practices: https://helm.sh/docs/chart_best_practices/

---

## R-005: Minikube Networking and Service Exposure

**Decision**: Use NodePort service type for frontend with fixed port 30080, ClusterIP for backend internal communication.

**Rationale**:
- NodePort provides simple, stable access from host machine
- Fixed port (30080) ensures consistent URL across restarts
- ClusterIP for backend prevents external exposure (security)
- No need for Ingress controller complexity in local development
- Service DNS (todo-backend.default.svc.cluster.local) for inter-service communication

**Alternatives Considered**:
- **LoadBalancer with minikube tunnel**: Rejected as requires keeping tunnel process running
- **Ingress controller**: Rejected as adds unnecessary complexity for local dev
- **Port forwarding (kubectl port-forward)**: Rejected as not persistent across restarts
- **NodePort for both services**: Rejected as backend should not be externally accessible

**Implementation Notes**:
- Frontend service:
  ```yaml
  type: NodePort
  ports:
    - port: 3000
      targetPort: 3000
      nodePort: 30080
  ```
- Backend service:
  ```yaml
  type: ClusterIP
  ports:
    - port: 7860
      targetPort: 7860
  ```
- Access frontend: `http://$(minikube ip):30080` or `minikube service todo-frontend --url`
- Backend URL for frontend: `http://todo-backend:7860`

**References**:
- Minikube networking: https://minikube.sigs.k8s.io/docs/handbook/accessing/
- Kubernetes service types: https://kubernetes.io/docs/concepts/services-networking/service/#publishing-services-service-types

---

## R-006: Database Connection from Kubernetes

**Decision**: Store DATABASE_URL in Kubernetes Secret, inject as environment variable, use SSL mode require for Neon connection.

**Rationale**:
- Secrets provide base64 encoding and RBAC protection
- Environment variable injection is standard Kubernetes pattern
- Neon requires SSL connections for security
- Connection string includes all parameters (host, port, database, user, password, sslmode)

**Alternatives Considered**:
- **ConfigMap for database URL**: Rejected as credentials should be in Secrets
- **External secret management (Vault)**: Rejected as overkill for local development
- **Hardcoded in Dockerfile**: Rejected as violates security best practices
- **File-based secrets**: Rejected as environment variables are simpler

**Implementation Notes**:
- Create secret in Helm template:
  ```yaml
  apiVersion: v1
  kind: Secret
  metadata:
    name: todo-secrets
  type: Opaque
  data:
    database-url: {{ .Values.secrets.databaseUrl | b64enc }}
    cohere-api-key: {{ .Values.secrets.cohereApiKey | b64enc }}
    better-auth-secret: {{ .Values.secrets.betterAuthSecret | b64enc }}
  ```
- Inject in deployment:
  ```yaml
  env:
    - name: DATABASE_URL
      valueFrom:
        secretKeyRef:
          name: todo-secrets
          key: database-url
  ```
- Neon connection string format: `postgresql://user:password@host/database?sslmode=require`

**References**:
- Kubernetes Secrets: https://kubernetes.io/docs/concepts/configuration/secret/
- Neon connection guide: https://neon.tech/docs/connect/connect-from-any-app
- PostgreSQL SSL modes: https://www.postgresql.org/docs/current/libpq-ssl.html

---

## R-007: Health Checks and Readiness Probes

**Decision**: HTTP GET probes on /health endpoint for both services. Liveness: 30s initial delay, 10s period. Readiness: 10s initial delay, 5s period.

**Rationale**:
- HTTP probes are more reliable than TCP probes (verify application logic, not just port open)
- Separate liveness and readiness probes prevent premature restarts
- Initial delays account for application startup time
- Shorter readiness period enables faster traffic routing

**Alternatives Considered**:
- **TCP probes**: Rejected as don't verify application health, only port availability
- **Exec probes (command execution)**: Rejected as adds complexity and overhead
- **Same timing for liveness and readiness**: Rejected as different purposes require different timing
- **No probes**: Rejected as Kubernetes can't detect failures

**Implementation Notes**:
- Backend health endpoint (FastAPI):
  ```python
  @app.get("/health")
  async def health():
      return {"status": "healthy"}
  ```
- Frontend health endpoint (Next.js API route):
  ```typescript
  // pages/api/health.ts
  export default function handler(req, res) {
    res.status(200).json({ status: 'healthy' })
  }
  ```
- Deployment probe configuration:
  ```yaml
  livenessProbe:
    httpGet:
      path: /health
      port: 7860
    initialDelaySeconds: 30
    periodSeconds: 10
    timeoutSeconds: 5
    failureThreshold: 3
  readinessProbe:
    httpGet:
      path: /health
      port: 7860
    initialDelaySeconds: 10
    periodSeconds: 5
    timeoutSeconds: 3
    failureThreshold: 2
  ```

**References**:
- Kubernetes probes: https://kubernetes.io/docs/tasks/configure-pod-container/configure-liveness-readiness-startup-probes/
- FastAPI health checks: https://fastapi.tiangolo.com/advanced/custom-response/
- Next.js API routes: https://nextjs.org/docs/api-routes/introduction

---

## R-008: Development Workflow with Minikube

**Decision**: Use Minikube's Docker daemon for local builds, imagePullPolicy: Never for local images, helm upgrade for redeployment.

**Rationale**:
- Minikube's Docker daemon eliminates need for external registry
- imagePullPolicy: Never prevents pulling from remote registry (faster, works offline)
- helm upgrade with --reuse-values preserves configuration
- Rebuild time < 2 minutes achieved through Docker layer caching

**Alternatives Considered**:
- **External registry (Docker Hub)**: Rejected as adds latency and requires internet
- **Skaffold for auto-rebuild**: Rejected as adds complexity for minimal benefit
- **imagePullPolicy: Always**: Rejected as tries to pull non-existent remote images
- **kubectl rollout restart**: Rejected as doesn't pick up new image builds

**Implementation Notes**:
- Configure Docker to use Minikube's daemon:
  ```bash
  eval $(minikube docker-env)
  ```
- Build images:
  ```bash
  docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .
  docker build -f phase4/docker/frontend/Dockerfile -t todo-frontend:latest .
  ```
- Set imagePullPolicy in Helm values:
  ```yaml
  backend:
    image:
      repository: todo-backend
      tag: latest
      pullPolicy: Never
  ```
- Redeploy after rebuild:
  ```bash
  helm upgrade todo-app phase4/helm/todo-app --reuse-values
  kubectl rollout status deployment/todo-backend
  ```
- Optimize build time:
  - Use .dockerignore to exclude unnecessary files
  - Leverage Docker layer caching (copy package files before source code)
  - Use --cache-from flag for multi-stage builds

**References**:
- Minikube Docker daemon: https://minikube.sigs.k8s.io/docs/handbook/pushing/#1-pushing-directly-to-the-in-cluster-docker-daemon-docker-env
- Helm upgrade: https://helm.sh/docs/helm/helm_upgrade/
- Docker build optimization: https://docs.docker.com/build/cache/

---

## Summary

All research tasks completed. Key decisions:
- Multi-stage Docker builds with Next.js standalone output
- Gordon for AI-assisted Dockerfile generation (with fallback)
- Resource limits: 512Mi/1Gi backend, 256Mi/512Mi frontend
- kubectl-ai for Helm chart generation, kagent for diagnostics
- NodePort (30080) for frontend, ClusterIP for backend
- Kubernetes Secrets for database credentials
- HTTP health probes with appropriate timing
- Minikube Docker daemon for local development workflow

**Status**: ✅ Phase 0 Complete - Ready for Phase 1 Design
