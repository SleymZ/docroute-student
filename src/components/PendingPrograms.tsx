import Link from "next/link";

import { ArrowRight, Clock3, ExternalLink, History } from "lucide-react";

import {
  formatPendingDegree,
  isCurrentReference,
  pendingStatusLabel,
  type PendingProgramGroup,
} from "@/data/pending-programs";
import { formatPlanDate } from "@/lib/residence/deadlines";

import styles from "./PendingPrograms.module.css";

type PendingProgramsProps = {
  groups: readonly PendingProgramGroup[];
  // Results pages link each group to its university page; the university
  // page itself shows the group without a link.
  universityHref?: (group: PendingProgramGroup) => string;
  heading?: string;
  // Open the "last year's rules" block by default (the university page);
  // results pages keep it collapsed so the list stays short.
  referenceOpen?: boolean;
};

export function PendingPrograms({
  groups,
  universityHref,
  heading = "Coming soon",
  referenceOpen = false,
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
            published and checked. Where available, the faculty&apos;s
            approved rules (last year&apos;s, or this intake&apos;s if already
            published) are summarised for reference only.
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
            <span className={styles.badge}>
              {pendingStatusLabel(group.status)}
            </span>
          </div>

          <p className={styles.scope}>
            {formatPendingDegree(group.degreeLevel, group.category)} · {group.category} ·{" "}
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

          {group.referenceRules && (
            <details
              className={styles.previous}
              open={referenceOpen || undefined}
            >
              <summary>
                <History size={15} aria-hidden="true" />
                <span>
                  {isCurrentReference(group)
                    ? `Published rules (${group.referenceRules.intake}), for reference`
                    : `Last year's rules (${group.referenceRules.intake}), for orientation`}
                </span>
              </summary>
              <p className={styles.previousWarning} role="note">
                {isCurrentReference(group) ? (
                  <>
                    A short summary of the faculty&apos;s published rules for{" "}
                    {group.intake}. DocRoute has not built a personalised route
                    from them yet, so read the official document before you
                    apply.{" "}
                  </>
                ) : (
                  <>
                    These are <strong>not</strong> the rules for {group.intake}.
                    They often change little from year to year, but dates,
                    thresholds and fees can change. Check the {group.intake}{" "}
                    rules before you apply; DocRoute will replace this block
                    once they are approved and checked.{" "}
                  </>
                )}
                {group.referenceRules.approvedNote}
              </p>
              <dl className={styles.facts}>
                {group.referenceRules.facts.map((fact) => (
                  <div key={fact.label}>
                    <dt>{fact.label}</dt>
                    <dd>{fact.value}</dd>
                  </div>
                ))}
              </dl>
              <ul className={styles.programRules}>
                {group.referenceRules.programRules.map((item) => {
                  const program = group.programs.find(
                    (entry) => entry.localProgramName === item.localProgramName,
                  );
                  return (
                    <li key={item.localProgramName}>
                      <strong>
                        {program?.programName ?? item.localProgramName}
                      </strong>
                      <span>{item.rule}</span>
                    </li>
                  );
                })}
              </ul>
              <ul className={styles.sources}>
                {group.referenceRules.sources.map((source) => (
                  <li key={source.id}>
                    <a href={source.url} target="_blank" rel="noopener noreferrer">
                      {source.title}
                      <ExternalLink size={13} aria-hidden="true" />
                    </a>
                    <small>checked {formatPlanDate(source.checkedAt)}</small>
                  </li>
                ))}
              </ul>
            </details>
          )}

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
