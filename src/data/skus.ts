import type {
  OrderableSku,
  OrderVolumeTier,
  AccountType,
  PriceCents,
  SourceRef,
} from "@/types/domain";
import { VARIANT_BY_ID } from "@/data/variants";

/**
 * SYNTHETIC B2B ordering catalog. Demonstration only.
 *
 * Pricing is GROUNDED, not guessed: each SKU carries a public U.S. retail
 * shelf-price reference (`retailRefCents`, per retail unit, checked mid-2025
 * against Amazon / Walmart / Target / Kroger / buldak.com listings), and the
 * per-case lane base prices are DERIVED from it with a stated wholesale factor.
 * The reference points are real; the derived wholesale prices, minimums, lead
 * times, and SKU codes are illustrative and are NOT real Samyang trade terms.
 * Nothing is transmitted.
 *
 * The catalog does not duplicate product facts. Each SKU is keyed by an existing
 * `ProductVariant.id` (which already carries the family and format). Variants
 * with no SKU entry are simply not orderable in the demo.
 */

export const SYNTHETIC_COMMERCE_DISCLAIMER =
  "Pricing follows public U.S. retail shelf data, read back to a wholesale case cost.";

const SYNTHETIC_SOURCE: SourceRef = {
  type: "synthetic",
  label: "Illustrative wholesale (derived from public retail)",
  note: "Per-case tiers derived from a public retail shelf-price reference at an assumed wholesale factor. Reference prices are real; the wholesale terms are estimates, not Samyang's actual trade pricing.",
};

/* Wholesale is a fraction of the public retail shelf price. A retailer pays near
 * the wholesale line; a distributor, who buys deeper and resells to retailers,
 * lands below it. That lane difference is a BASE price difference, not a volume
 * break. Volume breaks are separate, and they key off the whole order. */
const RETAILER_FACTOR = 0.62;    // ~38% retailer margin off shelf
const DISTRIBUTOR_FACTOR = 0.55; // distributors buy deeper than retailers

/**
 * Order-level volume breaks, on TOTAL cases across every line of the order.
 * A buyer earns these by building a mixed pallet, not by loading up on one SKU.
 */
export const ORDER_VOLUME_TIERS: OrderVolumeTier[] = [
  { minTotalCases: 1, discountPct: 0 },
  { minTotalCases: 25, discountPct: 4 },
  { minTotalCases: 50, discountPct: 8 },
  { minTotalCases: 100, discountPct: 12 },
];

/** A distributor lane has an order floor. Per line, the minimum stays small. */
export const DISTRIBUTOR_MIN_ORDER_CASES = 40;

/** Round to the nearest 10 cents for tidy pricing. */
const round10 = (cents: number): PriceCents => Math.round(cents / 10) * 10;

/** The order-level tier earned at a given total case count. */
export function orderTierFor(totalCases: number): OrderVolumeTier {
  let tier = ORDER_VOLUME_TIERS[0]!;
  for (const t of ORDER_VOLUME_TIERS) if (totalCases >= t.minTotalCases) tier = t;
  return tier;
}

/** The next tier up, or null when the order is already at the deepest break. */
export function nextOrderTier(totalCases: number): OrderVolumeTier | null {
  return ORDER_VOLUME_TIERS.find((t) => totalCases < t.minTotalCases) ?? null;
}

/** Per-case base price for a lane, before any order-level discount. */
export function baseCaseCents(sku: OrderableSku, accountType: AccountType): PriceCents {
  return accountType === "distributor" ? sku.distributorCaseCents : sku.listCaseCents;
}

/**
 * Per-case price for a SKU given the WHOLE order's case count and the lane.
 * Lane sets the base; the order's total volume sets the discount.
 */
export function unitPriceForOrder(
  sku: OrderableSku,
  totalOrderCases: number,
  accountType: AccountType = "retailer",
): PriceCents {
  const { discountPct } = orderTierFor(totalOrderCases);
  return round10(baseCaseCents(sku, accountType) * (1 - discountPct / 100));
}

/** Per-line minimum, in cases. Retailers buy by the case; distributors by the layer. */
export function lineMinCases(sku: OrderableSku, accountType: AccountType): number {
  return accountType === "distributor" ? sku.layerCases ?? sku.moq : sku.moq;
}

/** Per-line orderable step, in cases. A distributor never breaks a layer. */
export function lineIncrement(sku: OrderableSku, accountType: AccountType): number {
  return accountType === "distributor" ? sku.layerCases ?? sku.caseIncrement : sku.caseIncrement;
}

