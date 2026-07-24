import { useEffect, useState } from "react";
import { useHome } from "@/state/homeStore";
import { Button } from "@/components/primitives";
import { playSound } from "@/lib/sound/sound";
import {
  LIFECYCLE,
  LAST_STAGE,
  deriveCase,
  formatAge,
  handlingLabel,
  stageAtLeast,
  stageDetail,
  stageKeyAt,
  verifiedFacts,
} from "@/data/caseBoard";
import styles from "./CaseBoard.module.css";

/**
 * CaseBoard — the live half of the Resolution Simulator.
 *
 * A case routed in the Account Support Intake lands here carrying its owner,
 * SAP SD object, EDI document, priority, and service target. Working it advances
 * a governed lifecycle, and the case reveals itself as it moves: ownership and
 * whether the case was routed out appear once it is in progress, the customer
 * commitment appears when a resolution is proposed, and the root cause appears
 * only once the case is resolved.
 *
 * Everything is synthetic and labeled. There is no backend and no real case.
 */

const PRIORITY_GLYPH: Record<string, string> = {
  Standard: "○",
  Elevated: "◆",
  High: "▲",
  Critical: "⚠",
};

/** A slow tick so the case age stays honest without burning cycles. */
function useNow(intervalMs: number): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
  return now;
}

