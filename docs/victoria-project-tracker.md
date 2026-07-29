# Victoria Private Page: Project Tracker

Last reviewed: 29 July 2026

This is the living checklist for the private `/victoria` area. It combines:

- the original implementation brief,
- Freddie's answers from the earlier ChatGPT planning conversation,
- the implementation currently present in this repository,
- local setup and testing completed so far,
- remaining production, content, security, and quality work.

Update the checkboxes and the progress log whenever something changes. Do not put
passwords, provider keys, session cookies, or raw claim links in this file.

## Status Legend

- `[x]` Complete and verified.
- `[ ]` Still needs doing or manual verification.
- **Implemented, unverified** means the code exists, but the complete real-world
  workflow has not yet been tested.
- **Optional** means it is an enhancement rather than a launch requirement.

## Product Decisions

- [x] The page lives at `/victoria` inside the existing Next.js portfolio.
- [x] Production remains on Vercel.
- [x] The page has its own romantic, cute, playful visual identity.
- [x] Only Freddie and Victoria can access it.
- [x] Both users can write messages and upload private photos.
- [x] Memories, plans, milestones, daily messages, and easter-egg copy are edited
  by Freddie in source code.
- [x] Messages behave as a shared realtime note wall, not a full WhatsApp replacement.
- [x] Photos are attached to memories and kept in private object storage.
- [x] Neither user has an ordinary delete button.
- [x] Freddie has terminal administration commands and an owner-only activity page.
- [x] There are no notifications in the initial version.
- [x] The initial countdown target is 18 September 2026 at 16:00 Europe/London.
- [x] The official relationship date is 11 July 2026 and is presented subtly.
- [x] Device access uses one-time account-specific claim links, not "first visitor
  is Freddie, second visitor is Victoria."
- [x] Authentication follows the secure session cookie, not IP address, Wi-Fi,
  MAC address, or invasive browser fingerprinting.

## Current Architecture

| Concern | Current choice | Status |
| --- | --- | --- |
| Application | Next.js 14 App Router, TypeScript, Tailwind, Framer Motion | Working locally |
| Hosting | Existing Vercel deployment | Production update pending |
| Database | Supabase Postgres transaction pooler through `postgres` | Migrated and working |
| Private media | Private Supabase Storage bucket | Configured; real upload test pending |
| Realtime | Ably token auth and private shared channel | Configured; two-device test pending |
| Authentication | One-time claim token plus hashed device session | Freddie local flow verified |
| Static content | Typed configuration in `lib/victoria/content.ts` | Placeholders need replacing |
| Activity | First-party Postgres events and Freddie-only dashboard | Implemented; review pending |
| Rate limiting | Optional external HTTP limiter | Not configured; currently fail-open |

The database client deliberately uses one shared connection and serial page queries.
This avoids intermittent hangs observed with concurrent queries through Supabase's
transaction pooler during Next.js development.

## Completed Work

### Foundation and Infrastructure

- [x] Inspected the existing portfolio architecture and discovery report.
- [x] Kept the existing Next.js App Router and Vercel deployment model.
- [x] Added the Victoria dependency set, including PostgreSQL, Supabase, Ably,
  image validation, and image processing support.
- [x] Added an environment contract to `.env.example`.
- [x] Added Victoria environment guidance to `docs/environment-variables.md`.
- [x] Created `npm run victoria:doctor` without printing secret values.
- [x] Confirmed all required local Victoria environment variables pass the doctor.
- [x] Connected the local project to Supabase Postgres.
- [x] Applied the database migration.
- [x] Seeded Freddie and Victoria idempotently.
- [x] Created and verified the private `victoria-private` Supabase Storage bucket.
- [x] Configured and tested the Ably server API key.
- [x] Changed the database client to survive Next.js hot reloads without leaking pools.
- [x] Fixed Supabase pooled-query contention that caused `/victoria` to hang.

### Authentication and Device Access

