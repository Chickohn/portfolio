# Victoria private area — performance report

**Date:** 2026-07-30
**Scope:** `/victoria` route tree (`app/victoria/*`, `app/api/victoria/*`, `lib/victoria/*`,
`components/victoria/*`) plus the shared root shell that every page pays for.
**Method:** profiling of the running dev server, direct latency probes against the Supabase pooler in
`eu-central-1` and Supabase Storage, and inspection of the built client chunks in `.next/static/chunks`.

---

## 1. Summary

The hanging is not slow SQL. Every individual query against the database completes in **16–17 ms**.

Two independent causes produce the symptoms:

1. **A query that cannot get a connection stalls forever, with no error and nothing logged.** `postgres.js`
   has no timeout covering that state: `connect_timeout` only guards opening the socket, and
   `statement_timeout` only applies once the statement reaches the server. Observed repeatedly — promises held
   pending past 60 s with per-promise instrumentation. The owning HTTP request never responds, so the browser
   spins indefinitely. The trigger is connection pressure at Supabase's pooler, and the app makes that
   pressure far more likely than it needs to be by issuing 6 serial round trips per page render.

2. **`/victoria` has no loading UI and no Suspense boundary**, while doing ~370 ms of strictly serial server
   I/O on a cold connection. `force-dynamic` + `noStore()` means every navigation repeats all of it, and the
   user sees a blank frozen page for the duration.

A third cause turned out to dominate the *loading* half of the complaint, and it was not in the Victoria code
at all: a custom webpack `splitChunks` override in `next.config.mjs` forced **449 kB of JavaScript onto every
route on the site**. Removing it took `/victoria` from 486 kB to 104 kB of First Load JS, and the shared
baseline from 451 kB to 87.5 kB. See §6.2.

The remainder of this report is real but secondary: per-render allocation and render-thrash in the message
wall.

---

## 2. Measured evidence

| Probe | Result |
|---|---|
| Single warm query (eu-central-1 transaction pooler, port 6543) | **17 ms** |
| First query on a cold pool | **213 ms** — paid again after every `idle_timeout: 20` gap |
| **Queries stalling indefinitely under connection pressure** | **reproduced repeatedly; promises still pending past 60 s** |
| Same stall with `prepare: true`, `fetch_types: false`, `max` 1/5/10/20 | still stalls — not a protocol or pool-size setting |
| During a stall, brand-new single queries | still succeed (32 ms) — only the waiting promises are lost |
| Once pressure cleared, 10 concurrent at `max: 5` ×6 bursts | 0 stalls, median 66 ms |
| Upstream backends held after probe processes **exited** | **9 idle, still held ~7 minutes later**, server `max_connections` 60 |
| `/victoria`'s 4 SELECTs, run serially as today | **108 ms** |
| The same data as one combined query | **37 ms** (2.9× faster) |
| 6 signed URLs through one Supabase client | 120 ms total (48 ms each warm, 368 ms cold) |
| `new Intl.DateTimeFormat(...)` per call vs. cached, ×1000 | **94.6 ms vs 2.5 ms** (38×) |
| Dev-server TTFB, first hit → warm | `/` 1018 → 38 ms; `/projects` 1653 → 54 ms; `/victoria/access` 540 → 27 ms |
| **First Load JS shared by every route** | **451 kB → 87.5 kB** (a single 449 kB `vendor` chunk, removed) |
| **`/victoria` First Load JS** | **486 kB → 104 kB** |
| zod and framer-motion in the `/victoria` chunk | present → **absent** |

Row counts at time of measurement: 0 messages, 0 media, 21 activity events, 14 devices, 14 sessions. None of
the slowness is data volume — it is all fixed per-request overhead.

---

## 3. Root cause 1 — a stalled query never fails

### What happens

`lib/victoria/db.ts` creates one long-lived `postgres()` client on `globalThis` with `max: 5`. Each in-flight
HTTP request holds a connection while it runs its queries **serially**, so concurrency is measured in
requests, not queries.

A single `/victoria` render is **6 round trips**:

| # | Query | Source |
|---|---|---|
| 1 | session + device + user `SELECT` | `lib/victoria/auth.ts:94` |
| 2 | session/device touch `UPDATE` | `lib/victoria/auth.ts:128` |
| 3 | countdown settings `SELECT` | `lib/victoria/queries.ts:19` |
| 4 | messages `SELECT` | `lib/victoria/queries.ts:53` |
| 5 | media `SELECT` | `lib/victoria/queries.ts:107` |
| 6 | activity `INSERT` | `lib/victoria/activity.ts:20` |

