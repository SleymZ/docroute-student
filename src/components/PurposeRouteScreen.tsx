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
import { FeedbackForm } from "@/components/FeedbackForm";
import { WaitlistCta } from "@/components/WaitlistCta";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { slovakiaFamilyBusinessRules } from "@/data/slovakia-family-business";
import { citizenshipStage, isExistingResidentStatus } from "@/data/citizenship-notes";
import { useRouteProgress } from "@/hooks/useRouteProgress";
import { getResidenceStatusLabel } from "@/lib/profile-options";
import {
  addDays,
  formatPlanDate,
  isIsoDate,
  planPurposeResidenceDeadlines,
} from "@/lib/residence/deadlines";
import {
  buildSlovakiaBusinessRoute,
  buildSlovakiaFamilyRoute,
  businessFormLabels,
  businessForms,
  createBusinessProfileSearchParams,
  createFamilyProfileSearchParams,
  familyRelationLabels,
  familyRelations,
  familySponsorLabels,
  familySponsors,
  getBusinessProgressId,
  getFamilyProgressId,
  parseBusinessProfile,
  parseFamilyProfile,
  type BusinessForm,
  type FamilyRelation,
  type FamilySponsor,
  type PurposeRoute,
} from "@/lib/residence/slovakia-family-business";
import { currentResidenceStatuses, type CurrentResidenceStatus } from "@/types/admission";
import type { RouteTaskStatus } from "@/types/route-preview";

import styles from "./WorkRouteScreen.module.css";

export type PurposeKind = "family" | "business";

const copy: Record<PurposeKind, { title: string; crumb: string; intro: string; submit: string }> = {
  family: {
    title: "Joining family in Slovakia",
    crumb: "Family route",
    intro:
      "A few questions decide whether family-reunification residence applies to you and which documents prove the family link. Answers stay in this page's address; nothing is uploaded.",
    submit: "Build my family route",
  },
  business: {
    title: "Doing business in Slovakia",
    crumb: "Business route",
    intro:
      "Temporary residence for business, as a sole trader with a trade licence or as a company executive. Answers stay in this page's address; nothing is uploaded.",
    submit: "Build my business route",
  },
};

function isActionableTask(status: RouteTaskStatus) {
  return status === "action" || status === "attention";
}

type Option<T extends string> = { value: T; label: string };

function Choice<T extends string>({
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
  options: Option<T>[];
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

const read = <T extends string>(options: readonly T[], value: string | null): T | "" =>
  options.includes(value as T) ? (value as T) : "";

function Questionnaire({ kind, initial }: { kind: PurposeKind; initial: URLSearchParams }) {
  const router = useRouter();
  const [citizenship, setCitizenship] = useState((initial.get("citizenship") ?? "").toUpperCase());
  const [status, setStatus] = useState<CurrentResidenceStatus | "">(
    read(currentResidenceStatuses, initial.get("residenceStatus")),
  );
  const [sponsor, setSponsor] = useState<FamilySponsor | "">(read(familySponsors, initial.get("sponsor")));
  const [relation, setRelation] = useState<FamilyRelation | "">(read(familyRelations, initial.get("relation")));
  const [adults, setAdults] = useState<"yes" | "no" | "">(read(["yes", "no"] as const, initial.get("adults")));
  const [form, setForm] = useState<BusinessForm | "">(read(businessForms, initial.get("form")));
  const [error, setError] = useState("");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const missing =
      !citizenship ||
      !status ||
      (kind === "family" && (!sponsor || !relation || (relation === "spouse" && !adults))) ||
      (kind === "business" && !form);
    if (missing || !status) {
      setError("Answer every question to build your route.");
      return;
    }
    const params =
      kind === "family"
        ? createFamilyProfileSearchParams({
            destinationCountryCode: "SK",
            citizenshipCountryCode: citizenship,
            currentResidenceStatus: status,
            sponsor: sponsor as FamilySponsor,
            relation: relation as FamilyRelation,
            bothAdults: relation === "spouse" ? (adults as "yes" | "no") : null,
          })
        : createBusinessProfileSearchParams({
            destinationCountryCode: "SK",
            citizenshipCountryCode: citizenship,
            currentResidenceStatus: status,
            form: form as BusinessForm,
          });
    const move = initial.get("move");
    if (isIsoDate(move)) params.set("move", move);
    router.push(`/route/${kind}?${params.toString()}`);
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
                {getResidenceStatusLabel(option, "Slovakia")}
              </option>
            ))}
          </select>
        </label>
      </div>

      {kind === "family" ? (
        <>
          <Choice
            name="sponsor"
            legend="Who are you joining in Slovakia?"
            value={sponsor}
            options={familySponsors.map((value) => ({ value, label: familySponsorLabels[value] }))}
            onChange={setSponsor}
          />
          <Choice
            name="relation"
            legend="What are you to them?"
            value={relation}
            options={familyRelations.map((value) => ({ value, label: familyRelationLabels[value] }))}
            onChange={setRelation}
          />
          {relation === "spouse" && (
            <Choice
              name="adults"
              legend="Are you and your spouse both at least 18?"
              value={adults}
              options={[
                { value: "yes", label: "Yes" },
                { value: "no", label: "No" },
              ]}
              onChange={setAdults}
            />
          )}
        </>
      ) : (
        <Choice
          name="form"
          legend="How will you do business?"
          hint="A sole trader works under a trade licence; an executive (konateľ) runs a company such as an s.r.o."
          value={form}
          options={businessForms.map((value) => ({ value, label: businessFormLabels[value] }))}
          onChange={setForm}
        />
      )}

      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}

      <button type="submit" className={styles.submit}>
        {copy[kind].submit}
        <ArrowRight size={17} aria-hidden="true" />
      </button>
    </form>
  );
}

