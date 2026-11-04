"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Check, EyeOff, Heart, Send, Trash2 } from "lucide-react";

import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { removeStoryPhoto } from "@/lib/story-photo-upload";
import { storyLimits, validateComment, type StoryStatus } from "@/lib/stories";

import styles from "./Stories.module.css";

/** Like / unlike a published story. Signed-out readers get a sign-in link. */
export function LikeButton({
  storyId,
  userId,
  initialLiked,
  initialCount,
}: {
  storyId: string;
  userId: string | null;
  initialLiked: boolean;
  initialCount: number;
}) {
  const [liked, setLiked] = useState(initialLiked);
  const [count, setCount] = useState(initialCount);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  if (!userId) {
    return (
      <Link href={`/auth?mode=login&next=/stories/${storyId}`} className={styles.likeButton}>
        <Heart size={17} aria-hidden="true" />
        {count} · Log in to like
      </Link>
    );
  }

  async function toggle() {
    setBusy(true);
    setFailed(false);
    const supabase = createSupabaseBrowserClient();
    const next = !liked;
    const { error } = next
      ? await supabase.from("story_likes").insert({ story_id: storyId, user_id: userId! })
      : await supabase.from("story_likes").delete().eq("story_id", storyId).eq("user_id", userId!);
    setBusy(false);
    // A repeated like (another tab) is not an error for the reader.
    if (error && !(next && error.code === "23505")) {
      setFailed(true);
      return;
    }
    setLiked(next);
    setCount((value) => Math.max(0, value + (next ? 1 : -1)));
  }

  return (
    <span className={styles.actions}>
      <button
        type="button"
        className={styles.likeButton}
        aria-pressed={liked}
        onClick={toggle}
        disabled={busy}
      >
        <Heart size={17} aria-hidden="true" />
        {liked ? "Liked" : "Like"} · {count}
      </button>
      {failed && (
        <span className={styles.message} data-tone="error" role="alert">
          That did not work. Try again.
        </span>
      )}
    </span>
  );
}

/** New comment. It is shown to others only after a moderator publishes it. */
export function CommentForm({ storyId, userId }: { storyId: string; userId: string }) {
  const router = useRouter();
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    const { errors, value } = validateComment(body);
    if (errors.length) {
      setMessage({ tone: "error", text: errors[0] });
      return;
    }
    setBusy(true);
    setMessage(null);
    const { error } = await createSupabaseBrowserClient()
      .from("story_comments")
      .insert({ story_id: storyId, user_id: userId, body: value });
    setBusy(false);
    if (error) {
      setMessage({
        tone: "error",
        text: error.message.includes("limit")
          ? `You already have ${storyLimits.pendingComments} comments waiting for review. Please wait until they are reviewed.`
          : "The comment could not be sent. Try again in a moment.",
      });
      return;
    }
    setBody("");
    setMessage({
      tone: "ok",
      text: "Thank you! Your comment appears for everyone after a short review.",
    });
    router.refresh();
  }

  return (
    <form className={styles.commentForm} onSubmit={submit} noValidate>
      <label className={styles.field}>
        <span>Your comment</span>
        <textarea
          value={body}
          onChange={(event) => setBody(event.target.value)}
          maxLength={storyLimits.comment.max}
          placeholder="Ask a question or share what worked for you. No documents, ID numbers or addresses."
        />
        <small>
          {body.trim().length}/{storyLimits.comment.max} · comments are reviewed before they appear
        </small>
      </label>
      {message && (
        <p className={styles.message} data-tone={message.tone} role="status">
          {message.text}
        </p>
      )}
      <div className={styles.actions}>
        <button type="submit" className={styles.primary} disabled={busy}>
          <Send size={15} aria-hidden="true" />
          {busy ? "Sending…" : "Send comment"}
        </button>
      </div>
    </form>
  );
}

/** Delete one comment (its author or a moderator). */
export function DeleteCommentButton({ commentId }: { commentId: string }) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    setBusy(true);
    const { error } = await createSupabaseBrowserClient()
      .from("story_comments")
      .delete()
      .eq("id", commentId);
    setBusy(false);
    if (error) {
      setFailed(true);
      return;
    }
    router.refresh();
  }

  return (
    <span className={styles.actions}>
      {confirming ? (
        <>
          <button type="button" className={styles.danger} onClick={remove} disabled={busy}>
            <Trash2 size={14} aria-hidden="true" />
            {busy ? "Deleting…" : "Yes, delete"}
          </button>
          <button type="button" className={styles.secondary} onClick={() => setConfirming(false)}>
            Keep
          </button>
        </>
      ) : (
        <button type="button" className={styles.secondary} onClick={() => setConfirming(true)}>
          <Trash2 size={14} aria-hidden="true" />
          Delete comment
        </button>
      )}
      {failed && (
        <span className={styles.message} data-tone="error" role="alert">
          Deleting failed. Try again.
        </span>
      )}
    </span>
  );
}

/** Publish or decline a comment on /stories/review/comments. */
export function CommentModerationActions({
  commentId,
  status,
}: {
  commentId: string;
  status: StoryStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function setStatus(next: StoryStatus) {
    setBusy(true);
    setFailed(false);
    const { error } = await createSupabaseBrowserClient().rpc("moderate_comment", {
      p_comment_id: commentId,
      p_status: next,
    });
    setBusy(false);
    if (error) {
      setFailed(true);
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
      <DeleteCommentButton commentId={commentId} />
      {failed && (
        <p className={styles.message} data-tone="error">
          That did not work. Reload the page and try again.
        </p>
      )}
    </div>
  );
}

/** A moderator removes one photo; the story itself stays as it is. */
export function RemovePhotoButton({ photoId, path }: { photoId: string; path: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [failed, setFailed] = useState(false);

  async function remove() {
    setBusy(true);
    setFailed(false);
    try {
      await removeStoryPhoto(createSupabaseBrowserClient(), { id: photoId, path });
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setBusy(false);
    }
  }

  return (
    <span className={styles.actions}>
      <button type="button" className={styles.danger} onClick={remove} disabled={busy}>
        <Trash2 size={14} aria-hidden="true" />
        {busy ? "Removing…" : "Remove photo"}
      </button>
      {failed && (
        <span className={styles.message} data-tone="error" role="alert">
          Removing failed. Try again.
        </span>
      )}
    </span>
  );
}
