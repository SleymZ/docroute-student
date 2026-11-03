"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { removeConfirmedRoute } from "@/lib/supabase/confirmed-route";

import styles from "./Stories.module.css";

// Removes the confirmed route from My route. Ticks on the route page stay.
export function RemoveMyRoute({ userId }: { userId: string }) {
  const router = useRouter();
  const [asking, setAsking] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(false);

  async function remove() {
    setBusy(true);
    setError(false);
    try {
      await removeConfirmedRoute(createSupabaseBrowserClient(), userId);
      router.refresh();
    } catch {
      setError(true);
      setBusy(false);
    }
  }

  if (!asking) {
    return (
      <button type="button" className={styles.secondary} onClick={() => setAsking(true)}>
        <Trash2 size={16} aria-hidden="true" />
        Remove from My route
      </button>
    );
  }

  return (
    <>
      <button type="button" className={styles.danger} disabled={busy} onClick={() => void remove()}>
        {busy ? "Removing…" : "Yes, remove it"}
      </button>
      <button type="button" className={styles.secondary} disabled={busy} onClick={() => setAsking(false)}>
        Cancel
      </button>
      {error && <p role="alert">Could not remove it. Try again.</p>}
    </>
  );
}
