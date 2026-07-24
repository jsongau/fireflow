import { useEffect, useId, useMemo, useReducer, useState } from "react";
import { playSound } from "@/lib/sound/sound";
import { openCustomerMasterTab } from "@/lib/customerMaster/openTab";
import type { CustomerMasterTabId } from "@/data/customerMaster";
import { Segmented, type SegmentedOption } from "@/components/primitives";
import {
  FLOW_STAGES,
  EXCEPTIONS,
  GLOSSARY,
  GLOSSARY_BY_ID,
  ORDER_QUEUE,
  SAP_DISCLOSURE,
  triageOrder,
  triageBand,
  sortQueue,
  filterQueue,
  type FlowStage,
  type Exception,
  type SapOrder,
  type QueueSort,
  type QueueFilter,
} from "@/data/sapsd";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import {
  INITIAL_LIFECYCLE,
  LIFECYCLE_ORDER_ID,
  O2C_OPEN_ORDER_KEY,
  lifecycleAsSapOrder,
  lifecycleReducer,
  type LifecycleAction,
} from "@/data/ediLifecycle";
import { O2C_TOUR_EVENT, type TourMilestone } from "@/lib/tour/orderTour";
import { OrderLifecycle } from "./OrderLifecycle";
import styles from "./SapProcessIntelligence.module.css";

const FILTER_OPTIONS: SegmentedOption<QueueFilter>[] = [
  { value: "all", label: "All" },
  { value: "exception", label: "Has exception" },
  { value: "clean", label: "Clean" },
];
const SORT_OPTIONS: SegmentedOption<QueueSort>[] = [
  { value: "score", label: "Score" },
  { value: "age", label: "Age" },
  { value: "exposure", label: "Exposure" },
];

/** Top-scoring order, selected on mount so the workbench never opens empty. */
const DEFAULT_ORDER: SapOrder = sortQueue(ORDER_QUEUE, "score")[0] ?? ORDER_QUEUE[0]!;

/* The board carries one "Synthetic queue" label, so the compact rows drop the
   per-field suffix. The full labeled strings still appear in the selected-order
   header and inside the score math. */
