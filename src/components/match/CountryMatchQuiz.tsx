"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  Check,
  Clock,
  GraduationCap,
  HeartHandshake,
  Languages,
  Plus,
  ShieldCheck,
  Snowflake,
  Store,
  Sun,
  TrendingUp,
  Users,
  Wallet,
  X,
} from "lucide-react";

import { CountryPicker, type CountryOption } from "@/components/CountryPicker";
import { applicantCountryOptions, citizenshipCountryOptions } from "@/data/applicant-countries";
import {
  lifestyleKeys,
  MAX_LANGUAGES,
  matchLanguages,
  parseMatchAnswers,
  type BusinessKind,
  type EducationLevel,
  type LanguageLevel,
  type Lifestyle,
  type MatchAnswers,
  type MatchField,
  type MatchPurpose,
  type SponsorStatus,
} from "@/lib/country-match-answers";
import { countryPages } from "@/lib/country-list";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { saveMoveProfile } from "@/lib/supabase/move-profile";

import {
  businessChoices,
  educationChoices,
  fieldChoices,
  levelChoices,
  lifestyleQuestions,
  purposeChoices,
  sponsorChoices,
} from "./labels";
import styles from "./CountryMatch.module.css";

type StepId = "purpose" | "you" | "languages" | "details" | "lifestyle";

const steps: ReadonlyArray<{ id: StepId; label: string }> = [
  { id: "purpose", label: "Purpose" },
  { id: "you", label: "About you" },
  { id: "languages", label: "Languages" },
  { id: "details", label: "Your plan" },
  { id: "lifestyle", label: "How you live" },
];

type Icon = ComponentType<{ size?: number; "aria-hidden"?: boolean | "true" }>;

const purposeIcons: Record<MatchPurpose, Icon> = {
  study: GraduationCap,
  work: BriefcaseBusiness,
  family: HeartHandshake,
  business: Store,
};

const lifestyleIcons: Record<keyof Lifestyle, Icon> = {
  city: Building2,
  winter: Snowflake,
  summer: Sun,
  budget: Wallet,
  rhythm: Clock,
  language: Languages,
  people: Users,
  safety: ShieldCheck,
  jobs: TrendingUp,
};

const euOptions: readonly CountryOption[] = countryPages.filter((country) => country.code !== "CH");

type LanguageRow = { key: number; code: string; level: LanguageLevel };

type Draft = {
  purpose: MatchPurpose | "";
  citizenship: string;
  livesIn: string;
  residentWhereLives: boolean;
  education: EducationLevel | "";
  languages: LanguageRow[];
  studyField: MatchField | "";
  studyEnglish: "yes" | "no" | "";
  hasOffer: "yes" | "no" | "";
  offerCountry: string;
  familyWhere: "eu" | "outside" | "";
  sponsorCountry: string;
  sponsorStatus: SponsorStatus | "";
  businessKind: BusinessKind | "";
  lifestyle: Partial<Lifestyle>;
};

export type MatchPrefill = {
  citizenship?: string;
  education?: EducationLevel;
  languages?: Array<{ code: string; level: LanguageLevel }>;
};

function initialDraft(initial: MatchAnswers | null, prefill: MatchPrefill | null): Draft {
  const languages = (initial?.languages ?? prefill?.languages ?? []).map((language, index) => ({ key: index + 1, ...language }));
  return {
    purpose: initial?.purpose ?? "",
    citizenship: initial?.citizenship ?? prefill?.citizenship ?? "",
    livesIn: initial?.livesIn ?? "",
    residentWhereLives: initial?.residentWhereLives ?? false,
    education: initial?.education ?? prefill?.education ?? "",
    languages: languages.length ? languages : [{ key: 1, code: "", level: "fluent" }],
    studyField: initial?.study?.field ?? "",
    studyEnglish: initial?.study ? (initial.study.english ? "yes" : "no") : "",
    hasOffer: initial?.work ? (initial.work.offerCountry ? "yes" : "no") : "",
    offerCountry: initial?.work?.offerCountry ?? "",
    familyWhere: initial?.family ? (initial.family.sponsorCountry ? "eu" : "outside") : "",
    sponsorCountry: initial?.family?.sponsorCountry ?? "",
    sponsorStatus: initial?.family?.sponsorStatus ?? "",
    businessKind: initial?.business?.kind ?? "",
    lifestyle: initial?.lifestyle ?? {},
  };
}

