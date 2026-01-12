# Task Breakdown: Phase II Full-Stack Multi-User Web Application

**Branch**: `001-phase2-fullstack`
**Spec**: [spec.md](./spec.md)
**Plan**: [plan.md](./plan.md)
**Date**: 2026-01-07

## Overview

Break down Phase II implementation into atomic, executable tasks. All tasks must be completed with zero manual coding using agents and skills.

## Task List

### Step 1: Database Schema and Connection

---

**T-001: Create Phase 2 Directory Structure**

Create complete directory structure for frontend and backend following monorepo guidelines.

**Responsibility**: Setup project foundation
**Dependencies**: None
**Input Specs**: @[plan.md](./plan.md) - Project Structure section
**Agent/Skill**: `@agents/orchestrator-agent.yaml` or manual
**Expected Output**:
- `phase2/frontend/` directory created
- `phase2/backend/` directory created
- `phase2/specs/` directory exists

**Success Criteria**:
- Frontend directory with src/, tests/, package.json
- Backend directory with src/, tests/, requirements.txt, Dockerfile
- All directories follow Phase II isolation guidelines

---

**T-002: Create Neon PostgreSQL Connection Module**

Establish database connection and session management module for FastAPI backend.

**Responsibility**: Backend database infrastructure
**Dependencies**: T-001
**Input Specs**: @[plan.md](./plan.md) - Technical Context (Neon PostgreSQL)
**Agent/Skill**: `@skills/neon-sqlmodel.yaml` or `@agents/backend-agent.yaml`
**Expected Output**:
- `backend/src/core/database.py` - Database connection class
- Connection string template
- Session management setup
- Async engine configuration

**Success Criteria**:
- Database connection can be established using DATABASE_URL
- Async SQLAlchemy engine configured correctly
- Session management supports CRUD operations
- Error handling for connection failures implemented

---

**T-003: Create User SQLModel**

Define User entity with UUID primary key, email field, bcrypt password hashing, and timestamps.

**Responsibility**: Backend data model
**Dependencies**: T-002
**Input Specs**: @[data-model.md](./data-model.md) - User Entity section
**Agent/Skill**: `@agents/backend-agent.yaml` (SQLModel expert)
**Expected Output**:
- `backend/src/models/user.py` - User SQLModel class
- Email index for fast sign-in queries
- Password hashing with bcrypt
- created_at timestamp field

**Success Criteria**:
- User model with UUID primary key
- Email field with unique constraint
- Password hash field (not plain text)
- created_at with default NOW()
- Table name defined correctly (users or user)

---

**T-004: Create Task SQLModel with User Ownership**

Define Task entity with user_id foreign key for multi-user isolation.

**Responsibility**: Backend data model
**Dependencies**: T-002, T-003
**Input Specs**: @[data-model.md](./data-model.md) - Task Entity section
**Agent/Skill**: `@agents/backend-agent.yaml` (SQLModel expert)
**Expected Output**:
- `backend/src/models/task.py` - Task SQLModel class
- user_id foreign key referencing User model
- All fields: id, title, description, completed, created_at, completed_at
- Relationship: User (1) ──── (N) Tasks

**Success Criteria**:
- Task model with UUID primary key
- user_id foreign key constraint
- Title field VARCHAR(200) with NOT NULL
- Description TEXT field (nullable)
- completed BOOLEAN with default False
- created_at timestamp with default NOW()
- completed_at timestamp (nullable)

---

**T-005: Create Pydantic Schemas**

Define request/response schemas for API validation using Pydantic.

**Responsibility**: Backend API validation
**Dependencies**: T-003, T-004
**Input Specs**: @[contracts/openapi.yaml](./contracts/openapi.yaml)
**Agent/Skill**: `@agents/backend-agent.yaml`
**Expected Output**:
- `backend/src/schemas/user.py` - User schema (email, password)
- `backend/src/schemas/task.py` - Task schema (title, description, completed)
- Validation rules applied
- Proper field types and constraints

