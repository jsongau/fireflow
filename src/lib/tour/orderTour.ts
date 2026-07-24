/**
 * "Follow the order" — the guided recruiter path.
 *
 * The strongest story in FireFlow spans five modules: compare products, trace
 * them into a retailer PO, work the X12 lifecycle, watch a short-shipment
 * deduction arrive, and end at a governed case with a corrective action. A
 * visitor giving the site three minutes will not assemble that route alone,
 * so the tour walks it: six stops, one Next button, deep links.
 *
 * Mechanics: stop index persists in sessionStorage so the tour survives route
 * changes. Arrival at a stop can perform setup (compare presets, case routing)
 * and can ask the #o2c section to advance the lifecycle reducer to a named
 * milestone through a window event. The reducer's own gates make replayed
 * milestones idempotent.
 */

export const TOUR_STORAGE_KEY = "fireflow:tour:step";

/** Window event the #o2c section listens for. detail: TourMilestone. */
export const O2C_TOUR_EVENT = "fireflow:o2c-tour";

/** Window event that tells the mounted tour bar to re-read its stored step. */
export const TOUR_START_EVENT = "fireflow:tour-start";

export type TourMilestone = "select" | "released" | "remittance" | "resolved";

export type TourArrival =
  | { kind: "compare-setup" }
  | { kind: "milestone"; milestone: TourMilestone }
  | { kind: "route-case" };

export interface TourStop {
  id: string;
  /** Route path, including any query. */
  path: string;
  /** Element id to scroll to on arrival (empty string: leave scroll alone). */
  target: string;
  title: string;
  body: string;
  arrive?: TourArrival;
}

export const TOUR_STOPS: TourStop[] = [
  {
    id: "product",
    path: "/",
    target: "compare",
    title: "Start with the product.",
    body:
      "Two Buldak products sit head to head: formats, allergens, package components, support complexity. This table is the item master that every order, claim, and case downstream reads. The Trace in retailer order link under each product carries it into operations.",
    arrive: { kind: "compare-setup" },
  },
  {
    id: "queue",
    path: "/intelligence",
    target: "o2c",
    title: "One queue, one featured order.",
    body:
      "Eight orders, prioritized on visible math rather than feel. The 99 Ranch Market order carries a full X12 document trail: an 850 received, a 997 returned, and three line problems waiting for decisions.",
    arrive: { kind: "milestone", milestone: "select" },
  },
  {
    id: "decisions",
    path: "/intelligence",
    target: "o2c-lifecycle",
    title: "Three decisions block the acknowledgment.",
    body:
      "An unmapped retailer item, a lapsed promo price, and 40 cases that cannot ship on time. Work them yourself in this panel, or press Next and the order is worked for you: mapped, repriced with the retailer told first, committed at 120 with 40 backordered, acknowledged, released.",
  },
  {
    id: "deduction",
    path: "/intelligence",
    target: "o2c-deduction",
    title: "Execution fails after the paperwork was right.",
    body:
      "The 855 promised 120 Carbonara cases and the 856 reported 120 shipped, but receiving counted 116. The payment arrives $91.60 short under reason code 22. The reconcile table walks the count across every checkpoint before anyone decides anything.",
    arrive: { kind: "milestone", milestone: "remittance" },
  },
  {
    id: "resolution",
    path: "/intelligence",
    target: "o2c-deduction",
    title: "Resolve it, then make it stop happening.",
    body:
      "The loading records confirm the shortage, so this one is a credit memo, because the money is owed. A claim the evidence cannot settle gets a courtesy discount on a future order instead. Either way the close carries a root cause, a corrective action, an owner, and a verification plan.",
    arrive: { kind: "milestone", milestone: "resolved" },
  },
  {
    id: "board",
    path: "/ops?case=FF-2231&open=1",
    target: "",
    title: "Every claim becomes a governed case.",
    body:
      "The same deduction lands on the operations board as case FF-2231: one accountable owner, a service target, the evidence, an audit trail, and close-the-loop actions. This board is the working layer underneath everything you just watched.",
    arrive: { kind: "route-case" },
  },
];

export function readTourStep(): number | null {
  try {
    const raw = sessionStorage.getItem(TOUR_STORAGE_KEY);
    if (raw === null) return null;
    const n = Number(raw);
    return Number.isInteger(n) && n >= 0 && n < TOUR_STOPS.length ? n : null;
  } catch {
    return null;
  }
}

export function writeTourStep(step: number | null): void {
  try {
    if (step === null) sessionStorage.removeItem(TOUR_STORAGE_KEY);
    else sessionStorage.setItem(TOUR_STORAGE_KEY, String(step));
  } catch {
    /* storage unavailable: the tour simply will not persist across pages */
  }
}

/** Ask the #o2c section to select the featured order and reach a milestone. */
export function requestO2cMilestone(milestone: TourMilestone): void {
  window.dispatchEvent(new CustomEvent<TourMilestone>(O2C_TOUR_EVENT, { detail: milestone }));
}
