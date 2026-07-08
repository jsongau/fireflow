import type {
  RankingView,
  RankingInputs,
  RankedEntry,
  ProductFamily,
  Confidence,
  CategoryId,
} from "@/types/domain";
import { FAMILIES } from "@/data/families";

/**
 * Eight transparent ranking views (docs/homepage/08). No single "best" score.
 * Each view exposes purpose, inputs, source type, confidence and last-reviewed.
 *
 * Scores are authored (high/medium confidence) for the six anchors and
 * derived at LOW confidence for other families from tier + category + format
 * breadth. Retail Visibility is never derived — it is shown only where a real
 * public retail signal exists, so it can never be mistaken for sales.
 */

export const RANKING_VIEWS: RankingView[] = [
  {
    id: "portfolio-priority",
    label: "Portfolio Priority",
    purpose: "Which products we'd build and staff support for first.",
    sourceType: "editorial",
    weights: {
      officialProminence: 0.25, retailVisibility: 0.25, formatConvenience: 0.15,
      categoryImportance: 0.15, supportInquiryValue: 0.1, evidenceConfidence: 0.1,
    },
    caveat: "FireFlow editorial index. Not an official Samyang ranking or bestseller list.",
    confidence: "medium",
    lastReviewed: "2026-07-07",
  },
  {
    id: "first-time-fit",
    label: "First-Time Buyer Fit",
    purpose: "How approachable this is for someone new to Buldak-level heat.",
    sourceType: "editorial",
    weights: {
      heatAccessibility: 0.3, familiarFlavor: 0.25, preparationSimplicity: 0.2,
      formatConvenience: 0.15, guidanceConfidence: 0.1,
    },
    caveat: "Editorial experience score, not an official rating. Products without a heat reading are not scored here.",
    confidence: "medium",
    lastReviewed: "2026-07-07",
  },
  {
    id: "vendor-opportunity",
    label: "Vendor Opportunity",
    purpose: "Where a retailer or distributor conversation is most worth having.",
    sourceType: "editorial",
    weights: {
      retailVisibility: 0.2, categoryGrowth: 0.2, formatConvenience: 0.15,
      educationNeed: 0.15, marketingSupportPotential: 0.15, inquiryDemand: 0.15,
    },
    confidence: "low",
    lastReviewed: "2026-07-07",
  },
  {
    id: "customer-guidance",
    label: "Customer Guidance Opportunity",
    purpose: "Where clearer information or support would most improve the experience.",
    sourceType: "editorial",
    weights: {
      preparationSteps: 0.25, allergenComplexity: 0.25,
      componentComplexity: 0.25, inquiryDemand: 0.25,
    },
    caveat: "A high score means better guidance could help. It does NOT mean the product is defective.",
    confidence: "medium",
    lastReviewed: "2026-07-07",
  },
  {
    id: "support-complexity",
    label: "Support Complexity",
    purpose: "How much operational care a product needs to support well.",
    sourceType: "editorial",
    weights: {
      componentComplexity: 0.25, handlingComplexity: 0.2, allergenComplexity: 0.2,
      preparationSteps: 0.2, formatConvenience: 0.15,
    },
    confidence: "medium",
    lastReviewed: "2026-07-07",
  },
  {
    id: "format-versatility",
    label: "Format Versatility",
    purpose: "How many ways a family shows up on shelf (Multi, Big Bowl, Cup, bottle, frozen, etc.).",
    sourceType: "official",
    weights: { formatConvenience: 1 },
    confidence: "high",
    lastReviewed: "2026-07-07",
  },
  {
    id: "retail-visibility",
    label: "Retail Visibility",
    purpose: "Public retail engagement snapshot, single-listing and date-stamped. Not sales.",
    sourceType: "retail-signal",
    weights: { retailVisibility: 1 },
    caveat: "Public retail engagement only. Not total sales, unique customers, or market share.",
    confidence: "low",
    lastReviewed: "2026-07-07",
  },
  {
    id: "evidence-confidence",
    label: "Evidence Confidence",
    purpose: "How well-sourced this product's data is right now.",
    sourceType: "editorial",
    weights: { evidenceConfidence: 1 },
    confidence: "high",
    lastReviewed: "2026-07-07",
  },
];

export const RANKING_VIEW_BY_ID = Object.fromEntries(RANKING_VIEWS.map((v) => [v.id, v]));

