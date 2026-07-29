import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";

import { VICTORIA_COOKIE_NAME, VICTORIA_COOKIE_PATH, VICTORIA_LEGACY_COOKIE_NAMES } from "./constants";
import { createRawToken, hashVictoriaToken } from "./crypto";
import { getSql } from "./db";
import { getSessionLifetimeDays, isVictoriaFeatureEnabled } from "./env";
import { getCurrentHost } from "./headers";
import type { VictoriaSession, VictoriaUser } from "./types";
import { browserFamily, osFamily } from "./user-agent";
import { mapUser } from "./queries";

export const claimTokenSchema = z.string().min(32).max(256).regex(/^[A-Za-z0-9_-]+$/);

type SessionRows = {
  session_id: string;
  expires_at: string;
  user_id: string;
  username: string;
  display_name: string;
  role: string;
  welcome_completed_at: string | null;
  user_created_at: string;
  user_updated_at: string;
  device_id: string;
  label: string;
  browser_family: string;
  os_family: string;
  claimed_at: string;
  last_seen_at: string;
  revoked_at: string | null;
};

function sessionFromRow(row: SessionRows): VictoriaSession {
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
      id: row.device_id,
      userId: row.user_id,
      label: row.label,
      browserFamily: row.browser_family,
      osFamily: row.os_family,
      claimedAt: new Date(row.claimed_at).toISOString(),
      lastSeenAt: new Date(row.last_seen_at).toISOString(),
      revokedAt: row.revoked_at ? new Date(row.revoked_at).toISOString() : null,
    },
    sessionId: row.session_id,
    expiresAt: new Date(row.expires_at).toISOString(),
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
  const sql = getSql();
  const rows = await sql`
    SELECT
      s.id AS session_id,
      s.expires_at,
      u.id AS user_id,
      u.username,
      u.display_name,
      u.role,
      u.welcome_completed_at,
      u.created_at AS user_created_at,
      u.updated_at AS user_updated_at,
      d.id AS device_id,
      d.label,
      d.browser_family,
      d.os_family,
      d.claimed_at,
      d.last_seen_at,
      d.revoked_at
    FROM victoria_sessions s
    JOIN victoria_devices d ON d.id = s.device_id
    JOIN victoria_users u ON u.id = d.user_id
    WHERE s.token_hash = ${tokenHash}
      AND s.revoked_at IS NULL
      AND d.revoked_at IS NULL
      AND s.expires_at > now()
    LIMIT 1
  `;

  const row = rows[0] as SessionRows | undefined;
  if (!row) {
    return null;
  }

  await sql`
    UPDATE victoria_sessions
    SET last_used_at = now(),
        expires_at = greatest(expires_at, now() + (${getSessionLifetimeDays()}::text || ' days')::interval)
    WHERE id = ${row.session_id}::uuid
  `;

  await sql`
    UPDATE victoria_devices
    SET last_seen_at = now(), updated_at = now()
    WHERE id = ${row.device_id}::uuid
  `;

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

export async function createDeviceSessionForClaim(rawClaimToken: string) {
  const parsedToken = claimTokenSchema.safeParse(rawClaimToken);
  if (!parsedToken.success) {
    return null;
  }

  const tokenHash = hashVictoriaToken(parsedToken.data, "claim");
  const sql = getSql();
  const userAgent = headers().get("user-agent");
  const rawSessionToken = createRawToken();
  const sessionHash = hashVictoriaToken(rawSessionToken, "session");
  const expiresAt = new Date(Date.now() + getSessionLifetimeDays() * 86_400_000);
  const label = `${browserFamily(userAgent)} on ${osFamily(userAgent)}`;
  const user = await sql.begin(async (transaction) => {
    const claimRows = await transaction`
        UPDATE victoria_claim_tokens
        SET used_at = now()
        WHERE token_hash = ${tokenHash}
          AND used_at IS NULL
          AND revoked_at IS NULL
          AND expires_at > now()
        RETURNING user_id
      `;
    const claim = claimRows[0];
    if (!claim) {
      return null;
    }

    const deviceRows = await transaction`
      INSERT INTO victoria_devices (user_id, label, browser_family, os_family)
      VALUES (${claim.user_id}::uuid, ${label}, ${browserFamily(userAgent)}, ${osFamily(userAgent)})
      RETURNING id
    `;
    const deviceId = String(deviceRows[0]?.id);

    await transaction`
      INSERT INTO victoria_sessions (device_id, token_hash, expires_at)
      VALUES (${deviceId}::uuid, ${sessionHash}, ${expiresAt.toISOString()}::timestamptz)
    `;

    const userRows = await transaction`
      SELECT id, username, display_name, role, welcome_completed_at, created_at, updated_at
      FROM victoria_users
      WHERE id = ${claim.user_id}::uuid
    `;
    return userRows[0] ? mapUser(userRows[0]) : null;
  });

  if (!user) {
    return null;
  }

  setVictoriaSessionCookie(rawSessionToken, expiresAt);
  return { user, expiresAt };
}

export async function completeWelcome(user: VictoriaUser) {
  const sql = getSql();
  await sql`
    UPDATE victoria_users
    SET welcome_completed_at = coalesce(welcome_completed_at, now()), updated_at = now()
    WHERE id = ${user.id}::uuid
  `;
}