export function PurposeRouteScreen({ kind, asOfDate }: { kind: PurposeKind; asOfDate: string }) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const editing = searchParams.get("edit") === "1";
  const text = copy[kind];

  const route = useMemo((): PurposeRoute<{ citizenshipCountryCode: string }> | null => {
    const params = new URLSearchParams(searchParams.toString());
    const familyProfile = kind === "family" ? parseFamilyProfile(params) : null;
    const businessProfile = kind === "business" ? parseBusinessProfile(params) : null;
    const base = familyProfile
      ? buildSlovakiaFamilyRoute(familyProfile)
      : businessProfile
        ? buildSlovakiaBusinessRoute(businessProfile)
        : null;
    if (!base) return null;
    // Passport-specific steps (India first), ahead of the Slovak stages.
    const status = (familyProfile ?? businessProfile)?.currentResidenceStatus;
    const passport = citizenshipStage(base.profile.citizenshipCountryCode, "SK", "Slovakia", kind, {
      existingResident: isExistingResidentStatus(status),
    });
    return passport
      ? { ...base, stages: [passport.stage, ...base.stages], sources: [...base.sources, ...passport.sources] }
      : base;
  }, [kind, searchParams]);

  const progressId = useMemo(() => {
    const params = new URLSearchParams(searchParams.toString());
    if (kind === "family") {
      const profile = parseFamilyProfile(params);
      return profile ? getFamilyProgressId(profile) : null;
    }
    const profile = parseBusinessProfile(params);
    return profile ? getBusinessProgressId(profile) : null;
  }, [kind, searchParams]);

  const routeKey = route && progressId ? `${kind}-sk:${route.version}:${progressId}` : null;
  const routeProgress = useRouteProgress(routeKey);
  const completed = routeProgress.values;

  const rawMoveDate = searchParams.get("move") ?? "";
  const moveDate = isIsoDate(rawMoveDate) ? rawMoveDate : "";
  const plan = useMemo(() => {
    if (!route || !route.applicable || !route.filing || !route.processingDays || !moveDate) return null;
    return planPurposeResidenceDeadlines({
      moveDate,
      today: asOfDate,
      filing: route.filing,
      processingDays: route.processingDays,
      documentMaxAgeDays: slovakiaFamilyBusinessRules.documentMaxAgeDays,
      reportWorkingDays: slovakiaFamilyBusinessRules.reportArrivalWorkingDays,
    });
  }, [route, moveDate, asOfDate]);

  const datedLabels = new Map<string, string>();
  for (const item of plan?.items ?? []) {
    if (!item.taskId) continue;
    datedLabels.set(
      item.taskId,
      item.taskId === "post-card-duties" ? `Report arrival ${item.dateLabel.replace(/^By /, "by ")}` : item.dateLabel,
    );
  }

  function changeMoveDate(value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (isIsoDate(value)) params.set("move", value);
    else params.delete("move");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const breadcrumb = (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb" data-print-hide="">
      <Link href={`/?purpose=${kind}#route-builder`}>
        <ArrowLeft size={15} aria-hidden="true" />
        Home
      </Link>
      <span aria-hidden="true">/</span>
      <span>{text.crumb}</span>
    </nav>
  );

  if (!route || editing) {
    return (
      <div className={styles.page}>
        {breadcrumb}
        <section className={styles.intro}>
          <h1>{text.title}</h1>
          <p>{text.intro}</p>
        </section>
        <Questionnaire kind={kind} initial={new URLSearchParams(searchParams.toString())} />
      </div>
    );
  }

  const actionable = route.stages.flatMap((stage) => stage.tasks.filter((task) => isActionableTask(task.status)));
  const completedCount = actionable.filter((task) => completed.has(task.id)).length;
  const progress = actionable.length ? Math.round((completedCount / actionable.length) * 100) : 100;
  const editParams = new URLSearchParams(searchParams.toString());
  editParams.set("edit", "1");
  const citizenshipName =
    applicantCountryOptions.find((country) => country.code === route.profile.citizenshipCountryCode)?.name ??
    route.profile.citizenshipCountryCode;

  return (
    <div className={styles.page}>
      {breadcrumb}

      <header className={styles.head}>
        <div>
          <h1>{text.title}</h1>
          <p className={styles.summary}>
            <strong>{route.headline}</strong> For a citizen of {citizenshipName}.
          </p>
        </div>
        <div className={styles.headActions}>
          <SaveRoutePdf title={text.title} />
          <Link href={`/route/${kind}?${editParams.toString()}`} className={styles.editLink} data-print-hide="">
            Edit answers
          </Link>
        </div>
      </header>
      <PrintNote asOfDate={asOfDate} />

      {route.applicable && (
        <ol className={styles.strip} aria-label="Route stages">
          {route.stages.map((stage, index) => {
            const tasks = stage.tasks.filter((task) => isActionableTask(task.status));
            const done = tasks.filter((task) => completed.has(task.id)).length;
            const complete = tasks.length > 0 && done === tasks.length;
            const filingItem = stage.id === "residence-application" ? plan?.items.find((item) => item.id === "residence-filing") : undefined;
            return (
              <li key={stage.id} data-complete={complete || undefined}>
                <a href={`#stage-${stage.id}`}>
                  <span className={styles.stop} aria-hidden="true">
                    {complete ? <Check size={13} /> : index + 1}
                  </span>
                  <strong>{stage.eyebrow.charAt(0) + stage.eyebrow.slice(1).toLowerCase()}</strong>
                  <span className={styles.when} data-tone={filingItem?.tone}>
                    {filingItem ? `File ${filingItem.dateLabel.replace(/^By /, "by ")}` : stage.timing}
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
                  {route.applicable ? index + 1 : <Info size={15} />}
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

          <section className={styles.sourceList} aria-labelledby={`${kind}-sources`}>
            <h2 id={`${kind}-sources`}>Sources</h2>
            <ul>
              {route.sources
                .filter((source) => route.stages.some((stage) => stage.tasks.some((task) => task.sourceIds.includes(source.id))) || source.authority === "official")
                .map((source) => (
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
          <FeedbackForm route={kind === "family" ? "family-sk" : "business-sk"} />
          <WaitlistCta route={kind === "family" ? "family-sk" : "business-sk"} />
        </div>

        <aside className={styles.side} aria-label="Dates and progress">
          {route.applicable ? (
            <>
              <label className={styles.dateField}>
                <span>{kind === "family" ? "When do you want to move?" : "When do you want to start?"}</span>
                <input
                  type="date"
                  value={moveDate}
                  min={addDays(asOfDate, 1)}
                  onChange={(event) => changeMoveDate(event.target.value)}
                />
              </label>
              {!plan && (
                <p className={styles.sideHint}>
                  Pick a date to see when each step has to happen. Dates use the published maximum decision period.
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
                <p className={styles.sideHint}>Working days skip weekends and Slovak public holidays.</p>
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
