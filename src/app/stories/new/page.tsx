import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { Header } from "@/components/Header";
import { PublicProfileEditor } from "@/components/PublicProfileEditor";
import { OwnStory, StoryForm } from "@/components/StoryForm";
import styles from "@/components/Stories.module.css";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadOwnStories, loadPublicProfile } from "@/lib/supabase/stories";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Share your story",
  robots: { index: false, follow: false },
};

export default async function NewStoryPage() {
  if (!isSupabaseConfigured()) redirect("/stories");

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/auth?mode=login&next=/stories/new");

  let failed = false;
  let profile = null;
  let ownStories: Awaited<ReturnType<typeof loadOwnStories>> = [];
  try {
    [profile, ownStories] = await Promise.all([
      loadPublicProfile(supabase, user.id),
      loadOwnStories(supabase, user.id),
    ]);
  } catch {
    failed = true;
  }

  return (
    <main>
      <Header />
      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>SHARE YOUR STORY</p>
            <h1>
              Tell the next person <span>how you did it.</span>
            </h1>
            <p className={styles.lead}>
              Your story appears on the <Link href="/stories">Stories page</Link>{" "}
              after a short review, with your public name and photo.
            </p>
          </div>
        </header>

        {failed ? (
          <p className={styles.notice}>
            Your profile could not be loaded. Reload the page in a moment.
          </p>
        ) : !profile ? (
          <>
            <p className={styles.notice}>
              First choose the name (and, if you like, a photo) shown with your
              stories.
            </p>
            <PublicProfileEditor userId={user.id} initialProfile={null} />
          </>
        ) : (
          <StoryForm userId={user.id} storyCount={ownStories.length} />
        )}

        {ownStories.length > 0 && (
          <>
            <h2 className={styles.sectionTitle} id="your-stories">
              Your stories
            </h2>
            <p className={styles.notice}>
              Only you can see stories that are waiting for review. New and
              edited stories appear on the Stories page after review; you can
              edit or delete your stories at any time.
            </p>
            <div className={styles.grid}>
              {ownStories.map((story) => (
                <OwnStory key={story.id} story={story} author={profile} userId={user.id} />
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  );
}
