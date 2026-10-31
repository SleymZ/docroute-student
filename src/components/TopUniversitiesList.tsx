"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";

import { TopUniversityFacts, TopUniversitySources } from "@/components/TopUniversityFacts";
import type { resolveTopAdmissions } from "@/lib/top-universities";
import type {
  TopComputerScience,
  TopFieldRequirements,
  TopUniversity,
} from "@/types/top-universities";

import styles from "@/app/explore/top/TopUniversities.module.css";

type Entry = {
  university: TopUniversity;
  admissions: ReturnType<typeof resolveTopAdmissions>;
  computerScience?: TopComputerScience;
  fields?: TopFieldRequirements;
};

// Formatted by hand so the server and the browser always print the same.
function groupThousands(value: number) {
  return String(value).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

function normalise(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

export function TopUniversitiesList({
  entries,
  countries,
}: {
  entries: Entry[];
  countries: string[];
}) {
  const [query, setQuery] = useState("");
  const [country, setCountry] = useState("");
  const [englishCs, setEnglishCs] = useState(false);

  // A link such as /explore/top#rank-2 opens that university's card.
  useEffect(() => {
    const match = /^#rank-(\d+)$/.exec(window.location.hash);
    if (!match) return;
    const card = document.querySelector<HTMLDetailsElement>(
      `#rank-${match[1]} details`,
    );
    if (card) {
      card.open = true;
      card.scrollIntoView({ block: "start" });
    }
  }, []);

  const visible = useMemo(() => {
    const needle = normalise(query.trim());
    return entries.filter(
      ({ university, computerScience }) =>
        (!country || university.country === country) &&
        (!englishCs || computerScience?.language === "English" || Boolean(computerScience?.note?.includes("English-taught track"))) &&
        (!needle ||
          normalise(`${university.name} ${university.country}`).includes(needle)),
    );
  }, [entries, query, country, englishCs]);

  return (
    <section className={styles.listSection} aria-label="Top 100 universities">
      <div className={styles.filters}>
        <label className={styles.search}>
          <Search size={16} aria-hidden="true" />
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search university or country"
            aria-label="Search university or country"
          />
          {query && (
            <button type="button" aria-label="Clear search" onClick={() => setQuery("")}>
              <X size={14} aria-hidden="true" />
            </button>
          )}
        </label>

        <label className={styles.select}>
          <span>Country</span>
          <select value={country} onChange={(event) => setCountry(event.target.value)}>
            <option value="">All countries</option>
            {countries.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </label>

        <label className={styles.toggle}>
          <input
            type="checkbox"
            checked={englishCs}
            onChange={(event) => setEnglishCs(event.target.checked)}
          />
          Computer science in English
        </label>

        <p className={styles.count} aria-live="polite">
          {visible.length} of {entries.length}
        </p>
      </div>

      {visible.length === 0 ? (
        <p className={styles.empty}>No university matches this search.</p>
      ) : (
        <ol className={styles.list}>
          {visible.map(({ university, admissions, computerScience, fields }) => (
            <li key={university.rank} id={`rank-${university.rank}`} className={styles.item}>
              <details className={styles.card}>
                <summary className={styles.summary}>
                  <span className={styles.rank}>{university.rank}</span>
                  <span className={styles.name}>
                    <strong>{university.name}</strong>
                    <span>{university.country}</span>
                  </span>
                  <span className={styles.metric}>
                    <strong>{groupThousands(university.leiden.topTenPublications)}</strong>
                    <span>top-10% papers</span>
                  </span>
                  <span className={styles.chevron} aria-hidden="true" />
                </summary>

                <div className={styles.body}>
                  <TopUniversityFacts
                    admissions={admissions}
                    computerScience={computerScience}
                    fields={fields}
                  />

                  <div className={styles.links}>
                    <a href={university.website} target="_blank" rel="noreferrer">
                      Official website
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                    {university.catalogId && (
                      <Link href={`/universities/${university.catalogId}`}>
                        DocRoute page
                      </Link>
                    )}
                  </div>

                  <TopUniversitySources sources={admissions.sources} />
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
