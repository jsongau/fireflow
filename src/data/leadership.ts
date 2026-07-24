/**
 * Leadership page data.
 *
 * Two kinds of content live here and they are kept strictly apart:
 *
 *   1. REAL, defensible prior-role results (TRACK_RECORD). These are Nathan's
 *      own numbers from prior roles. They are NOT from Samyang, and CANNOT_CLAIM
 *      names exactly what is off-limits. No SyntheticBadge is used on these.
 *
 *   2. A SYNTHETIC standards design (the SLA matrix, escalation ladder, approval
 *      authority, deduction SOP, communication cadence) and a 30/60/90 plan.
 *      These reuse the exact operating values already running in the product by
 *      importing them from the intake taxonomy and the case lifecycle, so the
 *      playbook can never drift from the live artifact. They are labeled synthetic
 *      wherever shown.
 */

import {
  PRIORITY_ORDER,
  PRIORITY_LABEL,
  PRIORITY_TARGET,
  DEDUCTION_TYPES,
  VALIDITY_LABEL,
  VALIDITY_GLYPH,
  type PriorityId,
  type ValidityId,
} from "@/components/home/SupportBar/intake";
import { LIFECYCLE } from "@/data/caseBoard";

/* ======================================================================
 * 1. TRACK RECORD — real prior-role results. Not synthetic. Not Samyang.
 * ==================================================================== */

export interface TrackResult {
  id: string;
  /** What changed, in plain terms. */
  change: string;
  /** The headline number. */
  number: string;
  /** A short unit or frame for the number. */
  numberLabel: string;
  /** What Nathan actually did to move it. */
  mechanism: string;
  /** Where this happened. Always a prior role, never Samyang. */
  attribution: string;
}

export const TRACK_RECORD: TrackResult[] = [
  {
    id: "reviews",
    change: "Grew a practice's public reputation from almost no reviews to a deep bank of five-star ratings.",
    number: "10 to 700+",
    numberLabel: "five-star reviews",
    mechanism:
      "Built a consistent post-visit follow-up habit, answered every review in the person's own words, and closed the loop on the complaints that drove the low ones. The rating rose because the service behind it changed, not because reviews were chased.",
    attribution: "Prior role, not Samyang.",
  },
  {
    id: "revenue",
    change: "Held revenue at a seven-figure level across consecutive years while owning the customer relationship end to end.",
    number: "Back-to-back",
    numberLabel: "seven-figure revenue years",
    mechanism:
      "Kept existing customers by making the experience dependable: clear communication, fast issue resolution, and follow-through that earned repeat business and referrals rather than one-time sales.",
    attribution: "Prior role, not Samyang.",
  },
  {
    id: "sops",
    change: "Stopped billing and dispute problems from recurring by fixing the process, not just the ticket.",
    number: "Recurrence",
    numberLabel: "designed out, not patched",
    mechanism:
      "Resolved billing and insurance disputes on the front line, then wrote the SOPs and escalation steps that removed the upstream cause, so the same dispute did not come back the next month.",
    attribution: "Prior role, not Samyang.",
  },
];

/**
 * The honesty line. This is the argument, not a disclaimer to hide. It states
 * plainly what these results are not, so the results that remain are trusted.
 */
export const CANNOT_CLAIM =
  "What I cannot claim: I have not worked at Samyang and hold no Samyang tenure, I have no SAP implementation or configuration experience, and none of the numbers above came from Samyang. They are real results from prior roles, and I attribute them that way on purpose.";

/* ======================================================================
 * 2a. SLA MATRIX — reused verbatim from the intake taxonomy.
 * ==================================================================== */

/** Glyph per priority so the ladder never reads by color alone. */
export const PRIORITY_GLYPH: Record<PriorityId, string> = {
  standard: "○", // ○ open circle
  elevated: "◆", // ◆ diamond
  high: "▲", // ▲ triangle
  critical: "⚠", // ⚠ warning
};

export interface SlaRow {
  id: PriorityId;
  label: string;
  glyph: string;
  ack: string;
  resolve: string;
  /** A concrete case that typically opens at this priority (from the taxonomy). */
  example: string;
}

/** Illustrative example case per priority. Synthetic design. */
const SLA_EXAMPLE: Record<PriorityId, string> = {
  standard: "Bulk order status, SKU availability, new item setup",
  elevated: "Pricing or promo mismatch, invoice dispute",
  high: "Short shipment, late delivery during a promotion, deduction",
  critical: "Line-down or ad-week failure with revenue at risk",
};

