/**
 * TypeScript types for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-026
 * Spec Reference: @phase2/specs/plan.md - TypeScript requirements
 *
 * This module defines TypeScript types for API requests, responses, and user data.
 */

import { UUID } from 'crypto';

// ============================================================================
// User Types
// ============================================================================

/**
 * User interface.
 *
 * T-026: User interface defined (id, email, created_at)
 */
export interface User {
  id: string;
  email: string;
  created_at: string;
}

/**
 * User registration request.
 */
export interface UserCreate {
  email: string;
  password: string;
}

/**
 * User login request.
 */
export interface UserLogin {
  email: string;
  password: string;
}

/**
 * Authentication response with token.
 *
 * T-026: Response interfaces for all API calls
 */
export interface AuthResponse {
  token: string;
  user: User;
}

// ============================================================================
// Task Types
// ============================================================================

/**
 * Task interface.
 *
 * T-026: Task interface defined (all fields)
 */
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  completed_at: string | null;
}

/**
 * Task creation request.
 *
 * T-026: Request interfaces for all API calls
 */
export interface TaskCreate {
  title: string;
  description?: string;
}

/**
 * Task update request.
 *
 * T-026: Request interfaces for all API calls
 */
export interface TaskUpdate {
  title?: string;
  description?: string;
}

/**
 * Task list response with statistics.
 *
 * T-026: Response interfaces for all API calls
 */
export interface TaskListResponse {
  tasks: Task[];
  total: number;
  completed: number;
  pending: number;
}

/**
 * Delete task response.
 */
export interface DeleteTaskResponse {
  message: string;
  id: string;
}

/**
 * Sign out response.
 */
export interface SignOutResponse {
  message: string;
}

// ============================================================================
// Error Types
// ============================================================================

/**
 * API error response.
 *
 * T-026: Error interfaces with code and message
 */
export interface ApiError {
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
}

/**
 * HTTP status codes.
 */
export type HttpStatusCode =
  | 200
  | 201
  | 400
  | 401
  | 403
  | 404
  | 409
  | 422
  | 429
  | 500;

// ============================================================================
// Auth Context Types
// ============================================================================

/**
 * Authentication context state.
 */
export interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => void;
}
