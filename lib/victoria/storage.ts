import { createClient } from "@supabase/supabase-js";

import { VICTORIA_SIGNED_URL_TTL_SECONDS } from "./constants";

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase storage env vars are required");
  }

  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
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
