/**
 * Diagnostic for the Victoria database connection path.
 *
 * Background: a query that cannot get a connection — locally because the pool is
 * full, or upstream because Supabase's pooler has no backend to give it — can
 * wait indefinitely. `withDbTimeout` in lib/victoria/db.ts is what bounds that;
 * this script measures the conditions that lead to it.
 *
 * Upstream backends also outlive the process that opened them: measured 9 idle
 * backends still held ~7 minutes after the probe processes had exited, against a
 * server `max_connections` of 60. Repeated dev-server restarts and serverless
 * instances accumulate, and once upstream is saturated new work stalls.
 *
 * This script reports:
 *   1. latency (cold connect, warm query)
 *   2. array parameter encoding, which driver options can silently break
 *   3. concurrency behaviour at the pool settings lib/victoria/db.ts uses
 *   4. how many upstream backends the project is currently holding
 *
 *   npm run victoria:pool-probe
 *
 * Exits non-zero if any query fails to settle, if array encoding is broken, or if
 * upstream connection usage is high enough to put requests at risk of stalling.
 */
import { existsSync } from "node:fs";
import path from "node:path";
import dotenv from "dotenv";
import pg from "pg";

const root = process.cwd();
for (const filename of [".env.local", ".env"]) {
  const fullPath = path.join(root, filename);
  if (existsSync(fullPath)) {
    dotenv.config({ path: fullPath, quiet: true });
  }
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL is required. Add it to .env.local.");
  process.exit(1);
}

// Mirror lib/victoria/db.ts. Keep these in sync deliberately: the point of the
// probe is to exercise the configuration the app actually runs.
const POOL_OPTIONS = {
  connectionString: databaseUrl,
  max: 5,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
  statement_timeout: 5_000,
};

const BURSTS = 6;
const SETTLE_TIMEOUT_MS = 15_000;

function withTimeout(promise, ms) {
  let timer;
  return Promise.race([
    promise,
    new Promise((_resolve, reject) => {
      timer = setTimeout(() => reject(new Error("STALLED")), ms);
    }),
  ]).finally(() => clearTimeout(timer));
}

// One long-lived pool, exactly as the app holds on globalThis.
const pool = new pg.Pool(POOL_OPTIONS);
pool.on("error", (error) => console.error("pool error:", error.message));
let failures = 0;

console.log("Victoria pool probe");
console.log("===================");
console.log(`driver=pg  max=${POOL_OPTIONS.max}`);
console.log("");

// --- 1. Latency ------------------------------------------------------------
let started = Date.now();
try {
  await withTimeout(pool.query("SELECT 1"), SETTLE_TIMEOUT_MS);
} catch (error) {
  console.error(`Could not reach the database at all: ${error.message}`);
  console.error("Check DATABASE_URL and network access.");
  process.exit(1);
}
console.log(`cold connect + first query : ${Date.now() - started}ms`);

started = Date.now();
for (let i = 0; i < 5; i += 1) await pool.query("SELECT 1");
console.log(`warm query (avg of 5)      : ${Math.round((Date.now() - started) / 5)}ms`);

// --- 2. Array parameter encoding -------------------------------------------
// getVictoriaPageData and getMediaForMemories both pass text[] parameters. The
// previous driver needed the server's array type OIDs to encode these and sent
// 'a,b' instead of an array when type fetching was disabled; keep asserting it.
try {
  const { rows } = await pool.query("SELECT $1::text[] AS arr", [["a", "b"]]);
  const arr = rows[0]?.arr;
  if (Array.isArray(arr) && arr.length === 2) {
    console.log("array parameter encoding   : ok");
  } else {
    failures += 1;
    console.log(`array parameter encoding   : FAIL — expected 2 elements, got ${JSON.stringify(arr)}`);
  }
} catch (error) {
  failures += 1;
  console.log(`array parameter encoding   : FAIL — ${error.code ?? ""} ${error.message}`);
}

// --- 3. Concurrency --------------------------------------------------------
// Push past `max` so surplus queries have to queue. All of them must settle.
const concurrency = POOL_OPTIONS.max * 2;
const durations = [];

for (let burst = 0; burst < BURSTS; burst += 1) {
  started = Date.now();
  try {
    await withTimeout(
      Promise.all(Array.from({ length: concurrency }, (_unused, i) => pool.query("SELECT $1::int AS i", [i]))),
      SETTLE_TIMEOUT_MS,
    );
    durations.push(Date.now() - started);
  } catch {
    failures += 1;
    console.log(`burst ${burst}: STALLED — ${concurrency} queries did not settle in ${SETTLE_TIMEOUT_MS}ms`);
  }
}

if (durations.length > 0) {
  const sorted = durations.slice().sort((a, b) => a - b);
  console.log(
    `${concurrency} concurrent x${BURSTS}       : median ${sorted[Math.floor(sorted.length / 2)]}ms, ` +
      `slowest ${sorted[sorted.length - 1]}ms, ${failures} stalled`,
  );
}

// --- 4. Upstream connection pressure --------------------------------------
const { rows: usageRows } = await pool.query(`
  SELECT
    count(*)::int AS held,
    count(*) FILTER (WHERE state = 'idle')::int AS idle,
    (SELECT setting::int FROM pg_settings WHERE name = 'max_connections') AS server_max
  FROM pg_stat_activity
  WHERE usename = current_user
`);
const usage = usageRows[0];

const pressure = Math.round((usage.held / usage.server_max) * 100);
console.log("");
console.log(`upstream backends held     : ${usage.held} of ${usage.server_max} (${pressure}%), ${usage.idle} idle`);

if (pressure >= 50) {
  failures += 1;
  console.log("");
  console.log("WARN  Upstream connection usage is high. Idle backends outlive the processes that");
  console.log("      opened them, so repeated dev-server restarts accumulate. This is the state in");
  console.log("      which queries begin stalling. Wait for them to age out, or reduce `max`.");
}

console.log("");
// Close cleanly — process exit alone leaves upstream backends behind.
await pool.end();

if (failures > 0) {
  console.log("FAIL  See above. Queries that cannot get a connection stall without erroring;");
  console.log("      withDbTimeout() in lib/victoria/db.ts is what converts that into a real error.");
  process.exit(1);
}

console.log("PASS  All queries settled and upstream connection usage is healthy.");
