import type { OfficialSource } from "@/types/admission";
import styles from "./AdmissionSources.module.css";

export function AdmissionSources({
  sourceIds,
  sources,
}: {
  sourceIds: readonly string[];
  sources: readonly OfficialSource[];
}) {
  return (
    <span className={styles.sources}>
      {sources
        .filter((source) => sourceIds.includes(source.id))
        .map((source) => (
          <a
            key={source.id}
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            {source.title} · checked {source.checkedAt}
          </a>
        ))}
    </span>
  );
}
