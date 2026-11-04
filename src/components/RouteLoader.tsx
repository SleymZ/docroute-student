import { BRAND_ORANGE, logoMarkPath, logoRoadPath } from "./Logo";
import styles from "./RouteLoader.module.css";

// Loading animation built from the logo: the road markings move towards the
// pin and the pin pulses. Used when leaving the entry page and while /home
// loads.
export function RouteLoader({ label = "Preparing your route" }: { label?: string }) {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <svg className={styles.mark} viewBox="0 0 100 100" aria-hidden="true">
        <circle className={styles.pulse} cx="76" cy="31.5" r="7.5" />
        <path fill={BRAND_ORANGE} fillRule="evenodd" d={logoMarkPath} />
        <path className={styles.road} d={logoRoadPath} />
      </svg>
      <p className={styles.label}>{label}</p>
      <span className={styles.bar} aria-hidden="true" />
    </div>
  );
}
