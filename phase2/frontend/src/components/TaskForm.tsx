'use client';

/**
 * Task Form Component for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-022
 * Spec Reference: @phase2/specs/spec.md - FR-009, FR-010 (create), FR-014 (update)
 *
 * This form component allows adding/editing tasks with validation.
 */

import { useState, useEffect } from 'react';
import { Task, TaskCreate, TaskUpdate } from '../types';
import { createTask, updateTask } from '../lib/api';

/**
 * TaskForm component.
 *
 * T-022: Form accepts mode (create/edit)
 * T-022: Title input with character count and validation
 * T-022: Description textarea with character count
 * T-022: Save/Cancel buttons
 * T-022: Validation error display
 * T-022: Loading state on submit
 * T-022: Edit mode support (pre-fill values when editing)
 * T-022: Character limits enforced (200 title, 1000 description)
 * T-022: Tailwind styling with focus states and error colors
 */
export function TaskForm({
  task,
  onSubmit,
  onCancel
}: {
  task?: Task;
  onSubmit?: () => void;
  onCancel?: () => void;
}) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Pre-fill values in edit mode
  // T-022: Edit mode support (pre-fill values when editing)
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validate title
    if (!title.trim()) {
      setError('Title is required');
      return;
    }

    if (title.length > 200) {
      setError('Title must be 200 characters or less');
      return;
    }

    if (description.length > 1000) {
      setError('Description must be 1000 characters or less');
      return;
    }

    setLoading(true);
    try {
      if (task) {
        // Update existing task
        const updates: TaskUpdate = {
          title: title.trim(),
          description: description.trim() || undefined,
        };
        await updateTask(task.id, updates);
      } else {
        // Create new task
        const newTask: TaskCreate = {
          title: title.trim(),
          description: description.trim() || undefined,
        };
        await createTask(newTask.title, newTask.description);
      }

      // Reset form and call onSubmit callback
      setTitle('');
      setDescription('');
      setError('');
      onSubmit?.();
    } catch (error) {
      console.error('Failed to save task:', error);
      setError(error instanceof Error ? error.message : 'Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!task;

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-4">
        {isEdit ? 'Edit Task' : 'Add New Task'}
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Title input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
            Title <span className="text-red-500">*</span>
          </label>
          {/* T-022: Title input with character count and validation */}
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Enter task title"
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              error && !title.trim() ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={200}
            disabled={loading}
          />
          {/* Character count */}
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${title.length > 180 ? 'text-orange-500' : 'text-gray-500'}`}>
              {title.length}/200 characters
            </span>
            {error && !title.trim() && (
              <span className="text-xs text-red-500">Title is required</span>
            )}
          </div>
        </div>

        {/* Description textarea */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          {/* T-022: Description textarea with character count */}
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Enter task description (optional)"
            rows={4}
            className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
              error && description.length > 1000 ? 'border-red-500' : 'border-gray-300'
            }`}
            maxLength={1000}
            disabled={loading}
          />
          {/* Character count */}
          <div className="flex justify-between items-center mt-1">
            <span className={`text-xs ${description.length > 900 ? 'text-orange-500' : 'text-gray-500'}`}>
              {description.length}/1000 characters
            </span>
            {error && description.length > 1000 && (
              <span className="text-xs text-red-500">Description is too long</span>
            )}
          </div>
        </div>

        {/* General error message */}
        {error && title.trim() && description.length <= 1000 && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Action buttons */}
        {/* T-022: Save/Cancel buttons */}
        {/* T-022: Save button disabled while loading */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className={`flex-1 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed ${
              loading ? 'flex items-center justify-center gap-2' : ''
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Saving...
              </>
            ) : (
              isEdit ? 'Update Task' : 'Add Task'
            )}
          </button>

          {/* T-022: Cancel button closes form in edit mode */}
          {onCancel && isEdit && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
