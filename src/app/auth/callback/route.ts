import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";

import { getLocale } from "@/i18n/server";
import { welcomeNewAccount } from "@/lib/mailer";
import { safeNextPath } from "@/lib/safe-next-path";
import { getSiteUrl } from "@/lib/site-url";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const next = safeNextPath(url.searchParams.get("next"));
  const code = url.searchParams.get("code");
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const supabase = await createSupabaseServerClient();

  let error: Error | null = null;

  if (code) {
    const result = await supabase.auth.exchangeCodeForSession(code);
    error = result.error;
  } else if (tokenHash && type) {
    const result = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type,
    });
    error = result.error;
  } else {
    error = new Error("The authentication link is incomplete.");
  }

  if (error) {
    const redirectUrl = new URL("/auth", url.origin);
    redirectUrl.searchParams.set("mode", "login");
    redirectUrl.searchParams.set("error", error.message);
    return NextResponse.redirect(redirectUrl);
  }

  // First sign-in of a new account (Google, or the link in the confirmation
  // email): send the welcome email once. Failures never block the sign-in.
  await welcomeNewAccount(supabase, await getLocale(), getSiteUrl());

  return NextResponse.redirect(new URL(next, url.origin));
}