**Success Criteria**:
- UserCreate schema with email and password fields
- UserResponse schema with id, email fields
- TaskCreate schema with title (required), description (optional) fields
- TaskResponse schema matching Task model
- TaskUpdate schema with optional fields
- All schemas use proper Pydantic field types

---

**T-006: Create Database Initialization Script**

Create script to initialize database tables on first run.

**Responsibility**: Backend database setup
**Dependencies**: T-003, T-004
**Input Specs**: @[data-model.md](./data-model.md) - Database Migration Strategy
**Agent/Skill**: `@agents/backend-agent.yaml`
**Expected Output**:
- `backend/src/init_db.py` - Database initialization script
- Creates tables if not exist
- Handles connection errors gracefully
- Can be run independently

**Success Criteria**:
- Script creates User and Task tables
- Tables created only if not existing (idempotent)
- Success/error messages displayed
- Script can be executed via `python init_db.py`

---

### Step 2: Authentication System (Frontend + Backend)

---

**T-007: Configure Better Auth JWT Secret**

Set up JWT token generation and validation using BETTER_AUTH_SECRET.

**Responsibility**: Backend authentication
**Dependencies**: T-002
**Input Specs**: @[spec.md](./spec.md) - FR-004, FR-005
**Agent/Skill**: `@skills/better-auth-jwt.yaml` or `@agents/auth-agent.yaml`
**Expected Output**:
- `backend/src/core/security.py` - JWT generation and validation module
- PyJWT configuration
- BETTER_AUTH_SECRET environment variable documented
- Token expiration logic (default 7 days)

**Success Criteria**:
- JWT token can be generated with user_id in subject
- JWT can be validated with BETTER_AUTH_SECRET
- Token expiration configurable
- User ID can be extracted from validated token
- Error handling for invalid/expired tokens

---

**T-008: Create Backend Signup Endpoint**

Implement user registration endpoint with email validation and password hashing.

**Responsibility**: Backend authentication
**Dependencies**: T-007, T-005
**Input Specs**: @[contracts/openapi.yaml](./contracts/openapi.yaml) - POST /api/auth/signup
**Agent/Skill**: `@agents/auth-agent.yaml` or `@skills/better-auth-jwt.yaml`
**Expected Output**:
- `backend/src/api/auth.py` - Authentication endpoints module
- POST /api/auth/signup endpoint created
- Email validation implemented
- Password hashing with bcrypt (12 rounds)
- Duplicate email check (409 Conflict)
- Returns 201 with user object and JWT token

**Success Criteria**:
- Endpoint accepts POST /api/auth/signup
- Email format validated
- Password hashed before storage
- Returns 409 if email already exists
- Returns 400 for invalid input
- Returns JWT token on success (201)
- Token signed with BETTER_AUTH_SECRET

---

**T-009: Create Backend Sign-In Endpoint**

Implement user authentication endpoint returning JWT on valid credentials.

**Responsibility**: Backend authentication
**Dependencies**: T-007, T-005, T-003
**Input Specs**: @[contracts/openapi.yaml](./contracts/openapi.yaml) - POST /api/auth/signin
**Agent/Skill**: `@agents/auth-agent.yaml` or `@skills/better-auth-jwt.yaml`
**Expected Output**:
- `backend/src/api/auth.py` updated with sign-in endpoint
- POST /api/auth/signin endpoint created
- Credential verification against hashed password
- JWT token generation on successful auth
- Returns 401 for invalid credentials
- Login attempt logging (optional)

**Success Criteria**:
- Endpoint accepts POST /api/auth/signin
- Email lookup in users table
- Bcrypt password verification
- Returns JWT token on successful login
- Returns 401 Unauthorized for invalid credentials
- Token contains user_id in subject claim
- Token signed with BETTER_AUTH_SECRET

---

**T-010: Create JWT Validation Middleware**

Create FastAPI dependency to verify JWT tokens and inject user_id into requests.

