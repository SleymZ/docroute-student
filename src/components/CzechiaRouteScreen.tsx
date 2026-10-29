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
import { PrintNote, SaveRoutePdf } from "@/components/SaveRoutePdf";
import { WaitlistCta } from "@/components/WaitlistCta";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { czechiaResidenceRules } from "@/data/czechia-residence";
import { useRouteProgress } from "@/hooks/useRouteProgress";
import {
  asksEuPermit,
  createCzechProfileSearchParams,
  getCzechProgressId,
  type EuPermitIssuer,
  type EuPermitPurpose,
  parseCzechProfile,
  type CzechProfile,
  type CzechPurpose,
} from "@/lib/czechia-profile";
import { getResidenceStatusLabel } from "@/lib/profile-options";
import {
  buildCzechiaRoute,
  czechProcedureLabel,
  planCzechiaDeadlines,
} from "@/lib/residence/czechia";
import { addDays, formatPlanDate, isIsoDate, type DeadlineTone } from "@/lib/residence/deadlines";
import type { YesNo, YesNoUnsure } from "@/lib/work-profile";
import { currentResidenceStatuses, type CurrentResidenceStatus } from "@/types/admission";
import type { RouteTaskStatus } from "@/types/route-preview";

import styles from "./WorkRouteScreen.module.css";

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

function isActionableTask(status: RouteTaskStatus) {
  return status === "action" || status === "attention";
}

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

const purposes: ChoiceOption<CzechPurpose>[] = [
  { value: "study", label: "Study" },
  { value: "work", label: "Work" },
];

const yesNo: ChoiceOption<YesNo>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
];

const yesNoUnsure: ChoiceOption<YesNoUnsure>[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" },
  { value: "unsure", label: "Not sure" },
];

const euPermitPurposes: ChoiceOption<EuPermitPurpose>[] = [
  { value: "study", label: "Study (long-term residence permit or long-term visa)" },
  { value: "other", label: "Another purpose (work, family, permanent…)" },
];

const euPermitIssuers: ChoiceOption<EuPermitIssuer>[] = [
  { value: "eu", label: "An EU country other than Ireland and Denmark (e.g. Slovakia)" },
  { value: "excluded", label: "Ireland, Denmark, Norway, Iceland, Liechtenstein or Switzerland" },
];

const read = <T extends string>(value: string | null, allowed: readonly T[]): T | "" =>
  allowed.includes(value as T) ? (value as T) : "";

