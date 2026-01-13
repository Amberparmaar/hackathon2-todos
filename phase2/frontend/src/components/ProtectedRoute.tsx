'use client';

/**
 * Protected Route Wrapper Component for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-018
 * Spec Reference: @phase2/specs/spec.md - FR-021 (protected routes redirect)
 *
 * This reusable component wraps protected pages with authentication check.
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

/**
 * ProtectedRoute component.
 *
 * T-018: Component accepts children prop
 * T-018: Checks localStorage for JWT token
 * T-018: Redirects to /signin if token missing
 * T-018: Renders children if authenticated
 * T-018: TypeScript props defined
 * T-018: No prop drilling (proper React patterns)
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !token) {
      // T-018: Redirects to /signin if token missing
      router.push('/signin');
    }
  }, [token, loading, router]);

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Redirect to sign-in if not authenticated
  if (!token) {
    return null; // Redirect handled by useEffect
  }

  // T-018: Renders children if authenticated
  return <>{children}</>;
}
