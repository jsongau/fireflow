/**
 * Escalation rules — the SOP, written down once and executed.
 *
 * WHY THIS FILE EXISTS. An escalation standard that lives in a document and a
 * routing check that lives in code will drift, and the drift is invisible until
 * a rep follows the document and the system does something else. So the rules
 * live here, the running intake check evaluates them, and the published standard
 * on /leadership#standards renders the same table. Neither can move alone.
 *
 * HONESTY. Every threshold below is a PROPOSED OPERATING TARGET for this
 * portfolio, not an industry benchmark. There is no published CPG standard for
 * a reship authority ceiling or a repeat-issue trigger, and anyone quoting one
 * as sourced is guessing. On a real book of business these get set against the
 * actual dispute windows, the actual approval culture, and the actual volume,
 * and then they get measured. `THRESHOLD_BASIS` says exactly that on screen.
 *
 * ACCESSIBILITY. A rule's outcome is never a color. Each evaluated rule returns
 * a `met` boolean that the UI renders as a word and a glyph ("Met ▲" / "Not met
 * ○"). The console this idea came from used red for triggered and green for
 * clear, which is unreadable to the person who built this site.
 */

import { CX } from "@/components/home/SupportBar/intake";
import type { CategoryDef, PriorityId } from "@/components/home/SupportBar/intake";

/* The authority ladder lives here rather than in team.ts, because team.ts needs
   these ceilings to render its matrix and escalation.ts needs the ladder to rank
   them. One import direction, no cycle. team.ts re-exports both for its existing
   consumers. */
export const APPROVAL_LEVELS = ["Rep", "Senior Rep", "Team Lead", "Manager"] as const;
export type ApprovalLevel = (typeof APPROVAL_LEVELS)[number];

/* -------------------------------------------------------------------------- */
/* Authority ceilings                                                          */
/*                                                                            */
/* The numbers are the source. team.ts renders its approval matrix strings from */
/* these, so the ladder a visitor reads on the standards page is the ladder the */
/* intake check climbs. Synthetic, and labeled synthetic wherever they render.  */
/* -------------------------------------------------------------------------- */

/** Cases a level may reship or replace without going up. */
export const RESHIP_CEILING: Record<Exclude<ApprovalLevel, "Manager">, number> = {
  Rep: 3,
  "Senior Rep": 10,
  "Team Lead": 25,
};

/** Dollars of credit or goodwill a level may commit without going up. */
export const CREDIT_CEILING: Record<Exclude<ApprovalLevel, "Manager">, number> = {
  Rep: 250,
  "Senior Rep": 1_000,
  "Team Lead": 5_000,
};

/**
 * A deduction a team lead may accept outright rather than dispute. Deliberately
 * lower than the same level's credit ceiling: writing off a retailer's claim
 * without proof is a different decision from issuing a goodwill credit, and it
 * should cost more approval, not less.
 */
export const CHARGEBACK_ACCEPT_CEILING = 2_500;

/**
 * Open cases in one category, for one account, before the case stops being an
 * incident and starts being a pattern. Proposed, and deliberately low: the point
 * of a trigger is to fire before the account has to tell us it is a pattern.
 */
export const REPEAT_ISSUE_TRIGGER = 3;

export const THRESHOLD_BASIS =
  "Proposed operating targets for this portfolio, not industry benchmarks. No published CPG standard sets a reship ceiling or a repeat-issue trigger. On a real book of business I would set these against the actual dispute windows and volume, then measure whether they fire too often or too late.";

/** The lowest level whose ceiling covers this many cases. */
export function levelForCases(cases: number): ApprovalLevel {
  for (const level of APPROVAL_LEVELS) {
    if (level === "Manager") return "Manager";
    if (cases <= RESHIP_CEILING[level]) return level;
  }
  return "Manager";
}

/** The lowest level whose ceiling covers this credit amount. */
export function levelForCredit(dollars: number): ApprovalLevel {
  for (const level of APPROVAL_LEVELS) {
    if (level === "Manager") return "Manager";
    if (dollars <= CREDIT_CEILING[level]) return level;
  }
  return "Manager";
}

/** How far up the ladder a level sits. Higher index, higher authority. */
export function rankOf(level: ApprovalLevel): number {
  return APPROVAL_LEVELS.indexOf(level);
}

/* -------------------------------------------------------------------------- */
/* The SOP register                                                            */
/*                                                                            */
/* Derived from the intake taxonomy, never hand-maintained. A register that is  */
/* typed out separately from the categories it governs will list a procedure    */
/* nobody runs, and omit one everybody does.                                    */
/* -------------------------------------------------------------------------- */

export const SOP_FAMILIES: Record<string, string> = {
  OM: "Order management",
  DE: "Delivery exceptions",
  BD: "Billing and deductions",
  PR: "Pricing",
  MD: "Master data",
  QA: "Product and quality",
  CN: "Consumer",
};

/** The family key of an SOP code, e.g. "SOP-DE-01" gives "DE". */
export function familyOf(sop: string): string {
  return sop.split("-")[1] ?? "";
}

/* -------------------------------------------------------------------------- */
/* The rules                                                                   */
/* -------------------------------------------------------------------------- */

export interface EscalationContext {
  category: CategoryDef;
  priority: PriorityId;
  /** Cases short or damaged, when the form captured enough to compute it. */
  casesAffected: number | null;
  /** Is this case a deduction, and does it carry a dispute clock? */
  deductionLabel: string | null;
  deductionWindow: string | null;
  /** Open cases already on the board in this category. Drives the pattern rule. */
  priorInCategory: number;
}

