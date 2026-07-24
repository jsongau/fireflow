import { useMemo, useState } from "react";
import { useHome } from "@/state/homeStore";
import {
  SAMPLE_STANDING_ORDERS,
  CADENCE_LABEL,
  CADENCE_DAYS,
  STANDING_STATUS_LABEL,
  STANDING_STATUS_GLYPH,
} from "@/data/standingOrders";
import {
  formatCents,
  SKU_BY_VARIANT,
  SYNTHETIC_COMMERCE_DISCLAIMER,
} from "@/data/skus";
import { buildQuote } from "@/data/quotes";
import { VARIANT_BY_ID } from "@/data/variants";
import { FAMILY_BY_ID } from "@/data/families";
import { Button, ButtonLink, Segmented } from "@/components/primitives";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import type { StandingOrder as StandingOrderRecord, OrderCadence, AccountType } from "@/types/domain";
import styles from "./StandingOrder.module.css";

/*
 * Standing order — a manager's synthetic recurring-replenishment flow.
 * Job competency this demonstrates: turning a one-off cart into a predictable
 * cadence (auto-generated PO each cycle), and choosing to HOLD instead of
 * short-shipping when stock is tight so fill rate and forecast accuracy stay
 * honest. ALL commerce data here is SYNTHETIC and nothing is transmitted.
 */

const CADENCES: OrderCadence[] = ["weekly", "biweekly", "every-4-weeks", "monthly"];
const CADENCE_OPTIONS = CADENCES.map((value) => ({ value, label: CADENCE_LABEL[value] }));

/** The demo amendment window: how many days before a shipment an account can edit. */
const AMENDMENT_WINDOW_DAYS = 5;

/** Parse a "YYYY-MM-DD" synthetic date at local midnight (avoids UTC drift). */
function parseIsoDate(iso: string): Date {
  return new Date(`${iso}T00:00:00`);
}

