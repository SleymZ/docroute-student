"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ExternalLink, Info, Pencil } from "lucide-react";

import { CountryPicker } from "@/components/CountryPicker";
import { FeedbackForm } from "@/components/FeedbackForm";
import { PrintNote, SaveRoutePdf } from "@/components/SaveRoutePdf";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { formatPendingDegree, pendingStatusLabel, type PendingProgramGroup } from "@/data/pending-programs";
import { useApplicantProfile } from "@/hooks/useApplicantProfile";
import { useRouteProgress } from "@/hooks/useRouteProgress";
import {
  answersFromProfile,
  buildFullPath,
  countryLabel,
  findFullPathGroup,
  fullPathHref,
  parseFullPathAnswers,
  type FullPathAnswers,
} from "@/lib/full-path";
import { getResidenceStatusLabel } from "@/lib/profile-options";
import { formatPlanDate } from "@/lib/residence/deadlines";
import { currentResidenceStatuses, type CurrentResidenceStatus } from "@/types/admission";
import type { RouteTaskStatus } from "@/types/route-preview";

import styles from "./WorkRouteScreen.module.css";

// "EU, EEA or Swiss passport" keeps its capitals; "Temporary residence…" does not.
function lowerFirst(value: string) {
  return /^[A-Z][a-z]/.test(value) ? value.charAt(0).toLowerCase() + value.slice(1) : value;
}

function isActionableTask(status: RouteTaskStatus) {
  return status === "action" || status === "attention";
}

const coverageNote = {
  verified: "Residence steps come from DocRoute's source-checked residence route for this country.",
  "official-link":
    "Residence steps point to the official page; DocRoute has not verified this country's procedure step by step yet.",
  none: "No foreign residence permit step applies to you.",
} as const;

function FullPathQuestions({
  group,
  initial,
}: {
  group: PendingProgramGroup;
  initial: FullPathAnswers | null;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { profile } = useApplicantProfile(searchParams);
  const [citizenship, setCitizenship] = useState(initial?.citizenshipCountryCode ?? "");
  const [status, setStatus] = useState<CurrentResidenceStatus | "">(initial?.currentResidenceStatus ?? "");
  const [error, setError] = useState("");

  // Prefill once from a saved or linked profile; the person still confirms.
  useEffect(() => {
    if (!profile || initial) return;
    const local = answersFromProfile(profile, group.countryCode);
    if (!local) return;
    setCitizenship((value) => value || local.citizenshipCountryCode);
    setStatus((value) => value || local.currentResidenceStatus);
  }, [profile, initial, group.countryCode]);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!citizenship || !status) {
      setError("Choose your citizenship and current status to build the path.");
      return;
    }
    router.push(fullPathHref(group.id, { citizenshipCountryCode: citizenship, currentResidenceStatus: status }));
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.formGrid}>
        <CountryPicker
          label="Citizenship"
          value={citizenship}
          options={applicantCountryOptions}
          placeholder="Select citizenship"
          onChange={setCitizenship}
        />
        <label className={styles.field}>
          <span>Passport and current residence status</span>
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value as CurrentResidenceStatus | "")}
            required
          >
            <option value="">Select current residence status</option>
            {currentResidenceStatuses.map((option) => (
              <option key={option} value={option}>
                {getResidenceStatusLabel(option, countryLabel(group))}
              </option>
            ))}
          </select>
        </label>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
      <button type="submit" className={styles.submit}>
        Build my full path
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </form>
  );
}

