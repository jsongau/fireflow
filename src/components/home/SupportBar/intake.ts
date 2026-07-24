/**
 * Account Support Intake — SOP taxonomy.
 *
 * The single source of truth behind the SupportBar's multi-step intake flow.
 * It models how a Customer Experience team would categorize, route, prioritize,
 * and measure a support case before a representative responds.
 *
 * Each category carries a synthetic sample (prefill) so the flow can be tested
 * without typing, plus a short operator read (scenario, rootCause, handling)
 * that powers "Nathan's read" inside the drawer. Everything is a synthetic
 * operating model for a portfolio artifact. No real Samyang accounts, orders,
 * prices, or metrics are represented.
 */

export type RoleId =
  | "retailer"
  | "distributor"
  | "broker"
  | "vendor"
  | "internal"
  | "consumer";

/** Which detail form a category collects at Step 3. */
export type FieldSetId = "order" | "pricing" | "shortship" | "consumer" | "generic";

/** Priority ladder. Rendered with a glyph and word, never color alone. */
export type PriorityId = "standard" | "elevated" | "high" | "critical";

export const PRIORITY_LABEL: Record<PriorityId, string> = {
  standard: "Standard",
  elevated: "Elevated",
  high: "High",
  critical: "Critical",
};

export const PRIORITY_ORDER: PriorityId[] = ["standard", "elevated", "high", "critical"];

/**
 * Synthetic service-level design: an acknowledge and resolve target per priority.
 * Ranges reflect typical B2B support tiers (see docs/recommendations/01). Labeled
 * synthetic wherever shown; not a Samyang commitment.
 */
export const PRIORITY_TARGET: Record<PriorityId, { ack: string; resolve: string }> = {
  standard: { ack: "1 business day", resolve: "2 business days" },
  elevated: { ack: "4 business hours", resolve: "1 business day" },
  high: { ack: "1 business hour", resolve: "Same business day" },
  critical: { ack: "30 minutes", resolve: "4 hours" },
};

export interface RoleDef {
  id: RoleId;
  label: string;
  blurb: string;
}

export interface CategoryDef {
  id: string;
  /**
   * The written procedure this category is governed by. Coded by process family
   * (OM order management, DE delivery exceptions, BD billing and deductions, PR
   * pricing, MD master data, QA product and quality, CN consumer), because a
   * flat SOP-01..29 list tells a rep nothing about which binder to open. The
   * register renders on /leadership; the code rides the case from intake to the
   * confirmation, so a rep can cite the procedure they followed.
   */
  sop: string;
  label: string;
  fieldSet: FieldSetId;
  /** How the case is titled internally. */
  caseType: string;
  /** Team that owns the case to resolution. */
  owner: string;
  /** Teams pulled in to support resolution. */
  supporting: string[];
  /** The service metric the case puts at risk. */
  metric: string;
  /** Default priority before the requester adjusts urgency. */
  priority: PriorityId;
  /** The first governed step after intake. */
  nextAction: string;
  /** Editable synthetic values that pre-fill the detail form. */
  prefill: Record<string, string>;
  /** One line: the situation this case usually represents. */
  scenario: string;
  /** One line: what to fix internally so it stops happening. */
  rootCause: string;
  /** One line: how to handle the customer on this case. */
  handling: string;
}

export interface FieldDef {
  name: string;
  label: string;
  type: "text" | "email" | "tel" | "date" | "number" | "textarea" | "file";
  optional?: boolean;
  placeholder?: string;
}

/* --------------------------------------------------------------------------
 * Step 1 — Who are you?
 * ------------------------------------------------------------------------ */

export const ROLES: RoleDef[] = [
  { id: "retailer", label: "Retailer", blurb: "Buys and sells our products in store" },
  { id: "distributor", label: "Distributor", blurb: "Moves volume to downstream accounts" },
  { id: "broker", label: "Broker / Sales Partner", blurb: "Represents the line to accounts" },
  { id: "vendor", label: "Vendor / Supplier", blurb: "Supplies goods, materials, or services" },
  { id: "internal", label: "Internal Team", blurb: "Sales, Supply Chain, Logistics, Finance" },
  { id: "consumer", label: "Consumer", blurb: "Eats and enjoys the product" },
];

export const ROLE_LABEL: Record<RoleId, string> = ROLES.reduce(
  (acc, r) => ({ ...acc, [r.id]: r.label }),
  {} as Record<RoleId, string>,
);

/** Account-type label used on the routing summary. */
export const ACCOUNT_TYPE: Record<RoleId, string> = {
  retailer: "Retail account",
  distributor: "Distribution account",
  broker: "Broker / sales partner",
  vendor: "Vendor / supplier",
  internal: "Internal team",
  consumer: "Consumer",
};

/* --------------------------------------------------------------------------
 * Sample data — synthetic, editable defaults per field set.
 * ------------------------------------------------------------------------ */

const ORDER_BASE = {
  account: "99 Ranch Market",
  contact: "Dana Whitfield",
  email: "dana.whitfield@glgg.example",
  phone: "(312) 555-0142",
  po: "PO-482207",
  order: "SO-559120",
  invoice: "INV-90733",
  sku: "Buldak 2x Spicy, cup",
  qty: "120",
  requestedDate: "2026-07-15",
};

