import Link from "next/link";
import { BellRing, CalendarClock, FileImage, ListChecks, LockKeyhole, MapPinned, Sparkles } from "lucide-react";

import styles from "./Plus.module.css";

/**
 * A step the Free plan keeps closed. Nothing from the real step reaches the
 * page: no title, text, date or link, only grey bars, so neither a
 * screenshot nor the page's HTML gives the step away.
 */
export function LockedStep({ order, className, as: Tag = "li" }: { order: number; className?: string; as?: "li" | "article" }) {
  // Bar widths vary by position so a stage of locked steps does not look
  // like a copied block; they never depend on the hidden text.
  const widths = [
    ["62%", "92%", "48%"],
    ["54%", "86%", "70%"],
    ["70%", "78%", "40%"],
  ][order % 3];
  return (
    <Tag className={className ? `${className} ${styles.locked}` : styles.locked} data-locked="" data-print-hide="">
      <span className={styles.lockedMark} aria-hidden="true">
        <LockKeyhole size={13} />
      </span>
      <div className={styles.lockedBody}>
        <div className={styles.lockedBars} aria-hidden="true">
          <span style={{ width: widths[0] }} data-heading="" />
          <span style={{ width: widths[1] }} />
          <span style={{ width: widths[2] }} />
        </div>
        <Link href="/plus" className={styles.lockedLink}>
          <Sparkles size={12} aria-hidden="true" />
          <span>
            Step locked · open with <strong>Plus</strong>
          </span>
        </Link>
      </div>
    </Tag>
  );
}

/** Under a stage with locked steps on the Free plan. */
export function PlusMoreSteps({ hidden }: { hidden: number }) {
  if (hidden <= 0) return null;
  return (
    <Link href="/plus" className={styles.more} data-print-hide="">
      <LockKeyhole size={14} aria-hidden="true" />
      <span>
        {hidden} {hidden === 1 ? "step" : "steps"} in this stage locked · unlock with <strong>Plus</strong>
      </span>
    </Link>
  );
}

const featureText = {
  dates: {
    icon: CalendarClock,
    title: "Your dates are part of Plus",
    text: "Set your move or start date and get a date for every step. Email reminders are coming soon.",
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
      Email reminders for these dates are coming soon.
    </p>
  );
}

export const plusPerks = [
  { icon: ListChecks, text: "Every step of every stage, not only the key ones" },
  { icon: CalendarClock, text: "Your own move date and a date for every step" },
  { icon: BellRing, text: "Email reminders before each deadline (coming soon)" },
  { icon: MapPinned, text: "Your route saved in My route" },
  { icon: FileImage, text: "PDF and PNG of your route" },
] as const;