- [x] Seeded stable Freddie (`owner`) and Victoria (`member`) accounts.
- [x] Created 256-bit random one-time claim tokens.
- [x] Stored only keyed token hashes in Postgres.
- [x] Added expiry, single-use, revocation, and account binding to claim tokens.
- [x] Made claim/session creation one atomic database transaction.
- [x] Added a normal POST claim flow with a disabled `Claiming...` state.
- [x] Added long-lived random device sessions with only hashed tokens in Postgres.
- [x] Added `HttpOnly`, `SameSite=Lax`, production-secure session cookies.
- [x] Added coarse browser/OS device labels without using them as authentication.
- [x] Added automatic return access for the same browser.
- [x] Added logout and stale-cookie handling.
- [x] Added terminal commands to list and revoke devices or account sessions.
- [x] Added a terminal command to generate replacement claim links.
- [x] Verified Freddie's complete claim flow locally in a real browser.
- [x] Verified invalid cookies redirect safely instead of causing a server error.
- [ ] Claim Victoria's actual browser/device.
- [ ] Verify automatic return login on Victoria's device after closing the browser.
- [ ] Verify the real production-domain cookie after Vercel deployment.
- [ ] Remove or replace the claim URL in browser history after successful claiming.
  The token is single-use, but the old path can still remain in back-button history.
- [ ] Add persistent rate limiting to claim submissions.

### Private Route and Privacy Isolation

- [x] Added the protected `/victoria` route and neutral access page.
- [x] Added neutral private metadata with `noindex`/`nofollow`.
- [x] Added `X-Robots-Tag` and private no-store production headers.
- [x] Disallowed `/victoria/` in `public/robots.txt`.
- [x] Kept `/victoria` out of the portfolio navigation and footer.
- [x] Removed portfolio structured data and Google Analytics from Victoria routes.
- [x] Added a provider-specific CSP for Ably and Supabase.
- [x] Added same-origin checks to state-changing JSON/upload endpoints.
- [x] Protected server rendering, APIs, signed URLs, realtime auth, and owner activity.
- [x] Disabled Victoria data on Vercel previews unless explicitly enabled.
- [ ] Verify the production response headers with `curl` after deployment.
- [ ] Verify the deployed HTML contains no Google Analytics or personal metadata.
- [ ] Verify `/victoria` is absent from the deployed sitemap.
- [ ] Open a Vercel preview and confirm the private feature is disabled.

### Page Experience

- [x] Added personalised Freddie and Victoria greetings.
- [x] Added a one-time database-backed welcome overlay.
- [x] Added a live days/hours/minutes/seconds countdown.
- [x] Fixed countdown hydration so server and browser values match.
- [x] Added timezone-safe Europe/London date handling.
- [x] Added deterministic daily message rotation.
- [x] Added typed memories with optional private uploaded images.
- [x] Added milestones and future plans.
- [x] Added the subtle official relationship date and calculated day count.
- [x] Added one hidden five-tap easter egg.
- [x] Added responsive layouts and mobile-friendly controls.
- [ ] Replace all placeholder relationship copy before launch.
- [ ] Test the experience on both actual phones.
- [ ] Test keyboard navigation and screen reader labels.
- [ ] Test `prefers-reduced-motion`; add explicit reduced-motion behaviour where needed.
- [ ] Check contrast, focus indicators, text wrapping, and touch targets on mobile.
- [ ] Consider simplifying the visible analytics disclosure once final wording is chosen.

### Messages and Realtime

- [x] Added authenticated message reads and writes.
- [x] Derive author identity from the server session.
- [x] Validate, trim, escape, and cap messages at 2,000 characters.
- [x] Persist messages to Postgres before publishing to Ably.
- [x] Added duplicate protection through per-author client nonces.
- [x] Added optimistic message UI with failure reconciliation.
- [x] Added chronological author styling and British/London timestamps.
- [x] Added an accessible live announcement for incoming messages.
- [x] Added a cursor-based pagination API.
- [x] Added private, short-lived Ably subscribe credentials.
- [x] Kept Ably publish permission server-side.
- [ ] Test live delivery with Freddie and Victoria connected simultaneously.
- [ ] Test that a saved message remains after refresh if Ably is unavailable.
- [ ] Add a `Load older notes` control; the API supports cursors but the UI does not.
- [ ] Refetch missed messages when an Ably connection reconnects.
- [ ] Add clearer realtime connection status, such as `Live`, `Reconnecting`, or
  `Saved; live updates unavailable`.
