/**
 * Customer Master study — 168 Market, Rowland Heights.
 *
 * WHAT THIS IS: a self-directed SAP SD exercise. It reconstructs the customer
 * master, material master, condition records, EDI map, and account performance
 * a Customer Experience manager reads every day for a trade account.
 *
 * HONESTY (non-negotiable):
 *  - 168 Market is a real Southern California grocery retailer, used here only
 *    as a realistic archetype for a trade account.
 *  - ONLY the store name and its public street address are real.
 *  - Every account number, partner function, credit limit, payment term,
 *    pricing condition, material number, GS1 code, metric, and deduction below
 *    is INVENTED for this exercise.
 *  - No relationship, contract, order, or account between Samyang America and
 *    168 Market is represented or implied.
 *  - No real SAP system was accessed. This is not an SAP implementation.
 */

/** A single labeled field on a master-data view. */
export interface MasterField {
  label: string;
  value: string;
  /** Why a CX manager reads this field. */
  note?: string;
  /** Glossary term id in data/sapsd.ts, if this field has one. */
  term?: string;
}

export interface MasterSection {
  id: string;
  title: string;
  /** What this view is for, in plain language. */
  purpose: string;
  fields: MasterField[];
  /** The line a CX manager should be watching on this view. */
  cxWatch: string;
}

export const CUSTOMER_MASTER_DISCLOSURE =
  "A self-directed SAP SD exercise. 168 Market is a real Southern California grocery banner; only its name and public address are real, and the account figures are modeled. No relationship with Samyang America is implied.";

/* -------------------------------------------------------------------------- */
/* Account header                                                             */
/* -------------------------------------------------------------------------- */

export const ACCOUNT = {
  name: "168 Market",
  location: "Rowland Heights, California",
  archetype: "Regional Asian grocery chain, retail grocery channel",
  soldToNumber: "0001680000",
  accountType: "Retail chain (multi-store, central buying, store-level delivery)",
  publicAddress: "19725 Colima Rd Unit 103, Rowland Heights, CA 91748",
  addressNote: "Public store address; the account figures are modeled.",
};

/* -------------------------------------------------------------------------- */
/* Partner functions — the reason "the customer" is never just one party      */
/* -------------------------------------------------------------------------- */

export interface PartnerFunction {
  /** SAP partner function code. */
  code: string;
  name: string;
  account: string;
  party: string;
  address: string;
  /** What this party is actually responsible for. */
  responsibility: string;
  /** What goes wrong when CX assumes this party is the same as another. */
  failureMode: string;
  term: string;
}

export const PARTNER_FUNCTIONS: PartnerFunction[] = [
  {
    code: "AG",
    name: "Sold-to party",
    account: "0001680000",
    party: "168 Market, central buying office",
    address: "Corporate buying office, Southern California (address not represented)",
    responsibility:
      "Places the order and holds the commercial agreement. This is who is legally buying, and whose terms and promotional agreements govern the deal.",
    failureMode:
      "Sending a pricing question to the store instead of the buying office. The store cannot answer for terms it did not negotiate.",
    term: "sold-to",
  },
  {
    code: "WE",
    name: "Ship-to party",
    account: "0001680103",
    party: "168 Market, Rowland Heights store",
    address: "19725 Colima Rd Unit 103, Rowland Heights, CA 91748 (public store address)",
    responsibility:
      "Receives the physical goods. Owns the receiving window, the dock, and the must-arrive-by date the carrier has to hit.",
    failureMode:
      "A purchase order that names a ship-to not on the customer master. If it is not caught at intake, the load goes to the wrong dock and the retailer charges back the freight.",
    term: "ship-to",
  },
  {
    code: "RE",
    name: "Bill-to party",
    account: "0001680900",
    party: "168 Market, central accounts payable",
    address: "Central AP office (address not represented)",
    responsibility:
      "Receives the invoice. Central AP reconciles the invoice against the purchase order and the receiving record before anything is scheduled to pay.",
    failureMode:
      "Invoicing the store. The store has no AP function, the invoice ages unpaid, and the account looks delinquent when it is only misrouted.",
    term: "bill-to",
  },
  {
    code: "RG",
    name: "Payer",
    account: "0001680900",
    party: "168 Market, central accounts payable",
    address: "Central AP office (address not represented)",
    responsibility:
      "Actually pays, carries the credit limit, and is the party that takes a deduction when it short-pays an invoice.",
    failureMode:
      "Chasing a deduction with the buyer instead of the payer. The reason code and the remittance advice live with the payer, not with the person who placed the order.",
    term: "payer",
  },
];

