# FastAPI Auth Setup

Sets up Better Auth with JWT tokens for user authentication in Todo application.

## Version
1.0

## Category
Backend

## Inputs

| Name | Type | Description | Default |
|-------|------|-------------|----------|
| auth_spec | string | Path to auth specification | `@specs/auth/spec.md` |

## Outputs

- User model (SQLModel)
- Auth endpoints (signup, login, logout)
- JWT middleware
- Protected route decorator

## Instructions

Set up Better Auth with JWT authentication:

1. **User Model**
   - SQLModel User entity
   - email field (unique)
   - password_hash field
   - timestamps

2. **Auth Endpoints**
   - POST /api/auth/signup
   - POST /api/auth/login
   - POST /api/auth/logout

3. **JWT Implementation**
   - Generate access tokens
   - Verify tokens on protected routes
   - Extract user from token

4. **Middleware**
   - Verify JWT in Authorization header
   - Attach user to request state
   - Handle expired tokens

5. **Security**
   - Password hashing (bcrypt)
   - Token expiration
   - CORS configuration

## Example Usage

```
@skills/fastapi/auth-setup.md
```
