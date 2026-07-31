import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { VICTORIA_COOKIE_NAME, VICTORIA_COOKIE_PATH, VICTORIA_LEGACY_COOKIE_NAMES } from "./constants";
import { createRawToken, hashVictoriaToken } from "./crypto";
import { dbQuery, dbTransaction, toIsoString, toIsoStringOrNull, type DbRow } from "./db";
import { getSessionLifetimeDays, isVictoriaDevBypassEnabled, isVictoriaFeatureEnabled } from "./env";
import { getCurrentHost } from "./headers";
import type { VictoriaSession, VictoriaUser } from "./types";
import { browserFamily, osFamily } from "./user-agent";
import { mapUser } from "./queries";

export const claimTokenSchema = z.string().min(32).max(256).regex(/^[A-Za-z0-9_-]+$/);
export const devBypassUsernameSchema = z.enum(["freddie", "victoria"]);

/** Timestamp columns arrive as JS Dates from `pg`; see toIsoString in ./db. */
function sessionFromRow(row: DbRow): VictoriaSession {
  const user = mapUser({
    id: row.user_id,
    username: row.username,
    display_name: row.display_name,
    role: row.role,
    welcome_completed_at: row.welcome_completed_at,
    created_at: row.user_created_at,
    updated_at: row.user_updated_at,
  });

  return {
    user,
    device: {
      id: String(row.device_id),
      userId: String(row.user_id),
      label: String(row.label),
      browserFamily: String(row.browser_family),
      osFamily: String(row.os_family),
      claimedAt: toIsoString(row.claimed_at),
      lastSeenAt: toIsoString(row.last_seen_at),
      revokedAt: toIsoStringOrNull(row.revoked_at),
    },
    sessionId: String(row.session_id),
    expiresAt: toIsoString(row.expires_at),
  };
}

export function setVictoriaSessionCookie(rawToken: string, expiresAt: Date) {
  cookies().set(VICTORIA_COOKIE_NAME, rawToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: VICTORIA_COOKIE_PATH,
    expires: expiresAt,
  });
}

export function clearVictoriaSessionCookie() {
  for (const name of [VICTORIA_COOKIE_NAME, ...VICTORIA_LEGACY_COOKIE_NAMES]) {
    cookies().set(name, "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: VICTORIA_COOKIE_PATH,
      maxAge: 0,
    });
  }
}

export async function validateVictoriaSession(rawToken?: string | null): Promise<VictoriaSession | null> {
  const token = rawToken ?? cookies().get(VICTORIA_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }

  const tokenHash = hashVictoriaToken(token, "session");

  // One round trip: validate the token, refresh the session and device, and read
  // back the joined session in the same statement. Every page render and every
  // API route runs this, so it was the most-repeated pair of round trips in the
  // app. The EXISTS guard keeps the original semantics — nothing is touched
  // unless both the session and its device are live.
  const rows = await dbQuery(
    "validateVictoriaSession",
    `
      WITH touched_session AS (
        UPDATE victoria_sessions s
        SET last_used_at = now(),
            expires_at = greatest(s.expires_at, now() + ($2::text || ' days')::interval)
        WHERE s.token_hash = $1
          AND s.revoked_at IS NULL
          AND s.expires_at > now()
          AND EXISTS (
            SELECT 1 FROM victoria_devices d
            WHERE d.id = s.device_id AND d.revoked_at IS NULL
          )
        RETURNING s.id, s.device_id, s.expires_at
      ),
      touched_device AS (
        UPDATE victoria_devices d
        SET last_seen_at = now(), updated_at = now()
        WHERE d.id = (SELECT device_id FROM touched_session)
        RETURNING d.id, d.user_id, d.label, d.browser_family, d.os_family,
                  d.claimed_at, d.last_seen_at, d.revoked_at
      )
      SELECT
        ts.id AS session_id,
        ts.expires_at,
        u.id AS user_id,
        u.username,
        u.display_name,
        u.role,
        u.welcome_completed_at,
        u.created_at AS user_created_at,
        u.updated_at AS user_updated_at,
        td.id AS device_id,
        td.label,
        td.browser_family,
        td.os_family,
        td.claimed_at,
        td.last_seen_at,
        td.revoked_at
      FROM touched_session ts
      JOIN touched_device td ON td.id = ts.device_id
      JOIN victoria_users u ON u.id = td.user_id
      LIMIT 1
    `,
    [tokenHash, String(getSessionLifetimeDays())],
  );

  const row = rows[0];
  if (!row) {
    return null;
  }

  return sessionFromRow(row);
}

export async function requireVictoriaSession(): Promise<VictoriaSession> {
  const host = getCurrentHost();
  if (!isVictoriaFeatureEnabled(host)) {
    redirect("/victoria/access");
  }

  const session = await validateVictoriaSession();
  if (!session) {
    redirect("/victoria/access");
  }

  return session;
}

export async function requireVictoriaOwner(): Promise<VictoriaSession> {
  const session = await requireVictoriaSession();
  if (session.user.role !== "owner") {
    redirect("/victoria");
  }
  return session;
}

export class VictoriaAuthError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "VictoriaAuthError";
    this.status = status;
  }
}

