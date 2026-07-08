import { useMemo, useState } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILIES } from "@/data/families";
import { variantsForFamily, defaultVariantForFamily } from "@/data/variants";
import { imageForVariant } from "@/data/images";
import { BRAND_BY_ID, BRANDS } from "@/data/brands";
import { CATEGORIES, CATEGORY_BY_ID, FORMAT_BY_ID } from "@/data/categories";
import { Segmented, PepperScale } from "@/components/primitives";
import { OperatorNote } from "@/components/employer/OperatorNote/OperatorNote";
import { playSound } from "@/lib/sound/sound";
import {
  ALL_PRODUCT_TYPES,
  SPICE_SOURCE_NOTE,
  spiceLevel,
  spiceName,
  typesForFamily,
  type ProductType,
} from "@/data/spiciness";
import type { BrandId, CategoryId } from "@/types/domain";
import styles from "./PortfolioPulse.module.css";

type ViewMode = "family" | "format";

/** Spiciness facet buttons, hottest first. */
const SPICE_FACET_LEVELS = [5, 4, 3, 2, 1] as const;

export function PortfolioPulse() {
  const { state, dispatch } = useHome();
  const [brandFilter, setBrandFilter] = useState<BrandId | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<CategoryId | "all">("all");
  const [spiceFilter, setSpiceFilter] = useState<number | null>(null);
  const [typeFilter, setTypeFilter] = useState<ProductType | null>(null);
  const [view, setView] = useState<ViewMode>("family");

  const filtered = useMemo(
    () =>
      FAMILIES.filter(
        (f) =>
          (brandFilter === "all" || f.brand === brandFilter) &&
          (categoryFilter === "all" || f.category === categoryFilter) &&
          (spiceFilter === null || spiceLevel(f.id) === spiceFilter) &&
          (typeFilter === null || typesForFamily(f).includes(typeFilter)),
      ),
    [brandFilter, categoryFilter, spiceFilter, typeFilter],
  );

  const totalVariants = useMemo(
    () => filtered.reduce((n, f) => n + f.formats.length, 0),
    [filtered],
  );

  const categoriesInScope = useMemo(() => {
    const ids = new Set(
      FAMILIES.filter((f) => brandFilter === "all" || f.brand === brandFilter).map((f) => f.category),
    );
    return CATEGORIES.filter((c) => ids.has(c.id));
  }, [brandFilter]);

  return (
    <section id="portfolio" className={styles.section} aria-labelledby="portfolio-h">
      <div className={styles.inner}>
        <header className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Explore</p>
            <h2 id="portfolio-h" className={styles.h2}>Portfolio Pulse</h2>
            <p className={styles.lede}>
              Samyang America lists formats as separate products. FireFlow normalizes them into{" "}
              <strong>{FAMILIES.length} families</strong> across <strong>76 formats</strong>, so you browse
              flavors, not repetition. Showing <strong>{filtered.length}</strong> famil
              {filtered.length === 1 ? "y" : "ies"} · <strong>{totalVariants}</strong> formats.
            </p>
          </div>
          <Segmented
            label="Family or format view"
            options={[
              { value: "family", label: "Family view" },
              { value: "format", label: "Format view" },
            ]}
            value={view}
            onChange={setView}
            size="sm"
          />
        </header>

        <OperatorNote
          title="One flavor, several records"
          role="Product and portfolio organization, so allergens and preparation stay tied to the exact format."
        >
          <p>
            A customer sees one flavor. The operation may see several formats, packages, preparation
            methods, and data records. I normalized the portfolio so the interface stays simple without
            erasing the differences that matter.
          </p>
        </OperatorNote>

        <div className={styles.filters}>
          <div className={styles.filterRow} role="group" aria-label="Filter by brand">
            <button
              className={brandFilter === "all" ? `${styles.chip} ${styles.chipOn}` : styles.chip}
              aria-pressed={brandFilter === "all"}
              onClick={() => { setBrandFilter("all"); dispatch({ type: "SET_BRAND", brand: null }); }}
            >
              All brands
            </button>
            {BRANDS.map((b) => (
              <button
                key={b.id}
                className={brandFilter === b.id ? `${styles.chip} ${styles.chipOn}` : styles.chip}
                aria-pressed={brandFilter === b.id}
                onClick={() => { setBrandFilter(b.id); dispatch({ type: "SET_BRAND", brand: b.id }); }}
              >
                <span className={styles.chipDot} style={{ background: `var(${b.accentToken})` }} aria-hidden="true" />
                {b.name}
              </button>
            ))}
          </div>
          <div className={styles.filterRow} role="group" aria-label="Filter by category">
            <button
              className={categoryFilter === "all" ? `${styles.chip} ${styles.chipOn}` : styles.chip}
              aria-pressed={categoryFilter === "all"}
              onClick={() => setCategoryFilter("all")}
            >
              All categories
            </button>
            {categoriesInScope.map((c) => (
              <button
                key={c.id}
                className={categoryFilter === c.id ? `${styles.chip} ${styles.chipOn}` : styles.chip}
                aria-pressed={categoryFilter === c.id}
                onClick={() => setCategoryFilter(c.id)}
              >
                {c.label}
              </button>
            ))}
          </div>

          <div className={styles.facet}>
            <span className={styles.facetLabel} id="pp-spice-label">Spiciness</span>
            <div className={styles.filterRow} role="group" aria-labelledby="pp-spice-label">
              {SPICE_FACET_LEVELS.map((lvl) => {
                const on = spiceFilter === lvl;
                return (
                  <button
                    key={lvl}
                    className={on ? `${styles.spiceChip} ${styles.spiceChipOn}` : styles.spiceChip}
                    aria-pressed={on}
                    aria-label={`${spiceName(lvl)}${on ? " (selected)" : ""}`}
                    onClick={() => setSpiceFilter(on ? null : lvl)}
                  >
                    <PepperScale level={lvl} size="sm" />
                  </button>
                );
              })}
            </div>
            <p className={styles.sourceNote}>{SPICE_SOURCE_NOTE}</p>
          </div>

          <div className={styles.facet}>
            <span className={styles.facetLabel} id="pp-type-label">Type</span>
            <div className={styles.filterRow} role="group" aria-labelledby="pp-type-label">
              {ALL_PRODUCT_TYPES.map((t) => {
                const on = typeFilter === t;
                return (
                  <button
                    key={t}
                    className={on ? `${styles.facetChip} ${styles.facetChipOn}` : styles.facetChip}
                    aria-pressed={on}
                    onClick={() => setTypeFilter(on ? null : t)}
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className={styles.empty}>No families match these filters. Try clearing the category.</p>
        ) : (
          <ul className={styles.grid}>
            {filtered.map((f) => {
              const brand = BRAND_BY_ID[f.brand];
              const selected = f.id === state.selectedFamilyId;
              const variants = variantsForFamily(f.id);
              const defaultVariant = defaultVariantForFamily(f.id);
              const photo = imageForVariant(defaultVariant?.id ?? "", f.id);
              return (
                <li key={f.id}>
                  <div className={selected ? `${styles.card} ${styles.cardOn}` : styles.card}>
                    <span className={styles.cardAccent} style={{ background: `var(${brand?.accentToken})` }} aria-hidden="true" />
                    <button
                      className={styles.cardMain}
                      aria-pressed={selected}
                      onClick={() => {
                        dispatch({ type: "SELECT_FAMILY", familyId: f.id });
                        playSound("select");
                        document.getElementById("product")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                    >
                      <span className={styles.cardMedia}>
                        <span className={styles.cardMediaText} aria-hidden="true">{f.name}</span>
                        {photo && (
                          <img
                            className={styles.cardPhoto}
                            src={photo}
                            alt=""
                            loading="lazy"
                            aria-hidden="true"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        )}
                      </span>
                      <span className={styles.cardBrand}>{brand?.name}</span>
                      <span className={styles.cardName}>{f.name}</span>
                      <span className={styles.cardMeta}>
                        {CATEGORY_BY_ID[f.category]?.label} · {f.formats.length} format{f.formats.length > 1 ? "s" : ""}
                        {f.isAnchor && <span className={styles.anchorTag}>Anchor</span>}
                      </span>
                      <span className={styles.cardSpice}>
                        <PepperScale level={spiceLevel(f.id)} size="sm" />
                      </span>
                    </button>
                    {view === "format" && (
                      <ul className={styles.formatList}>
                        {variants.map((v) => (
                          <li key={v.id}>
                            <button
                              className={v.id === state.selectedVariantId ? `${styles.fmt} ${styles.fmtOn}` : styles.fmt}
                              onClick={() => {
                                dispatch({ type: "SELECT_FAMILY", familyId: f.id });
                                dispatch({ type: "SELECT_VARIANT", variantId: v.id });
                              }}
                            >
                              {FORMAT_BY_ID[v.format]?.label ?? v.format}
                            </button>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
