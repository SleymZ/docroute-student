import Link from "next/link";
import {
  ArrowRight,
  Briefcase,
  CalendarClock,
  Check,
  Globe,
  GraduationCap,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";

import { highlightedCountryIds } from "@/data/highlighted-countries";
import { verifiedPrograms } from "@/data/verified-programs";
import { getAdmissionDate } from "@/lib/admission-date";
import { upcomingFacultyDeadlines } from "@/lib/deadline-list";
import { landingMap } from "@/lib/landing-map";

import { EnterButton, EntryAccountLink } from "./EntryActions";
import styles from "./EntryScreen.module.css";
import { LogoMark, LogoWord } from "./Logo";
import { RouteLoader } from "./RouteLoader";

// Seconds the route takes to draw on load; stops appear as it reaches them.
const DRAW_SECONDS = 2.4;
const DRAW_START = 0.5;

// The example route card mirrors the stops on the map; each line is ticked
// when the drawing line reaches its stop.
const cardSteps = [
  { title: "Application", detail: "University rules and the documents they ask for" },
  { title: "Documents", detail: "Translations, apostille and the dates to order them" },
  { title: "Residence permit", detail: "Where and when to file, counted back from your move" },
];

// What a route can be for, as icon tiles. Since the owner decision of
// 2026-11-17 they are links: each opens the route form with that purpose.
// The detail lines repeat what docs/STATUS.md lists as covered.
const purposes = [
  { label: "Study", purpose: "study", Icon: GraduationCap, detail: "" },
  {
    label: "Work",
    purpose: "work",
    Icon: Briefcase,
    detail: "Single permit and EU Blue Card in Slovakia, checklists for Czechia and Austria",
  },
  {
    label: "Family",
    purpose: "family",
    Icon: Users,
    detail: "Joining family in Slovakia, Czechia and Austria, official links for the rest of the EU",
  },
  {
    label: "Business",
    purpose: "business",
    Icon: Store,
    detail: "Residence for business in Slovakia, Czechia and Austria, official links for the rest of the EU",
  },
];

// Short facts floating over the middle of the map on wide screens.
const facts = [
  { Icon: ShieldCheck, title: "Official sources", detail: "Ministry and university pages" },
  { Icon: CalendarClock, title: "Counted back", detail: "Deadlines from your move date" },
  { Icon: Globe, title: "13 countries", detail: "Routes or university listings" },
];

// A small plane pointing along +x, centred on 0,0; it flies the route.
const PLANE =
  "M12 0L4.5 -1.6L-1 -8.6L-4.2 -8.6L-1.4 -1.8L-7 -1.4L-9.2 -4.8L-11.3 -4.8L-10.2 0L-11.3 4.8L-9.2 4.8L-7 1.4L-1.4 1.8L-4.2 8.6L-1 8.6L4.5 1.6Z";

/** The entry page: a dot map of Europe on which a route is drawn, the
 *  next real application deadline, the way into the site, the deadlines
 *  page and a way to log in (owner decision 2026-11-17: free redesign,
 *  logo and map unchanged). */
export function EntryScreen() {
  const map = landingMap;
  const deadlines = upcomingFacultyDeadlines(verifiedPrograms, getAdmissionDate());
  const next = deadlines[0];
  const nextDate = next
    ? // English date inside the sentence: the translation engine localises
      // it together with the rest of the line.
      new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", day: "numeric", month: "long" }).format(
        new Date(`${next.deadline}T00:00:00Z`),
      )
    : null;
  const universities = new Set(verifiedPrograms.map((program) => program.universityId)).size;
  const origin = {
    x: `${((map.destination.x / map.width) * 100).toFixed(1)}%`,
    y: `${((map.destination.y / map.height) * 100).toFixed(1)}%`,
  };

  return (
    <main
      className={styles.entry}
      data-entry=""
      style={
        {
          "--draw": `${DRAW_SECONDS}s`,
          "--draw-start": `${DRAW_START}s`,
          "--zoom-x": origin.x,
          "--zoom-y": origin.y,
        } as React.CSSProperties
      }
    >
      <svg
        className={styles.map}
        viewBox={`0 0 ${map.width} ${map.height}`}
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <path className={styles.dots} d={map.dots} />
        <path className={styles.dotsHighlighted} d={map.highlightedDots} />
        {map.capitals.map((capital) => (
          <circle
            key={capital.name}
            className={styles.capital}
            cx={capital.x}
            cy={capital.y}
            r="3.6"
          />
        ))}
        <path className={styles.routeGlow} d={map.route} pathLength={1} />
        <path className={styles.route} d={map.route} pathLength={1} />
        <path
          className={styles.plane}
          d={PLANE}
          style={{ offsetPath: `path("${map.route}")` } as React.CSSProperties}
        />
        {map.stops.map((stop, index) => {
          const last = index === map.stops.length - 1;
          return (
            <g
              key={stop.label}
              className={styles.stop}
              data-last={last ? "" : undefined}
              data-side={stop.side}
              style={
                {
                  "--stop-delay": `${(DRAW_START + stop.at * DRAW_SECONDS).toFixed(2)}s`,
                } as React.CSSProperties
              }
            >
              {last && <circle className={styles.pulse} cx={stop.x} cy={stop.y} r="8" />}
              <circle className={styles.stopDot} cx={stop.x} cy={stop.y} r={last ? 7 : 5.5} />
              <text
                className={styles.stopLabel}
                x={stop.x + (stop.side === "left" ? -14 : stop.side === "right" ? 14 : 0)}
                y={stop.side === "below" ? stop.y + 30 : stop.y - 12}
                textAnchor={
                  stop.side === "left" ? "end" : stop.side === "right" ? "start" : "middle"
                }
              >
                {stop.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className={styles.veil} aria-hidden="true" />
      <div className={styles.glow} aria-hidden="true" />

      <ul className={styles.facts} aria-label="What DocRoute checks">
        {facts.map(({ Icon, title, detail }, index) => (
          <li key={title} style={{ "--fact": index } as React.CSSProperties}>
            <span className={styles.factIcon} aria-hidden="true">
              <Icon size={18} strokeWidth={2.2} />
            </span>
            <span>
              <strong>{title}</strong>
              <span>{detail}</span>
            </span>
          </li>
        ))}
      </ul>

      <header className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label="DocRoute">
          <LogoMark size={56} className={styles.brandMark} />
          <span className={styles.brandText}>
            <span className={styles.brandLine}>
              <LogoWord className={styles.brandName} />
              <span className={styles.beta}>Beta</span>
            </span>
            <span className={styles.tagline}>Official steps. Real deadlines.</span>
          </span>
        </Link>
        <EntryAccountLink />
      </header>

      <section className={styles.copy} aria-labelledby="entry-title">
        <p className={styles.kicker}>
          <ShieldCheck size={15} aria-hidden="true" />
          Free · every step with its official source
        </p>
        <h1 id="entry-title" className={styles.title}>
          Your move to Europe, <span className={styles.accent}>step by step.</span>
        </h1>
        <p className={styles.lead}>
          Study, work, family or business: the documents, deadlines and residence permit in the order you need
          them, checked on official pages.
        </p>

        <p className={styles.choose}>What brings you to Europe?</p>
        <ul className={styles.purposes} aria-label="Routes for moving to">
          {purposes.map(({ label, purpose, Icon, detail }) => (
            <li key={label}>
              <Link href={`/home?purpose=${purpose}#route-builder`} className={styles.purposeLink}>
                <span className={styles.purposeIcon} aria-hidden="true">
                  <Icon size={22} strokeWidth={1.9} />
                </span>
                <span className={styles.purposeText}>
                  <strong>{label}</strong>
                  {purpose === "study" ? (
                    <span>{verifiedPrograms.length} verified programmes in Slovakia and Czechia</span>
                  ) : (
                    <span>{detail}</span>
                  )}
                  {purpose === "study" && next && nextDate ? (
                    <span className={styles.purposeDeadline}>
                      <CalendarClock size={13} aria-hidden="true" />
                      <span>Next deadline {nextDate} · {next.daysLeft} days left</span>
                    </span>
                  ) : null}
                </span>
                <ArrowRight size={17} aria-hidden="true" className={styles.purposeArrow} />
              </Link>
            </li>
          ))}
        </ul>

        <div className={styles.actions}>
          <EnterButton />
          <Link href="/deadlines" className={styles.secondary}>
            University deadlines 2027/28
          </Link>
        </div>

        <ul className={styles.proof} aria-label="DocRoute in numbers">
          <li>
            <strong>{verifiedPrograms.length}</strong> verified programmes
          </li>
          <li>
            <strong>{universities}</strong> universities
          </li>
          <li>
            <strong>{highlightedCountryIds.size}</strong> countries on the map
          </li>
          <li>EU and Switzerland: official links</li>
        </ul>
      </section>

      <aside className={styles.card} aria-label="Example route">
        <p className={styles.cardKicker}>Example route</p>
        <p className={styles.cardTitle}>Study in Slovakia</p>
        <ol className={styles.cardSteps}>
          {cardSteps.map((step, index) => (
            <li
              key={step.title}
              style={
                {
                  "--stop-delay": `${(DRAW_START + map.stops[index].at * DRAW_SECONDS).toFixed(2)}s`,
                } as React.CSSProperties
              }
            >
              <span className={styles.tick} aria-hidden="true">
                <Check size={13} strokeWidth={3} />
              </span>
              <span>
                <strong>{step.title}</strong>
                <span>{step.detail}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className={styles.cardFoot}>Every step links to its official source.</p>
      </aside>

      <p className={styles.legend}>
        <span className={styles.legendDot} aria-hidden="true" />
        Countries with DocRoute routes or university listings
      </p>

      <div className={styles.leaving} aria-hidden="true">
        <RouteLoader label="Opening DocRoute" />
      </div>
    </main>
  );
}
