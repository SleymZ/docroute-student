import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  Check,
  Compass,
  ExternalLink,
  Info,
  MapPin,
  Pencil,
  Sparkles,
  Trophy,
  TriangleAlert,
} from "lucide-react";

import { REGION_NAMES } from "@/data/region-names";
import { languageName, type MatchAnswers } from "@/lib/country-match-answers";
import { isWarning, type CountryPick, type EaseFactor, type LifestyleReason, type MatchResult, type MatchRole } from "@/lib/country-match";
import { flagSrc } from "@/lib/flags";
import type { RouteSource } from "@/types/route-preview";

import {
  businessChoices,
  educationChoices,
  fieldChoices,
  labelOf,
  levelChoices,
  lifestyleQuestions,
  purposeChoices,
  roleLabels,
  sponsorChoices,
} from "./labels";
import styles from "./CountryMatch.module.css";

const roles: Record<MatchRole, { label: string; text: string; icon: typeof Compass }> = {
  easiest: {
    label: roleLabels.easiest,
    text: "Your passport, your plan and the rules DocRoute checked on official websites.",
    icon: Compass,
  },
  lifestyle: {
    label: roleLabels.lifestyle,
    text: "Your answers about daily life, compared with official Eurostat statistics.",
    icon: Sparkles,
  },
  overall: {
    label: roleLabels.overall,
    text: "A good balance of an easier move and the life you described.",
    icon: Trophy,
  },
};

const routeLabels: Record<Exclude<MatchAnswers["purpose"], "study">, string> = {
  work: "DocRoute has a checked step-by-step work route",
  family: "DocRoute has a checked step-by-step family route",
  business: "DocRoute has a checked step-by-step business route",
};

function easeLine(factor: EaseFactor) {
  switch (factor.kind) {
    case "free-movement":
      return "Free movement: as an EU citizen you need no visa or work permit there";
    case "passport":
      return factor.title;
    case "family-exception":
      return `${factor.title}. Some family members can still apply: check the exact conditions on the route before you plan`;
    case "verified-route":
      return routeLabels[factor.purpose];
    case "verified-programmes":
      return factor.english
        ? `Checked ${factor.field} programmes taught in English: ${factor.count}`
        : `Checked ${factor.field} programmes: ${factor.count}`;
    case "study-residence":
      return "DocRoute checked the steps for the student residence permit";
    case "job-offer":
      return "You have a job offer there";
    case "blue-card":
      return "The EU Blue Card applies there (a university degree and a qualified job offer)";
    case "family-there":
      return "Your family member lives there";
    case "speaks-language":
      return `You speak ${languageName(factor.language)}, an official language there`;
    case "lives-there":
      return "You already live there with a residence permit";
  }
}

function reasonLine(reason: LifestyleReason) {
  const value = reason.value;
  switch (reason.indicator) {
    case "prices":
      return value >= 99.5 ? "Prices close to the EU average" : `Prices ${Math.round(100 - value)}% below the EU average`;
    case "cold":
      return reason.direction === -1 ? "Mild winters" : "Real winters";
    case "heat":
      return reason.direction === 1 ? "Hot summers" : "Cool summers";
    case "cities":
      return reason.direction === 1 ? `${value}% of people live in cities` : `Only ${value}% of people live in cities`;
    case "hours":
      return `${value} hours in a usual full-time working week`;
    case "vacancies":
      return `Job vacancy rate: ${value}%`;
    case "unemployment":
      return `Unemployment: ${value}%`;
    case "lifeSatisfaction":
      return `Life satisfaction: ${value} out of 10`;
    case "crime":
      return `Only ${value}% report crime or vandalism in their area`;
    case "foreignLanguages":
      return `${value}% of adults know a foreign language`;
    case "nonEuResidents":
      return reason.direction === 1
        ? `${value}% of residents are non-EU citizens`
        : `Only ${value}% of residents are non-EU citizens`;
  }
}

function routeAction(pick: CountryPick, purpose: MatchAnswers["purpose"]) {
  if (purpose === "study") {
    return pick.route.href.startsWith("/explore/") ? "See the programmes" : "Open the country page";
  }
  return pick.route.coverage === "verified" ? "Open the route" : "Official links";
}

