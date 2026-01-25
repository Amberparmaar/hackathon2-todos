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
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="mx-auto w-20 h-20 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
            <svg
              className="w-10 h-10 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
            Create Account
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Join our platform to start managing your tasks efficiently
          </p>
        </div>

        {/* Sign-up form */}
        {/* T-014: Form with email, password, confirm password inputs */}
        <form onSubmit={handleSubmit} className="space-y-6 bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="space-y-5">
            {/* Email input */}
            {/* T-014: Email input field with validation */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="you@example.com"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                disabled={loading}
              />
            </div>

            {/* Password input */}
            {/* T-014: Password input field (type="password", min 8 chars) */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="At least 8 characters"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
                disabled={loading}
                minLength={8}
              />
            </div>

            {/* Confirm password input */}
            {/* T-014: Confirm password field */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                placeholder="Re-enter your password"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all duration-200"
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
            className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-xl hover:from-purple-700 hover:to-blue-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
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
          <div className="text-center text-sm text-gray-600 dark:text-gray-400 pt-2">
            Already have an account?{' '}
            <a href="/signin" className="text-purple-600 hover:text-purple-700 font-medium transition-colors">
              Sign in
            </a>
          </div>
        </form>
      </div>
    </div>
  );
}
