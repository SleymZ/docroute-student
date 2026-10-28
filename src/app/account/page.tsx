import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  Bookmark,
  BookOpen,
  CheckCircle2,
  CircleDashed,
  Cloud,
  FileCheck2,
  FileText,
  GraduationCap,
  Languages,
  ListChecks,
  MapPin,
  Route,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import { AccountBackdrop } from "./AccountBackdrop";
import { AccountDataControls } from "@/components/AccountDataControls";
import { AccountSignOut } from "@/components/AccountSignOut";
import { Header } from "@/components/Header";
import catalog from "@/data/universities.json";
import { verifiedPrograms } from "@/data/verified-programs";
import { getAdmissionDate } from "@/lib/admission-date";
import { matchPrograms, matchStatusLabels } from "@/lib/match-programs";
import {
  formatDegreeLevel,
  getResidenceStatusLabel,
  languageProofLabels,
  legacyWaiverEvidence,
  waiverEvidenceLabels,
} from "@/lib/profile-options";
import { createProfileSearchParams } from "@/lib/profile-query";
import { loadApplicantProfile } from "@/lib/supabase/applicant-profile";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { loadSavedUniversityIds } from "@/lib/supabase/user-memory";
import type { ApplicantProfile } from "@/types/admission";

import styles from "./AccountPage.module.css";

export const metadata: Metadata = {
  title: "Applicant profile",
  description: "Your saved applicant profile and current university route.",
  robots: {
    index: false,
    follow: false,
  },
};

const regionNames = new Intl.DisplayNames(["en"], { type: "region" });
const languageNames = new Intl.DisplayNames(["en"], { type: "language" });

function countryName(code: string) {
  if (code === "ZZ") return "Other country";
  return (
    catalog.universities.find((university) => university.countryCode === code)
      ?.country ??
    regionNames.of(code) ??
    code
  );
}

function languageName(code: string) {
  if (code === "other") return "Another language";
  return languageNames.of(code) ?? code.toUpperCase();
}

function educationStatusLabel(profile: ApplicantProfile) {
  const master = profile.degreeLevel === "master";
  switch (profile.educationStatus) {
    case "completed":
      return master ? "Bachelor's degree completed" : "Already graduated";
    case "final-year":
      return master ? "Final year of bachelor's" : "In the final school year";
    case "earlier-year":
      return master ? "Earlier in bachelor's" : "Before the final school year";
  }
}

function CountryValue({ code }: { code: string }) {
  return (
    <span className={styles.countryValue}>
      {code !== "ZZ" && (
        <Image
          src={`https://flagcdn.com/w40/${code.toLowerCase()}.png`}
          alt=""
          width={20}
          height={15}
          unoptimized
        />
      )}
      {countryName(code)}
    </span>
  );
}

