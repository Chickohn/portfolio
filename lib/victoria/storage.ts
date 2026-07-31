import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { VICTORIA_SIGNED_URL_TTL_SECONDS } from "./constants";

const globalForVictoriaStorage = globalThis as typeof globalThis & {
  victoriaSupabase?: SupabaseClient;
};

/**
 * One client per process. This used to be constructed inside
 * createPrivateSignedUrl, so rendering /victoria built a brand-new Supabase
 * client — and its auth/fetch plumbing — once per image on the page.
 */
function getSupabaseAdmin() {
  if (globalForVictoriaStorage.victoriaSupabase) {
    return globalForVictoriaStorage.victoriaSupabase;
  }

  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase storage env vars are required");
  }

  globalForVictoriaStorage.victoriaSupabase = createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
  return globalForVictoriaStorage.victoriaSupabase;
}

export function getVictoriaBucket() {
  const bucket = process.env.VICTORIA_STORAGE_BUCKET;
  if (!bucket) {
    throw new Error("VICTORIA_STORAGE_BUCKET is required");
  }
  return bucket;
}

export async function uploadPrivateObject(storageKey: string, body: Buffer, contentType: string) {
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.storage
    .from(getVictoriaBucket())
    .upload(storageKey, body, { contentType, upsert: false });

  if (error) {
    throw new Error("Private media upload failed");
  }
}

export async function createPrivateSignedUrl(storageKey: string) {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(getVictoriaBucket())
    .createSignedUrl(storageKey, VICTORIA_SIGNED_URL_TTL_SECONDS);

  if (error || !data?.signedUrl) {
    throw new Error("Signed URL generation failed");
  }

  return data.signedUrl;
}

/**
 * Sign many keys in one request instead of one request per key.
 *
 * Returns a key -> URL map, omitting anything that failed to sign so a single
 * missing object cannot blank the whole page. Keys that are absent from the map
 * should simply not be rendered.
 */
export async function createPrivateSignedUrls(storageKeys: readonly string[]) {
  const signed = new Map<string, string>();
  if (storageKeys.length === 0) {
    return signed;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(getVictoriaBucket())
    .createSignedUrls(storageKeys as string[], VICTORIA_SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    return signed;
  }

  for (const entry of data) {
    if (entry.path && entry.signedUrl && !entry.error) {
      signed.set(entry.path, entry.signedUrl);
    }
  }

  return signed;
}
