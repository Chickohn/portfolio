# Victoria Page — Technical Discovery Report

**Scope:** Read-only inspection of `/home/freddie/Documents/Projects/portfolio`. BiofuelAI was also available at `/home/freddie/Documents/biofuelai` and is summarised where relevant. **No repository files were modified as part of the discovery inspection itself.**

Legend used below:

- **Fact** — confirmed in this repo (or BiofuelAI path cited)
- **Inference** — reasonable technical conclusion
- **Open** — needs a human decision

---

## 1. Executive summary

This portfolio is a **Next.js 14 App Router** TypeScript site (`next@14.2.30` locked), styled with **Tailwind**, with interactive UI via **client components** and **Framer Motion**. It already has lightweight “backend” behaviour: **NextAuth credentials admin**, **Sanity** as a projects CMS, **API routes**, and **server actions**. There is **no relational database**, **no Docker**, **no `vercel.json`**, and **no CI workflows** in-repo. Deployment is documented as **Vercel-first**, with a normal Node `next build` / `next start` path also claimed.

A `/victoria` LDR page can start as a **static, unlinked route**, but that is **not private**. Any shared messages/photos need **real auth**, **non-public storage**, and careful exclusion from **sitemap, robots, analytics, caching, and preview deployments**. The lowest-risk interactive path is almost certainly: **stay on Vercel**, extend existing NextAuth patterns for 1–2 users, add a **managed Postgres** only if UGC is required, and use **private object storage** for images — **not** a BiofuelAI-style Docker/Django/Celery stack.

---

## 2. Current portfolio architecture

### Framework and versions (**Fact**)

| Item | Value | Evidence |
|------|--------|----------|
| Framework | Next.js App Router | `app/` tree; no `pages/` router |
| Next.js | `^14.2.29` declared; **14.2.30** locked | `package.json`, `package-lock.json` → `node_modules/next` |
| React | `^18.2.0` | `package.json` |
| TypeScript | `^5.3.3`, `strict: true` | `package.json`, `tsconfig.json` |
| Node constraint | README: Node 18+; no `engines` field; `@types/node` ^20 | `README.md`, `package.json` |
| Package manager | **npm** (`package-lock.json`) | lockfile present; no yarn/pnpm |

### Directory structure (**Fact**)

- `app/` — routes, layouts, API routes
- `components/` — UI + feature components (`ui/`, `admin/`, `garage-estimates/`, …)
- `lib/` — data, auth, Sanity, garage logic, SEO
- `hooks/`, `types/`, `sanity/`, `scripts/`, `public/`, `__tests__/`, `docs/`, `backups/`

### Routing (**Fact**)

App Router file-based routes observed:

| Route | Role |
|-------|------|
| `/` | Home (`app/page.tsx`, client) |
| `/projects`, `/projects/[slug]` | Projects listing + detail |
| `/skills` | Skills |
| `/apps/garage-estimates` | Client-side PDF tool |
| `/admin/login`, `/admin/(protected)/projects…` | Admin CMS UI |
| `/api/auth/[...nextauth]` | NextAuth |
| `/api/admin/upload/image` | Authenticated Sanity image upload |
| `/api/revalidate` | On-demand ISR-style path revalidation |

Nav links only Home / Projects / Skills (`components/nav.tsx`). Garage and admin are not primary nav items. Footer copyright links to `/admin/login` (`app/layout.tsx`).

### Layouts / components conventions (**Fact**)

- Root layout: `app/layout.tsx` — fonts, global nav via `NavWrapper`, GA scripts, footer, default SEO `robots: { index: true }`.
- Protected admin layout: `app/admin/(protected)/layout.tsx` — server session gate + redirect.
- UI primitives: Radix + CVA (`components/ui/*`).
- Feature pages often thin server wrappers + `"use client"` children (e.g. `app/projects/page.tsx` → `ProjectsPageClient`).

### Server vs client vs actions vs API (**Fact**)

