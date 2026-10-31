import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { Header } from "@/components/Header";
import { StoryCard } from "@/components/StoryCard";
import { StoryModerationActions } from "@/components/StoryModeration";
import styles from "@/components/Stories.module.css";
import type { PublicProfile, StoryStatus, SuccessStory } from "@/lib/stories";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  isStoryModerator,
  loadPublicProfiles,
  loadStoriesForReview,
} from "@/lib/supabase/stories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Review stories",
  robots: { index: false, follow: false },
};

const tabs: { status: StoryStatus; label: string }[] = [
  { status: "pending", label: "Waiting for review" },
  { status: "published", label: "Published" },
  { status: "hidden", label: "Declined" },
];

type RawSearchParams = Record<string, string | string[] | undefined>;

export default async function ReviewStoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  if (!isSupabaseConfigured()) notFound();

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=login&next=/stories/review");
  // Not a moderator: the page does not exist for them.
  if (!(await isStoryModerator(supabase))) notFound();

  const raw = await searchParams;
  const param = Array.isArray(raw.status) ? raw.status[0] : raw.status;
  const status = tabs.find((tab) => tab.status === param)?.status ?? "pending";

  let stories: SuccessStory[] = [];
  let authors = new Map<string, PublicProfile>();
  let failed = false;
  try {
    stories = await loadStoriesForReview(supabase, status);
    authors = await loadPublicProfiles(
      supabase,
      stories.map((story) => story.user_id),
    );
  } catch {
    failed = true;
  }

  return (
    <main>
      <Header />
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>MODERATION</p>
            <h1>
              Review <span>stories.</span>
            </h1>
            <p className={styles.lead}>
              Publish stories that are personal experience and safe to show.
              Decline ones with personal data (documents, ID numbers,
              addresses), advertising, or anything unlawful or offensive. A
              declined story stays visible only to its author. Authors who
              edit a story send it back here.
            </p>
          </div>
          <Link href="/stories" className={styles.secondary}>
            Open the Stories page
          </Link>
        </header>

        <nav className={styles.filters} aria-label="Story status">
          {tabs.map((tab) => (
            <Link
              key={tab.status}
              href={tab.status === "pending" ? "/stories/review" : `/stories/review?status=${tab.status}`}
              className={styles.chip}
              aria-current={status === tab.status ? "true" : undefined}
            >
              {tab.label}
            </Link>
          ))}
        </nav>

        {failed ? (
          <div className={styles.empty}>
            <h2>Stories could not be loaded</h2>
            <p>Reload the page in a moment.</p>
          </div>
        ) : stories.length === 0 ? (
          <div className={styles.empty}>
            <h2>Nothing here</h2>
            <p>
              {status === "pending"
                ? "No stories are waiting for review."
                : "No stories with this status."}
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {stories.map((story) => (
              <div key={story.id} className={styles.reviewItem}>
                <StoryCard
                  story={story}
                  author={authors.get(story.user_id) ?? null}
                  showStatus
                />
                <p className={styles.reviewMeta}>
                  Sent{" "}
                  {new Date(story.created_at).toLocaleString("en-GB", {
                    dateStyle: "medium",
                    timeStyle: "short",
                    timeZone: "Europe/Bratislava",
                  })}
                  {story.user_id === user.id ? " · your own story" : ""}
                </p>
                <StoryModerationActions storyId={story.id} status={story.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
