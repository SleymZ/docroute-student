"use client";

import { useEffect, useState } from "react";

import styles from "@/app/explore/top/TopUniversities.module.css";

function todayIso() {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

function daysUntil(from: string, to: string) {
  return Math.round((Date.parse(`${to}T00:00:00Z`) - Date.parse(`${from}T00:00:00Z`)) / 86_400_000);
}

/** "Closed", "Today" or "N days left", worked out in the visitor's browser
 *  so a static page never shows a stale status. */
export function ApplyByStatus({ date, pastCycle }: { date: string; pastCycle: boolean }) {
  const [today, setToday] = useState<string | null>(null);
  useEffect(() => setToday(todayIso()), []);
  if (!today) return null;

  const days = daysUntil(today, date);
  if (days < 0) {
    return (
      <span className={styles.applyStatus} data-tone="closed">
        {pastCycle ? "Passed, new dates expected" : "Closed"}
      </span>
    );
  }
  if (days === 0) {
    return (
      <span className={styles.applyStatus} data-tone="soon">
        Today
      </span>
    );
  }
  return (
    <span className={styles.applyStatus} data-tone={days <= 45 ? "soon" : "open"}>
      {days === 1 ? "1 day left" : `${days} days left`}
    </span>
  );
}
