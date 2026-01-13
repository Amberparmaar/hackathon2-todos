"""
Multi-User Isolation Test Suite for Phase II Full-Stack Multi-User Web Application.

Task Reference: T-029
Spec Reference: @phase2/specs/plan.md - Testing Section

This test suite validates complete user data isolation:
- User A creates task → visible to User A only
- User A lists tasks → sees only User A's tasks
- User B lists tasks → sees only User B's tasks
- User A tries to update User B's task → returns 403
- User A deletes task → User B's task list unchanged
- User A signs out → can't access tasks with token
- Invalid JWT token → 401 error on protected routes
"""
import pytest
import json
from fastapi.testclient import TestClient
from uuid import UUID


def test_user_a_creates_task_visible_to_user_a_only(client: TestClient):
    """
    Test that tasks created by User A are visible only to User A.

    T-029: Test 1: User A creates task → visible to User A only
    """
    # Register User A
    user_a_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "usera_isolation_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_a_signup.status_code == 200
    user_a_token = user_a_signup.json()["token"]

    # User A creates a task
    create_task_response = client.post(
        "/api/tasks",
        json={
            "title": "User A's Private Task",
            "description": "This task should only be visible to User A"
        },
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    assert create_task_response.status_code == 200
    task_data = create_task_response.json()
    user_a_task_id = task_data["id"]
    assert UUID(user_a_task_id)

    # User A should be able to see their own task
    get_task_response = client.get(
        f"/api/tasks/{user_a_task_id}",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    assert get_task_response.status_code == 200
    assert get_task_response.json()["id"] == user_a_task_id
    assert get_task_response.json()["title"] == "User A's Private Task"


def test_user_a_lists_sees_only_own_tasks(client: TestClient):
    """
    Test that User A only sees their own tasks when listing.

    T-029: Test 2: User A lists tasks → sees only User A's tasks
    """
    # Register User A
    user_a_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "usera_list_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_a_signup.status_code == 200
    user_a_token = user_a_signup.json()["token"]

    # User A creates a task
    client.post(
        "/api/tasks",
        json={
            "title": "User A's Task 1",
            "description": "Task 1 for User A"
        },
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    # User A should only see their own task
    list_response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    assert list_response.status_code == 200
    tasks_data = list_response.json()
    user_a_tasks = tasks_data["tasks"]

    # Verify User A only sees their own tasks
    for task in user_a_tasks:
        assert task["title"].startswith("User A's Task")


def test_user_b_lists_sees_only_own_tasks(client: TestClient):
    """
    Test that User B only sees their own tasks when listing.

    T-029: Test 3: User B lists tasks → sees only User B's tasks
    """
    # Register User A
    user_a_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "usera_for_userb_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_a_signup.status_code == 200
    user_a_token = user_a_signup.json()["token"]

    # Register User B
    user_b_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "userb_isolation_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_b_signup.status_code == 200
    user_b_token = user_b_signup.json()["token"]

    # User A creates a task
    user_a_task_response = client.post(
        "/api/tasks",
        json={
            "title": "User A's Exclusive Task",
            "description": "This belongs to User A"
        },
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    user_a_task_id = user_a_task_response.json()["id"]

    # User B creates a task
    user_b_task_response = client.post(
        "/api/tasks",
        json={
            "title": "User B's Exclusive Task",
            "description": "This belongs to User B"
        },
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    user_b_task_id = user_b_task_response.json()["id"]

    # User B should only see their own task, not User A's
    list_response = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    assert list_response.status_code == 200
    tasks_data = list_response.json()
    user_b_tasks = tasks_data["tasks"]

    # User B should only see their own task
    assert len(user_b_tasks) == 1
    assert user_b_tasks[0]["id"] == user_b_task_id
    assert user_b_tasks[0]["title"] == "User B's Exclusive Task"

    # Verify User B cannot see User A's task
    for task in user_b_tasks:
        assert task["id"] != user_a_task_id


def test_user_a_cannot_access_user_b_task(client: TestClient):
    """
    Test that User A cannot access User B's task.

    T-029: Test 4: User A tries to update User B's task → returns 403
    """
    # Register User A
    user_a_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "usera_access_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_a_signup.status_code == 200
    user_a_token = user_a_signup.json()["token"]

    # Register User B
    user_b_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "userb_access_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_b_signup.status_code == 200
    user_b_token = user_b_signup.json()["token"]

    # User B creates a task
    user_b_task_response = client.post(
        "/api/tasks",
        json={
            "title": "User B's Protected Task",
            "description": "User A should not be able to access this"
        },
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    user_b_task_id = user_b_task_response.json()["id"]

    # User A should NOT be able to access User B's task
    get_response = client.get(
        f"/api/tasks/{user_b_task_id}",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    # Should return 403 (Forbidden) or 404 (Not Found) for security
    assert get_response.status_code in [403, 404]

    # User A should NOT be able to update User B's task
    update_response = client.put(
        f"/api/tasks/{user_b_task_id}",
        json={
            "title": "Hacked by User A",
            "description": "This should fail"
        },
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    # Should return 403 (Forbidden) or 404 (Not Found)
    assert update_response.status_code in [403, 404]

    # User A should NOT be able to delete User B's task
    delete_response = client.delete(
        f"/api/tasks/{user_b_task_id}",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    # Should return 403 (Forbidden) or 404 (Not Found)
    assert delete_response.status_code in [403, 404]

    # User A should NOT be able to toggle User B's task
    toggle_response = client.patch(
        f"/api/tasks/{user_b_task_id}/toggle",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    # Should return 403 (Forbidden) or 404 (Not Found)
    assert toggle_response.status_code in [403, 404]


def test_user_a_deletes_task_user_b_unchanged(client: TestClient):
    """
    Test that when User A deletes their task, User B's tasks remain unchanged.

    T-029: Test 5: User A deletes task → User B's task list unchanged
    """
    # Register User A
    user_a_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "usera_delete_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_a_signup.status_code == 200
    user_a_token = user_a_signup.json()["token"]

    # Register User B
    user_b_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "userb_delete_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_b_signup.status_code == 200
    user_b_token = user_b_signup.json()["token"]

    # User A creates a task
    user_a_task_response = client.post(
        "/api/tasks",
        json={
            "title": "User A's Deletable Task",
            "description": "Will be deleted by User A"
        },
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    user_a_task_id = user_a_task_response.json()["id"]

    # User B creates a task
    user_b_task_response = client.post(
        "/api/tasks",
        json={
            "title": "User B's Untouchable Task",
            "description": "Should remain after User A's deletion"
        },
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    user_b_task_id = user_b_task_response.json()["id"]

    # Verify User B initially sees their task
    user_b_initial_tasks = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    assert user_b_initial_tasks.status_code == 200
    initial_count = len(user_b_initial_tasks.json()["tasks"])

    # User A deletes their task
    delete_response = client.delete(
        f"/api/tasks/{user_a_task_id}",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    assert delete_response.status_code == 200

    # Verify User B still sees their task and count is unchanged
    user_b_after_delete = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {user_b_token}"}
    )

    assert user_b_after_delete.status_code == 200
    final_tasks = user_b_after_delete.json()["tasks"]
    final_count = len(final_tasks)

    # User B should still see the same number of tasks
    assert initial_count == final_count

    # User B should still see their original task
    user_b_task_still_exists = any(task["id"] == user_b_task_id for task in final_tasks)
    assert user_b_task_still_exists


def test_user_a_signs_out_cannot_access_tasks(client: TestClient):
    """
    Test that after signing out, User A cannot access tasks with old token.

    T-029: Test 6: User A signs out → can't access tasks with token
    """
    # Register User A
    user_a_signup = client.post(
        "/api/auth/signup",
        json={
            "email": "usera_signout_test@example.com",
            "password": "securepassword123"
        }
    )

    assert user_a_signup.status_code == 200
    user_a_token = user_a_signup.json()["token"]

    # Verify User A can access tasks with token
    initial_access = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    assert initial_access.status_code == 200  # Should work initially

    # User A signs out
    signout_response = client.post(
        "/api/auth/signout",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    assert signout_response.status_code == 200

    # User A should no longer be able to access tasks with the same token
    post_signout_access = client.get(
        "/api/tasks",
        headers={"Authorization": f"Bearer {user_a_token}"}
    )

    assert post_signout_access.status_code == 401  # Should be unauthorized now


def test_invalid_jwt_token_returns_401(client: TestClient):
    """
    Test that invalid JWT tokens return 401 error.

    T-029: Test 7: Invalid JWT token → 401 error on protected routes
    """
    # Try to access protected route with invalid token
    response = client.get(
        "/api/tasks",
        headers={"Authorization": "Bearer invalid-token-structure"}
    )

    assert response.status_code == 401

    # Try to access protected route with malformed token
    response2 = client.post(
        "/api/tasks",
        json={
            "title": "Should Fail",
            "description": "Invalid token test"
        },
        headers={"Authorization": "Bearer totally.malformed.token"}
    )

    assert response2.status_code == 401

    # Try to access protected route with expired token (if we had a way to create one)
    # This would typically require mocking the time or creating a test with a past expiry