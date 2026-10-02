import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  BookOpen,
  Building2,
  CalendarDays,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Euro,
  ExternalLink,
  Languages,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { UniversityImage } from "@/components/UniversityImage";
import catalog from "@/data/universities.json";
import { findVerifiedProgram } from "@/data/verified-programs";
import { matchProgram } from "@/lib/match-programs";
import { parseApplicantProfile } from "@/lib/profile-query";
import { loadApplicantProfile } from "@/lib/supabase/applicant-profile";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import styles from "./UniversityPage.module.css";

type RawSearchParams = Record<
  string,
  string | string[] | undefined
>;

type UniversityPageProps = {
  params: Promise<{
    id: string;
  }>;

  searchParams: Promise<RawSearchParams>;
};

function findUniversity(id: string) {
  return catalog.universities.find(
    (university) => university.id === id,
  );
}

function toUrlSearchParams(query: RawSearchParams) {
  const params = new URLSearchParams();

  for (const [key, value] of Object.entries(query)) {
    if (Array.isArray(value)) {
      for (const item of value) {
        params.append(key, item);
      }
    } else if (value !== undefined) {
      params.set(key, value);
    }
  }

  return params;
}

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

export async function generateMetadata({
  params,
}: Pick<UniversityPageProps, "params">): Promise<Metadata> {
  const { id } = await params;
  const university = findUniversity(id);

  if (!university) {
    return {
      title: "University not found",
    };
  }

  return {
    title: university.name,
    description: `Explore admission information and document requirements for ${university.name}.`,
  };
}

