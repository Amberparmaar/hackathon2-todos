# Tasks: Local Container Orchestration for Todo Application

**Input**: Design documents from `/specs/001-k8s-deployment/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, quickstart.md

**Tests**: Not explicitly requested in specification - focusing on deployment validation and integration testing

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each deployment capability.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

Phase IV uses infrastructure-focused layout:
- **Docker artifacts**: `phase4/docker/backend/`, `phase4/docker/frontend/`
- **Helm charts**: `phase4/helm/todo-app/`
- **Scripts**: `phase4/scripts/`
- **Documentation**: `phase4/README.md`, `phase4/CLAUDE.md`

---

## Phase 1: Setup (Infrastructure Initialization)

**Purpose**: Verify prerequisites and initialize Phase IV project structure

- [ ] T001 Verify Phase II application is functional locally (frontend at http://localhost:3000, backend at http://localhost:7860)
- [ ] T002 Check Docker Desktop version >= 4.53 is installed and running
- [ ] T003 [P] Check Minikube is installed (minikube version)
- [ ] T004 [P] Check Helm 3.x is installed (helm version)
- [ ] T005 [P] Check kubectl is installed (kubectl version --client)
- [ ] T006 [P] Check kubectl-ai is installed (optional, kubectl-ai --version)
- [ ] T007 [P] Check kagent is installed (optional, kagent version)
- [ ] T008 Verify Gordon is available in Docker Desktop (docker gordon --version) or document fallback to standard Docker CLI
- [ ] T009 Create phase4/ directory structure: docker/, helm/, scripts/
- [ ] T010 [P] Create phase4/docker/backend/ directory
- [ ] T011 [P] Create phase4/docker/frontend/ directory
- [ ] T012 [P] Create phase4/helm/todo-app/ directory with subdirectories (templates/, charts/)
- [ ] T013 [P] Create phase4/scripts/ directory for automation scripts

**Checkpoint**: Phase IV project structure created, all required tools verified

---

## Phase 2: Foundational (Container Images & Helm Chart Structure)

**Purpose**: Core infrastructure that MUST be complete before ANY user story deployment can be implemented

**⚠️ CRITICAL**: No deployment work can begin until container images and Helm chart structure are ready

### Docker Image Creation

- [ ] T014 [P] Create .dockerignore for backend in phase4/docker/backend/.dockerignore (exclude node_modules, .git, tests, .env)
- [ ] T015 [P] Create .dockerignore for frontend in phase4/docker/frontend/.dockerignore (exclude node_modules, .git, .next, .env)
- [ ] T016 Generate backend Dockerfile using Gordon: "FastAPI backend with Python 3.11, multi-stage build, copy from phase2/backend, expose port 7860" in phase4/docker/backend/Dockerfile (or use standard Docker if Gordon unavailable)
- [ ] T017 Generate frontend Dockerfile using Gordon: "Next.js frontend with Node 20, multi-stage build with standalone output, copy from phase2/frontend, expose port 3000" in phase4/docker/frontend/Dockerfile (or use standard Docker if Gordon unavailable)
- [ ] T018 Configure Minikube to use local Docker daemon (eval $(minikube docker-env))
- [ ] T019 Build backend Docker image: docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .
- [ ] T020 Build frontend Docker image: docker build -f phase4/docker/frontend/Dockerfile -t todo-frontend:latest .
- [ ] T021 [P] Test backend image locally: docker run --rm -p 7860:7860 -e DATABASE_URL="test" -e COHERE_API_KEY="test" -e BETTER_AUTH_SECRET="test" todo-backend:latest (verify starts without errors)
- [ ] T022 [P] Test frontend image locally: docker run --rm -p 3000:3000 -e NEXT_PUBLIC_API_URL="http://localhost:7860" todo-frontend:latest (verify starts without errors)
- [ ] T023 Verify images are available in Minikube's Docker daemon: docker images | grep todo

### Helm Chart Structure

- [ ] T024 Create Helm Chart.yaml in phase4/helm/todo-app/Chart.yaml (apiVersion: v2, name: todo-app, version: 1.0.0, appVersion: 1.0.0)
- [ ] T025 Create Helm values.yaml in phase4/helm/todo-app/values.yaml with backend/frontend configuration (replicas: 2, image tags, resource limits, secrets placeholders)
- [ ] T026 Create values.example.yaml in phase4/helm/todo-app/values.example.yaml with placeholder secrets for documentation
- [ ] T027 [P] Create Helm template helpers in phase4/helm/todo-app/templates/_helpers.tpl (name, fullname, labels, selectorLabels functions)
- [ ] T028 [P] Create backend Deployment template in phase4/helm/todo-app/templates/deployment-backend.yaml (2 replicas, resource limits, health probes, secret refs)
- [ ] T029 [P] Create frontend Deployment template in phase4/helm/todo-app/templates/deployment-frontend.yaml (2 replicas, resource limits, health probes, env vars)
- [ ] T030 [P] Create backend Service template in phase4/helm/todo-app/templates/service-backend.yaml (ClusterIP, port 7860)
- [ ] T031 [P] Create frontend Service template in phase4/helm/todo-app/templates/service-frontend.yaml (NodePort 30080, port 3000)
- [ ] T032 [P] Create Secret template in phase4/helm/todo-app/templates/secret.yaml (database-url, cohere-api-key, better-auth-secret with base64 encoding from values)
- [ ] T033 [P] Create ConfigMap template in phase4/helm/todo-app/templates/configmap.yaml (optional, for non-sensitive config)
- [ ] T034 Use kubectl-ai to validate Helm templates: "kubectl-ai validate helm chart at phase4/helm/todo-app" (or manual helm lint if kubectl-ai unavailable)
- [ ] T035 Document kubectl-ai/kagent commands used in phase4/CLAUDE.md under "AI Tools Usage" section

**Checkpoint**: Foundation ready - Docker images built, Helm chart structure complete, ready for deployment

---

## Phase 3: User Story 1 - Local Development Environment Setup (Priority: P1) 🎯 MVP

**Goal**: Developers can deploy the complete Todo application stack on local Minikube cluster and access it via browser

**Independent Test**: Starting from clean Minikube cluster, run deployment commands, access frontend at http://localhost:30080, verify all Phase II features work (create tasks, chatbot, authentication)

### Implementation for User Story 1

- [ ] T036 [US1] Start Minikube cluster with appropriate resources: minikube start --memory=4096 --cpus=2 --driver=docker
- [ ] T037 [US1] Verify Minikube cluster is running: minikube status (all components should show "Running")
- [ ] T038 [US1] Verify kubectl is configured for Minikube: kubectl cluster-info
- [ ] T039 [US1] Create phase4/helm/todo-app/values.yaml from values.example.yaml with actual secrets (DATABASE_URL, COHERE_API_KEY, BETTER_AUTH_SECRET)
- [ ] T040 [US1] Install Helm chart: helm install todo-app phase4/helm/todo-app -f phase4/helm/todo-app/values.yaml
- [ ] T041 [US1] Watch deployment progress: kubectl get pods -w (wait for all pods to reach Running state)
- [ ] T042 [US1] Verify all pods are ready: kubectl get pods -l app=todo-app (should show 4 pods: 2 backend, 2 frontend, all 1/1 Ready)
- [ ] T043 [US1] Verify services are created: kubectl get services -l app=todo-app (should show todo-backend ClusterIP and todo-frontend NodePort)
- [ ] T044 [US1] Get frontend URL: minikube service todo-frontend --url (should return http://<minikube-ip>:30080)
- [ ] T045 [US1] Test frontend accessibility in browser at http://$(minikube ip):30080
- [ ] T046 [US1] Test user authentication: sign up/sign in via frontend UI
- [ ] T047 [US1] Test task creation: create a new task via frontend UI
- [ ] T048 [US1] Test task persistence: refresh page and verify task still exists
- [ ] T049 [US1] Test AI chatbot: open chatbot and send message "Show me my tasks"
- [ ] T050 [US1] Verify backend database connection: kubectl logs deployment/todo-backend | grep -i "database\|connection" (should show successful connection to Neon)
- [ ] T051 [US1] Document deployment steps in phase4/README.md "Quick Start" section based on quickstart.md
- [ ] T052 [US1] Create deployment script in phase4/scripts/deploy.sh (automates T036-T040)
- [ ] T053 [US1] Test deployment script: bash phase4/scripts/deploy.sh (should complete without errors)

**Checkpoint**: User Story 1 complete - Application fully deployed and accessible on Minikube, all Phase II features functional

---

## Phase 4: User Story 2 - Deployment Configuration Validation (Priority: P2)

**Goal**: Developers can validate service health, verify automatic recovery from failures, and ensure proper error handling

**Independent Test**: Intentionally delete a pod, verify Kubernetes recreates it automatically, check health endpoints return correct status, verify frontend shows appropriate errors when backend unavailable

### Implementation for User Story 2

- [ ] T054 [US2] Add health check endpoint to backend if not exists: GET /health returns {"status": "healthy"} in phase2/backend/server.py
- [ ] T055 [US2] Add health check endpoint to frontend if not exists: GET /api/health returns {"status": "healthy"} in phase2/frontend/src/app/api/health/route.ts
- [ ] T056 [US2] Rebuild backend image with health endpoint: docker build -f phase4/docker/backend/Dockerfile -t todo-backend:latest .
- [ ] T057 [US2] Rebuild frontend image with health endpoint: docker build -f phase4/docker/frontend/Dockerfile -t todo-frontend:latest .
- [ ] T058 [US2] Upgrade Helm deployment with new images: helm upgrade todo-app phase4/helm/todo-app --reuse-values
- [ ] T059 [US2] Verify health probes are configured: kubectl describe deployment todo-backend | grep -A 5 "Liveness\|Readiness"
- [ ] T060 [US2] Test liveness probe: curl http://$(minikube ip):30080/api/health (should return 200 OK)
- [ ] T061 [US2] Test backend health via port-forward: kubectl port-forward deployment/todo-backend 7860:7860 & curl http://localhost:7860/health
- [ ] T062 [US2] Simulate pod failure: kubectl delete pod -l component=backend --force (delete one backend pod)
- [ ] T063 [US2] Verify automatic pod recreation: kubectl get pods -l component=backend -w (should show new pod being created)
- [ ] T064 [US2] Verify service continues working during pod restart: continuously refresh frontend while pod restarts
- [ ] T065 [US2] Use kagent to analyze deployment health: "kagent analyze deployment todo-backend" (or manual kubectl describe if kagent unavailable)
- [ ] T066 [US2] Check resource usage: kubectl top pods (verify within limits: backend <1Gi, frontend <512Mi)
- [ ] T067 [US2] Verify pod logs are accessible: kubectl logs -f deployment/todo-backend (should stream logs)
- [ ] T068 [US2] Test error handling: stop Minikube, verify frontend shows appropriate error message
- [ ] T069 [US2] Document health check validation in phase4/README.md "Health Checks" section
- [ ] T070 [US2] Create validation script in phase4/scripts/test-deployment.sh (automates health checks and failure recovery tests)
- [ ] T071 [US2] Document kagent commands used in phase4/CLAUDE.md

**Checkpoint**: User Story 2 complete - Health checks working, automatic recovery verified, monitoring capabilities established

---

## Phase 5: User Story 3 - Rapid Iteration and Testing (Priority: P3)

**Goal**: Developers can quickly rebuild and redeploy individual services after code changes without redeploying entire stack or losing data

**Independent Test**: Modify backend code (e.g., add console.log), rebuild only backend image, redeploy, verify changes reflected while frontend and database remain unchanged

### Implementation for User Story 3

- [ ] T072 [US3] Document development workflow in phase4/README.md "Development Workflow" section
- [ ] T073 [US3] Create rebuild script for backend in phase4/scripts/rebuild-backend.sh (eval minikube docker-env, docker build, helm upgrade)
- [ ] T074 [US3] Create rebuild script for frontend in phase4/scripts/rebuild-frontend.sh (eval minikube docker-env, docker build, helm upgrade)
- [ ] T075 [US3] Test backend rebuild workflow: modify phase2/backend/server.py (add log statement), run rebuild-backend.sh, verify change in logs
- [ ] T076 [US3] Test frontend rebuild workflow: modify phase2/frontend/src/app/page.tsx (change text), run rebuild-frontend.sh, verify change in browser
- [ ] T077 [US3] Verify data persistence during redeploy: create test task, redeploy backend, verify task still exists
- [ ] T078 [US3] Measure rebuild time: time bash phase4/scripts/rebuild-backend.sh (should be <2 minutes)
- [ ] T079 [US3] Verify only target service restarts: kubectl get pods -w during rebuild (only backend pods should restart, frontend unchanged)
- [ ] T080 [US3] Test rollback capability: helm rollback todo-app (should revert to previous version)
- [ ] T081 [US3] Verify rollback works: check application still functional after rollback
- [ ] T082 [US3] Use kubectl-ai to scale deployment: "kubectl-ai scale deployment todo-backend to 3 replicas" (or manual kubectl scale if kubectl-ai unavailable)
- [ ] T083 [US3] Verify scaling works: kubectl get pods -l component=backend (should show 3 pods)
- [ ] T084 [US3] Scale back to 2 replicas: kubectl scale deployment todo-backend --replicas=2
- [ ] T085 [US3] Document kubectl-ai scaling commands in phase4/CLAUDE.md
- [ ] T086 [US3] Create combined rebuild script in phase4/scripts/rebuild-all.sh (rebuilds both services)
- [ ] T087 [US3] Test full rebuild workflow: bash phase4/scripts/rebuild-all.sh, verify both services updated

**Checkpoint**: User Story 3 complete - Rapid iteration workflow established, rebuild scripts working, scaling capabilities verified

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, cleanup, and bonus features

### Documentation & Cleanup

- [ ] T088 [P] Create comprehensive README.md in phase4/README.md with sections: Overview, Prerequisites, Quick Start, Development Workflow, Troubleshooting, Cleanup
- [ ] T089 [P] Document all Gordon commands used in phase4/CLAUDE.md under "Gordon AI Usage" section
- [ ] T090 [P] Document all kubectl-ai commands used in phase4/CLAUDE.md under "kubectl-ai Usage" section
- [ ] T091 [P] Document all kagent commands used in phase4/CLAUDE.md under "kagent Usage" section
- [ ] T092 [P] Add agent delegation proof in phase4/CLAUDE.md showing which agents handled which tasks
- [ ] T093 Create teardown script in phase4/scripts/teardown.sh (helm uninstall, minikube stop/delete, docker image cleanup)
- [ ] T094 Test teardown script: bash phase4/scripts/teardown.sh, verify clean removal
- [ ] T095 [P] Add troubleshooting section to phase4/README.md covering common issues (ImagePullBackOff, CrashLoopBackOff, connection errors)
- [ ] T096 [P] Create phase4/docker/README.md documenting Dockerfile structure and build process
- [ ] T097 [P] Create phase4/helm/todo-app/README.md documenting Helm chart usage and configuration

### Bonus: Reusable Intelligence & Blueprints

- [ ] T098 [P] Create spec-driven deployment blueprint in specs/blueprints/k8s-deployment-blueprint.md documenting reusable patterns
- [ ] T099 [P] Document Helm chart as reusable template in specs/blueprints/helm-chart-template.md
- [ ] T100 [P] Create agent skill definition in .specify/skills/phase4-k8s.yaml for reusable Kubernetes deployment skill
- [ ] T101 [P] Document Gordon usage patterns in specs/blueprints/gordon-patterns.md for future phases
- [ ] T102 [P] Document kubectl-ai/kagent patterns in specs/blueprints/k8s-ai-tools.md for future phases

### Optimization & Security

- [ ] T103 Use Gordon to optimize backend image: docker gordon optimize todo-backend:latest, document suggestions in phase4/CLAUDE.md
- [ ] T104 Use Gordon to optimize frontend image: docker gordon optimize todo-frontend:latest, document suggestions in phase4/CLAUDE.md
- [ ] T105 [P] Run Gordon security scan on backend: docker gordon scan todo-backend:latest, address critical vulnerabilities
- [ ] T106 [P] Run Gordon security scan on frontend: docker gordon scan todo-frontend:latest, address critical vulnerabilities
- [ ] T107 Verify secrets are not exposed: kubectl get secret todo-secrets -o yaml | grep -v "data:" (should not show decoded secrets)
- [ ] T108 Add .gitignore entry for phase4/helm/todo-app/values.yaml to prevent committing secrets

### Final Validation

- [ ] T109 Run complete end-to-end test following quickstart.md from clean state
- [ ] T110 Verify all success criteria from spec.md are met (deployment <5min, feature parity, auto-recovery <30s, resource usage <4GB)
- [ ] T111 Create demo video or screenshots showing deployment process and AI tool usage
- [ ] T112 Update root README.md with Phase IV completion status and link to phase4/README.md

**Checkpoint**: Phase IV complete - All documentation finished, bonus features implemented, ready for Phase V

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - Depends on US1 for deployed application
  - User Story 3 (P3): Can start after Foundational - Depends on US1 for deployed application
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories - **MVP SCOPE**
- **User Story 2 (P2)**: Depends on User Story 1 (needs deployed application to validate)
- **User Story 3 (P3)**: Depends on User Story 1 (needs deployed application to iterate on)

### Within Each User Story

- Setup tasks before deployment tasks
- Image builds before Helm install
- Deployment before validation
- Validation before documentation

### Parallel Opportunities

- **Phase 1**: T003-T007 (tool checks), T010-T013 (directory creation) can run in parallel
- **Phase 2**: T014-T015 (.dockerignore files), T021-T022 (image testing), T027-T033 (Helm templates) can run in parallel
- **Phase 6**: Most documentation and blueprint tasks (T088-T092, T095-T097, T098-T102, T105-T106) can run in parallel

---

## Parallel Example: Foundational Phase

```bash
# Launch Docker artifact creation in parallel:
Task: "Create .dockerignore for backend in phase4/docker/backend/.dockerignore"
Task: "Create .dockerignore for frontend in phase4/docker/frontend/.dockerignore"

