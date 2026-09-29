import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  BookOpen,
  Cloud,
  FileText,
  Languages,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { AccountSignOut } from "@/components/AccountSignOut";
import { Header } from "@/components/Header";
import catalog from "@/data/universities.json";
import {
  formatDegreeLevel,
  getResidenceStatusLabel,
} from "@/lib/profile-options";
import { loadApplicantProfile } from "@/lib/supabase/applicant-profile";
import { isSupabaseConfigured } from "@/lib/supabase/config";
import { createSupabaseServerClient } from "@/lib/supabase/server";

import styles from "./AccountPage.module.css";

export const metadata: Metadata = {
  title: "Applicant profile | DocRoute Student",
  description: "Your saved applicant profile and current university route.",
};

export default async function AccountPage() {
  if (!isSupabaseConfigured()) {
    return (
      <main>
        <Header />
        <section className={styles.emptyState}>
          <Cloud size={34} aria-hidden="true" />
          <h1>Connect Supabase to activate profiles</h1>
          <p>
            Add the project URL and publishable key to your local environment.
          </p>
        </section>
      </main>
    );
  }

  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/auth?mode=login&next=/account");
  }

  let profile = null;

  try {
    profile = await loadApplicantProfile(supabase, user.id);
  } catch {
    profile = null;
  }

  const routeParams = profile
      ? new URLSearchParams({
          country: profile.destinationCountryCode,
          program: profile.studyCategory,
          degree: profile.degreeLevel,
          intake: profile.intake,
        })
      : null;
  const destinationName = profile
    ? (catalog.universities.find(
        (university) =>
          university.countryCode === profile.destinationCountryCode,
      )?.country ?? profile.destinationCountryCode)
    : "";

  return (
    <main>
      <Header />

      <div className={styles.page}>
        <header className={styles.hero}>
          <div>
            <p>PERSONAL WORKSPACE</p>
            <h1>
              Your applicant <span>profile.</span>
            </h1>
            <p>
              One saved source for your education, languages and the
              admission rules that apply to you.
            </p>
          </div>

          <aside className={styles.identityCard}>
            <span>
              <UserRound size={22} aria-hidden="true" />
            </span>
            <div>
              <small>SIGNED IN AS</small>
              <strong>{user.email}</strong>
              <p>Supabase account · private workspace</p>
            </div>
            <AccountSignOut />
          </aside>
        </header>

        {profile ? (
          <>
            <section className={styles.statusStrip}>
              <article>
                <ShieldCheck size={18} aria-hidden="true" />
                <div>
                  <small>PROFILE STATUS</small>
                  <strong>Complete and saved</strong>
                </div>
              </article>
              <article>
                <BookOpen size={18} aria-hidden="true" />
                <div>
                  <small>LAST SEARCH</small>
                  <strong>
                    {profile.destinationCountryCode} · {profile.studyCategory}
                  </strong>
                </div>
              </article>
              <article>
                <Languages size={18} aria-hidden="true" />
                <div>
                  <small>LANGUAGES</small>
                  <strong>{profile.languages.length} recorded</strong>
                </div>
              </article>
            </section>

            <div className={styles.contentGrid}>
              <section className={styles.profileCard}>
                <div className={styles.cardHeading}>
                  <div>
                    <p>APPLICANT DATA</p>
                    <h2>Background and eligibility</h2>
                  </div>
                  <FileText size={22} aria-hidden="true" />
                </div>

                <dl className={styles.profileDetails}>
                  <div>
                    <dt>Citizenship</dt>
                    <dd>{profile.citizenshipCountryCode}</dd>
                  </div>
                  <div>
                    <dt>Education country</dt>
                    <dd>{profile.educationCountryCode}</dd>
                  </div>
                  <div>
                    <dt>
                      {profile.degreeLevel === "master"
                        ? "Bachelor's degree status"
                        : "School status"}
                    </dt>
                    <dd>{profile.educationStatus.replaceAll("-", " ")}</dd>
                  </div>
                  <div>
                    <dt>Current status</dt>
                    <dd>
                      {getResidenceStatusLabel(
                        profile.currentResidenceStatus,
                        destinationName,
                      )}
                    </dd>
                  </div>
                </dl>

                <div className={styles.languageList}>
                  {profile.languages.map((language) => (
                    <span key={language.code}>
                      {language.code.toUpperCase()} · {language.level}
                    </span>
                  ))}
                </div>

                <Link
                  href={`/route/profile?${routeParams!.toString()}`}
                  className={styles.secondaryAction}
                >
                  Edit applicant profile
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </section>

              <aside className={styles.routeCard}>
                <p>CURRENT ROUTE</p>
                <h2>{profile.studyCategory}</h2>
                <strong>
                  {profile.destinationCountryCode} ·{" "}
                  {formatDegreeLevel(profile.degreeLevel)}
                </strong>
                <span>Intake {profile.intake}</span>

                <Link
                  href={`/route/universities?${routeParams!.toString()}`}
                  className={styles.primaryAction}
                >
                  Continue university matching
                  <ArrowRight size={17} aria-hidden="true" />
                </Link>
              </aside>
            </div>
          </>
        ) : (
          <section className={styles.emptyState}>
            <FileText size={34} aria-hidden="true" />
            <h2>Your applicant profile is empty</h2>
            <p>
              Choose a destination and study interest, then add your education
              and languages once. DocRoute will remember them afterwards.
            </p>
            <Link href="/explore">
              Create applicant profile
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}
