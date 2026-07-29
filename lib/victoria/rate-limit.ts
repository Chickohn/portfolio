import { z } from "zod";

const rateLimitResponseSchema = z.object({
  success: z.boolean(),
});

export async function checkVictoriaRateLimit(identifier: string, limit: number, windowSeconds: number) {
  const url = process.env.VICTORIA_RATE_LIMIT_URL;
  const token = process.env.VICTORIA_RATE_LIMIT_TOKEN;

  if (!url || !token) {
    return { success: true, degraded: true };
  }

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ identifier, limit, windowSeconds }),
    cache: "no-store",
  });

  if (!response.ok) {
    return { success: true, degraded: true };
  }

  const parsed = rateLimitResponseSchema.safeParse(await response.json());
  return parsed.success ? { success: parsed.data.success, degraded: false } : { success: true, degraded: true };
}
