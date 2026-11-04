import {
  BRAND_COLOR,
  LOGO_GLOBE,
  LOGO_INK,
  logoEuropePath,
  logoPlanePath,
  logoSwooshPath,
} from "./Logo";
import styles from "./RouteLoader.module.css";

// Loading animation built from the logo: the plane circles the globe and
// the route under it sweeps in. Used when leaving the entry page and while
// /home loads.
export function RouteLoader({ label = "Preparing your route" }: { label?: string }) {
  const { cx, cy, r } = LOGO_GLOBE;
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <svg className={styles.mark} viewBox="0 0 100 100" aria-hidden="true">
        <circle cx={cx} cy={cy} r={r} fill="none" style={{ stroke: LOGO_INK }} strokeWidth={5.5} />
        <path style={{ fill: BRAND_COLOR }} d={logoEuropePath} />
        <path className={styles.swoosh} style={{ fill: BRAND_COLOR }} d={logoSwooshPath} />
        <g className={styles.orbit}>
          {/* On the ring at the top, pointing along it (clockwise). The halo
              cuts the ring under the plane. */}
          <path
            className={styles.plane}
            style={{ fill: LOGO_INK }}
            transform={`translate(${cx} ${cy - r}) scale(1.3)`}
            d={logoPlanePath}
          />
        </g>
      </svg>
      <p className={styles.label}>{label}</p>
      <span className={styles.bar} aria-hidden="true" />
    </div>
  );
}
