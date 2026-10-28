"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { FormEvent } from "react";
import { Check, Mail } from "lucide-react";

import { legalInfo } from "@/data/legal";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  buildWaitlistInsert,
  isValidEmail,
  WAITLIST_MAX_MONTHS,
  waitlistOutcome,
  type WaitlistRoute,
} from "@/lib/waitlist";

import styles from "./Waitlist.module.css";

type State = "closed" | "open" | "sending" | "joined";

/**
 * "I want the full route": collects an email with explicit consent so we
 * can measure demand and write once if a fuller version launches.
 */
export function WaitlistCta({ route }: { route: WaitlistRoute }) {
  const id = useId();
  const [state, setState] = useState<State>("closed");
  const [email, setEmail] = useState("");
  const [consent, setConsent] = useState(false);
  const [trap, setTrap] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    if (!isValidEmail(email)) {
      setError("Enter a valid email address.");
      return;
    }
    if (!consent) {
      setError("Tick the box to agree, or close the form.");
      return;
    }
    // Filled only by bots; pretend it worked.
    if (trap) {
      setState("joined");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("The waitlist is not available right now. Please try again later.");
      return;
    }

    setState("sending");
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: insertError } = await supabase
        .from("waitlist_signups")
        .insert(buildWaitlistInsert(email, route));
      if (waitlistOutcome(insertError) === "joined") {
        setState("joined");
        return;
      }
      throw insertError;
    } catch {
      setState("open");
      setError("Something went wrong. Please try again in a minute.");
    }
  }

  if (state === "joined") {
    return (
      <section className={styles.card} aria-live="polite" data-print-hide="">
        <p className={styles.done}>
          <Check size={18} aria-hidden="true" />
          You are on the list. We will write to you once if the full route
          launches.
        </p>
        <p className={styles.fine}>
          Changed your mind? Remove your email on the{" "}
          <Link href="/privacy#waitlist">Privacy Policy</Link> page.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby={`${id}-title`} data-print-hide="">
      <p className={styles.eyebrow}>FULL ROUTE · NOT AVAILABLE YET</p>
      <h2 id={`${id}-title`} className={styles.title}>
        Want the full route?
      </h2>
      <p className={styles.text}>
        We are thinking about a fuller version of this route. Leave your email
        and we will write to you once if it launches. It also shows us whether
        it is worth building.
      </p>

      {state === "closed" ? (
        <button
          type="button"
          className={styles.primary}
          onClick={() => setState("open")}
        >
          <Mail size={17} aria-hidden="true" />
          I want the full route
        </button>
      ) : (
        <form className={styles.form} onSubmit={submit} noValidate>
          <label className={styles.field}>
            <span>Email</span>
            <input
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label className={styles.trap} aria-hidden="true">
            Website
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              value={trap}
              onChange={(event) => setTrap(event.target.value)}
            />
          </label>

          <label className={styles.consent}>
            <input
              type="checkbox"
              checked={consent}
              onChange={(event) => setConsent(event.target.checked)}
            />
            <span>
              I am {legalInfo.minimumAccountAge} or older and agree that
              DocRoute stores my email and the route I viewed to email me once
              about the full route. Kept for at most {WAITLIST_MAX_MONTHS} months. I can withdraw
              at any time. Details in the{" "}
              <Link href="/privacy#waitlist">Privacy Policy</Link>.
            </span>
          </label>

          {error && (
            <p className={styles.error} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <button
              type="submit"
              className={styles.primary}
              disabled={state === "sending"}
            >
              {state === "sending" ? "Sending…" : "Join the waitlist"}
            </button>
            <button
              type="button"
              className={styles.secondary}
              onClick={() => {
                setState("closed");
                setError(null);
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </section>
  );
}