- **Client components:** many (`"use client"` on home, nav, skills, garage, admin forms, etc.).
- **Server components:** project detail page and projects listing fetch data on the server (`app/projects/[slug]/page.tsx`, `app/projects/page.tsx`).
- **Server actions:** `app/admin/(protected)/projects/actions.ts` (`"use server"`) for CRUD + `revalidatePath`.
- **API routes:** NextAuth, admin upload, revalidate.

### Rendering model (**Fact** + **Inference**)

- No `generateStaticParams`, no `export const dynamic` / `revalidate` found.
- Project pages async-fetch Sanity then fall back to hardcoded data (`lib/public-projects.ts`).
- **Inference:** public pages are **dynamically rendered / request-time capable**, with **on-demand revalidation** available via `POST /api/revalidate`. Not a pure static export (`output: 'export'` absent from `next.config.mjs`).

### Backend functionality today (**Fact**)

Yes, limited:

1. Auth (NextAuth JWT credentials)
2. Admin project CRUD against Sanity
3. Image upload to Sanity assets
4. Cache revalidation webhook

### Database (**Fact**)

- **No Postgres/SQLite/Prisma/Drizzle** in this repo.
- **Sanity** is the external content store for projects (`lib/sanity/*`, `sanity/schemas/project.ts`).
- Garage drafts: **browser `localStorage` only** (`lib/garage-estimates/storage.ts`).

### Auth / authorisation (**Fact**)

- NextAuth Credentials, single allowlisted `ADMIN_EMAIL` + plaintext compare to `ADMIN_PASSWORD` (`lib/auth.ts`).
- Server guard: `requireAdmin()` (`lib/admin-auth.ts`).
- Session strategy: JWT (`session: { strategy: "jwt" }`).
- **Inference:** designed for **one owner admin**, not multi-user LDR accounts.

### Uploads / media (**Fact**)

- `POST /api/admin/upload/image` requires admin; uploads buffer to Sanity (`assets.upload`); returns `{ assetId, url }` — typically a **CDN URL**.
- Public static media under `public/` (photos, video, zips) — world-readable if deployed.
- Next Image config allows SVG + long cache TTL (`next.config.mjs`).

### Third-party services (**Fact**)

- Google Analytics / GTM (hardcoded `G-VJ8DW3XTD7` in `app/layout.tsx`; also `NEXT_PUBLIC_GA_ID` documented)
- Sanity CMS
- Google Search Console verification file in `public/`
- Domain references: `https://kohn.me.uk` in metadata, sitemap, SEO

### Styling / motion / responsive (**Fact**)

- Tailwind 3 + CSS variables (`tailwind.config.ts`, `app/globals.css`)
- Dark black/slate portfolio look; `darkMode: ["class"]` configured but site is effectively dark by default
- Framer Motion in nav and home
- `prefers-reduced-motion` utilities in `globals.css`
- Accessibility emphasis in README and jest-axe tests

### Conventions a new page should follow (**Inference** from facts)

1. Put route under `app/<segment>/page.tsx`.
2. Prefer server component shell + client island for interactivity.
3. Use `@/` imports; Zod for input validation (already used in auth + project forms).
4. Protect sensitive routes with server-side session checks (admin pattern).
5. Keep private routes out of `app/sitemap.ts` and nav.
6. Override root `metadata.robots` for noindex if privacy matters.
7. Do not put secrets in `NEXT_PUBLIC_*` or client bundles.
8. Expect production CSP/COOP/COEP from `next.config.mjs` (may affect third-party media).

---

## 3. Current deployment process

### Scripts (**Fact** — `package.json`)

- Dev: `next dev -H 127.0.0.1 -p 3000`
- Build: `next build`
- Start: `next start`
- Lint/test/analyze/Sanity scripts as listed

### Vercel / CI config in repo (**Fact**)