- [ ] Test rate limits after configuring a persistent limiter.

### Private Photos

- [x] Added authenticated JPEG, PNG, and WebP uploads.
- [x] Validate actual image bytes instead of trusting the extension.
- [x] Enforce a configurable 10 MB default maximum.
- [x] Strip EXIF/GPS data by decoding and re-encoding.
- [x] Resize large images and store WebP derivatives.
- [x] Store objects in a private Supabase bucket.
- [x] Store only private storage keys and metadata in Postgres.
- [x] Generate five-minute signed read URLs only after authentication.
- [x] Added a Freddie terminal command to hide media.
- [x] Kept delete controls out of the user interface.
- [ ] Upload one real photo from a phone and confirm it appears after refresh.
- [ ] Confirm its signed URL stops working after expiry.
- [ ] Confirm an unauthenticated browser cannot obtain or use a new signed URL.
- [ ] Add client-side size/type feedback before upload.
- [ ] Replace the simple pending state with real upload progress if useful.
- [ ] Refresh the affected memory automatically after a successful upload.
- [ ] Decide whether HEIC support is worth adding for iPhone originals.
- [ ] Add cleanup for an uploaded object if the following database insert fails.

### Activity and Administration

- [x] Added owner-only `/victoria/admin/activity`.
- [x] Added visit counts, last-seen users, devices, message counts, welcome status,
  and event totals.
- [x] Avoided precise IP, location, keystroke, and browser fingerprint collection.
- [x] Avoided storing message bodies in analytics.
- [x] Added terminal commands for users, devices, claims, revocation, welcome reset,
  countdown updates, content hiding, analytics cleanup, and metadata export.
- [x] Added explicit confirmation to destructive administration commands.
- [x] Added configurable 180-day activity retention.
- [ ] Review the activity page from a Freddie session.
- [ ] Run and verify welcome reset, one-device revocation, and account revocation.
- [ ] Schedule or periodically run analytics cleanup.
- [ ] Record memory views and gallery opens when those interactions occur.
- [ ] Deduplicate `easter_egg_found` per user and egg as requested in the brief.
- [ ] Improve the activity page with a clear active/revoked device filter.

### Validation Completed

- [x] `npm run victoria:doctor`
- [x] `npx tsc --noEmit`
- [x] `npm run lint`
- [x] `npm test -- --runInBand` (8 suites, 31 tests)
- [x] `npm run build` passed during implementation.
- [x] Local claim POST returned a `303` redirect and a valid session cookie.
- [x] Three authenticated page loads completed in approximately 1.14 s, 0.28 s,
  and 0.41 s after the pooled-query fix.
- [x] Ran a fresh production build after the latest claim/cookie/database fixes.
- [ ] Add integration tests for claims, sessions, permissions, messages, uploads,
  welcome completion, and countdown administration.
- [ ] Add component tests for countdown, welcome, message wall, upload errors,
  empty states, and reduced motion.
- [ ] Add end-to-end tests for both account claims and the main private workflows.
- [ ] Keep automated tests independent from the live Supabase project.

## Launch Checklist

Complete these in order.

### 1. Personalise Content

- [ ] Edit `lib/victoria/content.ts`.
- [ ] Replace Freddie's and Victoria's welcome lines.
- [ ] Replace all six daily message placeholders and add enough messages to avoid
  frequent repetition.
- [ ] Replace the two placeholder memories with real titles, dates, and text.
- [ ] Replace placeholder future plans.
- [ ] Review the official milestone description.
- [ ] Replace both easter-egg titles and bodies.
- [ ] Keep very private media out of Git; upload it through the private page.
- [ ] Commit only copy that Freddie is comfortable storing in the repository.

