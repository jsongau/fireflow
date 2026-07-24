/**
 * Data-architecture study layer — dimensional model + integration map.
 *
 * Two studies live here, both aligned to standard practice and both synthetic:
 *
 *  1. STAR_SCHEMA — a dimensional model of the FireFlow CX domain. Fact tables
 *     are pinned to the grain of one operational event; product, account, and
 *     date are conformed dimensions shared across facts. Each table records the
 *     FireFlow data it was modeled from (families, variants, skus, caseBoard,
 *     escalation, customerMaster), so the model reads as derived from the app,
 *     not invented in a vacuum.
 *
 *  2. INTEGRATION_MAP — the systems one order-to-cash record is assembled from
 *     (ERP/SAP SD, CRM, EDI, the web/marketing surface, the analytics warehouse)
 *     and the data objects that move between them, each with its pattern,
 *     cadence, failure mode, and owner.
 *
 * Honesty guardrail: this is a modeling and integration STUDY aligned to
 * dimensional-modeling and EDI/ERP practice. It is not a deployed warehouse, a
 * live pipeline, or a Samyang schema. Every table, column, measure, feed, and
 * volume is illustrative and labeled synthetic. No real Samyang data.
 */

/* ------------------------------------------------------------------ */
/* 1. Dimensional model (star schema)                                  */
/* ------------------------------------------------------------------ */

export type TableKind = "fact" | "dimension";

/** The role a column plays in the dimensional model. */
export type ColumnRole = "pk" | "fk" | "measure" | "attribute" | "degenerate";

/** Display metadata for each column role. Glyph + word, never color alone. */
export const COLUMN_ROLE_META: Record<ColumnRole, { label: string; glyph: string }> = {
  pk: { label: "Primary key", glyph: "◆" },
  fk: { label: "Foreign key", glyph: "◇" },
  measure: { label: "Measure", glyph: "▪" },
  attribute: { label: "Attribute", glyph: "·" },
  degenerate: { label: "Degenerate dimension", glyph: "◦" },
};

export interface ModelColumn {
  name: string;
  type: string;
  role: ColumnRole;
  note: string;
  /** For a foreign key, the id of the dimension table it references. */
  references?: string;
}

export interface ModelTable {
  id: string;
  /** Display name, snake_case like the physical table. */
  name: string;
  kind: TableKind;
  /** The single most important line: what one row means. */
  grain: string;
  purpose: string;
  /** The FireFlow data this table was modeled from. This part is real. */
  derivedFrom: string;
  columns: ModelColumn[];
}

/* --- Dimensions (conformed where they are shared) --- */

const DIM_DATE: ModelTable = {
  id: "dim_date",
  name: "dim_date",
  kind: "dimension",
  grain: "One row per calendar day.",
  purpose:
    "The shared time spine. Every fact joins here, so an order, a case, and a deduction for the same week line up without anyone parsing a timestamp.",
  derivedFrom: "Generated calendar, aligned to the fiscal periods the standards register already uses.",
  columns: [
    { name: "date_key", type: "int (yyyymmdd)", role: "pk", note: "Surrogate day key. Integer so joins stay fast and ranges are trivial." },
    { name: "calendar_date", type: "date", role: "attribute", note: "The actual date." },
    { name: "fiscal_period", type: "varchar", role: "attribute", note: "Period a finance close reads by." },
    { name: "iso_week", type: "int", role: "attribute", note: "Week number, for weekly fill-rate and aging rollups." },
    { name: "is_month_end", type: "boolean", role: "attribute", note: "Flags the days a deduction backlog gets scrutinized." },
  ],
};

const DIM_PRODUCT: ModelTable = {
  id: "dim_product",
  name: "dim_product",
  kind: "dimension",
  grain: "One row per orderable SKU (a format-level variant).",
  purpose:
    "The product a fact is about, at the format grain the operation actually ships, not the family a shopper names. Brand and category ride along as attributes.",
  derivedFrom: "families.ts (45 families) joined to variants.ts (76 formats) and skus.ts (orderable SKUs).",
  columns: [
    { name: "product_key", type: "int (surrogate)", role: "pk", note: "Surrogate key. Insulates the model from a SKU code being reissued." },
    { name: "sku", type: "varchar", role: "attribute", note: "Natural key, e.g. SY-BLDK-CARB-MULTI. The business's own code." },
    { name: "family", type: "varchar", role: "attribute", note: "Normalized family, e.g. Buldak Carbonara." },
    { name: "brand", type: "varchar", role: "attribute", note: "Buldak, Samyang, Tangle, or MEP." },
    { name: "category", type: "varchar", role: "attribute", note: "Noodle, sauce, snack, and so on." },
    { name: "format", type: "varchar", role: "attribute", note: "Multi, Big Bowl, Cup. The grain that carries allergens and case pack." },
    { name: "case_pack", type: "int", role: "attribute", note: "Retail units per case. Drives every case-to-unit conversion downstream." },
  ],
};

