export type SanityEnv = {
  projectId: string;
  dataset: string;
  apiVersion: string;
  readToken?: string;
  writeToken?: string;
};

/**
 * Returns Sanity env config if minimally configured, otherwise `null`.
 * This allows the public site to keep working with hard-coded fallback
 * even before Sanity env vars are added.
 */
export function getSanityEnv(): SanityEnv | null {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
  if (!projectId || !dataset) return null;

  return {
    projectId,
    dataset,
    apiVersion: process.env.SANITY_API_VERSION || "2024-01-01",
    readToken: process.env.SANITY_API_READ_TOKEN,
    writeToken: process.env.SANITY_API_WRITE_TOKEN,
  };
}

export function getSanityEnvOrThrow(): SanityEnv {
  const env = getSanityEnv();
  if (!env) {
    throw new Error("Sanity env is not configured (NEXT_PUBLIC_SANITY_PROJECT_ID / NEXT_PUBLIC_SANITY_DATASET).");
  }
  return env;
}

