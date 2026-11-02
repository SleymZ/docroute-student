"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, ArrowLeft, Check, ExternalLink, Info } from "lucide-react";

import { CountryPicker } from "@/components/CountryPicker";
import { FeedbackForm } from "@/components/FeedbackForm";
import { applicantCountryOptions } from "@/data/applicant-countries";
import { citizenshipStage, citizenshipNoteSources } from "@/data/citizenship-notes";
import { isEuEeaSwissCitizen } from "@/lib/profile-options";
import { linkedCountryName, linkedGuideCountries } from "@/lib/residence/linked-guides";
import { PrintNote, SaveRoutePdf } from "@/components/SaveRoutePdf";
import { useRouteProgress } from "@/hooks/useRouteProgress";
import { formatPlanDate } from "@/lib/residence/deadlines";
import { findCountryGuide, pickVariant } from "@/lib/residence/country-guides";
import type { RouteSource, RouteTaskStatus } from "@/types/route-preview";

import styles from "./WorkRouteScreen.module.css";

function isActionableTask(status: RouteTaskStatus) {
  return status === "action" || status === "attention";
}

export function CountryGuideScreen({ asOfDate }: { asOfDate: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const guide = findCountryGuide(searchParams.get("country"), searchParams.get("purpose"));
  const variant = guide ? pickVariant(guide, searchParams.get("variant")) : null;
  const routeKey = guide && variant ? `guide-${guide.country.toLowerCase()}-${guide.purpose}:${guide.version}:${variant.id}` : null;
  const routeProgress = useRouteProgress(routeKey);

  const breadcrumb = (
    <nav className={styles.breadcrumb} aria-label="Breadcrumb" data-print-hide="">
      <Link href={`/?purpose=${guide?.purpose ?? "work"}#route-builder`}>
        <ArrowLeft size={15} aria-hidden="true" />
        Home
      </Link>
      <span aria-hidden="true">/</span>
      <span>{guide ? `${guide.countryName}: ${guide.purpose}` : "Residence guide"}</span>
    </nav>
  );

  if (!guide || !variant) {
    return <GuideChooser breadcrumb={breadcrumb} purpose={searchParams.get("purpose")} />;
  }

  const citizenship = (searchParams.get("citizenship") ?? "").toUpperCase();
  const passport = citizenshipStage(
    citizenship,
    guide.country,
    guide.countryName,
    guide.purpose,
  );
  const stages = passport ? [passport.stage, ...variant.stages] : variant.stages;
  const euCitizen = citizenship && isEuEeaSwissCitizen(citizenship) && citizenship !== guide.country;

  function chooseCitizenship(code: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (code) params.set("citizenship", code);
    else params.delete("citizenship");
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  const completed = new Set(routeProgress.values);
  const actionable = stages.flatMap((stage) => stage.tasks.filter((task) => isActionableTask(task.status)));
  const completedCount = actionable.filter((task) => completed.has(task.id)).length;
  const progress = actionable.length ? Math.round((completedCount / actionable.length) * 100) : 100;
  const usedSourceIds = new Set(stages.flatMap((stage) => stage.tasks.flatMap((task) => task.sourceIds)));
  const allSources: RouteSource[] = [...guide.sources, ...(passport ? citizenshipNoteSources : [])];
  const sources = allSources.filter(
    (source, index) => usedSourceIds.has(source.id) && allSources.findIndex((item) => item.id === source.id) === index,
  );

  function chooseVariant(id: string) {
    const params = new URLSearchParams(searchParams.toString());
    params.set("variant", id);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });
  }

  return (
    <div className={styles.page}>
      {breadcrumb}

      <header className={styles.head}>
        <div>
          <h1>{guide.title}</h1>
          <p className={styles.summary}>
            <strong>{guide.intro}</strong> {variant.summary}
          </p>
        </div>
        <div className={styles.headActions}>
          <SaveRoutePdf title={guide.title} />
        </div>
      </header>
      <PrintNote asOfDate={asOfDate} />

      {guide.variants.length > 1 && (
        <fieldset className={styles.choice} data-print-hide="">
          <legend>Which situation is yours?</legend>
          <div className={styles.choiceOptions}>
            {guide.variants.map((option) => (
              <label key={option.id} data-checked={option.id === variant.id || undefined}>
                <input
                  type="radio"
                  name="guide-variant"
                  value={option.id}
                  checked={option.id === variant.id}
                  onChange={() => chooseVariant(option.id)}
                />
                {option.label}
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <div className={styles.choice} data-print-hide="">
        <CountryPicker
          label="Your citizenship (adds what applies to your passport)"
          value={citizenship}
          options={applicantCountryOptions}
          placeholder="Select citizenship"
          onChange={chooseCitizenship}
        />
      </div>

      <ol className={styles.strip} aria-label="Route stages">
        {stages.map((stage, index) => {
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
              <li>Not covered yet: {guide.notCovered}</li>
              <li>
                {guide.coverage === "official-link"
                  ? "Each step points to the official page; DocRoute has not verified this country's procedure step by step yet."
                  : "This is a checklist from official guidance, without a dated plan."}
              </li>
              {euCitizen && (
                <li>
                  You chose an EU, EEA or Swiss citizenship: this checklist is for citizens of other countries. EU
                  citizens use their free-movement rights instead (registration where the country requires it).
                </li>
              )}
            </ul>
          </div>

          {stages.map((stage, index) => (
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
                          {sources
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

          <section className={styles.sourceList} aria-labelledby="guide-sources">
            <h2 id="guide-sources">Sources</h2>
            <ul>
              {sources.map((source) => (
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
            <p className={styles.disclaimer}>{guide.disclaimer}</p>
          </section>
          <FeedbackForm />
        </div>

        <aside className={styles.side} aria-label="Key figures and progress">
          <ol className={styles.keyDates}>
            {variant.keyFacts.map((fact) => (
              <li key={fact.label}>
                <span>{fact.label}</span>
                <strong>{fact.value}</strong>
              </li>
            ))}
          </ol>
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

// /route/guide without a valid country: every country with a family or
// business guide, verified ones first.
function GuideChooser({ breadcrumb, purpose }: { breadcrumb: ReactNode; purpose: string | null }) {
  const chosen = purpose === "business" ? "business" : "family";
  const verified: Record<string, string> = {
    SK: `/route/${chosen}?country=SK`,
    CZ: `/route/guide?country=CZ&purpose=${chosen}`,
    AT: `/route/guide?country=AT&purpose=${chosen}`,
  };
  const names: Record<string, string> = { SK: "Slovakia", CZ: "Czechia", AT: "Austria" };
  return (
    <div className={styles.page}>
      {breadcrumb}
      <section className={styles.intro}>
        <h1>{chosen === "family" ? "Joining family in Europe" : "Doing business in Europe"}</h1>
        <p>
          Slovakia, Czechia and Austria have checklists verified by DocRoute. For the other EU countries and
          Switzerland, the checklist links each step to the official page. Choose a country.
        </p>
        <p>
          <Link href="/route/guide?purpose=family" aria-current={chosen === "family" ? "page" : undefined}>
            Family
          </Link>{" "}
          ·{" "}
          <Link href="/route/guide?purpose=business" aria-current={chosen === "business" ? "page" : undefined}>
            Business
          </Link>
        </p>
      </section>
      <section className={styles.sourceList} aria-labelledby="guide-countries">
        <h2 id="guide-countries">Verified by DocRoute</h2>
        <ul>
          {Object.entries(verified).map(([code, href]) => (
            <li key={code}>
              <Link href={href}>{names[code]}</Link>
            </li>
          ))}
        </ul>
        <h2>Official links</h2>
        <ul>
          {linkedGuideCountries.map((code) => (
            <li key={code}>
              <Link href={`/route/guide?country=${code}&purpose=${chosen}`}>
                {linkedCountryName(code).replace(/^the /, "").replace(/^./, (letter) => letter.toUpperCase())}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