const DIM_ACCOUNT: ModelTable = {
  id: "dim_account",
  name: "dim_account",
  kind: "dimension",
  grain: "One row per trade account (sold-to, with ship-to as an attribute).",
  purpose:
    "The buyer a fact is about. The master-data study is the source: partner functions, sales area, and terms decide whether an order can even be clean.",
  derivedFrom: "customerMaster.ts (the account, partner functions, sales area, EDI setup, deduction history).",
  columns: [
    { name: "account_key", type: "int (surrogate)", role: "pk", note: "Surrogate key, so a re-numbered account does not orphan its history." },
    { name: "account_id", type: "varchar", role: "attribute", note: "Natural key, the ERP customer number." },
    { name: "account_type", type: "varchar", role: "attribute", note: "Retailer or distributor. Gates pricing and minimums." },
    { name: "sales_area", type: "varchar", role: "attribute", note: "Sales org, distribution channel, division. The order's pricing context." },
    { name: "payment_terms", type: "varchar", role: "attribute", note: "The terms a deduction dispute is argued against." },
    { name: "edi_capable", type: "boolean", role: "attribute", note: "Whether documents flow by EDI or by hand. Changes the failure modes." },
  ],
};

const DIM_CHANNEL: ModelTable = {
  id: "dim_channel",
  name: "dim_channel",
  kind: "dimension",
  grain: "One row per intake or order channel.",
  purpose:
    "How the order or case arrived. The channel is where a class of failure lives, so it earns a dimension instead of a buried column.",
  derivedFrom: "InquiryChannel plus the order and support intake channels in issues.ts.",
  columns: [
    { name: "channel_key", type: "int (surrogate)", role: "pk", note: "Surrogate key." },
    { name: "channel", type: "varchar", role: "attribute", note: "EDI, web portal, phone, or manual." },
    { name: "is_automated", type: "boolean", role: "attribute", note: "Automated intake fails silently; manual intake fails loudly. Different watch." },
  ],
};

const DIM_ISSUE_TYPE: ModelTable = {
  id: "dim_issue_type",
  name: "dim_issue_type",
  kind: "dimension",
  grain: "One row per case type or deduction reason code.",
  purpose:
    "What kind of problem a case or chargeback is. Carries the default severity and the SOP it routes into, so the fact stays thin.",
  derivedFrom: "issues.ts (case taxonomy) and escalation.ts (deduction reason codes, SOP register).",
  columns: [
    { name: "issue_type_key", type: "int (surrogate)", role: "pk", note: "Surrogate key." },
    { name: "reason_code", type: "varchar", role: "attribute", note: "The code Finance and the retailer both cite, e.g. a shortage or compliance code." },
    { name: "category", type: "varchar", role: "attribute", note: "Order, delivery, invoice, deduction, or product concern." },
    { name: "default_severity", type: "varchar", role: "attribute", note: "Standard, elevated, priority, or specialist. The starting triage." },
    { name: "requires_specialist", type: "boolean", role: "attribute", note: "Allergen, foreign material, and regulatory issues jump the ladder." },
    { name: "sop_id", type: "varchar", role: "attribute", note: "The procedure this type routes into. No type routes to an empty owner." },
  ],
};

const DIM_OWNER: ModelTable = {
  id: "dim_owner",
  name: "dim_owner",
  kind: "dimension",
  grain: "One row per CX team member or owning function.",
  purpose:
    "Who holds the work. A fact without an owner key is a case that ages in silence, so ownership is modeled, not left to a free-text field.",
  derivedFrom: "team.ts (roster, roles, approval limits) and the War Room ownership model.",
  columns: [
    { name: "owner_key", type: "int (surrogate)", role: "pk", note: "Surrogate key." },
    { name: "owner_name", type: "varchar", role: "attribute", note: "The person, or the function when it is a queue." },
    { name: "function", type: "varchar", role: "attribute", note: "CX, Sales, Supply Chain, Logistics, or Finance." },
    { name: "approval_limit_usd", type: "decimal(12,2)", role: "attribute", note: "The dollar line this owner can settle without escalating." },
  ],
};

