"use client";

import { usePersistentUserSet } from "@/hooks/usePersistentUserSet";
import type { UserSetAdapter } from "@/hooks/usePersistentUserSet";
import {
  addSavedUniversities,
  loadSavedUniversityIds,
  removeSavedUniversity,
} from "@/lib/supabase/user-memory";

const savedUniversitiesAdapter: UserSetAdapter = {
  load: (supabase, userId) =>
    loadSavedUniversityIds(supabase, userId),
  addMany: (supabase, userId, _scope, values) =>
    addSavedUniversities(supabase, userId, values),
  remove: (supabase, userId, _scope, value) =>
    removeSavedUniversity(supabase, userId, value),
};

export function useSavedUniversities() {
  return usePersistentUserSet({
    namespace: "saved-universities",
    scope: "all",
    adapter: savedUniversitiesAdapter,
  });
}