function PickCard({ pick, purpose, index }: { pick: CountryPick; purpose: MatchAnswers["purpose"]; index: number }) {
  const role = roles[pick.role];
  const RoleIcon = role.icon;
  const easeFirst = pick.role !== "lifestyle";
  const ease = pick.easeFactors.map((factor) => (
    <li key={`ease-${factor.kind}`} data-tone={isWarning(factor) ? "warn" : undefined}>
      {isWarning(factor) ? <TriangleAlert size={15} aria-hidden="true" /> : <Check size={15} aria-hidden="true" />}
      <span>{easeLine(factor)}</span>
    </li>
  ));
  const life = pick.lifestyleReasons.map((reason) => (
    <li key={`life-${reason.indicator}`}>
      <Check size={15} aria-hidden="true" />
      <span>
        {reasonLine(reason)}{" "}
        <small className={styles.rank} title="Place among the 27 EU countries for what you chose">
          #{reason.rank} of 27
        </small>{" "}
        <a href={reason.source.url} target="_blank" rel="noreferrer" className={styles.sourceTag}>
          Eurostat {reason.source.year}
        </a>
      </span>
    </li>
  ));
  return (
    <article className={styles.pick} data-role={pick.role}>
      <p className={styles.pickRole}>
        <span className={styles.pickNumber}>{index + 1}</span>
        <RoleIcon size={16} aria-hidden="true" />
        {role.label}
      </p>
      <h2 className={styles.pickCountry}>
        <Image src={flagSrc(pick.code)} alt="" width={40} height={30} unoptimized />
        <span>{pick.name}</span>
      </h2>
      <p className={styles.pickWhy}>{role.text}</p>
      <ul className={styles.reasons}>{easeFirst ? [...ease, ...life] : [...life, ...ease]}</ul>
      {!ease.length && !life.length && (
        <p className={styles.mutedNote}>No single factor stands out: this country scores evenly on your answers.</p>
      )}
      <div className={styles.pickActions}>
        <Link href={pick.route.href} className={styles.primary}>
          {routeAction(pick, purpose)}
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        {pick.route.href !== pick.countryHref && (
          <Link href={pick.countryHref} className={styles.secondary}>
            <MapPin size={16} aria-hidden="true" />
            Country page
          </Link>
        )}
      </div>
    </article>
  );
}

function formatDay(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Bratislava" }).format(date);
}

function regionName(code: string | null) {
  return code ? (REGION_NAMES[code] ?? code) : "";
}

/** The saved answers as a short profile ("resume") for all purposes. */
export function MoveProfileSummary({ answers }: { answers: MatchAnswers }) {
  const details: string[] = [];
  if (answers.study) {
    details.push(labelOf(fieldChoices, answers.study.field));
    details.push(answers.study.english ? "Wants to study in English" : "The local language is fine");
  }
  if (answers.work) {
    details.push(answers.work.offerCountry ? `Job offer in ${regionName(answers.work.offerCountry)}` : "No job offer yet");
  }
  if (answers.family) {
    details.push(
      answers.family.sponsorCountry
        ? `Family member in ${regionName(answers.family.sponsorCountry)}`
        : "Family member outside the EU",
    );
    details.push(labelOf(sponsorChoices, answers.family.sponsorStatus));
  }
  if (answers.business) details.push(labelOf(businessChoices, answers.business.kind));

  return (
    <dl className={styles.summary}>
      <div>
        <dt>Purpose</dt>
        <dd>{labelOf(purposeChoices, answers.purpose)}</dd>
      </div>
      <div>
        <dt>Citizenship</dt>
        <dd className={styles.flagValue}>
          <Image src={flagSrc(answers.citizenship)} alt="" width={20} height={15} unoptimized />
          <span>{regionName(answers.citizenship)}</span>
        </dd>
      </div>
      <div>
        <dt>Lives in</dt>
        <dd>
          {answers.livesIn ? (
            <span className={styles.flagValue}>
              <Image src={flagSrc(answers.livesIn)} alt="" width={20} height={15} unoptimized />
              <span>{regionName(answers.livesIn)}</span>
              {answers.residentWhereLives && <small>with a residence permit</small>}
            </span>
          ) : (
            "Not given"
          )}
        </dd>
      </div>
      <div>
        <dt>Education</dt>
        <dd>{labelOf(educationChoices, answers.education)}</dd>
      </div>
      <div className={styles.summaryWide}>
        <dt>Languages</dt>
        <dd className={styles.chips}>
          {answers.languages.length
            ? answers.languages.map((language) => (
                <span key={language.code}>
                  <span>{languageName(language.code)}</span>
                  {" · "}
                  <span>{labelOf(levelChoices, language.level)}</span>
                </span>
              ))
            : "None given"}
        </dd>
      </div>
      <div className={styles.summaryWide}>
        <dt>Plan</dt>
        <dd className={styles.chips}>
          {details.filter(Boolean).map((detail) => (
            <span key={detail}>{detail}</span>
          ))}
        </dd>
      </div>
      <div className={styles.summaryWide}>
        <dt>How you want to live</dt>
        <dd className={styles.chips}>
          {lifestyleQuestions.map((question) => (
            <span key={question.key}>
              <span>{question.short}</span>
              {": "}
              <span>{labelOf(question.options, answers.lifestyle[question.key])}</span>
            </span>
          ))}
        </dd>
      </div>
    </dl>
  );
}

