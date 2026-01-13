'use client';

/**
 * Auth Context/Provider for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-012
 * Spec Reference: @phase2/specs/spec.md - FR-021, FR-027
 *
 * This component provides React context for managing user authentication state and token storage.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signUp as apiSignUp, signOut as apiSignOut } from '@/lib/api';
import { User, AuthContextType } from '@/types';

// Create auth context
// T-012: Context provider wraps children
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Auth Provider component.
 *
 * T-012: Provides user state (user, token, loading, error)
 * T-012: Provides login/signup/logout functions
 * T-012: Token storage in localStorage
 * T-012: Token retrieval from localStorage on load
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load token from localStorage on mount
  // T-012: Retrieves token from localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
      // TODO: Optionally fetch user profile to validate token
    }
    setLoading(false);
  }, []);

  /**
   * Sign in user.
   *
   * T-012: Exposes signIn, signUp, signOut functions
   */
  const signInHandler = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await signIn(email, password);
      setUser(response.user);
      setToken(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign up new user.
   *
   * T-012: Exposes signIn, signUp, signOut functions
   */
  const signUpHandler = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiSignUp(email, password);
      setUser(response.user);
      setToken(response.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  /**
   * Sign out user.
   *
   * T-012: Exposes signIn, signUp, signOut functions
   * T-012: Stores JWT token in localStorage
   */
  const signOutHandler = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiSignOut();
      setUser(null);
      setToken(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    token,
    loading,
    error,
    signIn: signInHandler,
    signUp: signUpHandler,
    signOut: signOutHandler,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context.
 *
 * T-012: Type definitions for User, AuthContext interface
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
