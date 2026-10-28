import type { Metadata } from "next";
import Link from "next/link";

import {
  ArrowRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  CircleDashed,
  Clock3,
  Compass,
  FileSearch,
  Landmark,
  ListChecks,
  Lock,
  Route,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import { Header } from "@/components/Header";
import { movePurposes } from "@/data/move-purposes";
import { pendingProgramGroups } from "@/data/pending-programs";
import { czechiaResidenceRules } from "@/data/czechia-residence";
import { slovakiaResidenceRules } from "@/data/slovakia-residence";
import {
  slovakiaEuRegistrationRules,
  slovakiaResidentRules,
} from "@/data/slovakia-residents";
import { slovakiaWorkRules } from "@/data/slovakia-work";
import { verifiedPrograms } from "@/data/verified-programs";
import { matchStatusLabels } from "@/lib/match-programs";
import { formatPlanDate } from "@/lib/residence/deadlines";
import { formatDegreeLevel } from "@/lib/profile-options";
import type { MatchStatus } from "@/types/admission";

import styles from "./HowItWorks.module.css";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "How DocRoute builds one source-linked route from university application to residence permit, what “verified” means and what is covered today.",
  alternates: { canonical: "/how-it-works" },
};

const steps = [
  {
    number: "01",
    icon: Compass,
    title: "Choose where and what",
    text: "Pick a destination, a field of study, a degree and the intake you are aiming for. These four choices decide which official rules can apply to you.",
  },
  {
    number: "02",
    icon: UserRound,
    title: "Describe your situation",
    text: "Add your citizenship, where you went to school, how far along you are, the languages you know and your current residence status. No documents are uploaded.",
  },
  {
    number: "03",
    icon: ListChecks,
    title: "See matches, explained",
    text: "Each verified program is compared with your profile, condition by condition. You see what is met, what still needs doing and what is missing, with the source beside every rule.",
  },
  {
    number: "04",
    icon: Route,
    title: "Follow your route",
    text: "Your route runs from application to admission, enrolment and the residence permit. Tick off tasks as you go and enter a move date to get a deadline for each residence step.",
  },
];

const statusExplanations: Record<MatchStatus, string> = {
  conditional:
    "The best status. Nothing is missing, but steps remain, such as a language test, a document or the entrance exam. The university always decides, so DocRoute never calls a profile a sure fit.",
  "more-information":
    "Some of your evidence is not specific enough to judge. Clarify it before relying on the route.",
  "preparation-required":
    "A condition is not met yet, for example the teaching language. Treat it as a preparation option.",
  unavailable:
    "The program does not fit your exact choices, or its verified deadline has passed.",
};

const statusOrder: MatchStatus[] = [
  "conditional",
  "more-information",
  "preparation-required",
  "unavailable",
];

const principles = [
  {
    icon: Landmark,
    title: "Official sources only",
    text: "Requirements come from the university's or the authority's own published rules. Each one links to its source and shows the date it was checked.",
  },
  {
    icon: CalendarClock,
    title: "Exact scope, no borrowing",
    text: "A rule for one faculty, degree or year is never reused for another. When next year's rules are not out yet, we say so instead of guessing.",
  },
  {
    icon: ShieldCheck,
    title: "Explained, not scored",
    text: "DocRoute never shows admission chances or percentages. Admission is always the university's decision, and residence is the authority's.",
  },
  {
    icon: FileSearch,
    title: "Check before you submit",
    text: "DocRoute is a preparation tool, not legal advice. Recheck every open requirement on the official page before you apply or file.",
  },
];

