"use client";

import { useMemo, useRef, useState } from "react";
import type { FormEvent } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  FileCheck2,
  Globe2,
  GraduationCap,
  Languages,
  Plus,
  ShieldCheck,
  Trash2,
  UserRound,
} from "lucide-react";

import catalog from "@/data/universities.json";
import { programOptions } from "@/data/demo-destinations";
import { createProfileSearchParams } from "@/lib/profile-query";
import { saveApplicantProfile } from "@/lib/supabase/applicant-profile";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import type {
  ApplicantLanguage,
  ApplicantProfile,
  CefrLevel,
  CurrentResidenceStatus,
  EducationStatus,
  GradeScale,
  WaiverEvidence,
} from "@/types/admission";

import styles from "./ApplicantProfileForm.module.css";

type LanguageRow = ApplicantLanguage & {
  id: string;
};

const languageOptions = [
  { code: "sk", name: "Slovak" },
  { code: "cs", name: "Czech" },
  { code: "en", name: "English" },
  { code: "de", name: "German" },
  { code: "fr", name: "French" },
  { code: "es", name: "Spanish" },
  { code: "it", name: "Italian" },
  { code: "pl", name: "Polish" },
  { code: "ro", name: "Romanian" },
  { code: "bg", name: "Bulgarian" },
  { code: "uk", name: "Ukrainian" },
  { code: "ru", name: "Russian" },
  { code: "he", name: "Hebrew" },
  { code: "ar", name: "Arabic" },
  { code: "hi", name: "Hindi" },
  { code: "tr", name: "Turkish" },
  { code: "zh", name: "Chinese" },
  { code: "other", name: "Another language" },
];

const applicantCountries = [
  ["IL", "Israel"],
  ["IN", "India"],
  ["US", "United States"],
  ["CA", "Canada"],
  ["AU", "Australia"],
  ["AE", "United Arab Emirates"],
  ["KZ", "Kazakhstan"],
  ["UZ", "Uzbekistan"],
  ["CN", "China"],
  ["JP", "Japan"],
  ["KR", "South Korea"],
  ["PK", "Pakistan"],
  ["BD", "Bangladesh"],
  ["NP", "Nepal"],
  ["LK", "Sri Lanka"],
  ["EG", "Egypt"],
  ["MA", "Morocco"],
  ["NG", "Nigeria"],
  ["ZA", "South Africa"],
  ["BR", "Brazil"],
  ["MX", "Mexico"],
  ["ZZ", "Other country"],
] as const;

const countryOptions = [
  ...new Map([
    ...catalog.universities.map(
      (university) =>
        [university.countryCode, university.country] as const,
    ),
    ...applicantCountries,
  ]).entries(),
]
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

const waiverOptions: Array<{
  value: WaiverEvidence;
  label: string;
  description: string;
}> = [
  {
    value: "math-matura",
    label: "Mathematics final exam",
    description: "External mathematics maturita or equivalent evidence",
  },
  {
    value: "scio-math-60",
    label: "SCIO Mathematics 60+",
    description: "NPS Mathematics percentile of at least 60",
  },
  {
    value: "scio-general-70",
    label: "SCIO General 70+",
    description: "General study aptitude percentile of at least 70",
  },
  {
    value: "ccna",
    label: "CCNA or higher",
    description: "Official networking industry certificate",
  },
  {
    value: "fri-course",
    label: "FRI preparatory course",
    description: "Completed specialist course organised by the faculty",
  },
  {
    value: "olympiad",
    label: "Relevant competition",
    description: "Published olympiad or national competition result",
  },
];

function getCountry(code: string) {
  return countryOptions.find((country) => country.code === code);
}

