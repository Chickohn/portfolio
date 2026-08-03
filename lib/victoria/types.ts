export type VictoriaUsername = "freddie" | "victoria";
export type VictoriaRole = "owner" | "member";

export type VictoriaUser = {
  id: string;
  username: VictoriaUsername;
  displayName: string;
  role: VictoriaRole;
  welcomeCompletedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type VictoriaDevice = {
  id: string;
  userId: string;
  label: string;
  browserFamily: string;
  osFamily: string;
  claimedAt: string;
  lastSeenAt: string;
  revokedAt: string | null;
};

export type VictoriaSession = {
  user: VictoriaUser;
  device: VictoriaDevice;
  sessionId: string;
  expiresAt: string;
};

export type VictoriaMessage = {
  id: string;
  authorUserId: string;
  authorUsername: VictoriaUsername;
  authorDisplayName: string;
  body: string;
  createdAt: string;
};

export type VictoriaCountdownSettings = {
  label: string;
  targetAt: string;
  timezone: string;
};

export type VictoriaMinigameScoreRow = {
  username: VictoriaUsername;
  displayName: string;
  highScore: number;
};

export type VictoriaAdminHideType = "message" | "media" | "memory" | "milestone" | "plan";

export type VictoriaAdminUserRow = {
  username: VictoriaUsername;
  displayName: string;
  welcomeCompletedAt: string | null;
  lastSeenAt: string | null;
};

export type VictoriaAdminPageViewRow = {
  id: string;
  username: VictoriaUsername;
  deviceLabel: string;
  browserFamily: string;
  osFamily: string;
  createdAt: string;
};

export type VictoriaAdminVisitRow = {
  day: string;
  count: number;
};

export type VictoriaAdminContentRow = {
  id: string;
  preview: string;
  authorUsername: VictoriaUsername;
  createdAt: string;
  hiddenAt: string | null;
  meta?: string | null;
};

/** Shape-compatible with the static VictoriaMemory in lib/victoria/content.ts,
 * so the client can merge hand-authored and user-created memories into one list. */
export type VictoriaUserMemory = {
  id: string;
  title: string;
  date: string;
  body: string;
};

export const victoriaActivityEventTypes = [
  "page_view",
  "session_started",
  "message_sent",
  "memory_viewed",
  "easter_egg_found",
  "gallery_opened",
  "welcome_completed",
] as const;

export type VictoriaActivityEventType = (typeof victoriaActivityEventTypes)[number];
