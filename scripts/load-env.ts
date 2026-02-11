import path from "node:path";
import { existsSync } from "node:fs";

import dotenv from "dotenv";

/**
 * Load env vars for Node-run scripts (tsx).
 *
 * Next.js automatically loads `.env*` files for `next dev/build`,
 * but plain Node does not — so migration/backup scripts must load env themselves.
 */
export function loadEnvForScripts() {
  const root = path.resolve(__dirname, "..");
  const candidates = [".env.local", ".env"];

  for (const filename of candidates) {
    const fullPath = path.join(root, filename);
    if (existsSync(fullPath)) {
      dotenv.config({ path: fullPath });
    }
  }
}