/**
 * Built directly from PRIORITY_ORDER, PRIORITY_LABEL, and PRIORITY_TARGET. The
 * ack and resolve strings are the same values the running SupportBar and the
 * case simulator use. If intake.ts changes, this matrix changes with it.
 */
export const SLA_MATRIX: SlaRow[] = PRIORITY_ORDER.map((id) => ({
  id,
  label: PRIORITY_LABEL[id],
  glyph: PRIORITY_GLYPH[id],
  ack: PRIORITY_TARGET[id].ack,
  resolve: PRIORITY_TARGET[id].resolve,
  example: SLA_EXAMPLE[id],
}));

/* ======================================================================
 * 2b. ESCALATION LADDER + APPROVAL AUTHORITY — synthetic governance design.
 * ==================================================================== */

export interface EscalationTier {
  tier: number;
  owner: string;
  holds: string;
  escalateWhen: string;
}

export const ESCALATION_LADDER: EscalationTier[] = [
  {
    tier: 1,
    owner: "Representative",
    holds: "Owns the case, the acknowledgment, and every customer update.",
    escalateWhen: "The acknowledge target is at risk, or resolving it needs authority above the rep line.",
  },
  {
    tier: 2,
    owner: "Team Lead",
    holds: "Owns queue balance and unblocks a stalled case across teams.",
    escalateWhen: "The resolve target is at risk, a supporting team is unresponsive, or a credit exceeds rep authority.",
  },
  {
    tier: 3,
    owner: "CX Manager",
    holds: "Owns the standard, the exceptions, and the account relationship.",
    escalateWhen: "The resolve target is breached, a key account relationship is exposed, or the fix needs a policy or term exception.",
  },
  {
    tier: 4,
    owner: "Cross-functional (Finance, Supply Chain, Sales)",
    holds: "Owns a systemic fix, a financial write-off, or a policy change.",
    escalateWhen: "The issue is systemic across accounts, or disposition needs a write-off or a formal policy decision.",
  },
];

export interface AuthorityRow {
  action: string;
  rep: string;
  lead: string;
  manager: string;
  crossFn: string;
}

/**
 * Who may commit what. Thresholds are synthetic design values for a portfolio
 * artifact, not a Samyang policy. The point is the shape of the governance:
 * every commitment has a named owner and a ceiling.
 */
export const APPROVAL_AUTHORITY: AuthorityRow[] = [
  {
    action: "Service credit or goodwill adjustment",
    rep: "Up to $250",
    lead: "Up to $2,500",
    manager: "Up to $10,000",
    crossFn: "Above $10,000 with Finance",
  },
  {
    action: "Product substitution",
    rep: "Pre-approved equivalents only",
    lead: "Non-standard within the family",
    manager: "Any substitution on record",
    crossFn: "New spec approval with Quality",
  },
  {
    action: "Delivery-date commitment",
    rep: "Published lead time",
    lead: "Expedite within the network",
    manager: "Override that reprioritizes other orders",
    crossFn: "Commitment that changes production with Supply Chain",
  },
  {
    action: "Deduction disposition",
    rep: "Gather backup and classify",
    lead: "Dispute inside the window",
    manager: "Accept a valid deduction",
    crossFn: "Write off with Finance",
  },
  {
    action: "Pricing or term exception",
    rep: "Confirm the agreed price only",
    lead: "Correct a billing error to agreement",
    manager: "Approve a one-time exception",
    crossFn: "Change a standing term with Sales and Finance",
  },
];

/* ======================================================================
 * 2c. DEDUCTION-DISPUTE SOP — reused verbatim from the intake taxonomy.
 * ==================================================================== */

export interface DeductionSopRow {
  id: string;
  label: string;
  validatedBy: string;
  window: string;
  backup: string[];
  rootCause: string;
  validity: ValidityId;
  validityLabel: string;
  validityGlyph: string;
}

/**
 * Mapped straight from DEDUCTION_TYPES, with the validity label and glyph the
 * product already uses. No literals are duplicated: every value comes from
 * intake.ts.
 */
export const DEDUCTION_SOP: DeductionSopRow[] = DEDUCTION_TYPES.map((d) => ({
  id: d.id,
  label: d.label,
  validatedBy: d.validatedBy,
  window: d.window,
  backup: d.backup,
  rootCause: d.rootCause,
  validity: d.validity,
  validityLabel: VALIDITY_LABEL[d.validity],
  validityGlyph: VALIDITY_GLYPH[d.validity],
}));

