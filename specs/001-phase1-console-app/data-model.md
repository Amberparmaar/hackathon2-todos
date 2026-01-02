# Data Model: Phase I - In-Memory Python Console App

**Phase**: Phase I
**Feature**: In-Memory Python Console App
**Date**: 2026-01-02

## Overview

This document defines the data model for the in-memory Todo application. The data model is intentionally simple, consisting of a single Task entity stored in a list during application runtime.

## Entities

### Task

Represents a todo item in the application with validation and display methods.

#### Attributes

| Attribute | Type | Required | Constraints | Description |
|-----------|------|----------|-------------|
| `id` | int | Yes | Unique auto-incremented identifier starting from 1 |
| `title` | str | Yes | Task title, 1-200 characters, non-empty |
| `description` | str \| None | No | Optional description, max 1000 characters |
| `completed` | bool | Yes | Completion status, False by default |
| `created_at` | datetime | Yes | Timestamp when task was created |

#### Validation Rules

**Title Validation**:
- Must be non-empty string
- Must not exceed 200 characters
- Leading/trailing whitespace should be stripped
- Example valid: "Buy groceries", "Clean kitchen"
- Example invalid: "", "   ", or title > 200 chars

**Description Validation**:
- Optional (can be None or empty string)
- If provided, must not exceed 1000 characters
- Leading/trailing whitespace should be stripped
- Example valid: "Milk, eggs, bread", or None
- Example invalid: description > 1000 chars

#### State Transitions

```
┌──────────────┐
│   Task Created │
└──────┬───────┘
       │
       ▼
┌──────────────────┐
│ Pending (completed │
│    = False)     │
└──────┬───────────┘
       │
       ▼ (toggle complete)
┌──────────────────┐
│ Completed        │
│ (completed = True)│
└──────┬───────────┘
       │
       ▼ (toggle incomplete)
┌──────────────────┐
│ Pending (completed │
│    = False)     │
└──────────────────┘
```

#### Methods

| Method | Purpose | Returns |
|--------|---------|---------|
| `__init__(id, title, description)` | Initialize task with validation | Task instance |
| `__str__()` | Display-friendly string representation | str |
| `__repr__()` | Debug representation for development | str |
| `to_dict()` | Convert to dictionary (for future use) | dict |

#### Display Format

The `__str__` method returns:
```
"[ID] Title - Status (Description)"

Example: "1. Buy groceries - ❌ Pending (Milk, eggs, bread)"
```

### TaskList (In-Memory Storage)

#### Description

A simple Python list of Task objects managed by TodoManager during application runtime.

#### Characteristics

- Storage type: Python `list[Task]`
- Lifetime: Application runtime only (no persistence)
- Access pattern: Sequential search for operations
- Maximum capacity: Limited only by system memory (no hard limit defined)

#### Operations

| Operation | Implementation | Complexity |
|------------|----------------|------------|
| Add task | `tasks.append(task)` | O(1) |
| Find by ID | Linear search or maintain index map | O(n) or O(1) |
| Get all | `return tasks` | O(1) |
| Update by ID | Find and replace | O(n) |
| Delete by ID | Find and remove | O(n) |
| Toggle status | Find and update | O(n) |
| Statistics | Iterate and count | O(n) |

#### Performance Notes

- With 100 tasks: All operations complete in < 10ms
- With 1000 tasks: Operations complete in < 100ms
- No performance degradation expected for Phase I use cases

## Relationships

There are no entity relationships in Phase I. This is a single-entity model.

### Entity Relationship Diagram

```
┌────────────────────────────────┐
│      TodoManager            │
│  (owns & manages)         │
└────────────┬─────────────────┘
             │
             │ owns 1
             ▼
     ┌──────────────────┐
     │    Task List    │
     │  (list[Task])  │
     └────────┬─────────┘
              │
              │ contains N
              ▼
        ┌────────────┐
        │   Task(s)  │
        └────────────┘
```

## Data Flow

```
User Input
    │
    ▼
┌──────────────────────┐
│  Input Handler      │
│  (validate)        │
└────────┬─────────────┘
         │ valid
         ▼
┌──────────────────────┐
│  TodoManager       │
│  (create/update)    │
└────────┬─────────────┘
         │
         ▼
┌──────────────────────┐
│  Task List          │
│  (append/modify)    │
└──────────────────────┘
         │
         ▼
┌──────────────────────┐
│  Display Formatter  │
│  (format for UI)    │
└────────┬─────────────┘
         │
         ▼
    User Display
```

## Constraints & Invariants

### Invariants

1. **ID Uniqueness**: Each task must have a unique ID
2. **Title Validity**: All tasks must have valid titles
3. **Status Consistency**: `completed` must be boolean (True/False)
4. **List Integrity**: TaskList always contains valid Task objects

### Constraints

1. **No Persistence**: TaskList is not saved to disk or database
2. **Runtime Only**: All data lost on application exit
3. **Single User**: No user separation or authentication
4. **Order Not Guaranteed**: Task order is insertion order, not sorted by any criteria

## Migration Strategy

Since Phase I uses in-memory storage with no persistence:

- **No migration needed** between application runs
- **No data loss prevention** is required (intentional design)
- **Future Phase II migration**: Will involve adding database persistence (PostgreSQL)

## Testing Considerations

### Unit Testing (if added later)

- Test Task initialization with valid and invalid inputs
- Test Task string representations
- Test validation methods raise appropriate errors

### Integration Testing (if added later)

- Test TodoManager CRUD operations
- Test ID generation is sequential and unique
- Test statistics calculations are accurate
- Test invalid task IDs are handled gracefully

---

**Version**: 1.0.0
**Status**: Ready for Implementation
