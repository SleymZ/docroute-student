"use client";

import { useState } from "react";
import type { FormEvent } from "react";

import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isValidEmail, normalizeEmail } from "@/lib/waitlist";

import styles from "./Waitlist.module.css";

/** Withdraw waitlist consent (GDPR Art. 7(3)) without contacting anyone. */
export function WaitlistLeave() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "done">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("This is not available right now. Please try again later.");
      return;
    }
    setState("sending");
    const { error: rpcError } = await createSupabaseBrowserClient().rpc(
      "leave_waitlist",
      { p_email: normalizeEmail(email) },
    );
    if (rpcError) {
      setState("idle");
      setError("Something went wrong. Please try again in a minute.");
      return;
    }
    setState("done");
  }

  if (state === "done") {
    return (
      <p className={styles.done} role="status">
        Done. If this email was on the waitlist, it has been removed.
      </p>
    );
  }

  return (
    <form className={styles.leave} onSubmit={submit} noValidate>
      <label className={styles.field}>
        <span>Email to remove from the waitlist</span>
        <input
          type="email"
          name="email"
          autoComplete="email"
          maxLength={254}
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </label>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button
        type="submit"
        className={styles.secondary}
        disabled={state === "sending"}
      >
        {state === "sending" ? "Removing…" : "Remove my email"}
      </button>
    </form>
  );
}
