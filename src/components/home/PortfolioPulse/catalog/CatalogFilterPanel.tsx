import { useEffect, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { BRANDS } from "@/data/brands";
import { CATEGORIES } from "@/data/categories";
import {
  ALL_PRODUCT_TYPES,
  SPICE_SOURCE_NOTE,
  spiceName,
} from "@/data/spiciness";
import { PepperScale } from "@/components/primitives";
import type { CatalogFilterModel } from "./types";
import styles from "./CatalogFilterPanel.module.css";

export interface CatalogFilterPanelProps {
  model: CatalogFilterModel;
  open: boolean;
  onClose: () => void;
  /** Element focus returns to on close (usually the Filters button). */
  returnFocusTo?: HTMLElement | null;
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, [tabindex]:not([tabindex="-1"])';

/** Heat facet order — hottest first (lead group). */
const HEAT_ORDER = [5, 4, 3, 2, 1] as const;

/**
 * Slide-in filter panel (right side). role="dialog", focus trapped, Escape to
 * close, body scroll locked while open, focus restored on close. Mechanics
 * mirror InquiryDialog. All facet state is conveyed with aria-pressed plus a
 * shape/weight change and live counts, never color alone.
 */
export function CatalogFilterPanel({
  model,
  open,
  onClose,
  returnFocusTo,
}: CatalogFilterPanelProps) {
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const restoreTo = returnFocusTo;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panelRef.current)?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreTo?.focus?.();
    };
    // Set up while open; cleanup restores scroll + focus on close/unmount.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  if (!open) return null;

  const getFocusable = () =>
    Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const list = getFocusable();
    if (list.length === 0) return;
    const first = list[0];
    const last = list[list.length - 1];
    if (!first || !last) return;
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  };

  const onOverlayMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div className={styles.overlay} onMouseDown={onOverlayMouseDown}>
      <div
        ref={panelRef}
        className={styles.panel}
        role="dialog"
        aria-modal="true"
        aria-label="Filter products"
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <header className={styles.head}>
          <h2 className={styles.title}>Filters</h2>
          <div className={styles.headActions}>
            {model.activeFilterCount > 0 && (
              <button type="button" className={styles.clear} onClick={model.clearAll}>
                Clear all
              </button>
            )}
            <button
              type="button"
              className={styles.close}
              onClick={onClose}
              aria-label="Close filters"
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        </header>

        <div className={styles.body}>
          {/* Heat — lead group */}
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Heat</legend>
            <div className={styles.options}>
              {HEAT_ORDER.map((level) => {
                const on = model.heats.has(level);
                const count = model.facetCounts.heats[level] ?? 0;
                return (
                  <button
                    key={level}
                    type="button"
                    className={on ? `${styles.opt} ${styles.optOn}` : styles.opt}
                    aria-pressed={on}
                    onClick={() => model.toggleHeat(level)}
                  >
                    <PepperScale level={level} size="sm" showLabel={false} />
                    <span className={styles.optLabel}>{spiceName(level)}</span>
                    <span className={styles.optCount}>({count})</span>
                  </button>
                );
              })}
            </div>
            <p className={styles.sourceNote}>{SPICE_SOURCE_NOTE}</p>
          </fieldset>

          {/* Type */}
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Type</legend>
            <div className={styles.options}>
              {ALL_PRODUCT_TYPES.map((t) => {
                const on = model.types.has(t);
                const count = model.facetCounts.types[t] ?? 0;
                return (
                  <button
                    key={t}
                    type="button"
                    className={on ? `${styles.opt} ${styles.optOn}` : styles.opt}
                    aria-pressed={on}
                    onClick={() => model.toggleType(t)}
                  >
                    <span className={styles.optLabel}>{t}</span>
                    <span className={styles.optCount}>({count})</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Brand */}
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Brand</legend>
            <div className={styles.options}>
              {BRANDS.map((b) => {
                const on = model.brands.has(b.id);
                const count = model.facetCounts.brands[b.id] ?? 0;
                return (
                  <button
                    key={b.id}
                    type="button"
                    className={on ? `${styles.opt} ${styles.optOn}` : styles.opt}
                    aria-pressed={on}
                    onClick={() => model.toggleBrand(b.id)}
                  >
                    <span className={styles.optLabel}>{b.name}</span>
                    <span className={styles.optCount}>({count})</span>
                  </button>
                );
              })}
            </div>
          </fieldset>

          {/* Category */}
          <fieldset className={styles.group}>
            <legend className={styles.legend}>Category</legend>
            <div className={styles.options}>
              {CATEGORIES.map((c) => {
                const on = model.categories.has(c.id);
                const count = model.facetCounts.categories[c.id] ?? 0;
                return (
                  <button
                    key={c.id}
                    type="button"
                    className={on ? `${styles.opt} ${styles.optOn}` : styles.opt}
                    aria-pressed={on}
                    onClick={() => model.toggleCategory(c.id)}
                  >
                    <span className={styles.optLabel}>{c.label}</span>
                    <span className={styles.optCount}>({count})</span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <footer className={styles.foot}>
          <button type="button" className={styles.show} onClick={onClose}>
            Show {model.resultCount} products
          </button>
        </footer>
      </div>
    </div>
  );
}
