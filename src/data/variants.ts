import type { ProductVariant, SourceRef, FormatId } from "@/types/domain";
import { FAMILIES } from "@/data/families";
import { FORMAT_BY_ID } from "@/data/categories";

/**
 * The 76 format-level variants are generated from each family's `formats`.
 *
 * CRITICAL HONESTY RULE (docs/homepage/08, DECISIONS D-005): official
 * allergens and preparation are bound ONLY to the exact format we have a
 * source for — the Multi noodle packs and the 200g sauce bottles. Other
 * formats (Big Bowl, Cup, 350g, Stick) deliberately carry NO allergen/prep
 * data and a lower confidence, because applying one format's facts to
 * another would be wrong for a food product. The UI shows "verify the
 * current package" wherever format-specific data is absent.
 */

const officialFact = (note: string): SourceRef => ({
  type: "official",
  label: "Official Samyang America product information",
  note,
  lastVerified: "2026-07-07",
});

const variantId = (familyId: string, format: FormatId) => `${familyId}--${format}`;

/** Overrides applied to specific anchor variants that carry official facts. */
const VARIANT_OVERRIDES: Record<string, Partial<ProductVariant>> = {
  // Buldak Carbonara — Multi (official)
  "buldak-carbonara--multi": {
    dataConfidence: "high",
    allergens: ["wheat", "soy", "milk"],
    allergenSource: officialFact("Buldak Carbonara Multi allergen statement."),
    preparation:
      "Cook noodles about five minutes, drain leaving some water, add liquid sauce and cheese powder, mix well.",
    preparationSource: officialFact("Buldak Carbonara Multi preparation."),
    components: ["Noodle block", "Liquid sauce", "Cheese powder"],
    storage: "ambient",
    retailSignals: [
      { retailer: "Walmart", marker: "8,830 ratings", snapshotDate: "2026-07-07" },
      { retailer: "Walmart", marker: "5K+ bought since yesterday", snapshotDate: "2026-07-07" },
      { retailer: "Target", marker: "827 reviews", snapshotDate: "2026-07-07" },
    ],
  },
  // Buldak Original — Multi (official)
  "buldak-original--multi": {
    dataConfidence: "high",
    allergens: ["wheat", "soy", "sesame"],
    allergenSource: officialFact("Buldak Original Multi allergen statement."),
    preparation:
      "Cook noodles about five minutes, drain to roughly four ounces of water, add liquid sauce and briefly stir-fry, then add the roasted sesame and seaweed flakes.",
    preparationSource: officialFact("Buldak Original Multi preparation."),
    components: ["Noodle block", "Liquid sauce", "Roasted sesame & seaweed flakes"],
    storage: "ambient",
    retailSignals: [
      { retailer: "Walmart", marker: "3,174 ratings", snapshotDate: "2026-07-07" },
      { retailer: "Target", marker: "253 reviews", snapshotDate: "2026-07-07" },
    ],
  },
  // Buldak 2X Spicy — Multi (official)
  "buldak-2x-spicy--multi": {
    dataConfidence: "high",
    allergens: ["wheat", "soy", "sesame"],
    allergenSource: officialFact("Buldak 2X Spicy Multi allergen statement."),
    components: ["Noodle block", "Liquid sauce", "Roasted sesame & seaweed flakes"],
    storage: "ambient",
  },
  // Buldak Habanero Lime — Multi (official)
  "buldak-habanero-lime--multi": {
    dataConfidence: "high",
    allergens: ["wheat", "soy"],
    allergenSource: officialFact("Buldak Habanero Lime Multi allergen statement."),
    preparation:
      "Cook the noodles and flakes together, drain leaving some water, then add the sauce afterward and mix.",
    preparationSource: officialFact("Buldak Habanero Lime Multi preparation."),
    components: ["Noodle block", "Flake sachet", "Liquid sauce"],
    storage: "ambient",
  },
  // Buldak Original Hot Sauce — 200g (official)
  "buldak-original-hot-sauce--sauce-200g": {
    dataConfidence: "high",
    allergens: ["wheat", "soy", "coconut"],
    allergenSource: officialFact("Buldak Original Hot Sauce 200g allergen statement (soybean normalized to soy)."),
    storage: "refrigerate-after-opening",
    retailSignals: [
      { retailer: "Walmart", marker: "416 ratings", snapshotDate: "2026-07-07" },
      { retailer: "Walmart", marker: "Overall Pick", snapshotDate: "2026-07-07" },
    ],
  },
  // Buldak Carbonara Hot Sauce — 200g (official)
  "buldak-carbonara-hot-sauce--sauce-200g": {
    dataConfidence: "high",
    allergens: ["wheat", "soy", "milk", "coconut"],
    allergenSource: officialFact("Buldak Carbonara Hot Sauce 200g allergen statement (soybean normalized to soy)."),
    storage: "refrigerate-after-opening",
    retailSignals: [
      { retailer: "Walmart", marker: "737 ratings", snapshotDate: "2026-07-07" },
      { retailer: "Walmart", marker: "Overall Pick", snapshotDate: "2026-07-07" },
    ],
  },
};

function buildVariants(): ProductVariant[] {
  const out: ProductVariant[] = [];
  for (const family of FAMILIES) {
    for (const format of family.formats) {
      const id = variantId(family.id, format);
      const base: ProductVariant = {
        id,
        familyId: family.id,
        format,
        formatLabel: FORMAT_BY_ID[format]?.label ?? format,
        // Default confidence: anchors' non-official formats are "medium"
        // (family-level facts exist), everything else "low".
        dataConfidence: family.isAnchor ? "medium" : "low",
      };
      out.push({ ...base, ...VARIANT_OVERRIDES[id] });
    }
  }
  return out;
}

export const VARIANTS: ProductVariant[] = buildVariants();

export const VARIANT_BY_ID: Record<string, ProductVariant> = Object.fromEntries(
  VARIANTS.map((v) => [v.id, v]),
);

export const variantsForFamily = (familyId: string): ProductVariant[] =>
  VARIANTS.filter((v) => v.familyId === familyId);

/** Default variant for a family: prefer Multi, else the first format. */
export const defaultVariantForFamily = (familyId: string): ProductVariant | undefined => {
  const vs = variantsForFamily(familyId);
  return vs.find((v) => v.format === "multi") ?? vs[0];
};
