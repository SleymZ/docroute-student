import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Avatar } from "@/components/Avatar";
import { Header } from "@/components/Header";
import { StoryCard } from "@/components/StoryCard";
import styles from "@/components/Stories.module.css";
import { isUuid } from "@/lib/stories";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import {
  loadEngagement,
  loadPublicProfile,
  loadPublishedStories,
  loadStoryPhotos,
} from "@/lib/supabase/stories";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ id: string }> };

async function load(id: string) {
  if (!isUuid(id) || !isSupabaseConfigured()) return null;
  const supabase = await createSupabaseServerClient();
  const profile = await loadPublicProfile(supabase, id);
  if (!profile) return null;
  const stories = await loadPublishedStories(supabase, { userId: id });
  const ids = stories.map((story) => story.id);
  const [photos, engagement] = await Promise.all([
    loadStoryPhotos(supabase, ids).catch(() => null),
    loadEngagement(supabase, ids).catch(() => null),
  ]);
  return { profile, stories, photos, engagement };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const data = await load(id).catch(() => null);
  return {
    title: data ? `${data.profile.display_name} on DocRoute` : "Profile",
    // Profiles without published stories stay out of search engines.
    robots: data && data.stories.length > 0 ? undefined : { index: false, follow: false },
  };
}

export default async function PublicProfilePage({ params }: Props) {
  const { id } = await params;
  const data = await load(id);
  if (!data) notFound();
  const { profile, stories, photos, engagement } = data;

  return (
    <main>
      <Header />
      <div className={styles.page}>
        <header className={styles.profileHead}>
          <Avatar name={profile.display_name} path={profile.avatar_path} size={96} />
          <div>
            <p className={styles.eyebrow}>DOCROUTE MEMBER</p>
            <h1>{profile.display_name}</h1>
            {profile.bio && <p className={styles.lead}>{profile.bio}</p>}
          </div>
        </header>

        <h2 className={styles.sectionTitle}>
          {stories.length ? "Stories" : "No published stories yet"}
        </h2>
        {stories.length > 0 && (
          <div className={styles.grid}>
            {stories.map((story) => (
              <StoryCard
                key={story.id}
                story={story}
                author={profile}
                headingLevel={3}
                photos={photos?.get(story.id)}
                engagement={engagement?.get(story.id) ?? { likes: 0, comments: 0 }}
                href={`/stories/${story.id}`}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
