"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { Camera, ExternalLink, Trash2 } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import {
  AVATAR_BUCKET,
  AVATAR_SIZE,
  avatarPath,
  storyLimits,
  validateProfile,
  type PublicProfile,
} from "@/lib/stories";

import { Avatar } from "./Avatar";
import styles from "./Stories.module.css";

const MAX_SOURCE_BYTES = 10 * 1024 * 1024;

/** Crops the picture to a centred square and re-encodes it as a small WebP
 *  (JPEG where the browser cannot write WebP, such as older Safari).
 *  Re-encoding also drops EXIF data such as GPS location. */
async function prepareAvatar(
  file: File,
): Promise<{ blob: Blob; type: "image/webp" | "image/jpeg"; extension: "webp" | "jpg" }> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const side = Math.min(bitmap.width, bitmap.height);
  const canvas = document.createElement("canvas");
  canvas.width = AVATAR_SIZE;
  canvas.height = AVATAR_SIZE;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas unavailable");
  context.drawImage(
    bitmap,
    (bitmap.width - side) / 2,
    (bitmap.height - side) / 2,
    side,
    side,
    0,
    0,
    AVATAR_SIZE,
    AVATAR_SIZE,
  );
  bitmap.close();
  const encode = (type: string) =>
    new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, type, 0.85));
  const webp = await encode("image/webp");
  if (webp && webp.type === "image/webp") {
    return { blob: webp, type: "image/webp", extension: "webp" };
  }
  const jpeg = await encode("image/jpeg");
  if (jpeg && jpeg.type === "image/jpeg") {
    return { blob: jpeg, type: "image/jpeg", extension: "jpg" };
  }
  throw new Error("This browser cannot re-encode the picture");
}

