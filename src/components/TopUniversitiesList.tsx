"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ExternalLink, Search, X } from "lucide-react";

import { formatPlanDate } from "@/lib/residence/deadlines";
import type { resolveTopAdmissions } from "@/lib/top-universities";
import type { TopComputerScience, TopUniversity } from "@/types/top-universities";

import styles from "@/app/explore/top/TopUniversities.module.css";

type Entry = {
  university: TopUniversity;
  admissions: ReturnType<typeof resolveTopAdmissions>;
  computerScience?: TopComputerScience;
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
          {visible.map(({ university, admissions, computerScience }) => (
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
                  {admissions.intake && (
                    <p className={styles.intake}>
                      Source describes: {admissions.intake}
                    </p>
                  )}

                  <dl className={styles.facts}>
                    {computerScience && (
                      <div>
                        <dt>
                          Computer science bachelor
                          {computerScience.language && (
                            <span className={styles.scope}>{computerScience.language}</span>
                          )}
                        </dt>
                        <dd>
                          {computerScience.url ? (
                            <a href={computerScience.url} target="_blank" rel="noreferrer">
                              {computerScience.name}
                              <ExternalLink size={12} aria-hidden="true" />
                            </a>
                          ) : (
                            "None found"
                          )}
                          {computerScience.note && <> · {computerScience.note}</>}
                          {computerScience.url && !computerScience.language && (
                            <> · The checked page does not state the teaching language; see the country rule below.</>
                          )}
                        </dd>
                      </div>
                    )}
                    {admissions.fields.map((item) => (
                      <div key={item.field}>
                        <dt>
                          {item.label}
                          {item.scope === "country" && (
                            <span className={styles.scope}>Country rule</span>
                          )}
                        </dt>
                        <dd>{item.text}</dd>
                      </div>
                    ))}
                  </dl>

                  {admissions.missing.length > 0 && (
                    <p className={styles.missing}>
                      Not checked yet: {admissions.missing.join(", ").toLowerCase()}.
                      See the university&apos;s own pages.
                    </p>
                  )}
                  {admissions.notes && <p className={styles.note}>{admissions.notes}</p>}

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

                  <ul className={styles.sources}>
                    {admissions.sources.map((source) => (
                      <li key={source.url}>
                        <a href={source.url} target="_blank" rel="noreferrer">
                          {source.title}
                        </a>
                        <span> · checked {formatPlanDate(source.checkedAt)}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </details>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
