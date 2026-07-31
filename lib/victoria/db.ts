import { Pool, type PoolClient, type QueryResultRow } from "pg";

const globalForVictoriaDb = globalThis as typeof globalThis & {
  victoriaPool?: Pool;
};

/**
 * Hard ceiling on how long any single query may take before we give up.
 *
 * `pg` bounds waiting for a *pool* connection via connectionTimeoutMillis, and
 * the server bounds a running statement via statement_timeout. Neither covers
 * every way a query can stall — notably waiting upstream inside Supabase's
 * pooler once its own backends are saturated. This guard is what turns any
 * remaining unbounded wait into a visible, attributable error rather than a
 * request that never responds.
 *
 * Reproduce the underlying latency and concurrency behaviour with
 * `npm run victoria:pool-probe`.
 */
export const VICTORIA_QUERY_TIMEOUT_MS = 5_000;

export class VictoriaDbTimeoutError extends Error {
  constructor(label: string, timeoutMs: number) {
    super(`Victoria database query "${label}" exceeded ${timeoutMs}ms`);
    this.name = "VictoriaDbTimeoutError";
  }
}

export function withDbTimeout<T>(
  query: PromiseLike<T>,
  label: string,
  timeoutMs = VICTORIA_QUERY_TIMEOUT_MS,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;

  return Promise.race([
    Promise.resolve(query),
    new Promise<never>((_resolve, reject) => {
      timer = setTimeout(() => reject(new VictoriaDbTimeoutError(label, timeoutMs)), timeoutMs);
    }),
  ]).finally(() => clearTimeout(timer)) as Promise<T>;
}

export function getPool() {
  if (globalForVictoriaDb.victoriaPool) {
    return globalForVictoriaDb.victoriaPool;
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Victoria private area");
  }

  // Supabase transaction pooler (port 6543).
  //
  // Deliberately do NOT raise `max` to buy throughput. This is a per-process
  // pool: every serverless instance and every dev-server restart opens its own,
  // and the upstream backends outlive the process that opened them (measured:
  // 9 idle backends still held ~7 minutes after the processes exited, against a
  // server max_connections of 60). Raising `max` multiplies across instances and
  // makes upstream exhaustion — the thing that causes stalls — more likely.
  //
  // The way to serve more requests per connection is to hold each connection for
  // less time, which is why the hot paths batch their round trips (see
  // getVictoriaPageData and validateVictoriaSession) rather than widening here.
  //
  // Queries go through pool.query(text, params), which uses unnamed prepared
  // statements. That is what the transaction pooler supports; naming a query
  // (passing `name`) would break under pgBouncer-style transaction pooling.
  const pool = new Pool({
    connectionString: databaseUrl,
    max: 5,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    // Matches the previous driver's ssl:"require" — encrypted, but the pooler's
    // certificate chain is not verified against the local CA bundle.
    ssl: { rejectUnauthorized: false },
    statement_timeout: VICTORIA_QUERY_TIMEOUT_MS,
  });

  // An idle client erroring (pooler restart, network blip) emits on the pool.
  // Without a listener Node treats it as an unhandled 'error' event and exits.
  pool.on("error", (error) => {
    console.error("Victoria database pool error:", error.message);
  });

  globalForVictoriaDb.victoriaPool = pool;
  return pool;
}

/** Run a query and return its rows, with the stall guard applied. */
export async function dbQuery<T extends QueryResultRow = QueryResultRow>(
  label: string,
  text: string,
  params: readonly unknown[] = [],
): Promise<T[]> {
  const result = await withDbTimeout(getPool().query<T>(text, params as unknown[]), label);
  return result.rows;
}

/**
 * Run several statements on one connection inside a transaction.
 *
 * The timeout budget covers acquiring the connection and each statement
 * separately rather than the transaction as a whole, so a slow-but-progressing
 * transaction is not killed halfway through.
 */
export async function dbTransaction<T>(label: string, run: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await withDbTimeout(getPool().connect(), `${label}:connect`);

  try {
    await client.query("BEGIN");
    const result = await run(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK").catch(() => undefined);
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Normalise a timestamp column to an ISO string.
 *
 * `pg` parses timestamptz into a JS Date. Going through String() would format it
 * as "Wed Jul 30 2026 22:00:00 GMT+0100" and drop the milliseconds — which the
 * message wall's keyset cursor (created_at, id) depends on. Convert Dates
 * directly, and only fall back to parsing for text/jsonb values.
 */
export function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(String(value)).toISOString();
}

export function toIsoStringOrNull(value: unknown): string | null {
  return value === null || value === undefined ? null : toIsoString(value);
}

export type DbRow = QueryResultRow;