const PRICING_BASE = {
  account: "Pacific Retail Collective",
  promo: "Q3 Endcap Feature, AG-4471",
  expectedPrice: "$16.80 per case",
  invoicePrice: "$18.40 per case",
  sku: "Buldak Carbonara, cup",
  effectiveDate: "2026-07-01",
};

const SHORTSHIP_BASE = {
  po: "PO-482207",
  orderedQty: "600",
  receivedQty: "540",
  deliveryDate: "2026-07-02",
  carrier: "Summit Foods DC 4 / Knight Transportation",
};

const CONSUMER_BASE = {
  product: "Buldak 2x Spicy",
  lot: "L4-2291",
  store: "H Mart, Naperville IL",
  purchaseDate: "2026-06-28",
};

const GENERIC_BASE = {
  account: "Harbor Market Partners",
  contact: "Alex Chen",
  email: "alex.chen@harbormkt.example",
  reference: "SKU 8801073-00421",
};

/* --------------------------------------------------------------------------
 * Step 2 — What do you need help with?  (categories per role)
 * ------------------------------------------------------------------------ */

export const CX = "Customer Experience";
const SALES = "Sales";
const SUPPLY = "Supply Chain";
const LOGISTICS = "Logistics";
const FINANCE = "Finance";
const QUALITY = "Quality / Product";

