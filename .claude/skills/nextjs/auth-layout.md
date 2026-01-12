# Next.js Auth Layout

Creates authentication pages and protected layout for Next.js app with Better Auth.

## Version
1.0

## Category
Frontend

## Inputs

| Name | Type | Description | Default |
|-------|------|-------------|----------|
| auth_spec | string | Path to auth specification | `@specs/auth/pages.md` |

## Outputs

- Login page
- Signup page
- Protected route wrapper
- Auth context provider

## Instructions

Create authentication UI components:

1. **Pages**
   - Login page with email/password
   - Signup page with validation
   - Redirect after auth

2. **Protected Layout**
   - Check for auth token
   - Redirect to login if not authenticated
   - User context provider

3. **Auth Context**
   - Manage auth state
   - Login/signup functions
   - Logout function
   - Token storage (localStorage/cookies)

4. **Forms**
   - Client-side validation
   - Error display
   - Loading states

5. **Styling**
   - Tailwind CSS
   - Responsive design
   - Modern card-based layout

## Example Usage

```
@skills/nextjs/auth-layout.md
```
