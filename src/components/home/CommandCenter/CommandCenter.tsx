import { useState } from "react";
import { Link } from "react-router-dom";
import { useHome } from "@/state/homeStore";
import { SCENARIOS } from "@/data/scenarios";
import { ISSUE_BY_ID } from "@/data/issues";
import { FAMILY_BY_ID } from "@/data/families";
import { SAMPLE_STANDING_ORDERS } from "@/data/standingOrders";
import { SAMPLE_QUOTES } from "@/data/quotes";
import { formatCents } from "@/data/skus";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import type { ResolutionScenario, Severity, IssueRelatesTo } from "@/types/domain";
import styles from "./CommandCenter.module.css";

/*
 * CX Command Center — a manager's synthetic case queue.
 * Job competency this demonstrates: order-management ownership (one accountable
 * owner + next-update commitment per case), SLA discipline (exposure and overdue
 * updates surfaced, not buried), and CX leadership (a triage cockpit where every
 * KPI drills into the underlying cases). ALL operational counts are SYNTHETIC.
 */

type FilterId = "all" | "sla" | "overdue" | "deductions" | "product" | "fulfillment";

interface Tile {
  id: FilterId;
  label: string;
  hint: string;
  match: (s: ResolutionScenario) => boolean;
}

/** What an account case is anchored to in order-to-cash (via its issue). */
const relationOf = (s: ResolutionScenario): IssueRelatesTo =>
  ISSUE_BY_ID[s.issueId]?.relatesTo ?? "order";

/* Product/packaging concern issue codes used to derive the "Product concerns" tile. */
const PRODUCT_ISSUE_IDS = ["v-damaged-cases", "v-packaging-concern"];

/* Every tile drills down: `match` both derives the headline count and filters
 * the queue below, so the number a manager sees always equals the list. */
const TILES: Tile[] = [
  { id: "all", label: "Open cases", hint: "Everything in the queue", match: () => true },
  {
    id: "sla",
    label: "SLA exposure",
    hint: "Priority / specialist: tightest clocks",
    match: (s) => s.severity === "priority" || s.severity === "specialist",
  },
  {
    id: "overdue",
    label: "Overdue customer updates",
    hint: "Elevated cases awaiting the next commitment",
    match: (s) => s.severity === "elevated",
  },
  {
    id: "deductions",
    label: "Open deductions",
    hint: "Retailer chargebacks to reconcile",
    match: (s) => s.issueId === "v-deduction",
  },
  {
    id: "product",
    label: "Product concerns",
    hint: "Damaged cases, packaging integrity",
    match: (s) => PRODUCT_ISSUE_IDS.includes(s.issueId),
  },
  {
    id: "fulfillment",
    label: "Fulfillment exceptions",
    hint: "Short ships, delays, delivery damage",
    match: (s) => relationOf(s) === "delivery",
  },
];

const SEVERITY_LABEL: Record<Severity, string> = {
  standard: "Standard", elevated: "Elevated", priority: "Priority", specialist: "Specialist",
};

/* Colorblind-safe relation labels + shape glyphs (never color alone). */
const RELATION_LABEL: Record<IssueRelatesTo, string> = {
  order: "Order", quote: "Quote", "standing-order": "Standing order", delivery: "Delivery", invoice: "Invoice",
};
const RELATION_GLYPH: Record<IssueRelatesTo, string> = {
  order: "▦", quote: "◆", "standing-order": "◈", delivery: "▤", invoice: "▣",
};

/* ------------------------------------------------------------------ */
/* Service & cost-to-serve scorecard                                   */
/*                                                                     */
/* Ties the ordering flows (standing orders, quotes, deductions) to    */
/* the CX metrics the role owns: fill rate, OTIF, CSAT, and the        */
/* cost-to-serve those metrics are meant to protect. All SYNTHETIC.    */
/* Status is shown by word + shape glyph, never color alone.           */
/* ------------------------------------------------------------------ */

