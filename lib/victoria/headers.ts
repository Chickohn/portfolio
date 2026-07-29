import { headers } from "next/headers";

export function privateNoStoreHeaders() {
  return {
    "Cache-Control": "private, no-store, max-age=0",
    "X-Robots-Tag": "noindex, nofollow, noarchive, nosnippet",
    "X-Content-Type-Options": "nosniff",
  };
}

export function getCurrentHost() {
  return headers().get("host");
}