**Responsibility**: Backend authentication
**Dependencies**: T-007
**Input Specs**: @[plan.md](./plan.md) - FR-005
**Agent/Skill**: `@agents/auth-agent.yaml` or `@skills/better-auth-jwt.yaml`
**Expected Output**:
- `backend/src/api/dependencies.py` or `backend/src/middleware.py` - JWT middleware
- Validates Authorization: Bearer <token> header
- Extracts user_id from JWT
- Returns 401 if token invalid/missing
- Returns 403 if user_id doesn't match resource owner
- Attaches user to request state

**Success Criteria**:
- Middleware function created
- Checks for Authorization header
- Verifies JWT signature with BETTER_AUTH_SECRET
- Extracts user_id from token payload
- Returns HTTPException(401) for invalid tokens
- Attaches user to request.state for route handlers
- Can be applied as dependency to protected routes

---

**T-011: Create Backend Sign-Out Endpoint**

Implement token invalidation endpoint for client-side logout.

**Responsibility**: Backend authentication
**Dependencies**: T-008
**Input Specs**: @[contracts/openapi.yaml](./contracts/openapi.yaml) - POST /api/auth/signout
**Agent/Skill**: `@agents/auth-agent.yaml`
**Expected Output**:
- `backend/src/api/auth.py` updated with sign-out endpoint
- POST /api/auth/signout endpoint created
- Returns 200 OK with success message
- Note: Token invalidation primarily client-side (remove from localStorage)

**Success Criteria**:
- Endpoint accepts POST /api/auth/signout
- Returns 200 OK status
- Response includes success message
- Client instructed to remove token from storage

---

**T-012: Create Next.js Auth Context/Provider**

Create React context for managing user authentication state and token storage.

**Responsibility**: Frontend authentication
**Dependencies**: None
**Input Specs**: @[spec.md](./spec.md) - FR-021, FR-027
**Agent/Skill**: `@agents/frontend-agent.yaml` or `@skills/nextjs-task-ui.yaml`
**Expected Output**:
- `frontend/src/components/AuthProvider.tsx` - Auth context component
- Provides user state (user, token, loading, error)
- Provides login/signup/logout functions
- Token storage in localStorage
- Token retrieval from localStorage on load

**Success Criteria**:
- Context provider wraps children
- Exposes signIn, signUp, signOut functions
- Stores JWT token in localStorage
- Retrieves token from localStorage on mount
- Manages loading and error states
- Type definitions for User, AuthContext interface

---

**T-013: Create Next.js Sign-In Page**

Create login page with email/password form and authentication integration.

**Responsibility**: Frontend authentication
**Dependencies**: T-012
**Input Specs**: @[plan.md](./plan.md) - Step 2 requirements
**Agent/Skill**: `@agents/frontend-agent.yaml` or `@skills/nextjs-task-ui.yaml`
**Expected Output**:
- `frontend/src/app/signin/page.tsx` - Sign-in page component
- Email input field with validation
- Password input field with type="password"
- Sign-in button with loading state
- Error message display
- Redirects to /dashboard on success

**Success Criteria**:
- Page accessible at /signin
- Form with email and password inputs
- Calls AuthContext.signIn function
- Displays error messages from auth
- Redirects to dashboard on successful login
- Responsive layout with Tailwind styling

---

**T-014: Create Next.js Sign-Up Page**

Create user registration page with email/password form.

**Responsibility**: Frontend authentication
**Dependencies**: T-012
**Input Specs**: @[plan.md](./plan.md) - User Story 1 (Registration)
**Agent/Skill**: `@agents/frontend-agent.yaml` or `@skills/nextjs-task-ui.yaml`
**Expected Output**:
- `frontend/src/app/signup/page.tsx` - Sign-up page component
- Email input field with validation
- Password input field (type="password", min 8 chars)
- Confirm password field
- Sign-up button with loading state
- Error message display
- Redirects to /dashboard on success

**Success Criteria**:
- Page accessible at /signup
- Form with email, password, confirm password inputs
- Calls AuthContext.signUp function
- Password minimum length validation (8 chars)
- Password matching validation
- Displays error messages from auth
- Redirects to dashboard on successful signup
- Responsive layout with Tailwind styling

---

