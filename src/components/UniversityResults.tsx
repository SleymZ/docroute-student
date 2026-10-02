"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Bookmark,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  FileText,
  Languages,
  Search,
} from "lucide-react";

import { UniversityImage } from "./UniversityImage";
import catalog from "@/data/universities.json";
import { programOptions } from "@/data/demo-destinations";
import { verifiedPrograms } from "@/data/verified-programs";
import { useApplicantProfile } from "@/hooks/useApplicantProfile";
import { createProfileSearchParams } from "@/lib/profile-query";
import { matchPrograms } from "@/lib/match-programs";
import { formatDegreeLevel } from "@/lib/profile-options";
import type { ProgramMatch } from "@/types/admission";

import styles from "./ExploreCatalog.module.css";
import linkStyles from "./UniversityResults.module.css";

const PAGE_SIZE = 8;

type UniversityResultsProps = {
  mode?: "explore" | "route";
};

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

export function UniversityResults({
  mode = "explore",
}: UniversityResultsProps) {
  const searchParams = useSearchParams();
  const requestedCountryCode =
    searchParams.get("country")?.toUpperCase() ?? "";
  const requestedProgram =
    searchParams.get("program") ?? "";
  const profileState = useApplicantProfile(
    searchParams,
    {
      destinationCountryCode: requestedCountryCode,
      studyCategory: requestedProgram,
    },
    mode === "route",
  );
  const profile = mode === "route" ? profileState.profile : null;
  const countryCode =
    requestedCountryCode || profile?.destinationCountryCode || "";
  const selectedProgram =
    requestedProgram || profile?.studyCategory || "";

  const [query, setQuery] = useState("");
  const [scope, setScope] =
    useState<"all" | "verified">(() =>
      mode === "route" ? "verified" : "all",
    );
  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);
  const [saved, setSaved] = useState<Set<string>>(
    () => new Set(),
  );

  const validProgram =
    programOptions.includes(selectedProgram);

  const verifiedCatalogHosts = useMemo(
    () =>
      new Set(
        verifiedPrograms
          .filter(
            (program) =>
              program.countryCode === countryCode &&
              program.category === selectedProgram,
          )
          .map((program) => program.universityHost),
      ),
    [countryCode, selectedProgram],
  );

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

  const profileMatches = useMemo(
    () =>
      profile ? matchPrograms(profile, verifiedPrograms) : [],
    [profile],
  );

  const verifiedByHost = useMemo(() => {
    const matchesByHost = new Map<string, ProgramMatch[]>();

    for (const match of profileMatches) {
      const existing =
        matchesByHost.get(match.program.universityHost) ?? [];

      existing.push(match);
      matchesByHost.set(match.program.universityHost, existing);
    }

    return matchesByHost;
  }, [profileMatches]);

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
          verified:
            mode === "route"
              ? matchingPrograms.length > 0
              : verifiedCatalogHosts.has(host),
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
    mode,
    query,
    scope,
    verifiedByHost,
    verifiedCatalogHosts,
  ]);

  const verifiedCount = countryUniversities.filter(
    (university) => {
      const host = getWebsiteHost(university.website);

      return mode === "route"
        ? verifiedByHost.has(host)
        : verifiedCatalogHosts.has(host);
    },
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

  if (mode === "route" && profileState.loading) {
    return (
      <div className={styles.invalidPage} role="status">
        <CircleDashed
          className={linkStyles.profileLoader}
          size={34}
          aria-hidden="true"
        />
        <p>Loading your saved profile...</p>
      </div>
    );
  }

  if (mode === "route" && !profile) {
    const profileHref = countryCode && selectedProgram
      ? `/route/profile?${new URLSearchParams({
          country: countryCode,
          program: selectedProgram,
        }).toString()}`
      : "/route/profile";

    return (
      <div className={styles.invalidPage}>
        <FileText size={34} aria-hidden="true" />
        <h1>Complete your applicant profile</h1>
        <p>
          Add your education, residence status, and languages to see
          personalised university matches.
        </p>
        <Link href={profileHref}>
          Continue to profile
          <ArrowRight size={17} aria-hidden="true" />
        </Link>
      </div>
    );
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

  if (mode === "route" && profile && profileMatches.length === 0) {
    const profileParams = createProfileSearchParams(profile);
    const directoryParams = new URLSearchParams({
      country: countryCode,
      program: selectedProgram,
    });

    return (
      <div className={styles.invalidPage}>
        <CircleDashed size={34} aria-hidden="true" />
        <h1>No verified route matches this profile yet</h1>
        <p>
          Your profile is valid and remains saved. DocRoute only presents a
          personalised match after the program, degree and intake have been
          checked against an official university source.
        </p>
        <div className={linkStyles.coverageActions}>
          <Link href={`/route/profile?${profileParams.toString()}`}>
            Edit route choices
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
          <Link href={`/explore/universities?${directoryParams.toString()}`}>
            Browse the public directory
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        </div>
      </div>
    );
  }

  const resultsParams = profile
    ? createProfileSearchParams(profile)
    : new URLSearchParams({
        country: countryCode,
        program: selectedProgram,
      });
  resultsParams.set("flow", mode);

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
            {mode === "route" ? (
              <>
                Personalised for your{" "}
                <strong>
                  {formatDegreeLevel(profile!.degreeLevel)} {selectedProgram}
                </strong>{" "}
                route for {profile!.intake}, education background, and
                languages.
              </>
            ) : (
              <>
                Explore universities offering <strong>{selectedProgram}</strong>
                .
              </>
            )}
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

      {mode === "route" && profile && (
      <section className={linkStyles.profileSnapshot}>
        <div>
          <span className={linkStyles.snapshotIcon}>
            <Languages size={18} aria-hidden="true" />
          </span>
          <p>
            <small>LANGUAGE PROFILE</small>
            <strong>
              {profile.languages
                .map(
                  (language) =>
                    `${language.code.toUpperCase()} ${language.level}`,
                )
                .join(" · ")}
            </strong>
          </p>
        </div>

        <div>
          <span className={linkStyles.snapshotIcon}>
            <FileText size={18} aria-hidden="true" />
          </span>
          <p>
            <small>EDUCATION</small>
            <strong>
              {profile.degreeLevel === "master"
                ? profile.educationStatus === "completed"
                  ? "Bachelor's degree completed"
                  : profile.educationStatus === "final-year"
                    ? "Final year of bachelor's"
                    : "Earlier in bachelor's degree"
                : profile.educationStatus === "completed"
                  ? "Secondary school completed"
                  : profile.educationStatus === "final-year"
                    ? "Currently in final year"
                    : "Before final year"}
            </strong>
          </p>
        </div>

        <Link
          href={`/route/profile?${resultsParams.toString()}`}
        >
          Edit profile
          <ArrowRight size={15} aria-hidden="true" />
        </Link>
      </section>
      )}

      {mode === "explore" && (
        <section
          className={`${linkStyles.profileSnapshot} ${linkStyles.directoryPrompt}`}
        >
          <div>
            <span className={linkStyles.snapshotIcon}>
              <Building2 size={18} aria-hidden="true" />
            </span>
            <p>
              <small>PUBLIC DIRECTORY</small>
              <strong>Browse institutions without an applicant profile.</strong>
            </p>
          </div>
          <Link
            href={`/route/profile?${new URLSearchParams({
              country: countryCode,
              program: selectedProgram,
            }).toString()}`}
          >
            Build a personal route
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>
      )}

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
          {mode === "route"
            ? "Verified matches use published admissions rules and explain what your profile meets, what is conditional, and what still needs preparation. Other institutions remain visible but unverified."
            : "Verified program information is based on published admissions rules. Other institutions remain visible in the complete country directory."}
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
            const firstMatch = university.matchingPrograms[0];
            const displayName =
              firstMatch?.program.universityName ?? university.name;
            const universityParams = new URLSearchParams(resultsParams);

            if (firstMatch) {
              universityParams.set("programId", firstMatch.program.id);
            }

            const universityHref = `/universities/${encodeURIComponent(
              university.id,
            )}?${universityParams.toString()}`;

            return (
              <article
                key={university.id}
                className={styles.universityCard}
              >
                <Link
                  href={universityHref}
                  className={`${styles.universityVisual} ${linkStyles.universityVisualLink}`}
                  aria-label={`Open ${displayName}`}
                >
                  <UniversityImage
                    name={displayName}
                    country={university.country}
                    creditLinks={false}
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
                </Link>

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
                          ? `Remove ${displayName} from saved`
                          : `Save ${displayName}`
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

                  <h2>
                    <Link
                      href={universityHref}
                      className={linkStyles.universityTitleLink}
                    >
                      {displayName}
                    </Link>
                  </h2>

                  {university.matchingPrograms.length > 0 ? (
                    <div className={styles.programMatches}>
                      {university.matchingPrograms.map(
                        (match) => {
                          const programParams = new URLSearchParams(
                            searchParams.toString(),
                          );
                          programParams.set(
                            "programId",
                            match.program.id,
                          );
                          const programHref = `/universities/${encodeURIComponent(
                            university.id,
                          )}?${programParams.toString()}`;

                          return (
                          <div
                            key={match.program.id}
                            className={linkStyles.matchCard}
                          >
                            <div className={linkStyles.matchHeading}>
                              <div>
                                <strong>{match.program.programName}</strong>
                                <span>{match.program.localProgramName}</span>
                              </div>

                              <span
                                className={`${linkStyles.matchStatus} ${
                                  linkStyles[
                                    `status${match.status
                                      .split("-")
                                      .map(
                                        (part) =>
                                          part[0].toUpperCase() + part.slice(1),
                                      )
                                      .join("")}`
                                  ]
                                }`}
                              >
                                {match.status === "strong"
                                  ? "Strong fit"
                                  : match.status === "conditional"
                                    ? "Conditional fit"
                                    : match.status === "preparation-required"
                                      ? "Preparation needed"
                                      : "More information"}
                              </span>
                            </div>

                            <p className={linkStyles.matchSummary}>
                              {match.summary}
                            </p>

                            <div className={linkStyles.matchFacts}>
                              <span>
                                <CalendarDays size={14} aria-hidden="true" />
                                Apply by 31 Mar 2027
                              </span>
                              <span>
                                <Languages size={14} aria-hidden="true" />
                                Slovak
                              </span>
                              <span>
                                <FileText size={14} aria-hidden="true" />
                                {match.requiredDocuments.length} relevant
                                documents
                              </span>
                            </div>

                            <Link
                              href={programHref}
                              className={linkStyles.routeLink}
                            >
                              See my requirements
                              <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                          </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <p className={styles.pendingText}>
                      {mode === "route" && profile
                        ? `We have not yet verified a ${formatDegreeLevel(
                            profile.degreeLevel,
                          ).toLowerCase()} ${selectedProgram} programme here for the ${profile.intake} intake. The institution remains visible in the country directory.`
                        : university.verified
                        ? `Published ${selectedProgram} program information is available. Build a route to see requirements for your profile.`
                        : `We have not yet verified whether this institution offers ${selectedProgram}. It is shown as part of the complete country directory.`}
                    </p>
                  )}

                  <div
                    className={`${styles.cardActions} ${linkStyles.cardActions}`}
                  >
                    <Link
                      href={universityHref}
                      className={linkStyles.profileLink}
                    >
                      View university
                      <ArrowRight
                        size={17}
                        aria-hidden="true"
                      />
                    </Link>

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
