import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ArrowUpRight, CalendarClock, Info, ShieldCheck } from "lucide-react";

import { Header } from "@/components/Header";
import { czechiaResidenceRules } from "@/data/czechia-residence";
import { slovakiaResidenceRules } from "@/data/slovakia-residence";
import { verifiedPrograms } from "@/data/verified-programs";
import { LOCALE_TAGS } from "@/i18n/config";
import { getLocale } from "@/i18n/server";
import { getAdmissionDate } from "@/lib/admission-date";
import {
  DEADLINE_FIELDS,
  filterDeadlines,
  monthKey,
  upcomingFacultyDeadlines,
  type FacultyDeadline,
} from "@/lib/deadline-list";
import { flagSrc } from "@/lib/flags";

import styles from "./Deadlines.module.css";

export const metadata: Metadata = {
  title: "University application deadlines 2027/28 in Slovakia and Czechia",
  description:
    "Verified 2027/28 application deadlines for bachelor's and long-cycle programmes in Slovakia and Czechia (computer science, medicine, law, economics), with days left, fees and the official page for each faculty.",
  alternates: { canonical: "/deadlines" },
};

const COUNTRY_NAMES: Record<string, string> = { SK: "Slovakia", CZ: "Czechia" };
const FIELD_SLUGS: Record<string, (typeof DEADLINE_FIELDS)[number]> = {
  cs: "Computer Science",
  medicine: "Medicine",
  law: "Law",
  economics: "Economics & Business",
};

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