- **No** `vercel.json`
- **No** Dockerfile
- **No** `.github/workflows`
- README recommends Vercel; also mentions Netlify / any Node host
- Git remote: `https://github.com/Chickohn/portfolio.git`

### Next config deployment-relevant bits (**Fact** — `next.config.mjs`)

- Security headers in production only
- Image optimisation (AVIF/WebP)
- Webpack client fallbacks disable `fs`/`net`/`tls`
- **No** `output: 'standalone'`
- **No** Edge runtime declarations found

### Env vars (**Fact** — `.env.example`, `docs/environment-variables.md`)

Sanity, admin auth, NextAuth, revalidate secret, site URL, GA.

### Deployment lifecycle (**Inference** grounded in repo + README)

1. Push to GitHub `Chickohn/portfolio`
2. **Likely** Vercel build runs `npm install` / `npm ci` + `next build` (not confirmed by in-repo workflow file)
3. Env vars set in Vercel dashboard
4. Traffic served as Next.js on Vercel (serverless/Node functions for API routes + SSR as needed)
5. Optional: Sanity webhook → `POST /api/revalidate`

**Unresolved:** exact Vercel project settings, regions, and whether preview deployments are enabled are **not in the repository** — confirm in Vercel dashboard.

### Persistent local filesystem (**Fact** + **Inference**)

- Upload path streams to Sanity, not disk.
- **Inference:** on Vercel, local disk is **ephemeral**; inappropriate for durable Victoria photos/messages.

### Platform limits relevant to Victoria (**Inference**)

- Serverless body size / duration limits for uploads
- Need external DB + object storage for durable UGC
- Sanity asset URLs are typically public CDN — poor fit for private LDR photos without private datasets + authn delivery
- Current CSP `connect-src` is narrow (self + Google Analytics) — new APIs/CDNs may need header updates (`next.config.mjs`)
- `Cross-Origin-Embedder-Policy: require-corp` can break cross-origin images/scripts without CORP — important if hosting images on another origin

---

## 4. Relevant code and configuration files

| Path | Why it matters |
|------|----------------|
| `package.json` / `package-lock.json` | Stack versions, scripts, npm |
| `next.config.mjs` | Headers, images, no standalone, CSP/COEP |
| `tsconfig.json` | Strict TS, `@/*` |
| `app/layout.tsx` | Global nav, GA, default indexable SEO, footer admin link |
| `app/sitemap.ts` | What gets indexed; must exclude `/victoria` |
| `public/robots.txt` | Currently allows `/`; disallows only `/api/`, `/_next/` |
| `lib/auth.ts`, `lib/admin-auth.ts` | Existing auth pattern to extend or isolate |
| `app/api/auth/[...nextauth]/route.ts` | Auth endpoints |
| `app/admin/(protected)/layout.tsx` | Server-side route protection pattern |
| `app/admin/(protected)/projects/actions.ts` | Server actions + revalidation pattern |
| `app/api/admin/upload/image/route.ts` | Upload pattern (Sanity/public URL) |
| `lib/public-projects.ts` | Sanity-first + fallback data pattern |
| `lib/garage-estimates/storage.ts` | Client-only persistence pattern (not multi-device) |
| `.env.example`, `docs/environment-variables.md` | Env contract |
| `README.md` | Documented deploy assumptions |
| `public/_headers` | Alternate/static header hints (Netlify-style); Next headers are authoritative in Next deploys |

---

## 5. Missing BiofuelAI information

**Fact:** BiofuelAI **is available** locally at `/home/freddie/Documents/biofuelai`. High-level reuse checklist can already be answered from inspection; some production/ops details still need confirmation from you.

### Already established from BiofuelAI (**Fact**)

