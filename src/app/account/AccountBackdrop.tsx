import styles from "./AccountPage.module.css";

// Decorative only and deliberately quiet: one route line with a waypoint
// and faint orbit rings, echoing the home and Explore motifs. Coordinates
// follow the desktop layout so the route sits in the visible hero band.
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
            <stop offset="0.35" stopColor="#ff8067" stopOpacity="0.28" />
            <stop offset="0.75" stopColor="#79ddef" stopOpacity="0.22" />
            <stop offset="1" stopColor="#79ddef" stopOpacity="0" />
          </linearGradient>
        </defs>

        <g fill="none" stroke="#79ddef">
          <circle cx="1260" cy="40" r="150" strokeOpacity="0.045" />
          <circle cx="1260" cy="40" r="260" strokeOpacity="0.03" />
        </g>

        <path
          d="M -20 292 C 260 300 560 270 800 200 S 1080 40 1460 20"
          fill="none"
          stroke="url(#account-route-main)"
          strokeWidth="1.2"
          strokeDasharray="6 12"
          strokeLinecap="round"
        />
        <circle cx="800" cy="200" r="3.5" fill="#ff8067" fillOpacity="0.5" />
      </svg>
    </div>
  );
}
