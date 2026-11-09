"use client";

import { useEffect, useState } from "react";

import { tierFromPlan, type AccessTier } from "@/lib/access";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";

export type AccessState = {
  tier: AccessTier;
  loading: boolean;
  plus: boolean;
};

// One lookup per page load, shared by every component that asks.
let cached: Promise<AccessTier> | null = null;
let listening = false;
// Mounted hooks, told about a new tier after sign-in, sign-out or an
// account switch in another tab.
const subscribers = new Set<(tier: AccessTier) => void>();

async function lookupTier(): Promise<AccessTier> {
  if (!isSupabaseConfigured()) return "guest";
  const supabase = createSupabaseBrowserClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return "guest";
  try {
    const { data: row, error } = await supabase
      .from("account_plans")
      .select("plan, plus_until")
      .eq("user_id", data.user.id)
      .maybeSingle();
    if (error) return "free";
    return tierFromPlan(row);
  } catch {
    // Table missing (migration not run yet) or offline: the Free plan.
    return "free";
  }
}

function loadTier(): Promise<AccessTier> {
  if (!cached) cached = lookupTier();
  if (!listening && isSupabaseConfigured()) {
    listening = true;
    createSupabaseBrowserClient().auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        cached = null;
        // Look up the new tier outside the auth callback, then update every
        // mounted hook.
        setTimeout(() => {
          void loadTier().then((tier) => {
            for (const notify of subscribers) notify(tier);
          });
        }, 0);
      }
    });
  }
  return cached;
}

/** Looks the plan up again and updates every mounted hook (used after a
 *  payment, while Whop's webhook switches the account to Plus). */
export async function refreshAccess(): Promise<AccessTier> {
  cached = null;
  const tier = await loadTier();
  for (const notify of subscribers) notify(tier);
  return tier;
}

/** The visitor's plan: guest, free or plus (see src/lib/access.ts). While it
 *  loads, the Free plan is shown so nothing Plus-only flashes up. */
export function useAccess(): AccessState {
  const [tier, setTier] = useState<AccessTier | null>(null);

  useEffect(() => {
    let active = true;
    const update = (value: AccessTier) => {
      if (active) setTier(value);
    };
    subscribers.add(update);
    void loadTier().then(update);
    return () => {
      active = false;
      subscribers.delete(update);
    };
  }, []);

  const shown = tier ?? "free";
  return { tier: shown, loading: tier === null, plus: shown === "plus" };
}
