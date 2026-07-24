/**
 * SYNTHETIC Customer Experience team operating model.
 *
 * This is a "how I would run the function" artifact for a portfolio, not a claim
 * of having managed these people. Every name, load, threshold, and authority
 * limit below is invented and labeled synthetic wherever it renders.
 *
 * The specialties intentionally line up with the case types the product actually
 * routes (see SupportBar/intake): deductions, EDI and order entry, key accounts,
 * consumer and quality, replenishment. Priority tiers and the deduction-type
 * count are pulled from the same taxonomy so the team maps to real queue work.
 */

import {
  CHARGEBACK_ACCEPT_CEILING,
  CREDIT_CEILING,
  RESHIP_CEILING,
  type ApprovalLevel,
} from "./escalation";

import {
  PRIORITY_LABEL,
  DEDUCTION_TYPES,
  type PriorityId,
} from "@/components/home/SupportBar/intake";

export { PRIORITY_LABEL };

/* -------------------------------------------------------------------------- */
/* Roster                                                                     */
/* -------------------------------------------------------------------------- */

export type Level = "Rep" | "Senior Rep" | "Team Lead";

export interface TeamMember {
  id: string;
  /** Synthetic first name + last initial. Not a real person. */
  name: string;
  level: Level;
  /** Display label for the specialty. */
  specialty: string;
  /** The intake case types this person routes, so the roster maps to real queue work. */
  covers: string;
  /** Typical top-of-queue priority tier for this specialty (rendered via PRIORITY_LABEL). */
  topPriority: PriorityId;
  /** Current open-case load (synthetic). Drives the workload state. */
  openCases: number;
  /** One line: what Nathan is coaching this person on right now. */
  coachingFocus: string;
  /** One line: where this person is developing next. */
  developmentGoal: string;
  /** 1:1 cadence. */
  oneOnOne: string;
}

/** Deduction specialist covers every deduction type the product recognizes. */
const DEDUCTION_COVERAGE = `All ${DEDUCTION_TYPES.length} deduction types, remittance research`;

export const TEAM: TeamMember[] = [
  {
    id: "lead-grace",
    name: "Grace H.",
    level: "Team Lead",
    specialty: "Team lead and escalations",
    covers: "Escalation bridge, QA sampling, daily standup",
    topPriority: "critical",
    openCases: 4,
    coachingFocus:
      "Owns the escalation bridge and the daily standup. Coaching her to delegate more of the routine queue so she stays on the exceptions.",
    developmentGoal:
      "Building toward an assistant-manager scope: owning a full KPI line end to end.",
    oneOnOne: "Weekly with the manager, 45 min",
  },
  {
    id: "rep-priya",
    name: "Priya S.",
    level: "Senior Rep",
    specialty: "Deductions and chargebacks",
    covers: DEDUCTION_COVERAGE,
    topPriority: "high",
    openCases: 19,
    coachingFocus:
      "Strong researcher. Coaching her to close inside the aging window instead of over-documenting a clear-cut dispute.",
    developmentGoal:
      "Ready to mentor a junior rep on deduction triage and reason-code classification.",
    oneOnOne: "Twice weekly, 30 min, until the load rebalances",
  },
  {
    id: "rep-marcus",
    name: "Marcus T.",
    level: "Rep",
    specialty: "EDI and order entry",
    covers: "850 / 856 / 810 exceptions, manual order entry",
    topPriority: "elevated",
    openCases: 11,
    coachingFocus:
      "Coaching him to catch order-entry errors before they reach the DC, not after the short ship posts.",
    developmentGoal:
      "Learning to read the SAP document flow end to end so he can self-diagnose a failed 850.",
    oneOnOne: "Weekly, 30 min",
  },
  {
    id: "rep-elena",
    name: "Elena V.",
    level: "Senior Rep",
    specialty: "Key accounts",
    covers: "Top-account order status, proactive updates, escalations",
    topPriority: "high",
    openCases: 14,
    coachingFocus:
      "Excellent with accounts. Coaching her to delegate routine status pulls so she is free for the calls that need her.",
    developmentGoal:
      "On a team-lead track: shadowing escalation calls and starting to run the standup.",
    oneOnOne: "Weekly, 30 min",
  },
  {
    id: "rep-jordan",
    name: "Jordan K.",
    level: "Rep",
    specialty: "Consumer and quality",
    covers: "Consumer cases, allergen and quality concerns, lot trending",
    topPriority: "elevated",
    openCases: 8,
    coachingFocus:
      "Coaching him to hold every allergen answer to the controlled source and never improvise on a health question.",
    developmentGoal:
      "Cross-training on retailer cases to broaden coverage and cover peak load.",
    oneOnOne: "Biweekly, 30 min",
  },
  {
    id: "rep-aisha",
    name: "Aisha B.",
    level: "Rep",
    specialty: "Replenishment and standing orders",
    covers: "Standing-order cadence, fill-rate exceptions, short-ship recovery",
    topPriority: "standard",
    openCases: 13,
    coachingFocus:
      "Coaching her to forecast stock before an auto-release fires, so a standing order never short-ships by surprise.",
    developmentGoal:
      "Owning the weekly standing-order review as a standing responsibility.",
    oneOnOne: "Weekly, 30 min",
  },
];

/* -------------------------------------------------------------------------- */
/* Workload balance                                                           */
/*                                                                            */
/* State is derived from open-case thresholds and always rendered with a WORD */
/* and a shape glyph, never color alone.                                      */
/* -------------------------------------------------------------------------- */

