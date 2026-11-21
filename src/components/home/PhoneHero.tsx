import Link from "next/link";

import { verifiedPrograms } from "@/data/verified-programs";
import { upcomingFacultyDeadlines } from "@/lib/deadline-list";

import styles from "./PhoneHero.module.css";

// The map is three static masks (public/map, scripts/phone-map-masks.mjs)
// coloured with CSS, so it follows the theme and adds nothing to the HTML.
// The overlay uses the same crop of the 1100×600 home map; cities projected
// with mapProjection: Bratislava 567,343; Prague 526,298.
function MapArt() {
  return (
    <span className={styles.map}>
      <span className={styles.layerEurope} />
      <span className={styles.layerListed} />
      <span className={styles.layerRoute} />
      <svg className={styles.overlay} viewBox="130 60 640 520" aria-hidden="true">
        <path className={styles.arc} d="M150 600 C 260 470, 420 380, 567 343" />
        <circle className={styles.pulse} cx="567" cy="343" r="10" />
        <circle className={styles.city} cx="567" cy="343" r="7" />
        <circle className={styles.city} cx="526" cy="298" r="6" />
        <text className={styles.label} x="582" y="368">Bratislava</text>
        <text className={styles.label} x="478" y="284">Prague</text>
      </svg>
    </span>
  );
}

function Stats({ today }: { today: string }) {
  const deadlines = upcomingFacultyDeadlines(verifiedPrograms, today).length;
  const universities = new Set(verifiedPrograms.map((program) => program.universityId)).size;
  return (
    <ul className={styles.stats} aria-label="DocRoute in numbers">
      <li>
        <strong>{verifiedPrograms.length}</strong>
        <span>programmes</span>
      </li>
      <li>
        <strong>{universities}</strong>
        <span>universities</span>
      </li>
      <li>
        <strong>{deadlines}</strong>
        <span>open deadlines</span>
      </li>
    </ul>
  );
}

/** Phone first screen of /home (owner decision 2026-11-21: the map, as on
 *  the computer). Hidden above 700px, where the desktop hero shows. */
export function PhoneHero({ today }: { today: string }) {
  return (
    <section className={styles.hero}>
      <Link href="/countries" className={styles.mapCard} aria-label="Countries on DocRoute">
        <MapArt />
        <span className={styles.legend}>
          <span>
            <i data-route="" />
            Study route checked
          </span>
          <span>
            <i />
            More countries
          </span>
        </span>
      </Link>
      <h1 className={styles.title}>
        Your move to Europe, <span>mapped.</span>
      </h1>
      <p className={styles.lead}>Documents, deadlines and the residence permit, step by step. Every rule from the official source. Free.</p>
      <Stats today={today} />
    </section>
  );
}
