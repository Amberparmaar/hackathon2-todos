'use client';

/**
 * Auth Context/Provider for Phase II Full-Stack Multi-User Web Application.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import { signIn, signUp as apiSignUp, signOut as apiSignOut } from '@/lib/api';
import { User, AuthContextType } from '@/types';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const storedToken = localStorage.getItem('auth_token');
    if (storedToken) {
      setToken(storedToken);
    }
    setLoading(false);
  }, []);

  const signInHandler = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await signIn(email, password);
      setUser(response.user);
      setToken(response.token);
    } finally {
      setLoading(false);
    }
  };

  const signUpHandler = async (email: string, password: string) => {
    setLoading(true);
    setError(null);
    try {
      const response = await apiSignUp(email, password);
      setUser(response.user);
      setToken(response.token);
    } finally {
      setLoading(false);
    }
  };

  const signOutHandler = async () => {
    setLoading(true);
    setError(null);
    try {
      await apiSignOut();
      setUser(null);
      setToken(null);
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

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
