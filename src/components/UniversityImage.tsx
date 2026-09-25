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
  label?: string | null;
};

const visualClasses = [
  styles.variantOne,
  styles.variantTwo,
  styles.variantThree,
  styles.variantFour,
];

function getVisualVariant(value: string) {
  let hash = 0;

  for (
    let index = 0;
    index < value.length;
    index += 1
  ) {
    hash =
      (hash * 31 + value.charCodeAt(index)) >>>
      0;
  }

  return hash % visualClasses.length;
}

function isAbortError(error: unknown) {
  return (
    error instanceof Error &&
    error.name === "AbortError"
  );
}

export function UniversityImage({
  name,
  country,
  className = "",
  showCredit = false,
}: UniversityImageProps) {
  const [
    universityMedia,
    setUniversityMedia,
  ] = useState<UniversityMedia | null>(null);

  const [
    countryMedia,
    setCountryMedia,
  ] = useState<UniversityMedia | null>(null);

  const [
    failedImageUrls,
    setFailedImageUrls,
  ] = useState<string[]>([]);

  const [
    loadedImageUrl,
    setLoadedImageUrl,
  ] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setUniversityMedia(null);
    setCountryMedia(null);
    setFailedImageUrls([]);
    setLoadedImageUrl(null);

    const universitySearchParams =
      new URLSearchParams({
        name,
        country,
      });

    const countrySearchParams =
      new URLSearchParams({
        country,

        /*
         * Название университета используется как seed.
         * Благодаря этому разные университеты получают
         * разные фотографии.
         */
        seed: name,
      });

    async function requestMedia(
      url: string,
    ): Promise<UniversityMedia | null> {
      const response = await fetch(url, {
        signal: controller.signal,
      });

      if (!response.ok) {
        return null;
      }

      return (await response.json()) as UniversityMedia;
    }

    async function loadUniversityMedia() {
      try {
        const result = await requestMedia(
          `/api/university-image?${universitySearchParams.toString()}`,
        );

        if (!controller.signal.aborted) {
          setUniversityMedia(result);
        }
      } catch (error) {
        if (!isAbortError(error)) {
          console.error(
            "Could not load university image:",
            error,
          );
        }
      }
    }

    async function loadCountryMedia() {
      try {
        const result = await requestMedia(
          `/api/country-image?${countrySearchParams.toString()}`,
        );

        if (!controller.signal.aborted) {
          setCountryMedia(result);
        }
      } catch (error) {
        if (!isAbortError(error)) {
          console.error(
            "Could not load country image:",
            error,
          );
        }
      }
    }

    /*
     * Запросы выполняются параллельно.
     * Фото университета всегда имеет приоритет.
     */
    void loadUniversityMedia();
    void loadCountryMedia();

    return () => {
      controller.abort();
    };
  }, [name, country]);

  const usableUniversityMedia =
    universityMedia?.imageUrl &&
    !failedImageUrls.includes(
      universityMedia.imageUrl,
    )
      ? universityMedia
      : null;

  const usableCountryMedia =
    countryMedia?.imageUrl &&
    !failedImageUrls.includes(
      countryMedia.imageUrl,
    )
      ? countryMedia
      : null;

  const activeMedia =
    usableUniversityMedia ??
    usableCountryMedia;

  const activeImageUrl =
    activeMedia?.imageUrl ?? null;

  const isCountryFallback = Boolean(
    activeMedia &&
      usableCountryMedia &&
      activeMedia === usableCountryMedia,
  );

  const imageLoaded =
    activeImageUrl === loadedImageUrl;

  const visualClass =
    visualClasses[getVisualVariant(name)];

  const shouldShowCredit = Boolean(
    activeMedia?.sourcePage &&
      (showCredit ||
        isCountryFallback ||
        activeMedia.license),
  );

  const ariaLabel = activeImageUrl
    ? isCountryFallback
      ? `${country} city visual used for ${name}`
      : `${name} campus`
    : `Decorative university visual for ${name}`;

  function handleImageError() {
    if (!activeImageUrl) {
      return;
    }

    setFailedImageUrls((currentUrls) => {
      if (
        currentUrls.includes(activeImageUrl)
      ) {
        return currentUrls;
      }

      return [
        ...currentUrls,
        activeImageUrl,
      ];
    });
  }

  return (
    <div
      className={`${styles.root} ${className}`}
      role="img"
      aria-label={ariaLabel}
    >
      <div
        className={`${styles.placeholder} ${visualClass}`}
        aria-hidden="true"
      >
        <div className={styles.fallbackGlow} />

        <div className={styles.campus}>
          <div className={styles.campusRoof} />

          <div className={styles.campusBody}>
            <div
              className={styles.campusColumns}
            >
              <span />
              <span />
              <span />
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className={styles.campusSteps}>
            <span />
            <span />
            <span />
          </div>
        </div>

        <div
          className={styles.placeholderCopy}
        >
          <span>University directory</span>
          <strong>{country}</strong>
        </div>
      </div>

      {activeImageUrl && (
        // A native image is used because its source is
        // dynamic and an onError fallback is required.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={activeImageUrl}
          src={activeImageUrl}
          alt=""
          loading="lazy"
          decoding="async"
          className={`${styles.photo} ${
            imageLoaded
              ? styles.photoLoaded
              : ""
          }`}
          onLoad={() =>
            setLoadedImageUrl(
              activeImageUrl,
            )
          }
          onError={handleImageError}
        />
      )}

      <div
        className={styles.overlay}
        aria-hidden="true"
      />

      {isCountryFallback && (
        <span className={styles.visualLabel}>
          {activeMedia?.label ??
            `${country} city visual`}
        </span>
      )}

      {shouldShowCredit &&
        activeMedia?.sourcePage && (
          <div className={styles.credit}>
            <a
              href={activeMedia.sourcePage}
              target="_blank"
              rel="noopener noreferrer"
            >
              {activeMedia.author
                ? `Photo: ${activeMedia.author}`
                : "Photo source"}
            </a>

            {activeMedia.license && (
              <>
                <span aria-hidden="true">
                  ·
                </span>

                {activeMedia.licenseUrl ? (
                  <a
                    href={
                      activeMedia.licenseUrl
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {activeMedia.license}
                  </a>
                ) : (
                  <span>
                    {activeMedia.license}
                  </span>
                )}
              </>
            )}
          </div>
        )}
    </div>
  );
}