**T-015: Create Frontend API Client Module**

Create API client with JWT attachment and error handling.

**Responsibility**: Frontend API integration
**Dependencies**: T-012
**Input Specs**: @[plan.md](./plan.md) - FR-001, FR-002
**Agent/Skill**: `@agents/frontend-agent.yaml`
**Expected Output**:
- `frontend/src/lib/api.ts` - API client module
- Functions for all CRUD operations
- JWT token attachment to Authorization header
- Fetch wrapper with error handling
- TypeScript types for requests/responses

**Success Criteria**:
- apiClient instance with base URL configuration
- Function to get JWT token from localStorage
- createTask(title, description) function
- getTasks() function with optional limit/offset
- updateTask(id, title, description) function
- deleteTask(id) function
- toggleTask(id) function
- All functions attach Authorization: Bearer <token> header
- Error handling for 401, 403, 404, 500
- TypeScript types defined

---

### Step 3: Task Model with User Ownership

---

**T-016: Create Backend Task CRUD Operations**

Implement task CRUD endpoints with user ownership validation.

**Responsibility**: Backend task API
**Dependencies**: T-004, T-005, T-010
**Input Specs**: @[contracts/openapi.yaml](./contracts/openapi.yaml) - Task CRUD endpoints
**Agent/Skill**: `@agents/backend-agent.yaml` or `@skills/multi-user-crud.yaml`
**Expected Output**:
- `backend/src/api/tasks.py` - Task CRUD module
- GET /api/tasks (filtered by user_id)
- POST /api/tasks (create, with user_id)
- GET /api/tasks/{id} (verify ownership)
- PUT /api/tasks/{id} (update, verify ownership)
- DELETE /api/tasks/{id} (delete, verify ownership)
- PATCH /api/tasks/{id}/toggle (verify ownership)
- All operations validate user_id from JWT

**Success Criteria**:
- All 5 CRUD endpoints implemented
- GET /api/tasks returns user's tasks only
- POST /api/tasks creates task with user_id
- PUT /api/tasks/{id} verifies ownership before update
- DELETE /api/tasks/{id} verifies ownership before delete
- PATCH /api/tasks/{id}/toggle verifies ownership
- Returns 403 Forbidden if ownership check fails
- Returns 401 Unauthorized if JWT missing/invalid
- Returns 404 Not Found if task doesn't exist
- Returns 422 for validation errors
- All responses follow openapi.yaml contract

---

**T-017: Create Backend Main Application Entry Point**

Initialize FastAPI app with all routes and middleware configuration.

**Responsibility**: Backend application setup
**Dependencies**: T-007, T-010, T-016
**Input Specs**: @[plan.md](./plan.md) - Step 2 and 4 requirements
**Agent/Skill**: `@agents/backend-agent.yaml`
**Expected Output**:
- `backend/src/main.py` - FastAPI application entry
- Include all routers (auth, tasks)
- Include JWT middleware
- Include CORS middleware
- Database session initialization
- Environment variable loading
- OpenAPI/Swagger documentation at /docs

**Success Criteria**:
- FastAPI app instance created
- Auth router included and mounted at /api/auth
- Tasks router included and mounted at /api/tasks
- JWT middleware applied to /api routes
- CORS configured for frontend
- Database engine configured
- OpenAPI docs available at http://localhost:8000/docs
- Health check endpoint at /health
- All environment variables loaded (DATABASE_URL, BETTER_AUTH_SECRET)

---

### Step 4: Frontend Protected Routes and API Client

---

**T-018: Create Protected Route Wrapper Component**

Create reusable component to wrap protected pages with authentication check.

**Responsibility**: Frontend routing
**Dependencies**: T-012, T-015
**Input Specs**: @[spec.md](./spec.md) - FR-021 (protected routes redirect)
**Agent/Skill**: `@agents/frontend-agent.yaml` or `@skills/nextjs-task-ui.yaml`
**Expected Output**:
- `frontend/src/components/ProtectedRoute.tsx` - Protected route wrapper
- Checks for JWT token in localStorage
- Redirects to /signin if not authenticated
- Supports both pages and layouts
- TypeScript types for component props