/** Retailer, Distributor, and Broker share the account-service catalog. */
const ACCOUNT_CATEGORIES: CategoryDef[] = [
  {
    id: "bulk-order-status",
    sop: "SOP-OM-01",
    label: "Bulk order status",
    fieldSet: "order",
    caseType: "Order status",
    owner: CX,
    supporting: [SUPPLY, LOGISTICS],
    metric: "On Time Fulfillment",
    priority: "standard",
    nextAction: "Confirm order status against the schedule and send a dated update.",
    prefill: { ...ORDER_BASE, description: "Need a status update on our July restock. The account is asking when the trucks land." },
    scenario: "A large restock is mid-transit and the account has not had a dated update.",
    rootCause: "Set a standing status cadence on bulk orders so accounts hear from us before they ask.",
    handling: "Confirm the ship and arrival dates against the schedule, then send one clear dated update.",
  },
  {
    id: "pricing-promo-mismatch",
    sop: "SOP-PR-01",
    label: "Pricing or promo mismatch",
    fieldSet: "pricing",
    caseType: "Pricing review",
    owner: SALES,
    supporting: [CX, FINANCE],
    metric: "Billing Accuracy",
    priority: "elevated",
    nextAction: "Validate the agreement, confirm the correct price, and align billing.",
    prefill: { ...PRICING_BASE, notes: "Invoice came in above the agreed Q3 feature price. Please reconcile before it becomes a deduction." },
    scenario: "The billed price does not match the active promotional agreement.",
    rootCause: "Load promo pricing into the price master before the deal window opens and check the first invoice.",
    handling: "Confirm the agreement, correct the price, and align the credit before the account deducts it.",
  },
  {
    id: "short-shipment",
    sop: "SOP-DE-01",
    label: "Short shipment / fill rate issue",
    fieldSet: "shortship",
    caseType: "Fill rate exception",
    owner: SUPPLY,
    supporting: [CX, LOGISTICS],
    metric: "Fill Rate",
    priority: "high",
    nextAction: "Reconcile ordered against received and open a fill recovery.",
    prefill: { ...SHORTSHIP_BASE, notes: "Received 540 of 600 cases. Sixty short with no note on the bill of lading." },
    scenario: "Delivered quantity is under the PO and the gap is not yet explained.",
    rootCause: "Tighten pick and load verification at the DC and flag allocation shorts before the truck ships.",
    handling: "Reconcile ordered against received, confirm the cause, and open a fill recovery for the short cases.",
  },
  {
    id: "late-delivery",
    sop: "SOP-DE-02",
    label: "Late delivery",
    fieldSet: "order",
    caseType: "Delivery exception",
    owner: LOGISTICS,
    supporting: [CX, SUPPLY],
    metric: "On Time Fulfillment",
    priority: "high",
    nextAction: "Trace the shipment, set a revised arrival, and notify the account.",
    prefill: { ...ORDER_BASE, description: "Delivery missed the requested date and the account has an ad running this week." },
    scenario: "A shipment is behind the requested delivery date during a promotion.",
    rootCause: "Add lead-time buffers on ad-supported orders and watch at-risk shipments proactively.",
    handling: "Trace the load, set a firm revised arrival, and tell the account before they escalate.",
  },
  {
    id: "damaged-missing",
    sop: "SOP-DE-03",
    label: "Damaged or missing cases",
    fieldSet: "shortship",
    caseType: "Delivery exception",
    owner: LOGISTICS,
    supporting: [CX, QUALITY],
    metric: "Fill Rate",
    priority: "high",
    nextAction: "Log the discrepancy, request proof, and open a claim or replacement.",
    prefill: { ...SHORTSHIP_BASE, receivedQty: "552", notes: "Two pallets arrived crushed, about 48 cases unsellable. Photos on file." },
    scenario: "Cases arrived damaged and unsellable on receipt.",
    rootCause: "Review pallet configuration and carrier handling on this lane if the pattern repeats.",
    handling: "Log the discrepancy with photos, open a claim or replacement, and protect the fill number.",
  },
  {
    id: "invoice-dispute",
    sop: "SOP-BD-01",
    label: "Invoice or billing dispute",
    fieldSet: "order",
    caseType: "Billing dispute",
    owner: FINANCE,
    supporting: [CX],
    metric: "Billing Accuracy",
    priority: "elevated",
    nextAction: "Compare invoice against order and terms, then correct or explain.",
    prefill: { ...ORDER_BASE, description: "Invoice total does not match our PO. Looks like a line was billed twice." },
    scenario: "An invoice does not reconcile to the order or the agreed terms.",
    rootCause: "Add an order-to-invoice match check before billing releases.",
    handling: "Compare the invoice to the PO and terms, then correct or explain the difference in writing.",
  },
  {
    id: "deduction-chargeback",
    sop: "SOP-BD-02",
    label: "Deduction / chargeback",
    fieldSet: "order",
    caseType: "Deduction dispute",
    owner: FINANCE,
    supporting: [CX, SALES],
    metric: "Deduction Aging",
    priority: "high",
    nextAction: "Classify the deduction, gather backup, and dispute or accept it.",
    prefill: { ...ORDER_BASE, description: "Account took a deduction we do not recognize on the last remittance." },
    scenario: "An unexplained deduction has posted against payment.",
    rootCause: "Categorize deductions at intake and dispute invalid ones inside the aging window.",
    handling: "Classify the deduction, gather backup, and dispute or accept it before it ages out.",
  },
  {
    id: "sku-availability",
    sop: "SOP-OM-03",
    label: "SKU availability",
    fieldSet: "generic",
    caseType: "Availability check",
    owner: SUPPLY,
    supporting: [CX],
    metric: "Service Level",
    priority: "standard",
    nextAction: "Check allocation and lead time, then confirm an availability date.",
    prefill: { ...GENERIC_BASE, reference: "Buldak Carbonara, cup", description: "Is Buldak Carbonara cup available for an August reset? Need volume and lead time." },
    scenario: "An account wants availability and lead time for a reset order.",
    rootCause: "Keep allocation and lead-time views current so answers do not lag supply.",
    handling: "Check allocation and lead time, then confirm a firm availability date.",
  },
  {
    id: "standing-order",
    sop: "SOP-OM-02",
    label: "Standing order / replenishment",
    fieldSet: "order",
    caseType: "Replenishment setup",
    owner: CX,
    supporting: [SUPPLY],
    metric: "Service Level",
    priority: "standard",
    nextAction: "Confirm cadence and quantities, then schedule the standing order.",
    prefill: { ...ORDER_BASE, description: "Would like to set a biweekly standing order for our top three cups." },
    scenario: "An account wants to convert repeat buys into a standing replenishment.",
    rootCause: "Offer replenishment setup to steady accounts so orders stop being manual.",
    handling: "Confirm cadence and quantities, then schedule and monitor the standing order.",
  },
  {
    id: "new-item-setup",
    sop: "SOP-MD-01",
    label: "New item setup / customer master data",
    fieldSet: "generic",
    caseType: "Master data setup",
    owner: CX,
    supporting: [SALES, FINANCE],
    metric: "Data Integrity",
    priority: "standard",
    nextAction: "Collect the setup sheet, validate fields, and open the data request.",
    prefill: { ...GENERIC_BASE, reference: "3 new Buldak SKUs", description: "Setting up three new Buldak SKUs in our system. Need item and master data." },
    scenario: "New items need customer master and item data before the account can order.",
    rootCause: "Standardize the setup sheet so master data is complete and clean the first time.",
    handling: "Collect the setup sheet, validate fields, and open the data request with Finance and Sales.",
  },
];