function uniqueSources(result: MatchResult) {
  const seen = new Map<string, RouteSource>();
  for (const pick of result.picks) {
    for (const reason of pick.lifestyleReasons) seen.set(reason.source.id + reason.source.year, reason.source);
  }
  for (const item of result.excluded) for (const source of item.sources) seen.set(source.id, source);
  for (const note of result.notes) for (const source of note.sources) seen.set(source.id, source);
  return [...seen.values()];
}

export function CountryMatchResults({
  result,
  answers,
  updatedAt,
}: {
  result: MatchResult;
  answers: MatchAnswers;
  updatedAt: string;
}) {
  const sources = uniqueSources(result);
  return (
    <div className={styles.results}>
      <div className={styles.picks}>
        {result.picks.map((pick, index) => (
          <PickCard key={pick.code} pick={pick} purpose={answers.purpose} index={index} />
        ))}
      </div>

      {(result.excluded.length > 0 || result.familyOutsideEu || result.ownCountry || result.notes.length > 0) && (
        <section className={styles.notes} aria-label="Notes">
          {result.excluded.length > 0 && (
            <div className={styles.note} data-tone="warn">
              <TriangleAlert size={18} aria-hidden="true" />
              <div>
                <strong>Not suggested for your passport</strong>
                <ul>
                  {result.excluded.map((item) => (
                    <li key={item.code}>{item.title}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
          {result.familyOutsideEu && (
            <div className={styles.note}>
              <Info size={18} aria-hidden="true" />
              <p>
                Your family member does not live in an EU country, so family is not part of this comparison. Family
                reunification is applied for in the country where your family member lives.
              </p>
            </div>
          )}
          {result.ownCountry && (
            <div className={styles.note}>
              <Info size={18} aria-hidden="true" />
              <p>{regionName(result.ownCountry)} is your own country, so it is not suggested: you already have every right to live there.</p>
            </div>
          )}
          {result.notes.map((note) => (
            <div key={note.title} className={styles.note}>
              <Info size={18} aria-hidden="true" />
              <div>
                <strong>{note.title}</strong>
                <p>{note.description}</p>
              </div>
            </div>
          ))}
        </section>
      )}

      <section className={styles.profileBlock}>
        <div className={styles.profileHeading}>
          <div>
            <p className={styles.eyebrow}>YOUR MOVE PROFILE</p>
            <h2>What we based this on</h2>
          </div>
          <Link href="/account/match?edit=1" className={styles.secondary}>
            <Pencil size={16} aria-hidden="true" />
            Edit answers
          </Link>
        </div>
        <MoveProfileSummary answers={answers} />
        <p className={styles.mutedNote}>Saved {formatDay(updatedAt)}</p>
      </section>

      <section className={styles.method}>
        <h2>How we pick</h2>
        <p>
          “Easiest to move to” uses your passport, your plan and the rules DocRoute checked on official websites; for
          other countries we link to the official pages. “Fits how you want to live” compares your answers with official
          Eurostat statistics, never with opinions about the people of a country. “Best all-round” balances both. This is
          a starting point, not legal advice: always check the official sources before you apply.
        </p>
        {sources.length > 0 && (
          <>
            <h3>Sources</h3>
            <ul className={styles.sources}>
              {sources.map((source) => (
                <li key={source.id + source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer">
                    {source.title}
                    <ExternalLink size={13} aria-hidden="true" />
                  </a>
                  <small>
                    {source.publisher} · checked {source.checkedAt}
                  </small>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}
