import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Avatar } from "@/components/Avatar";
import { Header } from "@/components/Header";
import { CommentModerationActions } from "@/components/StoryEngagement";
import styles from "@/components/Stories.module.css";
import type { PublicProfile, StoryComment, StoryStatus } from "@/lib/stories";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isStoryModerator,
  loadCommentsForReview,
  loadPublicProfiles,
  loadStoryTitles,
  reviewPageSize,
} from "@/lib/supabase/stories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review comments",
  robots: { index: false, follow: false },
};

const tabs: { status: StoryStatus; label: string }[] = [
  { status: "pending", label: "Waiting for review" },
  { status: "published", label: "Published" },
  { status: "hidden", label: "Declined" },
];

type RawSearchParams = Record<string, string | string[] | undefined>;

export default async function ReviewCommentsPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=login&next=/stories/review/comments");
  if (!(await isStoryModerator(supabase))) notFound();

  const raw = await searchParams;
  const param = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status = tabs.find((tab) => tab.status === param)?.status ?? "pending";
  const pageParam = Number(Array.isArray(raw.page) ? raw.page[0] : raw.page);
  const page = Number.isInteger(pageParam) && pageParam > 1 ? pageParam : 1;

  let comments: StoryComment[] = [];
  let total = 0;
  let authors = new Map<string, PublicProfile>();
  let titles = new Map<string, string>();
  let failed = false;
  try {
    ({ comments, total } = await loadCommentsForReview(supabase, status, page));
    [authors, titles] = await Promise.all([
      loadPublicProfiles(
        supabase,
        comments.map((comment) => comment.user_id),
      ),
      loadStoryTitles(
        supabase,
        comments.map((comment) => comment.story_id),
      ),
    ]);
  } catch {
    failed = true;
  }

  const pages = Math.max(1, Math.ceil(total / reviewPageSize));
  function href(next: { status?: StoryStatus; page?: number }) {
    const params = new URLSearchParams();
    const nextStatus = next.status ?? status;
    if (nextStatus !== "pending") params.set("status", nextStatus);
    if (next.page && next.page > 1) params.set("page", String(next.page));
    const query = params.toString();
    return query ? `/stories/review/comments?${query}` : "/stories/review/comments";
  }

  return (
    <main>
      <Header />
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MODERATION</p>
            <h1>
              Review <span>comments.</span>
            </h1>
            <p className={styles.lead}>
              Publish comments that are on topic and safe to show. Decline ones
              with personal data, advertising, insults or anything unlawful.
              A declined comment stays visible only to its author.
            </p>
          </div>
          <Link href="/stories/review" className={styles.secondary}>
            Review stories
          </Link>
        </header>

        <nav className={styles.filters} aria-label="Comment status">
          {tabs.map((tab) => (
            <Link
              key={tab.status}
              href={href({ status: tab.status })}
              className={styles.chip}
              aria-current={status === tab.status ? "true" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {failed ? (
          <div className={styles.empty}>
            <h2>Comments could not be loaded</h2>
            <p>Reload the page in a moment.</p>
          </div>
        ) : comments.length === 0 ? (
          <div className={styles.empty}>
            <h2>Nothing here</h2>
            <p>
              {status === "pending"
                ? "No comments are waiting for review."
                : "No comments with this status."}
            </p>
          </div>
        ) : (
          <ol className={styles.comments}>
            {comments.map((comment) => {
              const profile = authors.get(comment.user_id);
              const name = profile?.display_name ?? "DocRoute member";
              return (
                <li key={comment.id} className={styles.comment} data-status={comment.status}>
                  <div className={styles.commentHead}>
                    <Link href={`/u/${comment.user_id}`}>
                      <Avatar name={name} path={profile?.avatar_path ?? null} size={30} />
                      {name}
                    </Link>
                    <time dateTime={comment.created_at}>
                      {new Date(comment.created_at).toLocaleString("en-GB", {
                        dateStyle: "medium",
                        timeStyle: "short",
                        timeZone: "Europe/Bratislava",
                      })}
                    </time>
                  </div>
                  <p className={styles.reviewMeta}>
                    On{" "}
                    <Link href={`/stories/${comment.story_id}`}>
                      {titles.get(comment.story_id) ?? "a story"}
                    </Link>
                    {comment.user_id === user.id ? " · your own comment" : ""}
                  </p>
                  <p className={styles.body}>{comment.body}</p>
                  <CommentModerationActions commentId={comment.id} status={comment.status} />
                </li>
              );
            })}
          </ol>
        )}

        {pages > 1 && (
          <nav className={styles.filters} aria-label="Pages" style={{ marginTop: 22 }}>
            {page > 1 && (
              <Link href={href({ page: page - 1 })} className={styles.chip}>
                ← Newer
              </Link>
            )}
            <span className={styles.chip}>
              Page {page} of {pages} · {total} comments
            </span>
            {page < pages && (
              <Link href={href({ page: page + 1 })} className={styles.chip}>
                Older →
              </Link>
            )}
          </nav>
        )}
      </div>
    </main>
  );
}
