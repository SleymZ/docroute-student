import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft, ArrowRight, Briefcase, Building2, CheckCircle2, GraduationCap, Link2, Users } from "lucide-react";

import { Header } from "@/components/Header";
import { PassportTrackBlock } from "@/components/PassportTrackBlock";
import storyStyles from "@/components/Stories.module.css";
import {
  countryPages,
  countryStudy,
  findCountryPage,
  purposeRoute,
  type Coverage,
  type CountryPurpose,
} from "@/lib/countries";

import styles from "../Countries.module.css";

type Props = { params: Promise<{ code: string }> };

export function generateStaticParams() {
  return countryPages.map((item) => ({ code: item.code.toLowerCase() }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code } = await params;
  const country = findCountryPage(code);
  if (!country) return {};
  return {
    title: `Moving to ${country.name}`,
    description: `Study, work, family and business routes for ${country.name}: universities, verified checklists or official links, and what your passport changes.`,
    alternates: { canonical: `/countries/${country.code.toLowerCase()}` },
  };
}

const purposeInfo: Record<CountryPurpose, { title: string; text: string; icon: typeof Briefcase }> = {
  work: { title: "Work", text: "Job offer, work permits, EU Blue Card and registration.", icon: Briefcase },
  family: { title: "Family", text: "Joining a spouse, parent or child who lives there.", icon: Users },
  business: { title: "Business", text: "Self-employment, a company or a start-up.", icon: Building2 },
};

function CoverageBadge({ coverage }: { coverage: Coverage }) {
  return coverage === "verified" ? (
    <span className={styles.badge} data-coverage="verified">
      <CheckCircle2 size={13} aria-hidden="true" /> Verified steps
    </span>
  ) : (
    <span className={styles.badge} data-coverage="links">
      <Link2 size={13} aria-hidden="true" /> Official links
    </span>
  );
}

export default async function CountryPage({ params }: Props) {
  const { code } = await params;
  const country = findCountryPage(code);
  if (!country) notFound();
  const study = countryStudy(country.code);

  return (
    <main>
      <Header />
      <div className={storyStyles.page}>
        <Link href="/countries" className={styles.back}>
          <ArrowLeft size={15} aria-hidden="true" /> All countries
        </Link>
        <header className={storyStyles.hero}>
          <div>
            <p className={storyStyles.eyebrow}>COUNTRY GUIDE</p>
            <h1>
              Moving to <span>{country.name}</span>
            </h1>
            <p className={storyStyles.lead}>
              Everything DocRoute has for {country.name}: universities, and routes for work, family and business.
              “Verified steps” were checked line by line on official pages; “Official links” is a checklist that sends
              you to the official page for each step, without amounts or deadlines.
            </p>
          </div>
        </header>

        <section className={styles.block} aria-labelledby="study-title">
          <div className={styles.blockHead}>
            <GraduationCap size={20} aria-hidden="true" />
            <h2 id="study-title">Study</h2>
            <CoverageBadge coverage={study.verified.length ? "verified" : "official-links"} />
          </div>
          <div className={styles.stats}>
            <div>
              <strong>{study.universities}</strong>
              <span>universities in the directory</span>
            </div>
            <div>
              <strong>{study.top100.length}</strong>
              <span>in Europe&apos;s top 100</span>
            </div>
            <div>
              <strong>{study.verified.reduce((sum, item) => sum + item.programs, 0)}</strong>
              <span>verified programmes</span>
            </div>
            <div>
              <strong>{study.comingSoon}</strong>
              <span>faculties coming soon</span>
            </div>
          </div>

          {study.verified.length > 0 && (
            <ul className={styles.list}>
              {study.verified.map((item) => (
                <li key={`${item.universityName}-${item.faculty}-${item.category}`}>
                  <span>
                    <strong>{item.universityName}</strong> · {item.faculty}
                  </span>
                  <span className={styles.muted}>
                    {item.category} · {item.programs} {item.programs === 1 ? "programme" : "programmes"}
                  </span>
                </li>
              ))}
            </ul>
          )}

          {study.top100.length > 0 && (
            <p className={styles.inline}>
              Top 100:{" "}
              {study.top100.map((item, index) => (
                <span key={item.rank}>
                  {index > 0 && ", "}
                  {item.catalogId ? <Link href={`/universities/${item.catalogId}`}>{item.name}</Link> : item.name} (#{item.rank})
                </span>
              ))}
            </p>
          )}

          <p className={styles.muted}>
            Student residence:{" "}
            {study.residence === "verified"
              ? "verified steps in the study route (first arrival, non-EU students)."
              : "official links in the study route."}
          </p>

          <div className={styles.actions}>
            {study.universities > 0 && (
              <Link href={`/explore/universities?country=${country.code}`} className={storyStyles.secondary}>
                Universities in {country.name}
              </Link>
            )}
            {study.verifiedCategories.map((category) => (
              <Link
                key={category}
                href={`/route/profile?${new URLSearchParams({ country: country.code, program: category }).toString()}`}
                className={storyStyles.primary}
              >
                {category} route <ArrowRight size={15} aria-hidden="true" />
              </Link>
            ))}
          </div>
        </section>

        <div className={styles.purposes}>
          {(["work", "family", "business"] as const).map((purpose) => {
            const route = purposeRoute(country.code, purpose);
            const info = purposeInfo[purpose];
            const Icon = info.icon;
            return (
              <section key={purpose} className={styles.block} aria-labelledby={`${purpose}-title`}>
                <div className={styles.blockHead}>
                  <Icon size={20} aria-hidden="true" />
                  <h2 id={`${purpose}-title`}>{info.title}</h2>
                  <CoverageBadge coverage={route.coverage} />
                </div>
                <p className={styles.muted}>{info.text}</p>
                <Link href={route.href} className={storyStyles.secondary}>
                  Open the {info.title.toLowerCase()} route <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </section>
            );
          })}
        </div>

        <Suspense fallback={null}>
          <PassportTrackBlock code={country.code} name={country.name} />
        </Suspense>

        <p className={styles.note}>
          Routes need a free account. DocRoute is a preparation tool, not legal advice: the authorities and universities
          decide.
        </p>
      </div>
    </main>
  );
}
