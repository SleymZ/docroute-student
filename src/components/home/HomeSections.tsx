import Link from "next/link";
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BriefcaseBusiness,
  CalendarClock,
  Check,
  FileStack,
  GraduationCap,
  LockKeyhole,
  ShieldCheck,
  Stamp,
  TriangleAlert,
} from "lucide-react";

import { czechiaResidenceRules } from "@/data/czechia-residence";
import { slovakiaResidenceRules } from "@/data/slovakia-residence";
import { verifiedPrograms } from "@/data/verified-programs";
import { LOCALE_TAGS, type Locale } from "@/i18n/config";
import { upcomingFacultyDeadlines, type FacultyDeadline } from "@/lib/deadline-list";
import { flagSrc } from "@/lib/flags";
import { getAdmissionDate } from "@/lib/admission-date";

import { PhoneMatchTeaser } from "./PhoneMatchTeaser";
import styles from "./HomeSections.module.css";

// Everything below the route form on /home. Every number comes from the
// same verified data the routes use (programmes, deadlines, residence
// rules), so the home page never says more than the site has checked.

const COUNTRY_NAMES: Record<string, string> = { SK: "Slovakia", CZ: "Czechia" };

function DaysLeft({ days }: { days: number }) {
  const tone = days <= 30 ? styles.soon : days <= 90 ? styles.near : styles.ok;
  if (days === 0) return <span className={`${styles.days} ${styles.soon}`}>Last day today</span>;
  if (days === 1) return <span className={`${styles.days} ${styles.soon}`}>1 day left</span>;
  return <span className={`${styles.days} ${tone}`}>{days} days left</span>;
}

function DeadlineRow({ row, date }: { row: FacultyDeadline; date: string }) {
  return (
    <li className={styles.deadline}>
      <Link href={row.universityHref} className={styles.deadlineLink}>
        <span className={styles.deadlineDate}>
          <strong>{date}</strong>
          <DaysLeft days={row.daysLeft} />
        </span>
        <span className={styles.deadlineWhat}>
          <span className={styles.deadlinePlace}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={flagSrc(row.countryCode)} alt="" width={18} height={13} />
            <span>{COUNTRY_NAMES[row.countryCode]} · {row.city}</span>
          </span>
          <span className={styles.deadlineName}>{row.universityName}</span>
          <span className={styles.deadlineFaculty}>{row.faculty}</span>
        </span>
        <span className={styles.deadlineField}>{row.category}</span>
        <ArrowUpRight size={16} aria-hidden="true" className={styles.deadlineArrow} />
      </Link>
    </li>
  );
}

/** Numbers from the verified data. On wide screens it stands under the map
 *  in the hero (owner request 2026-11-18: fill the space there); below
 *  1200px, where the map moves under the form, it stays under the hero. */
export function HomeProof({ placement, today }: { placement: "hero" | "below"; today?: string }) {
  const deadlines = upcomingFacultyDeadlines(verifiedPrograms, today ?? getAdmissionDate());
  const universities = new Set(verifiedPrograms.map((program) => program.universityId)).size;
  const programmes = verifiedPrograms.length;
  return (
    <ul className={`${styles.proof} ${placement === "hero" ? styles.proofHero : styles.proofBelow}`} aria-label="DocRoute in numbers">
      <li>
        <strong>{programmes}</strong>
        <span>verified programmes</span>
      </li>
      <li>
        <strong>{universities}</strong>
        <span>universities in 5 European countries</span>
      </li>
      <li>
        <strong>{deadlines.length}</strong>
        <span>open application deadlines</span>
      </li>
      <li>
        <ShieldCheck size={22} aria-hidden="true" />
        <span>Every rule links to its official source</span>
      </li>
    </ul>
  );
}