const VENDOR_CATEGORIES: CategoryDef[] = [
  {
    id: "product-spec",
    sop: "SOP-QA-01",
    label: "Product specification question",
    fieldSet: "generic",
    caseType: "Product support case",
    owner: QUALITY,
    supporting: [CX],
    metric: "Case Resolution Time",
    priority: "standard",
    nextAction: "Route to Product for the specification and confirm back in writing.",
    prefill: { ...GENERIC_BASE, account: "Cascade Packaging Co.", contact: "Priya Nair", email: "priya.nair@cascadepkg.example", reference: "Carbonara sauce base", description: "Need the current spec sheet for the Carbonara sauce base we supply." },
    scenario: "A supplier needs the controlled specification for a component.",
    rootCause: "Keep spec documents versioned and easy to pull so requests do not stall.",
    handling: "Route to Product, confirm the current version, and send it back in writing.",
  },
  {
    id: "packaging-docs",
    sop: "SOP-QA-02",
    label: "Packaging or labeling documentation",
    fieldSet: "generic",
    caseType: "Documentation request",
    owner: QUALITY,
    supporting: [CX],
    metric: "Data Integrity",
    priority: "standard",
    nextAction: "Identify the document set and deliver the current controlled version.",
    prefill: { ...GENERIC_BASE, account: "Cascade Packaging Co.", contact: "Priya Nair", email: "priya.nair@cascadepkg.example", reference: "Cup lid artwork", description: "Requesting the approved artwork and label spec for the new cup lid." },
    scenario: "A supplier needs approved packaging or labeling documentation.",
    rootCause: "Maintain a single source of approved artwork to prevent version drift.",
    handling: "Identify the document set and deliver the current controlled version.",
  },
  {
    id: "delivery-appointment",
    sop: "SOP-DE-04",
    label: "Delivery appointment / warehouse coordination",
    fieldSet: "order",
    caseType: "Delivery coordination",
    owner: LOGISTICS,
    supporting: [CX],
    metric: "On Time Fulfillment",
    priority: "elevated",
    nextAction: "Confirm the dock window and coordinate the appointment.",
    prefill: { ...ORDER_BASE, account: "Cascade Packaging Co.", contact: "Priya Nair", email: "priya.nair@cascadepkg.example", sku: "Inbound film, raw material", description: "Requesting a dock appointment for inbound raw material on the 2nd." },
    scenario: "An inbound delivery needs a scheduled dock window.",
    rootCause: "Publish dock availability so appointments are booked cleanly.",
    handling: "Confirm the dock window and coordinate the appointment with the warehouse.",
  },
  {
    id: "vendor-invoice",
    sop: "SOP-BD-03",
    label: "Invoice / payment question",
    fieldSet: "order",
    caseType: "Billing review",
    owner: FINANCE,
    supporting: [CX],
    metric: "Billing Accuracy",
    priority: "standard",
    nextAction: "Look up the invoice and payment status, then respond with the detail.",
    prefill: { ...ORDER_BASE, account: "Cascade Packaging Co.", contact: "Priya Nair", email: "priya.nair@cascadepkg.example", sku: "Supplied materials", description: "Following up on payment status for invoice INV-90733." },
    scenario: "A supplier is checking on an outstanding invoice or payment.",
    rootCause: "Give suppliers a status path so payment questions do not become escalations.",
    handling: "Look up the invoice and payment status, then respond with the detail.",
  },
  {
    id: "compliance-request",
    sop: "SOP-QA-03",
    label: "Compliance or documentation request",
    fieldSet: "generic",
    caseType: "Compliance request",
    owner: QUALITY,
    supporting: [FINANCE, CX],
    metric: "Data Integrity",
    priority: "elevated",
    nextAction: "Confirm the requirement and return the compliance documentation.",
    prefill: { ...GENERIC_BASE, account: "Cascade Packaging Co.", contact: "Priya Nair", email: "priya.nair@cascadepkg.example", reference: "COA + allergen statement", description: "Need updated certificate of analysis and allergen statement for the current lot." },
    scenario: "A compliance document is required for the current lot.",
    rootCause: "Keep compliance documents current and mapped to lots.",
    handling: "Confirm the requirement and return the compliance documentation.",
  },
  {
    id: "supply-substitution",
    sop: "SOP-OM-04",
    label: "Supply issue or substitution",
    fieldSet: "generic",
    caseType: "Supply exception",
    owner: SUPPLY,
    supporting: [CX, SALES],
    metric: "Fill Rate",
    priority: "high",
    nextAction: "Assess impact and approve a substitution or recovery plan.",
    prefill: { ...GENERIC_BASE, account: "Cascade Packaging Co.", contact: "Priya Nair", email: "priya.nair@cascadepkg.example", reference: "Specified film short", description: "Short on the specified film. Requesting approval for an equivalent substitute." },
    scenario: "A supply constraint may require an approved substitution.",
    rootCause: "Pre-approve qualified substitutes so shortages do not stop production.",
    handling: "Assess the impact and approve a substitution or recovery plan.",
  },
];

