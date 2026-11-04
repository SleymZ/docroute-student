"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ImagePlus, Pencil, Send, Trash2, X } from "lucide-react";

import { CountryPicker } from "@/components/CountryPicker";
import { StoryCard } from "@/components/StoryCard";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  MAX_SOURCE_PHOTO_BYTES,
  acceptedPhotoTypes,
  removeStoryFolder,
  removeStoryPhoto,
  uploadStoryPhoto,
} from "@/lib/story-photo-upload";
import {
  storyLimits,
  storyPurposeLabels,
  storyPurposes,
  validateStory,
  type PublicProfile,
  type StoryPhoto,
  type SuccessStory,
} from "@/lib/stories";

import styles from "./Stories.module.css";

type NewPhoto = { key: string; file: File; preview: string };

// Up to 4 photos: the ones already saved (editing) plus new files. Saved
// photos the author removes are deleted when the form is submitted.
function PhotoPicker({
  kept,
  added,
  onRemoveKept,
  onRemoveAdded,
  onAdd,
  disabled,
}: {
  kept: StoryPhoto[];
  added: NewPhoto[];
  onRemoveKept: (id: string) => void;
  onRemoveAdded: (key: string) => void;
  onAdd: (files: File[]) => void;
  disabled: boolean;
}) {
  const free = storyLimits.photosPerStory - kept.length - added.length;
  return (
    <div className={styles.photoPicker}>
      <span>Photos (optional, up to {storyLimits.photosPerStory})</span>
      <div className={styles.photoGrid}>
        {kept.map((photo, index) => (
          <div key={photo.id} className={styles.photoSlot}>
            {photo.url && (
              // eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL
              <img src={photo.url} alt={`Saved photo ${index + 1}`} />
            )}
            <button
              type="button"
              onClick={() => onRemoveKept(photo.id)}
              disabled={disabled}
              aria-label={`Remove saved photo ${index + 1}`}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
        {added.map((photo, index) => (
          <div key={photo.key} className={styles.photoSlot}>
            {/* eslint-disable-next-line @next/next/no-img-element -- local preview of a picked file */}
            <img src={photo.preview} alt={`New photo ${index + 1}`} />
            <button
              type="button"
              onClick={() => onRemoveAdded(photo.key)}
              disabled={disabled}
              aria-label={`Remove new photo ${index + 1}`}
            >
              <X size={16} aria-hidden="true" />
            </button>
          </div>
        ))}
        {free > 0 && (
          <label className={styles.addPhoto}>
            <ImagePlus size={22} aria-hidden="true" />
            Add photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              multiple
              disabled={disabled}
              onChange={(event) => {
                const files = Array.from(event.target.files ?? []);
                event.target.value = "";
                onAdd(files);
              }}
            />
          </label>
        )}
      </div>
      <small className={styles.panelLead}>
        JPG, PNG or WebP. Photos are made smaller and location data is
        removed. Do not show documents, tickets or people who did not agree to
        be shown. Photos are reviewed together with the story.
      </small>
    </div>
  );
}

export function StoryForm({
  userId,
  storyCount,
  story,
  photos = [],
  onDone,
}: {
  userId: string;
  storyCount: number;
  // when given, the form edits this story instead of creating a new one
  story?: SuccessStory;
  photos?: StoryPhoto[];
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
  const [keptPhotos, setKeptPhotos] = useState<StoryPhoto[]>(photos);
  const [newPhotos, setNewPhotos] = useState<NewPhoto[]>([]);
  const [photoNote, setPhotoNote] = useState<string | null>(null);
  const previews = useRef<string[]>([]);

  // Free the local previews when the form goes away.
  useEffect(() => {
    const urls = previews.current;
    return () => {
      for (const url of urls) URL.revokeObjectURL(url);
    };
  }, []);

  function addPhotos(files: File[]) {
    const free = storyLimits.photosPerStory - keptPhotos.length - newPhotos.length;
    const usable = files.filter(
      (file) => acceptedPhotoTypes.test(file.type) && file.size <= MAX_SOURCE_PHOTO_BYTES,
    );
    const picked = usable.slice(0, Math.max(0, free)).map((file) => {
      const preview = URL.createObjectURL(file);
      previews.current.push(preview);
      return { key: `${file.name}-${file.size}-${preview}`, file, preview };
    });
    setNewPhotos((current) => [...current, ...picked]);
    setPhotoNote(
      usable.length < files.length
        ? "Some files were skipped: use JPG, PNG or WebP pictures up to 15 MB."
        : usable.length > picked.length
          ? `A story can have at most ${storyLimits.photosPerStory} photos.`
          : null,
    );
  }

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
    let storyId = story?.id ?? null;
    let error: { message: string } | null = null;
    if (story) {
      ({ error } = await supabase.from("success_stories").update(value).eq("id", story.id));
    } else {
      const inserted = await supabase
        .from("success_stories")
        .insert({ user_id: userId, ...value })
        .select("id")
        .single();
      error = inserted.error;
      storyId = inserted.data?.id ?? null;
    }
    if (error || !storyId) {
      setBusy(false);
      setErrors([
        error?.message.includes("limit")
          ? `You can keep at most ${storyLimits.perAccount} stories. Delete one first.`
          : editing
            ? "The changes could not be saved. Try again in a moment."
            : "The story could not be sent. Try again in a moment.",
      ]);
      return;
    }

    // Photos: removed ones first, then the new files. A failed photo does
    // not undo the story; the author can edit the story and try again.
    let photoFailures = 0;
    const removed = photos.filter((photo) => !keptPhotos.some((kept) => kept.id === photo.id));
    for (const photo of removed) {
      try {
        await removeStoryPhoto(supabase, photo);
      } catch {
        photoFailures += 1;
      }
    }
    for (const photo of newPhotos) {
      try {
        await uploadStoryPhoto(supabase, userId, storyId, photo.file);
      } catch {
        photoFailures += 1;
      }
    }
    setBusy(false);
    setNewPhotos([]);
    if (photoFailures > 0) {
      setPhotoNote(
        photoFailures === 1
          ? "The story was saved, but 1 photo could not be saved. Edit the story to try again."
          : `The story was saved, but ${photoFailures} photos could not be saved. Edit the story to try again.`,
      );
    }
    if (editing) {
      if (photoFailures === 0) onDone?.();
      router.refresh();
      return;
    }
    setSent(true);
    setKeptPhotos([]);
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
        {photoNote && (
          <p className={styles.message} data-tone="error">
            {photoNote}
          </p>
        )}
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

      <PhotoPicker
        kept={keptPhotos}
        added={newPhotos}
        onRemoveKept={(id) => setKeptPhotos((current) => current.filter((photo) => photo.id !== id))}
        onRemoveAdded={(key) => setNewPhotos((current) => current.filter((photo) => photo.key !== key))}
        onAdd={addPhotos}
        disabled={busy}
      />
      {photoNote && (
        <p className={styles.message} data-tone="error" role="status">
          {photoNote}
        </p>
      )}

      {!editing && (
        <label className={styles.consent}>
          <input
            type="checkbox"
            checked={agreed}
            onChange={(event) => setAgreed(event.target.checked)}
          />
          <span>
            This is my own experience. I agree that DocRoute publishes it
            publicly with my public name, profile photo and the photos I add
            after review, as described in
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

export function DeleteStoryButton({ storyId, userId }: { storyId: string; userId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    setBusy(true);
    const supabase = createSupabaseBrowserClient();
    const { error } = await supabase.from("success_stories").delete().eq("id", storyId);
    if (error) {
      setBusy(false);
      setFailed(true);
      return;
    }
    // The photo rows went with the story; now remove the files from the
    // author's own folder (allowed without the rows).
    await removeStoryFolder(supabase, userId, storyId).catch(() => undefined);
    setBusy(false);
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
  photos = [],
}: {
  story: SuccessStory;
  author: PublicProfile | null;
  userId: string;
  photos?: StoryPhoto[];
}) {
  const [editing, setEditing] = useState(false);

  if (editing) {
    return (
      <div className={`${styles.form} ${styles.wide}`}>
        <StoryForm
          userId={userId}
          storyCount={0}
          story={story}
          photos={photos}
          onDone={() => setEditing(false)}
        />
      </div>
    );
  }

  return (
    <div className={styles.form}>
      <StoryCard
        story={story}
        author={author}
        showStatus
        headingLevel={3}
        photos={photos}
        photoLayout="all"
        href={`/stories/${story.id}`}
      />
      <div className={styles.actions}>
        <button type="button" className={styles.secondary} onClick={() => setEditing(true)}>
          <Pencil size={15} aria-hidden="true" />
          Edit story
        </button>
        <DeleteStoryButton storyId={story.id} userId={userId} />
      </div>
    </div>
  );
}
