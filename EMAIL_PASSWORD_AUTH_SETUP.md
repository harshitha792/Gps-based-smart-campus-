# REVA Smart Campus — Email/Password Authentication

This build retains the existing REVA Smart Campus sign-in page and removes the Google sign-in button and Google OAuth action.

## Sign-in options
- Create Campus Account with full name, account type, registration number, email and password.
- Sign in with email and password.
- Forgot password sends a reset email.
- After successful sign-in, the app routes to `/horizon`.

## Supabase configuration
1. Open the Supabase project used by this app.
2. Go to Authentication → Sign In / Providers → Email and enable Email.
3. Go to Authentication → URL Configuration. Set Site URL to the exact local origin printed by Vite (for example `http://localhost:8080`) and add the matching redirect URL (for example `http://localhost:8080/**`).
4. For local testing only, email confirmation can be disabled temporarily. For production, keep confirmation enabled and configure SMTP.

The frontend uses Supabase Auth for secure password handling and session management. No password is stored in browser local storage by app code, and no Google OAuth credentials are required.
