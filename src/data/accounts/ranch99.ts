/**
 * 99 Ranch Market — retail account operations dossier data.
 *
 * ============================ READ THIS FIRST ============================
 *
 * Every identifier below is INVENTED. The purchase order numbers, the article
 * numbers, the unit prices, the goods-receipt document numbers, the delivery
 * dates, the vessel and container identifiers, the freight parties, the buyer
 * of record, every contact, and every case are synthetic.
 *
 * They are not anonymized real data. They were written from scratch to have the
 * SHAPE of a retail purchase order, because the shape is the teaching point:
 *
 *   - a single PO carries many lines, the same article appearing at two sites
 *   - quantities are in CV (cases), not eaches
 *   - one ordered quantity is satisfied by SEVERAL partial goods receipts that
 *     must sum back to it, and the buyer is the one adding them up
 *   - an invoice receipt either reconciles against those receipts or becomes a
 *     dispute the buyer has to open and carry
 *   - the freight trail behind a line is only as complete as what was reported
 *     to us; a buyer-arranged import leaves a hole in our documents, and the
 *     honest record prints the hole instead of a guess
 *
 * None of that requires a real vendor's wholesale price, and publishing one
 * would be a breach of confidence to two companies at once. The claim this page
 * rests on is that Nathan has READ purchase orders and goods receipt history
 * from the buyer's chair. That claim is true, it is rare, and it needs no
 * borrowed document to support it.
 *
 * The account name and its parent entity are real, used illustratively, and
 * disclaimed on the page and in the footer per DECISIONS.md D-010.
 * ========================================================================
 */

export type RiskLevel = "low" | "medium" | "high";

/** Risk is a word and a glyph. Never a color alone. */
export const RISK_META: Record<RiskLevel, { word: string; glyph: string }> = {
  low: { word: "Low", glyph: "○" },
  medium: { word: "Medium", glyph: "◆" },
  high: { word: "High", glyph: "▲" },
};

export interface AccountSnapshotRow {
  label: string;
  value: string;
}

export interface GoodsReceipt {
  doc: string;
  date: string;
  qty: number;
}

/* -------------------------------------------------------------------------- */
/* Contacts                                                                   */
/* -------------------------------------------------------------------------- */

export interface AccountContact {
  id: string;
  /** Synthetic person or desk. Never a real individual. */
  name: string;
  role: string;
  org: string;
  side: "account" | "supplier";
  email?: string;
  /** Display form, e.g. "(626) 555-0147". */
  phone?: string;
  /** tel: href form, e.g. "+16265550147". */
  phoneHref?: string;
}

/**
 * The two people a working case actually runs between: the buyer of record on
 * the account side and the named owner on ours. Synthetic names on reserved
 * example domains and 555 numbers, so the links behave without reaching anyone.
 */
export const ACCOUNT_CONTACTS: AccountContact[] = [
  {
    id: "buyer",
    name: "Karen Liang",
    role: "Purchasing agent, dry grocery",
    org: "Tawa buying office for 99 Ranch Market",
    side: "account",
    email: "k.liang@tawa.example",
    phone: "(626) 555-0147",
    phoneHref: "+16265550147",
  },
  {
    id: "owner",
    name: "Elena V.",
    role: "Senior rep, key accounts. Named owner on this account",
    org: "Samyang America Customer Experience",
    side: "supplier",
    email: "elena.v@fireflow.example",
    phone: "(714) 555-0112",
    phoneHref: "+17145550112",
  },
];

export const CONTACTS_NOTE =
  "The buying-office structure is the realistic part: the person who places the purchase orders is the person a case update has to reach.";

/* -------------------------------------------------------------------------- */
/* Shipment and fulfillment traces                                            */
/* -------------------------------------------------------------------------- */

export interface ShipmentEvent {
  date: string;
  label: string;
  note?: string;
}

export interface ShipmentTrace {
  /** Who physically fulfilled the line. */
  fulfilledBy: string;
  /** The outbound lane to the account. */
  lane: string;
  /** Outbound carrier, when reported. */
  carrier?: string;
  /** Inbound ocean details, when the import ran on our program. All synthetic. */
  vessel?: string;
  voyage?: string;
  container?: string;
  containerType?: string;
  forwarder?: string;
  /** Printed when the freight trail has a hole, instead of a guess. */
  forwarderNote?: string;
  portOfLoading?: string;
  portOfDischarge?: string;
  portArrival?: string;
  /** What happened, in order. */
  events: ShipmentEvent[];
  /** Anything that went wrong in transit or at the dock. */
  issues?: string;
}

export interface PoLine {
  id: string;
  po: string;
  date: string;
  article: string;
  product: string;
  site: string;
  /**
   * The catalog SKU this line buys. The unit price is NOT stored here: it is
   * derived at render time from `unitPriceForOrder(sku, casesOnThisPo,
   * "distributor")`, the same function the order builder on the homepage calls.
   * A price typed into this file would eventually disagree with the price the
   * product quotes, and nobody would notice which one was wrong.
   */
  skuCode: string;
  orderedQty: number;
  confirmedQty: number;
  /** Null when the receipt has not posted or the invoice match is still open. */
  receivedQty: number | null;
  deliveryDate: string;
  /** Set only when the line has no price yet, e.g. a contract under validation. */
  unitPriceNote?: string;
  invoiceStatus: string;
  orderStatus: string;
  /** Short status word for the table. The full status lives in the order record. */
  statusLabel: string;
  risk: RiskLevel;
  owner: string;
  /** Partial receipts, which must sum to receivedQty. */
  receipts: GoodsReceipt[];
  detail: string;
  /** What a CX manager should take from this line. */
  lesson: string;
  /** Optional action checklist, for a line that is an open exception. */
  checklist?: string[];
  /** SAP SD objects this line touches, as a reading claim, never an implementation one. */
  sap?: string[];
  /** The freight and fulfillment trail behind the line. Synthetic throughout. */
  shipment?: ShipmentTrace;
}

/** "PO 4500112044" prints as "2044" in the table; the full number stays on the record. */
export function shortPo(po: string): string {
  const digits = po.replace(/\D/g, "");
  return digits.slice(-4);
}

/* -------------------------------------------------------------------------- */
/* Cases                                                                      */
/* -------------------------------------------------------------------------- */

export type CaseStatus = "active" | "resolved";

export interface CaseActivity {
  date: string;
  who: string;
  what: string;
}

