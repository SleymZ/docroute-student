import { createBrowserClient } from "@supabase/ssr";
import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";
import { getSupabaseConfig } from "./config";

let browserClient: SupabaseClient<Database> | undefined;

export function createSupabaseBrowserClient() {
  if (!browserClient) {
    const { url, publishableKey } = getSupabaseConfig();

    browserClient = createBrowserClient<Database>(url, publishableKey);
  }

  return browserClient;
}