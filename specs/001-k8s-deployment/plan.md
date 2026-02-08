# Implementation Plan: Local Container Orchestration for Todo Application

**Branch**: `001-k8s-deployment` | **Date**: 2026-02-07 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-k8s-deployment/spec.md`

**Note**: This template is filled in by the `/sp.plan` command. See `.specify/templates/commands/plan.md` for the execution workflow.

## Summary

Phase IV containerizes the existing Phase II Todo application (FastAPI backend + Next.js frontend with AI chatbot) and deploys it on a local Kubernetes cluster using Minikube. The implementation focuses solely on containerization and orchestration infrastructure without modifying application code. Container images will be built using Docker (with Gordon AI assistance if available), orchestrated using Kubernetes manifests generated via Helm charts (using kubectl-ai/kagent for AI-assisted operations), and deployed to a local Minikube cluster. The application will connect to the existing external Neon PostgreSQL database, with configuration injected via Kubernetes ConfigMaps and Secrets.

## Technical Context

**Language/Version**:
- Backend: Python 3.11 (FastAPI application from Phase II)
- Frontend: Node.js 20 (Next.js application from Phase II)
- Infrastructure: YAML (Kubernetes manifests, Helm charts)

**Primary Dependencies**:
- Container Runtime: Docker Desktop 4.53+ (with Gordon if available)
- Orchestration: Kubernetes 1.28+ (via Minikube)
- Package Manager: Helm 3.x
- AI Tools: kubectl-ai, kagent (for AI-assisted Kubernetes operations)
- Application Dependencies: Inherited from Phase II (FastAPI, Next.js, Cohere SDK, Better Auth)

**Storage**:
- Database: External Neon PostgreSQL (no containerization needed)
- Persistent Volumes: Kubernetes PersistentVolumeClaims for any local state (logs, temp files)
- Configuration: Kubernetes ConfigMaps and Secrets

**Testing**:
- Container Build: Docker build validation
- Image Testing: Local container execution tests
- Deployment Testing: Kubernetes pod health checks, readiness probes
- Integration Testing: End-to-end application functionality in Kubernetes environment
- AI Tool Validation: kubectl-ai/kagent command execution verification

**Target Platform**:
- Local Development: Minikube on Docker Desktop (Windows/macOS/Linux)
- Kubernetes Version: 1.28+
- Container Registry: Local (Minikube's Docker daemon)

**Project Type**: Infrastructure/DevOps (containerization and orchestration layer)

**Performance Goals**:
- Container build time: < 5 minutes per service (backend, frontend)
- Deployment time: < 3 minutes from helm install to ready state
- Service startup: < 30 seconds per pod
- Resource usage: < 4GB RAM, < 2 CPU cores total

**Constraints**:
- No modifications to Phase II application code
- Must use external Neon database (no database container)
- Must work on local development machines (Minikube, not cloud)
- Must support rapid rebuild/redeploy cycles for development
- Must use AI-assisted tools (Gordon, kubectl-ai, kagent) where applicable

**Scale/Scope**:
- Services: 2 containerized services (backend, frontend)
- Replicas: 2 replicas per service for redundancy testing
- Configuration: 3-5 environment variables per service
- Helm Chart: Single chart with 2 deployments, 2 services, 1 configmap, 1 secret

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Phase Isolation (Principle VII)
✅ **PASS**: Phase IV work is isolated in `phase4/` directory with its own specs. Application code remains in `phase2/` unchanged. Clear separation between application logic and infrastructure.

### Tech Stack Compliance (Principle V)
✅ **PASS**: Using explicitly allowed technologies:
- Docker for containerization
- Minikube for local Kubernetes
- Helm for package management
- kubectl-ai/kagent for AI-assisted operations (bonus feature)
- Gordon for Docker AI assistance (bonus feature, optional)

### Spec-Driven Development (Principle I)
✅ **PASS**: Following Specify → Plan → Tasks → Implement workflow. Specification completed in `specs/001-k8s-deployment/spec.md`. This plan document represents the "Plan" phase.

### Zero Manual Coding (Principle II)
✅ **PASS**: All artifacts (Dockerfiles, Helm charts, Kubernetes manifests) will be generated through:
- AI-assisted tools (Gordon for Dockerfiles, kubectl-ai/kagent for Helm charts)
- Template-based generation via Claude Code
- No manual editing of generated infrastructure code

### Reusable Intelligence Priority (Principle IV)
✅ **PASS**: Leveraging AI tools for bonus points:
- Gordon for Docker operations (+200 points potential)
- kubectl-ai/kagent for Kubernetes operations (+200 points potential)
- Creating reusable Helm chart templates as blueprints

### Security & Best Practices (Principle VI)
✅ **PASS**:
- Secrets managed via Kubernetes Secrets (not hardcoded)
- ConfigMaps for non-sensitive configuration
- Health checks and readiness probes
- Resource limits to prevent resource exhaustion

### Documentation Excellence (Principle VIII)
✅ **PASS**: Will include:
- README.md with setup instructions
- CLAUDE.md documenting AI tool usage
- Helm chart documentation
- Gordon/kubectl-ai command examples

**Gate Status**: ✅ ALL GATES PASSED - Proceed to Phase 0 Research

## Project Structure

### Documentation (this feature)

```text
specs/001-k8s-deployment/
├── spec.md              # Feature specification (completed)
├── plan.md              # This file (implementation plan)
├── research.md          # Phase 0: Technology research and decisions
├── data-model.md        # Phase 1: Infrastructure data models (N/A for this feature)
├── quickstart.md        # Phase 1: Quick start guide for deployment
├── contracts/           # Phase 1: API contracts (N/A - reusing Phase II APIs)
└── tasks.md             # Phase 2: Task breakdown (created by /sp.tasks)
```

### Source Code (repository root)

```text
phase4/                          # Phase IV: Local Kubernetes Deployment
├── docker/                      # Docker containerization
│   ├── backend/
│   │   ├── Dockerfile           # Backend container definition
│   │   └── .dockerignore        # Build exclusions
│   ├── frontend/
│   │   ├── Dockerfile           # Frontend container definition
│   │   └── .dockerignore        # Build exclusions
│   └── README.md                # Docker build instructions
│
├── helm/                        # Helm charts
│   └── todo-app/                # Main application chart
│       ├── Chart.yaml           # Chart metadata
│       ├── values.yaml          # Default configuration values
│       ├── templates/
│       │   ├── deployment-backend.yaml
│       │   ├── deployment-frontend.yaml
│       │   ├── service-backend.yaml
│       │   ├── service-frontend.yaml
│       │   ├── configmap.yaml   # Non-sensitive config
│       │   ├── secret.yaml      # Sensitive config (API keys)
│       │   └── _helpers.tpl     # Template helpers
│       └── README.md            # Chart documentation
│
├── scripts/                     # Deployment automation
│   ├── build-images.sh          # Build Docker images
│   ├── deploy.sh                # Deploy to Minikube
│   ├── teardown.sh              # Clean up deployment
│   └── test-deployment.sh       # Validate deployment
│
├── CLAUDE.md                    # AI tool usage documentation
└── README.md                    # Phase IV setup and usage guide
```

**Structure Decision**: Infrastructure-focused layout with clear separation between Docker artifacts (`docker/`), Kubernetes manifests (`helm/`), and automation scripts (`scripts/`). This structure supports the Phase IV goal of containerization and orchestration without touching Phase II application code. All infrastructure code is isolated in `phase4/` directory per Constitution Principle VII.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

No violations detected. All constitution principles are satisfied.

---

## Phase 0: Research & Technology Decisions

**Objective**: Resolve all technical unknowns and establish concrete implementation approach for containerization and Kubernetes deployment.

### Research Tasks

#### R-001: Docker Multi-Stage Build Strategy
**Question**: What is the optimal Dockerfile structure for Next.js frontend to minimize image size and build time?

**Research Focus**:
- Next.js standalone output mode vs full build
- Multi-stage build patterns (builder → runner)
- Node.js base image selection (alpine vs slim)
- Build caching strategies for node_modules

**Decision Criteria**:
- Image size < 500MB
- Build time < 3 minutes
- Supports hot reload for development

#### R-002: Gordon Docker AI Integration
**Question**: How to integrate Gordon for AI-assisted Dockerfile generation and optimization?

**Research Focus**:
- Gordon CLI commands and syntax
- Dockerfile generation from natural language prompts
- Gordon optimization suggestions
- Fallback strategy if Gordon unavailable

**Decision Criteria**:
- Gordon available in Docker Desktop 4.53+
- Can generate production-ready Dockerfiles
- Provides meaningful optimization suggestions

#### R-003: Kubernetes Resource Allocation
**Question**: What are appropriate resource requests and limits for backend and frontend pods?

**Research Focus**:
- FastAPI memory footprint with Cohere SDK
- Next.js SSR memory requirements
- CPU requirements for AI chatbot operations
- Minikube resource constraints on typical dev machines

**Decision Criteria**:
- Total cluster usage < 4GB RAM, < 2 CPU cores
- Pods don't get OOMKilled under normal load
- Supports 2 replicas per service

#### R-004: Helm Chart Generation with kubectl-ai/kagent
**Question**: How to use kubectl-ai and kagent to generate Helm charts from natural language descriptions?

**Research Focus**:
- kubectl-ai chart generation capabilities
- kagent Helm template generation
- Best practices for Helm values.yaml structure
- ConfigMap vs Secret usage patterns

**Decision Criteria**:
- Can generate complete Helm chart from description
- Follows Helm best practices
- Supports environment-specific overrides

#### R-005: Minikube Networking and Service Exposure
**Question**: How to expose frontend service for browser access from host machine?

**Research Focus**:
- NodePort vs LoadBalancer vs Ingress on Minikube
- minikube tunnel vs minikube service commands
- Port forwarding strategies
- DNS resolution for service-to-service communication

**Decision Criteria**:
- Frontend accessible via stable URL (e.g., http://localhost:30080)
- Backend accessible to frontend via Kubernetes service DNS
- Simple setup without complex networking configuration

#### R-006: Database Connection from Kubernetes
**Question**: How to securely connect to external Neon PostgreSQL from Kubernetes pods?

**Research Focus**:
- Kubernetes Secret management for DATABASE_URL
- Connection pooling in containerized environment
- SSL/TLS certificate handling for Neon
- Network egress from Minikube to external services

**Decision Criteria**:
- Secrets not exposed in logs or environment dumps
- Connection stable and performant
- Supports connection string with SSL parameters

#### R-007: Health Checks and Readiness Probes
**Question**: What health check endpoints and probe configurations ensure reliable deployments?

**Research Focus**:
- FastAPI health check endpoint patterns
- Next.js health check implementation
- Kubernetes liveness vs readiness probe differences
- Probe timing parameters (initial delay, period, timeout)

**Decision Criteria**:
- Probes accurately detect service health
- No false positives causing unnecessary restarts
- Fast enough to detect failures within 30 seconds

#### R-008: Development Workflow with Minikube
**Question**: How to optimize rebuild/redeploy cycle for rapid development iteration?

**Research Focus**:
- Using Minikube's Docker daemon vs external registry
- Helm upgrade strategies (--reuse-values vs --reset-values)
- Image pull policy for local development
- Skaffold or similar tools for auto-rebuild

**Decision Criteria**:
- Rebuild single service in < 2 minutes
- No need to push images to external registry
- Changes reflected immediately after helm upgrade

### Research Output Format

Each research task will produce a decision record in `research.md` with:

```markdown
## [Research Task ID]: [Topic]

