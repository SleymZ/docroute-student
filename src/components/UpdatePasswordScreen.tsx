"use client";

import { type FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, KeyRound, Route } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import styles from "./UpdatePasswordScreen.module.css";

export function UpdatePasswordScreen() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (password !== confirmation) {
      setMessage("Passwords do not match.");
      return;
    }

    if (!isSupabaseConfigured()) {
      setMessage("Supabase is not configured.");
      return;
    }

    setBusy(true);
    const { error } = await createSupabaseBrowserClient().auth.updateUser({
      password,
    });
    setBusy(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    router.replace("/account");
    router.refresh();
  }

  return (
    <main className={styles.page}>
      <div className={styles.grid} aria-hidden="true" />

      <section className={styles.card}>
        <Link href="/" className={styles.brand}>
          <span>
            <Route size={22} aria-hidden="true" />
          </span>
          DocRoute Student
        </Link>

        <span className={styles.icon}>
          <KeyRound size={24} aria-hidden="true" />
        </span>
        <p className={styles.eyebrow}>ACCOUNT SECURITY</p>
        <h1>Choose a new password.</h1>
        <p className={styles.description}>
          Use at least eight characters and do not reuse a password from
          another service.
        </p>

        <form onSubmit={handleSubmit}>
          <label>
            <span>New password</span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </label>

          <label>
            <span>Confirm password</span>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              required
            />
          </label>

          <button type="submit" disabled={busy}>
            {busy ? "Updating..." : "Update password"}
            <ArrowRight size={17} aria-hidden="true" />
          </button>

          {message && <p className={styles.message}>{message}</p>}
        </form>

        <Link href="/auth?mode=login" className={styles.backLink}>
          <ArrowLeft size={15} aria-hidden="true" />
          Back to login
        </Link>
      </section>
    </main>
  );
}