'use client';

import { Task } from '@/types';
import { ModernTaskCard } from './ModernTaskCard';
import { PlusIcon, CheckCircleIcon, CircleIcon, CalendarIcon } from 'lucide-react';

export function ModernTaskList({
  tasks,
  loading = false,
  onEdit,
  onDelete,
  onToggle,
  filteredTasks
}: {
  tasks: Task[];
  loading?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: (taskId: string) => void;
  onToggle?: (taskId: string) => void;
  filteredTasks?: Task[];
}) {
  const displayTasks = filteredTasks || tasks;

  // Calculate stats
  const total = tasks.length;
  const completed = tasks.filter(t => t.completed).length;
  const pending = total - completed;

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 animate-pulse"
          >
            <div className="flex items-center gap-3">
              <div className="w-5 h-5 rounded-md border-2 border-gray-300 dark:border-gray-600 bg-gray-200 dark:bg-gray-700"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (displayTasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mx-auto w-24 h-24 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/50 dark:to-blue-900/50 rounded-full flex items-center justify-center mb-6">
          <CheckCircleIcon className="w-12 h-12 text-purple-500 dark:text-purple-400" />
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          No tasks yet
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Get started by creating your first task
        </p>
        <div className="inline-flex items-center px-4 py-2 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 rounded-lg">
          <PlusIcon className="w-4 h-4 mr-2" />
          <span>Click the + button to add a task</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      {tasks.length > 0 && (
        <div className="flex flex-wrap gap-4 p-4 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CheckCircleIcon className="w-4 h-4 text-green-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{completed}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-500">completed</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CircleIcon className="w-4 h-4 text-yellow-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{pending}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-500">pending</span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <CalendarIcon className="w-4 h-4 text-purple-500" />
              <span className="text-sm text-gray-600 dark:text-gray-400">{total}</span>
            </div>
            <span className="text-sm text-gray-500 dark:text-gray-500">total</span>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {displayTasks.map((task) => (
          <ModernTaskCard
            key={task.id}
            task={task}
            onEdit={onEdit}
            onDelete={onDelete}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
}