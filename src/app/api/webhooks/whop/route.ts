import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { verifyWhopWebhook, WebhookSignatureError, whopConfig } from "@/lib/whop";
import { syncWhopEvent } from "@/lib/whop-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Whop → DocRoute. Register https://<site>/api/webhooks/whop in the Whop
// dashboard (Developer → Webhooks) with the membership, payment, refund and
// dispute events. 2xx = done; 5xx makes Whop retry (up to ~3 days).
export async function POST(request: Request) {
  const config = whopConfig();
  if (!config.webhookSecret || !config.apiKey) {
    console.error("Whop webhook: WHOP_WEBHOOK_SECRET or WHOP_API_KEY is not set");
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  const payload = await request.text();
  let event;
  try {
    event = verifyWhopWebhook(payload, request.headers, config.webhookSecret);
  } catch (error) {
    if (error instanceof WebhookSignatureError) {
      console.warn("Whop webhook rejected:", error.message);
      return NextResponse.json({ error: "invalid signature" }, { status: 401 });
    }
    throw error;
  }

  const admin = createSupabaseAdminClient();
  if (!admin) {
    console.error("Whop webhook: SUPABASE_SECRET_KEY is not set");
    return NextResponse.json({ error: "not configured" }, { status: 503 });
  }

  try {
    const result = await syncWhopEvent(config, event, async (args) => {
      const { data, error } = await admin.rpc("apply_whop_membership", args);
      return { data: (data as string | null) ?? null, error: error ? { message: error.message } : null };
    });
    // No account id in the logs: the membership id is enough to trace it.
    const summary = result.outcome === "applied" ? `${result.membershipId} → ${result.result}` : result.reason;
    console.info("Whop webhook", event.type, event.id, summary);
    return NextResponse.json({ ok: true, outcome: result.outcome });
  } catch (error) {
    console.error("Whop webhook failed", event.type, event.id, error);
    return NextResponse.json({ error: "failed" }, { status: 500 });
  }
}
