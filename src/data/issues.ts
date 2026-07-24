import type { InquiryIssue } from "@/types/domain";

/**
 * Account issue taxonomy for retailers and distributors (the B2B trade channel).
 * These drive the Account Support launcher; `appliesToCategories` lets the UI
 * show only issues relevant to the selected product's category (empty = all).
 * `relatesTo` anchors each issue in the order-to-cash chain so it can be linked
 * back to an order, quote, standing order, delivery, or invoice.
 *
 * Serious product/packaging concerns are flagged for specialist escalation; the
 * system captures facts and routes the case, it never diagnoses or advises.
 *
 * There is no individual-consumer complaint path. Every issue here is raised by
 * a trade account against an order, shipment, or invoice.
 */

export const ACCOUNT_ISSUES: InquiryIssue[] = [
  {
    id: "v-product-info",
    channel: "account-issue",
    label: "Product information request",
    appliesToCategories: [],
    defaultSeverity: "standard",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Account / retailer name", "Products of interest"],
    routeTo: ["Customer Experience", "Sales"],
    relatesTo: "order",
  },
  {
    id: "v-sell-sheet",
    channel: "account-issue",
    label: "Sell sheet or marketing asset request",
    appliesToCategories: [],
    defaultSeverity: "standard",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Account name", "Intended use / channel"],
    routeTo: ["Customer Experience", "Marketing"],
    relatesTo: "order",
  },
  {
    id: "v-availability",
    channel: "account-issue",
    label: "Product availability / lead time",
    appliesToCategories: [],
    defaultSeverity: "standard",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Items and quantities", "Requested ship window"],
    routeTo: ["Customer Experience", "Supply Chain"],
    relatesTo: "order",
  },
  {
    id: "v-quote-expired",
    channel: "account-issue",
    label: "Quote expired or needs re-pricing",
    appliesToCategories: [],
    defaultSeverity: "standard",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Quote (RFQ) number", "Quantities still needed"],
    routeTo: ["Customer Experience", "Sales"],
    relatesTo: "quote",
  },
  {
    id: "v-po-issue",
    channel: "account-issue",
    label: "Purchase order issue",
    appliesToCategories: [],
    defaultSeverity: "elevated",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["PO number", "Line items in question"],
    routeTo: ["Customer Experience", "Order Management"],
    relatesTo: "order",
  },
  {
    id: "v-standing-amend",
    channel: "account-issue",
    label: "Amend or pause a standing order",
    appliesToCategories: [],
    defaultSeverity: "standard",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Standing order number", "Requested change and effective date"],
    routeTo: ["Customer Experience", "Order Management"],
    relatesTo: "standing-order",
  },
  {
    id: "v-partial-fill",
    channel: "account-issue",
    label: "Partial fill or backorder",
    appliesToCategories: [],
    defaultSeverity: "elevated",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["PO number", "Expected vs. received quantities"],
    routeTo: ["Customer Experience", "Supply Chain", "Sales"],
    relatesTo: "delivery",
  },
  {
    id: "v-delivery-delay",
    channel: "account-issue",
    label: "Shipment delay",
    appliesToCategories: [],
    defaultSeverity: "elevated",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["PO / shipment number", "Promised delivery date"],
    routeTo: ["Customer Experience", "Logistics"],
    relatesTo: "delivery",
  },
  {
    id: "v-damaged-cases",
    channel: "account-issue",
    label: "Damaged cases on delivery",
    appliesToCategories: [],
    defaultSeverity: "priority",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Photos of damage", "PO / delivery number", "Affected quantities"],
    routeTo: ["Customer Experience", "Logistics", "Quality"],
    relatesTo: "delivery",
  },
  {
    id: "v-pricing",
    channel: "account-issue",
    label: "Pricing discrepancy",
    appliesToCategories: [],
    defaultSeverity: "priority",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["PO number", "Expected vs. invoiced price", "Applicable agreement"],
    routeTo: ["Customer Experience", "Finance", "Sales"],
    relatesTo: "invoice",
  },
  {
    id: "v-invoice",
    channel: "account-issue",
    label: "Invoice issue",
    appliesToCategories: [],
    defaultSeverity: "priority",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Invoice number", "Nature of the discrepancy"],
    routeTo: ["Customer Experience", "Finance"],
    relatesTo: "invoice",
  },
  {
    id: "v-deduction",
    channel: "account-issue",
    label: "Deduction or chargeback",
    appliesToCategories: [],
    defaultSeverity: "priority",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Deduction / claim number", "Reason code", "Supporting documents"],
    routeTo: ["Customer Experience", "Finance", "Supply Chain"],
    relatesTo: "invoice",
  },
  {
    id: "v-edi",
    channel: "account-issue",
    label: "EDI issue (850 / 856 / 810)",
    appliesToCategories: [],
    defaultSeverity: "priority",
    requiresSpecialistEscalation: false,
    evidenceRequested: ["Transaction type (850/856/810)", "Error message or rejection"],
    routeTo: ["Customer Experience", "IT / EDI", "Order Management"],
    relatesTo: "order",
  },
  {
    id: "v-packaging-concern",
    channel: "account-issue",
    label: "Product or packaging concern",
    appliesToCategories: [],
    defaultSeverity: "priority",
    requiresSpecialistEscalation: true,
    evidenceRequested: ["Affected items and lot codes", "Photos"],
    routeTo: ["Customer Experience", "Quality", "Regulatory"],
    relatesTo: "delivery",
  },
];

export const ALL_ISSUES: InquiryIssue[] = [...ACCOUNT_ISSUES];
export const ISSUE_BY_ID = Object.fromEntries(ALL_ISSUES.map((i) => [i.id, i]));