**Decision**: [What was chosen]

**Rationale**: [Why this approach was selected]

**Alternatives Considered**:
- [Alternative 1]: [Why rejected]
- [Alternative 2]: [Why rejected]

**Implementation Notes**: [Key details for implementation phase]

**References**: [Documentation links, examples, tutorials]
```

---

## Phase 1: Design & Contracts

**Prerequisites**: `research.md` complete with all decisions finalized

### 1.1 Infrastructure Data Models

**File**: `data-model.md`

Since this is an infrastructure feature (not application feature), traditional data models don't apply. Instead, document the infrastructure resource models:

#### Container Image Model
- **Backend Image**: `todo-backend:latest`
  - Base: python:3.11-slim
  - Layers: dependencies, application code
  - Exposed Port: 7860
  - Environment Variables: DATABASE_URL, COHERE_API_KEY, BETTER_AUTH_SECRET

- **Frontend Image**: `todo-frontend:latest`
  - Base: node:20-alpine
  - Layers: dependencies, Next.js build, standalone output
  - Exposed Port: 3000
  - Environment Variables: NEXT_PUBLIC_API_URL

#### Kubernetes Resource Model
- **Deployment**: Defines pod template, replicas, update strategy
- **Service**: Exposes pods via stable DNS name and port
- **ConfigMap**: Non-sensitive configuration (API URLs, feature flags)
- **Secret**: Sensitive configuration (database credentials, API keys)
- **PersistentVolumeClaim**: Storage for logs or temporary files (if needed)

#### Helm Chart Model
- **Chart.yaml**: Metadata (name, version, description)
- **values.yaml**: Configurable parameters
  - `backend.replicas`: Number of backend pods (default: 2)
  - `backend.image.tag`: Backend image tag (default: latest)
  - `frontend.replicas`: Number of frontend pods (default: 2)
  - `frontend.image.tag`: Frontend image tag (default: latest)
  - `database.url`: External database connection string
  - `secrets.cohereApiKey`: Cohere API key
  - `secrets.betterAuthSecret`: Better Auth secret

### 1.2 API Contracts

**Directory**: `contracts/`

**Status**: N/A - Reusing Phase II API contracts

Phase IV does not introduce new APIs. The application APIs (REST endpoints for tasks, authentication, chatbot) are defined in Phase II and remain unchanged. The only "contracts" are:

- **Container Interface Contract**: Dockerfiles must produce images that expose correct ports and accept environment variables as documented
- **Kubernetes Service Contract**: Services must route traffic to correct pod ports
- **Health Check Contract**: Pods must respond to health check probes at defined endpoints

These contracts will be documented in `quickstart.md` rather than separate contract files.

### 1.3 Quick Start Guide

**File**: `quickstart.md`

**Content Structure**:

1. **Prerequisites**
   - Docker Desktop 4.53+ installed and running
   - Minikube installed
   - Helm 3.x installed
   - kubectl installed
   - kubectl-ai and kagent installed (optional, for AI-assisted operations)
   - Phase II application code available in `phase2/` directory

2. **Environment Setup**
   - Start Minikube: `minikube start --memory=4096 --cpus=2`
   - Configure kubectl context: `kubectl config use-context minikube`
   - Verify cluster: `kubectl cluster-info`

3. **Build Container Images**
   - Option A (with Gordon): `gordon build phase4/docker/backend/Dockerfile -t todo-backend:latest`
   - Option B (standard Docker): `docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .`
   - Repeat for frontend
   - Use Minikube's Docker daemon: `eval $(minikube docker-env)`

4. **Configure Secrets**
   - Copy `phase4/helm/todo-app/values.example.yaml` to `values.yaml`
   - Fill in: `database.url`, `secrets.cohereApiKey`, `secrets.betterAuthSecret`

5. **Deploy with Helm**
   - Install chart: `helm install todo-app phase4/helm/todo-app -f values.yaml`
   - Watch deployment: `kubectl get pods -w`
   - Check status: `helm status todo-app`

6. **Access Application**
   - Get frontend URL: `minikube service todo-frontend --url`
   - Open in browser: `http://localhost:30080` (or returned URL)
   - Test chatbot functionality

