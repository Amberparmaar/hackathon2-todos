'use client';

/**
 * Dashboard Page for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-020
 * Spec Reference: @phase2/specs/spec.md - User Story 2 (Task Management)
 *
 * This main dashboard page displays user's tasks with list, add, edit, delete, and toggle actions.
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { TaskList } from '@/components/TaskList';
import { TaskForm } from '@/components/TaskForm';
import { Task, TaskListResponse } from '@/types';
import { getTasks } from '@/lib/api';

/**
 * Dashboard page.
 *
 * T-020: Page accessible at /dashboard
 * T-020: Protected by ProtectedRoute wrapper
 * T-020: Loads tasks via API client on mount
 * T-020: Displays tasks with title, description, status
 * T-020: Shows creation date
 * T-020: Empty state: "No tasks yet. Create your first task!"
 * T-020: Loading spinner while fetching
 * T-020: Error message display on fetch failure
 * T-020: Responsive layout (mobile: single column, desktop: grid/list)
 * T-020: Statistics shown (e.g., "3 of 10 tasks completed")
 */
export default function DashboardPage() {
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);

  // Load user's tasks on mount
  // T-020: Loads tasks via API client on mount
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    setError('');
    try {
      const response: TaskListResponse = await getTasks();
      setTasks(response.tasks);
      setStats({
        total: response.total,
        completed: response.completed,
        pending: response.pending,
      });
    } catch (error) {
      console.error('Failed to load tasks:', error);
      // T-020: Error message display on fetch failure
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
    } finally {
      setLoading(false);
    }
  };

  // Handle task edit
  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  // Handle task delete
  const handleDeleteTask = () => {
    loadTasks();
  };

  // Handle form submission
  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingTask(undefined);
    loadTasks();
  };

  // Handle sign out
  const handleSignOut = async () => {
    await signOut();
    router.push('/signin');
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Header with navigation */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  My Tasks
                </h1>
                <p className="text-sm text-gray-600">
                  {/* T-020: Statistics shown (e.g., "3 of 10 tasks completed") */}
                  {stats.completed} of {stats.total} tasks completed
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className="text-sm text-gray-600">
                  {user?.email}
                </span>
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors text-sm font-medium"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Add new task button */}
          {!showForm && (
            <button
              onClick={() => setShowForm(true)}
              className="mb-6 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add New Task
            </button>
          )}

          {/* Task form (shown when adding or editing) */}
          {showForm && (
            <div className="mb-8">
              <TaskForm
                task={editingTask}
                onSubmit={handleFormSubmit}
                onCancel={() => {
                  setShowForm(false);
                  setEditingTask(undefined);
                }}
              />
            </div>
          )}

          {/* Error message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Task list */}
          {/* T-020: Displays tasks with title, description, status */}
          {/* T-020: Loading spinner while fetching */}
          {/* T-020: Empty state: "No tasks yet. Create your first task!" */}
          {/* T-020: Responsive layout (mobile: single column, desktop: grid/list) */}
          <TaskList
            tasks={tasks}
            loading={loading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
          />
        </main>
      </div>
    </ProtectedRoute>
  );
}