/** Cases still needed to round this line up to a full pallet (0 when even). */
export function casesToFullPallet(sku: OrderableSku, cases: number): number {
  if (!sku.palletCases || cases <= 0) return 0;
  const remainder = cases % sku.palletCases;
  return remainder === 0 ? 0 : sku.palletCases - remainder;
}

/**
 * A quarter pallet or less from rounding up is worth telling the buyer about,
 * because topping up is cheap and a partial pallet costs freight. Any further
 * away and it is noise, not a nudge. Returns 0 when there is nothing to say.
 */
export function palletNudgeCases(sku: OrderableSku, cases: number): number {
  const gap = casesToFullPallet(sku, cases);
  if (!sku.palletCases || gap === 0) return 0;
  return gap <= sku.palletCases * 0.25 ? gap : 0;
}

/**
 * Terser SKU constructor. `retailRefCents` is the one real number (public shelf
 * price per retail unit); both lane base prices are derived from it. A layer is
 * taken as a sixth of a pallet, which is the distributor's per-line minimum.
 */
function sku(
  variantId: string,
  code: string,
  unitLabel: string,
  casePack: number,
  moq: number,
  retailRefCents: PriceCents,
  opts: { caseIncrement?: number; palletCases?: number; leadTime?: OrderableSku["leadTime"]; storage?: OrderableSku["storage"] } = {},
): OrderableSku {
  const caseIncrement = opts.caseIncrement ?? 1;
  const layerCases = opts.palletCases
    ? Math.max(caseIncrement, Math.round(opts.palletCases / 6))
    : undefined;
  return {
    synthetic: true,
    variantId,
    sku: code,
    unitLabel,
    casePack,
    moq,
    caseIncrement,
    layerCases,
    palletCases: opts.palletCases,
    leadTime: opts.leadTime ?? "standard",
    storage: opts.storage ?? "ambient",
    retailRefCents,
    listCaseCents: round10(casePack * retailRefCents * RETAILER_FACTOR),
    distributorCaseCents: round10(casePack * retailRefCents * DISTRIBUTOR_FACTOR),
    source: SYNTHETIC_SOURCE,
  };
}

/* retailRefCents = public U.S. shelf price per retail unit (mid-2025 reference).
 * Multipack ~ a 5-pack; Big Bowl 3.7oz; Cup; 200g sauce bottle; mac box; glass
 * pack; frozen dumpling bag. Lane base prices are derived from it. */