| Topic | Finding |
|-------|---------|
| Frontend | React 19 + Vite SPA (`bfai_frontend/`) |
| Backend | Django + Django Ninja (`bfai_django/`) |
| FE↔BE | Same-origin via Nginx proxy `/api/*`; Axios + JWT Bearer (`bfai_frontend/src/api/axiosClient.js`) |
| DB | PostgreSQL 15 + Django ORM |
| Auth | JWT (`django-ninja-jwt`), custom User UUID model, roles, tenant Client/Site |
| Uploads | Local volumes + S3 presigned PUTs (`apps/uploads/presign.py`) |
| Docker | Full compose: db, redis, backend, realtime, celery, frontend (`docker/docker-compose.yml`) |
| Prod docs | AWS ECS/RDS/S3 and Azure options (`docs/deployment.md`) |
| Migrations | Django migrations under apps |
| CORS | Explicit CORS for SPA origins (`settings.py`) |

### Still provide / confirm for a careful reuse decision (**Open**)

1. Exact production host currently used (AWS vs Azure vs other) and whether LDR-scale ops are already paid for.
2. Whether any BiofuelAI secrets/patterns should be reused vs reinvented for personal risk separation.
3. Backup/restore runbooks actually practiced (not only documented).
4. Whether GitLab CI (`.gitlab-ci.yml`) is the live pipeline and what gates exist.
5. Logging/monitoring stack in production (Sentry? CloudWatch?).
6. Whether you want **any** shared infra with BiofuelAI (strongly discouraged for personal content).

### BiofuelAI files useful to hand another developer

- `README.md`, `docs/architecture.md`, `docs/database.md`, `docs/deployment.md`
- `bfai_django/apps/api/models.py`, `api.py`, `schemas.py`, `authentication.py`
- `bfai_frontend/src/api/axiosClient.js`, `authApi.js`, `AuthProvider.jsx`
- `docker/docker-compose.yml`, `Dockerfile.*`, `nginx.conf`, `entrypoint.backend.sh`
- `bfai_django/apps/uploads/presign.py` (presigned private upload pattern)
- `docker/.env.example` (secrets shape)

### Explicitly **do not** copy into portfolio

Celery/Redis simulation workers, multi-tenant Client/Site RBAC matrices, Channels WebSockets stack, scientific pipeline, Nginx SPA split as the default for this site, AWS ECS-scale deploy for one private page.

---

## 6. Functional questions requiring answers

### Access and privacy

**Important:** An unlinked `/victoria` route is **not** private. URLs leak via history, screenshots, referrers, shared devices, logs, and guessing.

1. Public if URL known, or auth required?
2. Shared password vs individual accounts (Freddie / Victoria)?
3. Victoria-only, or both users?
4. Must search engines be blocked (`noindex`, robots Disallow, sitemap exclusion)?
5. Is obscurity ever acceptable as the only control? (**Recommend no** if messages/photos exist.)
6. Exclude from nav/sitemap/footer forever?
7. Log access attempts? Retention?
8. Sessions across devices? Logout required?
9. Magic links / expiring invites?
10. Should Vercel preview URLs be blocked from serving this route?

### Content ownership and editing

11. Who creates / edits / deletes?
12. Both can post messages?
13. Instant visibility vs moderation/approval?
14. Timestamps required?
15. Version history? Soft delete / recovery?
16. Admin UI needed, or Freddie edits via code/DB?
17. Should existing `/admin` own this, or a separate Victoria auth realm?

### Messages and interaction

18. Private notes vs shared wall vs chat?
19. Realtime required, or refresh/polling OK?
20. Read receipts / reactions / replies?
21. Plain text vs Markdown vs rich text?
22. Notifications (email / push)?
23. Scheduled / date-gated content?

### Pictures and files

24. Who uploads?
25. Formats + max size?
26. Auto-compress? Strip EXIF/GPS?
27. Private storage only (no public CDN URLs)?
28. Expiry? Downloadable? Deletable by uploader?
29. Virus scanning / moderation needed?
30. Video now or later?
31. Gallery vs occasional attachments?

### Countdown and dates

32. Exact event and timezone?
33. Fixed return date or editable without redeploy?
34. Live client countdown? Behaviour at zero?
35. Multiple milestones?

