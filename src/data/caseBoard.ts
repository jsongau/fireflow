/**
 * Case board — the bridge between the Account Support Intake and the Resolution
 * Simulator.
 *
 * Routing a case in the support drawer creates a `RoutedCase`. The simulator
 * then works that same case through a governed seven-stage lifecycle, carrying
 * the owner, SAP SD object, EDI document, priority, and service target it was
 * born with. Intake creates the case; the simulator resolves it.
 *
 * Privacy: a routed case persists only its identifiers (see `homeStore`). The
 * free-text a visitor typed is never written to storage, so on reload the case
 * re-derives its display values from the synthetic prefill in the taxonomy.
 * Everything here is synthetic and labeled.
 */

import {
  ACCOUNT_TYPE,
  CHANNEL_LABEL,
  CX,
  DEDUCTION_TYPES,
  EDI_REF,
  PRIORITY_LABEL,
  PRIORITY_TARGET,
  ROLE_LABEL,
  SAP_OBJECT,
  VALIDITY_LABEL,
  categoriesForRole,
  type CategoryDef,
  type ChannelId,
  type DeductionTypeDef,
  type PriorityId,
  type RoleId,
  type SapObject,
} from "@/components/home/SupportBar/intake";

/**
 * One line in a case's audit trail. A real service desk records who moved a case
 * and when, because "the case moved" is not accountability until it has a name on
 * it. Actors are the synthetic team from `data/team.ts`.
 */
export interface CaseEvent {
  at: number;
  /** Team member id from `data/team.ts`. */
  actorId: string;
  /** Lifecycle index moved from, or null when the case was opened. */
  from: number | null;
  /** Lifecycle index moved to. */
  to: number;
}

export interface RoutedCase {
  /** Synthetic case reference, e.g. FF-4821. */
  id: string;
  createdAt: number;
  role: RoleId;
  categoryId: string;
  priority: PriorityId;
  channel: ChannelId;
  deductionTypeId: string | null;
  /** 0 through LIFECYCLE.length - 1. */
  stageIndex: number;
  /**
   * When the case last changed stage. This is the number a manager reads to know
   * how long a case has sat where it is, which is what tells them what to do next.
   * Stamped on every move; equals createdAt for a case that has never moved.
   */
  enteredStageAt: number;
  /**
   * Manual board position within a column. Lower sorts first. Seeded values are
   * spaced (100, 200, 300...) so a card can be dropped BETWEEN two others by
   * taking the midpoint, without renumbering the whole column. See orderBetween.
   */
  order: number;
  /** Newest last. Persisted (ids and timestamps only, no free text). */
  history?: CaseEvent[];

  /* Session-only display values. Never persisted (may contain typed text).
     Seeded cases re-attach these from static code on reload. */
  account?: string;
  product?: string;
  orderRef?: string;
  /** The inquiry as the account worded it. */
  inquiry?: string;
}

/**
 * Stable identity for each lifecycle stage. The lifecycle is keyed by NAME, not
 * position, because inserting a stage (as "in-progress" was inserted after
 * "reported") shifts every numeric index. Anything that needs to know "is this
 * case at least routed?" must ask by key, never by a hard-coded number, or a
 * single insert silently mislabels every case.
 */
export type StageKey =
  | "reported"
  | "in-progress"
  | "verified"
  | "resolution-proposed"
  | "resolved";

/**
 * The governed lifecycle every routed case moves through, in order.
 *
 * FIVE stages, cut down from eight on 2026-07-09 so the board fits one screen
 * without a horizontal scroll. What went, and where it went:
 *
 *   Routed              folded into In progress. Routing is not a waiting room,
 *                       it is a property of a case someone is already working:
 *                       either Customer Experience holds it, or it has gone to
 *                       the function that owns the determination. `isRoutedOut`
 *                       derives which, from the category's owner, so a small case
 *                       CX can close itself never looks like it is waiting on
 *                       another team.
 *   Customer updated    folded into Resolved. Telling the account is not a stage
 *                       a case rests in; it is one of the things that must be
 *                       true before a case may be called resolved.
 *   Improvement review  folded into Resolved. Its work survives as follow-up
 *                       actions (the SOP update and the logged corrective action)
 *                       that a resolved case still carries.
 *
 * Nothing is compared by index anywhere. Every consumer asks for a stage by name.
 */
