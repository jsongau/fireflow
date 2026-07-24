import { useEffect, useId, useRef, type KeyboardEvent, type MouseEvent } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { defaultVariantForFamily } from "@/data/variants";
import { imageForVariant } from "@/data/images";
import { BRAND_BY_ID } from "@/data/brands";
import { CATEGORY_BY_ID } from "@/data/categories";
import { spiceLevel, spiceName, typesForFamily, SPICE_SOURCE_NOTE } from "@/data/spiciness";
import { PepperScale } from "@/components/primitives";
import { playSound } from "@/lib/sound/sound";
import styles from "./ProductQuickView.module.css";

/*
 * ProductQuickView — a product action modal opened when a catalog card is
 * clicked. It shows a quick summary and the actions a trade account can take,
 * instead of jumping straight to the full dossier. "View full profile in
 * detail" is the prominent link to the full ProductDossier (#product).
 *
 * Accessibility follows the WAI-ARIA dialog pattern used across FireFlow:
 * role="dialog", aria-modal, labelled by the product name, focus trapped,
 * Escape closes, body scroll locked, focus returned to the triggering card.
 * State (saved / in compare) is signaled with a word and glyph, never color.
 */

const FOCUSABLE =
  'a[href], button:not([disabled]), input, textarea, select, [tabindex]:not([tabindex="-1"])';

interface ProductQuickViewProps {
  familyId: string;
  onClose: () => void;
  /** Element to return focus to on close (the card that opened this). */
  returnFocusTo?: HTMLElement | null;
}

export function ProductQuickView({ familyId, onClose, returnFocusTo }: ProductQuickViewProps) {
  const { state, dispatch } = useHome();
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);

  const family = FAMILY_BY_ID[familyId];

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const first = panelRef.current?.querySelector<HTMLElement>(FOCUSABLE);
    (first ?? panelRef.current)?.focus();
    playSound("modalOpen");
    return () => {
      document.body.style.overflow = prevOverflow;
      returnFocusTo?.focus();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!family) return null;

  const brand = BRAND_BY_ID[family.brand];
  const categoryLabel = CATEGORY_BY_ID[family.category]?.label ?? family.category;
  const defaultVariant = defaultVariantForFamily(family.id);
  const photo = imageForVariant(defaultVariant?.id ?? "", family.id);
  const level = spiceLevel(family.id);
  const heatWord = spiceName(level);
  const description = family.blurb ?? family.flavorStory ?? family.officialPositioning ?? null;
  const types = typesForFamily(family);
  const formatCount = family.formats.length;

  const compared = state.compareIds.includes(family.id);
  const saved = state.savedProductIds.includes(family.id);
  const compareFull = state.compareIds.length >= 2 && !compared;

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.preventDefault();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const list = Array.from(panelRef.current?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []);
    if (list.length === 0) return;
    const first = list[0]!;
    const last = list[list.length - 1]!;
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

  const goTo = (id: string) => {
    dispatch({ type: "SELECT_FAMILY", familyId: family.id });
    playSound("select");
    onClose();
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    });
  };

  const toggleCompare = () => {
    if (compared) dispatch({ type: "REMOVE_COMPARE", familyId: family.id });
    else if (!compareFull) dispatch({ type: "ADD_COMPARE", familyId: family.id });
  };

  return (
    <div className={styles.overlay} onMouseDown={onOverlayMouseDown}>
      <div
        ref={panelRef}
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        onKeyDown={onKeyDown}
      >
        <button type="button" className={styles.close} onClick={onClose} aria-label="Close product preview">
          &times;
        </button>

        <div className={styles.media}>
          <span className={styles.mediaText} aria-hidden="true">{family.name}</span>
          {photo && (
            <img
              className={styles.photo}
              src={photo}
              alt=""
              aria-hidden="true"
              loading="lazy"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <span className={styles.accent} style={{ background: `var(${brand?.accentToken ?? "--accent"})` }} aria-hidden="true" />
        </div>

        <div className={styles.body}>
          <p className={styles.brand}>{brand?.name}</p>
          <h3 id={titleId} className={styles.name}>{family.name}</h3>

          <p className={styles.meta}>
            {categoryLabel} <span aria-hidden="true">·</span> {formatCount} format{formatCount === 1 ? "" : "s"}
            {family.isAnchor && <span className={styles.anchorTag}>Anchor</span>}
          </p>

          <div className={styles.heat}>
            <PepperScale level={level} size="sm" />
            <span className={styles.heatWord}>Heat: {heatWord}</span>
          </div>

          {description && <p className={styles.desc}>{description}</p>}

          {types.length > 0 && (
            <p className={styles.facts}>
              <span className={styles.factLabel}>Available as</span> {types.join(", ")}
            </p>
          )}

          <p className={styles.sourceNote}>{SPICE_SOURCE_NOTE}</p>

          {/* Primary action */}
          <div className={styles.primaryRow}>
            <button type="button" className={styles.primaryBtn} onClick={() => goTo("order")}>
              Order this product
            </button>
          </div>

          {/* Secondary actions */}
          <div className={styles.actionRow}>
            <button
              type="button"
              className={styles.secondaryBtn}
              aria-pressed={compared}
              disabled={compareFull}
              onClick={toggleCompare}
            >
              {compared ? "In compare ✓" : compareFull ? "Compare is full (2)" : "Add to compare"}
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              aria-pressed={saved}
              onClick={() => dispatch({ type: "TOGGLE_SAVE", familyId: family.id })}
            >
              {saved ? "Saved ✓" : "Save to shortlist"}
            </button>
            <button type="button" className={styles.secondaryBtn} onClick={() => goTo("resolve")}>
              Open account support
            </button>
          </div>

          {/* Prominent full-profile link */}
          <button type="button" className={styles.profileLink} onClick={() => goTo("product")}>
            View full profile in detail
          </button>
        </div>
      </div>
    </div>
  );
}