export interface AccountCase {
  id: string;
  title: string;
  severity: RiskLevel;
  status: CaseStatus;
  opened: string;
  /** Set when status is "resolved". */
  resolvedDate?: string;
  resolution?: string;
  source: string;
  product: string;
  poRef: string;
  owner: string;
  /** The named person working the case. Synthetic roster, shared with /leadership. */
  assignee: string;
  /** Initials for the avatar chip. */
  assigneeInitials: string;
  supporting: string[];
  metric: string;
  promise: string;
  /** Ordered / received, when the case is a quantity exception. */
  ordered?: number;
  received?: number;
  customerMessage?: string;
  response?: string;
  prevention: string;
  /** Who did what, newest last. */
  activity: CaseActivity[];
  /** Deep link to this case on the ops board, when it lives there. */
  boardCaseId?: string;
}

export const ACCOUNT_DISCLAIMER =
  "A retail account operations dossier, built from real order-management experience. The account name and parent entity are real; the operational figures are modeled. No affiliation with or endorsement by any company named is implied.";

export const ACCOUNT = {
  slug: "99-ranch-market",
  name: "99 Ranch Market",
  subtitle: "Retail account operations profile for Samyang America order support",
  intro:
    "One trade account, read from the side that placed the orders. It bought heavily through 2022, went quiet for over three years, and has just come back. The first order back arrived sixty cases short, with nothing signed at the dock and the buyer's ad running Friday. Everything below is how a customer experience manager works that, from the purchase order to the credit.",
  badges: [
    "Retail account",
    "Grocery chain",
    "Semi-active",
    "EDI active",
    "Fill rate sensitive",
    "SAP SD aligned",
    "Order to cash",
    "Cross functional",
  ],
};

export const SNAPSHOT: AccountSnapshotRow[] = [
  { label: "Account name", value: "99 Ranch Market" },
  { label: "Parent or operating entity", value: "Tawa Services" },
  { label: "Account type", value: "Retail grocery chain" },
  {
    label: "Account status",
    value:
      "Semi-active. Heavy through 2022, quiet for over three years, two orders in 2026, one short-shipped.",
  },
  { label: "Vendor relationship", value: "Samyang America supplier relationship" },
  {
    label: "Support model",
    value:
      "Retail account support, order issue resolution, fill rate monitoring, invoice and deduction escalation",
  },
  {
    label: "Primary flow",
    value:
      "Purchase order, sales order, delivery, goods receipt, invoice, credit and deduction review",
  },
  {
    label: "Primary account risk",
    value:
      "High volume grocery retail, where shortages, late deliveries, and pricing mismatches become service and finance problems in the same week",
  },
];

export const WHY_THIS_ACCOUNT =
  "99 Ranch Market, under parent entity Tawa Services, is a sample account, chosen because a large Asian-American grocery banner is exactly the kind of trade buyer a Korean noodle brand serves. It is modeled as the harder case: an account that stopped ordering and has just come back. Serving a growing account is pleasant; the returning one tests whether a customer experience function can hold the first order back well enough to earn a second. The account is named only to make the workflow concrete.";

/**
 * Why the volume fell is NOT stated as fact, and that is deliberate. Nobody on
 * the supplier side knows why an account stops ordering until they ask. These
 * are the explanations a manager rules out, in the order the evidence is
 * cheapest to get. The reasoning behind each test lives in the Nathan's Note
 * on this section; the profile keeps the short form.
 */
export const TRAJECTORY_HYPOTHESES: { rank: number; label: string; test: string }[] = [
  {
    rank: 1,
    label: "We lost the shelf",
    test: "Check the reset calendar and delist history. Answerable from our own records today.",
  },
  {
    rank: 2,
    label: "We lost their trust",
    test: "Read the last twelve cases before the quiet. A pattern of shorts or chased updates reads as a sourcing decision.",
  },
  {
    rank: 3,
    label: "They changed how they source",
    test: "A buyer this size can import direct. Sales asks; nobody writes it down as fact first.",
  },
  {
    rank: 4,
    label: "Nothing changed except the calendar",
    test: "Compare against their own seasonality and the rest of the channel before calling it dormant.",
  },
];

export const TRAJECTORY_NOTE =
  "Cases ordered per year, read from the purchase order lines above, so the chart and the table cannot disagree. The decline is measured. The cause is the open question the four checks rank.";

/* -------------------------------------------------------------------------- */
/* Profile notes — short CRM-style facts, kept current like a record.          */
/* The reasoning behind them lives in the Nathan's Note on the section.        */
/* -------------------------------------------------------------------------- */

export interface ProfileNote {
  label: string;
  value: string;
  updated: string;
}

export const PROFILE_NOTES: ProfileNote[] = [
  {
    label: "Channel",
    value: "Asian-American grocery banner, West Coast concentrated, ad-driven weekly traffic.",
    updated: "07/09/2026",
  },
  {
    label: "Entity structure",
    value: "Orders and receives as 99 Ranch DCs. Pays as Tawa Services. Case money moves only against the payer.",
    updated: "07/09/2026",
  },
  {
    label: "Buying pattern",
    value: "Three orders in 2022, quiet 2023 through 2025, returned 05/2026. Reorder decision is live now.",
    updated: "07/09/2026",
  },
  {
    label: "EDI",
    value: "850, 855, 856, 810 active. 997 monitored. Failures surface as invisible orders, so they page us, not the buyer.",
    updated: "07/09/2026",
  },
  {
    label: "Service sensitivity",
    value: "Promotions are planned against delivery dates. This buyer trades price patience for date certainty.",
    updated: "07/09/2026",
  },
  {
    label: "Sourcing watch",
    value: "Volume is large enough to import direct. Unconfirmed. Flagged for Sales to ask, not for the record to assume.",
    updated: "07/09/2026",
  },
];

/* -------------------------------------------------------------------------- */
/* Open order trace — the 12-step lifecycle, traced on the live PO 482207.     */
/* Each step carries the generic failure mode as hover text, so the lifecycle  */
/* teaches through the one order that is actually on the page.                 */
/* -------------------------------------------------------------------------- */

export type TraceState = "clear" | "exception" | "pending";

export const TRACE_META: Record<TraceState, { word: string; glyph: string }> = {
  clear: { word: "Clear", glyph: "✓" },
  exception: { word: "Exception", glyph: "▲" },
  pending: { word: "Pending", glyph: "○" },
};

export interface TraceStep {
  id: string;
  step: number;
  name: string;
  state: TraceState;
  /** What actually happened at this step on PO 482207. */
  happened: string;
  /** The generic failure mode, shown on hover. */
  risk: string;
}

export const PO_TRACE_REF = "PO 482207";

