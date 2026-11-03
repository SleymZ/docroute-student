import type { SupabaseClient } from "@supabase/supabase-js";

import type { ConfirmedRoute, ConfirmedRouteInput } from "@/lib/confirmed-route";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;
type Row = Database["public"]["Tables"]["confirmed_routes"]["Row"];

const columns =
  "user_id, route_path, route_key, title, purpose, country_code, total_steps, confirmed_at, updated_at";

function fromRow(row: Row): ConfirmedRoute {
  return {
    routePath: row.route_path,
    routeKey: row.route_key,
    title: row.title,
    purpose: row.purpose,
    countryCode: row.country_code,
    totalSteps: row.total_steps,
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
        total_steps: route.totalSteps,
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

export async function countCompletedSteps(supabase: Client, userId: string, routeKey: string) {
  const { count, error } = await supabase
    .from("route_task_progress")
    .select("task_id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("route_key", routeKey);
  if (error) throw error;
  return count ?? 0;
}
