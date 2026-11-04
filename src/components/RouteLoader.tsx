import styles from "./RouteLoader.module.css";

// Loading animation: a dot travels a short route and lights the three
// stages it passes. Used when leaving the entry page and while /home loads.
export function RouteLoader({ label = "Preparing your route" }: { label?: string }) {
  return (
    <div className={styles.loader} role="status" aria-live="polite">
      <svg className={styles.track} viewBox="0 0 240 48" aria-hidden="true">
        <path className={styles.rail} d="M12 34 C 70 34, 80 14, 120 14 S 170 34, 228 34" />
        <path
          className={styles.line}
          d="M12 34 C 70 34, 80 14, 120 14 S 170 34, 228 34"
          pathLength={1}
        />
        <circle className={styles.stop} data-stop="1" cx="12" cy="34" r="5" />
        <circle className={styles.stop} data-stop="2" cx="120" cy="14" r="5" />
        <circle className={styles.stop} data-stop="3" cx="228" cy="34" r="5" />
      </svg>
      <p className={styles.label}>{label}</p>
    </div>
  );
}
