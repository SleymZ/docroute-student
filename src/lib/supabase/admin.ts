import { createClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

/**
 * Server-only Supabase client with the project's secret key. Used only by
 * the Whop webhook to call apply_whop_membership(), which nobody else may
 * run. The key lives in Vercel as SUPABASE_SECRET_KEY (a `sb_secret_…` key,
 * or the older service_role key) and must never get a NEXT_PUBLIC_ name.
 * Returns null when the key is missing.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY?.trim() || process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) return null;
  return createClient<Database>(url, key, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
}
