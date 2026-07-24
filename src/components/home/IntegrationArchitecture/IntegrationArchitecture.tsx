import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import {
  SYSTEMS,
  FLOWS,
  SYSTEM_BY_ID,
  FLOW_PATTERN_META,
  GOVERNANCE,
  flowsForSystem,
  INTEGRATION_DISCLOSURE,
  type SystemId,
  type DataFlow,
} from "@/data/dataArch";
import styles from "./IntegrationArchitecture.module.css";

/*
 * Integration Architecture study.
 * How one order-to-cash record is assembled across ERP (SAP SD aligned), CRM,
 * EDI, the web surface, and the analytics warehouse. Each flow names its object,
 * pattern, cadence, transform, failure mode, and owner, plus what CX watches.
 * The governance strip states which system is the source of truth for each data
 * domain. Everything is synthetic and aligned to practice, not a live pipeline.
 * State is never signaled by color alone; the pattern carries a glyph and a word.
 */

const DEFAULT_FLOW_ID = FLOWS[0]!.id;

export function IntegrationArchitecture() {
  const [systemId, setSystemId] = useState<SystemId | null>(null);
  const [flowId, setFlowId] = useState<string>(DEFAULT_FLOW_ID);

  const visibleFlows: DataFlow[] = useMemo(
    () => (systemId ? flowsForSystem(systemId) : FLOWS),
    [systemId],
  );

  /* Keep the selected flow valid when a system filter hides it. */
  const flow: DataFlow =
    visibleFlows.find((f) => f.id === flowId) ?? visibleFlows[0] ?? FLOWS[0]!;

  const activeSystem = systemId ? SYSTEM_BY_ID[systemId] : null;
  const pattern = FLOW_PATTERN_META[flow.pattern];

  const toggleSystem = (id: SystemId) => {
    setSystemId((cur) => (cur === id ? null : id));
  };

  return (
    <section id="integration" className={styles.section} aria-labelledby="integration-h">
      <div className={`${styles.inner} ${styles.innerIntro}`}>
        <p className={styles.eyebrow}>Data Architecture · Integration pattern study</p>
        <h2 id="integration-h" className={styles.h2}>One order, five systems.</h2>
        <p className={styles.lede}>
          The clean order in the queue is not received. It is assembled. A single purchase order
          crosses EDI, the ERP sales order, the pricing conditions, the customer master, and the
          delivery before anyone can ship it, and every handoff is a place it can stall while the
          buyer sits believing it is placed. Pick a system to see what it masters, or pick a flow to
          read its object, its pattern, and where it breaks.
        </p>

        <div className={styles.badgeRow}>
          <span className={styles.badgeNote}>
            Aligned to EDI and SAP SD practice. Not a live integration.
          </span>
        </div>

        {/* Systems */}
        <h3 className={styles.blockH}>The systems</h3>
        <ul className={styles.systems} aria-label="Systems in the integration">
          {SYSTEMS.map((s) => {
            const on = s.id === systemId;
            return (
              <li key={s.id}>
                <button
                  type="button"
                  className={styles.system}
                  aria-pressed={on}
                  onClick={() => toggleSystem(s.id)}
                >
                  <span className={styles.systemGlyph} aria-hidden="true">{s.glyph}</span>
                  <span className={styles.systemName}>{s.name}</span>
                  <span className={styles.systemRole}>{s.role}</span>
                  {on && <span className={styles.srOnly}> (filtering flows to this system)</span>}
                </button>
              </li>
            );
          })}
        </ul>

        {activeSystem && (
          <div className={styles.systemDetail}>
            <div className={styles.systemDetailCol}>
              <h4 className={styles.systemDetailH}>{activeSystem.name} is the source of truth for</h4>
              <ul className={styles.masterList}>
                {activeSystem.masters.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>
            <div className={styles.systemDetailCol}>
              <h4 className={styles.systemDetailH}>It consumes</h4>
              <ul className={styles.masterList}>
                {activeSystem.consumes.map((m) => <li key={m}>{m}</li>)}
              </ul>
            </div>
            <p className={styles.filterNote}>
              Showing the {visibleFlows.length} flows that touch {activeSystem.name}. Pick the same
              system again to see all flows.
            </p>
          </div>
        )}

      </div>

      {/* Flows: full-bleed two-pane band. The list scrolls with the page; the
          reading pane on the right is sticky, so picking a flow always shows
          its detail changing beside the list. This is the deliberate flip of
          the Dimensional Model study, where the narrow PICKER is the sticky
          side; here the sticky side is the wide reading pane. */}
      <div className={styles.band}>
        <div className={styles.bandList}>
          <h3 className={styles.bandH}>The flows</h3>
          <p className={styles.bandHint}>
            Pick a flow. The reading pane beside the list follows your selection.
          </p>
          <ul className={styles.flows} aria-label="Data flows">
            {visibleFlows.map((f) => {
              const from = SYSTEM_BY_ID[f.from];
              const to = SYSTEM_BY_ID[f.to];
              const on = f.id === flow.id;
              const p = FLOW_PATTERN_META[f.pattern];
              return (
                <li key={f.id}>
                  <button
                    type="button"
                    className={styles.flow}
                    aria-pressed={on}
                    onClick={() => setFlowId(f.id)}
                  >
                    <span className={styles.flowRoute}>
                      <span className={styles.flowFrom}>
                        <span aria-hidden="true">{from.glyph}</span> {from.name}
                      </span>
                      <span className={styles.flowSends}>sends to</span>
                      <span className={styles.flowTo}>
                        <span aria-hidden="true">{to.glyph}</span> {to.name}
                      </span>
                    </span>
                    <span className={styles.flowObject}>{f.object}</span>
                    <span className={styles.flowPattern}>
                      <span aria-hidden="true">{p.glyph}</span> {p.label}
                    </span>
                    {on && <span className={styles.flowReading}>Reading</span>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {/* Selected flow: the sticky reading pane */}
        <div className={styles.detailPane}>
          <div className={styles.flowDetail}>
            <p className={styles.detailKicker}>Reading this flow</p>
            <div className={styles.flowDetailHead}>
              <h4 className={styles.flowDetailTitle}>{flow.object}</h4>
              <span className={styles.patternTag}>
                <span aria-hidden="true">{pattern.glyph}</span> {pattern.label}
              </span>
            </div>
            <p className={styles.flowPath}>
              <span aria-hidden="true">{SYSTEM_BY_ID[flow.from].glyph}</span>{" "}
              {SYSTEM_BY_ID[flow.from].name}
              <span className={styles.flowPathWord}> sends to </span>
              <span aria-hidden="true">{SYSTEM_BY_ID[flow.to].glyph}</span>{" "}
              {SYSTEM_BY_ID[flow.to].name}
            </p>

            <dl className={styles.flowGrid}>
              <div><dt>Cadence</dt><dd>{flow.cadence}</dd></div>
              <div><dt>Transform</dt><dd>{flow.transform}</dd></div>
              <div className={styles.flowGridWide} data-tone="risk">
                <dt>Where it breaks</dt><dd>{flow.failureMode}</dd>
              </div>
              <div><dt>Owner</dt><dd>{flow.owner}</dd></div>
              <div><dt>What CX watches</dt><dd>{flow.cxWatch}</dd></div>
            </dl>
          </div>
        </div>
      </div>

      <div className={`${styles.inner} ${styles.innerAfter}`}>
        {/* Governance: source of truth by domain */}
        <div className={styles.governance}>
          <h3 className={styles.blockH}>Source of truth, by data domain</h3>
          <p className={styles.governanceLede}>
            An integration only holds if every data domain has one owner. Two systems both certain
            they master the customer record is how a rep and an order end up disagreeing about the
            same account. Each domain here is mastered by exactly one system:
          </p>
          <ul className={styles.govList}>
            {GOVERNANCE.map((g) => {
              const sys = SYSTEM_BY_ID[g.systemId];
              return (
                <li key={g.domain} className={styles.govRow}>
                  <span className={styles.govDomain}>{g.domain}</span>
                  <span className={styles.govSystem}>
                    <span aria-hidden="true">{sys.glyph}</span> {sys.name}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>

        <p className={styles.disclosure}>
          <span className={styles.disclosureTag} aria-hidden="true">ⓘ</span> {INTEGRATION_DISCLOSURE}
        </p>
        <p className={styles.next}>
          <Link to="/intelligence#o2c" className={styles.nextLink}>
            Work the order these flows assemble
          </Link>
        </p>
        <p className={styles.next}>
          <Link to="/intelligence#data-model" className={styles.nextLink}>
            See the dimensional model these systems load
          </Link>
        </p>

        <SectionNote sectionId="integration" />
      </div>
    </section>
  );
}
