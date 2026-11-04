import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";
import { hasAuthCookie, VISITED_COOKIE, VISITED_MAX_AGE } from "@/lib/visited";

export async function proxy(request: NextRequest) {
  // The entry page is for first visits only (owner decision 2026-11-04):
  // anyone who has been here before or is signed in goes straight to the
  // site. The check reads cookies only, so it costs no network call.
  if (request.nextUrl.pathname === "/") {
    const cookies = request.cookies.getAll().map((cookie) => cookie.name);
    if (cookies.includes(VISITED_COOKIE) || hasAuthCookie(cookies)) {
      const url = request.nextUrl.clone();
      url.pathname = "/home";
      return NextResponse.redirect(url);
    }
  }

  const response = await updateSupabaseSession(request);
  if (!request.cookies.has(VISITED_COOKIE)) {
    response.cookies.set(VISITED_COOKIE, "1", {
      path: "/",
      maxAge: VISITED_MAX_AGE,
      sameSite: "lax",
      httpOnly: true,
      secure: request.nextUrl.protocol === "https:",
    });
  }
  return response;
}

export const config = {
  matcher: [
    // Image lookup APIs are public and cached; they never need a session
    // refresh, so they skip the Supabase round trip.
    "/((?!_next/static|_next/image|favicon.ico|api/university-image|api/country-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
