import { DEFAULT_COUNTDOWN_TARGET_ISO, DEFAULT_COUNTDOWN_TIMEZONE, VICTORIA_PAGE_SIZE } from "./constants";
import { getSql } from "./db";
import type { VictoriaCountdownSettings, VictoriaMessage, VictoriaSession, VictoriaUser } from "./types";

function mapUser(row: Record<string, unknown>): VictoriaUser {
  return {
    id: String(row.id),
    username: row.username as VictoriaUser["username"],
    displayName: String(row.display_name),
    role: row.role as VictoriaUser["role"],
    welcomeCompletedAt: row.welcome_completed_at ? new Date(String(row.welcome_completed_at)).toISOString() : null,
    createdAt: new Date(String(row.created_at)).toISOString(),
    updatedAt: new Date(String(row.updated_at)).toISOString(),
  };
}

export async function getCountdownSettings(): Promise<VictoriaCountdownSettings> {
  const sql = getSql();
  const rows = await sql`
    SELECT label, target_at, timezone
    FROM victoria_countdown_settings
    WHERE id = 'return'
    LIMIT 1
  `;

  const row = rows[0];
  if (!row) {
    return {
      label: "Until Victoria is back",
      targetAt: DEFAULT_COUNTDOWN_TARGET_ISO,
      timezone: DEFAULT_COUNTDOWN_TIMEZONE,
    };
  }

  return {
    label: String(row.label),
    targetAt: new Date(String(row.target_at)).toISOString(),
    timezone: String(row.timezone),
  };
}

export async function getMessages(cursor?: string | null) {
  const sql = getSql();
  const rows = cursor
    ? await sql`
      SELECT m.id, m.author_user_id, u.username AS author_username, u.display_name AS author_display_name, m.body, m.created_at
      FROM victoria_messages m
      JOIN victoria_users u ON u.id = m.author_user_id
      WHERE m.hidden_at IS NULL AND (m.created_at, m.id) < (${cursor.split("|")[0]}::timestamptz, ${cursor.split("|")[1]}::uuid)
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ${VICTORIA_PAGE_SIZE}
    `
    : await sql`
      SELECT m.id, m.author_user_id, u.username AS author_username, u.display_name AS author_display_name, m.body, m.created_at
      FROM victoria_messages m
      JOIN victoria_users u ON u.id = m.author_user_id
      WHERE m.hidden_at IS NULL
      ORDER BY m.created_at DESC, m.id DESC
      LIMIT ${VICTORIA_PAGE_SIZE}
    `;

  const messages = rows
    .map((row): VictoriaMessage => ({
      id: String(row.id),
      authorUserId: String(row.author_user_id),
      authorUsername: row.author_username as VictoriaMessage["authorUsername"],
      authorDisplayName: String(row.author_display_name),
      body: String(row.body),
      createdAt: new Date(String(row.created_at)).toISOString(),
    }))
    .reverse();

  const oldest = rows[rows.length - 1];
  const nextCursor = oldest ? `${new Date(String(oldest.created_at)).toISOString()}|${String(oldest.id)}` : null;

  return { messages, nextCursor };
}

export async function insertMessage(session: VictoriaSession, body: string, clientNonce: string) {
  const sql = getSql();
  const rows = await sql`
    INSERT INTO victoria_messages (author_user_id, body, client_nonce)
    VALUES (${session.user.id}::uuid, ${body}, ${clientNonce})
    ON CONFLICT (author_user_id, client_nonce) DO UPDATE SET body = victoria_messages.body
    RETURNING id, author_user_id, body, created_at
  `;
  const row = rows[0];
  if (!row) {
    throw new Error("Message insert failed");
  }

  return {
    id: String(row.id),
    authorUserId: String(row.author_user_id),
    authorUsername: session.user.username,
    authorDisplayName: session.user.displayName,
    body: String(row.body),
    createdAt: new Date(String(row.created_at)).toISOString(),
  } satisfies VictoriaMessage;
}

export async function getMediaForMemories(memoryIds: readonly string[]) {
  if (memoryIds.length === 0) {
    return [];
  }
  const sql = getSql();
  return sql`
    SELECT id, memory_id, storage_key, original_filename, mime_type, caption, width, height, created_at
    FROM victoria_media
    WHERE hidden_at IS NULL AND memory_id = ANY(${memoryIds}::text[])
    ORDER BY created_at ASC
  `;
}

export async function getActivitySummary() {
  const sql = getSql();
  const [users, visits, messages, sessions, events] = await Promise.all([
    sql`
      SELECT u.username, u.display_name, u.welcome_completed_at, max(d.last_seen_at) AS last_seen_at
      FROM victoria_users u
      LEFT JOIN victoria_devices d ON d.user_id = u.id AND d.revoked_at IS NULL
      GROUP BY u.id
      ORDER BY u.username
    `,
    sql`
      SELECT date_trunc('day', created_at) AS day, count(*)::int AS count
      FROM victoria_activity_events
      WHERE event_type = 'page_view'
      GROUP BY day
      ORDER BY day DESC
      LIMIT 14
    `,
    sql`
      SELECT u.username, count(m.id)::int AS count
      FROM victoria_users u
      LEFT JOIN victoria_messages m ON m.author_user_id = u.id AND m.hidden_at IS NULL
      GROUP BY u.username
      ORDER BY u.username
    `,
    sql`
      SELECT d.label, u.username, d.browser_family, d.os_family, d.claimed_at, d.last_seen_at, d.revoked_at
      FROM victoria_devices d
      JOIN victoria_users u ON u.id = d.user_id
      ORDER BY d.last_seen_at DESC
      LIMIT 20
    `,
    sql`
      SELECT event_type, count(*)::int AS count
      FROM victoria_activity_events
      GROUP BY event_type
      ORDER BY event_type
    `,
  ]);

  return { users, visits, messages, sessions, events };
}

export { mapUser };
