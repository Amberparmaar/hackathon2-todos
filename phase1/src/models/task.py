# Task: T-001 - Create Task Model
# References: specify.md §Task Model, plan.md §Task Model

from datetime import datetime
from typing import Optional


class Task:
    """
    Represents a todo item in the application.

    Attributes:
        id (int): Unique auto-incremented identifier
        title (str): Task title, 1-200 characters, required
        description (str | None): Optional description, max 1000 characters
        completed (bool): Completion status (False by default)
        created_at (datetime): Timestamp when task was created

    References:
        - spec.md: FR-002, FR-003, SC-003
        - plan.md: Data Model §Task Entity
    """

    def __init__(self, id: int, title: str, description: Optional[str] = None):
        """
        Initialize a new Task.

        Args:
            id: Unique task identifier
            title: Task title (1-200 chars, required)
            description: Optional description (max 1000 chars)

        Raises:
            ValueError: If title is empty or exceeds character limits
        """
        # Validate title
        if not title or not title.strip():
            raise ValueError("Title cannot be empty")
        title = title.strip()
        if len(title) > 200:
            raise ValueError("Title exceeds 200 character limit")

        # Validate description
        if description is not None:
            description = description.strip()
            if len(description) > 1000:
                raise ValueError("Description exceeds 1000 character limit")

        self.id = id
        self.title = title
        self.description = description
        self.completed = False
        self.created_at = datetime.now()

    def __str__(self) -> str:
        """
        Return display-friendly string representation.

        Format: "[ID] Title - Status (Description)"

        Example: "1. Buy groceries - [ ] Pending (Milk, eggs, bread)"
        """
        status = "[X] Completed" if self.completed else "[ ] Pending"
        desc = f" ({self.description})" if self.description else ""
        return f"{self.id}. {self.title} - {status}{desc}"

    def __repr__(self) -> str:
        """Return debug representation for development."""
        return f"Task(id={self.id}, title='{self.title}', completed={self.completed})"

    def to_dict(self) -> dict:
        """
        Return task as dictionary (for potential future use).

        References:
            - plan.md: Data Model §Task Entity
        """
        return {
            "id": self.id,
            "title": self.title,
            "description": self.description,
            "completed": self.completed,
            "created_at": self.created_at.isoformat()
        }
