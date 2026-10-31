import { ExternalLink } from "lucide-react";

import { formatPlanDate } from "@/lib/residence/deadlines";
import type { resolveTopAdmissions } from "@/lib/top-universities";
import type {
  TopComputerScience,
  TopFieldKey,
  TopFieldRequirements,
} from "@/types/top-universities";

import styles from "@/app/explore/top/TopUniversities.module.css";

const fieldLabels: { key: TopFieldKey; label: string }[] = [
  { key: "computer-science", label: "Computer science" },
  { key: "mathematics", label: "Mathematics" },
  { key: "medicine", label: "Medicine" },
  { key: "law", label: "Law" },
  { key: "economics", label: "Economics" },
];

// The facts of one Top 100 university. Shared by the Top 100 list and the
// university's own page so both always show the same text and sources.
export function TopUniversityFacts({
  admissions,
  computerScience,
  fields,
}: {
  admissions: ReturnType<typeof resolveTopAdmissions>;
  computerScience?: TopComputerScience;
  fields?: TopFieldRequirements;
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

      {fields && <TopFieldRequirementsList fields={fields} />}
    </>
  );
}

// Entry requirements by field, as each course page states them. Reference
// only: typical offers, not a guarantee and not a verified route.
function TopFieldRequirementsList({ fields }: { fields: TopFieldRequirements }) {
  const rows = fieldLabels.filter(({ key }) => fields[key]);
  if (rows.length === 0) return null;
  const missing = fieldLabels.filter(({ key }) => !fields[key]).map(({ label }) => label);
  const checked = rows
    .map(({ key }) => fields[key]!.checkedAt)
    .sort()
    .at(-1)!;

  return (
    <section className={styles.fieldBlock} aria-label="Entry requirements by field">
      <h3 className={styles.fieldTitle}>Entry requirements by field</h3>
      <p className={styles.fieldLead}>
        As published on each course page (typical offers, checked{" "}
        {formatPlanDate(checked)}). Grades are not converted between school
        systems; the university decides how it reads yours.
      </p>
      <dl className={styles.facts}>
        {rows.map(({ key, label }) => {
          const item = fields[key]!;
          return (
            <div key={key}>
              <dt>
                {label}
                {item.intake && <span className={styles.scope}>{item.intake}</span>}
              </dt>
              <dd>
                {item.url ? (
                  <a href={item.url} target="_blank" rel="noreferrer">
                    {item.programme ?? "Course page"}
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                ) : null}
                {item.requirements && <>{item.url ? " · " : ""}{item.requirements}</>}
                {item.note && <>{item.url || item.requirements ? " · " : ""}{item.note}</>}
              </dd>
            </div>
          );
        })}
      </dl>
      {missing.length > 0 && (
        <p className={styles.missing}>
          Not checked yet: {missing.join(", ").toLowerCase()}.
        </p>
      )}
    </section>
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
