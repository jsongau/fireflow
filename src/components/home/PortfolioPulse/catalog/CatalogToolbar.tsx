import { useId, useState } from "react";
import { FAMILIES } from "@/data/families";
import { ALL_PRODUCT_TYPES } from "@/data/spiciness";
import {
  DENSITY_OPTIONS,
  SORT_OPTIONS,
  type CardDensity,
  type CatalogFilterModel,
  type SortId,
} from "./types";
import styles from "./CatalogToolbar.module.css";

export interface CatalogToolbarProps {
  model: CatalogFilterModel;
  /** Open the slide-in filter panel. Parent manages focus return. */
  onOpenPanel: () => void;
}

/** Crisp inline icons for the density switcher (unicode glyphs render
 *  inconsistently across fonts, so we draw them). Decorative; the visible
 *  text label carries the meaning. */
function DensityIcon({ value }: { value: CardDensity }) {
  if (value === "list") {
    return (
      <svg className={styles.densityGlyph} viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
        <rect x="1" y="2.5" width="14" height="2.2" rx="1" />
        <rect x="1" y="6.9" width="14" height="2.2" rx="1" />
        <rect x="1" y="11.3" width="14" height="2.2" rx="1" />
      </svg>
    );
  }
  if (value === "comfortable") {
    return (
      <svg className={styles.densityGlyph} viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
        <rect x="1" y="1" width="6" height="6" rx="1.3" />
        <rect x="9" y="1" width="6" height="6" rx="1.3" />
        <rect x="1" y="9" width="6" height="6" rx="1.3" />
        <rect x="9" y="9" width="6" height="6" rx="1.3" />
      </svg>
    );
  }
  // dense — 3 x 3
  const coords = [1, 6.5, 12];
  return (
    <svg className={styles.densityGlyph} viewBox="0 0 16 16" width="1em" height="1em" aria-hidden="true" focusable="false">
      {coords.flatMap((x) => coords.map((y) => <rect key={`${x}-${y}`} x={x} y={y} width="3" height="3" rx="0.7" />))}
    </svg>
  );
}

/**
 * The result readout, shown as a stat pair rather than a sentence: the number
 * carries the weight and a small uppercase label names the unit. When a filter
 * is active the first stat becomes "12 of 45", so the readout says both what
 * you are seeing and what you are not. aria-live announces filter changes.
 */
function CountReadout({ model }: { model: CatalogFilterModel }) {
  const filtered = model.resultCount !== FAMILIES.length;
  return (
    <p className={styles.count} aria-live="polite">
      <span className={styles.countStat}>
        <strong className={styles.countNum}>{model.resultCount}</strong>
        <span className={styles.countLabel}>
          {filtered ? `of ${FAMILIES.length} products` : "products"}
        </span>
      </span>
      <span className={styles.countRule} aria-hidden="true" />
      <span className={styles.countStat}>
        <strong className={styles.countNum}>{model.totalFormats}</strong>
        <span className={styles.countLabel}>
          {model.totalFormats === 1 ? "format" : "formats"}
        </span>
      </span>
    </p>
  );
}

/**
 * Slim, sticky control bar for the catalog: result readout, search, sort,
 * a density view-switcher, and a Filters button, plus a visible product-type
 * quick-filter row and an active-filter chips row. State is always signaled
 * with aria-pressed plus a shape/weight change and words, never color alone.
 */