export const PO_TRACE: TraceStep[] = [
  {
    id: "po-received",
    step: 1,
    name: "PO received",
    state: "clear",
    happened: "850 in on 07/06, clean translation, account reference matched.",
    risk: "Wrong item, a duplicate PO, a missing requested delivery date, or a mismatched account reference.",
  },
  {
    id: "account-validated",
    step: 2,
    name: "Account validated",
    state: "clear",
    happened: "Sold-to 99 Ranch DC, payer Tawa Services. Both confirmed against the customer master.",
    risk: "Sold-to, ship-to, bill-to, and payer are not the same party. Resolving with the wrong one means the money never moves.",
  },
  {
    id: "so-entered",
    step: 3,
    name: "Sales order entered",
    state: "clear",
    happened: "Sales order created from the 850 the same day. Document flow intact.",
    risk: "An 850 that maps into the ERP with a silent error creates an order nobody can see on our side.",
  },
  {
    id: "price-checked",
    step: 4,
    name: "Price checked",
    state: "exception",
    happened: "Contract price still in validation. The invoice is held rather than billed at a number that could be wrong.",
    risk: "Contract, promotional, customer-specific, and invoice price can all disagree. A stale validity date bills the old number.",
  },
  {
    id: "inventory-confirmed",
    step: 5,
    name: "Inventory confirmed",
    state: "clear",
    happened: "600 CV confirmed against DC 1 stock at order entry.",
    risk: "Confirmed quantity is not requested quantity. An allocation short here is a shelf gap later, and the buyer is not told.",
  },
  {
    id: "delivery-scheduled",
    step: 6,
    name: "Delivery scheduled",
    state: "clear",
    happened: "Delivery set for 07/08, two days ahead of the buyer's Friday ad.",
    risk: "A delivery date the buyer planned a promotion around gets moved without anyone telling the buyer before the window.",
  },
  {
    id: "picked-loaded",
    step: 7,
    name: "Picked and loaded",
    state: "exception",
    happened: "Pick confirmation shows 540 CV. No exception was written at the dock, so nothing carried the shortage forward.",
    risk: "Short picked, wrong product loaded, or cases damaged before the truck leaves. The cheapest place to catch a shortage.",
  },
  {
    id: "asn-sent",
    step: 8,
    name: "ASN sent",
    state: "exception",
    happened: "The 856 declared 600 CV. The trailer carried 540. The receiver scanned against the ASN and logged the gap.",
    risk: "The 856 declares a quantity the trailer does not carry, so the paperwork disagrees with the pallet on arrival.",
  },
  {
    id: "goods-received",
    step: 9,
    name: "Goods received",
    state: "exception",
    happened: "540 CV received 07/08. Sixty short, nothing on the bill of lading, driver would not sign the exception.",
    risk: "Receiving shows a shortage, an overage, a wrong item, or damage. The buyer is now the first person who knows.",
  },
  {
    id: "invoice-matched",
    step: 10,
    name: "Invoice matched",
    state: "pending",
    happened: "Held until the price validates and the quantity decision lands. An invoice for 600 would be short-paid on arrival.",
    risk: "The invoice does not match the PO price, the shipped quantity, or the received quantity, and the three-way match short-pays.",
  },
  {
    id: "credit-deduction",
    step: 11,
    name: "Credit or deduction review",
    state: "pending",
    happened: "Replacement, credit memo, or deduction support is the open decision. The dispute window is the retailer's clock.",
    risk: "Finance decides credit, deduction support, dispute, or reship. The window does not move for us.",
  },
  {
    id: "case-closed",
    step: 12,
    name: "Case closed",
    state: "pending",
    happened: "Closes only with a root cause recorded. Sixty missing cases with no cause return next cycle.",
    risk: "Closed without a root cause is closed until it happens again, and nobody connects the repeats.",
  },
];

export const TRACE_NOTE =
  "Twelve steps, one live order. Hover any step for the general failure mode it guards; the line under each step is what actually happened on this one.";

/* -------------------------------------------------------------------------- */
/* Purchase orders                                                            */
/*                                                                            */
/* SYNTHETIC. Numbers, articles, prices, dates, receipts, vessels, containers, */
/* and freight parties invented. The structure is faithful: a multi-line PO in */
/* cases (CV), the same article ordered to two sites, and an ordered quantity  */
/* satisfied by partial goods receipts that sum back to it.                    */
/* -------------------------------------------------------------------------- */

