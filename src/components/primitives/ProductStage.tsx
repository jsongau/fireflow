import { useState, type CSSProperties, type SyntheticEvent } from "react";
import type { Format } from "@/types/domain";
import { imageForVariant } from "@/data/images";
import styles from "./ProductStage.module.css";

interface ProductStageProps {
  name: string;
  brandName: string;
  accentToken: string;      // e.g. "--chili-600"
  formatLabel?: string;
  archetype?: Format["archetype"];
  size?: "hero" | "rail" | "thumb";
  /** Optional ids used to resolve a real product photo. */
  familyId?: string;
  variantId?: string;
}

/**
 * Staged product visual. Renders a labeled, brand-accented package placeholder
 * by format archetype, and — when a real photo is available for the given
 * family/variant — layers that photo on top. If the photo fails to load it is
 * hidden and the placeholder shows through, so the layout stays honest.
 */
export function ProductStage({
  name,
  brandName,
  accentToken,
  formatLabel,
  archetype = "noodle-pack",
  size = "hero",
  familyId,
  variantId,
}: ProductStageProps) {
  const [imgFailed, setImgFailed] = useState(false);
  const photoSrc = imageForVariant(variantId ?? "", familyId ?? "");

  return (
    <div className={`${styles.stage} ${styles[size]}`}>
      <div className={styles.ground} aria-hidden="true" />
      <div
        className={[styles.package, styles[archetype]].filter(Boolean).join(" ")}
        style={{ "--accent": `var(${accentToken})` } as CSSProperties}
        role="img"
        aria-label={`${brandName} ${name}${formatLabel ? `, ${formatLabel}` : ""} — staged placeholder`}
      >
        <span className={styles.brandStrip}>{brandName}</span>
        <span className={styles.name}>{name}</span>
        {formatLabel && <span className={styles.format}>{formatLabel}</span>}
      </div>
      {photoSrc && !imgFailed && (
        <img
          className={styles.photo}
          src={photoSrc}
          loading="lazy"
          alt={`${brandName} ${name}${formatLabel ? `, ${formatLabel}` : ""}`}
          onError={(_e: SyntheticEvent<HTMLImageElement>) => setImgFailed(true)}
        />
      )}
    </div>
  );
}