### Personalisation

36. Hardcoded vs DB-managed content?
37. Daily rotating content / easter eggs / shared lists?
38. Victoria contribution model?
39. Match portfolio visual identity or separate aesthetic?
40. Mobile-first priority? A11y bar? Dark mode coupling?
41. Minimal forever vs expandable platform?

### Data retention and safety

42. Retention period for messages/images?
43. Export? Full delete?
44. Backups? Who can restore?
45. What is “sensitive” (names, locations, faces, messages)?
46. Extra encryption beyond TLS + provider encryption?
47. Disable GA / third-party scripts on this route?
48. Error monitoring redaction rules?

---

## 7. Architecture options comparison

### Option A — Fully static page

Hardcoded content + browser countdown; no DB/uploads.

| | |
|--|--|
| **Advantages** | Fits current stack; tiny diff; no new services; easy deploy |
| **Limitations** | No shared messages/photos; content changes need redeploy (or commit); not private |
| **Deploy impact** | Add `app/victoria/page.tsx`; update robots/sitemap/metadata |
| **Security** | URL obscurity only |
| **Future expansion** | Would require jumping to B/E later |

### Option B — Vercel-native full stack

Next.js route handlers/server actions + managed Postgres (Neon/Supabase/Vercel Postgres) + ORM (Prisma/Drizzle) + private object storage (S3/R2/Supabase Storage) + auth (extend NextAuth or Auth.js).

| | |
|--|--|
| **Compatibility** | High — already NextAuth, API routes, server actions, Zod |
| **Packages** | ORM client, storage SDK, possibly sharp for images |
| **Services** | DB + storage (+ optional email) |
| **Code changes** | New `/victoria` UI, auth users/roles, CRUD APIs/actions, storage signed URLs, security headers updates |
| **Persistence** | Managed providers (good) |
| **Security** | Achievable if auth + private objects + noindex |
| **Cost** | Usually low at 2 users |
| **Ops complexity** | Moderate |
| **Lock-in** | Vercel hosting optional; DB/storage portable if standard Postgres/S3 APIs used |

### Option C — Separate backend service

Portfolio on Vercel; BiofuelAI-like API elsewhere.

| | |
|--|--|
| **When justified** | Hard isolation, non-JS backend preference, or reuse existing Django host |
| **CORS/auth** | Cross-origin cookies/JWT; CSRF/CORS complexity the monorepo currently avoids |
| **Ops** | Second deploy, monitoring, TLS, backups |
| **Hosting** | Fly.io, Railway, Render, VPS, existing BiofuelAI cloud |
| **BiofuelAI resemblance** | Similar split, but overkill unless you already want Django |

### Option D — Dockerised full stack away from / beside Vercel

**Repo facts:** no Dockerfile; no `output: 'standalone'`; Node app can run via `next start` after build.

Would need:

- Multi-stage Dockerfile (deps → build → runner); preferably enable `output: 'standalone'`
- Compose if adding Postgres locally/prod
- Reverse proxy (Caddy/Nginx/Traefik) + TLS for `kohn.me.uk`
- Volume or S3 for uploads
- Replace Vercel previews with DIY CI
- Move env/secrets to host secret store

**Docker improves:** reproducible local stacks with DB. **Does not by itself** make `/victoria` private. For this site, Docker is **not** required for a single private page.

### Option E — Hybrid (likely best)

Keep portfolio on Vercel; add **minimum** managed DB/auth/storage only if UGC needed; Docker **optional for local Postgres only**.

**Inference:** lowest risk vs current architecture and domain setup.

---

## 8. Docker and Vercel impact assessment

