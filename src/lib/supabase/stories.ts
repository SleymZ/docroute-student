import type { SupabaseClient } from "@supabase/supabase-js";

import type { PublicProfile, SuccessStory } from "@/lib/stories";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const storyColumns =
  "id, user_id, title, body, purpose, from_country_code, to_country_code, moved_year, university, status, created_at, published_at";

export async function loadPublishedStories(
  supabase: Client,
  filter: { toCountryCode?: string; purpose?: string; userId?: string; limit?: number } = {},
) {
  let query = supabase
    .from("success_stories")
    .select(storyColumns)
    .eq("status", "published")
    .order("published_at", { ascending: false })
    .limit(filter.limit ?? 60);

  if (filter.toCountryCode) query = query.eq("to_country_code", filter.toCountryCode);
  if (filter.purpose) query = query.eq("purpose", filter.purpose as SuccessStory["purpose"]);
  if (filter.userId) query = query.eq("user_id", filter.userId);

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as SuccessStory[];
}

export async function loadOwnStories(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("success_stories")
    .select(storyColumns)
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as SuccessStory[];
}

export async function loadPublicProfiles(supabase: Client, userIds: string[]) {
  const ids = [...new Set(userIds)];
  if (ids.length === 0) return new Map<string, PublicProfile>();
  const { data, error } = await supabase
    .from("public_profiles")
    .select("user_id, display_name, bio, avatar_path, updated_at")
    .in("user_id", ids);
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.user_id, row as PublicProfile]));
}

export async function loadPublicProfile(supabase: Client, userId: string) {
  const { data, error } = await supabase
    .from("public_profiles")
    .select("user_id, display_name, bio, avatar_path, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as PublicProfile | null) ?? null;
}