export function PublicProfileEditor({
  userId,
  initialProfile,
}: {
  userId: string;
  initialProfile: PublicProfile | null;
}) {
  const [profile, setProfile] = useState(initialProfile);
  const [displayName, setDisplayName] = useState(initialProfile?.display_name ?? "");
  const [bio, setBio] = useState(initialProfile?.bio ?? "");
  const [busy, setBusy] = useState<"save" | "avatar" | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const nameRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Creates or updates the profile row with the typed name and bio.
  async function writeProfile(value: ReturnType<typeof validateProfile>["value"]) {
    const supabase = createSupabaseBrowserClient();
    return profile
      ? await supabase
          .from("public_profiles")
          .update({ ...value, updated_at: new Date().toISOString() })
          .eq("user_id", userId)
          .select()
          .single()
      : await supabase
          .from("public_profiles")
          .insert({ user_id: userId, ...value })
          .select()
          .single();
  }

  async function saveProfile(event: React.FormEvent) {
    event.preventDefault();
    const { errors, value } = validateProfile({ displayName, bio });
    if (errors.length) {
      setMessage({ tone: "error", text: errors.join(" ") });
      return;
    }
    setBusy("save");
    setMessage(null);
    const result = await writeProfile(value);
    setBusy(null);
    if (result.error || !result.data) {
      setMessage({ tone: "error", text: "Saving failed. Try again in a moment." });
      return;
    }
    setProfile(result.data as PublicProfile);
    setDisplayName(value.display_name);
    setMessage({ tone: "ok", text: "Public profile saved." });
    router.refresh();
  }

  function openPicker() {
    if (busy === null) fileRef.current?.click();
  }

  async function changeAvatar(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (file) await uploadAvatar(file);
  }

  async function uploadAvatar(file: File) {
    if (busy !== null) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type) || file.size > MAX_SOURCE_BYTES) {
      setMessage({ tone: "error", text: "Choose a JPG, PNG or WebP picture under 10 MB." });
      return;
    }
    setBusy("avatar");
    setMessage(null);
    let current = profile;
    const localUrl = URL.createObjectURL(file);
    setPreview(localUrl);
    try {
      // A photo needs a profile row. Without one, save the typed name first.
      if (!current) {
        const { errors, value } = validateProfile({ displayName, bio });
        if (errors.length) {
          setMessage({
            tone: "error",
            text: "Type the name shown publicly first; the photo is saved with it.",
          });
          nameRef.current?.focus();
          return;
        }
        const created = await writeProfile(value);
        if (created.error || !created.data) throw created.error ?? new Error("No profile");
        current = created.data as PublicProfile;
        setProfile(current);
        setDisplayName(value.display_name);
      }
      const prepared = await prepareAvatar(file);
      const supabase = createSupabaseBrowserClient();
      const path = avatarPath(userId, Date.now(), prepared.extension);
      const upload = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(path, prepared.blob, {
          contentType: prepared.type,
          upsert: false,
          cacheControl: "31536000",
        });
      if (upload.error) throw upload.error;
      const update = await supabase
        .from("public_profiles")
        .update({ avatar_path: path, updated_at: new Date().toISOString() })
        .eq("user_id", userId)
        .select()
        .single();
      if (update.error || !update.data) {
        await supabase.storage.from(AVATAR_BUCKET).remove([path]);
        throw update.error ?? new Error("No profile");
      }
      if (current.avatar_path) {
        await supabase.storage.from(AVATAR_BUCKET).remove([current.avatar_path]);
      }
      setProfile(update.data as PublicProfile);
      setMessage({ tone: "ok", text: "Photo saved. It now appears on your public page and stories." });
      router.refresh();
    } catch {
      setMessage({ tone: "error", text: "The photo could not be uploaded. Try another picture (JPG or PNG)." });
    } finally {
      setPreview(null);
      URL.revokeObjectURL(localUrl);
      setBusy(null);
    }
  }

  async function removeAvatar() {
    if (!profile?.avatar_path) return;
    setBusy("avatar");
    setMessage(null);
    const supabase = createSupabaseBrowserClient();
    const update = await supabase
      .from("public_profiles")
      .update({ avatar_path: null, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .select()
      .single();
    if (!update.error && update.data) {
      await supabase.storage.from(AVATAR_BUCKET).remove([profile.avatar_path]);
      setProfile(update.data as PublicProfile);
      setMessage({ tone: "ok", text: "Photo removed." });
    } else {
      setMessage({ tone: "error", text: "The photo could not be removed. Try again." });
    }
    setBusy(null);
  }

  return (
    <section className={styles.panel} aria-labelledby="public-profile-heading">
      <div>
        <h2 id="public-profile-heading">Public profile</h2>
        <p className={styles.panelLead}>
          Shown next to the stories you share. Everyone can see your name,
          photo and the text below; your email and applicant data stay private.
        </p>
      </div>

      <div
        className={styles.avatarRow}
        data-dragging={dragging ? "true" : undefined}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setDragging(false);
          const file = event.dataTransfer.files?.[0];
          if (file) void uploadAvatar(file);
        }}
      >
        <button
          type="button"
          className={styles.avatarButton}
          onClick={openPicker}
          disabled={busy !== null}
          aria-label={profile?.avatar_path ? "Change profile photo" : "Add a profile photo"}
        >
          {preview ? (
            // eslint-disable-next-line @next/next/no-img-element -- local preview of the chosen file
            <img src={preview} alt="" width={72} height={72} className={styles.avatarPreview} />
          ) : (
            <Avatar name={displayName || "?"} path={profile?.avatar_path ?? null} size={72} />
          )}
          <span className={styles.avatarBadge} aria-hidden="true">
            <Camera size={14} />
          </span>
        </button>
        <div className={styles.avatarSide}>
          <div className={styles.actions}>
            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className={styles.visuallyHidden}
              onChange={changeAvatar}
              aria-label="Choose a profile photo"
              tabIndex={-1}
            />
            <button
              type="button"
              className={styles.secondary}
              onClick={openPicker}
              disabled={busy !== null}
            >
              <Camera size={16} aria-hidden="true" />
              {busy === "avatar" ? "Uploading…" : profile?.avatar_path ? "Change photo" : "Add photo"}
            </button>
            {profile?.avatar_path && (
              <button
                type="button"
                className={styles.danger}
                onClick={removeAvatar}
                disabled={busy !== null}
              >
                <Trash2 size={16} aria-hidden="true" />
                Remove photo
              </button>
            )}
          </div>
          <small className={styles.panelLead}>
            JPG, PNG or WebP up to 10 MB, or drag a picture here. It is cropped
            to a square, resized and stripped of location data.
            {!profile && " Type your public name below first; it is saved with the photo."}
          </small>
        </div>
      </div>

      <form onSubmit={saveProfile} className={styles.form}>
        <label className={styles.field}>
          <span>Name shown publicly</span>
          <input
            ref={nameRef}
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            maxLength={storyLimits.displayName.max}
            autoComplete="nickname"
            required
          />
          <small>A first name or nickname is enough. Do not use your email.</small>
        </label>
        <label className={styles.field}>
          <span>About you (optional)</span>
          <textarea
            value={bio}
            onChange={(event) => setBio(event.target.value)}
            maxLength={storyLimits.bio.max}
            style={{ minHeight: 90 }}
          />
          <small>{bio.trim().length}/{storyLimits.bio.max}</small>
        </label>
        <div className={styles.actions}>
          <button type="submit" className={styles.primary} disabled={busy !== null}>
            {busy === "save" ? "Saving…" : "Save public profile"}
          </button>
          {profile && (
            <Link href={`/u/${userId}`} className={styles.secondary}>
              <ExternalLink size={16} aria-hidden="true" />
              View public page
            </Link>
          )}
          <Link href="/stories/new" className={styles.secondary}>
            Share your story
          </Link>
        </div>
      </form>

      {message && (
        <p className={styles.message} data-tone={message.tone} role="status">
          {message.text}
        </p>
      )}
    </section>
  );
}
