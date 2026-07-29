import { z } from "zod";

const serverEnvSchema = z.object({
  DATABASE_URL: z.string().url(),
  VICTORIA_SESSION_SECRET: z.string().min(32),
  VICTORIA_TOKEN_HASH_SECRET: z.string().min(32),
  VICTORIA_FEATURE_ENABLED: z.string().optional(),
  VICTORIA_ALLOWED_HOSTS: z.string().optional(),
  VICTORIA_SESSION_DAYS: z.string().optional(),
  VICTORIA_ANALYTICS_RETENTION_DAYS: z.string().optional(),
  VICTORIA_ABLY_API_KEY: z.string().optional(),
  SUPABASE_URL: z.string().url().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  VICTORIA_STORAGE_BUCKET: z.string().optional(),
  VICTORIA_UPLOAD_MAX_BYTES: z.string().optional(),
  NEXT_PUBLIC_SITE_URL: z.string().url().optional(),
  VERCEL_ENV: z.string().optional(),
  VERCEL_URL: z.string().optional(),
});

export function getVictoriaEnv() {
  return serverEnvSchema.parse(process.env);
}

export function getOptionalVictoriaEnv() {
  return serverEnvSchema.partial().safeParse(process.env);
}

export function isVictoriaFeatureEnabled(host?: string | null) {
  const env = getOptionalVictoriaEnv();
  const values = env.success ? env.data : process.env;
  if (values.VICTORIA_FEATURE_ENABLED === "true") {
    return true;
  }

  if (values.VERCEL_ENV === "preview") {
    return false;
  }

  const allowedHosts = (values.VICTORIA_ALLOWED_HOSTS ?? "kohn.me.uk,localhost,127.0.0.1")
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);

  if (!host) {
    return process.env.NODE_ENV !== "production";
  }

  const hostWithoutPort = host.split(":")[0]?.toLowerCase();
  return Boolean(hostWithoutPort && allowedHosts.includes(hostWithoutPort));
}

export function getSessionLifetimeDays() {
  return Number(process.env.VICTORIA_SESSION_DAYS ?? 90);
}

export function getAnalyticsRetentionDays() {
  return Number(process.env.VICTORIA_ANALYTICS_RETENTION_DAYS ?? 180);
}

export function getUploadMaxBytes() {
  return Number(process.env.VICTORIA_UPLOAD_MAX_BYTES ?? 10 * 1024 * 1024);
}
