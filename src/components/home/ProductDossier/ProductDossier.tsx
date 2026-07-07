import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { VARIANT_BY_ID, variantsForFamily } from "@/data/variants";
import { BRAND_BY_ID } from "@/data/brands";
import { CATEGORY_BY_ID, FORMAT_BY_ID } from "@/data/categories";
import { VERIFY_PACKAGE_REMINDER } from "@/data/sources";
import { imageForVariant } from "@/data/images";
import { Button, Segmented, ProductStage, SourceBadge, ConfidenceBadge } from "@/components/primitives";
import type { HeatPositioning, ServingStyle } from "@/types/domain";
import styles from "./ProductDossier.module.css";

const HEAT_LABEL: Record<HeatPositioning, string> = {
  mild: "Mild", moderate: "Moderate heat", hot: "Hot", "very-hot": "Very hot",
  extreme: "Extreme heat", "sauce-dependent": "Sauce-dependent", "not-applicable": "—",
};
const SERVING_LABEL: Record<ServingStyle, string> = {
  "stir-fry": "Stir-fry", soup: "Soup", sauce: "Condiment", snack: "Snack", "frozen-meal": "Frozen meal",
};

export function ProductDossier() {
  const { state, dispatch } = useHome();
  const family = state.selectedFamilyId ? FAMILY_BY_ID[state.selectedFamilyId] ?? null : null;

  if (!family) {
    return (
      <section id="product" className={styles.section} aria-labelledby="product-h">
        <div className={styles.inner}>
          <p className={styles.eyebrow}>Explore</p>
          <h2 id="product-h" className={styles.h2}>Product Dossier</h2>
          <p className={styles.prompt}>Select a product from the portfolio to open its dossier.</p>
        </div>
      </section>
    );
  }

  const brand = BRAND_BY_ID[family.brand]!;
  const variants = variantsForFamily(family.id);
  const variant = state.selectedVariantId ? VARIANT_BY_ID[state.selectedVariantId] ?? variants[0]! : variants[0]!;
  const saved = state.savedProductIds.includes(family.id);

  return (
    <section id="product" className={styles.section} aria-labelledby="product-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Explore</p>
        <h2 id="product-h" className={styles.h2}>Product Dossier</h2>

        <div className={styles.grid}>
          <div className={styles.left}>
            <ProductStage
              name={family.name}
              brandName={brand.name}
              accentToken={brand.accentToken}
              formatLabel={variant.formatLabel}
              archetype={FORMAT_BY_ID[variant.format]?.archetype}
              size="hero"
              familyId={family.id}
              variantId={variant.id}
            />
            <div className={styles.formatPick}>
              <span className={styles.fieldLabel} id="dossier-format">Format</span>
              <Segmented
                label="Choose a format"
                options={variants.map((v) => ({ value: v.id, label: v.formatLabel }))}
                value={variant.id}
                onChange={(id) => dispatch({ type: "SELECT_VARIANT", variantId: id })}
                size="sm"
              />
            </div>
            <div className={styles.saveRow}>
              <Button variant={saved ? "secondary" : "ghost"} size="sm" onClick={() => dispatch({ type: "TOGGLE_SAVE", familyId: family.id })}>
                {saved ? "Saved" : "Save product"}
              </Button>
            </div>
          </div>

          <div className={styles.right}>
            <p className={styles.brandLine}>{brand.name} · {CATEGORY_BY_ID[family.category]?.label}</p>
            <h3 className={styles.name}>{family.name}</h3>
            {family.flavorStory && <p className={styles.story}>{family.flavorStory}</p>}

            <dl className={styles.attrs}>
              {family.heatPositioning && (
                <div><dt>Heat</dt><dd>{HEAT_LABEL[family.heatPositioning]}</dd></div>
              )}
              {family.servingStyle && (
                <div><dt>Style</dt><dd>{SERVING_LABEL[family.servingStyle]}</dd></div>
              )}
              {typeof family.creaminess === "number" && (
                <div><dt>Creaminess <span className={styles.ed}>(editorial)</span></dt><dd>{family.creaminess}/5</dd></div>
              )}
              <div><dt>Formats</dt><dd>{variants.map((v) => v.formatLabel).join(", ")}</dd></div>
            </dl>

            <div className={styles.factCard}>
              <div className={styles.factHead}>
                <h4>For {variant.formatLabel}</h4>
                <ConfidenceBadge level={variant.dataConfidence} />
              </div>

              <div className={styles.fact}>
                <span className={styles.factLabel}>Allergens</span>
                {variant.allergens?.length ? (
                  <span className={styles.factValue}>
                    {variant.allergens.join(", ")}
                    {variant.allergenSource && <SourceBadge type={variant.allergenSource.type} />}
                  </span>
                ) : (
                  <span className={styles.factUnknown}>
                    Not in our public data for this exact format. Verify the current package.
                  </span>
                )}
              </div>

              <div className={styles.fact}>
                <span className={styles.factLabel}>Preparation</span>
                {variant.preparation ? (
                  <span className={styles.factValue}>{variant.preparation}</span>
                ) : (
                  <span className={styles.factUnknown}>Format-specific preparation not in public data — verify the package.</span>
                )}
              </div>

              {variant.components?.length ? (
                <div className={styles.fact}>
                  <span className={styles.factLabel}>In the package</span>
                  <span className={styles.factValue}>{variant.components.join(" · ")}</span>
                </div>
              ) : null}

              {variant.storage && (
                <div className={styles.fact}>
                  <span className={styles.factLabel}>Storage</span>
                  <span className={styles.factValue}>
                    {variant.storage === "refrigerate-after-opening" ? "Refrigerate after opening" : variant.storage === "frozen" ? "Keep frozen" : "Ambient"}
                  </span>
                </div>
              )}

              {variant.retailSignals?.length ? (
                <div className={styles.fact}>
                  <span className={styles.factLabel}>Retail signal <SourceBadge type="retail-signal" /></span>
                  <span className={styles.factValue}>
                    {variant.retailSignals.map((s) => `${s.retailer}: ${s.marker} (${s.snapshotDate})`).join(" · ")}
                  </span>
                </div>
              ) : null}

              <p className={styles.reminder}>{VERIFY_PACKAGE_REMINDER}</p>
            </div>

            {(family.consumerQuestions?.length || family.vendorQuestions?.length) && (
              <div className={styles.questions}>
                {family.consumerQuestions?.length ? (
                  <div className={state.userMode === "vendor" ? styles.qBlockMuted : styles.qBlock}>
                    <h4>Common consumer questions</h4>
                    <ul>{family.consumerQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                  </div>
                ) : null}
                {family.vendorQuestions?.length ? (
                  <div className={state.userMode === "consumer" ? styles.qBlockMuted : styles.qBlock}>
                    <h4>Common vendor questions</h4>
                    <ul>{family.vendorQuestions.map((q, i) => <li key={i}>{q}</li>)}</ul>
                  </div>
                ) : null}
              </div>
            )}

            {family.relatedFamilyIds?.length ? (
              <div className={styles.related}>
                <span className={styles.fieldLabel}>Related</span>
                <div className={styles.relatedChips}>
                  {family.relatedFamilyIds.map((id) => {
                    const rel = FAMILY_BY_ID[id];
                    if (!rel) return null;
                    const relPhoto = imageForVariant("", id);
                    return (
                      <button key={id} className={styles.relChip} onClick={() => dispatch({ type: "SELECT_FAMILY", familyId: id })}>
                        {relPhoto && (
                          <img
                            className={styles.relThumb}
                            src={relPhoto}
                            alt=""
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
                          />
                        )}
                        {rel.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            <div className={styles.dossierActions}>
              <a href="#resolve" onClick={() => dispatch({ type: "SET_MODE", mode: "consumer" })}>
                <Button variant="primary" size="sm">Ask as a consumer</Button>
              </a>
              <a href="#vendor" onClick={() => dispatch({ type: "SET_MODE", mode: "vendor" })}>
                <Button variant="secondary" size="sm">Ask as a vendor</Button>
              </a>
              <a href="#compare" onClick={() => dispatch({ type: "ADD_COMPARE", familyId: family.id })}>
                <Button variant="ghost" size="sm">Add to compare</Button>
              </a>
            </div>

            {family.source && (
              <p className={styles.sourceLine}>
                <SourceBadge type={family.source.type} /> {family.source.note} · Last verified {family.source.lastVerified}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
