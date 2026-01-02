# InputHandler: T-023, T-024 - Implement input validation utilities
# References: spec.md §Validation Rules, plan.md §Input Handler

class InputHandler:
    """
    Validate and sanitize user input.

    Responsibilities:
        - Validate task titles (non-empty, ≤ 200 chars)
        - Validate descriptions (≤ 1000 chars)
        - Validate task IDs (numeric, exists in list)
        - Validate menu choices (1-6)
        - Handle non-numeric input gracefully

    Methods:
        get_task_title: Prompt and validate title
        get_task_description: Prompt and validate optional description
        get_task_id: Prompt and validate ID
        get_confirmation: Get yes/no confirmation
        validate_menu_choice: Check if choice is 1-6

    Error Messages:
        Invalid task ID: "Task not found. Please try again."
        Invalid menu choice: "Invalid choice. Please enter a number 1-6."
        Empty title: "Title cannot be empty. Please try again."
        Title too long: "Title exceeds 200 character limit."
        Description too long: "Description exceeds 1000 character limit."

    References:
        - spec.md: FR-012, FR-013, FR-014
        - plan.md: Input Handler §Validation
    """

    @staticmethod
    def get_task_title() -> str:
        """
        Prompt and validate task title.

        Returns:
            str: Validated task title

        References:
            - spec.md: FR-012 (title validation)
        """
        while True:
            title = input("Enter task title (1-200 characters): ").strip()

            # Validate not empty
            if not title:
                print("Title cannot be empty. Please try again.")
                continue

            # Validate length
            if len(title) > 200:
                print("Title exceeds 200 character limit.")
                continue

            return title

    @staticmethod
    def get_task_description() -> Optional[str]:
        """
        Prompt and validate optional task description.

        Returns:
            str | None: Validated description or None if skipped

        References:
            - spec.md: FR-013 (description validation)
        """
        description = input("Enter task description (optional, press Enter to skip): ").strip()

        # Allow empty/skipped description
        if not description:
            return None

        # Validate length
        if len(description) > 1000:
            print("Description exceeds 1000 character limit.")
            return None

        return description

    @staticmethod
    def get_task_id(prompt_message: str = "Enter task ID: ") -> int:
        """
        Prompt and validate task ID.

        Args:
            prompt_message: Custom prompt for ID input

        Returns:
            int: Validated task ID

        References:
            - spec.md: FR-014 (task ID validation)
        """
        while True:
            task_id_input = input(prompt_message).strip()

            # Validate numeric
            if not task_id_input.isdigit():
                print("Invalid input. Please enter a numeric task ID.")
                continue

            return int(task_id_input)

    @staticmethod
    def get_confirmation(message: str) -> bool:
        """
        Get yes/no confirmation from user.

        Args:
            message: Confirmation prompt message

        Returns:
            bool: True if user confirms, False otherwise

        References:
            - spec.md: FR-008 (delete confirmation)
        """
        while True:
            choice = input(f"{message} (y/n): ").strip().lower()

            if choice in ['y', 'yes']:
                return True
            elif choice in ['n', 'no', '']:
                return False
            else:
                print("Please enter 'y' or 'n'.")

    @staticmethod
    def validate_menu_choice(choice: str) -> bool:
        """
        Check if choice is 1-6.

        Args:
            choice: User's menu selection

        Returns:
            bool: True if valid (1-6), False otherwise

        References:
            - spec.md: FR-015 (menu validation)
        """
        valid_choices = ['1', '2', '3', '4', '5', '6']

        return choice in valid_choices
