import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import type { Database } from "@/types/database";
import { getSupabaseConfig, isSupabaseConfigured } from "./config";

export type SessionResult = {
  response: NextResponse;
  /** null when Supabase is not configured or could not be reached. */
  signedIn: boolean | null;
};

export async function updateSupabaseSession(request: NextRequest): Promise<SessionResult> {
  if (!isSupabaseConfigured()) {
    return { response: NextResponse.next({ request }), signedIn: null };
  }

  const { url, publishableKey } = getSupabaseConfig();
  let response = NextResponse.next({ request });

  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        response = NextResponse.next({ request });

        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  let signedIn: boolean | null = null;
  try {
    // Refreshes an expiring session cookie. A paused or unreachable
    // Supabase project must not turn every page into an error.
    const { data, error } = await supabase.auth.getClaims();
    // A network failure says nothing about the visitor (null); any other
    // error means the session is gone.
    signedIn = error ? (error.name === "AuthRetryableFetchError" ? null : false) : Boolean(data?.claims?.sub);
  } catch (error) {
    console.error("Could not refresh the Supabase session:", error);
  }

  return { response, signedIn };
}