# Launch Helm template creation in parallel:
Task: "Create Helm template helpers in phase4/helm/todo-app/templates/_helpers.tpl"
Task: "Create backend Deployment template in phase4/helm/todo-app/templates/deployment-backend.yaml"
Task: "Create frontend Deployment template in phase4/helm/todo-app/templates/deployment-frontend.yaml"
Task: "Create backend Service template in phase4/helm/todo-app/templates/service-backend.yaml"
Task: "Create frontend Service template in phase4/helm/todo-app/templates/service-frontend.yaml"
Task: "Create Secret template in phase4/helm/todo-app/templates/secret.yaml"
Task: "Create ConfigMap template in phase4/helm/todo-app/templates/configmap.yaml"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001-T013)
2. Complete Phase 2: Foundational (T014-T035) - CRITICAL
3. Complete Phase 3: User Story 1 (T036-T053)
4. **STOP and VALIDATE**: Test complete deployment independently
5. Deploy/demo if ready - **This is a working MVP!**

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready (T001-T035)
2. Add User Story 1 → Test independently → Deploy/Demo (T036-T053) - **MVP!**
3. Add User Story 2 → Test independently → Deploy/Demo (T054-T071) - **Health monitoring added**
4. Add User Story 3 → Test independently → Deploy/Demo (T072-T087) - **Dev workflow optimized**
5. Add Polish → Complete documentation and bonus features (T088-T112)

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T035)
2. Once Foundational is done:
   - Developer A: User Story 1 (T036-T053)
   - Developer B: Start User Story 2 prep (health endpoints)
   - Developer C: Start documentation (Phase 6 tasks)
3. After US1 complete:
   - Developer A: User Story 2 (T054-T071)
   - Developer B: User Story 3 (T072-T087)
   - Developer C: Continue documentation and blueprints

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Gordon commands have fallback to standard Docker CLI
- kubectl-ai/kagent commands have fallback to standard kubectl/helm
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Document all AI tool usage in CLAUDE.md for bonus points
- Phase IV does not modify Phase II application code (only adds health endpoints if missing)
