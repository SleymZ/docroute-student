import { OctagonAlert, TriangleAlert } from "lucide-react";

import { isExistingResidentStatus } from "@/data/citizenship-notes";
import { passportWarnings } from "@/data/russia-belarus";

import styles from "./PassportWarning.module.css";

/**
 * Red warning when the destination refuses or limits applications from
 * this passport (official sources only, russia-belarus.ts). "Blocked" says
 * the move is not possible except for the listed groups; "restricted" says
 * what solves it. Renders nothing for every other passport.
 */
export function PassportWarning({
  citizenship,
  destination,
  residenceStatus,
}: {
  citizenship: string | null | undefined;
  destination: string;
  /** Current residence status, when the screen asks for it: someone who
   *  already lives in the destination does not get embassy barriers. */
  residenceStatus?: string | null;
}) {
  const existingResident = isExistingResidentStatus(residenceStatus);
  const warnings = citizenship ? passportWarnings(citizenship, destination, { existingResident }) : [];
  if (!warnings.length) return null;

  return (
    <div className={styles.stack}>
      {warnings.map((warning) => {
        const blocked = warning.severity === "blocked";
        const Icon = blocked ? OctagonAlert : TriangleAlert;
        return (
          <section key={warning.id} className={styles.warning} data-severity={warning.severity} role="note">
            <p className={styles.kicker}>
              <Icon size={16} strokeWidth={2.2} aria-hidden="true" />
              {blocked ? "Moving is currently not possible with this passport" : "Restriction for this passport"}
            </p>
            <h3 className={styles.title}>{warning.title}</h3>
            <p className={styles.text}>{warning.description}</p>
            {warning.solution && (
              <p className={styles.solution}>
                <strong>{blocked ? "Exceptions:" : "Solution:"}</strong> {warning.solution}
              </p>
            )}
            <p className={styles.sources}>
              Official source:{" "}
              {warning.sources.map((source, index) => {
                // Two pages of one publisher: number them instead of
                // repeating the same name.
                const same = warning.sources.filter((item) => item.publisher === source.publisher);
                const label = same.length > 1 ? `${source.publisher} (${same.indexOf(source) + 1})` : source.publisher;
                return (
                  <span key={source.id}>
                    {index > 0 && " · "}
                    <a href={source.url} target="_blank" rel="noreferrer" title={source.title}>
                      {label}
                    </a>
                  </span>
                );
              })}
            </p>
          </section>
        );
      })}
    </div>
  );
}