export const PO_LINES: PoLine[] = [
  /* ---- 2022. The account's active period. Three orders, eight lines. ------ */
  {
    id: "line-2022a-10",
    po: "PO 4500112044",
    date: "03/14/2022",
    article: "3600041",
    product: "Samyang Dry Noodle Hot Chicken",
    site: "Regional DC 1, stock",
    skuCode: "SY-BLDK-ORIG-MP",
    orderedQty: 240,
    confirmedQty: 240,
    receivedQty: 240,
    deliveryDate: "04/06/2022",
    invoiceStatus: "Matched",
    orderStatus: "Fully received",
    statusLabel: "Received",
    risk: "low",
    owner: "Supply Chain",
    receipts: [{ doc: "GR 5010000088", date: "04/06/2022", qty: 240 }],
    detail: "One receipt, one match, closed inside the month.",
    lesson:
      "Most order lines close like this. A queue built around exceptions has to remember that the exception is a minority of the volume and a majority of the cost.",
    sap: ["Document flow, VA03: order, delivery, goods issue, invoice, all cleared"],
    shipment: {
      fulfilledBy: "Regional DC 1, operated by our 3PL",
      lane: "Domestic truckload, DC 1 to the account's Buena Park DC",
      carrier: "Golden State Freight Lines",
      vessel: "Pacific Dawn, voyage 012E",
      voyage: "012E",
      container: "SYAU 402 1183",
      containerType: "40 ft high cube",
      forwarder: "Bridgehaven Global Logistics",
      portOfLoading: "Busan, KR",
      portOfDischarge: "Long Beach, CA",
      portArrival: "02/21/2022",
      events: [
        { date: "02/21/2022", label: "Container discharged at Long Beach", note: "Cleared customs in two days, no exam." },
        { date: "02/26/2022", label: "Drayage to Regional DC 1, stock putaway" },
        { date: "04/05/2022", label: "Picked 240 CV, loaded, ASN sent" },
        { date: "04/06/2022", label: "Delivered, POD signed clean" },
      ],
    },
  },
  {
    id: "line-2022a-20",
    po: "PO 4500112044",
    date: "03/14/2022",
    article: "2040112",
    product: "Samyang Cheese Hot Chicken",
    site: "Regional DC 1, stock",
    skuCode: "SY-BLDK-CHZ-MP",
    orderedQty: 100,
    confirmedQty: 100,
    receivedQty: 100,
    deliveryDate: "04/06/2022",
    invoiceStatus: "Matched",
    orderStatus: "Fully received",
    statusLabel: "Received",
    risk: "low",
    owner: "Customer Experience",
    receipts: [{ doc: "GR 5010000089", date: "04/06/2022", qty: 100 }],
    detail: "Delivered with the line above, on the same truck, on the same receipt date.",
    lesson:
      "Two lines, one delivery, two receipt records. The receiving document is per line, not per truck, which is why a case worked against the wrong line reconciles nothing.",
    shipment: {
      fulfilledBy: "Regional DC 1, operated by our 3PL",
      lane: "Domestic truckload, same trailer as the line above",
      carrier: "Golden State Freight Lines",
      forwarderNote:
        "Inbound stock for this article arrived on the same import program as the line above; the outbound trailer was shared.",
      events: [
        { date: "04/05/2022", label: "Picked 100 CV, co-loaded with 240 CV of article 3600041" },
        { date: "04/06/2022", label: "Delivered, one POD, two goods receipts" },
      ],
    },
  },
  {
    id: "line-2022b-10",
    po: "PO 4500115309",
    date: "07/19/2022",
    article: "2040433",
    product: "Samyang 2x Hot Chicken",
    site: "Regional DC 2, stock",
    skuCode: "SY-BLDK-2X-MP",
    orderedQty: 200,
    confirmedQty: 200,
    receivedQty: 200,
    deliveryDate: "08/12/2022",
    invoiceStatus: "Matched",
    orderStatus: "Fully received",
    statusLabel: "Received",
    risk: "low",
    owner: "Logistics",
    receipts: [
      { doc: "GR 5010000121", date: "08/12/2022", qty: 120 },
      { doc: "GR 5010000122", date: "08/15/2022", qty: 80 },
    ],
    detail:
      "Two receipts three days apart, 120 CV and 80 CV, totaling 200 CV against 200 CV ordered.",
    lesson:
      "The partial receipt is the normal case, not the exception. The buyer is the one adding them up, and the day they do not sum is the day a dispute opens.",
    shipment: {
      fulfilledBy: "Regional DC 2, operated by our 3PL",
      lane: "Two domestic truckloads, DC 2 to the account's La Puente DC",
      carrier: "Golden State Freight Lines",
      vessel: "Morning Meridian, voyage 019E",
      voyage: "019E",
      container: "SYAU 517 6640",
      containerType: "40 ft high cube",
      forwarder: "Bridgehaven Global Logistics",
      portOfLoading: "Busan, KR",
      portOfDischarge: "Long Beach, CA",
      portArrival: "07/02/2022",
      events: [
        { date: "07/02/2022", label: "Container discharged at Long Beach", note: "Peak-season terminal congestion; five days to gate out." },
        { date: "07/09/2022", label: "Drayage to Regional DC 2, stock putaway" },
        { date: "08/11/2022", label: "First truck loaded, 120 CV" },
        { date: "08/12/2022", label: "First delivery received, 120 CV" },
        { date: "08/15/2022", label: "Second delivery received, 80 CV, order complete" },
      ],
      issues:
        "Terminal congestion at discharge cost five days. It never reached the account because the delivery promise carried buffer for it.",
    },
  },
  {
    id: "line-2022b-20",
    po: "PO 4500115309",
    date: "07/19/2022",
    article: "3600041",
    product: "Samyang Dry Noodle Hot Chicken",
    site: "Regional DC 2, stock",
    skuCode: "SY-BLDK-ORIG-MP",
    orderedQty: 180,
    confirmedQty: 180,
    receivedQty: 180,
    deliveryDate: "08/12/2022",
    invoiceStatus: "Matched",
    orderStatus: "Fully received",
    statusLabel: "Received",
    risk: "low",
    owner: "Supply Chain",
    receipts: [{ doc: "GR 5010000123", date: "08/12/2022", qty: 180 }],
    detail: "One receipt, same day as the line above it, closed without a call.",
    lesson:
      "A clean line receives and closes on the day it lands, and the account never hears from us about it. That silence is the outcome on nine lines in ten, which is the reason the tenth has to be unmistakable on the board.",
    shipment: {
      fulfilledBy: "Regional DC 2, operated by our 3PL",
      lane: "Domestic truckload, first trailer of the PO",
      carrier: "Golden State Freight Lines",
      events: [
        { date: "08/11/2022", label: "Picked 180 CV, loaded with the first 120 CV of the line above" },
        { date: "08/12/2022", label: "Delivered, POD signed clean" },
      ],
    },
  },
  {
    id: "line-10",
    po: "PO 4500118207",
    date: "11/02/2022",
    article: "3600041",
    product: "Samyang Dry Noodle Hot Chicken",
    site: "Regional DC 1, stock",
    skuCode: "SY-BLDK-ORIG-MP",
    orderedQty: 380,
    confirmedQty: 380,
    receivedQty: 380,
    deliveryDate: "12/30/2022",
    invoiceStatus: "Matched",
    orderStatus: "Fully received",
    statusLabel: "Received",
    risk: "low",
    owner: "Supply Chain",
    receipts: [
      { doc: "GR 5010000164", date: "12/30/2022", qty: 164 },
      { doc: "GR 5010000216", date: "01/03/2023", qty: 216 },
    ],
    detail:
      "Goods receipt history shows 164 CV on the thirtieth of December and 216 CV four days later, across the year end, totaling 380 CV against 380 CV ordered.",
    lesson:
      "A receipt that straddles a year end lands in two accounting periods while the buyer reads it as one order. That gap is where a clean fulfillment still becomes an invoice question.",
    shipment: {
      fulfilledBy: "Regional DC 1, operated by our 3PL",
      lane: "Two domestic truckloads across the year end",
      carrier: "Golden State Freight Lines",
      events: [
        { date: "12/29/2022", label: "First truck loaded, 164 CV" },
        { date: "12/30/2022", label: "First delivery received, 164 CV" },
        { date: "01/03/2023", label: "Second delivery received, 216 CV, order complete" },
      ],
    },
  },
  {
    id: "line-30",
    po: "PO 4500118207",
    date: "11/02/2022",
    article: "2040112",
    product: "Samyang Cheese Hot Chicken",
    site: "Regional DC 1, stock",
    skuCode: "SY-BLDK-CHZ-MP",
    orderedQty: 150,
    confirmedQty: 150,
    receivedQty: 150,
    deliveryDate: "12/30/2022",
    invoiceStatus: "No issue flagged",
    orderStatus: "Matched",
    statusLabel: "Received",
    risk: "low",
    owner: "Customer Experience",
    receipts: [{ doc: "GR 5010000150", date: "12/30/2022", qty: 150 }],
    detail: "One receipt, one match. Nothing to work.",
    lesson:
      "The quiet line is the one nobody remembers, and it is most of the book. A manager who only reads exceptions loses the shape of the account.",
    shipment: {
      fulfilledBy: "Regional DC 1, operated by our 3PL",
      lane: "Domestic truckload, shared trailer with the first 164 CV above",
      carrier: "Golden State Freight Lines",
      events: [
        { date: "12/30/2022", label: "Delivered, POD signed clean" },
      ],
    },
  },
  {
    id: "line-80",
    po: "PO 4500118207",
    date: "11/02/2022",
    article: "3600041",
    product: "Samyang Dry Noodle Hot Chicken",
    site: "Regional DC 2, stock",
    skuCode: "SY-BLDK-ORIG-MP",
    orderedQty: 300,
    confirmedQty: 300,
    receivedQty: 300,
    deliveryDate: "01/06/2023",
    invoiceStatus: "Matched",
    orderStatus: "Fully received",
    statusLabel: "Received",
    risk: "low",
    owner: "Logistics",
    receipts: [{ doc: "GR 5010000300", date: "01/06/2023", qty: 300 }],
    detail:
      "The same article as the first line, ordered to a second site on the same PO, and delivered a week later.",
    lesson:
      "The same article on the same PO can ship to two sites on two dates and receive on two records. The ship-to matters as much as the sold-to.",
    shipment: {
      fulfilledBy: "Regional DC 2, operated by our 3PL",
      lane: "Domestic truckload, DC 2 to the account's La Puente DC",
      carrier: "Golden State Freight Lines",
      events: [
        { date: "01/05/2023", label: "Picked 300 CV, loaded" },
        { date: "01/06/2023", label: "Delivered, POD signed clean" },
      ],
    },
  },
  {
    id: "line-2022c-40",
    po: "PO 4500118207",
    date: "11/02/2022",
    article: "2040433",
    product: "Samyang 2x Hot Chicken",
    site: "Cross-dock, allocation",
    skuCode: "SY-BLDK-2X-MP",
    orderedQty: 150,
    confirmedQty: 120,
    receivedQty: 120,
    deliveryDate: "12/30/2022",
    invoiceStatus: "Credit issued, closed",
    orderStatus: "Confirmed short, closed",
    statusLabel: "Closed short",
    risk: "low",
    owner: "Supply Chain",
    receipts: [{ doc: "GR 5010000151", date: "12/30/2022", qty: 120 }],
    detail:
      "Ordered 150, confirmed 120 at order entry, received 120. The allocation short was told to the buyer before the truck left, and the invoice billed what shipped.",
    lesson:
      "This is a shortage that never became a case. Confirmed quantity is not requested quantity, and when the buyer is told at confirmation rather than at the dock, thirty cases is a planning adjustment instead of a deduction.",
    shipment: {
      fulfilledBy: "Cross-dock allocation from inbound stock",
      lane: "Cross-dock to the account's Buena Park DC",
      carrier: "Golden State Freight Lines",
      events: [
        { date: "11/03/2022", label: "Allocation confirmed 120 of 150, buyer notified same day" },
        { date: "12/30/2022", label: "Delivered 120 CV, invoice billed as shipped" },
      ],
    },
  },

  /* ---- 2026. The account is semi-active. Two lines. ---------------------- */
  {
    id: "line-120",
    po: "PO 4500119842",
    date: "05/27/2026",
    article: "2040433",
    product: "Samyang 2x Hot Chicken",
    site: "Cross-dock, allocation",
    skuCode: "SY-BLDK-2X-MP",
    orderedQty: 150,
    confirmedQty: 150,
    receivedQty: null,
    deliveryDate: "06/09/2026",
    invoiceStatus: "Open. Review if an invoice mismatch appears",
    orderStatus: "Invoice review",
    statusLabel: "Invoice review",
    risk: "medium",
    owner: "Finance and AR",
    receipts: [],
    detail:
      "The first order in over three years. Delivered on the ninth of June, and no receipt has posted against the line five weeks later. Until it does, the invoice has nothing to reconcile against.",
    lesson:
      "An order line with no posted receipt is not a quiet line. On a returning account it is worse than that: the first order back is the one that decides whether they place a second.",
    sap: ["Billing document, VF03", "Condition record and validity date, VK13"],
    shipment: {
      fulfilledBy: "Cross-dock allocation from inbound stock",
      lane: "Cross-dock handoff to the account's own inbound network",
      forwarderNote:
        "Not reported to us. This order moved collect: Tawa arranged the carrier on its own routing program, so the forwarder, the truck, and the proof of delivery sit in their network rather than in our documents. Our record ends at the cross-dock handoff, and the honest trail prints that hole rather than a guess.",
      events: [
        { date: "06/08/2026", label: "Cross-dock handoff completed, 150 CV" },
        { date: "06/09/2026", label: "Delivered per the account's carrier; POD held by their network" },
        { date: "07/09/2026", label: "No goods receipt posted against the line. Follow-up owned by Finance and AR" },
      ],
      issues:
        "The receipt gap is the issue. Without their posted receipt, our invoice has nothing to reconcile against, and a dispute five weeks from now would be built on missing paper.",
    },
  },
  {
    id: "line-open",
    po: "PO 482207",
    date: "07/06/2026",
    article: "2040433",
    product: "Buldak 2x Spicy, cup",
    site: "Regional DC 1, stock",
    skuCode: "SY-BLDK-2X-CUP",
    orderedQty: 600,
    confirmedQty: 600,
    receivedQty: 540,
    deliveryDate: "07/08/2026",
    unitPriceNote: "Contract price pending validation",
    invoiceStatus: "Credit or deduction review pending",
    orderStatus: "Short shipment, fill rate exception",
    statusLabel: "Short, in review",
    risk: "high",
    owner: "Supply Chain",
    receipts: [{ doc: "GR pending", date: "07/08/2026", qty: 540 }],
    detail:
      "Delivered on the eighth of July. The account received 540 of 600 cases. Sixty cases short, nothing noted on the bill of lading, and the driver would not sign the exception. Their ad starts Friday the tenth.",
    lesson:
      "The shortage left our dock with no exception written on the paperwork, so nothing carries it. On an account that has just started ordering again after three years, this is the case that decides whether they place a third order.",
    checklist: [
      "Verify the outbound delivery and the picked quantity",
      "Review the warehouse load confirmation against the pick",
      "Compare the ASN shipped quantity with the received quantity",
      "Confirm whether the invoice reflects shipped or ordered quantity",
      "Decide replacement shipment, credit memo, or deduction support",
      "Update the account before close of business, from a named person",
    ],
    sap: [
      "Outbound delivery and picked quantity, VL03N",
      "Billing block if the invoice should pause",
      "Credit memo request if the account was shorted, VA01 order type CR",
    ],
    shipment: {
      fulfilledBy: "Regional DC 1, operated by our 3PL",
      lane: "Domestic truckload, DC 1 to the account's Buena Park DC",
      carrier: "Golden State Freight Lines",
      vessel: "Pacific Dawn, voyage 067E",
      voyage: "067E",
      container: "SYAU 774 0912",
      containerType: "40 ft high cube",
      forwarder: "Bridgehaven Global Logistics",
      portOfLoading: "Busan, KR",
      portOfDischarge: "Long Beach, CA",
      portArrival: "06/18/2026",
      events: [
        { date: "06/18/2026", label: "Container discharged at Long Beach", note: "Held one day for a customs document check, released clean." },
        { date: "06/22/2026", label: "Drayage to Regional DC 1, stock putaway, lot intact" },
        { date: "07/07/2026", label: "Pick confirmation posted 540 CV against 600 ordered", note: "No dock exception was written. This is the record the case turns on." },
        { date: "07/07/2026", label: "856 ASN transmitted declaring 600 CV" },
        { date: "07/08/2026", label: "Delivered 540 CV. Driver declined to sign the receiver's exception" },
      ],
      issues:
        "The gap opened at pick and load, not at sea. The container arrived intact; sixty cases went missing between stock and trailer, and the missing dock exception means the paperwork carries nothing. That is why the case checklist starts at the pick record, not at the port.",
    },
  },
];

