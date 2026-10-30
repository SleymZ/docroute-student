import Image from "next/image";
import Link from "next/link";
import { ArrowRight, GraduationCap } from "lucide-react";

import { applicantCountryOptions } from "@/data/applicant-countries";
import {
  storyExcerpt,
  storyPurposeLabels,
  type PublicProfile,
  type SuccessStory,
} from "@/lib/stories";

import { Avatar } from "./Avatar";
import styles from "./Stories.module.css";

export function storyCountryName(code: string) {
  return applicantCountryOptions.find((country) => country.code === code)?.name ?? code;
}

function Flag({ code }: { code: string }) {
  if (code === "ZZ") return null;
  return (
    <Image
      src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
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

export function StoryCard({
  story,
  author,
  showStatus = false,
  headingLevel = 2,
}: {
  story: SuccessStory;
  author: PublicProfile | null;
  showStatus?: boolean;
  headingLevel?: 2 | 3;
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

      <Heading>{story.title}</Heading>

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
    </article>
  );
}
