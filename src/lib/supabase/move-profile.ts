import type { SupabaseClient } from "@supabase/supabase-js";

import { parseMatchAnswers, type MatchAnswers } from "@/lib/country-match-answers";
import type { Database, Json } from "@/types/database";

// The move profile: the country match answers (table move_profiles, one
// row per account, readable and writable only by its owner through RLS).

export type SavedMoveProfile = { answers: MatchAnswers; updatedAt: string };

/** The saved answers, or null when there are none (or they no longer pass
 *  the check, for example after a change of the quiz). Throws when the
 *  table cannot be read. */
export async function loadMoveProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<SavedMoveProfile | null> {
  const { data, error } = await supabase
    .from("move_profiles")
    .select("answers, updated_at")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  const answers = parseMatchAnswers(data.answers);
  return answers ? { answers, updatedAt: data.updated_at } : null;
}

export async function saveMoveProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  answers: MatchAnswers,
) {
  const { error } = await supabase.from("move_profiles").upsert(
    {
      user_id: userId,
      purpose: answers.purpose,
      answers: answers as unknown as Json,
      answers_version: answers.version,
    },
    { onConflict: "user_id" },
  );
  if (error) throw error;
}

export async function deleteMoveProfile(supabase: SupabaseClient<Database>, userId: string) {
  const { error } = await supabase.from("move_profiles").delete().eq("user_id", userId);
  if (error) throw error;
}
