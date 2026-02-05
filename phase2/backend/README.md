---
title: Todo API Backend
emoji: 🚀
colorFrom: purple
colorTo: red
sdk: docker
dockerfile: Dockerfile
pinned: false
license: other
---

# Todo API Backend

This Space hosts a FastAPI backend for the Todo application using Docker.

## API Endpoints
- `/docs` - Interactive API documentation
- `/health` - Health check endpoint
- `/api/auth/signup` - User registration
- `/api/auth/signin` - User login
- `/api/tasks` - Task management endpoints
- `/api/{user_id}/chat` - AI chatbot endpoint for natural language task management
- `/api/{user_id}/conversations` - Get user's conversation history
- `/api/{user_id}/conversations/{conversation_id}/messages` - Get messages from a conversation

## Environment Variables
Set these secrets in your Space settings:
- `BETTER_AUTH_SECRET`: your-auth-secret
- `DATABASE_URL`: your-database-url (PostgreSQL connection string)
- `COHERE_API_KEY`: your-cohere-api-key (for AI chatbot functionality)