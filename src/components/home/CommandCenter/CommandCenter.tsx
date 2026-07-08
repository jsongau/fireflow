import { useState } from "react";
import { useHome } from "@/state/homeStore";
import { SCENARIOS } from "@/data/scenarios";
import { FAMILY_BY_ID } from "@/data/families";
import { SyntheticBadge } from "@/components/primitives";
import { OperatorNote } from "@/components/employer/OperatorNote/OperatorNote";
import type { ResolutionScenario, Severity, InquiryChannel } from "@/types/domain";
import styles from "./CommandCenter.module.css";

/*
 * CX Command Center — a manager's synthetic case queue.
 * Job competency this demonstrates: order-management ownership (one accountable
 * owner + next-update commitment per case), SLA discipline (exposure and overdue
 * updates surfaced, not buried), and CX leadership (a triage cockpit where every
 * KPI drills into the underlying cases). ALL operational counts are SYNTHETIC.
 */

type FilterId = "all" | "sla" | "overdue" | "deductions" | "product" | "vendor";

interface Tile {
  id: FilterId;
  label: string;
  hint: string;
  match: (s: ResolutionScenario) => boolean;
}

/* Product/quality-defect issue codes used to derive the "Product concerns" tile. */
const PRODUCT_ISSUE_IDS = ["c-missing-component", "c-crushed-chips", "c-leaking-bottle"];

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
    hint: "Missing components, damage, leakage",
    match: (s) => PRODUCT_ISSUE_IDS.includes(s.issueId),
  },
  {
    id: "vendor",
    label: "Vendor vs consumer",
    hint: "Vendor cases (rest are consumer)",
    match: (s) => s.channel === "vendor",
  },
];

const SEVERITY_LABEL: Record<Severity, string> = {
  standard: "Standard", elevated: "Elevated", priority: "Priority", specialist: "Specialist",
};

const CHANNEL_LABEL: Record<InquiryChannel, string> = { consumer: "Consumer", vendor: "Vendor" };
const CHANNEL_ICON: Record<InquiryChannel, string> = { consumer: "\u{1F464}", vendor: "\u{1F3E2}" };

export function CommandCenter() {
  const { dispatch } = useHome();
  const [filter, setFilter] = useState<FilterId>("all");

  const active = TILES.find((t) => t.id === filter) ?? TILES[0];
  const queue = active ? SCENARIOS.filter(active.match) : SCENARIOS;
  const vendorCount = SCENARIOS.filter((s) => s.channel === "vendor").length;
  const consumerCount = SCENARIOS.length - vendorCount;

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
          <div className={styles.headBadge}>
            <SyntheticBadge />
            <span className={styles.headNote}>All counts, owners and commitments are invented for demonstration.</span>
          </div>
        </div>

        <OperatorNote
          title="A queue is only useful if it shows risk"
          role="Service levels, accountability, and team coaching."
        >
          <p>
            A queue is only useful if it shows risk. I designed this view around ownership, severity,
            service timing, and the next promised update, because those are the things that prevent silent
            drift.
          </p>
        </OperatorNote>

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
                <span className={styles.tileValue}>
                  {t.id === "vendor" ? `${vendorCount} / ${consumerCount}` : count}
                </span>
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
          <p className={styles.empty}>No cases match this tile in the synthetic sample.</p>
        ) : (
          <ul className={styles.queue}>
            {queue.map((s) => {
              const family = FAMILY_BY_ID[s.familyId];
              return (
                <li key={s.id}>
                  <a
                    className={styles.case}
                    href="#simulate"
                    onClick={() => dispatch({ type: "SELECT_SCENARIO", scenarioId: s.id })}
                  >
                    <span className={styles.caseMain}>
                      <span className={styles.caseTitle}>{s.title}</span>
                      <span className={styles.caseMeta}>
                        <span className={styles.channel}>
                          <span aria-hidden="true">{CHANNEL_ICON[s.channel]}</span> {CHANNEL_LABEL[s.channel]}
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
                  </a>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
