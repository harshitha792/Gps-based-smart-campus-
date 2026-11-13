# REVA Smart Campus platform upgrade

## Preserve the existing app
Upgrade this project in place using Lovable Cloud. Keep all ten existing modules, Google and email sign-in, registration, password reset, sessions, uploaded campus photos, GPS check-ins, and event RSVPs. Deliver connected workflows incrementally rather than replacing the app.

## Inspection findings
- The current app has all ten requested core modules and seven existing database tables, with row-level access controls.
- Account types support students, faculty and working staff; visitors remain excluded. Event publishing, attendance reviews and attendee access already require a separately approved campus-manager role.
- Events and RSVPs are saved; notices and campus-wide analytics currently use sample content. Parking availability is simulated.
- Safety saves personal incident reports but does not currently alert campus security.
- Maps use Leaflet/OpenStreetMap and real browser GPS. Individual building positions, accessible paths and the surveyed campus boundary still need authoritative information.
- Presentation currently uses compact Poppins typography and a dark theme. The new specification changes the default to light, while retaining dark mode.

## Delivery sequence

### 1. Shared foundation, permissions and notifications
- Add a light-default theme switch, retaining REVA branding, existing photographs and compact layouts.
- Preserve self-declared account types separately from permissions. Add explicit approved faculty and admin capabilities without granting privileges through signup or removing existing manager access.
- Create a centralized notification page, unread count, history and read/unread controls. Connect saved notifications to booking confirmations, complaint updates, announcements and event reminders.
- Add a digital notice board for university, department, academic, examination, event and emergency announcements. Approved publishers manage notices; members track what they have read.

### 2. Complaints, lost and found, and feedback
- Complaints: report issues with photos, suggest a category automatically, allow category correction, assign a responsible department, track progress and rate completed resolutions.
- Lost and found: report lost/found items with photos, search/filter, submit private ownership claims and track authorized verification and resolution.
- Feedback: facility/service ratings, suggestions, personal submission history and protected management summaries.
- Keep claim evidence, reporter details and complaint photos restricted to the people authorized to see them.

### 3. Resource booking and timetable
- Add an administrator-managed inventory of laboratories, classrooms, seminar halls, study rooms and other facilities.
- Check availability, prevent overlapping reservations in the database, confirm bookings and allow owner cancellation.
- Add personalized and faculty schedules, upcoming classes, exams and reminders, based on published or user-entered schedules rather than invented official timetables.
- Tie confirmations, cancellations and reminders into the notification center.

### 4. AI Campus Assistant
- Use **one ongoing conversation**, as requested, with **database-persisted history**, matching the specification that all data must persist.
- Support English and Kannada, streaming answers and complete conversation context.
- Ground answers in available places, services, published events and notices. Access personal information only within the signed-in user's permissions.
- Link to the relevant existing module. Never invent classrooms, opening hours, official schedules, GPS positions or verified walking directions.
- Keep AI credentials and calls server-side. AI usage consumes workspace credits; show actionable errors when access or credits block a request.

### 5. Digital ID and emergency operations
- Issue a unique QR-based digital ID only after authorized approval; display member details and support protected verification.
- Record entry/exit through authorized check-ins, not merely by opening an ID page or scanning an untrusted code.
- Upgrade incident reporting with GPS consent, authorized security visibility, acknowledgement, assignment, response history and emergency broadcasts.
- Preserve real emergency calling. Clearly distinguish an alert saved to the app from an alert actually received or acknowledged by security.
- Browser notifications require consent; external SMS/email/security dispatch requires an available configured delivery service.

### 6. Campus operations and advanced insights
- Add management of verified campus locations, accessible facilities/routes, parking areas and slots without treating sample coordinates as authoritative.
- Expand interactive charts using saved attendance, bookings, complaints, feedback and event participation; show reporting periods and data provenance.
- Add consent-based geofence notifications while preserving the shared attendance zone.
- Calculate occupancy and crowd predictions only from sufficient actual/historical inputs; otherwise show unavailable or explicitly simulated results.
- Keep manually maintained parking status distinct from live sensor readings. Navigation and accessibility recommendations use verified route data only.
- Generate AI recommendations grounded in the available summaries, without exposing individual private records.

## Technical approach
- Retain TanStack Start, existing components and query patterns. Add a real page for each new module and update shared navigation/search.
- Apply additive database migrations with explicit grants, row-level policies, validation and duplicate/conflict protection; preserve original attendance evidence and existing RSVP constraints.
- Use protected server functions for internal server logic and server-side AI calls. Scope user data to its owner and enforce faculty/admin/security capabilities at the database and server boundaries.
- Store user photos in access-controlled Lovable Cloud storage, validating file type and size. Preserve existing uploaded campus media as CDN asset pointers.
- Use durable notification records and scheduled reminder delivery; use authorized real-time updates where appropriate.
- Keep QR verification non-enumerable, revocable and protected; never encode private profile details or account credentials in the QR.

## Verification and acceptance
- Add focused tests for role restrictions, claim privacy, booking conflicts/cancellation, complaint transitions/ratings, notice reads and QR authorization.
- Verify signed-in submit → saved result → reload flows for every new module, plus manager-only workflows using an approved account.
- Recheck existing Horizon, map permission/denial/recenter, attendance, parking and event RSVP/cancellation flows, desktop/mobile layouts and app compilation.
- Test the assistant with a real English exchange, Kannada question and follow-up context.
- No placeholder actions or fake success messages. Clearly report unavailable integrations and blocked verification.

## Information required for official campus operation
Implementation can proceed with honest empty states, but official use requires: a designated approved administrator/security account, verified building and accessibility data, approved bookable resources, official schedules/security contacts, and any live parking/occupancy or external alert service. The original official logo upload is still pending.

This plan covers the full specification; each stage will be implemented and verified before moving to the next.