async function loadWorkspaceMemory(
  supabase: Awaited<ReturnType<typeof createSupabaseServerClient>>,
  userId: string,
) {
  try {
    const [savedIds, progress] = await Promise.all([
      loadSavedUniversityIds(supabase, userId),
      supabase
        .from("route_task_progress")
        .select("task_id", { count: "exact", head: true })
        .eq("user_id", userId),
    ]);

    if (progress.error) throw progress.error;

    return {
      available: true as const,
      savedIds,
      completedSteps: progress.count ?? 0,
    };
  } catch {
    return { available: false as const, savedIds: [], completedSteps: 0 };
  }
}

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main>
        <Header />
        <section className={styles.emptyState}>
          <Cloud size={34} aria-hidden="true" />
          <h1>Connect Supabase to activate profiles</h1>
          <p>
            Add the project URL and publishable key to your local environment.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login&next=/account");
  }

  let profile: ApplicantProfile | null = null;
  let profileError = false;

  try {
    profile = await loadApplicantProfile(supabase, user.id);
  } catch {
    profileError = true;
  }

  const memory = await loadWorkspaceMemory(supabase, user.id);
  const savedUniversities = memory.savedIds
    .map((id) => catalog.universities.find((university) => university.id === id))
    .filter((university) => university !== undefined);

  const identityCard = (
    <aside className={styles.identityCard}>
      <span>
        <UserRound size={22} aria-hidden="true" />
      </span>
      <div>
        <small>SIGNED IN AS</small>
        <strong>{user.email}</strong>
        <p>Private workspace · synced to your account</p>
      </div>
      <AccountSignOut />
    </aside>
  );

  if (!profile) {
    return (
      <main>
        <Header />
        <div className={styles.page}>
          <AccountBackdrop />
          <header className={styles.hero}>
            <div>
              <p className={styles.eyebrow}>PERSONAL WORKSPACE</p>
              <h1>
                Your applicant <span>profile.</span>
              </h1>
              <p className={styles.heroLead}>
                One saved source for your education, languages and the
                admission rules that apply to you.
              </p>
            </div>
            {identityCard}
          </header>

          <section className={styles.emptyState}>
            <FileText size={34} aria-hidden="true" />
            <h2>
              {profileError
                ? "Your profile could not be loaded"
                : "Your applicant profile is empty"}
            </h2>
            <p>
              {profileError
                ? "The account service did not respond. Reload the page in a moment; nothing has been deleted."
                : "Choose a destination and study interest, then add your education and languages once. DocRoute will remember them afterwards."}
            </p>
            {!profileError && (
              <Link href="/explore" className={styles.primaryAction}>
                Create applicant profile
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
            )}
          </section>

          <AccountDataControls />
        </div>
      </main>
    );
  }

  const profileParams = createProfileSearchParams(profile);
  const editHref = `/route/profile?${profileParams.toString()}`;
  const matchesHref = `/route/universities?${profileParams.toString()}`;
  const destinationName = countryName(profile.destinationCountryCode);
  const matches = matchPrograms(profile, verifiedPrograms, getAdmissionDate());
  const buildableMatches = matches.filter((match) => match.canBuildRoute);

  // Same idea as the university page: when the saved field has no verified
  // rules, show where a verified route exists in the same country.
  const otherRoute = matches.length
    ? null
    : (verifiedPrograms.find(
        (program) => program.countryCode === profile.destinationCountryCode,
      ) ?? null);
  let otherRouteHref: string | null = null;
  if (otherRoute) {
    // Copy rather than spread: a profile repeats "lang" for every language.
    const switchParams = new URLSearchParams(profileParams);
    switchParams.set("program", otherRoute.category);
    switchParams.set("degree", otherRoute.degreeLevel);
    switchParams.set("intake", otherRoute.intake);
    otherRouteHref = `/route/profile?${switchParams.toString()}`;
  }

  const coverageLabel = matches.length
    ? `${matches.length} verified ${matches.length === 1 ? "program" : "programs"}`
    : "Not verified yet";

  const waiverEvidence =
    profile.degreeLevel === "bachelor" ? profile.waiverEvidence : [];

  const stages = [
    {
      icon: UserRound,
      label: "PROFILE",
      title: "Applicant profile saved",
      detail: `${profile.languages.length} ${profile.languages.length === 1 ? "language" : "languages"} · ${countryName(profile.citizenshipCountryCode)} citizenship`,
      state: "done" as const,
    },
    {
      icon: GraduationCap,
      label: "MATCHING",
      title: matches.length ? "Verified programs found" : "Waiting for verified rules",
      detail: matches.length
        ? `${buildableMatches.length} of ${matches.length} can build a route now`
        : `${profile.studyCategory} in ${destinationName} is not covered yet`,
      state: matches.length ? ("active" as const) : ("blocked" as const),
    },
    {
      icon: FileCheck2,
      label: "APPLICATION",
      title: "Documents and deadlines",
      detail: memory.completedSteps
        ? `${memory.completedSteps} route ${memory.completedSteps === 1 ? "step" : "steps"} completed`
        : "Opens in Preview Route",
      state: memory.completedSteps ? ("active" as const) : ("upcoming" as const),
    },
    {
      icon: MapPin,
      label: "RESIDENCE",
      title: "Student residence",
      detail: "Starts after admission",
      state: "upcoming" as const,
    },
  ];

  return (
    <main>
      <Header />

      <div className={styles.page}>
        <AccountBackdrop />
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>PERSONAL WORKSPACE</p>
            <h1>
              Your applicant <span>profile.</span>
            </h1>
            <p className={styles.heroLead}>
              One saved source for your education, languages and the admission
              rules that apply to you. Edit it once — matching and routes update
              everywhere.
            </p>
          </div>
          {identityCard}
        </header>

        <section className={styles.statusStrip} aria-label="Workspace summary">
          <article>
            <ShieldCheck size={18} aria-hidden="true" />
            <div>
              <small>PROFILE</small>
              <strong>Complete and saved</strong>
            </div>
          </article>
          <article data-tone={matches.length ? "ok" : "warn"}>
            <BookOpen size={18} aria-hidden="true" />
            <div>
              <small>ROUTE COVERAGE</small>
              <strong>{coverageLabel}</strong>
            </div>
          </article>
          <article>
            <Bookmark size={18} aria-hidden="true" />
            <div>
              <small>SAVED UNIVERSITIES</small>
              <strong>{memory.available ? savedUniversities.length : "—"}</strong>
            </div>
          </article>
          <article>
            <ListChecks size={18} aria-hidden="true" />
            <div>
              <small>COMPLETED STEPS</small>
              <strong>{memory.available ? memory.completedSteps : "—"}</strong>
            </div>
          </article>
        </section>

        <div className={styles.contentGrid}>
          <section className={styles.profileCard}>
            <div className={styles.cardHeading}>
              <div>
                <p className={styles.eyebrow}>APPLICANT DATA</p>
                <h2>Background and eligibility</h2>
              </div>
              <span className={styles.cardIcon}>
                <FileText size={20} aria-hidden="true" />
              </span>
            </div>

            <dl className={styles.profileDetails}>
              <div>
                <dt>Citizenship</dt>
                <dd>
                  <CountryValue code={profile.citizenshipCountryCode} />
                </dd>
              </div>
              <div>
                <dt>
                  {profile.degreeLevel === "master"
                    ? "Bachelor's education"
                    : "Secondary education"}
                </dt>
                <dd>
                  <CountryValue code={profile.educationCountryCode} />
                </dd>
              </div>
              <div>
                <dt>Education status</dt>
                <dd>{educationStatusLabel(profile)}</dd>
              </div>
              <div>
                <dt>Passport and residence</dt>
                <dd>
                  {getResidenceStatusLabel(
                    profile.currentResidenceStatus,
                    destinationName,
                  )}
                </dd>
              </div>
              <div>
                <dt>Grade scale</dt>
                <dd>
                  {profile.gradeScale === "slovak-1-5"
                    ? "Slovak 1–5 scale"
                    : "Another national scale"}
                </dd>
              </div>
              <div>
                <dt>
                  {profile.degreeLevel === "master"
                    ? "Bachelor's average"
                    : "Penultimate-year average"}
                </dt>
                <dd>
                  {profile.penultimateYearAverage ?? "Not provided"}
                  {profile.penultimateYearAverage !== undefined &&
                    profile.gradeScale === "other" && (
                      <small className={styles.inlineNote}>
                        Not converted automatically
                      </small>
                    )}
                </dd>
              </div>
            </dl>

            <div className={styles.subsection}>
              <div className={styles.subsectionHeading}>
                <Languages size={16} aria-hidden="true" />
                <h3>Languages</h3>
                <span>{profile.languages.length}</span>
              </div>
              <ul className={styles.languageTable}>
                {profile.languages.map((language) => (
                  <li key={language.code}>
                    <strong>{languageName(language.code)}</strong>
                    <span className={styles.levelBadge}>
                      {language.level === "native" ? "Native" : language.level}
                    </span>
                    <span className={styles.proof}>
                      {languageProofLabels[language.proof]}
                      {language.proof === "certificate" &&
                        language.certificateName &&
                        ` · ${language.certificateName}`}
                    </span>
                    <span
                      className={styles.studyFlag}
                      data-on={language.willingToStudyIn ? "true" : undefined}
                    >
                      {language.willingToStudyIn ? "Would study in it" : "Known only"}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {profile.degreeLevel === "bachelor" && (
              <div className={styles.subsection}>
                <div className={styles.subsectionHeading}>
                  <Sparkles size={16} aria-hidden="true" />
                  <h3>Exam-waiver evidence</h3>
                  <span>{waiverEvidence.length}</span>
                </div>
                {waiverEvidence.length ? (
                  <div className={styles.chipList}>
                    {waiverEvidence.map((evidence) => (
                      <span
                        key={evidence}
                        data-legacy={
                          legacyWaiverEvidence.has(evidence) ? "true" : undefined
                        }
                      >
                        {waiverEvidenceLabels[evidence]}
                        {legacyWaiverEvidence.has(evidence) && " · needs clarification"}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={styles.mutedNote}>
                    None added. Evidence only matters where a verified
                    university rule says what it changes.
                  </p>
                )}
              </div>
            )}

            <div className={styles.cardActions}>
              <Link href={editHref} className={styles.secondaryAction}>
                Edit applicant profile
                <ArrowRight size={16} aria-hidden="true" />
              </Link>
            </div>
          </section>

          <aside className={styles.routeCard}>
            <p className={styles.eyebrow}>CURRENT ROUTE</p>
            <h2>{profile.studyCategory}</h2>
            <div className={styles.routeMeta}>
              <CountryValue code={profile.destinationCountryCode} />
              <span>
                {formatDegreeLevel(profile.degreeLevel)} · Intake {profile.intake}
              </span>
            </div>

            <ol className={styles.stageList}>
              {stages.map((stage) => {
                const Icon = stage.icon;
                return (
                  <li key={stage.label} data-state={stage.state}>
                    <span className={styles.stageIcon}>
                      {stage.state === "done" ? (
                        <CheckCircle2 size={17} aria-hidden="true" />
                      ) : (
                        <Icon size={17} aria-hidden="true" />
                      )}
                    </span>
                    <div>
                      <small>{stage.label}</small>
                      <strong>{stage.title}</strong>
                      <p>{stage.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            {matches.length ? (
              <div className={styles.coverageBox} data-tone="ok">
                <p>
                  <ShieldCheck size={15} aria-hidden="true" />
                  Verified against official university sources
                </p>
                <ul>
                  {matches.slice(0, 4).map((match) => (
                    <li key={match.program.id}>
                      <span>{match.program.programName}</span>
                      <em data-status={match.status}>
                        {matchStatusLabels[match.status]}
                      </em>
                    </li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className={styles.coverageBox} data-tone="warn">
                <p>
                  <CircleDashed size={15} aria-hidden="true" />
                  No verified rules for this combination yet
                </p>
                <span>
                  DocRoute does not reuse requirements from another field,
                  degree or year.
                  {otherRoute &&
                    ` In ${destinationName}, ${otherRoute.category} · ${formatDegreeLevel(otherRoute.degreeLevel)} · ${otherRoute.intake} is verified.`}
                </span>
              </div>
            )}

            <div className={styles.routeActions}>
              <Link href={matchesHref} className={styles.primaryAction}>
                {matches.length ? "Continue university matching" : "Browse universities"}
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              {otherRoute && otherRouteHref && (
                <Link href={otherRouteHref} className={styles.secondaryAction}>
                  <Route size={16} aria-hidden="true" />
                  Switch to {otherRoute.category}
                </Link>
              )}
            </div>
          </aside>
        </div>

        <section className={styles.savedSection}>
          <div className={styles.cardHeading}>
            <div>
              <p className={styles.eyebrow}>SHORTLIST</p>
              <h2>Saved universities</h2>
            </div>
            <span className={styles.cardIcon}>
              <Bookmark size={20} aria-hidden="true" />
            </span>
          </div>

          {!memory.available ? (
            <p className={styles.mutedNote}>
              Saved universities could not be loaded right now. They are not
              lost; reload the page in a moment.
            </p>
          ) : savedUniversities.length ? (
            <ul className={styles.savedList}>
              {savedUniversities.map((university) => (
                <li key={university.id}>
                  <Link href={`/universities/${encodeURIComponent(university.id)}`}>
                    <Image
                      src={`https://flagcdn.com/w40/${university.countryCode.toLowerCase()}.png`}
                      alt=""
                      width={22}
                      height={16}
                      unoptimized
                    />
                    <span>
                      <strong>
                        {verifiedPrograms.find(
                          (program) => program.universityId === university.id,
                        )?.universityName ?? university.name}
                      </strong>
                      <small>{university.country}</small>
                    </span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.mutedNote}>
              Nothing saved yet. Use the bookmark on a university card in your
              matches to keep it here.
            </p>
          )}
        </section>

        <AccountDataControls />
      </div>
    </main>
  );
}
