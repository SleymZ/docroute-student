"use client";

import { UniversityImage } from "./UniversityImage";
import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowUpRight,
  Bookmark,
  Building2,
  CheckCircle2,
  Search,
} from "lucide-react";

import catalog from "@/data/universities.json";
import { programOptions } from "@/data/demo-destinations";
import {
  verifiedPrograms,
  type VerifiedProgram,
} from "@/data/verified-programs";

import styles from "./ExploreCatalog.module.css";

const PAGE_SIZE = 8;

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function getWebsiteHost(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function UniversityResults() {
  const searchParams = useSearchParams();

  const countryCode =
    searchParams.get("country")?.toUpperCase() ?? "";
  const selectedProgram =
    searchParams.get("program") ?? "";

  const [query, setQuery] = useState("");
  const [scope, setScope] =
    useState<"all" | "verified">("all");
  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);
  const [saved, setSaved] = useState<Set<string>>(
    () => new Set(),
  );

  const validProgram =
    programOptions.includes(selectedProgram);

  const countryUniversities = useMemo(
    () =>
      catalog.universities.filter(
        (university) =>
          university.countryCode === countryCode,
      ),
    [countryCode],
  );

  const countryName =
    countryUniversities[0]?.country ?? "";

  const verifiedByHost = useMemo(() => {
    const result = new Map<string, VerifiedProgram[]>();

    for (const program of verifiedPrograms) {
      if (program.category !== selectedProgram) {
        continue;
      }

      const existing =
        result.get(program.universityHost) ?? [];

      existing.push(program);
      result.set(program.universityHost, existing);
    }

    return result;
  }, [selectedProgram]);

  const universityResults = useMemo(() => {
    const normalizedQuery = normalize(query);

    return countryUniversities
      .map((university) => {
        const host = getWebsiteHost(university.website);
        const matchingPrograms =
          verifiedByHost.get(host) ?? [];

        return {
          ...university,
          matchingPrograms,
          verified: matchingPrograms.length > 0,
        };
      })
      .filter((university) => {
        if (scope === "verified" && !university.verified) {
          return false;
        }

        const searchText = normalize(
          [
            university.name,
            university.country,
            university.region ?? "",
          ].join(" "),
        );

        return searchText.includes(normalizedQuery);
      })
      .sort(
        (a, b) =>
          Number(b.verified) - Number(a.verified) ||
          a.name.localeCompare(b.name),
      );
  }, [
    countryUniversities,
    query,
    scope,
    verifiedByHost,
  ]);

  const verifiedCount = countryUniversities.filter(
    (university) =>
      verifiedByHost.has(
        getWebsiteHost(university.website),
      ),
  ).length;

  function toggleSaved(id: string) {
    setSaved((current) => {
      const next = new Set(current);

      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }

      return next;
    });
  }

  if (!countryCode || !validProgram || !countryName) {
    return (
      <div className={styles.invalidPage}>
        <Building2 size={34} aria-hidden="true" />

        <h1>Choose your filters first</h1>

        <p>
          Return to Explore and select a country and study
          interest.
        </p>

        <Link href="/explore">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to Explore
        </Link>
      </div>
    );
  }

  return (
    <div className={styles.resultsPage}>
      <nav className={styles.breadcrumb}>
        <Link href="/explore">
          <ArrowLeft size={16} aria-hidden="true" />
          Explore
        </Link>

        <span>/</span>
        <span>{countryName}</span>
        <span>/</span>
        <strong>{selectedProgram}</strong>
      </nav>

      <header className={styles.resultsHeader}>
        <div>
          <p className={styles.eyebrow}>
            UNIVERSITY EXPLORER
          </p>

          <h1>
            Universities in <span>{countryName}</span>
          </h1>

          <p>
            Exploring options related to{" "}
            <strong>{selectedProgram}</strong>.
          </p>
        </div>

        <Image
          src={`https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`}
          alt={`${countryName} flag`}
          width={80}
          height={60}
          unoptimized
          className={styles.resultsFlag}
        />
      </header>

      <section className={styles.resultsToolbar}>
        <label className={styles.resultsSearch}>
          <Search size={18} aria-hidden="true" />

          <input
            type="search"
            placeholder="Search universities"
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setVisibleCount(PAGE_SIZE);
            }}
          />
        </label>

        <div
          className={styles.scopeTabs}
          aria-label="Result type"
        >
          <button
            type="button"
            aria-pressed={scope === "all"}
            onClick={() => {
              setScope("all");
              setVisibleCount(PAGE_SIZE);
            }}
          >
            All institutions
            <span>{countryUniversities.length}</span>
          </button>

          <button
            type="button"
            disabled={verifiedCount === 0}
            aria-pressed={scope === "verified"}
            onClick={() => {
              setScope("verified");
              setVisibleCount(PAGE_SIZE);
            }}
          >
            Verified matches
            <span>{verifiedCount}</span>
          </button>
        </div>
      </section>

      <div className={styles.verificationNotice}>
        <CheckCircle2 size={19} aria-hidden="true" />

        <p>
          Verified matches have an official source confirming the
          selected field. Other institutions remain visible, but
          their {selectedProgram} programs have not been reviewed
          yet.
        </p>
      </div>

      <div className={styles.resultMeta} role="status">
        Showing {Math.min(visibleCount, universityResults.length)}{" "}
        of {universityResults.length}
      </div>

      <section
        className={styles.universityFeed}
        aria-label="Universities"
      >
        {universityResults
          .slice(0, visibleCount)
          .map((university, index) => {
            const isSaved = saved.has(university.id);

            return (
              <article
                key={university.id}
                className={styles.universityCard}
              >
                <div className={styles.universityVisual}>
  <UniversityImage
    name={university.name}
    country={university.country}
  />

  <span className={styles.cardNumber}>
    {String(index + 1).padStart(2, "0")}
  </span>

  <Image
    src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
    alt=""
    width={34}
    height={25}
    unoptimized
    className={styles.cardFlag}
  />
</div>

                <div className={styles.universityContent}>
                  <div className={styles.cardStatus}>
                    {university.verified ? (
                      <span className={styles.verifiedBadge}>
                        <CheckCircle2
                          size={14}
                          aria-hidden="true"
                        />
                        Program verified
                      </span>
                    ) : (
                      <span className={styles.pendingBadge}>
                        Program review pending
                      </span>
                    )}

                    <button
                      type="button"
                      aria-label={
                        isSaved
                          ? `Remove ${university.name} from saved`
                          : `Save ${university.name}`
                      }
                      aria-pressed={isSaved}
                      className={`${styles.saveButton} ${
                        isSaved ? styles.saved : ""
                      }`}
                      onClick={() =>
                        toggleSaved(university.id)
                      }
                    >
                      <Bookmark
                        size={18}
                        fill={
                          isSaved ? "currentColor" : "none"
                        }
                        aria-hidden="true"
                      />
                    </button>
                  </div>

                  <p className={styles.location}>
                    {university.country}
                    {university.region
                      ? ` · ${university.region}`
                      : ""}
                  </p>

                  <h2>{university.name}</h2>

                  {university.matchingPrograms.length > 0 ? (
                    <div className={styles.programMatches}>
                      {university.matchingPrograms.map(
                        (program) => (
                          <div
                            key={`${program.universityHost}-${program.programName}`}
                          >
                            <strong>
                              {program.programName}
                            </strong>

                            <span>
                              {program.degree} ·{" "}
                              {program.languages.join(", ")}
                            </span>

                            <a
                              href={program.sourceUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Official program source
                              <ArrowUpRight
                                size={14}
                                aria-hidden="true"
                              />
                            </a>
                          </div>
                        ),
                      )}
                    </div>
                  ) : (
                    <p className={styles.pendingText}>
                      We have not yet verified whether this
                      institution offers {selectedProgram}. It is
                      shown as part of the complete country
                      directory.
                    </p>
                  )}

                  <div className={styles.cardActions}>
                    <a
                      href={university.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.officialLink}
                    >
                      University website
                      <ArrowUpRight
                        size={17}
                        aria-hidden="true"
                      />
                    </a>
                  </div>
                </div>
              </article>
            );
          })}
      </section>

      {universityResults.length === 0 && (
        <div className={styles.noResults}>
          <h2>No universities found</h2>
          <p>Try changing the search or result type.</p>
        </div>
      )}

      {visibleCount < universityResults.length && (
        <button
          type="button"
          className={styles.loadMore}
          onClick={() =>
            setVisibleCount(
              (current) => current + PAGE_SIZE,
            )
          }
        >
          Show more universities
        </button>
      )}
    </div>
  );
}