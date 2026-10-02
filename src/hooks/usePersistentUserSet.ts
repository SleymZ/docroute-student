"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import {
  readStoredSet,
  removeStoredSet,
  writeStoredSet,
} from "@/lib/user-memory-storage";
import type { Database } from "@/types/database";

export type UserSetAdapter = {
  load: (
    supabase: SupabaseClient<Database>,
    userId: string,
    scope: string,
  ) => Promise<string[]>;
  addMany: (
    supabase: SupabaseClient<Database>,
    userId: string,
    scope: string,
    values: string[],
  ) => Promise<void>;
  remove: (
    supabase: SupabaseClient<Database>,
    userId: string,
    scope: string,
    value: string,
  ) => Promise<void>;
};

type PersistentUserSetOptions = {
  namespace: string;
  scope: string | null;
  adapter: UserSetAdapter;
};

function storageKey(
  namespace: string,
  scope: string,
  identity: string,
) {
  return `docroute:${namespace}:v1:${encodeURIComponent(
    scope,
  )}:${identity}`;
}

function mergeSets(...sets: ReadonlySet<string>[]) {
  return new Set(sets.flatMap((set) => [...set]));
}

function errorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return "Could not sync this information.";
}

export function usePersistentUserSet({
  namespace,
  scope,
  adapter,
}: PersistentUserSetOptions) {
  const [values, setValues] = useState<Set<string>>(
    () => new Set(),
  );
  const [loading, setLoading] = useState(Boolean(scope));
  const [pendingWrites, setPendingWrites] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [signedIn, setSignedIn] = useState(false);

  const valuesRef = useRef(values);
  const userIdRef = useRef<string | null>(null);
  const clientRef =
    useRef<SupabaseClient<Database> | null>(null);
  const activeStorageKeyRef = useRef<string | null>(null);
  const generationRef = useRef(0);
  const writeQueueRef = useRef<Promise<void>>(
    Promise.resolve(),
  );
  const localOverridesRef = useRef(
    new Map<string, boolean>(),
  );

  useEffect(() => {
    valuesRef.current = values;
  }, [values]);

  useEffect(() => {
    const generation = generationRef.current + 1;
    generationRef.current = generation;
    let cancelled = false;

    async function hydrate() {
      const activeScope = scope;

      localOverridesRef.current = new Map();
      userIdRef.current = null;
      clientRef.current = null;
      setError(null);
      setSignedIn(false);

      if (!activeScope) {
        const empty = new Set<string>();
        valuesRef.current = empty;
        activeStorageKeyRef.current = null;
        setValues(empty);
        setLoading(false);
        return;
      }

      const guestKey = storageKey(
        namespace,
        activeScope,
        "guest",
      );
      const guestValues = readStoredSet(guestKey);

      activeStorageKeyRef.current = guestKey;
      valuesRef.current = guestValues;
      setValues(guestValues);
      setLoading(true);

      if (!isSupabaseConfigured()) {
        setLoading(false);
        return;
      }

      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
          error: userError,
        } = await supabase.auth.getUser();

        if (userError) {
          throw userError;
        }

        if (
          cancelled ||
          generationRef.current !== generation
        ) {
          return;
        }

        if (!user) {
          setLoading(false);
          return;
        }

        const userKey = storageKey(
          namespace,
          activeScope,
          user.id,
        );
        const cachedValues = readStoredSet(userKey);
        const currentGuestValues = readStoredSet(guestKey);
        const optimisticValues = mergeSets(
          cachedValues,
          currentGuestValues,
        );

        userIdRef.current = user.id;
        clientRef.current = supabase;
        activeStorageKeyRef.current = userKey;
        valuesRef.current = optimisticValues;
        writeStoredSet(userKey, optimisticValues);
        setValues(optimisticValues);
        setSignedIn(true);

        const remoteValues = new Set(
          await adapter.load(
            supabase,
            user.id,
            activeScope,
          ),
        );
        const latestCachedValues = readStoredSet(userKey);
        const latestGuestValues = readStoredSet(guestKey);
        const mergedValues = mergeSets(
          remoteValues,
          latestCachedValues,
          latestGuestValues,
        );

        for (const [value, shouldExist] of
          localOverridesRef.current) {
          if (shouldExist) {
            mergedValues.add(value);
          } else {
            mergedValues.delete(value);
          }
        }

        await adapter.addMany(
          supabase,
          user.id,
          activeScope,
          [...mergedValues],
        );

        const locallyRemovedValues = [
          ...localOverridesRef.current,
        ]
          .filter(([, shouldExist]) => !shouldExist)
          .map(([value]) => value);

        await Promise.all(
          locallyRemovedValues.map((value) =>
            adapter.remove(
              supabase,
              user.id,
              activeScope,
              value,
            ),
          ),
        );

        if (
          cancelled ||
          generationRef.current !== generation
        ) {
          return;
        }

        writeStoredSet(userKey, mergedValues);
        removeStoredSet(guestKey);
        valuesRef.current = mergedValues;
        setValues(mergedValues);
        setLoading(false);
      } catch (syncError) {
        if (
          cancelled ||
          generationRef.current !== generation
        ) {
          return;
        }

        console.error("Could not sync user memory:", syncError);
        setError(errorMessage(syncError));
        setLoading(false);
      }
    }

    void hydrate();

    return () => {
      cancelled = true;
    };
  }, [adapter, namespace, scope]);

  const toggle = useCallback(
    (value: string) => {
      if (!scope || value.length === 0) {
        return;
      }

      const nextValues = new Set(valuesRef.current);
      const shouldExist = !nextValues.has(value);

      if (shouldExist) {
        nextValues.add(value);
      } else {
        nextValues.delete(value);
      }

      localOverridesRef.current.set(value, shouldExist);
      valuesRef.current = nextValues;
      setValues(nextValues);
      setError(null);

      if (activeStorageKeyRef.current) {
        writeStoredSet(
          activeStorageKeyRef.current,
          nextValues,
        );
      }

      const supabase = clientRef.current;
      const userId = userIdRef.current;

      if (!supabase || !userId) {
        return;
      }

      setPendingWrites((count) => count + 1);

      writeQueueRef.current = writeQueueRef.current
        .catch(() => undefined)
        .then(async () => {
          if (shouldExist) {
            await adapter.addMany(
              supabase,
              userId,
              scope,
              [value],
            );
          } else {
            await adapter.remove(
              supabase,
              userId,
              scope,
              value,
            );
          }
        })
        .catch((syncError) => {
          console.error(
            "Could not update user memory:",
            syncError,
          );
          setError(errorMessage(syncError));
        })
        .finally(() => {
          setPendingWrites((count) =>
            Math.max(0, count - 1),
          );
        });
    },
    [adapter, scope],
  );

  return {
    values,
    loading,
    syncing: pendingWrites > 0,
    error,
    signedIn,
    toggle,
  };
}
