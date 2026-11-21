import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

import styles from "./PhoneHero.module.css";

/** Phone only: the way into the country match for people who do not know
 *  the country yet, or move for work, family or business. */
export function PhoneMatchTeaser() {
  return (
    <Link href="/account/match" className={styles.teaser}>
      <span className={styles.teaserIcon}>
        <Compass size={22} aria-hidden="true" />
      </span>
      <span className={styles.teaserText}>
        <strong>Not sure which country?</strong>
        <span>Answer a few questions: we suggest three EU countries for study, work, family or business.</span>
      </span>
      <ArrowRight size={18} aria-hidden="true" className={styles.teaserArrow} />
    </Link>
  );
}