**Success Criteria**:
- Component accepts children prop
- Checks localStorage for JWT token
- Redirects to /signin if token missing
- Renders children if authenticated
- TypeScript props defined
- No prop drilling (proper React patterns)

---

**T-019: Update Frontend API Client with Task Operations**

Enhance API client with task-specific CRUD operations.

**Responsibility**: Frontend API integration
**Dependencies**: T-015
**Input Specs**: @[plan.md](./plan.md) - Step 5 requirements
**Agent/Skill**: `@agents/frontend-agent.yaml`
**Expected Output**:
- `frontend/src/lib/api.ts` updated with task operations
- getTask(id) function added
- updateTask(id, title, description) function
- deleteTask(id) function
- toggleTask(id) function
- All functions use JWT from storage

**Success Criteria**:
- getTask(id) fetches single task by ID
- updateTask(id, ...) sends PUT request
- deleteTask(id) sends DELETE request
- toggleTask(id) sends PATCH request
- All functions handle 401, 403, 404 errors
- Authorization header attached to all requests

---

### Step 5: Frontend Protected Routes and API Client

---

**T-020: Create Dashboard Page with Task List**

Create main dashboard page displaying user's tasks with list, add, edit, delete, and toggle actions.

**Responsibility**: Frontend UI
**Dependencies**: T-018, T-019
**Input Specs**: @[spec.md](./plan.md) - User Story 2 (Task Management)
**Agent/Skill**: `@agents/frontend-agent.yaml` or `@skills/nextjs-task-ui.yaml`
**Expected Output**:
- `frontend/src/app/dashboard/page.tsx` - Dashboard page
- Fetches user's tasks on mount
- Displays task list in responsive layout
- Empty state message when no tasks
- Loading states during fetch
- Error handling and display
- Statistics display (total, completed)

**Success Criteria**:
- Page accessible at /dashboard
- Protected by ProtectedRoute wrapper
- Loads tasks via API client on mount
- Displays tasks with title, description, status
- Shows creation date
- Empty state: "No tasks yet. Create your first task!"
- Loading spinner while fetching
- Error message display on fetch failure
- Responsive layout (mobile: single column, desktop: grid/list)
- Statistics shown (e.g., "3 of 10 tasks completed")

---

**T-021: Create Task Card Component**

Create reusable task card component displaying task details and action buttons.

**Responsibility**: Frontend UI components
**Dependencies**: T-020
**Input Specs**: @[plan.md](./plan.md) - Task Management requirements
**Agent/Skill**: `@agents/frontend-agent.yaml` or `@skills/nextjs-task-ui.yaml`
**Expected Output**:
- `frontend/src/components/TaskCard.tsx` - Task card component
- Displays task title, description, completion status
- Created date display
- Edit button (opens modal or inline form)
- Delete button with confirmation
- Toggle completion button/checkbox
- Visual indicators for completed (e.g., strikethrough or checkmark)

**Success Criteria**:
- Component accepts task object as prop
- Displays title (up to 200 chars truncated with ...)
- Displays description (truncated if > 50 chars with ...)
- Shows creation date (e.g., "Jan 7, 2026")
- Visual indicator for completed status ([X] or [ ])
- Edit button triggers edit flow
- Delete button shows confirmation dialog
- Toggle button switches completion status instantly
- Tailwind CSS styling applied
- Responsive design works on mobile/tablet/desktop

---

**T-022: Create Task Form Component**

Create form component for adding/editing tasks with validation.

**Responsibility**: Frontend UI components
**Dependencies**: T-020
**Input Specs**: @[spec.md](./plan.md) - FR-009, FR-010 (create), FR-014 (update)
**Agent/Skill**: `@agents/frontend-agent.yaml` or `@skills/nextjs-task-ui.yaml`
**Expected Output**:
- `frontend/src/components/TaskForm.tsx` - Task form component
- Title input (required, max 200 chars)
- Description textarea (optional, max 1000 chars)
- Save/Cancel buttons
- Validation error display
- Loading state on submit
- Edit mode support (pre-fill values when editing)

