import { createClient } from "@sanity/client";
import { getSanityEnvOrThrow } from "./env";

/**
 * Write client for Node scripts (tsx).
 *
 * IMPORTANT:
 * - Do NOT import this into client components.
 * - This exists because `import "server-only"` is a Next.js bundler marker and
 *   will throw when executed directly under Node (e.g. migration scripts).
 */
export function getSanityWriteClientNode() {
  const sanityEnv = getSanityEnvOrThrow();
  return createClient({
    projectId: sanityEnv.projectId,
    dataset: sanityEnv.dataset,
    apiVersion: sanityEnv.apiVersion,
    useCdn: false,
    token: sanityEnv.writeToken,
  });
}

