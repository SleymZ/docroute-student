import type { Metadata } from "next";
import { Fragment } from "react";
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
    // "study" only with checked programmes. A checked student residence
    // route (visa and permit) without them says so, so a country with no
    // verified programme (Austria) does not read as a verified study route.
    const studyLabel =
      study.verified.length > 0 ? "study" : study.residence === "verified" ? "student residence" : null;
    return { country, study, verified: [...(studyLabel ? [studyLabel] : []), ...verifiedPurposes] };
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
                    <CheckCircle2 size={13} aria-hidden="true" />
                    {/* One text run for the badge's flex layout; each label is
                        its own text so it is translated. */}
                    <span>
                      <span>Verified:</span>{" "}
                      {verified.map((label, index) => (
                        <Fragment key={label}>
                          {index > 0 ? ", " : null}
                          <span>{label}</span>
                        </Fragment>
                      ))}
                    </span>
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
