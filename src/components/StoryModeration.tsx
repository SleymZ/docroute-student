"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, EyeOff, RotateCcw, Trash2 } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { StoryStatus } from "@/lib/stories";

import styles from "./Stories.module.css";

// Publish / hide / delete buttons for a moderator on /stories/review.
export function StoryModerationActions({
  storyId,
  status,
  reviewedAt,
}: {
  storyId: string;
  status: StoryStatus;
  // updated_at of the version on screen; publishing fails if it changed
  reviewedAt: string;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [failed, setFailed] = useState<"" | "error" | "changed">("");

  async function setStatus(next: StoryStatus) {
    setBusy(true);
    setFailed("");
    const { error } = await createSupabaseBrowserClient().rpc("moderate_story", {
      p_story_id: storyId,
      p_status: next,
      p_reviewed_at: reviewedAt,
    });
    setBusy(false);
    if (error) {
      setFailed(error.message.includes("changed") ? "changed" : "error");
      return;
    }
    router.refresh();
  }

  async function remove() {
    setBusy(true);
    setFailed("");
    const { error } = await createSupabaseBrowserClient()
      .from("success_stories")
      .delete()
      .eq("id", storyId);
    setBusy(false);
    if (error) {
      setFailed("error");
      return;
    }
    router.refresh();
  }

  return (
    <div className={styles.actions}>
      {status !== "published" && (
        <button
          type="button"
          className={styles.primary}
          onClick={() => setStatus("published")}
          disabled={busy}
        >
          <Check size={15} aria-hidden="true" />
          Publish
        </button>
      )}
      {status !== "hidden" && (
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setStatus("hidden")}
          disabled={busy}
        >
          <EyeOff size={15} aria-hidden="true" />
          {status === "published" ? "Unpublish" : "Decline"}
        </button>
      )}
      {status === "hidden" && (
        <button
          type="button"
          className={styles.secondary}
          onClick={() => setStatus("pending")}
          disabled={busy}
        >
          <RotateCcw size={15} aria-hidden="true" />
          Back to review
        </button>
      )}
      {confirmDelete ? (
        <>
          <button type="button" className={styles.danger} onClick={remove} disabled={busy}>
            <Trash2 size={15} aria-hidden="true" />
            Yes, delete
          </button>
          <button
            type="button"
            className={styles.secondary}
            onClick={() => setConfirmDelete(false)}
            disabled={busy}
          >
            Keep
          </button>
        </>
      ) : (
        <button
          type="button"
          className={styles.danger}
          onClick={() => setConfirmDelete(true)}
          disabled={busy}
        >
          <Trash2 size={15} aria-hidden="true" />
          Delete
        </button>
      )}
      {failed && (
        <p className={styles.message} data-tone="error">
          {failed === "changed"
            ? "The author changed this story after you opened the page. Reload and read the new version."
            : "That did not work. Reload the page and try again."}
        </p>
      )}
    </div>
  );
}
