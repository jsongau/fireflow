import { SPICE_LEVELS, spiceName } from "@/data/spiciness";
import styles from "./PepperScale.module.css";

const CHILI_PATH =
  "M16.5 2.2c-.5.9-.3 1.9.4 2.5-2.1.2-3.9 1.3-3.9 3.9 0 .8-.4 1.1-1.2 1.4C8.6 11 5 13.4 5 17.7c0 2.4 1.9 4.1 4.4 4.1 5.6 0 10.6-5.3 10.6-11.6 0-2.1-.6-3.9-1.7-5.2.9-.2 1.7-1 1.7-2 0-1.2-1-2.1-2.2-2.1-.6 0-1.1.5-1.3 1.1z";

const TOTAL = SPICE_LEVELS.length - 1; // 5 peppers on the scale

export interface PepperScaleProps {
  level: number;
  showLabel?: boolean;
  size?: "sm" | "md";
}

/**
 * Five-pepper heat indicator. The first `level` peppers read as "lit"; the rest
 * are dimmed. The heat word is always available — visibly (when showLabel) or
 * via aria-label — so spiciness is never conveyed by icon/color alone.
 */
export function PepperScale({ level, showLabel = true, size = "md" }: PepperScaleProps) {
  const filled = Math.max(0, Math.min(TOTAL, Math.floor(level)));
  const name = spiceName(level);
  const wrapClass = size === "sm" ? `${styles.wrap} ${styles.sm}` : styles.wrap;

  return (
    <span className={wrapClass} role="img" aria-label={`Spiciness: ${name}`}>
      <span className={styles.peppers} aria-hidden="true">
        {Array.from({ length: TOTAL }, (_, i) => (
          <svg
            key={i}
            className={i < filled ? styles.pepperOn : styles.pepperOff}
            viewBox="0 0 24 24"
            width="1em"
            height="1em"
            aria-hidden="true"
            focusable="false"
          >
            <path d={CHILI_PATH} fill="currentColor" />
          </svg>
        ))}
      </span>
      {showLabel && (
        <span className={filled === 0 ? styles.labelMuted : styles.label}>{name}</span>
      )}
    </span>
  );
}
