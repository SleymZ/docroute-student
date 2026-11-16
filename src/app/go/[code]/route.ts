import { NextResponse, type NextRequest } from "next/server";

import { LOCALE_COOKIE, LOCALE_MAX_AGE } from "@/i18n/config";
import {
  SHORT_LINK_TARGET,
  isPreviewFetch,
  parseShortLink,
  shortLinkDestination,
} from "@/lib/short-links";
import { getSupabaseConfig, isSupabaseConfigured } from "@/lib/supabase/config";

// Counting must not hold the visitor up: give the database a moment, then go.
const COUNT_TIMEOUT_MS = 1500;

async function countClick(code: string) {
  if (!isSupabaseConfigured()) return;
  const { url, publishableKey } = getSupabaseConfig();
  try {
    await fetch(`${url}/rest/v1/rpc/count_link_click`, {
      method: "POST",
      headers: { apikey: publishableKey, "Content-Type": "application/json" },
      body: JSON.stringify({ p_code: code }),
      signal: AbortSignal.timeout(COUNT_TIMEOUT_MS),
      cache: "no-store",
    });
  } catch {
    // A failed count never blocks the visit.
  }
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const link = parseShortLink(code);
  if (!link) {
    return NextResponse.redirect(new URL(SHORT_LINK_TARGET, request.url), 307);
  }
  if (!isPreviewFetch(request.headers.get("user-agent"), request.method)) {
    await countClick(link.code);
  }
  const response = NextResponse.redirect(new URL(shortLinkDestination(link), request.url), 307);
  response.headers.set("Cache-Control", "no-store");
  // A Russian link opens the site in Russian, unless the visitor already
  // picked a language.
  if (!request.cookies.has(LOCALE_COOKIE)) {
    response.cookies.set(LOCALE_COOKIE, link.locale, {
      path: "/",
      maxAge: LOCALE_MAX_AGE,
      sameSite: "lax",
      secure: request.nextUrl.protocol === "https:",
    });
  }
  return response;
}
