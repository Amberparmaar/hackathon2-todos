# Tasks: Phase I - In-Memory Python Console App

**Input**: Design documents from `phase1/specs/`
**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are organized by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Single project**: `phase1/src/`, `phase1/tests/` at repository root
- Paths shown below assume single project - adjust based on plan.md structure

<!--
  ============================================================================
  IMPORTANT: The tasks below are generated based on spec.md and plan.md.
  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Create phase1 project structure per implementation plan
- [ ] T002 Initialize Python 3.13+ project structure in phase1/src/
- [ ] T003 [P] Create __init__.py files in all module directories
- [ ] T004 [P] Create empty placeholder for __main__ if needed

**Checkpoint**: Phase 1 project structure ready for implementation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Implement Task model class in phase1/src/models/task.py
- [ ] T006 Implement TodoManager service class in phase1/src/services/todo_manager.py
- [ ] T007 Create display formatter utility in phase1/src/cli/display.py
- [ ] T008 Create input handler utility in phase1/src/cli/input_handler.py
- [ ] T009 Create menu handler in phase1/src/cli/menu.py
- [ ] T010 Create main application entry point in phase1/src/main.py

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can create new tasks with title and optional description, then view all tasks in a list format showing key information.

**Independent Test**: Can be fully tested by adding multiple tasks and verifying they appear correctly in list view with all required information displayed.

### Implementation for User Story 1

- [ ] T011 [P] [US1] Implement Task.__init__ with title validation (1-200 chars) in phase1/src/models/task.py
- [ ] T012 [P] [US1] Implement Task.__init__ with description validation (max 1000 chars, optional) in phase1/src/models/task.py
- [ ] T013 [P] [US1] Implement Task.created_at timestamp in phase1/src/models/task.py
- [ ] T014 [P] [US1] Implement Task.__str__ method for display format in phase1/src/models/task.py
- [ ] T015 [P] [US1] Implement Task.to_dict method for dictionary conversion in phase1/src/models/task.py
- [ ] T016 [US1] Implement TodoManager.next_id auto-increment counter in phase1/src/services/todo_manager.py
- [ ] T017 [US1] Implement TodoManager.add_task(title, description) method in phase1/src/services/todo_manager.py
- [ ] T018 [US1] Implement TodoManager.task_exists validation in phase1/src/services/todo_manager.py
- [ ] T019 [US1] Implement DisplayFormatter.format_task for single task display in phase1/src/cli/display.py
- [ ] T020 [US1] Implement DisplayFormatter.format_task_list for multiple tasks in phase1/src/cli/display.py
- [ ] T021 [US1] Implement DisplayFormatter.format_summary for statistics in phase1/src/cli/display.py
- [ ] T022 [US1] Implement DisplayFormatter.truncate_description for display in phase1/src/cli/display.py
- [ ] T023 [US1] Implement InputHandler.get_task_title validation in phase1/src/cli/input_handler.py
- [ ] T024 [US1] Implement InputHandler.get_task_description in phase1/src/cli/input_handler.py
- [ ] T025 [US1] Add "Add Task" menu option (option 1) to menu display in phase1/src/cli/menu.py
- [ ] T026 [US1] Add "Add Task" routing in handle_choice method in phase1/src/cli/menu.py
- [ ] T027 [US1] Implement "Add Task" operation flow in main.py (FR-002, FR-003)
- [ ] T028 [US1] Implement "View Task List" menu option (option 2) in phase1/src/cli/menu.py
- [ ] T029 [US1] Implement "View Task List" routing in handle_choice method in phase1/src/cli/menu.py
- [ ] T030 [US1] Implement "View Task List" operation flow in main.py (FR-004, FR-005)
- [ ] T031 [US1] Add empty task list friendly message handling in main.py (FR-016)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Update and Complete Tasks (Priority: P2)

**Goal**: Users can modify existing task information and mark tasks as complete or incomplete.

**Independent Test**: Can be fully tested by adding a task, updating its details, toggling its completion status, and verifying changes are reflected immediately.

### Implementation for User Story 2

- [ ] T032 [US2] Implement TodoManager.get_task(task_id) method in phase1/src/services/todo_manager.py
- [ ] T033 [US2] Implement TodoManager.update_task(task_id, title, description) method in phase1/src/services/todo_manager.py
- [ ] T034 [US2] Implement TodoManager.toggle_complete(task_id) method in phase1/src/services/todo_manager.py
- [ ] T035 [US2] Implement TodoManager.get_statistics method in phase1/src/services/todo_manager.py
- [ ] T036 [US2] Implement DisplayFormatter status indicators (✅ / ❌) in phase1/src/cli/display.py
- [ ] T037 [US2] Add "Update Task" menu option (option 3) to menu display in phase1/src/cli/menu.py
- [ ] T038 [US2] Add "Update Task" routing in handle_choice method in phase1/src/cli/menu.py
- [ ] T039 [US2] Implement "Update Task" operation flow in main.py (FR-006)
- [ ] T040 [US2] Add "Mark as Complete / Incomplete" menu option (option 5) to menu display in phase1/src/cli/menu.py
- [ ] T041 [US2] Add "Mark as Complete / Incomplete" routing in handle_choice method in phase1/src/cli/menu.py
- [ ] T042 [US2] Implement "Mark as Complete / Incomplete" operation flow in main.py (FR-009, FR-010)
- [ ] T043 [US2] Update task list view after update/complete operations in main.py (FR-019)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Delete Tasks (Priority: P3)

