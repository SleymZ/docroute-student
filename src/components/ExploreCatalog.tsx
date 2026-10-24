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
  Pill,
  Search,
  Smile,
  Stethoscope,
  X,
} from "lucide-react";

import catalog from "@/data/universities.json";
import { programOptions } from "@/data/demo-destinations";
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
    description: "Medical and health sciences",
  },

  Dentistry: {
    icon: Smile,
    description: "Dental medicine and oral health",
  },

  Pharmacy: {
    icon: Pill,
    description: "Pharmaceutical sciences",
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
  const [program, setProgram] = useState(programOptions[0]);
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
        title: countrySearch ? "Other matches" : "All destinations",
        countries: visible.filter(
          (country) => !verifiedCountryCodes.has(country.code),
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
          item.category === program,
      ),
  );

  const resultsHref = selectedCountry
    ? `/explore/universities?${new URLSearchParams({
        country: selectedCountry.code,
        program,
      }).toString()}`
    : null;

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
            Pick a destination and a field. We show every institution in
            the catalog and mark the programs whose admission rules are
            verified from official sources.
          </p>
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
            {countryGroups.map((group) => (
              <div key={group.title} className={styles.atlasGroup}>
                <p className={styles.atlasGroupTitle}>{group.title}</p>

                <div className={styles.atlasCountryList}>
                  {group.countries.map((country) => {
                    const selected = country.code === countryCode;
                    const verified = verifiedCountryCodes.has(country.code);

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
              {visiblePrograms.map((option) => {
                const meta = programMeta[option];
                const Icon = meta?.icon ?? GraduationCap;
                const selected = option === program;
                const verifiedIn = verifiedCountriesFor(option);

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

                      {verifiedIn.length > 0 && (
                        <span className={styles.atlasBadge}>
                          <BadgeCheck size={13} aria-hidden="true" />
                          Verified in{" "}
                          {verifiedIn.map((country) => country.name).join(", ")}
                        </span>
                      )}
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
              {selectedCountry ? selectedCountry.name : "Not selected"}
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
            <strong>{program}</strong>
          </div>
        </div>

        <div className={styles.atlasRouteDivider} />

        <div className={styles.atlasRouteResult}>
          <span className={styles.atlasRouteLabel}>YOUR NEXT STEP</span>

          <strong>
            {!selectedCountry
              ? "Choose a destination"
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
            Select a country
            <ArrowRight size={17} aria-hidden="true" />
          </button>
        )}
      </section>
    </div>
  );
}
