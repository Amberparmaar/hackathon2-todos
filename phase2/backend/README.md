---
title: Todo API Backend
emoji: 🚀
colorFrom: purple
colorTo: red
sdk: docker
dockerfile: Dockerfile
pinned: false
license: mit
---

# Todo API Backend

This Space hosts a FastAPI backend for the Todo application using Docker.

## API Endpoints
- `/docs` - Interactive API documentation
- `/health` - Health check endpoint
- `/api/auth/signup` - User registration
- `/api/auth/signin` - User login
- `/api/tasks` - Task management endpoints

## Environment Variables
Set these secrets in your Space settings:
- `BETTER_AUTH_SECRET`: your-auth-secret
- `DATABASE_URL`: your-database-url
