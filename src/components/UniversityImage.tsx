"use client";

import { useEffect, useState } from "react";

import styles from "./UniversityImage.module.css";

type UniversityImageProps = {
  name: string;
  country: string;
  className?: string;
  showCredit?: boolean;
};

type UniversityMedia = {
  imageUrl: string | null;
  sourcePage: string | null;
  author: string | null;
  license: string | null;
  licenseUrl: string | null;
};

function getInitials(name: string) {
  const ignoredWords = new Set([
    "of",
    "the",
    "and",
    "in",
    "university",
  ]);

  const initials = name
    .split(/\s+/)
    .filter(
      (word) => !ignoredWords.has(word.toLowerCase()),
    )
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase())
    .join("");

  return initials || "U";
}

export function UniversityImage({
  name,
  country,
  className = "",
  showCredit = false,
}: UniversityImageProps) {
  const [media, setMedia] =
    useState<UniversityMedia | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    const searchParams = new URLSearchParams({
      name,
      country,
    });

    async function loadImage() {
      try {
        const response = await fetch(
          `/api/university-image?${searchParams.toString()}`,
          {
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          return;
        }

        const result =
          (await response.json()) as UniversityMedia;

        setMedia(result);
      } catch (error) {
        if (
          error instanceof Error &&
          error.name !== "AbortError"
        ) {
          console.error(
            "Could not load university image:",
            error,
          );
        }
      }
    }

    void loadImage();

    return () => {
      controller.abort();
    };
  }, [name, country]);

  const photoStyle = media?.imageUrl
    ? {
        backgroundImage: `url("${media.imageUrl.replaceAll(
          '"',
          "%22",
        )}")`,
      }
    : undefined;

  return (
    <div
      className={`${styles.root} ${className}`}
      role="img"
      aria-label={`${name} campus`}
    >
      <div className={styles.placeholder}>
        <span>{getInitials(name)}</span>
      </div>

      {media?.imageUrl && (
        <div
          className={styles.photo}
          style={photoStyle}
          aria-hidden="true"
        />
      )}

      <div className={styles.overlay} />

      {showCredit &&
        media?.sourcePage &&
        media.imageUrl && (
          <a
            href={media.sourcePage}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.credit}
          >
            {media.author
              ? `Photo: ${media.author}`
              : "Photo source"}

            {media.license
              ? ` · ${media.license}`
              : ""}
          </a>
        )}
    </div>
  );
}