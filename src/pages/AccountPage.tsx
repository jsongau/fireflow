import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent as ReactKeyboardEvent,
} from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import { Segmented, type SegmentedOption } from "@/components/primitives";
import { ButtonLink } from "@/components/primitives/ButtonLink";
import { GlossaryTerm } from "@/components/primitives/GlossaryTerm";
import { useMountTransition } from "@/hooks/useMountTransition";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { formatCents, orderTierFor, skuForCode, unitPriceForOrder } from "@/data/skus";
import { SECTION_NOTES } from "@/data/sectionNotes";
import {
  ACCOUNT,
  ACCOUNT_CASES,
  ACCOUNT_CONTACTS,
  ACCOUNT_DISCLAIMER,
  ACCOUNT_SECTIONS,
  CASES_NOTE,
  CONTACTS_NOTE,
  KPIS,
  KPI_NOTE,
  MANAGER_SUMMARY_COPY,
  PO_LINES,
  PO_TRACE,
  PO_TRACE_REF,
  PROFILE_NOTES,
  RISK_META,
  RISK_REGISTER,
  ROUTING,
  ROUTING_NOTE,
  SNAPSHOT,
  SOPS,
  TRACE_META,
  TRACE_NOTE,
  TRAJECTORY_HYPOTHESES,
  TRAJECTORY_NOTE,
  WHY_THIS_ACCOUNT,
  casesByYear,
  casesOnPo,
  highestSeverity,
  shortPo,
  type AccountCase,
  type PoLine,
} from "@/data/accounts/ranch99";
import styles from "./AccountPage.module.css";

/**
 * AccountPage — a retail account operations dossier at /accounts/99-ranch-market.
 *
 * A full page, not a modal, because the argument is that customer experience in
 * CPG is the whole order chain and not a support inbox. A chain does not fit in a
 * dialog. The one dialog on the page is the order record itself: a purchase
 * order row opens into the full document trail (fulfillment, freight, receipts,
 * required action), because that is the unit a buyer actually disputes.
 *
 * EVERY identifier on this page is invented. See the header of
 * `src/data/accounts/ranch99.ts` for why: the shape of a purchase order teaches
 * everything worth teaching, and a real vendor's wholesale price teaches nothing
 * except that the person publishing it could not be trusted with it.
 *
 * Accessibility. The sticky rail is a real `<nav>` with `aria-current="true"` on
 * the active link, tracked by one IntersectionObserver. Risk is a word and a
 * glyph, never a color: Nathan is colorblind, and a red row would say nothing to
 * him. Every table is a real `<table>` with scoped headers. The order dialog
 * traps Tab, closes on Escape, and returns focus to the row that opened it.
 */

/* Hoisted out of the component. As a `useMemo`-less array literal inside render,
   this changed identity every time `active` changed, which changed the effect's
   dependency, which tore down and rebuilt the IntersectionObserver on every
   scroll-driven section change. */
const SECTION_IDS = ACCOUNT_SECTIONS.map((s) => s.id);

/** One shared observer for the rail, rather than one per section. */
function useActiveSection(ids: string[]): string | null {
  const [active, setActive] = useState<string | null>(ids[0] ?? null);

  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const seen = new Map<string, number>();

    const observer = new IntersectionObserver(
      (entries) => {
        for (const e of entries) seen.set(e.target.id, e.intersectionRatio);
        let best: string | null = null;
        let bestRatio = 0;
        for (const [id, ratio] of seen) {
          if (ratio > bestRatio) {
            bestRatio = ratio;
            best = id;
          }
        }
        if (best) setActive(best);
      },
      { rootMargin: "-20% 0px -60% 0px", threshold: [0, 0.25, 0.5, 1] },
    );

    for (const id of ids) {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [ids]);

  return active;
}

