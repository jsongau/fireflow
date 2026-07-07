/** Data barrel + integrity helpers for the FireFlow product foundation. */

export * from "@/data/brands";
export * from "@/data/categories";
export * from "@/data/families";
export * from "@/data/variants";
export * from "@/data/rankings";
export * from "@/data/issues";
export * from "@/data/scenarios";
export * from "@/data/sources";

import { FAMILIES } from "@/data/families";
import { VARIANTS } from "@/data/variants";
import { BRANDS } from "@/data/brands";
import { CATEGORY_BY_ID, FORMAT_BY_ID } from "@/data/categories";

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
    if (!f.consumerQuestions?.length) push("error", `Anchor ${f.id} is missing consumerQuestions.`);
    if (!f.vendorQuestions?.length) push("error", `Anchor ${f.id} is missing vendorQuestions.`);
    const anchorVariants = VARIANTS.filter((v) => v.familyId === f.id);
    const hasOfficial = anchorVariants.some((v) => v.allergens?.length || v.preparation);
    if (!hasOfficial) push("error", `Anchor ${f.id} has no variant with official allergen/prep facts.`);
  }

  // Honesty guard: allergens only ever live on variants (the type enforces
  // this at compile time; this is a belt-and-suspenders runtime note).
  return issues;
}

export const DATA_SUMMARY = {
  families: FAMILIES.length,
  variants: VARIANTS.length,
  brands: BRANDS.length,
  anchors: FAMILIES.filter((f) => f.isAnchor).length,
  byBrand: BRANDS.map((b) => ({
    brand: b.id,
    families: FAMILIES.filter((f) => f.brand === b.id).length,
  })),
};
