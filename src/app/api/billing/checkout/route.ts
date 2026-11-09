import { NextResponse } from "next/server";

import { legalInfo } from "@/data/legal";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createPlusCheckout, ordersUrl, whopConfig } from "@/lib/whop";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Signed-in visitor → a Whop checkout link for Plus, tied to the account.
// Body: { "consent": true } — the visitor agreed on /plus that Plus starts at
// once and that the 14-day withdrawal right ends when it does.
export async function POST(request: Request) {
  const config = whopConfig();
  if (!config.checkoutEnabled || !isSupabaseConfigured()) {
    return NextResponse.json({ error: "payments-off" }, { status: 503 });
  }

  // Same-site only: the page itself posts here with fetch().
  const requestUrl = new URL(request.url);
  const origin = request.headers.get("origin");
  if (origin && origin !== requestUrl.origin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }

  let consent = false;
  try {
    const body = (await request.json()) as { consent?: unknown } | null;
    consent = body?.consent === true;
  } catch {
    consent = false;
  }
  if (!consent) return NextResponse.json({ error: "consent-required" }, { status: 400 });

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ error: "sign-in-required" }, { status: 401 });

  // Someone who already pays is sent to Whop to manage it instead of a
  // second subscription.
  const { data: plan } = await supabase
    .from("account_plans")
    .select("plan, plus_until, source, whop_manage_url")
    .eq("user_id", user.id)
    .maybeSingle();
  const plusActive = plan?.plan === "plus" && (!plan.plus_until || Date.parse(plan.plus_until) > Date.now());
  if (plusActive) {
    return NextResponse.json(
      { error: "already-plus", manageUrl: plan?.source === "payment" ? plan.whop_manage_url ?? ordersUrl(config) : null },
      { status: 409 },
    );
  }

  try {
    const url = await createPlusCheckout(config, {
      userId: user.id,
      redirectUrl: `${requestUrl.origin}/plus/thanks`,
      consentAt: new Date().toISOString(),
      termsVersion: legalInfo.termsUpdated,
    });
    return NextResponse.json({ url });
  } catch (error) {
    console.error("Whop checkout failed", error);
    return NextResponse.json({ error: "checkout-failed" }, { status: 502 });
  }
}
