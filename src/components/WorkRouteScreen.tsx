"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  ExternalLink,
  Info,
} from "lucide-react";

import { CountryPicker } from "@/components/CountryPicker";
import { WaitlistCta } from "@/components/WaitlistCta";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { slovakiaWorkRules } from "@/data/slovakia-work";
import { useRouteProgress } from "@/hooks/useRouteProgress";
import { getResidenceStatusLabel } from "@/lib/profile-options";
import {
  addDays,
  formatPlanDate,
  isIsoDate,
  planWorkResidenceDeadlines,
  type DeadlineTone,
} from "@/lib/residence/deadlines";
import { buildSlovakiaWorkRoute, workRouteLabels } from "@/lib/residence/slovakia-work";
import {
  createWorkProfileSearchParams,
  getWorkProgressId,
  parseWorkProfile,
  type WorkProfile,
  type YesNo,
  type YesNoUnsure,
} from "@/lib/work-profile";
import { currentResidenceStatuses, type CurrentResidenceStatus } from "@/types/admission";
import type { RouteTaskStatus } from "@/types/route-preview";

import styles from "./WorkRouteScreen.module.css";

function isActionableTask(status: RouteTaskStatus) {
  return status === "action" || status === "attention";
}

// How the summary line describes the current status.
const statusPhrases: Record<CurrentResidenceStatus, string> = {
  "eu-eea-swiss-passport": "an EU, EEA or Swiss passport",
  "non-eu-passport-no-residence": "no residence permit yet",
  "destination-study-residence": "Slovak temporary residence for study",
  "destination-residence": "Slovak temporary residence for another purpose",
  "destination-permanent-residence": "Slovak permanent or long-term residence",
  "other-eu-residence": "a residence permit in another EU / EEA country",
  "destination-national-visa": "a Slovak national visa",
  "visa-free-entry": "a visa-free stay in Slovakia",
  "temporary-protection": "temporary protection",
  other: "another status",
};

type ChoiceOption<T extends string> = { value: T; label: string };

