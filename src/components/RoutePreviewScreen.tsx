"use client";

import { useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  CheckCircle2,
  CircleDashed,
  Clock3,
  ExternalLink,
  FileCheck2,
  Flag,
  GraduationCap,
  Info,
  MapPin,
  Route,
  ShieldCheck,
} from "lucide-react";

import { findVerifiedProgram } from "@/data/verified-programs";
import { AdmissionSources } from "@/components/AdmissionSources";
import { MovePlanner } from "@/components/MovePlanner";
import { WaitlistCta } from "@/components/WaitlistCta";
import { slovakiaResidenceRules } from "@/data/slovakia-residence";
import { planCzechiaDeadlines } from "@/lib/residence/czechia";
import { useApplicantProfile } from "@/hooks/useApplicantProfile";
import { useRouteProgress } from "@/hooks/useRouteProgress";
import { buildRoutePreview, czechStudyRoute } from "@/lib/build-route-preview";
import { matchProgram, matchStatusLabels } from "@/lib/match-programs";
import { createProfileSearchParams, getProfileProgressId } from "@/lib/profile-query";
import { addDays, isIsoDate, planStudyResidenceDeadlines } from "@/lib/residence/deadlines";
import {
  isChangeOfPurpose,
  residenceFilingPlace,
  usesThirdCountryResidence,
} from "@/lib/residence/slovakia";
import type { RouteTaskStatus } from "@/types/route-preview";

import styles from "./RoutePreviewScreen.module.css";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

const statusMeta: Record<
  RouteTaskStatus,
  {
    label: string;
    icon: typeof CheckCircle2;
  }
> = {
  ready: {
    label: "Condition met",
    icon: CheckCircle2,
  },
  action: {
    label: "Action required",
    icon: CircleDashed,
  },
  attention: {
    label: "Needs attention",
    icon: AlertCircle,
  },
  information: {
    label: "Important information",
    icon: Info,
  },
  "not-applicable": {
    label: "Not applicable",
    icon: Check,
  },
};

// "ready" means the profile already meets the condition (e.g. recognition
// does not apply), so it is neither an open action nor something to tick.
function isActionable(status: RouteTaskStatus) {
  return status === "action" || status === "attention";
}