function one(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function filterHref(country: string | null, field: string | null) {
  const params = new URLSearchParams();
  if (country) params.set("country", country.toLowerCase());
  if (field) params.set("field", field);
  const query = params.toString();
  return query ? `/deadlines?${query}` : "/deadlines";
}

function DaysLeft({ days }: { days: number }) {
  const tone = days <= 30 ? styles.soon : days <= 90 ? styles.near : styles.ok;
  if (days === 0) return <span className={`${styles.days} ${styles.soon}`}>Last day today</span>;
  if (days === 1) return <span className={`${styles.days} ${styles.soon}`}>1 day left</span>;
  return <span className={`${styles.days} ${tone}`}>{days} days left</span>;
}

function Row({ row, dayLabel, checkedLabel }: { row: FacultyDeadline; dayLabel: string; checkedLabel: string }) {
  return (
    <li className={styles.row}>
      <div className={styles.when}>
        <strong>{dayLabel}</strong>
        <DaysLeft days={row.daysLeft} />
      </div>
      <div className={styles.what}>
        <p className={styles.place}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={flagSrc(row.countryCode)} alt="" width={18} height={13} />
          <span>{COUNTRY_NAMES[row.countryCode]} · {row.city}</span>
        </p>
        <h3>
          <Link href={`/universities/${encodeURIComponent(row.universityId)}`}>{row.universityName}</Link>
        </h3>
        <p className={styles.faculty}>{row.faculty}</p>
        <p className={styles.programmes}>{row.programmes.join(" · ")}</p>
        <p className={styles.meta}>
          <span>{row.category}</span>
          <span>Taught in {row.languages.join(", ")}</span>
          {row.fee ? <span>Application fee: {row.fee}</span> : null}
          {row.laterRound ? <span>Later round</span> : null}
        </p>
      </div>
      <div className={styles.actions}>
        <a href={row.applicationUrl} target="_blank" rel="noopener noreferrer" className={styles.official}>
          Official page <ArrowUpRight size={14} aria-hidden="true" />
        </a>
        <span className={styles.checked}>
          <ShieldCheck size={13} aria-hidden="true" /> Checked {checkedLabel}
        </span>
      </div>
    </li>
  );
}

export default async function DeadlinesPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const countryParam = one(query.country)?.toUpperCase() ?? null;
  const country = countryParam && COUNTRY_NAMES[countryParam] ? countryParam : null;
  const fieldParam = one(query.field) ?? null;
  const field = fieldParam && FIELD_SLUGS[fieldParam] ? fieldParam : null;

  const locale = await getLocale();
  // English dates read "21 Feb", like the rest of the site.
  const tag = locale === "en" ? "en-GB" : LOCALE_TAGS[locale];
  const today = getAdmissionDate();
  const all = upcomingFacultyDeadlines(verifiedPrograms, today);
  const rows = filterDeadlines(all, country, field ? FIELD_SLUGS[field] : null);
  const programmeCount = all.reduce((sum, row) => sum + row.programmes.length, 0);

  const dateOf = (iso: string, options: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(tag, { timeZone: "UTC", ...options }).format(new Date(`${iso}T00:00:00Z`));
  const months = [...new Set(rows.map((row) => monthKey(row.deadline)))];

  return (
    <main>
      <Header />
      <div className={`page-container ${styles.page}`}>
        <header className={styles.hero}>
          <div>
            <p className={styles.kicker}>
              <CalendarClock size={15} aria-hidden="true" />
              DEADLINES / 2027–28
            </p>
            <h1>
              University application deadlines for 2027/28, <span>checked on official pages.</span>
            </h1>
            <p className={styles.lead}>
              Bachelor&apos;s and long-cycle programmes in Slovakia and Czechia whose
              2027/28 admission rules we read line by line. Each date links to the
              faculty&apos;s own page and shows when we checked it. The university
              always decides; open its page before you apply.
            </p>
          </div>
          {all.length > 0 ? (
            <dl className={styles.stats}>
              <div>
                <dt>verified programmes</dt>
                <dd>{programmeCount}</dd>
              </div>
              <div>
                <dt>faculties</dt>
                <dd>{all.length}</dd>
              </div>
              <div>
                <dt>first deadline</dt>
                <dd>{dateOf(all[0].deadline, { day: "numeric", month: "short" })}</dd>
              </div>
            </dl>
          ) : null}
        </header>

        <aside className={styles.notice}>
          <Info size={16} aria-hidden="true" />
          <p>
            <strong>Not an EU, EEA or Swiss citizen?</strong> After the admission
            letter you also need a residence permit. In Slovakia the police may take
            up to {slovakiaResidenceRules.processingTimeDays} days to decide, in
            Czechia up to {czechiaResidenceRules.study.processingDays} days, so plan
            it as soon as you are admitted.{" "}
            <Link href="/countries/sk">Slovakia</Link> · <Link href="/countries/cz">Czechia</Link>
          </p>
        </aside>

        <nav className={styles.filters} aria-label="Filter deadlines">
          <div>
            <Link href={filterHref(null, field)} aria-current={!country ? "page" : undefined}>All countries</Link>
            {Object.entries(COUNTRY_NAMES).map(([code, name]) => (
              <Link key={code} href={filterHref(code, field)} aria-current={country === code ? "page" : undefined}>
                {name}
              </Link>
            ))}
          </div>
          <div>
            <Link href={filterHref(country, null)} aria-current={!field ? "page" : undefined}>All fields</Link>
            {Object.entries(FIELD_SLUGS).map(([slug, name]) => (
              <Link key={slug} href={filterHref(country, slug)} aria-current={field === slug ? "page" : undefined}>
                {name}
              </Link>
            ))}
          </div>
        </nav>

        {rows.length === 0 ? (
          <p className={styles.empty}>No open deadlines for this filter. Try another country or field.</p>
        ) : (
          months.map((month) => (
            <section key={month} className={styles.month}>
              <h2>{dateOf(`${month}-01`, { month: "long", year: "numeric" })}</h2>
              <ul>
                {rows
                  .filter((row) => monthKey(row.deadline) === month)
                  .map((row) => (
                    <Row
                      key={row.key}
                      row={row}
                      dayLabel={dateOf(row.deadline, { day: "numeric", month: "short" })}
                      checkedLabel={dateOf(row.checkedAt, { day: "numeric", month: "short", year: "numeric" })}
                    />
                  ))}
              </ul>
            </section>
          ))
        )}

        <section className={styles.cta}>
          <div>
            <h2>Which of these fit your school certificate and languages?</h2>
            <p>
              Your route checks your profile against these exact rules, then lists the
              documents and residence steps in order. Free account.
            </p>
          </div>
          <Link href="/home#route-builder" className={`primary-button ${styles.ctaButton}`}>
            Build my route <ArrowRight size={16} aria-hidden="true" />
          </Link>
        </section>
      </div>
    </main>
  );
}
