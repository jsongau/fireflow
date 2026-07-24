/**
 * Glossary dictionaries for the shared <GlossaryTerm> hover primitive.
 *
 * Wave A ships the KPI dictionary (service metrics used across the intake flow
 * and the Command Center). Later waves add `sap`, `edi`, and `obangsaek`
 * dictionaries against this same shape. Definitions are concise, plain American
 * English, and industry-general (see docs/recommendations/01 and 05 for sources).
 * No arrows or em-dash separators in copy.
 */

export interface GlossaryEntry {
  /** Short definition shown in the tooltip body. */
  short: string;
}

export type GlossaryDict = Record<string, GlossaryEntry>;

/** Keyed by the exact metric label used in the intake taxonomy. */
export const KPI_GLOSSARY: GlossaryDict = {
  "Service Level": {
    short:
      "The probability that stock is available during an order cycle. A forward-looking planning target, commonly 95 percent or higher. Distinct from fill rate.",
  },
  "Fill Rate": {
    short:
      "The share of cases or lines shipped complete on the first order. CPG teams often target 95 to 98 percent.",
  },
  "On Time Fulfillment": {
    short:
      "Whether orders ship and arrive inside the promised window. Feeds the retailer OTIF (on time in full) scorecard.",
  },
  CSAT: {
    short:
      "Customer satisfaction, measured as positive responses divided by total responses. Good is roughly 75 to 84 percent; strong programs reach 85 percent and up.",
  },
  "Deduction Aging": {
    short:
      "How long open deductions sit before they are resolved, tracked as Days Deductions Outstanding. Lower is better; many teams target under 20 days, because dispute windows expire.",
  },
  "Billing Accuracy": {
    short:
      "The share of invoices that match the order and terms on the first pass. A leading indicator that prevents deductions.",
  },
  "Case Resolution Time": {
    short:
      "The time from first contact to a closed case, tracked by age buckets so nothing quietly ages out.",
  },
  "Data Integrity": {
    short:
      "Whether master data (accounts, items, pricing, ship-to) is complete and correct, so orders and invoices flow without exceptions.",
  },
};

/**
 * SAP SD reference terms. Conceptual only: FireFlow is an SAP SD aligned workflow
 * study, not a live system and not a claim of implementation experience.
 * Keyed by the exact reference string used in the intake taxonomy.
 */
export const SAP_GLOSSARY: GlossaryDict = {
  VA03: {
    short:
      "Display a sales order in SAP SD. The order header carries the parties and terms; items carry material, quantity, and price; schedule lines carry the delivery date.",
  },
  "VA01 (CR)": {
    short:
      "Create a credit memo request (document type CR) with reference to the original order or invoice. It reduces the receivable once billed.",
  },
  VK13: {
    short:
      "Display a pricing condition record. A pricing mismatch is usually a missing, expired, or incorrect condition record, not a code defect.",
  },
  VL03N: {
    short:
      "Display an outbound delivery. Picked quantity versus ordered quantity is where a short shipment first becomes visible.",
  },
  VF03: {
    short:
      "Display a billing document. To research an invoice dispute you compare the invoice against the delivery and the original order.",
  },
  "BP / KNVP": {
    short:
      "The customer master (Business Partner) and its partner functions: sold-to, ship-to, bill-to, and payer. A wrong invoice recipient is a partner function issue.",
  },
  ATP: {
    short:
      "Available-to-promise. The availability check that runs at the schedule-line level and confirms whether a requested delivery date can be met.",
  },
  IDoc: {
    short:
      "The document container SAP uses for EDI. An inbound ORDERS IDoc creates the sales order; a failed one is an order-entry failure before an order exists.",
  },
};

/**
 * Retail EDI (ANSI X12) reference terms. General standard facts; any document
 * numbers shown in FireFlow are synthetic.
 */
export const EDI_GLOSSARY: GlossaryDict = {
  "850 Purchase Order": {
    short:
      "The electronic purchase order the retailer sends to start an order. An ERP cannot read raw EDI, so a translator maps it into a sales order.",
  },
  "855 PO Acknowledgment": {
    short:
      "The supplier's reply to an 850, stating whether the order is accepted, rejected, or accepted with changes.",
  },
  "856 ASN": {
    short:
      "Advance ship notice, an electronic packing slip sent before the goods arrive. A late, missing, or mismatched ASN is the largest single driver of compliance chargebacks.",
  },
  "810 Invoice": {
    short:
      "The electronic invoice. It must reconcile to both the 850 purchase order and the 856 ASN, or the retailer short-pays.",
  },
  "820 Remittance": {
    short:
      "The payment and remittance advice: which invoices are being paid, and what deductions were taken against them.",
  },
  "846 Inventory Advice": {
    short:
      "Communicates available inventory levels and availability dates to the trading partner.",
  },
  "997 Functional Acknowledgment": {
    short:
      "A technical receipt confirmation that a file arrived and parsed. A missing or negative 997 is a silent failure that surfaces later as a missed order.",
  },
  "SPS Commerce": {
    short:
      "The largest retail EDI network. It holds each retailer's maps and compliance rules, so suppliers do not build and maintain a connection per partner.",
  },
  "GS1-128 label": {
    short:
      "The carton label (formerly UCC-128) encoding an SSCC. Receiving scans it and matches it to the ASN. A mismatch triggers a chargeback.",
  },
};

/**
 * Obangsaek (오방색), Korea's five traditional "five direction colors," from
 * eumyang-ohaeng (yin-yang and the five elements). Sources: Korea.net / KOCIS
 * and the Korean Cultural Center webzine (see docs/recommendations/05).
 *
 * Accuracy notes kept deliberately: in Korean one word historically covers blue
 * and green, so cheong spans a blue-green range. The red slot is attested as
 * both jeok and hong; jeok is the more common obangsaek term.
 */
export interface ObangsaekEntry extends GlossaryEntry {
  hangul: string;
  direction: string;
  element: string;
  season?: string;
}

export const OBANGSAEK: Record<string, ObangsaekEntry> = {
  Cheong: {
    hangul: "청",
    direction: "East",
    element: "Wood",
    season: "Spring",
    short:
      "Blue-green. East, wood, spring. Youth, vitality, growth, and new life. In Korean one word historically covers blue and green, so cheong spans both.",
  },
  Jeok: {
    hangul: "적",
    direction: "South",
    element: "Fire",
    season: "Summer",
    short:
      "Red, also attested as hong. South, fire, summer. Passion, energy, and life force, and a color believed to ward off evil.",
  },
  Hwang: {
    hangul: "황",
    direction: "Center",
    element: "Earth",
    short:
      "Yellow. The center, earth. Nobility and sacredness, historically reserved for the emperor's robes.",
  },
  Baek: {
    hangul: "백",
    direction: "West",
    element: "Metal",
    season: "Autumn",
    short:
      "White. West, metal, autumn. Purity, innocence, and truth. Koreans have long been called the white-clad people.",
  },
  Heuk: {
    hangul: "흑",
    direction: "North",
    element: "Water",
    season: "Winter",
    short:
      "Black. North, water, winter. Wisdom and human intellect, rest, and the end of a cycle.",
  },
};