function RiskChip({ level }: { level: keyof typeof RISK_META }) {
  const meta = RISK_META[level];
  return (
    <span className={styles.risk} data-level={level}>
      <span aria-hidden="true">{meta.glyph}</span> {meta.word}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Order record dialog                                                        */
/* -------------------------------------------------------------------------- */

/** Matches the dialog transition duration in AccountPage.module.css. */
const MODAL_EXIT_MS = 220;

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

interface OrderModalProps {
  line: PoLine;
  entered: boolean;
  onClose: () => void;
}

/**
 * The full order record for one PO line: quantities, price basis, the freight
 * and fulfillment trail (including the holes, printed as holes), goods
 * receipts, the required action, and the SAP objects a reader would check.
 * Rendered through a portal so no ancestor transform or overflow clips it.
 */
function OrderModal({ line, entered, onClose }: OrderModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const received = line.receivedQty;
  const short = received !== null && received < line.orderedQty;

  /* Price is derived from the same function the order builder calls, at the
     volume tier the whole purchase order earns. One price source, everywhere. */
  const sku = skuForCode(line.skuCode);
  const poCases = casesOnPo(line.po);
  const tier = orderTierFor(poCases);
  const priceCents =
    sku && !line.unitPriceNote ? unitPriceForOrder(sku, poCases, "distributor") : null;

  const relatedCases = ACCOUNT_CASES.filter((c) => c.poRef === line.po);
  const ship = line.shipment;

  /* Focus the dialog on open; give focus back to the opener on unmount. */
  useEffect(() => {
    const before = document.activeElement as HTMLElement | null;
    closeRef.current?.focus();
    const { overflow } = document.body.style;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = overflow;
      before?.focus();
    };
  }, []);

  const onKeyDown = (e: ReactKeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }
    if (e.key !== "Tab") return;
    const panel = panelRef.current;
    if (!panel) return;
    const focusables = Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter(
      (el) => el.offsetParent !== null,
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last?.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first?.focus();
    }
  };

  return createPortal(
    <div
      className={styles.modalOverlay}
      data-open={entered ? "true" : "false"}
      onKeyDown={onKeyDown}
    >
      {/* The backdrop is click-to-close; Escape and the button do the same. */}
      <div className={styles.modalBackdrop} onClick={onClose} aria-hidden="true" />

      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className={styles.modal}
      >
        <header className={styles.modalHead}>
          <div>
            <p className={styles.modalKicker}>Order record · placed {line.date}</p>
            <h3 id={titleId} className={styles.modalTitle}>
              {line.po}
            </h3>
            <p className={styles.modalSub}>
              {line.product} · article {line.article} · {line.site}
            </p>
          </div>
          <div className={styles.modalHeadRight}>
            <button
              ref={closeRef}
              type="button"
              className={styles.modalClose}
              onClick={onClose}
              aria-label="Close the order record"
            >
              <span aria-hidden="true">&times;</span>
            </button>
          </div>
        </header>

        <div className={styles.modalBody}>
          {/* Quantities and money, the facts a dispute starts from. */}
          <dl className={styles.modalFacts}>
            <div>
              <dt>Ordered</dt>
              <dd>{line.orderedQty} CV</dd>
            </div>
            <div>
              <dt>Confirmed</dt>
              <dd>{line.confirmedQty} CV</dd>
            </div>
            <div>
              <dt>Received</dt>
              <dd>
                {received === null ? (
                  <span className={styles.pending}>Not posted</span>
                ) : (
                  <>
                    {received} CV
                    {short && (
                      <span className={styles.shortBy}>
                        <span aria-hidden="true">▲</span> {line.orderedQty - received} short
                      </span>
                    )}
                  </>
                )}
              </dd>
            </div>
            <div>
              <dt>Delivery</dt>
              <dd>{line.deliveryDate}</dd>
            </div>
            <div>
              <dt>Unit price</dt>
              <dd>
                {priceCents === null ? (
                  <span className={styles.pending}>{line.unitPriceNote ?? "No price"}</span>
                ) : (
                  formatCents(priceCents)
                )}
              </dd>
            </div>
            <div>
              <dt>Invoice</dt>
              <dd>{line.invoiceStatus}</dd>
            </div>
            <div>
              <dt>Order status</dt>
              <dd>{line.orderStatus}</dd>
            </div>
            <div>
              <dt>Risk</dt>
              <dd>
                <RiskChip level={line.risk} />
              </dd>
            </div>
            <div>
              <dt>Owner</dt>
              <dd>{line.owner}</dd>
            </div>
          </dl>

          <p className={styles.poDetailText}>{line.detail}</p>

          {sku && (
            <p className={styles.priceBasis}>
              <span className={styles.lessonLabel}>Where the price comes from.</span>{" "}
              {line.skuCode}, {sku.casePack} units per case. Distributor lane, {poCases} cases
              on this purchase order, which earns the {tier.discountPct}% volume tier.{" "}
              {priceCents !== null
                ? `That quotes ${formatCents(priceCents)} per case, from the same pricing model the order builder on this site uses.`
                : "No price is quoted until the contract price is validated."}
            </p>
          )}

          {/* Fulfillment and freight. The trail is only as complete as what was
              reported to us, and the record prints the holes instead of guesses. */}
          {ship && (
            <div className={styles.shipBlock}>
              <p className={styles.receiptsHead}>Fulfillment and freight</p>
              <dl className={styles.shipFacts}>
                <div>
                  <dt>Fulfilled by</dt>
                  <dd>{ship.fulfilledBy}</dd>
                </div>
                <div>
                  <dt>Lane</dt>
                  <dd>{ship.lane}</dd>
                </div>
                {ship.carrier && (
                  <div>
                    <dt>Outbound carrier</dt>
                    <dd>{ship.carrier}</dd>
                  </div>
                )}
                {ship.vessel && (
                  <div>
                    <dt>Vessel</dt>
                    <dd>{ship.vessel}</dd>
                  </div>
                )}
                {ship.container && (
                  <div>
                    <dt>Container</dt>
                    <dd>
                      {ship.container}
                      {ship.containerType ? `, ${ship.containerType}` : ""}
                    </dd>
                  </div>
                )}
                {ship.forwarder && (
                  <div>
                    <dt>Freight forwarder</dt>
                    <dd>{ship.forwarder}</dd>
                  </div>
                )}
                {ship.portOfLoading && (
                  <div>
                    <dt>Port of loading</dt>
                    <dd>{ship.portOfLoading}</dd>
                  </div>
                )}
                {ship.portOfDischarge && (
                  <div>
                    <dt>Port of discharge</dt>
                    <dd>
                      {ship.portOfDischarge}
                      {ship.portArrival ? `, arrived ${ship.portArrival}` : ""}
                    </dd>
                  </div>
                )}
              </dl>

              {ship.forwarderNote && (
                <p className={styles.shipHole}>
                  <span className={styles.lessonLabel}>Freight trail gap.</span>{" "}
                  {ship.forwarderNote}
                </p>
              )}

              {ship.events.length > 0 && (
                <ol className={styles.shipEvents}>
                  {ship.events.map((ev) => (
                    <li key={`${ev.date}-${ev.label}`}>
                      <span className={styles.shipEventDate}>{ev.date}</span>
                      <span className={styles.shipEventLabel}>
                        {ev.label}
                        {ev.note && <span className={styles.shipEventNote}>{ev.note}</span>}
                      </span>
                    </li>
                  ))}
                </ol>
              )}

              {ship.issues && (
                <p className={styles.shipIssues}>
                  <span className={styles.lessonLabel}>What went wrong in transit.</span>{" "}
                  {ship.issues}
                </p>
              )}
            </div>
          )}

          {line.receipts.length > 0 && (
            <div className={styles.receipts}>
              <p className={styles.receiptsHead}>Goods receipt history</p>
              <ul className={styles.receiptList}>
                {line.receipts.map((r) => (
                  <li key={r.doc}>
                    <span className={styles.receiptDoc}>{r.doc}</span>
                    <span className={styles.receiptDate}>{r.date}</span>
                    <span className={styles.receiptQty}>{r.qty} CV</span>
                  </li>
                ))}
              </ul>
              <p className={styles.receiptsSum}>
                {line.receipts.reduce((n, r) => n + r.qty, 0)} CV received against{" "}
                {line.orderedQty} CV ordered.
                {line.receipts.length > 1 &&
                  " One order, several receipts, and the buyer is the one adding them up."}
              </p>
            </div>
          )}

          {line.checklist && (
            <div className={styles.checklist}>
              <p className={styles.receiptsHead}>Required action</p>
              <ol>
                {line.checklist.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ol>
            </div>
          )}

          {line.sap && (
            <div className={styles.sapBox}>
              <p className={styles.receiptsHead}>SAP SD aligned, a reading claim</p>
              <ul>
                {line.sap.map((x) => (
                  <li key={x}>{x}</li>
                ))}
              </ul>
            </div>
          )}

          <p className={styles.lesson}>
            <span className={styles.lessonLabel}>What this teaches.</span> {line.lesson}
          </p>

          {relatedCases.length > 0 && (
            <p className={styles.modalCases}>
              {relatedCases.map((c) => (
                <a key={c.id} href="#cases" onClick={onClose}>
                  {c.status === "active" ? "Open case" : "Resolved case"} {c.id}: {c.title}
                </a>
              ))}
            </p>
          )}
        </div>

        <p className={styles.modalFoot}>
          The order, freight, and receipt trail behind this line, in one place.
        </p>
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/* Purchase order row                                                         */
/* -------------------------------------------------------------------------- */

/** One compact PO line. The row and its PO button both open the order record. */
function PoRow({ line, onOpen }: { line: PoLine; onOpen: (line: PoLine) => void }) {
  const received = line.receivedQty;
  const short = received !== null && received < line.orderedQty;

  const sku = skuForCode(line.skuCode);
  const poCases = casesOnPo(line.po);
  const priceCents =
    sku && !line.unitPriceNote ? unitPriceForOrder(sku, poCases, "distributor") : null;

  return (
    <tr className={styles.poRow} onClick={() => onOpen(line)}>
      <th scope="row" className={styles.poNum}>
        <button
          type="button"
          className={styles.poOpen}
          aria-haspopup="dialog"
          title={`Open the full record for ${line.po}`}
          onClick={(e) => {
            e.stopPropagation();
            onOpen(line);
          }}
        >
          {shortPo(line.po)}
        </button>
      </th>
      <td className={styles.num}>{line.date}</td>
      <td className={styles.poProduct}>
        {line.product}
        <span className={styles.poSite}>{line.site}</span>
      </td>
      <td className={styles.num}>{line.orderedQty}</td>
      <td className={styles.num}>{line.confirmedQty}</td>
      <td className={styles.num} data-short={short ? "yes" : undefined}>
        {received === null ? (
          <span className={styles.pending}>Not posted</span>
        ) : (
          <>
            {received}
            {short && (
              <span className={styles.shortBy}>
                <span aria-hidden="true">▲</span> {line.orderedQty - received}
              </span>
            )}
          </>
        )}
      </td>
      <td className={styles.num}>{line.deliveryDate}</td>
      <td className={styles.num}>
        {priceCents === null ? (
          <span className={styles.pending} title={line.unitPriceNote ?? undefined}>
            Pending
          </span>
        ) : (
          formatCents(priceCents)
        )}
      </td>
      <td className={styles.poStatus}>{line.statusLabel}</td>
      <td>
        <RiskChip level={line.risk} />
      </td>
    </tr>
  );
}

/* -------------------------------------------------------------------------- */
/* Case card                                                                  */
/* -------------------------------------------------------------------------- */

function CaseCard({ c }: { c: AccountCase }) {
  return (
    <article className={styles.caseCard} data-severity={c.severity} data-status={c.status}>
      <div className={styles.caseTop}>
        <span className={styles.caseId}>{c.id}</span>
        {c.status === "resolved" ? (
          <span className={styles.resolvedChip}>
            <span aria-hidden="true">✓</span> Resolved {c.resolvedDate}
          </span>
        ) : (
          <RiskChip level={c.severity} />
        )}
      </div>
      <h3 className={styles.caseTitle}>{c.title}</h3>

      {/* The named person working it. A queue is not an owner. */}
      <p className={styles.assignee}>
        <span className={styles.assigneeAvatar} aria-hidden="true">
          {c.assigneeInitials}
        </span>
        <span>
          <span className={styles.assigneeName}>{c.assignee}</span>
          <span className={styles.assigneeMeta}>
            Owner lane: {c.owner} · Opened {c.opened}
          </span>
        </span>
      </p>

      <dl className={styles.caseFacts}>
        <div>
          <dt>Source</dt>
          <dd>{c.source}</dd>
        </div>
        <div>
          <dt>Product</dt>
          <dd>{c.product}</dd>
        </div>
        <div>
          <dt>PO reference</dt>
          <dd>{c.poRef}</dd>
        </div>
        {c.ordered !== undefined && c.received !== undefined && (
          <div>
            <dt>Ordered against received</dt>
            <dd>
              {c.ordered} / {c.received} cases{" "}
              <span className={styles.shortBy}>
                <span aria-hidden="true">▲</span> {c.ordered - c.received} short
              </span>
            </dd>
          </div>
        )}
        <div>
          <dt>Metric at risk</dt>
          <dd>{c.metric}</dd>
        </div>
        <div>
          <dt>Supporting</dt>
          <dd>{c.supporting.join(", ")}</dd>
        </div>
        <div>
          <dt>Commitment</dt>
          <dd>{c.promise}</dd>
        </div>
      </dl>

      {c.customerMessage && (
        <blockquote className={styles.caseQuote}>
          <p>{c.customerMessage}</p>
        </blockquote>
      )}

      {c.status === "resolved" && c.resolution ? (
        <div className={styles.caseBlock}>
          <p className={styles.caseBlockLabel}>How it closed</p>
          <p>{c.resolution}</p>
        </div>
      ) : (
        c.response && (
          <div className={styles.caseBlock}>
            <p className={styles.caseBlockLabel}>What I would send back</p>
            <p>{c.response}</p>
          </div>
        )
      )}

      <div className={styles.caseBlock}>
        <p className={styles.caseBlockLabel}>Prevention</p>
        <p>{c.prevention}</p>
      </div>

      {/* Who did what, in order. The record that travels with the case. */}
      <div className={styles.caseBlock}>
        <p className={styles.caseBlockLabel}>Case activity</p>
        <ol className={styles.timeline}>
          {c.activity.map((a) => (
            <li key={`${a.date}-${a.what.slice(0, 24)}`}>
              <span className={styles.timelineWho}>{a.who}</span>
              <span className={styles.timelineWhat}>
                {a.what}
                <span className={styles.timelineDate}>{a.date}</span>
              </span>
            </li>
          ))}
        </ol>
      </div>

      {c.boardCaseId && (
        <Link to={`/ops?case=${c.boardCaseId}`} className={styles.caseLink}>
          Open {c.boardCaseId} on the ops board
        </Link>
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/* The page                                                                   */
/* -------------------------------------------------------------------------- */

const CASE_VIEWS: SegmentedOption<"active" | "resolved">[] = [
  { value: "active", label: `Active (${ACCOUNT_CASES.filter((c) => c.status === "active").length})` },
  {
    value: "resolved",
    label: `Resolved (${ACCOUNT_CASES.filter((c) => c.status === "resolved").length})`,
  },
];

/** Sections that carry a Nathan's Note, for the index at the foot of the page. */
const NOTE_MAP: { sectionId: string; noteId: string; sectionLabel: string }[] = [
  { sectionId: "purchase-orders", noteId: "acct-po-table", sectionLabel: "Purchase orders" },
  { sectionId: "order-trace", noteId: "acct-buyers-chair", sectionLabel: "Open order trace" },
  { sectionId: "cases", noteId: "acct-fill-rate", sectionLabel: "Account cases" },
  { sectionId: "trajectory", noteId: "acct-dormant", sectionLabel: "Account trajectory" },
  { sectionId: "company-notes", noteId: "acct-chain", sectionLabel: "Profile notes" },
  { sectionId: "erp-edi", noteId: "acct-erp", sectionLabel: "ERP and EDI logic" },
  { sectionId: "kpis", noteId: "acct-kpis", sectionLabel: "KPI dashboard" },
  { sectionId: "sops", noteId: "acct-documentation", sectionLabel: "SOP library" },
  { sectionId: "summary", noteId: "acct-summary", sectionLabel: "Hiring manager summary" },
];

export function AccountPage() {
  const reduced = useReducedMotion();
  const active = useActiveSection(SECTION_IDS);
  const [copied, setCopied] = useState(false);
  const copyTimer = useRef<number | null>(null);
  const [caseView, setCaseView] = useState<"active" | "resolved">("active");

  /* The open order record. `openLine` drives the dialog; `lastLine` keeps the
     content mounted through the exit transition so it fades rather than pops. */
  const [openLine, setOpenLine] = useState<PoLine | null>(null);
  const lastLine = useRef<PoLine | null>(null);
  if (openLine) lastLine.current = openLine;
  const { mounted: modalMounted, entered: modalEntered } = useMountTransition(
    openLine !== null,
    reduced ? 0 : MODAL_EXIT_MS,
  );

  /* Open by default on a desktop, where it costs 150px and saves a scroll.
     Closed by default on a phone, where an expanded thirteen-item list would
     push the content it navigates off the screen. Read once, at mount. */
  const [railOpen, setRailOpen] = useState(
    () => typeof window === "undefined" || window.matchMedia("(min-width: 1000px)").matches,
  );

  useEffect(() => () => {
    if (copyTimer.current) window.clearTimeout(copyTimer.current);
  }, []);

  const copySummary = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(MANAGER_SUMMARY_COPY);
      setCopied(true);
      if (copyTimer.current) window.clearTimeout(copyTimer.current);
      copyTimer.current = window.setTimeout(() => setCopied(false), 2400);
    } catch {
      /* Clipboard denied. The text is on the page; nothing is lost. */
      setCopied(false);
    }
  }, []);

  const jump = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: reduced ? "auto" : "smooth",
      block: "start",
    });
  };

  const shownCases = ACCOUNT_CASES.filter((c) => c.status === caseView);

  return (
    <div className={styles.page}>
      {/* ---- Breadcrumb ---------------------------------------------- */}
      <nav className={styles.crumbs} aria-label="Breadcrumb">
        <ol>
          <li>
            <Link to="/">FireFlow</Link>
          </li>
          <li>
            <Link to="/ops">Ops board</Link>
          </li>
          <li aria-current="page">{ACCOUNT.name}</li>
        </ol>
      </nav>

      {/* ---- Hero ---------------------------------------------------- */}
      <header className={styles.hero}>
        <div className={styles.heroText}>
          <p className={styles.eyebrow}>Retail account operations profile</p>
          <h1 className={styles.h1}>{ACCOUNT.name}</h1>
          <p className={styles.subtitle}>{ACCOUNT.subtitle}</p>
          <p className={styles.intro}>{ACCOUNT.intro}</p>

          <ul className={styles.badges}>
            {ACCOUNT.badges.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>

          <div className={styles.ctas}>
            <button type="button" className={styles.ctaPrimary} onClick={() => jump("purchase-orders")}>
              View purchase orders
            </button>
            <button type="button" className={styles.cta} onClick={() => jump("cases")}>
              Review account cases
            </button>
            <button type="button" className={styles.cta} onClick={copySummary}>
              <span aria-hidden="true">{copied ? "✓" : "❐"}</span>{" "}
              {copied ? "Copied" : "Copy manager summary"}
            </button>
            <ButtonLink to="/ops" variant="secondary" size="md">
              Return to ops board
            </ButtonLink>
          </div>

          <p className={styles.srOnly} role="status" aria-live="polite">
            {copied ? "Manager summary copied to the clipboard." : ""}
          </p>
        </div>

        <aside className={styles.heroAside}>
          <p className={styles.heroDisclaimer}>
            <span aria-hidden="true">◆</span> A retail account operations dossier, built from real
            order-management experience.
          </p>

          {/* The two people a working case runs between. Links behave; the
              names, domains, and numbers are reserved synthetic values. */}
          <div className={styles.contacts}>
            {ACCOUNT_CONTACTS.map((c) => (
              <div key={c.id} className={styles.contact} data-side={c.side}>
                <span className={styles.contactAvatar} aria-hidden="true">
                  {c.name
                    .split(" ")
                    .map((w) => w.charAt(0))
                    .slice(0, 2)
                    .join("")}
                </span>
                <div className={styles.contactBody}>
                  <p className={styles.contactName}>{c.name}</p>
                  <p className={styles.contactRole}>{c.role}</p>
                  <p className={styles.contactOrg}>{c.org}</p>
                  <p className={styles.contactLinks}>
                    {c.email && <a href={`mailto:${c.email}`}>{c.email}</a>}
                    {c.phone && c.phoneHref && <a href={`tel:${c.phoneHref}`}>{c.phone}</a>}
                  </p>
                </div>
              </div>
            ))}
            <p className={styles.contactsNote}>{CONTACTS_NOTE}</p>
          </div>
        </aside>
      </header>

      {/* The account intelligence figures, as a strip rather than a sticky rail.
          A third column squeezed the purchase order table into a horizontal
          scroll, which is the one table on this page a reader must be able to
          take in at a glance. */}
      <dl className={styles.intelStrip}>
        <div>
          <dt>Open exceptions</dt>
          <dd>
            {ACCOUNT_CASES.filter((c) => c.status === "active" && c.severity !== "low").length}
          </dd>
        </div>
        <div>
          <dt>Highest severity</dt>
          <dd>
            <RiskChip level={highestSeverity()} />
          </dd>
        </div>
        <div>
          <dt>Order lines shown</dt>
          <dd>{PO_LINES.length}</dd>
        </div>
        <div>
          <dt>Lines with a quantity gap</dt>
          <dd>
            {PO_LINES.filter((l) => l.receivedQty !== null && l.receivedQty < l.orderedQty).length}
          </dd>
        </div>
        <div>
          <dt>Purchase orders</dt>
          <dd>{new Set(PO_LINES.map((l) => l.po)).size}</dd>
        </div>
        <div>
          <dt>Cases resolved</dt>
          <dd>{ACCOUNT_CASES.filter((c) => c.status === "resolved").length}</dd>
        </div>
      </dl>

      <div className={styles.body} data-rail={railOpen ? "open" : "collapsed"}>
        {/* ---- Sticky rail ------------------------------------------- */}
        <nav className={styles.rail} aria-label="Sections on this page">
          <button
            type="button"
            className={styles.railToggle}
            aria-expanded={railOpen}
            aria-controls="account-rail-list"
            onClick={() => setRailOpen((v) => !v)}
            title={railOpen ? "Collapse the section list" : "Expand the section list"}
          >
            <span className={styles.railToggleGlyph} aria-hidden="true">
              {railOpen ? "«" : "»"}
            </span>
            <span className={styles.railToggleLabel}>
              {railOpen ? "Collapse" : "Sections"}
            </span>
          </button>

          <ol id="account-rail-list" className={styles.railList} hidden={!railOpen}>
            {ACCOUNT_SECTIONS.map((s2) => {
              const on = s2.id === active;
              return (
                <li key={s2.id}>
                  <a
                    href={`#${s2.id}`}
                    className={styles.railLink}
                    aria-current={on ? "true" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      jump(s2.id);
                    }}
                  >
                    {/* The active marker is a glyph, not a color. */}
                    <span className={styles.railMark} aria-hidden="true">
                      {on ? "●" : "○"}
                    </span>
                    {s2.label}
                  </a>
                </li>
              );
            })}
          </ol>

          {/* Collapsed, the rail still says where you are. A navigation control
              that hides your position is not a navigation control. */}
          {!railOpen && (
            <p className={styles.railWhere}>
              <span aria-hidden="true">●</span>{" "}
              {ACCOUNT_SECTIONS.find((s2) => s2.id === active)?.label ?? "Top"}
            </p>
          )}
        </nav>

        {/* ---- Main column ------------------------------------------- */}
        <main className={styles.main}>
          {/* 1. Snapshot */}
          <section id="snapshot" className={styles.section} aria-labelledby="snapshot-h">
            <h2 id="snapshot-h" className={styles.h2}>
              Account snapshot
            </h2>
            <dl className={styles.snapshot}>
              {SNAPSHOT.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.value}</dd>
                </div>
              ))}
            </dl>

            <div className={styles.callout}>
              <h3 className={styles.calloutTitle}>Why this account matters</h3>
              <p>{WHY_THIS_ACCOUNT}</p>
            </div>
          </section>

          {/* 2. Purchase orders. Early, because the order book is the account. */}
          <section id="purchase-orders" className={styles.section} aria-labelledby="po-h">
            <div className={styles.sectionHead}>
              <h2 id="po-h" className={styles.h2}>
                Purchase order history
              </h2>
            </div>

            <p className={styles.lede}>
              Select any row to open the full order record: quantities, price basis, the freight
              and fulfillment trail behind the line, goods receipts, and the required action.
            </p>

            <div className={styles.tableScroll}>
              <table className={styles.poTable}>
                <caption className={styles.srOnly}>
                  Purchase order lines with ordered, confirmed, and received quantities. Rows
                  open the full order record.
                </caption>
                <thead>
                  <tr>
                    <th scope="col">PO</th>
                    <th scope="col">Date</th>
                    <th scope="col">Product</th>
                    <th scope="col">
                      Ord<span className={styles.thUnit}> CV</span>
                    </th>
                    <th scope="col">
                      Conf<span className={styles.thUnit}> CV</span>
                    </th>
                    <th scope="col">
                      Recd<span className={styles.thUnit}> CV</span>
                    </th>
                    <th scope="col">Delivery</th>
                    <th scope="col">Price</th>
                    <th scope="col">Status</th>
                    <th scope="col">Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {PO_LINES.map((line) => (
                    <PoRow key={line.id} line={line} onOpen={setOpenLine} />
                  ))}
                </tbody>
              </table>
            </div>
            <p className={styles.tableHint}>
              PO numbers are shortened to their last four digits. The full number sits on the
              order record.
            </p>

            <SectionNote sectionId="acct-po-table" />
          </section>

          {/* 3. Open order trace. The lifecycle, but on the live order. */}
          <section id="order-trace" className={styles.section} aria-labelledby="trace-h">
            <div className={styles.sectionHead}>
              <h2 id="trace-h" className={styles.h2}>
                Open order trace · {PO_TRACE_REF}
              </h2>
            </div>
            <p className={styles.lede}>{TRACE_NOTE}</p>

            <ol className={styles.trace}>
              {PO_TRACE.map((s) => {
                const meta = TRACE_META[s.state];
                return (
                  <li key={s.id} className={styles.traceStep} data-state={s.state}>
                    <span className={styles.traceGlyph} aria-hidden="true">
                      {meta.glyph}
                    </span>
                    <div className={styles.traceBody}>
                      <p className={styles.traceName}>
                        <span className={styles.traceNum} aria-hidden="true">
                          {String(s.step).padStart(2, "0")}
                        </span>
                        <GlossaryTerm
                          term={s.name}
                          definition={s.risk}
                          heading="What can go wrong here"
                        />
                        <span className={styles.traceState} data-state={s.state}>
                          {meta.word}
                        </span>
                      </p>
                      <p className={styles.traceHappened}>{s.happened}</p>
                    </div>
                  </li>
                );
              })}
            </ol>

            <SectionNote sectionId="acct-buyers-chair" />
          </section>

          {/* 4. Cases, active and resolved */}
          <section id="cases" className={styles.section} aria-labelledby="cases-h">
            <div className={styles.sectionHead}>
              <h2 id="cases-h" className={styles.h2}>
                Account cases
              </h2>
              <div className={styles.caseTools}>
                <Segmented
                  label="Case status"
                  options={CASE_VIEWS}
                  value={caseView}
                  onChange={setCaseView}
                  size="sm"
                />
              </div>
            </div>

            <p className={styles.lede}>{CASES_NOTE}</p>

            <div className={styles.caseGrid}>
              {shownCases.map((c) => (
                <CaseCard key={c.id} c={c} />
              ))}
            </div>

            <SectionNote sectionId="acct-fill-rate" />
          </section>

          {/* 5. Account trajectory */}
          <section id="trajectory" className={styles.section} aria-labelledby="trajectory-h">
            <div className={styles.sectionHead}>
              <h2 id="trajectory-h" className={styles.h2}>
                Account trajectory
              </h2>
            </div>

            <p className={styles.lede}>{TRAJECTORY_NOTE}</p>

            {/* Bars are read from the purchase order lines above, so the chart and
                the table can never disagree. The value is written next to each bar
                rather than encoded only in its length. */}
            <ul className={styles.years}>
              {(() => {
                const rows = casesByYear();
                const max = rows.reduce((m, r) => Math.max(m, r.cases), 0) || 1;
                return rows.map((r) => (
                  <li key={r.year} className={styles.year}>
                    <span className={styles.yearLabel}>{r.year}</span>
                    <span className={styles.yearTrack}>
                      <span
                        className={styles.yearFill}
                        style={{ width: `${Math.round((r.cases / max) * 100)}%` }}
                      />
                    </span>
                    <span className={styles.yearValue}>
                      {r.cases.toLocaleString("en-US")} CV
                      <span className={styles.yearOrders}>
                        {r.orders} order{r.orders === 1 ? "" : "s"}
                      </span>
                    </span>
                  </li>
                ));
              })()}
            </ul>

            <h3 className={styles.h3}>What I rule out, and in what order</h3>
            <ol className={styles.hypotheses}>
              {TRAJECTORY_HYPOTHESES.map((h) => (
                <li key={h.rank}>
                  <p className={styles.hypLabel}>
                    <span className={styles.hypRank} aria-hidden="true">
                      {h.rank}
                    </span>
                    {h.label}
                  </p>
                  <p className={styles.hypTest}>{h.test}</p>
                </li>
              ))}
            </ol>

            <SectionNote sectionId="acct-dormant" />
          </section>

          {/* 6. Profile notes */}
          <section id="company-notes" className={styles.section} aria-labelledby="company-notes-h">
            <h2 id="company-notes-h" className={styles.h2}>
              Profile notes
            </h2>
            <p className={styles.lede}>
              Short facts, kept current like a record. The reasoning lives in the note below.
            </p>
            <dl className={styles.profile}>
              {PROFILE_NOTES.map((n) => (
                <div key={n.label} className={styles.profileRow}>
                  <dt>{n.label}</dt>
                  <dd>
                    {n.value}
                    <span className={styles.profileUpdated}>Updated {n.updated}</span>
                  </dd>
                </div>
              ))}
            </dl>
            <SectionNote sectionId="acct-chain" />
          </section>

          {/* 7. ERP / EDI */}
          <section id="erp-edi" className={styles.section} aria-labelledby="erp-h">
            <h2 id="erp-h" className={styles.h2}>
              ERP and EDI logic
            </h2>
            <p className={styles.honest}>
              This page does not claim to be live SAP, and I have not configured or implemented SAP.
              It models the operational logic a customer experience manager needs in order to work
              around SAP, an ERP, and an EDI environment.
            </p>

            <div className={styles.cardGrid}>
              <article className={styles.card}>
                <h3>ERP layer</h3>
                <p>
                  Customer account, sales order, item, quantity, price, delivery, billing, and credit
                  memo logic. The fields a dispute is born in.
                </p>
              </article>
              <article className={styles.card}>
                <h3>EDI layer</h3>
                <p>The documents that move between a retailer and a supplier, and the one that quietly explains a chargeback when it never arrives.</p>
                <ul className={styles.ediList}>
                  <li><strong>850</strong> Purchase order, inbound from the retailer</li>
                  <li><strong>855</strong> Order acknowledgement, our reply</li>
                  <li><strong>856</strong> Advance ship notice, an electronic packing list sent before the truck</li>
                  <li><strong>810</strong> Invoice</li>
                  <li><strong>997</strong> Functional acknowledgement, a transport receipt and not a business acceptance</li>
                </ul>
              </article>
              <article className={styles.card}>
                <h3>SAP SD awareness</h3>
                <p>
                  The supplier side connects to customer master, order entry, pricing and condition
                  records, delivery, billing, returns, and credits. I have read the module and I own
                  the process around it.
                </p>
              </article>
              <article className={styles.card}>
                <h3>Retailer side awareness</h3>
                <p>
                  From the retail side, the purchase order, the goods receipt, the invoice match, and
                  the receiving exception decide whether a supplier is trusted, disputed, or
                  penalized.
                </p>
              </article>
            </div>

            <div className={styles.twoView}>
              <div>
                <p className={styles.twoViewLabel}>The retail side asks</p>
                <p className={styles.twoViewQ}>
                  Did we receive what we ordered, at the expected price, by the expected date?
                </p>
              </div>
              <div>
                <p className={styles.twoViewLabel}>The supplier side asks</p>
                <p className={styles.twoViewQ}>
                  Did we enter, fulfill, ship, invoice, and resolve the order correctly?
                </p>
              </div>
            </div>

            <SectionNote sectionId="acct-erp" />
          </section>

          {/* 8. Routing */}
          <section id="routing" className={styles.section} aria-labelledby="routing-h">
            <h2 id="routing-h" className={styles.h2}>
              Internal routing
            </h2>
            <div className={styles.cardGrid}>
              {ROUTING.map((r) => (
                <article key={r.team} className={styles.card}>
                  <h3>{r.team}</h3>
                  <p>{r.owns}</p>
                </article>
              ))}
            </div>
            <p className={styles.chainNote}>{ROUTING_NOTE}</p>
          </section>

          {/* 9. KPIs */}
          <section id="kpis" className={styles.section} aria-labelledby="kpi-h">
            <div className={styles.sectionHead}>
              <h2 id="kpi-h" className={styles.h2}>
                Account health metrics
              </h2>
            </div>

            <div className={styles.kpiGrid}>
              {KPIS.map((k) => (
                <div key={k.label} className={styles.kpi}>
                  <p className={styles.kpiLabel}>{k.label}</p>
                  <p className={styles.kpiValue}>{k.value}</p>
                  {k.risk && <RiskChip level={k.risk} />}
                  <p className={styles.kpiNote}>{k.note}</p>
                </div>
              ))}
            </div>
            <p className={styles.honest}>{KPI_NOTE}</p>

            <SectionNote sectionId="acct-kpis" />
          </section>

          {/* 10. SOPs */}
          <section id="sops" className={styles.section} aria-labelledby="sop-h">
            <h2 id="sop-h" className={styles.h2}>
              SOP library
            </h2>
            <p className={styles.lede}>
              Each of these carries a code that is cited on the live case when you open one through
              account support, so the procedure and the running system describe the same operation.
            </p>

            <div className={styles.sopGrid}>
              {SOPS.map((s) => (
                <article key={s.id} className={styles.sop}>
                  <p className={styles.sopCode}>{s.code}</p>
                  <h3 className={styles.sopName}>{s.name}</h3>
                  <p className={styles.sopTrigger}>
                    <span className={styles.sopTriggerLabel}>Trigger.</span> {s.trigger}
                  </p>
                  <ol className={styles.sopSteps}>
                    {s.steps.map((step) => (
                      <li key={step}>{step}</li>
                    ))}
                  </ol>
                </article>
              ))}
            </div>

            <SectionNote sectionId="acct-documentation" />
          </section>

          {/* 11. Risk register */}
          <section id="risk" className={styles.section} aria-labelledby="risk-h">
            <h2 id="risk-h" className={styles.h2}>
              Account risk register
            </h2>
            <div className={styles.tableScroll}>
              <table className={styles.riskTable}>
                <thead>
                  <tr>
                    <th scope="col">Risk</th>
                    <th scope="col">Level</th>
                    <th scope="col">Impact</th>
                    <th scope="col">Owner</th>
                    <th scope="col">Prevention</th>
                  </tr>
                </thead>
                <tbody>
                  {RISK_REGISTER.map((r) => (
                    <tr key={r.risk}>
                      <th scope="row">{r.risk}</th>
                      <td>
                        <RiskChip level={r.level} />
                      </td>
                      <td>{r.impact}</td>
                      <td>{r.owner}</td>
                      <td>{r.prevention}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 12. Nathan's Notes anchor. The notes themselves are attached to the
                 sections whose decisions they explain, which is where a note earns
                 its place. This is the index, not a second copy. */}
          <section id="notes" className={styles.section} aria-labelledby="notes-h">
            <h2 id="notes-h" className={styles.h2}>
              Nathan&rsquo;s Notes
            </h2>
            <p className={styles.lede}>
              {NOTE_MAP.length} notes sit on this page, each attached to the section whose
              decision it explains rather than collected here away from the thing it is about.
            </p>
            <ul className={styles.noteIndex}>
              {NOTE_MAP.map((n) => {
                const note = SECTION_NOTES[n.noteId];
                if (!note) return null;
                return (
                  <li key={n.noteId}>
                    <button type="button" onClick={() => jump(n.sectionId)}>
                      {note.title}
                    </button>
                    <span>{n.sectionLabel}</span>
                  </li>
                );
              })}
            </ul>
          </section>

          {/* 13. Hiring manager summary. A short Nathan's Note in the same
                 fourth-wall format as every other note on the site, not a wall
                 of paragraphs. The long form stays one click away on the copy
                 button, for pasting into an email or an ATS field. */}
          <section id="summary" className={styles.section} aria-labelledby="summary-h">
            <h2 id="summary-h" className={styles.h2}>
              Hiring manager summary
            </h2>

            <SectionNote sectionId="acct-summary" />

            <ul className={styles.intelLinks}>
              <li>
                <Link to="/ops?case=FF-2041">FF-2041 on the ops board</Link>
              </li>
              <li>
                <Link to="/intelligence#o2c">The order-to-cash chapter</Link>
              </li>
              <li>
                <Link to="/leadership#sop-register">The full procedure register</Link>
              </li>
            </ul>

            <div className={styles.summaryActions}>
              <button type="button" className={styles.ctaPrimary} onClick={copySummary}>
                <span aria-hidden="true">{copied ? "✓" : "❐"}</span>{" "}
                {copied ? "Copied to clipboard" : "Copy manager summary"}
              </button>
              <ButtonLink to="/ops" variant="secondary" size="md">
                Return to ops board
              </ButtonLink>
            </div>
          </section>

          <p className={styles.footerDisclaimer}>{ACCOUNT_DISCLAIMER}</p>
        </main>
      </div>

      {/* The order record dialog. Mounted through the exit transition so it
          fades out instead of popping off. */}
      {modalMounted && lastLine.current && (
        <OrderModal
          line={lastLine.current}
          entered={modalEntered}
          onClose={() => setOpenLine(null)}
        />
      )}
    </div>
  );
}