/* --- Facts (each pinned to one grain) --- */

const FACT_ORDER_LINE: ModelTable = {
  id: "fact_order_line",
  name: "fact_order_line",
  kind: "fact",
  grain: "One row per SKU line on one purchase order.",
  purpose:
    "The order book, at the line the fill rate is actually measured on. Ordered against shipped is the number a buyer plans a promotion around.",
  derivedFrom: "skus.ts and the demo order lines, mapped onto an SAP SD sales-order line.",
  columns: [
    { name: "order_line_id", type: "bigint", role: "pk", note: "Row key." },
    { name: "po_number", type: "varchar", role: "degenerate", note: "The buyer's PO. A degenerate dimension: it identifies the order but has no attributes of its own." },
    { name: "date_key", type: "int", role: "fk", references: "dim_date", note: "Order date. Joins the shared time spine." },
    { name: "product_key", type: "int", role: "fk", references: "dim_product", note: "The SKU ordered." },
    { name: "account_key", type: "int", role: "fk", references: "dim_account", note: "The buyer." },
    { name: "channel_key", type: "int", role: "fk", references: "dim_channel", note: "How the order arrived." },
    { name: "ordered_cases", type: "int", role: "measure", note: "Cases the buyer asked for." },
    { name: "shipped_cases", type: "int", role: "measure", note: "Cases that actually went. Additive across every dimension." },
    { name: "fill_rate_pct", type: "decimal(5,2)", role: "measure", note: "Non-additive: never sum it. Re-derive from shipped over ordered at the rollup." },
    { name: "line_value_usd", type: "decimal(12,2)", role: "measure", note: "Extended line value. Additive." },
    { name: "lead_time_days", type: "int", role: "measure", note: "Days from order to promised ship." },
  ],
};

const FACT_CASE: ModelTable = {
  id: "fact_case",
  name: "fact_case",
  kind: "fact",
  grain: "One row per customer-experience case.",
  purpose:
    "The service record, at the grain of one case. Response and resolve hours against target are the numbers the command center triages by.",
  derivedFrom: "caseBoard.ts and scenarios.ts (the lifecycle worked in the Resolution Simulator).",
  columns: [
    { name: "case_id", type: "varchar", role: "degenerate", note: "The case reference the account is given. Degenerate: it names the case, no attributes." },
    { name: "date_key", type: "int", role: "fk", references: "dim_date", note: "Date reported." },
    { name: "account_key", type: "int", role: "fk", references: "dim_account", note: "The account that raised it." },
    { name: "product_key", type: "int", role: "fk", references: "dim_product", note: "The product in question, when there is one." },
    { name: "channel_key", type: "int", role: "fk", references: "dim_channel", note: "How it came in." },
    { name: "issue_type_key", type: "int", role: "fk", references: "dim_issue_type", note: "What kind of case, and the SOP behind it." },
    { name: "owner_key", type: "int", role: "fk", references: "dim_owner", note: "Who holds it. The join that makes an unowned case visible." },
    { name: "response_hours", type: "decimal(7,2)", role: "measure", note: "Hours to first substantive response." },
    { name: "resolve_hours", type: "decimal(7,2)", role: "measure", note: "Hours to resolution. Paused clock excluded." },
    { name: "sla_breached", type: "boolean", role: "measure", note: "Additive as a count of breaches when summed." },
    { name: "case_count", type: "int", role: "measure", note: "Always 1. The honest way to count rows at a rollup." },
  ],
};