/* -------------------------------------------------------------------------- */
/* Customer master views                                                      */
/* -------------------------------------------------------------------------- */

export const GENERAL_DATA: MasterSection = {
  id: "general",
  title: "General data",
  purpose:
    "Shared across every company code and sales area. The identity of the account: who they are, where they are, and how we reach them.",
  cxWatch:
    "The ship-to addresses stored here are the only destinations an order can legally confirm to. If a purchase order names a location that is not on this view, the order should stop at intake, not at the dock.",
  fields: [
    { label: "Customer number (sold-to)", value: "0001680000", term: "customer-master" },
    { label: "Name", value: "168 Market" },
    { label: "Search term", value: "168MKT" },
    { label: "Account group", value: "0001 Sold-to party", term: "partner-function" },
    { label: "Country / region", value: "US / CA" },
    { label: "Store ship-to on file", value: "0001680103 Rowland Heights", note: "One of several store ship-to locations on this account in the exercise.", term: "ship-to" },
    { label: "Store address", value: "19725 Colima Rd Unit 103, Rowland Heights, CA 91748", note: "Public store address; the account figures are modeled." },
    { label: "Industry", value: "Retail grocery" },
    { label: "Tax number type", value: "US resale certificate on file" },
    { label: "Created / last changed", value: "Modeled record" },
  ],
};

export const COMPANY_CODE_DATA: MasterSection = {
  id: "company",
  title: "Company code data",
  purpose:
    "The accounting relationship. How this customer posts to the general ledger, what credit they carry, and when they are expected to pay.",
  cxWatch:
    "Payment terms are the deduction battlefield. If the account takes a 2 percent discount after day 10, that is an unearned discount deduction, and it is a CX conversation before it is a Finance write-off.",
  fields: [
    { label: "Company code", value: "1000 Samyang America" },
    { label: "Reconciliation account", value: "140000 Trade receivables", note: "The GL account every invoice for this customer posts against.", term: "reconciliation-account" },
    { label: "Terms of payment", value: "0002  ·  2% 10, Net 30", note: "2 percent discount if paid within 10 days, otherwise the full amount is due in 30.", term: "payment-terms" },
    { label: "Payment methods", value: "ACH, check" },
    { label: "Credit control area", value: "1000", term: "credit-control-area" },
    { label: "Risk category", value: "002 Low risk" },
    { label: "Credit limit", value: "$250,000", term: "credit-limit" },
    { label: "Credit exposure", value: "$86,400", note: "Open orders plus open receivables. When exposure passes the limit, new orders take a credit block." },
    { label: "Credit available", value: "$163,600" },
    { label: "Dunning procedure", value: "0001 Standard", term: "dunning" },
    { label: "Days sales outstanding", value: "34 days", term: "dso" },
  ],
};

export const SALES_AREA_DATA: MasterSection = {
  id: "salesarea",
  title: "Sales area data",
  purpose:
    "How this customer buys from this selling unit. The sales area is the combination of sales organization, distribution channel, and division, and it drives pricing, shipping, and billing defaults on every order.",
  cxWatch:
    "Customer pricing procedure and price list decide which condition records are even eligible to fire. When a promo does not apply, this view is the second place to look, right after the condition record validity dates.",
  fields: [
    { label: "Sales organization", value: "1000 Samyang America", term: "sales-org" },
    { label: "Distribution channel", value: "10 Retail grocery", term: "distribution-channel" },
    { label: "Division", value: "10 Noodles", term: "division" },
    { label: "Sales district", value: "US-SOCAL" },
    { label: "Customer group", value: "01 Retail chain", term: "customer-group" },
    { label: "Price group", value: "02 Regional chain" },
    { label: "Customer pricing procedure", value: "1 Standard", note: "Together with the document pricing procedure, this determines which pricing procedure runs on the order.", term: "customer-pricing-procedure" },
    { label: "Price list type", value: "02 Wholesale", term: "price-list" },
    { label: "Delivery priority", value: "02 Standard" },
    { label: "Shipping conditions", value: "02 Standard ground" },
    { label: "Delivering plant", value: "1710 Southern California DC", term: "delivering-plant" },
    { label: "Shipping point", value: "1710", term: "shipping-point" },
    { label: "Complete delivery required", value: "No", note: "The account accepts partial shipments, which is why a short line does not automatically block the whole order.", term: "complete-delivery" },
    { label: "Partial delivery per item", value: "B  ·  Partial allowed, limited number of deliveries", term: "partial-delivery" },
    { label: "Order combination", value: "Allowed", term: "order-combination" },
    { label: "Incoterms", value: "FOB Origin  ·  Rowland Heights, CA", note: "Title and risk pass at our dock, which decides who owns a transit damage claim.", term: "incoterms" },
    { label: "Tax classification", value: "0 Exempt", note: "Grocery food for home consumption is generally exempt from California sales tax.", term: "tax-classification" },
    { label: "Account assignment group", value: "01 Domestic revenue", term: "account-assignment-group" },
  ],
};

