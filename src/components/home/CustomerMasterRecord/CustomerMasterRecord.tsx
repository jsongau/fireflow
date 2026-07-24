import { useEffect, useRef, useState, type KeyboardEvent } from "react";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import { CUSTOMER_MASTER_TAB_EVENT } from "@/lib/customerMaster/openTab";
import {
  ACCOUNT,
  ACCOUNT_METRICS,
  COMPANY_CODE_DATA,
  CONDITION_RECORDS,
  CUSTOMER_MASTER_DISCLOSURE,
  CUSTOMER_MASTER_TABS,
  DEDUCTION_LOG,
  DEDUCTION_SUMMARY,
  DOC_TYPES,
  EDI_IDENTIFIERS,
  EDI_TRANSACTIONS,
  GENERAL_DATA,
  MATERIAL_MASTER,
  PARTNER_FUNCTIONS,
  PRICE_WALKTHROUGH,
  SALES_AREA_DATA,
  TCODES,
  type CustomerMasterTabId,
  type MasterSection,
} from "@/data/customerMaster";
import styles from "./CustomerMasterRecord.module.css";

/*
 * Customer Master study — 168 Market, Rowland Heights.
 *
 * A clickable reconstruction of the master data, condition records, EDI map,
 * and account performance a CX manager reads for a trade account. Framed
 * explicitly as a self-directed SAP SD exercise: only the store name and its
 * public street address are real, and every other value is invented.
 *
 * Status is always carried by a word plus a glyph, never color alone.
 * The tablist follows the WAI-ARIA tabs pattern with roving tabindex.
 */

const STATUS_GLYPH: Record<string, string> = {
  active: "✓",
  expired: "⚠",
  scheduled: "◷",
  valid: "✓",
  invalid: "✕",
  "under-review": "◷",
};

const STATUS_WORD: Record<string, string> = {
  active: "Active",
  expired: "Expired",
  scheduled: "Scheduled",
  valid: "Valid, credited",
  invalid: "Invalid, disputed",
  "under-review": "Under review",
};

const DIRECTION_WORD: Record<string, string> = {
  inbound: "Inbound",
  outbound: "Outbound",
  both: "Both ways",
};

