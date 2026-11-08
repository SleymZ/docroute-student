import { NextResponse } from "next/server";

import { getLocale } from "@/i18n/server";
import { welcomeNewAccount } from "@/lib/mailer";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

// Email sign-up that returns a session at once (no confirmation step) calls
// this right after; the email is sent only for a new, signed-in account.
export async function POST() {
  const supabase = await createSupabaseServerClient();
  await welcomeNewAccount(supabase, await getLocale(), getSiteUrl());
  return new NextResponse(null, { status: 204 });
}