type Tone = "good" | "watch" | "risk";
const TONE: Record<Tone, { glyph: string; word: string }> = {
  good: { glyph: "✓", word: "On target" },   // check
  watch: { glyph: "◑", word: "Watch" },        // half circle
  risk: { glyph: "▽", word: "Below target" },  // open triangle
};

interface ScoreCard {
  id: string;
  value: string;
  sub?: string;
  label: string;
  tone: Tone;
  why: string;
}

const casesOf = (lines: { cases: number }[]) => lines.reduce((n, l) => n + l.cases, 0);
const daysUntil = (iso: string) => Math.ceil((Date.parse(iso) - Date.now()) / 86_400_000);
/** Whole-dollar formatter for the driver model, so assumptions read as clean figures. */
const usd0 = (cents: number) => `$${Math.round(cents / 100).toLocaleString("en-US")}`;

/**
 * Account CSAT is not measured in this synthetic model, so it is shown as an
 * explicit illustrative constant rather than derived from queue data. It sits
 * below the 4.5 target on purpose: a real open queue is rarely on target, and a
 * placeholder that exactly matched its own target would read as invented.
 */
const CSAT_ILLUSTRATIVE = 4.3;

/* ------------------------------------------------------------------ */
/* Cost-to-serve driver model                                          */
/*                                                                     */
/* Exposure is built from named drivers, each with an explicit unit    */
/* assumption shown on screen and an open count read from the live     */
/* queue, so the total is visibly derived rather than a single         */
/* conjured number. Every unit cost is an ILLUSTRATIVE assumption.     */
/* ------------------------------------------------------------------ */

interface CostDriver {
  id: string;
  label: string;
  /** The illustrative per-unit assumption, in cents. */
  unitCents: number;
  /** What the unit measures, e.g. "per open deduction". */
  unitLabel: string;
  /** Open count from the live synthetic queue. */
  count: number;
}

const countIssues = (ids: string[]) => SCENARIOS.filter((s) => ids.includes(s.issueId)).length;

function buildCostModel(): { drivers: CostDriver[]; totalCents: number; tone: Tone } {
  const drivers: CostDriver[] = [
    { id: "deductions", label: "Open deductions", unitCents: 125_000, unitLabel: "per open deduction", count: countIssues(["v-deduction"]) },
    { id: "expedites", label: "Expedited freight", unitCents: 85_000, unitLabel: "per expedite", count: countIssues(["v-delivery-delay"]) },
    { id: "returns", label: "Returns and unsaleables", unitCents: 60_000, unitLabel: "per case reversed", count: countIssues(["v-damaged-cases", "v-packaging-concern"]) },
    { id: "manual", label: "Manual order entry", unitCents: 4_500, unitLabel: "per order keyed by hand", count: countIssues(["v-edi"]) },
    { id: "shortship", label: "Short-ship recovery", unitCents: 30_000, unitLabel: "per short-ship reconciled", count: countIssues(["v-partial-fill"]) },
  ];
  const totalCents = drivers.reduce((n, d) => n + d.unitCents * d.count, 0);
  const tone: Tone = totalCents > 200_000 ? "risk" : totalCents > 0 ? "watch" : "good";
  return { drivers, totalCents, tone };
}

