import "server-only";

import { createClient } from "@sanity/client";
import { getSanityEnvOrThrow } from "./env";

/**
 * Write client (SERVER ONLY).
 *
 * IMPORTANT:
 * - This file must never be imported into client components.
 * - It uses `SANITY_API_WRITE_TOKEN` which must never be exposed to the browser.
 */
let _client: ReturnType<typeof createClient> | null = null;

export function getSanityWriteClient() {
  if (_client) return _client;
  const sanityEnv = getSanityEnvOrThrow();
  _client = createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    useCdn: false,
    token: sanityEnv.writeToken,
  });
  return _client;
}