/* -------------------------------------------------------------------------- */
/* Material master                                                            */
/* -------------------------------------------------------------------------- */

export const MATERIAL_MASTER: MasterSection = {
  id: "material",
  title: "Material master",
  purpose:
    "The stored record of the product being ordered. Sales, shipping, and billing all read different views of this same material, which is why one wrong unit of measure ripples all the way to the invoice.",
  cxWatch:
    "Units of measure. The retailer orders cases, the warehouse picks cases, and the invoice must bill cases. A base unit of eaches with a sales unit of cases is correct, but only if the conversion is right. An 8 versus 6 pack error is an instant shortage claim.",
  fields: [
    { label: "Material number", value: "100004521", term: "material-master" },
    { label: "Description", value: "Buldak Carbonara, Multi (5-pack)" },
    { label: "Material type", value: "FERT Finished good" },
    { label: "Material group", value: "NDL01 Stir-fry noodles", term: "material-group" },
    { label: "Division", value: "10 Noodles" },
    { label: "Base unit of measure", value: "EA Each", term: "base-uom" },
    { label: "Sales unit of measure", value: "CS Case", term: "sales-uom" },
    { label: "Unit conversion", value: "1 CS = 8 EA", note: "The single most important number on this view for a shortage dispute.", term: "case-pack" },
    { label: "Case GTIN-14", value: "Synthetic placeholder, not a real GS1 code", term: "gtin" },
    { label: "Consumer GTIN-12 (UPC)", value: "Synthetic placeholder, not a real GS1 code", term: "gtin" },
    { label: "Plant", value: "1710 Southern California DC" },
    { label: "Storage location", value: "0001 Ambient", term: "storage-location" },
    { label: "Availability check group", value: "02 Individual requirements", note: "Drives the ATP result and therefore the schedule line the customer is promised.", term: "availability-check" },
    { label: "Loading group", value: "0003 Palletized" },
    { label: "Gross / net weight per case", value: "6.4 lb / 5.9 lb" },
    { label: "Total shelf life", value: "365 days" },
    { label: "Minimum remaining shelf life", value: "180 days", note: "The retailer rejects receipt below this. A short-dated pallet is a refusal and a freight charge, not a discount conversation." },
  ],
};

/* -------------------------------------------------------------------------- */
/* Pricing condition records                                                  */
/* -------------------------------------------------------------------------- */

export type ConditionStatus = "active" | "expired" | "scheduled";

export interface ConditionRecord {
  conditionType: string;
  description: string;
  amount: string;
  basis: string;
  validFrom: string;
  validTo: string;
  status: ConditionStatus;
  note: string;
}

export const CONDITION_RECORDS: ConditionRecord[] = [
  {
    conditionType: "PR00",
    description: "Base price",
    amount: "$42.00",
    basis: "per 1 CS",
    validFrom: "2026-01-01",
    validTo: "9999-12-31",
    status: "active",
    note: "The list price the whole calculation starts from.",
  },
  {
    conditionType: "K007",
    description: "Customer discount",
    amount: "3.0%",
    basis: "of base price",
    validFrom: "2026-01-01",
    validTo: "9999-12-31",
    status: "active",
    note: "Negotiated account discount. Applies to every line for this sold-to.",
  },
  {
    conditionType: "K005",
    description: "Customer / material discount",
    amount: "$1.50",
    basis: "per 1 CS",
    validFrom: "2026-01-01",
    validTo: "9999-12-31",
    status: "active",
    note: "A discount tied to this account and this material together, not to either one alone.",
  },
  {
    conditionType: "ZPRO",
    description: "Promotional allowance (June feature)",
    amount: "$4.00",
    basis: "per 1 CS",
    validFrom: "2026-06-01",
    validTo: "2026-06-30",
    status: "expired",
    note: "The lapsed condition. The retailer built a July ad around this price, the record expired on June 30, and the order billed without it. This is the root cause behind the deduction below.",
  },
  {
    conditionType: "KF00",
    description: "Freight",
    amount: "$0.00",
    basis: "prepaid",
    validFrom: "2026-01-01",
    validTo: "9999-12-31",
    status: "active",
    note: "Consistent with FOB Origin, prepaid and added. Freight is not billed as a separate line to this account.",
  },
  {
    conditionType: "MWST",
    description: "Output tax",
    amount: "0.0%",
    basis: "exempt",
    validFrom: "2026-01-01",
    validTo: "9999-12-31",
    status: "active",
    note: "Tax classification 0 on the sales area view. Grocery food for home consumption.",
  },
];