export default async function UniversityPage({
  params,
  searchParams,
}: UniversityPageProps) {
  const { id } = await params;
  const query = await searchParams;
  const queryParams = toUrlSearchParams(query);
  const university = findUniversity(id);
  const flow = firstValue(query.flow) === "route" ? "route" : "explore";

  if (!university) {
    notFound();
  }

  const selectedProgram = firstValue(query.program)?.trim() || null;
  const requestedProgram = findVerifiedProgram(
    firstValue(query.programId) ?? null,
  );
  const verifiedProgram =
    requestedProgram?.universityId === university.id
      ? requestedProgram
      : null;
  let profile = parseApplicantProfile(queryParams);

  if (!profile && flow === "route" && isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      profile = await loadApplicantProfile(supabase, user.id);
    }
  }

  const match =
    verifiedProgram && profile
      ? matchProgram(profile, verifiedProgram)
      : null;

  const resultsParams = new URLSearchParams(queryParams);
  resultsParams.delete("programId");

  const resultsHref = selectedProgram
    ? `/${flow}/universities?${resultsParams.toString()}`
    : "/explore";
  const previewHref = `/route/preview?${queryParams.toString()}`;
  const buildRouteHref = `/route/profile?${new URLSearchParams({
    country: university.countryCode,
    program:
      verifiedProgram?.category ?? selectedProgram ?? "",
  }).toString()}`;

  const displayName =
    verifiedProgram?.universityName ?? university.name;
  const displayRegion =
    verifiedProgram?.city ?? university.region ?? "Location not specified";

  const statusLabel = match
    ? match.status === "strong"
      ? "Strong verified fit"
      : match.status === "conditional"
        ? "Conditional fit"
        : match.status === "preparation-required"
          ? "Preparation needed"
          : "More information needed"
    : verifiedProgram
      ? "Official program information"
      : "Verification pending";

  return (
    <main className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href={resultsHref}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to universities
        </Link>

        <span>/</span>
        <span>{university.country}</span>
        <span>/</span>
        <strong>{displayName}</strong>
      </nav>

      <section className={styles.hero}>
        <div className={styles.heroVisual}>
          <UniversityImage
            name={displayName}
            country={university.country}
            showCredit
          />

          <span className={styles.imageLabel}>
            <Building2 size={16} aria-hidden="true" />
            University profile
          </span>
        </div>

        <div className={styles.heroContent}>
          <div className={styles.location}>
            <Image
              src={`https://flagcdn.com/w80/${university.countryCode.toLowerCase()}.png`}
              alt={`${university.country} flag`}
              width={32}
              height={24}
              unoptimized
            />

            <span>
              {university.country} · {displayRegion}
            </span>
          </div>

          <p className={styles.eyebrow}>
            {verifiedProgram
              ? "VERIFIED ADMISSION ROUTE"
              : "DOCROUTE UNIVERSITY PROFILE"}
          </p>

          <h1>{displayName}</h1>

          {verifiedProgram ? (
            <div className={styles.verifiedProgramTitle}>
              <span>{verifiedProgram.faculty}</span>
              <strong>{verifiedProgram.programName}</strong>
              <small>{verifiedProgram.localProgramName}</small>
            </div>
          ) : (
            <p className={styles.heroDescription}>
              Explore available study information and build a verified route
              from university application to student residence.
            </p>
          )}

          <div className={styles.heroActions}>
            {match && (
              <Link href={previewHref} className={styles.primaryAction}>
                Preview my route
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}

            {verifiedProgram && !match && (
              <Link href={buildRouteHref} className={styles.primaryAction}>
                Build my route
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}

            {verifiedProgram && (
              <a
                href={verifiedProgram.application.applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryAction}
              >
                Official application
                <ArrowUpRight size={17} aria-hidden="true" />
              </a>
            )}

            <a
              href={university.website}
              target="_blank"
              rel="noopener noreferrer"
              className={
                verifiedProgram
                  ? styles.secondaryAction
                  : styles.primaryAction
              }
            >
              University website
              <ArrowUpRight size={17} aria-hidden="true" />
            </a>

            <a href="#admission-requirements" className={styles.secondaryAction}>
              View requirements
              <ArrowRight size={17} aria-hidden="true" />
            </a>
          </div>
        </div>
      </section>

      <section className={styles.facts} aria-label="University overview">
        <article>
          <span className={styles.factIcon}>
            <MapPin size={19} aria-hidden="true" />
          </span>

          <div>
            <small>DESTINATION</small>
            <strong>{university.country}</strong>
            <p>{displayRegion}</p>
          </div>
        </article>

        <article>
          <span className={styles.factIcon}>
            <BookOpen size={19} aria-hidden="true" />
          </span>

          <div>
            <small>STUDY PROGRAM</small>
            <strong>
              {verifiedProgram?.programName ?? selectedProgram ?? "Not selected"}
            </strong>
            <p>
              {verifiedProgram
                ? `Bachelor · ${verifiedProgram.durationYears} years · full-time`
                : "Program availability requires verification"}
            </p>
          </div>
        </article>

        <article>
          <span className={styles.factIcon}>
            <ShieldCheck size={19} aria-hidden="true" />
          </span>

          <div>
            <small>DATA STATUS</small>
            <strong>{statusLabel}</strong>
            <p>
              {verifiedProgram
                ? `Official rules checked ${formatDate(verifiedProgram.verifiedAt)}`
                : "Admissions verification in progress"}
            </p>
          </div>
        </article>
      </section>

      <div className={styles.contentLayout}>
        <section
          id="admission-requirements"
          className={styles.requirementsPanel}
        >
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>APPLICATION ROUTE</p>
              <h2>Admission requirements</h2>
            </div>

            <span
              className={
                verifiedProgram
                  ? styles.verifiedStatus
                  : styles.pendingStatus
              }
            >
              {statusLabel}
            </span>
          </div>

          {match && verifiedProgram ? (
            <>
              <div className={styles.matchSummary}>
                <span>
                  {match.status === "preparation-required" ? (
                    <AlertCircle size={23} aria-hidden="true" />
                  ) : (
                    <CheckCircle2 size={23} aria-hidden="true" />
                  )}
                </span>
                <div>
                  <h3>Your result is explained, not scored</h3>
                  <p>{match.summary}</p>
                </div>
              </div>

              <div className={styles.deadlineGrid}>
                <article>
                  <CalendarDays size={19} aria-hidden="true" />
                  <small>APPLICATION DEADLINE</small>
                  <strong>
                    {formatDate(verifiedProgram.application.deadline)}
                  </strong>
                </article>

                <article>
                  <Clock3 size={19} aria-hidden="true" />
                  <small>ADMISSION DAY</small>
                  <strong>
                    {formatDate(verifiedProgram.application.admissionDate)}
                  </strong>
                </article>

                <article>
                  <Euro size={19} aria-hidden="true" />
                  <small>APPLICATION FEE</small>
                  <strong>€{verifiedProgram.application.feeEur}</strong>
                </article>

                <article>
                  <Languages size={19} aria-hidden="true" />
                  <small>TEACHING LANGUAGE</small>
                  <strong>
                    {verifiedProgram.instructionLanguages
                      .map((language) => language.name)
                      .join(", ")}
                  </strong>
                </article>
              </div>

              <section className={styles.detailSection}>
                <div className={styles.detailHeading}>
                  <p className={styles.eyebrow}>PROFILE CHECK</p>
                  <h3>How your profile compares</h3>
                </div>

                <div className={styles.checkList}>
                  {match.checks.map((check) => (
                    <article key={check.id}>
                      <span
                        className={`${styles.checkIcon} ${
                          check.status === "met"
                            ? styles.checkMet
                            : check.status === "missing"
                              ? styles.checkMissing
                              : styles.checkAction
                        }`}
                      >
                        {check.status === "met" ? (
                          <CheckCircle2 size={18} aria-hidden="true" />
                        ) : check.status === "missing" ? (
                          <AlertCircle size={18} aria-hidden="true" />
                        ) : (
                          <CircleDashed size={18} aria-hidden="true" />
                        )}
                      </span>
                      <div>
                        <strong>{check.label}</strong>
                        <p>{check.detail}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.detailHeading}>
                  <p className={styles.eyebrow}>DOCUMENT CHECKLIST</p>
                  <h3>Documents that apply to you</h3>
                  <p>
                    This list changes with your education status, country, and
                    entrance route.
                  </p>
                </div>

                <ol className={styles.documentList}>
                  {match.requiredDocuments.map((document, index) => (
                    <li key={document.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{document.title}</strong>
                        <p>{document.description}</p>
                      </div>
                      <small>
                        {document.due === "application"
                          ? "By application deadline"
                          : document.due === "admission-day"
                            ? "On admission day"
                            : "By enrolment"}
                      </small>
                    </li>
                  ))}
                </ol>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.detailHeading}>
                  <p className={styles.eyebrow}>OFFICIAL SOURCES</p>
                  <h3>Where this information comes from</h3>
                </div>

                <div className={styles.sourceList}>
                  {verifiedProgram.sources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <strong>{source.title}</strong>
                        <small>
                          {source.publisher} · checked {formatDate(source.checkedAt)}
                        </small>
                      </span>
                      <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            </>
          ) : verifiedProgram ? (
            <>
              <div className={styles.matchSummary}>
                <span>
                  <CheckCircle2 size={23} aria-hidden="true" />
                </span>
                <div>
                  <h3>Official program information is available</h3>
                  <p>
                    These dates and general requirements were checked against
                    university sources. Build your route to see which documents
                    and conditions apply to your background.
                  </p>
                </div>
              </div>

              <div className={styles.deadlineGrid}>
                <article>
                  <CalendarDays size={19} aria-hidden="true" />
                  <small>APPLICATION DEADLINE</small>
                  <strong>
                    {formatDate(verifiedProgram.application.deadline)}
                  </strong>
                </article>

                <article>
                  <Clock3 size={19} aria-hidden="true" />
                  <small>ADMISSION DAY</small>
                  <strong>
                    {formatDate(verifiedProgram.application.admissionDate)}
                  </strong>
                </article>

                <article>
                  <Euro size={19} aria-hidden="true" />
                  <small>APPLICATION FEE</small>
                  <strong>€{verifiedProgram.application.feeEur}</strong>
                </article>

                <article>
                  <Languages size={19} aria-hidden="true" />
                  <small>TEACHING LANGUAGE</small>
                  <strong>
                    {verifiedProgram.instructionLanguages
                      .map((language) => language.name)
                      .join(", ")}
                  </strong>
                </article>
              </div>

              <section className={styles.detailSection}>
                <div className={styles.detailHeading}>
                  <p className={styles.eyebrow}>MINIMUM REQUIREMENTS</p>
                  <h3>Published entry conditions</h3>
                  <p>
                    These are general program rules, not yet compared with your
                    personal profile.
                  </p>
                </div>

                <div className={styles.checkList}>
                  {verifiedProgram.minimumRequirements.map((requirement) => (
                    <article key={requirement.id}>
                      <span
                        className={`${styles.checkIcon} ${styles.checkAction}`}
                      >
                        <CircleDashed size={18} aria-hidden="true" />
                      </span>
                      <div>
                        <strong>{requirement.title}</strong>
                        <p>{requirement.description}</p>
                      </div>
                    </article>
                  ))}
                </div>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.detailHeading}>
                  <p className={styles.eyebrow}>POSSIBLE DOCUMENTS</p>
                  <h3>Published document requirements</h3>
                  <p>
                    Some documents only apply to foreign education, an entrance
                    exam, or a waiver claim. Your route filters this list.
                  </p>
                </div>

                <ol className={styles.documentList}>
                  {verifiedProgram.documents.map((document, index) => (
                    <li key={document.id}>
                      <span>{String(index + 1).padStart(2, "0")}</span>
                      <div>
                        <strong>{document.title}</strong>
                        <p>{document.description}</p>
                      </div>
                      <small>
                        {document.due === "application"
                          ? "By application deadline"
                          : document.due === "admission-day"
                            ? "On admission day"
                            : "By enrolment"}
                      </small>
                    </li>
                  ))}
                </ol>
              </section>

              <section className={styles.detailSection}>
                <div className={styles.detailHeading}>
                  <p className={styles.eyebrow}>OFFICIAL SOURCES</p>
                  <h3>Where this information comes from</h3>
                </div>

                <div className={styles.sourceList}>
                  {verifiedProgram.sources.map((source) => (
                    <a
                      key={source.id}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <span>
                        <strong>{source.title}</strong>
                        <small>
                          {source.publisher} · checked{" "}
                          {formatDate(source.checkedAt)}
                        </small>
                      </span>
                      <ExternalLink size={16} aria-hidden="true" />
                    </a>
                  ))}
                </div>
              </section>
            </>
          ) : (
            <>
              <div className={styles.pendingBox}>
                <span className={styles.pendingIcon}>
                  <Clock3 size={22} aria-hidden="true" />
                </span>

                <div>
                  <h3>We are reviewing the official requirements</h3>
                  <p>
                    Document requirements will only appear here after they
                    have been checked against an official university source.
                  </p>
                </div>
              </div>

              <div className={styles.requirementPreview}>
                <div>
                  <span>01</span>
                  <p>Application documents</p>
                </div>
                <div>
                  <span>02</span>
                  <p>Entrance requirements</p>
                </div>
                <div>
                  <span>03</span>
                  <p>Documents after admission</p>
                </div>
              </div>
            </>
          )}
        </section>

        <aside className={styles.routePanel}>
          <p className={styles.eyebrow}>YOUR NEXT STEPS</p>
          <h2>
            {match ? "From profile to application" : "From interest to arrival"}
          </h2>

          {match ? (
            <ol className={styles.routeSteps}>
              {match.nextActions.slice(0, 5).map((action, index) => (
                <li key={action}>
                  <span>{index + 1}</span>
                  <div>
                    <strong>{action}</strong>
                  </div>
                </li>
              ))}
            </ol>
          ) : (
            <ol className={styles.routeSteps}>
              <li>
                <span>1</span>
                <div>
                  <strong>Choose a program</strong>
                  <p>Confirm the exact degree and language.</p>
                </div>
              </li>
              <li>
                <span>2</span>
                <div>
                  <strong>Prepare documents</strong>
                  <p>Follow verified application requirements.</p>
                </div>
              </li>
              <li>
                <span>3</span>
                <div>
                  <strong>Plan residence</strong>
                  <p>Continue after receiving admission.</p>
                </div>
              </li>
            </ol>
          )}

          <div className={styles.routeNotice}>
            <CheckCircle2 size={18} aria-hidden="true" />
            <p>
              Sources and verification dates are shown beside every published
              requirement. Final admission decisions always belong to the
              university.
            </p>
          </div>

          {verifiedProgram && (
            <Link
              href={match ? previewHref : buildRouteHref}
              className={styles.routeApply}
            >
              {match ? "Open Preview Route" : "Build my route"}
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          )}
        </aside>
      </div>
    </main>
  );
}
