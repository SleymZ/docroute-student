"use client";

import Link from "next/link";
import { useState } from "react";
import { Download, Trash2 } from "lucide-react";

import { AVATAR_BUCKET } from "@/lib/stories";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

import styles from "./AccountDataControls.module.css";

const CONFIRM_WORD = "DELETE";

/**
 * GDPR self-service: download everything stored for this account (Art. 15
 * and 20) and delete the account with all its data (Art. 17).
 */
export function AccountDataControls() {
  const [busy, setBusy] = useState<"export" | "delete" | null>(null);
  const [confirming, setConfirming] = useState(false);
  const [confirmText, setConfirmText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  async function downloadData() {
    setBusy("export");
    setMessage(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError || !userData.user) throw userError ?? new Error("No user");
      const user = userData.user;

      const [profile, saved, progress, publicProfile, stories] = await Promise.all([
        supabase.from("applicant_profiles").select("*").eq("user_id", user.id),
        supabase.from("saved_universities").select("*").eq("user_id", user.id),
        supabase.from("route_task_progress").select("*").eq("user_id", user.id),
        supabase.from("public_profiles").select("*").eq("user_id", user.id),
        supabase.from("success_stories").select("*").eq("user_id", user.id),
      ]);
      const failed = [profile, saved, progress, publicProfile, stories].find(
        (result) => result.error,
      );
      if (failed?.error) throw failed.error;

      const exportData = {
        exportedAt: new Date().toISOString(),
        service: "DocRoute",
        account: {
          id: user.id,
          email: user.email,
          createdAt: user.created_at,
          lastSignInAt: user.last_sign_in_at,
          signInMethods: user.app_metadata?.providers ?? [],
        },
        applicantProfile: profile.data?.[0] ?? null,
        savedUniversities: saved.data ?? [],
        routeTaskProgress: progress.data ?? [],
        publicProfile: publicProfile.data?.[0] ?? null,
        stories: stories.data ?? [],
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `docroute-data-${exportData.exportedAt.slice(0, 10)}.json`;
      document.body.append(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
      setMessage("Your data was downloaded as a JSON file.");
    } catch {
      setMessage("The download failed. Reload the page and try again.");
    } finally {
      setBusy(null);
    }
  }

  async function deleteAccount() {
    if (confirmText.trim().toUpperCase() !== CONFIRM_WORD) return;
    setBusy("delete");
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    // Profile photos live in Storage, which SQL cannot delete: remove the
    // account's folder first, then the account itself.
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (userId) {
        const { data: files } = await supabase.storage
          .from(AVATAR_BUCKET)
          .list(userId);
        if (files?.length) {
          await supabase.storage
            .from(AVATAR_BUCKET)
            .remove(files.map((file) => `${userId}/${file.name}`));
        }
      }
    } catch {
      // Continue: the account deletion below must not depend on Storage.
    }
    const { error } = await supabase.rpc("delete_my_account");
    if (error) {
      setBusy(null);
      setMessage(
        "The account could not be deleted. Nothing was removed. Try again later or email us.",
      );
      return;
    }
    await supabase.auth.signOut();
    try {
      for (const key of Object.keys(window.localStorage)) {
        if (key.startsWith("docroute:")) window.localStorage.removeItem(key);
      }
    } catch {
      // Device storage unavailable; nothing else to clear.
    }
    window.location.assign("/?account=deleted");
  }

  return (
    <section className={styles.panel} aria-labelledby="your-data-heading">
      <div className={styles.text}>
        <h2 id="your-data-heading">Your data</h2>
        <p>
          Download a copy of everything DocRoute stores for your account, or
          delete the account with your profile, saved universities, public
          profile, photo, stories and progress. See the <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={styles.secondary}
          onClick={downloadData}
          disabled={busy !== null}
        >
          <Download size={16} aria-hidden="true" />
          {busy === "export" ? "Preparing…" : "Download my data"}
        </button>

        {!confirming ? (
          <button
            type="button"
            className={styles.danger}
            onClick={() => setConfirming(true)}
            disabled={busy !== null}
          >
            <Trash2 size={16} aria-hidden="true" />
            Delete my account
          </button>
        ) : null}
      </div>

      {confirming ? (
        <div className={styles.confirm}>
          <label htmlFor="delete-confirm">
            This permanently deletes your account and all saved data. It
            cannot be undone. Type <strong>{CONFIRM_WORD}</strong> to confirm.
          </label>
          <div className={styles.confirmRow}>
            <input
              id="delete-confirm"
              value={confirmText}
              onChange={(event) => setConfirmText(event.target.value)}
              autoComplete="off"
              spellCheck={false}
            />
            <button
              type="button"
              className={styles.danger}
              onClick={deleteAccount}
              disabled={
                busy !== null ||
                confirmText.trim().toUpperCase() !== CONFIRM_WORD
              }
            >
              {busy === "delete" ? "Deleting…" : "Delete permanently"}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setConfirming(false);
                setConfirmText("");
              }}
              disabled={busy !== null}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      {message ? (
        <p className={styles.message} role="status">
          {message}
        </p>
      ) : null}
    </section>
  );
}
