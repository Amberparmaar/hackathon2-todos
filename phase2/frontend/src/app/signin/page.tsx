'use client';

/**
 * Sign-In Page for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-013
 * Spec Reference: @phase2/specs/plan.md - Step 2 requirements
 *
 * This login page provides email/password form and authentication integration.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../components/AuthProvider';

/**
 * Sign-in page.
 *
 * T-013: Page accessible at /signin
 * T-013: Form with email and password inputs
 * T-013: Calls AuthContext.signIn function
 * T-013: Displays error messages from auth
 * T-013: Redirects to dashboard on successful login
 * T-013: Responsive layout with Tailwind styling
 */
export default function SignInPage() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // T-013: Calls AuthContext.signIn function
      await signIn(email, password);
      // T-013: Redirects to dashboard on successful login
      router.push('/dashboard');
    } catch (err) {
      // T-013: Displays error messages from auth
      setError(err instanceof Error ? err.message : 'Failed to sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign In
          </h1>
          <p className="text-gray-600">
            Welcome back! Please sign in to access your tasks.
          </p>
        </div>

        {/* Sign-in form */}
        {/* T-013: Form with email and password inputs */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email input */}
            {/* T-013: Email input field with validation */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                disabled={loading}
              />
            </div>

            {/* Password input */}
            {/* T-013: Password input field with type="password" */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="Enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                disabled={loading}
                minLength={8}
              />
            </div>
          </div>

          {/* Sign-in button */}
          {/* T-013: Sign-in button with loading state */}
          <button
            type="submit"
            disabled={loading || !email || !password}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>

          {/* Sign up link */}
          <div className="text-center text-sm text-gray-600">
            Don't have an account?{' '}
            <a href="/signup" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign up
            </a>
          </div>
        </form>

        {/* T-013: Responsive layout with Tailwind styling */}
      </div>
    </div>
  );
}
