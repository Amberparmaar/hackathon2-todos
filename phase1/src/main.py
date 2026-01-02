# Main Entry Point: T-005, T-006, T-007, T-008, T-059
# References: spec.md §User Stories, plan.md §Main Application

from typing import Optional
import time
from services.todo_manager import TodoManager
from cli.menu import MenuHandler


def clear_screen():
    """
    Clear screen for readability between operations.

    References:
        - spec.md: FR-019 (clear screen/pause for readability)
    """
    # Clear works on most systems
    print("\n" * 50)


def welcome_message():
    """
    Display welcome message when application starts.

    References:
        - spec.md: FR-017 (run in loop until exit)
        - plan.md: Main Application §Flow
    """
    print("\n" + "=" * 50)
    print("   Welcome to Todo App - Phase I")
    print("   In-Memory Python Console Application")
    print("=" * 50 + "\n")


def farewell_message():
    """
    Display farewell message on exit.

    References:
        - spec.md: FR-017 (run in loop until exit)
        - plan.md: Main Application §Flow
    """
    print("\n" + "=" * 50)
    print("   Thank you for using Todo App. Goodbye!")
    print("=" * 50 + "\n")


def main():
    """
    Main application entry point with menu loop.

    References:
        - spec.md: US4 (Menu Navigation)
        - plan.md: Main Application §Flow
        - spec.md: FR-017 (run in loop until exit)
        - spec.md: SC-014 (app exits cleanly)
    """
    # Initialize components
    todo_manager = TodoManager()
    menu_handler = MenuHandler()

    # Display welcome message
    welcome_message()

    # Main application loop
    try:
        while True:
            # Display menu
            menu_handler.display_menu()

            # Get user choice
            choice = menu_handler.get_user_choice()

            # Handle choice
            should_continue = menu_handler.handle_choice(choice, todo_manager)

            # Clear screen between operations for readability
            clear_screen()

            # Add brief pause for better UX
            if should_continue:
                time.sleep(0.5)

            # Exit if user chose option 6
            if not should_continue:
                break

    except KeyboardInterrupt:
        # Handle Ctrl+C gracefully
        print("\n\nExiting gracefully...")
    except Exception as e:
        # Handle unexpected errors
        print(f"\n\nUnexpected error: {e}")
    finally:
        # Always display farewell
        farewell_message()


if __name__ == "__main__":
    main()