/** API-route owner gate: throws instead of redirecting so handlers can return JSON 401/403. */
export async function requireVictoriaOwnerApi(): Promise<VictoriaSession> {
  const host = getCurrentHost();
  if (!isVictoriaFeatureEnabled(host)) {
    throw new VictoriaAuthError("Unauthorised", 401);
  }

  const session = await validateVictoriaSession();
  if (!session) {
    throw new VictoriaAuthError("Unauthorised", 401);
  }
  if (session.user.role !== "owner") {
    throw new VictoriaAuthError("Forbidden", 403);
  }
  return session;
}

async function createDeviceSessionForUserId(userId: string, deviceLabelPrefix = "") {
  const userAgent = headers().get("user-agent");
  const rawSessionToken = createRawToken();
  const sessionHash = hashVictoriaToken(rawSessionToken, "session");
  const expiresAt = new Date(Date.now() + getSessionLifetimeDays() * 86_400_000);
  const baseLabel = `${browserFamily(userAgent)} on ${osFamily(userAgent)}`;
  const label = deviceLabelPrefix ? `${deviceLabelPrefix}${baseLabel}` : baseLabel;

  const user = await dbTransaction("createDeviceSessionForUserId", async (client) => {
    const device = await client.query(
      `
        INSERT INTO victoria_devices (user_id, label, browser_family, os_family)
        VALUES ($1::uuid, $2, $3, $4)
        RETURNING id
      `,
      [userId, label, browserFamily(userAgent), osFamily(userAgent)],
    );
    const deviceId = String(device.rows[0]?.id);

    await client.query(
      `
        INSERT INTO victoria_sessions (device_id, token_hash, expires_at)
        VALUES ($1::uuid, $2, $3::timestamptz)
      `,
      [deviceId, sessionHash, expiresAt.toISOString()],
    );

    const users = await client.query(
      `
        SELECT id, username, display_name, role, welcome_completed_at, created_at, updated_at
        FROM victoria_users
        WHERE id = $1::uuid
      `,
      [userId],
    );
    return users.rows[0] ? mapUser(users.rows[0]) : null;
  });

  if (!user) {
    return null;
  }

  setVictoriaSessionCookie(rawSessionToken, expiresAt);
  return { user, expiresAt };
}

export async function createDeviceSessionForClaim(rawClaimToken: string) {
  const parsedToken = claimTokenSchema.safeParse(rawClaimToken);
  if (!parsedToken.success) {
    return null;
  }

  const tokenHash = hashVictoriaToken(parsedToken.data, "claim");
  const userAgent = headers().get("user-agent");
  const rawSessionToken = createRawToken();
  const sessionHash = hashVictoriaToken(rawSessionToken, "session");
  const expiresAt = new Date(Date.now() + getSessionLifetimeDays() * 86_400_000);
  const label = `${browserFamily(userAgent)} on ${osFamily(userAgent)}`;

  const user = await dbTransaction("createDeviceSessionForClaim", async (client) => {
    // Claiming the token and creating the device must be atomic: a one-time link
    // that is consumed without producing a session would lock the user out.
    const claims = await client.query(
      `
        UPDATE victoria_claim_tokens
        SET used_at = now()
        WHERE token_hash = $1
          AND used_at IS NULL
          AND revoked_at IS NULL
          AND expires_at > now()
        RETURNING user_id
      `,
      [tokenHash],
    );
    const claim = claims.rows[0];
    if (!claim) {
      return null;
    }

    const device = await client.query(
      `
        INSERT INTO victoria_devices (user_id, label, browser_family, os_family)
        VALUES ($1::uuid, $2, $3, $4)
        RETURNING id
      `,
      [claim.user_id, label, browserFamily(userAgent), osFamily(userAgent)],
    );
    const deviceId = String(device.rows[0]?.id);

    await client.query(
      `
        INSERT INTO victoria_sessions (device_id, token_hash, expires_at)
        VALUES ($1::uuid, $2, $3::timestamptz)
      `,
      [deviceId, sessionHash, expiresAt.toISOString()],
    );

    const users = await client.query(
      `
        SELECT id, username, display_name, role, welcome_completed_at, created_at, updated_at
        FROM victoria_users
        WHERE id = $1::uuid
      `,
      [claim.user_id],
    );
    return users.rows[0] ? mapUser(users.rows[0]) : null;
  });

  if (!user) {
    return null;
  }

  setVictoriaSessionCookie(rawSessionToken, expiresAt);
  return { user, expiresAt };
}

/**
 * Development-only session creation. Caller must gate with isVictoriaDevBypassEnabled().
 */
export async function createDevBypassSession(username: "freddie" | "victoria") {
  const host = getCurrentHost();
  if (!isVictoriaDevBypassEnabled(host)) {
    return null;
  }

  const userRows = await dbQuery(
    "createDevBypassSession",
    `
      SELECT id
      FROM victoria_users
      WHERE username = $1
      LIMIT 1
    `,
    [username],
  );
  const userId = userRows[0]?.id;
  if (!userId) {
    return null;
  }

  return createDeviceSessionForUserId(String(userId), "[dev] ");
}

export async function completeWelcome(user: VictoriaUser) {
  await dbQuery(
    "completeWelcome",
    `
      UPDATE victoria_users
      SET welcome_completed_at = coalesce(welcome_completed_at, now()), updated_at = now()
      WHERE id = $1::uuid
    `,
    [user.id],
  );
}
