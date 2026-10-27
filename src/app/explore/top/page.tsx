import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Info, Trophy } from "lucide-react";

import { Header } from "@/components/Header";
import { TopUniversitiesList } from "@/components/TopUniversitiesList";
import {
  topCountryGuides,
  topRankingSource,
  topUniversities,
} from "@/data/top-universities";
import { formatPlanDate } from "@/lib/residence/deadlines";
import { resolveTopAdmissions } from "@/lib/top-universities";

import styles from "./TopUniversities.module.css";

export const metadata: Metadata = {
  title: "Top 100 universities in Europe",
  description:
    "Europe's 100 universities with the most highly cited research (CWTS Leiden Ranking Open Edition 2025), with official bachelor's admission facts for non-EU applicants.",
  alternates: { canonical: "/explore/top" },
};

export default function TopUniversitiesPage() {
  const entries = topUniversities.map((university) => ({
    university,
    admissions: resolveTopAdmissions(university),
  }));
  const countries = [...new Set(topUniversities.map((item) => item.country))]
    .sort((a, b) => a.localeCompare(b, "en"));
  const checked = formatPlanDate(topRankingSource.checkedAt);

  return (
    <main>
      <Header />

      <div className={`page-container ${styles.page}`}>
        <Link href="/explore" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" />
          Explore
        </Link>

        <header className={styles.hero}>
          <div className={styles.heroCopy}>
            <p className={styles.kicker}>
              <Trophy size={15} aria-hidden="true" />
              TOP 100 / EUROPE
            </p>
            <h1>
              Europe&apos;s top 100 universities, <span>with what it takes to get in.</span>
            </h1>
            <p className={styles.lead}>
              Ranked by the number of research papers among the 10% most cited
              in their field ({topRankingSource.title}, {topRankingSource.period}).
              For each university we list how a non-EU applicant applies to a
              bachelor&apos;s programme, the deadline, school certificate, language
              and tuition, each linked to the official page and checked on{" "}
              {checked}.
            </p>
          </div>

          <dl className={styles.stats}>
            <div>
              <dt>universities</dt>
              <dd>{topUniversities.length}</dd>
            </div>
            <div>
              <dt>countries</dt>
              <dd>{countries.length}</dd>
            </div>
            <div>
              <dt>country guides</dt>
              <dd>{Object.keys(topCountryGuides).length}</dd>
            </div>
          </dl>
        </header>

        <aside className={styles.notice}>
          <Info size={17} aria-hidden="true" />
          <p>
            This is reference information, not a verified DocRoute route:
            requirements differ by programme, and many universities have not
            published 2027/28 rules yet. When a page describes another year,
            the card says so. Always check the official page before applying.
          </p>
        </aside>

        <TopUniversitiesList entries={entries} countries={countries} />

        <section className={styles.method} aria-labelledby="top-method">
          <h2 id="top-method">How this list is made</h2>
          <p>
            Order: {topRankingSource.indicator} — the number of a university&apos;s
            publications in {topRankingSource.period} that belong to the 10%
            most cited in their field ({topRankingSource.counting}), region{" "}
            {topRankingSource.region}. It measures research impact, not teaching
            quality or how hard admission is. Data from the{" "}
            <a href={topRankingSource.url} target="_blank" rel="noreferrer">
              {topRankingSource.title}
            </a>{" "}
            by {topRankingSource.publisher}, released under{" "}
            <a href={topRankingSource.dataUrl} target="_blank" rel="noreferrer">
              {topRankingSource.license}
            </a>
            . The 2026 edition is due on{" "}
            {formatPlanDate(topRankingSource.nextEdition)}; the list will be
            updated then.
          </p>
          <p>
            Admission facts are for a citizen of a non-EU country applying to a
            first bachelor&apos;s degree. A line marked &ldquo;Country rule&rdquo;
            is the national procedure from an official national source; other
            lines come from the university&apos;s own pages.
          </p>
        </section>
      </div>
    </main>
  );
}
