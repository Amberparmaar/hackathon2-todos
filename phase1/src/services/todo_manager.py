# TodoManager: T-005, T-016, T-017 - Implement TodoManager service class
# References: spec.md §Task Model, plan.md §TodoManager

from typing import List, Optional
from datetime import datetime
from models.task import Task



class TodoManager:
    """
    Manages in-memory task storage and operations.

    Responsibilities:
        - Maintain in-memory list of Task objects
        - Assign auto-incremented IDs
        - CRUD operations (Create, Read, Update, Delete)
        - Toggle completion status
        - Statistics calculation (total tasks, completed tasks)

    References:
        - spec.md: FR-001 (menu), FR-002 (add), FR-004 (view), FR-006 (update), FR-007 (delete), FR-009 (toggle), FR-005 (stats)
        - plan.md: TodoManager §Service Layer
    """

    def __init__(self):
        """Initialize empty task list and ID counter.

        References:
            - plan.md: TodoManager §Internal State
        """
        self.tasks: List[Task] = []
        self.next_id: int = 1

    def add_task(self, title: str, description: Optional[str] = None) -> Task:
        """
        Create new task with next ID.

        Args:
            title: Task title (1-200 chars, required)
            description: Optional description (max 1000 chars)

        Returns:
            Task: Newly created task object

        References:
            - spec.md: FR-002 (add task)
            - plan.md: TodoManager §CRUD Operations
        """
        # Create task with next ID
        task = Task(self.next_id, title, description)

        # Increment ID for next task
        self.next_id += 1

        # Add to in-memory storage
        self.tasks.append(task)

        return task

    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Retrieve task by ID.

        Args:
            task_id: Unique task identifier

        Returns:
            Task if found, None otherwise

        References:
            - spec.md: FR-014 (invalid ID handling)
            - plan.md: TodoManager §CRUD Operations
        """
        for task in self.tasks:
            if task.id == task_id:
                return task
        return None

    def task_exists(self, task_id: int) -> bool:
        """
        Check if task ID is valid.

        Args:
            task_id: Task identifier to validate

        Returns:
            bool: True if task ID exists in list

        References:
            - spec.md: FR-014 (invalid ID handling)
            - plan.md: TodoManager §CRUD Operations
        """
        return any(task.id == task_id for task in self.tasks)

    def get_all_tasks(self) -> List[Task]:
        """
        Return all tasks.

        Returns:
            List[Task]: All task objects

        References:
            - spec.md: FR-004 (view tasks)
            - plan.md: TodoManager §CRUD Operations
        """
        return self.tasks

    def update_task(self, task_id: int, title: Optional[str] = None,
                  description: Optional[str] = None) -> Optional[Task]:
        """
        Update task attributes by ID.

        Args:
            task_id: Task identifier
            title: Optional new title
            description: Optional new description

        Returns:
            Task if updated, None if not found

        References:
            - spec.md: FR-006 (update task)
            - plan.md: TodoManager §CRUD Operations
        """
        task = self.get_task(task_id)

        if task is None:
            return None

        # Update title if provided
        if title is not None:
            task.title = title

        # Update description if provided
        if description is not None:
            task.description = description

        return task

    def delete_task(self, task_id: int) -> bool:
        """
        Remove task by ID.

        Args:
            task_id: Task identifier to delete

        Returns:
            bool: True if deleted, False if not found

        References:
            - spec.md: FR-007 (delete task)
            - plan.md: TodoManager §CRUD Operations
        """
        task = self.get_task(task_id)

        if task is None:
            return False

        self.tasks.remove(task)
        return True

    def toggle_complete(self, task_id: int) -> Optional[Task]:
        """
        Switch completion status of a task.

        Args:
            task_id: Task identifier to toggle

        Returns:
            Task if found, None otherwise

        References:
            - spec.md: FR-009 (toggle complete)
            - plan.md: TodoManager §CRUD Operations
        """
        task = self.get_task(task_id)

        if task is None:
            return None

        task.completed = not task.completed
        return task

    def get_statistics(self) -> tuple[int, int]:
        """
        Return statistics about tasks.

        Returns:
            tuple: (total_count, completed_count)

        References:
            - spec.md: FR-005 (statistics)
            - plan.md: TodoManager §CRUD Operations
        """
        total = len(self.tasks)
        completed = sum(1 for task in self.tasks if task.completed)
        return total, completed