### 2. Review Dates

- [ ] Confirm 11 July 2026 remains the correct official date.
- [ ] Confirm the current expected return date and time.
- [ ] If needed, update it safely:

```bash
npm run victoria:set-countdown -- --datetime "2026-09-18T16:00:00" --timezone "Europe/London"
```

### 3. Production Environment

- [ ] Add all required Victoria variables to the Vercel **Production** environment.
- [ ] Use the pooled Supabase `DATABASE_URL` and keep `prepare: false`.
- [ ] Set `VICTORIA_FEATURE_ENABLED=true`.
- [ ] Set `VICTORIA_ALLOWED_HOSTS=kohn.me.uk`.
- [ ] Set `NEXT_PUBLIC_SITE_URL=https://kohn.me.uk`.
- [ ] Use the same `VICTORIA_TOKEN_HASH_SECRET` for the CLI and deployed app that
  share this database. Changing it invalidates newly generated claim hashes.
- [ ] Never use `NEXT_PUBLIC_` for database, Supabase service-role, Ably, session,
  token-hash, or rate-limit secrets.
- [ ] Leave Victoria disabled in Preview unless a separate test database/bucket is used.
- [ ] Run `npm run victoria:doctor` locally before deploying.

Required production variables:

```text
DATABASE_URL
VICTORIA_SESSION_SECRET
VICTORIA_TOKEN_HASH_SECRET
VICTORIA_FEATURE_ENABLED
VICTORIA_ALLOWED_HOSTS
VICTORIA_SESSION_DAYS
VICTORIA_ANALYTICS_RETENTION_DAYS
VICTORIA_UPLOAD_MAX_BYTES
VICTORIA_ABLY_API_KEY
SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
VICTORIA_STORAGE_BUCKET
NEXT_PUBLIC_SITE_URL
```

Strongly recommended before launch:

```text
VICTORIA_RATE_LIMIT_URL
VICTORIA_RATE_LIMIT_TOKEN
```

### 4. Deploy

- [ ] Run a clean production build.
- [ ] Commit the Victoria implementation and documentation.
- [ ] Push the intended branch to GitHub.
- [ ] Deploy the saved commit to Vercel.
- [ ] Confirm Vercel reports a successful production deployment.
- [ ] Run the idempotent migration and seed against the intended production database:

```bash
npm run victoria:migrate
npm run victoria:seed
```

- [ ] Open `https://kohn.me.uk/victoria` without a cookie and confirm only the
  neutral access page appears.
- [ ] Verify production headers, analytics isolation, sitemap exclusion, and preview safety.

### 5. Claim Real Devices

Generate links only after the production app has the matching database and hash secret:

```bash
NEXT_PUBLIC_SITE_URL=https://kohn.me.uk npm run victoria:claim -- --user freddie
NEXT_PUBLIC_SITE_URL=https://kohn.me.uk npm run victoria:claim -- --user victoria
```

- [ ] Generate a fresh production Freddie link.
- [ ] Open it only on Freddie's intended phone/browser and claim once.
- [ ] Close and reopen the browser; verify automatic access.
- [ ] Generate a separate fresh production Victoria link.
- [ ] Send Victoria only her own one-time URL through a private channel.
- [ ] Have Victoria claim it once on her intended browser.
- [ ] Verify Victoria's welcome plays once and does not replay.
- [ ] Delete the messages containing raw claim links after they are used.

### 6. Production Smoke Test

- [ ] Freddie and Victoria can both open `/victoria`.
- [ ] Unclaimed and revoked browsers see only the neutral access page.
- [ ] Countdown values match on both phones.
- [ ] Daily message matches on both phones.
- [ ] Freddie sends a note and Victoria receives it without refreshing.
- [ ] Victoria sends a note and Freddie receives it without refreshing.
- [ ] Refreshing preserves both notes.
- [ ] Each user uploads a small photo.
- [ ] Uploaded photos appear only to authenticated users.
- [ ] Victoria cannot open the Freddie activity dashboard.
- [ ] Freddie can open the activity dashboard.
- [ ] A disposable test device can be revoked successfully.
- [ ] Public portfolio home, projects, skills, admin, NextAuth, and Sanity still work.