export function CatalogToolbar({ model, onOpenPanel }: CatalogToolbarProps) {
  const searchId = useId();
  const sortId = useId();
  const controlsId = useId();

  /* On a phone this sticky bar eats roughly a third of the viewport before a
     single product is visible. Collapsed, it keeps the result count and the
     toggle, so nothing is hidden without a way back, and the count still updates
     as filters change. Above 720px the CSS ignores this flag entirely and the
     controls are always shown; only a phone has to opt in. */
  const [expanded, setExpanded] = useState(false);

  return (
    <div className={styles.bar} data-expanded={expanded ? "true" : "false"}>
      {/* Phone-only summary row. Hidden above 720px. */}
      <div className={styles.compact}>
        <CountReadout model={model} />
        <button
          type="button"
          className={styles.compactToggle}
          aria-expanded={expanded}
          aria-controls={controlsId}
          onClick={() => setExpanded((v) => !v)}
        >
          <span className={styles.compactGlyph} aria-hidden="true">
            {expanded ? "−" : "+"}
          </span>
          {expanded ? "Hide search and filters" : "Search and filters"}
          {model.activeFilterCount > 0 && (
            <span className={styles.badge}> ({model.activeFilterCount})</span>
          )}
        </button>
      </div>

      <div id={controlsId} className={styles.controls}>
        <CountReadout model={model} />

        <div className={styles.searchWrap}>
          <label htmlFor={searchId} className={styles.srOnly}>
            Search products
          </label>
          <input
            id={searchId}
            type="search"
            className={styles.search}
            placeholder="Search products"
            value={model.search}
            onChange={(e) => model.setSearch(e.target.value)}
          />
        </div>

        <div className={styles.sortWrap}>
          <label htmlFor={sortId} className={styles.sortLabel}>
            Sort
          </label>
          <select
            id={sortId}
            className={styles.select}
            value={model.sort}
            onChange={(e) => model.setSort(e.target.value as SortId)}
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.density} role="group" aria-label="View density">
          {DENSITY_OPTIONS.map((o) => {
            const on = model.density === o.value;
            return (
              <button
                key={o.value}
                type="button"
                className={on ? `${styles.densityBtn} ${styles.densityBtnOn}` : styles.densityBtn}
                aria-pressed={on}
                onClick={() => model.setDensity(o.value)}
              >
                <DensityIcon value={o.value} />
                <span className={styles.densityLabel}>{o.label}</span>
              </button>
            );
          })}
        </div>

        <button type="button" className={styles.filtersBtn} onClick={onOpenPanel}>
          Filters
          {model.activeFilterCount > 0 && (
            <span className={styles.badge}> ({model.activeFilterCount})</span>
          )}
        </button>
      </div>

      {/* Product-type quick filter — the primary browse dimension (how a buyer
          actually shops: pouch, cup, sauce, snack), surfaced on the bar so it is
          one click. The finer category facet (Stir-fry Noodles, Glass Noodles,
          and so on) stays in the Filters panel. */}
      <div className={styles.catRow} role="group" aria-label="Filter by product type">
        <span className={styles.catRowLabel} aria-hidden="true">Type</span>
        <button
          type="button"
          className={model.types.size === 0 ? `${styles.catChip} ${styles.catChipOn}` : styles.catChip}
          aria-pressed={model.types.size === 0}
          onClick={() => model.types.forEach((t) => model.toggleType(t))}
        >
          All types
        </button>
        {ALL_PRODUCT_TYPES.map((t) => {
          const on = model.types.has(t);
          const count = model.facetCounts.types[t] ?? 0;
          return (
            <button
              key={t}
              type="button"
              className={on ? `${styles.catChip} ${styles.catChipOn}` : styles.catChip}
              aria-pressed={on}
              data-empty={count === 0 && !on ? "true" : undefined}
              onClick={() => model.toggleType(t)}
            >
              {t}
              <span className={styles.catCount} aria-hidden="true">{count}</span>
            </button>
          );
        })}
      </div>

      {model.activeChips.length > 0 && (
        <div className={styles.chipsRow}>
          <ul className={styles.chipList}>
            {model.activeChips.map((chip) => (
              <li key={chip.id}>
                <button
                  type="button"
                  className={styles.chip}
                  aria-label={`Remove ${chip.group} filter: ${chip.label}`}
                  onClick={chip.onRemove}
                >
                  <span className={styles.chipText}>{chip.label}</span>
                  <span className={styles.chipX} aria-hidden="true">
                    ✕
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <button type="button" className={styles.clearAll} onClick={model.clearAll}>
            Clear all
          </button>
        </div>
      )}
    </div>
  );
}
