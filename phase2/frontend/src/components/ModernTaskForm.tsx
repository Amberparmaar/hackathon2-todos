'use client';

import { useState, useEffect } from 'react';
import { XIcon, CheckIcon } from 'lucide-react';
import { Task, TaskCreate, TaskUpdate } from '@/types';
import { createTask, updateTask } from '@/lib/api';

export function ModernTaskForm({
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
  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || '');
    }
  }, [task]);

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
        await updateTask(task.id, { title: title.trim(), description: description.trim() || undefined });
      } else {
        // Create new task
        await createTask(title.trim(), description.trim() || undefined);
      }

      // Reset form and call onSubmit callback
      setTitle('');
      setDescription('');
      setError('');
      onSubmit?.();
    } catch (error) {
      console.error('Failed to save task:', error);
      setError('Failed to save task. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const isEdit = !!task;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 shadow-sm">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
          {isEdit ? 'Edit Task' : 'Add New Task'}
        </h2>
        <button
          onClick={onCancel}
          className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          aria-label="Close form"
        >
          <XIcon className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title input */}
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            maxLength={200}
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-2">
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
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Description <span className="text-gray-400">(optional)</span>
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add details..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all resize-none"
            maxLength={1000}
            disabled={loading}
          />
          <div className="flex justify-between items-center mt-2">
            <span className={`text-xs ${description.length > 900 ? 'text-orange-500' : 'text-gray-500'}`}>
              {description.length}/1000 characters
            </span>
            {error && description.length > 1000 && (
              <span className="text-xs text-red-500">Description is too long</span>
            )}
          </div>
        </div>

        {/* Error message */}
        {error && title.trim() && description.length <= 1000 && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-300">
            {error}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            disabled={loading || !title.trim()}
            className={`flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
              loading ? 'cursor-not-allowed' : ''
            }`}
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Saving...
              </>
            ) : (
              <>
                <CheckIcon className="w-4 h-4" />
                {isEdit ? 'Update Task' : 'Add Task'}
              </>
            )}
          </button>

          {onCancel && isEdit && (
            <button
              type="button"
              onClick={onCancel}
              disabled={loading}
              className="px-6 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium disabled:opacity-50"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}