## Routine Commands

Check setup:

```bash
npm run victoria:doctor
```

Run locally:

```bash
npm run dev
```

Use `http://localhost:3000` consistently. Do not mix `localhost` and
`127.0.0.1`, because cookies are host-specific.

Inspect users and devices:

```bash
npm run victoria:users
npm run victoria:devices
```

Create replacement links:

```bash
npm run victoria:claim -- --user freddie
npm run victoria:claim -- --user victoria
```

Revoke access:

```bash
npm run victoria:revoke -- --device <device-uuid>
npm run victoria:revoke -- --user freddie
npm run victoria:revoke -- --user victoria
```

Reset the first-time welcome:

```bash
npm run victoria:reset-welcome -- --user victoria
```

Moderate and maintain:

```bash
npm run victoria:hide-message -- --id <message-uuid>
npm run victoria:hide-media -- --id <media-uuid>
npm run victoria:clear-analytics -- --days 180
npm run victoria:export-metadata
```

Validation:

```bash
npx tsc --noEmit
npm run lint
npm test -- --runInBand
npm run build
```

## Recovery Notes

### A claim button appears stuck

Check the terminal running `npm run dev`. A successful claim should produce a
`303` POST followed by a `200` GET for `/victoria`. The current database client
uses one shared connection specifically to prevent the Supabase pooling hang
found during initial setup.

### A claim link says invalid

Claim links are intentionally single-use. Generate a new account-specific link.
Do not repeatedly click the same claim button.

### A browser has the wrong or stale session

Open `/victoria/logout`, close that tab, generate a new link, and claim it once.
Do not leave a logout tab open while testing.

### Clearing cookies or changing browsers

The device identity is the secure cookie. Clearing browser data, reinstalling the
browser, changing browser, or using private browsing requires a new claim link.
Changing Wi-Fi or mobile network does not.

### A phone is lost

Run `npm run victoria:devices`, identify the device, and revoke it immediately.
Generate a replacement link only for the replacement phone.

### Ably is unavailable

Sending should still persist the message in Postgres. Live delivery may stop, but
refreshing the page should recover saved notes.

### Supabase Storage is unavailable

The rest of the page should remain usable. Existing media may be omitted if a
signed URL cannot be generated, and uploads should show an error.

## Suggested Enhancements

These are ideas, not fabricated relationship content. Add only what feels useful.

### High Value

- [ ] **Content preview mode:** add a local-only way to preview the welcome,
  empty states, and easter eggs without resetting production state.
- [ ] **Realtime status:** show a small unobtrusive live/reconnecting indicator
  near the message wall.
- [ ] **Older notes button:** connect the existing cursor API to a `Load older`
  control.
- [ ] **Automatic upload refresh:** return the inserted media record and signed
  URL from the upload endpoint, then append it without a full refresh.
- [ ] **Photo lightbox:** open images full-screen with caption, keyboard escape,
  swipe/next controls, and an authenticated short-lived URL refresh.
- [ ] **Persistent rate limiting:** connect Upstash Redis or another
  Vercel-compatible limiter and populate the two rate-limit variables.
- [ ] **End-to-end tests:** use Playwright with a disposable local/test database
  to cover claim, return login, messaging, upload, and revocation.

### Personal and Playful

- [ ] Add a larger collection of daily messages so they repeat less often.
- [ ] Add categories to memories, such as trips, tiny moments, or favourites.
- [ ] Add a "random memory" button that reveals one existing source-controlled memory.
- [ ] Add a private shared playlist link or embedded track only after reviewing
  its privacy and CSP implications.