/** The arithmetic a manager should be able to do out loud, in front of a buyer. */
export const PRICE_WALKTHROUGH = {
  lines: [
    { label: "PR00 base price", value: "$42.00", running: "$42.00" },
    { label: "K007 customer discount, 3.0%", value: "less $1.26", running: "$40.74" },
    { label: "K005 customer / material discount", value: "less $1.50", running: "$39.24" },
    { label: "ZPRO promotional allowance (expired)", value: "less $0.00", running: "$39.24" },
    { label: "MWST output tax, exempt", value: "$0.00", running: "$39.24" },
  ],
  billed: "$39.24 per case",
  expected: "$35.24 per case",
  gap: "$4.00 per case",
  explanation:
    "The retailer expected $35.24 because the June promotional allowance was in their ad plan. The condition record expired on June 30 and the order priced on July 2, so ZPRO never fired. The invoice is arithmetically correct and commercially wrong. That distinction is the entire job: the system did what it was told, and nobody told it the right thing.",
};

/* -------------------------------------------------------------------------- */
/* Sales document types and the transactions a manager actually opens         */
/* -------------------------------------------------------------------------- */

export interface DocType {
  code: string;
  name: string;
  purpose: string;
}

export const DOC_TYPES: DocType[] = [
  { code: "OR", name: "Standard order", purpose: "The normal sales order created from the retailer's purchase order." },
  { code: "LF", name: "Outbound delivery", purpose: "The instruction to the warehouse to pick, pack, and ship the confirmed quantities." },
  { code: "F2", name: "Invoice", purpose: "The billing document created from the delivery. It posts to accounting and goes to the bill-to party." },
  { code: "RE", name: "Returns order", purpose: "A sales document for goods coming back, which can trigger a credit and a quality review." },
  { code: "CR", name: "Credit memo request", purpose: "A request to credit the customer. It carries a billing block until it is approved." },
  { code: "G2", name: "Credit memo", purpose: "The posted credit that actually reduces what the customer owes." },
  { code: "DR", name: "Debit memo request", purpose: "A request to bill the customer more, for example an unearned discount taken back." },
  { code: "L2", name: "Debit memo", purpose: "The posted debit." },
];

export interface Tcode {
  code: string;
  name: string;
  why: string;
}

/** Transaction codes a CX manager reads, not ones a consultant configures. */
export const TCODES: Tcode[] = [
  { code: "VA01 / VA02 / VA03", name: "Create / change / display sales order", why: "Read the pricing breakdown and the schedule lines on a disputed order." },
  { code: "VA05", name: "List of sales orders", why: "See every open order for the account, and which are blocked." },
  { code: "VL01N / VL02N", name: "Create / change outbound delivery", why: "Confirm what actually shipped against what was promised." },
  { code: "VF01 / VF03", name: "Create / display billing document", why: "Trace an invoice back to the delivery and the goods issue it came from." },
  { code: "VK11 / VK12 / VK13", name: "Create / change / display condition record", why: "Check whether a promotional condition was live on the order date. This is where the lapsed ZPRO shows up." },
  { code: "XD03 / BP", name: "Display customer master", why: "Verify the ship-to and the partner functions before an order is corrected." },
  { code: "MM03", name: "Display material master", why: "Confirm the case pack and unit conversion behind a shortage claim." },
  { code: "VKM1", name: "Blocked sales documents (credit)", why: "See which orders are sitting on a credit block, and how long they have been there." },
  { code: "FBL5N", name: "Customer line items", why: "Read the open invoices, the short-pays, and the aging on the payer account." },
  { code: "VF04", name: "Billing due list", why: "Catch deliveries that shipped but never billed." },
];

/* -------------------------------------------------------------------------- */
/* EDI map (SPS Commerce or a comparable platform)                            */
/* -------------------------------------------------------------------------- */

