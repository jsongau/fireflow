import { useId, useState } from "react";
import { useHome } from "@/state/homeStore";
import { playSound } from "@/lib/sound/sound";
import {
  FLOW_STAGES,
  EXCEPTIONS,
  GLOSSARY,
  GLOSSARY_BY_ID,
  SAP_SCENARIO,
  SAP_DISCLOSURE,
  type FlowStage,
  type Exception,
} from "@/data/sapsd";
import styles from "./SapProcessIntelligence.module.css";

/* ------------------------------------------------------------------ */
/* Accessible glossary term.                                           */
/* Definition is exposed three ways so nothing is hover-only:          */
/*  1. aria-describedby -> screen readers announce it on focus         */
/*  2. CSS shows the tip on hover AND keyboard focus                   */
/*  3. click/tap pins it open (touch), Escape unpins                   */
/* The full glossary is also listed in plain text at the bottom.       */
/* ------------------------------------------------------------------ */
function Term({ id }: { id: string }) {
  const term = GLOSSARY_BY_ID[id];
  const tipId = useId();
  const [pinned, setPinned] = useState(false);
  if (!term) return null;
  return (
    <span className={styles.termWrap}>
      <button
        type="button"
        className={styles.term}
        aria-describedby={tipId}
        aria-expanded={pinned}
        data-pinned={pinned ? "true" : undefined}
        onClick={() => setPinned((v) => !v)}
        onKeyDown={(e) => { if (e.key === "Escape" && pinned) setPinned(false); }}
      >
        {term.term}
      </button>
      <span role="tooltip" id={tipId} className={styles.tip} data-pinned={pinned ? "true" : undefined}>
        {term.short}
      </span>
    </span>
  );
}

/** Render a list of glossary term chips for a stage. */
function TermRow({ ids }: { ids: string[] }) {
  if (ids.length === 0) return null;
  return (
    <p className={styles.termRow}>
      <span className={styles.termRowLabel}>Terms:</span>{" "}
      {ids.map((id) => <Term key={id} id={id} />)}
    </p>
  );
}

