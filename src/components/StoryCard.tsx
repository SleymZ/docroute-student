import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap, Heart, MessageCircle } from "lucide-react";

import { applicantCountryOptions } from "@/data/applicant-countries";
import {
  storyExcerpt,
  storyPurposeLabels,
  type PublicProfile,
  type StoryEngagement,
  type StoryPhoto,
  type SuccessStory,
} from "@/lib/stories";

import { Avatar } from "./Avatar";
import styles from "./Stories.module.css";
import { flagSrc } from "@/lib/flags";

export function storyCountryName(code: string) {
  return applicantCountryOptions.find((country) => country.code === code)?.name ?? code;
}

function Flag({ code }: { code: string }) {
  if (code === "ZZ") return null;
  return (
    <Image
      src={flagSrc(code)}
      alt=""
      width={20}
      height={15}
      unoptimized
    />
  );
}

const statusLabels = {
  pending: "Waiting for review",
  published: "Published",
  hidden: "Not published",
} as const;

// Photos of one story: the first as a cover (lists), or all of them as
// thumbnails (moderation and the author's own list).
export function StoryPhotos({
  photos,
  title,
  layout,
}: {
  photos: StoryPhoto[];
  title: string;
  layout: "cover" | "all";
}) {
  const shown = photos.filter((photo) => photo.url);
  if (shown.length === 0) return null;
  if (layout === "cover") {
    const [cover] = shown;
    return (
      <div className={styles.cover}>
        {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL, resized on upload */}
        <img src={cover.url!} alt={`Photo from the story “${title}”`} loading="lazy" />
        {shown.length > 1 && (
          <span className={styles.coverCount}>+{shown.length - 1}</span>
        )}
      </div>
    );
  }
  return (
    <div className={styles.thumbs}>
      {shown.map((photo, index) => (
        <a key={photo.id} href={photo.url!} target="_blank" rel="noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element -- signed Supabase URL, resized on upload */}
          <img
            src={photo.url!}
            alt={`Photo ${index + 1} of ${shown.length} from the story “${title}”`}
            loading="lazy"
          />
        </a>
      ))}
    </div>
  );
}

export function StoryCard({
  story,
  author,
  showStatus = false,
  headingLevel = 2,
  photos = [],
  photoLayout = "cover",
  engagement,
  href,
}: {
  story: SuccessStory;
  author: PublicProfile | null;
  showStatus?: boolean;
  headingLevel?: 2 | 3;
  photos?: StoryPhoto[];
  photoLayout?: "cover" | "all";
  engagement?: StoryEngagement;
  // the story's own page, where people like and comment
  href?: string;
}) {
  const Heading = headingLevel === 2 ? "h2" : "h3";
  const excerpt = storyExcerpt(story.body);
  const long = excerpt !== story.body.trim();
  const name = author?.display_name ?? "DocRoute member";
  const date = story.published_at ?? story.created_at;

  return (
    <article className={styles.card}>
      {showStatus && (
        <span className={styles.status} data-status={story.status}>
          {statusLabels[story.status]}
        </span>
      )}

      {author ? (
        <Link href={`/u/${author.user_id}`} className={styles.author}>
          <Avatar name={name} path={author.avatar_path} />
          <span>
            <strong>{name}</strong>
            <small>
              {new Date(date).toLocaleDateString("en-GB", {
                month: "long",
                year: "numeric",
              })}
            </small>
          </span>
        </Link>
      ) : null}

      <p className={styles.routeLine}>
        <Flag code={story.from_country_code} />
        {storyCountryName(story.from_country_code)}
        <ArrowRight size={14} aria-label="to" />
        <Flag code={story.to_country_code} />
        {storyCountryName(story.to_country_code)}
        <span className={styles.tag}>{storyPurposeLabels[story.purpose]}</span>
        <span className={styles.tag}>{story.moved_year}</span>
      </p>

      <StoryPhotos photos={photos} title={story.title} layout={photoLayout} />

      <Heading>{href ? <Link href={href}>{story.title}</Link> : story.title}</Heading>

      {story.university && (
        <p className={styles.routeLine}>
          <GraduationCap size={15} aria-hidden="true" />
          {story.university}
        </p>
      )}

      {long ? (
        <>
          <p className={`${styles.body} ${styles.excerpt}`}>{excerpt}</p>
          <details>
            <summary>Read the whole story</summary>
            <p className={styles.body}>{story.body}</p>
          </details>
        </>
      ) : (
        <p className={styles.body}>{story.body}</p>
      )}

      {(engagement || href) && (
        <div className={styles.engagementLine}>
          {engagement && (
            <>
              <span>
                <Heart size={15} aria-hidden="true" />
                {engagement.likes}
                <span className={styles.srOnly}>{engagement.likes === 1 ? " like" : " likes"}</span>
              </span>
              <span>
                <MessageCircle size={15} aria-hidden="true" />
                {engagement.comments}
                <span className={styles.srOnly}>
                  {engagement.comments === 1 ? " comment" : " comments"}
                </span>
              </span>
            </>
          )}
          {href && (
            <Link href={href} className={styles.openStory}>
              Open, like and comment
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </div>
      )}
    </article>
  );
}
