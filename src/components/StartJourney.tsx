import Link from "next/link";
import { ArrowDown, FileCheck2, MapPin, ShieldCheck } from "lucide-react";

import styles from "./StartJourney.module.css";

const steps = [
  {
    icon: MapPin,
    title: "Choose where and why",
    text: "Country, purpose and your passport.",
  },
  {
    icon: FileCheck2,
    title: "Get documents and dates",
    text: "What to prepare and by when.",
  },
  {
    icon: ShieldCheck,
    title: "Follow it to your permit",
    text: "Every step links to its official source.",
  },
];

// First screen of the home page: the slogan and one button that scrolls to
// the route builder below. Nothing is stored in the browser.
export function StartJourney() {
  return (
    <section className={styles.intro} aria-labelledby="start-heading">
      <svg
        className={styles.trail}
        viewBox="0 0 1200 220"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <path d="M-20 170 C 220 40, 420 210, 620 110 S 1010 30, 1220 90" />
        <circle cx="210" cy="92" r="7" />
        <circle cx="620" cy="110" r="7" />
        <circle cx="1010" cy="58" r="7" />
      </svg>

      <div className={styles.copy}>
        <p className="eyebrow">DocRoute · Study, work, family, business</p>

        <h1 id="start-heading" className={styles.title}>
          Start your journey
        </h1>

        <p className={styles.slogan}>
          Your move to Europe, <span>one route.</span>
        </p>

        <p className={styles.lead}>
          University rules, residence law and deadlines usually live on a dozen
          different sites. DocRoute puts them into one personal route, from
          the application to your residence permit.
        </p>

        <div className={styles.actions}>
          <Link href="#route-builder" className="primary-button">
            Start your journey
            <ArrowDown size={18} aria-hidden="true" />
          </Link>
          <Link href="/how-it-works" className="secondary-button">
            How it works
          </Link>
        </div>
      </div>

      <ol className={styles.steps}>
        {steps.map(({ icon: Icon, title, text }, index) => (
          <li key={title}>
            <span className={styles.stepIcon}>
              <Icon size={18} aria-hidden="true" />
            </span>
            <span>
              <small>Step {index + 1}</small>
              <strong>{title}</strong>
              <span>{text}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