export type EdiDirection = "inbound" | "outbound" | "both";

export interface EdiTransaction {
  code: string;
  name: string;
  direction: EdiDirection;
  purpose: string;
  cxWatch: string;
}

export const EDI_TRANSACTIONS: EdiTransaction[] = [
  { code: "850", name: "Purchase order", direction: "inbound", purpose: "The retailer's order arrives as structured data instead of an email.", cxWatch: "Every line must map to a material and a valid ship-to. An unmapped item number is a failed order, not a small formatting issue." },
  { code: "855", name: "Purchase order acknowledgment", direction: "outbound", purpose: "We confirm what we accepted, what we changed, and what we could not fill.", cxWatch: "A missing or late 855 is how a retailer finds out about a short at the dock instead of at their desk." },
  { code: "860", name: "Purchase order change", direction: "inbound", purpose: "The retailer revises quantity, date, or ship-to after the original order.", cxWatch: "A change that arrives after the delivery is created has to be handled by a person, not a rule." },
  { code: "856", name: "Advance ship notice (ASN)", direction: "outbound", purpose: "Tells the retailer exactly what is on the truck, down to the pallet label.", cxWatch: "An inaccurate ASN is one of the most reliably charged-back documents in retail. The SSCC on the pallet has to match the ASN." },
  { code: "810", name: "Invoice", direction: "outbound", purpose: "The invoice, transmitted rather than mailed.", cxWatch: "It must reconcile to the goods issue quantity. Bill from the delivery, never from the order." },
  { code: "812", name: "Credit / debit adjustment", direction: "inbound", purpose: "The retailer's formal notice of a deduction, carrying a reason code.", cxWatch: "This is where a deduction first becomes visible. No reason code means no pattern, and no pattern means it repeats." },
  { code: "820", name: "Remittance advice", direction: "inbound", purpose: "Tells us what they actually paid and what they held back.", cxWatch: "Reconcile remittance against open invoices the day it lands. Aged deductions are far harder to win." },
  { code: "846", name: "Inventory inquiry / advice", direction: "outbound", purpose: "Shares availability with the trading partner.", cxWatch: "Stale availability data drives orders we cannot fill." },
  { code: "852", name: "Product activity data", direction: "inbound", purpose: "Store-level sell-through and on-hand.", cxWatch: "The earliest honest signal that a promotion is working or that a store is about to run out." },
  { code: "997", name: "Functional acknowledgment", direction: "both", purpose: "Confirms a transmission was received and parsed.", cxWatch: "A missing 997 means the document never landed. Silence is not acceptance." },
];

export const EDI_IDENTIFIERS: MasterField[] = [
  { label: "Platform", value: "SPS Commerce or comparable EDI network", term: "sps-commerce" },
  { label: "Trading partner ID", value: "Synthetic, not a real qualifier or ID" },
  { label: "Vendor number at retailer", value: "Synthetic" },
  { label: "GLN (global location number)", value: "Synthetic placeholder, not a real GS1 code", term: "gtin" },
  { label: "SSCC-18 (pallet label)", value: "Synthetic placeholder, not a real GS1 code", term: "sscc" },
  { label: "Must-arrive-by date (MABD)", value: "Enforced by this retailer", note: "Missing the MABD window is charged back even when the goods are perfect.", term: "mabd" },
];

/* -------------------------------------------------------------------------- */
/* Account performance                                            */
/* -------------------------------------------------------------------------- */

export interface AccountMetric {
  label: string;
  value: string;
  target: string;
  /** True when the metric meets or beats target. Rendered with a word + glyph. */
  meets: boolean;
  note: string;
  term?: string;
}

export const ACCOUNT_METRICS: AccountMetric[] = [
  { label: "Case fill rate", value: "96.4%", target: "98.0%", meets: false, note: "Cases shipped against cases ordered. The gap is concentrated in one short-dated pack size.", term: "fill-rate" },
  { label: "On-time in-full (OTIF)", value: "92.1%", target: "95.0%", meets: false, note: "Both halves have to be true on the same order. Most of the loss here is the in-full half, not the on-time half.", term: "otif" },
  { label: "On-time delivery to MABD", value: "97.3%", target: "96.0%", meets: true, note: "The carrier is hitting the must-arrive-by window.", term: "mabd" },
  { label: "Order entry accuracy", value: "99.2%", target: "99.0%", meets: true, note: "Clean translation from EDI 850 to sales order without manual touch." },
  { label: "Invoice accuracy", value: "98.6%", target: "99.0%", meets: false, note: "The misses are pricing, not quantity. That points at condition records, not the warehouse." },
  { label: "Deduction rate", value: "1.9% of gross sales", target: "1.5% or less", meets: false, note: "Above target, and one reason code is driving most of it.", term: "deduction" },
  { label: "Average order cycle time", value: "3.2 days", target: "4.0 days or less", meets: true, note: "Purchase order receipt to goods issue." },
  { label: "Open deduction aging", value: "22 days", target: "30 days or less", meets: true, note: "Deductions are being worked before they age out of easy recovery." },
];