- [ ] Add a low-key "open when..." notes section, with copy stored in source code.
- [ ] Add more easter-egg triggers, such as holding the countdown or tapping the
  official date, with an accessible button alternative.
- [ ] Add an optional Master's encouragement section if it still fits the page.
- [ ] Add a completed-state treatment for future plans.
- [ ] Add a gentle countdown-complete experience that Freddie can configure.

### Administration

- [ ] Add `victoria:claims` to list only non-sensitive token status
  (user, created, expiry, used/revoked), never raw tokens.
- [ ] Add `victoria:revoke-claim` to invalidate an unused claim link.
- [ ] Add `victoria:delete-hidden-media` with explicit confirmation to remove
  both a hidden object and its database record.
- [ ] Add an owner-only device revocation button to the activity page, protected
  by same-origin checks and a confirmation dialog.
- [ ] Add a simple CSV/JSON activity export with no private message bodies.
- [ ] Add an automated analytics-retention job.

### Reliability and Security

- [ ] Add a timeout around Ably, rate-limit, and Supabase Storage provider calls.
- [ ] Add redacted structured server logging with useful request/error IDs.
- [ ] Add database integration tests for atomic claim consumption and rollback.
- [ ] Add cleanup when storage upload succeeds but metadata insertion fails.
- [ ] Add explicit tests proving Victoria cannot access owner routes.
- [ ] Add a Content Security Policy production test for Ably and signed Supabase images.
- [ ] Consider rotating long-lived sessions periodically, not only extending expiry.
- [ ] Decide whether to invalidate all previous unused claim tokens whenever a
  replacement is generated.

## Known Limitations

- Persistent rate limiting is not active until its provider variables are configured.
- Only unit coverage exists specifically for Victoria utility/content modules;
  the original brief's integration, component, accessibility, and end-to-end
  coverage is not complete.
- Message pagination exists only in the API.
- Active Ably reconnection does not explicitly fetch messages missed during the gap.
- Uploads require a refresh before the new photo appears.
- HEIC is not accepted.
- The claim token may remain in browser back-button history after success.
- Easter-egg events are not deduplicated per user/egg.
- Memory/gallery analytics are only partially wired.
- The welcome UI hides immediately even if saving completion fails.
- Claim-submit rate limiting is not yet configured or implemented.
- Production Vercel configuration and the real two-phone workflow remain unverified.

## Progress Log

### 29 July 2026

- Read the original 37-section implementation brief and the earlier product-decision chat.
- Set up Supabase Postgres, private storage, Ably, and local environment variables.
- Applied migrations and seeded Freddie and Victoria.
- Implemented private device claims, sessions, content, messaging, uploads,
  activity tracking, owner dashboard, privacy isolation, CLI tooling, and docs.
- Fixed Next.js build-cache problems during development.
- Fixed countdown hydration mismatch.
- Fixed local cookie naming/path issues.
- Replaced unreliable claim server-action navigation with a normal POST redirect.
- Made claim consumption and session creation atomic.
- Fixed invalid-cookie mutation during server rendering.
- Fixed Supabase pooled-query hangs by sharing one connection and serialising page reads.
- Verified Freddie's local claim and authenticated page flow.
- Verified the claimed browser obtained an Ably realtime token and completed its welcome.
- Passed the latest production build after the final CSP and database-pool fixes.
- Created this living tracker.

## Definition of Ready for Victoria

The page is ready to send to Victoria when all of these are checked:

- [ ] Personal placeholder content has been replaced and reviewed.
- [ ] Latest production build and deployment succeed.
- [ ] Production environment and privacy headers are verified.
- [ ] Freddie's production phone is claimed and returns automatically.
- [ ] A real private image upload and expiry test pass.
- [ ] Two-device realtime messaging passes.
- [ ] Victoria's fresh production claim link has been generated.
- [ ] Device revocation has been tested once.
- [ ] Freddie is comfortable with the activity disclosure and retained data.
- [ ] Victoria's welcome copy and mobile experience have been reviewed.
