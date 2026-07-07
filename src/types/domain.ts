/**
 * FireFlow Product Intelligence — domain types
 *
 * These types model Samyang America's public U.S. portfolio as normalized
 * product families and their format-level variants, plus the ranking,
 * inquiry, scenario, and source-labeling systems.
 *
 * Data-honesty rule encoded in the types: every fact that is not a structural
 * given carries a `SourceType`. Allergens and preparation live ONLY on the
 * variant (format-bound), never on the family. See docs/homepage/08 and 10.
 */

/* ------------------------------------------------------------------ */
/* Identity & enums                                                    */
/* ------------------------------------------------------------------ */

export type BrandId = "buldak" | "samyang" | "tangle" | "mep";

export type CategoryId =
  | "noodles"
  | "soup-noodles"
  | "protein-pasta"
  | "hot-sauce"
  | "potato-chips"
  | "mac-and-cheese"
  | "glass-noodles"
  | "dumplings"
  | "rice"
  | "tteokbokki"
  | "snack";

export type FormatId =
  | "multi"
  | "big-bowl"
  | "bowl"
  | "cup"
  | "bag"
  | "pack"
  | "box"
  | "four-cup"
  | "sauce-200g"
  | "sauce-350g"
  | "sauce-stick"
  | "frozen"
  | "shelf-stable";

/** Popularity/priority tier from catalog doc 04. */
export type PopularityTier = "A" | "B" | "C" | "D";

/** Editorial priority label from the normalized-families table (catalog doc 03). */
export type PriorityLabel =
  | "Launch Anchor"
  | "Heritage Anchor"
  | "High Priority"
  | "Emerging Priority"
  | "Portfolio";

/** How a given fact was obtained. Rendered as a labeled chip in the UI. */
export type SourceType = "official" | "retail-signal" | "editorial" | "synthetic";

export type Confidence = "high" | "medium" | "low";

/** Which lane the visitor is in — drives inquiry CTAs and mode-aware copy. */
export type UserMode = "explore" | "consumer" | "vendor";

/** Serving style — an official/observable structural property where known. */
export type ServingStyle = "stir-fry" | "soup" | "sauce" | "snack" | "frozen-meal";

export type StorageType = "ambient" | "refrigerate-after-opening" | "frozen";

/** Canonical allergen vocabulary. `soybean` in sources normalizes to `soy`. */
export type Allergen = "wheat" | "soy" | "milk" | "sesame" | "coconut";

/** Editorial heat positioning (words, never invented Scoville numbers). */
export type HeatPositioning =
  | "mild"
  | "moderate"
  | "hot"
  | "very-hot"
  | "extreme"
  | "sauce-dependent"
  | "not-applicable";

/* ------------------------------------------------------------------ */
/* Sourcing                                                            */
/* ------------------------------------------------------------------ */

export interface SourceRef {
  type: SourceType;
  /** Human label shown in UI, e.g. "Official Samyang America product info". */
  label: string;
  /** Optional detail / provenance note. */
  note?: string;
  /** ISO date the fact was last reviewed. */
  lastVerified?: string;
}

/** A public retail engagement snapshot. Explicitly NOT a sales figure. */
export interface RetailSignal {
  retailer: string;
  /** e.g. "8,830 ratings", "Overall Pick", "5K+ bought since yesterday". */
  marker: string;
  /** ISO snapshot date. Date-sensitive by nature. */
  snapshotDate: string;
}

/* ------------------------------------------------------------------ */
/* Variant (format-level record)                                       */
/* ------------------------------------------------------------------ */

export interface ProductVariant {
  id: string;                 // `${familyId}--${format}`
  familyId: string;
  format: FormatId;
  formatLabel: string;        // display label, e.g. "Big Bowl"
  dataConfidence: Confidence;

  /** Format-bound official facts. Present for anchors; sparse otherwise. */
  allergens?: Allergen[];
  allergenSource?: SourceRef;
  preparation?: string;
  preparationSource?: SourceRef;
  /** Expected package components (sauce packet, flakes, cheese powder, etc.). */
  components?: string[];
  storage?: StorageType;
  netWeight?: string;         // only if officially known; else omitted

  retailSignals?: RetailSignal[];
}

/* ------------------------------------------------------------------ */
/* Ranking inputs                                                      */
/* ------------------------------------------------------------------ */

/**
 * Raw 0..1 component inputs for the ranking model. Authored for anchors and
 * where public signal exists; tier-derived + low-confidence otherwise.
 * Not every family has every input — missing inputs are handled, not imputed.
 */
export interface RankingInputs {
  officialProminence?: number;   // featured by Samyang America
  retailVisibility?: number;     // strength of public retail signal
  categoryImportance?: number;
  supportInquiryValue?: number;
  evidenceConfidence?: number;   // how well-sourced this family is

