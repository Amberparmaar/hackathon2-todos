# @specs/001-phase2-fullstack/tasks.md:T-002 - Neon PostgreSQL Connection Module
"""
Database connection and session management module for Neon PostgreSQL.

This module provides async database connection pooling and session management
for FastAPI backend using SQLModel and SQLAlchemy async support.

Environment Variables Required:
    DATABASE_URL: PostgreSQL connection string (e.g., postgresql+psycopg2://user:pass@host:port/db)
"""

import os
from typing import AsyncGenerator

from dotenv import load_dotenv
from sqlalchemy.ext.asyncio import (
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)
from sqlmodel import SQLModel

# Load environment variables
load_dotenv()

# Get database URL from environment variable
DATABASE_URL = os.getenv(
    "DATABASE_URL",
    "sqlite+aiosqlite:///./todo_app.db"
)

# Create async engine with connection pooling
# Using AsyncEngine for non-blocking database operations
engine = create_async_engine(
    DATABASE_URL,
    echo=False,  # Set to True for SQL query logging in development
    pool_size=10,  # Number of connections to maintain
    max_overflow=20,  # Maximum connections beyond pool_size
    pool_pre_ping=True,  # Verify connections before using them
    pool_recycle=3600,  # Recycle connections after 1 hour
)

# Create async session factory
# AsyncSessionLocal manages database sessions for each request
AsyncSessionLocal = async_sessionmaker(
    engine,
    class_=AsyncSession,
    expire_on_commit=False,  # Don't expire objects after commit
    autocommit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function to get database session.

    This function is used as a FastAPI dependency to provide database
    sessions to route handlers. The session is automatically closed
    after request is complete.

    Yields:
        AsyncSession: Async database session for database operations

    Usage:
        @app.get("/api/tasks")
        async def get_tasks(session: AsyncSession = Depends(get_session)):
            # Use session for database operations
            result = await session.exec(select(Task))
            tasks = result.all()
            return tasks
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()


async def init_db() -> None:
    """
    Initialize database tables.

    This function creates all tables defined in SQLModel subclasses.
    Should be called on application startup.

    Note:
        This uses SQLModel's metadata to create tables.
        In production, use Alembic migrations instead.
    """
    async with engine.begin() as conn:
        await conn.run_sync(SQLModel.metadata.create_all)


async def check_db_connection() -> bool:
    """
    Check if database connection is healthy.

    Returns:
        bool: True if connection successful, False otherwise

    Usage:
        @app.get("/health")
        async def health_check():
            db_healthy = await check_db_connection()
            return {"database": "healthy" if db_healthy else "unhealthy"}
    """
    try:
        async with AsyncSessionLocal() as session:
            await session.execute("SELECT 1")
        return True
    except Exception as e:
        print(f"Database connection error: {e}")
        return False
