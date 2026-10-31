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

import { PendingPrograms } from "./PendingPrograms";
import { UniversityImage } from "./UniversityImage";
import catalog from "@/data/universities.json";
import { programOptions } from "@/data/demo-destinations";
import {
  findPendingProgramGroups,
  pendingStatusLabel,
} from "@/data/pending-programs";
import { verifiedPrograms } from "@/data/verified-programs";
import { topUniversities } from "@/data/top-universities";
import { topFieldRequirements } from "@/data/top-field-requirements";
import type { TopFieldKey } from "@/types/top-universities";
import { useApplicantProfile } from "@/hooks/useApplicantProfile";
import { formatPlanDate } from "@/lib/residence/deadlines";
import { useSavedUniversities } from "@/hooks/useSavedUniversities";
import { createProfileSearchParams } from "@/lib/profile-query";
import { matchStatusLabels } from "@/lib/match-programs";
import { findRouteOptions, isRouteOption } from "@/lib/route-options";
import { formatDegreeLevel } from "@/lib/profile-options";
import type { ProgramMatch } from "@/types/admission";

import styles from "./ExploreCatalog.module.css";
import linkStyles from "./UniversityResults.module.css";

const PAGE_SIZE = 8;

type UniversityResultsProps = {
  mode?: "explore" | "route";
  asOfDate?: string;
};