export function FullPathScreen({ asOfDate }: { asOfDate: string }) {
  const searchParams = useSearchParams();
  const group = findFullPathGroup(searchParams.get("group"));
  const answers = parseFullPathAnswers(searchParams);
  const editing = searchParams.get("edit") === "1";
  const path = group && answers && !editing ? buildFullPath(group, answers) : null;
  const routeKey = path
    ? `full-${path.group.id}:${path.version}:${path.answers.citizenshipCountryCode}-${path.answers.currentResidenceStatus}`
    : null;
  const routeProgress = useRouteProgress(routeKey);

  const breadcrumb = (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb" data-print-hide="">
      <Link href={group ? `/universities/${encodeURIComponent(group.universityId)}` : "/explore"}>
        <ArrowLeft size={15} aria-hidden="true" />
        {group ? group.universityName : "Explore"}
      </Link>
      <span aria-hidden="true">/</span>
      <span>Full study path</span>
    </nav>
  );

  if (!group) {
    return (
      <div className={styles.page}>
        {breadcrumb}
        <section className={styles.intro}>
          <h1>Full study path not available</h1>
          <p>
            Open a university from <Link href="/explore">Explore</Link> or your options and choose
            &ldquo;Build my full path&rdquo; on one of its listed programmes.
          </p>
        </section>
      </div>
    );
  }

  const title = `${group.universityName}: full study path`;

  if (!path) {
    return (
      <div className={styles.page}>
        {breadcrumb}
        <section className={styles.intro}>
          <h1>{title}</h1>
          <p>
            From choosing {group.faculty} to living in {countryLabel(group)}: application, entrance
            requirements, enrolment and the visa or residence step. Two answers decide the residence
            part. They stay in this page&apos;s address; nothing is uploaded.
          </p>
        </section>
        <FullPathQuestions group={group} initial={answers} />
      </div>
    );
  }

  const completed = new Set(routeProgress.values);
  const actionable = path.stages.flatMap((stage) => stage.tasks.filter((task) => isActionableTask(task.status)));
  const completedCount = actionable.filter((task) => completed.has(task.id)).length;
  const progress = actionable.length ? Math.round((completedCount / actionable.length) * 100) : 100;
  const editParams = new URLSearchParams(searchParams.toString());
  editParams.set("edit", "1");

  return (
    <div className={styles.page}>
      {breadcrumb}

      <header className={styles.head}>
        <div>
          <h1>{title}</h1>
          <p className={styles.summary}>
            <strong>
              {group.faculty} · {formatPendingDegree(group.degreeLevel, group.category)} · {group.intake}.
            </strong>{" "}
            {pendingStatusLabel(group.status)}. Citizenship {path.answers.citizenshipCountryCode},{" "}
            {lowerFirst(getResidenceStatusLabel(path.answers.currentResidenceStatus, countryLabel(group)))}.{" "}
            <Link
              href={`/route/full?${editParams.toString()}`}
              style={{ display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "nowrap" }}
            >
              <Pencil size={13} aria-hidden="true" /> Change answers
            </Link>
          </p>
        </div>
        <div className={styles.headActions}>
          <SaveRoutePdf title={title} />
        </div>
      </header>
      <PrintNote asOfDate={asOfDate} />

      <ol className={styles.strip} aria-label="Path stages">
        {path.stages.map((stage, index) => {
          const tasks = stage.tasks.filter((task) => isActionableTask(task.status));
          const done = tasks.filter((task) => completed.has(task.id)).length;
          const complete = tasks.length > 0 && done === tasks.length;
          return (
            <li key={stage.id} data-complete={complete || undefined}>
              <a href={`#stage-${stage.id}`}>
                <span className={styles.stop} aria-hidden="true">
                  {complete ? <Check size={13} /> : index + 1}
                </span>
                <strong>{stage.eyebrow.charAt(0) + stage.eyebrow.slice(1).toLowerCase()}</strong>
                <span className={styles.when}>{stage.timing}</span>
                {tasks.length > 0 && (
                  <small>
                    {done} of {tasks.length} done
                  </small>
                )}
              </a>
            </li>
          );
        })}
      </ol>

      <div className={styles.layout}>
        <div className={styles.main}>
          <div className={styles.notice} role="note">
            <AlertTriangle size={17} aria-hidden="true" />
            <ul>
              <li>
                The approved {group.intake} rules are not verified into a personalised route yet, so your
                profile was not checked against them.
              </li>
              <li>{coverageNote[path.residenceCoverage]}</li>
            </ul>
          </div>

          {path.stages.map((stage, index) => (
            <section key={stage.id} id={`stage-${stage.id}`} className={styles.stage} aria-labelledby={`stage-${stage.id}-title`}>
              <header className={styles.stageHead}>
                <span className={styles.stageNumber} aria-hidden="true">
                  {index + 1}
                </span>
                <div>
                  <h2 id={`stage-${stage.id}-title`}>{stage.title}</h2>
                  <p>{stage.description}</p>
                </div>
              </header>
              <ul className={styles.tasks}>
                {stage.tasks.map((task) => {
                  const canTick = isActionableTask(task.status);
                  const done = completed.has(task.id);
                  return (
                    <li key={task.id} className={styles.task} data-status={task.status} data-done={done || undefined}>
                      {canTick ? (
                        <button
                          type="button"
                          className={styles.tick}
                          aria-pressed={done}
                          aria-label={done ? `Mark ${task.title} as not done` : `Mark ${task.title} as done`}
                          onClick={() => routeProgress.toggle(task.id)}
                        >
                          {done && <Check size={14} aria-hidden="true" />}
                        </button>
                      ) : (
                        <span className={styles.infoMark} aria-hidden="true">
                          <Info size={14} />
                        </span>
                      )}
                      <div className={styles.taskBody}>
                        <div className={styles.taskTitle}>
                          <h3>{task.title}</h3>
                          {task.status === "attention" && <span className={styles.flag}>Needs attention</span>}
                        </div>
                        <p>{task.description}</p>
                        <div className={styles.taskMeta}>
                          {task.dueLabel && <span>{task.dueLabel}</span>}
                          {path.sources
                            .filter((source) => task.sourceIds.includes(source.id))
                            .map((source) => (
                              <a key={source.id} href={source.url} target="_blank" rel="noopener noreferrer">
                                {source.title}
                              </a>
                            ))}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}

          <section className={styles.sourceList} aria-labelledby="full-path-sources">
            <h2 id="full-path-sources">Sources</h2>
            <ul>
              {path.sources.map((source) => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                  <span>
                    {source.publisher}
                    {source.authority === "official" ? " (official)" : ""}, checked {formatPlanDate(source.checkedAt)}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.disclaimer}>{path.disclaimer}</p>
          </section>
          <FeedbackForm />
        </div>

        <aside className={styles.side} aria-label="Key facts and progress">
          {path.keyFacts.length > 0 && (
            <ol className={styles.keyDates}>
              {path.keyFacts.map((fact) => (
                <li key={fact.label}>
                  <span>{fact.label}</span>
                  <strong>{fact.value}</strong>
                </li>
              ))}
            </ol>
          )}
          <div className={styles.progress}>
            <div className={styles.progressLine}>
              <span>
                {completedCount} of {actionable.length} steps done
              </span>
              <strong>{progress}%</strong>
            </div>
            <div className={styles.bar} aria-hidden="true">
              <span style={{ width: `${progress}%` }} />
            </div>
            <p className={styles.sync} data-error={routeProgress.error ? "true" : undefined}>
              {routeProgress.loading
                ? "Loading your progress…"
                : routeProgress.error
                  ? "Sync is unavailable. Progress is still saved on this device."
                  : routeProgress.signedIn
                    ? "Progress syncs with your account."
                    : "Progress is saved on this device."}
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