  heatAccessibility?: number;    // higher = more approachable heat
  familiarFlavor?: number;
  preparationSimplicity?: number;
  formatConvenience?: number;
  guidanceConfidence?: number;

  categoryGrowth?: number;
  educationNeed?: number;
  marketingSupportPotential?: number;
  inquiryDemand?: number;

  componentComplexity?: number;
  handlingComplexity?: number;   // frozen/ambient
  allergenComplexity?: number;
  preparationSteps?: number;
}

/* ------------------------------------------------------------------ */
/* Family (browseable record)                                          */
/* ------------------------------------------------------------------ */

export interface ProductFamily {
  id: string;
  brand: BrandId;
  name: string;
  category: CategoryId;
  formats: FormatId[];
  popularityTier: PopularityTier;
  priorityLabel: PriorityLabel;
  aliases: string[];
  isAnchor: boolean;

  /** Short editorial one-liner for cards. */
  blurb?: string;

  /* Anchor-depth fields (optional; full for the 6 anchors). */
  flavorStory?: string;
  heatPositioning?: HeatPositioning;
  servingStyle?: ServingStyle;
  /** Editorial 0..5 creaminess for comparison (labeled editorial in UI). */
  creaminess?: number;
  relatedFamilyIds?: string[];
  consumerQuestions?: string[];
  vendorQuestions?: string[];
  officialPositioning?: string;
  source?: SourceRef;

  rankingInputs?: RankingInputs;
}

/* ------------------------------------------------------------------ */
/* Brands & categories                                                 */
/* ------------------------------------------------------------------ */

export interface Brand {
  id: BrandId;
  name: string;
  /** CSS custom-property accent token name, e.g. "--chili-600". */
  accentToken: string;
  positioning: string;
  role: string;
}

export interface Category {
  id: CategoryId;
  label: string;
  servingStyle: ServingStyle;
}

export interface Format {
  id: FormatId;
  label: string;
  /** Grouping for staging/imagery archetype. */
  archetype: "noodle-pack" | "bowl" | "cup" | "bag" | "bottle" | "stick" | "frozen-box" | "pack";
}

/* ------------------------------------------------------------------ */
/* Ranking view definitions                                            */
/* ------------------------------------------------------------------ */

export type RankingViewId =
  | "portfolio-priority"
  | "first-time-fit"
  | "vendor-opportunity"
  | "customer-guidance"
  | "support-complexity"
  | "format-versatility"
  | "retail-visibility"
  | "evidence-confidence";

export interface RankingView {
  id: RankingViewId;
  label: string;
  /** Plain-language purpose shown in UI. */
  purpose: string;
  sourceType: SourceType;
  /** Weighted inputs, each an input key + weight (weights sum documented). */
  weights: Partial<Record<keyof RankingInputs, number>>;
  /** UI caveat, e.g. the Customer-Guidance "not a defect" note. */
  caveat?: string;
  confidence: Confidence;
  lastReviewed: string;
}

export interface RankedEntry {
  familyId: string;
  score: number;              // 0..100 normalized display score
  confidence: Confidence;
  /** True when one or more weighted inputs were missing for this family. */
  hasMissingInputs: boolean;
}

/* ------------------------------------------------------------------ */
/* Inquiry taxonomy                                                    */
/* ------------------------------------------------------------------ */

export type InquiryChannel = "consumer" | "vendor";

export type Severity = "standard" | "elevated" | "priority" | "specialist";

export interface InquiryIssue {
  id: string;
  channel: InquiryChannel;
  label: string;
  /** Which product categories this issue is relevant to (empty = all). */
  appliesToCategories: CategoryId[];
  defaultSeverity: Severity;
  /** True for allergen/injury/foreign-material/tampering/regulatory. */
  requiresSpecialistEscalation: boolean;
  evidenceRequested: string[];
  routeTo: string[];          // collaborating teams
}

/* ------------------------------------------------------------------ */
/* Resolution scenarios (Resolution Simulator)                         */
/* ------------------------------------------------------------------ */

export type CaseStage =
  | "reported"
  | "verified"
  | "routed"
  | "resolution-proposed"
  | "customer-updated"
  | "resolved"
  | "improvement-review";

export interface ScenarioStage {
  stage: CaseStage;
  title: string;
  detail: string;
}

export interface ResolutionScenario {
  id: string;
  channel: InquiryChannel;
  title: string;
  familyId: string;
  variantId?: string;
  issueId: string;
  severity: Severity;
  reported: string;
  verifiedFacts: string[];
  evidenceNeeded: string[];
  owner: string;
  collaborators: string[];
  customerUpdateCommitment: string;
  resolutionOptions: string[];
  approvalsRequired: string[];
  rootCause: string;
  correctiveAction: string;
  stages: ScenarioStage[];
  /** Everything here is invented for demonstration. */
  synthetic: true;
}
