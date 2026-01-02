# DisplayFormatter: T-019, T-020, T-021, T-022 - Implement display utilities
# References: spec.md §User Stories, plan.md §Display Formatter

from typing import List
from models.task import Task


class DisplayFormatter:
    """
    Format task lists and messages for console output.

    Responsibilities:
        - Format individual task display (ID, title, status, description)
        - Format task list with summary statistics
        - Display status indicators (✅ Completed / ❌ Pending)
        - Truncate descriptions for display

    Methods:
        format_task: Return formatted string for single task
        format_task_list: Return formatted list with summary
        format_summary: Return statistics summary string
        truncate_description: Truncate with ellipsis

    References:
        - spec.md: FR-004 (task list display), FR-005 (summary stats)
        - plan.md: Display Formatter §Component
    """

    STATUS_COMPLETE = "[X] Completed"
    STATUS_PENDING = "[ ] Pending"
    MAX_DISPLAY_LENGTH = 50  # Characters for description truncation

    @staticmethod
    def format_task(task: Task) -> str:
        """
        Return formatted string for single task.

        Format: "[ID] Title - Status (Description)"

        Example: "1. Buy groceries - ❌ Pending (Milk, eggs, bread)"

        References:
            - spec.md: FR-004 (task list display)
        """
        status = DisplayFormatter.STATUS_COMPLETE if task.completed else DisplayFormatter.STATUS_PENDING
        desc = f" ({task.description})" if task.description else ""
        return f"{task.id}. {task.title} - {status}{desc}"

    @staticmethod
    def format_task_list(tasks: List[Task], total: int, completed: int) -> str:
        """
        Return formatted list with summary statistics.

        Format:
            === Task List ===
            Total tasks: X, Completed: Y

            [ID] Title - Status (Description)
            ...

        References:
            - spec.md: FR-004 (task list display), FR-005 (summary stats)
        """
        if not tasks:
            return "=== Task List ===\n\nNo tasks found. Add a task to get started!\n"

        output = [
            "=== Task List ===",
            f"Total tasks: {total}, Completed: {completed}",
            ""  # Empty line for separation
        ]

        for task in tasks:
            output.append(DisplayFormatter.format_task(task))

        return "\n".join(output)

    @staticmethod
    def format_summary(total: int, completed: int) -> str:
        """
        Return statistics summary string.

        Format: "Total tasks: X, Completed: Y"

        References:
            - spec.md: FR-005 (statistics display)
        """
        return f"Total tasks: {total}, Completed: {completed}"

    @staticmethod
    def truncate_description(description: str, max_length: int = MAX_DISPLAY_LENGTH) -> str:
        """
        Truncate description with ellipsis if too long.

        Args:
            description: Full description text
            max_length: Maximum characters to display

        Returns:
            str: Truncated description or original if within limit

        References:
            - spec.md: FR-004 (description truncation for display)
        """
        if len(description) <= max_length:
            return description
        return description[:max_length - 3] + "..."
