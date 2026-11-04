import Link from "next/link";
import { Route } from "lucide-react";

import { landingMap } from "@/lib/landing-map";

import { EnterButton, EntryAccountLink } from "./EntryActions";
import styles from "./EntryScreen.module.css";
import { RouteLoader } from "./RouteLoader";

// Seconds the route takes to draw on load; stops appear as it reaches them.
const DRAW_SECONDS = 2.4;
const DRAW_START = 0.5;

/** The entry page: a dot map of Europe on which a route is drawn, one
 *  button into the site and a way to log in. No site navigation here. */
export function EntryScreen() {
  const map = landingMap;
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
        <path className={styles.routeGlow} d={map.route} pathLength={1} />
        <path className={styles.route} d={map.route} pathLength={1} />
        {map.stops.map((stop, index) => {
          const last = index === map.stops.length - 1;
          return (
            <g
              key={stop.label}
              className={styles.stop}
              data-last={last ? "" : undefined}
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
                x={stop.x + (last ? -14 : 14)}
                y={stop.y - 12}
                textAnchor={last ? "end" : "start"}
              >
                {stop.label}
              </text>
            </g>
          );
        })}
      </svg>
      <div className={styles.veil} aria-hidden="true" />

      <header className={styles.bar}>
        <Link href="/" className={styles.brand} aria-label="DocRoute">
          <span className={styles.brandMark}>
            <Route size={22} strokeWidth={1.8} aria-hidden="true" />
          </span>
          <span className={styles.brandName}>DocRoute</span>
          <span className={styles.beta}>Beta</span>
        </Link>
        <EntryAccountLink />
      </header>

      <section className={styles.copy} aria-labelledby="entry-title">
        <h1 id="entry-title" className={styles.title}>
          Start your journey
        </h1>
        <p className={styles.slogan}>Your move to Europe, one route.</p>
        <p className={styles.lead}>
          University rules, residence permits and deadlines, put together in
          the order you need them, with every step linked to its official
          source.
        </p>
        <div className={styles.actions}>
          <EnterButton />
        </div>
        <p className={styles.note}>
          Free public beta for moving to study, work, join family or run a
          business. No account needed to start.
        </p>
      </section>

      <div className={styles.leaving} aria-hidden="true">
        <RouteLoader label="Opening DocRoute" />
      </div>
    </main>
  );
}
