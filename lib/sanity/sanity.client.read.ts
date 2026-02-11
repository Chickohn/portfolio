import { createClient } from "@sanity/client";
import { getSanityEnvOrThrow } from "./env";

/**
 * Read client (safe to import from server components, route handlers, etc.).
 * Never requires a write token.
 */
let _client: ReturnType<typeof createClient> | null = null;

export function getSanityReadClient() {
  if (_client) return _client;
  const sanityEnv = getSanityEnvOrThrow();
  _client = createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    useCdn: true,
    token: sanityEnv.readToken,
  });
  return _client;
}