export function SapProcessIntelligence() {
  const { state } = useHome();
  const [stageId, setStageId] = useState<string>(FLOW_STAGES[0]?.id ?? "po");
  const [exceptionId, setExceptionId] = useState<string | null>(null);

  const stage: FlowStage = FLOW_STAGES.find((s) => s.id === stageId) ?? FLOW_STAGES[0]!;
  const stageIndex = FLOW_STAGES.findIndex((s) => s.id === stage.id);
  const exception: Exception | null =
    EXCEPTIONS.find((e) => e.id === exceptionId) ?? null;

  return (
    <section id="o2c" className={styles.section} aria-labelledby="o2c-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Order-to-Cash Process Intelligence · SAP SD aligned workflow study</p>
        <h2 id="o2c-h" className={styles.h2}>Follow one order all the way to cash.</h2>
        <p className={styles.lede}>
          Customer Experience owns the whole order, start to finish. The PO comes in, the cash
          clears, and everything in between has to be right. This is the SAP SD and order-to-cash
          flow as I understand it, walked through one synthetic retail order. I&rsquo;ve marked the
          failure points I&rsquo;d watch at each step.
        </p>

        {/* Synthetic scenario header */}
        <div className={styles.scenario}>
          <span className={styles.synthTag}>◇ Synthetic scenario</span>
          <p className={styles.scenarioLine}>
            <strong>{SAP_SCENARIO.customer}</strong> &middot; {SAP_SCENARIO.po} &middot; {SAP_SCENARIO.product}
          </p>
          <p className={styles.scenarioSummary}>{SAP_SCENARIO.summary}</p>
        </div>

        {/* Document flow spine */}
        <div className={styles.flowWrap} role="group" aria-label="Order-to-cash document flow">
          <ol className={styles.flow}>
            {FLOW_STAGES.map((s, i) => {
              const done = i < stageIndex;
              const current = s.id === stage.id;
              return (
                <li key={s.id} className={styles.flowItem}>
                  <button
                    type="button"
                    className={styles.node}
                    data-state={current ? "current" : done ? "done" : "upcoming"}
                    aria-pressed={current}
                    onClick={() => { setStageId(s.id); playSound("stageAdvance"); }}
                  >
                    <span className={styles.nodeGlyph} aria-hidden="true">{s.glyph}</span>
                    <span className={styles.nodeLabel}>{s.label}</span>
                    <span className={styles.nodeDoc}>{s.doc}</span>
                    {current && <span className={styles.nodeState}> · current</span>}
                    {done && <span className={styles.srOnly}> (completed)</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Stage detail */}
        <div className={styles.detail}>
          <div className={styles.detailHead}>
            <span className={styles.detailGlyph} aria-hidden="true">{stage.glyph}</span>
            <div>
              <h3 className={styles.detailTitle}>{stage.label}</h3>
              <p className={styles.detailDoc}>{stage.doc}</p>
            </div>
            <span className={styles.metric}>
              <span aria-hidden="true">◎</span> {stage.metric}
            </span>
          </div>

          <p className={styles.represents}>{stage.represents}</p>

          <div className={styles.grid}>
            <div className={styles.cell}>
              <h4 className={styles.cellH}>Data required</h4>
              <p>{stage.requiredData}</p>
            </div>
            <div className={styles.cell}>
              <h4 className={styles.cellH}>Who owns it</h4>
              <p>{stage.owner}</p>
            </div>
            <div className={styles.cell}>
              <h4 className={styles.cellH}>What CX watches</h4>
              <p>{stage.cxWatch}</p>
            </div>
            <div className={styles.cell}>
              <h4 className={styles.cellH}>Evidence</h4>
              <p>{stage.evidence}</p>
            </div>
            <div className={styles.cell}>
              <h4 className={styles.cellH}>Where it breaks</h4>
              <ul className={styles.failList}>
                {stage.failurePoints.map((f) => <li key={f}>{f}</li>)}
              </ul>
            </div>
            <div className={styles.cell}>
              <h4 className={styles.cellH}>Downstream impact</h4>
              <p>{stage.downstream}</p>
            </div>
          </div>

          <TermRow ids={stage.terms} />

          {/* Operator Note: shows only when the visitor turned on Operator Notes. */}
          {state.operatorNotesEnabled && (
            <aside className={styles.nathan} aria-label="Operator note from Nathan">
              <span className={styles.nathanTag}>
                <span className={styles.nathanAvatar} aria-hidden="true">NS</span>
                Nathan&rsquo;s read
              </span>
              <p className={styles.nathanText}>{stage.nathanNote}</p>
            </aside>
          )}

          <div className={styles.stageNav}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => { const p = FLOW_STAGES[stageIndex - 1]; if (p) setStageId(p.id); }}
              disabled={stageIndex <= 0}
            >
              Previous stage
            </button>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => { const n = FLOW_STAGES[stageIndex + 1]; if (n) setStageId(n.id); }}
              disabled={stageIndex >= FLOW_STAGES.length - 1}
            >
              Next stage
            </button>
          </div>
        </div>

        {/* Exception explorer */}
        <div className={styles.exceptions}>
          <h3 className={styles.exH}>Order exceptions: the failure modes CX manages</h3>
          <p className={styles.exLede}>
            Pick an exception to see how I&rsquo;d run it: the signal, who owns it, the evidence, the
            customer update, and how to stop it recurring. Exceptions tied to the current stage
            (<strong>{stage.label}</strong>) are marked.
          </p>
          <div className={styles.exChips} role="group" aria-label="Order exceptions">
            {EXCEPTIONS.map((e) => {
              const on = e.id === exceptionId;
              const here = e.atStage === stage.id;
              return (
                <button
                  key={e.id}
                  type="button"
                  className={styles.exChip}
                  data-on={on ? "true" : undefined}
                  aria-pressed={on}
                  onClick={() => setExceptionId(on ? null : e.id)}
                >
                  {here && <span className={styles.exHere} aria-label="at current stage">◆ </span>}
                  {e.label}
                </button>
              );
            })}
          </div>

          {exception ? (
            <div className={styles.exDetail}>
              <h4 className={styles.exDetailTitle}>{exception.label}</h4>
              <dl className={styles.exGrid}>
                <div><dt>Signal</dt><dd>{exception.signal}</dd></div>
                <div><dt>Validation step</dt><dd>{exception.validation}</dd></div>
                <div><dt>Owner</dt><dd>{exception.owner}</dd></div>
                <div><dt>Partners</dt><dd>{exception.partners.join(", ")}</dd></div>
                <div><dt>Evidence</dt><dd>{exception.evidence}</dd></div>
                <div><dt>Customer update</dt><dd>{exception.customerUpdate}</dd></div>
                <div><dt>Resolution</dt><dd>{exception.resolution}</dd></div>
                <div><dt>Prevention</dt><dd>{exception.prevention}</dd></div>
              </dl>
            </div>
          ) : (
            <p className={styles.exEmpty}>Select an exception above to see how it&rsquo;s worked.</p>
          )}
        </div>

        {/* Full glossary — always-visible plain text so nothing is hover-only */}
        <details className={styles.glossary}>
          <summary className={styles.glossarySummary}>
            SAP SD glossary: {GLOSSARY.length} terms, in plain language
          </summary>
          <dl className={styles.glossaryList}>
            {GLOSSARY.map((g) => (
              <div key={g.id} className={styles.glossaryItem}>
                <dt>{g.term}</dt>
                <dd>{g.short}</dd>
              </div>
            ))}
          </dl>
        </details>

        {/* Honest positioning + continuity into Product Signals */}
        <p className={styles.disclosure}>
          <span className={styles.disclosureTag} aria-hidden="true">ⓘ</span> {SAP_DISCLOSURE}
        </p>
        <p className={styles.next}>
          <a href="#signals" className={styles.nextLink}>See how this deduction becomes a prevented pattern</a>
        </p>
      </div>
    </section>
  );
}
