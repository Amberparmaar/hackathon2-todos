"""
Pydantic schemas for Task API validation.

Task Reference: T-005
Spec Reference: @phase2/specs/contracts/openapi.yaml - Task CRUD Endpoints

This module defines request/response schemas for task management using Pydantic.
"""

from pydantic import BaseModel, Field, validator
from typing import Optional
from uuid import UUID
from datetime import datetime


class TaskCreate(BaseModel):
    """
    Schema for task creation request.

    T-005: TaskCreate schema with title (required), description (optional) fields
    """

    title: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Task title (1-200 characters, required)"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Optional task description (max 1000 characters)"
    )

    @validator('title')
    def title_not_empty(cls, v):
        """Validate title is not empty."""
        if not v or not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip()


class TaskUpdate(BaseModel):
    """
    Schema for task update request.

    T-005: TaskUpdate schema with optional fields
    """

    title: Optional[str] = Field(
        None,
        min_length=1,
        max_length=200,
        description="Updated task title"
    )
    description: Optional[str] = Field(
        None,
        max_length=1000,
        description="Updated task description"
    )

    @validator('title')
    def title_not_empty(cls, v):
        """Validate title if provided."""
        if v is not None and not v.strip():
            raise ValueError('Title cannot be empty')
        return v.strip() if v else v


class TaskResponse(BaseModel):
    """
    Schema for task data response.

    T-005: TaskResponse schema matching Task model
    """

    id: UUID = Field(
        ...,
        description="Unique identifier for task"
    )
    title: str = Field(
        ...,
        description="Task title"
    )
    description: Optional[str] = Field(
        ...,
        description="Task description"
    )
    completed: bool = Field(
        ...,
        description="Task completion status"
    )
    user_id: UUID = Field(
        ...,
        description="Owner's user ID"
    )
    created_at: datetime = Field(
        ...,
        description="Task creation timestamp"
    )
    completed_at: Optional[datetime] = Field(
        ...,
        description="Task completion timestamp"
    )

    class Config:
        from_attributes = True


class TaskListResponse(BaseModel):
    """
    Schema for task list response with statistics.

    T-015: getTasks() function with optional limit/offset
    """

    tasks: list[TaskResponse] = Field(
        ...,
        description="List of tasks"
    )
    total: int = Field(
        ...,
        description="Total number of tasks"
    )
    completed: int = Field(
        ...,
        description="Number of completed tasks"
    )
    pending: int = Field(
        ...,
        description="Number of pending tasks"
    )