/* ------------------------------------------------------------------ */
/* Input derivation                                                    */
/* ------------------------------------------------------------------ */

const TIER_SCORE: Record<ProductFamily["popularityTier"], number> = {
  A: 0.9, B: 0.7, C: 0.5, D: 0.35,
};

const CATEGORY_IMPORTANCE: Partial<Record<CategoryId, number>> = {
  noodles: 0.9, "soup-noodles": 0.7, "protein-pasta": 0.7, "hot-sauce": 0.75,
  "potato-chips": 0.6, "mac-and-cheese": 0.55, "glass-noodles": 0.5,
  dumplings: 0.5, rice: 0.5, tteokbokki: 0.5, snack: 0.4,
};

const HANDLING_BY_CATEGORY: Partial<Record<CategoryId, number>> = {
  dumplings: 0.8, rice: 0.8, tteokbokki: 0.7, "hot-sauce": 0.4,
};

/** Derived, LOW-confidence inputs for families without authored inputs. */
function deriveFallbackInputs(family: ProductFamily): RankingInputs {
  const tier = TIER_SCORE[family.popularityTier] ?? 0.35;
  const formatBreadth = Math.min(family.formats.length / 3, 1);
  return {
    officialProminence: tier,
    categoryImportance: CATEGORY_IMPORTANCE[family.category] ?? 0.5,
    supportInquiryValue: 0.5,
    evidenceConfidence: 0.35,
    familiarFlavor: 0.5,
    preparationSimplicity: 0.55,
    formatConvenience: formatBreadth,
    guidanceConfidence: 0.4,
    categoryGrowth: 0.5,
    educationNeed: 0.5,
    marketingSupportPotential: tier,
    inquiryDemand: tier * 0.6,
    componentComplexity: 0.5,
    handlingComplexity: HANDLING_BY_CATEGORY[family.category] ?? 0.2,
    allergenComplexity: 0.5,
    preparationSteps: 0.5,
    // Deliberately NOT derived (guessing would be dishonest):
    // heatAccessibility, retailVisibility
  };
}

function getInputs(family: ProductFamily): { inputs: RankingInputs; authored: boolean } {
  if (family.rankingInputs) return { inputs: family.rankingInputs, authored: true };
  return { inputs: deriveFallbackInputs(family), authored: false };
}

function weighted(inputs: RankingInputs, weights: RankingView["weights"]) {
  let sum = 0;
  let presentWeight = 0;
  let missing = false;
  for (const key of Object.keys(weights) as (keyof RankingInputs)[]) {
    const weight = weights[key];
    if (weight == null) continue;
    const value = inputs[key];
    if (value == null) { missing = true; continue; }
    sum += value * weight;
    presentWeight += weight;
  }
  const score = presentWeight > 0 ? (sum / presentWeight) * 100 : 0;
  return { score, missing };
}

/* ------------------------------------------------------------------ */
/* Public compute API                                                  */
/* ------------------------------------------------------------------ */

/** Compute a ranked, sorted list for a view. */
export function computeRanking(viewId: RankingView["id"]): RankedEntry[] {
  const view = RANKING_VIEW_BY_ID[viewId];
  if (!view) return [];

  const entries: RankedEntry[] = [];
  for (const family of FAMILIES) {
    const { inputs, authored } = getInputs(family);

    // Format Versatility is a pure structural fact.
    if (view.id === "format-versatility") {
      entries.push({
        familyId: family.id,
        score: Math.round((family.formats.length / 3) * 100),
        confidence: "high",
        hasMissingInputs: false,
      });
      continue;
    }

    // Retail Visibility is never derived — only authored signal counts.
    if (view.id === "retail-visibility") {
      const rv = family.rankingInputs?.retailVisibility;
      if (rv == null) continue; // not scored, explained in UI
      entries.push({
        familyId: family.id,
        score: Math.round(rv * 100),
        confidence: "low",
        hasMissingInputs: false,
      });
      continue;
    }

    // First-Time Fit requires a heat reading; exclude rather than guess.
    if (view.id === "first-time-fit" && inputs.heatAccessibility == null) continue;

    const { score, missing } = weighted(inputs, view.weights);
    const confidence: Confidence = authored ? view.confidence : "low";
    entries.push({
      familyId: family.id,
      score: Math.round(score),
      confidence,
      hasMissingInputs: missing || !authored,
    });
  }

  return entries.sort((a, b) => b.score - a.score);
}