/** Shared renderer for the four master-data views. */
function SectionView({ section }: { section: MasterSection }) {
  return (
    <div className={styles.view}>
      <p className={styles.purpose}>{section.purpose}</p>
      <div className={styles.watch}>
        <span className={styles.watchLabel}>What CX watches</span>
        <p className={styles.watchText}>{section.cxWatch}</p>
      </div>
      <dl className={styles.fields}>
        {section.fields.map((f) => (
          <div key={f.label} className={styles.field}>
            <dt className={styles.fieldLabel}>{f.label}</dt>
            <dd className={styles.fieldValue}>
              <span className={styles.fieldMain}>{f.value}</span>
              {f.note && <span className={styles.fieldNote}>{f.note}</span>}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

export function CustomerMasterRecord() {
  const [tab, setTab] = useState<CustomerMasterTabId>("partners");
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  /* The SAP SD glossary chips can deep-link into a specific view. */
  useEffect(() => {
    const onOpen = (e: Event) => {
      const detail = (e as CustomEvent).detail as CustomerMasterTabId;
      if (CUSTOMER_MASTER_TABS.some((t) => t.id === detail)) setTab(detail);
    };
    window.addEventListener(CUSTOMER_MASTER_TAB_EVENT, onOpen);
    return () => window.removeEventListener(CUSTOMER_MASTER_TAB_EVENT, onOpen);
  }, []);

  const focusTab = (i: number) => {
    const next = (i + CUSTOMER_MASTER_TABS.length) % CUSTOMER_MASTER_TABS.length;
    const t = CUSTOMER_MASTER_TABS[next];
    if (t) {
      setTab(t.id);
      tabRefs.current[next]?.focus();
    }
  };

  const onTabKeyDown = (e: KeyboardEvent<HTMLButtonElement>, i: number) => {
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); focusTab(i + 1); break;
      case "ArrowLeft": e.preventDefault(); focusTab(i - 1); break;
      case "Home": e.preventDefault(); focusTab(0); break;
      case "End": e.preventDefault(); focusTab(CUSTOMER_MASTER_TABS.length - 1); break;
    }
  };

  return (
    <section id="customer-master" className={styles.section} aria-labelledby="cm-h">
      <div className={styles.inner}>
        <p className={styles.eyebrow}>Master data study · SAP SD aligned</p>
        <h2 id="cm-h" className={styles.h2}>Customer Master: 168 Market, Rowland Heights</h2>
        <p className={styles.lede}>
          An order is only as good as the data behind it. This is the account record I would read before
          touching a purchase order: who the four parties actually are, what the sales area lets me
          promise, what the material master says a case really is, which condition records are live, and
          where the money is leaking. Open any view.
        </p>

        <p className={styles.disclosure}>
          <span className={styles.disclosureTag} aria-hidden="true">ⓘ</span> {CUSTOMER_MASTER_DISCLOSURE}
        </p>

        {/* Account header */}
        <div className={styles.header}>
          <div className={styles.headerMain}>
            <p className={styles.acctName}>{ACCOUNT.name}</p>
            <p className={styles.acctLoc}>{ACCOUNT.location}</p>
            <p className={styles.acctArchetype}>{ACCOUNT.archetype}</p>
          </div>
          <dl className={styles.headerFacts}>
            <div><dt>Sold-to</dt><dd>{ACCOUNT.soldToNumber}</dd></div>
            <div><dt>Account type</dt><dd>{ACCOUNT.accountType}</dd></div>
            <div><dt>Store address</dt><dd>{ACCOUNT.publicAddress}</dd></div>
          </dl>
        </div>

        {/* Tabs */}
        <div className={styles.tablist} role="tablist" aria-label="Customer master views">
          {CUSTOMER_MASTER_TABS.map((t, i) => {
            const on = t.id === tab;
            return (
              <button
                key={t.id}
                ref={(el) => { tabRefs.current[i] = el; }}
                role="tab"
                type="button"
                id={`cm-tab-${t.id}`}
                aria-selected={on}
                aria-controls={`cm-panel-${t.id}`}
                tabIndex={on ? 0 : -1}
                className={on ? `${styles.tab} ${styles.tabOn}` : styles.tab}
                onClick={() => setTab(t.id)}
                onKeyDown={(e) => onTabKeyDown(e, i)}
              >
                <span className={styles.tabGlyph} aria-hidden="true">{t.glyph}</span>
                {t.label}
              </button>
            );
          })}
        </div>

        <div
          className={styles.panel}
          role="tabpanel"
          id={`cm-panel-${tab}`}
          aria-labelledby={`cm-tab-${tab}`}
          tabIndex={0}
        >
          {/* PARTNER FUNCTIONS */}
          {tab === "partners" && (
            <div className={styles.view}>
              <p className={styles.purpose}>
                One customer, four parties. Sold-to, ship-to, bill-to, and payer can all be different, and
                treating them as one account is the fastest way to send the right answer to the wrong desk.
              </p>
              <ul className={styles.partners}>
                {PARTNER_FUNCTIONS.map((p) => (
                  <li key={p.code} className={styles.partner}>
                    <div className={styles.partnerHead}>
                      <span className={styles.partnerCode} aria-hidden="true">{p.code}</span>
                      <div>
                        <h3 className={styles.partnerName}>{p.name}</h3>
                        <p className={styles.partnerAcct}>Account {p.account}</p>
                      </div>
                    </div>
                    <p className={styles.partnerParty}>{p.party}</p>
                    <p className={styles.partnerAddr}>{p.address}</p>
                    <p className={styles.partnerResp}>{p.responsibility}</p>
                    <p className={styles.partnerFail}>
                      <span className={styles.failLabel}>Failure mode</span> {p.failureMode}
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {tab === "general" && <SectionView section={GENERAL_DATA} />}
          {tab === "company" && <SectionView section={COMPANY_CODE_DATA} />}
          {tab === "salesarea" && <SectionView section={SALES_AREA_DATA} />}
          {tab === "material" && <SectionView section={MATERIAL_MASTER} />}

          {/* PRICING */}
          {tab === "pricing" && (
            <div className={styles.view}>
              <p className={styles.purpose}>
                A price is not a number, it is a stack of condition records that either fire or do not. When
                a buyer says the price is wrong, this is the only screen that settles it.
              </p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.caption}>Condition records on this account</caption>
                  <thead>
                    <tr>
                      <th scope="col">Type</th>
                      <th scope="col">Description</th>
                      <th scope="col">Amount</th>
                      <th scope="col">Basis</th>
                      <th scope="col">Valid from</th>
                      <th scope="col">Valid to</th>
                      <th scope="col">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CONDITION_RECORDS.map((c) => (
                      <tr key={c.conditionType}>
                        <th scope="row" className={styles.mono}>{c.conditionType}</th>
                        <td>
                          {c.description}
                          <span className={styles.cellNote}>{c.note}</span>
                        </td>
                        <td className={styles.mono}>{c.amount}</td>
                        <td>{c.basis}</td>
                        <td className={styles.mono}>{c.validFrom}</td>
                        <td className={styles.mono}>{c.validTo}</td>
                        <td>
                          <span className={styles.status} data-status={c.status}>
                            <span aria-hidden="true">{STATUS_GLYPH[c.status]}</span>
                            {STATUS_WORD[c.status]}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <h3 className={styles.subH}>The arithmetic, out loud</h3>
              <ol className={styles.ladder}>
                {PRICE_WALKTHROUGH.lines.map((l) => (
                  <li key={l.label} className={styles.ladderRow}>
                    <span className={styles.ladderLabel}>{l.label}</span>
                    <span className={styles.ladderValue}>{l.value}</span>
                    <span className={styles.ladderRunning}>{l.running}</span>
                  </li>
                ))}
              </ol>
              <div className={styles.gapBox}>
                <div className={styles.gapRow}>
                  <span>Billed</span><strong>{PRICE_WALKTHROUGH.billed}</strong>
                </div>
                <div className={styles.gapRow}>
                  <span>Retailer expected</span><strong>{PRICE_WALKTHROUGH.expected}</strong>
                </div>
                <div className={styles.gapRow} data-gap="true">
                  <span>Gap</span><strong>{PRICE_WALKTHROUGH.gap}</strong>
                </div>
                <p className={styles.gapText}>{PRICE_WALKTHROUGH.explanation}</p>
              </div>
            </div>
          )}

          {/* DOCUMENTS */}
          {tab === "documents" && (
            <div className={styles.view}>
              <p className={styles.purpose}>
                The document types this account generates, and the transactions I would actually open to
                answer a question. Reading these is a manager skill. Configuring them is not a claim I make.
              </p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.caption}>Sales document types</caption>
                  <thead>
                    <tr><th scope="col">Code</th><th scope="col">Document</th><th scope="col">What it does</th></tr>
                  </thead>
                  <tbody>
                    {DOC_TYPES.map((d) => (
                      <tr key={d.code}>
                        <th scope="row" className={styles.mono}>{d.code}</th>
                        <td>{d.name}</td>
                        <td>{d.purpose}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.caption}>Transactions a CX manager reads</caption>
                  <thead>
                    <tr><th scope="col">Transaction</th><th scope="col">Name</th><th scope="col">Why I would open it</th></tr>
                  </thead>
                  <tbody>
                    {TCODES.map((t) => (
                      <tr key={t.code}>
                        <th scope="row" className={styles.mono}>{t.code}</th>
                        <td>{t.name}</td>
                        <td>{t.why}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* EDI */}
          {tab === "edi" && (
            <div className={styles.view}>
              <p className={styles.purpose}>
                This account trades electronically. Every document below is a place an order can silently
                fail, and every one of them is a place a chargeback can start.
              </p>
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <caption className={styles.caption}>EDI transaction set</caption>
                  <thead>
                    <tr>
                      <th scope="col">Set</th><th scope="col">Document</th><th scope="col">Direction</th>
                      <th scope="col">Purpose</th><th scope="col">What CX watches</th>
                    </tr>
                  </thead>
                  <tbody>
                    {EDI_TRANSACTIONS.map((e) => (
                      <tr key={e.code}>
                        <th scope="row" className={styles.mono}>{e.code}</th>
                        <td>{e.name}</td>
                        <td>
                          <span className={styles.dir} data-dir={e.direction}>
                            {DIRECTION_WORD[e.direction]}
                          </span>
                        </td>
                        <td>{e.purpose}</td>
                        <td className={styles.cellWatch}>{e.cxWatch}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <h3 className={styles.subH}>Identifiers and compliance</h3>
              <dl className={styles.fields}>
                {EDI_IDENTIFIERS.map((f) => (
                  <div key={f.label} className={styles.field}>
                    <dt className={styles.fieldLabel}>{f.label}</dt>
                    <dd className={styles.fieldValue}>
                      <span className={styles.fieldMain}>{f.value}</span>
                      {f.note && <span className={styles.fieldNote}>{f.note}</span>}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          )}

          {/* PERFORMANCE */}
          {tab === "performance" && (
            <div className={styles.view}>
              <p className={styles.purpose}>
                What this account is actually experiencing, and what it is charging us for. All values are
                synthetic.
              </p>
              <ul className={styles.metrics}>
                {ACCOUNT_METRICS.map((m) => (
                  <li key={m.label} className={styles.metric} data-meets={m.meets ? "true" : "false"}>
                    <span className={styles.metricLabel}>{m.label}</span>
                    <span className={styles.metricValue}>{m.value}</span>
                    <span className={styles.metricTarget}>Target {m.target}</span>
                    <span className={styles.metricState}>
                      <span aria-hidden="true">{m.meets ? "▲" : "▼"}</span>
                      {m.meets ? "Meets target" : "Below target"}
                    </span>
                    <span className={styles.metricNote}>{m.note}</span>
                  </li>
                ))}
              </ul>

              <h3 className={styles.subH}>Open and recent deductions</h3>
              <ul className={styles.deductions}>
                {DEDUCTION_LOG.map((d) => (
                  <li key={d.id} className={styles.deduction}>
                    <div className={styles.dedHead}>
                      <span className={styles.dedId}>{d.id}</span>
                      <span className={styles.dedReason}>
                        Reason {d.reasonCode}: {d.reason}
                      </span>
                      <span className={styles.dedAmount}>{d.amount}</span>
                      <span className={styles.status} data-status={d.status}>
                        <span aria-hidden="true">{STATUS_GLYPH[d.status]}</span>
                        {STATUS_WORD[d.status]}
                      </span>
                    </div>
                    <dl className={styles.dedGrid}>
                      <div><dt>Evidence</dt><dd>{d.evidence}</dd></div>
                      <div><dt>Outcome</dt><dd>{d.outcome}</dd></div>
                      <div><dt>Prevention</dt><dd>{d.prevention}</dd></div>
                    </dl>
                  </li>
                ))}
              </ul>

              <div className={styles.summary}>
                <div className={styles.summaryRow}>
                  <span>Total disputed</span><strong>{DEDUCTION_SUMMARY.total}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Valid, credited</span><strong>{DEDUCTION_SUMMARY.valid}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Invalid, disputed and recovered</span><strong>{DEDUCTION_SUMMARY.invalid}</strong>
                </div>
                <div className={styles.summaryRow}>
                  <span>Under review</span><strong>{DEDUCTION_SUMMARY.underReview}</strong>
                </div>
                <p className={styles.summaryRead}>
                  <span className={styles.summaryLabel}>The read</span> {DEDUCTION_SUMMARY.read}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className={styles.next}>
          <a href="#o2c" className={styles.nextLink}>See this account move through the order-to-cash flow</a>
        </p>

        <SectionNote sectionId="customer-master" />
      </div>
    </section>
  );
}
