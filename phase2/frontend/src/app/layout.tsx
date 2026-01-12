/**
 * Root Layout for Phase II Full-Stack Multi-User Web Application.
 *
 * Task Reference: T-024
 * Spec Reference: @phase2/specs/plan.md - User Experience requirements
 *
 * This root layout wraps all pages with AuthProvider.
 */

import { AuthProvider } from '../components/AuthProvider';
import './globals.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Todo App - Phase II</title>
      </head>
      <body>
        {/* T-024: Protected routes wrapped with ProtectedRoute */}
        {/* T-024: Public routes accessible (signin, signup) */}
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
