import { NextResponse, type NextRequest } from "next/server";

import { VICTORIA_COOKIE_NAME } from "@/lib/victoria/constants";

/**
 * Redirect cookie-less requests away from the private pages before rendering.
 *
 * app/victoria/loading.tsx gives the route a Suspense boundary, which means Next
 * starts streaming — and commits HTTP 200 — before the page component runs. The
 * `redirect()` in requireVictoriaSession() is then delivered inside the RSC
 * payload and applied by the client. No private content is exposed either way,
 * but a real 307 is the stronger and more honest answer, and it also means an
 * unauthenticated request costs zero database work.
 *
 * This is a cheap presence check, not authentication: any request that does carry
 * the cookie still goes through full server-side validation in
 * validateVictoriaSession(). Deliberately scoped to the two pages that require a
 * session — /victoria/access, /victoria/claim/*, /victoria/dev-login and
 * /victoria/logout must stay reachable without one.
 */
export function middleware(request: NextRequest) {
  if (request.cookies.has(VICTORIA_COOKIE_NAME)) {
    return NextResponse.next();
  }

  // Middleware redirects must carry an absolute URL — a relative Location is
  // rejected by the pipeline. Clone nextUrl so the origin comes from the request
  // (behind `next start -H 127.0.0.1` that reports as localhost, which resolves
  // to the same host; in deployment it follows the real Host header).
  const url = request.nextUrl.clone();
  url.pathname = "/victoria/access";
  url.search = "";
  return NextResponse.redirect(url, 307);
}

export const config = {
  matcher: ["/victoria", "/victoria/admin/:path*"],
};
