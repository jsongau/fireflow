/**
 * Retailer Order Lifecycle workspace — rendered inside #o2c when the featured
 * 99 Ranch order is selected in the Order Queue. One reducer drives the whole
 * study; every panel below reads the same state, and Reset restores all of it.
 *
 * Governance is visible by design: an action that is not available says why in
 * text next to the control, never in a tooltip and never by color alone.
 */
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { playSound } from "@/lib/sound/sound";
import { useHome } from "@/state/homeStore";
import {
  CORRECTIVE_CLOSE,
  DEDUCTION_CENTS,
  LIFECYCLE_CASE_ID,
  LIFECYCLE_DISCLOSURE,
  LIFECYCLE_LABEL,
  RECONCILE_ROWS,
  STRUCTURAL_CHECKS,
  buildDeductionCase,
  businessChecks,
  docViews,
  fmtUsd,
  gateFor,
  lineViews,
  type EdiDocId,
  type LifecycleAction,
  type LifecycleActionType,
  type LifecycleState,
} from "@/data/ediLifecycle";
import styles from "./OrderLifecycle.module.css";

interface Props {
  state: LifecycleState;
  dispatch: (a: LifecycleAction) => void;
}

/** The forward motion of the order, in document order. */
const ADVANCE_STEPS: { action: LifecycleActionType; label: string; doneWhen: (s: LifecycleState) => boolean; doneLabel: string }[] = [
  { action: "GENERATE_855", label: "Send the 855 acknowledgment", doneWhen: (s) => s.ack855, doneLabel: "855 sent" },
  { action: "RELEASE_ORDER", label: "Release the order to the warehouse", doneWhen: (s) => s.released, doneLabel: "Order released" },
  { action: "CREATE_SHIPMENT", label: "Confirm shipment and send the 856", doneWhen: (s) => s.shipped, doneLabel: "856 sent" },
  { action: "GENERATE_INVOICE", label: "Generate the 810 invoice", doneWhen: (s) => s.invoiced, doneLabel: "810 sent" },
  { action: "POST_REMITTANCE", label: "Post the retailer remittance", doneWhen: (s) => s.remittancePosted, doneLabel: "820 posted" },
];