export function RoutePreviewScreen({ asOfDate }: { asOfDate: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const profileState = useApplicantProfile(searchParams);
  const profile = profileState.profile;
  const programId = searchParams.get("programId");
  const program = findVerifiedProgram(programId);
  const route = useMemo(() => {
    if (!profile || !program) {
      return null;
    }

    return buildRoutePreview(
      profile,
      matchProgram(profile, program, asOfDate),
    );
  }, [profile, program, asOfDate]);
  const routeKey =
    route && program
      ? `${program.id}:${route.version}:${getProfileProgressId(route.generatedFor)}`
      : null;
  const routeProgress = useRouteProgress(routeKey);
  const completedTasks = routeProgress.values;

  // The move date lives in the URL so it survives reloads, can be shared and
  // renders the same on the server and in the browser.
  const rawMoveDate = searchParams.get("move") ?? "";
  const moveDate = isIsoDate(rawMoveDate) ? rawMoveDate : "";
  const czechRoute = useMemo(
    () => (profile && program?.countryCode === "CZ" ? czechStudyRoute(profile) : null),
    [profile, program],
  );
  const thirdCountry = czechRoute
    ? czechRoute.procedure === "study"
    : profile
      ? usesThirdCountryResidence(profile)
      : false;
  const deadlinePlan = useMemo(() => {
    if (!profile || !program || !route || !thirdCountry || !moveDate) {
      return null;
    }

    if (czechRoute) {
      return planCzechiaDeadlines(czechRoute, moveDate, asOfDate, program.application.admissionDate);
    }

    return planStudyResidenceDeadlines({
      moveDate,
      today: asOfDate,
      filing: residenceFilingPlace(profile.currentResidenceStatus),
      applicationDeadline: program.application.deadline,
      admissionDate: program.application.admissionDate,
      processingDays: slovakiaResidenceRules.processingTimeDays,
      changeOfPurpose: isChangeOfPurpose(profile),
    });
  }, [profile, program, route, thirdCountry, czechRoute, moveDate, asOfDate]);
  const datedTaskLabels = new Map(
    (deadlinePlan?.items ?? [])
      .filter((item) => item.taskId)
      .map((item) => [
        item.taskId as string,
        // That task bundles several duties; only the arrival report is dated.
        item.taskId === "post-card-duties"
          ? `Report arrival ${item.dateLabel.replace(/^By /, "by ")}`
          : item.dateLabel,
      ]),
  );

  function changeMoveDate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (isIsoDate(value)) {
      params.set("move", value);
    } else {
      params.delete("move");
    }
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (profileState.loading) {
    return <div className={styles.invalidPage} role="status">Loading your saved profile…</div>;
  }

  if (!profile || !program || !route) {
    return (
      <div className={styles.invalidPage}>
        <Route size={36} aria-hidden="true" />
        <h1>Your route needs a compatible, current program</h1>
        <p>
          Select a verified program for your exact destination, subject, degree and intake.
          A closed deadline or a different intake cannot be used to build an active route.
        </p>
        <Link href={profile ? `/route/universities?${createProfileSearchParams(profile).toString()}` : "/explore"}>
          <ArrowLeft size={17} aria-hidden="true" />
          {profile ? "Return to your options" : "Return to Explore"}
        </Link>
      </div>
    );
  }

  const universityParams = createProfileSearchParams(profile);
  universityParams.set("flow", "route");
  universityParams.set("programId", program.id);
  const universityHref = `/universities/${encodeURIComponent(
    program.universityId,
  )}?${universityParams.toString()}`;
  // Changing the profile changes the progress namespace, so earlier ticks
  // are not carried into a route built for different data.
  const editProfileHref = `/route/profile?${createProfileSearchParams(profile).toString()}`;
  const actionableTasks = route.stages.flatMap((stage) =>
    stage.tasks.filter(
      (task) => isActionable(task.status),
    ),
  );
  const completedCount = actionableTasks.filter((task) =>
    completedTasks.has(task.id),
  ).length;
  const progress = actionableTasks.length
    ? Math.round((completedCount / actionableTasks.length) * 100)
    : 100;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href={universityHref}>
          <ArrowLeft size={16} aria-hidden="true" />
          Back to program
        </Link>
        <span>/</span>
        <strong>Preview route</strong>
      </nav>

      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <p className={styles.eyebrow}>APPLICATION TO ARRIVAL</p>
          <h1>
            Your route to <span>{program.universityName}</span>
          </h1>
          <p>
            One personalised sequence for university documents, admission
            conditions, enrolment, and the residence stage that applies to
            your citizenship and current status.
          </p>
          <p role="status">{matchStatusLabels[route.match.status]} — {route.match.summary}</p>
        </div>

        <div className={styles.heroRoute}>
          <span className={styles.routePoint}>
            <GraduationCap size={20} aria-hidden="true" />
          </span>
          <div>
            <small>PROGRAM</small>
            <strong>{program.programName}</strong>
            <p>
              {program.faculty} · {program.intake}
            </p>
          </div>
          <Image
            src={`https://flagcdn.com/w80/${program.countryCode.toLowerCase()}.png`}
            alt={`${program.country} flag`}
            width={36}
            height={26}
            unoptimized
          />
        </div>
      </header>

      <section className={styles.routeFacts}>
        <article>
          <MapPin size={18} aria-hidden="true" />
          <div>
            <small>DESTINATION</small>
            <strong>
              {program.city}, {program.country}
            </strong>
          </div>
        </article>
        <article>
          <CalendarDays size={18} aria-hidden="true" />
          <div>
            <small>FIRST DEADLINE</small>
            <strong>{formatDate(program.application.deadline)}</strong>
          </div>
        </article>
        <article>
          <Flag size={18} aria-hidden="true" />
          <div>
            <small>CITIZENSHIP</small>
            <strong>{profile.citizenshipCountryCode}</strong>
          </div>
        </article>
        <article>
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <small>ROUTE VERSION</small>
            <strong>{route.version}</strong>
          </div>
        </article>
      </section>

      <div className={styles.layout}>
        <div className={styles.timeline}>
          <MovePlanner
            moveDate={moveDate}
            minDate={addDays(asOfDate, 1)}
            plan={deadlinePlan}
            {...(czechRoute
              ? {
                  description:
                    "Enter the date you need to be living in Czechia, for example the start of studies. DocRoute calculates when each residence step has to be done.",
                  footnote:
                    "Dates are calculated from the published maximum periods (calendar days). The Ministry of the Interior can decide sooner.",
                }
              : {})}
            unavailableReason={
              thirdCountry
                ? null
                : "Your profile does not use the third-country student residence procedure, so there are no residence deadlines to plan. See the residence stage below."
            }
            onMoveDateChange={changeMoveDate}
          />

          {route.stages.map((stage) => {
            const stageActionable = stage.tasks.filter(
              (task) => isActionable(task.status),
            );
            const stageCompleted = stageActionable.filter((task) =>
              completedTasks.has(task.id),
            ).length;

            return (
              <section className={styles.stage} key={stage.id}>
                <div className={styles.stageRail}>
                  <span>{stage.number}</span>
                </div>

                <div className={styles.stageBody}>
                  <header className={styles.stageHeader}>
                    <div>
                      <p className={styles.eyebrow}>{stage.eyebrow}</p>
                      <h2>{stage.title}</h2>
                      <p>{stage.description}</p>
                    </div>

                    <div className={styles.stageTiming}>
                      <Clock3 size={15} aria-hidden="true" />
                      {stage.timing}
                    </div>
                  </header>

                  {stageActionable.length > 0 && (
                    <div className={styles.stageProgress}>
                      <span
                        style={{
                          width: `${Math.round(
                            (stageCompleted / stageActionable.length) * 100,
                          )}%`,
                        }}
                      />
                    </div>
                  )}

                  <div className={styles.taskList}>
                    {stage.tasks.map((task) => {
                      const meta = statusMeta[task.status];
                      const StatusIcon = meta.icon;
                      const canComplete = isActionable(task.status);
                      const completed = completedTasks.has(task.id);

                      return (
                        <article
                          key={task.id}
                          className={`${styles.task} ${
                            completed ? styles.taskCompleted : ""
                          }`}
                        >
                          <button
                            type="button"
                            className={styles.taskToggle}
                            disabled={!canComplete}
                            aria-label={
                              completed
                                ? `Mark ${task.title} as incomplete`
                                : `Mark ${task.title} as complete`
                            }
                            aria-pressed={completed}
                            onClick={() =>
                              routeProgress.toggle(task.id)
                            }
                          >
                            {completed ? (
                              <Check size={16} aria-hidden="true" />
                            ) : (
                              <StatusIcon size={16} aria-hidden="true" />
                            )}
                          </button>

                          <div className={styles.taskCopy}>
                            <div className={styles.taskHeading}>
                              <strong>{task.title}</strong>
                              <span
                                className={`${styles.taskStatus} ${
                                  styles[
                                    `status${task.status
                                      .split("-")
                                      .map(
                                        (part) =>
                                          part[0].toUpperCase() + part.slice(1),
                                      )
                                      .join("")}`
                                  ]
                                }`}
                              >
                                {meta.label}
                              </span>
                            </div>
                            <p>{task.description}</p>
                            {(datedTaskLabels.get(task.id) ?? task.dueLabel) && (
                              <small>
                                <CalendarDays size={13} aria-hidden="true" />
                                {datedTaskLabels.get(task.id) ?? task.dueLabel}
                              </small>
                            )}
                            <AdmissionSources sourceIds={task.sourceIds} sources={route.sources} />
                          </div>
                        </article>
                      );
                    })}
                  </div>
                </div>
              </section>
            );
          })}

          <section className={styles.sources}>
            <header>
              <FileCheck2 size={21} aria-hidden="true" />
              <div>
                <p className={styles.eyebrow}>SOURCE REGISTER</p>
                <h2>Rules used in this route</h2>
              </div>
            </header>

            <div>
              {route.sources.map((source) => (
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  key={source.id}
                >
                  <span>
                    <small>
                      {source.authority === "official"
                        ? "OFFICIAL SOURCE"
                        : "AUTHORITATIVE GUIDANCE"}
                    </small>
                    <strong>{source.title}</strong>
                    <p>
                      {source.publisher} · checked {source.checkedAt}
                    </p>
                  </span>
                  <ExternalLink size={16} aria-hidden="true" />
                </a>
              ))}
            </div>
          </section>
          <WaitlistCta route={program.countryCode === "CZ" ? "study-cz" : "study-sk"} />
        </div>

        <aside className={styles.controlPanel}>
          <p className={styles.eyebrow}>ROUTE CONTROL</p>
          <h2>{progress}% prepared</h2>

          <p
            className={styles.memoryStatus}
            data-error={routeProgress.error ? "true" : undefined}
            role={routeProgress.error ? "status" : undefined}
          >
            {routeProgress.loading
              ? "Loading your progress…"
              : routeProgress.error
                ? "Sync is unavailable. Progress is still saved on this device."
                : routeProgress.syncing
                  ? "Saving progress…"
                  : routeProgress.signedIn
                    ? "Progress syncs with your DocRoute account."
                    : "Progress is saved on this device."}
          </p>

          <div className={styles.progressRing}>
            <svg viewBox="0 0 120 120" aria-hidden="true">
              <circle cx="60" cy="60" r="52" />
              <circle
                cx="60"
                cy="60"
                r="52"
                pathLength="100"
                style={{ strokeDashoffset: 100 - progress }}
              />
            </svg>
            <strong>{completedCount}</strong>
            <span>of {actionableTasks.length}</span>
          </div>

          <div className={styles.controlStats}>
            <div>
              <span>Stages</span>
              <strong>{route.stages.length}</strong>
            </div>
            <div>
              <span>Open actions</span>
              <strong>{actionableTasks.length - completedCount}</strong>
            </div>
            <div>
              <span>Official sources</span>
              <strong>
                {
                  route.sources.filter(
                    (source) => source.authority === "official",
                  ).length
                }
              </strong>
            </div>
          </div>

          <div className={styles.controlDeadline}>
            <CalendarDays size={19} aria-hidden="true" />
            <div>
              <small>NEXT FIXED DEADLINE</small>
              <strong>
                {formatDate(program.application.deadline)}
              </strong>
              <span>University application</span>
            </div>
          </div>

          <a
            href={program.application.applicationUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.officialApplication}
          >
            Official application
            <ArrowUpRight size={17} aria-hidden="true" />
          </a>

          <Link href={universityHref} className={styles.editRoute}>
            Review requirements
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <Link href={editProfileHref} className={styles.editRoute}>
            Edit my profile
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <p className={styles.disclaimer}>{route.disclaimer}</p>
        </aside>
      </div>
    </div>
  );
}