export function CaseBoard() {
  const { state, dispatch } = useHome();
  const now = useNow(30_000);

  const cases = state.routedCases;
  const selected =
    cases.find((c) => c.id === state.selectedCaseId) ?? cases[0] ?? null;

  if (cases.length === 0) {
    return (
      <div className={styles.empty}>
        <p className={styles.emptyTitle}>No live cases yet</p>
        <p className={styles.emptyBody}>
          Open a support case from the widget at the bottom right. Once you route it, the case lands
          here and you can work it through the lifecycle, carrying the owner, the SAP SD object, and
          the service target it was routed with.
        </p>
      </div>
    );
  }

  if (!selected) return null;
  const d = deriveCase(selected);
  if (!d) return null;

  const stage = selected.stageIndex;
  const atEnd = stage >= LAST_STAGE;

  const advance = () => {
    playSound(stage + 1 === LAST_STAGE ? "resolve" : "stageAdvance");
    dispatch({ type: "ADVANCE_CASE", caseId: selected.id });
  };

  return (
    <div className={styles.board}>
      <div className={styles.boardHead}>
        <div>
          <p className={styles.boardEyebrow}>Live case board</p>
          <p className={styles.boardTitle}>Cases you routed</p>
        </div>
        <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "CLEAR_CASES" })}>
          Clear board
        </Button>
      </div>

      {/* Case chips */}
      <div className={styles.chips} role="group" aria-label="Routed cases">
        {cases.map((c) => {
          const cd = deriveCase(c);
          if (!cd) return null;
          const on = c.id === selected.id;
          return (
            <button
              key={c.id}
              type="button"
              className={styles.chip}
              aria-pressed={on}
              onClick={() => dispatch({ type: "SELECT_CASE", caseId: c.id })}
            >
              {on && <span aria-hidden="true">✓</span>}
              <span className={styles.chipRef}>{c.id}</span>
              <span className={styles.chipLabel}>{cd.category.label}</span>
              <span className={styles.chipStage}>
                {c.stageIndex >= LAST_STAGE ? "Closed" : LIFECYCLE[c.stageIndex]?.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Selected case */}
      <div className={styles.case}>
        <div className={styles.caseHead}>
          <div>
            <h4 className={styles.caseTitle}>
              {selected.id} <span className={styles.caseDim}>·</span> {d.category.label}
            </h4>
            <p className={styles.caseSub}>
              {d.account} · {d.roleLabel} · opened {formatAge(now - selected.createdAt)}
            </p>
          </div>
          <span className={styles.prio} data-prio={selected.priority}>
            <span aria-hidden="true">{PRIORITY_GLYPH[d.priorityLabel] ?? "○"}</span>
            {d.priorityLabel}
          </span>
        </div>

        {/* Service clock, from the priority ladder */}
        <div className={styles.clock}>
          <span className={styles.clockItem}>
            <span className={styles.clockLabel}>Acknowledge target</span>
            {d.ack}
          </span>
          <span className={styles.clockItem}>
            <span className={styles.clockLabel}>Resolution target</span>
            {d.resolve}
          </span>
          <span className={styles.clockItem}>
            <span className={styles.clockLabel}>Metric at risk</span>
            {d.category.metric}
          </span>
        </div>

        {/* Lifecycle */}
        <ol className={styles.timeline} aria-label="Case lifecycle">
          {LIFECYCLE.map(({ key, label }, i) => {
            const done = i < stage;
            const current = i === stage;
            return (
              <li
                key={key}
                className={styles.tItem}
                data-state={done ? "done" : current ? "current" : "todo"}
              >
                <button
                  type="button"
                  className={styles.tBtn}
                  aria-current={current ? "step" : undefined}
                  onClick={() => dispatch({ type: "SET_CASE_STAGE", caseId: selected.id, stageIndex: i })}
                >
                  <span className={styles.tDot} aria-hidden="true">
                    {done ? "✓" : i + 1}
                  </span>
                  <span className={styles.tLabel}>{label}</span>
                </button>
              </li>
            );
          })}
        </ol>

        <div className={styles.stage}>
          <h5 className={styles.stageTitle}>{LIFECYCLE[stage]?.label}</h5>
          <p className={styles.stageDetail}>{stageDetail(selected, d, stageKeyAt(stage))}</p>
          <div className={styles.stageNav}>
            <Button
              variant="secondary"
              size="sm"
              disabled={stage === 0}
              onClick={() => dispatch({ type: "SET_CASE_STAGE", caseId: selected.id, stageIndex: stage - 1 })}
            >
              Previous
            </Button>
            <Button variant="primary" size="sm" disabled={atEnd} onClick={advance}>
              {atEnd ? "Closed" : "Advance"}
            </Button>
          </div>
        </div>

        {/* Panels unlock as the case moves. This is the process, not a summary. */}
        <div className={styles.panels}>
          {stageAtLeast(stage, "verified") && (
            <div className={styles.panel}>
              <h5>Verified facts</h5>
              <ul>
                {verifiedFacts(d).map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          )}

          {stageAtLeast(stage, "in-progress") && (
            <div className={styles.panel}>
              <h5>Ownership</h5>
              <p>
                <strong>Handling:</strong> {handlingLabel(d)}
              </p>
              <p>
                <strong>Owner:</strong> {d.category.owner}
              </p>
              <p>
                <strong>Supporting:</strong>{" "}
                {d.category.supporting.length ? d.category.supporting.join(", ") : "None required"}
              </p>
              {d.sap && (
                <p>
                  <strong>SAP SD (aligned):</strong> {d.sap.label}
                  {d.sap.ref ? `, ${d.sap.ref}` : ""}
                </p>
              )}
            </div>
          )}

          {stageAtLeast(stage, "resolution-proposed") && d.deductionType && (
            <div className={styles.panel}>
              <h5>Backup required to dispute</h5>
              <ul>
                {d.deductionType.backup.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          )}

          {/* The commitment appears when there is something to commit to. It was
              gated on a "Customer updated" stage that no longer exists; Resolution
              proposed is the first point at which the date is real. */}
          {stageAtLeast(stage, "resolution-proposed") && (
            <div className={styles.panel}>
              <h5>Customer commitment</h5>
              <p>
                Acknowledged within {d.ack}. Update promised, and the account is told before a date is
                missed, not after. Customer Experience keeps the follow-up.
              </p>
            </div>
          )}

          {stageAtLeast(stage, "resolved") && (
            <div className={styles.panel}>
              <h5>Root cause and corrective action</h5>
              <p>{d.deductionType ? d.deductionType.rootCause : d.category.rootCause}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
