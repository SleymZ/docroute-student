"use client";

import { useId, useState } from "react";
import type { FormEvent } from "react";
import { usePathname } from "next/navigation";
import { Check } from "lucide-react";

import { buildFeedbackInsert, FEEDBACK_MAX_LENGTH } from "@/lib/feedback";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import type { WaitlistRoute } from "@/lib/waitlist";

import styles from "./Waitlist.module.css";

const ratingLabels = ["Not useful", "Slightly", "Somewhat", "Useful", "Very useful"];

/** Anonymous "How useful was this?" form for routes and /feedback. */
export function FeedbackForm({
  route,
  title = "How useful was this route?",
}: {
  route?: WaitlistRoute;
  title?: string;
}) {
  const id = useId();
  const pathname = usePathname() ?? "/";
  const [rating, setRating] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    const row = buildFeedbackInsert({ pathname, route, rating, message });
    if (!row) {
      setError("Pick a rating or write a few words.");
      return;
    }
    if (!isSupabaseConfigured()) {
      setError("Feedback is not available right now. Please try again later.");
      return;
    }
    setState("sending");
    const { error: insertError } = await createSupabaseBrowserClient()
      .from("feedback")
      .insert(row);
    if (insertError) {
      setState("idle");
      setError("Something went wrong. Please try again in a minute.");
      return;
    }
    setState("sent");
  }

  if (state === "sent") {
    return (
      <section className={styles.card} data-print-hide="" aria-live="polite">
        <p className={styles.done}>
          <Check size={18} aria-hidden="true" />
          Thank you. Every answer is read and helps fix the next version.
        </p>
      </section>
    );
  }

  return (
    <section className={styles.card} aria-labelledby={`${id}-title`} data-print-hide="">
      <p className={styles.eyebrow}>FEEDBACK · ANONYMOUS</p>
      <h2 id={`${id}-title`} className={styles.title}>
        {title}
      </h2>
      <form className={styles.form} onSubmit={submit} noValidate>
        <fieldset className={styles.ratingSet}>
          <legend className={styles.srOnly}>Rating from 1 to 5</legend>
          <div className={styles.ratings}>
            {ratingLabels.map((label, index) => {
              const value = index + 1;
              return (
                <label key={value} className={styles.rating} data-active={rating === value ? "true" : undefined}>
                  <input
                    type="radio"
                    name={`${id}-rating`}
                    value={value}
                    checked={rating === value}
                    onChange={() => setRating(value)}
                  />
                  <strong>{value}</strong>
                  <span>{label}</span>
                </label>
              );
            })}
          </div>
        </fieldset>

        <label className={styles.field}>
          <span>What was missing, wrong or confusing? (optional)</span>
          <textarea
            rows={3}
            maxLength={FEEDBACK_MAX_LENGTH}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
          />
        </label>
        <p className={styles.fine}>
          Please do not write your name, email or other personal details. Only
          this page&apos;s address (without your answers), the rating and the
          text are saved. See the Privacy Policy.
        </p>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.secondary} disabled={state === "sending"}>
            {state === "sending" ? "Sending…" : "Send feedback"}
          </button>
        </div>
      </form>
    </section>
  );
}
