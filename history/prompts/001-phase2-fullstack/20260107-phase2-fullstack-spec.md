---
id: 20260107-phase2-fullstack-spec
title: Phase II Full-Stack Multi-User Web Application Spec
stage: spec
date: 2026-01-07
surface: claude-code
model: sonnet
feature: 001-phase2-fullstack
branch: 001-phase2-fullstack
user: Amber Parmaar
command: /sp.specify
labels: [spec-phase2-fullstack]
links:
  spec: [../../../specs/001-phase2-fullstack/spec.md](../../../specs/001-phase2-fullstack/spec.md)
  ticket: LINKS_TICKET
  adr: LINKS_ADR
  pr: LINKS_PR
files:
  - specs/001-phase2-fullstack/spec.md
  - specs/001-phase2-fullstack/checklists/requirements.md
tests:
TESTS_YAML
---

## Prompt

# sp.specify -> Phase II: Full-Stack Multi-User Web Application

You are now implementing Phase II of Hackathon II: "The Evolution of Todo" using strict Spec-Driven Development with Claude Code and Spec-Kit Plus.

## Objective
Transform Phase I in-memory console app into a fully functional, multi-user web application with persistent storage and secure authentication.

## Core Requirements (Must Implement Exactly)
- All 5 Basic Level features: Add, Delete, Update, View, Mark as Complete
- Multi-user isolation: Each user only sees and modifies their own tasks
- Persistent storage using Neon Serverless PostgreSQL
- User authentication (signup/signin) with email + password
- Stateless JWT-based authentication (no session DB lookups)
- Responsive web interface

## Technology Stack (Mandatory)
- Frontend: Next.js 16+ (App Router), TypeScript, Tailwind CSS
- Backend: Python FastAPI, SQLModel
- Database: Neon Serverless PostgreSQL
- Authentication: Better Auth with JWT plugin enabled
- Shared secret: BETTER_AUTH_SECRET (same in frontend and backend)

## Reusable Intelligence (Use These — Bonus Proof)
I have already created; following reusable agents and skills in the repository:
- @agents/orchestrator-agent.yaml -> Full stack coordinator
- @agents/auth-agent.yaml -> Authentication specialist
- @agents/backend-agent.yaml -> FastAPI + DB expert
- @agents/frontend-agent.yaml -> Next.js UI specialist
- @skills/phase2-fullstack.yaml -> Complete Phase II orchestration
- @skills/better-auth-jwt.yaml
- @skills/multi-user-crud.yaml
- @skills/neon-sqlmodel.yaml
- @skills/nextjs-task-ui.yaml

## Available Specifications (Read All)
- @sp.constitution -> Overall project phases and constitution
- @specs/overview.md
- @specs/features/task-crud.md
- @specs/features/authentication.md
- @specs/api/rest-endpoints.md
- @specs/database/schema.md
- @specs/ui/pages.md
- @specs/ui/components.md

## Task
Implement COMPLETE Phase II full-stack web application using spec-driven development.

Preferred Approach (Strongly Recommended):
Delegate to entire implementation to orchestrator:
-> @agents/orchestrator-agent.yaml

Alternatively, invoke master skill:
-> @skills/phase2-fullstack.yaml

Ensure following are strictly enforced:
1. JWT token issued on login via Better Auth JWT plugin
2. Frontend attaches Authorization: Bearer <token> to every API request
3. Backend verifies JWT with shared BETTER_AUTH_SECRET and extracts user_id
4. All database queries filtered by authenticated user_id
5. Tasks table has user_id foreign key referencing Better Auth's user table
6. Proper error handling: 401 unauthorized, 403 forbidden if task not owned
7. Responsive, clean UI with task list, add form, edit/delete actions
8. Protected routes - unauthenticated users redirected to signin

Environment Variables to Use:
- DATABASE_URL = postgresql+psycopg2://<your-neon-connection-string>
- BETTER_AUTH_SECRET = my-super-secret-phase2-key-2026

No manual coding allowed. Refine specs if needed, but generate all code via agents/skills.

After implementation, confirm:
- Multi-user isolation works
- JWT flow is end-to-end secure
- App is ready for Vercel (frontend) and local/Docker (backend) deployment

Begin implementation now.

## Response snapshot

Successfully created Phase II full-stack specification with the following components:

1. **User Stories** (4 prioritized):
   - P1: User Registration and Authentication
   - P1: Task Management
   - P2: Protected Routes and Unauthorized Access
   - P2: Responsive User Interface

2. **Functional Requirements** (33 total):
   - Authentication & Security (8 requirements)
   - Task Management (12 requirements)
   - User Experience (8 requirements)
   - Data Integrity (5 requirements)

3. **Key Entities**:
   - User entity (id, email, password_hash, created_at)
   - Task entity (id, title, description, completed, created_at, completed_at, user_id)

4. **Success Criteria** (10 measurable):
   - Account registration: < 2 minutes
   - Sign-in response: < 3 seconds
   - Task operations: 95% success rate
   - Concurrency: 100 users, < 1 second operations
   - Security: 100% unauthorized access blocked
   - Data isolation: 100% passed
   - UI load time: < 3 seconds
   - Auth flow success: 90% completion
   - Data persistence: 100% across refresh
   - API response: < 500ms

5. **Quality Checklist**: All items passed - specification ready for planning phase

6. **Branch**: Created `001-phase2-fullstack` and switched to it

7. **Files Created**:
   - specs/001-phase2-fullstack/spec.md
   - specs/001-phase2-fullstack/checklists/requirements.md

## Outcome

- ✅ Impact: Created complete Phase II specification with 4 user stories, 33 functional requirements, and 10 measurable success criteria. Specification is technology-agnostic and ready for planning phase.
- 🧪 Tests: All validation checks passed - no clarifications needed, all requirements testable, success criteria measurable and implementable.
- 📁 Files: 2 files created (spec.md and requirements checklist) in specs/001-phase2-fullstack/
- 🔁 Next prompts: `/sp.plan` (create implementation plan from specification)
- 🧠 Reflection: Specification successfully captures all core requirements for Phase II multi-user web application without implementation details. Focus on user needs (authentication, task management, data isolation) maintained. No [NEEDS CLARIFICATION] markers needed as all details were specified in input or inferable from industry standards.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): All validation checks PASS
- Prompt variant (if applicable): N/A
- Next experiment (smallest change to try): Proceed to `/sp.plan` to create detailed implementation plan
