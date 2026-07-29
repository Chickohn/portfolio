import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";

const TOKEN_BYTES = 32;

export function createRawToken() {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function hashVictoriaToken(rawToken: string, purpose: "claim" | "session" | "csrf") {
  const secret = process.env.VICTORIA_TOKEN_HASH_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error("VICTORIA_TOKEN_HASH_SECRET must be at least 32 characters");
  }

  return createHmac("sha256", secret).update(`${purpose}:${rawToken}`).digest("hex");
}

export function constantTimeEqualHex(left: string, right: string) {
  const leftBuffer = Buffer.from(left, "hex");
  const rightBuffer = Buffer.from(right, "hex");

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return timingSafeEqual(leftBuffer, rightBuffer);
}
