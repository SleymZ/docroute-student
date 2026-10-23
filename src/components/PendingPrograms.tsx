import Link from "next/link";

import { ArrowRight, Clock3, ExternalLink } from "lucide-react";

import type { PendingProgramGroup } from "@/data/pending-programs";
import { formatPlanDate } from "@/lib/residence/deadlines";
import { formatDegreeLevel } from "@/lib/profile-options";

import styles from "./PendingPrograms.module.css";

type PendingProgramsProps = {
  groups: readonly PendingProgramGroup[];
  // Results pages link each group to its university page; the university
  // page itself shows the group without a link.
  universityHref?: (group: PendingProgramGroup) => string;
  heading?: string;
};

export function PendingPrograms({
  groups,
  universityHref,
  heading = "Coming soon",
}: PendingProgramsProps) {
  if (groups.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label={heading}>
      <div className={styles.sectionHeading}>
        <span className={styles.icon}>
          <Clock3 size={18} aria-hidden="true" />
        </span>
        <div>
          <p className={styles.eyebrow}>{heading.toUpperCase()}</p>
          <p className={styles.lead}>
            Listed so you can plan ahead. No personalised route, checklist or
            match is shown until the approved rules for this intake are
            published and checked.
          </p>
        </div>
      </div>

      {groups.map((group) => (
        <article key={group.id} className={styles.card}>
          <div className={styles.cardHeading}>
            <div>
              <strong>{group.universityName}</strong>
              <span>
                {group.faculty} · {group.city}
              </span>
            </div>
            <span className={styles.badge}>Rules awaiting approval</span>
          </div>

          <p className={styles.scope}>
            {formatDegreeLevel(group.degreeLevel)} · {group.category} ·{" "}
            {group.intake}
          </p>

          <ul className={styles.programs}>
            {group.programs.map((program) => (
              <li key={program.localProgramName}>
                <strong>{program.programName}</strong>
                <span>{program.localProgramName}</span>
              </li>
            ))}
          </ul>

          <p className={styles.note}>{group.statusNote}</p>

          <ul className={styles.sources}>
            {group.sources.map((source) => (
              <li key={source.id}>
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
                <small>checked {formatPlanDate(source.checkedAt)}</small>
              </li>
            ))}
          </ul>

          {universityHref && (
            <Link href={universityHref(group)} className={styles.link}>
              View university
              <ArrowRight size={14} aria-hidden="true" />
            </Link>
          )}
        </article>
      ))}
    </section>
  );
}
