import { BRAND_BY_ID } from "@/data/brands";
import { CATEGORY_BY_ID } from "@/data/categories";
import { defaultVariantForFamily } from "@/data/variants";
import { imageForVariant } from "@/data/images";
import { spiceLevel, spiceName } from "@/data/spiciness";
import { PepperScale } from "@/components/primitives";
import type { ProductCardProps } from "./types";
import styles from "./ProductCard.module.css";

/**
 * A single catalog product family, rendered in one of three densities
 * (comfortable grid card, dense grid tile, or horizontal list row).
 *
 * The whole card is a real <button> whose accessible name is the family name.
 * State (heat, selected, compared, saved) is always carried by a word or glyph,
 * never by color alone, so it stays colorblind-safe.
 */
export function ProductCard({ family, density, selected, compared, saved, onOpen }: ProductCardProps) {
  const brand = BRAND_BY_ID[family.brand];
  const categoryLabel = CATEGORY_BY_ID[family.category]?.label;
  const defaultVariant = defaultVariantForFamily(family.id);
  const photo = imageForVariant(defaultVariant?.id ?? "", family.id);
  const level = spiceLevel(family.id);
  const heatWord = spiceName(level);
  const description = family.blurb ?? family.flavorStory ?? family.officialPositioning ?? null;
  const formatCount = family.formats.length;
  const formatWord = formatCount === 1 ? "format" : "formats";
  const accent = brand?.accentToken ? `var(${brand.accentToken})` : "var(--accent)";

  const rootClass = [
    styles.card,
    density === "list" ? styles.list : density === "dense" ? styles.dense : styles.comfortable,
    selected ? styles.selected : "",
  ]
    .filter(Boolean)
    .join(" ");

  /** State chips: each pairs a word with a glyph so state is never color-only. */
  const badges = (compared || saved || selected) && (
    <span className={styles.badges}>
      {selected && (
        <span className={`${styles.badge} ${styles.badgeSelected}`}>Selected</span>
      )}
      {compared && (
        <span className={`${styles.badge} ${styles.badgeCompare}`}>In compare {"✓"}</span>
      )}
      {saved && (
        <span className={`${styles.badge} ${styles.badgeSaved}`}>Saved {"✓"}</span>
      )}
    </span>
  );

  const photoImg = photo && (
    <img
      className={styles.photo}
      src={photo}
      alt=""
      aria-hidden="true"
      loading="lazy"
      onError={(e) => {
        e.currentTarget.style.display = "none";
      }}
    />
  );

  if (density === "list") {
    return (
      <button
        type="button"
        className={rootClass}
        aria-pressed={selected}
        onClick={() => onOpen(family.id)}
      >
        <span className={styles.accent} style={{ background: accent }} aria-hidden="true" />
        <span className={styles.listThumb}>
          <span className={styles.mediaText} aria-hidden="true">{family.name}</span>
          {photoImg}
        </span>
        <span className={styles.listMain}>
          <span className={styles.name}>{family.name}</span>
          <span className={styles.meta}>
            {categoryLabel} {"·"} {formatCount} {formatWord}
          </span>
          {description && <span className={`${styles.desc} ${styles.descOne}`}>{description}</span>}
          {badges}
        </span>
        <span className={styles.listSide}>
          <span className={styles.spice}>
            <PepperScale level={level} size="sm" showLabel={false} />
            <span className={styles.spiceWord}>{heatWord}</span>
          </span>
          <span className={styles.view} aria-hidden="true">View</span>
        </span>
      </button>
    );
  }

  if (density === "dense") {
    return (
      <button
        type="button"
        className={rootClass}
        aria-pressed={selected}
        onClick={() => onOpen(family.id)}
      >
        <span className={styles.accent} style={{ background: accent }} aria-hidden="true" />
        <span className={styles.body}>
          <span className={styles.media}>
            <span className={styles.mediaText} aria-hidden="true">{family.name}</span>
            {photoImg}
          </span>
          <span className={styles.name}>{family.name}</span>
          <span className={styles.spice}>
            <PepperScale level={level} size="sm" showLabel={false} />
            <span className={styles.srOnly}>Spiciness: {heatWord}</span>
          </span>
          {badges}
        </span>
      </button>
    );
  }

  // "comfortable" — the default, richest card.
  return (
    <button
      type="button"
      className={rootClass}
      aria-pressed={selected}
      onClick={() => onOpen(family.id)}
    >
      <span className={styles.accent} style={{ background: accent }} aria-hidden="true" />
      <span className={styles.body}>
        <span className={styles.media}>
          <span className={styles.mediaText} aria-hidden="true">{family.name}</span>
          {photoImg}
        </span>
        {brand?.name && <span className={styles.brand}>{brand.name}</span>}
        <span className={styles.name}>{family.name}</span>
        <span className={styles.meta}>
          {categoryLabel} {"·"} {formatCount} {formatWord}
          {family.isAnchor && <span className={styles.anchorTag}>Anchor</span>}
        </span>
        <span className={styles.spice}>
          <PepperScale level={level} size="sm" showLabel={false} />
          <span className={styles.spiceWord}>{heatWord}</span>
        </span>
        {description && <span className={styles.desc}>{description}</span>}
        {badges}
      </span>
    </button>
  );
}
