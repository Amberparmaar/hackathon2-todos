# Neon Database Setup

Sets up Neon PostgreSQL database connection and schema for Todo application.

## Version
1.0

## Category
Database

## Inputs

| Name | Type | Description | Default |
|-------|------|-------------|----------|
| db_spec | string | Path to database specification | `@specs/database/schema.md` |
| env_file | string | Path to .env file | `.env` |

## Outputs

- Database connection module
- SQLModel models
- Migration scripts
- Environment configuration

## Instructions

Set up Neon PostgreSQL with SQLModel:

1. **Connection**
   - Neon database URL from .env
   - Async engine setup
   - Session management

2. **Models**
   - User model (id, email, password_hash, created_at)
   - Task model (id, title, description, completed, user_id, created_at)
   - Foreign key relationships
   - Indexes

3. **Migration**
   - Create tables if not exist
   - Migration script for initial setup
   - Connection pooling

4. **Environment**
   - DATABASE_URL environment variable
   - Database connection validation
   - Error handling for connection failures

## Example Usage

```
@skills/database/neon-setup.md
```
