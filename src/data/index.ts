/** Data barrel + integrity helpers for the FireFlow product foundation. */

export * from "@/data/brands";
export * from "@/data/categories";
export * from "@/data/families";
export * from "@/data/variants";
export * from "@/data/rankings";
export * from "@/data/issues";
export * from "@/data/scenarios";
export * from "@/data/sources";
export * from "@/data/skus";
export * from "@/data/quotes";
export * from "@/data/standingOrders";

import { FAMILIES } from "@/data/families";
import { VARIANTS, VARIANT_BY_ID } from "@/data/variants";
import { BRANDS } from "@/data/brands";
import { CATEGORY_BY_ID, FORMAT_BY_ID } from "@/data/categories";
import { ORDERABLE_SKUS, ORDER_VOLUME_TIERS } from "@/data/skus";
import { SAMPLE_STANDING_ORDERS } from "@/data/standingOrders";

export interface IntegrityIssue {
  level: "error" | "warn";
  message: string;
}

/**
 * Structural integrity checks. Errors must be zero before shipping data.
 * Returns issues rather than throwing so a UI or script can report them.
 */
export function checkDataIntegrity(): IntegrityIssue[] {
  const issues: IntegrityIssue[] = [];
  const push = (level: IntegrityIssue["level"], message: string) => issues.push({ level, message });

  // Expected counts (confirmed from the catalog).
  if (FAMILIES.length !== 45) push("error", `Expected 45 families, found ${FAMILIES.length}.`);
  if (VARIANTS.length !== 76) push("error", `Expected 76 variants, found ${VARIANTS.length}.`);

  // Unique ids.
  const famIds = new Set<string>();
  for (const f of FAMILIES) {
    if (famIds.has(f.id)) push("error", `Duplicate family id: ${f.id}`);
    famIds.add(f.id);
    if (!f.formats.length) push("error", `Family ${f.id} has no formats.`);
    if (!CATEGORY_BY_ID[f.category]) push("error", `Family ${f.id} has unknown category ${f.category}.`);
    if (!BRANDS.some((b) => b.id === f.brand)) push("error", `Family ${f.id} has unknown brand ${f.brand}.`);
    for (const fmt of f.formats) {
      if (!FORMAT_BY_ID[fmt]) push("error", `Family ${f.id} references unknown format ${fmt}.`);
    }
    for (const rel of f.relatedFamilyIds ?? []) {
      if (!FAMILIES.some((x) => x.id === rel)) push("warn", `Family ${f.id} relates to unknown family ${rel}.`);
    }
  }

  // Variant integrity.
  const varIds = new Set<string>();
  for (const v of VARIANTS) {
    if (varIds.has(v.id)) push("error", `Duplicate variant id: ${v.id}`);
    varIds.add(v.id);
    if (!famIds.has(v.familyId)) push("error", `Variant ${v.id} references unknown family ${v.familyId}.`);
  }

  // Anchor completeness: each anchor must have full family detail and at least
  // one variant carrying official, format-bound facts.
  for (const f of FAMILIES.filter((x) => x.isAnchor)) {
    if (!f.rankingInputs) push("error", `Anchor ${f.id} is missing rankingInputs.`);
    if (!f.buyerQuestions?.length) push("error", `Anchor ${f.id} is missing buyerQuestions.`);
    if (!f.vendorQuestions?.length) push("error", `Anchor ${f.id} is missing vendorQuestions.`);
    const anchorVariants = VARIANTS.filter((v) => v.familyId === f.id);
    const hasOfficial = anchorVariants.some((v) => v.allergens?.length || v.preparation);
    if (!hasOfficial) push("error", `Anchor ${f.id} has no variant with official allergen/prep facts.`);
  }

  // Commerce layer (synthetic): every SKU must resolve to a real variant, carry
  // a valid MOQ, and have ascending, non-empty price tiers. Standing orders must
  // reference orderable SKUs.
  const orderableIds = new Set(ORDERABLE_SKUS.map((s) => s.variantId));
  for (const s of ORDERABLE_SKUS) {
    if (!VARIANT_BY_ID[s.variantId]) push("error", `SKU ${s.sku} references unknown variant ${s.variantId}.`);
    if (s.moq < 1) push("error", `SKU ${s.sku} has MOQ below 1.`);
    if (s.retailRefCents < 1) push("error", `SKU ${s.sku} has no retail reference price.`);
    // A distributor must never pay more than a retailer for the same case.
    if (s.distributorCaseCents >= s.listCaseCents) {
      push("error", `SKU ${s.sku} distributor base price is not below the retailer base.`);
    }
    // A layer must fit inside a pallet, and a per-line minimum must be orderable.
    if (s.layerCases && s.palletCases && s.layerCases > s.palletCases) {
      push("error", `SKU ${s.sku} layer is larger than its pallet.`);
    }
    if (s.layerCases && s.layerCases < 1) push("error", `SKU ${s.sku} has a layer below 1 case.`);
    if (s.synthetic !== true) push("error", `SKU ${s.sku} is not labeled synthetic.`);
  }
  // Order-level volume ladder: ascending case floors, deepening discounts.
  for (let i = 1; i < ORDER_VOLUME_TIERS.length; i++) {
    const prev = ORDER_VOLUME_TIERS[i - 1];
    const cur = ORDER_VOLUME_TIERS[i];
    if (!prev || !cur) continue;
    if (cur.minTotalCases <= prev.minTotalCases) push("error", "Order volume tiers are not ascending.");
    if (cur.discountPct <= prev.discountPct) push("error", "Order volume discounts do not deepen.");
  }

  for (const so of SAMPLE_STANDING_ORDERS) {
    for (const l of so.lines) {
      if (!orderableIds.has(l.variantId)) push("warn", `Standing order ${so.id} references non-orderable ${l.variantId}.`);
    }
  }

  // Honesty guard: allergens only ever live on variants (the type enforces
  // this at compile time; this is a belt-and-suspenders runtime note).
  return issues;
}

export const DATA_SUMMARY = {
  families: FAMILIES.length,
  variants: VARIANTS.length,
  brands: BRANDS.length,
  skus: ORDERABLE_SKUS.length,
  standingOrders: SAMPLE_STANDING_ORDERS.length,
  anchors: FAMILIES.filter((f) => f.isAnchor).length,
  byBrand: BRANDS.map((b) => ({
    brand: b.id,
    families: FAMILIES.filter((f) => f.brand === b.id).length,
  })),
};
