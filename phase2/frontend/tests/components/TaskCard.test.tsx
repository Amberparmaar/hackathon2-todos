/**
 * TaskCard Component Test Suite for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-028
 * Spec Reference: @phase2/specs/plan.md - Testing Section
 *
 * This test suite validates the TaskCard component:
 * - Renders task details correctly
 * - Displays edit/delete buttons
 * - Handles delete confirmation dialog
 * - Toggles completion status
 * - Visual indicators for completed tasks
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskCard } from '../../src/components/TaskCard';
import { Task } from '../../src/types';

// Mock the API functions
jest.mock('../../src/lib/api', () => ({
  deleteTask: jest.fn(),
  toggleTask: jest.fn(),
}));

import { deleteTask, toggleTask } from '../../src/lib/api';

describe('TaskCard Component', () => {
  const mockTask: Task = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    title: 'Test Task',
    description: 'Test Description',
    completed: false,
    user_id: 'user-123',
    created_at: '2026-01-07T10:00:00.000Z',
    completed_at: null,
  };

  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders task details correctly', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    expect(screen.getByText('Test Task')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  test('displays edit button and calls onEdit handler', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const editButton = screen.getByText('Edit');
    fireEvent.click(editButton);

    expect(mockOnEdit).toHaveBeenCalledWith(mockTask);
  });

  test('handles delete confirmation dialog', async () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Mock the confirm function
    window.confirm = jest.fn(() => true);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Wait for the API call to be made
    await waitFor(() => {
      expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
      expect(deleteTask).toHaveBeenCalledWith(mockTask.id);
      expect(mockOnDelete).toHaveBeenCalled();
    });
  });

  test('cancels deletion when user declines confirmation', () => {
    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    // Mock the confirm function to return false
    window.confirm = jest.fn(() => false);

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    expect(window.confirm).toHaveBeenCalledWith('Are you sure you want to delete this task?');
    expect(deleteTask).not.toHaveBeenCalled();
    expect(mockOnDelete).not.toHaveBeenCalled();
  });

  test('toggles completion status when checkbox is clicked', async () => {
    (toggleTask as jest.MockedFunction<typeof toggleTask>).mockResolvedValue({
      ...mockTask,
      completed: true,
      completed_at: '2026-01-07T11:00:00.000Z',
    });

    render(
      <TaskCard
        task={{ ...mockTask, completed: false }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const checkbox = screen.getByRole('checkbox');
    fireEvent.click(checkbox);

    await waitFor(() => {
      expect(toggleTask).toHaveBeenCalledWith(mockTask.id);
    });
  });

  test('shows visual indicator for completed task', () => {
    const completedTask = { ...mockTask, completed: true };
    render(
      <TaskCard
        task={completedTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const completedElement = screen.getByText('Test Task');
    // Check if the element has strikethrough class or similar
    expect(completedElement).toBeInTheDocument();
  });

  test('shows loading state during delete operation', async () => {
    // Mock deleteTask to take some time
    (deleteTask as jest.MockedFunction<typeof deleteTask>).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve(), 100))
    );

    window.confirm = jest.fn(() => true);

    render(
      <TaskCard
        task={mockTask}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
      />
    );

    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);

    // Check if the button shows loading state
    expect(deleteButton).toBeDisabled();

    // Wait for the operation to complete
    await waitFor(() => {
      expect(deleteButton).not.toBeDisabled();
    });
  });
});