7. **AI-Assisted Operations (Bonus)**
   - Scale with kubectl-ai: `kubectl-ai scale deployment todo-backend to 3 replicas`
   - Check health with kagent: `kagent analyze pod health for todo-app`
   - Optimize with Gordon: `gordon optimize todo-backend:latest`

8. **Development Workflow**
   - Make code changes in `phase2/`
   - Rebuild image: `docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .`
   - Upgrade deployment: `helm upgrade todo-app phase4/helm/todo-app`
   - Verify changes: `kubectl rollout status deployment/todo-backend`

9. **Troubleshooting**
   - View logs: `kubectl logs -f deployment/todo-backend`
   - Describe pod: `kubectl describe pod <pod-name>`
   - Check events: `kubectl get events --sort-by='.lastTimestamp'`
   - Use kagent: `kagent diagnose deployment todo-backend`

10. **Cleanup**
    - Uninstall: `helm uninstall todo-app`
    - Stop Minikube: `minikube stop`
    - Delete cluster: `minikube delete`

### 1.4 Agent Context Update

**Action**: Run agent context update script

```bash
powershell.exe -ExecutionPolicy Bypass -File .specify/scripts/powershell/update-agent-context.ps1 -AgentType claude
```

**Technologies to Add**:
- Docker (containerization)
- Kubernetes (orchestration)
- Minikube (local cluster)
- Helm (package management)
- kubectl-ai (AI-assisted Kubernetes operations)
- kagent (Kubernetes agent for diagnostics)
- Gordon (Docker AI assistant)