/** Total cases on a PO. The volume tier a line earns is set by the whole order. */
export function casesOnPo(po: string): number {
  return PO_LINES.filter((l) => l.po === po).reduce((n, l) => n + l.orderedQty, 0);
}

/** The four-digit year on a line, read from its MM/DD/YYYY order date. */
export function yearOf(line: PoLine): string {
  return line.date.slice(-4);
}

/** The worst severity among the open cases. Derived, never asserted. */
export function highestSeverity(): RiskLevel {
  const open = ACCOUNT_CASES.filter((c) => c.status === "active");
  if (open.some((c) => c.severity === "high")) return "high";
  if (open.some((c) => c.severity === "medium")) return "medium";
  return "low";
}

/** Cases ordered per calendar year, for the trajectory panel. */
export function casesByYear(): { year: string; cases: number; orders: number }[] {
  const byYear = new Map<string, { cases: number; orders: Set<string> }>();
  for (const l of PO_LINES) {
    const y = yearOf(l);
    const e = byYear.get(y) ?? { cases: 0, orders: new Set<string>() };
    e.cases += l.orderedQty;
    e.orders.add(l.po);
    byYear.set(y, e);
  }
  return Array.from(byYear.entries())
    .map(([year, v]) => ({ year, cases: v.cases, orders: v.orders.size }))
    .sort((a, b) => a.year.localeCompare(b.year));
}

