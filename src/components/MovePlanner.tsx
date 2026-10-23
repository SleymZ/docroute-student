"use client";

import { useId } from "react";
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  CircleDashed,
  Clock3,
  Info,
} from "lucide-react";

import type { DeadlineTone, ResidenceDeadlinePlan } from "@/lib/residence/deadlines";

import styles from "./MovePlanner.module.css";

type MovePlannerProps = {
  moveDate: string;
  minDate: string;
  plan: ResidenceDeadlinePlan | null;
  description?: string;
  dateLabel?: string;
  // Explains why dates cannot be planned (EU citizen, Slovak citizen,
  // contradictory profile); null when the third-country route applies.
  unavailableReason: string | null;
  onMoveDateChange: (value: string) => void;
};

const toneIcon: Record<DeadlineTone, typeof Clock3> = {
  done: CheckCircle2,
  ok: CalendarClock,
  soon: Clock3,
  late: AlertTriangle,
  info: Info,
};

const toneLabel: Record<DeadlineTone, string> = {
  done: "Done",
  ok: "Upcoming",
  soon: "Within 30 days",
  late: "Date has passed",
  info: "After arrival",
};

export function MovePlanner({
  moveDate,
  minDate,
  plan,
  unavailableReason,
  onMoveDateChange,
  description = "Enter the date you need to be living in Slovakia, for example the start of studies. DocRoute calculates when each residence step has to be done.",
  dateLabel = "Move date",
}: MovePlannerProps) {
  const inputId = useId();

  return (
    <section className={styles.planner} aria-labelledby={`${inputId}-title`}>
      <header className={styles.header}>
        <div>
          <p className={styles.eyebrow}>DEADLINE PLANNER</p>
          <h2 id={`${inputId}-title`}>Plan backwards from your move date</h2>
          <p>{description}</p>
        </div>

        <label className={styles.dateField} htmlFor={inputId}>
          <span>{dateLabel}</span>
          <input
            id={inputId}
            type="date"
            value={moveDate}
            min={minDate}
            disabled={Boolean(unavailableReason)}
            onChange={(event) => onMoveDateChange(event.target.value)}
          />
        </label>
      </header>

      {unavailableReason ? (
        <p className={styles.empty}>
          <CircleDashed size={16} aria-hidden="true" />
          {unavailableReason}
        </p>
      ) : !plan ? (
        <p className={styles.empty}>
          <CalendarClock size={16} aria-hidden="true" />
          {moveDate
            ? "Choose a date after today to see your deadlines."
            : "Choose a move date to see your deadlines."}
        </p>
      ) : (
        <>
          {plan.warnings.length > 0 && (
            <ul className={styles.warnings} role="status">
              {plan.warnings.map((warning) => (
                <li key={warning}>
                  <AlertTriangle size={16} aria-hidden="true" />
                  <span>{warning}</span>
                </li>
              ))}
            </ul>
          )}

          <ol className={styles.items}>
            {plan.items.map((item) => {
              const Icon = toneIcon[item.tone];
              return (
                <li key={item.id} data-tone={item.tone}>
                  <span className={styles.icon}>
                    <Icon size={16} aria-hidden="true" />
                  </span>
                  <div className={styles.copy}>
                    <strong>{item.title}</strong>
                    <p>{item.detail}</p>
                  </div>
                  <div className={styles.when}>
                    <strong>{item.dateLabel}</strong>
                    <small>{toneLabel[item.tone]}</small>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className={styles.footnote}>
            Dates are calculated from the published maximum periods. The
            authority can decide sooner. Slovak public holidays are not
            counted.
          </p>
        </>
      )}
    </section>
  );
}