**Goal**: Users can remove tasks from list when they are no longer needed.

**Independent Test**: Can be fully tested by adding a task, selecting delete, confirming deletion, and verifying task no longer appears in list.

### Implementation for User Story 3

- [ ] T044 [US3] Implement TodoManager.delete_task(task_id) method in phase1/src/services/todo_manager.py
- [ ] T045 [US3] Add "Delete Task" menu option (option 4) to menu display in phase1/src/cli/menu.py
- [ ] T046 [US3] Add "Delete Task" routing in handle_choice method in phase1/src/cli/menu.py
- [ ] T047 [US3] Implement InputHandler.get_confirmation method in phase1/src/cli/input_handler.py
- [ ] T048 [US3] Implement "Delete Task" operation flow with confirmation in main.py (FR-007, FR-008)
- [ ] T049 [US3] Display updated task list after deletion with renumbering in main.py (FR-011)

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 - Menu Navigation (Priority: P1)

**Goal**: Users can interact with application through a simple text-based menu that runs in a loop until they choose to exit.

**Independent Test**: Can be fully tested by navigating through all menu options multiple times and verifying each option performs its intended action.

### Implementation for User Story 4

- [ ] T050 [US4] Implement MenuHandler.display_menu method in phase1/src/cli/menu.py
- [ ] T051 [US4] Implement MenuHandler.get_user_choice method in phase1/src/cli/menu.py
- [ ] T052 [US4] Implement MenuHandler.handle_choice method in phase1/src/cli/menu.py
- [ ] T053 [US4] Add "Exit" menu option (option 6) to menu display in phase1/src/cli/menu.py
- [ ] T054 [US4] Add "Exit" routing in handle_choice method in phase1/src/cli/menu.py
- [ ] T055 [US4] Implement InputHandler.validate_menu_choice method in phase1/src/cli/input_handler.py
- [ ] T056 [US4] Implement main application loop in phase1/src/main.py (FR-017)
- [ ] T057 [US4] Implement welcome message display in phase1/src/main.py
- [ ] T058 [US4] Implement farewell message and clean exit in phase1/src/main.py
- [ ] T059 [US4] Add clear screen/pause for readability between operations in phase1/src/cli/display.py or main.py

**Checkpoint**: At this point, ALL user stories should be fully functional and testable independently

---

## Phase 7: Error Handling & Validation (Cross-Cutting)

**Purpose**: Implement graceful error handling for all edge cases and invalid inputs across all user stories.

- [ ] T060 [All] Implement InputHandler.get_task_id validation with non-numeric error handling in phase1/src/cli/input_handler.py (FR-014)
- [ ] T061 [All] Implement InputHandler validation error messages (all error types) in phase1/src/cli/input_handler.py (FR-014)
- [ ] T062 [All] Implement "Task not found" error message in main.py or todo_manager.py (FR-014, FR-010)
- [ ] T063 [All] Implement invalid menu choice error handling in main.py (FR-015)
- [ ] T064 [All] Implement empty task list friendly message in view operation in main.py (FR-016)
- [ ] T065 [All] Ensure all operations complete and return to menu (except Exit) in main.py (FR-019)
- [ ] T066 [All] Ensure no crashes on invalid input (all error paths tested) in main.py and menu.py

**Checkpoint**: Error handling complete across all user stories

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories.

- [ ] T067 [P] Add docstrings to all classes and methods in phase1/src/models/task.py
- [ ] T068 [P] Add docstrings to all methods in phase1/src/services/todo_manager.py
- [ ] T069 [P] Add docstrings to all classes and methods in phase1/src/cli/display.py
- [ ] T070 [P] Add docstrings to all classes and methods in phase1/src/cli/input_handler.py
- [ ] T071 [P] Add docstrings to all classes and methods in phase1/src/cli/menu.py
- [ ] T072 [P] Add docstrings to main entry point in phase1/src/main.py
- [ ] T073 [P] Add type hints to all functions and methods (PEP 484 compliance)
- [ ] T074 [P] Ensure PEP8 compliance (4 spaces indentation, line length < 79 chars)
- [ ] T075 [P] Create phase1/README.md with quickstart instructions
- [ ] T076 [P] Create phase1/CLAUDE.md with phase-specific agent instructions
- [ ] T077 [All] Validate application meets all success criteria from spec.md (SC-001 through SC-014)
- [ ] T078 [All] Test complete workflow: Add → View → Update → Complete → Delete → Exit

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - User Story 1 (P1): Can start after Foundational - No dependencies on other stories
  - User Story 2 (P2): Can start after Foundational - May integrate with US1 but should be independently testable
  - User Story 3 (P3): Can start after Foundational - May integrate with US1/US2 but should be independently testable
  - User Story 4 (P1): Can start after Foundational - Orchestrates all other stories
