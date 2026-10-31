"use client";

import { useMemo, useState } from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  Check,
  Code2,
  Compass,
  GraduationCap,
  Globe2,
  MapPin,
  Scale,
  Search,
  Stethoscope,
  TrendingUp,
  Trophy,
  X,
} from "lucide-react";

import catalog from "@/data/universities.json";
import { programOptions } from "@/data/demo-destinations";
import { pendingProgramGroups } from "@/data/pending-programs";
import { verifiedPrograms } from "@/data/verified-programs";

import styles from "./ExploreCatalog.module.css";

type CountryOption = {
  code: string;
  name: string;
  universityCount: number;
};

const europeanCountryCodes = new Set([
  "AL", "AD", "AM", "AT", "AZ", "BY", "BE", "BA", "BG", "HR",
  "CY", "CZ", "DK", "EE", "FI", "FR", "GE", "DE", "GR", "HU",
  "IS", "IE", "IT", "XK", "LV", "LI", "LT", "LU", "MT", "MD",
  "MC", "ME", "NL", "MK", "NO", "PL", "PT", "RO", "RU", "SM",
  "RS", "SK", "SI", "ES", "SE", "CH", "TR", "UA", "GB", "VA",
]);

/* Lists grow with coverage; a search box appears once a list is longer
   than this, and the list scrolls inside its panel. */
const SEARCH_THRESHOLD = 6;

const countryCounts =
  catalog.universities.reduce<Record<string, number>>(
    (result, university) => {
      result[university.countryCode] =
        (result[university.countryCode] ?? 0) + 1;

      return result;
    },
    {},
  );

const countryOptions: CountryOption[] = [
  ...new Map(
    catalog.universities.map((university) => [
      university.countryCode,
      university.country,
    ]),
  ).entries(),
]
  .filter(([code]) => europeanCountryCodes.has(code))
  .map(([code, name]) => ({
    code,
    name,
    universityCount: countryCounts[code] ?? 0,
  }))
  .sort((a, b) => a.name.localeCompare(b.name, "en"));

/* Verified coverage comes from the program data, so new verified
   programs show up here without touching this component. */
const verifiedCountryCodes = new Set(
  verifiedPrograms.map((program) => program.countryCode),
);

/* Countries where DocRoute has checked a university's official rules
   ("coming soon" listings) but has not built a verified route yet. */
const checkedCountryCodes = new Set(
  pendingProgramGroups
    .map((group) => group.countryCode)
    .filter((code) => !verifiedCountryCodes.has(code)),
);

const checkedListingCount = pendingProgramGroups.length;

const verifiedCountryNames = countryOptions
  .filter((country) => verifiedCountryCodes.has(country.code))
  .map((country) => country.name)
  .join(" and ");

function checkedCountriesFor(field: string) {
  const verified = new Set(verifiedCountriesFor(field).map((country) => country.code));
  return new Set(
    pendingProgramGroups
      .filter((group) => group.category === field && !verified.has(group.countryCode))
      .map((group) => group.countryCode),
  );
}

function verifiedCountriesFor(field: string) {
  return countryOptions.filter((country) =>
    verifiedPrograms.some(
      (program) =>
        program.category === field &&
        program.countryCode === country.code,
    ),
  );
}

const programMeta: Record<
  string,
  {
    icon: typeof Stethoscope;
    description: string;
  }
> = {
  Medicine: {
    icon: Stethoscope,
    description: "General medicine and dentistry",
  },

  Law: {
    icon: Scale,
    description: "Law and legal science",
  },

  "Economics & Business": {
    icon: TrendingUp,
    description: "Economics, finance and management",
  },

  "Computer Science": {
    icon: Code2,
    description: "Computing, software and informatics",
  },
};

function flagSrc(code: string) {
  return `https://flagcdn.com/w80/${code.toLowerCase()}.png`;
}

function matches(text: string, query: string) {
  return text.toLowerCase().includes(query.trim().toLowerCase());
}

