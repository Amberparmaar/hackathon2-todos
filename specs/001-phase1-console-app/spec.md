# Feature Specification: Phase I - In-Memory Python Console App

**Feature Branch**: `001-phase1-console-app`
**Created**: 2026-01-02
**Status**: Draft
**Input**: User description: "Phase I: In-Memory Python Console App for Evolution of Todo project"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create and View Tasks (Priority: P1)

As a user, I can create new tasks with a title and optional description, then view all tasks in a list format showing key information.

**Why this priority**: This is core MVP functionality - without ability to create and view tasks, application has no value. This provides immediate utility to users.

**Independent Test**: Can be fully tested by adding multiple tasks and verifying they appear correctly in list view with all required information displayed.

**Acceptance Scenarios**:

1. **Given** application starts with no tasks, **When** user adds a task with title "Buy groceries" and description "Milk, eggs, bread", **Then** a new task with unique ID 1 is created and appears in task list
2. **Given** 5 tasks exist in memory, **When** user selects "View Task List", **Then** all 5 tasks are displayed with ID, title, status, description (if present), and a summary showing "5 total tasks, 2 completed"
3. **Given** a task with a long description (500 chars) exists, **When** viewing tasks, **Then** description is truncated appropriately for display

---

### User Story 2 - Update and Complete Tasks (Priority: P2)

As a user, I can modify existing task information and mark tasks as complete or incomplete.

**Why this priority**: These are essential task management operations that enable users to maintain an accurate todo list. Less critical than creation but necessary for ongoing utility.

**Independent Test**: Can be fully tested by adding a task, updating its details, toggling its completion status, and verifying changes are reflected immediately.

**Acceptance Scenarios**:

1. **Given** task ID 3 with title "Clean house" and status incomplete, **When** user updates title to "Clean kitchen", **Then** task ID 3 now shows title "Clean kitchen" while all other attributes remain unchanged
2. **Given** task ID 2 with status incomplete, **When** user marks it as complete, **Then** task status changes to "✅ Completed" and completed task count in summary increments
3. **Given** task ID 4 marked as complete, **When** user marks it as incomplete, **Then** task status changes to "❌ Pending" and completed task count decrements

---

### User Story 3 - Delete Tasks (Priority: P3)

As a user, I can remove tasks from list when they are no longer needed.

**Why this priority**: Important for task management hygiene, but users can still use application without this feature. Completes basic CRUD functionality.

**Independent Test**: Can be fully tested by adding a task, selecting delete, confirming deletion, and verifying task no longer appears in list.

**Acceptance Scenarios**:

1. **Given** 5 tasks exist, **When** user deletes task ID 3 and confirms, **Then** task ID 3 is removed and only 4 tasks remain in list
2. **Given** 10 tasks with mixed completion status, **When** user deletes a completed task, **Then** total task count decreases to 9 and completed count updates accordingly
3. **Given** user selects delete for task ID 5, **When** application prompts for confirmation, **Then** user can cancel deletion if they change their mind

---

### User Story 4 - Menu Navigation (Priority: P1)

As a user, I can interact with application through a simple text-based menu that runs in a loop until I choose to exit.

**Why this priority**: The menu is primary interface for all functionality. Without it, users cannot access any features. This is critical for usability.

**Independent Test**: Can be fully tested by navigating through all menu options multiple times and verifying each option performs its intended action.

**Acceptance Scenarios**:

1. **Given** application starts, **When** main menu is displayed, **Then** it shows numbered options for Add Task, View Tasks, Update Task, Delete Task, Mark Complete/Incomplete, and Exit
2. **Given** user is viewing task list, **When** action completes, **Then** main menu reappears ready for next action
3. **Given** user selects "Exit" from menu, **When** confirmed, **Then** application terminates cleanly with a farewell message

---

### Edge Cases