/* -------------------------------------------------------------------------- */
/* Account cases — active and resolved. Assignees come from the same synthetic */
/* roster the /leadership team board runs on, so the person working a case     */
/* here is a person with a workload and a coaching plan there.                 */
/* -------------------------------------------------------------------------- */

export const ACCOUNT_CASES: AccountCase[] = [
  {
    id: "FF-2041",
    boardCaseId: "FF-2041",
    title: "Short shipment, fill rate exception",
    severity: "high",
    status: "active",
    opened: "07/08/2026",
    source: "EDI, 856 ASN",
    product: "Buldak 2x Spicy, cup",
    poRef: "PO 482207",
    ordered: 600,
    received: 540,
    owner: "Supply Chain",
    assignee: "Grace H., Team Lead",
    assigneeInitials: "GH",
    supporting: ["Customer Experience", "Logistics"],
    metric: "Fill Rate",
    promise: "Acknowledged within 1 business hour. Resolved or updated the same business day.",
    customerMessage:
      "We received 540 of 600 cases. Sixty cases short, nothing noted on the bill of lading, and the driver would not sign the exception. Our ad starts Friday.",
    response:
      "Thank you for flagging this. We are reviewing the outbound delivery, the picked quantity, the ASN, and the warehouse load confirmation against PO 482207. We will confirm whether the sixty case gap needs a replacement shipment, a credit, or deduction support, and you will have that from me before close of business today.",
    prevention:
      "Tighten pick and load verification at the DC, and flag allocation shorts before the truck ships rather than after the buyer counts.",
    activity: [
      { date: "07/08 4:41 pm", who: "Intake", what: "Case opened from the receiver's count against the 856. Severity set high: ad window 07/10." },
      { date: "07/08 5:02 pm", who: "Elena V.", what: "Acknowledged to K. Liang inside the hour, named Grace H. as owner, promised a same-day update." },
      { date: "07/09 9:12 am", who: "Marcus T.", what: "Pulled the pick confirmation: 540 CV posted against 600. The gap is ours, at pick and load." },
      { date: "07/09 11:30 am", who: "Aisha B.", what: "Stock check: 60 CV available at DC 1 for a replacement run before the ad window." },
      { date: "07/09 1:15 pm", who: "Grace H.", what: "Replacement recommended over credit. Decision and dock appointment due to the buyer by close of business." },
    ],
  },
  {
    id: "FF-2088",
    title: "Unit price mismatch",
    severity: "medium",
    status: "active",
    opened: "06/24/2026",
    source: "Invoice dispute",
    product: "Samyang 2x Hot Chicken",
    poRef: "PO 4500119842",
    owner: "Finance and AR",
    assignee: "Priya S., Senior Rep",
    assigneeInitials: "PS",
    supporting: ["Sales", "Customer Experience"],
    metric: "Invoice match rate",
    promise: "Acknowledged within 4 business hours. Determination inside the dispute window.",
    response:
      "We are validating the PO price against the invoice and the pricing record on the account. If the billed amount does not match the agreed price, the case routes for an invoice correction or a credit memo review, and you will have the determination inside your dispute window rather than after it.",
    prevention:
      "Validate the condition record and its validity dates before the effective date, not after the first invoice disagrees. A price agreed in April and entered in June bills six weeks of disputes nobody did wrong.",
    activity: [
      { date: "06/24 10:20 am", who: "Intake", what: "Buyer flagged the invoice price against the PO price. Routed to Finance and AR." },
      { date: "06/24 1:05 pm", who: "Priya S.", what: "Pulled the pricing record. Validity dates straddle the order date; the condition is the suspect." },
      { date: "07/01 9:40 am", who: "Priya S.", what: "Sales confirmed the agreed price in writing. Correction path drafted, pending the receipt posting." },
      { date: "07/08 3:30 pm", who: "Priya S.", what: "Update sent to the buyer with the dispute-window date on it. Determination lands inside the window." },
    ],
  },
  {
    id: "FF-2122",
    title: "Delivery date confirmation",
    severity: "medium",
    status: "active",
    opened: "07/02/2026",
    source: "Account follow up",
    product: "Samyang 2x Hot Chicken",
    poRef: "PO 4500119842",
    owner: "Logistics",
    assignee: "Elena V., Senior Rep",
    assigneeInitials: "EV",
    supporting: ["Customer Experience", "Supply Chain"],
    metric: "On-time delivery",
    promise: "Acknowledged within 4 business hours. Notified before the delivery window, not after.",
    response:
      "We are confirming the requested delivery date against the confirmed schedule and the warehouse release. If the timing moves, you will hear it from us before the window rather than from the dock after it, so you can still move the promotion.",
    prevention:
      "Hold and notify beats a silent short ship. A known delay is something a buyer can plan around; a partial delivery discovered at the dock is not.",
    activity: [
      { date: "07/02 11:10 am", who: "Intake", what: "Buyer asked whether the next release holds its date. Routed to Logistics." },
      { date: "07/02 2:25 pm", who: "Elena V.", what: "Acknowledged, pulled the warehouse release calendar, opened a watch on the window." },
      { date: "07/07 9:00 am", who: "Elena V.", what: "Carrier schedule confirmed. Buyer told the date holds, in writing, before the window." },
    ],
  },

  /* ---- Resolved. The record of how this account's cases actually closed. -- */
  {
    id: "FF-1611",
    title: "Allocation short, told at confirmation",
    severity: "medium",
    status: "resolved",
    opened: "11/03/2022",
    resolvedDate: "01/12/2023",
    resolution:
      "Credit memo issued for the thirty unshipped cases; the buyer folded the gap into their January reset. Root cause recorded as allocation, communicated at confirmation, so it closed as a planning adjustment rather than a deduction.",
    source: "Order confirmation",
    product: "Samyang 2x Hot Chicken",
    poRef: "PO 4500118207",
    ordered: 150,
    received: 120,
    owner: "Supply Chain",
    assignee: "Aisha B., Rep",
    assigneeInitials: "AB",
    supporting: ["Customer Experience"],
    metric: "Fill Rate",
    promise: "Buyer notified at confirmation, before the truck.",
    prevention:
      "The playbook line this case wrote: an allocation short told at confirmation is a planning adjustment. The same short discovered at the dock is a deduction.",
    activity: [
      { date: "11/03/2022", who: "Aisha B.", what: "Allocation confirmed 120 of 150. Buyer notified the same day with the gap in writing." },
      { date: "12/30/2022", who: "Aisha B.", what: "Delivered 120 CV, invoice billed as shipped, no mismatch created." },
      { date: "01/12/2023", who: "Aisha B.", what: "Credit memo cleared. Case closed with root cause on the record." },
    ],
  },
  {
    id: "FF-1487",
    title: "One order, two accounting periods",
    severity: "low",
    status: "resolved",
    opened: "01/05/2023",
    resolvedDate: "01/09/2023",
    resolution:
      "The buyer's AP questioned an invoice against a receipt split across the year end. Answered with both goods receipt documents summing to the ordered quantity. No credit needed; closed in four days.",
    source: "Invoice inquiry",
    product: "Samyang Dry Noodle Hot Chicken",
    poRef: "PO 4500118207",
    owner: "Finance and AR",
    assignee: "Priya S., Senior Rep",
    assigneeInitials: "PS",
    supporting: ["Customer Experience"],
    metric: "Invoice match rate",
    promise: "Documents to the buyer's AP inside two business days.",
    prevention:
      "A receipt straddling a period end now gets the two receipt documents attached to the invoice proactively, so AP never has to ask.",
    activity: [
      { date: "01/05/2023", who: "Intake", what: "Buyer's AP asked why one invoice carried two receipt references." },
      { date: "01/06/2023", who: "Priya S.", what: "Pulled GR 5010000164 and GR 5010000216, which sum 164 plus 216 to the 380 ordered." },
      { date: "01/09/2023", who: "Priya S.", what: "AP confirmed reconciliation. Closed, with the attach-both-receipts rule added to the SOP." },
    ],
  },
  {
    id: "FF-1320",
    title: "ASN rejected by the receiver's system",
    severity: "medium",
    status: "resolved",
    opened: "08/10/2022",
    resolvedDate: "08/11/2022",
    resolution:
      "The 856 failed the receiver's validation on a unit-of-measure segment and came back on the 997. Corrected and retransmitted within a day, ahead of the truck, so receiving scanned against a clean ASN and no service impact reached the account.",
    source: "EDI, 997 acknowledgement",
    product: "Samyang 2x Hot Chicken",
    poRef: "PO 4500115309",
    owner: "Logistics and EDI",
    assignee: "Marcus T., Rep",
    assigneeInitials: "MT",
    supporting: ["Supply Chain"],
    metric: "ASN accuracy",
    promise: "Corrected ASN ahead of the delivery window.",
    prevention:
      "The 997 is watched as a work queue, not an archive. A rejected ASN caught the same hour is a retransmission; caught at the dock it is a compliance chargeback.",
    activity: [
      { date: "08/10/2022", who: "Intake", what: "997 posted a rejection on the outbound 856. Queued to EDI." },
      { date: "08/10/2022", who: "Marcus T.", what: "Traced the failure to a unit-of-measure segment, corrected the map, retransmitted." },
      { date: "08/11/2022", who: "Marcus T.", what: "Clean 997 received a day before delivery. Closed with the map fix noted for the next audit." },
    ],
  },
];