Concurrently with that render the browser fires `/api/victoria/realtime/auth` (2 more queries via
`requireVictoriaSession`), possibly `/api/victoria/welcome` (3 queries), and the activity beacon from
`easter-eggs.tsx` (2 queries). Two tabs, or one tab plus a Fast Refresh recompile, comfortably crosses 5
simultaneous in-flight queries.

### The failure

When a query cannot get a connection — either locally because the pool is full, or upstream because
Supabase's pooler has no backend to give it — it simply waits. Held for 60 s with per-promise
instrumentation, such promises remain `pending`. There is no error, no timeout, and no log line:

- `connect_timeout` does not apply; the socket is already open.
- `statement_timeout` does not apply; the statement never reaches the server.

So the request hangs for as long as the browser is willing to wait. **This is the single most important thing
to fix**, independently of how often it triggers: an unbounded wait with no diagnostic is far worse than a
slow query.

### What triggers it

Connection pressure at the pooler — and connections accumulate much more readily than the code assumes,
because **upstream backends outlive the process that opened them**:

```
upstream backends held : 10 of 60 (17%), 9 idle
oldest backend         : 00:06:47   <- opened by processes that had already exited
```

Every dev-server restart, every `tsx scripts/victoria/*` invocation, and on Vercel every serverless instance
opens its own pool of up to `max` connections against a server whose `max_connections` is **60**. They do not
all go away when the process does. Once upstream is saturated, new work stalls — silently, per the above.

Individual queries are not the problem (17 ms warm). The problem is how *long each request holds a
connection*: a single `/victoria` render occupies one for 6 sequential round trips, and the concurrent API
calls each occupy another for 2–3.

### Why raising `max` is the wrong instinct

`lib/victoria/db.ts` had been changed from `max: 1` to `max: 5` with this comment:

```
// Do NOT use max:1 — postgres.js deadlocks when anything issues concurrent
// queries (Promise.all, overlapping page+API requests) against a one-connection pool.
```

`max: 1` was indeed worse, but the conclusion drawn from it does not hold: the stall reproduces at `max` of 1,
5, 10 and 20, and once pressure clears, `max: 5` handles 10 concurrent queries in 66 ms with zero stalls. `max`
is not the variable. Because the pool is **per process** and its backends linger, raising `max` multiplies
total upstream connections across instances and makes exhaustion *more* likely.

That same comment was also used to justify serialising `getActivitySummary`
(`lib/victoria/queries.ts:115`), turning 5 parallel queries into 5 sequential waits — trading ~85 ms of
latency for protection it never provided.

### Fix

Three layers, in order of importance:

1. **Make the failure visible.** Route every query through `withDbTimeout(query, label, 5000)` so a stalled
   query rejects with a real error. A 500 you can debug beats an infinite spinner. This is the only change
   that bounds the worst case.
2. **Hold connections for less time.** Cut the per-request round trips (§4): 6 → 2 for a page render, 5 → 1
   for the owner dashboard. This is what actually reduces pressure, and it keeps `max` at 5.
3. **Close cleanly, and stop leaking.** Scripts must `await sql.end()` rather than relying on process exit.
   `npm run victoria:pool-probe` reports current upstream usage and fails when it crosses 50%.

4. **Driver.** The data layer now runs on `pg` instead of `postgres@3.4.9`. Its pool has a real
   `connectionTimeoutMillis`, it is well proven against pgBouncer-style transaction pooling, and it encodes
   array parameters natively rather than depending on fetched type OIDs (see the trap below).
   `withDbTimeout` is retained: `connectionTimeoutMillis` only bounds waiting for a *pool* connection, which
   is a subset of the stall it guards against.

   Measured after the swap: cold connect **213 ms → 148–180 ms**, 10 concurrent queries at `max: 5`
   **median 66 ms → 33 ms**.

   All queries go through two helpers in `lib/victoria/db.ts` so the timeout cannot be forgotten at a call
   site: `dbQuery(label, text, params)` and `dbTransaction(label, fn)`.

### A trap worth recording: `fetch_types: false` on postgres.js

