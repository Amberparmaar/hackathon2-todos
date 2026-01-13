"""
Pytest configuration for Phase II Backend Test Suite.

Task Reference: T-027
Spec Reference: @phase2/specs/plan.md - Testing Section
"""
import pytest
from fastapi.testclient import TestClient
from sqlmodel import SQLModel
from sqlalchemy import create_engine
from sqlalchemy.pool import StaticPool
from src.main import app
from src.core.database import engine, get_session
from contextlib import contextmanager
from sqlalchemy.orm import sessionmaker


# Create test database engine
test_engine = create_engine(
    "sqlite:///:memory:",
    echo=True,
    poolclass=StaticPool,
    connect_args={"check_same_thread": False},
)
SQLModel.metadata.create_all(bind=test_engine)


TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def get_test_session():
    with TestingSessionLocal() as session:
        yield session


@pytest.fixture(name="client")
def test_client():
    """Create a test client with dependency overrides."""
    app.dependency_overrides[get_session] = get_test_session
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="session")
def test_session():
    """Create a test database session."""
    with TestingSessionLocal() as session:
        yield session