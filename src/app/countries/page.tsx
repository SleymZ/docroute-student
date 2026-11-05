import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";

import { Header } from "@/components/Header";
import storyStyles from "@/components/Stories.module.css";
import { countryHref, countryPages, countryStudy, purposeRoute } from "@/lib/countries";

import styles from "./Countries.module.css";

export const metadata: Metadata = {
  title: "Countries",
  description: "Every EU country and Switzerland: universities and routes for study, work, family and business.",
  alternates: { canonical: "/countries" },
};

export default function CountriesPage() {
  const rows = countryPages.map((country) => {
    const study = countryStudy(country.code);
    const verifiedPurposes = (["work", "family", "business"] as const).filter(
      (purpose) => purposeRoute(country.code, purpose).coverage === "verified",
    );
    const verifiedStudy = study.verified.length > 0;
    return { country, study, verified: [...(verifiedStudy ? ["study"] : []), ...verifiedPurposes] };
  });

  return (
    <main>
      <Header />
      <div className={storyStyles.page}>
        <header className={storyStyles.hero}>
          <div>
            <p className={storyStyles.eyebrow}>COUNTRIES</p>
            <h1>
              Pick a country, <span>see your routes.</span>
            </h1>
            <p className={storyStyles.lead}>
              All 27 EU countries and Switzerland. Each page shows universities and the routes for study, work, family
              and business, and what your passport changes.
            </p>
          </div>
        </header>
        <ul className={styles.grid}>
          {rows.map(({ country, study, verified }) => (
            <li key={country.code}>
              <Link href={countryHref(country.code)} className={styles.card}>
                <strong>{country.name}</strong>
                <span className={styles.muted}>
                  {study.universities} universities{study.top100.length ? ` · ${study.top100.length} in top 100` : ""}
                </span>
                {verified.length > 0 ? (
                  <span className={styles.badge} data-coverage="verified">
                    <CheckCircle2 size={13} aria-hidden="true" /> Verified: {verified.join(", ")}
                  </span>
                ) : (
                  <span className={styles.badge} data-coverage="links">
                    Official links
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