While tuning the old driver, `fetch_types: false` looked like free performance — it removes a
type-introspection query from connection setup, measured at **213 ms → 176 ms** per cold connection. It also
silently breaks array parameters:

```
fetch_types=false -> FAIL 22P02 malformed array literal: "a,b"
fetch_types=true  -> OK   {"arr":["a","b"]}
```

postgres.js needs the server's array type OIDs to encode `text[]`; without them `${["a","b"]}::text[]` goes
over the wire as the string `'a,b'`, and the Victoria page fails to render its media. `pg` does not have this
failure mode, but `npm run victoria:pool-probe` asserts array encoding regardless, so it cannot regress
silently.

### One migration hazard: `pg` returns Dates, not strings

`pg` parses `timestamptz` into a JS `Date`. The previous mappers did `new Date(String(row.created_at))`, and
`String(aDate)` formats as `"Wed Jul 30 2026 22:00:00 GMT+0100"` — **dropping the milliseconds**. The message
wall's keyset cursor is `(created_at, id)`, so losing sub-second precision would let pagination skip or repeat
a message. `toIsoString()` in `lib/victoria/db.ts` converts `Date` instances directly and only falls back to
parsing for text and jsonb values. Verified end to end: `"createdAt":"2026-07-30T22:28:22.016Z"`.

---

## 4. Root cause 2 — serial I/O with nothing on screen

`app/victoria/layout.tsx` sets `dynamic = "force-dynamic"` and `app/victoria/page.tsx` calls `noStore()`, so
every navigation re-runs all six round trips plus one Supabase Storage request per image. There is no
`app/victoria/loading.tsx` and no `<Suspense>` boundary anywhere in the tree, so Next has nothing to stream
and the browser holds the previous page — or a blank one — for the whole duration.

Cold, that is ~213 ms for the first connection + 5 × 17 ms + signed URLs ≈ **370 ms+ of blank screen**, and
that is the *healthy* case. When the pool drops a query it is unbounded.

### Findings

| # | Location | Cost | Fix |
|---|---|---|---|
| 4.1 | no `app/victoria/loading.tsx` | full server latency shown as a frozen page | add a skeleton so Next has something to stream immediately |
| 4.2 | `app/victoria/page.tsx:17` | activity `INSERT` is `await`ed before render | fold the `INSERT` into the batched read as a CTE — zero extra round trips |
| 4.3 | `lib/victoria/auth.ts:94,128` | 2 round trips on **every** page render and **every** API route | one `WITH touched AS (UPDATE … RETURNING …) SELECT …` |
| 4.4 | `lib/victoria/queries.ts:19,53,107` | 3 serial SELECTs, 108 ms measured | one `jsonb` query, 37 ms measured |
| 4.5 | `lib/victoria/queries.ts:115` | 5 serial waits on the owner dashboard | restore `Promise.all` — 5 concurrent is within `max: 5`, and each connection is held for a fifth as long |
| 4.6 | `lib/victoria/storage.ts:39` | `getSupabaseAdmin()` is called *inside* `createPrivateSignedUrl`, so `page.tsx:19-34` constructs a **new Supabase client per image** | hoist to a module singleton; use one batched `createSignedUrls(keys, ttl)` instead of N calls |
| 4.7 | `lib/victoria/constants.ts:12` | signed URL TTL is 300 s while images use `loading="lazy"` — anything scrolled to after 5 minutes 404s | raise the TTL, or proxy media through an authenticated route handler with `Cache-Control: private, max-age=…` |
| 4.8 | `components/victoria/upload-form.tsx:32` | tells the user to refresh, paying a full re-render of every query | `router.refresh()` |

Target after §4: **2 round trips** per `/victoria` render (session, then everything else), 1 batched storage
call, warm TTFB under 60 ms.

### 4.9 A side effect of `loading.tsx`: the unauthenticated redirect stopped being a 307

Adding a Suspense boundary means Next begins streaming — and commits **HTTP 200** — before the page component
runs. `redirect()` inside `requireVictoriaSession()` is then delivered in the RSC payload and applied by the
client. Verified that no private content is exposed either way: an unauthenticated response contains the
skeleton and `NEXT_REDIRECT;replace;/victoria/access;307`, and zero matches for any private string.