export const ORDERABLE_SKUS: OrderableSku[] = [
  // Buldak ramen multipacks (5-pack ~ $8-10 shelf).
  sku("buldak-original--multi", "SY-BLDK-ORIG-MP", "5-pack multipack", 8, 10,
    849, { palletCases: 84, leadTime: "in-stock" }),
  sku("buldak-2x-spicy--multi", "SY-BLDK-2X-MP", "5-pack multipack", 8, 10,
    899, { palletCases: 84, leadTime: "in-stock" }),
  sku("buldak-carbonara--multi", "SY-BLDK-CARB-MP", "5-pack multipack", 8, 10,
    949, { palletCases: 84, leadTime: "in-stock" }),
  sku("buldak-cheese--multi", "SY-BLDK-CHZ-MP", "5-pack multipack", 8, 10,
    899, { palletCases: 84 }),
  sku("buldak-habanero-lime--multi", "SY-BLDK-HABL-MP", "5-pack multipack", 8, 10,
    949, { palletCases: 84, leadTime: "short" }),
  sku("buldak-rose--multi", "SY-BLDK-ROSE-MP", "5-pack multipack", 8, 10,
    949, { palletCases: 84 }),
  sku("buldak-cream-carbonara--multi", "SY-BLDK-CCARB-MP", "5-pack multipack", 8, 10,
    999, { palletCases: 84, leadTime: "short" }),
  sku("buldak-quattro-cheese--multi", "SY-BLDK-QUAT-MP", "5-pack multipack", 8, 10,
    999, { palletCases: 84, leadTime: "made-to-order" }),

  // Big bowls (3.7oz ~ $3.49-3.99 shelf).
  sku("buldak-original--big-bowl", "SY-BLDK-ORIG-BB", "Big Bowl", 12, 8,
    379, { palletCases: 60, leadTime: "in-stock" }),
  sku("buldak-carbonara--big-bowl", "SY-BLDK-CARB-BB", "Big Bowl", 12, 8,
    399, { palletCases: 60 }),

  // Cups (~ $2.99-3.99 shelf).
  sku("buldak-original--cup", "SY-BLDK-ORIG-CUP", "Cup", 12, 8,
    329, { palletCases: 96, leadTime: "in-stock" }),
  sku("buldak-2x-spicy--cup", "SY-BLDK-2X-CUP", "Cup", 12, 8,
    349, { palletCases: 96 }),
  sku("buldak-carbonara--cup", "SY-BLDK-CARB-CUP", "Cup", 12, 8,
    369, { palletCases: 96 }),

  // Hot sauces (200g bottle ~ $9.99 shelf; shelf-stable, ambient for shipping).
  sku("buldak-original-hot-sauce--sauce-200g", "SY-BLDK-ORIG-HS200", "200g bottle", 12, 6,
    999, { palletCases: 72, leadTime: "in-stock" }),
  sku("buldak-carbonara-hot-sauce--sauce-200g", "SY-BLDK-CARB-HS200", "200g bottle", 12, 6,
    999, { palletCases: 72 }),
  sku("buldak-2x-spicy-hot-sauce--sauce-200g", "SY-BLDK-2X-HS200", "200g bottle", 12, 6,
    999, { palletCases: 72, leadTime: "short" }),

  // Mac & cheese (box ~ $3.99 shelf).
  sku("buldak-mac-and-cheese-carbo--box", "SY-BLDK-MAC-CARB", "Box", 12, 8,
    399, { palletCases: 72, leadTime: "short" }),
  sku("buldak-mac-and-cheese-sweet-corn--box", "SY-BLDK-MAC-CORN", "Box", 12, 8,
    399, { palletCases: 72, leadTime: "made-to-order" }),

  // Glass noodles (pack ~ $4.49 shelf).
  sku("buldak-carbo-glass-noodles--pack", "SY-BLDK-GLASS-CARB", "Pack", 12, 8,
    449, { palletCases: 72, leadTime: "short" }),

  // Frozen dumplings (bag ~ $7.99-8.49 shelf; cold chain).
  sku("buldak-dumpling--frozen", "SY-BLDK-DUMP", "Frozen bag", 10, 6,
    799, { palletCases: 48, leadTime: "made-to-order", storage: "frozen" }),
  sku("buldak-carbonara-dumpling--frozen", "SY-BLDK-CDUMP", "Frozen bag", 10, 6,
    849, { palletCases: 48, leadTime: "made-to-order", storage: "frozen" }),
];

export const SKU_BY_VARIANT: Record<string, OrderableSku> = Object.fromEntries(
  ORDERABLE_SKUS.map((s) => [s.variantId, s]),
);

export const skuForVariant = (variantId: string): OrderableSku | undefined => SKU_BY_VARIANT[variantId];

/**
 * Lookup by the printed SKU code, e.g. "SY-BLDK-ORIG-MP". Added so the account
 * dossier's purchase order lines price themselves from this model rather than
 * carrying numbers of their own. A PO on the account page and a line in the order
 * builder cannot quote different prices, because there is one price function.
 */
export const SKU_BY_CODE: Record<string, OrderableSku> = Object.fromEntries(
  ORDERABLE_SKUS.map((s) => [s.sku, s]),
);
export const skuForCode = (code: string): OrderableSku | undefined => SKU_BY_CODE[code];

/** Orderable variant ids for a given family (empty if none are orderable). */
export const orderableVariantsForFamily = (familyId: string): OrderableSku[] =>
  ORDERABLE_SKUS.filter((s) => VARIANT_BY_ID[s.variantId]?.familyId === familyId);


/** Format cents as USD, e.g. 2640 => "$26.40". */
export function formatCents(cents: PriceCents): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export const LEAD_TIME_LABEL: Record<OrderableSku["leadTime"], string> = {
  "in-stock": "In stock",
  short: "Short lead (about 1 week)",
  standard: "Standard lead (2 to 3 weeks)",
  "made-to-order": "Made to order (4 weeks or more)",
};

/** Colorblind-safe glyph paired with every lead-time word. */
export const LEAD_TIME_GLYPH: Record<OrderableSku["leadTime"], string> = {
  "in-stock": "●",
  short: "◑",
  standard: "◔",
  "made-to-order": "○",
};