/** Build the synthetic scorecard from the ordering + case data. */
function buildScorecard(): ScoreCard[] {
  const totalCases = SAMPLE_STANDING_ORDERS.reduce((n, o) => n + casesOf(o.lines), 0);
  const fillRate = totalCases
    ? Math.round(SAMPLE_STANDING_ORDERS.reduce((n, o) => n + o.fillRatePct * casesOf(o.lines), 0) / totalCases)
    : 0;
  const lateCount = SCENARIOS.filter((s) => relationOf(s) === "delivery").length;
  const otif = Math.max(0, fillRate - lateCount * 2); // synthetic proxy: fill less late shipments
  const csat = CSAT_ILLUSTRATIVE;

  const openQuotes = SAMPLE_QUOTES.filter((q) => q.status === "submitted" || q.status === "in-review");
  const openQuoteValue = openQuotes.reduce((n, q) => n + q.subtotalCents, 0);
  const dueSoon = SAMPLE_STANDING_ORDERS.filter((o) => o.status !== "paused" && daysUntil(o.nextShipDate) <= 7).length;

  return [
    {
      id: "fill",
      value: `${fillRate}%`,
      sub: "Target 98%",
      label: "Fill rate",
      tone: fillRate >= 98 ? "good" : fillRate >= 95 ? "watch" : "risk",
      why: "Standing orders shipped complete. Recurring replenishment is what holds this line steady.",
    },
    {
      id: "otif",
      value: `${otif}%`,
      sub: "Target 95%",
      label: "On-time-in-full",
      tone: otif >= 95 ? "good" : otif >= 92 ? "watch" : "risk",
      why: "Delivered complete and on the promised date. Short ships and delays pull it down.",
    },
    {
      id: "csat",
      value: `${csat.toFixed(1)}/5`,
      sub: "Target 4.5",
      label: "Account CSAT",
      tone: csat >= 4.5 ? "good" : csat >= 4.0 ? "watch" : "risk",
      why: "A target, not a measured result. Real CSAT comes from post-case surveys.",
    },
    {
      id: "quotes",
      value: `${openQuotes.length}`,
      sub: `${formatCents(openQuoteValue)} in play`,
      label: "Open quotes",
      tone: openQuotes.length > 2 ? "watch" : "good",
      why: "RFQs awaiting a price. Revenue waiting on a same-day turnaround commitment.",
    },
    {
      id: "due",
      value: `${dueSoon}`,
      sub: "Next 7 days",
      label: "Standing orders due",
      tone: dueSoon > 2 ? "watch" : "good",
      why: "Recurring shipments landing soon. Forecast and stock have to be ready before they auto-release.",
    },
  ];
}