function Questionnaire({ initial }: { initial: URLSearchParams }) {
  const router = useRouter();
  const [purpose, setPurpose] = useState(read(initial.get("purpose"), ["study", "work"] as const));
  const [citizenship, setCitizenship] = useState((initial.get("citizenship") ?? "").toUpperCase());
  const [status, setStatus] = useState(read(initial.get("residenceStatus"), currentResidenceStatuses));
  const [offer, setOffer] = useState(read(initial.get("offer"), ["yes", "no"] as const));
  const [graduate, setGraduate] = useState(read(initial.get("czGraduate"), ["yes", "no"] as const));
  const [blueCard, setBlueCard] = useState(read(initial.get("blueCard"), ["yes", "no", "unsure"] as const));
  const [euPermit, setEuPermit] = useState(read(initial.get("euPermit"), ["study", "other"] as const));
  const [euIssuer, setEuIssuer] = useState(read(initial.get("euIssuer"), ["eu", "excluded"] as const));
  const [exchange, setExchange] = useState(read(initial.get("exchange"), ["yes", "no", "unsure"] as const));
  const [error, setError] = useState("");
  const askEu = asksEuPermit(purpose, status);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const workMissing = purpose === "work" && (!offer || !graduate || !blueCard);
    const euMissing = askEu && (!euPermit || !euIssuer || (euPermit === "study" && !exchange));
    if (!purpose || !citizenship || !status || workMissing || euMissing) {
      setError("Answer every question to build your route.");
      return;
    }
    const profile: CzechProfile = {
      destinationCountryCode: "CZ",
      purpose,
      citizenshipCountryCode: citizenship,
      currentResidenceStatus: status as CurrentResidenceStatus,
      ...(purpose === "work"
        ? {
            jobOffer: offer as YesNo,
            czechGraduate: graduate as YesNo,
            blueCardConditions: blueCard as YesNoUnsure,
          }
        : {}),
      ...(askEu
        ? {
            euPermitPurpose: euPermit as EuPermitPurpose,
            euPermitIssuer: euIssuer as EuPermitIssuer,
            ...(euPermit === "study" ? { exchangeProgramme: exchange as YesNoUnsure } : {}),
          }
        : {}),
    };
    const params = createCzechProfileSearchParams(profile);
    const move = initial.get("move");
    if (isIsoDate(move)) params.set("move", move);
    router.push(`/route/czechia?${params.toString()}`);
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <ChoiceGroup
        name="purpose"
        legend="Why are you moving to Czechia?"
        value={purpose}
        options={purposes}
        onChange={setPurpose}
      />

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
                {getResidenceStatusLabel(option, "Czechia")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {askEu && (
        <>
          <ChoiceGroup
            name="euPermit"
            legend="What is your residence permit in the other country for?"
            hint="Look at the purpose written on your residence card or visa."
            value={euPermit}
            options={euPermitPurposes}
            onChange={setEuPermit}
          />
          <ChoiceGroup
            name="euIssuer"
            legend="Which country issued it?"
            value={euIssuer}
            options={euPermitIssuers}
            onChange={setEuIssuer}
          />
          {euPermit === "study" && (
            <ChoiceGroup
              name="exchange"
              legend="Was it issued for an exchange programme (e.g. Erasmus+) or a university agreement, with a note on the permit?"
              hint="Answer No if you study a full degree there."
              value={exchange}
              options={yesNoUnsure}
              onChange={setExchange}
            />
          )}
        </>
      )}

      {purpose === "work" && (
        <>
          <ChoiceGroup
            name="offer"
            legend="Do you have a job offer from an employer in Czechia?"
            value={offer}
            options={yesNo}
            onChange={setOffer}
          />
          <ChoiceGroup
            name="czGraduate"
            legend="Did you graduate from a Czech secondary school, higher vocational school, conservatory or university?"
            hint="Czech graduates have free access to the labour market, so no vacancy number is needed."
            value={graduate}
            options={yesNo}
            onChange={setGraduate}
          />
          <ChoiceGroup
            name="blueCard"
            legend="Does the job meet the EU Blue Card conditions?"
            hint={`At least three years of higher education (or higher professional skills) and a salary of at least ${czechiaResidenceRules.work.blueCardSalaryMultiplier}× the average gross salary.`}
            value={blueCard}
            options={yesNoUnsure}
            onChange={setBlueCard}
          />
        </>
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit}>
        Build my Czech route
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </form>
  );
}

export function CzechiaRouteScreen({ asOfDate }: { asOfDate: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const editing = searchParams.get("edit") === "1";
  const profile = useMemo(
    () => parseCzechProfile(new URLSearchParams(searchParams.toString())),
    [searchParams],
  );
  const route = useMemo(() => (profile ? buildCzechiaRoute(profile) : null), [profile]);
  const routeKey = route ? `cz:${route.version}:${getCzechProgressId(route.profile)}` : null;
  const routeProgress = useRouteProgress(routeKey);
  const completed = routeProgress.values;

  const rawMoveDate = searchParams.get("move") ?? "";
  const moveDate = isIsoDate(rawMoveDate) ? rawMoveDate : "";
  const plan = useMemo(
    () => (route && moveDate ? planCzechiaDeadlines(route, moveDate, asOfDate) : null),
    [route, moveDate, asOfDate],
  );
  const datedLabels = new Map<string, string>();
  for (const item of plan?.items ?? []) {
    if (item.taskId) datedLabels.set(item.taskId, item.dateLabel);
  }

  function changeMoveDate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (isIsoDate(value)) params.set("move", value);
    else params.delete("move");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const breadcrumb = (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb" data-print-hide="">
      <Link href="/#route-builder">
        <ArrowLeft size={15} aria-hidden="true" />
        Home
      </Link>
      <span aria-hidden="true">/</span>
      <span>Czechia route</span>
    </nav>
  );

  if (!profile || !route || editing) {
    return (
      <div className={styles.page}>
        {breadcrumb}
        <section className={styles.intro}>
          <h1>Moving to Czechia</h1>
          <p>
            A few questions decide which official procedure applies: the
            long-term residence permit for study, the employee card or the EU
            Blue Card, or registration for EU citizens. Answers stay in this
            page&apos;s address; nothing is uploaded.
          </p>
        </section>
        <Questionnaire initial={new URLSearchParams(searchParams.toString())} />
      </div>
    );
  }

  const actionable = route.stages.flatMap((stage) =>
    stage.tasks.filter((task) => isActionableTask(task.status)),
  );
  const completedCount = actionable.filter((task) => completed.has(task.id)).length;
  const progress = actionable.length ? Math.round((completedCount / actionable.length) * 100) : 100;
  const editParams = createCzechProfileSearchParams(profile);
  editParams.set("edit", "1");
  if (moveDate) editParams.set("move", moveDate);
  const citizenshipName =
    applicantCountryOptions.find((country) => country.code === profile.citizenshipCountryCode)?.name ??
    profile.citizenshipCountryCode;
  const procedure = czechProcedureLabel(route);
  const planItem = (id: string) => plan?.items.find((item) => item.id === id);
  const dated = route.procedure !== null && route.procedure !== "study-extension";
  const title = profile.purpose === "work" ? "Working in Czechia" : "Studying in Czechia";

  function stageWhen(stageId: string): { label: string; tone?: DeadlineTone } {
    const stage = route!.stages.find((item) => item.id === stageId);
    if (stageId === "residence-application") {
      const filing = planItem("residence-filing");
      if (filing) return { label: `Apply ${filing.dateLabel.replace(/^By /, "by ")}`, tone: filing.tone };
    }
    if (stageId === "after-arrival" && moveDate) {
      return { label: `From ${formatPlanDate(moveDate)}` };
    }
    return { label: stage?.timing.split(" · ")[0] ?? "" };
  }

  return (
    <div className={styles.page}>
      {breadcrumb}

      <header className={styles.head}>
        <div>
          <h1>{title}</h1>
          <p className={styles.summary}>
            {procedure ? (
              <>
                <strong>{procedure}</strong>
                {route.processingDays ? `, decided within ${route.processingDays} days. ` : ". "}
              </>
            ) : (
              "The non-EU residence permit procedure does not apply to you. "
            )}
            For a citizen of {citizenshipName} with{" "}
            {lowerFirst(getResidenceStatusLabel(profile.currentResidenceStatus, "Czechia"))}
            {profile.euPermitPurpose === "study" && profile.euPermitIssuer === "eu"
              ? " issued for study"
              : profile.euPermitPurpose === "other"
                ? " issued for another purpose"
                : ""}
            .
          </p>
        </div>
        <div className={styles.headActions}>
          <SaveRoutePdf title={title} />
          <Link href={`/route/czechia?${editParams.toString()}`} className={styles.editLink} data-print-hide="">
            Edit answers
          </Link>
        </div>
      </header>
      <PrintNote asOfDate={asOfDate} />

      {route.procedure && (
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
                  {route.procedure ? index + 1 : <Info size={15} />}
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

          <section className={styles.sourceList} aria-labelledby="cz-sources">
            <h2 id="cz-sources">Sources</h2>
            <ul>
              {route.sources.map((source) => (
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
            <p className={styles.disclaimer}>{route.disclaimer}</p>
          </section>
          <WaitlistCta route={profile.purpose === "work" ? "work-cz" : "study-cz"} />
        </div>

        <aside className={styles.side} aria-label="Dates and progress">
          {dated ? (
            <>
              <label className={styles.dateField}>
                <span>{profile.purpose === "work" ? "When do you start work?" : "When do you need to be in Czechia?"}</span>
                <input
                  type="date"
                  value={moveDate}
                  min={addDays(asOfDate, 1)}
                  onChange={(event) => changeMoveDate(event.target.value)}
                />
              </label>
              {!plan && (
                <p className={styles.sideHint}>
                  Pick a date to see when each step has to happen. Dates use the published maximum periods.
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
              {plan && <p className={styles.sideHint}>Periods are calendar days; leave a margin.</p>}
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
