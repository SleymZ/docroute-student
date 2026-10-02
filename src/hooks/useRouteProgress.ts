"use client";

import { usePersistentUserSet } from "@/hooks/usePersistentUserSet";
import type { UserSetAdapter } from "@/hooks/usePersistentUserSet";
import {
  addCompletedRouteTasks,
  loadCompletedRouteTaskIds,
  removeCompletedRouteTask,
} from "@/lib/supabase/user-memory";

const routeProgressAdapter: UserSetAdapter = {
  load: (supabase, userId, routeKey) =>
    loadCompletedRouteTaskIds(
      supabase,
      userId,
      routeKey,
    ),
  addMany: (supabase, userId, routeKey, values) =>
    addCompletedRouteTasks(
      supabase,
      userId,
      routeKey,
      values,
    ),
  remove: (supabase, userId, routeKey, value) =>
    removeCompletedRouteTask(
      supabase,
      userId,
      routeKey,
      value,
    ),
};

export function useRouteProgress(routeKey: string | null) {
  return usePersistentUserSet({
    namespace: "route-progress",
    scope: routeKey,
    adapter: routeProgressAdapter,
  });
}
