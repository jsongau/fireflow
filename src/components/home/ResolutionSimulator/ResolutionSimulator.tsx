import { useEffect, useState } from "react";
import { useHome } from "@/state/homeStore";
import { SCENARIOS, SCENARIO_BY_ID, CONSUMER_SCENARIOS, VENDOR_SCENARIOS } from "@/data/scenarios";
import { FAMILY_BY_ID } from "@/data/families";
import { SyntheticBadge, Button } from "@/components/primitives";
import type { Severity } from "@/types/domain";
import styles from "./ResolutionSimulator.module.css";

const SEVERITY_LABEL: Record<Severity, string> = {
  standard: "Standard", elevated: "Elevated", priority: "Priority", specialist: "Specialist escalation",
};

export function ResolutionSimulator() {
  const { state, dispatch } = useHome();
  const scenario =
    (state.selectedScenarioId ? SCENARIO_BY_ID[state.selectedScenarioId] : undefined) ??
    CONSUMER_SCENARIOS[0]!;
  const [stageIndex, setStageIndex] = useState(0);

  useEffect(() => { setStageIndex(0); }, [scenario.id]);

  const family = FAMILY_BY_ID[scenario.familyId];
  const activeStage = scenario.stages[Math.min(stageIndex, scenario.stages.length - 1)]!;
  const atEnd = stageIndex >= scenario.stages.length - 1;

  return (
    <section id="simulate" className={styles.section} aria-labelledby="simulate-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Resolve</p>
        <h2 id="simulate-h" className={styles.h2}>Resolution Simulator</h2>
        <p className={styles.lede}>
          How a reported issue becomes a governed case — verified facts separated from assumptions, one
          accountable owner, a visible next update, and approvals required before any commitment.
        </p>

        <div className={styles.pickerWrap}>
          <div className={styles.pickerGroup}>
            <span className={styles.pickerLabel}>Consumer</span>
            <div className={styles.picker} role="group" aria-label="Consumer scenarios">
              {CONSUMER_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  className={s.id === scenario.id ? `${styles.pick} ${styles.pickOn}` : styles.pick}
                  aria-pressed={s.id === scenario.id}
                  onClick={() => dispatch({ type: "SELECT_SCENARIO", scenarioId: s.id })}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
          <div className={styles.pickerGroup}>
            <span className={styles.pickerLabel}>Vendor</span>
            <div className={styles.picker} role="group" aria-label="Vendor scenarios">
              {VENDOR_SCENARIOS.map((s) => (
                <button
                  key={s.id}
                  className={s.id === scenario.id ? `${styles.pick} ${styles.pickOn}` : styles.pick}
                  aria-pressed={s.id === scenario.id}
                  onClick={() => dispatch({ type: "SELECT_SCENARIO", scenarioId: s.id })}
                >
                  {s.title}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.case}>
          <div className={styles.caseHead}>
            <div>
              <h3 className={styles.caseTitle}>{scenario.title}</h3>
              <p className={styles.caseSub}>
                {family?.name ?? scenario.familyId} · {scenario.channel === "consumer" ? "Consumer" : "Vendor"} case
              </p>
            </div>
            <div className={styles.caseTags}>
              <span className={styles.severity} data-sev={scenario.severity}>{SEVERITY_LABEL[scenario.severity]}</span>
              <SyntheticBadge />
            </div>
          </div>

          <p className={styles.reported}><strong>Reported:</strong> {scenario.reported}</p>

          {/* Timeline */}
          <ol className={styles.timeline} aria-label="Case lifecycle">
            {scenario.stages.map((s, i) => {
              const done = i < stageIndex;
              const current = i === stageIndex;
              return (
                <li key={s.stage} className={current ? styles.tCurrent : done ? styles.tDone : styles.tFuture}>
                  <button
                    className={styles.tBtn}
                    aria-current={current ? "step" : undefined}
                    onClick={() => setStageIndex(i)}
                  >
                    <span className={styles.tDot} aria-hidden="true" />
                    <span className={styles.tLabel}>{s.title}</span>
                  </button>
                </li>
              );
            })}
          </ol>

          <div className={styles.stageDetail}>
            <h4>{activeStage.title}</h4>
            <p>{activeStage.detail}</p>
            <div className={styles.stageNav}>
              <Button variant="secondary" size="sm" disabled={stageIndex === 0} onClick={() => setStageIndex((i) => Math.max(0, i - 1))}>
                Previous
              </Button>
              <Button variant="primary" size="sm" disabled={atEnd} onClick={() => setStageIndex((i) => Math.min(scenario.stages.length - 1, i + 1))}>
                {atEnd ? "Complete" : "Advance"}
              </Button>
            </div>
          </div>

          {/* Case attributes */}
          <div className={styles.attrs}>
            <div className={styles.attr}>
              <h5>Verified facts</h5>
              <ul>{scenario.verifiedFacts.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
            <div className={styles.attr}>
              <h5>Evidence needed &amp; why</h5>
              <ul>{scenario.evidenceNeeded.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
            <div className={styles.attr}>
              <h5>Ownership</h5>
              <p><strong>Owner:</strong> {scenario.owner}</p>
              <p><strong>Collaborators:</strong> {scenario.collaborators.join(", ") || "—"}</p>
            </div>
            <div className={styles.attr}>
              <h5>Customer commitment</h5>
              <p>{scenario.customerUpdateCommitment}</p>
            </div>
            <div className={styles.attr}>
              <h5>Resolution options</h5>
              <ul>{scenario.resolutionOptions.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
            <div className={styles.attr}>
              <h5>Approvals required</h5>
              <ul>{scenario.approvalsRequired.map((f, i) => <li key={i}>{f}</li>)}</ul>
            </div>
            <div className={styles.attr}>
              <h5>Root cause</h5>
              <p>{scenario.rootCause}</p>
            </div>
            <div className={styles.attr}>
              <h5>Corrective action</h5>
              <p>{scenario.correctiveAction}</p>
            </div>
          </div>

          <p className={styles.note}>
            All names, cases, owners, and outcomes here are fictional, created to demonstrate the workflow.
            {" "}{SCENARIOS.length} representative scenarios are included.
          </p>
        </div>
      </div>
    </section>
  );
}
