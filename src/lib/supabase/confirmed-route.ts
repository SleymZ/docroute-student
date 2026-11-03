import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConfirmedRoute, ConfirmedRouteInput } from "@/lib/confirmed-route";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;
type Row = Database["public"]["Tables"]["confirmed_routes"]["Row"];

const columns =
  "user_id, route_path, route_key, title, purpose, country_code, step_ids, confirmed_at, updated_at";

function fromRow(row: Row): ConfirmedRoute {
  return {
    routePath: row.route_path,
    routeKey: row.route_key,
    title: row.title,
    purpose: row.purpose,
    countryCode: row.country_code,
    stepIds: row.step_ids ?? [],
    confirmedAt: row.confirmed_at,
    updatedAt: row.updated_at,
  };
}

export async function loadConfirmedRoute(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("confirmed_routes")
    .select(columns)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return data ? fromRow(data as Row) : null;
}

/** Confirms a route (replacing any earlier one) or saves the same route again
 *  with its new address. The database sets the dates. */
export async function saveConfirmedRoute(
  supabase: Client,
  userId: string,
  route: ConfirmedRouteInput,
) {
  const { data, error } = await supabase
    .from("confirmed_routes")
    .upsert(
      {
        user_id: userId,
        route_path: route.routePath,
        route_key: route.routeKey,
        title: route.title,
        purpose: route.purpose,
        country_code: route.countryCode,
        step_ids: route.stepIds,
      },
      { onConflict: "user_id" },
    )
    .select(columns)
    .single();
  if (error) throw error;
  return fromRow(data as Row);
}

export async function removeConfirmedRoute(supabase: Client, userId: string) {
  const { error } = await supabase.from("confirmed_routes").delete().eq("user_id", userId);
  if (error) throw error;
}

/** Ticks that belong to the confirmed checklist (ticks for steps that are
 *  not in it, e.g. from another citizenship on the same guide, are left out). */
export async function countCompletedSteps(
  supabase: Client,
  userId: string,
  routeKey: string,
  stepIds: string[],
) {
  if (stepIds.length === 0) return 0;
  const { data, error } = await supabase
    .from("route_task_progress")
    .select("task_id")
    .eq("user_id", userId)
    .eq("route_key", routeKey);
  if (error) throw error;
  const steps = new Set(stepIds);
  return new Set((data ?? []).map((row) => row.task_id).filter((id) => steps.has(id))).size;
}