const FACT_DEDUCTION: ModelTable = {
  id: "fact_deduction",
  name: "fact_deduction",
  kind: "fact",
  grain: "One row per deduction (chargeback) line.",
  purpose:
    "The dispute book. Taken against recovered, and days to resolve against the dispute window, is where money is quietly lost.",
  derivedFrom: "escalation.ts (deduction reason codes and dispute procedure) and the account deduction history.",
  columns: [
    { name: "deduction_id", type: "varchar", role: "degenerate", note: "The chargeback reference." },
    { name: "date_key", type: "int", role: "fk", references: "dim_date", note: "Date the deduction posted." },
    { name: "account_key", type: "int", role: "fk", references: "dim_account", note: "The account that took it." },
    { name: "issue_type_key", type: "int", role: "fk", references: "dim_issue_type", note: "The reason code. The join that turns a pile of chargebacks into a pattern." },
    { name: "owner_key", type: "int", role: "fk", references: "dim_owner", note: "Who disputes it, and whether it is within their approval limit." },
    { name: "deduction_amount_usd", type: "decimal(12,2)", role: "measure", note: "Amount taken. Additive." },
    { name: "recovered_amount_usd", type: "decimal(12,2)", role: "measure", note: "Amount won back. Additive." },
    { name: "days_to_resolve", type: "int", role: "measure", note: "Days open. Read against the dispute window, not on its own." },
    { name: "dispute_won", type: "boolean", role: "measure", note: "Summed, it is the recovery count." },
  ],
};

const FACT_QUOTE: ModelTable = {
  id: "fact_quote",
  name: "fact_quote",
  kind: "fact",
  grain: "One row per SKU line on one quote request.",
  purpose:
    "The quote desk, at the line. Response time against the committed turnaround, and whether the quote converted, is the service promise made visible.",
  derivedFrom: "quotes.ts (the request-for-quote built from cart lines).",
  columns: [
    { name: "quote_line_id", type: "bigint", role: "pk", note: "Row key." },
    { name: "rfq_number", type: "varchar", role: "degenerate", note: "The quote reference, e.g. RFQ-40231." },
    { name: "date_key", type: "int", role: "fk", references: "dim_date", note: "Date requested." },
    { name: "product_key", type: "int", role: "fk", references: "dim_product", note: "The SKU quoted." },
    { name: "account_key", type: "int", role: "fk", references: "dim_account", note: "The buyer asking." },
    { name: "channel_key", type: "int", role: "fk", references: "dim_channel", note: "How the request arrived." },
    { name: "quoted_cases", type: "int", role: "measure", note: "Cases on the request." },
    { name: "quoted_value_usd", type: "decimal(12,2)", role: "measure", note: "Value at the quoted price." },
    { name: "response_hours", type: "decimal(7,2)", role: "measure", note: "Hours to return the quote, against the committed turnaround." },
    { name: "converted", type: "boolean", role: "measure", note: "Whether the quote became an order." },
  ],
};

export const DIMENSIONS: ModelTable[] = [
  DIM_DATE,
  DIM_PRODUCT,
  DIM_ACCOUNT,
  DIM_CHANNEL,
  DIM_ISSUE_TYPE,
  DIM_OWNER,
];

export const FACTS: ModelTable[] = [
  FACT_ORDER_LINE,
  FACT_CASE,
  FACT_DEDUCTION,
  FACT_QUOTE,
];

export const STAR_SCHEMA: ModelTable[] = [...FACTS, ...DIMENSIONS];

export const TABLE_BY_ID: Record<string, ModelTable> = Object.fromEntries(
  STAR_SCHEMA.map((t) => [t.id, t]),
);

/** The dimension ids a fact joins to, in column order. */
export function dimensionsForFact(fact: ModelTable): string[] {
  const out: string[] = [];
  for (const c of fact.columns) {
    if (c.role === "fk" && c.references && !out.includes(c.references)) {
      out.push(c.references);
    }
  }
  return out;
}

/** The facts that reference a given dimension. */
export function factsForDimension(dimId: string): ModelTable[] {
  return FACTS.filter((f) => dimensionsForFact(f).includes(dimId));
}

/**
 * Conformed dimensions: those shared by two or more facts. The whole payoff of a
 * star schema is that a case, an order, and a chargeback for one account meet on
 * the same key, so this is computed, not asserted.
 */
export function conformedDimensionIds(): string[] {
  return DIMENSIONS.filter((d) => factsForDimension(d.id).length >= 2).map((d) => d.id);
}

export const STAR_SCHEMA_DISCLOSURE =
  "A dimensional-model study of the FireFlow CX domain, built to standard star-schema practice. It models the domain; it is not a deployed warehouse.";

/* ------------------------------------------------------------------ */
/* 2. Integration map                                                  */
/* ------------------------------------------------------------------ */

export type SystemId = "erp" | "crm" | "edi" | "ecom" | "warehouse";

