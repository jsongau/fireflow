import { useMemo, useState } from "react";
import { useHome } from "@/state/homeStore";
import {
  buildQuote,
  quoteSla,
  draftQuote,
  SAMPLE_QUOTES,
  QUOTE_STATUS_LABEL,
  QUOTE_STATUS_GLYPH,
} from "@/data/quotes";
import {
  formatCents,
  LEAD_TIME_LABEL,
  LEAD_TIME_GLYPH,
  SYNTHETIC_COMMERCE_DISCLAIMER,
  SKU_BY_VARIANT,
} from "@/data/skus";
import { VARIANT_BY_ID } from "@/data/variants";
import { FAMILY_BY_ID } from "@/data/families";
import { Button, ButtonLink, Segmented } from "@/components/primitives";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import type { AccountType, QuoteRequest as QuoteRecord } from "@/types/domain";
import styles from "./QuoteRequest.module.css";

/*
 * Request a quote (RFQ) — the B2B price-inquiry flow.
 *
 * Job competency this demonstrates: in trade, price is not always public. Volume,
 * ship-to, and terms shape the number, so a retailer or distributor requests a
 * quote and account service responds within a turnaround SLA. This screen shows
 * that intake, built from the SHARED synthetic cart. Nothing is transmitted; the
 * confirmation is generated in the browser and clearly labelled synthetic.
 */

/* Synthetic ship-to network. Invented distribution centers for the demo. */
const SHIP_TO_OPTIONS = [
  "DC-West (Ontario, CA)",
  "DC-Central (Dallas, TX)",
  "DC-East (Edison, NJ)",
];

/* Requested ship window. Illustrative only. */
const SHIP_WINDOW_OPTIONS = ["Next 2 weeks", "3 to 4 weeks", "Flexible"];

/* Payment terms a trade account might request. Synthetic. */
const PAYMENT_TERMS_OPTIONS = ["Net 30", "Net 60", "Prepay"];

const ACCOUNT_OPTIONS = [
  { value: "retailer" as const, label: "Retailer" },
  { value: "distributor" as const, label: "Distributor" },
];

/** Resolve a variant id to its display product + format labels. */
function lineLabels(variantId: string): { name: string; format: string } {
  const variant = VARIANT_BY_ID[variantId];
  const family = variant ? FAMILY_BY_ID[variant.familyId] : undefined;
  return {
    name: family?.name ?? variant?.familyId ?? variantId,
    format: variant?.formatLabel ?? "",
  };
}

