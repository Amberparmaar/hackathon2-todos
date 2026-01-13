/**
 * API Client Test Suite for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-028
 * Spec Reference: @phase2/specs/plan.md - Testing Section
 *
 * This test suite validates the API client module:
 * - JWT token attachment to Authorization header
 * - Error handling for 401, 403, 404, 500
 * - Redirect to sign-in on 401
 * - Fetch wrapper with error handling
 * - All CRUD operations work correctly
 */

import {
  signUp,
  signIn,
  signOut,
  createTask,
  getTasks,
  getTask,
  updateTask,
  deleteTask,
  toggleTask
} from '../../src/lib/api';
import { User, Task, AuthResponse } from '../../src/types';

// Mock fetch globally
global.fetch = jest.fn();

// Mock localStorage
const mockLocalStorage = (() => {
  let store: { [key: string]: string } = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value.toString();
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
});

// Mock window.location for redirect testing
delete window.location;
(window.location as any) = {
  href: '',
  assign: jest.fn().mockImplementation((url) => {
    (window.location as any).href = url;
  }),
};

describe('API Client Module', () => {
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
    (global.fetch as jest.Mock).mockClear();
    (window.location.assign as jest.Mock).mockClear();
  });

  describe('Authentication API Functions', () => {
    test('signUp function makes correct POST request', async () => {
      const mockResponse: AuthResponse = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          created_at: '2026-01-07T10:00:00.000Z',
        },
        token: 'test-jwt-token',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await signUp('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/signup`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.getItem('auth_token')).toBe('test-jwt-token');
    });

    test('signIn function makes correct POST request', async () => {
      const mockResponse: AuthResponse = {
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          created_at: '2026-01-07T10:00:00.000Z',
        },
        token: 'test-jwt-token',
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await signIn('test@example.com', 'password123');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/signin`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
          }),
          body: JSON.stringify({ email: 'test@example.com', password: 'password123' }),
        })
      );

      expect(result).toEqual(mockResponse);
      expect(mockLocalStorage.getItem('auth_token')).toBe('test-jwt-token');
    });

    test('signOut function makes correct POST request', async () => {
      // Add a token to localStorage first
      mockLocalStorage.setItem('auth_token', 'existing-token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Successfully signed out' }),
      });

      const result = await signOut();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/signout`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer existing-token',
          }),
        })
      );

      expect(result).toEqual({ message: 'Successfully signed out' });
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });

    test('signOut function works even without token', async () => {
      // Don't add a token to localStorage
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Successfully signed out' }),
      });

      const result = await signOut();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/auth/signout`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            // Authorization header should not be present
          }),
        })
      );

      expect(result).toEqual({ message: 'Successfully signed out' });
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });
  });

  describe('Task API Functions', () => {
    const mockToken = 'test-jwt-token';
    const mockTask = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      title: 'Test Task',
      description: 'Test Description',
      completed: false,
      user_id: 'user-123',
      created_at: '2026-01-07T10:00:00.000Z',
      completed_at: null,
    };

    beforeEach(() => {
      mockLocalStorage.setItem('auth_token', mockToken);
    });

    test('createTask function makes correct POST request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      });

      const result = await createTask('New Task', 'New Description');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks`,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          }),
          body: JSON.stringify({ title: 'New Task', description: 'New Description' }),
        })
      );

      expect(result).toEqual(mockTask);
    });

    test('getTasks function makes correct GET request', async () => {
      const mockResponse = {
        tasks: [mockTask],
        total: 1,
        completed: 0,
        pending: 1,
      };

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await getTasks(10, 0);

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks?limit=10&offset=0`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );

      expect(result).toEqual(mockResponse);
    });

    test('getTask function makes correct GET request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      });

      const result = await getTask('123e4567-e89b-12d3-a456-426614174000');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/123e4567-e89b-12d3-a456-426614174000`,
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );

      expect(result).toEqual(mockTask);
    });

    test('updateTask function makes correct PUT request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockTask,
      });

      const result = await updateTask('123e4567-e89b-12d3-a456-426614174000', {
        title: 'Updated Task',
        description: 'Updated Description',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/123e4567-e89b-12d3-a456-426614174000`,
        expect.objectContaining({
          method: 'PUT',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${mockToken}`,
          }),
          body: JSON.stringify({
            title: 'Updated Task',
            description: 'Updated Description',
          }),
        })
      );

      expect(result).toEqual(mockTask);
    });

    test('deleteTask function makes correct DELETE request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ message: 'Task deleted successfully', id: '123e4567-e89b-12d3-a456-426614174000' }),
      });

      const result = await deleteTask('123e4567-e89b-12d3-a456-426614174000');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/123e4567-e89b-12d3-a456-426614174000`,
        expect.objectContaining({
          method: 'DELETE',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );

      expect(result).toEqual({
        message: 'Task deleted successfully',
        id: '123e4567-e89b-12d3-a456-426614174000',
      });
    });

    test('toggleTask function makes correct PATCH request', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ ...mockTask, completed: true }),
      });

      const result = await toggleTask('123e4567-e89b-12d3-a456-426614174000');

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks/123e4567-e89b-12d3-a456-426614174000/toggle`,
        expect.objectContaining({
          method: 'PATCH',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${mockToken}`,
          }),
        })
      );

      expect(result).toEqual({ ...mockTask, completed: true });
    });
  });

  describe('Error Handling', () => {
    beforeEach(() => {
      mockLocalStorage.setItem('auth_token', 'valid-token');
    });

    test('handles 401 error and redirects to sign-in', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: async () => ({ detail: 'Unauthorized' }),
      });

      await expect(getTasks()).rejects.toThrow('Unauthorized. Please sign in again.');

      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
      expect(window.location.assign).toHaveBeenCalledWith('/signin');
    });

    test('handles 403 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 403,
        json: async () => ({ detail: 'Forbidden' }),
      });

      await expect(getTasks()).rejects.toThrow('Forbidden');
    });

    test('handles 404 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 404,
        json: async () => ({ detail: 'Not Found' }),
      });

      await expect(getTasks()).rejects.toThrow('Not Found');
    });

    test('handles 500 error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ detail: 'Internal Server Error' }),
      });

      await expect(getTasks()).rejects.toThrow('Internal Server Error');
    });

    test('handles generic error', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 422,
        json: async () => ({ detail: 'Validation Error' }),
      });

      await expect(getTasks()).rejects.toThrow('Validation Error');
    });

    test('handles network error', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network Error'));

      await expect(getTasks()).rejects.toThrow('Network Error');
    });

    test('handles error when response is not JSON', async () => {
      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => {
          throw new Error('Unexpected token < in JSON at position 0');
        },
        text: async () => 'Internal Server Error',
      });

      await expect(getTasks()).rejects.toThrow('Internal Server Error');
    });
  });

  describe('JWT Token Attachment', () => {
    test('attaches token to requests when available', async () => {
      mockLocalStorage.setItem('auth_token', 'bearer-token-123');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [] }),
      });

      await getTasks();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks?limit=100&offset=0`,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer bearer-token-123',
          }),
        })
      );
    });

    test('does not attach token when not available', async () => {
      mockLocalStorage.removeItem('auth_token');

      (global.fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ tasks: [] }),
      });

      await getTasks();

      expect(global.fetch).toHaveBeenCalledWith(
        `${API_BASE_URL}/api/tasks?limit=100&offset=0`,
        expect.objectContaining({
          headers: expect.not.objectContaining({
            'Authorization': expect.any(String),
          }),
        })
      );
    });
  });
});