Still worth fixing, because a real redirect does not depend on client JavaScript and costs no database work.
`middleware.ts` now checks for the presence of the session cookie on `/victoria` and `/victoria/admin/*` and
returns a genuine 307 before rendering. It is a presence check only — any request that does carry a cookie
still goes through full server-side validation. `/victoria/access`, `/victoria/claim/*`, `/victoria/dev-login`
and `/victoria/logout` are deliberately outside the matcher.

Two notes for anyone editing it: middleware redirects **must** be absolute (a relative `Location` is rejected
by the pipeline and surfaces as a 500), and behind `next start -H 127.0.0.1` the cloned origin reports as
`localhost` — harmless locally, and it follows the real `Host` header in deployment.

---

## 5. Client bundle and render cost

### 5.1 zod is shipped to the browser for nothing

`lib/victoria/content.ts` imports zod and runs four `.parse()` calls at module scope (lines 120–123) against
**hardcoded literals**. `content.ts` is imported by `components/victoria/experience.tsx`, which is
`"use client"` — so zod is bundled into the Victoria client chunk and re-validates constant data in the
browser on every page load. Confirmed:

```
$ grep -lc 'ZodError' .next/static/chunks/app/victoria/page.js
.next/static/chunks/app/victoria/page.js
```

Delete the import and the four calls; move the shape assertions into the existing
`__tests__/lib/victoria/content.test.ts`, where they cost nothing at runtime.

### 5.2 framer-motion for two fades

The route pulls in framer-motion (389 references in the chunk) for a single 0.35 s opacity/`y` fade in
`experience.tsx:68-73` and the modal in `welcome.tsx`. Both are expressible as CSS transitions.

### 5.3 The message wall re-renders everything on every keystroke

`components/victoria/message-wall.tsx` holds the textarea's `body` state in the same component that renders
the message list. Every keystroke re-renders all 30 messages, and each message calls
`new Date(...).toLocaleString("en-GB", { … })` — which constructs a fresh `Intl` formatter internally.

Measured: 66 ms per 1000 `toLocaleString` calls with options. 30 messages = ~2 ms per keystroke on this
desktop, and roughly 10× that on a mid-range phone — visible input lag.

Three fixes: extract the composer into its own component, use one module-level cached formatter, and drop the
pointless `canSend` `useMemo` (line 85) which wraps two string operations.

### 5.4 Intl formatters constructed per call

`lib/victoria/dates.ts` builds a new `Intl.DateTimeFormat` inside `formatBritishDate` and `londonDateKey`.
`experience.tsx` calls them ~10× per render (memories, milestones, plans, footer). Cached formatters are
**38× faster** (2.5 ms vs 94.6 ms per 1000 calls). Hoist both to module scope.

### 5.5 Other render-path items

| Location | Issue | Fix |
|---|---|---|
| `components/victoria/experience.tsx:91` | `media.filter()` inside `memories.map()` — O(memories × media) | build one `Map` keyed by `memoryId` |
| `components/victoria/experience.tsx` | ~8 stacked `backdrop-blur` layers plus a fixed two-stop `radial-gradient` overlay | the dominant scroll-jank source on mobile; keep blur where it reads as intentional, use flat translucent fills elsewhere |
| `components/victoria/message-wall.tsx:68-76` | the Ably CDN bundle (~85 KB gzip) downloads and opens a WebSocket on every visit | defer until the wall scrolls into view |
| `lib/victoria/realtime.ts:38` | 10-minute token TTL means each open tab re-hits `/api/victoria/realtime/auth` every 10 min | 2 DB queries today, 1 after §4.3 |
| `components/victoria/countdown.tsx:18` | 1 s interval keeps ticking in background tabs | gate on `document.visibilityState` |

---

## 6. Shared shell — costs every page, including `/victoria`

### 6.1 The app root is a client component

`components/site-shell.tsx` is `"use client"` solely to read `usePathname()` and branch on `/victoria`
(line 11). That places a client boundary at the root of the entire app. `/victoria` renders none of the
shell's markup but still pays for its client JavaScript and hydration.

Fix: replace the runtime branch with a route group. Keep `app/layout.tsx` as `html`/`body`/fonts only; create
`app/(site)/layout.tsx` holding `Nav`, the footer, the skip link and the GA/JSON-LD scripts; move `page.tsx`,
`projects/`, `skills/`, `apps/` and `admin/` under it. Route groups do not change URLs. `app/victoria/` and
`app/api/` stay at the root and stop paying for the shell. `components/site-shell.tsx` and
`components/nav-wrapper.tsx` (a 5-line client component that only re-exports `Nav`) then both disappear.