/* -------------------------------------------------------------------------- */
/* Deduction log                                                  */
/* -------------------------------------------------------------------------- */

export type DeductionStatus = "valid" | "invalid" | "under-review";

export interface DeductionRow {
  id: string;
  reasonCode: string;
  reason: string;
  amount: string;
  status: DeductionStatus;
  evidence: string;
  outcome: string;
  prevention: string;
}

export const DEDUCTION_LOG: DeductionRow[] = [
  {
    id: "D-2261",
    reasonCode: "22",
    reason: "Price discrepancy",
    amount: "$1,412.64",
    status: "valid",
    evidence: "Purchase order expected price, invoice price, and the ZPRO condition record showing a June 30 expiry against a July 2 order date.",
    outcome: "Credit memo request CR created, approved, posted as credit memo G2. Credited in full, because the retailer was right.",
    prevention: "Alert on any promotional condition record expiring inside the open order horizon. This one deduction is the whole business case for that alert.",
  },
  {
    id: "D-2288",
    reasonCode: "11",
    reason: "Shortage, short shipment claimed",
    amount: "$684.00",
    status: "invalid",
    evidence: "Goods issue quantity ties exactly to the invoice, and the proof of delivery is signed for the full pallet count with no exception noted.",
    outcome: "Disputed with the signed POD and the bill of lading. Repaid by the retailer on the following remittance.",
    prevention: "Legible PODs and accurate pallet counts at dispatch. This claim was winnable only because the paperwork was clean.",
  },
  {
    id: "D-2301",
    reasonCode: "41",
    reason: "Unsaleable, damage on arrival",
    amount: "$326.50",
    status: "valid",
    evidence: "Receiving photos, POD noted damage on two cases, carrier signed the exception.",
    outcome: "Credited the customer, and filed a separate carrier claim. FOB Origin means the freight claim is ours to pursue, not theirs.",
    prevention: "Trend damage by lane and by pallet configuration. Two cases on the same corner position is a stacking problem, not bad luck.",
  },
  {
    id: "D-2314",
    reasonCode: "55",
    reason: "Late delivery, must-arrive-by date missed",
    amount: "$520.00",
    status: "under-review",
    evidence: "Carrier trace against the MABD window, and the delivery appointment record.",
    outcome: "Under review. If the carrier missed the appointment we own it. If the appointment was never offered inside the window, the retailer owns it.",
    prevention: "Book the delivery appointment at order confirmation, not at ship. An unbooked appointment is a chargeback waiting to be written.",
  },
];

export const DEDUCTION_SUMMARY = {
  total: "$2,943.14",
  valid: "$1,739.14",
  invalid: "$684.00",
  underReview: "$520.00",
  read: "Two thirds of the disputed dollars trace to one lapsed condition record. That is not a deductions problem. It is a master-data governance problem wearing a deductions costume, and it is fixed upstream or not at all.",
};

/* -------------------------------------------------------------------------- */
/* Tab definitions                                                            */
/* -------------------------------------------------------------------------- */

export type CustomerMasterTabId =
  | "partners"
  | "general"
  | "company"
  | "salesarea"
  | "material"
  | "pricing"
  | "documents"
  | "edi"
  | "performance";

export const CUSTOMER_MASTER_TABS: { id: CustomerMasterTabId; label: string; glyph: string }[] = [
  { id: "partners", label: "Partner functions", glyph: "◆" },
  { id: "general", label: "General data", glyph: "▤" },
  { id: "company", label: "Company code", glyph: "▥" },
  { id: "salesarea", label: "Sales area", glyph: "▦" },
  { id: "material", label: "Material master", glyph: "▧" },
  { id: "pricing", label: "Pricing conditions", glyph: "◎" },
  { id: "documents", label: "Documents", glyph: "▩" },
  { id: "edi", label: "EDI and compliance", glyph: "▨" },
  { id: "performance", label: "Account performance", glyph: "▲" },
];
