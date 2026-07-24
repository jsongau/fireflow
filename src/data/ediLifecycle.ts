/**
 * Retailer Order Lifecycle — the X12 aligned workflow study inside #o2c.
 *
 * One synthetic retailer purchase order (99 Ranch Market, PO 4500382711) worked
 * end to end: 850 in, 997 back, line validation, 855 out, release, 856, 810,
 * then a short-shipment deduction on the 820 remittance, resolved through the
 * case engine with a root cause and a corrective action.
 *
 * Every customer, document, quantity, price, and outcome in this file is
 * SYNTHETIC and labeled. This is a workflow study of how these documents relate,
 * not a live EDI integration, not SPS Commerce, and not Samyang data. No UPCs,
 * case-pack economics, or retailer terms are real.
 *
 * The whole simulation is one reducer over one state object, so every module
 * that shows this order (queue row, document trail, validation panels, case
 * board handoff) reads the same source of truth and Reset restores everything.
 */

import type { SapOrder } from "@/data/sapsd";
import type { RoutedCase } from "@/data/caseBoard";

/* ------------------------------------------------------------------ */
/* Money                                                               */
/* ------------------------------------------------------------------ */

export const fmtUsd = (cents: number): string =>
  `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/* Line economics. Cents per case. */
const PRICE = {
  origAccount: 2150,
  twoXSubmitted: 2375,
  twoXAccount: 2510,
  carbAccount: 2290,
} as const;

const QTY = {
  origOrdered: 120,
  twoXOrdered: 80,
  carbOrdered: 160,
  carbCommitted: 120,
  carbBackordered: 40,
  carbReceived: 116,
  carbShort: 4,
} as const;

export const DEDUCTION_CENTS = QTY.carbShort * PRICE.carbAccount; // $91.60

const invoiceTotalCents = (pricing: PricingDecision | "open"): number => {
  const twoX = pricing === "promo-honored" ? PRICE.twoXSubmitted : PRICE.twoXAccount;
  return (
    QTY.origOrdered * PRICE.origAccount +
    QTY.twoXOrdered * twoX +
    QTY.carbCommitted * PRICE.carbAccount
  );
};

/* ------------------------------------------------------------------ */
/* State machine                                                       */
/* ------------------------------------------------------------------ */

export type PricingDecision = "current-price" | "promo-honored";
export type DeductionStatus = "none" | "open" | "routed" | "resolved";

export interface AuditEvent {
  id: string;
  /** Synthetic clock stamp, e.g. "Jul 9 · 2:31 PM". */
  stamp: string;
  actor: string;
  text: string;
}

export interface LifecycleState {
  skuMapping: "review" | "approved";
  pricing: "open" | PricingDecision;
  allocation: "open" | "committed";
  ack855: boolean;
  released: boolean;
  shipped: boolean;
  invoiced: boolean;
  remittancePosted: boolean;
  deductionStatus: DeductionStatus;
  audit: AuditEvent[];
}

export type LifecycleActionType =
  | "APPROVE_SKU_MAPPING"
  | "RESOLVE_PRICING"
  | "COMMIT_ALLOCATION"
  | "GENERATE_855"
  | "RELEASE_ORDER"
  | "CREATE_SHIPMENT"
  | "GENERATE_INVOICE"
  | "POST_REMITTANCE"
  | "ROUTE_DEDUCTION"
  | "RESOLVE_DEDUCTION"
  | "RESET";

export type LifecycleAction =
  | { type: "APPROVE_SKU_MAPPING" }
  | { type: "RESOLVE_PRICING"; decision: PricingDecision }
  | { type: "COMMIT_ALLOCATION" }
  | { type: "GENERATE_855" }
  | { type: "RELEASE_ORDER" }
  | { type: "CREATE_SHIPMENT" }
  | { type: "GENERATE_INVOICE" }
  | { type: "POST_REMITTANCE" }
  | { type: "ROUTE_DEDUCTION" }
  | { type: "RESOLVE_DEDUCTION" }
  | { type: "RESET" };

/** Events already on the record when the study opens: the machine did its part. */
const INTAKE_AUDIT: AuditEvent[] = [
  { id: "a-recv", stamp: "Jul 9 · 2:31 PM", actor: "EDI gateway", text: "850 received from 99 Ranch Market. Interchange 000000482, transaction 0001." },
  { id: "a-struct", stamp: "Jul 9 · 2:31 PM", actor: "EDI gateway", text: "Structural validation passed: envelope, control numbers, segment count, three PO1 lines parsed." },
  { id: "a-997", stamp: "Jul 9 · 2:31 PM", actor: "EDI gateway", text: "997 functional acknowledgment returned, accepted. This confirms the transmission, not the business order." },
  { id: "a-xref", stamp: "Jul 9 · 2:32 PM", actor: "Order management", text: "Line 3 retailer item 99R-8305 has no stored cross reference. Held for a mapping decision." },
  { id: "a-price", stamp: "Jul 9 · 2:32 PM", actor: "Order management", text: "Line 2 submitted at a promotional price whose condition record ends before the requested delivery date. Pricing exception opened." },
  { id: "a-atp", stamp: "Jul 9 · 2:32 PM", actor: "Order management", text: "Line 3 availability check confirms 120 of 160 cases for the requested date. Allocation decision required." },
];

export const INITIAL_LIFECYCLE: LifecycleState = {
  skuMapping: "review",
  pricing: "open",
  allocation: "open",
  ack855: false,
  released: false,
  shipped: false,
  invoiced: false,
  remittancePosted: false,
  deductionStatus: "none",
  audit: INTAKE_AUDIT,
};

/** Monotonic Day 1 clock: 2:33 PM plus three minutes per recorded decision. */
function day1Stamp(s: LifecycleState): string {
  const decisions = s.audit.length - INTAKE_AUDIT.length;
  const total = 153 + decisions * 3; // minutes past 12:00 PM
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `Jul 9 · ${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} PM`;
}

export interface GateResult {
  ready: boolean;
  /** Visible reason when not ready. Governance is shown, never silent. */
  reason?: string;
}

/** Controlled transitions: what blocks an action is always named. */
export function gateFor(s: LifecycleState, action: LifecycleActionType): GateResult {
  switch (action) {
    case "APPROVE_SKU_MAPPING":
      return s.skuMapping === "review"
        ? { ready: true }
        : { ready: false, reason: "The cross reference is already approved." };
    case "RESOLVE_PRICING":
      return s.pricing === "open"
        ? { ready: true }
        : { ready: false, reason: "The pricing exception is already decided." };
    case "COMMIT_ALLOCATION":
      return s.allocation === "open"
        ? { ready: true }
        : { ready: false, reason: "The allocation is already committed." };
    case "GENERATE_855": {
      if (s.ack855) return { ready: false, reason: "The 855 has been sent." };
      const open: string[] = [];
      if (s.skuMapping === "review") open.push("the line 3 cross reference");
      if (s.pricing === "open") open.push("the line 2 pricing exception");
      if (s.allocation === "open") open.push("the line 3 allocation");
      return open.length === 0
        ? { ready: true }
        : { ready: false, reason: `Acknowledgment unavailable. Still open: ${open.join(", ")}.` };
    }
    case "RELEASE_ORDER":
      if (s.released) return { ready: false, reason: "The order is released." };
      return s.ack855
        ? { ready: true }
        : { ready: false, reason: "Release unavailable. The 855 acknowledgment has not been sent, so the retailer has not seen the revised commitment." };
    case "CREATE_SHIPMENT":
      if (s.shipped) return { ready: false, reason: "The shipment exists." };
      return s.released
        ? { ready: true }
        : { ready: false, reason: "Shipment unavailable. The order has not been released to the warehouse." };
    case "GENERATE_INVOICE":
      if (s.invoiced) return { ready: false, reason: "The invoice exists." };
      return s.shipped
        ? { ready: true }
        : { ready: false, reason: "Invoice unavailable. Billing reads shipped quantities, and nothing has shipped." };
    case "POST_REMITTANCE":
      if (s.remittancePosted) return { ready: false, reason: "The remittance is posted." };
      return s.invoiced
        ? { ready: true }
        : { ready: false, reason: "No remittance yet. The retailer pays against the invoice." };
    case "ROUTE_DEDUCTION":
      return s.deductionStatus === "open"
        ? { ready: true }
        : { ready: false, reason: s.deductionStatus === "none" ? "No deduction is open." : "The deduction is already being worked." };
    case "RESOLVE_DEDUCTION":
      return s.deductionStatus === "open" || s.deductionStatus === "routed"
        ? { ready: true }
        : { ready: false, reason: s.deductionStatus === "none" ? "No deduction is open." : "The deduction is resolved." };
    case "RESET":
      return { ready: true };
  }
}

const push = (s: LifecycleState, e: Omit<AuditEvent, "id">, id: string): AuditEvent[] => [
  ...s.audit,
  { id, ...e },
];

export function lifecycleReducer(s: LifecycleState, a: LifecycleAction): LifecycleState {
  if (a.type !== "RESET" && !gateFor(s, a.type).ready) return s;

  switch (a.type) {
    case "APPROVE_SKU_MAPPING":
      return {
        ...s,
        skuMapping: "approved",
        audit: push(s, {
          stamp: day1Stamp(s), actor: "CX operations",
          text: "Retailer item 99R-8305 mapped to SY-BLDK-CARB-MP after review. The cross reference is stored for future orders.",
        }, `a-map-${s.audit.length}`),
      };
    case "RESOLVE_PRICING": {
      const text =
        a.decision === "current-price"
          ? `Line 2 will bill the current account price of ${fmtUsd(PRICE.twoXAccount)} per case. The promotional condition ends Jul 12 and the requested delivery is Jul 16. The 855 will carry the price change so the retailer sees it before the invoice does.`
          : `Line 2 honors the submitted promotional price of ${fmtUsd(PRICE.twoXSubmitted)} per case as a one-time exception, approved by Sales operations. The condition record gap is logged for correction.`;
      return {
        ...s,
        pricing: a.decision,
        audit: push(s, { stamp: day1Stamp(s), actor: "CX operations with Sales", text }, `a-pricing-${s.audit.length}`),
      };
    }
    case "COMMIT_ALLOCATION":
      return {
        ...s,
        allocation: "committed",
        audit: push(s, {
          stamp: day1Stamp(s), actor: "CX operations with Supply Chain",
          text: "Line 3 committed at 120 cases for the requested date, 40 cases backordered with availability Jul 24. The revised commitment goes on the 855, not in a surprise short shipment.",
        }, `a-alloc-${s.audit.length}`),
      };
    case "GENERATE_855":
      return {
        ...s,
        ack855: true,
        audit: push(s, {
          stamp: day1Stamp(s), actor: "EDI gateway",
          text: "855 purchase order acknowledgment sent: line 1 accepted, line 2 accepted with the decided price, line 3 accepted at 120 with 40 backordered for Jul 24.",
        }, `a-855-${s.audit.length}`),
      };
    case "RELEASE_ORDER":
      return {
        ...s,
        released: true,
        audit: push(s, {
          stamp: day1Stamp(s), actor: "CX operations",
          text: "Order released to the Buena Park warehouse against the acknowledged quantities.",
        }, `a-rel-${s.audit.length}`),
      };
    case "CREATE_SHIPMENT":
      return {
        ...s,
        shipped: true,
        audit: push(s, {
          stamp: "Jul 15 · 9:04 AM", actor: "Distribution operations",
          text: "Shipment SHP-4500382711 confirmed on BOL-118276 and the 856 advance ship notice sent: 120, 80, and 120 cases across the three lines.",
        }, `a-856-${s.audit.length}`),
      };
    case "GENERATE_INVOICE":
      return {
        ...s,
        invoiced: true,
        audit: push(s, {
          stamp: "Jul 15 · 11:20 AM", actor: "Billing",
          text: `810 invoice INV-90412 generated from shipped quantities at approved prices. Total ${fmtUsd(invoiceTotalCents(s.pricing))}.`,
        }, `a-810-${s.audit.length}`),
      };
    case "POST_REMITTANCE":
      return {
        ...s,
        remittancePosted: true,
        deductionStatus: "open",
        audit: push(s, {
          stamp: "Aug 10 · 8:12 AM", actor: "Finance",
          text: `820 remittance posted ${fmtUsd(DEDUCTION_CENTS)} short of INV-90412, reason code 22, shortage. The retailer receiving record shows 116 Carbonara cases against 120 on the ASN. Deduction opened.`,
        }, `a-820-${s.audit.length}`),
      };
    case "ROUTE_DEDUCTION":
      return {
        ...s,
        deductionStatus: "routed",
        audit: push(s, {
          stamp: "Aug 10 · 9:00 AM", actor: "CX operations",
          text: "Deduction routed to the case board as FF-2231 with the PO, ASN, BOL, invoice, and receiving record attached. One owner, one promised update.",
        }, `a-route-${s.audit.length}`),
      };
    case "RESOLVE_DEDUCTION":
      return {
        ...s,
        deductionStatus: "resolved",
        audit: push(s, {
          stamp: "Aug 12 · 3:40 PM", actor: "CX operations with Finance",
          text: `Warehouse loading count confirmed the four-case shortage, so the deduction is valid. Credit memo issued for ${fmtUsd(DEDUCTION_CENTS)}. Corrective action assigned to Distribution operations: pallet count verification before ASN release on mixed SKU shipments, checked across the next ten qualifying loads.`,
        }, `a-resolve-${s.audit.length}`),
      };
    case "RESET":
      return INITIAL_LIFECYCLE;
  }
}

/* ------------------------------------------------------------------ */
/* Order lines                                                         */
/* ------------------------------------------------------------------ */

export interface LineView {
  lineNo: 1 | 2 | 3;
  product: string;
  familyId: string;
  retailerSku: string;
  internalSku: string | null;
  ordered: number;
  committed: number | null;
  backordered: number;
  submittedCents: number;
  approvedCents: number | null;
  /** Word plus glyph, never color alone. */
  statusGlyph: string;
  statusWord: string;
  issue: string | null;
}

export function lineViews(s: LifecycleState): LineView[] {
  const doneWord = s.shipped ? "Shipped" : s.released ? "Released" : "Ready";
  const doneGlyph = "✓";
  return [
    {
      lineNo: 1,
      product: "Buldak Original, Multi (5-pack)",
      familyId: "buldak-original",
      retailerSku: "99R-8218",
      internalSku: "SY-BLDK-ORIG-MP",
      ordered: QTY.origOrdered,
      committed: QTY.origOrdered,
      backordered: 0,
      submittedCents: PRICE.origAccount,
      approvedCents: PRICE.origAccount,
      statusGlyph: doneGlyph,
      statusWord: doneWord,
      issue: null,
    },
    {
      lineNo: 2,
      product: "Buldak 2X Spicy, Multi (5-pack)",
      familyId: "buldak-2x-spicy",
      retailerSku: "99R-8217",
      internalSku: "SY-BLDK-2X-MP",
      ordered: QTY.twoXOrdered,
      committed: s.pricing === "open" ? null : QTY.twoXOrdered,
      backordered: 0,
      submittedCents: PRICE.twoXSubmitted,
      approvedCents:
        s.pricing === "open" ? null : s.pricing === "promo-honored" ? PRICE.twoXSubmitted : PRICE.twoXAccount,
      statusGlyph: s.pricing === "open" ? "▲" : doneGlyph,
      statusWord: s.pricing === "open" ? "Pricing review" : doneWord,
      issue:
        s.pricing === "open"
          ? `Submitted at ${fmtUsd(PRICE.twoXSubmitted)} against a promotional condition that ends Jul 12. The requested delivery is Jul 16, outside the promotion. Current account price is ${fmtUsd(PRICE.twoXAccount)}.`
          : null,
    },
    {
      lineNo: 3,
      product: "Buldak Carbonara, Multi (5-pack)",
      familyId: "buldak-carbonara",
      retailerSku: "99R-8305",
      internalSku: s.skuMapping === "approved" ? "SY-BLDK-CARB-MP" : null,
      ordered: QTY.carbOrdered,
      committed: s.allocation === "committed" ? QTY.carbCommitted : null,
      backordered: s.allocation === "committed" ? QTY.carbBackordered : 0,
      submittedCents: PRICE.carbAccount,
      approvedCents: PRICE.carbAccount,
      statusGlyph: s.skuMapping === "review" || s.allocation === "open" ? "▲" : doneGlyph,
      statusWord:
        s.skuMapping === "review"
          ? "Cross reference review"
          : s.allocation === "open"
            ? "Allocation review"
            : doneWord,
      issue:
        s.skuMapping === "review"
          ? "Retailer item 99R-8305 has no stored cross reference. The line name and pack match SY-BLDK-CARB-MP; a person approves the mapping so a wrong guess never books a wrong order."
          : s.allocation === "open"
            ? "Availability confirms 120 of 160 cases for Jul 16. The remaining 40 cases are available Jul 24."
            : null,
    },
  ];
}

/* ------------------------------------------------------------------ */
/* Validation panels                                                   */
/* ------------------------------------------------------------------ */

export interface CheckView {
  id: string;
  glyph: string;
  word: string;
  label: string;
  detail: string;
}

/** Structural validation: can the transmission be read at all. Static: it passed. */
export const STRUCTURAL_CHECKS: CheckView[] = [
  { id: "st-env", glyph: "✓", word: "Pass", label: "Envelope complete", detail: "ISA and IEA present, interchange control number 000000482 matches head to tail." },
  { id: "st-group", glyph: "✓", word: "Pass", label: "Functional group recognized", detail: "GS declares a PO group in version 004010 from a known trading partner." },
  { id: "st-count", glyph: "✓", word: "Pass", label: "Segment count matches", detail: "SE declares 10 segments and 10 were read." },
  { id: "st-req", glyph: "✓", word: "Pass", label: "Required segments present", detail: "BEG, N1 ship-to, and at least one PO1 line all present." },
  { id: "st-dup", glyph: "✓", word: "Pass", label: "Not a duplicate", detail: "Control number 000000482 has not been processed before." },
  { id: "st-lines", glyph: "✓", word: "Pass", label: "Three lines parsed", detail: "PO1 loop parsed into three order lines with quantities and prices." },
];

/** Business validation: should this order be accepted as sent. Reads the state. */
export function businessChecks(s: LifecycleState): CheckView[] {
  return [
    { id: "bz-acct", glyph: "✓", word: "Pass", label: "Account and ship-to valid", detail: "99 Ranch Market is an active sold-to and BUENAPARK01 is a stored ship-to with terms and a pricing profile." },
    {
      id: "bz-xref",
      glyph: s.skuMapping === "approved" ? "✓" : "▲",
      word: s.skuMapping === "approved" ? "Pass" : "Review",
      label: "Retailer items cross referenced",
      detail:
        s.skuMapping === "approved"
          ? "All three retailer items map to internal SKUs. The 99R-8305 mapping was approved and stored this order."
          : "99R-8218 and 99R-8217 map to stored SKUs. 99R-8305 is unmapped and holds line 3.",
    },
    {
      id: "bz-price",
      glyph: s.pricing === "open" ? "▲" : "✓",
      word: s.pricing === "open" ? "Review" : "Pass",
      label: "Prices match conditions",
      detail:
        s.pricing === "open"
          ? "Lines 1 and 3 match account prices. Line 2 cites a promotion that ends before the requested delivery date."
          : s.pricing === "promo-honored"
            ? "Line 2 honors the promotional price as an approved one-time exception."
            : "Line 2 bills the current account price, carried to the retailer on the 855.",
    },
    {
      id: "bz-atp",
      glyph: s.allocation === "open" ? "▲" : "✓",
      word: s.allocation === "open" ? "Review" : "Pass",
      label: "Quantities available",
      detail:
        s.allocation === "open"
          ? "Lines 1 and 2 confirm in full. Line 3 confirms 120 of 160 cases for the requested date."
          : "Line 3 committed at 120 cases with 40 backordered for Jul 24; the 855 carries the revised commitment.",
    },
    { id: "bz-date", glyph: "✓", word: "Pass", label: "Requested date feasible", detail: "Jul 16 clears the account lead time from the Buena Park distribution center." },
  ];
}

/* ------------------------------------------------------------------ */
/* Documents                                                           */
/* ------------------------------------------------------------------ */

export type EdiDocId = "850" | "997" | "855" | "856" | "810" | "820";

export interface EdiSegmentView {
  id: string;
  raw: string;
  /** Plain-language reading shown when the segment is selected or Explain is on. */
  explain: string;
  /** Business fields this segment carries, for two-way highlighting. */
  fieldIds: string[];
}

export interface EdiFieldView {
  id: string;
  label: string;
  value: string;
  segmentId: string;
}

export interface EdiDocView {
  docId: EdiDocId;
  title: string;
  direction: "Inbound" | "Outbound";
  /** Word plus glyph for the trail chip. */
  statusWord: string;
  statusGlyph: string;
  available: boolean;
  /** Named reason when not yet available. */
  pendingReason: string | null;
  purpose: string;
  /** The one distinction worth teaching, when there is one. */
  note: string | null;
  segments: EdiSegmentView[];
  fields: EdiFieldView[];
}

const price = (cents: number) => (cents / 100).toFixed(2);

export function docViews(s: LifecycleState): EdiDocView[] {
  const twoXCents =
    s.pricing === "promo-honored" ? PRICE.twoXSubmitted : PRICE.twoXAccount;
  const invTotal = invoiceTotalCents(s.pricing);
  const remitTotal = invTotal - DEDUCTION_CENTS;

  const d850: EdiDocView = {
    docId: "850",
    title: "850 Purchase Order",
    direction: "Inbound",
    statusWord: "Received",
    statusGlyph: "✓",
    available: true,
    pendingReason: null,
    purpose: "The retailer places the order: who is buying, where it ships, what they want, at what price, by when.",
    note: null,
    segments: [
      { id: "isa", raw: "ISA*00*          *00*          *ZZ*99RANCH        *ZZ*SAMYANGUS      *260709*1431*U*00401*000000482*0*P*>~", explain: "Interchange envelope: sender 99RANCH, receiver SAMYANGUS, control number 000000482.", fieldIds: [] },
      { id: "gs", raw: "GS*PO*99RANCH*SAMYANGUS*20260709*1431*482*X*004010~", explain: "Functional group: purchase orders, X12 version 004010.", fieldIds: [] },
      { id: "st", raw: "ST*850*0001~", explain: "Transaction set header: this is an 850, control number 0001.", fieldIds: [] },
      { id: "beg", raw: "BEG*00*SA*4500382711**20260709~", explain: "Order purpose and identity: an original stand-alone order, PO 4500382711, dated Jul 9, 2026.", fieldIds: ["f-po", "f-date"] },
      { id: "dtm", raw: "DTM*002*20260716~", explain: "Date qualifier 002, requested delivery: Jul 16, 2026.", fieldIds: ["f-delivery"] },
      { id: "n1", raw: "N1*ST*99 RANCH MARKET DC*92*BUENAPARK01~", explain: "Named party, qualifier ST: ship-to is the Buena Park distribution center, location code BUENAPARK01.", fieldIds: ["f-shipto"] },
      { id: "po1-1", raw: "PO1*1*120*CA*21.50**SK*99R-8218*VN*SY-BLDK-ORIG-MP~", explain: "Line 1: 120 cases at $21.50, retailer item 99R-8218, vendor item SY-BLDK-ORIG-MP.", fieldIds: ["f-l1"] },
      { id: "po1-2", raw: "PO1*2*80*CA*23.75**SK*99R-8217*VN*SY-BLDK-2X-MP~", explain: "Line 2: 80 cases at $23.75, retailer item 99R-8217, vendor item SY-BLDK-2X-MP.", fieldIds: ["f-l2"] },
      { id: "po1-3", raw: "PO1*3*160*CA*22.90**SK*99R-8305~", explain: "Line 3: 160 cases at $22.90, retailer item 99R-8305, and no vendor item qualifier. This is the line that needs a cross reference.", fieldIds: ["f-l3"] },
      { id: "ctt", raw: "CTT*3~", explain: "Transaction totals: three line items.", fieldIds: [] },
      { id: "se", raw: "SE*10*0001~", explain: "Transaction trailer: 10 segments, matching the header control number.", fieldIds: [] },
    ],
    fields: [
      { id: "f-po", label: "Purchase order", value: "4500382711", segmentId: "beg" },
      { id: "f-date", label: "Order date", value: "Jul 9, 2026", segmentId: "beg" },
      { id: "f-delivery", label: "Requested delivery", value: "Jul 16, 2026", segmentId: "dtm" },
      { id: "f-shipto", label: "Ship to", value: "99 Ranch Market DC, Buena Park, CA (BUENAPARK01)", segmentId: "n1" },
      { id: "f-l1", label: "Line 1", value: "Buldak Original · 120 cases at $21.50 · 99R-8218", segmentId: "po1-1" },
      { id: "f-l2", label: "Line 2", value: "Buldak 2X Spicy · 80 cases at $23.75 · 99R-8217", segmentId: "po1-2" },
      { id: "f-l3", label: "Line 3", value: "Buldak Carbonara · 160 cases at $22.90 · 99R-8305", segmentId: "po1-3" },
    ],
  };

  const d997: EdiDocView = {
    docId: "997",
    title: "997 Functional Acknowledgment",
    direction: "Outbound",
    statusWord: "Returned",
    statusGlyph: "✓",
    available: true,
    pendingReason: null,
    purpose: "Confirms the transmission itself: the document arrived and its structure could be read.",
    note: "A 997 confirms technical receipt only. It does not accept the order, confirm price or inventory, or promise a date. The business answer is the 855.",
    segments: [
      { id: "st", raw: "ST*997*0001~", explain: "Transaction set header: a functional acknowledgment.", fieldIds: [] },
      { id: "ak1", raw: "AK1*PO*482~", explain: "Acknowledges functional group 482, the purchase order group.", fieldIds: ["f-group"] },
      { id: "ak9", raw: "AK9*A*1*1*1~", explain: "Result: accepted. One transaction set received, one accepted.", fieldIds: ["f-result"] },
      { id: "se", raw: "SE*4*0001~", explain: "Transaction trailer.", fieldIds: [] },
    ],
    fields: [
      { id: "f-group", label: "Acknowledges", value: "PO group 482 from 99 Ranch Market", segmentId: "ak1" },
      { id: "f-result", label: "Result", value: "Accepted: structure valid, transmission readable", segmentId: "ak9" },
    ],
  };

  const ackLine2 =
    s.pricing === "promo-honored"
      ? { raw: `ACK*IA*80*CA~`, explain: "Line 2 response, IA: item accepted at the submitted promotional price, honored as a one-time exception." , value: `Accepted · 80 cases at ${fmtUsd(PRICE.twoXSubmitted)} (promotion honored once)` }
      : { raw: `ACK*IP*80*CA~`, explain: "Line 2 response, IP: accepted with a price change. The invoice will carry the current account price.", value: `Accepted with price change · 80 cases at ${fmtUsd(PRICE.twoXAccount)}` };

  const d855: EdiDocView = {
    docId: "855",
    title: "855 PO Acknowledgment",
    direction: "Outbound",
    statusWord: s.ack855 ? "Sent" : "Waiting",
    statusGlyph: s.ack855 ? "✓" : "○",
    available: s.ack855,
    pendingReason: s.ack855
      ? null
      : gateFor(s, "GENERATE_855").reason ??
        "All three line decisions are made. Send the 855 from Advance the order below.",
    purpose: "The business response, line by line: what is accepted, what changed, what is backordered, and the revised dates.",
    note: "This is where customer experience is visible: the retailer learns about the price decision and the backorder here, from us, before the truck and the invoice.",
    segments: [
      { id: "st", raw: "ST*855*0001~", explain: "Transaction set header: a purchase order acknowledgment.", fieldIds: [] },
      { id: "bak", raw: "BAK*00*AC*4500382711*20260709~", explain: "Acknowledgment header, AC: acknowledged with detail and change, referencing PO 4500382711.", fieldIds: ["f-ref"] },
      { id: "po1-1", raw: "PO1*1*120*CA*21.50**SK*99R-8218*VN*SY-BLDK-ORIG-MP~", explain: "Line 1 restated.", fieldIds: [] },
      { id: "ack-1", raw: "ACK*IA*120*CA~", explain: "Line 1 response, IA: item accepted as submitted, 120 cases.", fieldIds: ["f-r1"] },
      { id: "po1-2", raw: `PO1*2*80*CA*${price(twoXCents)}**SK*99R-8217*VN*SY-BLDK-2X-MP~`, explain: "Line 2 restated at the decided price.", fieldIds: [] },
      { id: "ack-2", raw: ackLine2.raw, explain: ackLine2.explain, fieldIds: ["f-r2"] },
      { id: "po1-3", raw: "PO1*3*160*CA*22.90**SK*99R-8305*VN*SY-BLDK-CARB-MP~", explain: "Line 3 restated with the approved cross reference on it.", fieldIds: [] },
      { id: "ack-3a", raw: "ACK*IA*120*CA~", explain: "Line 3 response, first schedule: 120 cases accepted for the requested date.", fieldIds: ["f-r3"] },
      { id: "ack-3b", raw: "ACK*IB*40*CA*068*20260724~", explain: "Line 3 response, IB: 40 cases backordered, available Jul 24.", fieldIds: ["f-r3"] },
      { id: "ctt", raw: "CTT*3~", explain: "Three lines acknowledged.", fieldIds: [] },
      { id: "se", raw: "SE*11*0001~", explain: "Transaction trailer.", fieldIds: [] },
    ],
    fields: [
      { id: "f-ref", label: "References", value: "PO 4500382711 · acknowledged with changes", segmentId: "bak" },
      { id: "f-r1", label: "Line 1 response", value: "Accepted as submitted · 120 cases at $21.50", segmentId: "ack-1" },
      { id: "f-r2", label: "Line 2 response", value: ackLine2.value, segmentId: "ack-2" },
      { id: "f-r3", label: "Line 3 response", value: "120 cases accepted · 40 backordered, available Jul 24", segmentId: "ack-3a" },
    ],
  };

  const d856: EdiDocView = {
    docId: "856",
    title: "856 Advance Ship Notice",
    direction: "Outbound",
    statusWord: s.shipped ? "Sent" : "Waiting",
    statusGlyph: s.shipped ? "✓" : "○",
    available: s.shipped,
    pendingReason: s.shipped
      ? null
      : s.released
        ? "The order is released. Confirm the shipment from Advance the order below."
        : "Waiting on order release and shipment.",
    purpose: "Tells the retailer exactly what is on the truck and how it is packed, so receiving can check the load against a document instead of a guess.",
    note: "The quantities here are what receiving will count against. This shipment reports 120 Carbonara cases; hold that number, it is about to matter.",
    segments: [
      { id: "st", raw: "ST*856*0001~", explain: "Transaction set header: an advance ship notice.", fieldIds: [] },
      { id: "bsn", raw: "BSN*00*SHP-4500382711*20260715*0904~", explain: "Shipment identity: SHP-4500382711, shipped Jul 15, 2026.", fieldIds: ["f-ship"] },
      { id: "hl-s", raw: "HL*1**S~", explain: "Hierarchy: shipment level.", fieldIds: [] },
      { id: "td5", raw: "TD5*B*2*PACWEST*M~", explain: "Carrier routing: PacWest Freight, motor.", fieldIds: ["f-carrier"] },
      { id: "ref-bm", raw: "REF*BM*BOL-118276~", explain: "Bill of lading number BOL-118276, the carrier's record of what was loaded.", fieldIds: ["f-bol"] },
      { id: "dtm", raw: "DTM*017*20260716~", explain: "Estimated delivery: Jul 16, 2026.", fieldIds: ["f-eta"] },
      { id: "hl-o", raw: "HL*2*1*O~", explain: "Hierarchy: order level, under the shipment.", fieldIds: [] },
      { id: "prf", raw: "PRF*4500382711~", explain: "References the retailer's PO.", fieldIds: [] },
      { id: "lin-1", raw: "LIN**SK*99R-8218*VN*SY-BLDK-ORIG-MP~", explain: "Item: Buldak Original multipack.", fieldIds: [] },
      { id: "sn1-1", raw: "SN1**120*CA~", explain: "Shipped: 120 cases.", fieldIds: ["f-q1"] },
      { id: "lin-2", raw: "LIN**SK*99R-8217*VN*SY-BLDK-2X-MP~", explain: "Item: Buldak 2X Spicy multipack.", fieldIds: [] },
      { id: "sn1-2", raw: "SN1**80*CA~", explain: "Shipped: 80 cases.", fieldIds: ["f-q2"] },
      { id: "lin-3", raw: "LIN**SK*99R-8305*VN*SY-BLDK-CARB-MP~", explain: "Item: Buldak Carbonara multipack.", fieldIds: [] },
      { id: "sn1-3", raw: "SN1**120*CA~", explain: "Shipped: 120 cases. The 40 backordered cases follow on their own shipment.", fieldIds: ["f-q3"] },
      { id: "ctt", raw: "CTT*3~", explain: "Three items in the shipment.", fieldIds: [] },
      { id: "se", raw: "SE*16*0001~", explain: "Transaction trailer.", fieldIds: [] },
    ],
    fields: [
      { id: "f-ship", label: "Shipment", value: "SHP-4500382711 · shipped Jul 15, 2026", segmentId: "bsn" },
      { id: "f-carrier", label: "Carrier", value: "PacWest Freight · motor", segmentId: "td5" },
      { id: "f-bol", label: "Bill of lading", value: "BOL-118276", segmentId: "ref-bm" },
      { id: "f-eta", label: "Estimated delivery", value: "Jul 16, 2026", segmentId: "dtm" },
      { id: "f-q1", label: "Buldak Original", value: "120 cases shipped", segmentId: "sn1-1" },
      { id: "f-q2", label: "Buldak 2X Spicy", value: "80 cases shipped", segmentId: "sn1-2" },
      { id: "f-q3", label: "Buldak Carbonara", value: "120 cases shipped (40 backordered to follow)", segmentId: "sn1-3" },
    ],
  };

  const d810: EdiDocView = {
    docId: "810",
    title: "810 Invoice",
    direction: "Outbound",
    statusWord: s.invoiced ? "Sent" : "Waiting",
    statusGlyph: s.invoiced ? "✓" : "○",
    available: s.invoiced,
    pendingReason: s.invoiced
      ? null
      : gateFor(s, "GENERATE_INVOICE").ready
        ? "The shipment is confirmed. Generate the invoice from Advance the order below."
        : "Waiting on the shipment. Billing reads shipped quantities, not ordered quantities.",
    purpose: "Bills what shipped at the approved prices. Shipped quantities, not ordered quantities: that one habit prevents a whole class of disputes.",
    note: null,
    segments: [
      { id: "st", raw: "ST*810*0001~", explain: "Transaction set header: an invoice.", fieldIds: [] },
      { id: "big", raw: "BIG*20260715*INV-90412*20260709*4500382711~", explain: "Invoice INV-90412 dated Jul 15, referencing PO 4500382711.", fieldIds: ["f-inv"] },
      { id: "it1-1", raw: "IT1*1*120*CA*21.50**SK*99R-8218~", explain: "Bills line 1: 120 shipped cases at $21.50.", fieldIds: ["f-a1"] },
      { id: "it1-2", raw: `IT1*2*80*CA*${price(twoXCents)}**SK*99R-8217~`, explain: "Bills line 2 at the approved price from the pricing decision.", fieldIds: ["f-a2"] },
      { id: "it1-3", raw: "IT1*3*120*CA*22.90**SK*99R-8305~", explain: "Bills line 3 at the 120 cases that shipped, not the 160 ordered.", fieldIds: ["f-a3"] },
      { id: "tds", raw: `TDS*${invTotal}~`, explain: "Total invoice amount, in cents.", fieldIds: ["f-total"] },
      { id: "ctt", raw: "CTT*3~", explain: "Three lines billed.", fieldIds: [] },
      { id: "se", raw: "SE*8*0001~", explain: "Transaction trailer.", fieldIds: [] },
    ],
    fields: [
      { id: "f-inv", label: "Invoice", value: "INV-90412 · Jul 15, 2026 · PO 4500382711", segmentId: "big" },
      { id: "f-a1", label: "Line 1 amount", value: `120 × ${fmtUsd(PRICE.origAccount)} = ${fmtUsd(120 * PRICE.origAccount)}`, segmentId: "it1-1" },
      { id: "f-a2", label: "Line 2 amount", value: `80 × ${fmtUsd(twoXCents)} = ${fmtUsd(80 * twoXCents)}`, segmentId: "it1-2" },
      { id: "f-a3", label: "Line 3 amount", value: `120 × ${fmtUsd(PRICE.carbAccount)} = ${fmtUsd(120 * PRICE.carbAccount)}`, segmentId: "it1-3" },
      { id: "f-total", label: "Invoice total", value: fmtUsd(invTotal), segmentId: "tds" },
    ],
  };

  const d820: EdiDocView = {
    docId: "820",
    title: "820 Remittance",
    direction: "Inbound",
    statusWord: s.remittancePosted ? "Posted" : "Waiting",
    statusGlyph: s.remittancePosted ? "◆" : "○",
    available: s.remittancePosted,
    pendingReason: s.remittancePosted ? null : "The retailer pays against the invoice. Post the remittance to see how they paid.",
    purpose: "The payment detail: which invoice it covers and what was held back, with a reason code.",
    note: "The remittance is where a deduction actually arrives: the payment simply comes in short, and the reason code is the only explanation offered.",
    segments: [
      { id: "st", raw: "ST*820*0001~", explain: "Transaction set header: a payment order with remittance detail.", fieldIds: [] },
      { id: "bpr", raw: `BPR*I*${price(remitTotal)}*C*ACH~`, explain: "Payment by ACH for the remitted amount.", fieldIds: ["f-paid"] },
      { id: "trn", raw: "TRN*1*RMT-55018~", explain: "Payment trace number RMT-55018.", fieldIds: [] },
      { id: "rmr", raw: `RMR*IV*INV-90412**${price(remitTotal)}*${price(invTotal)}~`, explain: "Covers INV-90412: paid amount against the billed amount.", fieldIds: ["f-against"] },
      { id: "adx", raw: `ADX*-${price(DEDUCTION_CENTS)}*22~`, explain: "Adjustment: a deduction with reason code 22, shortage. Four Carbonara cases claimed short at receiving.", fieldIds: ["f-ded"] },
      { id: "se", raw: "SE*6*0001~", explain: "Transaction trailer.", fieldIds: [] },
    ],
    fields: [
      { id: "f-paid", label: "Paid", value: `${fmtUsd(remitTotal)} by ACH`, segmentId: "bpr" },
      { id: "f-against", label: "Against", value: `INV-90412 · billed ${fmtUsd(invTotal)}`, segmentId: "rmr" },
      { id: "f-ded", label: "Deduction", value: `${fmtUsd(DEDUCTION_CENTS)} · reason code 22, shortage · 4 cases`, segmentId: "adx" },
    ],
  };

  return [d850, d997, d855, d856, d810, d820];
}

/* ------------------------------------------------------------------ */
/* Deduction reconciliation                                            */
/* ------------------------------------------------------------------ */

export interface ReconcileRow {
  label: string;
  value: string;
  source: string;
}

/** The Carbonara count at every checkpoint. The story of the deduction is in one column. */
export const RECONCILE_ROWS: ReconcileRow[] = [
  { label: "Ordered", value: "160 cases", source: "850 line 3" },
  { label: "Acknowledged", value: "120 cases, 40 backordered", source: "855 line 3" },
  { label: "Shipped per ASN", value: "120 cases", source: "856" },
  { label: "Received", value: "116 cases", source: "Retailer receiving record" },
  { label: "Invoiced", value: "120 cases", source: "810 line 3" },
  { label: "Paid", value: "116 cases", source: "820 deduction, reason code 22" },
];

export interface CorrectiveClose {
  resolution: string;
  rootCause: string;
  correctiveAction: string;
  owner: string;
  verification: string;
  sopImpact: string;
}

export const CORRECTIVE_CLOSE: CorrectiveClose = {
  resolution: `Deduction validated and a credit memo issued for ${fmtUsd(DEDUCTION_CENTS)}, four cases at ${fmtUsd(PRICE.carbAccount)}. The account was told the outcome in writing by one named owner.`,
  rootCause: "The warehouse loading count differed from the shipment confirmation. The ASN reported the picked quantity; four cases never made the truck on a mixed SKU pallet.",
  correctiveAction: "Add a pallet count verification before ASN release for mixed SKU shipments, so the 856 reports what was loaded, not what was picked.",
  owner: "Distribution operations",
  verification: "Audit the next ten qualifying mixed SKU shipments for pick-to-load count match.",
  sopImpact: "Shipment confirmation checklist updated; the acknowledgment and communication steps did their job and stay as they are.",
};

/* ------------------------------------------------------------------ */
/* Bridges into the rest of FireFlow                                   */
/* ------------------------------------------------------------------ */

export const LIFECYCLE_ORDER_ID = "ranch99-lifecycle";
/** sessionStorage key another module writes to request this order be opened in #o2c. */
export const O2C_OPEN_ORDER_KEY = "fireflow:o2c:open-order";
export const LIFECYCLE_CASE_ID = "FF-2231";
export const LIFECYCLE_FAMILY_IDS = ["buldak-original", "buldak-2x-spicy", "buldak-carbonara"];

/** Derive the queue row: the same order the queue triages, moving as it is worked. */
export function lifecycleAsSapOrder(s: LifecycleState): SapOrder {
  const decisionsDone =
    s.skuMapping === "approved" && s.pricing !== "open" && s.allocation === "committed";
  const anyDecision =
    s.skuMapping === "approved" || s.pricing !== "open" || s.allocation === "committed";

  const stageId = s.deductionStatus === "resolved"
    ? "resolution"
    : s.remittancePosted
      ? "deduction"
      : s.invoiced
        ? "invoice"
        : s.shipped
          ? "pgi"
          : s.released
            ? "delivery"
            : decisionsDone
              ? "order"
              : anyDecision
                ? "hold"
                : "po";

  const exceptionId = s.pricing === "open"
    ? "promo-mismatch"
    : s.allocation === "open"
      ? "unavailable"
      : s.deductionStatus === "open" || s.deductionStatus === "routed"
        ? "short-ship-claim"
        : null;

  const exposure = s.pricing === "open"
    ? "$108"
    : s.deductionStatus === "open" || s.deductionStatus === "routed"
      ? "$92"
      : "—";

  return {
    id: LIFECYCLE_ORDER_ID,
    customer: "99 Ranch Market",
    po: "PO 4500382711",
    product: "Buldak retailer order, 3 lines",
    stageId,
    exceptionId,
    priority: "high",
    ageInStageDays: 0,
    exposure,
    nathanCall:
      "This is the order I would hand a new hire on day one, because every habit that matters shows up on it once: the 997 and 855 are different promises, the price decision travels to the retailer before the invoice does, the backorder is communicated instead of discovered, and the deduction gets reconciled against documents instead of feelings. Work it top to bottom and you have seen the whole job.",
  };
}

/** The deduction as a case for the board. Fresh timestamps at routing time. */
export function buildDeductionCase(): RoutedCase {
  const now = Date.now();
  return {
    id: LIFECYCLE_CASE_ID,
    createdAt: now,
    role: "retailer",
    categoryId: "deduction-chargeback",
    priority: "high",
    channel: "edi",
    deductionTypeId: "shortage",
    stageIndex: 0,
    enteredStageAt: now,
    order: 0,
    history: [{ at: now, actorId: "lead-grace", from: null, to: 0 }],
    account: "99 Ranch Market",
    product: "Buldak Carbonara, Multi (5-pack)",
    orderRef: "PO 4500382711, INV-90412, BOL-118276",
    inquiry:
      "Remittance RMT-55018 paid INV-90412 short by $91.60 with reason code 22. Receiving shows 116 cases of Carbonara against 120 on the ASN.",
  };
}

export const LIFECYCLE_LABEL =
  "Retailer Order Lifecycle · X12 aligned workflow study · Synthetic operational data";

export const LIFECYCLE_DISCLOSURE =
  "This lifecycle is a workflow study, not a live EDI integration or SPS Commerce, and not connected to any retailer or to Samyang systems. Document formats are simplified for reading; a production implementation follows each trading partner's guide.";
