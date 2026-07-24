import { useState } from "react";
import { useHome } from "@/state/homeStore";
import {
  ORDERABLE_SKUS,
  SKU_BY_VARIANT,
  unitPriceForOrder,
  lineMinCases,
  lineIncrement,
  formatCents,
  LEAD_TIME_LABEL,
  LEAD_TIME_GLYPH,
  SYNTHETIC_COMMERCE_DISCLAIMER,
  DISTRIBUTOR_MIN_ORDER_CASES,
} from "@/data/skus";
import { buildQuote } from "@/data/quotes";
import { VARIANT_BY_ID } from "@/data/variants";
import { FAMILY_BY_ID } from "@/data/families";
import { CATEGORY_BY_ID } from "@/data/categories";
import { imageForVariant } from "@/data/images";
import { Button, ButtonLink, Segmented } from "@/components/primitives";
import { SectionNote } from "@/components/employer/SectionNote/SectionNote";
import type { AccountType, OrderableSku, LeadTimeBand } from "@/types/domain";
import styles from "./OrderBuilder.module.css";

/** How many SKUs show before the visitor opens the gallery to add more. */
const INITIAL_VISIBLE = 10;

/** Photo path for a SKU (exact variant, else family fallback), or null. */
function photoFor(variantId: string): string | null {
  const familyId = VARIANT_BY_ID[variantId]?.familyId ?? "";
  return imageForVariant(variantId, familyId);
}

/*
 * Bulk order builder — the synthetic B2B case-ordering flow.
 * Job competency this demonstrates: trade-order ownership (MOQ, case packs,
 * volume-break pricing, and lead-time realism surfaced up front, not buried at
 * checkout) and account-aware commerce (retailer vs distributor pricing lanes).
 * ALL catalog, pricing, minimums, and lead times here are SYNTHETIC.
 */

const ACCOUNT_OPTIONS: { value: AccountType; label: string }[] = [
  { value: "retailer", label: "Retailer" },
  { value: "distributor", label: "Distributor" },
];

/** Resolve a variant id to its display name + format label. */
function displayNameFor(variantId: string): { name: string; fmt: string; category: string } {
  const variant = VARIANT_BY_ID[variantId];
  const family = variant ? FAMILY_BY_ID[variant.familyId] : undefined;
  const category = family ? CATEGORY_BY_ID[family.category] : undefined;
  return {
    name: family?.name ?? variantId,
    fmt: variant?.formatLabel ?? "",
    category: category?.label ?? "",
  };
}

/** Lead time rendered as a colorblind-safe glyph paired with its word. */
function LeadTime({ band }: { band: LeadTimeBand }) {
  return (
    <span className={styles.lead} data-lead={band}>
      <span className={styles.leadGlyph} aria-hidden="true">{LEAD_TIME_GLYPH[band]}</span>
      {LEAD_TIME_LABEL[band]}
    </span>
  );
}