function stepComplete(step: StepId, draft: Draft) {
  switch (step) {
    case "purpose":
      return Boolean(draft.purpose);
    case "you":
      return Boolean(draft.citizenship && draft.education);
    case "languages":
      return true;
    case "details":
      if (draft.purpose === "study") return Boolean(draft.studyField && draft.studyEnglish);
      if (draft.purpose === "work") return draft.hasOffer === "no" || (draft.hasOffer === "yes" && Boolean(draft.offerCountry));
      if (draft.purpose === "family")
        return Boolean(draft.sponsorStatus) && (draft.familyWhere === "outside" || (draft.familyWhere === "eu" && Boolean(draft.sponsorCountry)));
      if (draft.purpose === "business") return Boolean(draft.businessKind);
      return false;
    case "lifestyle":
      return lifestyleKeys.every((key) => Boolean(draft.lifestyle[key]));
  }
}

function toAnswers(draft: Draft): MatchAnswers | null {
  return parseMatchAnswers({
    purpose: draft.purpose,
    citizenship: draft.citizenship,
    livesIn: draft.livesIn || null,
    residentWhereLives: draft.residentWhereLives,
    education: draft.education,
    languages: draft.languages.filter((language) => language.code).map(({ code, level }) => ({ code, level })),
    study: { field: draft.studyField, english: draft.studyEnglish === "yes" },
    work: { offerCountry: draft.hasOffer === "yes" ? draft.offerCountry : null },
    family: { sponsorCountry: draft.familyWhere === "eu" ? draft.sponsorCountry : null, sponsorStatus: draft.sponsorStatus },
    business: { kind: draft.businessKind },
    lifestyle: draft.lifestyle,
  });
}