function ChoiceGroup<T extends string>({
  name,
  legend,
  hint,
  value,
  options,
  onChange,
}: {
  name: string;
  legend: string;
  hint?: string;
  value: T | "";
  options: ChoiceOption<T>[];
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className={styles.choice}>
      <legend>{legend}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.choiceOptions}>
        {options.map((option) => (
          <label key={option.value} data-checked={value === option.value || undefined}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              required
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

const yesNo: ChoiceOption<YesNo>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const yesNoUnsure: ChoiceOption<YesNoUnsure>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

function readYesNo(value: string | null): YesNo | "" {
  return value === "yes" || value === "no" ? value : "";
}

function readYesNoUnsure(value: string | null): YesNoUnsure | "" {
  return value === "yes" || value === "no" || value === "unsure" ? value : "";
}

function WorkQuestionnaire({ initial }: { initial: URLSearchParams }) {
  const router = useRouter();
  const [citizenship, setCitizenship] = useState(
    (initial.get("citizenship") ?? "").toUpperCase(),
  );
  const [status, setStatus] = useState<CurrentResidenceStatus | "">(() => {
    const value = initial.get("residenceStatus");
    return currentResidenceStatuses.includes(value as CurrentResidenceStatus)
      ? (value as CurrentResidenceStatus)
      : "";
  });
  const [offer, setOffer] = useState(readYesNo(initial.get("offer")));
  const [graduate, setGraduate] = useState(readYesNo(initial.get("skGraduate")));
  const [blueCard, setBlueCard] = useState(readYesNoUnsure(initial.get("blueCard")));
  const [shortage, setShortage] = useState(readYesNoUnsure(initial.get("shortage")));
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!citizenship || !status || !offer || !graduate || !blueCard || !shortage) {
      setError("Answer every question to build your route.");
      return;
    }

    const profile: WorkProfile = {
      destinationCountryCode: "SK",
      citizenshipCountryCode: citizenship,
      currentResidenceStatus: status,
      jobOffer: offer,
      slovakGraduate: graduate,
      blueCardConditions: blueCard,
      shortageOccupation: shortage,
    };
    const params = createWorkProfileSearchParams(profile);
    const move = initial.get("move");
    if (isIsoDate(move)) params.set("move", move);
    router.push(`/route/work?${params.toString()}`);
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
            onChange={(event) =>
              setStatus(event.target.value as CurrentResidenceStatus | "")
            }
            required
          >
            <option value="">Select current residence status</option>
            {currentResidenceStatuses.map((option) => (
              <option key={option} value={option}>
                {getResidenceStatusLabel(option, "Slovakia")}
              </option>
            ))}
          </select>
        </label>
      </div>

      <ChoiceGroup
        name="offer"
        legend="Do you have a job offer from an employer in Slovakia?"
        value={offer}
        options={yesNo}
        onChange={setOffer}
      />

      <ChoiceGroup
        name="skGraduate"
        legend="Did you graduate from a secondary school or university in Slovakia?"
        hint="Slovak graduates can be employed without a work permit or Labour Office confirmation."
        value={graduate}
        options={yesNo}
        onChange={setGraduate}
      />

      <ChoiceGroup
        name="blueCard"
        legend="Do you meet the EU Blue Card conditions?"
        hint={`A university degree (or ICT professional skills), a salary of at least ${slovakiaWorkRules.blueCard.salaryMultiplier}× the Slovak average wage, and a contract of at least ${slovakiaWorkRules.blueCard.minContractMonths} months.`}
        value={blueCard}
        options={yesNoUnsure}
        onChange={setBlueCard}
      />

      <ChoiceGroup
        name="shortage"
        legend="Is the job on the regional labour-shortage list?"
        hint="Your employer can check the official list. It shortens the decision period for a single permit."
        value={shortage}
        options={yesNoUnsure}
        onChange={setShortage}
      />

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit}>
        Build my work route
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </form>
  );
}

export function WorkRouteScreen({ asOfDate }: { asOfDate: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const editing = searchParams.get("edit") === "1";
  const profile = useMemo(
    () => parseWorkProfile(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const route = useMemo(
    () => (profile ? buildSlovakiaWorkRoute(profile) : null),
    [profile],
  );
  const routeKey = route
    ? `work-sk:${route.version}:${getWorkProgressId(route.profile)}`
    : null;
  const routeProgress = useRouteProgress(routeKey);
  const completed = routeProgress.values;

  const rawMoveDate = searchParams.get("move") ?? "";
  const moveDate = isIsoDate(rawMoveDate) ? rawMoveDate : "";
  const plan = useMemo(() => {
    if (!route || !route.authorisation || !route.filing || !route.processingDays || !moveDate) {
      return null;
    }
    return planWorkResidenceDeadlines({
      moveDate,
      today: asOfDate,
      filing: route.filing,
      route: route.authorisation,
      processingDays: route.processingDays,
      hasJobOffer: route.profile.jobOffer === "yes",
      shortageOccupation: route.profile.shortageOccupation,
      vacancyReportWorkingDays: slovakiaWorkRules.vacancyReportWorkingDays,
      fileWithinDaysOfConfirmation: slovakiaWorkRules.fileWithinDaysOfConfirmation,
      documentMaxAgeDays: slovakiaWorkRules.documentMaxAgeDays,
      reportWorkingDays: slovakiaWorkRules.reportArrivalWorkingDays,
    });
  }, [route, moveDate, asOfDate]);

  const datedLabels = new Map<string, string>();
  for (const item of plan?.items ?? []) {
    if (!item.taskId) continue;
    // That task bundles several duties; only the arrival report is dated.
    datedLabels.set(
      item.taskId,
      item.taskId === "post-card-duties"
        ? `Report arrival ${item.dateLabel.replace(/^By /, "by ")}`
        : item.dateLabel,
    );
  }

  function changeMoveDate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (isIsoDate(value)) params.set("move", value);
    else params.delete("move");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  if (!profile || !route || editing) {
    const initial = new URLSearchParams(searchParams.toString());
    return (
      <div className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/?purpose=work#route-builder">
            <ArrowLeft size={15} aria-hidden="true" />
            Home
          </Link>
          <span aria-hidden="true">/</span>
          <span>Work route</span>
        </nav>

        <section className={styles.intro}>
          <h1>Working in Slovakia</h1>
          <p>
            Six questions decide which official procedure applies: the single
            permit, the EU Blue Card, or the exemption for Slovak graduates.
            Answers stay in this page&apos;s address; nothing is uploaded.
          </p>
        </section>

        <WorkQuestionnaire initial={initial} />
      </div>
    );
  }

  const actionable = route.stages.flatMap((stage) =>
    stage.tasks.filter((task) => isActionableTask(task.status)),
  );
  const completedCount = actionable.filter((task) => completed.has(task.id)).length;
  const progress = actionable.length
    ? Math.round((completedCount / actionable.length) * 100)
    : 100;
  const editParams = createWorkProfileSearchParams(profile);
  editParams.set("edit", "1");
  if (moveDate) editParams.set("move", moveDate);
  const editHref = `/route/work?${editParams.toString()}`;
  const citizenshipName =
    applicantCountryOptions.find((country) => country.code === profile.citizenshipCountryCode)
      ?.name ?? profile.citizenshipCountryCode;
  const planItem = (id: string) => plan?.items.find((item) => item.id === id);

  // One date (or timing hint) per stage for the route strip.
  function stageWhen(stageId: string): { label: string; tone?: DeadlineTone } {
    if (stageId === "job") {
      const report = planItem("vacancy-report");
      if (report) return { label: `Employer acts by ${report.dateLabel.replace(/^No later than /, "")}`, tone: report.tone };
      return { label: profile!.jobOffer === "yes" ? "Now" : "Find an employer" };
    }
    if (stageId === "authorisation") {
      const confirmation = planItem("labour-office-confirmation");
      if (confirmation) return { label: confirmation.dateLabel, tone: confirmation.tone };
      return { label: route!.authorisation === "slovak-graduate" ? "Before filing" : "Employer + Labour Office" };
    }
    if (stageId === "residence-application") {
      const filing = planItem("residence-filing");
      if (filing) return { label: `File ${filing.dateLabel.replace(/^By /, "by ")}`, tone: filing.tone };
      return { label: `Decided within ${route!.processingDays} days` };
    }
    if (stageId === "after-approval") {
      return { label: moveDate ? `From ${formatPlanDate(moveDate)}` : "After the decision" };
    }
    return { label: "" };
  }

  const procedure = route.authorisation ? workRouteLabels[route.authorisation] : null;

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb} aria-label="Breadcrumb">
        <Link href="/?purpose=work#route-builder">
          <ArrowLeft size={15} aria-hidden="true" />
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span>Work route</span>
      </nav>

      <header className={styles.head}>
        <div>
          <h1>Working in Slovakia</h1>
          <p className={styles.summary}>
            {procedure ? (
              <>
                <strong>{procedure}</strong>
                {route.processingDays ? `, decided within ${route.processingDays} days. ` : ". "}
              </>
            ) : (
              "The non-EU work residence procedure does not apply to you. "
            )}
            For a citizen of {citizenshipName} with{" "}
            {statusPhrases[profile.currentResidenceStatus]}.
          </p>
        </div>
        <Link href={editHref} className={styles.editLink}>
          Edit answers
        </Link>
      </header>

      {route.authorisation && (
        <ol className={styles.strip} aria-label="Route stages">
          {route.stages.map((stage, index) => {
            const tasks = stage.tasks.filter((task) => isActionableTask(task.status));
            const done = tasks.filter((task) => completed.has(task.id)).length;
            const when = stageWhen(stage.id);
            const complete = tasks.length > 0 && done === tasks.length;
            return (
              <li key={stage.id} data-complete={complete || undefined}>
                <a href={`#stage-${stage.id}`}>
                  <span className={styles.stop} aria-hidden="true">
                    {complete ? <Check size={13} /> : index + 1}
                  </span>
                  <strong>{stage.eyebrow.charAt(0) + stage.eyebrow.slice(1).toLowerCase()}</strong>
                  <span className={styles.when} data-tone={when.tone}>
                    {when.label}
                  </span>
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
      )}

      <div className={styles.layout}>
        <div className={styles.main}>
          {plan && plan.warnings.length > 0 && (
            <div className={styles.notice} role="status">
              <AlertTriangle size={17} aria-hidden="true" />
              <ul>
                {plan.warnings.map((warning) => (
                  <li key={warning}>{warning}</li>
                ))}
              </ul>
            </div>
          )}

          {route.stages.map((stage, index) => (
            <section
              key={stage.id}
              id={`stage-${stage.id}`}
              className={styles.stage}
              aria-labelledby={`stage-${stage.id}-title`}
            >
              <header className={styles.stageHead}>
                <span className={styles.stageNumber} aria-hidden="true">
                  {route.authorisation ? index + 1 : <Info size={15} />}
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
                  const due = datedLabels.get(task.id) ?? task.dueLabel;
                  const dueTone = plan?.items.find((item) => item.taskId === task.id)?.tone;
                  return (
                    <li
                      key={task.id}
                      className={styles.task}
                      data-status={task.status}
                      data-done={done || undefined}
                    >
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
                          {task.status === "attention" && (
                            <span className={styles.flag}>Needs attention</span>
                          )}
                        </div>
                        <p>{task.description}</p>
                        <div className={styles.taskMeta}>
                          {due && (
                            <span className={styles.due} data-tone={dueTone}>
                              <CalendarDays size={13} aria-hidden="true" />
                              {due}
                            </span>
                          )}
                          {route.sources
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

          <section className={styles.sourceList} aria-labelledby="work-sources">
            <h2 id="work-sources">Sources</h2>
            <ul>
              {route.sources.map((source) => (
                <li key={source.id}>
                  <a href={source.url} target="_blank" rel="noopener noreferrer">
                    {source.title}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                  <span>
                    {source.publisher}
                    {source.authority === "official" ? " (official)" : ""}, checked{" "}
                    {formatPlanDate(source.checkedAt)}
                  </span>
                </li>
              ))}
            </ul>
            <p className={styles.disclaimer}>{route.disclaimer}</p>
          </section>
          <WaitlistCta route="work-sk" />
        </div>

        <aside className={styles.side} aria-label="Dates and progress">
          {route.authorisation ? (
            <>
              <label className={styles.dateField}>
                <span>When do you start work?</span>
                <input
                  type="date"
                  value={moveDate}
                  min={addDays(asOfDate, 1)}
                  onChange={(event) => changeMoveDate(event.target.value)}
                />
              </label>
              {!plan && (
                <p className={styles.sideHint}>
                  Pick a date to see when each step has to happen. Dates use the
                  published maximum periods.
                </p>
              )}

              {plan && (
                <ol className={styles.keyDates}>
                  {plan.items.map((item) => (
                    <li key={item.id} data-tone={item.tone}>
                      <span>{item.title}</span>
                      <strong>{item.dateLabel}</strong>
                    </li>
                  ))}
                </ol>
              )}
              {plan && (
                <p className={styles.sideHint}>
                  Labour Office time is not published, so leave a margin.
                  Working days skip weekends and Slovak public holidays.
                </p>
              )}
            </>
          ) : (
            <p className={styles.sideHint}>No residence deadlines to plan for your answers.</p>
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
                  : routeProgress.syncing
                    ? "Saving progress…"
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