export const CASES_NOTE =
  "Assignees are the roster from the leadership page, so a name here carries a workload and a coaching plan there. Active cases show the work in flight; resolved cases show what closing well looks like: a date, a named person, and a root cause on the record.";

export const ROUTING: RoutingLane[] = [
  { team: "Customer Experience", owns: "Customer communication, acknowledgement, case notes, expectation setting, status updates, service-level discipline, and the language a case closes with." },
  { team: "Supply Chain", owns: "Inventory availability, allocation, fill rate, the shortage explanation, replacement feasibility, and the prevention that keeps it from recurring." },
  { team: "Logistics", owns: "Outbound delivery, carrier status, warehouse release, truck load, route timing, and proof of delivery." },
  { team: "Finance and AR", owns: "Invoice disputes, credit memo review, deductions, payment mismatches, billing corrections, and account aging risk." },
  { team: "Sales", owns: "Relationship context, buyer expectations, promotional pricing, ad timing, retailer commitments, and commercial sensitivity." },
  { team: "Warehouse and 3PL", owns: "Pick accuracy, load verification, pallet condition, case count, and outbound confirmation." },
];

export interface RoutingLane {
  team: string;
  owns: string;
}

export const ROUTING_NOTE =
  "Good customer experience does not mean owning every problem. It means knowing who owns the broken part of the order chain, keeping the account informed while that team resolves it, and never handing the buyer between departments to explain the same thing again.";