**Success Criteria**:
- Form accepts mode (create/edit)
- Title input with character count and validation
- Description textarea with character count
- Save button disabled while loading
- Validation errors displayed inline
- Cancel button closes form in edit mode
- In edit mode, pre-fills title and description
- Character limits enforced (200 title, 1000 description)
- Tailwind styling with focus states and error colors

---

### Step 6: Task List UI with Add/Edit/Delete

---

**T-023: Create Task List Component**

Create component to render and manage list of tasks with responsive layout.

**Responsibility**: Frontend UI components
**Dependencies**: T-021
**Input Specs**: @[plan.md](./plan.md) - User Story 4 (Responsive UI)
**Agent/Skill**: `@agents/frontend-agent.yaml` or `@skills/nextjs-task-ui.yaml`
**Expected Output**:
- `frontend/src/components/TaskList.tsx` - Task list component
- Renders array of TaskCard components
- Filters or sorting controls (optional for Phase II)
- Empty state handling
- Loading skeleton
- Responsive grid/list layout

**Success Criteria**:
- Accepts tasks array as prop
- Maps tasks to TaskCard components
- Grid layout on desktop (2-3 columns)
- List layout on mobile (1 column)
- Empty state: "No tasks yet" message
- Loading state shows skeleton cards
- Responsive breakpoints using Tailwind
- Smooth transitions for add/delete/update

---

**T-024: Create Root Layout with Navigation**

Create main application layout with navigation and user menu.

**Responsibility**: Frontend layout
**Dependencies**: None
**Input Specs**: @[plan.md](./plan.md) - User Experience requirements
**Agent/Skill**: `@agents/frontend-agent.yaml`
**Expected Output**:
- `frontend/src/app/page.tsx` - Root layout
- Navigation header (logo, user menu)
- Sign out button (visible when authenticated)
- Protected routes wrapped with ProtectedRoute
- Public routes accessible (signin, signup)
- Responsive navigation (mobile hamburger, desktop full menu)

**Success Criteria**:
- Layout wraps all pages
- Sign out button visible on protected pages
- Sign out calls AuthContext.signOut
- User menu shows user email (when authenticated)
- Navigation works on mobile
- Tailwind styling applied
- Sign out removes token and redirects to /signin

---

**T-025: Configure Frontend Environment Variables**

Set up environment variables for API URL and auth secret.

**Responsibility**: Frontend configuration
**Dependencies**: T-015
**Input Specs**: @[plan.md](./plan.md) - Environment Variables section
**Agent/Skill**: `@agents/frontend-agent.yaml` or manual
**Expected Output**:
- `.env.local` file in frontend root
- NEXT_PUBLIC_API_URL variable set
- NEXT_PUBLIC_AUTH_SECRET variable set
- .env.example file created as template

**Success Criteria**:
- .env.local contains NEXT_PUBLIC_API_URL="http://localhost:8000"
- .env.local contains NEXT_PUBLIC_AUTH_SECRET="my-super-secret-phase2-key-2026"
- .env.example created with same structure (no actual secrets)
- Variables accessible in Next.js via process.env.NEXT_PUBLIC_API_URL

---

**T-026: Create Frontend TypeScript Types**

Define TypeScript types for API requests, responses, and user data.

**Responsibility**: Frontend typing
**Dependencies**: T-015
**Input Specs**: @[plan.md](./plan.md) - TypeScript requirements
**Agent/Skill**: `@agents/frontend-agent.yaml`
**Expected Output**:
- `frontend/src/types/index.ts` or `frontend/src/types/api.ts` - Type definitions
- User interface
- Task interface
- API request types (CreateTask, UpdateTask)
- API response types (Task, TasksList, AuthResponse)
- Error types

**Success Criteria**:
- User interface defined (id, email, created_at)
- Task interface defined (all fields)
- Request interfaces for all API calls
- Response interfaces for all API calls
- Error interfaces with code and message
- Types exported from index.ts

