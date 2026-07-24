import type { ResolutionScenario } from "@/types/domain";

/**
 * Representative resolution scenarios for the Resolution Simulator.
 * EVERYTHING here is synthetic and labeled — invented for demonstration.
 * No real accounts, orders, deductions, employees, or outcomes.
 *
 * These are all B2B account cases raised by retailers and distributors against
 * an order, shipment, or invoice. Lifecycle: reported, verified, routed,
 * resolution-proposed, customer-updated, resolved, improvement-review.
 */

export const SCENARIOS: ResolutionScenario[] = [
  {
    id: "s-carbonara-partial-order",
    channel: "account-issue",
    title: "Partial Carbonara order (backorder)",
    familyId: "buldak-carbonara",
    issueId: "v-partial-fill",
    severity: "elevated",
    reported: "A distributor's PO for Buldak Carbonara Multi shipped short against the ordered quantity.",
    verifiedFacts: [
      "PO number confirmed; ordered vs. shipped quantities reconciled.",
      "Backordered lines identified with a projected availability window.",
    ],
    evidenceNeeded: ["PO number", "Expected vs. received quantities"],
    owner: "Customer Experience manager",
    collaborators: ["Supply Chain", "Sales"],
    customerUpdateCommitment: "Acknowledge same day; confirmed backorder date within two business days.",
    resolutionOptions: ["Ship balance on a confirmed date", "Offer a substitute format where agreed", "Adjust the PO with buyer approval"],
    approvalsRequired: ["Delivery-date commitment", "Any substitution", "Any credit"],
    rootCause: "Allocation shortfall on a high-demand SKU.",
    correctiveAction: "Review demand signal with Supply Chain; adjust safety stock / allocation for the anchor SKU.",
    stages: [
      { stage: "reported", title: "Reported", detail: "Distributor reports the short ship against a PO. Logged, not yet picked up." },
      { stage: "in-progress", title: "In progress", detail: "CX acknowledges the buyer and keeps the account. The determination is routed to Supply Chain, with Sales supporting." },
      { stage: "verified", title: "Verified", detail: "Order Management reconciles ordered against shipped; the backorder lines are identified. Nothing is promised yet." },
      { stage: "resolution-proposed", title: "Resolution proposed", detail: "Balance shipment on a confirmed date, substitution optional with approval. Cleared before the buyer hears it, then given to them with the date." },
      { stage: "resolved", title: "Resolved", detail: "Balance shipped as committed, the PO closed, and the buyer confirmed in writing. The allocation shortfall feeds a fill-rate signal so the anchor SKU does not short again." },
    ],
    synthetic: true,
  },
  {
    id: "s-retailer-deduction",
    channel: "account-issue",
    title: "Retailer deduction / chargeback",
    familyId: "buldak-original",
    issueId: "v-deduction",
    severity: "priority",
    reported: "A retailer took a deduction citing a shortage on a received shipment of Buldak Original.",
    verifiedFacts: [
      "Deduction/claim number and reason code captured.",
      "Proof of delivery and packing documents pulled for reconciliation.",
    ],
    evidenceNeeded: ["Deduction / claim number", "Reason code", "Proof of delivery, BOL, packing list"],
    owner: "Customer Experience manager",
    collaborators: ["Finance", "Supply Chain", "Logistics"],
    customerUpdateCommitment: "Acknowledge within one business day; validity decision within the retailer's dispute window.",
    resolutionOptions: ["Accept the deduction if substantiated", "Dispute with documentation if not", "Partial resolution"],
    approvalsRequired: ["Any deduction acceptance / write-off", "Any dispute submission"],
    rootCause: "Claimed shortage. Determine whether pick/pack, transit, or receiving.",
    correctiveAction: "If a pattern by reason code emerges, drive corrective action with the responsible function.",
    stages: [
      { stage: "reported", title: "Reported", detail: "Deduction posts against the account with a reason code. The dispute clock starts here, not when we notice." },
      { stage: "in-progress", title: "In progress", detail: "CX acknowledges the retailer and keeps the account. The determination is routed to Finance, with Supply Chain and Logistics supporting." },
      { stage: "verified", title: "Verified", detail: "Documents are reconciled to test whether the shortage is substantiated. The facts are separated from the assumptions." },
      { stage: "resolution-proposed", title: "Resolution proposed", detail: "Accept if valid, dispute with evidence if not. Both require approval, and the retailer hears the decision and the rationale inside the dispute window." },
      { stage: "resolved", title: "Resolved", detail: "Deduction cleared or disputed, the ledger reconciled, and the reason code grouped into a pattern so the same claim does not arrive every cycle." },
    ],
    synthetic: true,
  },
  {
    id: "s-edi-failure",
    channel: "account-issue",
    title: "EDI 850 rejection",
    familyId: "buldak-carbonara",
    issueId: "v-edi",
    severity: "priority",
    reported: "A retailer's EDI 850 purchase order failed to translate into an order.",
    verifiedFacts: [
      "Transaction type identified (850).",
      "Rejection reason isolated (e.g., a mismatched item identifier / mapping error).",
    ],
    evidenceNeeded: ["Transaction type (850)", "Error/rejection message", "Affected PO"],
    owner: "Customer Experience manager",
    collaborators: ["IT / EDI", "Order Management"],
    customerUpdateCommitment: "Acknowledge same day; root-cause and reprocessing plan within one business day.",
    resolutionOptions: ["Correct the mapping and reprocess", "Manually enter the PO to protect the ship date", "Both"],
    approvalsRequired: ["Any manual order entry outside standard flow"],
    rootCause: "Item cross-reference / mapping mismatch between partners.",
    correctiveAction: "Fix the cross-reference; add a validation check so the same mapping cannot silently fail.",
    stages: [
      { stage: "reported", title: "Reported", detail: "EDI monitoring, or the partner, flags the failed 850. The order does not exist in the ERP yet." },
      { stage: "in-progress", title: "In progress", detail: "CX acknowledges the partner and keeps the account, coordinating IT, EDI, and Order Management on the determination." },
      { stage: "verified", title: "Verified", detail: "The rejection reason is isolated to a mapping mismatch rather than assumed to be one." },
      { stage: "resolution-proposed", title: "Resolution proposed", detail: "Reprocess after the mapping fix, with manual entry to protect the ship date. The partner is told the order is protected and the fix is underway." },
      { stage: "resolved", title: "Resolved", detail: "PO processed and the ship date held. A validation rule is added so the same mapping cannot fail silently, feeding an EDI-integrity signal." },
    ],
    synthetic: true,
  },
];

export const SCENARIO_BY_ID = Object.fromEntries(SCENARIOS.map((s) => [s.id, s]));
/** All scenarios are B2B account cases now; kept as a named export for the
 * Resolution Simulator and Command Center. */
export const ACCOUNT_SCENARIOS = SCENARIOS.filter((s) => s.channel === "account-issue");