const plain = (s: string) => s.replace(" (synthetic)", "");

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

  /* Terms that appear on the Customer Master study open it at the right view.
     The definition still shows on hover and keyboard focus, and is announced
     via aria-describedby, so nothing is lost by making the click navigate. */
  const linked = Boolean(term.masterTab);

  return (
    <span className={styles.termWrap}>
      <button
        type="button"
        className={styles.term}
        aria-describedby={tipId}
        data-linked={linked ? "true" : undefined}
        aria-expanded={linked ? undefined : pinned}
        data-pinned={!linked && pinned ? "true" : undefined}
        onClick={() => {
          if (linked) openCustomerMasterTab(term.masterTab as CustomerMasterTabId);
          else setPinned((v) => !v);
        }}
        onKeyDown={(e) => { if (e.key === "Escape" && pinned) setPinned(false); }}
      >
        {term.term}
        {linked && <span className={styles.termOpen} aria-hidden="true">⧉</span>}
        {linked && <span className={styles.srOnly}> (opens the customer master)</span>}
      </button>
      <span role="tooltip" id={tipId} className={styles.tip} data-pinned={!linked && pinned ? "true" : undefined}>
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
  const [queueFilter, setQueueFilter] = useState<QueueFilter>("all");
  const [queueSort, setQueueSort] = useState<QueueSort>("score");
  const [orderId, setOrderId] = useState<string>(DEFAULT_ORDER.id);
  /* The inspected stage. Selecting an order snaps it to that order's stage;
     the stage nodes and prev/next steppers move it for reading without
     changing which order is selected. */
  const [stageId, setStageId] = useState<string>(DEFAULT_ORDER.stageId);
  const [exceptionId, setExceptionId] = useState<string | null>(DEFAULT_ORDER.exceptionId);

  /* The featured retailer order carries a full X12 document trail. Its queue row
     is derived from the same lifecycle state the workspace below edits, so the
     row's stage, exception, and exposure move as the order is worked. */
  const [life, lifeDispatch] = useReducer(lifecycleReducer, INITIAL_LIFECYCLE);
  const lifecycleOrder = useMemo(() => lifecycleAsSapOrder(life), [life]);

  const allOrders = useMemo(() => [lifecycleOrder, ...ORDER_QUEUE], [lifecycleOrder]);

  const visible = useMemo(
    () => sortQueue(filterQueue(allOrders, queueFilter), queueSort),
    [allOrders, queueFilter, queueSort],
  );

  /* Arriving from another module with a requested order (e.g. the Comparison
     Lab's "Trace in retailer order") selects the featured order on mount. */
  useEffect(() => {
    let requested: string | null = null;
    try {
      requested = sessionStorage.getItem(O2C_OPEN_ORDER_KEY);
      if (requested) sessionStorage.removeItem(O2C_OPEN_ORDER_KEY);
    } catch {
      requested = null;
    }
    if (requested === LIFECYCLE_ORDER_ID) {
      setOrderId(LIFECYCLE_ORDER_ID);
      setStageId(lifecycleOrder.stageId);
      setExceptionId(lifecycleOrder.exceptionId);
    }
    // Mount-only: the request flag is consumed once.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* The "Follow the order" tour asks this section to select the featured order
     and advance its lifecycle to a named milestone. The reducer's gates make a
     replayed sequence a no-op, so arriving at the same stop twice is safe. */
  useEffect(() => {
    const onTour = (e: Event) => {
      const milestone = (e as CustomEvent<TourMilestone>).detail;
      setOrderId(LIFECYCLE_ORDER_ID);
      const seq: LifecycleAction[] = [];
      if (milestone === "released" || milestone === "remittance" || milestone === "resolved") {
        seq.push(
          { type: "APPROVE_SKU_MAPPING" },
          { type: "RESOLVE_PRICING", decision: "current-price" },
          { type: "COMMIT_ALLOCATION" },
          { type: "GENERATE_855" },
          { type: "RELEASE_ORDER" },
        );
      }
      if (milestone === "remittance" || milestone === "resolved") {
        seq.push(
          { type: "CREATE_SHIPMENT" },
          { type: "GENERATE_INVOICE" },
          { type: "POST_REMITTANCE" },
        );
      }
      if (milestone === "resolved") seq.push({ type: "RESOLVE_DEDUCTION" });
      seq.forEach((a) => lifeDispatch(a));
    };
    window.addEventListener(O2C_TOUR_EVENT, onTour);
    return () => window.removeEventListener(O2C_TOUR_EVENT, onTour);
  }, []);

  const order: SapOrder = allOrders.find((o) => o.id === orderId) ?? DEFAULT_ORDER;
  const triage = triageOrder(order);
  const band = triageBand(triage.score);
  const orderStage: FlowStage = FLOW_STAGES.find((s) => s.id === order.stageId) ?? FLOW_STAGES[0]!;
  const orderStageIndex = FLOW_STAGES.findIndex((s) => s.id === orderStage.id);

  const stage: FlowStage = FLOW_STAGES.find((s) => s.id === stageId) ?? FLOW_STAGES[0]!;
  const stageIndex = FLOW_STAGES.findIndex((s) => s.id === stage.id);
  const exception: Exception | null =
    EXCEPTIONS.find((e) => e.id === exceptionId) ?? null;

  const selectOrder = (o: SapOrder) => {
    setOrderId(o.id);
    setStageId(o.stageId);
    setExceptionId(o.exceptionId);
    playSound("select");
  };

  return (
    <section id="o2c" className={styles.section} aria-labelledby="o2c-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Order-to-Cash Process Intelligence · SAP SD aligned workflow study</p>
        <h2 id="o2c-h" className={styles.h2}>Work the book of orders.</h2>
        <p className={styles.lede}>
          Nobody works one order at a time. This is the queue the way it actually looks on a
          Monday: eight orders spread across the order-to-cash flow at once. Priority
          here is math, not feel. Every order carries a score built from four visible factors,
          and the score shows its work. Select an order and every panel below becomes that
          order&rsquo;s context. The 99 Ranch Market order carries a full X12 document trail
          you can work end to end, from the inbound 850 to the deduction on the remittance.
        </p>

        {/* Order Queue board */}
        <div className={styles.queue}>
          <div className={styles.queueHead}>
            <div>
              <h3 className={styles.queueH}>Order Queue</h3>
            </div>
          </div>

          <div className={styles.queueToolbar}>
            <div className={styles.queueControl}>
              <span className={styles.queueControlLabel}>Filter</span>
              <Segmented<QueueFilter>
                label="Filter the queue"
                size="sm"
                options={FILTER_OPTIONS}
                value={queueFilter}
                onChange={setQueueFilter}
              />
            </div>
            <div className={styles.queueControl}>
              <span className={styles.queueControlLabel}>Sort by</span>
              <Segmented<QueueSort>
                label="Sort the queue"
                size="sm"
                options={SORT_OPTIONS}
                value={queueSort}
                onChange={setQueueSort}
              />
            </div>
            <span className={styles.queueCount}>{visible.length} of {allOrders.length} orders</span>
          </div>

          <div className={styles.queueCols} aria-hidden="true">
            <span>Priority</span>
            <span>Score</span>
            <span>Order</span>
            <span>Stage</span>
            <span>Exception</span>
            <span>Age</span>
            <span className={styles.queueColRight}>Exposure</span>
          </div>

          <ol className={styles.queueList} aria-label="Order queue">
            {visible.map((o) => {
              const t = triageOrder(o);
              const b = triageBand(t.score);
              const st = FLOW_STAGES.find((s) => s.id === o.stageId);
              const ex = o.exceptionId
                ? EXCEPTIONS.find((e) => e.id === o.exceptionId) ?? null
                : null;
              const selected = o.id === orderId;
              return (
                <li key={o.id}>
                  <button
                    type="button"
                    className={styles.row}
                    aria-pressed={selected}
                    data-band={b.id}
                    onClick={() => selectOrder(o)}
                  >
                    <span className={styles.bandCell}>
                      <span aria-hidden="true">{b.glyph}</span> {b.word}
                    </span>
                    <span className={styles.scoreCell}>
                      <span className={styles.srOnly}>Score </span>{t.score}
                    </span>
                    <span className={styles.whoCell}>
                      <span className={styles.rowCustomer}>
                        {plain(o.customer)}
                        {selected && <span className={styles.rowSelected}> · selected</span>}
                      </span>
                      <span className={styles.rowProduct}>
                        {o.product}
                        {o.id === LIFECYCLE_ORDER_ID && (
                          <span className={styles.rowTrail}> · document trail</span>
                        )}
                      </span>
                    </span>
                    <span className={styles.stageCell}>
                      <span aria-hidden="true">{st?.glyph}</span> {st?.label}
                    </span>
                    <span className={styles.exCell} data-clean={ex ? undefined : "true"}>
                      {ex ? ex.label : "Clean"}
                    </span>
                    <span className={styles.ageCell}>
                      {o.ageInStageDays}d
                      <span className={styles.srOnly}>
                        {" "}{o.ageInStageDays === 1 ? "day" : "days"} in stage
                      </span>
                    </span>
                    <span className={styles.expCell}>{plain(o.exposure)}</span>
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Selected order: the score math and Nathan's call */}
        <div className={styles.workbench}>
          <div className={styles.selHead}>
            <span className={styles.selBand} data-band={band.id}>
              <span aria-hidden="true">{band.glyph}</span> {band.word}
            </span>
            <div>
              <h3 className={styles.selTitle}>{order.customer}</h3>
              <p className={styles.selMeta}>{order.po} · {order.product}</p>
            </div>
            <span className={styles.selScore}>
              <span aria-hidden="true">◎</span> Score {triage.score}
            </span>
          </div>

          <h4 className={styles.factorsH}>Why this score</h4>
          <ul className={styles.factorList}>
            {triage.factors.map((f) => (
              <li key={f.id} className={styles.factor}>
                <span className={styles.factorPts}>
                  {f.points} {f.points === 1 ? "pt" : "pts"}
                </span>
                <span className={styles.factorBody}>
                  <span className={styles.factorLabel}>{f.label}</span>
                  <span className={styles.factorDetail}>{f.detail}</span>
                </span>
              </li>
            ))}
          </ul>
          <p className={styles.factorTotal}>
            Total: {triage.score} points, which reads {band.word}.
          </p>

          <details className={styles.rubric}>
            <summary className={styles.rubricSummary}>How the queue is ranked</summary>
            <div className={styles.rubricBody}>
              <p>
                The queue is not sorted by feel. Every order gets a score from four visible
                factors, because a priority you cannot explain is a priority you cannot defend
                in a Monday operations review.
              </p>
              <ul>
                <li><strong>Dollars at risk.</strong> One point per $500 of unresolved exposure, capped at 12.</li>
                <li><strong>Age in stage.</strong> One point per day the order has sat at its current stage, capped at 9.</li>
                <li><strong>Proximity to cash.</strong> Points equal to the stage position, 0 at Customer PO up to 7 at Resolution, because a late failure is the hardest to unwind.</li>
                <li><strong>Open exception.</strong> Five points when an exception is open. A clean order scores zero here.</li>
              </ul>
              <p>
                A score of 18 or more reads <strong>◆ Work now</strong>, 10 to 17 reads{" "}
                <strong>▲ Today</strong>, and below 10 reads <strong>○ Monitor</strong>.
              </p>
            </div>
          </details>

          <aside className={styles.nathan} aria-label="Nathan's read on this order">
            <span className={styles.nathanTag}>
              <span className={styles.nathanAvatar} aria-hidden="true">NS</span>
              Nathan&rsquo;s read on this order
            </span>
            <p className={styles.nathanText}>{order.nathanCall}</p>
          </aside>
        </div>

        {/* Retailer Order Lifecycle: the featured order's full X12 workspace */}
        {order.id === LIFECYCLE_ORDER_ID && (
          <OrderLifecycle state={life} dispatch={lifeDispatch} />
        )}

        {/* Document flow spine, tracking the selected order */}
        <h3 className={styles.spineH}>Where this order sits in the flow</h3>
        <p className={styles.spineLede}>
          The spine tracks {plain(order.customer)}&rsquo;s order. Step through any stage to read
          it; stepping is for inspection and does not change which order is selected.
        </p>
        <div
          className={styles.flowWrap}
          role="group"
          aria-label={`Order-to-cash document flow for ${order.customer}`}
        >
          <ol className={styles.flow}>
            {FLOW_STAGES.map((s, i) => {
              const done = i < orderStageIndex;
              const current = s.id === stage.id;
              const orderHere = i === orderStageIndex;
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
                    {current && <span className={styles.nodeState}> · inspecting</span>}
                    {orderHere && <span className={styles.nodeHere}> · order is here</span>}
                    {done && <span className={styles.srOnly}> (completed by this order)</span>}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        {/* Stage detail, in the selected order's context */}
        <div className={styles.detail}>
          <div className={styles.detailHead}>
            <span className={styles.detailGlyph} aria-hidden="true">{stage.glyph}</span>
            <div>
              <h3 className={styles.detailTitle}>{stage.label}</h3>
              <p className={styles.detailDoc}>{stage.doc}</p>
              <p className={styles.detailOrder}>
                Reading this stage for {order.customer} · {order.po} · {order.product}
              </p>
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

          {/* Operator Note: always shown. */}
          <aside className={styles.nathan} aria-label="Operator note from Nathan">
            <span className={styles.nathanTag}>
              <span className={styles.nathanAvatar} aria-hidden="true">NS</span>
              Nathan&rsquo;s read
            </span>
            <p className={styles.nathanText}>{stage.nathanNote}</p>
          </aside>

          <div className={styles.stageNav}>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => {
                const p = FLOW_STAGES[stageIndex - 1];
                if (p) { setStageId(p.id); playSound("stageAdvance"); }
              }}
              disabled={stageIndex <= 0}
            >
              Previous stage
            </button>
            <button
              type="button"
              className={styles.stepBtn}
              onClick={() => {
                const n = FLOW_STAGES[stageIndex + 1];
                if (n) { setStageId(n.id); playSound("stageAdvance"); }
              }}
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
            The exception open on the selected order is preselected. Pick any exception to see
            how I&rsquo;d run it: the signal, who owns it, the evidence, the customer update, and
            how to stop it recurring. Exceptions tied to the inspected stage
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
                  {here && <span className={styles.exHere} aria-label="at inspected stage">◆ </span>}
                  {e.label}
                  {e.id === order.exceptionId && (
                    <span className={styles.srOnly}> (open on the selected order)</span>
                  )}
                </button>
              );
            })}
          </div>

          {exception ? (
            <div className={styles.exDetail}>
              <h4 className={styles.exDetailTitle}>{exception.label}</h4>
              {exception.id === order.exceptionId && (
                <p className={styles.exOnOrder}>
                  <span aria-hidden="true">◆</span> Open on {order.customer}, {order.po}.
                </p>
              )}
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
          ) : order.exceptionId === null ? (
            <p className={styles.exClean}>
              <span aria-hidden="true">○</span> <strong>Clean.</strong> No open exception on
              this order. {plain(order.customer)} is moving through {orderStage.label} with
              nothing flagged, so it is monitoring only. Pick an exception above to study how
              that failure mode is worked.
            </p>
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
          <a href="#customer-master" className={styles.nextLink}>Read the customer master behind this order</a>
        </p>
        <p className={styles.next}>
          <a href="#signals" className={styles.nextLink}>See how this deduction becomes a prevented pattern</a>
        </p>

        <SectionNote sectionId="o2c" />
      </div>
    </section>
  );
}
