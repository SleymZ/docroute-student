import type { SupabaseClient } from "@supabase/supabase-js";

import {
  STORY_PHOTO_BUCKET,
  STORY_PHOTO_URL_SECONDS,
  type PublicProfile,
  type StoryComment,
  type StoryEngagement,
  type StoryPhoto,
  type SuccessStory,
} from "@/lib/stories";
import type { Database } from "@/types/database";

type Client = SupabaseClient<Database>;

const storyColumns =
  "id, user_id, title, body, purpose, from_country_code, to_country_code, moved_year, university, status, created_at, updated_at, published_at";

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

// Every story in one status, newest first. Only moderators get rows for
// other people's pending or hidden stories (RLS).
export const reviewPageSize = 30;

export async function loadStoriesForReview(
  supabase: Client,
  status: SuccessStory["status"],
  page = 1,
) {
  const from = (page - 1) * reviewPageSize;
  const { data, error, count } = await supabase
    .from("success_stories")
    .select(storyColumns, { count: "exact" })
    .eq("status", status)
    .order(status === "published" ? "published_at" : "created_at", { ascending: false })
    .order("id")
    .range(from, from + reviewPageSize - 1);
  if (error) throw error;
  return { stories: (data ?? []) as SuccessStory[], total: count ?? 0 };
}

export async function countPendingStories(supabase: Client) {
  const { count, error } = await supabase
    .from("success_stories")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

export async function isStoryModerator(supabase: Client) {
  const { data, error } = await supabase.rpc("is_story_moderator");
  if (error) return false;
  return data === true;
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

export async function loadStory(supabase: Client, storyId: string) {
  const { data, error } = await supabase
    .from("success_stories")
    .select(storyColumns)
    .eq("id", storyId)
    .maybeSingle();
  if (error) throw error;
  return (data as SuccessStory | null) ?? null;
}

// Photos the reader may see (RLS: the story must be visible to them), with
// signed URLs that expire after STORY_PHOTO_URL_SECONDS. A photo whose URL
// could not be signed keeps url: null, so the review page can refuse to
// publish a story whose photos the moderator has not seen.
export async function loadStoryPhotos(supabase: Client, storyIds: string[]) {
  const result = new Map<string, StoryPhoto[]>();
  const ids = [...new Set(storyIds)];
  if (ids.length === 0) return result;
  const { data, error } = await supabase
    .from("story_photos")
    .select("id, story_id, user_id, path, created_at")
    .in("story_id", ids)
    .order("created_at")
    .order("id");
  if (error) throw error;
  const rows = data ?? [];
  if (rows.length === 0) return result;

  const { data: signed } = await supabase.storage
    .from(STORY_PHOTO_BUCKET)
    .createSignedUrls(
      rows.map((row) => row.path),
      STORY_PHOTO_URL_SECONDS,
    );
  const urls = new Map(
    (signed ?? []).map((item) => [item.path, item.error ? null : item.signedUrl]),
  );
  for (const row of rows) {
    const list = result.get(row.story_id) ?? [];
    list.push({ ...row, url: urls.get(row.path) ?? null });
    result.set(row.story_id, list);
  }
  return result;
}

// Like and published-comment counts for published stories.
export async function loadEngagement(supabase: Client, storyIds: string[]) {
  const result = new Map<string, StoryEngagement>();
  const ids = [...new Set(storyIds)].slice(0, 100);
  if (ids.length === 0) return result;
  const { data, error } = await supabase.rpc("story_engagement", { p_story_ids: ids });
  if (error) throw error;
  for (const row of data ?? []) {
    result.set(row.story_id, { likes: Number(row.likes), comments: Number(row.comments) });
  }
  return result;
}

const commentColumns = "id, story_id, user_id, body, status, created_at, published_at";

// Comments on one story the reader may see: published ones, their own
// pending ones, and (for moderators) all of them.
export async function loadComments(supabase: Client, storyId: string) {
  const { data, error } = await supabase
    .from("story_comments")
    .select(commentColumns)
    .eq("story_id", storyId)
    .order("created_at")
    .order("id")
    .limit(500);
  if (error) throw error;
  return (data ?? []) as StoryComment[];
}

export async function hasLiked(supabase: Client, storyId: string, userId: string) {
  const { data, error } = await supabase
    .from("story_likes")
    .select("story_id")
    .eq("story_id", storyId)
    .eq("user_id", userId)
    .maybeSingle();
  if (error) return false;
  return Boolean(data);
}

export async function loadCommentsForReview(
  supabase: Client,
  status: StoryComment["status"],
  page = 1,
) {
  const from = (page - 1) * reviewPageSize;
  const { data, error, count } = await supabase
    .from("story_comments")
    .select(commentColumns, { count: "exact" })
    .eq("status", status)
    .order("created_at", { ascending: false })
    .order("id")
    .range(from, from + reviewPageSize - 1);
  if (error) throw error;
  return { comments: (data ?? []) as StoryComment[], total: count ?? 0 };
}

export async function countPendingComments(supabase: Client) {
  const { count, error } = await supabase
    .from("story_comments")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  if (error) throw error;
  return count ?? 0;
}

// Titles of the stories the comments belong to (moderators see every story).
export async function loadStoryTitles(supabase: Client, storyIds: string[]) {
  const ids = [...new Set(storyIds)];
  if (ids.length === 0) return new Map<string, string>();
  const { data, error } = await supabase
    .from("success_stories")
    .select("id, title")
    .in("id", ids);
  if (error) throw error;
  return new Map((data ?? []).map((row) => [row.id, row.title]));
}
