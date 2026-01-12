# @specs/001-phase2-fullstack/tasks.md:T-017 - Backend Main Application Entry Point
"""
FastAPI application entry point for Phase II Full-Stack Multi-User Web Application.

This module initializes FastAPI app with all routes, middleware,
and database configuration.
"""

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from core.database import init_db
from api import auth, tasks


# T-017: FastAPI app instance created
app = FastAPI(
    title="Phase II Todo App",
    description="Multi-user todo application with JWT authentication",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan manager.

    Initializes database tables on startup.

    T-017: Database engine configured
    """
    # Initialize database tables
    await init_db()
    yield
    # Cleanup (if needed)
    pass


# T-017: Include auth router included and mounted at /api/auth
# T-017: Tasks router included and mounted at /api/tasks
app.include_router(auth.router, prefix="/api/auth")
app.include_router(tasks.router)

# T-017: CORS configured for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    """
    Health check endpoint.

    Returns:
        dict: Health status of application and database
    """
    from core.database import check_db_connection

    db_healthy = await check_db_connection()

    return {
        "status": "healthy",
        "database": "connected" if db_healthy else "disconnected"
    }


@app.get("/")
async def root():
    """Root endpoint with API information."""
    return {
        "message": "Phase II Full-Stack Multi-User Web Application",
        "docs": "/docs",
        "version": "1.0.0"
    }


if __name__ == "__main__":
    import uvicorn

    # Run the application
    # T-017: Database engine configured
    # T-017: OpenAPI docs available at http://localhost:8000/docs
    # T-017: Health check endpoint at /health
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True
    )
