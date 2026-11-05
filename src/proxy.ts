import { NextResponse, type NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";
import { needsAccount, signUpHref } from "@/lib/access";
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

  const { response, signedIn } = await updateSupabaseSession(request);

  // Guests browse universities and stories; building a route needs an
  // account (owner decision 2026-11-05, docs/ACCESS.md). Send them straight
  // to sign-up and back to the same page afterwards. Without a reachable
  // Supabase (signedIn null) nothing is blocked.
  if (signedIn === false && needsAccount(request.nextUrl.pathname)) {
    const url = request.nextUrl.clone();
    const target = new URL(signUpHref(`${request.nextUrl.pathname}${request.nextUrl.search}`), url);
    const redirect = NextResponse.redirect(target);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    if (!request.cookies.has(VISITED_COOKIE)) {
      redirect.cookies.set(VISITED_COOKIE, "1", {
        path: "/",
        maxAge: VISITED_MAX_AGE,
        sameSite: "lax",
        httpOnly: true,
        secure: request.nextUrl.protocol === "https:",
      });
    }
    return redirect;
  }
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