export default function HowItWorksPage() {
  const verifiedFaculties = new Map<
    string,
    { name: string; faculty: string; city: string; count: number; scope: string; checkedAt: string }
  >();
  for (const program of verifiedPrograms) {
    const key = `${program.universityId}|${program.faculty}|${program.category}|${program.degreeLevel}|${program.intake}`;
    const existing = verifiedFaculties.get(key);
    if (existing) {
      existing.count += 1;
    } else {
      verifiedFaculties.set(key, {
        name: program.universityName,
        faculty: program.faculty,
        city: program.city,
        count: 1,
        scope: `${formatDegreeLevel(program.degreeLevel)} · ${program.category} · ${program.intake}`,
        checkedAt: program.verifiedAt,
      });
    }
  }
  const availablePurposes = movePurposes
    .filter((purpose) => purpose.available)
    .map((purpose) => purpose.label);
  const comingPurposes = movePurposes
    .filter((purpose) => !purpose.available)
    .map((purpose) => purpose.label);

  return (
    <main>
      <Header />

      <div className={`page-container ${styles.page}`}>
        <section className={styles.hero} aria-labelledby="how-heading">
          <p className={styles.eyebrow}>HOW DOCROUTE WORKS</p>
          <h1 id="how-heading">
            One route from application to arrival, built from official rules.
          </h1>
          <p className={styles.lead}>
            Moving to Europe to study or work means following several sets of
            rules at once: the university&apos;s or the employer&apos;s, the
            labour office&apos;s and the immigration authority&apos;s. DocRoute puts the parts that apply to
            you in order, with a source and a deadline for each step.
          </p>
          <div className={styles.heroActions}>
            <Link href="/#route-builder" className={styles.primaryAction}>
              Build my route
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/explore" className={styles.secondaryAction}>
              Explore universities
            </Link>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="steps-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>FOUR STEPS</p>
            <h2 id="steps-heading">What happens when you build a route</h2>
          </div>

          <ol className={styles.steps}>
            {steps.map(({ number, icon: Icon, title, text }) => (
              <li key={number} className={styles.step}>
                <span className={styles.stepTop}>
                  <span className={styles.icon}>
                    <Icon size={22} aria-hidden="true" />
                  </span>
                  <span className={styles.stepNumber}>{number}</span>
                </span>
                <h3>{title}</h3>
                <p>{text}</p>
              </li>
            ))}
          </ol>

          <p className={styles.aside}>
            You can browse the university directory in Explore without a
            profile. A personal route needs a profile; as a guest it is kept in
            your browser, and after you log in it syncs with your account.
          </p>

          <div className={styles.workNote}>
            <span className={styles.icon}>
              <BriefcaseBusiness size={20} aria-hidden="true" />
            </span>
            <div>
              <h3>Moving for work instead?</h3>
              <p>
                Choose <strong>Work</strong> on the home page. Six questions
                (citizenship, current status, job offer, Slovak diploma, EU Blue
                Card conditions, shortage occupation) decide the official
                procedure: the single permit, the EU Blue Card or the exemption
                for Slovak graduates. You get the employer&apos;s steps, your
                residence application and deadlines counted back from your start
                date.
              </p>
              <Link href="/route/work?country=SK" className={styles.inlineLink}>
                Start a work route
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="verified-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>WHAT THE LABELS MEAN</p>
            <h2 id="verified-heading">Verified, coming soon or pending</h2>
            <p>
              Every program in DocRoute carries one of three labels. Only the
              first one opens a personal route.
            </p>
          </div>

          <div className={styles.labels}>
            <article className={styles.labelCard}>
              <span className={`${styles.labelBadge} ${styles.badgeVerified}`}>
                <BadgeCheck size={14} aria-hidden="true" />
                Program verified
              </span>
              <p>
                The approved admission rules for this exact program, degree and
                intake were read and checked. You get a personal checklist,
                deadlines and a route.
              </p>
            </article>
            <article className={styles.labelCard}>
              <span className={`${styles.labelBadge} ${styles.badgeComing}`}>
                <Clock3 size={14} aria-hidden="true" />
                Rules awaiting approval
              </span>
              <p>
                The faculty has announced or drafted rules for the intake, but
                the final version is not published. The programs are listed so
                you can plan ahead; no checklist is built from a draft.
              </p>
            </article>
            <article className={styles.labelCard}>
              <span className={`${styles.labelBadge} ${styles.badgePending}`}>
                <CircleDashed size={14} aria-hidden="true" />
                Program review pending
              </span>
              <p>
                The institution is in the directory, but its programs and rules
                have not been reviewed yet. Being listed does not mean a program
                exists.
              </p>
            </article>
          </div>

          <h3 className={styles.subheading}>Your result for a verified program</h3>
          <dl className={styles.statuses}>
            {statusOrder.map((status) => (
              <div key={status}>
                <dt>{matchStatusLabels[status]}</dt>
                <dd>{statusExplanations[status]}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className={styles.section} aria-labelledby="principles-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>OUR RULES</p>
            <h2 id="principles-heading">How we keep the route trustworthy</h2>
          </div>

          <div className={styles.principles}>
            {principles.map(({ icon: Icon, title, text }) => (
              <article key={title}>
                <span className={styles.icon}>
                  <Icon size={20} aria-hidden="true" />
                </span>
                <div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="coverage-heading">
          <div className={styles.sectionHeading}>
            <p className={styles.eyebrow}>COVERAGE TODAY</p>
            <h2 id="coverage-heading">What DocRoute covers right now</h2>
            <p>
              Coverage grows one checked program at a time. Everything not
              listed here is shown as pending.
            </p>
          </div>

          <div className={styles.coverage}>
            <article>
              <h3>Verified admission</h3>
              <ul>
                {[...verifiedFaculties.values()].map((item) => (
                  <li key={`${item.name}-${item.faculty}-${item.scope}`}>
                    <strong>
                      {item.name}, {item.faculty}
                    </strong>
                    <span>
                      {item.city} · {item.scope} · {item.count}{" "}
                      {item.count === 1 ? "program" : "programs"}
                    </span>
                    <small>Rules checked {formatPlanDate(item.checkedAt)}</small>
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <h3>Coming soon</h3>
              <ul>
                {pendingProgramGroups.map((group) => (
                  <li key={group.id}>
                    <strong>
                      {group.universityName}, {group.faculty}
                    </strong>
                    <span>
                      {group.city} · {formatDegreeLevel(group.degreeLevel)} ·{" "}
                      {group.category} · {group.intake} ·{" "}
                      {group.programs.map((program) => program.programName).join(", ")}
                    </span>
                    <small>Approved rules not yet published</small>
                  </li>
                ))}
              </ul>
            </article>

            <article>
              <h3>Residence</h3>
              <ul>
                <li>
                  <strong>
                    {slovakiaResidenceRules.jurisdiction}: temporary residence
                    for study
                  </strong>
                  <span>
                    For citizens of countries outside the EU, EEA and
                    Switzerland. Includes the move-date deadline planner.
                  </span>
                  <small>
                    Checked {formatPlanDate(slovakiaResidenceRules.checkedAt)}
                  </small>
                </li>
                <li>
                  <strong>
                    {slovakiaWorkRules.jurisdiction}: temporary residence for
                    employment
                  </strong>
                  <span>
                    Single permit, EU Blue Card and Slovak graduates, for
                    citizens of countries outside the EU, EEA and Switzerland.
                    Includes the start-date deadline planner.
                  </span>
                  <small>Checked {formatPlanDate(slovakiaWorkRules.checkedAt)}</small>
                </li>
                <li>
                  <strong>
                    {slovakiaEuRegistrationRules.jurisdiction}: EU, EEA and
                    Swiss citizens
                  </strong>
                  <span>
                    Notice of stay and registration of residence for study or
                    work, with the optional residence card.
                  </span>
                  <small>
                    Checked {formatPlanDate(slovakiaEuRegistrationRules.checkedAt)}
                  </small>
                </li>
                <li>
                  <strong>
                    {slovakiaEuRegistrationRules.jurisdiction}: people who
                    already live there
                  </strong>
                  <span>
                    Residence for study (report the new studies, renewal),
                    another purpose (change of purpose to study) and permanent
                    residence.
                  </span>
                  <small>
                    Checked {formatPlanDate(slovakiaResidentRules.checkedAt)}
                  </small>
                </li>
                <li>
                  <strong>
                    {czechiaResidenceRules.jurisdiction}: study and work
                  </strong>
                  <span>
                    Long-term residence permit for study, employee card and EU
                    Blue Card, EU registration and current residents, with a
                    date planner. Czech university admission is not verified.
                  </span>
                  <small>
                    Checked {formatPlanDate(czechiaResidenceRules.checkedAt)}
                  </small>
                </li>
              </ul>
            </article>

            <article>
              <h3>Reasons for moving</h3>
              <ul>
                <li>
                  <strong>{availablePurposes.join(", ")}</strong>
                  <span>Available now for Slovakia; residence routes for Czechia.</span>
                </li>
                <li>
                  <strong>{comingPurposes.join(", ")}</strong>
                  <span>
                    Planned. Each opens only after its own official rules are
                    checked.
                  </span>
                </li>
              </ul>
            </article>
          </div>
        </section>

        <section className={styles.section} aria-labelledby="privacy-heading">
          <div className={styles.privacy}>
            <span className={styles.icon}>
              <Lock size={20} aria-hidden="true" />
            </span>
            <div>
              <h2 id="privacy-heading">Your information</h2>
              <p>
                Without an account, your profile, bookmarks and progress stay
                in your browser. With an account, they are stored so that only
                you can read them. Pages personalised with your profile are
                kept out of search engines.
              </p>
            </div>
          </div>
        </section>

        <section className={styles.cta} aria-labelledby="cta-heading">
          <h2 id="cta-heading">Ready to see your route?</h2>
          <p>It takes a few minutes and no documents.</p>
          <div className={styles.heroActions}>
            <Link href="/#route-builder" className={styles.primaryAction}>
              Build my route
              <ArrowRight size={17} aria-hidden="true" />
            </Link>
            <Link href="/explore" className={styles.secondaryAction}>
              Explore universities
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
