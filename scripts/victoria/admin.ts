import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";

import postgres from "postgres";

import { loadEnvForScripts } from "../load-env";
import { createRawToken, hashVictoriaToken } from "../../lib/victoria/crypto";
import { DEFAULT_COUNTDOWN_TIMEZONE } from "../../lib/victoria/constants";
import { getAnalyticsRetentionDays } from "../../lib/victoria/env";

loadEnvForScripts();

const sql = postgres(requiredEnv("DATABASE_URL"), {
  max: 3,
  idle_timeout: 20,
  connect_timeout: 10,
  prepare: false,
});

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
  const file = path.resolve(process.cwd(), "db/migrations/0001_victoria_private_area.sql");
  await sql.unsafe(readFileSync(file, "utf8"));
  console.log("Victoria migration complete.");
}

async function seed() {
  await sql`
    INSERT INTO victoria_users (id, username, display_name, role)
    VALUES
      ('11111111-1111-4111-8111-111111111111', 'freddie', 'Freddie', 'owner'),
      ('22222222-2222-4222-8222-222222222222', 'victoria', 'Victoria', 'member')
    ON CONFLICT (username) DO UPDATE
      SET display_name = excluded.display_name,
          role = excluded.role,
          updated_at = now()
  `;
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
  const rows = await sql`
    INSERT INTO victoria_claim_tokens (user_id, token_hash, expires_at)
    SELECT id, ${tokenHash}, now() + (${days}::text || ' days')::interval
    FROM victoria_users
    WHERE username = ${username}
    RETURNING expires_at
  `;
  if (!rows[0]) {
    console.error("User not found. Run victoria:seed first.");
    process.exit(1);
  }

  const origin = process.env.NEXT_PUBLIC_SITE_URL ?? "https://kohn.me.uk";
  console.log(`Claim URL for ${username}: ${origin}/victoria/claim/${rawToken}`);
  console.log(`Expires: ${new Date(String(rows[0].expires_at)).toISOString()}`);
}

async function users() {
  const rows = await sql`
    SELECT username, display_name, role, welcome_completed_at, created_at
    FROM victoria_users
    ORDER BY username
  `;
  console.table(rows);
}

async function devices() {
  const rows = await sql`
    SELECT d.id, u.username, d.label, d.browser_family, d.os_family, d.claimed_at, d.last_seen_at, d.revoked_at
    FROM victoria_devices d
    JOIN victoria_users u ON u.id = d.user_id
    ORDER BY d.last_seen_at DESC
  `;
  console.table(rows);
}

async function revoke() {
  const device = arg("device");
  const username = arg("user");
  await confirm("This revokes active Victoria access. ");

  if (device) {
    await sql`UPDATE victoria_devices SET revoked_at = now(), updated_at = now() WHERE id = ${device}::uuid`;
    await sql`
      UPDATE victoria_sessions s
      SET revoked_at = now()
      FROM victoria_devices d
      WHERE s.device_id = d.id AND d.id = ${device}::uuid
    `;
    console.log("Device revoked.");
    return;
  }

  if (username !== "freddie" && username !== "victoria") {
    console.error("Provide --device <uuid> or --user freddie|victoria");
    process.exit(2);
  }

  await sql`
    UPDATE victoria_sessions s
    SET revoked_at = now()
    FROM victoria_devices d
    JOIN victoria_users u ON u.id = d.user_id
    WHERE s.device_id = d.id AND u.username = ${username}
  `;
  console.log(`Sessions revoked for ${username}.`);
}

async function resetWelcome() {
  const username = arg("user");
  if (username !== "freddie" && username !== "victoria") {
    console.error("--user must be freddie or victoria");
    process.exit(2);
  }
  await sql`UPDATE victoria_users SET welcome_completed_at = null, updated_at = now() WHERE username = ${username}`;
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

  await sql`
    INSERT INTO victoria_countdown_settings (id, label, target_at, timezone, updated_at)
    VALUES ('return', 'Until Victoria is back', ${target.toISOString()}::timestamptz, ${timezone}, now())
    ON CONFLICT (id) DO UPDATE
      SET target_at = excluded.target_at,
          timezone = excluded.timezone,
          updated_at = now()
  `;
  console.log(`Countdown set to ${target.toISOString()} (${timezone}).`);
}

async function hideMessage() {
  const id = arg("id");
  if (!id) {
    console.error("Provide --id <message uuid>");
    process.exit(2);
  }
  await confirm("This hides a message from the wall. ");
  await sql`UPDATE victoria_messages SET hidden_at = now(), updated_at = now() WHERE id = ${id}::uuid`;
  console.log("Message hidden.");
}

async function hideMedia() {
  const id = arg("id");
  if (!id) {
    console.error("Provide --id <media uuid>");
    process.exit(2);
  }
  await confirm("This hides media metadata from the gallery. ");
  await sql`UPDATE victoria_media SET hidden_at = now() WHERE id = ${id}::uuid`;
  console.log("Media hidden.");
}

async function clearAnalytics() {
  const days = Number(arg("days") ?? getAnalyticsRetentionDays());
  await confirm(`This deletes Victoria analytics older than ${days} days. `);
  const rows = await sql`
    DELETE FROM victoria_activity_events
    WHERE created_at < now() - (${days}::text || ' days')::interval
    RETURNING id
  `;
  console.log(`Deleted ${rows.length} old activity events.`);
}

async function exportMetadata() {
  const id = randomUUID();
  const [messages, media] = await Promise.all([
    sql`SELECT id, author_user_id, created_at, hidden_at FROM victoria_messages ORDER BY created_at ASC`,
    sql`SELECT id, memory_id, original_filename, mime_type, size_bytes, width, height, caption, created_at, hidden_at FROM victoria_media ORDER BY created_at ASC`,
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

commands[command]().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Victoria admin command failed.");
  process.exit(1);
}).finally(async () => {
  await sql.end({ timeout: 5 }).catch(() => undefined);
});