export interface RuleResult {
  id: string;
  /** What the rule checks, stated as the SOP states it. */
  rule: string;
  /** What this case's data actually was. Rendered verbatim in the trace. */
  finding: string;
  /** True when the rule fired. Never rendered as color alone. */
  met: boolean;
  /** The authority this rule demands, when it fires. */
  requires: ApprovalLevel | null;
  /** What happens because it fired. Empty when it did not. */
  consequence: string;
}

export interface EscalationVerdict {
  results: RuleResult[];
  escalated: boolean;
  /** The highest authority any fired rule demands. */
  requiredLevel: ApprovalLevel;
  /** Teams pulled in beyond the first point of contact. */
  bringIn: string[];
  headline: string;
  detail: string;
}

/** Evaluate the standard against one case. Pure: same inputs, same trace. */
export function evaluateEscalation(ctx: EscalationContext): EscalationVerdict {
  const results: RuleResult[] = [];

  /* Rule 1. Service level. A high or critical case has a same-day clock, and a
     clock nobody is watching is the failure mode. */
  const urgent = ctx.priority === "high" || ctx.priority === "critical";
  results.push({
    id: "priority",
    rule: "A high or critical case is acknowledged inside the business hour and worked the same business day.",
    finding: `This case is ${ctx.priority} priority.`,
    met: urgent,
    requires: urgent ? "Team Lead" : null,
    consequence: urgent
      ? "A team lead is named on the case at intake, so the same-day clock has an owner rather than a queue."
      : "",
  });

  /* Rule 2. Reship authority. The size of the make-good decides who may promise
     it, and the rep should know before they open their mouth to the account.

     Only evaluated where a reship is actually the remedy. The `order` field set
     also carries a "case quantity affected" field, and reading it here would tell
     someone checking on an order status that their inquiry needs a manager's
     approval to reship, which is nonsense. A rule that fires on the wrong case
     type teaches the team to ignore the rules. */
  const reshipIsTheRemedy = ctx.category.fieldSet === "shortship";
  if (reshipIsTheRemedy && ctx.casesAffected !== null && ctx.casesAffected > 0) {
    const level = levelForCases(ctx.casesAffected);
    const beyondRep = rankOf(level) > rankOf("Rep");
    results.push({
      id: "reship",
      rule: `A rep may reship up to ${RESHIP_CEILING.Rep} cases, a senior rep up to ${RESHIP_CEILING["Senior Rep"]}, a team lead up to ${RESHIP_CEILING["Team Lead"]}. Above that it is a manager's call.`,
      finding: `${ctx.casesAffected} case${ctx.casesAffected === 1 ? "" : "s"} affected.`,
      met: beyondRep,
      requires: beyondRep ? level : null,
      consequence: beyondRep
        ? `A make-good of this size needs ${level} authority. It is approved before it is offered, so nothing is promised and then walked back.`
        : "",
    });
  }

  /* Rule 3. The dispute clock. A deduction is the one case type where the
     account's own retailer imposes a deadline on us. */
  if (ctx.deductionLabel && ctx.deductionWindow) {
    results.push({
      id: "deduction",
      rule: "A deduction is routed to Finance with its dispute window on the case from the first hour.",
      finding: `${ctx.deductionLabel} deduction. Dispute window: ${ctx.deductionWindow.toLowerCase()}`,
      met: true,
      requires: "Senior Rep",
      consequence:
        "Finance validates the claim and the case carries its window, because the window is the deadline the retailer set and it does not move for us.",
    });
  }

  /* Rule 4. The pattern. The rule that turns a queue into a signal. It reads the
     live board, so filing a case can trip it in front of you. */
  const repeat = ctx.priorInCategory >= REPEAT_ISSUE_TRIGGER;
  results.push({
    id: "pattern",
    rule: `${REPEAT_ISSUE_TRIGGER} or more open cases in one category stop being incidents and get a root cause owner.`,
    finding: `${ctx.priorInCategory} open case${ctx.priorInCategory === 1 ? "" : "s"} in ${ctx.category.label.toLowerCase()}.`,
    met: repeat,
    requires: repeat ? "Manager" : null,
    consequence: repeat
      ? `This goes on the leadership pattern report and ${ctx.category.owner} is asked for a root cause, rather than the same complaint arriving as separate tickets until someone notices.`
      : "",
  });

  const fired = results.filter((r) => r.met);
  const escalated = fired.length > 0;

  const requiredLevel = fired.reduce<ApprovalLevel>((highest, r) => {
    if (!r.requires) return highest;
    return rankOf(r.requires) > rankOf(highest) ? r.requires : highest;
  }, "Rep");

  /* Who comes in beyond first contact. Only populated when something actually
     fired: a case that closes at first contact must not simultaneously list three
     teams it is going to. The verdict and this list are read side by side, and a
     panel that says "Nobody. It closes here." above a row naming Finance is worse
     than a panel that says nothing. */
  const bringIn = escalated
    ? Array.from(
        new Set([
          ...(ctx.deductionLabel ? ["Finance"] : []),
          ctx.category.owner,
          ...ctx.category.supporting,
        ]),
      ).filter((t) => t !== CX)
    : [];

  return {
    results,
    escalated,
    requiredLevel,
    bringIn,
    headline: escalated ? "Routed beyond first contact" : "Handled at first contact",
    detail: escalated
      ? `${fired.length} of ${results.length} rules fired. This case needs ${requiredLevel} authority before anything is committed to the account, and Customer Experience keeps the account and the next update throughout.`
      : `No rule fired. This stays with the first Customer Experience rep who picks it up, on the standard clock, and they have the authority to close it without asking anyone.`,
  };
}