export function HomeSections({ today, locale }: { today: string; locale: Locale }) {
  const tag = locale === "en" ? "en-GB" : LOCALE_TAGS[locale];
  const dateOf = (iso: string) =>
    new Intl.DateTimeFormat(tag, { timeZone: "UTC", day: "numeric", month: "long" }).format(new Date(`${iso}T00:00:00Z`));

  const deadlines = upcomingFacultyDeadlines(verifiedPrograms, today);
  const soonest = deadlines.slice(0, 6);
  const next = deadlines[0];

  return (
    <div className={styles.sections}>
      <PhoneMatchTeaser />
      <HomeProof placement="below" today={today} />

      {soonest.length > 0 ? (
        <section className={styles.block} aria-labelledby="home-deadlines">
          <div className={styles.heading}>
            <div>
              <p className={styles.eyebrow}>
                <CalendarClock size={14} aria-hidden="true" />
                OPEN NOW · 2027/28
              </p>
              <h2 id="home-deadlines">Applications that close soonest</h2>
              <p className={styles.intro}>Checked on each faculty&apos;s official page. No account needed.</p>
            </div>
            <Link href="/deadlines" className={styles.more}>
              All deadlines <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <ol className={styles.deadlines}>
            {soonest.map((row) => (
              <DeadlineRow key={row.key} row={row} date={dateOf(row.deadline)} />
            ))}
          </ol>
        </section>
      ) : null}

      <section className={styles.block} aria-labelledby="home-journey">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>FROM APPLICATION TO ARRIVAL</p>
            <h2 id="home-journey">Four stages, in the order they happen</h2>
            <p className={styles.intro}>Your route puts the steps of each stage in order for your passport and programme.</p>
          </div>
        </div>
        <ol className={styles.journey}>
          <li>
            <span className={styles.stageIcon} aria-hidden="true"><GraduationCap size={18} /></span>
            <span className={styles.stageNumber}>01</span>
            <h3>Apply to the faculty</h3>
            <p>Each faculty sets its own deadline, fee and entrance requirements.</p>
            {next ? <p className={styles.fact}>The next deadline closes in {next.daysLeft} days.</p> : null}
          </li>
          <li>
            <span className={styles.stageIcon} aria-hidden="true"><FileStack size={18} /></span>
            <span className={styles.stageNumber}>02</span>
            <h3>Prepare your documents</h3>
            <p>Diploma recognition, translations and legalisation depend on the country that issued your documents.</p>
            <p className={styles.fact}>Your route lists what applies to your passport.</p>
          </li>
          <li>
            <span className={styles.stageIcon} aria-hidden="true"><Stamp size={18} /></span>
            <span className={styles.stageNumber}>03</span>
            <h3>Get the residence permit</h3>
            <p>After admission you apply for residence for study.</p>
            <p className={styles.fact}>
              Decision: up to {slovakiaResidenceRules.processingTimeDays} days in Slovakia, up to {czechiaResidenceRules.study.processingDays} days in Czechia.
            </p>
          </li>
          <li>
            <span className={styles.stageIcon} aria-hidden="true"><BriefcaseBusiness size={18} /></span>
            <span className={styles.stageNumber}>04</span>
            <h3>Study and work</h3>
            <p>In Slovakia residence for study is granted for up to {slovakiaResidenceRules.maxInitialYears} years at first.</p>
            <p className={styles.fact}>Students may work up to {slovakiaResidenceRules.universityStudentWorkHoursPerMonth} hours a month.</p>
          </li>
        </ol>
      </section>

      <section className={`${styles.block} ${styles.preview}`} aria-labelledby="home-preview">
        <div className={styles.previewCopy}>
          <p className={styles.eyebrow}>YOUR ROUTE</p>
          <h2 id="home-preview">One page instead of ten official websites</h2>
          <p className={styles.intro}>
            Pick the programme and the country that issued your documents. DocRoute builds the route: what to do,
            in which order, with the official page for every step.
          </p>
          <ul className={styles.tiers}>
            <li>
              <Check size={16} aria-hidden="true" />
              <span>Free account: the key steps of every stage and your progress saved</span>
            </li>
            <li>
              <Check size={16} aria-hidden="true" />
              <span>Plus: every step, your own dates, PDF and PNG</span>
            </li>
          </ul>
          <a href="#route-builder" className={styles.primary}>
            Build my route <ArrowRight size={16} aria-hidden="true" />
          </a>
        </div>

        <div className={styles.mock} aria-hidden="true">
          <div className={styles.mockHead}>
            <span className={styles.mockFlag}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={flagSrc("SK")} alt="" width={20} height={14} />
            </span>
            <div>
              <strong>Computer Science · Slovakia</strong>
              <span>Example route</span>
            </div>
          </div>
          <div className={styles.mockStage}>
            <span className={styles.mockLabel}>1 · Application</span>
            <div className={`${styles.mockStep} ${styles.mockDone}`}>
              <Check size={14} />
              <span>Check the entry requirements</span>
            </div>
            <div className={styles.mockStep}>
              <span className={styles.mockBox} />
              <span>Submit the application before the deadline</span>
            </div>
          </div>
          <div className={styles.mockStage}>
            <span className={styles.mockLabel}>2 · Documents</span>
            <div className={`${styles.mockStep} ${styles.mockAttention}`}>
              <TriangleAlert size={14} />
              <span>Recognition of secondary education</span>
            </div>
            <div className={`${styles.mockStep} ${styles.mockLocked}`}>
              <LockKeyhole size={13} />
              <span className={styles.mockBars}>
                <i />
                <i />
              </span>
            </div>
          </div>
          <div className={styles.mockStage}>
            <span className={styles.mockLabel}>3 · Residence</span>
            <div className={styles.mockStep}>
              <span className={styles.mockBox} />
              <span>Apply for temporary residence for study</span>
            </div>
          </div>
          <p className={styles.mockSource}>
            <BadgeCheck size={13} />
            Official source and check date on every step
          </p>
        </div>
      </section>

      <section className={styles.block} aria-labelledby="home-faq">
        <div className={styles.heading}>
          <div>
            <p className={styles.eyebrow}>QUESTIONS</p>
            <h2 id="home-faq">Before you start</h2>
          </div>
        </div>
        <div className={styles.faq}>
          <details>
            <summary>Is DocRoute free?</summary>
            <p>
              Yes. Universities, deadlines and moving stories are open to everyone. A free account opens your
              personal route with the key steps of every stage. Plus adds every step, your own dates and PDF export.
            </p>
          </details>
          <details>
            <summary>Where does the information come from?</summary>
            <p>
              From universities, ministries and the police. Every step links to its official page and shows the
              date it was last checked. DocRoute is not legal advice: check each rule on its source before you file.
            </p>
          </details>
          <details>
            <summary>Which countries are covered?</summary>
            <p>
              Study routes are verified for Slovakia, Czechia, the Netherlands, Austria and Germany. For work, family and business there are
              checklists for Slovakia, Czechia and Austria, and official links for the other EU countries and
              Switzerland.
            </p>
          </details>
          <details>
            <summary>Why does a route need an account?</summary>
            <p>
              The route is built for your passport and programme and keeps your progress, so you can come back to
              it. Sign-up takes an email address or a Google account.
            </p>
          </details>
        </div>
      </section>

      <section className={styles.cta} aria-labelledby="home-cta">
        <h2 id="home-cta">Start with the deadline you cannot miss</h2>
        <div className={styles.ctaActions}>
          <a href="#route-builder" className={styles.primary}>
            Build my route <ArrowRight size={16} aria-hidden="true" />
          </a>
          <Link href="/deadlines" className={styles.secondary}>
            See all deadlines
          </Link>
        </div>
      </section>
    </div>
  );
}
