/**
 * TaskForm Component Test Suite for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-028
 * Spec Reference: @phase2/specs/plan.md - Testing Section
 *
 * This test suite validates the TaskForm component:
 * - Renders form fields correctly
 * - Validates title length (max 200 chars)
 * - Validates description length (max 1000 chars)
 * - Handles form submission
 * - Shows validation errors
 * - Tracks character counts
 */

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { TaskForm } from '../../src/components/TaskForm';
import { Task, TaskCreate } from '../../src/types';

// Mock the API functions
jest.mock('../../src/lib/api', () => ({
  createTask: jest.fn(),
  updateTask: jest.fn(),
}));

import { createTask, updateTask } from '../../src/lib/api';

describe('TaskForm Component', () => {
  const mockOnSubmit = jest.fn();
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders form fields correctly', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByLabelText(/Title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByText(/Add Task/i)).toBeInTheDocument();
  });

  test('renders edit mode when task prop is provided', () => {
    const mockTask: Task = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Edit Test Task',
      description: 'Edit Test Description',
      completed: false,
      user_id: 'user-123',
      created_at: '2026-01-07T10:00:00.000Z',
      completed_at: null,
    };

    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    expect(screen.getByDisplayValue('Edit Test Task')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Edit Test Description')).toBeInTheDocument();
    expect(screen.getByText(/Update Task/i)).toBeInTheDocument();
  });

  test('validates title length (max 200 chars)', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title/i);
    const longTitle = 'A'.repeat(201); // Over the limit
    fireEvent.change(titleInput, { target: { value: longTitle } });

    // Submit the form
    const submitButton = screen.getByText(/Add Task/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Title must be 200 characters or less/i)).toBeInTheDocument();
    });
  });

  test('validates description length (max 1000 chars)', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const descriptionInput = screen.getByLabelText(/Description/i);
    const longDescription = 'A'.repeat(1001); // Over the limit
    fireEvent.change(descriptionInput, { target: { value: longDescription } });

    // Submit the form
    const submitButton = screen.getByText(/Add Task/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Description must be 1000 characters or less/i)).toBeInTheDocument();
    });
  });

  test('tracks character count for title', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title/i);
    const testTitle = 'Test Title';
    fireEvent.change(titleInput, { target: { value: testTitle } });

    expect(screen.getByText(`${testTitle.length}/200`)).toBeInTheDocument();
  });

  test('tracks character count for description', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const descriptionInput = screen.getByLabelText(/Description/i);
    const testDescription = 'Test Description';
    fireEvent.change(descriptionInput, { target: { value: testDescription } });

    expect(screen.getByText(`${testDescription.length}/1000`)).toBeInTheDocument();
  });

  test('shows warning when approaching character limits', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title/i);
    const closeToLimitTitle = 'A'.repeat(180); // Close to the limit
    fireEvent.change(titleInput, { target: { value: closeToLimitTitle } });

    // Check if warning color is applied (orange)
    const charCountElement = screen.getByText(`${closeToLimitTitle.length}/200`);
    expect(charCountElement).toHaveClass('text-orange-500'); // Assuming this is the warning class
  });

  test('handles form submission for creating a new task', async () => {
    (createTask as jest.MockedFunction<typeof createTask>).mockResolvedValue({
      id: 'new-task-id',
      title: 'New Task',
      description: 'New Description',
      completed: false,
      user_id: 'user-123',
      created_at: '2026-01-07T10:00:00.000Z',
      completed_at: null,
    });

    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByText(/Add Task/i);

    fireEvent.change(titleInput, { target: { value: 'New Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'New Description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(createTask).toHaveBeenCalledWith('New Task', 'New Description');
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test('handles form submission for updating an existing task', async () => {
    const mockTask: Task = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Existing Task',
      description: 'Existing Description',
      completed: false,
      user_id: 'user-123',
      created_at: '2026-01-07T10:00:00.000Z',
      completed_at: null,
    };

    (updateTask as jest.MockedFunction<typeof updateTask>).mockResolvedValue({
      ...mockTask,
      title: 'Updated Task',
      description: 'Updated Description',
    });

    render(
      <TaskForm
        task={mockTask}
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title/i);
    const descriptionInput = screen.getByLabelText(/Description/i);
    const submitButton = screen.getByText(/Update Task/i);

    fireEvent.change(titleInput, { target: { value: 'Updated Task' } });
    fireEvent.change(descriptionInput, { target: { value: 'Updated Description' } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(updateTask).toHaveBeenCalledWith(mockTask.id, {
        title: 'Updated Task',
        description: 'Updated Description',
      });
      expect(mockOnSubmit).toHaveBeenCalled();
    });
  });

  test('shows error message when title is empty', async () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: '' } });

    const submitButton = screen.getByText(/Add Task/i);
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Title is required/i)).toBeInTheDocument();
    });
  });

  test('disables submit button when form is invalid', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: '' } }); // Empty title

    const submitButton = screen.getByText(/Add Task/i);
    expect(submitButton).toBeDisabled();
  });

  test('enables submit button when form is valid', () => {
    render(
      <TaskForm
        onSubmit={mockOnSubmit}
        onCancel={mockOnCancel}
      />
    );

    const titleInput = screen.getByLabelText(/Title/i);
    fireEvent.change(titleInput, { target: { value: 'Valid Title' } });

    const submitButton = screen.getByText(/Add Task/i);
    expect(submitButton).not.toBeDisabled();
  });
});