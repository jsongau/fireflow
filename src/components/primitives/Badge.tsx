import type { SourceType, Confidence } from "@/types/domain";
import { SOURCE_TYPES } from "@/data/sources";
import styles from "./Badge.module.css";

/** Source-type badge — a plain text label. The word carries the meaning; the
    old colored dot was decoration, and the site's dot pills were retired. */
export function SourceBadge({ type }: { type: SourceType }) {
  const meta = SOURCE_TYPES[type];
  return (
    <span className={styles.badge} data-source={type}>
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

/* SyntheticBadge was removed 2026-07-10. Every section that carried the pill
   now carries a Nathan's Note that says what the section is and why its data
   is synthetic, which does the disclosure work with reasoning instead of a
   glowing dot. Do not reintroduce a dot-pill for this. */
