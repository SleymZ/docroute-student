"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

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
import { buildRoutePreview } from "@/lib/build-route-preview";
import { matchProgram } from "@/lib/match-programs";
import { parseApplicantProfile } from "@/lib/profile-query";
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
    label: "Profile aligned",
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

export function RoutePreviewScreen() {
  const searchParams = useSearchParams();
  const profileKey = searchParams.toString();
  const profile = useMemo(
    () =>
      parseApplicantProfile(
        new URLSearchParams(profileKey),
      ),
    [profileKey],
  );
  const programId = searchParams.get("programId");
  const program = findVerifiedProgram(programId);
  const route = useMemo(() => {
    if (!profile || !program) {
      return null;
    }

    return buildRoutePreview(
      profile,
      matchProgram(profile, program),
    );
  }, [profile, program]);
  const [completedTasks, setCompletedTasks] = useState<Set<string>>(
    () => new Set(),
  );

  if (!profile || !program || !route) {
    return (
      <div className={styles.invalidPage}>
        <Route size={36} aria-hidden="true" />
        <h1>Your route needs a verified program</h1>
        <p>
          Complete the applicant profile and open one of the verified
          university programs first.
        </p>
        <Link href="/explore">
          <ArrowLeft size={17} aria-hidden="true" />
          Return to Explore
        </Link>
      </div>
    );
  }

  const universityParams = new URLSearchParams(searchParams.toString());
  const universityHref = `/universities/${encodeURIComponent(
    program.universityId,
  )}?${universityParams.toString()}`;
  const actionableTasks = route.stages.flatMap((stage) =>
    stage.tasks.filter(
      (task) =>
        task.status !== "information" &&
        task.status !== "not-applicable",
    ),
  );
  const completedCount = actionableTasks.filter((task) =>
    completedTasks.has(task.id),
  ).length;
  const progress = actionableTasks.length
    ? Math.round((completedCount / actionableTasks.length) * 100)
    : 100;

  function toggleTask(taskId: string) {
    setCompletedTasks((current) => {
      const next = new Set(current);

      if (next.has(taskId)) {
        next.delete(taskId);
      } else {
        next.add(taskId);
      }

      return next;
    });
  }

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
          {route.stages.map((stage) => {
            const stageActionable = stage.tasks.filter(
              (task) =>
                task.status !== "information" &&
                task.status !== "not-applicable",
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
                      const canComplete =
                        task.status !== "information" &&
                        task.status !== "not-applicable";
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
                            onClick={() => toggleTask(task.id)}
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
                            {task.dueLabel && (
                              <small>
                                <CalendarDays size={13} aria-hidden="true" />
                                {task.dueLabel}
                              </small>
                            )}
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
        </div>

        <aside className={styles.controlPanel}>
          <p className={styles.eyebrow}>ROUTE CONTROL</p>
          <h2>{progress}% prepared</h2>

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
              <strong>31 March 2027</strong>
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

          <p className={styles.disclaimer}>{route.disclaimer}</p>
        </aside>
      </div>
    </div>
  );
}