**Context Additions**:
- Phase IV focuses on infrastructure, not application code
- All application code in `phase2/` remains unchanged
- Infrastructure artifacts in `phase4/` directory
- Use AI tools (Gordon, kubectl-ai, kagent) for bonus points
- External Neon database (no database container)

---

## Phase 2: Task Breakdown

**Status**: NOT CREATED BY THIS COMMAND

Task breakdown will be generated by the `/sp.tasks` command after this plan is approved. The tasks will be derived from:

1. Research decisions in `research.md`
2. Infrastructure models in `data-model.md`
3. Quick start steps in `quickstart.md`
4. Functional requirements from `spec.md`

Expected task categories:
- Docker image creation (backend, frontend)
- Helm chart generation
- Minikube cluster setup
- Deployment and testing
- AI tool integration (Gordon, kubectl-ai, kagent)
- Documentation and validation

---

## Implementation Notes

### Critical Path
1. Research → Dockerfile strategy, Helm chart structure, Minikube networking
2. Design → Infrastructure models, quick start guide
3. Tasks → Atomic implementation steps
4. Implement → Generate artifacts, deploy, validate

### Dependencies
- Phase II application must be functional (prerequisite)
- Docker Desktop with Gordon (optional but preferred)
- Minikube and Helm installed locally
- kubectl-ai and kagent installed (optional, for bonus points)