export const LIFECYCLE: { key: StageKey; label: string }[] = [
  { key: "reported", label: "Reported" },
  { key: "in-progress", label: "In progress" },
  { key: "verified", label: "Verified" },
  { key: "resolution-proposed", label: "Resolution proposed" },
  { key: "resolved", label: "Resolved" },
];

/** Labels alone, for the audit trail and any code that only needs the words. */
export const LIFECYCLE_LABELS: string[] = LIFECYCLE.map((s) => s.label);

export const LAST_STAGE = LIFECYCLE.length - 1;

/** The stage key at a given index, defaulting to "reported" when out of range. */
export function stageKeyAt(index: number): StageKey {
  return LIFECYCLE[index]?.key ?? "reported";
}

/** The index of a stage key, or -1 if unknown. */
export function indexOfStage(key: StageKey): number {
  return LIFECYCLE.findIndex((s) => s.key === key);
}

/**
 * True when a case at `index` has reached at least the stage named by `key`.
 * This is how progressive UI unlocks panels without hard-coding a number that a
 * future insert would break.
 */
export function stageAtLeast(index: number, key: StageKey): boolean {
  return index >= indexOfStage(key);
}

/**
 * Compute a manual-order value that sorts between two neighbors. Pass the order
 * of the card that should sit before (or null for the top) and after (or null
 * for the bottom). Spacing the seed values by 100 leaves room to insert by
 * midpoint many times before the numbers would need a renumber.
 */
export function orderBetween(before: number | null, after: number | null): number {
  if (before === null && after === null) return 100;
  if (before === null) return after! - 100;
  if (after === null) return before + 100;
  return (before + after) / 2;
}

export interface DerivedCase {
  category: CategoryDef;
  deductionType: DeductionTypeDef | null;
  roleLabel: string;
  accountType: string;
  priorityLabel: string;
  ack: string;
  resolve: string;
  sap: SapObject | undefined;
  ediRef: string | undefined;
  channelLabel: string;
  account: string;
  product: string;
  orderRef: string;
}

/**
 * Is this case being worked outside Customer Experience?
 *
 * "Routed" used to be a column, which made every case look like it was waiting on
 * another department. Most are not. A SKU availability question or a bulk order
 * status check is owned by CX and closed by CX, and a board that shows it parked
 * in a Routed lane teaches a manager to look for a handoff that never happened.
 *
 * Derived from the category's owner rather than stored, so it can never disagree
 * with the routing the intake actually performed.
 */
export function isRoutedOut(d: DerivedCase): boolean {
  return d.category.owner !== CX;
}

/** "Held in Customer Experience" or "Routed to Supply Chain". Always a full phrase. */
export function handlingLabel(d: DerivedCase): string {
  return isRoutedOut(d) ? `Routed to ${d.category.owner}` : "Held in Customer Experience";
}

/** "Same business day" reads as "by the same business day"; others take "within". */
function resolutionPhrase(target: string): string {
  const t = target.trim();
  return /^same/i.test(t) ? `by the ${t.toLowerCase()}` : `within ${t.toLowerCase()}`;
}

/**
 * Rebuild everything displayable from the taxonomy. Only ids are persisted, so
 * this is what makes a reloaded case whole again.
 */
export function deriveCase(c: RoutedCase): DerivedCase | null {
  const category = categoriesForRole(c.role).find((x) => x.id === c.categoryId);
  if (!category) return null;

  const deductionType = c.deductionTypeId
    ? DEDUCTION_TYPES.find((d) => d.id === c.deductionTypeId) ?? null
    : null;

  const target = PRIORITY_TARGET[c.priority];
  const p = category.prefill;

  const fallbackProduct = p.sku ?? p.product ?? p.reference ?? "Not specified";
  const fallbackRef =
    [p.po, p.order, p.invoice].filter(Boolean).join(", ") || "Not provided";

  return {
    category,
    deductionType,
    roleLabel: ROLE_LABEL[c.role],
    accountType: ACCOUNT_TYPE[c.role],
    priorityLabel: PRIORITY_LABEL[c.priority],
    ack: target.ack,
    resolve: target.resolve,
    sap: SAP_OBJECT[c.categoryId],
    ediRef: EDI_REF[c.categoryId],
    channelLabel: CHANNEL_LABEL[c.channel],
    account: c.account?.trim() || p.account || "The account",
    product: c.product?.trim() || fallbackProduct,
    orderRef: c.orderRef?.trim() || fallbackRef,
  };
}

