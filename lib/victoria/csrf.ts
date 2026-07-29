import { headers } from "next/headers";

export function assertSameOriginRequest() {
  const requestHeaders = headers();
  const origin = requestHeaders.get("origin");
  const host = requestHeaders.get("host");

  if (!origin || !host) {
    throw new Error("Missing request origin");
  }

  const originHost = new URL(origin).host;
  if (originHost !== host) {
    throw new Error("Invalid request origin");
  }
}
