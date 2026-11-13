# REVA Smart Campus

Student campus app: auth (email/password only), Horizon dashboard and eight modules
(Campus Map, Find Places, Services, GPS Attendance, Smart Insights, Parking, Safety, Events).

## Run locally
```bash
npm install
cp .env.example .env   # fill in your backend URL and publishable key
npm run dev
```

## Backend
- Schema: `supabase/schema.sql` (profiles, attendance, incident_reports with row-level security).
- Add `http://localhost:8080` (and your deployed URL) to the auth redirect URL allow-list so
  sign-up confirmation and password reset can return to the app. Redirects use `window.location.origin`.
- Only the publishable key is used in the browser. Never put a service-role key in frontend code.

## Data honesty
- GPS uses the real browser location; attendance is only saved when within the configured
  geofence (`src/lib/geo.ts`, 500 m around the campus centre).
- Parking and campus analytics are labelled **Demo data**.
- SOS places phone calls only; no notification provider is configured.
