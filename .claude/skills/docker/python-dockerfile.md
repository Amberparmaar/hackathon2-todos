# Python Dockerfile Builder

Creates optimized Dockerfile for Python/FastAPI applications.

## Version
1.0

## Category
Deployment

## Inputs

| Name | Type | Description | Default |
|-------|------|-------------|----------|
| app_dir | string | Application directory | `backend/` |
| requirements | string | Path to requirements.txt | `requirements.txt` |

## Outputs

- Dockerfile
- .dockerignore
- Docker Compose service

## Instructions

Create production-ready Dockerfile:

1. **Base Image**
   - Python slim image (latest stable)
   - Multi-stage build for optimization

2. **Dependencies**
   - System packages if needed
   - Python requirements from requirements.txt
   - Virtual environment setup

3. **Application Setup**
   - Copy application code
   - Set working directory
   - Expose port 8000
   - CMD for uvicorn

4. **Optimization**
   - Layer caching
   - Minimal final image
   - Non-root user

5. **.dockerignore**
   - Exclude unnecessary files
   - .git, __pycache__, .env
   - Development files

## Example Usage

```
@skills/docker/python-dockerfile.md
```
