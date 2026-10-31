"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Pencil, Send, Trash2 } from "lucide-react";

import { CountryPicker } from "@/components/CountryPicker";
import { StoryCard } from "@/components/StoryCard";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  storyLimits,
  storyPurposeLabels,
  storyPurposes,
  validateStory,
  type PublicProfile,
  type SuccessStory,
} from "@/lib/stories";

import styles from "./Stories.module.css";

export function StoryForm({
  userId,
  storyCount,
  story,
  onDone,
}: {
  userId: string;
  storyCount: number;
  // when given, the form edits this story instead of creating a new one
  story?: SuccessStory;
  onDone?: () => void;
}) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const editing = Boolean(story);
  const [title, setTitle] = useState(story?.title ?? "");
  const [body, setBody] = useState(story?.body ?? "");
  const [purpose, setPurpose] = useState<string>(story?.purpose ?? "study");
  const [fromCountry, setFromCountry] = useState(story?.from_country_code ?? "");
  const [toCountry, setToCountry] = useState(story?.to_country_code ?? "");
  const [movedYear, setMovedYear] = useState(String(story?.moved_year ?? currentYear));
  const [university, setUniversity] = useState(story?.university ?? "");
  const [agreed, setAgreed] = useState(editing);
  const [errors, setErrors] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const limitReached = !editing && storyCount >= storyLimits.perAccount;

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const { errors: found, value } = validateStory(
      {
        title,
        body,
        purpose,
        fromCountryCode: fromCountry,
        toCountryCode: toCountry,
        movedYear: Number(movedYear),
        university,
      },
      currentYear,
    );
    if (!agreed) found.push("Confirm that the story is yours and may be published.");
    setErrors(found);
    if (found.length) return;

    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = story
      ? await supabase.from("success_stories").update(value).eq("id", story.id)
      : await supabase.from("success_stories").insert({ user_id: userId, ...value });
    setBusy(false);
    if (error) {
      setErrors([
        error.message.includes("limit")
          ? `You can keep at most ${storyLimits.perAccount} stories. Delete one first.`
          : editing
            ? "The changes could not be saved. Try again in a moment."
            : "The story could not be sent. Try again in a moment.",
      ]);
      return;
    }
    if (editing) {
      onDone?.();
      router.refresh();
      return;
    }
    setSent(true);
    setTitle("");
    setBody("");
    setUniversity("");
    setAgreed(false);
    router.refresh();
  }

  if (sent) {
    return (
      <section className={styles.panel} role="status">
        <h2>Thank you! Your story is waiting for review</h2>
        <p className={styles.panelLead}>
          Every story is read before it appears on the Stories page, usually
          within a few days. You can see its status below.
        </p>
        <div className={styles.actions}>
          <Link href="/stories" className={styles.primary}>
            Read other stories
          </Link>
          <button type="button" className={styles.secondary} onClick={() => setSent(false)}>
            Write another
          </button>
        </div>
      </section>
    );
  }

  if (limitReached) {
    return (
      <p className={styles.notice}>
        You already have {storyLimits.perAccount} stories, the most one account
        can keep. Delete one below to write a new one.
      </p>
    );
  }

  return (
    <form className={styles.panel} onSubmit={submit} noValidate>
      <div>
        <h2>{editing ? "Edit your story" : "Your story"}</h2>
        {editing && story?.status === "published" && (
          <p className={styles.message} data-tone="error">
            After saving, the story leaves the Stories page until it is
            reviewed again.
          </p>
        )}
        <p className={styles.panelLead}>
          What helped, what surprised you, what you would tell someone starting
          now. Do not include documents, ID numbers, addresses or other
          people&apos;s personal details.
        </p>
      </div>

      <label className={styles.field}>
        <span>Title</span>
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={storyLimits.title.max}
          placeholder="From Kyiv to Bratislava: my first year at FIIT"
        />
      </label>

      <div className={styles.twoCols}>
        <CountryPicker
          label="Moved from"
          value={fromCountry}
          options={applicantCountryOptions}
          placeholder="Choose a country"
          onChange={setFromCountry}
        />
        <CountryPicker
          label="Moved to"
          value={toCountry}
          options={applicantCountryOptions.filter((country) => country.code !== "ZZ")}
          placeholder="Choose a country"
          onChange={setToCountry}
        />
      </div>

      <div className={styles.twoCols}>
        <label className={styles.field}>
          <span>Reason for moving</span>
          <select value={purpose} onChange={(event) => setPurpose(event.target.value)}>
            {storyPurposes.map((item) => (
              <option key={item} value={item}>
                {storyPurposeLabels[item]}
              </option>
            ))}
          </select>
        </label>
        <label className={styles.field}>
          <span>Year of the move</span>
          <input
            type="number"
            inputMode="numeric"
            min={storyLimits.year.min}
            max={Math.min(storyLimits.year.max, currentYear + 1)}
            value={movedYear}
            onChange={(event) => setMovedYear(event.target.value)}
          />
        </label>
      </div>

      <label className={styles.field}>
        <span>University or employer (optional)</span>
        <input
          value={university}
          onChange={(event) => setUniversity(event.target.value)}
          maxLength={storyLimits.university.max}
          placeholder="Slovak University of Technology, FIIT"
        />
      </label>

      <label className={styles.field}>
        <span>Story</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={storyLimits.body.max}
        />
        <small>
          {body.trim().length}/{storyLimits.body.max} · at least {storyLimits.body.min} characters
        </small>
      </label>

      {!editing && (
        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            This is my own experience. I agree that DocRoute publishes it
            publicly with my public name and photo after review, as described in
            the <Link href="/terms#stories">Terms</Link> and{" "}
            <Link href="/privacy#stories">Privacy Policy</Link>. I can delete it
            at any time.
          </span>
        </label>
      )}

      {errors.length > 0 && (
        <ul className={styles.errors} role="alert">
          {errors.map((error) => (
            <li key={error}>{error}</li>
          ))}
        </ul>
      )}

      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={busy}>
          <Send size={16} aria-hidden="true" />
          {busy ? "Sending…" : editing ? "Save and send for review" : "Send for review"}
        </button>
        {editing && (
          <button type="button" className={styles.secondary} onClick={onDone} disabled={busy}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export function DeleteStoryButton({ storyId }: { storyId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("success_stories").delete().eq("id", storyId);
    setBusy(false);
    if (error) {
      setFailed(true);
      return;
    }
    router.refresh();
  }

  return (
    <div className={styles.actions}>
      {confirming ? (
        <>
          <button type="button" className={styles.danger} onClick={remove} disabled={busy}>
            <Trash2 size={15} aria-hidden="true" />
            {busy ? "Deleting…" : "Yes, delete it"}
          </button>
          <button type="button" className={styles.secondary} onClick={() => setConfirming(false)}>
            Keep it
          </button>
        </>
      ) : (
        <button type="button" className={styles.danger} onClick={() => setConfirming(true)}>
          <Trash2 size={15} aria-hidden="true" />
          Delete story
        </button>
      )}
      {failed && (
        <p className={styles.message} data-tone="error">
          Deleting failed. Try again.
        </p>
      )}
    </div>
  );
}

// One of the author's own stories: the card with its status, plus edit and
// delete. Editing sends the story back to review.
export function OwnStory({
  story,
  author,
  userId,
}: {
  story: SuccessStory;
  author: PublicProfile | null;
  userId: string;
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className={`${styles.form} ${styles.wide}`}>
        <StoryForm
          userId={userId}
          storyCount={0}
          story={story}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <StoryCard story={story} author={author} showStatus headingLevel={3} />
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={() => setEditing(true)}>
          <Pencil size={15} aria-hidden="true" />
          Edit story
        </button>
        <DeleteStoryButton storyId={story.id} />
      </div>
    </div>
  );
}
