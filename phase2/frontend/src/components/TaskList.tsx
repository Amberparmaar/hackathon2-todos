'use client';

/**
 * Task List Component for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-023
 * Spec Reference: @phase2/specs/plan.md - User Story 4 (Responsive UI)
 *
 * This component renders and manages list of tasks with responsive layout.
 */

import { Task } from '@/types';
import { TaskCard } from './TaskCard';

/**
 * TaskList component.
 *
 * T-023: Accepts tasks array as prop
 * T-023: Maps tasks to TaskCard components
 * T-023: Grid layout on desktop (2-3 columns)
 * T-023: List layout on mobile (1 column)
 * T-023: Empty state: "No tasks yet" message
 * T-023: Loading state shows skeleton cards
 * T-023: Responsive breakpoints using Tailwind
 * T-023: Smooth transitions for add/delete/update
 */
export function TaskList({
  tasks,
  loading = false,
  onEdit,
  onDelete
}: {
  tasks: Task[];
  loading?: boolean;
  onEdit?: (task: Task) => void;
  onDelete?: () => void;
}) {
  // Render skeleton cards while loading
  // T-023: Loading state shows skeleton cards
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded border-2 bg-gray-200"></div>
              <div className="flex-1 space-y-3">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Render empty state if no tasks
  // T-023: Empty state: "No tasks yet" message
  if (tasks.length === 0) {
    return (
      <div className="text-center py-16">
        <div className="mb-6">
          <svg
            className="mx-auto h-24 w-24 text-gray-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No tasks yet
        </h3>
        <p className="text-gray-600 mb-6">
          Create your first task to get started!
        </p>
      </div>
    );
  }

  // Render task cards in responsive grid
  // T-023: Accepts tasks array as prop
  // T-023: Maps tasks to TaskCard components
  // T-023: Grid layout on desktop (2-3 columns)
  // T-023: List layout on mobile (1 column)
  // T-023: Responsive breakpoints using Tailwind
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
