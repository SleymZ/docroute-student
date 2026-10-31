import type { Metadata } from "next";
import Link from "next/link";
import { PenLine } from "lucide-react";

import { Header } from "@/components/Header";
import { StoryCard, storyCountryName } from "@/components/StoryCard";
import styles from "@/components/Stories.module.css";
import { storyPurposeLabels, storyPurposes, type PublicProfile } from "@/lib/stories";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  countPendingStories,
  isStoryModerator,
  loadOwnStories,
  loadPublicProfiles,
  loadPublishedStories,
} from "@/lib/supabase/stories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Moving stories",
  description:
    "Real stories from people who moved to study, work or join family in Europe with DocRoute.",
  alternates: { canonical: "/stories" },
};

type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function StoriesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>;
}) {
  const raw = await searchParams;
  const purposeParam = first(raw.purpose);
  const purpose = storyPurposes.find((item) => item === purposeParam);
  const toParam = first(raw.to)?.toUpperCase();
  const to = toParam && /^[A-Z]{2}$/.test(toParam) ? toParam : undefined;

  let stories: Awaited<ReturnType<typeof loadPublishedStories>> = [];
  let authors = new Map<string, PublicProfile>();
  let failed = false;
  // signed-in extras: own stories not yet public, and the moderator queue
  let ownWaiting = 0;
  let reviewQueue: number | null = null;

  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      stories = await loadPublishedStories(supabase, { purpose, toCountryCode: to });
      authors = await loadPublicProfiles(
        supabase,
        stories.map((story) => story.user_id),
      );
    } catch {
      failed = true;
    }
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        const [own, moderator] = await Promise.all([
          loadOwnStories(supabase, user.id),
          isStoryModerator(supabase),
        ]);
        ownWaiting = own.filter((story) => story.status !== "published").length;
        if (moderator) reviewQueue = await countPendingStories(supabase);
      }
    } catch {
      // the extras are optional; the public list above still shows
    }
  }

  function filterHref(next: { purpose?: string; to?: string }) {
    const params = new URLSearchParams();
    if (next.purpose) params.set("purpose", next.purpose);
    if (next.to) params.set("to", next.to);
    const query = params.toString();
    return query ? `/stories?${query}` : "/stories";
  }

  return (
    <main>
      <Header />
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>COMMUNITY</p>
            <h1>
              People who made <span>the move.</span>
            </h1>
            <p className={styles.lead}>
              Stories from DocRoute users who moved to study, work, join family
              or start a business. Each one is read before it is published.
              Personal experience, not legal advice: rules change, so check
              your own route.
            </p>
          </div>
          <Link href="/stories/new" className={styles.primary}>
            <PenLine size={16} aria-hidden="true" />
            Share your story
          </Link>
        </header>

        {reviewQueue !== null && (
          <p className={styles.notice}>
            Moderator:{" "}
            <Link href="/stories/review">
              {reviewQueue === 1
                ? "1 story is waiting for review"
                : `${reviewQueue} stories are waiting for review`}
            </Link>
            .
          </p>
        )}
        {ownWaiting > 0 && (
          <p className={styles.notice}>
            {ownWaiting === 1
              ? "You have 1 story that is not public yet."
              : `You have ${ownWaiting} stories that are not public yet.`}{" "}
            Only you can see {ownWaiting === 1 ? "it" : "them"} until reviewed:{" "}
            <Link href="/stories/new#your-stories">see, edit or delete your stories</Link>.
          </p>
        )}

        <nav className={styles.filters} aria-label="Filter stories">
          <Link
            href={filterHref({ to })}
            className={styles.chip}
            aria-current={!purpose ? "true" : undefined}
          >
            All reasons
          </Link>
          {storyPurposes.map((item) => (
            <Link
              key={item}
              href={filterHref({ purpose: item, to })}
              className={styles.chip}
              aria-current={purpose === item ? "true" : undefined}
            >
              {storyPurposeLabels[item]}
            </Link>
          ))}
          {to && (
            <Link href={filterHref({ purpose })} className={styles.chip} aria-current="true">
              To {storyCountryName(to)} ✕
            </Link>
          )}
        </nav>

        {failed ? (
          <div className={styles.empty}>
            <h2>Stories could not be loaded</h2>
            <p>Reload the page in a moment.</p>
          </div>
        ) : stories.length === 0 ? (
          <div className={styles.empty}>
            <h2>{purpose || to ? "No stories here yet" : "Be the first to share"}</h2>
            <p>
              Moved with DocRoute&apos;s help? Your story can show the next
              person that it is possible.
            </p>
            <p>
              <Link href="/stories/new" className={styles.primary}>
                Share your story
              </Link>
            </p>
          </div>
        ) : (
          <div className={styles.grid}>
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                author={authors.get(story.user_id) ?? null}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
