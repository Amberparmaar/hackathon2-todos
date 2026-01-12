# FastAPI Task CRUD Builder

Builds FastAPI CRUD endpoints for Todo tasks with user isolation and validation.

## Version
1.0

## Category
Backend

## Inputs

| Name | Type | Description | Default |
|-------|------|-------------|----------|
| api_spec | string | Path to API specification | `@specs/api/endpoints.md` |
| db_spec | string | Path to database spec | `@specs/database/models.md` |

## Outputs

- Task model (SQLModel)
- CRUD endpoints
- User isolation middleware
- Pydantic schemas

## Instructions

Create FastAPI CRUD endpoints with:

1. **Database Models**
   - SQLModel Task entity
   - User relationship
   - Indexes for performance

2. **API Endpoints**
   - POST /api/tasks (create)
   - GET /api/tasks (list with filtering)
   - GET /api/tasks/{id} (retrieve)
   - PUT /api/tasks/{id} (update)
   - DELETE /api/tasks/{id} (delete)
   - PATCH /api/tasks/{id}/toggle (completion status)

3. **User Isolation**
   - JWT-based user authentication
   - Filter tasks by user_id
   - Verify ownership on operations

4. **Validation**
   - Pydantic schemas for input/output
   - Title length validation (1-200 chars)
   - Description length validation (max 1000 chars)

5. **Error Handling**
   - 404 for not found
   - 401 for unauthorized
   - 422 for validation errors

## Example Usage

```
@skills/fastapi/task-crud.md
```
