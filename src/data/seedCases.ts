/**
 * Seed queue for the Customer Experience Operations dashboard.
 *
 * HONESTY, READ THIS FIRST. None of these inquiries is real. They are written to
 * be *representative* of the account-service traffic a Korean noodle brand sees
 * from the Asian-American grocery channel: short shipments, promo price
 * mismatches, OTIF and freight chargebacks, duplicate bill-backs, EDI order
 * failures, unsaleables, resets, and standing orders.
 *
 * The banner names are real grocery chains, used the way a case study uses a real
 * company name: as an illustrative account, not as a claim of any relationship,
 * contract, or data. No Samyang customer, order, price, quantity, or metric
 * appears here. Every case is labeled synthetic in the UI.
 *
 * Case types are drawn from real CPG account-service patterns:
 *   - Deductions are typed (shortage, compliance/OTIF, freight, trade promo) and
 *     carry the dispute window and backup the type actually requires.
 *   - EDI failures (an accepted 850 with no order confirmation) are their own
 *     queue, because the order does not exist yet in the ERP.
 *   - Cost-file desync is the classic root cause behind weeks of invoice disputes.
 *
 * Only identifiers persist (see `homeStore.stripCase`); the account, product,
 * reference, and inquiry text below are re-attached from this file on reload.
 */

import { indexOfStage } from "./caseBoard";
import type { RoutedCase } from "./caseBoard";

const HOUR = 60 * 60 * 1000;
/** Ages are relative to load, so the board always looks freshly worked. */
const ago = (hours: number) => Date.now() - hours * HOUR;

