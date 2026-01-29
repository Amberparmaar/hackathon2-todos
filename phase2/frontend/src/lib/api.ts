/**
 * API client module for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-015, T-019
 * Spec Reference: @phase2/specs/contracts/openapi.yaml - API Contracts
 *
 * This module provides API client with JWT attachment and error handling.
 */

import {
  AuthResponse,
  UserCreate,
  UserLogin,
  Task,
  TaskCreate,
  TaskUpdate,
  TaskListResponse,
  DeleteTaskResponse,
  SignOutResponse,
  ApiError,
} from '../types';

// API base URL from environment
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://amberparmaar-backend-todo.hf.space';

/**
 * Get JWT token from localStorage.
 *
 * T-015: Function to get JWT token from localStorage
 */
function getToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('auth_token');
  }
  return null;
}

/**
 * Set JWT token in localStorage.
 *
 * T-012: Token storage in localStorage
 */
function setToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_token', token);
  }
}

/**
 * Remove JWT token from localStorage.
 */
function removeToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
  }
}

/**
 * Create fetch wrapper with error handling.
 *
 * T-015: Fetch wrapper with error handling
 * T-015: Error handling for 401, 403, 404, 500
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${API_URL}${endpoint}`;
  const token = getToken();

  // Attach JWT token to Authorization header
  // T-015: All functions attach Authorization: Bearer <token> header
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  // Handle non-JSON responses
  if (!response.headers.get('content-type')?.includes('application/json')) {
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    return {} as T;
  }

  const data = await response.json();

  // Handle error responses
  if (!response.ok) {
    // T-015: Error handling for 401, 403, 404, 500
    if (response.status === 401) {
      // Unauthorized - remove token but don't redirect here
      // Redirecting should be handled by components
      removeToken();
      throw new Error('Unauthorized. Please sign in again.');
    }
    throw new Error(data.detail || data.message || 'An error occurred');
  }

  return data;
}

// ============================================================================
// Authentication API
// ============================================================================

/**
 * Sign up new user.
 *
 * T-015: signUp function (API call + token storage)
 */
export async function signUp(email: string, password: string): Promise<AuthResponse> {
  const userCreate: UserCreate = { email, password };
  const response = await apiRequest<AuthResponse>('/api/auth/signup', {
    method: 'POST',
    body: JSON.stringify(userCreate),
  });

  // Store token on successful signup
  setToken(response.token);
  return response;
}

/**
 * Sign in existing user.
 *
 * T-015: signIn function (API call + token storage)
 */
export async function signIn(email: string, password: string): Promise<AuthResponse> {
  const userLogin: UserLogin = { email, password };
  const response = await apiRequest<AuthResponse>('/api/auth/signin', {
    method: 'POST',
    body: JSON.stringify(userLogin),
  });

  // Store token on successful sign-in
  setToken(response.token);
  return response;
}

/**
 * Sign out current user.
 *
 * T-015: signOut function (clear token + redirect to /signin)
 */
export async function signOut(): Promise<SignOutResponse> {
  const token = getToken();
  if (token) {
    await apiRequest<SignOutResponse>('/api/auth/signout', {
      method: 'POST',
    });
  }

  // Remove token from localStorage
  removeToken();
  return { message: 'Successfully signed out' };
}

// ============================================================================
// Task CRUD API
// ============================================================================

/**
 * Create new task.
 *
 * T-015: createTask(title, description) function
 * T-019: createTask sends POST request
 */
export async function createTask(
  title: string,
  description?: string,
  dueDate?: string
): Promise<Task> {
  const taskCreate: TaskCreate = { title, description, due_date: dueDate };
  return apiRequest<Task>('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskCreate),
  });
}

/**
 * Get all tasks for current user.
 *
 * T-015: getTasks() function with optional limit/offset
 * T-019: getTask function added (list)
 */
export async function getTasks(
  limit: number = 100,
  offset: number = 0
): Promise<TaskListResponse> {
  const params = new URLSearchParams({
    limit: limit.toString(),
    offset: offset.toString(),
  });
  return apiRequest<TaskListResponse>(`/api/tasks?${params.toString()}`);
}

/**
 * Get specific task by ID.
 *
 * T-019: getTask(id) function added
 */
export async function getTask(id: string): Promise<Task> {
  return apiRequest<Task>(`/api/tasks/${id}`);
}

/**
 * Update task.
 *
 * T-015: updateTask(id, title, description) function
 * T-019: updateTask sends PUT request
 */
export async function updateTask(
  id: string,
  updates: TaskUpdate
): Promise<Task> {
  return apiRequest<Task>(`/api/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
}

/**
 * Delete task.
 *
 * T-015: deleteTask(id) function
 * T-019: deleteTask sends DELETE request
 */
export async function deleteTask(id: string): Promise<DeleteTaskResponse> {
  return apiRequest<DeleteTaskResponse>(`/api/tasks/${id}`, {
    method: 'DELETE',
  });
}

/**
 * Toggle task completion status.
 *
 * T-015: toggleTask(id) function
 * T-019: toggleTask sends PATCH request
 */
export async function toggleTask(id: string): Promise<Task> {
  return apiRequest<Task>(`/api/tasks/${id}/toggle`, {
    method: 'PATCH',
  });
}