const INTERNAL_CATEGORIES: CategoryDef[] = [
  {
    id: "sales-request",
    sop: "SOP-PR-03",
    label: "Sales request",
    fieldSet: "generic",
    caseType: "Sales request",
    owner: SALES,
    supporting: [CX],
    metric: "Case Resolution Time",
    priority: "standard",
    nextAction: "Log the request, assign an owner, and set a response date.",
    prefill: { ...GENERIC_BASE, account: "Sales, West region", contact: "Jordan Lee", email: "jordan.lee@fireflow.example", reference: "New account pitch", description: "Sales needs sample cases and a line card for a new account pitch." },
    scenario: "Sales needs support to move an account forward.",
    rootCause: "Give Sales a clear request path so asks are tracked, not lost in inboxes.",
    handling: "Log the request, assign an owner, and set a response date.",
  },
  {
    id: "supply-request",
    sop: "SOP-OM-05",
    label: "Supply chain request",
    fieldSet: "generic",
    caseType: "Supply chain request",
    owner: SUPPLY,
    supporting: [CX],
    metric: "Service Level",
    priority: "standard",
    nextAction: "Confirm the ask, check supply, and return a committed answer.",
    prefill: { ...GENERIC_BASE, account: "Supply Chain", contact: "Morgan Diaz", email: "morgan.diaz@fireflow.example", reference: "Carbonara cup availability", description: "Need projected availability on Carbonara cup for the next eight weeks." },
    scenario: "An internal team needs a supply or availability read.",
    rootCause: "Keep availability views shared so teams can self-serve the basics.",
    handling: "Confirm the ask, check supply, and return a committed answer.",
  },
  {
    id: "logistics-escalation",
    sop: "SOP-DE-05",
    label: "Logistics escalation",
    fieldSet: "order",
    caseType: "Logistics escalation",
    owner: LOGISTICS,
    supporting: [CX],
    metric: "On Time Fulfillment",
    priority: "high",
    nextAction: "Escalate to carrier management and set a recovery time.",
    prefill: { ...ORDER_BASE, account: "Logistics", contact: "Morgan Diaz", email: "morgan.diaz@fireflow.example", description: "Carrier missed pickup twice this week on the Midwest lane. Escalating." },
    scenario: "A carrier is missing commitments on a lane.",
    rootCause: "Track carrier performance and escalate repeat misses to carrier management.",
    handling: "Escalate to carrier management and set a recovery time.",
  },
  {
    id: "finance-deduction-review",
    sop: "SOP-BD-04",
    label: "Finance / deduction review",
    fieldSet: "order",
    caseType: "Deduction review",
    owner: FINANCE,
    supporting: [CX, SALES],
    metric: "Deduction Aging",
    priority: "elevated",
    nextAction: "Pull the deduction backup and route for validity review.",
    prefill: { ...ORDER_BASE, account: "Finance", contact: "Sam Patel", email: "sam.patel@fireflow.example", description: "Please review a deduction for validity before we write it off." },
    scenario: "A deduction needs a validity review before disposition.",
    rootCause: "Route deductions through a review step so nothing is written off blindly.",
    handling: "Pull the deduction backup and route it for a validity review.",
  },
  {
    id: "master-data-correction",
    sop: "SOP-MD-02",
    label: "Customer master data correction",
    fieldSet: "generic",
    caseType: "Master data correction",
    owner: CX,
    supporting: [FINANCE],
    metric: "Data Integrity",
    priority: "standard",
    nextAction: "Verify the correct value and open the master data change.",
    prefill: { ...GENERIC_BASE, account: "99 Ranch Market", contact: "Morgan Diaz", email: "morgan.diaz@fireflow.example", reference: "Ship-to address", description: "Ship-to address on this account is outdated. Needs correction." },
    scenario: "A master data field is wrong and needs correcting.",
    rootCause: "Add a validation and change-control step on master data edits.",
    handling: "Verify the correct value and open the master data change.",
  },
  {
    id: "pricing-validation",
    sop: "SOP-PR-02",
    label: "Pricing validation",
    fieldSet: "pricing",
    caseType: "Pricing validation",
    owner: SALES,
    supporting: [FINANCE, CX],
    metric: "Billing Accuracy",
    priority: "elevated",
    nextAction: "Confirm the price against the agreement and record the outcome.",
    prefill: { ...PRICING_BASE, account: "Internal, quoting desk", notes: "Confirm the list price on Carbonara cup matches the approved sheet before we quote." },
    scenario: "A price needs validation against the approved sheet before it goes out.",
    rootCause: "Sync the price master to approved pricing so quotes are right by default.",
    handling: "Confirm the price against the agreement and record the outcome.",
  },
  {
    id: "account-status-update",
    sop: "SOP-OM-06",
    label: "Account status update",
    fieldSet: "generic",
    caseType: "Account update",
    owner: CX,
    supporting: [SALES],
    metric: "Data Integrity",
    priority: "standard",
    nextAction: "Confirm the change and update the account record.",
    prefill: { ...GENERIC_BASE, account: "Harbor Market Partners", contact: "Jordan Lee", email: "jordan.lee@fireflow.example", reference: "Set account active", description: "Move this account to active and enable ordering." },
    scenario: "An account status change needs to be applied.",
    rootCause: "Define who approves status changes so records stay trustworthy.",
    handling: "Confirm the change and update the account record.",
  },
];