export function OrderLifecycle({ state, dispatch }: Props) {
  const { dispatch: homeDispatch } = useHome();

  const docs = useMemo(() => docViews(state), [state]);
  const lines = useMemo(() => lineViews(state), [state]);
  const bizChecks = useMemo(() => businessChecks(state), [state]);

  const [activeDocId, setActiveDocId] = useState<EdiDocId>("850");
  const [activeSegmentId, setActiveSegmentId] = useState<string | null>(null);
  const [explainAll, setExplainAll] = useState(false);
  const [resetArmed, setResetArmed] = useState(false);
  const [caseRouted, setCaseRouted] = useState(false);

  const doc = docs.find((d) => d.docId === activeDocId) ?? docs[0]!;
  const activeSegment = doc.segments.find((s) => s.id === activeSegmentId) ?? null;
  const activeFieldIds = new Set(activeSegment?.fieldIds ?? []);

  const openDoc = (id: EdiDocId) => {
    setActiveDocId(id);
    setActiveSegmentId(null);
    playSound("select");
  };

  const act = (a: LifecycleAction) => {
    dispatch(a);
    playSound("stageAdvance");
  };

  const routeDeduction = () => {
    dispatch({ type: "ROUTE_DEDUCTION" });
    homeDispatch({
      type: "ROUTE_CASE",
      routedCase: buildDeductionCase(),
    });
    setCaseRouted(true);
    playSound("stageAdvance");
  };

  const reset = () => {
    dispatch({ type: "RESET" });
    setActiveDocId("850");
    setActiveSegmentId(null);
    setResetArmed(false);
    setCaseRouted(false);
    playSound("select");
  };

  return (
    <div id="o2c-lifecycle" className={styles.wrap} aria-label="Retailer order lifecycle workspace">
      {/* Head */}
      <div className={styles.head}>
        <div>
          <p className={styles.kicker}>{LIFECYCLE_LABEL}</p>
          <h3 className={styles.h3}>One retailer order, worked end to end.</h3>
          <p className={styles.lede}>
            The 850 below is already received, structurally validated, and acknowledged with a
            997. Three line decisions are waiting. Work them, send the 855, ship, invoice, then
            handle what the remittance brings back. Every decision lands in the audit record,
            and Reset restores the whole study.
          </p>
        </div>
        <div className={styles.resetBox}>
          {resetArmed ? (
            <>
              <span className={styles.resetAsk}>Restore the original order, documents, and audit record?</span>
              <button type="button" className={styles.resetGo} onClick={reset}>Reset simulation</button>
              <button type="button" className={styles.resetCancel} onClick={() => setResetArmed(false)}>Cancel</button>
            </>
          ) : (
            <button type="button" className={styles.resetBtn} onClick={() => setResetArmed(true)}>
              Reset simulation
            </button>
          )}
        </div>
      </div>

      {/* Document trail */}
      <h4 className={styles.blockH}>Document trail</h4>
      <ol className={styles.trail} aria-label="EDI document trail">
        {docs.map((d) => (
          <li key={d.docId}>
            <button
              type="button"
              className={styles.trailChip}
              aria-pressed={d.docId === activeDocId}
              data-available={d.available ? "true" : "false"}
              onClick={() => openDoc(d.docId)}
            >
              <span className={styles.trailDoc}>{d.docId}</span>
              <span className={styles.trailTitle}>{d.title.replace(/^\d+ /, "")}</span>
              <span className={styles.trailStatus}>
                <span aria-hidden="true">{d.statusGlyph}</span> {d.statusWord} · {d.direction}
              </span>
            </button>
          </li>
        ))}
      </ol>

      {/* Viewer */}
      <div className={styles.viewer}>
        <div className={styles.viewerHead}>
          <div>
            <h4 className={styles.viewerTitle}>{doc.title}</h4>
            <p className={styles.viewerPurpose}>{doc.purpose}</p>
          </div>
          {doc.available && (
            <button
              type="button"
              className={styles.explainToggle}
              aria-pressed={explainAll}
              onClick={() => setExplainAll((v) => !v)}
            >
              <span aria-hidden="true">{explainAll ? "◉" : "○"}</span> Explain every segment:{" "}
              {explainAll ? "on" : "off"}
            </button>
          )}
        </div>

        {doc.note && (
          <p className={styles.docNote}>
            <span aria-hidden="true">ⓘ</span> {doc.note}
          </p>
        )}

        {doc.available ? (
          <div className={styles.panes}>
            <div className={styles.pane}>
              <h5 className={styles.paneH}>Translated order</h5>
              <ul className={styles.fieldList}>
                {doc.fields.map((f) => {
                  const on = activeFieldIds.has(f.id);
                  return (
                    <li key={f.id}>
                      <button
                        type="button"
                        className={styles.field}
                        aria-pressed={on}
                        data-on={on ? "true" : undefined}
                        onClick={() => { setActiveSegmentId(f.segmentId); playSound("select"); }}
                      >
                        <span className={styles.fieldLabel}>{f.label}</span>
                        <span className={styles.fieldValue}>{f.value}</span>
                        {on && <span className={styles.srOnly}> (matched to the highlighted segment)</span>}
                      </button>
                    </li>
                  );
                })}
              </ul>
              <p className={styles.paneHint}>
                Select a field to highlight the X12 segment it comes from, or select a segment
                to read it in plain language.
              </p>
            </div>

            <div className={styles.pane}>
              <h5 className={styles.paneH}>Raw X12</h5>
              <ol className={styles.segList}>
                {doc.segments.map((s) => {
                  const on = s.id === activeSegmentId;
                  return (
                    <li key={s.id}>
                      <button
                        type="button"
                        className={styles.seg}
                        aria-pressed={on}
                        data-on={on ? "true" : undefined}
                        onClick={() => { setActiveSegmentId(on ? null : s.id); playSound("select"); }}
                      >
                        <code className={styles.segRaw}>{s.raw}</code>
                        {on && <span className={styles.srOnly}> (selected)</span>}
                      </button>
                      {(explainAll || on) && (
                        <p className={styles.segExplain}>{s.explain}</p>
                      )}
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        ) : (
          <p className={styles.pending}>
            <span aria-hidden="true">○</span> <strong>Not yet on the record.</strong>{" "}
            {doc.pendingReason}
          </p>
        )}
      </div>

      {/* Line workbench */}
      <h4 className={styles.blockH}>Order lines and decisions</h4>
      <div className={styles.lines}>
        {lines.map((l) => (
          <div key={l.lineNo} className={styles.line} data-open={l.issue ? "true" : undefined}>
            <div className={styles.lineHead}>
              <span className={styles.lineNo}>Line {l.lineNo}</span>
              <span className={styles.lineName}>{l.product}</span>
              <span className={styles.lineStatus}>
                <span aria-hidden="true">{l.statusGlyph}</span> {l.statusWord}
              </span>
            </div>
            <dl className={styles.lineGrid}>
              <div><dt>Retailer item</dt><dd>{l.retailerSku}</dd></div>
              <div><dt>Internal SKU</dt><dd>{l.internalSku ?? "Unmapped, held for review"}</dd></div>
              <div><dt>Ordered</dt><dd>{l.ordered} cases</dd></div>
              <div>
                <dt>Committed</dt>
                <dd>
                  {l.committed === null
                    ? "Pending decision"
                    : l.backordered > 0
                      ? `${l.committed} cases, ${l.backordered} backordered`
                      : `${l.committed} cases`}
                </dd>
              </div>
              <div><dt>Submitted price</dt><dd>{fmtUsd(l.submittedCents)} per case</dd></div>
              <div><dt>Approved price</dt><dd>{l.approvedCents === null ? "Pending decision" : `${fmtUsd(l.approvedCents)} per case`}</dd></div>
            </dl>
            {l.issue && <p className={styles.lineIssue}>{l.issue}</p>}

            {l.lineNo === 3 && state.skuMapping === "review" && (
              <div className={styles.lineActions}>
                <button type="button" className={styles.actBtn} onClick={() => act({ type: "APPROVE_SKU_MAPPING" })}>
                  Approve the cross reference to SY-BLDK-CARB-MP
                </button>
              </div>
            )}
            {l.lineNo === 2 && state.pricing === "open" && (
              <div className={styles.lineActions}>
                <button type="button" className={styles.actBtn} onClick={() => act({ type: "RESOLVE_PRICING", decision: "current-price" })}>
                  Bill the current account price
                </button>
                <button type="button" className={styles.actBtn} onClick={() => act({ type: "RESOLVE_PRICING", decision: "promo-honored" })}>
                  Honor the promotion once, with Sales approval
                </button>
              </div>
            )}
            {l.lineNo === 3 && state.skuMapping === "approved" && state.allocation === "open" && (
              <div className={styles.lineActions}>
                <button type="button" className={styles.actBtn} onClick={() => act({ type: "COMMIT_ALLOCATION" })}>
                  Commit 120 cases now, backorder 40 for Jul 24
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Validation */}
      <h4 className={styles.blockH}>Two validations, two different questions</h4>
      <div className={styles.checks}>
        <div className={styles.checkCol}>
          <h5 className={styles.checkH}>Structural: can the document be read?</h5>
          <ul className={styles.checkList}>
            {STRUCTURAL_CHECKS.map((c) => (
              <li key={c.id} className={styles.check} data-word={c.word}>
                <span className={styles.checkState}><span aria-hidden="true">{c.glyph}</span> {c.word}</span>
                <span className={styles.checkBody}>
                  <span className={styles.checkLabel}>{c.label}</span>
                  <span className={styles.checkDetail}>{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
        <div className={styles.checkCol}>
          <h5 className={styles.checkH}>Business: should this order be accepted as sent?</h5>
          <ul className={styles.checkList}>
            {bizChecks.map((c) => (
              <li key={c.id} className={styles.check} data-word={c.word}>
                <span className={styles.checkState}><span aria-hidden="true">{c.glyph}</span> {c.word}</span>
                <span className={styles.checkBody}>
                  <span className={styles.checkLabel}>{c.label}</span>
                  <span className={styles.checkDetail}>{c.detail}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advance */}
      <h4 className={styles.blockH}>Advance the order</h4>
      <ol className={styles.advance}>
        {ADVANCE_STEPS.map((step) => {
          const done = step.doneWhen(state);
          const gate = gateFor(state, step.action);
          return (
            <li key={step.action} className={styles.advanceItem} data-state={done ? "done" : gate.ready ? "ready" : "blocked"}>
              {done ? (
                <span className={styles.advanceDone}>
                  <span aria-hidden="true">✓</span> {step.doneLabel}
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    className={styles.advanceBtn}
                    disabled={!gate.ready}
                    onClick={() => act({ type: step.action } as LifecycleAction)}
                  >
                    {step.label}
                  </button>
                  {!gate.ready && <span className={styles.advanceReason}>{gate.reason}</span>}
                </>
              )}
            </li>
          );
        })}
      </ol>

      {/* Deduction */}
      {state.remittancePosted && (
        <div id="o2c-deduction" className={styles.deduction}>
          <h4 className={styles.blockH}>
            The deduction: {fmtUsd(DEDUCTION_CENTS)} short, reason code 22
          </h4>
          <p className={styles.dedLede}>
            The acknowledgment did its job: the retailer knew about the price and the backorder
            before the truck moved. This is a different failure. The ASN says 120 Carbonara
            cases; receiving counted 116. Reconcile the count at every checkpoint before
            deciding anything.
          </p>
          <table className={styles.dedTable}>
            <caption className={styles.srOnly}>Buldak Carbonara case count at each document checkpoint</caption>
            <thead>
              <tr><th scope="col">Checkpoint</th><th scope="col">Count</th><th scope="col">Source</th></tr>
            </thead>
            <tbody>
              {RECONCILE_ROWS.map((r) => (
                <tr key={r.label}>
                  <th scope="row">{r.label}</th>
                  <td>{r.value}</td>
                  <td>{r.source}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {state.deductionStatus !== "resolved" && (
            <div className={styles.dedActions}>
              {state.deductionStatus === "open" && (
                <button type="button" className={styles.actBtn} onClick={routeDeduction}>
                  Route to the case board as {LIFECYCLE_CASE_ID}
                </button>
              )}
              {state.deductionStatus === "routed" && (
                <Link className={styles.dedLink} to={`/ops?case=${LIFECYCLE_CASE_ID}&open=1`}>
                  Work {LIFECYCLE_CASE_ID} on the ops board
                </Link>
              )}
              <button type="button" className={styles.actBtn} onClick={() => act({ type: "RESOLVE_DEDUCTION" })}>
                Resolve: validate, credit, and assign the corrective action
              </button>
            </div>
          )}
          {caseRouted && state.deductionStatus === "routed" && (
            <p className={styles.dedRouted}>
              <span aria-hidden="true">✓</span> {LIFECYCLE_CASE_ID} is on the board with the PO,
              ASN, BOL, invoice, and receiving record attached.
            </p>
          )}

          <aside className={styles.nathan} aria-label="Nathan's read on this deduction">
            <span className={styles.nathanTag}>
              <span className={styles.nathanAvatar} aria-hidden="true">NS</span>
              Nathan&rsquo;s read on this deduction
            </span>
            <p className={styles.nathanText}>
              The count settled this claim: the loading records confirm four cases never made
              the truck, so it resolves as a credit memo, issued fast, because the money is
              owed. Some claims cannot be settled either way, a receiving count against a ship
              count with no signed exception on the delivery record. Those I resolve as a
              complimentary discount on the account&rsquo;s next order. The savings reach the
              account either way; the wording is the working part. A credit concedes the claim.
              A courtesy discount takes care of the relationship without conceding facts nobody
              established, and the account is told plainly which one they are getting.
            </p>
          </aside>

          {state.deductionStatus === "resolved" && (
            <dl className={styles.close}>
              <div><dt>Immediate resolution</dt><dd>{CORRECTIVE_CLOSE.resolution}</dd></div>
              <div><dt>Root cause</dt><dd>{CORRECTIVE_CLOSE.rootCause}</dd></div>
              <div><dt>Corrective action</dt><dd>{CORRECTIVE_CLOSE.correctiveAction}</dd></div>
              <div><dt>Owner</dt><dd>{CORRECTIVE_CLOSE.owner}</dd></div>
              <div><dt>Verification</dt><dd>{CORRECTIVE_CLOSE.verification}</dd></div>
              <div><dt>Procedure impact</dt><dd>{CORRECTIVE_CLOSE.sopImpact}</dd></div>
            </dl>
          )}
        </div>
      )}

      {/* Audit record */}
      <h4 className={styles.blockH}>Audit record</h4>
      <ol className={styles.audit} aria-label="Order audit record">
        {state.audit.map((e) => (
          <li key={e.id} className={styles.auditItem}>
            <span className={styles.auditStamp}>{e.stamp}</span>
            <span className={styles.auditBody}>
              <span className={styles.auditActor}>{e.actor}</span>
              <span className={styles.auditText}>{e.text}</span>
            </span>
          </li>
        ))}
      </ol>

      <p className={styles.disclosure}>
        <span aria-hidden="true">ⓘ</span> {LIFECYCLE_DISCLOSURE}
      </p>
    </div>
  );
}