/** Readable date label, e.g. "Mon, Jul 20, 2026". */
function formatReadableDate(d: Date): string {
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

/** Human line label from a variant id: family name plus format. */
function lineLabel(variantId: string): string {
  const variant = VARIANT_BY_ID[variantId];
  if (!variant) return variantId;
  const family = FAMILY_BY_ID[variant.familyId];
  const name = family?.name ?? variant.familyId;
  return `${name} · ${variant.formatLabel}`;
}

export function StandingOrder() {
  const { state, dispatch } = useHome();
  const accountType: AccountType = state.userMode === "distributor" ? "distributor" : "retailer";

  // Builder state, seeded from the SHARED cart. The cart lines are read live.
  const [cadence, setCadence] = useState<OrderCadence>("monthly");
  const [autoHold, setAutoHold] = useState(true);
  const [confirmSeq, setConfirmSeq] = useState(0);
  const [confirmed, setConfirmed] = useState<{
    id: string;
    cadence: OrderCadence;
    nextShip: string;
  } | null>(null);

  const cartLines = state.orderLines;
  const hasCart = cartLines.some((l) => l.cases > 0 && SKU_BY_VARIANT[l.variantId]);

  const nextShipDate = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() + CADENCE_DAYS[cadence]);
    return d;
  }, [cadence]);

  const perShipmentSubtotal = useMemo(
    () => buildQuote(cartLines, accountType).subtotalCents,
    [cartLines, accountType],
  );

  // Local, editable copy of the sample standing orders. We never mutate the
  // imported array; toggling status or skipping a shipment updates this copy
  // to demonstrate the interaction.
  const [orders, setOrders] = useState<StandingOrderRecord[]>(() =>
    SAMPLE_STANDING_ORDERS.map((o) => ({ ...o })),
  );

  function togglePause(id: string) {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id ? { ...o, status: o.status === "paused" ? "active" : "paused" } : o,
      ),
    );
  }

  function skipNext(id: string) {
    setOrders((prev) =>
      prev.map((o) => {
        if (o.id !== id) return o;
        const d = parseIsoDate(o.nextShipDate);
        d.setDate(d.getDate() + CADENCE_DAYS[o.cadence]);
        return { ...o, nextShipDate: d.toISOString().slice(0, 10) };
      }),
    );
  }

  function startStandingOrder() {
    const seq = confirmSeq + 1;
    setConfirmSeq(seq);
    setConfirmed({
      id: `SO-${2300 + seq}`,
      cadence,
      nextShip: formatReadableDate(nextShipDate),
    });
  }

  return (
    <section id="standing-order" className={styles.section} aria-labelledby="so-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Order &amp; Buy</p>
            <h2 id="so-h" className={styles.h2}>Standing order</h2>
            <p className={styles.lede}>
              Recurring replenishment for accounts that reorder the same case mix on a rhythm. Set a
              cadence and the purchase order auto-generates each cycle, so a buyer does not rebuild the
              cart every month. When stock is tight, the order can hold and notify instead of
              short-shipping, which keeps fill rate honest and gives the forecast a steady, predictable
              signal to plan against.
            </p>
          </div>
          <div className={styles.headBadge}>
            <span className={styles.headNote}>{SYNTHETIC_COMMERCE_DISCLAIMER}</span>
          </div>
        </div>

        {/* Builder */}
        <div className={styles.builder}>
          <h3 className={styles.panelTitle}>Create a standing order</h3>

          <div className={styles.field}>
            <span className={styles.fieldLabel} id="so-cadence-label">Shipment cadence</span>
            <Segmented
              label="Shipment cadence"
              options={CADENCE_OPTIONS}
              value={cadence}
              onChange={setCadence}
            />
            <p className={styles.dateNote}>
              First shipment: <strong>{formatReadableDate(nextShipDate)}</strong>
            </p>
          </div>

          <div className={styles.field}>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.checkbox}
                checked={autoHold}
                onChange={(e) => setAutoHold(e.target.checked)}
              />
              <span>
                <span className={styles.toggleTitle}>Hold and notify instead of short-shipping</span>
                <span className={styles.toggleHint}>
                  When a line is short on stock, pause that shipment and alert the account rather than
                  sending a partial case count.
                </span>
              </span>
            </label>
            <p className={styles.dateNote}>
              Amendment window: edit up to {AMENDMENT_WINDOW_DAYS} days before each shipment.
            </p>
          </div>

          <div className={styles.field}>
            <span className={styles.fieldLabel}>Per-shipment subtotal</span>
            {hasCart ? (
              <>
                <p className={styles.subtotal}>{formatCents(perShipmentSubtotal)}</p>
                <p className={styles.subtle}>
                  {accountType} pricing on your current bulk-order cart, repeated each
                  shipment. An estimate, not a quote.
                </p>
              </>
            ) : (
              <div className={styles.empty}>
                <p>Your bulk-order cart is empty, so there is nothing to replenish yet.</p>
                <ButtonLink href="#order" variant="secondary" size="sm">
                  Build a bulk order first
                </ButtonLink>
              </div>
            )}
          </div>

          {hasCart && (
            <div className={styles.actions}>
              <Button onClick={startStandingOrder}>Start a standing order</Button>
              {state.userMode === "explore" && (
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={() => dispatch({ type: "SET_MODE", mode: "retailer" })}
                >
                  Set an account type for pricing
                </button>
              )}
            </div>
          )}

          {confirmed && (
            <div className={styles.confirm} role="status" aria-live="polite">
              <p className={styles.confirmHead}>
                Standing order drafted <span className={styles.confirmId}>{confirmed.id}</span>
              </p>
              <dl className={styles.confirmGrid}>
                <div>
                  <dt>Cadence</dt>
                  <dd>{CADENCE_LABEL[confirmed.cadence]}</dd>
                </div>
                <div>
                  <dt>First shipment</dt>
                  <dd>{confirmed.nextShip}</dd>
                </div>
                <div>
                  <dt>Status</dt>
                  <dd>
                    <span className={styles.status} data-status="pending-approval">
                      <span aria-hidden="true">{STANDING_STATUS_GLYPH["pending-approval"]}</span>{" "}
                      {STANDING_STATUS_LABEL["pending-approval"]}
                    </span>
                  </dd>
                </div>
              </dl>
            </div>
          )}
        </div>

        {/* Existing standing orders */}
        <div className={styles.listHead}>
          <h3 className={styles.panelTitle}>Existing standing orders</h3>
        </div>
        <ul className={styles.list}>
          {orders.map((o) => {
            const isPaused = o.status === "paused";
            return (
              <li key={o.id} className={styles.item}>
                <div className={styles.itemMain}>
                  <span className={styles.itemTitle}>{o.accountLabel}</span>
                  <span className={styles.itemMeta}>
                    <span className={styles.status} data-status={o.status}>
                      <span aria-hidden="true">{STANDING_STATUS_GLYPH[o.status]}</span>{" "}
                      {STANDING_STATUS_LABEL[o.status]}
                    </span>
                    <span className={styles.dotSep} aria-hidden="true">·</span>
                    {CADENCE_LABEL[o.cadence]}
                    <span className={styles.dotSep} aria-hidden="true">·</span>
                    {o.lines.length} line{o.lines.length === 1 ? "" : "s"}
                  </span>
                  <span className={styles.itemLines}>
                    {o.lines.map((l) => lineLabel(l.variantId)).join(", ")}
                  </span>
                </div>
                <div className={styles.itemSide}>
                  <span className={styles.sideRow}>
                    Next shipment: <strong>{formatReadableDate(parseIsoDate(o.nextShipDate))}</strong>
                  </span>
                  <span className={styles.sideRow}>
                    Fill rate: <strong>{o.fillRatePct}%</strong>
                  </span>
                  <span className={styles.sideRow}>
                    Hold on backorder: <strong>{o.autoHoldOnBackorder ? "On" : "Off"}</strong>
                  </span>
                </div>
                <div className={styles.itemActions}>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => togglePause(o.id)}
                    aria-label={`${isPaused ? "Resume" : "Pause"} standing order for ${o.accountLabel}`}
                  >
                    {isPaused ? "Resume" : "Pause"}
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => skipNext(o.id)}
                    aria-label={`Skip the next shipment for ${o.accountLabel}`}
                  >
                    Skip next
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>

        <SectionNote sectionId="standing-order" />
      </div>
    </section>
  );
}