### 6.2 The custom webpack `splitChunks` was the single largest problem on the site

`next.config.mjs` set `default: false, vendors: false` and funnelled all of `node_modules` into one `vendor`
chunk. That replaced Next's per-route chunking with **one 449 kB bundle that every single page downloaded in
full** — the Victoria page pulled in Sanity, NextAuth, pdf-lib and everything else, and the garage estimates
tool pulled in Ably.

Two production builds, one at the previous commit and one after removing the override (and moving the shell
into a route group, §6.1):

| Route | First Load JS before | after | change |
|---|---|---|---|
| **shared by all routes** | **451 kB** (449 kB single `vendor` chunk) | **87.5 kB** | **−81%** |
| `/victoria` | 486 kB | **104 kB** | **−79%** |
| `/` | 484 kB | 155 kB | −68% |
| `/skills` | 482 kB | 134 kB | −72% |
| `/projects` | 481 kB | 144 kB | −70% |
| `/apps/garage-estimates` | 472 kB | 297 kB | −37% |

Next's own chunking is per-route and already tuned. `experimental.optimizePackageImports:
['lucide-react', 'framer-motion']` is the supported way to trim barrel imports.

`optimization.sideEffects = false` was also actively unsafe: it overrides each package's own `sideEffects`
declaration globally, and can silently drop CSS and polyfill imports that are side-effectful by design.

### 6.3 Local development compile time

First hit per route costs 0.5–1.8 s of compilation, repeated after every edit. Add a
`dev:turbo` script (`next dev --turbo -H 127.0.0.1 -p 3000`) — a large share of the perceived local slowness
is Webpack, not the app.

### 6.4 Dead code

Verified to have no importers anywhere in `app/`, `components/`, `lib/` or `hooks/`:

- `components/client-home.tsx` (460 lines)
- `components/error-message.tsx`
- `components/retry-button.tsx`
- `hooks/use-scroll-animation.ts`
- `hooks/use-viewport.ts`
- `lib/animations.ts` — its variants are duplicated in `lib/utils.ts`, which is the copy `app/page.tsx`
  actually imports

---

## 7. Follow-ups outside this pass

Public-page work, deliberately deferred:

- `lib/sanity/queries.ts` — the listing query fetches the full `sections` array for every project, which only
  the detail page needs. The read client sets `useCdn: true` *and* passes a token; authenticated requests
  bypass the CDN, so the flag is misleading.
- `app/projects/[slug]/page.tsx` — no `generateStaticParams`, so every project detail page is rendered
  dynamically. `generateMetadata` and the page body both call `getPublicInternalProjectBySlug`.
- `public/` holds 68 MB of `.zip` files (`swish-master.zip` 38 MB, `route-optimiser.zip` 30 MB) plus a 7.8 MB
  `.mp4`. These belong in object storage or a GitHub release, not the deployment bundle.

---

## 8. Priority order

| Priority | Work | Why |
|---|---|---|
| **P0** | §3 `withDbTimeout` on every query, `max` left at 5 | bounds the only unbounded failure in the system |
| **P0** | §4.1 `loading.tsx` + Suspense | makes remaining latency visible instead of frozen |
| **P1** | §4.2–4.5 batch the queries: 6 round trips → 2 | 108 ms → 37 ms measured on the reads alone |
| **P1** | §4.6–4.7 storage client singleton, batched signing, longer TTL | N HTTP requests → 1; fixes lazy-loaded images expiring |
| **P2** | §5.1 drop zod from the client bundle | pure waste, trivial to remove |
| **P2** | §5.3–5.4 message-wall composer split, cached formatters | fixes typing lag |
| **P2** | §5.2, §5.5 framer-motion removal, media `Map`, blur reduction, deferred Ably | bundle and scroll smoothness |
| **P0** | §6.2 remove the `splitChunks` override | 449 kB of JavaScript on every route; the largest single win available |
| **P1** | §4.9 middleware cookie gate | restores a real 307 for unauthenticated requests, at zero DB cost |
| **P3** | §6.1, §6.3–6.4 route-group shell, `dev:turbo`, dead code | site-wide, and cuts local iteration time |
| **P3** | §3 driver migration to `pg` | native pool timeout, native array encoding, faster on every measure |

---

## 9. Verification

1. **Pool probe** — `npm run victoria:pool-probe`. Reports cold/warm latency, drives 10 concurrent queries
   past `max: 5` across 6 bursts asserting all settle, and reports upstream backends held as a percentage of
   `max_connections`, failing above 50%. Run it after any change to pool configuration.
2. **Round-trip counts** — confirm a `/victoria` render drops from 6 round trips to 2, and the owner activity
   dashboard from 5 waits to 1.
3. **TTFB** — `curl -w '%{time_starttransfer}'` twice per route against a warm dev server, before and after.
   Target: `/victoria` warm TTFB under 60 ms.
4. **Concurrency soak** — 20 parallel requests spread across `/victoria`, `/api/victoria/messages` and
   `/api/victoria/realtime/auth`. Every one must respond; none may hang.
5. **Bundle** — `npm run build`, then assert `grep -c ZodError .next/static/chunks/app/victoria/*.js` is 0 and
   framer-motion is absent from the Victoria chunk. `npm run analyze` for the before/after treemap.
6. **Tests** — `npm test` stays green, including `jest-axe` in `__tests__/a11y.test.tsx`.
7. **Manual** — sign in as both users; check the welcome overlay, sending a note (optimistic plus realtime
   echo in a second tab), an image upload, the countdown, and the owner-only activity dashboard. Confirm
   typing in the note box is smooth with 30+ messages loaded.

---

## 10. Results

Measured against a production build (`next start`) with a real signed-in session, unless noted.

| Metric | Before | After |
|---|---|---|
| First Load JS shared by every route | 451 kB | **87.5 kB** |
| `/victoria` First Load JS | 486 kB | **104 kB** |
| `/` First Load JS | 484 kB | **155 kB** |
| `/projects` First Load JS | 481 kB | **144 kB** |
| `/skills` First Load JS | 482 kB | **134 kB** |
| `/apps/garage-estimates` First Load JS | 472 kB | **297 kB** |
| zod in the `/victoria` client chunk | present | **absent** |
| framer-motion in the `/victoria` client chunk | present | **absent** |
| DB round trips per `/victoria` render | 6 | **2** |
| DB round trips per owner dashboard render | 5 serial | **5 concurrent (1 wait)** |
| Supabase Storage requests for N images | N (+ N clients constructed) | **1 (1 client)** |
| `/victoria` warm TTFB, authenticated | — | **17–25 ms** (62 ms cold) |
| Owner dashboard warm TTFB | — | **30 ms** |
| Driver cold connect | 213 ms (postgres.js) | **148–180 ms** (pg) |
| 10 concurrent queries at `max: 5` | median 66 ms | **median 33 ms** |
| 60 parallel requests across `/victoria` + 2 API routes, ×3 rounds | — | **180/180 returned 200**, no stalls, ≤660 ms per round |
| Unauthenticated `/victoria` | 307 | **307** (via middleware; no DB work, no content exposed) |
| Unbounded query wait possible | yes | **no** — 5 s cap, typed error, unit-tested |
| Test suite | 36 tests | **42 tests**, all passing |

Both `npx tsc --noEmit` and `npx next lint` are clean.

### Caveats

- The 60-parallel soak passing is evidence, not proof, against an intermittent stall. What makes the failure
  mode *safe* is `withDbTimeout`: the worst case is now a 5 s error with the query name in it, not an
  indefinite spinner.
- `/apps/garage-estimates` is still 297 kB. Its own page code is 198 kB — mostly `pdf-lib` — and it was not in
  scope here. Loading `pdf-lib` on demand at export time would be the next win.
- The route-group move (§6.1) changes no URLs, but it does mean `app/(site)/` is now the home for public pages;
  new public routes belong there, not at `app/` root.
- After changing route structure, build from a clean `.next`. A stale build tree produced
  `PageNotFoundError: Cannot find module for page: /_document` during "Collecting page data" and served 500s on
  routes that had nothing wrong with them. `npm run dev:clean` and `rm -rf .next && npm run build` both cover
  this.
- Verification created a `[dev]` device row per dev-login. They are labelled and harmless; `npm run
  victoria:devices` lists them and `npm run victoria:revoke --device <uuid>` clears any you don't want.
