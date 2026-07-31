import { DEFAULT_COUNTDOWN_TARGET_ISO, DEFAULT_COUNTDOWN_TIMEZONE, VICTORIA_PAGE_SIZE } from "./constants";
import type { VictoriaFuturePlan, VictoriaMilestone } from "./content";
import { dbQuery, toIsoString, toIsoStringOrNull, type DbRow } from "./db";
import type { VictoriaCountdownSettings, VictoriaMessage, VictoriaSession, VictoriaUser, VictoriaUserMemory } from "./types";

function mapUser(row: DbRow): VictoriaUser {
  return {
    id: String(row.id),
    username: row.username as VictoriaUser["username"],
    displayName: String(row.display_name),
    role: row.role as VictoriaUser["role"],
    welcomeCompletedAt: toIsoStringOrNull(row.welcome_completed_at),
    createdAt: toIsoString(row.created_at),
    updatedAt: toIsoString(row.updated_at),
  };
}

/** Shared by the batched page query and the paginating messages endpoint. */
function mapMessage(row: DbRow): VictoriaMessage {
  return {
    id: String(row.id),
    authorUserId: String(row.author_user_id),
    authorUsername: row.author_username as VictoriaMessage["authorUsername"],
    authorDisplayName: String(row.author_display_name),
    body: String(row.body),
    createdAt: toIsoString(row.created_at),
  };
}

function mapCountdown(row: DbRow | null | undefined): VictoriaCountdownSettings {
  if (!row) {
    return {
      label: "Until you get back <3",
      targetAt: DEFAULT_COUNTDOWN_TARGET_ISO,
      timezone: DEFAULT_COUNTDOWN_TIMEZONE,
    };
  }

  return {
    label: String(row.label),
    targetAt: toIsoString(row.target_at),
    timezone: String(row.timezone),
  };
}

export type VictoriaMediaItem = {
  id: string;
  memoryId: string | null;
  storageKey: string;
  caption: string | null;
  width: number | null;
  height: number | null;
};

function mapMedia(row: DbRow): VictoriaMediaItem {
  return {
    id: String(row.id),
    memoryId: row.memory_id ? String(row.memory_id) : null,
    storageKey: String(row.storage_key),
    caption: row.caption ? String(row.caption) : null,
    width: row.width === null || row.width === undefined ? null : Number(row.width),
    height: row.height === null || row.height === undefined ? null : Number(row.height),
  };
}

function messageCursor(row: DbRow | undefined) {
  return row ? `${toIsoString(row.created_at)}|${String(row.id)}` : null;
}

/**
 * DATE columns (occurs_on, target_date). Reached through the jsonb aggregate in
 * getVictoriaPageData they arrive as a plain "YYYY-MM-DD" string (Postgres's
 * to_jsonb serialises DATE that way, and pg does not apply column type parsers
 * to values nested inside a jsonb blob) — that is the only path this is
 * actually called on today. If a future caller ever runs this against a plain
 * (non-jsonb) DATE column instead, pg's default parser hands back a JS Date
 * built from local-time components (`new Date(y, m, d)`), and
 * `.toISOString()` converts to UTC first — which shifts the date by one
 * whenever the server's local timezone isn't UTC (reproduced under
 * Europe/London BST while building this). Recovering the calendar date from
 * such a Date must use the local getters, not toISOString.
 */
function dateOnlyString(value: unknown): string {
  if (value instanceof Date) {
    return `${value.getFullYear()}-${String(value.getMonth() + 1).padStart(2, "0")}-${String(value.getDate()).padStart(2, "0")}`;
  }
  return String(value).slice(0, 10);
}

function mapUserMemory(row: DbRow): VictoriaUserMemory {
  return {
    id: String(row.id),
    title: String(row.title),
    date: dateOnlyString(row.occurs_on),
    body: String(row.body),
  };
}

/** Shape-compatible with the hand-authored VictoriaMilestone in content.ts, so
 * the client can merge the two lists. `displayOrder` isn't used for these —
 * user-created milestones are sorted into the combined list by date instead. */
function mapUserMilestone(row: DbRow): VictoriaMilestone {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    occursAt: dateOnlyString(row.occurs_on),
    displayOrder: 0,
  };
}

