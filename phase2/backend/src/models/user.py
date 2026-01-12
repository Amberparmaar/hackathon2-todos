"""
User SQLModel for Phase II Full-Stack Multi-User Web Application.

Task Reference: T-003
Spec Reference: @phase2/specs/data-model.md - User Entity

This module defines the User entity with UUID primary key, email field,
bcrypt password hashing, and timestamps.
"""

from sqlmodel import SQLModel, Field
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class User(SQLModel, table=True):
    """
    User model representing a registered user.

    T-003: User model with UUID primary key
    T-003: Email field with unique constraint
    T-003: Password hash field (not plain text)
    T-003: created_at with default NOW()
    T-003: Table name defined correctly (users)
    """

    __tablename__ = "users"

    # T-003: UUID (PRIMARY KEY) - Unique identifier for user
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        description="Unique identifier for user"
    )

    # T-003: Email field - Unique identifier for sign-in
    # T-003: Email index for fast sign-in queries
    email: str = Field(
        unique=True,
        index=True,
        max_length=255,
        description="User's email address, used for sign-in"
    )

    # T-003: Password hash field - Securely hashed password (never in plain text)
    password_hash: str = Field(
        max_length=255,
        description="Securely hashed password (never stored in plain text)"
    )

    # T-003: Account creation timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Account creation timestamp"
    )

