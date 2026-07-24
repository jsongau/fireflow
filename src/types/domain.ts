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

/** Which account lane the visitor is in — drives ordering CTAs and mode-aware copy.
 * The site is 100% B2B: every visitor is a trade buyer (a retailer or a distributor)
 * or is still exploring. There is no individual-consumer lane. */
export type UserMode = "explore" | "retailer" | "distributor";

/** B2B account archetype for pricing and flow gating. A retailer buys to resell at
 * shelf; a distributor buys in bulk to resell to retailers. */
export type AccountType = "retailer" | "distributor";

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
  /** What end-shoppers ask at shelf, framed so a retail buyer knows what to
   * merchandise and answer for. (Formerly the consumer-question field.) */
  buyerQuestions?: string[];
  /** What a trade account (retailer or distributor) asks about ordering,
   * fulfillment, and terms for this product. */
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

/** The four B2B service+commerce flows a trade account moves through.
 * These replace the old consumer/vendor split. */
export type InquiryChannel = "order" | "quote" | "standing-order" | "account-issue";

export type Severity = "standard" | "elevated" | "priority" | "specialist";

/** What a given account issue is anchored to in the order-to-cash chain. */
export type IssueRelatesTo =
  | "order"
  | "quote"
  | "standing-order"
  | "delivery"
  | "invoice";

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
  /** Where in order-to-cash this issue originates (optional). */
  relatesTo?: IssueRelatesTo;
}

/* ------------------------------------------------------------------ */
/* Resolution scenarios (Resolution Simulator)                         */
/* ------------------------------------------------------------------ */

/**
 * The scenario walkthrough on /support and the ops board run the SAME lifecycle.
 * Two different stage lists on one site would tell a visitor the process changes
 * depending on which page they are reading. Keep this aligned with `StageKey` in
 * data/caseBoard.ts.
 */
export type CaseStage =
  | "reported"
  | "in-progress"
  | "verified"
  | "resolution-proposed"
  | "resolved";

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

/* ------------------------------------------------------------------ */
/* B2B commerce layer (all synthetic, demonstration only)              */
/*                                                                     */
/* This layer models online bulk ordering for trade accounts. It does  */
/* NOT duplicate product facts — it adds an orderability record keyed   */
/* by variant id. Every price, MOQ, lead time, tier, account, and      */
/* order number here is invented and labeled synthetic. No real        */
/* Samyang catalog, pricing, or orders. Nothing is transmitted.        */
/* ------------------------------------------------------------------ */

/** Money in whole USD cents, to avoid floating-point drift. Synthetic. */
export type PriceCents = number;

/** Coarse, colorblind-safe lead-time band; always paired with a word in UI. */
export type LeadTimeBand = "in-stock" | "short" | "standard" | "made-to-order";

/** Marker interface: every commerce record is invented for demonstration. */
export interface SyntheticFlag {
  synthetic: true;
}

/**
 * An order-level volume break. Discounts key off the TOTAL cases on the order,
 * across every SKU, not off any single line. That is how trade orders actually
 * price: a buyer builds a mixed pallet or truckload and earns the break on the
 * whole order. Synthetic/illustrative.
 */
export interface OrderVolumeTier {
  /** Tier floor in TOTAL cases across the order. */
  minTotalCases: number;
  /** Percent off the per-case base price at this tier. */
  discountPct: number;
}

/** An orderable SKU. One per orderable variant; keyed by variantId. Synthetic. */
export interface OrderableSku extends SyntheticFlag {
  variantId: string;          // FK to ProductVariant.id (carries familyId + format)
  sku: string;                // synthetic SKU code, e.g. "SY-BLDK-CARB-MULTI"
  unitLabel: string;          // e.g. "5-pack multipack"
  casePack: number;           // retail units per case (synthetic)
  /** Per-line minimum for a retailer, in CASES. Small: retailers buy by the case. */
  moq: number;
  /** Orderable step for a retailer, in cases. */
  caseIncrement: number;
  /** Cases per layer. A distributor orders in full layers, never a broken one. */
  layerCases?: number;
  palletCases?: number;       // cases per pallet, drives freight and pallet efficiency
  leadTime: LeadTimeBand;
  storage: StorageType;
  /** Public U.S. shelf-price reference per retail unit. The one real number. */
  retailRefCents: PriceCents;
  /** Derived per-case base prices by lane (before any order-level discount). */
  listCaseCents: PriceCents;        // retailer
  distributorCaseCents: PriceCents; // distributor, always below the retailer base
  source: SourceRef;          // type: "synthetic"
}

/** A line the visitor builds in the demo order cart (client-side only). */
export interface OrderLine {
  variantId: string;
  cases: number;
}

export type QuoteStatus = "draft" | "submitted" | "in-review" | "priced" | "expired";

/** A synthetic request-for-quote built from cart lines. Generated in-browser. */
export interface QuoteRequest extends SyntheticFlag {
  id: string;                 // synthetic, e.g. "RFQ-40231"
  accountType: AccountType;
  lines: OrderLine[];
  requestedShipWindow?: string; // free-text label, synthetic
  status: QuoteStatus;
  /** Illustrative synthetic math, shown as an estimate only. */
  subtotalCents: PriceCents;
  estLeadTime: LeadTimeBand;
  /** Synthetic turnaround commitment shown to the account. */
  responseSla: string;
  validUntil: string;         // synthetic ISO date
}

export type OrderCadence = "weekly" | "biweekly" | "every-4-weeks" | "monthly";
export type StandingOrderStatus = "active" | "paused" | "pending-approval";

/** A synthetic recurring replenishment order. */
export interface StandingOrder extends SyntheticFlag {
  id: string;                 // synthetic, e.g. "SO-2207"
  accountLabel: string;       // synthetic account name
  accountType: AccountType;
  cadence: OrderCadence;
  nextShipDate: string;       // synthetic ISO date
  lines: OrderLine[];
  status: StandingOrderStatus;
  /** Days before ship the account can still amend the order (synthetic). */
  amendmentWindowDays: number;
  /** Hold and notify instead of short-shipping when stock is tight. */
  autoHoldOnBackorder: boolean;
  /** Synthetic trailing fill-rate for this standing order, 0..100. */
  fillRatePct: number;
}