/** Shape-compatible with the hand-authored VictoriaFuturePlan in content.ts.
 * `category`/`completed` aren't exposed in the creation form (neither is
 * rendered anywhere today), and `displayOrder` is set by the caller, which
 * appends these after the hand-authored plans rather than interleaving by a
 * number these rows don't meaningfully have. */
function mapUserFuturePlan(row: DbRow): VictoriaFuturePlan {
  return {
    id: String(row.id),
    title: String(row.title),
    description: row.description ? String(row.description) : undefined,
    targetDate: row.target_date == null ? undefined : dateOnlyString(row.target_date),
    category: undefined,
    completed: false,
    displayOrder: 0,
  };
}

const MESSAGE_COLUMNS = `
  m.id,
  m.author_user_id,
  u.username AS author_username,
  u.display_name AS author_display_name,
  m.body,
  m.created_at
`;

/**
 * Everything /victoria renders, in one round trip, plus the page_view event.
 *
 * This replaced four sequential SELECTs and one INSERT (measured 108ms of reads
 * alone, versus 37ms here). The point is not only latency: each request holds a
 * pooled connection for the whole time it is querying, and connection pressure is
 * what makes queries stall — see the note in ./db.ts.
 *
 * The page_view INSERT rides along as a data-modifying CTE. Postgres runs those
 * exactly once whether or not the outer query reads their output. It is inside the
 * same statement as the reads, so unlike the previous fire-and-forget insert it
 * can fail the render — acceptable because its only foreign keys are the session's
 * user and device, which validateVictoriaSession just confirmed exist.
 */
export async function getVictoriaPageData(session: VictoriaSession, memoryIds: readonly string[]) {
  const rows = await dbQuery(
    "getVictoriaPageData",
    `
      WITH logged AS (
        INSERT INTO victoria_activity_events (user_id, device_id, event_type, event_metadata)
        VALUES ($1::uuid, $2::uuid, 'page_view', $3::jsonb)
      )
      SELECT
        (
          SELECT to_jsonb(countdown)
          FROM (
            SELECT label, target_at, timezone
            FROM victoria_countdown_settings
            WHERE id = 'return'
            LIMIT 1
          ) AS countdown
        ) AS countdown,
        (
          SELECT coalesce(jsonb_agg(to_jsonb(recent) ORDER BY recent.created_at DESC, recent.id DESC), '[]'::jsonb)
          FROM (
            SELECT ${MESSAGE_COLUMNS}
            FROM victoria_messages m
            JOIN victoria_users u ON u.id = m.author_user_id
            WHERE m.hidden_at IS NULL
            ORDER BY m.created_at DESC, m.id DESC
            LIMIT $4
          ) AS recent
        ) AS messages,
        (
          SELECT coalesce(jsonb_agg(to_jsonb(um) ORDER BY um.occurs_on ASC, um.created_at ASC), '[]'::jsonb)
          FROM (
            SELECT id, title, body, occurs_on, created_at
            FROM victoria_user_memories
            WHERE hidden_at IS NULL
          ) AS um
        ) AS user_memories,
        (
          SELECT coalesce(jsonb_agg(to_jsonb(mile) ORDER BY mile.occurs_on ASC, mile.created_at ASC), '[]'::jsonb)
          FROM (
            SELECT id, title, description, occurs_on, created_at
            FROM victoria_user_milestones
            WHERE hidden_at IS NULL
          ) AS mile
        ) AS user_milestones,
        (
          SELECT coalesce(jsonb_agg(to_jsonb(fp) ORDER BY fp.created_at ASC), '[]'::jsonb)
          FROM (
            SELECT id, title, description, target_date, created_at
            FROM victoria_user_future_plans
            WHERE hidden_at IS NULL
          ) AS fp
        ) AS user_future_plans,
        (
          SELECT coalesce(jsonb_agg(to_jsonb(items) ORDER BY items.created_at ASC), '[]'::jsonb)
          FROM (
            SELECT id, memory_id, storage_key, caption, width, height, created_at
            FROM victoria_media
            WHERE hidden_at IS NULL
              AND (
                -- Hand-authored memories, whose ids are only known at build time
                -- (lib/victoria/content.ts) ...
                memory_id = ANY($5::text[])
                -- ... or user-created ones, whose ids only exist in this same
                -- query — a subquery here avoids a second round trip to learn
                -- them first.
                OR memory_id IN (SELECT id::text FROM victoria_user_memories WHERE hidden_at IS NULL)
              )
          ) AS items
        ) AS media
    `,
    [
      session.user.id,
      session.device.id,
      JSON.stringify({ route: "/victoria" }),
      VICTORIA_PAGE_SIZE,
      memoryIds,
    ],
  );

  const row = rows[0] ?? {};
  // jsonb comes back already parsed, with timestamps as ISO strings.
  const messageRows = (row.messages ?? []) as DbRow[];
  const mediaRows = (row.media ?? []) as DbRow[];
  const userMemoryRows = (row.user_memories ?? []) as DbRow[];
  const userMilestoneRows = (row.user_milestones ?? []) as DbRow[];
  const userFuturePlanRows = (row.user_future_plans ?? []) as DbRow[];

  return {
    countdown: mapCountdown(row.countdown as DbRow | null),
    // Newest-first from the database so LIMIT takes the latest; oldest-first for display.
    messages: messageRows.map(mapMessage).reverse(),
    nextCursor: messageCursor(messageRows[messageRows.length - 1]),
    media: mediaRows.map(mapMedia),
    userMemories: userMemoryRows.map(mapUserMemory),
    userMilestones: userMilestoneRows.map(mapUserMilestone),
    userFuturePlans: userFuturePlanRows.map(mapUserFuturePlan),
  };
}

