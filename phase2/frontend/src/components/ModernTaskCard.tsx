'use client';

import { useState } from 'react';
import { CheckIcon, SquareIcon, MoreVerticalIcon, EditIcon, TrashIcon } from 'lucide-react';
import { Task } from '@/types';

export function ModernTaskCard({
  task,
  onEdit,
  onDelete,
  onToggle
}: {
  task: Task;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onToggle?: (taskId: string) => void;
}) {
  const [showActions, setShowActions] = useState(false);

  const handleToggle = () => {
    onToggle?.(task.id);
  };

  const handleEdit = () => {
    onEdit?.(task);
  };

  const handleDelete = () => {
    onDelete?.(task.id);
  };

  return (
    <div
      className={`group relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 transition-all duration-200 hover:shadow-md hover:border-purple-300 dark:hover:border-purple-600 ${
        task.completed ? 'opacity-75' : ''
      }`}
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start gap-3">
        <button
          onClick={handleToggle}
          className={`mt-1 flex-shrink-0 w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 ${
            task.completed
              ? 'bg-green-500 border-green-500 text-white'
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-500 dark:hover:border-purple-500'
          }`}
          aria-label={task.completed ? 'Mark as incomplete' : 'Mark as complete'}
        >
          {task.completed && <CheckIcon className="w-3 h-3" />}
        </button>

        <div className="flex-1 min-w-0">
          <h3
            className={`font-medium transition-colors ${
              task.completed
                ? 'text-gray-500 dark:text-gray-400 line-through'
                : 'text-gray-900 dark:text-white'
            }`}
          >
            {task.title}
          </h3>

          {task.description && (
            <p
              className={`text-sm mt-1 ${
                task.completed
                  ? 'text-gray-400 dark:text-gray-500'
                  : 'text-gray-600 dark:text-gray-400'
              }`}
            >
              {task.description}
            </p>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200">
              Created: {new Date(task.created_at).toLocaleDateString()} {new Date(task.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
            </span>

            {task.due_date && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                new Date(task.due_date) < new Date() && !task.completed
                  ? 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                  : 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
              }`}>
                Due: {new Date(task.due_date).toLocaleDateString()} {new Date(task.due_date).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}

            {task.completed && task.completed_at && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200">
                Completed: {new Date(task.completed_at).toLocaleDateString()} {new Date(task.completed_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </span>
            )}
          </div>
        </div>

        <div className={`absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${showActions ? 'opacity-100' : ''}`}>
          <div className="flex items-center gap-1">
            <button
              onClick={handleEdit}
              className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Edit task"
            >
              <EditIcon className="w-4 h-4" />
            </button>

            <button
              onClick={handleDelete}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              aria-label="Delete task"
            >
              <TrashIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}