---

### Step 7: End-to-End Testing Strategy

---

**T-027: Create Backend Pytest Test Suite**

Create unit and integration tests for authentication and task CRUD operations.

**Responsibility**: Backend testing
**Dependencies**: T-007, T-010, T-016
**Input Specs**: @[plan.md](./plan.md) - Step 7 (Testing)
**Agent/Skill**: `@agents/backend-agent.yaml`
**Expected Output**:
- `backend/tests/` directory created
- `backend/tests/test_auth.py` - Authentication tests
- `backend/tests/test_tasks.py` - Task CRUD tests
- `backend/tests/conftest.py` - Pytest configuration
- Test fixtures for database

**Success Criteria**:
- Tests for signup endpoint (success, duplicate email, validation errors)
- Tests for sign-in endpoint (success, invalid credentials)
- Tests for JWT validation (valid, expired, missing)
- Tests for task CRUD (create, read, update, delete, toggle)
- Tests for user isolation (user A can't see user B's tasks)
- Tests for ownership checks (403 errors)
- All tests pass with pytest
- Coverage report generated

---

**T-028: Create Frontend Jest Test Suite**

Create unit and component tests for frontend authentication and task management.

**Responsibility**: Frontend testing
**Dependencies**: T-012, T-018, T-020, T-021, T-022
**Input Specs**: @[plan.md](./plan.md) - Step 7 (Testing)
**Agent/Skill**: `@agents/frontend-agent.yaml`
**Expected Output**:
- `frontend/tests/` directory created
- `frontend/tests/components/` - Component tests
- `frontend/tests/lib/` - API client tests
- `jest.config.js` - Jest configuration
- Test setup utilities

**Success Criteria**:
- Tests for AuthProvider (signIn, signUp, signOut)
- Tests for ProtectedRoute (redirect to signin, render children)
- Tests for TaskCard (render, delete, toggle)
- Tests for TaskForm (validation, create, update modes)
- Tests for TaskList (render empty, render with tasks, loading state)
- Tests for API client (JWT attachment, error handling)
- All tests pass with Jest
- Mocking set up for API calls

---

**T-029: Create Multi-User Isolation Test Suite**

Create comprehensive test suite demonstrating complete user data isolation.

**Responsibility**: Testing validation
**Dependencies**: T-027, T-028
**Input Specs**: @[plan.md](./plan.md) - Validation section
**Agent/Skill**: `@agents/backend-agent.yaml` or `@agents/frontend-agent.yaml` or manual
**Expected Output**:
- `backend/tests/test_multi_user.py` or `frontend/tests/multi-user/` - Isolation tests
- Test scenarios documented
- Test data fixtures (User A, User B, tasks for each)
- Integration test instructions

**Success Criteria**:
- Test 1: User A creates task → visible to User A only
- Test 2: User A lists tasks → sees only User A's tasks
- Test 3: User B lists tasks → sees only User B's tasks
- Test 4: User A tries to update User B's task → returns 403
- Test 5: User A deletes task → User B's task list unchanged
- Test 6: User A signs out → can't access tasks with token
- Test 7: Invalid JWT token → 401 error on protected routes
- All test scenarios documented
- All tests pass
- Test report generated

---

### Bonus Tasks (Reusable Intelligence)

---

**T-BONUS-001: Document Agent/Skill Usage**

Create comprehensive documentation of which agents and skills were used for each task.

**Responsibility**: Documentation (Bonus: +200 points)
**Dependencies**: All completed tasks
**Input Specs**: @[plan.md](./plan.md) - Bonus Maximization section
**Agent/Skill**: Manual or `@agents/orchestrator-agent.yaml`
**Expected Output**:
- Updated `phase2/implement.md` with agent/skill references
- Git commit messages including agent IDs
- Documentation in code comments

**Success Criteria**:
- Each task in implement.md references primary agent/skill used
- All agent/skill invocations documented
- Git commits follow convention: "feat: [task] by @agent-name"
- Code comments link to agent/skill documentation
- CLAUDE.md history updated