const CONSUMER_CATEGORIES: CategoryDef[] = [
  {
    id: "product-question",
    sop: "SOP-CN-01",
    label: "Product question",
    fieldSet: "consumer",
    caseType: "Product support case",
    owner: CX,
    supporting: [QUALITY],
    metric: "CSAT",
    priority: "standard",
    nextAction: "Answer the question and share product detail where helpful.",
    prefill: { ...CONSUMER_BASE, description: "How spicy is the 2x Spicy compared to the original? Cooking for family." },
    scenario: "A consumer wants product guidance before buying or cooking.",
    rootCause: "Keep product detail clear on pack and online so basic questions are answered up front.",
    handling: "Answer the question and share heat and preparation detail where helpful.",
  },
  {
    id: "allergen-ingredient",
    sop: "SOP-QA-04",
    label: "Allergen or ingredient question",
    fieldSet: "consumer",
    caseType: "Product support case",
    owner: QUALITY,
    supporting: [CX],
    metric: "CSAT",
    priority: "elevated",
    nextAction: "Confirm the ingredient or allergen detail from the controlled source.",
    prefill: { ...CONSUMER_BASE, product: "Buldak Carbonara", description: "Does the Carbonara contain shellfish or egg? Checking for an allergy." },
    scenario: "A consumer is asking an allergen or ingredient question tied to a health need.",
    rootCause: "Keep allergen statements accurate and easy to find on pack and site.",
    handling: "Confirm the detail from the controlled source only. Never guess on an allergen.",
  },
  {
    id: "where-to-buy",
    sop: "SOP-CN-02",
    label: "Where to buy",
    fieldSet: "consumer",
    caseType: "Product support case",
    owner: CX,
    supporting: [SALES],
    metric: "CSAT",
    priority: "standard",
    nextAction: "Share retail and online availability for the requested area.",
    prefill: { ...CONSUMER_BASE, product: "Buldak Carbonara", lot: "", store: "", description: "Where can I buy Buldak Carbonara near Naperville, Illinois?" },
    scenario: "A consumer wants to find the product locally or online.",
    rootCause: "Keep a current retail and online availability list to answer quickly.",
    handling: "Share retail and online options for the area they named.",
  },
  {
    id: "damaged-product",
    sop: "SOP-QA-05",
    label: "Damaged product",
    fieldSet: "consumer",
    caseType: "Quality concern",
    owner: QUALITY,
    supporting: [CX],
    metric: "CSAT",
    priority: "elevated",
    nextAction: "Capture the lot detail and open a quality record.",
    prefill: { ...CONSUMER_BASE, description: "Cup arrived split and leaking. Bought it last week." },
    scenario: "A consumer received a damaged unit.",
    rootCause: "Review handling and pack durability if a lot code repeats.",
    handling: "Capture the lot, apologize plainly, make it right, and open a quality record.",
  },
  {
    id: "quality-concern",
    sop: "SOP-QA-06",
    label: "Quality concern",
    fieldSet: "consumer",
    caseType: "Quality concern",
    owner: QUALITY,
    supporting: [CX],
    metric: "CSAT",
    priority: "high",
    nextAction: "Log the concern with lot detail and route to Quality for review.",
    prefill: { ...CONSUMER_BASE, description: "Noodles had an off smell out of the pack." },
    scenario: "A consumer is reporting a possible quality issue tied to a lot.",
    rootCause: "Trend concerns by lot so a real quality signal is caught early.",
    handling: "Log the concern with lot detail, route to Quality, and follow up with the person.",
  },
  {
    id: "brand-question",
    sop: "SOP-CN-03",
    label: "General brand question",
    fieldSet: "consumer",
    caseType: "Product support case",
    owner: CX,
    supporting: [],
    metric: "CSAT",
    priority: "standard",
    nextAction: "Answer the question and point to the right resource.",
    prefill: { ...CONSUMER_BASE, lot: "", store: "", purchaseDate: "", description: "Do you have any new flavors launching this year?" },
    scenario: "A general brand question with no issue attached.",
    rootCause: "Keep brand and launch info current so answers stay consistent.",
    handling: "Answer the question and point to the right resource.",
  },
];

/**
 * Every category the product routes, deduplicated by id. The SOP register on the
 * leadership page renders from this, so the published procedure list can never
 * name a procedure the product does not run, nor omit one it does. Categories are
 * shared across roles, hence the dedupe.
 */
export const ALL_CATEGORIES: CategoryDef[] = Array.from(
  new Map(
    [
      ...ACCOUNT_CATEGORIES,
      ...VENDOR_CATEGORIES,
      ...INTERNAL_CATEGORIES,
      ...CONSUMER_CATEGORIES,
    ].map((c) => [c.id, c] as const),
  ).values(),
).sort((a, b) => a.sop.localeCompare(b.sop));

export function categoriesForRole(role: RoleId): CategoryDef[] {
  switch (role) {
    case "retailer":
    case "distributor":
    case "broker":
      return ACCOUNT_CATEGORIES;
    case "vendor":
      return VENDOR_CATEGORIES;
    case "internal":
      return INTERNAL_CATEGORIES;
    case "consumer":
      return CONSUMER_CATEGORIES;
  }
}

/* --------------------------------------------------------------------------
 * Wave B — SAP SD object mapping, EDI channel, and deduction depth.
 *
 * Kept as id-keyed lookups so the category tables above stay readable. See
 * docs/recommendations/02, 03, and 04 for sources.
 * ------------------------------------------------------------------------ */

/** Roles that buy on account and therefore order through a retail channel. */
const ACCOUNT_ROLES: RoleId[] = ["retailer", "distributor", "broker"];
export function isAccountRole(role: RoleId): boolean {
  return ACCOUNT_ROLES.includes(role);
}

/** How the order reached us. */
export type ChannelId = "edi" | "portal" | "manual";
export const CHANNEL_LABEL: Record<ChannelId, string> = {
  edi: "EDI",
  portal: "Retailer portal",
  manual: "Email or phone",
};
export const CHANNEL_ORDER: ChannelId[] = ["edi", "portal", "manual"];

/**
 * The SAP SD object a case touches. Conceptual mapping for an SAP SD aligned
 * workflow study. `ref` doubles as the key into SAP_GLOSSARY where a hover exists.
 */
export interface SapObject {
  label: string;
  ref?: string;
}

