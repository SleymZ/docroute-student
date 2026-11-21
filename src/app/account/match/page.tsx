import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, Cloud, RotateCcw } from "lucide-react";

import { AccountBackdrop } from "../AccountBackdrop";
import { Header } from "@/components/Header";
import { CountryMatchQuiz, type MatchPrefill } from "@/components/match/CountryMatchQuiz";
import { CountryMatchResults } from "@/components/match/CountryMatchResults";
import { signUpHref } from "@/lib/access";
import { educationFromStudyProfile, levelFromCefr, matchLanguages } from "@/lib/country-match-answers";
import { computeCountryMatch } from "@/lib/country-match";
import { loadApplicantProfile } from "@/lib/supabase/applicant-profile";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { loadMoveProfile, type SavedMoveProfile } from "@/lib/supabase/move-profile";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import accountStyles from "../AccountPage.module.css";
import styles from "@/components/match/CountryMatch.module.css";

export const metadata: Metadata = {
  title: "Find your EU country",
  description: "Three EU countries for your move: the easiest to move to, the best fit for how you want to live, and the best all-round.",
  robots: { index: false, follow: false },
};

type MatchPageProps = {
  searchParams: Promise<{ edit?: string | string[] }>;
};

export default async function CountryMatchPage({ searchParams }: MatchPageProps) {
  if (!isSupabaseConfigured()) {
    return (
      <main>
        <Header />
        <section className={accountStyles.emptyState}>
          <Cloud size={34} aria-hidden="true" />
          <h1>Connect Supabase to activate profiles</h1>
          <p>Add the project URL and publishable key to your local environment.</p>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect(signUpHref("/account/match"));

  const query = await searchParams;
  let saved: SavedMoveProfile | null = null;
  let unavailable = false;
  try {
    saved = await loadMoveProfile(supabase, user.id);
  } catch {
    unavailable = true;
  }
  const editing = query.edit === "1" || !saved;

  if (saved && !editing) {
    const result = computeCountryMatch(saved.answers);
    return (
      <main>
        <Header />
        <div className={`${accountStyles.page} ${styles.page}`}>
          <AccountBackdrop />
          <nav className={styles.breadcrumb}>
            <Link href="/account">
              <ArrowLeft size={16} aria-hidden="true" />
              Profile
            </Link>
          </nav>
          <header className={styles.hero}>
            <p className={styles.eyebrow}>COUNTRY MATCH</p>
            <h1>
              Your three EU <span>countries.</span>
            </h1>
            <p className={styles.heroLead}>
              One where the move is easiest, one that fits how you want to live, and one that balances both. Open each
              to see why and what to do next.
            </p>
            <Link href="/account/match?edit=1" className={styles.retake}>
              <RotateCcw size={16} aria-hidden="true" />
              Change answers
            </Link>
          </header>
          <CountryMatchResults result={result} answers={saved.answers} updatedAt={saved.updatedAt} />
        </div>
      </main>
    );
  }

  // First time: start from the study profile where there is one.
  let prefill: MatchPrefill | null = null;
  if (!saved) {
    const profile = await loadApplicantProfile(supabase, user.id).catch(() => null);
    if (profile) {
      prefill = {
        citizenship: profile.citizenshipCountryCode,
        education: educationFromStudyProfile(profile.degreeLevel, profile.educationStatus),
        languages: profile.languages
          .filter((language) => matchLanguages.some((option) => option.code === language.code))
          .map((language) => ({ code: language.code, level: levelFromCefr(language.level) })),
      };
    }
  }

  return (
    <main>
      <Header />
      <div className={`${accountStyles.page} ${styles.page}`}>
        <AccountBackdrop />
        <nav className={styles.breadcrumb}>
          <Link href={saved ? "/account/match" : "/account"}>
            <ArrowLeft size={16} aria-hidden="true" />
            {saved ? "My countries" : "Profile"}
          </Link>
        </nav>
        <header className={styles.hero}>
          <p className={styles.eyebrow}>COUNTRY MATCH · 5 SHORT STEPS</p>
          <h1>
            Where in the EU should you <span>move?</span>
          </h1>
          <p className={styles.heroLead}>
            Answer a few questions about your passport, languages, plans and how you like to live. We suggest three EU
            countries: the easiest to move to, the one that fits your lifestyle, and the best all-round.
          </p>
        </header>
        <CountryMatchQuiz userId={user.id} initial={saved?.answers ?? null} prefill={prefill} unavailable={unavailable} />
      </div>
    </main>
  );
}
