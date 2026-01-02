# MenuHandler: T-025, T-028, T-029 - Implement MenuHandler class with display and routing
# References: spec.md §User Stories, plan.md §Menu Handler

from typing import Optional, Callable
from services.todo_manager import TodoManager
from cli.input_handler import InputHandler
from cli.display import DisplayFormatter


class MenuHandler:
    """
    Display main menu and handle user choices.

    Responsibilities:
        - Display menu with numbered options
        - Get user choice
        - Route to appropriate action via callbacks

    Menu Options:
        1. Add Task
        2. View Task List
        3. Update Task
        4. Delete Task
        5. Mark as Complete/Incomplete
        6. Exit

    References:
        - spec.md: FR-001 (menu display), FR-017 (run in loop)
        - plan.md: Menu Handler §Component
    """

    MENU_OPTIONS = {
        "1": ("Add Task", "add_task"),
        "2": ("View Task List", "view_tasks"),
        "3": ("Update Task", "update_task"),
        "4": ("Delete Task", "delete_task"),
        "5": ("Mark as Complete/Incomplete", "toggle_complete"),
        "6": ("Exit", "exit")
    }

    def __init__(self):
        """Initialize menu handler with input handler and display formatter."""
        self.input_handler = InputHandler()
        self.display_formatter = DisplayFormatter()

    def display_menu(self) -> None:
        """
        Show numbered menu options.

        References:
            - spec.md: FR-001 (menu display)
        """
        print("\n=== Todo Menu ===")
        for key, (label, _) in sorted(self.MENU_OPTIONS.items()):
            print(f"   {key}. {label}")

    def get_user_choice(self) -> str:
        """
        Prompt for and validate menu selection.

        Returns:
            str: Validated menu choice (1-6)

        References:
            - spec.md: FR-001 (menu display)
        """
        choice = input("\nEnter your choice (1-6): ").strip()

        while not self.input_handler.validate_menu_choice(choice):
            print("Invalid choice. Please enter a number 1-6.")
            choice = input("\nEnter your choice (1-6): ").strip()

        return choice

    def handle_choice(self, choice: str, todo_manager, refresh_display: Callable[[], None] = None) -> bool:
        """
        Route to appropriate action based on user choice.

        Args:
            choice: Validated menu choice (1-6)
            todo_manager: TodoManager instance for task operations
            refresh_display: Optional callback to refresh task list display after operations

        Returns:
            bool: True if should continue loop, False if should exit

        References:
            - spec.md: FR-001 (menu display and routing)
        """
        if choice == "6":
            return False  # Exit

        # Get action function from menu options
        action_key = self.MENU_OPTIONS[choice][1] if choice in self.MENU_OPTIONS else None

        if action_key:
            # Call the appropriate flow method
            flow_methods = {
                'add_task': self.add_task_flow,
                'view_tasks': self.view_tasks_flow,
                'update_task': self.update_task_flow,
                'delete_task': self.delete_task_flow,
                'toggle_complete': self.toggle_complete_flow
            }

            flow_func = flow_methods.get(action_key)

            if flow_func:
                try:
                    return flow_func(todo_manager)
                except ValueError as e:
                    print(f"\nError: {e}")
                    return True
                except Exception as e:
                    print(f"\nUnexpected error: {e}")
                    return True
        else:
            print("Invalid choice. Please try again.")
            return True

    def add_task_flow(self, todo_manager) -> bool:
        """
        Complete flow for adding a task.

        Args:
            todo_manager: TodoManager instance

        Returns:
            bool: True to continue
        """
        print("\n--- Add Task ---")

        # Get task title
        title = self.input_handler.get_task_title()

        # Get optional description
        description = self.input_handler.get_task_description()

        # Create task via TodoManager
        task = todo_manager.add_task(title, description)

        # Display updated task list
        self.display_updated_list(todo_manager)

        return True

    def update_task_flow(self, todo_manager) -> bool:
        """
        Complete flow for updating a task.

        Args:
            todo_manager: TodoManager instance

        Returns:
            bool: True to continue
        """
        print("\n--- Update Task ---")

        # Get task ID
        task_id = self.input_handler.get_task_id("Enter task ID to update: ")

        # Check if task exists
        task = todo_manager.get_task(task_id)
        if task is None:
            print("Task not found. Please try again.")
            return True

        # Show current task details
        print(f"\nCurrent task:")
        print(f"  ID: {task.id}")
        print(f"  Title: {task.title}")
        print(f"  Status: {'[X] Completed' if task.completed else '[ ] Pending'}")
        if task.description:
            print(f"  Description: {task.description}")

        # Get new title
        new_title = input("\nEnter new title (or press Enter to keep current): ").strip()
        if not new_title:
            new_title = None

        # Get new description
        new_description = self.input_handler.get_task_description()
        if not new_description:
            new_description = None

        # Update task
        todo_manager.update_task(task_id, title=new_title, description=new_description)

        # Display updated task
        updated_task = todo_manager.get_task(task_id)
        print(f"\nUpdated task:")
        print(self.display_formatter.format_task(updated_task))

        return True

    def delete_task_flow(self, todo_manager) -> bool:
        """
        Complete flow for deleting a task with confirmation.

        Args:
            todo_manager: TodoManager instance

        Returns:
            bool: True to continue
        """
        print("\n--- Delete Task ---")

        # Get task ID
        task_id = self.input_handler.get_task_id("Enter task ID to delete: ")

        # Check if task exists
        task = todo_manager.get_task(task_id)
        if task is None:
            print("Task not found. Please try again.")
            return True

        # Show task to delete
        print(f"\nTask to delete:")
        print(self.display_formatter.format_task(task))

        # Get confirmation
        if self.input_handler.get_confirmation(f"Are you sure you want to delete task {task_id}? (y/n): "):
            # Delete task
            todo_manager.delete_task(task_id)

            print("Task deleted successfully.")
        else:
            print("Deletion cancelled.")

        # Display updated list
        self.display_updated_list(todo_manager)

        return True

    def toggle_complete_flow(self, todo_manager) -> bool:
        """
        Complete flow for toggling completion status.

        Args:
            todo_manager: TodoManager instance

        Returns:
            bool: True to continue
        """
        print("\n--- Mark as Complete/Incomplete ---")

        # Get task ID
        task_id = self.input_handler.get_task_id("Enter task ID: ")

        # Check if task exists
        task = todo_manager.get_task(task_id)
        if task is None:
            print("Task not found. Please try again.")
            return True

        # Show current status
        print(f"\nCurrent status: {'[X] Completed' if task.completed else '[ ] Pending'}")

        # Toggle completion
        todo_manager.toggle_complete(task_id)

        # Display updated task
        updated_task = todo_manager.get_task(task_id)
        print(self.display_formatter.format_task(updated_task))

        return True

    def view_tasks_flow(self, todo_manager) -> bool:
        """
        Complete flow for viewing task list.

        Args:
            todo_manager: TodoManager instance

        Returns:
            bool: True to continue
        """
        print("\n--- View Task List ---")

        # Get statistics
        total, completed = todo_manager.get_statistics()

        # Display task list with summary
        print(self.display_formatter.format_task_list(todo_manager.get_all_tasks(), total, completed))

        # Wait for user to press Enter before returning
        input("\nPress Enter to continue...")

        return True

    def display_updated_list(self, todo_manager) -> None:
        """
        Display updated task list after operations.

        Args:
            todo_manager: TodoManager instance
        """
        total, completed = todo_manager.get_statistics()
        print(self.display_formatter.format_task_list(todo_manager.get_all_tasks(), total, completed))