---

**T-BONUS-002: Create Quickstart Documentation**

Write comprehensive setup and development guide for Phase II.

**Responsibility**: Documentation (Bonus points available)
**Dependencies**: All backend and frontend tasks
**Input Specs**: @[quickstart.md](./quickstart.md) template
**Agent/Skill**: Manual
**Expected Output**:
- `phase2/README.md` updated with complete setup guide
- Prerequisites section (Python 3.11+, Node 18+, npm)
- Backend setup (venv, dependencies, database)
- Frontend setup (npm install, environment variables)
- Running instructions (backend and frontend)
- Testing instructions
- Troubleshooting section

**Success Criteria**:
- README.md has clear structure
- Prerequisites section complete
- Backend setup instructions work step-by-step
- Frontend setup instructions work step-by-step
- Testing section includes pytest and Jest commands
- Environment variables documented (.env.example)
- Troubleshooting covers common issues (database connection, JWT errors)
- Verification checklist included

---

**T-BONUS-003: Create Deployment Guide for Vercel (Frontend) and Docker (Backend)**

Write deployment instructions for production deployment.

**Responsibility**: Deployment readiness
**Dependencies**: T-BONUS-002
**Input Specs**: @[plan.md](./plan.md) - Deliverables Confirmation section
**Agent/Skill**: Manual
**Expected Output**:
- `phase2/DEPLOYMENT.md` created
- Vercel deployment instructions for frontend
- Docker/Docker Compose setup for backend
- Environment variables for production
- Health check instructions
- Rollback strategies

**Success Criteria**:
- Vercel deployment guide complete (vercel --prod)
- Dockerfile created for backend
- docker-compose.yml created for local development
- Production environment variables documented
- Health check endpoint documented
- Deployment verification steps included
- Backup and rollback procedures documented

---

## Summary

**Total Tasks**: 29 (26 Required + 3 Bonus)

**Breakdown**:
- Database & Connection: 6 tasks (T-001 to T-006)
- Authentication: 8 tasks (T-007 to T-014)
- Task Model: 1 task (T-016)
- Task CRUD: 1 task (T-016)
- Backend Setup: 1 task (T-017)
- Protected Routes: 2 tasks (T-018, T-019)
- Dashboard Page: 1 task (T-020)
- Task Card: 1 task (T-021)
- Task Form: 1 task (T-022)
- Task List: 1 task (T-023)
- Root Layout: 1 task (T-024)
- Frontend Config: 1 task (T-025)
- TypeScript Types: 1 task (T-026)
- Backend Tests: 1 task (T-027)
- Frontend Tests: 1 task (T-028)
- Multi-User Tests: 1 task (T-029)
- Bonus Documentation: 2 tasks (T-BONUS-001, T-BONUS-002, T-BONUS-003)

**Dependencies Graph**:
- T-016, T-017 require T-004, T-005
- T-007, T-008, T-009, T-010, T-011 require T-002
- T-012, T-013 require T-007
- T-014, T-015 require T-012
- T-018 requires T-012
- T-020 requires T-018, T-019
- T-021 requires T-022
- T-023 requires T-021
- T-024 requires T-018, T-012, T-013
- T-025 requires T-015
- T-026 requires T-015
- T-027 requires T-007, T-016, T-017
- T-028 requires T-012, T-020, T-021, T-022, T-023
- T-029 requires T-027, T-028

## Next Steps

This task breakdown is complete and ready for execution.

**Recommended Approach**: Use orchestrator agent to coordinate implementation
- Command: `@agents/orchestrator-agent.yaml`
- The orchestrator will delegate to specialized agents/skills
- Zero manual coding required

**Alternative Approach**: Execute tasks sequentially with specialized agents
- Each task delegated to appropriate agent/skill
- Document which agent handled each task

**Execution Ready**: All 29 tasks defined with clear success criteria
- All tasks reference spec sections (spec.md, plan.md, data-model.md, contracts/openapi.yaml)
- Bonus tasks documented for maximum points (+200)
- No manual coding allowed per constitution Principle II