export const SEED_CASES: RoutedCase[] = [
  /* Not grouped by stage. The board groups them; this file keeps each case whole,
     and `stageIndex` on the case is the only thing that says where it sits. A
     comment naming a stage would be one more place for the lifecycle to drift. */
  {
    id: "FF-2126",
    createdAt: ago(26),
    role: "retailer",
    categoryId: "sku-availability",
    priority: "standard",
    channel: "manual",
    deductionTypeId: null,
    stageIndex: 0,
    order: 100,
    enteredStageAt: ago(26),
    account: "Mitsuwa Marketplace",
    product: "Buldak Carbonara, cup",
    orderRef: "Not provided",
    inquiry:
      "We are planning an August reset and want to add Carbonara cup to the ramen set. Can you confirm availability, case pack, and lead time before we finalize the planogram?",
  },

  {
    id: "FF-2181",
    createdAt: ago(3),
    role: "distributor",
    categoryId: "bulk-order-status",
    priority: "elevated",
    channel: "edi",
    deductionTypeId: null,
    stageIndex: 0,
    order: 200,
    enteredStageAt: ago(3),
    account: "Kam Man Food",
    product: "Buldak Original, pouch",
    orderRef: "PO-483902",
    inquiry:
      "We sent our 850 on Monday and received the 997, but no order confirmation has come back. Our truck is booked for Thursday and we cannot see the order on your side.",
  },
  {
    id: "FF-2103",
    createdAt: ago(1),
    role: "retailer",
    categoryId: "deduction-chargeback",
    priority: "high",
    channel: "edi",
    deductionTypeId: "shortage",
    stageIndex: 1,
    order: 100,
    enteredStageAt: ago(1),
    account: "Zion Market",
    product: "Buldak Original, pouch",
    orderRef: "PO-480915",
    inquiry:
      "A deduction posted against our last remittance for a shortage we cannot tie to any delivery. Our receiving log shows the full count was signed for.",
  },

  {
    id: "FF-2151",
    createdAt: ago(48),
    role: "retailer",
    categoryId: "new-item-setup",
    priority: "standard",
    channel: "manual",
    deductionTypeId: null,
    stageIndex: 2,
    order: 100,
    enteredStageAt: ago(48),
    account: "Patel Brothers",
    product: "3 new Buldak SKUs",
    orderRef: "Not provided",
    inquiry:
      "We are adding three Buldak items. We need the item setup sheet, case dimensions, GTIN numbers, and the allergen statement before our buyer can load them.",
  },

  {
    id: "FF-2041",
    createdAt: ago(2),
    role: "retailer",
    categoryId: "short-shipment",
    priority: "high",
    channel: "edi",
    deductionTypeId: null,
    stageIndex: 1,
    order: 200,
    enteredStageAt: ago(2),
    account: "99 Ranch Market",
    product: "Buldak 2x Spicy, cup",
    orderRef: "PO-482207",
    inquiry:
      "We received 540 of 600 cases. Sixty cases short, nothing noted on the bill of lading, and the driver would not sign the exception. Our ad starts Friday.",
  },
  {
    id: "FF-2138",
    createdAt: ago(4),
    role: "retailer",
    categoryId: "damaged-missing",
    priority: "high",
    channel: "edi",
    deductionTypeId: null,
    stageIndex: 1,
    order: 300,
    enteredStageAt: ago(4),
    account: "Nijiya Market",
    product: "Buldak 2x Spicy, pouch",
    orderRef: "PO-482884",
    inquiry:
      "Two pallets arrived crushed and leaning. About forty-eight cases are unsellable. We photographed them on the dock before we broke them down.",
  },

  {
    id: "FF-2087",
    createdAt: ago(5),
    role: "retailer",
    categoryId: "pricing-promo-mismatch",
    priority: "elevated",
    channel: "edi",
    deductionTypeId: null,
    stageIndex: 3,
    order: 100,
    enteredStageAt: ago(5),
    account: "H Mart",
    product: "Buldak Carbonara, cup",
    orderRef: "AG-4471, INV-90733",
    inquiry:
      "The Q3 endcap feature was billed at list, not the agreed feature price. The agreement is signed and the dates match. Please correct it before we take it as a deduction.",
  },
  {
    id: "FF-2166",
    createdAt: ago(7),
    role: "distributor",
    categoryId: "deduction-chargeback",
    priority: "elevated",
    channel: "edi",
    deductionTypeId: "compliance",
    stageIndex: 3,
    order: 200,
    enteredStageAt: ago(7),
    account: "Hong Kong Supermarket",
    product: "Buldak Original, pouch",
    orderRef: "PO-481220",
    inquiry:
      "We were charged an on-time in-full penalty, but our ASN transmitted before the delivery and the carton labels scanned clean at receiving. We are disputing the fee.",
  },

  {
    id: "FF-2119",
    createdAt: ago(9),
    role: "distributor",
    categoryId: "late-delivery",
    priority: "high",
    channel: "portal",
    deductionTypeId: null,
    stageIndex: 2,
    order: 200,
    enteredStageAt: ago(9),
    account: "Seafood City Supermarket",
    product: "Buldak Carbonara, multi",
    orderRef: "PO-483340",
    inquiry:
      "The load missed its delivery appointment and our weekend circular breaks Friday. We need a firm arrival time or we pull the item from the ad.",
  },
  {
    id: "FF-2193",
    createdAt: ago(14),
    role: "distributor",
    categoryId: "deduction-chargeback",
    priority: "elevated",
    channel: "edi",
    deductionTypeId: "freight",
    stageIndex: 3,
    order: 300,
    enteredStageAt: ago(14),
    account: "Assi Plaza",
    product: "Buldak Cheese, pouch",
    orderRef: "PO-482440",
    inquiry:
      "A detention charge was deducted from our payment. Our bill of lading shows the driver arrived ninety minutes outside the scheduled appointment window.",
  },

  {
    id: "FF-2145",
    createdAt: ago(31),
    role: "distributor",
    categoryId: "invoice-dispute",
    priority: "elevated",
    channel: "edi",
    deductionTypeId: null,
    stageIndex: 4,
    order: 100,
    enteredStageAt: ago(31),
    account: "168 Market",
    product: "Buldak Cheese, pouch",
    orderRef: "INV-90711",
    inquiry:
      "The invoice total does not match our purchase order. One line appears to have been billed twice. We are holding payment on the difference only.",
  },
  {
    id: "FF-2205",
    createdAt: ago(40),
    role: "retailer",
    categoryId: "deduction-chargeback",
    priority: "high",
    channel: "edi",
    deductionTypeId: "trade-promo",
    stageIndex: 4,
    order: 200,
    enteredStageAt: ago(40),
    account: "Lotte Plaza Market",
    product: "Buldak Carbonara, cup",
    orderRef: "AG-4402",
    inquiry:
      "The spring promotion appears to have been funded twice: once as an off-invoice allowance and again as a bill-back claim. We would rather you catch it than we do.",
  },

  {
    id: "FF-2214",
    createdAt: ago(96),
    role: "retailer",
    categoryId: "pricing-promo-mismatch",
    priority: "elevated",
    channel: "edi",
    deductionTypeId: null,
    stageIndex: 4,
    order: 300,
    enteredStageAt: ago(96),
    account: "Tokyo Central",
    product: "Buldak Original, pouch",
    orderRef: "INV-90540",
    inquiry:
      "The cost change effective June 1 never reached our price file, so three weeks of invoices billed at the old cost. This is the second quarter it has happened.",
  },
  {
    id: "FF-2172",
    createdAt: ago(72),
    role: "retailer",
    categoryId: "standing-order",
    priority: "standard",
    channel: "portal",
    deductionTypeId: null,
    stageIndex: 4,
    order: 400,
    enteredStageAt: ago(72),
    account: "Great Wall Supermarket",
    product: "Top three cups",
    orderRef: "SO-559120",
    inquiry:
      "Our reorders have been manual and we keep running thin on the top three cups. Can we set a biweekly standing order with a fill rate commitment?",
  },
];