### Risk Mitigation
- **Risk**: Gordon not available → **Mitigation**: Standard Docker CLI fallback
- **Risk**: kubectl-ai/kagent not working → **Mitigation**: Standard kubectl/helm commands
- **Risk**: Minikube resource constraints → **Mitigation**: Reduce replicas to 1, optimize resource limits
- **Risk**: External database connectivity issues → **Mitigation**: Test connection before deployment, document SSL requirements

### Success Validation
- [ ] Docker images build successfully (< 5 minutes each)
- [ ] Helm chart installs without errors
- [ ] All pods reach Ready state (< 3 minutes)
- [ ] Frontend accessible via browser
- [ ] Backend API responds to health checks
- [ ] Chatbot functionality works end-to-end
- [ ] Database connection stable
- [ ] AI tools (Gordon, kubectl-ai, kagent) used and documented
- [ ] Resource usage within limits (< 4GB RAM, < 2 CPU cores)

---

## Next Steps

1. **Review this plan** for completeness and accuracy
2. **Execute Phase 0**: Create `research.md` by researching all R-001 through R-008 topics
3. **Execute Phase 1**: Create `data-model.md` and `quickstart.md` based on research decisions
4. **Run agent context update**: Add Phase IV technologies to Claude's context
5. **Proceed to `/sp.tasks`**: Generate atomic task breakdown for implementation
6. **Implement via `/sp.implement`**: Execute tasks using AI-assisted tools

**Plan Status**: ✅ COMPLETE - Ready for Phase 0 Research
