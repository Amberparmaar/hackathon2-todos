/**
 * AuthProvider Component Test Suite for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-028
 * Spec Reference: @phase2/specs/plan.md - Testing Section
 *
 * This test suite validates the AuthProvider component:
 * - Provides user state (user, token, loading, error)
 * - Handles login/logout functionality
 * - Manages token storage in localStorage
 * - Provides token retrieval from localStorage
 * - Manages loading and error states
 */

import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../src/components/AuthProvider';
import { User } from '../../src/types';

// Mock the API functions
jest.mock('../../src/lib/api', () => ({
  signUp: jest.fn(),
  signIn: jest.fn(),
  signOut: jest.fn(),
}));

import { signUp, signIn, signOut } from '../../src/lib/api';

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

// Create a test component to use the auth context
const TestComponent = () => {
  const { user, token, loading, error, signIn, signUp, signOut } = useAuth();

  return (
    <div>
      <div data-testid="user">{user?.email || 'No user'}</div>
      <div data-testid="token">{token || 'No token'}</div>
      <div data-testid="loading">{loading ? 'Loading' : 'Not loading'}</div>
      <div data-testid="error">{error || 'No error'}</div>
      <button onClick={() => signIn('test@example.com', 'password123')}>Sign In</button>
      <button onClick={() => signUp('new@example.com', 'password123')}>Sign Up</button>
      <button onClick={signOut}>Sign Out</button>
    </div>
  );
};

describe('AuthProvider Component', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.clear();
  });

  test('provides initial auth state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('user')).toHaveTextContent('No user');
    expect(screen.getByTestId('token')).toHaveTextContent('No token');
    expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
    expect(screen.getByTestId('error')).toHaveTextContent('No error');
  });

  test('loads token from localStorage on mount', () => {
    mockLocalStorage.setItem('auth_token', 'test-jwt-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('token')).toHaveTextContent('test-jwt-token');
  });

  test('handles sign in functionality', async () => {
    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174000',
      email: 'test@example.com',
      created_at: '2026-01-07T10:00:00.000Z',
    };

    (signIn as jest.MockedFunction<typeof signIn>).mockResolvedValue({
      user: mockUser,
      token: 'signed-in-token',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByTestId('user')).toHaveTextContent('test@example.com');
      expect(screen.getByTestId('token')).toHaveTextContent('signed-in-token');
      expect(mockLocalStorage.getItem('auth_token')).toBe('signed-in-token');
    });
  });

  test('handles sign up functionality', async () => {
    const mockUser: User = {
      id: '123e4567-e89b-12d3-a456-426614174001',
      email: 'new@example.com',
      created_at: '2026-01-07T10:00:00.000Z',
    };

    (signUp as jest.MockedFunction<typeof signUp>).mockResolvedValue({
      user: mockUser,
      token: 'signed-up-token',
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signUpButton = screen.getByText('Sign Up');
    fireEvent.click(signUpButton);

    await waitFor(() => {
      expect(signUp).toHaveBeenCalledWith('new@example.com', 'password123');
      expect(screen.getByTestId('user')).toHaveTextContent('new@example.com');
      expect(screen.getByTestId('token')).toHaveTextContent('signed-up-token');
      expect(mockLocalStorage.getItem('auth_token')).toBe('signed-up-token');
    });
  });

  test('handles sign out functionality', async () => {
    (signOut as jest.MockedFunction<typeof signOut>).mockResolvedValue({
      message: 'Successfully signed out',
    });

    // Pre-populate localStorage with a token
    mockLocalStorage.setItem('auth_token', 'existing-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify initial state
    expect(screen.getByTestId('token')).toHaveTextContent('existing-token');

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
      expect(screen.getByTestId('user')).toHaveTextContent('No user');
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });
  });

  test('manages loading state during authentication', async () => {
    // Mock a delayed sign in
    (signIn as jest.MockedFunction<typeof signIn>).mockImplementation(
      () => new Promise(resolve => setTimeout(() => resolve({
        user: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          email: 'test@example.com',
          created_at: '2026-01-07T10:00:00.000Z',
        },
        token: 'delayed-token',
      }), 100))
    );

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    // Check loading state during the operation
    expect(screen.getByTestId('loading')).toHaveTextContent('Loading');

    // Wait for the operation to complete
    await waitFor(() => {
      expect(screen.getByTestId('loading')).toHaveTextContent('Not loading');
      expect(screen.getByTestId('token')).toHaveTextContent('delayed-token');
    });
  });

  test('manages error state during authentication failures', async () => {
    const errorMessage = 'Invalid credentials';
    (signIn as jest.MockedFunction<typeof signIn>).mockRejectedValue(new Error(errorMessage));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(signIn).toHaveBeenCalledWith('test@example.com', 'password123');
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });
  });

  test('clears error state when performing new authentication', async () => {
    // First, trigger an error
    const errorMessage = 'Invalid credentials';
    (signIn as jest.MockedFunction<typeof signIn>).mockRejectedValue(new Error(errorMessage));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    const signInButton = screen.getByText('Sign In');
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent(errorMessage);
    });

    // Reset the mock to succeed this time
    (signIn as jest.MockedFunction<typeof signIn>).mockResolvedValue({
      user: {
        id: '123e4567-e89b-12d3-a456-426614174000',
        email: 'test@example.com',
        created_at: '2026-01-07T10:00:00.000Z',
      },
      token: 'new-token',
    });

    // Trigger a new authentication
    fireEvent.click(signInButton);

    await waitFor(() => {
      expect(screen.getByTestId('error')).toHaveTextContent('No error');
    });
  });

  test('removes token from localStorage when sign out fails', async () => {
    // Mock signOut to fail but still remove the token
    (signOut as jest.MockedFunction<typeof signOut>).mockRejectedValue(new Error('Network error'));

    // Pre-populate localStorage with a token
    mockLocalStorage.setItem('auth_token', 'existing-token');

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    // Verify initial state
    expect(screen.getByTestId('token')).toHaveTextContent('existing-token');

    const signOutButton = screen.getByText('Sign Out');
    fireEvent.click(signOutButton);

    await waitFor(() => {
      expect(signOut).toHaveBeenCalled();
      expect(screen.getByTestId('token')).toHaveTextContent('No token');
      expect(mockLocalStorage.getItem('auth_token')).toBeNull();
    });
  });
});