/**
 * Which synthetic team member owns which case type, so the audit trail reads the
 * way a real desk would: the deductions rep worked the deductions.
 */
/** Which rep carries a case of each category. Exported so a surface that features
    a case (the homepage teaser) names the same owner the board's audit trail does. */
export const OWNER_BY_CATEGORY: Record<string, string> = {
  "deduction-chargeback": "rep-priya",
  "invoice-dispute": "rep-priya",
  "pricing-promo-mismatch": "rep-elena",
  "bulk-order-status": "rep-marcus",
  "new-item-setup": "rep-marcus",
  "short-shipment": "rep-aisha",
  "damaged-missing": "rep-jordan",
  "late-delivery": "rep-aisha",
  "sku-availability": "rep-aisha",
  "standing-order": "rep-aisha",
};

/**
 * Build a plausible trail for a seeded case: it was opened, then walked forward
 * one stage at a time. The rep who owns the case type did the work; the team lead
 * signs off once the case reaches Resolved.
 */
function seedHistory(c: RoutedCase) {
  const rep = OWNER_BY_CATEGORY[c.categoryId] ?? "rep-marcus";
  const span = Date.now() - c.createdAt;
  const steps = c.stageIndex;
  const events: NonNullable<RoutedCase["history"]> = [
    { at: c.createdAt, actorId: rep, from: null, to: 0 },
  ];
  // The team lead signs off once a case reaches Resolved. Derived from the
  // lifecycle, never written as a number: inserting a stage would otherwise hand
  // the sign-off to whatever stage inherited index 6, silently.
  const signOffAt = indexOfStage("resolved");
  for (let to = 1; to <= steps; to += 1) {
    // Spread the moves across the case's life so the timestamps read plausibly.
    const at = c.createdAt + Math.round((span * to) / (steps + 1));
    const actorId = to >= signOffAt ? "lead-grace" : rep;
    events.push({ at, actorId, from: to - 1, to });
  }
  return events;
}

for (const c of SEED_CASES) {
  c.history = seedHistory(c);
  // Keep the stage clock honest: a case entered its current stage at its last
  // stamped move, so "how long it has sat here" matches the audit trail.
  const last = c.history[c.history.length - 1];
  c.enteredStageAt = last ? last.at : c.createdAt;
}

export const SEED_BY_ID: Record<string, RoutedCase> = SEED_CASES.reduce(
  (acc, c) => ({ ...acc, [c.id]: c }),
  {} as Record<string, RoutedCase>,
);

/**
 * The case the homepage teaser features and deep-links to on the ops board.
 * One constant, so the teaser and the board cannot drift apart. FF-2041 is the
 * short shipment: 540 of 600 cases received, high priority, sitting at In progress
 * and routed to Supply Chain, with the account's ad running Friday.
 */
export const TEASER_CASE_ID = "FF-2041";

/** Re-attach a seeded case's non-persisted display text after hydration. */
export function attachSeedDetails(c: RoutedCase): RoutedCase {
  const seed = SEED_BY_ID[c.id];
  if (!seed) return c;
  return {
    ...c,
    account: seed.account,
    product: seed.product,
    orderRef: seed.orderRef,
    inquiry: seed.inquiry,
  };
}