/**
 * Stage-aware narration. The case does not reveal everything at once: the owner
 * is not named until it is routed, the commitment does not exist until the
 * customer is updated, and the root cause only surfaces at the improvement review.
 */
export function stageDetail(c: RoutedCase, d: DerivedCase, stageKey: StageKey): string {
  switch (stageKey) {
    case "reported":
      return `Case ${c.id} is open as a ${d.category.caseType.toLowerCase()} for ${d.account}, raised through ${d.channelLabel.toLowerCase()}. ${d.category.scenario}`;

    case "in-progress": {
      /* Routing is a property of this stage, not a stage of its own. Say which
         way it went, because a case CX can close itself is a different case from
         one waiting on another function's determination. */
      const support = d.category.supporting.length
        ? ` Supporting: ${d.category.supporting.join(", ")}.`
        : "";
      const sap = d.sap
        ? ` In SAP SD (aligned) this touches ${d.sap.label}${d.sap.ref ? `, ${d.sap.ref}` : ""}.`
        : "";
      const routing = isRoutedOut(d)
        ? `It is routed to ${d.category.owner}, who owns the investigation and the determination.${support}${sap} Customer Experience keeps the account and the next update.`
        : `Customer Experience holds it. This is a case the team can research and close without a handoff, so it does not wait on another function's queue.${sap}`;
      return `Case ${c.id} has been picked up and ${d.account} has been acknowledged, so they know it is being worked rather than waiting for a reply. ${routing} Nothing is promised yet: the facts still have to be separated from assumptions.`;
    }

    case "verified": {
      const doc = d.ediRef
        ? `The claim is checked against the ${d.ediRef}.`
        : "The claim is checked against the order record.";
      return `Facts are separated from assumptions. Confirmed: the account, the affected product (${d.product}), and the reference (${d.orderRef}). ${doc} Nothing is promised to the customer yet.`;
    }

    case "resolution-proposed": {
      if (d.deductionType) {
        return `${d.category.nextAction} The deduction is typed as ${d.deductionType.label.toLowerCase()} and reads as ${VALIDITY_LABEL[
          d.deductionType.validity
        ].toLowerCase()}. Backup required: ${d.deductionType.backup.join(", ")}. Window: ${d.deductionType.window}`;
      }
      return `${d.category.nextAction} The proposal is written down before anyone commits to it, and the approvals it needs are named.`;
    }

    case "resolved": {
      /* Resolved absorbed "Customer updated" and "Improvement review". Both of
         those were things that must be TRUE before a case may be called closed,
         not places a case rests. So the close condition states all three: the
         account was told, the outcome is measured, and the cause is logged. */
      const cause = d.deductionType ? d.deductionType.rootCause : d.category.rootCause;
      return `The account was acknowledged within ${d.ack}, promised an update ${resolutionPhrase(
        d.resolve,
      )}, and has the answer in writing from one named person rather than a queue. The outcome is measured against ${d.category.metric} and the evidence is attached to the case. Root cause: ${cause} The corrective action is owned and dated, because a case that repeats is a process defect and not a new ticket.`;
    }

    default:
      return "";
  }
}

/** Facts revealed at the Verified stage. */
export function verifiedFacts(d: DerivedCase): string[] {
  const facts = [
    `Account: ${d.account} (${d.accountType.toLowerCase()})`,
    `Affected product: ${d.product}`,
    `Order or invoice reference: ${d.orderRef}`,
    `Arrived through: ${d.channelLabel}${d.ediRef ? `, ${d.ediRef}` : ""}`,
  ];
  if (d.deductionType) facts.push(`Deduction type: ${d.deductionType.label}`);
  return facts;
}