/* ======================================================================
 * 2d. PROACTIVE COMMUNICATION CADENCE — synthetic standard.
 * ==================================================================== */

export interface CadenceRow {
  moment: string;
  standard: string;
  owner: string;
}

export const COMMUNICATION_CADENCE: CadenceRow[] = [
  {
    moment: "Order confirmed",
    standard: "Send a confirmation that names the committed ship and arrival dates. No silent acceptance.",
    owner: "Representative",
  },
  {
    moment: "In transit, bulk order",
    standard: "Send one dated status update before the account asks. A standing cadence, not a reply.",
    owner: "Representative",
  },
  {
    moment: "At risk (delay, short, or deduction forming)",
    standard: "Tell the account before the promised date, not after, with the revised date and the plan.",
    owner: "Representative, escalated per the ladder",
  },
  {
    moment: "Resolved",
    standard: "Deliver the outcome in writing with the evidence attached. The account never chases the answer.",
    owner: "Case owner",
  },
  {
    moment: "Repeat pattern",
    standard: "If the same issue recurs, share the root cause and the corrective action with the account and the owner.",
    owner: "CX Manager",
  },
];

/* ======================================================================
 * 3. FIRST 90 DAYS — a plan, not a claim.
 * ==================================================================== */

export interface PlanAction {
  text: string;
  /** The artifact on this site the action is tied to. */
  tiedTo: string;
}

export interface PlanPhase {
  id: string;
  window: string;
  theme: string;
  aim: string;
  actions: PlanAction[];
}

/**
 * The final lifecycle stage, reused so the plan names the exact loop the product
 * runs. Improvement review stopped being a stage of its own on 2026-07-09; the
 * root cause and the corrective action are now conditions a case must satisfy
 * before it may sit in the final stage, which is where the loop actually closes.
 */
export const IMPROVEMENT_STAGE: string = LIFECYCLE[LIFECYCLE.length - 1]?.label ?? "Resolved";

export const NINETY_DAY_PLAN: PlanPhase[] = [
  {
    id: "assess",
    window: "Weeks 1 to 4",
    theme: "Assess",
    aim: "Learn the real state before changing anything. Baselines, not opinions.",
    actions: [
      { text: "Read the open queue and set an SLA baseline against the acknowledge and resolve targets already defined.", tiedTo: "SLA matrix" },
      { text: "Pull the deduction backlog by type and aging, and check each against its dispute window.", tiedTo: "Deduction SOP" },
      { text: "Walk one order end to end to see where cases are born in order-to-cash.", tiedTo: "Case lifecycle" },
      { text: "Map team skills and coverage against the intake taxonomy: deductions, EDI, consumer, key accounts.", tiedTo: "Team board" },
    ],
  },
  {
    id: "standup",
    window: "Weeks 5 to 8",
    theme: "Stand up standards",
    aim: "Make the standard explicit, governed, and visible to the whole team.",
    actions: [
      { text: "Publish the SLA matrix and the escalation ladder as the governed standard everyone works to.", tiedTo: "SLA matrix" },
      { text: "Ratify the approval-authority matrix so it is clear who may commit a credit, a substitution, or a date.", tiedTo: "Approval authority" },
      { text: "Put the deduction-dispute SOP into the workflow with required backup and the window enforced.", tiedTo: "Deduction SOP" },
      { text: "Set the proactive-communication cadence so accounts hear from us before they escalate.", tiedTo: "Communication cadence" },
    ],
  },
  {
    id: "improve",
    window: "Weeks 9 to 13",
    theme: "Launch continuous improvement",
    aim: "Turn resolved cases into fewer future cases, and coach the team that runs it.",
    actions: [
      /* Do not interpolate the stage label as a verb. "Improvement review" was once
         a stage of its own and read as a step you run. The final stage is now
         "Resolved", a state a case sits in, and the old sentence rendered as
         "Run the resolved step on repeat cases." Name what the stage requires. */
      { text: `Enforce the root cause and the dated corrective action that every case must carry before it may reach ${IMPROVEMENT_STAGE}, and convert each repeat pattern into an owned change rather than a faster answer.`, tiedTo: "Case lifecycle" },
      { text: "Track fill rate, on-time-in-full, CSAT, and deduction aging as a trend, and tie every move to an action.", tiedTo: "Command center" },
      { text: "Establish the 1:1 and QA cadence with the team so accountability is coached, not assumed.", tiedTo: "Team board" },
      { text: "Review the standard against what actually happened and adjust the targets that did not hold.", tiedTo: "SLA matrix" },
    ],
  },
];
