import { randomUUID } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import { Pool } from "pg";

import { loadEnvForScripts } from "../load-env";
import { createRawToken, hashVictoriaToken } from "../../lib/victoria/crypto";
import { DEFAULT_COUNTDOWN_TIMEZONE } from "../../lib/victoria/constants";
import { getAnalyticsRetentionDays } from "../../lib/victoria/env";

loadEnvForScripts();

const pool = new Pool({
  connectionString: requiredEnv("DATABASE_URL"),
  max: 3,
  idleTimeoutMillis: 20_000,
  connectionTimeoutMillis: 10_000,
  ssl: { rejectUnauthorized: false },
});

/** Returns rows. Params are optional so callers stay terse. */
async function q(text: string, params: readonly unknown[] = []) {
  const result = await pool.query(text, params as unknown[]);
  return result.rows;
}

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    console.error(`${name} is required.`);
    process.exit(1);
  }
  return value;
}

function arg(name: string) {
  const index = process.argv.indexOf(`--${name}`);
  return index === -1 ? undefined : process.argv[index + 1];
}

async function confirm(prompt: string) {
  if (process.env.VICTORIA_CONFIRM === "yes") {
    return;
  }
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${prompt} Type "yes" to continue: `);
  rl.close();
  if (answer !== "yes") {
    console.error("Cancelled.");
    process.exit(2);
  }
}

async function migrate() {
  const dir = path.resolve(process.cwd(), "db/migrations");
  const files = readdirSync(dir)
    .filter((name) => name.endsWith(".sql"))
    .sort();

  for (const file of files) {
    // No parameters, so each file goes over the simple query protocol, which is
    // what allows its multiple statements and DO $$ blocks in one round trip.
    await pool.query(readFileSync(path.join(dir, file), "utf8"));
    console.log(`Applied ${file}`);
  }
  console.log("Victoria migration complete.");
}

async function seed() {
  await q(`
    INSERT INTO victoria_users (id, username, display_name, role)
    VALUES
      ('11111111-1111-4111-8111-111111111111', 'freddie', 'Freddie', 'owner'),
      ('22222222-2222-4222-8222-222222222222', 'victoria', 'Victoria', 'member')
    ON CONFLICT (username) DO UPDATE
      SET display_name = excluded.display_name,
          role = excluded.role,
          updated_at = now()
  `);
  console.log("Seeded Freddie and Victoria idempotently.");
}

async function claim() {
  requiredEnv("VICTORIA_TOKEN_HASH_SECRET");
  const username = arg("user");
  if (username !== "freddie" && username !== "victoria") {
    console.error("--user must be freddie or victoria");
    process.exit(2);
  }

  const rawToken = createRawToken();
  const tokenHash = hashVictoriaToken(rawToken, "claim");
  const days = Number(arg("days") ?? 14);
  const rows = await q(
    `
      INSERT INTO victoria_claim_tokens (user_id, token_hash, expires_at)
      SELECT id, $1, now() + ($2::text || ' days')::interval
      FROM victoria_users
      WHERE username = $3
      RETURNING expires_at
    `,
    [tokenHash, String(days), username],
  );
  if (!rows[0]) {
    console.error("User not found. Run victoria:seed first.");
    process.exit(1);
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kohn.me.uk";
  console.log(`Claim URL for ${username}: ${origin}/victoria/claim/${rawToken}`);
  console.log(`Expires: ${new Date(rows[0].expires_at).toISOString()}`);
}

async function users() {
  console.table(
    await q(`
      SELECT username, display_name, role, welcome_completed_at, created_at
      FROM victoria_users
      ORDER BY username
    `),
  );
}

async function devices() {
  console.table(
    await q(`
      SELECT d.id, u.username, d.label, d.browser_family, d.os_family, d.claimed_at, d.last_seen_at, d.revoked_at
      FROM victoria_devices d
      JOIN victoria_users u ON u.id = d.user_id
      ORDER BY d.last_seen_at DESC
    `),
  );
}

async function revoke() {
  const device = arg("device");
  const username = arg("user");
  await confirm("This revokes active Victoria access. ");

  if (device) {
    await q(`UPDATE victoria_devices SET revoked_at = now(), updated_at = now() WHERE id = $1::uuid`, [device]);
    await q(
      `
        UPDATE victoria_sessions s
        SET revoked_at = now()
        FROM victoria_devices d
        WHERE s.device_id = d.id AND d.id = $1::uuid
      `,
      [device],
    );
    console.log("Device revoked.");
    return;
  }

  if (username !== "freddie" && username !== "victoria") {
    console.error("Provide --device <uuid> or --user freddie|victoria");
    process.exit(2);
  }

  await q(
    `
      UPDATE victoria_sessions s
      SET revoked_at = now()
      FROM victoria_devices d
      JOIN victoria_users u ON u.id = d.user_id
      WHERE s.device_id = d.id AND u.username = $1
    `,
    [username],
  );
  console.log(`Sessions revoked for ${username}.`);
}

async function resetWelcome() {
  const username = arg("user");
  if (username !== "freddie" && username !== "victoria") {
    console.error("--user must be freddie or victoria");
    process.exit(2);
  }
  await q(`UPDATE victoria_users SET welcome_completed_at = null, updated_at = now() WHERE username = $1`, [username]);
  console.log(`Welcome reset for ${username}.`);
}

async function setCountdown() {
  const datetime = arg("datetime");
  const timezone = arg("timezone") ?? DEFAULT_COUNTDOWN_TIMEZONE;
  if (!datetime) {
    console.error('Provide --datetime "2026-09-18T16:00:00"');
    process.exit(2);
  }

  try {
    Intl.DateTimeFormat(undefined, { timeZone: timezone });
  } catch {
    console.error("Invalid timezone.");
    process.exit(2);
  }

  const target = new Date(datetime);
  if (Number.isNaN(target.getTime())) {
    console.error("Invalid datetime.");
    process.exit(2);
  }

  await q(
    `
      INSERT INTO victoria_countdown_settings (id, label, target_at, timezone, updated_at)
      VALUES ('return', 'Until you get back <3', $1::timestamptz, $2, now())
      ON CONFLICT (id) DO UPDATE
        SET target_at = excluded.target_at,
            timezone = excluded.timezone,
            updated_at = now()
    `,
    [target.toISOString(), timezone],
  );
  console.log(`Countdown set to ${target.toISOString()} (${timezone}).`);
}

async function hideMessage() {
  const id = arg("id");
  if (!id) {
    console.error("Provide --id <message uuid>");
    process.exit(2);
  }
  await confirm("This hides a message from the wall. ");
  await q(`UPDATE victoria_messages SET hidden_at = now(), updated_at = now() WHERE id = $1::uuid`, [id]);
  console.log("Message hidden.");
}

async function hideMedia() {
  const id = arg("id");
  if (!id) {
    console.error("Provide --id <media uuid>");
    process.exit(2);
  }
  await confirm("This hides media metadata from the gallery. ");
  await q(`UPDATE victoria_media SET hidden_at = now() WHERE id = $1::uuid`, [id]);
  console.log("Media hidden.");
}

async function clearAnalytics() {
  const days = Number(arg("days") ?? getAnalyticsRetentionDays());
  await confirm(`This deletes Victoria analytics older than ${days} days. `);
  const rows = await q(
    `
      DELETE FROM victoria_activity_events
      WHERE created_at < now() - ($1::text || ' days')::interval
      RETURNING id
    `,
    [String(days)],
  );
  console.log(`Deleted ${rows.length} old activity events.`);
}

async function exportMetadata() {
  const id = randomUUID();
  const [messages, media] = await Promise.all([
    q(`SELECT id, author_user_id, created_at, hidden_at FROM victoria_messages ORDER BY created_at ASC`),
    q(
      `SELECT id, memory_id, original_filename, mime_type, size_bytes, width, height, caption, created_at, hidden_at FROM victoria_media ORDER BY created_at ASC`,
    ),
  ]);
  console.log(JSON.stringify({ exportId: id, exportedAt: new Date().toISOString(), messages, media }, null, 2));
}

const commands: Record<string, () => Promise<void>> = {
  migrate,
  seed,
  claim,
  users,
  devices,
  revoke,
  "reset-welcome": resetWelcome,
  "set-countdown": setCountdown,
  "hide-message": hideMessage,
  "hide-media": hideMedia,
  "clear-analytics": clearAnalytics,
  "export-metadata": exportMetadata,
};

const command = process.argv[2];
if (!command || !commands[command]) {
  console.error(`Usage: tsx scripts/victoria/admin.ts ${Object.keys(commands).join("|")} [options]`);
  process.exit(2);
}

// Close the pool before exiting rather than in a .finally() after process.exit(),
// which never runs. Upstream backends outlive the process that opened them, so a
// leaked pool here shows up later as connection pressure against the database —
// see lib/victoria/db.ts and `npm run victoria:pool-probe`.
async function run() {
  try {
    await commands[command]();
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : "Victoria admin command failed.");
    await pool.end().catch(() => undefined);
    process.exit(1);
  }
  await pool.end().catch(() => undefined);
}

void run();
