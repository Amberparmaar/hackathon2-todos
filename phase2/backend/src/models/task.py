"""
Task SQLModel for Phase II Full-Stack Multi-User Web Application.

Task Reference: T-004
Spec Reference: @phase2/specs/data-model.md - Task Entity

This module defines the Task entity with user_id foreign key for multi-user isolation.
"""

from sqlmodel import SQLModel, Field, Relationship
from uuid import UUID, uuid4
from datetime import datetime
from typing import Optional


class Task(SQLModel, table=True):
    """
    Task model representing a todo item created by a specific user.

    T-004: Task model with UUID primary key
    T-004: user_id foreign key constraint
    T-004: Title field VARCHAR(200) with NOT NULL
    T-004: Description TEXT field (nullable)
    T-004: completed BOOLEAN with default False
    T-004: created_at timestamp with default NOW()
    T-004: completed_at timestamp (nullable)
    """

    __tablename__ = "tasks"

    # T-004: UUID (PRIMARY KEY) - Unique identifier for task
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        index=True,
        description="Unique identifier for task"
    )

    # T-004: Title field - 1-200 characters, required per FR-009
    title: str = Field(
        max_length=200,
        nullable=False,
        description="Task title (1-200 characters, required per FR-009)"
    )

    # T-004: Description field - Optional task description (max 1000 characters per FR-010)
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        description="Optional task description (max 1000 characters per FR-010)"
    )

    # T-004: Completion status - Task completion status (pending/completed)
    completed: bool = Field(
        default=False,
        description="Task completion status (pending/completed)"
    )

    # T-004: User ownership - Reference to User who owns this task
    # T-004: user_id foreign key referencing User model
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Reference to User who owns this task"
    )

    # T-004: Creation timestamp - When task was created
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="When task was created"
    )

    # T-004: Completion timestamp - When task was marked as completed (nullable)
    completed_at: Optional[datetime] = Field(
        default=None,
        description="When task was marked as completed (nullable)"
    )

