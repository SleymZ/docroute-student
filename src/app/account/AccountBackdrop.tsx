import styles from "./AccountPage.module.css";

// Decorative only: route lines with waypoints, orbit rings, a map-like dot
// field and grid marks, echoing the home and Explore motifs. Coordinates
// follow the desktop layout so the details sit in the visible hero band and
// in the gaps between cards rather than behind them.
export function AccountBackdrop() {
  return (
    <div className={styles.backdrop} aria-hidden="true">
      <svg
        viewBox="0 0 1440 1500"
        preserveAspectRatio="xMidYMin slice"
        focusable="false"
      >
        <defs>
          <linearGradient id="account-route-main" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#ff8067" stopOpacity="0" />
            <stop offset="0.3" stopColor="#ff8067" stopOpacity="0.6" />
            <stop offset="0.72" stopColor="#79ddef" stopOpacity="0.5" />
            <stop offset="1" stopColor="#79ddef" stopOpacity="0" />
          </linearGradient>
          <radialGradient id="account-waypoint-coral">
            <stop offset="0" stopColor="#ff8067" stopOpacity="0.45" />
            <stop offset="1" stopColor="#ff8067" stopOpacity="0" />
          </radialGradient>
          <radialGradient id="account-waypoint-cyan">
            <stop offset="0" stopColor="#79ddef" stopOpacity="0.4" />
            <stop offset="1" stopColor="#79ddef" stopOpacity="0" />
          </radialGradient>
          <pattern id="account-dots" width="14" height="14" patternUnits="userSpaceOnUse">
            <circle cx="7" cy="7" r="1.1" fill="#79ddef" />
          </pattern>
          <radialGradient id="account-dots-fade">
            <stop offset="0" stopColor="#fff" stopOpacity="0.5" />
            <stop offset="1" stopColor="#fff" stopOpacity="0" />
          </radialGradient>
          <mask id="account-dots-mask">
            <rect x="820" y="-40" width="620" height="360" fill="url(#account-dots-fade)" />
          </mask>
        </defs>

        {/* Map-like dot field behind the top of the identity card */}
        <g mask="url(#account-dots-mask)" opacity="0.4">
          <rect x="820" y="-40" width="620" height="360" fill="url(#account-dots)" />
        </g>

        {/* Orbit rings, top right */}
        <g fill="none" stroke="#79ddef">
          <circle cx="1260" cy="40" r="130" strokeOpacity="0.11" />
          <circle cx="1260" cy="40" r="220" strokeOpacity="0.075" />
          <circle cx="1260" cy="40" r="320" strokeOpacity="0.055" strokeDasharray="2 10" />
        </g>

        {/* Faint dotted route along the top */}
        <path
          d="M -20 40 C 300 10 520 90 760 70 S 1100 0 1460 40"
          fill="none"
          stroke="#79ddef"
          strokeOpacity="0.16"
          strokeDasharray="1 9"
          strokeLinecap="round"
        />
        <circle cx="400" cy="51" r="2.5" fill="#79ddef" fillOpacity="0.45" />

        {/* Main route: under the lead text, past the identity card */}
        <path
          className={styles.backdropRoute}
          d="M -20 292 C 260 300 560 270 800 200 S 1080 40 1460 20"
          fill="none"
          stroke="url(#account-route-main)"
          strokeWidth="1.6"
          strokeDasharray="7 11"
          strokeLinecap="round"
        />
        <circle cx="278" cy="286" r="3" fill="#ff8067" fillOpacity="0.55" />
        <circle cx="800" cy="200" r="30" fill="url(#account-waypoint-coral)" />
        <circle cx="800" cy="200" r="9" fill="none" stroke="#ff8067" strokeOpacity="0.45" />
        <circle cx="800" cy="200" r="4" fill="#ff8067" fillOpacity="0.85" />
        <circle cx="1253" cy="42" r="24" fill="url(#account-waypoint-cyan)" />
        <circle cx="1253" cy="42" r="4" fill="#79ddef" fillOpacity="0.75" />

        {/* Latitude arcs, lower left of the hero */}
        <g fill="none" stroke="#79ddef" strokeOpacity="0.07">
          <path d="M -60 210 Q 200 150 470 190" />
          <path d="M -60 250 Q 200 190 470 230" />
        </g>

        {/* Vertical route through the gap between the two cards */}
        <path
          d="M 1009 380 C 1009 560 1009 760 1009 990"
          fill="none"
          stroke="#79ddef"
          strokeOpacity="0.14"
          strokeDasharray="2 10"
          strokeLinecap="round"
        />

        {/* Grid marks */}
        <g stroke="#79ddef" strokeOpacity="0.2" strokeWidth="1">
          <path d="M 640 26 h 12 M 646 20 v 12" />
          <path d="M 560 250 h 10 M 565 245 v 10" />
          <path d="M 1404 260 h 12 M 1410 254 v 12" />
          <path d="M 18 1010 h 10 M 23 1005 v 10" />
        </g>
      </svg>
    </div>
  );
}