| Question | Answer |
|----------|--------|
| Does adding Docker require changing live hosting? | **No**, if Docker is local-only. **Yes**, if production moves to containers. |
| Docker for local only without changing Vercel prod? | **Yes.** |
| Dockerise then still deploy to Vercel? | Vercel builds from source, not your container. Containerising for Vercel adds little practical benefit. |
| Move off Vercel → DNS changes? | **Yes** (point `kohn.me.uk` to new host). |
| Affect domain? | Domain can stay; DNS targets change. |
| Move env vars? | **Yes**, to new host/secret store. |
| Lose preview deploys? | **Likely**, unless replaced. |
| Serverless behaviour change? | On VPS/Docker you get long-lived Node; different scaling/limits. |
| Image optimisation change? | May need to keep Next Image server or replace with another optimiser. |
| Deploy scripts change? | **Yes** for container/CI path. |
| Does a DB remove need for Docker? | **Yes** for prod if DB is managed SaaS. |
| Does a DB force Dockerising the app? | **No.** |
| Docker justified for one private page? | **Generally no.** |
| When Docker becomes worthwhile? | Self-hosting, multiple services (app+db+redis+worker), or team-wide local parity like BiofuelAI. |

---

## 9. Privacy and security assessment

### Risks specific to this codebase

| Risk | Notes |
|------|------|
| Route obscurity | `/victoria` guessable; not auth |
| Broken access control | Must gate **every** API/action/server render, not only UI |
| Static assets | Anything in `public/` is public |
| Public image URLs | Current Sanity upload returns CDN `url` — unsafe for private photos |
| API enumeration | `/api/*` exists; robots already Disallow `/api/` but clients can still call |
| Weak shared password | Current admin is single shared env password pattern — reuse carefully; rate-limit |
| Session security | JWT sessions via NextAuth; needs secure cookies, strong `NEXTAUTH_SECRET` |
| CSRF | NextAuth/server actions help same-origin; separate backend worsens this |
| XSS / Markdown | UGC must be escaped or strictly sanitised |
| Upload spoofing | Validate MIME + magic bytes + size; strip EXIF |
| Secrets in client | Never put Victoria credentials in `NEXT_PUBLIC_*` |
| Analytics leakage | Root layout **always** loads GA (`G-VJ8DW3XTD7`) — private page visits would be tracked unless excluded |
| Indexing | Root metadata defaults to index; sitemap/robots currently open |
| Caching | Avoid CDN caching authenticated HTML/JSON; static asset header rules are very long-lived for public files |
| Preview deployments | Previews may expose unfinished private routes if auth/env misconfigured |
| COEP/CORP | Strict headers may interact badly with third-party media |
| Admin discoverability | Footer links to `/admin/login` — Victoria should not piggyback casually without threat modelling |

### Minimum acceptable security model (**Recommendation**)

If the page has **any** personal messages or photos:

1. Real authentication (per-person accounts preferred over one shared password).
2. Server-side authorisation on all reads/writes.
3. `robots: noindex, nofollow`; Disallow in `robots.txt`; omit from `sitemap.ts`; omit from nav.
4. Disable analytics on that route (or entire segment layout without GA).
5. Private object storage with **short-lived signed URLs** (or authenticated proxy); never commit media to `public/`.
6. Soft rate limits on login/upload.
7. Encrypted transport only; secrets only in server env.
8. Preview protection or feature flag so previews don’t expose production data.
9. Explicit retention/deletion policy.

If content is **non-sensitive static romance page** with no UGC: obscurity + noindex may be “good enough,” with clear acceptance of residual risk.

---

## 10. Likely data model

**Do not overdesign.** Suggest only if interactive.

| Entity | Priority |
|--------|----------|
| `User` (Freddie / Victoria) | **Essential** if auth |
| `Session` (NextAuth JWT; maybe no table) | Essential with Auth.js/NextAuth |
| `Message` / `Note` (author, body, created_at, deleted_at) | Essential for shared writing |
| `MediaAsset` (owner, storage key, mime, size, created_at) | Essential for photos |
| `Milestone` / `CountdownEvent` (label, occurs_at, tz) | Optional (env/config may suffice for one date) |
| `SharedPlan` / checklist | Optional / later |
| `Reaction` | Premature unless requested |
| Audit log | Optional; useful if access logging required |