export const SAP_OBJECT: Record<string, SapObject> = {
  "bulk-order-status": { label: "Sales order and document flow", ref: "VA03" },
  "pricing-promo-mismatch": { label: "Condition record and pricing procedure", ref: "VK13" },
  "short-shipment": { label: "Outbound delivery, picked quantity", ref: "VL03N" },
  "late-delivery": { label: "Outbound delivery and goods issue", ref: "VL03N" },
  "damaged-missing": { label: "Outbound delivery, returns or credit", ref: "VL03N" },
  "invoice-dispute": { label: "Billing document against delivery and order", ref: "VF03" },
  "deduction-chargeback": { label: "Credit memo request and open AR item", ref: "VA01 (CR)" },
  "sku-availability": { label: "Availability check at the schedule line", ref: "ATP" },
  "standing-order": { label: "Sales order and scheduling agreement", ref: "VA03" },
  "new-item-setup": { label: "Customer master and partner functions", ref: "BP / KNVP" },
  "delivery-appointment": { label: "Inbound delivery scheduling" },
  "vendor-invoice": { label: "Invoice and payment status (accounts payable)" },
  "supply-request": { label: "Availability check at the schedule line", ref: "ATP" },
  "logistics-escalation": { label: "Outbound delivery and goods issue", ref: "VL03N" },
  "finance-deduction-review": { label: "Credit memo request and open AR item", ref: "VA01 (CR)" },
  "master-data-correction": { label: "Customer master and partner functions", ref: "BP / KNVP" },
  "pricing-validation": { label: "Condition record and pricing procedure", ref: "VK13" },
  "account-status-update": { label: "Customer master", ref: "BP / KNVP" },
};

/** Cases whose summary offers a jump to the order-to-cash chapter. */
export const O2C_LINK = new Set<string>([
  "bulk-order-status",
  "pricing-promo-mismatch",
  "short-shipment",
  "late-delivery",
  "damaged-missing",
  "invoice-dispute",
  "deduction-chargeback",
  "sku-availability",
  "standing-order",
  "logistics-escalation",
  "finance-deduction-review",
  "pricing-validation",
]);

/** The EDI document most in play for a case. Keys into EDI_GLOSSARY. */
export const EDI_REF: Record<string, string> = {
  "bulk-order-status": "850 Purchase Order",
  "pricing-promo-mismatch": "810 Invoice",
  "short-shipment": "856 ASN",
  "late-delivery": "856 ASN",
  "damaged-missing": "856 ASN",
  "invoice-dispute": "810 Invoice",
  "deduction-chargeback": "820 Remittance",
  "sku-availability": "846 Inventory Advice",
  "standing-order": "850 Purchase Order",
};

/* ---- Deduction depth (Recommendation 04) ------------------------------- */

/** Cases that open the deduction sub-flow. */
export const DEDUCTION_CATEGORIES = new Set<string>([
  "deduction-chargeback",
  "finance-deduction-review",
]);

export type ValidityId = "often-valid" | "often-disputable" | "needs-research";

export const VALIDITY_LABEL: Record<ValidityId, string> = {
  "often-valid": "Usually valid",
  "often-disputable": "Often disputable",
  "needs-research": "Needs research",
};

/** Glyph plus word, so validity never depends on color alone. */
export const VALIDITY_GLYPH: Record<ValidityId, string> = {
  "often-valid": "✓",
  "often-disputable": "!",
  "needs-research": "?",
};

export interface DeductionTypeDef {
  id: string;
  label: string;
  /** Team that validates this deduction type. */
  validatedBy: string;
  /** Typical retailer dispute window. Illustrative, varies by retailer. */
  window: string;
  /** Documentation required to dispute. */
  backup: string[];
  /** The upstream fix. */
  rootCause: string;
  validity: ValidityId;
}

export const DEDUCTION_TYPES: DeductionTypeDef[] = [
  {
    id: "trade-promo",
    label: "Trade or promotional",
    validatedBy: "Sales and Finance",
    window: "Varies by program. Act inside the retailer window.",
    backup: [
      "Promotional agreement or trade calendar",
      "Invoice and purchase order",
      "Proof the event was not already billed back",
    ],
    rootCause:
      "Keep one source of truth for promo terms and match every claim to an agreement before clearing it.",
    validity: "needs-research",
  },
  {
    id: "shortage",
    label: "Shortage or OS&D",
    validatedBy: "Supply Chain and Logistics",
    window: "Commonly 30 to 90 days by retailer.",
    backup: [
      "Proof of delivery, receiver signed",
      "Bill of lading, carrier signed",
      "ASN and packing list",
      "Photos of pallets with visible counts",
    ],
    rootCause:
      "Photograph pallets with visible counts, tighten ASN accuracy, and keep proof of delivery retrievable.",
    validity: "often-disputable",
  },
  {
    id: "pricing",
    label: "Pricing discrepancy",
    validatedBy: "Sales and Finance",
    window: "Commonly 30 to 90 days by retailer.",
    backup: ["Pricing agreement or cost file", "Invoice and purchase order", "Cost change effective dates"],
    rootCause:
      "Run disciplined price-change management and sync item and cost files with the retailer before the deal window opens.",
    validity: "often-disputable",
  },
  {
    id: "compliance",
    label: "Compliance or OTIF chargeback",
    validatedBy: "Logistics and Supply Chain",
    window: "Commonly 30 to 90 days by retailer.",
    backup: [
      "Routing guide confirmation",
      "ASN transmission log",
      "Carton label (GS1-128) sample",
      "Delivery appointment and arrival record",
    ],
    rootCause:
      "Operationalize each retailer vendor compliance guide and watch on-time in-full before it becomes a chargeback.",
    validity: "needs-research",
  },
  {
    id: "returns",
    label: "Returns or unsaleables",
    validatedBy: "Customer Experience and Quality",
    window: "Commonly 30 to 60 days by retailer.",
    backup: ["Return authorization", "Proof of receipt", "Photos or disposition record"],
    rootCause:
      "Define what counts as unsaleable and authorize returns before product ships back.",
    validity: "needs-research",
  },
  {
    id: "freight",
    label: "Freight or accessorial",
    validatedBy: "Logistics",
    window: "Commonly 30 to 90 days by retailer.",
    backup: ["Bill of lading", "Carrier invoice and tariff", "Detention or appointment records"],
    rootCause: "Audit carrier invoices against the contract and log detention at the dock.",
    validity: "often-disputable",
  },
];

