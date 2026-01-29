'use client';

/**
 * Dashboard Page for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-020
 * Spec Reference: @phase2/specs/spec.md - User Story 2 (Task Management)
 *
 * This main dashboard page displays user's tasks with list, add, edit, delete, and toggle actions.
 */

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { ModernTaskList } from '@/components/ModernTaskList';
import { ModernTaskForm } from '@/components/ModernTaskForm';
import { ModernFab } from '@/components/ModernFab';
import { ModernHeader } from '@/components/ModernHeader';
import { Sidebar } from '@/components/Sidebar';
import { DateTimeDisplay } from '@/components/DateTimeDisplay';
import { Task, TaskListResponse } from '@/types';
import { getTasks, deleteTask, toggleTask } from '@/lib/api';

// Separate component for search params handling to avoid SSR issues
function DashboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signOut, user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState({ total: 0, completed: 0, pending: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [showForm, setShowForm] = useState(false);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize filter from URL params
  useEffect(() => {
    const filterParam = searchParams?.get('filter');
    if (filterParam === 'active' || filterParam === 'completed') {
      setActiveFilter(filterParam);
    } else {
      setActiveFilter('all');
    }
  }, [searchParams]);

  // Update URL when filter changes
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (activeFilter === 'all') {
      params.delete('filter');
    } else {
      params.set('filter', activeFilter);
    }

    // Update the URL without causing a page refresh
    const newUrl = `${window.location.pathname}${params.toString() ? '?' + params.toString() : ''}`;
    window.history.replaceState({}, '', newUrl);
  }, [activeFilter]);

  // Load user's tasks on mount
  // T-020: Loads tasks via API client on mount
  useEffect(() => {
    loadTasks();
  }, []);

  // Filter tasks based on active filter
  useEffect(() => {
    let filtered = tasks;

    switch (activeFilter) {
      case 'active':
        filtered = tasks.filter(task => !task.completed);
        break;
      case 'completed':
        filtered = tasks.filter(task => task.completed);
        break;
      default:
        filtered = tasks;
    }

    setFilteredTasks(filtered);
  }, [tasks, activeFilter]);

  // Listen for add task clicks from sidebar
  useEffect(() => {
    const handleAddTaskClick = () => {
      setShowForm(true);
      setEditingTask(undefined);
      setSidebarOpen(false); // Close sidebar after clicking add task
    };

    window.addEventListener('addTaskClick', handleAddTaskClick);
    return () => {
      window.removeEventListener('addTaskClick', handleAddTaskClick);
    };
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
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      loadTasks(); // Refresh tasks
    } catch (error) {
      console.error('Failed to delete task:', error);
      setError('Failed to delete task. Please try again.');
    }
  };

  // Handle task toggle
  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTask(taskId);
      loadTasks(); // Refresh tasks
    } catch (error) {
      console.error('Failed to toggle task:', error);
      setError('Failed to update task. Please try again.');
    }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex">
      {/* Sidebar for desktop */}
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col">
        <ModernHeader
          activeFilter={activeFilter}
          onFilterChange={setActiveFilter}
          user={user}
          onSignOut={handleSignOut}
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        />

        {/* Main content */}
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1">
          {/* Date and Time Display */}
          <div className="mb-8">
            <DateTimeDisplay />
          </div>

          {/* Task form (shown when adding or editing) */}
          {showForm && (
            <div className="mb-8">
              <ModernTaskForm
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
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300 shadow-sm">
              {error}
            </div>
          )}

          {/* Task list */}
          {/* T-020: Displays tasks with title, description, status */}
          {/* T-020: Loading spinner while fetching */}
          {/* T-020: Empty state: "No tasks yet. Create your first task!" */}
          {/* T-020: Responsive layout (mobile: single column, desktop: grid/list) */}
          <ModernTaskList
            tasks={tasks}
            filteredTasks={filteredTasks}
            loading={loading}
            onEdit={handleEditTask}
            onDelete={handleDeleteTask}
            onToggle={handleToggleTask}
          />
        </main>

        {/* Floating action button */}
        <ModernFab
          onClick={() => {
            setShowForm(true);
            setSidebarOpen(false); // Close sidebar when opening form
          }}
          disabled={showForm}
        />
      </div>
    </div>
  );
}

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
  return (
    <ProtectedRoute>
      <Suspense fallback={<div>Loading...</div>}>
        <DashboardContent />
      </Suspense>
    </ProtectedRoute>
  );
}
