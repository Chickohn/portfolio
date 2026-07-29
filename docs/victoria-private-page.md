# Victoria Private Page

`/victoria` is a private App Router area for exactly two users: Freddie and Victoria. It stays on the existing Vercel-hosted Next.js application and uses managed services for durable state.

## Services

- PostgreSQL via `DATABASE_URL` for users, claim tokens, device-bound sessions, messages, private media metadata, countdown settings, and first-party activity.
- Supabase Storage private bucket for photos. The app stores only private object keys and serves short-lived signed URLs after session checks.
- Ably for realtime note delivery. Messages are inserted into PostgreSQL first, then published. If Ably is unavailable, the database remains source of truth.

The browser loads Ably's official v2 CDN script and authenticates through `/api/victoria/realtime/auth`; no Ably server secret is sent to the browser.

## Privacy Model

The URL is not access control. Access is represented by a secure HttpOnly cookie created after a one-time claim link is used. Claim and session tokens are generated with 256 bits of randomness and only keyed hashes are stored in Postgres.

Network changes do not affect access. Browser fingerprinting and IP identity are not used. Clearing browser data, changing browser, or losing a device requires a replacement claim link. Lost devices should be revoked.

`/victoria` is omitted from the sitemap, disallowed in `robots.txt`, marked `noindex`, served with `private, no-store`, and isolated from the portfolio navigation, footer, structured data, and Google Analytics.

## Preview Safety

By default, Vercel preview deployments are disabled for `/victoria` unless `VICTORIA_FEATURE_ENABLED=true` is set. Production should set `VICTORIA_ALLOWED_HOSTS=kohn.me.uk`. Local development is allowed for `localhost` and `127.0.0.1`.

## Environment Variables

Required for production:

- `DATABASE_URL`
- `VICTORIA_SESSION_SECRET`
- `VICTORIA_TOKEN_HASH_SECRET`
- `VICTORIA_ABLY_API_KEY`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VICTORIA_STORAGE_BUCKET`

Optional:

- `VICTORIA_ALLOWED_HOSTS`
- `VICTORIA_SESSION_DAYS`
- `VICTORIA_ANALYTICS_RETENTION_DAYS`
- `VICTORIA_UPLOAD_MAX_BYTES`
- `VICTORIA_RATE_LIMIT_URL`
- `VICTORIA_RATE_LIMIT_TOKEN`

Never place database credentials, claim tokens, session secrets, Ably server keys, or Supabase service role keys in `NEXT_PUBLIC_*`.

Run this any time to check local setup without printing secret values:

```bash
npm run victoria:doctor
```

This repository already includes the Victoria env names in `.env.example`. Local `.env.local` should contain generated `VICTORIA_SESSION_SECRET` and `VICTORIA_TOKEN_HASH_SECRET`; the remaining production values must come from the provider dashboards.

## Database Setup

Run against an empty managed Postgres database:

```bash
npm run victoria:migrate
npm run victoria:seed
```

The migration creates `victoria_users`, `victoria_claim_tokens`, `victoria_devices`, `victoria_sessions`, `victoria_messages`, `victoria_media`, `victoria_countdown_settings`, and `victoria_activity_events`.

## Claim Flow

Generate separate one-time links:

```bash
npm run victoria:claim -- --user freddie
npm run victoria:claim -- --user victoria
```

Send each person only their own URL. A successful claim creates a device record, creates a long but finite session, stores only token hashes, and redirects to `/victoria`.

## Admin Commands

```bash
npm run victoria:users
npm run victoria:devices
npm run victoria:revoke -- --device <device-uuid>
npm run victoria:revoke -- --user victoria
npm run victoria:reset-welcome -- --user victoria
npm run victoria:set-countdown -- --datetime "2026-09-18T16:00:00" --timezone "Europe/London"
npm run victoria:hide-message -- --id <message-uuid>
npm run victoria:hide-media -- --id <media-uuid>
npm run victoria:clear-analytics -- --days 180
npm run victoria:export-metadata
```

Destructive commands require typing `yes`; set `VICTORIA_CONFIRM=yes` only for intentional automation.

## Content Editing

Static copy lives in [content.ts](/home/freddie/Documents/Projects/portfolio/lib/victoria/content.ts). Freddie can edit daily messages, welcome text, memories, milestones, future plans, and easter eggs without touching the database.

Initial dates:

- Official relationship date: 11 July 2026
- Return countdown: 18 September 2026 at 16:00 Europe/London

## Uploads

The upload route accepts JPEG, PNG, and WebP up to `VICTORIA_UPLOAD_MAX_BYTES` (default 10 MB). It validates actual file bytes, strips metadata through re-encoding, resizes oversized images, stores WebP derivatives in the private bucket, and records metadata in Postgres.

HEIC is intentionally not enabled in version one because reliable serverless conversion support is not guaranteed.

## Activity Dashboard

Freddie-only route: `/victoria/admin/activity`.

It shows last active time, visits by day, recent devices, message counts, welcome completion, and event counts. It does not store precise IP addresses, precise locations, message bodies, or invasive fingerprint data.

## Vercel Deployment Checklist

1. Create managed Postgres with pooled `DATABASE_URL`.
2. Create a private Supabase Storage bucket.
3. Create an Ably app and copy server and client keys.
4. Add all Victoria env vars to Vercel production.
5. Keep preview env vars separate or leave `/victoria` disabled on previews.
6. Deploy the application.
7. Run `npm run victoria:migrate` against production.
8. Run `npm run victoria:seed`.
9. Generate and claim Freddie’s link.
10. Generate Victoria’s link and send it only to Victoria.
11. Verify `/victoria` has no Google Analytics script, noindex headers, and no sitemap entry.
12. Upload a test image and verify its signed URL expires.
13. Send a note from each account and verify realtime delivery plus database persistence.
14. Revoke a test device and verify access is removed.

Vercel production variables to add:

```bash
DATABASE_URL=<pooled postgres url>
VICTORIA_SESSION_SECRET=<same value generated in .env.local or a new 48-byte secret>
VICTORIA_TOKEN_HASH_SECRET=<same value generated in .env.local or a new 48-byte secret>
VICTORIA_FEATURE_ENABLED=true
VICTORIA_ALLOWED_HOSTS=kohn.me.uk
VICTORIA_SESSION_DAYS=90
VICTORIA_ANALYTICS_RETENTION_DAYS=180
VICTORIA_UPLOAD_MAX_BYTES=10485760
VICTORIA_ABLY_API_KEY=<ably app api key>
SUPABASE_URL=<supabase project url>
SUPABASE_SERVICE_ROLE_KEY=<supabase service role key>
VICTORIA_STORAGE_BUCKET=victoria-private
```

After those values are present locally and in Vercel, run:

```bash
npm run victoria:doctor
npm run victoria:migrate
npm run victoria:seed
npm run victoria:claim -- --user freddie
npm run victoria:claim -- --user victoria
```

## Threat Model

Protected assets are private messages, photos, devices, sessions, and activity records. Main risks are leaked claim links, stolen cookies, misconfigured preview deployments, public storage buckets, provider key exposure, and accidental analytics/indexing leaks.

Mitigations include single-use expiring claim tokens, hashed tokens, Secure HttpOnly cookies, private bucket signed URLs, route-level authorisation, preview disabling, no public analytics, no sitemap entry, and admin revocation commands.

Known limitations: rate limiting is only strong when `VICTORIA_RATE_LIMIT_URL` is configured; without it, the app fails open for the two-user private use case and reports degraded limiting in code. Realtime delivery depends on Ably, but persisted messages remain available after refresh.
