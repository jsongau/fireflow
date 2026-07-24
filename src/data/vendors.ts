/**
 * SYNTHETIC vendor and account profiles, keyed by the account name used in the
 * case seed (see seedCases.ts).
 *
 * HONESTY, READ THIS FIRST. These are real grocery banners, used the way a case
 * study uses a real company name: illustratively. Everything below is invented.
 * The relationship, the partner-since date, the store and DC counts, the payment
 * terms, the order channel, and the contact are all fabricated for a portfolio
 * artifact. None of it describes any actual account, and none of it is a credit
 * assessment or any statement about a company's finances. No affiliation,
 * contract, or endorsement is implied.
 *
 * Contacts are a synthetic first name plus a last initial and a role. They are
 * not real people. Open-case counts are NOT stored here: they are derived at
 * render from the live board (see openCasesForAccount) so they never drift.
 */

import { LAST_STAGE, type RoutedCase } from "./caseBoard";

export const VENDOR_DISCLAIMER =
  "An account profile built for this portfolio. The banner name is real; the relationship, terms, and contact are modeled. No affiliation or endorsement is implied.";

export type AccountType = "Retail chain" | "Distributor";

export interface VendorContact {
  /** Synthetic first name plus last initial. Not a real person. */
  name: string;
  role: string;
}

export interface VendorProfile {
  /** Matches the account string in seedCases. */
  account: string;
  accountType: AccountType;
  /** Plausible, invented. */
  partnerSince: string;
  region: string;
  /** Synthetic count of banner stores. Distributors may serve, not operate, stores. */
  storeCount: number;
  /** Synthetic count of receiving distribution centers. */
  dcCount: number;
  paymentTerms: string;
  orderChannel: string;
  primaryContact: VendorContact;
  /** One line on how they order. */
  notes: string;
}

