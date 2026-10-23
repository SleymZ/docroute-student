import type { NextRequest } from "next/server";

import { updateSupabaseSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  return updateSupabaseSession(request);
}

export const config = {
  matcher: [
    // Image lookup APIs are public and cached; they never need a session
    // refresh, so they skip the Supabase round trip.
    "/((?!_next/static|_next/image|favicon.ico|api/university-image|api/country-image|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
