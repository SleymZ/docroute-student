import Link from "next/link";
import { BellRing, CalendarClock, FileImage, ListChecks, LockKeyhole, MapPinned, Sparkles } from "lucide-react";

import styles from "./Plus.module.css";

/** After a shortened stage on the Free plan: how many steps Plus adds. */
export function PlusMoreSteps({ hidden }: { hidden: number }) {
  if (hidden <= 0) return null;
  return (
    <Link href="/plus" className={styles.more} data-print-hide="">
      <LockKeyhole size={14} aria-hidden="true" />
      <span>
        {hidden} more {hidden === 1 ? "step" : "steps"} in this stage with <strong>Plus</strong>
      </span>
    </Link>
  );
}

const featureText = {
  dates: {
    icon: CalendarClock,
    title: "Your dates are part of Plus",
    text: "Set your move or start date and get a date for every step, plus email reminders before each one.",
  },
  export: {
    icon: FileImage,
    title: "PDF and PNG with Plus",
    text: "Save the full route as a PDF or an image to keep offline or share.",
  },
  save: {
    icon: MapPinned,
    title: "Save it to My route with Plus",
    text: "Keep this route in your account, tick steps off and come back from any device.",
  },
} as const;

/** A locked Plus feature in place of the real control (Free plan). */
export function PlusFeature({ feature, compact = false }: { feature: keyof typeof featureText; compact?: boolean }) {
  const item = featureText[feature];
  const Icon = item.icon;
  return (
    <div className={styles.feature} data-compact={compact || undefined} data-print-hide="">
      <span className={styles.featureIcon} aria-hidden="true">
        <Icon size={17} />
      </span>
      <div>
        <strong>{item.title}</strong>
        {!compact && <p>{item.text}</p>}
        <Link href="/plus" className={styles.featureLink}>
          <Sparkles size={13} aria-hidden="true" />
          See Plus
        </Link>
      </div>
    </div>
  );
}

/** Small note for Plus members where email reminders will live. */
export function RemindersNote() {
  return (
    <p className={styles.reminders} data-print-hide="">
      <BellRing size={14} aria-hidden="true" />
      Email reminders for these dates arrive with the Plus launch.
    </p>
  );
}

export const plusPerks = [
  { icon: ListChecks, text: "The full checklist for every stage" },
  { icon: CalendarClock, text: "Your own move date and a date for every step" },
  { icon: BellRing, text: "Email reminders before each deadline" },
  { icon: MapPinned, text: "Your route saved in My route" },
  { icon: FileImage, text: "PDF and PNG of your route" },
] as const;