/** Creates a memory a user added live through the /victoria UI, as opposed to
 * the hand-authored ones in lib/victoria/content.ts. Returns its new id so the
 * caller can attach an uploaded photo to it in the same request. */
export async function insertUserMemory(
  session: VictoriaSession,
  input: { title: string; body: string; occursOn: string },
): Promise<string> {
  const rows = await dbQuery(
    "insertUserMemory",
    `
      INSERT INTO victoria_user_memories (created_by_user_id, title, body, occurs_on)
      VALUES ($1::uuid, $2, $3, $4::date)
      RETURNING id
    `,
    [session.user.id, input.title, input.body, input.occursOn],
  );

  const id = rows[0]?.id;
  if (!id) {
    throw new Error("Memory insert failed");
  }
  return String(id);
}

/** Creates a milestone a user added live through the /victoria UI. */
export async function insertUserMilestone(
  session: VictoriaSession,
  input: { title: string; description?: string; occursOn: string },
): Promise<string> {
  const rows = await dbQuery(
    "insertUserMilestone",
    `
      INSERT INTO victoria_user_milestones (created_by_user_id, title, description, occurs_on)
      VALUES ($1::uuid, $2, $3, $4::date)
      RETURNING id
    `,
    [session.user.id, input.title, input.description ?? null, input.occursOn],
  );

  const id = rows[0]?.id;
  if (!id) {
    throw new Error("Milestone insert failed");
  }
  return String(id);
}

/** Creates a future plan a user added live through the /victoria UI. */
export async function insertUserFuturePlan(
  session: VictoriaSession,
  input: { title: string; description?: string; targetDate?: string },
): Promise<string> {
  const rows = await dbQuery(
    "insertUserFuturePlan",
    `
      INSERT INTO victoria_user_future_plans (created_by_user_id, title, description, target_date)
      VALUES ($1::uuid, $2, $3, $4::date)
      RETURNING id
    `,
    [session.user.id, input.title, input.description ?? null, input.targetDate ?? null],
  );

  const id = rows[0]?.id;
  if (!id) {
    throw new Error("Future plan insert failed");
  }
  return String(id);
}

export async function getCountdownSettings(): Promise<VictoriaCountdownSettings> {
  const rows = await dbQuery(
    "getCountdownSettings",
    `
      SELECT label, target_at, timezone
      FROM victoria_countdown_settings
      WHERE id = 'return'
      LIMIT 1
    `,
  );

  return mapCountdown(rows[0]);
}

