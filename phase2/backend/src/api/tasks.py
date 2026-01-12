"""
Task CRUD API endpoints for Phase II Full-Stack Multi-User Web Application.

Task Reference: T-016
Spec Reference: @phase2/specs/contracts/openapi.yaml - Task CRUD Endpoints

This module implements task CRUD operations with user ownership validation.
All operations enforce multi-user isolation via user_id from JWT.
"""

from datetime import datetime
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select, func

from ..core.database import get_session
from ..core.security import verify_token
from ..models.task import Task
from ..schemas.task import (
    TaskCreate,
    TaskResponse,
    TaskUpdate,
    TaskListResponse
)


router = APIRouter(prefix="/api/tasks", tags=["tasks"])
security = HTTPBearer()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> UUID:
    """
    Get current user ID from JWT token.

    T-016: All operations validate user_id from JWT

    Args:
        credentials: JWT token from Authorization header

    Returns:
        UUID: User ID from JWT token

    Raises:
        HTTPException: If token invalid (401 Unauthorized)
    """
    return UUID(verify_token(credentials.credentials))


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    task_data: TaskCreate,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Create new task for authenticated user.

    T-016: POST /api/tasks (create, with user_id)
    T-016: All operations validate user_id from JWT
    T-016: Returns 401 Unauthorized if JWT missing/invalid
    T-016: Returns 422 for validation errors

    Args:
        task_data: Task creation data
        user_id: User ID from JWT
        session: Database session

    Returns:
        TaskResponse: Created task

    Raises:
        HTTPException: If validation fails (422)
    """
    # Validate task data
    if not task_data.title or not task_data.title.strip():
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Title cannot be empty"
        )

    if len(task_data.title) > 200:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Title must be 200 characters or less"
        )

    if task_data.description and len(task_data.description) > 1000:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="Description must be 1000 characters or less"
        )

    # T-016: POST /api/tasks (create, with user_id)
    new_task = Task(
        title=task_data.title.strip(),
        description=task_data.description,
        user_id=user_id
    )

    session.add(new_task)
    session.commit()
    session.refresh(new_task)

    return TaskResponse(
        id=new_task.id,
        title=new_task.title,
        description=new_task.description,
        completed=new_task.completed,
        user_id=new_task.user_id,
        created_at=new_task.created_at,
        completed_at=new_task.completed_at
    )


@router.get("", response_model=TaskListResponse)
def list_tasks(
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session),
    limit: int = Query(100, ge=1, le=100),
    offset: int = Query(0, ge=0)
):
    """
    List all tasks for authenticated user.

    T-016: GET /api/tasks (filtered by user_id)
    T-016: All operations validate user_id from JWT

    Args:
        user_id: User ID from JWT
        session: Database session
        limit: Maximum tasks to return (default 100)
        offset: Pagination offset (default 0)

    Returns:
        TaskListResponse: List of user's tasks with statistics
    """
    # Get user's tasks ordered by created_at DESC
    # T-016: GET /api/tasks (filtered by user_id)
    tasks = session.exec(
        select(Task)
        .where(Task.user_id == user_id)
        .order_by(Task.created_at.desc())
        .offset(offset)
        .limit(limit)
    ).all()

    # Count statistics
    total = session.exec(
        select(func.count(Task.id)).where(Task.user_id == user_id)
    ).one()

    completed = session.exec(
        select(func.count(Task.id))
        .where(Task.user_id == user_id, Task.completed == True)
    ).one()

    pending = total - completed

    return TaskListResponse(
        tasks=[
            TaskResponse(
                id=task.id,
                title=task.title,
                description=task.description,
                completed=task.completed,
                user_id=task.user_id,
                created_at=task.created_at,
                completed_at=task.completed_at
            )
            for task in tasks
        ],
        total=total,
        completed=completed,
        pending=pending
    )


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Get specific task by ID.

    T-016: GET /api/tasks/{id} (verify ownership)
    T-016: Returns 401 Unauthorized if JWT missing/invalid
    T-016: Returns 403 Forbidden if ownership check fails
    T-016: Returns 404 Not Found if task doesn't exist

    Args:
        task_id: Task ID
        user_id: User ID from JWT
        session: Database session

    Returns:
        TaskResponse: Task data

    Raises:
        HTTPException: If task not found (404)
        HTTPException: If user doesn't own task (403)
    """
    # Verify ownership before returning task
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        # Check if task exists but belongs to another user
        existing = session.exec(select(Task).where(Task.id == task_id)).first()
        if existing:
            # T-016: Returns 403 Forbidden if ownership check fails
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to access this task"
            )
        # T-016: Returns 404 Not Found if task doesn't exist
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=task.user_id,
        created_at=task.created_at,
        completed_at=task.completed_at
    )


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: UUID,
    task_update: TaskUpdate,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Update existing task.

    T-016: PUT /api/tasks/{id} (update, verify ownership)
    T-016: Returns 401 Unauthorized if JWT missing/invalid
    T-016: Returns 403 Forbidden if ownership check fails
    T-016: Returns 404 Not Found if task doesn't exist
    T-016: Returns 422 for validation errors

    Args:
        task_id: Task ID
        task_update: Updated task data
        user_id: User ID from JWT
        session: Database session

    Returns:
        TaskResponse: Updated task

    Raises:
        HTTPException: If task not found (404)
        HTTPException: If user doesn't own task (403)
        HTTPException: If validation fails (422)
    """
    # Verify ownership before update
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        # Check if task exists but belongs to another user
        existing = session.exec(select(Task).where(Task.id == task_id)).first()
        if existing:
            # T-016: Returns 403 Forbidden if ownership check fails
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to update this task"
            )
        # T-016: Returns 404 Not Found if task doesn't exist
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Update fields if provided
    if task_update.title is not None:
        if not task_update.title.strip():
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Title cannot be empty"
            )
        if len(task_update.title) > 200:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Title must be 200 characters or less"
            )
        task.title = task_update.title.strip()

    if task_update.description is not None:
        if len(task_update.description) > 1000:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Description must be 1000 characters or less"
            )
        task.description = task_update.description

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=task.user_id,
        created_at=task.created_at,
        completed_at=task.completed_at
    )


@router.delete("/{task_id}")
def delete_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Delete specific task.

    T-016: DELETE /api/tasks/{id} (delete, verify ownership)
    T-016: Returns 401 Unauthorized if JWT missing/invalid
    T-016: Returns 403 Forbidden if ownership check fails
    T-016: Returns 404 Not Found if task doesn't exist

    Args:
        task_id: Task ID
        user_id: User ID from JWT
        session: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If task not found (404)
        HTTPException: If user doesn't own task (403)
    """
    # Verify ownership before delete
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        # Check if task exists but belongs to another user
        existing = session.exec(select(Task).where(Task.id == task_id)).first()
        if existing:
            # T-016: Returns 403 Forbidden if ownership check fails
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to delete this task"
            )
        # T-016: Returns 404 Not Found if task doesn't exist
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    session.delete(task)
    session.commit()

    return {"message": "Task deleted successfully", "id": str(task_id)}


