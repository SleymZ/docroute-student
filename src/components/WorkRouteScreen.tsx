"use client";

import { useMemo, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  CalendarDays,
  ExternalLink,
  FileCheck2,
  Flag,
  MapPin,
  ShieldCheck,
} from "lucide-react";

import { CountryPicker } from "@/components/CountryPicker";
import { MovePlanner } from "@/components/MovePlanner";
import { RouteStageList, isActionableTask } from "@/components/RouteStageList";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { slovakiaWorkRules } from "@/data/slovakia-work";
import { useRouteProgress } from "@/hooks/useRouteProgress";
import { getResidenceStatusLabel } from "@/lib/profile-options";
import { addDays, isIsoDate, planWorkResidenceDeadlines } from "@/lib/residence/deadlines";
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

import routeStyles from "./RoutePreviewScreen.module.css";
import styles from "./WorkRouteScreen.module.css";

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
      <div className={routeStyles.page}>
        <nav className={routeStyles.breadcrumb}>
          <Link href="/?purpose=work#route-builder">
            <ArrowLeft size={16} aria-hidden="true" />
            Home
          </Link>
          <span>/</span>
          <strong>Work route</strong>
        </nav>

        <section className={styles.intro}>
          <p className={routeStyles.eyebrow}>WORK IN SLOVAKIA</p>
          <h1>
            Your route to <span>working in Slovakia</span>
          </h1>
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
  const officialSourceCount = route.sources.filter(
    (source) => source.authority === "official",
  ).length;

  return (
    <div className={routeStyles.page}>
      <nav className={routeStyles.breadcrumb}>
        <Link href="/?purpose=work#route-builder">
          <ArrowLeft size={16} aria-hidden="true" />
          Home
        </Link>
        <span>/</span>
        <strong>Work route</strong>
      </nav>

      <header className={routeStyles.hero}>
        <div className={routeStyles.heroCopy}>
          <p className={routeStyles.eyebrow}>JOB OFFER TO ARRIVAL</p>
          <h1>
            Your route to <span>working in Slovakia</span>
          </h1>
          <p>
            {route.authorisation
              ? `Based on your answers, the procedure is the ${workRouteLabels[route.authorisation].toLowerCase()} route. Each step lists who does it, when, and the official guidance it comes from.`
              : "Your answers show that the non-EU work residence procedure does not apply to you. See the details below."}
          </p>
        </div>

        <div className={routeStyles.heroRoute}>
          <span className={routeStyles.routePoint}>
            <BriefcaseBusiness size={20} aria-hidden="true" />
          </span>
          <div>
            <small>PROCEDURE</small>
            <strong>
              {route.authorisation ? workRouteLabels[route.authorisation] : "Not applicable"}
            </strong>
            <p>
              {route.processingDays
                ? `Decision within up to ${route.processingDays} days`
                : "No third-country procedure"}
            </p>
          </div>
          <Image
            src="https://flagcdn.com/w80/sk.png"
            alt="Slovakia flag"
            width={36}
            height={26}
            unoptimized
          />
        </div>
      </header>

      <section className={routeStyles.routeFacts}>
        <article>
          <MapPin size={18} aria-hidden="true" />
          <div>
            <small>DESTINATION</small>
            <strong>Slovakia</strong>
          </div>
        </article>
        <article>
          <Flag size={18} aria-hidden="true" />
          <div>
            <small>CITIZENSHIP</small>
            <strong>{citizenshipName}</strong>
          </div>
        </article>
        <article>
          <CalendarDays size={18} aria-hidden="true" />
          <div>
            <small>CURRENT STATUS</small>
            <strong>{getResidenceStatusLabel(profile.currentResidenceStatus, "Slovakia")}</strong>
          </div>
        </article>
        <article>
          <ShieldCheck size={18} aria-hidden="true" />
          <div>
            <small>RULES CHECKED</small>
            <strong>{slovakiaWorkRules.checkedAt}</strong>
          </div>
        </article>
      </section>

      <div className={routeStyles.layout}>
        <div className={routeStyles.timeline}>
          <MovePlanner
            moveDate={moveDate}
            minDate={addDays(asOfDate, 1)}
            plan={plan}
            unavailableReason={
              route.authorisation
                ? null
                : "Your answers do not use the non-EU work residence procedure, so there are no residence deadlines to plan."
            }
            onMoveDateChange={changeMoveDate}
            dateLabel="Start date"
            description="Enter the date you need to be living and working in Slovakia. DocRoute counts back from it using the published maximum periods."
          />

          <RouteStageList
            stages={route.stages}
            sources={route.sources}
            completed={completed}
            datedLabels={datedLabels}
            onToggle={(taskId) => routeProgress.toggle(taskId)}
          />

          <section className={routeStyles.sources}>
            <header>
              <FileCheck2 size={21} aria-hidden="true" />
              <div>
                <p className={routeStyles.eyebrow}>SOURCE REGISTER</p>
                <h2>Rules used in this route</h2>
              </div>
            </header>

            <div>
              {route.sources.map((source) => (
                <a href={source.url} target="_blank" rel="noopener noreferrer" key={source.id}>
                  <span>
                    <small>
                      {source.authority === "official" ? "OFFICIAL SOURCE" : "AUTHORITATIVE GUIDANCE"}
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

        <aside className={routeStyles.controlPanel}>
          <p className={routeStyles.eyebrow}>ROUTE CONTROL</p>
          <h2>{progress}% prepared</h2>

          <p
            className={routeStyles.memoryStatus}
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

          <div className={routeStyles.progressRing}>
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
            <span>of {actionable.length}</span>
          </div>

          <div className={routeStyles.controlStats}>
            <div>
              <span>Stages</span>
              <strong>{route.stages.length}</strong>
            </div>
            <div>
              <span>Open actions</span>
              <strong>{actionable.length - completedCount}</strong>
            </div>
            <div>
              <span>Official sources</span>
              <strong>{officialSourceCount}</strong>
            </div>
          </div>

          {plan && (
            <div className={routeStyles.controlDeadline}>
              <CalendarDays size={19} aria-hidden="true" />
              <div>
                <small>LATEST FILING DATE</small>
                <strong>{plan.items.find((item) => item.id === "residence-filing")?.dateLabel}</strong>
                <span>Residence application</span>
              </div>
            </div>
          )}

          <Link href={editHref} className={routeStyles.editRoute}>
            Edit my answers
            <ArrowRight size={16} aria-hidden="true" />
          </Link>

          <p className={routeStyles.disclaimer}>{route.disclaimer}</p>
        </aside>
      </div>
    </div>
  );
}
