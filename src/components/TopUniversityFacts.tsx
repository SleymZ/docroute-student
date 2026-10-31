import { ExternalLink } from "lucide-react";

import { formatPlanDate } from "@/lib/residence/deadlines";
import type { resolveTopAdmissions } from "@/lib/top-universities";
import type { TopComputerScience } from "@/types/top-universities";

import styles from "@/app/explore/top/TopUniversities.module.css";

// The facts of one Top 100 university. Shared by the Top 100 list and the
// university's own page so both always show the same text and sources.
export function TopUniversityFacts({
  admissions,
  computerScience,
}: {
  admissions: ReturnType<typeof resolveTopAdmissions>;
  computerScience?: TopComputerScience;
}) {
  return (
    <>
      {admissions.intake && (
        <p className={styles.intake}>Source describes: {admissions.intake}</p>
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
    </>
  );
}

export function TopUniversitySources({
  sources,
}: {
  sources: ReturnType<typeof resolveTopAdmissions>["sources"];
}) {
  return (
    <ul className={styles.sources}>
      {sources.map((source) => (
        <li key={source.url}>
          <a href={source.url} target="_blank" rel="noreferrer">
            {source.title}
          </a>
          <span> · checked {formatPlanDate(source.checkedAt)}</span>
        </li>
      ))}
    </ul>
  );
}