export function OrderBuilder() {
  const { state, dispatch } = useHome();
  const accountType: AccountType = state.userMode === "distributor" ? "distributor" : "retailer";

  /** Cases currently in the shared cart for a variant (0 = not in cart). */
  const casesFor = (variantId: string): number =>
    state.orderLines.find((l) => l.variantId === variantId)?.cases ?? 0;

  /** Set a line to a specific case count (0 or less removes it). */
  const setCases = (variantId: string, cases: number) =>
    dispatch({ type: "SET_ORDER_LINE", variantId, cases });

  const quote = buildQuote(state.orderLines, accountType);
  const belowMoq = new Set(quote.belowMoq);
  const isEmpty = quote.lines.length === 0;

  // Show a starter set; the rest live in the gallery until the visitor adds them.
  const [revealed, setRevealed] = useState<string[]>([]);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const inCartIds = new Set(state.orderLines.map((l) => l.variantId));
  const isVisible = (sku: OrderableSku, idx: number) =>
    idx < INITIAL_VISIBLE || revealed.includes(sku.variantId) || inCartIds.has(sku.variantId);
  const visibleSkus = ORDERABLE_SKUS.filter(isVisible);
  const remainingSkus = ORDERABLE_SKUS.filter((s, i) => !isVisible(s, i));

  /** Add a SKU from the gallery: reveal its card and drop its lane minimum in. */
  const addFromGallery = (variantId: string, minCases: number) => {
    setRevealed((r) => (r.includes(variantId) ? r : [...r, variantId]));
    setCases(variantId, minCases);
  };

  /** One orderable card (photo, specs, price, stepper). */
  const renderCard = (sku: OrderableSku) => {
    const { name, fmt, category } = displayNameFor(sku.variantId);
    const current = casesFor(sku.variantId);
    // Price follows the WHOLE order's volume, not this line's quantity.
    const perCase = unitPriceForOrder(sku, quote.totalCases, accountType);
    const inCart = current > 0;
    const minCases = lineMinCases(sku, accountType);
    const step = lineIncrement(sku, accountType);
    const decNext = current - step;
    const photo = photoFor(sku.variantId);

    return (
      <li key={sku.variantId} className={styles.card}>
        {photo ? (
          <img
            className={styles.cardThumb}
            src={photo}
            alt=""
            loading="lazy"
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
          />
        ) : (
          <span className={styles.cardThumbFallback} aria-hidden="true">{name.charAt(0)}</span>
        )}

        <div className={styles.cardMain}>
          <div className={styles.cardHead}>
            <span className={styles.cardName}>{name}</span>
            <span className={styles.cardFmt}>
              {fmt}
              {category ? <span className={styles.cardCat}> · {category}</span> : null}
            </span>
            <span className={styles.cardSku}>{sku.sku}</span>
          </div>

          <dl className={styles.specs}>
            <div className={styles.spec}>
              <dt>Case pack</dt>
              <dd>{sku.casePack} units/case</dd>
            </div>
            <div className={styles.spec}>
              <dt>Minimum per line</dt>
              <dd>
                {minCases} cases
                {accountType === "distributor" ? <span className={styles.cardCat}> (one layer)</span> : null}
              </dd>
            </div>
            <div className={styles.spec}>
              <dt>Lead time</dt>
              <dd><LeadTime band={sku.leadTime} /></dd>
            </div>
            {sku.palletCases ? (
              <div className={styles.spec}>
                <dt>Pallet</dt>
                <dd>{sku.palletCases} cases per pallet</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className={styles.cardBuy}>
          <div className={styles.price}>
            <span className={styles.priceValue}>{formatCents(perCase)}</span>
            <span className={styles.priceUnit}>per case</span>
          </div>

          {inCart ? (
            <div className={styles.stepper} role="group" aria-label={`Cases of ${name} ${fmt}`}>
              <button
                type="button"
                className={styles.stepBtn}
                aria-label={`Decrease cases of ${name} ${fmt}`}
                onClick={() => setCases(sku.variantId, decNext < minCases ? 0 : decNext)}
              >
                <span aria-hidden="true">–</span>
              </button>
              <label className={styles.stepField}>
                <span className={styles.srOnly}>Cases of {name} {fmt}</span>
                <input
                  className={styles.stepInput}
                  type="number"
                  inputMode="numeric"
                  min={0}
                  step={step}
                  value={current}
                  onChange={(e) => {
                    const next = parseInt(e.target.value, 10);
                    setCases(sku.variantId, Number.isNaN(next) ? 0 : next);
                  }}
                />
                <span className={styles.stepUnit}>cases</span>
              </label>
              <button
                type="button"
                className={styles.stepBtn}
                aria-label={`Increase cases of ${name} ${fmt}`}
                onClick={() => setCases(sku.variantId, current + step)}
              >
                <span aria-hidden="true">+</span>
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setCases(sku.variantId, minCases)}
            >
              Add {minCases} cases to order
            </Button>
          )}
        </div>
      </li>
    );
  };

  return (
    <section id="order" className={styles.section} aria-labelledby="order-h">
      <div className={styles.inner}>
        <div className={styles.head}>
          <div>
            <p className={styles.eyebrow}>Order &amp; Buy</p>
            <h2 id="order-h" className={styles.h2}>Bulk order builder</h2>
            <p className={styles.lede}>
              Build a case order the way a trade buyer actually would: case packs, minimum order
              quantities, volume-break pricing, and honest lead times are all on the card, not hidden
              at the end. Pricing follows your account lane, and the order summary totals as you go.
            </p>
          </div>
          <div className={styles.headBadge}>
            <span className={styles.headNote}>{SYNTHETIC_COMMERCE_DISCLAIMER}</span>
          </div>
        </div>

        <div className={styles.accountRow}>
          <div className={styles.accountLabel}>
            <span className={styles.accountTitle}>Account type</span>
            <span className={styles.accountHint}>
              Sets the base price and the per-line minimum. Switching updates every price below.
            </span>
          </div>
          <Segmented<AccountType>
            label="Account type"
            options={ACCOUNT_OPTIONS}
            value={accountType}
            onChange={(mode) => dispatch({ type: "SET_MODE", mode })}
          />
        </div>

        <div className={styles.layout}>
          {/* Catalog + gallery */}
          <div className={styles.catalogCol}>
            <ul className={styles.catalog} aria-label="Orderable case SKUs">
              {visibleSkus.map(renderCard)}
            </ul>

            {remainingSkus.length > 0 && (
              <div className={styles.browseWrap}>
                <button
                  type="button"
                  className={styles.browseMore}
                  aria-expanded={galleryOpen}
                  aria-controls="order-gallery"
                  onClick={() => setGalleryOpen((v) => !v)}
                >
                  {galleryOpen
                    ? "Hide the product gallery"
                    : `Browse ${remainingSkus.length} more products`}
                </button>

                {galleryOpen && (
                  <div id="order-gallery" className={styles.gallery} role="group" aria-label="More products to add">
                    {remainingSkus.map((sku) => {
                      const { name, fmt } = displayNameFor(sku.variantId);
                      const photo = photoFor(sku.variantId);
                      const perCase = unitPriceForOrder(sku, quote.totalCases, accountType);
                      const minCases = lineMinCases(sku, accountType);
                      const added = casesFor(sku.variantId) > 0;
                      return (
                        <div key={sku.variantId} className={styles.tile}>
                          <div className={styles.tileImgWrap}>
                            {photo ? (
                              <img
                                className={styles.tileImg}
                                src={photo}
                                alt=""
                                loading="lazy"
                                onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                              />
                            ) : (
                              <span className={styles.tileFallback} aria-hidden="true">{name.charAt(0)}</span>
                            )}
                            <span className={styles.tileLead} data-lead={sku.leadTime}>
                              <span aria-hidden="true">{LEAD_TIME_GLYPH[sku.leadTime]}</span> {LEAD_TIME_LABEL[sku.leadTime]}
                            </span>
                          </div>
                          <div className={styles.tileInfo}>
                            <span className={styles.tileName}>{name}</span>
                            <span className={styles.tileFmt}>{fmt}</span>
                            <span className={styles.tilePrice}>
                              {formatCents(perCase)} <span className={styles.tilePriceUnit}>per case</span>
                            </span>
                          </div>
                          <Button
                            variant={added ? "ghost" : "primary"}
                            size="sm"
                            disabled={added}
                            onClick={() => addFromGallery(sku.variantId, minCases)}
                          >
                            {added ? "Added to order" : `Add ${minCases} cases`}
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Order summary */}
          <aside className={styles.summary} aria-labelledby="order-summary-h">
            <h3 id="order-summary-h" className={styles.summaryTitle}>Order summary</h3>

            {isEmpty ? (
              <p className={styles.empty}>
                No cases added yet. Add a SKU from the catalog and it lands here with live volume
                pricing for your account lane.
              </p>
            ) : (
              <>
                <ul className={styles.lines}>
                  {quote.lines.map((line) => {
                    const { name, fmt } = displayNameFor(line.variantId);
                    const under = belowMoq.has(line.variantId);
                    const sku = SKU_BY_VARIANT[line.variantId];
                    return (
                      <li key={line.variantId} className={styles.line}>
                        <div className={styles.lineMain}>
                          <span className={styles.lineName}>{name}</span>
                          <span className={styles.lineFmt}>{fmt}</span>
                          <span className={styles.lineQty}>
                            {line.cases} cases at {formatCents(line.unitPriceCents)} per case
                          </span>
                          {under ? (
                            <span className={styles.belowMoq}>
                              <span className={styles.belowGlyph} aria-hidden="true">▲</span>
                              Below minimum{sku ? ` (${lineMinCases(sku, accountType)} cases)` : ""}
                            </span>
                          ) : null}
                          {line.casesToPallet > 0 ? (
                            <span className={styles.palletHint}>
                              <span className={styles.palletGlyph} aria-hidden="true">▤</span>
                              {line.casesToPallet} cases short of a full pallet
                            </span>
                          ) : null}
                        </div>
                        <div className={styles.lineSide}>
                          <span className={styles.lineTotal}>{formatCents(line.lineTotalCents)}</span>
                          <button
                            type="button"
                            className={styles.remove}
                            onClick={() => dispatch({ type: "REMOVE_ORDER_LINE", variantId: line.variantId })}
                          >
                            Remove
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>

                <dl className={styles.totals}>
                  <div className={styles.totalRow}>
                    <dt>Total cases</dt>
                    <dd>{quote.totalCases}</dd>
                  </div>
                  <div className={styles.totalRow}>
                    <dt>Volume tier</dt>
                    <dd>
                      {quote.tier.discountPct > 0
                        ? `${quote.tier.discountPct}% off (${quote.tier.minTotalCases}+ cases)`
                        : "List price"}
                    </dd>
                  </div>
                  <div className={styles.totalRow}>
                    <dt>Estimated lead time</dt>
                    <dd><LeadTime band={quote.estLeadTime} /></dd>
                  </div>
                  <div className={`${styles.totalRow} ${styles.subtotal}`}>
                    <dt>Subtotal</dt>
                    <dd>{formatCents(quote.subtotalCents)}</dd>
                  </div>
                </dl>

                {quote.belowOrderMinimum ? (
                  <p className={styles.orderMinWarn}>
                    <span className={styles.belowGlyph} aria-hidden="true">▲</span>
                    Below the distributor order minimum of {DISTRIBUTOR_MIN_ORDER_CASES} cases. Add{" "}
                    {DISTRIBUTOR_MIN_ORDER_CASES - quote.totalCases} more to release the order.
                  </p>
                ) : null}

                {quote.nextTier ? (
                  <p className={styles.tierNudge}>
                    Add {quote.casesToNextTier} cases, any mix, to reach {quote.nextTier.discountPct}% off.
                  </p>
                ) : null}

                <p className={styles.estimateNote}>
                  Synthetic estimate. Final pricing and terms are confirmed on a quote.
                </p>
              </>
            )}

            <div className={styles.actions}>
              <ButtonLink href="#quote" variant="primary" size="sm">Finalize quote</ButtonLink>
              <ButtonLink href="#standing-order" variant="secondary" size="sm">Set up a standing order</ButtonLink>
              {!isEmpty ? (
                <Button variant="ghost" size="sm" onClick={() => dispatch({ type: "CLEAR_ORDER" })}>
                  Clear order
                </Button>
              ) : null}
            </div>
          </aside>
        </div>

        <SectionNote sectionId="order" />
      </div>
    </section>
  );
}
