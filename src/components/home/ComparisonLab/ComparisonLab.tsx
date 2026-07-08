import { useMemo, useState } from "react";
import { useHome } from "@/state/homeStore";
import { FAMILY_BY_ID } from "@/data/families";
import { defaultVariantForFamily } from "@/data/variants";
import { imageForVariant } from "@/data/images";
import { BRAND_BY_ID } from "@/data/brands";
import { CATEGORY_BY_ID, FORMAT_BY_ID } from "@/data/categories";
import { computeRanking } from "@/data/rankings";
import { spiceLevel, spiceName } from "@/data/spiciness";
import type { ProductFamily, ProductVariant, HeatPositioning } from "@/types/domain";
import styles from "./ComparisonLab.module.css";

const HEAT_LABEL: Record<HeatPositioning, string> = {
  mild: "Mild", moderate: "Moderate", hot: "Hot", "very-hot": "Very hot",
  extreme: "Extreme", "sauce-dependent": "Sauce-dependent", "not-applicable": "—",
};

const PRESETS: { label: string; ids: string[] }[] = [
  { label: "Carbonara vs Cream Carbonara", ids: ["buldak-carbonara", "buldak-cream-carbonara"] },
  { label: "Original vs 2X Spicy", ids: ["buldak-original", "buldak-2x-spicy"] },
  { label: "Cheese vs Quattro Cheese", ids: ["buldak-cheese", "buldak-quattro-cheese"] },
  { label: "Original vs Carbonara hot sauce", ids: ["buldak-original-hot-sauce", "buldak-carbonara-hot-sauce"] },
  { label: "Buldak vs Samyang soup", ids: ["buldak-original", "samyang-ramen"] },
];

type RowDef = { key: string; label: string; get: (f: ProductFamily, v: ProductVariant | undefined) => string };

export function ComparisonLab() {
  const { state, dispatch } = useHome();
  const [hideMatching, setHideMatching] = useState(false);

  const firstTimeMap = useMemo(() => new Map(computeRanking("first-time-fit").map((e) => [e.familyId, e.score])), []);
  const supportMap = useMemo(() => new Map(computeRanking("support-complexity").map((e) => [e.familyId, e.score])), []);

  const families = state.compareIds.map((id) => FAMILY_BY_ID[id]).filter((f): f is ProductFamily => Boolean(f));

  const rows: RowDef[] = [
    { key: "brand", label: "Brand", get: (f) => BRAND_BY_ID[f.brand]?.name ?? f.brand },
    { key: "category", label: "Category", get: (f) => CATEGORY_BY_ID[f.category]?.label ?? f.category },
    { key: "formats", label: "Formats", get: (f) => f.formats.map((x) => FORMAT_BY_ID[x]?.label ?? x).join(", ") },
    { key: "heat", label: "Heat", get: (f) => (f.heatPositioning ? HEAT_LABEL[f.heatPositioning] : "—") },
    { key: "spiciness", label: "Spiciness (editorial)", get: (f) => spiceName(spiceLevel(f.id)) },
    { key: "cream", label: "Creaminess (editorial)", get: (f) => (typeof f.creaminess === "number" ? `${f.creaminess}/5` : "—") },
    { key: "allergens", label: "Allergens (default format)", get: (_f, v) => (v?.allergens?.length ? `${v.allergens.join(", ")} (${v.formatLabel})` : "Verify package") },
    { key: "components", label: "In the package", get: (_f, v) => (v?.components?.length ? v.components.join(" · ") : "—") },
    { key: "storage", label: "Storage", get: (_f, v) => (v?.storage === "refrigerate-after-opening" ? "Refrigerate after opening" : v?.storage === "frozen" ? "Keep frozen" : v?.storage === "ambient" ? "Ambient" : "—") },
    { key: "firsttime", label: "First-time fit", get: (f) => (firstTimeMap.has(f.id) ? `${firstTimeMap.get(f.id)}` : "—") },
    { key: "support", label: "Support complexity", get: (f) => (supportMap.has(f.id) ? `${supportMap.get(f.id)}` : "—") },
    { key: "confidence", label: "Evidence confidence", get: (_f, v) => (v ? v.dataConfidence : "—") },
  ];

  const variantFor = (f: ProductFamily) => defaultVariantForFamily(f.id);

  return (
    <section id="compare" className={styles.section} aria-labelledby="compare-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Explore</p>
        <h2 id="compare-h" className={styles.h2}>Comparison Lab</h2>
        <p className={styles.lede}>
          Compare two products, side by side. Allergens and preparation reflect each product&rsquo;s default format.
          Switch formats in a product&rsquo;s dossier to compare a different one.
        </p>

        <div className={styles.presets}>
          <span className={styles.presetLabel}>Try:</span>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              className={styles.preset}
              onClick={() => { dispatch({ type: "CLEAR_COMPARE" }); p.ids.forEach((id) => dispatch({ type: "ADD_COMPARE", familyId: id })); }}
            >
              {p.label}
            </button>
          ))}
        </div>

        {families.length === 0 ? (
          <p className={styles.empty}>Add two or more products from the rankings, dossier, or a preset above to compare.</p>
        ) : (
          <>
            <div className={styles.controls}>
              <label className={styles.toggle}>
                <input type="checkbox" checked={hideMatching} onChange={(e) => setHideMatching(e.target.checked)} />
                Hide matching rows
              </label>
              <button className={styles.clear} onClick={() => dispatch({ type: "CLEAR_COMPARE" })}>Clear all</button>
            </div>

            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <caption className={styles.srOnly}>Product comparison</caption>
                <thead>
                  <tr>
                    <th scope="col" className={styles.rowHead}>Attribute</th>
                    {families.map((f) => {
                      const photo = imageForVariant(variantFor(f)?.id ?? "", f.id);
                      return (
                      <th key={f.id} scope="col" className={styles.colHead}>
                        <span className={styles.colName}>
                          <span className={styles.colThumb} aria-hidden="true">
                            {photo && (
                              <img
                                className={styles.colThumbImg}
                                src={photo}
                                alt=""
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.display = "none"; }}
                              />
                            )}
                          </span>
                          {f.name}
                        </span>
                        <span className={styles.colActions}>
                          <a href="#resolve" onClick={() => { dispatch({ type: "SELECT_FAMILY", familyId: f.id }); dispatch({ type: "SET_MODE", mode: "consumer" }); }}>Consumer</a>
                          <a href="#resolve" onClick={() => { dispatch({ type: "SELECT_FAMILY", familyId: f.id }); dispatch({ type: "SET_MODE", mode: "vendor" }); }}>Vendor</a>
                          <button onClick={() => dispatch({ type: "REMOVE_COMPARE", familyId: f.id })} aria-label={`Remove ${f.name}`}>Remove</button>
                        </span>
                      </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => {
                    const values = families.map((f) => row.get(f, variantFor(f)));
                    const allSame = values.every((v) => v === values[0]);
                    if (hideMatching && allSame && families.length > 1) return null;
                    return (
                      <tr key={row.key} className={!allSame && families.length > 1 ? styles.diffRow : undefined}>
                        <th scope="row" className={styles.rowHead}>{row.label}</th>
                        {values.map((v, i) => (
                          <td key={i} className={styles.cell}>{v}</td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