export interface IntegrationSystem {
  id: SystemId;
  name: string;
  glyph: string;
  /** One line: what this system is the authority for. */
  role: string;
  /** Data domains this system is the source of truth for. */
  masters: string[];
  /** Data it takes in from other systems. */
  consumes: string[];
}

/** The integration pattern a flow uses. Word, not jargon alone. */
export type FlowPattern = "edi" | "event" | "batch-etl" | "api";

export const FLOW_PATTERN_META: Record<FlowPattern, { label: string; glyph: string }> = {
  edi: { label: "EDI document", glyph: "◱" },
  event: { label: "Event, near real-time", glyph: "◈" },
  "batch-etl": { label: "Batch ETL", glyph: "▤" },
  api: { label: "API call", glyph: "◉" },
};

export interface DataFlow {
  id: string;
  from: SystemId;
  to: SystemId;
  /** The data object that moves. */
  object: string;
  pattern: FlowPattern;
  cadence: string;
  /** The mapping or transform the object goes through. */
  transform: string;
  /** Where this handoff breaks, and what the buyer feels when it does. */
  failureMode: string;
  /** Who owns the interface. */
  owner: string;
  /** What CX watches on this flow. Ties the study back to the role. */
  cxWatch: string;
}

export const SYSTEMS: IntegrationSystem[] = [
  {
    id: "edi",
    name: "EDI · Trade documents",
    glyph: "◱",
    role: "The transport for trade documents between the buyer and the ERP. Not a system of record, a pipe with strict rules.",
    masters: ["Trade document exchange (850, 855, 856, 810, 812, 820)"],
    consumes: ["Buyer purchase orders", "ERP order and shipment confirmations"],
  },
  {
    id: "ecom",
    name: "Web & Marketing",
    glyph: "◧",
    role: "The FireFlow ordering and quote surface, plus the marketing platform. Where a smaller buyer places an order by hand and where assets are requested.",
    masters: ["Web order draft", "Quote request", "Campaign and sell-sheet assets"],
    consumes: ["Product master", "Pricing by account lane"],
  },
  {
    id: "erp",
    name: "ERP · SAP SD aligned",
    glyph: "◆",
    role: "The system of record for the order-to-cash chain: sales order, pricing, delivery, and billing.",
    masters: ["Sales order", "Pricing conditions", "Delivery and ATP", "Billing and invoice", "Customer and material master"],
    consumes: ["EDI purchase orders", "Web order drafts"],
  },
  {
    id: "crm",
    name: "CRM · Case & account",
    glyph: "●",
    role: "The system of record for the CX case and the account relationship. Where the service history lives.",
    masters: ["Case and resolution", "Contact and service history"],
    consumes: ["Customer master from ERP", "Deduction reason codes"],
  },
  {
    id: "warehouse",
    name: "Data Warehouse · BI",
    glyph: "▤",
    role: "The analytics store the dimensional model lands in. Reads from every system, writes back to none.",
    masters: ["The conformed reporting model (the star schema above)"],
    consumes: ["ERP orders, billing, deductions", "CRM cases", "EDI document status"],
  },
];

export const SYSTEM_BY_ID: Record<SystemId, IntegrationSystem> = Object.fromEntries(
  SYSTEMS.map((s) => [s.id, s]),
) as Record<SystemId, IntegrationSystem>;