@router.patch("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user_id),
    session: Session = Depends(get_session)
):
    """
    Toggle task completion status.

    T-016: PATCH /api/tasks/{id}/toggle (verify ownership)
    T-016: Returns 401 Unauthorized if JWT missing/invalid
    T-016: Returns 403 Forbidden if ownership check fails
    T-016: Returns 404 Not Found if task doesn't exist

    Args:
        task_id: Task ID
        user_id: User ID from JWT
        session: Database session

    Returns:
        TaskResponse: Updated task

    Raises:
        HTTPException: If task not found (404)
        HTTPException: If user doesn't own task (403)
    """
    # Verify ownership before toggle
    task = session.exec(
        select(Task).where(Task.id == task_id, Task.user_id == user_id)
    ).first()

    if not task:
        # Check if task exists but belongs to another user
        existing = session.exec(select(Task).where(Task.id == task_id)).first()
        if existing:
            # T-016: Returns 403 Forbidden if ownership check fails
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You don't have permission to toggle this task"
            )
        # T-016: Returns 404 Not Found if task doesn't exist
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )

    # Toggle completion status
    task.completed = not task.completed
    task.completed_at = datetime.utcnow() if task.completed else None

    session.add(task)
    session.commit()
    session.refresh(task)

    return TaskResponse(
        id=task.id,
        title=task.title,
        description=task.description,
        completed=task.completed,
        user_id=task.user_id,
        created_at=task.created_at,
        completed_at=task.completed_at
    )