/** Synthetic open-case thresholds. Below atCapacity = headroom; at or above */
/** overloaded = overloaded; in between = at capacity. */
export const WORKLOAD_THRESHOLDS = {
  atCapacity: 12,
  overloaded: 18,
} as const;

export type LoadState = "headroom" | "capacity" | "overloaded";

export const LOAD_META: Record<LoadState, { word: string; glyph: string }> = {
  headroom: { word: "Has headroom", glyph: "○" },
  capacity: { word: "At capacity", glyph: "◐" },
  overloaded: { word: "Overloaded", glyph: "▲" },
};

export function loadState(openCases: number): LoadState {
  if (openCases >= WORKLOAD_THRESHOLDS.overloaded) return "overloaded";
  if (openCases >= WORKLOAD_THRESHOLDS.atCapacity) return "capacity";
  return "headroom";
}

/** Bar scale: the top of the load chart. Kept just above the overloaded line. */
export const LOAD_SCALE_MAX = 24;

/* -------------------------------------------------------------------------- */
/* Escalation authority / approval matrix                                     */
/*                                                                            */
/* Who may commit what without a manager. All thresholds synthetic.           */
/* -------------------------------------------------------------------------- */

/* Defined in escalation.ts, alongside the numeric ceilings the intake routing
   check climbs, and re-exported here so existing consumers keep their import. */
export { APPROVAL_LEVELS, type ApprovalLevel } from "./escalation";

export interface AuthorityRow {
  id: string;
  action: string;
  /** Optional note that shows below the action label. */
  note?: string;
  limits: Record<ApprovalLevel, string>;
}

/* The reship and credit rows build their strings from the same numbers the intake
   routing check evaluates. The ladder a visitor reads and the ladder the system
   climbs cannot drift, because there is one set of numbers. */
const casesUpTo = (n: number) => `Up to ${n} case${n === 1 ? "" : "s"}`;
const moneyUpTo = (n: number) => `Up to $${n.toLocaleString("en-US")}`;

export const APPROVAL_MATRIX: AuthorityRow[] = [
  {
    id: "reship",
    action: "Reship or replacement",
    limits: {
      Rep: casesUpTo(RESHIP_CEILING.Rep),
      "Senior Rep": casesUpTo(RESHIP_CEILING["Senior Rep"]),
      "Team Lead": casesUpTo(RESHIP_CEILING["Team Lead"]),
      Manager: `Above ${RESHIP_CEILING["Team Lead"]} cases`,
    },
  },
  {
    id: "credit",
    action: "Credit or goodwill adjustment",
    limits: {
      Rep: moneyUpTo(CREDIT_CEILING.Rep),
      "Senior Rep": moneyUpTo(CREDIT_CEILING["Senior Rep"]),
      "Team Lead": moneyUpTo(CREDIT_CEILING["Team Lead"]),
      Manager: `Above $${CREDIT_CEILING["Team Lead"].toLocaleString("en-US")}`,
    },
  },
  {
    id: "date",
    action: "Delivery-date change",
    limits: {
      Rep: "Within quoted lead time",
      "Senior Rep": "Within quoted lead time",
      "Team Lead": "Any date, notify account",
      Manager: "Any date",
    },
  },
  {
    id: "promo",
    action: "Promotional price correction",
    limits: {
      Rep: "Not authorized",
      "Senior Rep": "With agreement on file",
      "Team Lead": "With agreement on file",
      Manager: "Any correction",
    },
  },
  {
    id: "chargeback",
    action: "Chargeback or deduction disposition",
    note: "Anything touching a chargeback routes up. No rep clears one alone.",
    limits: {
      Rep: "Not authorized",
      "Senior Rep": "Dispute only",
      "Team Lead": `Dispute, or accept up to $${CHARGEBACK_ACCEPT_CEILING.toLocaleString("en-US")}`,
      Manager: "Accept or write off any amount",
    },
  },
];

/* -------------------------------------------------------------------------- */
/* QA rubric                                                                  */
/*                                                                            */
/* What Nathan reviews on a sampled closed case.                              */
/* -------------------------------------------------------------------------- */

/** Closed cases sampled per rep each week (synthetic cadence). */
export const QA_SAMPLE_PER_REP = 3;

export interface QaCheck {
  id: string;
  check: string;
  why: string;
}

export const QA_RUBRIC: QaCheck[] = [
  {
    id: "owner",
    check: "Was one accountable owner named?",
    why: "A case with no single owner is a case nobody is actually working.",
  },
  {
    id: "date",
    check: "Was a dated next update given?",
    why: "The customer should never have to ask what happens next, or when.",
  },
  {
    id: "told",
    check: "Was the customer told before the date slipped?",
    why: "A heads-up before the miss is the difference between a delay and a complaint.",
  },
  {
    id: "root",
    check: "Was the root cause captured?",
    why: "If the cause is not recorded, the same case comes back next month.",
  },
  {
    id: "routing",
    check: "Was it classified and routed correctly?",
    why: "Miscoded cases quietly break the reporting the whole function runs on.",
  },
];

/** Lookup for the case audit trail, which stamps moves with a member's initials. */
export const TEAM_BY_ID: Record<string, TeamMember> = TEAM.reduce(
  (acc, m) => ({ ...acc, [m.id]: m }),
  {} as Record<string, TeamMember>,
);