- **Error Handling (Phase 7)**: Depends on all user stories being complete
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - Depends on US1 for Task model and TodoManager
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - Depends on US1 for Task model and TodoManager
- **User Story 4 (P1)**: Can start after Foundational (Phase 2) - Depends on US1 (Task model), US2 (TodoManager methods), US3 (TodoManager delete)

### Within Each User Story

- Models before services
- Services before UI components (menu, display, input)
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel (T002, T003, T004)
- All Foundational tasks marked [P] can run in parallel (within Phase 2):
  - T005, T006, T007, T008, T009, T010 can all run in parallel
- Within User Story 1: All model and validation tasks marked [P] can run in parallel:
  - T011, T012, T013, T014, T015, T016, T017, T018, T019, T020, T021, T022, T023, T024 can run in parallel
- Within User Story 2: Most tasks can run in parallel after US1 dependencies:
  - T032, T033, T034, T035, T036, T037, T038, T040, T041, T043 can run in parallel
- Within User Story 3: After dependencies, tasks can run in parallel:
  - T044, T045, T046, T047, T048, T049 can run in parallel
- Within User Story 4: Most tasks can run in parallel after dependencies:
  - T050, T051, T052, T053, T054, T055, T056, T057, T058 can run in parallel
- All documentation and polish tasks marked [P] can run in parallel:
  - T067, T068, T069, T070, T071, T072, T073, T074, T075, T076 can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch all model and validation tasks for User Story 1 together:
Task: "Implement Task.__init__ with title validation (1-200 chars) in phase1/src/models/task.py"
Task: "Implement Task.__init__ with description validation (max 1000 chars, optional) in phase1/src/models/task.py"
Task: "Implement Task.created_at timestamp in phase1/src/models/task.py"
Task: "Implement Task.__str__ method for display format in phase1/src/models/task.py"
Task: "Implement Task.to_dict method for dictionary conversion in phase1/src/models/task.py"
Task: "Implement TodoManager.next_id auto-increment counter in phase1/src/services/todo_manager.py"
Task: "Implement TodoManager.add_task(title, description) method in phase1/src/services/todo_manager.py"
Task: "Implement TodoManager.task_exists validation in phase1/src/services/todo_manager.py"
Task: "Implement DisplayFormatter.format_task for single task display in phase1/src/cli/display.py"
Task: "Implement DisplayFormatter.format_task_list for multiple tasks in phase1/src/cli/display.py"
Task: "Implement DisplayFormatter.format_summary for statistics in phase1/src/cli/display.py"
Task: "Implement DisplayFormatter.truncate_description for display in phase1/src/cli/display.py"
Task: "Implement InputHandler.get_task_title validation in phase1/src/cli/input_handler.py"
Task: "Implement InputHandler.get_task_description in phase1/src/cli/input_handler.py"
Task: "Add 'Add Task' menu option (option 1) to menu display in phase1/src/cli/menu.py"
Task: "Add 'Add Task' routing in handle_choice method in phase1/src/cli/menu.py"
Task: "Implement 'Add Task' operation flow in main.py (FR-002, FR-003)"
Task: "Implement 'View Task List' menu option (option 2) in phase1/src/cli/menu.py"
Task: "Implement 'View Task List' routing in handle_choice method in phase1/src/cli/menu.py"
Task: "Implement 'View Task List' operation flow in main.py (FR-004, FR-005)"
Task: "Add empty task list friendly message handling in main.py (FR-016)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently (Add task, View task list)
5. Demo basic create and view functionality

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Demo MVP (Add/View tasks)
3. Add User Story 2 → Test independently → Demo (Update/Complete tasks)
4. Add User Story 3 → Test independently → Demo (Delete tasks)
5. Add User Story 4 → Test independently → Demo (Menu navigation)
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers (if available):

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (Create/View)
   - Developer B: User Story 2 (Update/Complete)
   - Developer C: User Story 3 (Delete)
   - Developer D: User Story 4 (Menu Navigation)
3. Stories complete and integrate independently
4. Team works on Error Handling & Polish together

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify error messages are clear and actionable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- All code MUST include comments linking to Task IDs and spec sections
- Phase I is pure Python with standard library - no external dependencies
- Application runs in-memory only - no file persistence
