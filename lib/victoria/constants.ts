export const VICTORIA_COOKIE_NAME = "victoria_session";
export const VICTORIA_CSRF_COOKIE_NAME = "victoria_csrf";
export const VICTORIA_LEGACY_COOKIE_NAMES = ["__Host-victoria_session", "__Host-victoria_csrf"] as const;
export const VICTORIA_COOKIE_PATH = "/";

export const OFFICIAL_RELATIONSHIP_DATE = "2026-07-11";
export const DEFAULT_COUNTDOWN_TARGET_ISO = "2026-09-18T15:00:00.000Z";
export const DEFAULT_COUNTDOWN_TIMEZONE = "Europe/London";

export const VICTORIA_MESSAGE_LIMIT = 10000;
export const VICTORIA_PAGE_SIZE = 30;
/**
 * Media <img> tags are lazily loaded, so a URL may not be requested until the
 * reader scrolls to it — potentially long after the page was rendered. A 5-minute
 * TTL meant below-the-fold images failed for anyone reading slowly. One hour
 * covers a realistic session while keeping the URL short-lived enough to be
 * useless if it leaks.
 */
export const VICTORIA_SIGNED_URL_TTL_SECONDS = 60 * 60;
