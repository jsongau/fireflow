import type { CustomerMasterTabId } from "@/data/customerMaster";

/** Event the CustomerMasterRecord listens for to switch its active view. */
export const CUSTOMER_MASTER_TAB_EVENT = "fireflow:customer-master-tab";

/**
 * Jump to the Customer Master study and open a specific view.
 * Used by the SAP SD glossary chips so a term like "Ship-to party" lands the
 * reader on the record where that field actually lives. Honors reduced motion.
 */
export function openCustomerMasterTab(tabId: CustomerMasterTabId) {
  window.dispatchEvent(new CustomEvent(CUSTOMER_MASTER_TAB_EVENT, { detail: tabId }));
  const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  requestAnimationFrame(() => {
    document
      .getElementById("customer-master")
      ?.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
  });
}