export const VENDORS: Record<string, VendorProfile> = {
  "99 Ranch Market": {
    account: "99 Ranch Market",
    accountType: "Retail chain",
    partnerSince: "March 2018",
    region: "West and Southwest",
    storeCount: 62,
    dcCount: 2,
    paymentTerms: "Net 30",
    orderChannel: "EDI 850",
    primaryContact: { name: "Grace L.", role: "Category Buyer" },
    notes: "Orders weekly by EDI and consolidates receiving through two regional DCs.",
  },
  "H Mart": {
    account: "H Mart",
    accountType: "Retail chain",
    partnerSince: "June 2016",
    region: "National",
    storeCount: 96,
    dcCount: 3,
    paymentTerms: "Net 45",
    orderChannel: "EDI 850",
    primaryContact: { name: "Daniel P.", role: "Senior Buyer" },
    notes: "DC-based ordering with seasonal promotional forecasts submitted ahead of resets.",
  },
  "Zion Market": {
    account: "Zion Market",
    accountType: "Retail chain",
    partnerSince: "January 2020",
    region: "Southern California",
    storeCount: 20,
    dcCount: 1,
    paymentTerms: "Net 30",
    orderChannel: "EDI 850",
    primaryContact: { name: "Esther C.", role: "Buyer" },
    notes: "Store-level demand aggregated through a single DC, with weekly replenishment.",
  },
  "Seafood City Supermarket": {
    account: "Seafood City Supermarket",
    accountType: "Retail chain",
    partnerSince: "September 2019",
    region: "West Coast and Nevada",
    storeCount: 35,
    dcCount: 2,
    paymentTerms: "Net 30",
    orderChannel: "Vendor portal",
    primaryContact: { name: "Marco R.", role: "Replenishment Lead" },
    notes: "Portal reorders tied to a weekend circular that plans the ad two weeks out.",
  },
  "Mitsuwa Marketplace": {
    account: "Mitsuwa Marketplace",
    accountType: "Retail chain",
    partnerSince: "April 2017",
    region: "California, Illinois, New Jersey, Texas",
    storeCount: 11,
    dcCount: 1,
    paymentTerms: "Net 30",
    orderChannel: "Manual purchase order",
    primaryContact: { name: "Kenji S.", role: "Grocery Buyer" },
    notes: "Places manual orders and revisits the set around seasonal planogram resets.",
  },
  "Nijiya Market": {
    account: "Nijiya Market",
    accountType: "Retail chain",
    partnerSince: "November 2018",
    region: "California and Hawaii",
    storeCount: 13,
    dcCount: 1,
    paymentTerms: "Net 30",
    orderChannel: "EDI 850",
    primaryContact: { name: "Aiko T.", role: "Buyer" },
    notes: "Small, frequent EDI orders sized to store-level shelf capacity.",
  },
  "168 Market": {
    account: "168 Market",
    accountType: "Retail chain",
    partnerSince: "February 2021",
    region: "California and Texas",
    storeCount: 9,
    dcCount: 1,
    paymentTerms: "Net 30",
    orderChannel: "EDI 850",
    primaryContact: { name: "Vincent H.", role: "Buyer" },
    notes: "Steady DC orders with occasional spikes ahead of ad features.",
  },
  "Patel Brothers": {
    account: "Patel Brothers",
    accountType: "Retail chain",
    partnerSince: "August 2017",
    region: "National",
    storeCount: 55,
    dcCount: 2,
    paymentTerms: "Net 30",
    orderChannel: "Manual purchase order",
    primaryContact: { name: "Raj M.", role: "Category Manager" },
    notes: "Runs new-item setups ahead of store expansion, then transitions to DC orders.",
  },
  "Hong Kong Supermarket": {
    account: "Hong Kong Supermarket",
    accountType: "Distributor",
    partnerSince: "May 2016",
    region: "West Coast",
    storeCount: 8,
    dcCount: 2,
    paymentTerms: "Net 45",
    orderChannel: "EDI 850",
    primaryContact: { name: "Wei C.", role: "Procurement" },
    notes: "Distributes to independent grocers and orders full pallets by EDI.",
  },
  "Great Wall Supermarket": {
    account: "Great Wall Supermarket",
    accountType: "Retail chain",
    partnerSince: "October 2019",
    region: "Mid-Atlantic and Southeast",
    storeCount: 14,
    dcCount: 1,
    paymentTerms: "Net 30",
    orderChannel: "Vendor portal",
    primaryContact: { name: "Lily Z.", role: "Buyer" },
    notes: "Reorders manually today and is a candidate for a biweekly standing order.",
  },
  "Lotte Plaza Market": {
    account: "Lotte Plaza Market",
    accountType: "Retail chain",
    partnerSince: "July 2018",
    region: "Mid-Atlantic",
    storeCount: 18,
    dcCount: 1,
    paymentTerms: "Net 30",
    orderChannel: "EDI 850",
    primaryContact: { name: "Sung K.", role: "Buyer" },
    notes: "Runs seasonal promotions funded through bill-back claims after the event.",
  },
  "Tokyo Central": {
    account: "Tokyo Central",
    accountType: "Retail chain",
    partnerSince: "March 2019",
    region: "California",
    storeCount: 16,
    dcCount: 1,
    paymentTerms: "Net 30",
    orderChannel: "EDI 850",
    primaryContact: { name: "Haru N.", role: "Grocery Buyer" },
    notes: "Cost-file sensitive; reconciles invoices against the price file weekly.",
  },
  "Assi Plaza": {
    account: "Assi Plaza",
    accountType: "Distributor",
    partnerSince: "December 2017",
    region: "Midwest",
    storeCount: 4,
    dcCount: 1,
    paymentTerms: "Net 45",
    orderChannel: "EDI 850",
    primaryContact: { name: "James O.", role: "Logistics Lead" },
    notes: "Takes freight-consolidated deliveries on scheduled receiving appointments.",
  },
  "Kam Man Food": {
    account: "Kam Man Food",
    accountType: "Distributor",
    partnerSince: "September 2016",
    region: "Northeast",
    storeCount: 4,
    dcCount: 1,
    paymentTerms: "Net 45",
    orderChannel: "EDI 850",
    primaryContact: { name: "Henry W.", role: "Purchasing" },
    notes: "Sends EDI 850 orders with carrier pickups booked against a firm delivery date.",
  },
};

/** Profile for an account name, or null when the name is not in the synthetic set. */
export function vendorFor(account: string | undefined | null): VendorProfile | null {
  if (!account) return null;
  return VENDORS[account] ?? null;
}

/**
 * Open-case count for an account, derived from the live board rather than stored,
 * so it never drifts from what is actually on the board. A case is open until it
 * reaches the last lifecycle stage.
 */
export function openCasesForAccount(account: string, cases: RoutedCase[]): number {
  return cases.filter((c) => c.account === account && c.stageIndex < LAST_STAGE).length;
}

/**
 * Accounts that have a full operations dossier page. Only these get a link from
 * the ops board. A link to a page that does not exist is worse than no link, and
 * a `:slug` route would render an empty dossier for the other thirteen banners.
 */
const ACCOUNT_PAGES: Record<string, string> = {
  "99 Ranch Market": "/accounts/99-ranch-market",
};

/** The dossier route for an account, or null when it does not have one. */
export function accountPageFor(account: string): string | null {
  return ACCOUNT_PAGES[account] ?? null;
}