Garage `localStorage` is a useful **anti-pattern reminder**: fine for single-browser drafts, wrong for cross-user LDR content.

---

## 11. Recommended architecture

| Decision | Recommendation |
|----------|----------------|
| Simplest suitable | **Phase 0 static** `/victoria` with noindex if no UGC yet |
| Slightly more extensible | **Option E**: Vercel + NextAuth (2 users) + managed Postgres + private object storage |
| Docker | **Not for production** of this page; optional local Compose for Postgres only |
| Stay on Vercel? | **Yes**, unless self-hosting goals appear |
| Managed DB necessary? | **Only if** persistent shared messages/notes |
| Object storage necessary? | **Only if** shared images that must stay private |
| Auth immediately? | **Yes** before any personal UGC; optional delay for static-only MVP |
| Reuse from BiofuelAI | AuthZ-on-every-query mindset; In/Out validation; presigned upload size/type pinning; UUID+timestamps; thin API modules |
| Do **not** reuse | Django/Celery/Redis/multi-tenant RBAC/Nginx SPA split/AWS ECS blueprint |
| Scale of change | Static: small. Interactive: medium (new route group, auth extension, DB schema, storage, header/analytics exceptions). |
| Main risks | False sense of privacy; public media URLs; GA/sitemap leakage; admin auth model too coarse |

---

## 12. Proposed implementation phases

1. **Decide product scope** — answer Section 6 (especially auth + UGC + photos).
2. **Privacy shell** — `/victoria` route group with noindex, robots/sitemap/nav exclusion, analytics off; countdown + static content if desired.
3. **Auth** — extend or isolate NextAuth for Freddie/Victoria; logout; session persistence policy.
4. **Messages** — Postgres + Zod-validated server actions/API; timestamps; soft delete if needed.
5. **Media** — private bucket + signed read/upload; EXIF strip; size/type caps.
6. **Hardening** — rate limits, preview protection, backup/export/delete, monitoring redaction.
7. **Only if needed** — realtime, reactions, video, Docker self-host migration.

Do **not** start with Docker/Django “because BiofuelAI has it.”

---

## 13. Unresolved questions

1. All functional questions in Section 6.
2. Confirmed production host settings (Vercel project, preview policy, env already set for Sanity/admin).
3. Whether Sanity is actually configured in production today or still on hardcoded project fallback.
4. Threat model: embarrassment vs targeted adversary.
5. Whether Victoria should ever share the existing `/admin` credentials model (probably **no**).
6. Legal/safety preferences for backups of intimate content.

---

## 14. Information to provide to the next developer

Hand them:

1. This report.
2. Answers to Section 6 (even partial: MVP vs later).
3. Confirmed hosting: Vercel dashboard notes (domain, envs, previews).
4. Whether production Sanity/admin is live.
5. Countdown event datetime + timezone.
6. Auth preference: shared password vs two accounts vs magic link.
7. UGC scope for v1: static only / messages only / messages+photos.
8. Visual direction: match portfolio vs separate.
9. BiofuelAI paths above **only** as pattern references — not as the deploy target.
10. Explicit non-goals (no realtime, no video, no Docker prod, etc.).

### Suggested prompt ingredients for the implementer (not an implementation plan)

- Stack facts: Next 14.2.30 App Router, npm, Tailwind, existing NextAuth admin, Sanity for **public projects only**.
- Must not put private media in `public/` or Sanity public CDN without access control.
- Must override root layout behaviour (GA + indexable metadata + global nav) for the Victoria segment.
- Prefer extending Next patterns over introducing Django/Docker.
- Security minimum from Section 9.

---

**Bottom line:** The portfolio is already a capable small Next.js full-stack app on a Vercel-oriented path. Build `/victoria` inside that model. Treat BiofuelAI as a **pattern library**, not a deployment template. Authenticate before personal data; do not rely on an unlinked URL.
