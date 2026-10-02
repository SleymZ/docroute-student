import type { SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/database";

export async function loadSavedUniversityIds(
  supabase: SupabaseClient<Database>,
  userId: string,
) {
  const { data, error } = await supabase
    .from("saved_universities")
    .select("university_id")
    .eq("user_id", userId);

  if (error) {
    throw error;
  }

  return data.map((row) => row.university_id);
}

export async function addSavedUniversities(
  supabase: SupabaseClient<Database>,
  userId: string,
  universityIds: string[],
) {
  if (universityIds.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("saved_universities")
    .upsert(
      universityIds.map((universityId) => ({
        user_id: userId,
        university_id: universityId,
      })),
      {
        onConflict: "user_id,university_id",
        ignoreDuplicates: true,
      },
    );

  if (error) {
    throw error;
  }
}

export async function removeSavedUniversity(
  supabase: SupabaseClient<Database>,
  userId: string,
  universityId: string,
) {
  const { error } = await supabase
    .from("saved_universities")
    .delete()
    .eq("user_id", userId)
    .eq("university_id", universityId);

  if (error) {
    throw error;
  }
}

export async function loadCompletedRouteTaskIds(
  supabase: SupabaseClient<Database>,
  userId: string,
  routeKey: string,
) {
  const { data, error } = await supabase
    .from("route_task_progress")
    .select("task_id")
    .eq("user_id", userId)
    .eq("route_key", routeKey);

  if (error) {
    throw error;
  }

  return data.map((row) => row.task_id);
}

export async function addCompletedRouteTasks(
  supabase: SupabaseClient<Database>,
  userId: string,
  routeKey: string,
  taskIds: string[],
) {
  if (taskIds.length === 0) {
    return;
  }

  const { error } = await supabase
    .from("route_task_progress")
    .upsert(
      taskIds.map((taskId) => ({
        user_id: userId,
        route_key: routeKey,
        task_id: taskId,
      })),
      {
        onConflict: "user_id,route_key,task_id",
        ignoreDuplicates: true,
      },
    );

  if (error) {
    throw error;
  }
}

export async function removeCompletedRouteTask(
  supabase: SupabaseClient<Database>,
  userId: string,
  routeKey: string,
  taskId: string,
) {
  const { error } = await supabase
    .from("route_task_progress")
    .delete()
    .eq("user_id", userId)
    .eq("route_key", routeKey)
    .eq("task_id", taskId);

  if (error) {
    throw error;
  }
}
