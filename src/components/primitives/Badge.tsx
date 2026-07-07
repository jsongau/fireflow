import type { SourceType, Confidence } from "@/types/domain";
import { SOURCE_TYPES } from "@/data/sources";
import styles from "./Badge.module.css";

/** Source-type badge — dot keyed to a token + text label (never color alone). */
export function SourceBadge({ type }: { type: SourceType }) {
  const meta = SOURCE_TYPES[type];
  return (
    <span className={styles.badge} data-source={type}>
      <span className={styles.dot} style={{ background: `var(${meta.token})` }} aria-hidden="true" />
      {meta.short}
    </span>
  );
}

/** Confidence badge — text label + filled dots, never color alone. */
export function ConfidenceBadge({ level }: { level: Confidence }) {
  const filled = level === "high" ? 3 : level === "medium" ? 2 : 1;
  return (
    <span className={styles.badge} data-confidence={level}>
      <span className={styles.dots} aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <span key={i} className={i < filled ? styles.dotOn : styles.dotOff} />
        ))}
      </span>
      {level.charAt(0).toUpperCase() + level.slice(1)} confidence
    </span>
  );
}

/** Plain synthetic-data marker for operational content. */
export function SyntheticBadge() {
  return (
    <span className={styles.badge} data-source="synthetic">
      <span className={styles.dot} style={{ background: "var(--src-synthetic)" }} aria-hidden="true" />
      Synthetic
    </span>
  );
}