export function QuoteRequest() {
  const { state, dispatch } = useHome();

  /* A retailer quotes at retailer tiers; anyone else at retailer unless the
   * visitor is explicitly in the distributor view. */
  const accountType: AccountType =
    state.userMode === "distributor" ? "distributor" : "retailer";

  const [shipTo, setShipTo] = useState(SHIP_TO_OPTIONS[0]!);
  const [shipWindow, setShipWindow] = useState(SHIP_WINDOW_OPTIONS[0]!);
  const [paymentTerms, setPaymentTerms] = useState(PAYMENT_TERMS_OPTIONS[0]!);

  /* Local incrementing counter for synthetic RFQ ids; never a real submission. */
  const [seq, setSeq] = useState(1);
  const [submitted, setSubmitted] = useState<QuoteRecord | null>(null);

  const lines = state.orderLines.filter((l) => l.cases > 0 && SKU_BY_VARIANT[l.variantId]);
  const hasLines = lines.length > 0;

  const result = useMemo(() => buildQuote(lines, accountType), [lines, accountType]);
  const sla = quoteSla(result, accountType);

  const setAccount = (value: string) => {
    dispatch({ type: "SET_MODE", mode: value as AccountType });
  };

  const onSubmit = () => {
    const record = draftQuote(lines, accountType, seq);
    setSubmitted(record);
    setSeq((n) => n + 1);
  };

  const startAnother = () => setSubmitted(null);

  return (
    <section id="quote" className={styles.section} aria-labelledby="quote-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Order &amp; Buy</p>
            <h2 id="quote-h" className={styles.h2}>Request a quote</h2>
            <p className={styles.lede}>
              In trade, price is not always public. Volume, payment terms, and ship-to shape the number,
              so a buyer sends a request for quote and account service responds within a turnaround
              commitment. This intake is built from the bulk order you assembled, priced with the same
              volume tiers as the order builder.
            </p>
          </div>
          <div className={styles.headBadge}>
            <span className={styles.headNote}>{SYNTHETIC_COMMERCE_DISCLAIMER}</span>
          </div>
        </div>

        <div className={styles.accountRow}>
          <span className={styles.accountLabel} id="quote-account-label">Quote as</span>
          <Segmented
            label="Account type for this quote"
            options={ACCOUNT_OPTIONS}
            value={accountType}
            onChange={setAccount}
            size="sm"
          />
        </div>

        {!hasLines ? (
          <div className={styles.empty}>
            <p className={styles.emptyTitle}>No lines to quote yet</p>
            <p className={styles.emptyBody}>
              A quote starts from a bulk order. Build one in cases, then come back here to request pricing
              and terms.
            </p>
            <ButtonLink href="#order" variant="primary" size="md">
              Build a bulk order first
            </ButtonLink>
          </div>
        ) : submitted ? (
          renderConfirmation(submitted)
        ) : (
          <div className={styles.grid}>
            <div className={styles.card}>
              <h3 className={styles.cardTitle}>Requested lines</h3>
              <ul className={styles.lines}>
                {lines.map((l) => {
                  const { name, format } = lineLabels(l.variantId);
                  return (
                    <li key={l.variantId} className={styles.line}>
                      <span className={styles.lineMain}>
                        <span className={styles.lineName}>{name}</span>
                        {format ? <span className={styles.lineFormat}>{format}</span> : null}
                      </span>
                      <span className={styles.lineCases}>{l.cases} case{l.cases === 1 ? "" : "s"}</span>
                    </li>
                  );
                })}
              </ul>

              <dl className={styles.summary}>
                <div className={styles.summaryRow}>
                  <dt className={styles.term}>Estimated subtotal</dt>
                  <dd className={styles.desc}>
                    <strong>{formatCents(result.subtotalCents)}</strong>
                    <span className={styles.subNote}> · {result.totalCases} case{result.totalCases === 1 ? "" : "s"}</span>
                  </dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.term}>Estimated lead time</dt>
                  <dd className={styles.desc}>
                    <span aria-hidden="true">{LEAD_TIME_GLYPH[result.estLeadTime]}</span>{" "}
                    {LEAD_TIME_LABEL[result.estLeadTime]}
                  </dd>
                </div>
                <div className={styles.summaryRow}>
                  <dt className={styles.term}>Turnaround commitment</dt>
                  <dd className={styles.desc}>{sla}</dd>
                </div>
              </dl>
            </div>

            <form
              className={styles.card}
              aria-label="Quote request details"
              onSubmit={(e) => { e.preventDefault(); onSubmit(); }}
            >
              <h3 className={styles.cardTitle}>Where and how</h3>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="quote-shipto">Ship-to</label>
                <select
                  id="quote-shipto"
                  className={styles.select}
                  value={shipTo}
                  onChange={(e) => setShipTo(e.target.value)}
                >
                  {SHIP_TO_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="quote-window">Requested ship window</label>
                <select
                  id="quote-window"
                  className={styles.select}
                  value={shipWindow}
                  onChange={(e) => setShipWindow(e.target.value)}
                >
                  {SHIP_WINDOW_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="quote-terms">Payment terms</label>
                <select
                  id="quote-terms"
                  className={styles.select}
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                >
                  {PAYMENT_TERMS_OPTIONS.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
              </div>

              <p className={styles.formNote}>
                These preferences stay in your browser. Requesting a quote does not transmit anything to
                Samyang or any external system.
              </p>

              <Button type="submit" variant="primary" size="md">Request a quote</Button>
            </form>
          </div>
        )}

        <div className={styles.recent}>
          <h3 className={styles.recentTitle}>Recent quotes</h3>
          <ul className={styles.recentList}>
            {SAMPLE_QUOTES.map((q) => (
              <li key={q.id} className={styles.recentItem}>
                <span className={styles.recentId}>{q.id}</span>
                <span className={styles.status} data-status={q.status}>
                  <span aria-hidden="true">{QUOTE_STATUS_GLYPH[q.status]}</span> {QUOTE_STATUS_LABEL[q.status]}
                </span>
                <span className={styles.recentAmount}>{formatCents(q.subtotalCents)}</span>
                <span className={styles.recentValid}>Valid until {q.validUntil}</span>
              </li>
            ))}
          </ul>
        </div>

        <SectionNote sectionId="quote" />
      </div>
    </section>
  );

  /* ---------------------------------------------------------------- */

  function renderConfirmation(record: QuoteRecord) {
    return (
      <div className={styles.confirm} role="status" aria-live="polite">
        <div className={styles.confirmHead}>
          <p className={styles.confirmEyebrow}>Quote request</p>
          <h3 className={styles.confirmTitle}>Quote request recorded</h3>
        </div>
        <p className={styles.confirmLede}>
          Account service has your request and responds within the turnaround commitment.
        </p>

        <dl className={styles.summary}>
          <div className={styles.summaryRow}>
            <dt className={styles.term}>RFQ reference</dt>
            <dd className={styles.desc}><strong>{record.id}</strong></dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.term}>Status</dt>
            <dd className={styles.desc}>
              <span className={styles.status} data-status={record.status}>
                <span aria-hidden="true">{QUOTE_STATUS_GLYPH[record.status]}</span> {QUOTE_STATUS_LABEL[record.status]}
              </span>
            </dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.term}>Estimated subtotal</dt>
            <dd className={styles.desc}><strong>{formatCents(record.subtotalCents)}</strong></dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.term}>Estimated lead time</dt>
            <dd className={styles.desc}>
              <span aria-hidden="true">{LEAD_TIME_GLYPH[record.estLeadTime]}</span>{" "}
              {LEAD_TIME_LABEL[record.estLeadTime]}
            </dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.term}>Response commitment</dt>
            <dd className={styles.desc}>{record.responseSla}</dd>
          </div>
          <div className={styles.summaryRow}>
            <dt className={styles.term}>Quote valid until</dt>
            <dd className={styles.desc}>{record.validUntil}</dd>
          </div>
        </dl>

        <div className={styles.confirmActions}>
          <Button type="button" variant="secondary" size="md" onClick={startAnother}>
            Start another quote
          </Button>
        </div>
      </div>
    );
  }
}
