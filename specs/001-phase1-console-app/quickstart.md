# Phase I: In-Memory Python Console App - Quickstart

**Phase**: Phase I
**Feature**: In-Memory Python Console App
**Last Updated**: 2026-01-02

## Prerequisites

- Python 3.13 or higher installed
- Basic terminal/command line knowledge
- Text editor or IDE (for viewing generated code)

## Installation

```bash
# Ensure Python 3.13+ is installed
python --version

# Should show: Python 3.13.x or higher
```

No package installation is required (uses Python standard library only).

## Running the Application

### From Phase 1 Directory

```bash
cd phase1
python -m src.main
```

### From Project Root

```bash
python -m phase1.src.main
```

## First Run

When you first run the application:

1. **Welcome Message**: Application displays welcome message and instructions
2. **Main Menu**: You'll see 6 numbered options:
   ```
   === Todo Menu ===
   1. Add Task
   2. View Task List
   3. Update Task
   4. Delete Task
   5. Mark as Complete/Incomplete
   6. Exit
   Enter your choice (1-6):
   ```

3. **Choose Option**: Type number of desired action (1-6) and press Enter

## Adding Your First Task

1. Select option 1 (Add Task) from menu
2. **Enter Title**: Type your task title (e.g., "Buy groceries")
   - Title must be 1-200 characters
   - Cannot be empty
3. **Enter Description** (optional):
   - Type description if needed (e.g., "Milk, eggs, bread")
   - Press Enter to skip description
   - Maximum 1000 characters
4. **Confirmation**: "Task added successfully! (ID: 1)"

## Viewing Tasks

1. Select option 2 (View Task List) from menu
2. **See Display**:
   ```
   === Task List ===
   Total tasks: 1, Completed: 0

   [1] Buy groceries - ❌ Pending (Milk, eggs, bread)
   ```

## Updating a Task

1. Select option 3 (Update Task) from menu
2. **Enter Task ID**: Type the ID of task to update (e.g., 1)
3. **See Current Task**: Application shows current task details
4. **Enter New Title** (optional):
   - Type new title or press Enter to keep current
5. **Enter New Description** (optional):
   - Type new description or press Enter to keep current
6. **Confirmation**: "Task updated successfully!"

## Deleting a Task

1. Select option 4 (Delete Task) from menu
2. **Enter Task ID**: Type the ID of task to delete (e.g., 1)
3. **See Task to Delete**: Application shows task details
4. **Confirm Deletion**:
   - Type 'y' to confirm deletion
   - Type 'n' or anything else to cancel
5. **Confirmation**: "Task deleted successfully." or "Deletion cancelled."

## Toggling Completion Status

1. Select option 5 (Mark as Complete/Incomplete) from menu
2. **Enter Task ID**: Type the ID of task to toggle (e.g., 1)
3. **See Current Status**: Application shows current status
4. **Status Updates**: "Task status updated!"
5. **View Updated Task**: Task now shows:
   - ✅ Completed (if was pending)
   - ❌ Pending (if was completed)

## Exiting the Application

1. Select option 6 (Exit) from menu
2. **Farewell Message**: "Thank you for using Todo App. Goodbye!"
3. **Application Closes**: Terminates cleanly

## Common Error Messages

You may encounter these error messages:

| Error | Message | How to Fix |
|-------|---------|------------|
| Empty title | "Title cannot be empty. Please try again." | Enter a valid title |
| Title too long | "Title exceeds 200 character limit." | Shorten title |
| Description too long | "Description exceeds 1000 character limit." | Shorten description |
| Invalid task ID | "Task not found. Please check the ID and try again." | Check task list for valid ID |
| Invalid menu choice | "Invalid choice. Please enter a number between 1 and 6." | Enter number 1-6 |
| Non-numeric ID | "Invalid input. Please enter a numeric task ID." | Enter number only |

## Tips for New Users

1. **Start Simple**: Add a few tasks first to understand the interface
2. **Use Descriptions**: Add optional descriptions for better task clarity
3. **Complete Tasks**: Mark tasks as complete to track progress
4. **View List Often**: Check task list regularly to see progress
5. **Clean Up**: Delete completed tasks to keep list manageable

## Data Persistence

**Important**: This application stores tasks in **memory only**. When you close the application, **all tasks will be lost**.

This is intentional for Phase I to demonstrate core functionality. Future phases (II+) will add database persistence.

## Keyboard Shortcuts

Currently, no keyboard shortcuts are implemented in Phase I. Use numbered menu options (1-6).

## Getting Help

If you need help or have issues:

1. Check the [plan.md](plan.md) for detailed design
2. Check the [spec.md](spec.md) for requirements
3. Review error messages for guidance on fixing issues

## Next Steps

After becoming comfortable with Phase I:

- Explore Phase II: Full-Stack Web App with database persistence
- Learn about user authentication and multi-user support
- See how the application evolves to web interface

---

**Happy Task Management!** 📝
