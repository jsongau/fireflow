import type {
  QuoteRequest,
  OrderLine,
  AccountType,
  LeadTimeBand,
  PriceCents,
  OrderVolumeTier,
} from "@/types/domain";
import {
  SKU_BY_VARIANT,
  unitPriceForOrder,
  orderTierFor,
  nextOrderTier,
  lineMinCases,
  palletNudgeCases,
  DISTRIBUTOR_MIN_ORDER_CASES,
} from "@/data/skus";

/**
 * SYNTHETIC request-for-quote (RFQ) layer. Demonstration only.
 * Quote math is illustrative. Volume discounts are earned on the TOTAL cases of
 * the order, across all lines, so the order total must be known before any line
 * can be priced. No real pricing, terms, or submissions.
 */

const LEAD_RANK: Record<LeadTimeBand, number> = {
  "in-stock": 0,
  short: 1,
  standard: 2,
  "made-to-order": 3,
};
const RANK_LEAD: LeadTimeBand[] = ["in-stock", "short", "standard", "made-to-order"];

export interface QuoteLine {
  variantId: string;
  cases: number;
  unitPriceCents: PriceCents;
  lineTotalCents: PriceCents;
  /** Cases needed to round this line up to a full pallet (0 when even). */
  casesToPallet: number;
}

export interface QuoteResult {
  subtotalCents: PriceCents;
  totalCases: number;
  estLeadTime: LeadTimeBand;
  /** variantIds below their per-line minimum for this lane. */
  belowMoq: string[];
  lines: QuoteLine[];
  /** Order-level volume tier earned by the total case count. */
  tier: OrderVolumeTier;
  /** The next tier up, and how many more cases would reach it. */
  nextTier: OrderVolumeTier | null;
  casesToNextTier: number;
  /** True when a distributor order sits under the lane's order floor. */
  belowOrderMinimum: boolean;
}

/** Compute an illustrative synthetic quote from cart lines. */
export function buildQuote(lines: OrderLine[], accountType: AccountType = "retailer"): QuoteResult {
  const active = lines.filter((l) => l.cases > 0 && SKU_BY_VARIANT[l.variantId]);

  // The order's total volume sets the discount, so total the cases first.
  const totalCases = active.reduce((n, l) => n + l.cases, 0);
  const tier = orderTierFor(totalCases);
  const next = nextOrderTier(totalCases);

  let subtotalCents = 0;
  let worstLead = 0;
  const belowMoq: string[] = [];
  const detailed: QuoteLine[] = active.map((l) => {
    const sku = SKU_BY_VARIANT[l.variantId]!;
    const unit = unitPriceForOrder(sku, totalCases, accountType);
    const lineTotal = unit * l.cases;
    subtotalCents += lineTotal;
    worstLead = Math.max(worstLead, LEAD_RANK[sku.leadTime]);
    if (l.cases < lineMinCases(sku, accountType)) belowMoq.push(l.variantId);
    return {
      variantId: l.variantId,
      cases: l.cases,
      unitPriceCents: unit,
      lineTotalCents: lineTotal,
      casesToPallet: palletNudgeCases(sku, l.cases),
    };
  });

  return {
    subtotalCents,
    totalCases,
    estLeadTime: RANK_LEAD[worstLead] ?? "standard",
    belowMoq,
    lines: detailed,
    tier,
    nextTier: next,
    casesToNextTier: next ? next.minTotalCases - totalCases : 0,
    belowOrderMinimum:
      accountType === "distributor" && totalCases > 0 && totalCases < DISTRIBUTOR_MIN_ORDER_CASES,
  };
}

/** How complex the quote is, which sets the synthetic turnaround SLA. */
export function quoteSla(result: QuoteResult, accountType: AccountType): string {
  const complex =
    accountType === "distributor" ||
    result.totalCases >= 100 ||
    result.belowMoq.length > 0 ||
    result.belowOrderMinimum;
  return complex ? "Priced within 24 to 48 business hours" : "Priced same business day";
}

function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** Build a synthetic RFQ record from the current cart. */
export function draftQuote(lines: OrderLine[], accountType: AccountType, seq: number): QuoteRequest {
  const result = buildQuote(lines, accountType);
  return {
    synthetic: true,
    id: `RFQ-${40000 + seq}`,
    accountType,
    lines: lines.filter((l) => l.cases > 0),
    status: "submitted",
    subtotalCents: result.subtotalCents,
    estLeadTime: result.estLeadTime,
    responseSla: quoteSla(result, accountType),
    validUntil: daysFromNow(14),
  };
}

/** Build a sample RFQ, pricing it through the same engine the UI uses, so the
 * sample totals can never drift away from the live pricing model. */
function sampleQuote(
  id: string,
  accountType: AccountType,
  lines: OrderLine[],
  status: QuoteRequest["status"],
  validDays: number,
): QuoteRequest {
  const result = buildQuote(lines, accountType);
  return {
    synthetic: true,
    id,
    accountType,
    lines,
    status,
    subtotalCents: result.subtotalCents,
    estLeadTime: result.estLeadTime,
    responseSla: quoteSla(result, accountType),
    validUntil: daysFromNow(validDays),
  };
}

/** A couple of sample RFQs in different states for the Command Center. */
export const SAMPLE_QUOTES: QuoteRequest[] = [
  sampleQuote(
    "RFQ-40188",
    "distributor",
    [
      { variantId: "buldak-original--multi", cases: 60 },
      { variantId: "buldak-carbonara--multi", cases: 40 },
    ],
    "priced",
    10,
  ),
  sampleQuote("RFQ-40190", "retailer", [{ variantId: "buldak-dumpling--frozen", cases: 12 }], "in-review", 13),
];

export const QUOTE_STATUS_LABEL: Record<QuoteRequest["status"], string> = {
  draft: "Draft",
  submitted: "Submitted",
  "in-review": "In review",
  priced: "Priced",
  expired: "Expired",
};

/** Colorblind-safe glyph per quote status (word + glyph, never color alone). */
export const QUOTE_STATUS_GLYPH: Record<QuoteRequest["status"], string> = {
  draft: "✎",
  submitted: "▲",
  "in-review": "◔",
  priced: "✓",
  expired: "×",
};