export const FLOWS: DataFlow[] = [
  {
    id: "po-in",
    from: "edi",
    to: "erp",
    object: "EDI 850 Purchase Order",
    pattern: "edi",
    cadence: "Real-time on receipt",
    transform:
      "The 850 is mapped to a sales order: the buyer's part number to our SKU, the ship-to code to a partner function, the requested date to a schedule line. A 997 functional acknowledgment returns on receipt; it confirms the structure was readable, not that the business accepted the order. That answer is the 855.",
    failureMode:
      "An unmapped SKU or ship-to rejects the PO into an EDI error queue. The buyer believes the order is placed. Nobody is short until the truck is.",
    owner: "EDI and Data team, with CX watching the queue",
    cxWatch: "A PO sitting in the error queue is an order the buyer thinks they already placed.",
  },
  {
    id: "order-ack",
    from: "erp",
    to: "edi",
    object: "EDI 855 / 856 / 810 (acknowledgement, ASN, invoice)",
    pattern: "edi",
    cadence: "Event, as each document posts",
    transform:
      "The ERP emits an order acknowledgement, then an advance ship notice at pick, then an invoice at billing, each mapped back to the buyer's EDI spec.",
    failureMode:
      "A late or malformed 856 fails the buyer's dock scan and turns into a compliance deduction, even when the product arrived correct and on time.",
    owner: "EDI and Data team",
    cxWatch: "A document failure becomes a chargeback with our name on it, on a shipment that was actually fine.",
  },
  {
    id: "master-sync",
    from: "erp",
    to: "crm",
    object: "Customer and material master",
    pattern: "batch-etl",
    cadence: "Nightly batch",
    transform:
      "Partner functions, sales area, terms, and the material list are copied from the ERP into the CRM so a rep sees the same account the order does.",
    failureMode:
      "A master-data change made in the ERP at 2pm is not in the CRM until the next morning. The rep answers from a stale account and promises against terms that changed.",
    owner: "Data team",
    cxWatch: "The rep and the order disagree about the same account, and the buyer hears two answers.",
  },
  {
    id: "web-order",
    from: "ecom",
    to: "erp",
    object: "Web order draft",
    pattern: "api",
    cadence: "Real-time on submit",
    transform:
      "A hand-placed web order is validated against product master and account pricing, then created as a sales order under the same rules an EDI order follows.",
    failureMode:
      "A price or minimum that drifted between the web surface and the ERP lets a buyer submit an order that the ERP then reprices or holds, after they thought it was done.",
    owner: "Web and Data team",
    cxWatch: "A buyer who submitted a good-looking order gets a quiet reprice they never agreed to.",
  },
  {
    id: "deduction-in",
    from: "edi",
    to: "crm",
    object: "EDI 812 / 820 (deduction and remittance detail)",
    pattern: "edi",
    cadence: "Event, on remittance",
    transform:
      "Chargeback lines are mapped to reason codes and opened as deduction cases in the CRM, tied to the account and the original order.",
    failureMode:
      "A deduction that lands without a clean reason-code map opens as an untyped case. It ages toward its dispute window while nobody can see what it is.",
    owner: "Finance and CX",
    cxWatch: "An untyped deduction is money quietly lost to the clock before anyone can dispute it.",
  },
  {
    id: "case-feed",
    from: "crm",
    to: "warehouse",
    object: "Case and resolution export (fact_case)",
    pattern: "batch-etl",
    cadence: "Nightly batch",
    transform:
      "Closed and open cases are loaded into fact_case at one row per case, keyed to the conformed account, product, and date dimensions.",
    failureMode:
      "If the account key does not conform, the same buyer's cases scatter across near-duplicate rows and the pattern behind a repeat complaint never surfaces.",
    owner: "Data team",
    cxWatch: "Cases that do not conform hide the repeat issue that a root-cause fix depends on.",
  },
  {
    id: "sales-feed",
    from: "erp",
    to: "warehouse",
    object: "Order, billing, and deduction export (fact_order_line, fact_deduction)",
    pattern: "batch-etl",
    cadence: "Nightly batch",
    transform:
      "Sales-order lines, invoices, and deductions are loaded into their fact tables, joined to the same product, account, and date keys the case feed uses.",
    failureMode:
      "A fill-rate number summed from a non-additive column, or across an unconformed key, produces a report two teams can each prove wrong.",
    owner: "Data team",
    cxWatch: "A metric nobody can trace to a grain is one nobody can defend in a Monday review.",
  },
];

export const FLOW_BY_ID: Record<string, DataFlow> = Object.fromEntries(
  FLOWS.map((f) => [f.id, f]),
);

/** The flows that touch a given system, as sender or receiver. */
export function flowsForSystem(systemId: SystemId): DataFlow[] {
  return FLOWS.filter((f) => f.from === systemId || f.to === systemId);
}

/**
 * Source-of-truth governance: each data domain and the one system that masters
 * it. Built from the systems' `masters`, so the map cannot drift from the model.
 */
export interface GovernanceRow {
  domain: string;
  systemId: SystemId;
}

export const GOVERNANCE: GovernanceRow[] = SYSTEMS.flatMap((s) =>
  s.masters.map((domain) => ({ domain, systemId: s.id })),
);

export const INTEGRATION_DISCLOSURE =
  "An integration-pattern study built around real EDI and SAP SD practice. It maps the patterns end to end; it is not a live pipeline.";