export async function getMessages(cursor?: string | null) {
  const [cursorCreatedAt, cursorId] = cursor ? cursor.split("|") : [];

  const rows = cursor
    ? await dbQuery(
        "getMessages:page",
        `
          SELECT ${MESSAGE_COLUMNS}
          FROM victoria_messages m
          JOIN victoria_users u ON u.id = m.author_user_id
          WHERE m.hidden_at IS NULL
            AND (m.created_at, m.id) < ($1::timestamptz, $2::uuid)
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT $3
        `,
        [cursorCreatedAt, cursorId, VICTORIA_PAGE_SIZE],
      )
    : await dbQuery(
        "getMessages",
        `
          SELECT ${MESSAGE_COLUMNS}
          FROM victoria_messages m
          JOIN victoria_users u ON u.id = m.author_user_id
          WHERE m.hidden_at IS NULL
          ORDER BY m.created_at DESC, m.id DESC
          LIMIT $1
        `,
        [VICTORIA_PAGE_SIZE],
      );

  return {
    messages: rows.map(mapMessage).reverse(),
    nextCursor: messageCursor(rows[rows.length - 1]),
  };
}

export async function insertMessage(session: VictoriaSession, body: string, clientNonce: string) {
  const rows = await dbQuery(
    "insertMessage",
    `
      INSERT INTO victoria_messages (author_user_id, body, client_nonce)
      VALUES ($1::uuid, $2, $3)
      ON CONFLICT (author_user_id, client_nonce) DO UPDATE SET body = victoria_messages.body
      RETURNING id, author_user_id, body, created_at
    `,
    [session.user.id, body, clientNonce],
  );
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
    createdAt: toIsoString(row.created_at),
  } satisfies VictoriaMessage;
}

export async function getMediaForMemories(memoryIds: readonly string[]): Promise<VictoriaMediaItem[]> {
  if (memoryIds.length === 0) {
    return [];
  }

  const rows = await dbQuery(
    "getMediaForMemories",
    `
      SELECT id, memory_id, storage_key, caption, width, height
      FROM victoria_media
      WHERE hidden_at IS NULL AND memory_id = ANY($1::text[])
      ORDER BY created_at ASC
    `,
    [memoryIds],
  );

  return rows.map(mapMedia);
}

export async function getActivitySummary() {
  // Five independent aggregates, run concurrently. This is within the pool's
  // `max`, and running them in parallel means each connection is held for one
  // query's duration instead of five — which is what actually reduces the
  // connection pressure described in ./db.ts.
  const [users, visits, messages, sessions, events] = await Promise.all([
    dbQuery(
      "activitySummary:users",
      `
        SELECT u.username, u.display_name, u.welcome_completed_at, max(d.last_seen_at) AS last_seen_at
        FROM victoria_users u
        LEFT JOIN victoria_devices d ON d.user_id = u.id AND d.revoked_at IS NULL
        GROUP BY u.id
        ORDER BY u.username
      `,
    ),
    dbQuery(
      "activitySummary:visits",
      `
        SELECT date_trunc('day', created_at) AS day, count(*)::int AS count
        FROM victoria_activity_events
        WHERE event_type = 'page_view'
        GROUP BY day
        ORDER BY day DESC
        LIMIT 14
      `,
    ),
    dbQuery(
      "activitySummary:messages",
      `
        SELECT u.username, count(m.id)::int AS count
        FROM victoria_users u
        LEFT JOIN victoria_messages m ON m.author_user_id = u.id AND m.hidden_at IS NULL
        GROUP BY u.username
        ORDER BY u.username
      `,
    ),
    dbQuery(
      "activitySummary:sessions",
      `
        SELECT d.label, u.username, d.browser_family, d.os_family, d.claimed_at, d.last_seen_at, d.revoked_at
        FROM victoria_devices d
        JOIN victoria_users u ON u.id = d.user_id
        ORDER BY d.last_seen_at DESC
        LIMIT 20
      `,
    ),
    dbQuery(
      "activitySummary:events",
      `
        SELECT event_type, count(*)::int AS count
        FROM victoria_activity_events
        GROUP BY event_type
        ORDER BY event_type
      `,
    ),
  ]);

  return { users, visits, messages, sessions, events };
}

export { mapUser };