/** "Grace H." becomes "GH". Used for the audit trail stamp. */
export function initialsFor(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const letters = parts.map((p) => p.charAt(0).toUpperCase()).filter((c) => /[A-Z]/.test(c));
  return letters.slice(0, 2).join("") || "??";
}

/** Plain sentence for one audit line, e.g. "Moved Verified to Routed". */
export function describeEvent(e: CaseEvent): string {
  if (e.from === null) return `Opened as ${LIFECYCLE_LABELS[e.to] ?? "Reported"}`;
  const from = LIFECYCLE_LABELS[e.from] ?? "";
  const to = LIFECYCLE_LABELS[e.to] ?? "";
  return `Moved ${from} to ${to}`;
}

/* -------------------------------------------------------------------------- */
/* Closing the loop                                                           */
/*                                                                            */
/* A case is not finished when it is marked resolved. The account has to hear */
/* it closed, the team that fixed it has to be told, the process has to carry */
/* the correction, and the root cause has to be logged so it does not return. */
/* These are the follow-ups a manager actually sends.                         */
/* -------------------------------------------------------------------------- */

export interface FollowUp {
  id: string;
  label: string;
  detail: string;
}

/**
 * The close-the-loop actions for a case, tailored by type. Only Resolved returns
 * anything: before then there is nothing to close. Each detail is one or two
 * plain sentences a manager could paste as is.
 *
 * When "Improvement review" was a stage of its own, half of these lived there,
 * which meant a case could be marked resolved with the root cause never logged.
 * Folding that stage into Resolved put all four actions on the same case, where a
 * manager has to look at them before calling it closed. Removing the column made
 * the process stricter, not looser.
 */
export function followUpsFor(d: DerivedCase, stageKey: StageKey): FollowUp[] {
  if (stageKey !== "resolved") return [];

  const subject = d.deductionType
    ? `the ${d.deductionType.label.toLowerCase()} deduction`
    : `the ${d.category.label.toLowerCase()} case`;
  const cause = d.deductionType ? d.deductionType.rootCause : d.category.rootCause;

  return [
    {
      id: "close-loop-account",
      label: "Close the loop with the account",
      detail: `Confirm to ${d.account} that ${subject} is resolved and the outcome is in writing. Thank them for working it with us, and let them know they can flag anything else on the order directly.`,
    },
    {
      id: "notify-team",
      label: "Notify the responsible team",
      detail: `Thank ${d.category.owner} for closing this one. Note that the fix protected ${d.category.metric}, so the team sees the number their work moved.`,
    },
    {
      id: "send-sop",
      label: "Send the SOP update",
      detail: `Send the updated procedure to the team so ${subject} does not recur. Say plainly what changed, and confirm that ${d.category.owner} owns the step going forward.`,
    },
    {
      id: "log-corrective",
      label: "Log the corrective action",
      detail: `Record the root cause with the case so it does not come back: ${cause} Note the dated corrective action, and treat a repeat as a process defect rather than a new ticket.`,
    },
  ];
}

/**
 * A short internal note a manager could reuse when closing a case. Factual and
 * unsentimental, it states that the account cooperated and thanked the team.
 */
export function resolutionNote(d: DerivedCase): string {
  const subject = d.deductionType
    ? `the ${d.deductionType.label.toLowerCase()} deduction`
    : d.category.label.toLowerCase();
  return `${d.account} case closed. ${subject.charAt(0).toUpperCase()}${subject.slice(1)} was resolved and measured against ${d.category.metric}. The account cooperated through the review and thanked the team for the turnaround. Root cause is logged so the case does not return.`;
}

/** Human "3 minutes ago" for the synthetic case clock. */
export function formatAge(ms: number): string {
  const s = Math.max(0, Math.floor(ms / 1000));
  if (s < 45) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m} minute${m === 1 ? "" : "s"} ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} hour${h === 1 ? "" : "s"} ago`;
  const days = Math.floor(h / 24);
  return `${days} day${days === 1 ? "" : "s"} ago`;
}