export function CommandCenter() {
  const { dispatch } = useHome();
  const [filter, setFilter] = useState<FilterId>("all");

  const active = TILES.find((t) => t.id === filter) ?? TILES[0];
  const queue = active ? SCENARIOS.filter(active.match) : SCENARIOS;
  const scorecard = buildScorecard();
  const cost = buildCostModel();

  return (
    <section id="command" className={styles.section} aria-labelledby="command-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Operate</p>
            <h2 id="command-h" className={styles.h2}>CX Command Center</h2>
            <p className={styles.lede}>
              A manager&rsquo;s triage cockpit: SLA exposure, overdue updates, open deductions and product
              concerns at a glance. Every tile drills into the cases behind the number. Pick one and the
              queue below filters to match.
            </p>
          </div>
        </div>

        <div className={styles.scorecard}>
          <div className={styles.scoreHead}>
            <h3 className={styles.scoreTitle}>Service and cost-to-serve scorecard</h3>
            <p className={styles.scoreNote}>
              The ordering flows feed the metrics this role is accountable for.
            </p>
          </div>
          <div className={styles.scoreGrid} role="group" aria-label="Service and cost-to-serve metrics">
            {scorecard.map((c) => (
              <div key={c.id} className={styles.scoreCard} data-tone={c.tone}>
                <div className={styles.scoreTop}>
                  <span className={styles.scoreValue}>{c.value}</span>
                  <span className={styles.scoreStatus} data-tone={c.tone}>
                    <span aria-hidden="true">{TONE[c.tone].glyph}</span> {TONE[c.tone].word}
                  </span>
                </div>
                <p className={styles.scoreLabel}>{c.label}</p>
                {c.sub && <p className={styles.scoreSub}>{c.sub}</p>}
                <p className={styles.scoreWhy}>{c.why}</p>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.drivers}>
          <div className={styles.scoreHead}>
            <h3 className={styles.scoreTitle}>Cost-to-serve driver model</h3>
            <p className={styles.scoreNote}>
              Exposure is built from named drivers, not one number. Each unit cost is an explicit
              assumption and each count is read from the open queue, so the total is
              visibly derived.
            </p>
          </div>
          <div className={styles.driverWrap}>
            <table className={styles.driverTable}>
              <thead>
                <tr>
                  <th scope="col">Driver</th>
                  <th scope="col">Unit assumption</th>
                  <th scope="col" className={styles.numCol}>Open in queue</th>
                  <th scope="col" className={styles.numCol}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {cost.drivers.map((d) => (
                  <tr key={d.id}>
                    <th scope="row" className={styles.driverName}>{d.label}</th>
                    <td>{usd0(d.unitCents)} {d.unitLabel}</td>
                    <td className={styles.numCol}>{d.count}</td>
                    <td className={styles.numCol}>{usd0(d.unitCents * d.count)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <th scope="row" colSpan={3} className={styles.driverTotalLabel}>
                    Open cost-to-serve exposure
                    <span className={styles.scoreStatus} data-tone={cost.tone}>
                      <span aria-hidden="true">{TONE[cost.tone].glyph}</span> {TONE[cost.tone].word}
                    </span>
                  </th>
                  <td className={`${styles.numCol} ${styles.driverTotal}`}>{usd0(cost.totalCents)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>

        <div className={styles.tiles} role="group" aria-label="Case-queue filters">
          {TILES.map((t) => {
            const count = SCENARIOS.filter(t.match).length;
            const on = t.id === filter;
            return (
              <button
                key={t.id}
                className={on ? `${styles.tile} ${styles.tileOn}` : styles.tile}
                aria-pressed={on}
                onClick={() => setFilter(t.id)}
              >
                <span className={styles.tileValue}>{count}</span>
                <span className={styles.tileLabel}>{t.label}</span>
                <span className={styles.tileHint}>{t.hint}</span>
              </button>
            );
          })}
        </div>

        <div className={styles.queueHead}>
          <h3 className={styles.queueTitle}>
            {active?.label ?? "Open cases"} <span className={styles.queueCount}>· {queue.length} case{queue.length === 1 ? "" : "s"}</span>
          </h3>
          {filter !== "all" && (
            <button className={styles.clear} onClick={() => setFilter("all")}>Show all cases</button>
          )}
        </div>

        {queue.length === 0 ? (
          <p className={styles.empty}>No cases match this tile.</p>
        ) : (
          <ul className={styles.queue}>
            {queue.map((s) => {
              const family = FAMILY_BY_ID[s.familyId];
              return (
                <li key={s.id}>
                  <Link
                    className={styles.case}
                    to="/support#simulate"
                    onClick={() => dispatch({ type: "SELECT_SCENARIO", scenarioId: s.id })}
                  >
                    <span className={styles.caseMain}>
                      <span className={styles.caseTitle}>{s.title}</span>
                      <span className={styles.caseMeta}>
                        <span className={styles.channel}>
                          <span aria-hidden="true">{RELATION_GLYPH[relationOf(s)]}</span> {RELATION_LABEL[relationOf(s)]}
                        </span>
                        <span className={styles.dotSep} aria-hidden="true">·</span>
                        {family?.name ?? s.familyId}
                      </span>
                    </span>
                    <span className={styles.caseSide}>
                      <span className={styles.severity} data-sev={s.severity}>{SEVERITY_LABEL[s.severity]}</span>
                      <span className={styles.owner}>Owner: {s.owner}</span>
                      <span className={styles.commit}>Next update: {s.customerUpdateCommitment}</span>
                    </span>
                    <span className={styles.cta} aria-hidden="true">Open in simulator</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}

        <SectionNote sectionId="command" />
      </div>
    </section>
  );
}