- **What happens when** user enters an invalid task ID (non-existent or non-numeric)? The application must display a clear error message "Task not found" and return to menu or prompt again.
- **What happens when** user enters a task title exceeding 200 characters? The application must truncate or reject input with a clear message about character limit.
- **What happens when** user enters an empty task title? The application must require a non-empty title and prompt again until valid input is provided.
- **What happens when** description exceeds 1000 characters? The application must truncate or reject input with a clear message about character limit.
- **What happens when** user enters an invalid menu option? The application must display an error message and re-display menu.
- **How does system handle** no tasks in list? The "View Task List" must display a friendly message like "No tasks found. Add a task to get started!" instead of showing an empty list.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST present a text-based menu with numbered options for all available actions (Add, View, Update, Delete, Toggle Complete, Exit)
- **FR-002**: System MUST allow users to add a new task with a required title (1-200 characters) and optional description (max 1000 characters)
- **FR-003**: System MUST assign a unique auto-incremented ID to each new task
- **FR-004**: System MUST display all tasks in a numbered list showing ID, title, completion status (✅ or ❌), and truncated description
- **FR-005**: System MUST show summary statistics including total task count and completed task count
- **FR-006**: Users MUST be able to update title or description of an existing task by providing its ID
- **FR-007**: Users MUST be able to delete a task by providing its ID
- **FR-008**: System MUST confirm task deletion before executing deletion
- **FR-009**: Users MUST be able to toggle completion status of a task by ID
- **FR-010**: System MUST display completion status as "✅ Completed" for completed tasks and "❌ Pending" for incomplete tasks
- **FR-011**: System MUST store all tasks in memory only with no persistence to file or database
- **FR-012**: System MUST validate that task titles are not empty and do not exceed 200 characters
- **FR-013**: System MUST validate that task descriptions do not exceed 1000 characters if provided
- **FR-014**: System MUST handle invalid task IDs with a clear error message "Task not found" and return to menu
- **FR-015**: System MUST handle invalid menu selections with an error message and re-display menu
- **FR-016**: System MUST display a friendly message when no tasks exist instead of an empty list
- **FR-017**: System MUST run in a continuous loop until user explicitly chooses to exit
- **FR-018**: System MUST handle invalid inputs gracefully (e.g., non-numeric input, invalid ID)
- **FR-019**: After each operation (except Exit), system MUST show updated task list briefly or confirmation

### Non-Functional Requirements

- **NFR-001**: Code MUST follow clean, readable Python code following PEP8 standards
- **NFR-002**: Proper project structure MUST be maintained with appropriate module organization
- **NFR-003**: No external libraries MUST be used except Python standard library
- **NFR-004**: No file persistence or database integration MUST be included (in-memory storage only)
- **NFR-005**: No authentication or user isolation MUST be implemented (single user, in-memory)
- **NFR-006**: Application MUST be compatible with Python 3.13+

### Key Entities

- **Task**: Represents a todo item with attributes: unique auto-incremented ID (int), title (string, 1-200 chars, required), description (string, max 1000 chars, optional), completion status (boolean), and creation timestamp
- **Task List**: Simple in-memory list collection of Task objects maintained during application runtime

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Application starts and immediately displays menu to user within 2 seconds of launch
- **SC-002**: Users can add a new task with title and description within 10 seconds of launching application
- **SC-003**: Users can view all tasks in a clearly formatted list with all required information visible at a glance
- **SC-004**: Users can update any task attribute (title or description) by providing task ID in under 15 seconds
- **SC-005**: Users can delete a task by ID with confirmation prompt under 10 seconds
- **SC-006**: Users can toggle task completion status in under 5 seconds
- **SC-007**: The application handles at least 100 tasks in memory without performance degradation or display issues
- **SC-008**: All error messages are clear and actionable, allowing users to understand what went wrong and how to fix it
- **SC-009**: Users can complete a full workflow (add, view, update, complete, delete) within 2 minutes of first use without needing to restart application
- **SC-010**: Invalid task ID displays clear error message "Task not found" and returns to menu
- **SC-011**: When deleting a task, display removes task and re-numbers display appropriately
- **SC-012**: Toggle operation correctly switches status between completed (✅) and incomplete (❌)
- **SC-013**: View shows correct status indicators (✅ for completed, ❌ for pending) and accurate task counts
- **SC-014**: App exits cleanly on option 6 without errors or hanging