function SearchBox({
  value,
  onChange,
  placeholder,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
}) {
  return (
    <label className={styles.atlasSearch}>
      <Search size={17} aria-hidden="true" />

      <input
        type="search"
        aria-label={label}
        placeholder={placeholder}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      />

      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
        >
          <X size={15} aria-hidden="true" />
        </button>
      )}
    </label>
  );
}

export function ExploreCatalog() {
  const [countryCode, setCountryCode] = useState("");
  // "" means "any": you can browse one country across all fields, or one
  // field across all countries.
  const [program, setProgram] = useState("");
  const [countrySearch, setCountrySearch] = useState("");
  const [programSearch, setProgramSearch] = useState("");

  const selectedCountry = countryOptions.find(
    (country) => country.code === countryCode,
  );

  const countryGroups = useMemo(() => {
    const visible = countryOptions.filter((country) =>
      matches(country.name, countrySearch),
    );

    return [
      {
        title: "Verified routes",
        countries: visible.filter((country) =>
          verifiedCountryCodes.has(country.code),
        ),
      },
      {
        title: "Official rules checked · route coming",
        countries: visible.filter((country) =>
          checkedCountryCodes.has(country.code),
        ),
      },
      {
        title: countrySearch ? "Other matches" : "All destinations",
        countries: visible.filter(
          (country) =>
            !verifiedCountryCodes.has(country.code) &&
            !checkedCountryCodes.has(country.code),
        ),
      },
    ].filter((group) => group.countries.length > 0);
  }, [countrySearch]);

  const visiblePrograms = useMemo(
    () =>
      programOptions.filter(
        (option) =>
          matches(option, programSearch) ||
          matches(programMeta[option]?.description ?? "", programSearch),
      ),
    [programSearch],
  );

  const selectionVerified = Boolean(
    selectedCountry &&
      verifiedPrograms.some(
        (item) =>
          item.countryCode === selectedCountry.code &&
          (!program || item.category === program),
      ),
  );

  const resultsQuery = new URLSearchParams({
    ...(selectedCountry ? { country: selectedCountry.code } : {}),
    ...(program ? { program } : {}),
  }).toString();
  const resultsHref = resultsQuery ? `/explore/universities?${resultsQuery}` : null;

  return (
    <div className={styles.atlasPage}>
      <div className={styles.atlasBackdrop} aria-hidden="true" />

      <header className={styles.atlasHero}>
        <div className={styles.atlasHeroCopy}>
          <div className={styles.atlasKicker}>
            <Compass size={15} aria-hidden="true" />
            <span>STUDY ATLAS / EUROPE</span>
          </div>

          <h1>
            Build a shortlist that <span>actually fits.</span>
          </h1>

          <p>
            Pick a destination, a field, or both. We show every institution in
            the catalog. Verified routes exist in{" "}
            {verifiedCountryNames}; official admission rules are checked for{" "}
            {checkedListingCount} more university listings in{" "}
            {checkedCountryCodes.size} other countries, with their routes
            coming.
          </p>

          <Link href="/explore/top" className={styles.atlasTopLink}>
            <Trophy size={15} aria-hidden="true" />
            See Europe&apos;s top 100 universities and their entry requirements
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>

        <dl className={styles.atlasStats}>
          <div>
            <dt>destinations</dt>
            <dd>{countryOptions.length}</dd>
          </div>

          <div>
            <dt>institutions</dt>
            <dd>{catalog.universities.length}</dd>
          </div>

          <div>
            <dt>study fields</dt>
            <dd>{programOptions.length}</dd>
          </div>
        </dl>
      </header>

      <div className={styles.atlasWorkspace}>
        <section
          className={styles.atlasDeck}
          aria-labelledby="atlas-destination-title"
        >
          <header className={styles.atlasDeckHeader}>
            <div>
              <span className={styles.atlasStep}>01 · DESTINATION</span>
              <h2 id="atlas-destination-title">
                Where do you want to study?
              </h2>
            </div>

            <span className={styles.atlasDeckIcon}>
              <MapPin size={20} aria-hidden="true" />
            </span>
          </header>

          {countryOptions.length > SEARCH_THRESHOLD && (
            <SearchBox
              value={countrySearch}
              onChange={setCountrySearch}
              label="Search destinations"
              placeholder={`Search ${countryOptions.length} countries`}
            />
          )}

          <div className={styles.atlasList}>
            {!countrySearch && (
              <button
                type="button"
                aria-pressed={countryCode === ""}
                className={styles.atlasCountryRow}
                onClick={() => setCountryCode("")}
              >
                <span className={styles.atlasAnyIcon} aria-hidden="true">
                  <Globe2 size={18} />
                </span>
                <span className={styles.atlasRowText}>
                  <strong>Any country</strong>
                  <small>Search one field across Europe</small>
                </span>
                <span className={styles.atlasCheck} aria-hidden="true">
                  {countryCode === "" && <Check size={13} />}
                </span>
              </button>
            )}

            {countryGroups.map((group) => (
              <div key={group.title} className={styles.atlasGroup}>
                <p className={styles.atlasGroupTitle}>{group.title}</p>

                <div className={styles.atlasCountryList}>
                  {group.countries.map((country) => {
                    const selected = country.code === countryCode;
                    const verified = verifiedCountryCodes.has(country.code);
                    const checked = checkedCountryCodes.has(country.code);

                    return (
                      <button
                        key={country.code}
                        type="button"
                        aria-pressed={selected}
                        className={styles.atlasCountryRow}
                        onClick={() => setCountryCode(country.code)}
                      >
                        <Image
                          src={flagSrc(country.code)}
                          alt=""
                          width={32}
                          height={23}
                          unoptimized
                          className={styles.atlasFlag}
                        />

                        <span className={styles.atlasRowText}>
                          <strong>{country.name}</strong>
                          <small>
                            {country.universityCount} institutions
                          </small>
                        </span>

                        {verified && (
                          <span className={styles.atlasBadge}>
                            <BadgeCheck size={13} aria-hidden="true" />
                            Verified
                          </span>
                        )}

                        {checked && (
                          <span
                            className={`${styles.atlasBadge} ${styles.atlasBadgeChecked}`}
                          >
                            Rules checked
                          </span>
                        )}

                        <span
                          className={styles.atlasCheck}
                          aria-hidden="true"
                        >
                          {selected && <Check size={13} />}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}

            {countryGroups.length === 0 && (
              <p className={styles.atlasEmpty}>
                No country matches “{countrySearch.trim()}”.
              </p>
            )}
          </div>
        </section>

        <section
          className={styles.atlasDeck}
          aria-labelledby="atlas-field-title"
        >
          <header className={styles.atlasDeckHeader}>
            <div>
              <span className={styles.atlasStep}>02 · STUDY FIELD</span>
              <h2 id="atlas-field-title">What do you want to study?</h2>
            </div>

            <span className={styles.atlasDeckIcon}>
              <GraduationCap size={21} aria-hidden="true" />
            </span>
          </header>

          {programOptions.length > SEARCH_THRESHOLD && (
            <SearchBox
              value={programSearch}
              onChange={setProgramSearch}
              label="Search study fields"
              placeholder={`Search ${programOptions.length} fields`}
            />
          )}

          <div className={styles.atlasList}>
            <div className={styles.atlasProgramGrid}>
              {!programSearch && (
                <button
                  type="button"
                  aria-pressed={program === ""}
                  className={styles.atlasProgramTile}
                  onClick={() => setProgram("")}
                >
                  <span className={styles.atlasProgramIcon}>
                    <Compass size={19} aria-hidden="true" />
                  </span>
                  <span className={styles.atlasRowText}>
                    <strong>Any field</strong>
                    <small>Every institution in the chosen country</small>
                  </span>
                  <span className={styles.atlasCheck} aria-hidden="true">
                    {program === "" && <Check size={13} />}
                  </span>
                </button>
              )}
              {visiblePrograms.map((option) => {
                const meta = programMeta[option];
                const Icon = meta?.icon ?? GraduationCap;
                const selected = option === program;
                const verifiedIn = verifiedCountriesFor(option);
                const checkedIn = checkedCountriesFor(option);

                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    className={styles.atlasProgramTile}
                    onClick={() => setProgram(option)}
                  >
                    <span className={styles.atlasProgramIcon}>
                      <Icon size={19} aria-hidden="true" />
                    </span>

                    <span className={styles.atlasRowText}>
                      <strong>{option}</strong>
                      <small>
                        {meta?.description ?? "University programs"}
                      </small>

                      <span className={styles.atlasBadgeRow}>
                        {verifiedIn.length > 0 && (
                          <span className={styles.atlasBadge}>
                            <BadgeCheck size={13} aria-hidden="true" />
                            Verified in{" "}
                            {verifiedIn.map((country) => country.name).join(", ")}
                          </span>
                        )}
                        {checkedIn.size > 0 && (
                          <span
                            className={`${styles.atlasBadge} ${styles.atlasBadgeChecked}`}
                          >
                            Rules checked in {checkedIn.size}{" "}
                            {checkedIn.size === 1 ? "country" : "countries"}
                          </span>
                        )}
                      </span>
                    </span>

                    <span
                      className={styles.atlasCheck}
                      aria-hidden="true"
                    >
                      {selected && <Check size={13} />}
                    </span>
                  </button>
                );
              })}
            </div>

            {visiblePrograms.length === 0 && (
              <p className={styles.atlasEmpty}>
                No field matches “{programSearch.trim()}”.
              </p>
            )}
          </div>

          <p className={styles.atlasDeckNote}>
            <BadgeCheck size={15} aria-hidden="true" />
            <span>
              &ldquo;Verified&rdquo; means a full route built from the
              university&apos;s official rules for the intake. &ldquo;Rules
              checked&rdquo; means we read the official rules and list them,
              but the route is not built yet.{" "}
              <Link href="/how-it-works">How we check</Link>
            </span>
          </p>
        </section>
      </div>

      <section
        className={styles.atlasRouteDock}
        aria-label="Your selection"
      >
        <div className={styles.atlasRouteSegment}>
          <span className={styles.atlasRouteLabel}>DESTINATION</span>

          <div className={styles.atlasRouteValue}>
            {selectedCountry ? (
              <Image
                src={flagSrc(selectedCountry.code)}
                alt=""
                width={27}
                height={19}
                unoptimized
              />
            ) : (
              <Globe2 size={18} aria-hidden="true" />
            )}

            <strong>
              {selectedCountry ? selectedCountry.name : "Any country"}
            </strong>
          </div>
        </div>

        <ArrowRight
          size={18}
          aria-hidden="true"
          className={styles.atlasRouteArrow}
        />

        <div className={styles.atlasRouteSegment}>
          <span className={styles.atlasRouteLabel}>STUDY FIELD</span>

          <div className={styles.atlasRouteValue}>
            <GraduationCap size={18} aria-hidden="true" />
            <strong>{program || "Any field"}</strong>
          </div>
        </div>

        <div className={styles.atlasRouteDivider} />

        <div className={styles.atlasRouteResult}>
          <span className={styles.atlasRouteLabel}>YOUR NEXT STEP</span>

          <strong>
            {!selectedCountry && !program
              ? "Choose a country, a field or both"
              : !selectedCountry
                ? `${program} across Europe`
                : selectionVerified
                  ? "Verified programs available"
                  : `${selectedCountry.universityCount} institutions to explore`}
          </strong>
        </div>

        {resultsHref ? (
          <Link href={resultsHref} className={styles.atlasContinue}>
            Show universities
            <ArrowRight size={17} aria-hidden="true" />
          </Link>
        ) : (
          <button
            type="button"
            className={styles.atlasContinue}
            disabled
          >
            Choose a filter
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        )}
      </section>
    </div>
  );
}
