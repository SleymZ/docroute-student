import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, GraduationCap } from "lucide-react";

import { Avatar } from "@/components/Avatar";
import { Header } from "@/components/Header";
import { storyCountryName } from "@/components/StoryCard";
import {
  CommentForm,
  DeleteCommentButton,
  LikeButton,
  RemovePhotoButton,
} from "@/components/StoryEngagement";
import { DeleteStoryButton } from "@/components/StoryForm";
import styles from "@/components/Stories.module.css";
import {
  isUuid,
  storyExcerpt,
  storyPurposeLabels,
  type PublicProfile,
  type StoryComment,
  type StoryPhoto,
} from "@/lib/stories";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  hasLiked,
  isStoryModerator,
  commentPageSize,
  loadComments,
  loadOwnUnpublishedComments,
  loadEngagement,
  loadPublicProfiles,
  loadStory,
  loadStoryPhotos,
} from "@/lib/supabase/stories";

export const dynamic = "force-dynamic";

type Props = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

async function loadStoryPage(id: string) {
  if (!isUuid(id) || !isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  // RLS: published stories for everyone, own stories for their author,
  // everything for moderators.
  const story = await loadStory(supabase, id);
  if (!story) return null;
  return { supabase, story };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await loadStoryPage(id).catch(() => null);
  if (!data) return { title: "Story", robots: { index: false, follow: false } };
  const { story } = data;
  return {
    title: story.title,
    description: storyExcerpt(story.body, 150),
    alternates: { canonical: `/stories/${story.id}` },
    robots: story.status === "published" ? undefined : { index: false, follow: false },
  };
}

const statusNotes = {
  pending: "Waiting for review: only you (and moderators) can see this story for now.",
  hidden: "Not published: only you (and moderators) can see this story.",
} as const;

export default async function StoryPage({ params, searchParams }: Props) {
  const { id } = await params;
  const raw = (await searchParams) ?? {};
  const pageParam = Number(Array.isArray(raw.comments) ? raw.comments[0] : raw.comments);
  const commentPage = Number.isInteger(pageParam) && pageParam > 1 ? pageParam : 1;
  const data = await loadStoryPage(id);
  if (!data) notFound();
  const { supabase, story } = data;

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Each extra loads on its own, so the story still shows if one fails
  // (for example before the photos/comments migration has been run).
  const none = <T,>(value: T) => () => value;
  const [photoMap, commentList, ownWaiting, engagement, liked, moderator] = await Promise.all([
    loadStoryPhotos(supabase, [story.id]).catch(none(new Map<string, StoryPhoto[]>())),
    loadComments(supabase, story.id, commentPage).catch(
      none<{ comments: StoryComment[]; total: number } | null>(null),
    ),
    user
      ? loadOwnUnpublishedComments(supabase, story.id, user.id).catch(none<StoryComment[]>([]))
      : Promise.resolve<StoryComment[]>([]),
    loadEngagement(supabase, [story.id]).catch(none(new Map<string, { likes: number }>())),
    user ? hasLiked(supabase, story.id, user.id) : Promise.resolve(false),
    user ? isStoryModerator(supabase) : Promise.resolve(false),
  ]);
  const photos = (photoMap.get(story.id) ?? []).filter((photo) => photo.url);
  const extrasFailed = commentList === null;
  const publishedComments = commentList?.comments ?? [];
  const publishedCount = commentList?.total ?? 0;
  const commentPages = Math.max(1, Math.ceil(publishedCount / commentPageSize));
  const comments = [...publishedComments, ...ownWaiting];
  const likes = engagement.get(story.id)?.likes ?? 0;
  const profiles: Map<string, PublicProfile> = await loadPublicProfiles(supabase, [
    story.user_id,
    ...comments.map((comment) => comment.user_id),
    ...(user ? [user.id] : []),
  ]).catch(none(new Map<string, PublicProfile>()));

  const author = profiles.get(story.user_id) ?? null;
  const authorName = author?.display_name ?? "DocRoute member";
  const viewerHasProfile = user ? profiles.has(user.id) : false;
  const published = story.status === "published";
  const date = story.published_at ?? story.created_at;
  const visibleComments = comments;

  return (
    <main>
      <Header />
      <div className={styles.page}>
        <Link href="/stories" className={styles.backLink}>
          <ArrowLeft size={16} aria-hidden="true" />
          All stories
        </Link>

        <article className={styles.storyArticle}>
          {story.status !== "published" && (
            <p className={styles.notice}>{statusNotes[story.status]}</p>
          )}

          {author ? (
            <Link href={`/u/${author.user_id}`} className={styles.author}>
              <Avatar name={authorName} path={author.avatar_path} />
              <span>
                <strong>{authorName}</strong>
                <small>
                  {new Date(date).toLocaleDateString("en-GB", { month: "long", year: "numeric" })}
                </small>
              </span>
            </Link>
          ) : null}

          <p className={styles.routeLine}>
            {storyCountryName(story.from_country_code)}
            <ArrowRight size={14} aria-label="to" />
            {storyCountryName(story.to_country_code)}
            <span className={styles.tag}>{storyPurposeLabels[story.purpose]}</span>
            <span className={styles.tag}>{story.moved_year}</span>
          </p>

          <h1>{story.title}</h1>

          {story.university && (
            <p className={styles.routeLine}>
              <GraduationCap size={15} aria-hidden="true" />
              {story.university}
            </p>
          )}

          {photos.length > 0 && (
            <div className={styles.gallery}>
              {photos.map((photo, index) => (
                <figure key={photo.id} style={{ margin: 0, display: "grid", gap: 8 }}>
                  <a href={photo.url!} target="_blank" rel="noreferrer">
                    {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL, resized on upload */}
                    <img
                      src={photo.url!}
                      alt={`Photo ${index + 1} of ${photos.length} from the story “${story.title}”`}
                      loading={index === 0 ? "eager" : "lazy"}
                    />
                  </a>
                  {moderator && user?.id !== story.user_id && (
                    <RemovePhotoButton photoId={photo.id} path={photo.path} />
                  )}
                </figure>
              ))}
            </div>
          )}

          <p className={styles.body}>{story.body}</p>

          <p className={styles.panelLead}>
            Personal experience, not legal advice: rules change, so check your own route.
          </p>

          {user?.id === story.user_id && (
            <section className={styles.ownerPanel} aria-label="Your story">
              <p>
                <strong>This is your story.</strong> You can change it or delete it, with its photos, comments and
                likes, at any time.
              </p>
              <div className={styles.actions}>
                <Link href="/stories/new#your-stories" className={styles.secondary}>
                  Edit story
                </Link>
              </div>
              <DeleteStoryButton storyId={story.id} userId={story.user_id} redirectTo="/stories" />
            </section>
          )}

          {published && (
            <div>
              <LikeButton
                storyId={story.id}
                userId={user?.id ?? null}
                initialLiked={liked}
                initialCount={likes}
              />
            </div>
          )}
        </article>

        {published && (
          <section aria-labelledby="comments-heading" style={{ marginTop: 36 }}>
            <h2 className={styles.sectionTitle} id="comments-heading">
              Comments ({publishedCount})
            </h2>

            {extrasFailed ? (
              <p className={styles.notice}>Comments could not be loaded. Reload the page in a moment.</p>
            ) : visibleComments.length === 0 ? (
              <p className={styles.panelLead}>No comments yet.</p>
            ) : (
              <ol className={styles.comments}>
                {visibleComments.map((comment) => {
                  const profile = profiles.get(comment.user_id);
                  const name = profile?.display_name ?? "DocRoute member";
                  const mine = comment.user_id === user?.id;
                  return (
                    <li key={comment.id} className={styles.comment} data-status={comment.status}>
                      <div className={styles.commentHead}>
                        <Link href={`/u/${comment.user_id}`}>
                          <Avatar name={name} path={profile?.avatar_path ?? null} size={30} />
                          {name}
                        </Link>
                        <time dateTime={comment.created_at}>
                          {new Date(comment.published_at ?? comment.created_at).toLocaleDateString(
                            "en-GB",
                            { day: "numeric", month: "short", year: "numeric" },
                          )}
                        </time>
                        {comment.status !== "published" && (
                          <span className={styles.status} data-status={comment.status}>
                            {comment.status === "pending" ? "Waiting for review" : "Not published"}
                          </span>
                        )}
                      </div>
                      <p className={styles.body}>{comment.body}</p>
                      {(mine || moderator) && <DeleteCommentButton commentId={comment.id} />}
                    </li>
                  );
                })}
              </ol>
            )}

            {commentPages > 1 && (
              <nav className={styles.filters} aria-label="Comment pages" style={{ marginTop: 14 }}>
                {commentPage > 1 && (
                  <Link
                    href={commentPage === 2 ? `/stories/${story.id}` : `/stories/${story.id}?comments=${commentPage - 1}`}
                    className={styles.chip}
                  >
                    ← Earlier comments
                  </Link>
                )}
                <span className={styles.chip}>
                  Page {commentPage} of {commentPages}
                </span>
                {commentPage < commentPages && (
                  <Link href={`/stories/${story.id}?comments=${commentPage + 1}`} className={styles.chip}>
                    Later comments →
                  </Link>
                )}
              </nav>
            )}

            {!user ? (
              <p className={styles.notice}>
                <Link href={`/auth?mode=login&next=/stories/${story.id}`}>Log in</Link> to like
                and comment.
              </p>
            ) : !viewerHasProfile ? (
              <p className={styles.notice}>
                Comments are shown with your public name.{" "}
                <Link href="/stories/new">Choose a public name</Link> first.
              </p>
            ) : (
              <CommentForm storyId={story.id} userId={user.id} />
            )}
          </section>
        )}
      </div>
    </main>
  );
}
