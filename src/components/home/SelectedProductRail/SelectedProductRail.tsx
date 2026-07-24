import type { CSSProperties, KeyboardEvent } from "react";
import { useId, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { VARIANT_BY_ID } from "@/data/variants";
import { BRAND_BY_ID } from "@/data/brands";
import { CATEGORY_BY_ID } from "@/data/categories";
import { imageForVariant } from "@/data/images";
import { playSound } from "@/lib/sound/sound";
import { useStickyHeightVar } from "@/lib/layout/useStickyHeightVar";
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
  const hasHeat = !!(
    family &&
    family.heatPositioning &&
    family.heatPositioning !== "not-applicable"
  );

  // Mobile-only compact disclosure state. Desktop never reads this.
  const [expanded, setExpanded] = useState(false);
  const expandBtnRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  /* The rail's own height feeds --rail-h (and therefore --sticky-h), which
     drives scroll-margin on every anchored section. It changes when the inner
     row wraps or a product is selected, so it is measured, not assumed. */
  const railRef = useRef<HTMLElement | null>(null);
  useStickyHeightVar(railRef, "--rail-h");

  function handleCompactKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape" && expanded) {
      setExpanded(false);
      expandBtnRef.current?.focus();
    }
  }

  return (
    <aside
      className={styles.rail}
      ref={railRef}
      role="region"
      aria-label="Selected product"
      style={brand ? ({ "--rail-accent": `var(${brand.accentToken})` } as CSSProperties) : undefined}
    >
      <div
        className={
          family && brand ? `${styles.inner} ${styles.innerHasProduct}` : styles.inner
        }
      >
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
              <Link to="/#compare" className={styles.compare}>
                In compare · {state.compareIds.length}
              </Link>
            )}

            <span className={styles.spacer} />

            <Link
              to="/order"
              className={styles.action}
              onClick={() => dispatch({ type: "SET_MODE", mode: "retailer" })}
            >
              Order
            </Link>
            <Link
              to="/support"
              className={styles.action}
              onClick={() => dispatch({ type: "SET_MODE", mode: "retailer" })}
            >
              Account support
            </Link>
            <button
              className={styles.action}
              onClick={() => { dispatch({ type: "ADD_COMPARE", familyId: family.id }); playSound("compareAdd"); }}
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
            No product selected yet. Pick one from the hero or portfolio to carry it through the page.
          </span>
        )}
      </div>

      {/* Mobile-only compact rail: one-row summary + expandable panel. Hidden
          on desktop via CSS; the rich .inner above is hidden on mobile. */}
      {family && brand && (
        <div className={styles.compact} onKeyDown={handleCompactKeyDown}>
          <div className={styles.compactRow}>
            <span className={styles.thumb} aria-hidden="true">
              {photo ? (
                <img className={styles.thumbImg} src={photo} alt="" loading="lazy" />
              ) : (
                <span className={styles.thumbFallback}>{brand.name.charAt(0)}</span>
              )}
            </span>
            <span className={styles.compactName}>{family.name}</span>
            <span className={styles.compactMode}>{state.userMode}</span>
            <button
              type="button"
              ref={expandBtnRef}
              className={styles.expand}
              aria-expanded={expanded}
              aria-controls={panelId}
              aria-label={expanded ? "Hide product actions" : "Show product actions"}
              onClick={() => setExpanded((v) => !v)}
            >
              <span className={styles.expandGlyph} aria-hidden="true">⌄</span>
            </button>
          </div>

          {expanded && (
            <div
              id={panelId}
              className={styles.panel}
              role="group"
              aria-label="Product actions"
            >
              {(variant || hasHeat) && (
                <div className={styles.panelMeta}>
                  {variant && <span>Format · {variant.formatLabel}</span>}
                  {hasHeat && family.heatPositioning && (
                    <span className={styles.heat}>
                      <span className={styles.heatGlyph} aria-hidden="true">◆</span>
                      Heat · {heatLabel(family.heatPositioning)}
                    </span>
                  )}
                </div>
              )}
              <div className={styles.panelActions}>
                <Link
                  to="/order"
                  className={styles.action}
                  onClick={() => dispatch({ type: "SET_MODE", mode: "retailer" })}
                >
                  Order
                </Link>
                <Link
                  to="/support"
                  className={styles.action}
                  onClick={() => dispatch({ type: "SET_MODE", mode: "retailer" })}
                >
                  Account support
                </Link>
                <button
                  type="button"
                  className={styles.action}
                  onClick={() => { dispatch({ type: "ADD_COMPARE", familyId: family.id }); playSound("compareAdd"); }}
                  disabled={inCompare}
                >
                  {inCompare ? "Added to compare" : "Add to compare"}
                </button>
                {state.compareIds.length > 0 && (
                  <Link to="/#compare" className={styles.compare}>
                    In compare · {state.compareIds.length}
                  </Link>
                )}
                <button
                  type="button"
                  className={styles.reset}
                  onClick={() => dispatch({ type: "RESET" })}
                >
                  Reset
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}