/* --------------------------------------------------------------------------
 * Step 3 — Collect the right case details (dynamic field sets)
 * ------------------------------------------------------------------------ */

export const FIELD_SETS: Record<FieldSetId, FieldDef[]> = {
  order: [
    { name: "account", label: "Account name", type: "text", placeholder: "Regional Retail Partner" },
    { name: "contact", label: "Contact name", type: "text", placeholder: "Full name" },
    { name: "email", label: "Email", type: "email", placeholder: "name@company.com" },
    { name: "phone", label: "Phone", type: "tel", optional: true, placeholder: "Optional" },
    { name: "po", label: "PO number", type: "text", optional: true, placeholder: "PO-000000" },
    { name: "order", label: "Order number", type: "text", optional: true, placeholder: "SO-000000" },
    { name: "invoice", label: "Invoice number", type: "text", optional: true, placeholder: "If available" },
    { name: "sku", label: "SKU or product", type: "text", placeholder: "Buldak 2x Spicy, cup" },
    { name: "qty", label: "Case quantity affected", type: "number", optional: true, placeholder: "0" },
    { name: "requestedDate", label: "Requested delivery date", type: "date", optional: true },
    { name: "description", label: "Issue description", type: "textarea", placeholder: "Describe what happened and what you need." },
  ],
  pricing: [
    { name: "account", label: "Account name", type: "text", placeholder: "Regional Retail Partner" },
    { name: "promo", label: "Promo name or agreement reference", type: "text", optional: true, placeholder: "Q3 Feature, AG-0000" },
    { name: "expectedPrice", label: "Expected price", type: "text", placeholder: "$0.00 per case" },
    { name: "invoicePrice", label: "Invoice price", type: "text", placeholder: "$0.00 per case" },
    { name: "sku", label: "SKU", type: "text", placeholder: "Buldak 2x Spicy, cup" },
    { name: "effectiveDate", label: "Effective date", type: "date", optional: true },
    { name: "proof", label: "Attach proof", type: "file", optional: true },
    { name: "notes", label: "Notes", type: "textarea", optional: true, placeholder: "Anything that helps confirm the correct price." },
  ],
  shortship: [
    { name: "po", label: "PO number", type: "text", placeholder: "PO-000000" },
    { name: "orderedQty", label: "Ordered quantity", type: "number", placeholder: "0" },
    { name: "receivedQty", label: "Received quantity", type: "number", placeholder: "0" },
    { name: "deliveryDate", label: "Delivery date", type: "date", optional: true },
    { name: "carrier", label: "Warehouse or carrier", type: "text", optional: true, placeholder: "If known" },
    { name: "photos", label: "Attach photos or documents", type: "file", optional: true },
    { name: "notes", label: "Notes", type: "textarea", optional: true, placeholder: "Describe the shortage or damage." },
  ],
  consumer: [
    { name: "product", label: "Product name", type: "text", placeholder: "Buldak 2x Spicy" },
    { name: "lot", label: "Lot code", type: "text", optional: true, placeholder: "Optional, on the package" },
    { name: "store", label: "Store purchased from", type: "text", optional: true, placeholder: "Store or website" },
    { name: "purchaseDate", label: "Purchase date", type: "date", optional: true },
    { name: "description", label: "Question or concern", type: "textarea", placeholder: "Tell us what you would like help with." },
  ],
  generic: [
    { name: "account", label: "Account or team name", type: "text", optional: true, placeholder: "Account, team, or requester" },
    { name: "contact", label: "Contact name", type: "text", placeholder: "Full name" },
    { name: "email", label: "Email", type: "email", placeholder: "name@company.com" },
    { name: "reference", label: "Reference (SKU, account, or ID)", type: "text", optional: true, placeholder: "Optional" },
    { name: "description", label: "Description", type: "textarea", placeholder: "Describe what you need and any detail that helps route it." },
  ],
};

/** Fields whose values become the "Affected product" line on the summary. */
export const PRODUCT_FIELDS = ["sku", "product", "reference"];
/** Fields that populate the order / invoice reference line on the summary. */
export const REFERENCE_FIELDS = ["po", "order", "invoice", "promo"];
