'use client';

/**
 * Sign-Up Page for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-014
 * Spec Reference: @phase2/specs/plan.md - User Story 1 (Registration)
 *
 * This user registration page provides email/password form.
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/AuthProvider';

/**
 * Sign-up page.
 *
 * T-014: Page accessible at /signup
 * T-014: Form with email, password, confirm password inputs
 * T-014: Calls AuthContext.signUp function
 * T-014: Password minimum length validation (8 chars)
 * T-014: Password matching validation
 * T-014: Displays error messages from auth
 * T-014: Redirects to dashboard on successful signup
 * T-014: Responsive layout with Tailwind styling
 */
export default function SignUpPage() {
  const router = useRouter();
  const { signUp } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation: Password minimum length (8 chars)
    // T-014: Password minimum length validation (8 chars)
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }

    // Validation: Password matching
    // T-014: Password matching validation
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      // T-014: Calls AuthContext.signUp function
      await signUp(email, password);
      // T-014: Redirects to dashboard on successful signup
      router.push('/dashboard');
    } catch (err) {
      // T-014: Displays error messages from auth
      setError(err instanceof Error ? err.message : 'Failed to sign up');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Sign Up
          </h1>
          <p className="text-gray-600">
            Create your account to start managing your tasks.
          </p>
        </div>

        {/* Sign-up form */}
        {/* T-014: Form with email, password, confirm password inputs */}
        <form onSubmit={handleSubmit} className="mt-8 space-y-6 bg-white p-8 rounded-lg shadow-md">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* Email input */}
            {/* T-014: Email input field with validation */}
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
            {/* T-014: Password input field (type="password", min 8 chars) */}
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
                placeholder="At least 8 characters"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                disabled={loading}
                minLength={8}
              />
            </div>

            {/* Confirm password input */}
            {/* T-014: Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
                disabled={loading}
                minLength={8}
              />
            </div>
          </div>

          {/* Sign-up button */}
          {/* T-014: Sign-up button with loading state */}
          <button
            type="submit"
            disabled={loading || !email || !password || !confirmPassword}
            className="w-full px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Creating account...
              </>
            ) : (
              'Sign Up'
            )}
          </button>

          {/* Sign in link */}
          <div className="text-center text-sm text-gray-600">
            Already have an account?{' '}
            <a href="/signin" className="text-blue-500 hover:text-blue-600 font-medium">
              Sign in
            </a>
          </div>
        </form>

        {/* T-014: Responsive layout with Tailwind styling */}
      </div>
    </div>
  );
}
