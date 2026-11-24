import Link from "next/link";
import { ArrowRight, BadgeCheck, Code2, GraduationCap, Scale, Stethoscope, TrendingUp } from "lucide-react";

import { flagSrc } from "@/lib/flags";

import { recentlyVerifiedCards } from "@/lib/recently-verified";

import styles from "./VerifiedTicker.module.css";

// English date inside the sentence: the translation engine localises it
// together with the rest of the line.
function day(iso: string) {
  return new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "long" }).format(
    new Date(`${iso}T00:00:00Z`),
  );
}

// The card's picture: the field's icon on its own colour, with the flag.
const fields: Record<string, { icon: typeof Stethoscope; tone: string }> = {
  Medicine: { icon: Stethoscope, tone: "medicine" },
  Law: { icon: Scale, tone: "law" },
  "Economics & Business": { icon: TrendingUp, tone: "business" },
  "Computer Science": { icon: Code2, tone: "computing" },
};

/** A strip of newly verified programmes (owner request 2026-11-24), on the
 *  entry page and /home. Each card opens the programme on its university
 *  page, which guests may see. Scrolls by itself unless the visitor asked
 *  for less motion; stops on hover and focus. */
export function VerifiedTicker({ today, className }: { today: string; className?: string }) {
  const cards = recentlyVerifiedCards(today);
  if (cards.length === 0) return null;
  const list = (copy: boolean) => (
    <ul className={styles.list} aria-hidden={copy ? true : undefined}>
      {cards.map((card) => (
        <li key={card.id}>
          <Link href={card.href} className={styles.card} tabIndex={copy ? -1 : undefined}>
            <span className={styles.pic} data-tone={(fields[card.category]?.tone) ?? "other"} aria-hidden="true">
              {(() => {
                const Icon = fields[card.category]?.icon ?? GraduationCap;
                return <Icon className={styles.picIcon} size={28} strokeWidth={1.8} />;
              })()}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img className={styles.flag} src={flagSrc(card.countryCode)} alt="" width={20} height={20} />
            </span>
            <span className={styles.what}>
              <span className={styles.top}>
                <span className={styles.new}>New</span>
                <strong>{card.category}</strong>
                {card.english ? <span className={styles.lang}>In English</span> : null}
                {card.languages.length > 1 ? (
                  <span className={styles.lang}>{card.languages.join(" · ")}</span>
                ) : null}
              </span>
              <span className={styles.where}>
                {card.universityName} · {card.city}
              </span>
              {card.deadline ? <span className={styles.by}>Apply by {day(card.deadline)}</span> : null}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
  return (
    <section className={`${styles.ticker} ${className ?? ""}`} aria-label="Newly verified programmes">
      <p className={styles.label}>
        <BadgeCheck size={16} aria-hidden="true" />
        <span>Newly verified</span>
      </p>
      <div className={styles.track}>
        <div className={styles.belt}>
          {list(false)}
          {list(true)}
        </div>
      </div>
      <Link href="/deadlines" className={styles.all}>
        <span>All programmes</span>
        <ArrowRight size={14} aria-hidden="true" />
      </Link>
    </section>
  );
}
