import type { CSSProperties } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { VARIANT_BY_ID } from "@/data/variants";
import { BRAND_BY_ID } from "@/data/brands";
import { CATEGORY_BY_ID } from "@/data/categories";
import { imageForVariant } from "@/data/images";
import styles from "./SelectedProductRail.module.css";

/** Turn a heat-positioning token into a plain word ("very-hot" -> "Very hot"). */
function heatLabel(positioning: string): string {
  const words = positioning.replace(/-/g, " ");
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Rich selected-product context rail (docs/homepage/10). A sticky top bar that
 * carries the current product — photo, brand accent, heat, mode, compare count
 * — through the page so context is never lost, and offers the four primary
 * actions (consumer care, vendor support, add to compare, reset). When nothing
 * is selected it shows a short prompt instead.
 */
export function SelectedProductRail() {
  const { state, dispatch } = useHome();
  const family = state.selectedFamilyId ? FAMILY_BY_ID[state.selectedFamilyId] ?? null : null;
  const variant = state.selectedVariantId ? VARIANT_BY_ID[state.selectedVariantId] ?? null : null;
  const brand = family ? BRAND_BY_ID[family.brand] ?? null : null;
  const category = family ? CATEGORY_BY_ID[family.category] ?? null : null;
  const photo = family ? imageForVariant(variant?.id ?? "", family.id) : null;
  const inCompare = family ? state.compareIds.includes(family.id) : false;

  return (
    <aside
      className={styles.rail}
      role="region"
      aria-label="Selected product"
      style={brand ? ({ "--rail-accent": `var(${brand.accentToken})` } as CSSProperties) : undefined}
    >
      <div className={styles.inner}>
        {family && brand ? (
          <>
            <span className={styles.accentBar} aria-hidden="true" />

            <span className={styles.thumb} aria-hidden="true">
              {photo ? (
                <img className={styles.thumbImg} src={photo} alt="" loading="lazy" />
              ) : (
                <span className={styles.thumbFallback}>{brand.name.charAt(0)}</span>
              )}
            </span>

            <span className={styles.identity}>
              <span className={styles.name}>
                {family.name}
                {variant && <span className={styles.format}> · {variant.formatLabel}</span>}
              </span>
              <span className={styles.meta}>
                {brand.name}
                {category ? ` · ${category.label}` : ""}
              </span>
            </span>

            {family.heatPositioning && family.heatPositioning !== "not-applicable" && (
              <span className={styles.heat} title="Editorial heat positioning">
                <span className={styles.heatGlyph} aria-hidden="true">◆</span>
                Heat · {heatLabel(family.heatPositioning)}
              </span>
            )}

            <span className={styles.mode} data-mode={state.userMode}>
              Mode · <strong>{state.userMode}</strong>
            </span>

            {state.compareIds.length > 0 && (
              <a href="#compare" className={styles.compare}>
                In compare · {state.compareIds.length}
              </a>
            )}

            <span className={styles.spacer} />

            <a
              href="#resolve"
              className={styles.action}
              onClick={() => dispatch({ type: "SET_MODE", mode: "consumer" })}
            >
              Consumer care
            </a>
            <a
              href="#resolve"
              className={styles.action}
              onClick={() => dispatch({ type: "SET_MODE", mode: "vendor" })}
            >
              Vendor support
            </a>
            <button
              className={styles.action}
              onClick={() => dispatch({ type: "ADD_COMPARE", familyId: family.id })}
              disabled={inCompare}
            >
              {inCompare ? "Added to compare" : "Add to compare"}
            </button>
            <button className={styles.reset} onClick={() => dispatch({ type: "RESET" })}>
              Reset
            </button>
          </>
        ) : (
          <span className={styles.hint}>
            No product selected yet — pick one from the hero or portfolio to carry it through the page.
          </span>
        )}
      </div>
    </aside>
  );
}
