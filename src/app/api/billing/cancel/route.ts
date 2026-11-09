import { NextResponse } from "next/server";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { whopConfig } from "@/lib/whop";
import { cancelRenewalBeforeDeletion } from "@/lib/whop-sync";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Called by "Delete my account" before anything is deleted: stops the Whop
// renewal of the signed-in person's own Plus, so nobody keeps paying for a
// deleted account. 200 = safe to delete; anything else = do not delete.
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  if (!isSupabaseConfigured()) return NextResponse.json({ result: "nothing-to-cancel" });

  const supabase = await createSupabaseServerClient();
  const { data } = await supabase.auth.getUser();
  const user = data.user;
  if (!user) return NextResponse.json({ error: "sign-in-required" }, { status: 401 });

  const { data: plan } = await supabase
    .from("account_plans")
    .select("whop_membership_id")
    .eq("user_id", user.id)
    .maybeSingle();
  const membershipId = plan?.whop_membership_id ?? null;
  if (!membershipId) return NextResponse.json({ result: "nothing-to-cancel" });

  const config = whopConfig();
  const admin = createSupabaseAdminClient();
  try {
    if (!config.apiKey || !admin) throw new Error("Whop or Supabase secret key not set");
    const result = await cancelRenewalBeforeDeletion(config, { userId: user.id, membershipId }, async (args) => {
      const { data: applied, error } = await admin.rpc("apply_whop_membership", args);
      return { data: (applied as string | null) ?? null, error: error ? { message: error.message } : null };
    });
    return NextResponse.json({ result });
  } catch (error) {
    console.error("Cancel before deletion failed", membershipId, error);
    return NextResponse.json({ error: "cancel-failed" }, { status: 502 });
  }
}