export function ApplicantProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextLanguageId = useRef(2);

  const countryCode = searchParams.get("country")?.toUpperCase() ?? "";
  const selectedProgram = searchParams.get("program") ?? "";
  const destination = getCountry(countryCode);
  const validProgram = programOptions.includes(selectedProgram);

  const [citizenship, setCitizenship] = useState("");
  const [educationCountry, setEducationCountry] = useState("");
  const [currentResidenceStatus, setCurrentResidenceStatus] =
    useState<CurrentResidenceStatus | "">("");
  const [educationStatus, setEducationStatus] =
    useState<EducationStatus>("final-year");
  const [gradeScale, setGradeScale] =
    useState<GradeScale>("other");
  const [average, setAverage] = useState("");
  const [languages, setLanguages] = useState<LanguageRow[]>([
    {
      id: "language-1",
      code: "en",
      level: "B2",
      willingToStudyIn: true,
      proof: "none",
    },
  ]);
  const [waiverEvidence, setWaiverEvidence] = useState<
    Set<WaiverEvidence>
  >(() => new Set());
  const [error, setError] = useState("");

  const selectedCitizenship = useMemo(
    () => getCountry(citizenship),
    [citizenship],
  );
  const selectedEducationCountry = useMemo(
    () => getCountry(educationCountry),
    [educationCountry],
  );

  if (!destination || !validProgram) {
    return (
      <div className={styles.invalidPage}>
        <GraduationCap size={34} aria-hidden="true" />
        <h1>Choose your route first</h1>
        <p>Select a destination and study field before building your profile.</p>
        <Link href="/explore">
          <ArrowLeft size={17} aria-hidden="true" />
          Back to Explore
        </Link>
      </div>
    );
  }

  function updateLanguage(
    id: string,
    patch: Partial<ApplicantLanguage>,
  ) {
    setLanguages((current) =>
      current.map((language) =>
        language.id === id ? { ...language, ...patch } : language,
      ),
    );
  }

  function addLanguage() {
    const id = `language-${nextLanguageId.current}`;
    nextLanguageId.current += 1;

    setLanguages((current) => [
      ...current,
      {
        id,
        code: "",
        level: "B1",
        willingToStudyIn: false,
        proof: "none",
      },
    ]);
  }

  function removeLanguage(id: string) {
    setLanguages((current) =>
      current.length === 1
        ? current
        : current.filter((language) => language.id !== id),
    );
  }

  function toggleWaiver(value: WaiverEvidence) {
    setWaiverEvidence((current) => {
      const next = new Set(current);

      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }

      return next;
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    const completeLanguages = languages.filter((language) => language.code);
    const uniqueLanguageCodes = new Set(
      completeLanguages.map((language) => language.code),
    );

    if (!citizenship || !educationCountry || !currentResidenceStatus) {
      setError(
        "Select your citizenship, education country, and current residence status.",
      );
      return;
    }

    if (completeLanguages.length === 0) {
      setError("Add at least one language you know.");
      return;
    }

    if (uniqueLanguageCodes.size !== completeLanguages.length) {
      setError("Each language should appear only once.");
      return;
    }

    const numericAverage = average ? Number(average) : undefined;

    if (
      numericAverage !== undefined &&
      (!Number.isFinite(numericAverage) || numericAverage <= 0)
    ) {
      setError("Enter a valid grade average or leave it blank.");
      return;
    }

    const profile: ApplicantProfile = {
      destinationCountryCode: countryCode,
      studyCategory: selectedProgram,
      degreeLevel: "bachelor",
      intake: "2027/28",
      citizenshipCountryCode: citizenship,
      educationCountryCode: educationCountry,
      currentResidenceStatus,
      educationStatus,
      gradeScale,
      penultimateYearAverage: numericAverage,
      languages: completeLanguages.map((language) => ({
        code: language.code,
        level: language.level,
        willingToStudyIn: language.willingToStudyIn,
        proof: language.proof,
        certificateName: language.certificateName,
      })),
      waiverEvidence: [...waiverEvidence],
    };

    const profileParams = createProfileSearchParams(profile);

    if (isSupabaseConfigured()) {
      try {
        const supabase = createSupabaseBrowserClient();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          await saveApplicantProfile(supabase, user.id, profile);
        }
      } catch {
        setError("We could not save your profile. Please try again.");
        return;
      }
    }

    router.push(`/route/universities?${profileParams.toString()}`);
  }

  return (
    <div className={styles.page}>
      <nav className={styles.breadcrumb}>
        <Link href="/explore">
          <ArrowLeft size={16} aria-hidden="true" />
          Change destination
        </Link>
        <span>/</span>
        <strong>Applicant profile</strong>
      </nav>

      <header className={styles.hero}>
        <div>
          <p className={styles.eyebrow}>MATCHING PROFILE · STEP 2 OF 3</p>
          <h1>
            Tell us what you already <span>bring.</span>
          </h1>
          <p>
            We use your education, every language you know, and available
            evidence to explain which admission route fits — without hiding
            missing requirements behind a percentage.
          </p>
        </div>

        <aside className={styles.routeSummary}>
          <Image
            src={`https://flagcdn.com/w80/${countryCode.toLowerCase()}.png`}
            alt=""
            width={42}
            height={30}
            unoptimized
          />
          <div>
            <small>YOUR SEARCH</small>
            <strong>{destination.name}</strong>
            <span>{selectedProgram} · Bachelor · 2027/28</span>
          </div>
        </aside>
      </header>

      <form className={styles.form} onSubmit={handleSubmit}>
        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>
              <UserRound size={21} aria-hidden="true" />
            </span>
            <div>
              <small>01 · BACKGROUND</small>
              <h2>Your education route</h2>
              <p>
                Citizenship and where you studied can change recognition and
                language-proof rules.
              </p>
            </div>
          </header>

          <div className={styles.fieldGrid}>
            <label className={styles.field}>
              <span>Citizenship</span>
              <div className={styles.countrySelect}>
                {selectedCitizenship && citizenship !== "ZZ" ? (
                  <Image
                    src={`https://flagcdn.com/w40/${citizenship.toLowerCase()}.png`}
                    alt=""
                    width={22}
                    height={16}
                    unoptimized
                  />
                ) : (
                  <Globe2 size={17} aria-hidden="true" />
                )}
                <select
                  value={citizenship}
                  onChange={(event) => setCitizenship(event.target.value)}
                  required
                >
                  <option value="">Select citizenship</option>
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className={styles.field}>
              <span>Country of secondary education</span>
              <div className={styles.countrySelect}>
                {selectedEducationCountry && educationCountry !== "ZZ" ? (
                  <Image
                    src={`https://flagcdn.com/w40/${educationCountry.toLowerCase()}.png`}
                    alt=""
                    width={22}
                    height={16}
                    unoptimized
                  />
                ) : (
                  <BookOpen size={17} aria-hidden="true" />
                )}
                <select
                  value={educationCountry}
                  onChange={(event) =>
                    setEducationCountry(event.target.value)
                  }
                  required
                >
                  <option value="">Select education country</option>
                  {countryOptions.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.name}
                    </option>
                  ))}
                </select>
              </div>
            </label>

            <label className={styles.field}>
              <span>Current residence status</span>
              <select
                value={currentResidenceStatus}
                onChange={(event) =>
                  setCurrentResidenceStatus(
                    event.target.value as CurrentResidenceStatus | "",
                  )
                }
                required
              >
                <option value="">Select current residence status</option>
                <option value="outside-slovakia">Outside Slovakia</option>
                <option value="slovak-residence">Slovak residence permit</option>
                <option value="eu-residence">Residence in another EU country</option>
                <option value="slovak-national-visa">Slovak national visa</option>
                <option value="visa-free">Visa-free stay</option>
                <option value="temporary-protection">Temporary protection</option>
                <option value="other">Other</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Secondary-school status</span>
              <select
                value={educationStatus}
                onChange={(event) =>
                  setEducationStatus(event.target.value as EducationStatus)
                }
              >
                <option value="completed">Already graduated</option>
                <option value="final-year">In my final year</option>
                <option value="earlier-year">Not yet in my final year</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Target intake</span>
              <div className={styles.readonlyField}>
                <GraduationCap size={17} aria-hidden="true" />
                Bachelor · 2027/28
              </div>
            </label>
          </div>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>
              <Languages size={21} aria-hidden="true" />
            </span>
            <div>
              <small>02 · LANGUAGES</small>
              <h2>Add every language you know</h2>
              <p>
                This is not only the language of instruction. Add all known
                languages, your current level, proof, and whether you would
                actually study in that language.
              </p>
            </div>
          </header>

          <div className={styles.languageList}>
            {languages.map((language, index) => (
              <article className={styles.languageCard} key={language.id}>
                <div className={styles.languageNumber}>
                  {String(index + 1).padStart(2, "0")}
                </div>

                <label className={styles.field}>
                  <span>Language</span>
                  <select
                    value={language.code}
                    onChange={(event) =>
                      updateLanguage(language.id, {
                        code: event.target.value,
                      })
                    }
                    required
                  >
                    <option value="">Choose language</option>
                    {languageOptions.map((option) => (
                      <option key={option.code} value={option.code}>
                        {option.name}
                      </option>
                    ))}
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Current level</span>
                  <select
                    value={language.level}
                    onChange={(event) =>
                      updateLanguage(language.id, {
                        level: event.target.value as CefrLevel,
                      })
                    }
                  >
                    <option value="A1">A1 · Beginner</option>
                    <option value="A2">A2 · Elementary</option>
                    <option value="B1">B1 · Intermediate</option>
                    <option value="B2">B2 · Upper intermediate</option>
                    <option value="C1">C1 · Advanced</option>
                    <option value="C2">C2 · Proficient</option>
                    <option value="native">Native</option>
                  </select>
                </label>

                <label className={styles.field}>
                  <span>Proof</span>
                  <select
                    value={language.proof}
                    onChange={(event) =>
                      updateLanguage(language.id, {
                        proof: event.target.value as ApplicantLanguage["proof"],
                      })
                    }
                  >
                    <option value="none">No proof yet</option>
                    <option value="school">School record</option>
                    <option value="certificate">Certificate or test</option>
                  </select>
                </label>

                {language.proof === "certificate" && (
                  <label className={styles.field}>
                    <span>Certificate name</span>
                    <input
                      type="text"
                      value={language.certificateName ?? ""}
                      placeholder="e.g. IELTS, UNIZA test"
                      onChange={(event) =>
                        updateLanguage(language.id, {
                          certificateName: event.target.value,
                        })
                      }
                    />
                  </label>
                )}

                <label className={styles.studyToggle}>
                  <input
                    type="checkbox"
                    checked={language.willingToStudyIn}
                    onChange={(event) =>
                      updateLanguage(language.id, {
                        willingToStudyIn: event.target.checked,
                      })
                    }
                  />
                  <span className={styles.toggleMark}>
                    <Check size={13} aria-hidden="true" />
                  </span>
                  I am willing to study in this language
                </label>

                <button
                  type="button"
                  className={styles.removeLanguage}
                  aria-label={`Remove language ${index + 1}`}
                  disabled={languages.length === 1}
                  onClick={() => removeLanguage(language.id)}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </button>
              </article>
            ))}
          </div>

          <button
            type="button"
            className={styles.addLanguage}
            onClick={addLanguage}
          >
            <Plus size={17} aria-hidden="true" />
            Add another language
          </button>
        </section>

        <section className={styles.section}>
          <header className={styles.sectionHeader}>
            <span className={styles.sectionIcon}>
              <FileCheck2 size={21} aria-hidden="true" />
            </span>
            <div>
              <small>03 · ACADEMIC EVIDENCE</small>
              <h2>What can support your application?</h2>
              <p>
                Optional. We only use an item when an official university rule
                confirms what it changes.
              </p>
            </div>
          </header>

          <div className={styles.gradeRow}>
            <label className={styles.field}>
              <span>Grade scale</span>
              <select
                value={gradeScale}
                onChange={(event) =>
                  setGradeScale(event.target.value as GradeScale)
                }
              >
                <option value="other">Another national scale</option>
                <option value="slovak-1-5">Slovak 1–5 scale</option>
              </select>
            </label>

            <label className={styles.field}>
              <span>Penultimate-year average (optional)</span>
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="0.01"
                value={average}
                placeholder={
                  gradeScale === "slovak-1-5" ? "e.g. 1.65" : "Your average"
                }
                onChange={(event) => setAverage(event.target.value)}
              />
            </label>
          </div>

          {gradeScale === "other" && average && (
            <p className={styles.scaleNotice}>
              We will not convert a foreign grade scale automatically. It is
              stored as context and marked for official review.
            </p>
          )}

          <div className={styles.waiverGrid}>
            {waiverOptions.map((option) => {
              const checked = waiverEvidence.has(option.value);

              return (
                <label
                  key={option.value}
                  className={`${styles.evidenceCard} ${
                    checked ? styles.evidenceSelected : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggleWaiver(option.value)}
                  />
                  <span className={styles.evidenceCheck}>
                    <Check size={13} aria-hidden="true" />
                  </span>
                  <span>
                    <strong>{option.label}</strong>
                    <small>{option.description}</small>
                  </span>
                </label>
              );
            })}
          </div>
        </section>

        <footer className={styles.submitDock}>
          <div>
            <ShieldCheck size={21} aria-hidden="true" />
            <p>
              <strong>Evidence-first matching</strong>
              <span>
                We show conditions and missing information — never a made-up
                match percentage.
              </span>
            </p>
          </div>

          <button type="submit">
            Build my university matches
            <ArrowRight size={18} aria-hidden="true" />
          </button>
        </footer>

        {error && (
          <p className={styles.formError} role="alert">
            {error}
          </p>
        )}
      </form>
    </div>
  );
}
