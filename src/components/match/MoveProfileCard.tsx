import Image from "next/image";
import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  GraduationCap,
  HeartHandshake,
  Pencil,
  Store,
} from "lucide-react";

import { REGION_NAMES } from "@/data/region-names";
import type { MatchPurpose } from "@/lib/country-match-answers";
import { computeCountryMatch } from "@/lib/country-match";
import { flagSrc } from "@/lib/flags";
import type { SavedMoveProfile } from "@/lib/supabase/move-profile";

import { labelOf, purposeChoices, roleLabels } from "./labels";
import styles from "./CountryMatch.module.css";

const purposeIcons: Record<MatchPurpose, typeof Compass> = {
  study: GraduationCap,
  work: BriefcaseBusiness,
  family: HeartHandshake,
  business: Store,
};

/** The move profile on /account: the way into the country match, or the
 *  three saved countries. */
export function MoveProfileCard({ saved, unavailable }: { saved: SavedMoveProfile | null; unavailable: boolean }) {
  if (!saved) {
    return (
      <section className={styles.moveCard} aria-labelledby="move-profile-title">
        <div className={styles.moveCardHead}>
          <div>
            <p className={styles.eyebrow}>MOVE PROFILE · STUDY, WORK, FAMILY OR BUSINESS</p>
            <h2 id="move-profile-title">Where in the EU should you move?</h2>
            <p>
              {unavailable
                ? "Your move profile could not be loaded right now. Reload the page in a moment; nothing has been deleted."
                : "Answer a few questions about your passport, languages, plans and how you like to live. We suggest three EU countries: the easiest to move to, the one that fits your lifestyle, and the best all-round."}
            </p>
          </div>
        </div>
        <ul className={styles.purposeBadges} aria-label="Purposes">
          {purposeChoices.map((purpose) => {
            const PurposeIcon = purposeIcons[purpose.value];
            return (
              <li key={purpose.value}>
                <PurposeIcon size={15} aria-hidden="true" />
                <span>{purpose.label}</span>
              </li>
            );
          })}
        </ul>
        {!unavailable && (
          <div className={styles.moveCardActions}>
            <Link href="/account/match" className={styles.primary}>
              Find my 3 countries
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        )}
      </section>
    );
  }

  const result = computeCountryMatch(saved.answers);
  const PurposeIcon = purposeIcons[saved.answers.purpose];
  return (
    <section className={styles.moveCard} aria-labelledby="move-profile-title">
      <div className={styles.moveCardHead}>
        <div>
          <p className={styles.eyebrow}>MOVE PROFILE</p>
          <h2 id="move-profile-title">Your three EU countries</h2>
        </div>
      </div>
      <ul className={styles.purposeBadges} aria-label="Your answers">
        <li>
          <PurposeIcon size={15} aria-hidden="true" />
          <span>{labelOf(purposeChoices, saved.answers.purpose)}</span>
        </li>
        <li>
          <Image src={flagSrc(saved.answers.citizenship)} alt="" width={18} height={13} unoptimized />
          <span>{REGION_NAMES[saved.answers.citizenship] ?? saved.answers.citizenship}</span>
        </li>
      </ul>
      <ul className={styles.miniPicks}>
        {result.picks.map((pick) => (
          <li key={pick.code}>
            <Link href="/account/match">
              <Image src={flagSrc(pick.code)} alt="" width={34} height={25} unoptimized />
              <span>
                <small>{roleLabels[pick.role]}</small>
                <strong>{pick.name}</strong>
              </span>
              <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </li>
        ))}
      </ul>
      <div className={styles.moveCardActions}>
        <Link href="/account/match" className={styles.primary}>
          See why
          <ArrowRight size={16} aria-hidden="true" />
        </Link>
        <Link href="/account/match?edit=1" className={styles.secondary}>
          <Pencil size={16} aria-hidden="true" />
          Edit answers
        </Link>
      </div>
    </section>
  );
}
