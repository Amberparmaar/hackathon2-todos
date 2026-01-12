# Data Model: Phase II Full-Stack Multi-User Web Application

**Date**: 2026-01-07
**Purpose**: Define database entities, relationships, and constraints for Phase II

## Overview

Phase II requires a PostgreSQL database with two primary entities: **User** and **Task**. The Task entity must have a foreign key relationship to User to enforce multi-user isolation.

## Entity Definitions

### User Entity

Represents a registered user who can create and manage their own tasks.

**Table**: `users` (or use Better Auth's existing user table if available)

**Fields**:
- `id`: UUID (PRIMARY KEY)
  - Type: UUID v4
  - Constraints: NOT NULL
  - Description: Unique identifier for user
- `email`: VARCHAR(255)
  - Type: String
  - Constraints: UNIQUE, NOT NULL, EMAIL VALIDATION
  - Description: User's email address, used for sign-in
- `password_hash`: VARCHAR(255)
  - Type: String (bcrypt hash)
  - Constraints: NOT NULL
  - Description: Securely hashed password (never stored in plain text)
- `created_at`: TIMESTAMP
  - Type: TIMESTAMP WITH TIME ZONE
  - Constraints: NOT NULL, DEFAULT NOW()
  - Description: Account creation timestamp

**Indexes**:
- `idx_users_email`: UNIQUE(email) for fast email lookups during sign-in
- `idx_users_id`: PRIMARY KEY(id)

**Constraints**:
- Email addresses must be unique across all users
- Passwords must be hashed with bcrypt before storage
- Cascade delete: When User is deleted, all associated Tasks must be deleted

### Task Entity

Represents a todo item created by a specific user.

**Table**: `tasks`

**Fields**:
- `id`: UUID (PRIMARY KEY)
  - Type: UUID v4
  - Constraints: NOT NULL
  - Description: Unique identifier for task
- `title`: VARCHAR(200)
  - Type: String
  - Constraints: NOT NULL, VARCHAR(200)
  - Description: Task title (1-200 characters, required per FR-009)
- `description`: TEXT
  - Type: Text (unlimited length, enforced at application level)
  - Constraints: NULL allowed
  - Description: Optional task description (max 1000 characters per FR-010)
- `completed`: BOOLEAN
  - Type: Boolean
  - Constraints: NOT NULL, DEFAULT FALSE
  - Description: Task completion status (pending/completed)
- `user_id`: UUID (FOREIGN KEY)
  - Type: UUID v4
  - Constraints: NOT NULL
  - Description: Reference to User who owns this task
  - Foreign Key: References `users.id`
- `created_at`: TIMESTAMP
  - Type: TIMESTAMP WITH TIME ZONE
  - Constraints: NOT NULL, DEFAULT NOW()
  - Description: When task was created
- `completed_at`: TIMESTAMP
  - Type: TIMESTAMP WITH TIME ZONE
  - Constraints: NULL allowed
  - Description: When task was marked as completed (nullable)

**Indexes**:
- `idx_tasks_user_id`: (user_id) for fast filtering by authenticated user
- `idx_tasks_created_at`: (created_at DESC) for chronological ordering
- `idx_tasks_id`: PRIMARY KEY(id)

**Constraints**:
- Title must not be empty (application-level validation, database-level enforcement)
- Description can be NULL
- user_id must reference existing User.id (foreign key constraint)
- Tasks are soft-deleted when User is deleted (cascade delete)

## Entity Relationships

### One-to-Many: User → Tasks

**Relationship**: A User can have zero or more Tasks.
**Direction**: User (one) ──── (many) Tasks

**SQLModel Definition**:
```python
# User side (in user.py)
class User(SQLModel, table=True):
    id: UUID = Field(default_factory=uuid4)
    email: str = Field(unique=True, index=True)
    password_hash: str = Field()
    created_at: datetime = Field(default_factory=now)

# Tasks (relationship)
tasks: List["Task"] = Relationship(back_populates="owner")
```

**Schema Notes**:
- Foreign key constraint: `tasks.user_id` → `users.id`
- Cascade delete: When User deleted, all Tasks deleted
- No cascade update: User deletion does not require Task ownership reassignment

## Database Migration Strategy

### Initial Setup

1. **Create tables if not exist**:
   - Check if `users` and `tasks` tables exist
   - Create both tables with proper constraints
   - Create indexes for performance

2. **Seeding** (optional, for development):
   - Do NOT seed production data
   - May seed test users for local development only

3. **Migration Scripts**:
   - Use SQLModel's built-in table creation
   - No manual SQL migrations required for Phase II
   - Alembic can be added in later phases if needed

### Data Integrity Rules

#### User Creation

```sql
INSERT INTO users (id, email, password_hash, created_at)
VALUES ($1, $2, $3, NOW())
ON CONFLICT (email) DO NOTHING;
```

**Constraint Enforcement**:
- UNIQUE constraint on email prevents duplicates
- Application validates password length (>8 chars) before hashing
- Bcrypt rounds: 12 for security

#### Task Creation

```sql
INSERT INTO tasks (id, title, description, completed, user_id, created_at)
VALUES ($1, $2, $3, $4, $5, NOW())
ON CONFLICT (id) DO NOTHING;
```

**Constraint Enforcement**:
- Foreign key `user_id` must reference valid `users.id`
- Title enforced at application level (1-200 chars)
- Description enforced at application level (max 1000 chars)

## Query Performance Considerations

### Indexes for Performance

1. **User Lookup**: `idx_users_email` for fast sign-in
2. **Task Filtering**: `idx_tasks_user_id` for user-specific queries
3. **Chronological Order**: `idx_tasks_created_at DESC` for latest-first display

### Query Patterns

**Filter by User** (most common):
```sql
SELECT * FROM tasks
WHERE user_id = $1
ORDER BY created_at DESC
LIMIT 100;
```

**Ownership Check** (security-critical):
```sql
SELECT * FROM tasks
WHERE id = $1 AND user_id = $2;
```

**Count Statistics** (for dashboard):
```sql
SELECT
    COUNT(*) FILTER (WHERE completed = false) as pending,
    COUNT(*) FILTER (WHERE completed = true) as completed
FROM tasks
WHERE user_id = $1;
```

## Security Considerations

### User Isolation Enforcement

**All Task Queries MUST Include**:
```sql
WHERE user_id = extract_user_id_from_jwt()
```

This ensures:
- Users never see tasks belonging to other users
- Cross-user access attempts are blocked at database level
- Even direct SQL injection cannot bypass this check

### Authorization Flow

1. **Sign-in**:
   - Query users table by email
   - Compare bcrypt hash with password
   - Return user object if match

2. **Token Generation**:
   - Create JWT with user.id as subject
   - Sign with BETTER_AUTH_SECRET
   - Return token to frontend

3. **Token Validation** (on every request):
   - Verify JWT signature with BETTER_AUTH_SECRET
   - Extract user_id from token
   - Inject user_id into database queries

### SQL Injection Prevention

**SQLModel Protection**:
- All queries use parameterized queries (not string concatenation)
- SQLModel automatically handles escaping
- No raw SQL queries in Phase II

## Database Connection

### Connection String Format

```
DATABASE_URL=postgresql+psycopg2://user:password@host:port/database_name
```

### Connection Pooling (FastAPI default)

- Engine automatically manages connection pool
- Recommended: 5-20 connections in pool
- No manual connection management required for Phase II

## Summary

This data model provides:

✅ **Multi-user isolation** via user_id foreign key
✅ **Cascade delete** for data integrity
✅ **Performance optimization** via strategic indexes
✅ **Security enforcement** at database query level
✅ **Proper relationships** with one-to-many User → Tasks
✅ **Timestamp tracking** for both creation and completion events
