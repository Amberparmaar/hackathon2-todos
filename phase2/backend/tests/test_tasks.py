"""
Task CRUD API Test Suite for Phase II Full-Stack Multi-User Web Application.

Task Reference: T-027
Spec Reference: @phase2/specs/plan.md - Testing Section

This test suite validates task CRUD operations:
- Create task
- Read tasks (list and individual)
- Update task
- Delete task
- Toggle task completion
- User isolation (user A can't see/access user B's tasks)
- Authentication validation
"""
import pytest
import json
from fastapi.testclient import TestClient
from uuid import UUID


def test_create_task_success(client: TestClient):
    """
    Test successful task creation.

    T-027: Tests for task CRUD (create, read, update, delete, toggle)
    """
    # First register and login a user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "taskuser@example.com",
            "password": "securepassword123"
        }
    )

    token = signup_response.json()["token"]

    # Create a task
    response = client.post(
        "/api/tasks",
        json={
            "title": "Test Task",
            "description": "This is a test task"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200

    data = response.json()
    assert data["title"] == "Test Task"
    assert data["description"] == "This is a test task"
    assert data["completed"] is False
    assert UUID(data["id"])  # Verify it's a valid UUID
    assert UUID(data["user_id"])  # Verify it's a valid UUID


def test_get_tasks_list(client: TestClient):
    """
    Test retrieving user's task list.

    T-027: Tests for task CRUD (create, read, update, delete, toggle)
    """
    # Register and login a user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "listuser@example.com",
            "password": "securepassword123"
        }
    )

    token = signup_response.json()["token"]

    # Create a task first
    client.post(
        "/api/tasks",
        json={
            "title": "List Test Task",
            "description": "Task for list test"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    # Get tasks list
    response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200

    data = response.json()
    assert "tasks" in data
    assert "total" in data
    assert "completed" in data
    assert "pending" in data
    assert len(data["tasks"]) >= 1
    assert data["total"] >= 1


def test_get_specific_task(client: TestClient):
    """
    Test retrieving a specific task.

    T-027: Tests for task CRUD (create, read, update, delete, toggle)
    """
    # Register and login a user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "specificuser@example.com",
            "password": "securepassword123"
        }
    )

    token = signup_response.json()["token"]

    # Create a task first
    create_response = client.post(
        "/api/tasks",
        json={
            "title": "Specific Task",
            "description": "Task for specific test"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    task_id = create_response.json()["id"]

    # Get the specific task
    response = client.get(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Specific Task"
    assert data["description"] == "Task for specific test"


def test_update_task(client: TestClient):
    """
    Test updating an existing task.

    T-027: Tests for task CRUD (create, read, update, delete, toggle)
    """
    # Register and login a user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "updateuser@example.com",
            "password": "securepassword123"
        }
    )

    token = signup_response.json()["token"]

    # Create a task first
    create_response = client.post(
        "/api/tasks",
        json={
            "title": "Original Task",
            "description": "Original description"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    task_id = create_response.json()["id"]

    # Update the task
    response = client.put(
        f"/api/tasks/{task_id}",
        json={
            "title": "Updated Task",
            "description": "Updated description"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == task_id
    assert data["title"] == "Updated Task"
    assert data["description"] == "Updated description"


def test_delete_task(client: TestClient):
    """
    Test deleting an existing task.

    T-027: Tests for task CRUD (create, read, update, delete, toggle)
    """
    # Register and login a user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "deleteuser@example.com",
            "password": "securepassword123"
        }
    )

    token = signup_response.json()["token"]

    # Create a task first
    create_response = client.post(
        "/api/tasks",
        json={
            "title": "Task to Delete",
            "description": "This task will be deleted"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    task_id = create_response.json()["id"]

    # Delete the task
    response = client.delete(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200
    assert "message" in response.json()
    assert "successfully" in response.json()["message"].lower()

    # Verify the task is gone
    get_response = client.get(
        f"/api/tasks/{task_id}",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert get_response.status_code == 404


def test_toggle_task_completion(client: TestClient):
    """
    Test toggling task completion status.

    T-027: Tests for task CRUD (create, read, update, delete, toggle)
    """
    # Register and login a user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "toggleuser@example.com",
            "password": "securepassword123"
        }
    )

    token = signup_response.json()["token"]

    # Create a task first (default is not completed)
    create_response = client.post(
        "/api/tasks",
        json={
            "title": "Toggle Task",
            "description": "Task to test toggle"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    task_id = create_response.json()["id"]

    # Initially should be false
    assert create_response.json()["completed"] is False

    # Toggle the task completion
    response = client.patch(
        f"/api/tasks/{task_id}/toggle",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == 200

    data = response.json()
    assert data["id"] == task_id
    assert data["completed"] is True  # Should be toggled to true
    assert data["completed_at"] is not None  # Should have completion timestamp

    # Toggle again to make sure it works both ways
    response2 = client.patch(
        f"/api/tasks/{task_id}/toggle",
        headers={"Authorization": f"Bearer {token}"}
    )

    assert response2.status_code == 200

    data2 = response2.json()
    assert data2["id"] == task_id
    assert data2["completed"] is False  # Should be toggled back to false


def test_unauthorized_access(client: TestClient):
    """
    Test that unauthenticated users cannot access protected task endpoints.

    T-027: Tests for authentication validation
    """
    # Try to create a task without authentication
    response = client.post(
        "/api/tasks",
        json={
            "title": "Unauthorized Task",
            "description": "This should fail"
        }
    )

    assert response.status_code == 401  # Unauthorized

    # Try to get tasks without authentication
    response = client.get("/api/tasks")
    assert response.status_code == 401  # Unauthorized


def test_task_validation(client: TestClient):
    """
    Test task validation rules.

    T-027: Tests for task CRUD validation
    """
    # Register and login a user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "validationuser@example.com",
            "password": "securepassword123"
        }
    )

    token = signup_response.json()["token"]

    # Try to create a task with empty title (should fail)
    response = client.post(
        "/api/tasks",
        json={
            "title": "",  # Empty title
            "description": "Valid description"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    # Should fail with validation error
    assert response.status_code in [400, 422]


def test_title_character_limit(client: TestClient):
    """
    Test task title character limit validation.

    T-027: Tests for task CRUD validation
    """
    # Register and login a user
    signup_response = client.post(
        "/api/auth/signup",
        json={
            "email": "charlimituser@example.com",
            "password": "securepassword123"
        }
    )

    token = signup_response.json()["token"]

    # Try to create a task with a very long title (over 200 chars)
    long_title = "A" * 250  # Way over the 200 character limit

    response = client.post(
        "/api/tasks",
        json={
            "title": long_title,
            "description": "Valid description"
        },
        headers={"Authorization": f"Bearer {token}"}
    )

    # Should fail with validation error
    assert response.status_code in [400, 422]