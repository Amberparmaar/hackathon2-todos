'use client';

/**
 * Task Card Component for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-021
 * Spec Reference: @phase2/specs/plan.md - Task Management requirements
 *
 * This reusable component displays task details and action buttons.
 */

import { useState } from 'react';
import { Task } from '@/types';
import { deleteTask, toggleTask } from '@/lib/api';

/**
 * TaskCard component.
 *
 * T-021: Component accepts task object as prop
 * T-021: Displays title (up to 200 chars truncated with ...)
 * T-021: Displays description (truncated if > 50 chars with ...)
 * T-021: Shows creation date (e.g., "Jan 7, 2026")
 * T-021: Visual indicator for completed status ([X] or [ ])
 * T-021: Edit button triggers edit flow
 * T-021: Delete button shows confirmation dialog
 * T-021: Toggle button switches completion status instantly
 * T-021: Tailwind CSS styling applied
 * T-021: Responsive design works on mobile/tablet/desktop
 */
export function TaskCard({ task, onEdit, onDelete }: { task: Task; onEdit?: (task: Task) => void; onDelete?: () => void }) {
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Format date for display
  // T-021: Shows creation date (e.g., "Jan 7, 2026")
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Truncate text if too long
  const truncate = (text: string | null, maxLength: number) => {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  /**
   * Handle task completion toggle.
   *
   * T-021: Toggle button switches completion status instantly
   */
  const handleToggle = async () => {
    setLoading(true);
    try {
      await toggleTask(task.id);
      // Force re-fetch of tasks (parent component will handle this)
      window.location.reload();
    } catch (error) {
      console.error('Failed to toggle task:', error);
      alert('Failed to toggle task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle task deletion with confirmation.
   *
   * T-021: Delete button shows confirmation dialog
   */
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    setDeleting(true);
    try {
      await deleteTask(task.id);
      if (onDelete) {
        onDelete();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      alert('Failed to delete task. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  /**
   * Handle edit button click.
   *
   * T-021: Edit button triggers edit flow
   */
  const handleEdit = () => {
    if (onEdit) {
      onEdit(task);
    }
  };

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-lg ${task.completed ? 'opacity-75' : ''}`}>
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Task content */}
        <div className="flex-1">
          <div className="flex items-start gap-3">
            {/* Toggle checkbox */}
            <button
              onClick={handleToggle}
              disabled={loading}
              className={`mt-1 w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                task.completed
                  ? 'bg-green-500 border-green-500 text-white'
                  : 'border-gray-300 hover:border-blue-500'
              }`}
              aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
            >
              {/* T-021: Visual indicator for completed status ([X] or [ ]) */}
              {task.completed && (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </button>

            <div className="flex-1">
              {/* T-021: Displays title (up to 200 chars truncated with ...) */}
              <h3 className={`text-lg font-semibold ${task.completed ? 'line-through text-gray-500' : 'text-gray-900'}`}>
                {truncate(task.title, 200)}
              </h3>

              {/* T-021: Displays description (truncated if > 50 chars with ...) */}
              {task.description && (
                <p className="text-gray-600 mt-2 text-sm">
                  {truncate(task.description, 100)}
                </p>
              )}

              {/* Creation date */}
              <p className="text-gray-400 text-xs mt-3">
                Created: {formatDate(task.created_at)}
              </p>
            </div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex sm:flex-col gap-2 justify-end">
          <button
            onClick={handleEdit}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors text-sm font-medium disabled:opacity-50"
            disabled={loading || deleting}
          >
            Edit
          </button>

          <button
            onClick={handleDelete}
            disabled={loading || deleting}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium disabled:opacity-50"
          >
            {deleting ? 'Deleting...' : 'Delete'}
          </button>
        </div>
      </div>
    </div>
  );
}
