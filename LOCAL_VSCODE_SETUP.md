# REVA Smart Campus — Local VS Code setup

## 1. Requirements
- Node.js 20 or newer (Node 22 is fine)
- npm, or Bun if you prefer

## 2. Install and run
Open this folder in VS Code, open Terminal → New Terminal, and run:

```bash
npm install
npm run dev
```

Open the exact `Local:` URL printed by Vite (normally `http://localhost:5173`). Keep the terminal running. Stop the server with `Ctrl+C`.

If using Bun instead:

```bash
bun install
bun run dev
```

## 3. Supabase environment
The project uses the existing `.env` file supplied with the project. Do not commit `.env` to Git. If it is missing, copy `.env.example` to `.env` and fill in the values from Supabase → Project Settings → API:

```env
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_PUBLISHABLE_KEY
```

Never put a Supabase `service_role` or secret key in a `VITE_` variable or browser code.

## 4. Enable email/password sign-in in Supabase
1. Supabase Dashboard → Authentication → Sign In / Providers → Email; enable Email.
2. In Authentication → URL Configuration, set the local Site URL to the exact Vite origin shown in your terminal (for example `http://localhost:8080`).
3. Add the matching redirect allow-list entry (for example `http://localhost:8080/**`).
4. For local testing, email confirmation may be disabled temporarily. For production, keep confirmation enabled and configure SMTP.
5. The app uses Supabase email/password sign-up, sign-in and password reset. Google sign-in is not included in this build.

## 5. Local image assets
Lovable-only `/__l5e/assets-v1/...` references have been replaced with files under `public/images/`. The ZIP did not contain the original binary files for several uploaded custom REVA images; where those were missing, the project now uses the closest matching image already bundled in `src/assets` (campus entrance, library, cafeteria, computer lab, sports, and parking). Replace the corresponding files in `public/images/` with the original high-resolution REVA photos if you have them. Keep the filenames unchanged.

## Troubleshooting
- `vite: command not found`: run `npm install` from the project root.
- Missing Supabase environment variables: verify `.env` is in the project root and contains the VITE variables above, then restart Vite.
