"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import Image from "next/image";
import Link from "next/link";

import {
  ArrowRight,
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

import styles from "./ExploreCatalog.module.css";

type CountryOption = {
  code: string;
  name: string;
  universityCount: number;
};

const featuredCountryCodes = [
  "SK",
  "CZ",
  "RO",
  "BG",
];

const europeanCountryCodes = new Set([
  "AL",
  "AD",
  "AM",
  "AT",
  "AZ",
  "BY",
  "BE",
  "BA",
  "BG",
  "HR",
  "CY",
  "CZ",
  "DK",
  "EE",
  "FI",
  "FR",
  "GE",
  "DE",
  "GR",
  "HU",
  "IS",
  "IE",
  "IT",
  "XK",
  "LV",
  "LI",
  "LT",
  "LU",
  "MT",
  "MD",
  "MC",
  "ME",
  "NL",
  "MK",
  "NO",
  "PL",
  "PT",
  "RO",
  "RU",
  "SM",
  "RS",
  "SK",
  "SI",
  "ES",
  "SE",
  "CH",
  "TR",
  "UA",
  "GB",
  "VA",
]);

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
  .filter(([code]) =>
    europeanCountryCodes.has(code),
  )
  .map(([code, name]) => ({
    code,
    name,
    universityCount: countryCounts[code] ?? 0,
  }))
  .sort((a, b) =>
    a.name.localeCompare(b.name),
  );

const featuredCountries = featuredCountryCodes
  .map((code) =>
    countryOptions.find(
      (country) => country.code === code,
    ),
  )
  .filter(
    (country): country is CountryOption =>
      country !== undefined,
  );

const programMeta = {
  Medicine: {
    icon: Stethoscope,
    code: "MED",
    description: "Medical and health sciences",
  },

  Dentistry: {
    icon: Smile,
    code: "DEN",
    description: "Dental medicine and oral health",
  },

  Pharmacy: {
    icon: Pill,
    code: "PHA",
    description: "Pharmaceutical sciences",
  },

  "Computer Science": {
    icon: Code2,
    code: "CS",
    description: "Computing, software and informatics",
  },
};

export function ExploreCatalog() {
  const [countryCode, setCountryCode] =
    useState("");

  const [program, setProgram] = useState(
    programOptions[0],
  );

  const [
    countryPickerOpen,
    setCountryPickerOpen,
  ] = useState(false);

  const [countrySearch, setCountrySearch] =
    useState("");

  const selectedCountry =
    countryOptions.find(
      (country) =>
        country.code === countryCode,
    );

  const filteredCountries = useMemo(() => {
    const query = countrySearch
      .trim()
      .toLowerCase();

    if (!query) {
      return countryOptions;
    }

    return countryOptions.filter((country) =>
      country.name
        .toLowerCase()
        .includes(query),
    );
  }, [countrySearch]);

  const resultsHref = selectedCountry
    ? `/explore/universities?${new URLSearchParams(
        {
          country: selectedCountry.code,
          program,
        },
      ).toString()}`
    : null;

  useEffect(() => {
    if (!countryPickerOpen) {
      return;
    }

    const previousOverflow =
      document.body.style.overflow;

    document.body.style.overflow = "hidden";

    function handleKeyDown(
      event: KeyboardEvent,
    ) {
      if (event.key === "Escape") {
        setCountryPickerOpen(false);
      }
    }

    window.addEventListener(
      "keydown",
      handleKeyDown,
    );

    return () => {
      document.body.style.overflow =
        previousOverflow;

      window.removeEventListener(
        "keydown",
        handleKeyDown,
      );
    };
  }, [countryPickerOpen]);

  function selectCountry(code: string) {
    setCountryCode(code);
    setCountryPickerOpen(false);
    setCountrySearch("");
  }

  return (
    <div className={styles.atlasPage}>
      <header className={styles.atlasHero}>
        <div className={styles.atlasHeroCopy}>
          <div className={styles.atlasKicker}>
            <Compass
              size={15}
              aria-hidden="true"
            />

            <span>
              STUDY ATLAS / EUROPE
            </span>
          </div>

          <h1>
            Build a shortlist that{" "}
            <span>actually fits.</span>
          </h1>

          <p>
            Explore Europe by destination and
            field. Turn an interesting university
            into a clear admission route.
          </p>
        </div>

        <div className={styles.atlasStats}>
          <div>
            <strong>
              {countryOptions.length}
            </strong>

            <span>destinations</span>
          </div>

          <div>
            <strong>
              {catalog.universities.length}
            </strong>

            <span>institutions</span>
          </div>

          <div>
            <strong>
              {programOptions.length}
            </strong>

            <span>study fields</span>
          </div>
        </div>
      </header>

      <div className={styles.atlasWorkspace}>
        <section
          className={`${styles.atlasDeck} ${styles.destinationDeck}`}
        >
          <header className={styles.atlasDeckHeader}>
            <div>
              <span
                className={styles.atlasStep}
              >
                01
              </span>

              <p>DESTINATION LAYER</p>

              <h2>
                Where do you want to study?
              </h2>
            </div>

            <span
              className={styles.atlasDeckIcon}
            >
              <MapPin
                size={22}
                aria-hidden="true"
              />
            </span>
          </header>

          <div
            className={styles.atlasCountryGrid}
          >
            {featuredCountries.map(
              (country) => {
                const selected =
                  country.code === countryCode;

                return (
                  <button
                    key={country.code}
                    type="button"
                    aria-pressed={selected}
                    className={`${
                      styles.atlasCountryCard
                    } ${
                      selected
                        ? styles.atlasCountrySelected
                        : ""
                    }`}
                    onClick={() =>
                      selectCountry(country.code)
                    }
                  >
                    <span
                      className={
                        styles.atlasCountryFlag
                      }
                    >
                      <Image
                        src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                        alt=""
                        width={42}
                        height={30}
                        unoptimized
                      />
                    </span>

                    <span
                      className={
                        styles.atlasCountryInfo
                      }
                    >
                      <strong>
                        {country.name}
                      </strong>

                      <small>
                        {country.universityCount}{" "}
                        institutions
                      </small>
                    </span>

                    <span
                      className={
                        styles.atlasCountryCode
                      }
                    >
                      {country.code}
                    </span>

                    {selected && (
                      <span
                        className={
                          styles.atlasSelectedMark
                        }
                      >
                        <Check
                          size={14}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </button>
                );
              },
            )}
          </div>

          <button
            type="button"
            className={
              styles.atlasAllCountries
            }
            onClick={() =>
              setCountryPickerOpen(true)
            }
          >
            <span
              className={styles.atlasGlobe}
            >
              {selectedCountry ? (
                <Image
                  src={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png`}
                  alt=""
                  width={36}
                  height={26}
                  unoptimized
                />
              ) : (
                <Globe2
                  size={21}
                  aria-hidden="true"
                />
              )}
            </span>

            <span>
              <strong>
                {selectedCountry
                  ? selectedCountry.name
                  : "Open the European atlas"}
              </strong>

              <small>
                {selectedCountry
                  ? "Current destination · click to change"
                  : `Browse ${countryOptions.length} available destinations`}
              </small>
            </span>

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </button>
        </section>

        <section
          className={`${styles.atlasDeck} ${styles.programDeck}`}
        >
          <header className={styles.atlasDeckHeader}>
            <div>
              <span
                className={styles.atlasStep}
              >
                02
              </span>

              <p>STUDY LENS</p>

              <h2>
                What do you want to study?
              </h2>
            </div>

            <span
              className={styles.atlasDeckIcon}
            >
              <GraduationCap
                size={23}
                aria-hidden="true"
              />
            </span>
          </header>

          <div
            className={styles.atlasProgramGrid}
          >
            {programOptions.map(
              (option, index) => {
                const meta =
                  programMeta[
                    option as keyof typeof programMeta
                  ];

                const Icon =
                  meta?.icon ??
                  GraduationCap;

                const selected =
                  option === program;

                return (
                  <button
                    key={option}
                    type="button"
                    aria-pressed={selected}
                    className={`${
                      styles.atlasProgramCard
                    } ${
                      selected
                        ? styles.atlasProgramSelected
                        : ""
                    }`}
                    onClick={() =>
                      setProgram(option)
                    }
                  >
                    <span
                      className={
                        styles.atlasProgramNumber
                      }
                    >
                      {String(index + 1).padStart(
                        2,
                        "0",
                      )}
                    </span>

                    <span
                      className={
                        styles.atlasProgramIcon
                      }
                    >
                      <Icon
                        size={22}
                        aria-hidden="true"
                      />
                    </span>

                    <span
                      className={
                        styles.atlasProgramInfo
                      }
                    >
                      <small>
                        {meta?.code ??
                          "FIELD"}
                      </small>

                      <strong>
                        {option}
                      </strong>

                      <p>
                        {meta?.description ??
                          "University programs"}
                      </p>
                    </span>

                    {selected && (
                      <span
                        className={
                          styles.atlasProgramCheck
                        }
                      >
                        <Check
                          size={14}
                          aria-hidden="true"
                        />
                      </span>
                    )}
                  </button>
                );
              },
            )}
          </div>
        </section>
      </div>

      <section
        className={styles.atlasRouteDock}
        aria-label="Selected university route"
      >
        <div className={styles.atlasRouteSegment}>
          <span
            className={styles.atlasRouteLabel}
          >
            DESTINATION
          </span>

          <div
            className={styles.atlasRouteValue}
          >
            {selectedCountry ? (
              <Image
                src={`https://flagcdn.com/w80/${selectedCountry.code.toLowerCase()}.png`}
                alt=""
                width={29}
                height={21}
                unoptimized
              />
            ) : (
              <Globe2
                size={19}
                aria-hidden="true"
              />
            )}

            <strong>
              {selectedCountry
                ? selectedCountry.name
                : "Not selected"}
            </strong>
          </div>
        </div>

        <ArrowRight
          size={19}
          aria-hidden="true"
          className={styles.atlasRouteArrow}
        />

        <div className={styles.atlasRouteSegment}>
          <span
            className={styles.atlasRouteLabel}
          >
            STUDY FIELD
          </span>

          <div
            className={styles.atlasRouteValue}
          >
            <GraduationCap
              size={19}
              aria-hidden="true"
            />

            <strong>{program}</strong>
          </div>
        </div>

        <div className={styles.atlasRouteDivider} />

        <div className={styles.atlasRouteResult}>
          <span>YOUR NEXT STEP</span>

          <strong>
            {selectedCountry
              ? `${selectedCountry.universityCount} institutions to explore`
              : "Choose a destination"}
          </strong>
        </div>

        {resultsHref ? (
          <Link
            href={resultsHref}
            className={styles.atlasContinue}
          >
            Explore universities

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </Link>
        ) : (
          <button
            type="button"
            className={styles.atlasContinue}
            disabled
          >
            Select a country

            <ArrowRight
              size={18}
              aria-hidden="true"
            />
          </button>
        )}
      </section>

      {countryPickerOpen && (
        <div
          className={styles.countryModal}
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setCountryPickerOpen(false);
            }
          }}
        >
          <section
            className={styles.countryDialog}
            role="dialog"
            aria-modal="true"
            aria-labelledby="country-dialog-title"
          >
            <header
              className={
                styles.countryDialogHeader
              }
            >
              <div>
                <p className={styles.eyebrow}>
                  EXPLORE EUROPE
                </p>

                <h2 id="country-dialog-title">
                  Choose your destination
                </h2>

                <p>
                  Select a country to explore
                  its universities.
                </p>
              </div>

              <button
                type="button"
                aria-label="Close country selection"
                className={
                  styles.closeCountryDialog
                }
                onClick={() =>
                  setCountryPickerOpen(false)
                }
              >
                <X
                  size={20}
                  aria-hidden="true"
                />
              </button>
            </header>

            <label
              className={styles.countrySearch}
            >
              <Search
                size={18}
                aria-hidden="true"
              />

              <input
                type="search"
                autoFocus
                placeholder="Search a country"
                value={countrySearch}
                onChange={(event) =>
                  setCountrySearch(
                    event.target.value,
                  )
                }
              />
            </label>

            <div className={styles.countryCount}>
              {filteredCountries.length}{" "}
              destinations
            </div>

            <div
              className={
                styles.countryPickerGrid
              }
            >
              {filteredCountries.map(
                (country) => {
                  const selected =
                    country.code ===
                    countryCode;

                  return (
                    <button
                      key={country.code}
                      type="button"
                      aria-pressed={selected}
                      className={`${
                        styles.countryPickerItem
                      } ${
                        selected
                          ? styles.countryPickerItemSelected
                          : ""
                      }`}
                      onClick={() =>
                        selectCountry(
                          country.code,
                        )
                      }
                    >
                      <Image
                        src={`https://flagcdn.com/w80/${country.code.toLowerCase()}.png`}
                        alt=""
                        width={38}
                        height={28}
                        unoptimized
                      />

                      <span>
                        <strong>
                          {country.name}
                        </strong>

                        <small>
                          {
                            country.universityCount
                          }{" "}
                          universities
                        </small>
                      </span>

                      {selected && (
                        <span
                          className={
                            styles.selectedCountryMark
                          }
                        >
                          Selected
                        </span>
                      )}
                    </button>
                  );
                },
              )}
            </div>

            {filteredCountries.length ===
              0 && (
              <div
                className={
                  styles.countryEmptyState
                }
              >
                No countries found.
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}