function Choice<T extends string>({
  legend,
  hint,
  name,
  value,
  options,
  onChange,
}: {
  legend: string;
  hint?: string;
  name: string;
  value: T | "";
  options: ReadonlyArray<{ value: T; label: string }>;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset className={styles.choice}>
      <legend>{legend}</legend>
      {hint && <p className={styles.hint}>{hint}</p>}
      <div className={styles.pills}>
        {options.map((option) => (
          <label key={option.value} data-checked={value === option.value || undefined}>
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
            />
            {value === option.value && <Check size={15} aria-hidden="true" />}
            <span>{option.label}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function CountryMatchQuiz({
  userId,
  initial,
  prefill,
  unavailable = false,
}: {
  userId: string;
  initial: MatchAnswers | null;
  prefill: MatchPrefill | null;
  unavailable?: boolean;
}) {
  const router = useRouter();
  const [draft, setDraft] = useState<Draft>(() => initialDraft(initial, prefill));
  const [stepIndex, setStepIndex] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const moved = useRef(false);

  const step = steps[stepIndex].id;
  const last = stepIndex === steps.length - 1;

  useEffect(() => {
    if (!moved.current) return;
    const heading = headingRef.current;
    if (!heading) return;
    const top = heading.getBoundingClientRect().top + window.scrollY - 120;
    if (window.scrollY > top) window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
    heading.focus({ preventScroll: true });
  }, [stepIndex]);

  function update(patch: Partial<Draft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setError(null);
  }

  function setLifestyle(key: keyof Lifestyle, value: string) {
    setDraft((current) => ({ ...current, lifestyle: { ...current.lifestyle, [key]: value } }));
    setError(null);
  }

  function updateLanguage(key: number, patch: Partial<LanguageRow>) {
    setDraft((current) => ({
      ...current,
      languages: current.languages.map((language) => (language.key === key ? { ...language, ...patch } : language)),
    }));
  }

  function addLanguage() {
    setDraft((current) => ({
      ...current,
      languages: [...current.languages, { key: Math.max(0, ...current.languages.map((language) => language.key)) + 1, code: "", level: "good" }],
    }));
  }

  function removeLanguage(key: number) {
    setDraft((current) => ({ ...current, languages: current.languages.filter((language) => language.key !== key) }));
  }

  function go(index: number) {
    moved.current = true;
    setError(null);
    setStepIndex(index);
  }

  async function next() {
    if (!stepComplete(step, draft)) {
      setError("Answer the questions above to continue.");
      return;
    }
    if (!last) {
      go(stepIndex + 1);
      return;
    }
    const answers = toAnswers(draft);
    if (!answers) {
      setError("Some answers are missing. Go back and check each step.");
      return;
    }
    setSaving(true);
    try {
      if (!isSupabaseConfigured()) throw new Error("Supabase is not configured");
      await saveMoveProfile(createSupabaseBrowserClient(), userId, answers);
    } catch {
      setSaving(false);
      setError("We could not save your answers. Please try again in a moment.");
      return;
    }
    router.push("/account/match");
    router.refresh();
  }

  const usedLanguages = new Set(draft.languages.map((language) => language.code).filter(Boolean));
  const livesElsewhere = Boolean(draft.livesIn) && draft.livesIn !== draft.citizenship;

  return (
    <div className={styles.quiz}>
      <ol className={styles.rail} aria-label="Steps">
        {steps.map((item, index) => {
          const state = index === stepIndex ? "current" : index < stepIndex ? "done" : "next";
          return (
            <li key={item.id} data-state={state} aria-current={state === "current" ? "step" : undefined}>
              {index < stepIndex ? (
                <button type="button" onClick={() => go(index)}>
                  <span className={styles.railMark}>
                    <Check size={14} aria-hidden="true" />
                  </span>
                  <span>{item.label}</span>
                </button>
              ) : (
                <span className={styles.railItem}>
                  <span className={styles.railMark}>{index + 1}</span>
                  <span>{item.label}</span>
                </span>
              )}
            </li>
          );
        })}
      </ol>

      <form
        className={styles.panel}
        onSubmit={(event) => {
          event.preventDefault();
          void next();
        }}
        noValidate
      >
        <p className={styles.stepCount}>
          Step {stepIndex + 1} of {steps.length}
        </p>

        {unavailable && (
          <p className={styles.warning} role="status">
            Your saved answers could not be loaded right now. You can still answer again; saving may also fail until the
            service is back.
          </p>
        )}

        {step === "purpose" && (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              What is your move for?
            </h2>
            <p className={styles.lead}>We compare all 27 EU countries for this purpose.</p>
            <fieldset className={styles.purposeGrid}>
              <legend className={styles.srOnly}>Purpose</legend>
              {purposeChoices.map((item) => {
                const PurposeIcon = purposeIcons[item.value];
                const checked = draft.purpose === item.value;
                return (
                  <label key={item.value} className={styles.purposeCard} data-checked={checked || undefined}>
                    <input
                      type="radio"
                      name="purpose"
                      value={item.value}
                      checked={checked}
                      onChange={() => update({ purpose: item.value })}
                    />
                    <span className={styles.purposeIcon}>
                      <PurposeIcon size={22} aria-hidden="true" />
                    </span>
                    <strong>{item.label}</strong>
                    <small>{item.text}</small>
                    {checked && (
                      <span className={styles.purposeCheck}>
                        <Check size={15} aria-hidden="true" />
                      </span>
                    )}
                  </label>
                );
              })}
            </fieldset>
          </>
        )}

        {step === "you" && (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              About you
            </h2>
            <p className={styles.lead}>Your passport decides most of the rules. We never ask for documents.</p>
            <div className={styles.fieldGrid}>
              <CountryPicker
                label="Citizenship"
                value={draft.citizenship}
                options={citizenshipCountryOptions}
                placeholder="Choose your citizenship"
                onChange={(code) => update({ citizenship: code })}
              />
              <CountryPicker
                label="Where do you live now?"
                value={draft.livesIn}
                options={applicantCountryOptions}
                placeholder="Choose a country"
                onChange={(code) => update({ livesIn: code })}
              />
            </div>
            {livesElsewhere && (
              <label className={styles.check}>
                <input
                  type="checkbox"
                  checked={draft.residentWhereLives}
                  onChange={(event) => update({ residentWhereLives: event.target.checked })}
                />
                <span>I have a residence permit or a long-stay visa there</span>
              </label>
            )}
            <Choice
              legend="Your highest finished education"
              hint={
                draft.purpose === "study"
                  ? "For study we look for your next degree: a bachelor's after secondary school, a master's after a bachelor's."
                  : undefined
              }
              name="education"
              value={draft.education}
              options={educationChoices}
              onChange={(value) => update({ education: value })}
            />
          </>
        )}

        {step === "languages" && (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              Languages you speak
            </h2>
            <p className={styles.lead}>
              Include your native language. Speaking a country&apos;s language makes the move and daily life easier.
            </p>
            <ul className={styles.languageList}>
              {draft.languages.map((language, index) => (
                <li key={language.key}>
                  <label className={styles.field}>
                    <span>Language {index + 1}</span>
                    <select value={language.code} onChange={(event) => updateLanguage(language.key, { code: event.target.value })}>
                      <option value="">Choose language</option>
                      {matchLanguages
                        .filter((option) => option.code === language.code || !usedLanguages.has(option.code))
                        .map((option) => (
                          <option key={option.code} value={option.code}>
                            {option.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <Choice
                    legend="Level"
                    name={`level-${language.key}`}
                    value={language.level}
                    options={levelChoices}
                    onChange={(value) => updateLanguage(language.key, { level: value })}
                  />
                  <button type="button" className={styles.remove} onClick={() => removeLanguage(language.key)} aria-label="Remove language">
                    <X size={16} aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
            {draft.languages.length < MAX_LANGUAGES && (
              <button type="button" className={styles.addLanguage} onClick={addLanguage}>
                <Plus size={16} aria-hidden="true" />
                Add a language
              </button>
            )}
          </>
        )}

        {step === "details" && (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              Your plan
            </h2>
            {draft.purpose === "study" && (
              <>
                <p className={styles.lead}>We check where DocRoute has verified programmes for you.</p>
                <Choice
                  legend="What do you want to study?"
                  name="field"
                  value={draft.studyField}
                  options={fieldChoices}
                  onChange={(value) => update({ studyField: value })}
                />
                <Choice
                  legend="Do you want to study in English?"
                  name="english"
                  value={draft.studyEnglish}
                  options={[
                    { value: "yes", label: "Yes, in English" },
                    { value: "no", label: "The local language is fine" },
                  ]}
                  onChange={(value) => update({ studyEnglish: value })}
                />
              </>
            )}
            {draft.purpose === "work" && (
              <>
                <p className={styles.lead}>A job offer usually decides the country.</p>
                <Choice
                  legend="Do you already have a job offer in an EU country?"
                  name="offer"
                  value={draft.hasOffer}
                  options={[
                    { value: "no", label: "Not yet" },
                    { value: "yes", label: "Yes" },
                  ]}
                  onChange={(value) => update({ hasOffer: value })}
                />
                {draft.hasOffer === "yes" && (
                  <div className={styles.fieldGrid}>
                    <CountryPicker
                      label="Country of the job offer"
                      value={draft.offerCountry}
                      options={euOptions}
                      placeholder="Choose a country"
                      onChange={(code) => update({ offerCountry: code })}
                    />
                  </div>
                )}
              </>
            )}
            {draft.purpose === "family" && (
              <>
                <p className={styles.lead}>Family reunification happens in the country where your family member lives.</p>
                <Choice
                  legend="Where does your family member live?"
                  name="family-where"
                  value={draft.familyWhere}
                  options={[
                    { value: "eu", label: "In an EU country" },
                    { value: "outside", label: "Outside the EU" },
                  ]}
                  onChange={(value) => update({ familyWhere: value })}
                />
                {draft.familyWhere === "eu" && (
                  <div className={styles.fieldGrid}>
                    <CountryPicker
                      label="Their country"
                      value={draft.sponsorCountry}
                      options={euOptions}
                      placeholder="Choose a country"
                      onChange={(code) => update({ sponsorCountry: code })}
                    />
                  </div>
                )}
                <Choice
                  legend="Your family member is"
                  name="sponsor"
                  value={draft.sponsorStatus}
                  options={sponsorChoices}
                  onChange={(value) => update({ sponsorStatus: value })}
                />
              </>
            )}
            {draft.purpose === "business" && (
              <>
                <p className={styles.lead}>The kind of business decides which permit you need.</p>
                <Choice
                  legend="What do you plan?"
                  name="business"
                  value={draft.businessKind}
                  options={businessChoices}
                  onChange={(value) => update({ businessKind: value })}
                />
              </>
            )}
          </>
        )}

        {step === "lifestyle" && (
          <>
            <h2 ref={headingRef} tabIndex={-1}>
              How do you want to live?
            </h2>
            <p className={styles.lead}>
              There are no right answers. We compare them with official EU statistics, never with opinions about people.
            </p>
            <div className={styles.lifestyleList}>
              {lifestyleQuestions.map((question) => {
                const QuestionIcon = lifestyleIcons[question.key];
                const value = draft.lifestyle[question.key] ?? "";
                return (
                  <fieldset key={question.key} className={styles.lifestyleRow}>
                    <legend>
                      <span className={styles.lifestyleIcon}>
                        <QuestionIcon size={17} aria-hidden="true" />
                      </span>
                      {question.legend}
                    </legend>
                    <div className={styles.pills}>
                      {question.options.map((option) => (
                        <label key={option.value} data-checked={value === option.value || undefined}>
                          <input
                            type="radio"
                            name={`lifestyle-${question.key}`}
                            value={option.value}
                            checked={value === option.value}
                            onChange={() => setLifestyle(question.key, option.value)}
                          />
                          {value === option.value && <Check size={15} aria-hidden="true" />}
                          <span>{option.label}</span>
                        </label>
                      ))}
                    </div>
                  </fieldset>
                );
              })}
            </div>
          </>
        )}

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <div className={styles.actions}>
          {stepIndex > 0 ? (
            <button type="button" className={styles.secondary} onClick={() => go(stepIndex - 1)}>
              <ArrowLeft size={17} aria-hidden="true" />
              Back
            </button>
          ) : initial ? (
            <Link href="/account/match" className={styles.secondary}>
              <ArrowLeft size={17} aria-hidden="true" />
              Back to my countries
            </Link>
          ) : (
            <Link href="/account" className={styles.secondary}>
              <ArrowLeft size={17} aria-hidden="true" />
              Back to profile
            </Link>
          )}
          <button type="submit" className={styles.primary} disabled={saving}>
            {last ? (saving ? "Saving…" : "Show my 3 countries") : "Next"}
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        </div>
      </form>
    </div>
  );
}