function normalize(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

// Top 100 rank by catalog id, shown as a badge on result cards.
const topRankByCatalogId = new Map(
  topUniversities
    .filter((entry) => entry.catalogId)
    .map((entry) => [entry.catalogId!, entry.rank] as const),
);

// Explore fields that have Top 100 entry requirements by field.
const topFieldByProgram: Record<string, TopFieldKey> = {
  Medicine: "medicine",
  Law: "law",
  "Economics & Business": "economics",
  "Computer Science": "computer-science",
};

function getWebsiteHost(website: string) {
  try {
    return new URL(website).hostname.replace(/^www\./, "");
  } catch {
    return "";
  }
}

export function UniversityResults({
  mode = "explore",
  asOfDate = "",
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
  // Explore: "all" | "verified". Route: "options" (destination country),
  // "europe" (other countries) or "all" (the whole country directory).
  const [scope, setScope] =
    useState<"all" | "verified" | "options" | "europe">(() =>
      mode === "route" ? "options" : "all",
    );
  const [visibleCount, setVisibleCount] =
    useState(PAGE_SIZE);
  const savedMemory = useSavedUniversities();
  const saved = savedMemory.values;

  // In Explore either filter may be left as "any" (empty); the personal
  // route flow always needs both.
  const anyCountry = mode === "explore" && !countryCode;
  const anyProgram = mode === "explore" && !selectedProgram;
  const validProgram =
    anyProgram || programOptions.includes(selectedProgram);
  const programLabel = selectedProgram || "this field";

  const verifiedCatalogHosts = useMemo(
    () =>
      new Set(
        verifiedPrograms
          .filter(
            (program) =>
              (anyCountry || program.countryCode === countryCode) &&
              (anyProgram || program.category === selectedProgram),
          )
          .map((program) => program.universityHost),
      ),
    [anyCountry, anyProgram, countryCode, selectedProgram],
  );

  // Route flow: every verified programme for the profile's field, degree
  // and intake (matched against the profile) and every coming-soon listing,
  // in the destination country and elsewhere in Europe.
  const routeOptions = useMemo(
    () =>
      mode === "route" && profile
        ? findRouteOptions(profile, verifiedPrograms, asOfDate)
        : null,
    [mode, profile, asOfDate],
  );

  // Programs whose approved rules for the intake are not published yet.
  const pendingGroups = useMemo(
    () =>
      routeOptions
        ? routeOptions.pending
        : findPendingProgramGroups({
            countryCode: anyCountry ? undefined : countryCode,
            category: anyProgram ? undefined : selectedProgram,
          }),
    [routeOptions, anyCountry, anyProgram, countryCode, selectedProgram],
  );

  const pendingById = useMemo(
    () =>
      new Map(
        pendingGroups.map((group) => [group.universityId, group.status] as const),
      ),
    [pendingGroups],
  );

  const pendingHosts = useMemo(
    () =>
      new Map(
        pendingGroups.map((group) => [group.universityHost, group.status] as const),
      ),
    [pendingGroups],
  );

  // One country: its whole directory. One field across Europe: only the
  // institutions where we hold something checked for that field (a verified
  // route, a coming-soon listing or Top 100 requirements by field).
  const countryUniversities = useMemo(() => {
    if (!anyCountry) {
      return catalog.universities.filter(
        (university) => university.countryCode === countryCode,
      );
    }
    const field = topFieldByProgram[selectedProgram];
    return catalog.universities.filter((university) => {
      const host = getWebsiteHost(university.website);
      if (verifiedCatalogHosts.has(host) || pendingHosts.has(host)) return true;
      const rank = topRankByCatalogId.get(university.id);
      const entry = rank && field ? topFieldRequirements[rank]?.[field] : undefined;
      return Boolean(entry?.url);
    });
  }, [anyCountry, countryCode, pendingHosts, selectedProgram, verifiedCatalogHosts]);

  const countryName = anyCountry
    ? "Europe"
    : catalog.universities.find((university) => university.countryCode === countryCode)
        ?.country ?? "";

  const verifiedByHost = useMemo(() => {
    const matchesByHost = new Map<string, ProgramMatch[]>();

    for (const match of routeOptions?.matches ?? []) {
      const existing =
        matchesByHost.get(match.program.universityHost) ?? [];

      existing.push(match);
      matchesByHost.set(match.program.universityHost, existing);
    }

    return matchesByHost;
  }, [routeOptions]);

  // Universities listed under a route tab: those with a verified option or
  // a coming-soon listing, in the destination country ("options") or in the
  // other countries ("europe").
  const routeUniversities = useMemo(() => {
    const pick = (inDestination: boolean) =>
      catalog.universities.filter((university) => {
        if ((university.countryCode === countryCode) !== inDestination) return false;
        const host = getWebsiteHost(university.website);
        return (
          (verifiedByHost.get(host) ?? []).some(isRouteOption) ||
          pendingHosts.has(host) ||
          pendingById.has(university.id)
        );
      });
    return mode === "route"
      ? { options: pick(true), europe: pick(false) }
      : { options: [], europe: [] };
  }, [mode, countryCode, verifiedByHost, pendingHosts, pendingById]);

  const universityResults = useMemo(() => {
    const normalizedQuery = normalize(query);

    const base =
      mode === "route" && scope === "options"
        ? routeUniversities.options
        : mode === "route" && scope === "europe"
          ? routeUniversities.europe
          : countryUniversities;

    return base
      .map((university) => {
        const host = getWebsiteHost(university.website);
        const matchingPrograms = (verifiedByHost.get(host) ?? []).filter(
          (match) => mode !== "route" || scope === "all" || isRouteOption(match),
        );

        return {
          ...university,
          matchingPrograms,
          pending: pendingHosts.get(host) ?? pendingById.get(university.id) ?? null,
          verified:
            mode === "route"
              ? matchingPrograms.length > 0
              : verifiedCatalogHosts.has(host),
        };
      })
      .filter((university) => {
        if (mode === "explore" && scope === "verified" && !university.verified) {
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
          Number(b.matchingPrograms[0]?.status === "conditional") -
            Number(a.matchingPrograms[0]?.status === "conditional") ||
          Number(Boolean(b.pending)) - Number(Boolean(a.pending)) ||
          a.name.localeCompare(b.name),
      );
  }, [
    countryUniversities,
    routeUniversities,
    mode,
    pendingHosts,
    pendingById,
    query,
    scope,
    verifiedByHost,
    verifiedCatalogHosts,
  ]);

  const filterParams = () =>
    new URLSearchParams({
      ...(countryCode ? { country: countryCode } : {}),
      ...(selectedProgram ? { program: selectedProgram } : {}),
    });

  const pendingUniversityHref = (universityId: string) => {
    const params = profile
      ? createProfileSearchParams(profile)
      : filterParams();
    params.set("flow", mode);
    params.delete("programId");
    return `/universities/${encodeURIComponent(universityId)}?${params.toString()}`;
  };

  const verifiedCount = countryUniversities.filter(
    (university) => {
      const host = getWebsiteHost(university.website);

      return mode === "route"
        ? verifiedByHost.has(host)
        : verifiedCatalogHosts.has(host);
    },
  ).length;
  const optionsCount = routeUniversities.options.length;
  const europeCount = routeUniversities.europe.length;
  const noRouteOptions = mode === "route" && scope === "options" && optionsCount === 0;

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

  const missingFilters =
    mode === "route"
      ? !countryCode || !selectedProgram
      : anyCountry && anyProgram;

  if (missingFilters || !validProgram || !countryName) {
    return (
      <div className={styles.invalidPage}>
        <Building2 size={34} aria-hidden="true" />

        <h1>Choose your filters first</h1>

        <p>
          Return to Explore and select a country, a study field, or
          both.
        </p>

        <Link href="/explore">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to Explore
        </Link>
      </div>
    );
  }

  if (
    mode === "route" &&
    profile &&
    routeOptions &&
    routeOptions.matches.length === 0 &&
    routeOptions.pending.length === 0
  ) {
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
        <PendingPrograms
          groups={pendingGroups}
          universityHref={(group) => pendingUniversityHref(group.universityId)}
        />
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
    : filterParams();
  resultsParams.set("flow", mode);

  return (
    <div className={styles.resultsPage}>
      <nav className={styles.breadcrumb}>
        <Link href="/explore">
          <ArrowLeft size={16} aria-hidden="true" />
          Explore
        </Link>

        <span>/</span>
        <span>{anyCountry ? "Any country" : countryName}</span>
        <span>/</span>
        <strong>{selectedProgram || "Any field"}</strong>
      </nav>

      <header className={styles.resultsHeader}>
        <div>
          <p className={styles.eyebrow}>
            UNIVERSITY EXPLORER
          </p>

          <h1>
            {anyCountry ? (
              <>
                {selectedProgram} <span>across Europe</span>
              </>
            ) : (
              <>
                Universities in <span>{countryName}</span>
              </>
            )}
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
              anyCountry ? (
                <>
                  Institutions in every country where we have checked something
                  for <strong>{selectedProgram}</strong>: a verified route, a
                  coming-soon listing or published entry requirements.
                </>
              ) : anyProgram ? (
                <>
                  The whole directory for {countryName}, in every field. Open a
                  university to see the programmes we have checked there.
                </>
              ) : (
                <>
                  Browse the country directory for <strong>{selectedProgram}</strong>.
                  Subject availability is only confirmed where official program data is available.
                </>
              )
            )}
          </p>
        </div>

        {!anyCountry && (
          <Image
            src={`https://flagcdn.com/w160/${countryCode.toLowerCase()}.png`}
            alt={`${countryName} flag`}
            width={80}
            height={60}
            unoptimized
            className={styles.resultsFlag}
          />
        )}
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
          <Link href={`/route/profile?${filterParams().toString()}`}>
            Build a personal route
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </section>
      )}

      <p
        className={linkStyles.memoryStatus}
        data-error={savedMemory.error ? "true" : undefined}
        role={savedMemory.error ? "status" : undefined}
      >
        {savedMemory.loading
          ? "Loading saved universities…"
          : savedMemory.error
            ? "Account sync is temporarily unavailable. Your bookmarks are still saved on this device."
            : savedMemory.syncing
              ? "Saving your bookmarks…"
              : savedMemory.signedIn
                ? "Bookmarks sync with your DocRoute account."
                : "Bookmarks are saved on this device. Log in to sync them across devices."}
      </p>

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
          {mode === "route" ? (
            <>
              {(
                [
                  ["options", `My options in ${countryName}`, optionsCount],
                  ["europe", "Other countries", europeCount],
                  ["all", "Whole directory", countryUniversities.length],
                ] as const
              ).map(([value, label, count]) => (
                <button
                  key={value}
                  type="button"
                  aria-pressed={scope === value}
                  onClick={() => {
                    setScope(value);
                    setVisibleCount(PAGE_SIZE);
                  }}
                >
                  {label}
                  <span>{count}</span>
                </button>
              ))}
            </>
          ) : (
            <>
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
                Verified program data
                <span>{verifiedCount}</span>
              </button>
            </>
          )}
        </div>
      </section>

      <div className={styles.verificationNotice}>
        <CheckCircle2 size={19} aria-hidden="true" />

        <p>
          {mode === "route"
            ? `Your options: verified programmes for your exact subject, degree and intake, checked against your profile (ready, preparation needed or needs clarification), plus "coming soon" programmes whose rules for this intake are not approved yet. Coming-soon programmes are listed but not checked against your profile. Checked as of ${asOfDate}; admission is never guaranteed.`
            : anyCountry
              ? "Only institutions with checked information for this field are listed. Pick a country to see its complete directory."
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
            const directoryProgram = mode === "explore" ? verifiedPrograms.find(
              (program) => program.universityHost === getWebsiteHost(university.website) &&
                (anyProgram || program.category === selectedProgram),
            ) : undefined;
            // Catalog names come from an imported list and can be inaccurate
            // ("University of Zilinska"); prefer the name from checked data.
            const displayName =
              firstMatch?.program.universityName ??
              directoryProgram?.universityName ??
              pendingGroups.find(
                (group) => group.universityId === university.id,
              )?.universityName ??
              university.name;
            const universityParams = new URLSearchParams(resultsParams);
            // An option in another country is matched with that country as
            // the destination; the linked profile must say so too.
            if (mode === "route" && university.countryCode !== countryCode) {
              universityParams.set("country", university.countryCode);
            }

            if (firstMatch) {
              universityParams.set("programId", firstMatch.program.id);
            } else if (directoryProgram) {
              universityParams.set("programId", directoryProgram.id);
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
                    src={`https://flagcdn.com/w80/${university.countryCode.toLowerCase()}.png`}
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
                    ) : university.pending ? (
                      <span
                        className={styles.pendingBadge}
                        title={pendingStatusLabel(university.pending)}
                      >
                        Coming soon
                      </span>
                    ) : (
                      <span className={styles.pendingBadge}>
                        {anyCountry ? "Requirements listed" : "Program review pending"}
                      </span>
                    )}

                    {topRankByCatalogId.has(university.id) && (
                      <Link
                        href={`/explore/top#rank-${topRankByCatalogId.get(university.id)}`}
                        className={linkStyles.topBadge}
                      >
                        Top 100 · #{topRankByCatalogId.get(university.id)}
                      </Link>
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
                        savedMemory.toggle(university.id)
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
                            universityParams.toString(),
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
                                {matchStatusLabels[match.status]}
                              </span>
                            </div>

                            <p className={linkStyles.matchSummary}>
                              {match.summary}
                            </p>
                            {match.checks.filter((check) => check.status === "missing" || check.status === "unknown").map((check) => (
                              <p key={check.id} className={linkStyles.matchSummary}>
                                <strong>{check.label}:</strong> {check.detail}
                              </p>
                            ))}

                            <div className={linkStyles.matchFacts}>
                              <span>
                                <CalendarDays size={14} aria-hidden="true" />
                                Apply by {formatPlanDate(match.program.application.deadline)}
                              </span>
                              <span>
                                <Languages size={14} aria-hidden="true" />
                                {match.program.instructionLanguages.map((language) => language.name).join(", ")}
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
                                {match.canBuildRoute ? "See my requirements" : "Review availability"}
                              <ArrowRight size={14} aria-hidden="true" />
                            </Link>
                          </div>
                          );
                        },
                      )}
                    </div>
                  ) : (
                    <p className={styles.pendingText}>
                      {university.pending && mode === "route"
                        ? university.pending === "rules-published"
                          ? `Coming soon: the faculty has published its ${programLabel} rules for ${profile?.intake ?? "the next intake"}, but DocRoute has not checked them against your profile yet. Open the university for a summary.`
                          : `Coming soon: the ${programLabel} rules for ${profile?.intake ?? "the next intake"} are not approved yet, so your profile has not been checked. Open the university to see last year's rules, for orientation.`
                        : university.pending === "rules-published"
                        ? `This faculty has published its ${programLabel} admission rules for the next intake. Open the university for a summary; a personalised route is not built yet.`
                        : university.pending
                        ? `${selectedProgram ? `${selectedProgram} admission` : 'Admission'} rules for the next intake are not out yet. Open the university to see last year's rules, for orientation.`
                        : mode === "route" && profile
                        ? `We have not yet verified a ${formatDegreeLevel(
                            profile.degreeLevel,
                          ).toLowerCase()} ${selectedProgram} programme here for the ${profile.intake} intake. The institution remains visible in the country directory.`
                        : university.verified
                        ? `Published ${selectedProgram ? `${selectedProgram} ` : ''}program information is available. Build a route to see requirements for your profile.`
                        : anyProgram
                        ? "Open the university to see the programmes we have checked there."
                        : anyCountry
                        ? `Published ${selectedProgram} entry requirements are listed on the university page (Top 100).`
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
          <h2>{noRouteOptions ? `No options in ${countryName} yet` : "No universities found"}</h2>
          <p>{noRouteOptions ? "Your choices are saved. DocRoute has no verified or coming-soon programme for this subject, degree and intake in this country yet." : "Try changing the search or result type."}</p>
          {noRouteOptions && europeCount > 0 && (
            <button type="button" className={styles.loadMore} onClick={() => setScope("europe")}>
              Show options in other countries
            </button>
          )}
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
