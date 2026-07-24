import { useMemo } from "react";
import { useHome } from "@/state/homeStore";
import { RANKING_VIEWS, RANKING_VIEW_BY_ID, computeRanking } from "@/data/rankings";
import { FAMILY_BY_ID } from "@/data/families";
import { defaultVariantForFamily } from "@/data/variants";
import { imageForVariant } from "@/data/images";
import { BRAND_BY_ID } from "@/data/brands";
import { SourceBadge, ConfidenceBadge } from "@/components/primitives";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import styles from "./RankingsLab.module.css";

const INPUT_LABELS: Record<string, string> = {
  officialProminence: "Official prominence", retailVisibility: "Retail visibility",
  categoryImportance: "Category importance", supportInquiryValue: "Support & inquiry value",
  evidenceConfidence: "Evidence confidence", heatAccessibility: "Heat accessibility",
  familiarFlavor: "Familiar flavor", preparationSimplicity: "Preparation simplicity",
  formatConvenience: "Format breadth", guidanceConfidence: "Guidance confidence",
  categoryGrowth: "Category growth", educationNeed: "Education need",
  marketingSupportPotential: "Marketing support", inquiryDemand: "Inquiry demand",
  componentComplexity: "Component complexity", handlingComplexity: "Handling complexity",
  allergenComplexity: "Allergen complexity", preparationSteps: "Preparation steps",
};

export function RankingsLab() {
  const { state, dispatch } = useHome();
  const activeId = state.rankingMode;
  const view = RANKING_VIEW_BY_ID[activeId] ?? RANKING_VIEWS[0]!;
  const ranked = useMemo(() => computeRanking(view.id), [view.id]);

  return (
    <section id="rankings" className={styles.section} aria-labelledby="rankings-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Explore</p>
        <h2 id="rankings-h" className={styles.h2}>Rankings Lab</h2>
        <p className={styles.lede}>
          No single &ldquo;best&rdquo; list. Each view measures one thing, shows how it is calculated, and
          labels its source and confidence. Retail counts are engagement snapshots, never sales.
        </p>

        <div className={styles.tabsWrap}>
          <div className={styles.tabs} role="tablist" aria-label="Ranking view">
            {RANKING_VIEWS.map((v) => {
              const selected = v.id === view.id;
              return (
                <button
                  key={v.id}
                  role="tab"
                  aria-selected={selected}
                  className={selected ? `${styles.tab} ${styles.tabOn}` : styles.tab}
                  onClick={() => dispatch({ type: "SET_RANKING_MODE", mode: v.id })}
                >
                  {v.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className={styles.viewHead}>
          <div className={styles.viewMeta}>
            <SourceBadge type={view.sourceType} />
            <ConfidenceBadge level={view.confidence} />
            <span className={styles.reviewed}>Reviewed {view.lastReviewed}</span>
          </div>
          <p className={styles.purpose}>{view.purpose}</p>
          {view.caveat && <p className={styles.caveat}>{view.caveat}</p>}
          <p className={styles.count}>
            {ranked.length} of {FAMILY_BY_ID ? Object.keys(FAMILY_BY_ID).length : 45} families scored
            {ranked.length < 45 && ". Others are not scored here rather than guessed."}
          </p>
        </div>

        <ol className={styles.list}>
          {ranked.slice(0, 12).map((entry, i) => {
            const family = FAMILY_BY_ID[entry.familyId];
            if (!family) return null;
            const brand = BRAND_BY_ID[family.brand];
            const inCompare = state.compareIds.includes(family.id);
            const photo = imageForVariant(defaultVariantForFamily(family.id)?.id ?? "", family.id);
            return (
              <li key={entry.familyId} className={styles.row}>
                <span className={styles.rank}>{i + 1}</span>
                <span className={styles.accent} style={{ background: `var(${brand?.accentToken})` }} aria-hidden="true" />
                <span className={styles.thumb} aria-hidden="true">
                  {photo && (
                    <img
                      className={styles.thumbImg}
                      src={photo}
                      alt=""
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                </span>
                <button className={styles.rowName} onClick={() => dispatch({ type: "SELECT_FAMILY", familyId: family.id })}>
                  {family.name}
                  {entry.hasMissingInputs && <abbr className={styles.missing} title="Some inputs derived or missing, lower confidence">*</abbr>}
                </button>
                <span className={styles.barWrap} aria-hidden="true">
                  <span className={styles.bar} style={{ width: `${entry.score}%` }} />
                </span>
                <span className={styles.score}>{entry.score}</span>
                <span className={styles.rowConf}><ConfidenceBadge level={entry.confidence} /></span>
                <span className={styles.rowActions}>
                  <a href="#product" className={styles.open} onClick={() => dispatch({ type: "SELECT_FAMILY", familyId: family.id })}>Open</a>
                  <button
                    className={styles.add}
                    disabled={inCompare}
                    onClick={() => dispatch({ type: "ADD_COMPARE", familyId: family.id })}
                  >
                    {inCompare ? "In compare" : "Compare"}
                  </button>
                </span>
              </li>
            );
          })}
        </ol>

        <details className={styles.method}>
          <summary>How {view.label} is calculated</summary>
          <ul>
            {Object.entries(view.weights).map(([key, weight]) => (
              <li key={key}>{INPUT_LABELS[key] ?? key}: weight {Math.round((weight ?? 0) * 100)}%</li>
            ))}
          </ul>
          <p className={styles.methodNote}>
            Scores normalize 0–100. An asterisk marks families whose inputs are derived from tier and category
            rather than authored. They are shown at lower confidence, never presented as fact.
          </p>
        </details>

        <SectionNote sectionId="rankings" />
      </div>
    </section>
  );
}
