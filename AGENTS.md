<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep student identity and authentication handlers unchanged during presentation refinements, because existing sessions and account flows must remain compatible.
- Campus Map uses browser GPS and Leaflet view commands; do not use demonstration place coordinates as real pins. The configured geofence remains shared with attendance to preserve check-in behavior.
- Store uploaded photographs as CDN asset pointers; keep design references out of displayed app media.
- Horizon highlight images use a fixed-ratio cover frame with a neutral unavailable state; missing or failed photos must not substitute another highlight's image.
- Find Places keeps uploaded facility photos scoped to its page, and passes selected-place context to Campus Map without pinning sample coordinates; directions stay disabled until building locations are verified.
- Account type is a self-declared profile field, never a permission; campus management requires a separately provisioned role enforced by database policies so signup cannot grant privileged access.
- Use the shared account selector on sign-in, signup and account settings; navigation exposes approved tools only from saved permission queries, because choosing an account type must never elevate access.
- Published events are shared through one query across Events and Horizon; static sample schedules remain labelled separately to avoid presenting invented dates as official announcements.
- Management attendance decisions live in a separate review record rather than overwriting original GPS check-ins, preserving location evidence.
- RSVPs reference published database events only, with a unique event/member pair and owner-scoped cancellation; attendee identities are visible only to approved campus managers through database policies.
- Store centralized notifications and notice reads in owner-scoped database records; publish announcements through approved capabilities so unread counts reflect saved data rather than sample notices.
- Theme selection changes semantic CSS tokens and persists only the presentation preference locally; account/session handlers remain independent.
- Campus complaints, lost/found and feedback share a validated report workflow; claims remain private, progress is management-only, and photo URLs are short-lived signed URLs.
- Resource reservation overlap is prevented by a database exclusion constraint, not a browser-only availability check; original booking details remain immutable on cancellation.
- Digital IDs require approval and opaque revocable tokens; authorized verification is the only path to entry/exit records.
- The campus assistant uses one owner-scoped persisted AI SDK conversation and a server-only streaming endpoint; never present unverified campus records as official context.
- Administrative and security capabilities are separately provisioned; legacy campus managers retain event/attendance permissions but never implicitly gain full administration or security access.
- Timetable reminders are delivered durably while the signed-in app checks notifications; unattended delivery needs an explicitly configured scheduler.
- Camera QR capture dynamically loads its browser-only library after user action; denial falls back to scanned-code entry without recording access automatically.
- Keep empty-page examples separate from stored records and all write actions; examples must never generate alerts, submissions, attendance, or valid IDs.
- Read displayed identity from the saved profile, including a nullable registration identifier; signup captures metadata through a profile insert trigger without changing existing auth handlers or granting permissions.
