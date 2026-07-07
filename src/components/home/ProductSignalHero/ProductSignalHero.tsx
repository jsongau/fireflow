import { useState } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILIES, FAMILY_BY_ID } from "@/data/families";
import { VARIANT_BY_ID } from "@/data/variants";
import { BRAND_BY_ID } from "@/data/brands";
import { Button, Segmented, ProductStage, SourceBadge } from "@/components/primitives";
import { FORMAT_BY_ID, CATEGORY_BY_ID } from "@/data/categories";
import styles from "./ProductSignalHero.module.css";

const BRAND_FILTERS = [
  { value: "featured", label: "Featured" },
  { value: "buldak", label: "Buldak" },
  { value: "samyang", label: "Samyang" },
  { value: "tangle", label: "Tangle" },
  { value: "mep", label: "MEP" },
] as const;

type BrandFilter = (typeof BRAND_FILTERS)[number]["value"];

function picksFor(filter: BrandFilter) {
  if (filter === "featured") return FAMILIES.filter((f) => f.isAnchor);
  return FAMILIES.filter((f) => f.brand === filter && (f.popularityTier === "A" || f.popularityTier === "B")).slice(0, 8);
}

export function ProductSignalHero() {
  const { state, dispatch } = useHome();
  const [filter, setFilter] = useState<BrandFilter>(
    (state.selectedBrand as BrandFilter) ?? "featured",
  );

  const family = state.selectedFamilyId ? FAMILY_BY_ID[state.selectedFamilyId] ?? null : null;
  const variant = state.selectedVariantId ? VARIANT_BY_ID[state.selectedVariantId] ?? null : null;
  const picks = picksFor(filter);
  const brand = family ? BRAND_BY_ID[family.brand] : null;

  return (
    <section id="hero" className={styles.hero} data-surface="dark" aria-labelledby="hero-h">
      <div className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.eyebrow}>FireFlow Product Intelligence</p>
          <h1 id="hero-h" className={styles.h1}>
            Know the product. Understand the friction. Resolve the experience.
          </h1>
          <p className={styles.lede}>
            Explore Samyang America&rsquo;s public U.S. product portfolio, compare how each product is
            experienced, and see how consumer and vendor questions become structured Customer Experience
            workflows.
          </p>

          {state.returningUser && family && (
            <p className={styles.returning}>
              Welcome back. Picking up where you left off: <strong>{family.name}</strong>.{" "}
              <button className={styles.textBtn} onClick={() => dispatch({ type: "RESET" })}>
                Start fresh
              </button>
            </p>
          )}

          <div className={styles.controls}>
            <div className={styles.controlBlock}>
              <span className={styles.controlLabel} id="hero-brand-label">Browse by brand</span>
              <Segmented
                label="Filter products by brand"
                options={BRAND_FILTERS.map((b) => ({ value: b.value, label: b.label }))}
                value={filter}
                onChange={(v) => setFilter(v)}
                size="sm"
              />
            </div>
          </div>

          <ul className={styles.picks} aria-label="Choose a product">
            {picks.map((f) => {
              const selected = f.id === state.selectedFamilyId;
              return (
                <li key={f.id}>
                  <button
                    className={selected ? `${styles.pick} ${styles.pickOn}` : styles.pick}
                    aria-pressed={selected}
                    onClick={() => dispatch({ type: "SELECT_FAMILY", familyId: f.id })}
                  >
                    {f.name}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className={styles.focus}>
          {family && brand ? (
            <>
              <ProductStage
                name={family.name}
                brandName={brand.name}
                accentToken={brand.accentToken}
                formatLabel={variant?.formatLabel}
                archetype={variant ? FORMAT_BY_ID[variant.format]?.archetype : undefined}
                familyId={family.id}
                variantId={variant?.id}
                size="hero"
              />
              <div className={styles.focusMeta}>
                <p className={styles.focusName}>{family.name}</p>
                <p className={styles.focusSub}>
                  {brand.name} · {CATEGORY_BY_ID[family.category]?.label}
                  {variant ? ` · ${variant.formatLabel}` : ""}
                </p>
                {family.source && <SourceBadge type={family.source.type} />}
                <div className={styles.actions}>
                  <a href="#product">
                    <Button variant="primary" size="sm">Explore product</Button>
                  </a>
                  <a href="#compare" onClick={() => dispatch({ type: "ADD_COMPARE", familyId: family.id })}>
                    <Button variant="secondary" size="sm">Compare</Button>
                  </a>
                  <a href="#resolve" onClick={() => dispatch({ type: "SET_MODE", mode: "consumer" })}>
                    <Button variant="secondary" size="sm">Ask as a consumer</Button>
                  </a>
                  <a href="#resolve" onClick={() => dispatch({ type: "SET_MODE", mode: "vendor" })}>
                    <Button variant="secondary" size="sm">Ask as a vendor</Button>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className={styles.empty}>
              <p className={styles.emptyTitle}>Pick a product to begin</p>
              <p className={styles.emptyBody}>
                Choose one of the featured products to see how FireFlow carries it through discovery,
                comparison, and support.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