export interface Kpi {
  label: string;
  value: string;
  note: string;
  risk?: RiskLevel;
}

export const KPIS: Kpi[] = [
  { label: "Fill rate, open exception", value: "90%", note: "540 of 600 cases received on the open short shipment. Derived from this case, not an account average.", risk: "high" },
  { label: "Open cases", value: "3", note: "One high priority, two medium." },
  { label: "High priority cases", value: "1", note: "The short shipment. A dated commitment is at risk." },
  { label: "Acknowledgement", value: "1 business hour", note: "The target for a high priority case. The clock is ours to keep, not the account's to watch." },
  { label: "Same-day update compliance", value: "Target 100%", note: "A target we would propose and then measure, not a result we are claiming." },
  { label: "Dispute risk", value: "Medium", note: "One open price validation and one unposted receipt.", risk: "medium" },
  { label: "Deduction risk", value: "Elevated", note: "Elevated whenever shipped quantity and invoice quantity disagree.", risk: "high" },
  { label: "Invoice match confidence", value: "Under review", note: "One line has no posted receipt to reconcile against.", risk: "medium" },
];

export const KPI_NOTE =
  "They show how a customer experience manager connects account service, order accuracy, fulfillment, billing, and escalation discipline into one view. On a real book of business every one of them would be measured, and the targets set against the actual dispute windows rather than borrowed.";

export interface Sop {
  id: string;
  code: string;
  name: string;
  trigger: string;
  steps: string[];
}

export const SOPS: Sop[] = [
  {
    id: "sop-short-shipment",
    code: "SOP-DE-01",
    name: "Short shipment",
    trigger: "The account reports a received quantity lower than the ordered quantity or the ASN quantity.",
    steps: [
      "Acknowledge within one business hour, from a named person.",
      "Capture the PO number, SKU, ordered quantity, received quantity, delivery date, and supporting documents.",
      "Review the outbound delivery and the picked quantity.",
      "Compare the ASN quantity against the warehouse load confirmation.",
      "Check whether the bill of lading or proof of delivery carries an exception.",
      "Determine a replacement shipment, a credit memo, or deduction support.",
      "Update the account the same business day, before close of business.",
      "Record the root cause and the dated corrective action before the case may close.",
    ],
  },
  {
    id: "sop-price-mismatch",
    code: "SOP-PR-01",
    name: "Price mismatch",
    trigger: "The account says the invoice price does not match the PO or the agreed price.",
    steps: [
      "Capture the PO, the invoice, the SKU, the expected price, and the billed price.",
      "Validate the customer pricing record or the promotional agreement.",
      "Compare the PO price to the invoice price, and both to the condition record's validity dates.",
      "Route to Finance and AR, and to Sales when a customer pricing agreement is involved.",
      "Issue the correction, the credit memo review, or the explanation.",
      "Update the account with a clear next action and a date.",
    ],
  },
  {
    id: "sop-delivery-date",
    code: "SOP-DE-02",
    name: "Delivery date concern",
    trigger: "The account asks whether a delivery will arrive by the requested date.",
    steps: [
      "Confirm the requested delivery date on the order.",
      "Check the order status and the warehouse release.",
      "Confirm the carrier and the delivery schedule.",
      "Notify the account before the delivery window if the timing changes, not after.",
      "Escalate when an ad window, a promotion, or a retail launch is at risk.",
    ],
  },
];

export interface RiskRow {
  risk: string;
  impact: string;
  owner: string;
  prevention: string;
  level: RiskLevel;
}

export const RISK_REGISTER: RiskRow[] = [
  { risk: "Short shipment", impact: "Fill rate loss, a shelf gap the buyer has to explain, and a probable deduction.", owner: "Supply Chain", prevention: "Pick and load verification before the truck departs.", level: "high" },
  { risk: "Price mismatch", impact: "Invoice dispute, credit memo, delayed payment.", owner: "Finance and AR", prevention: "Validate the pricing record before the effective date, not after the first invoice.", level: "medium" },
  { risk: "Late delivery", impact: "A missed ad window, a shelf availability gap, a buyer escalation.", owner: "Logistics", prevention: "Confirm the delivery date and tell the account before the window closes.", level: "medium" },
  { risk: "ASN mismatch", impact: "The receiver scans against a document the trailer does not match, and the shipment scores as a miss even when the freight was on time.", owner: "Logistics and EDI", prevention: "Match the ASN to the load confirmation before it transmits.", level: "high" },
  { risk: "Credit or deduction delay", impact: "AR aging, a short-paid invoice, and an account that stops calling and starts deducting.", owner: "Finance and AR", prevention: "Clear documentation and one named case owner, with the dispute window on the case from the first hour.", level: "medium" },
];

export const MANAGER_SUMMARY_COPY =
  "This is a sample account operations dossier for one retail account, built by Nathan J. Song as part of an application for Manager, Customer Experience at Samyang America. It walks one trade account across the full chain the role owns: the purchase orders, the freight and fulfillment trail behind them, the cases that open when something breaks, the internal routing, and the metrics that show whether the fix held. The honest limits are stated up front. It is not connected to live SAP, I have not configured or implemented SAP, the operational data is modeled, and I have not worked at Samyang or managed this or any Samyang account. What is real is the vantage point. I have read purchase orders and goods receipt history from the buyer's chair, where an ordered quantity, a received quantity, and an invoice stop agreeing and become a dispute, and I have worked accounts receivable in dental billing, where a small front-end data error came back later as a claim someone had to rework. The page is built around that pattern and around one standard: the account gets one named owner, an update on a date we set, and a record that travels with the case so they explain the problem once.";

/** The sticky rail. Ids must match the section ids rendered on the page. */
export const ACCOUNT_SECTIONS: { id: string; label: string }[] = [
  { id: "snapshot", label: "Account snapshot" },
  { id: "purchase-orders", label: "Purchase orders" },
  { id: "order-trace", label: "Open order trace" },
  { id: "cases", label: "Account cases" },
  { id: "trajectory", label: "Account trajectory" },
  { id: "company-notes", label: "Profile notes" },
  { id: "erp-edi", label: "ERP and EDI logic" },
  { id: "routing", label: "Internal routing" },
  { id: "kpis", label: "KPI dashboard" },
  { id: "sops", label: "SOP library" },
  { id: "risk", label: "Risk register" },
  { id: "notes", label: "Nathan's Notes" },
  { id: "summary", label: "Hiring manager summary" },
];
