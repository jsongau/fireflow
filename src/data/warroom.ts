/**
 * Cross-Functional War Room data.
 * EVERYTHING here is synthetic and labeled — invented for demonstration.
 * No real accounts, orders, deductions, employees, or outcomes.
 *
 * The War Room shows OWNERSHIP and HANDOFF ORDER across departments, not the
 * step-by-step resolution of a single case (that is the Resolution Simulator).
 * The point it makes: Customer Experience is the connective tissue. One owner,
 * one evidence trail, one promised update, no matter how many teams touch it.
 */

export type DeptId = "cx" | "sales" | "supply" | "logistics" | "finance";

export interface WarRoomLane {
  id: DeptId;
  name: string;
  /** Decorative glyph so a lane is never identified by color alone. */
  glyph: string;
  /** Standing, day-to-day ownership for this department. */
  owns: string;
  /** The one question this department answers. */
  answers: string;
}

export type RoleKind = "lead" | "support";

export interface ScenarioRole {
  dept: DeptId;
  /** Handoff order within the scenario, 1-based. Engaged lanes only. */
  step: number;
  /** Dominant owner ("lead") or contributing partner ("support"). */
  kind: RoleKind;
  /** What this department does in THIS scenario. */
  action: string;
}

export interface WarRoomScenario {
  id: string;
  /** Short label for the toggle. */
  label: string;
  title: string;
  /** Synthetic situation that opens the case. */
  trigger: string;
  /** The two departments that carry this scenario, for the center-of-gravity note. */
  dominant: [DeptId, DeptId];
  /** Engaged lanes with their step and action. Lanes not listed are monitoring. */
  roles: ScenarioRole[];
  /** The connective-tissue line: what CX holds together here. */
  cxRole: string;
}

/* -------------------------------------------------------------------------- */
/* The standing operating model: who owns what, every day.                    */
/* -------------------------------------------------------------------------- */

export const LANES: WarRoomLane[] = [
  {
    id: "cx",
    name: "Customer Experience",
    glyph: "◎", // ◎
    owns: "The customer relationship and the case itself. Every issue gets one owner, one evidence trail, and one promised next update. CX is the single voice back to the account.",
    answers: "Who owns this, and when does the customer hear from us next?",
  },
  {
    id: "sales",
    name: "Sales",
    glyph: "◈", // ◈
    owns: "Account terms, promotional pricing, and the commercial relationship. Confirms what was agreed whenever terms are in question.",
    answers: "What did we agree to with this account?",
  },
  {
    id: "supply",
    name: "Supply Chain",
    glyph: "▣", // ▣
    owns: "Availability, allocation, fill rate, and replenishment timing. Decides what can ship and holds the balance date.",
    answers: "What can ship, how much, and by when?",
  },
  {
    id: "logistics",
    name: "Logistics",
    glyph: "➤", // ➤
    owns: "Delivery execution, carrier performance, and shipment timing. Traces the load and confirms a real arrival.",
    answers: "Where is it, and when does it land?",
  },
  {
    id: "finance",
    name: "Finance",
    glyph: "▦", // ▦
    owns: "Billing, invoicing, deductions, credits, and disputes. Decides whether the money matches the agreement.",
    answers: "Does the invoice match what was agreed and delivered?",
  },
];

export const LANE_BY_ID: Record<DeptId, WarRoomLane> = Object.fromEntries(
  LANES.map((l) => [l.id, l]),
) as Record<DeptId, WarRoomLane>;

/* -------------------------------------------------------------------------- */
/* Scenarios. Each one has a DIFFERENT dominant pair, so the same grid lights  */
/* up differently every time. Order of the toggle: model first, then four.     */
/* -------------------------------------------------------------------------- */

export const SCENARIOS: WarRoomScenario[] = [
  {
    id: "bulk-promo",
    label: "Bulk promo order",
    title: "Bulk promotional case order",
    trigger:
      "A distributor places a large promotional PO for a feature event. The ordered quantity is above the confirmed allocation, and the PO carries a promo price that has to match the billing.",
    dominant: ["supply", "sales"],
    roles: [
      { dept: "cx", step: 1, kind: "support", action: "Logs the PO, opens the case, and starts the customer-update clock." },
      { dept: "sales", step: 2, kind: "lead", action: "Confirms the promo terms and the approved price for the event." },
      { dept: "supply", step: 3, kind: "lead", action: "Checks allocation against the ordered quantity and commits a fill amount and a balance date." },
      { dept: "finance", step: 4, kind: "support", action: "Loads the promo price so the invoice matches the agreed terms." },
      { dept: "cx", step: 5, kind: "support", action: "Sends one consolidated update: confirmed quantity, balance date, and price confirmed." },
    ],
    cxRole:
      "CX keeps the account from hearing four different answers. Sales confirms price, Supply Chain confirms quantity, Finance confirms billing, and the customer gets one message.",
  },
  {
    id: "replenishment",
    label: "Replenishment",
    title: "Standing order and replenishment",
    trigger:
      "A retailer's recurring replenishment order arrives on its usual cadence, but forecasted demand for the item has shifted since the last cycle.",
    dominant: ["supply", "cx"],
    roles: [
      { dept: "cx", step: 1, kind: "lead", action: "Validates the standing order against the current item and pricing master data before it releases." },
      { dept: "supply", step: 2, kind: "lead", action: "Compares forecast to cadence, flags over or under supply, and adjusts the release quantity." },
      { dept: "sales", step: 3, kind: "support", action: "Confirms any account-level change to the replenishment program." },
      { dept: "cx", step: 4, kind: "lead", action: "Confirms the adjusted quantity and the next cycle back to the account." },
    ],
    cxRole:
      "A standing order is where silent drift starts. CX checks the master data and the cadence every cycle, so a stale quantity never ships on autopilot.",
  },
  {
    id: "late-short",
    label: "Late / short shipment",
    title: "Late or short shipment",
    trigger:
      "An order shipped, but the carrier missed the retailer's requested delivery date and part of the shipment is short against the PO.",
    dominant: ["logistics", "supply"],
    roles: [
      { dept: "cx", step: 1, kind: "lead", action: "Logs the miss, notifies the account before they chase it, and sets the next-update time." },
      { dept: "logistics", step: 2, kind: "lead", action: "Traces the carrier, confirms a real ETA, and files the root cause." },
      { dept: "supply", step: 3, kind: "support", action: "Confirms whether the short lines are a backorder or an inventory constraint." },
      { dept: "cx", step: 4, kind: "lead", action: "Gives the account one ETA and a plan for the short lines." },
    ],
    cxRole:
      "Two failures, one shipment. CX makes sure the customer gets a single arrival date and a single plan for the shortage, not a carrier answer today and an inventory answer tomorrow.",
  },
  {
    id: "deduction",
    label: "Deduction",
    title: "Deduction and chargeback",
    trigger:
      "A retailer deducts from an invoice payment, citing a shortage or a price discrepancy on a past order.",
    dominant: ["finance", "sales"],
    roles: [
      { dept: "cx", step: 1, kind: "lead", action: "Opens the deduction case and gathers the claim detail with the order and delivery evidence." },
      { dept: "finance", step: 2, kind: "lead", action: "Matches the deduction to the invoice and rules it valid or invalid." },
      { dept: "sales", step: 3, kind: "support", action: "Confirms the agreed terms behind the disputed amount." },
      { dept: "cx", step: 4, kind: "lead", action: "Responds to the retailer with the resolution and logs the pattern for prevention." },
    ],
    cxRole:
      "A deduction is money and a relationship at the same time. CX gathers the proof and carries the answer, so Finance can resolve the dollars without Sales losing the account.",
  },
];

export const SCENARIO_BY_ID: Record<string, WarRoomScenario> = Object.fromEntries(
  SCENARIOS.map((s) => [s.id, s]),
);
