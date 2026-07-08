/**
 * Spiciness scale + product-type derivation.
 *
 * Borrowed from Buldak.com's public five-level heat scale and rebuilt in our
 * own editorial voice for the "Buldak Night" dark theme. This is an EDITORIAL
 * mapping — not a scraped official field — so it is always labeled as such in
 * the UI and paired with the word (never conveyed by pepper icons alone).
 */
import type { ProductFamily } from "@/types/domain";

/** Five-level heat scale, index 0..5 (0 = no heat, 5 = the hottest). */
export const SPICE_LEVELS = [
  "Not spicy",
  "Mild Spicy",
  "Medium Spicy",
  "Hot Spicy",
  "Very Spicy",
  "Extreme Spicy",
] as const;

export type SpiceLevelName = (typeof SPICE_LEVELS)[number];

/**
 * Editorial familyId -> level (0..5) map, aligned to Buldak's public five-level
 * scale. Verify each product against the official Buldak.com listing before
 * treating a rating as official.
 */
const SPICE_MAP: Record<string, number> = {
  "buldak-original": 4,
  "buldak-2x-spicy": 5,
  "buldak-carbonara": 2,
  "buldak-cream-carbonara": 2,
  "buldak-cheese": 2,
  "buldak-quattro-cheese": 2,
  "buldak-rose": 2,
  "buldak-swicy": 2,
  "buldak-taco": 3,
  "buldak-yakisoba": 3,
  "buldak-habanero-lime": 3,
  "buldak-birria": 3,
  "buldak-korean-chicken": 3,
  "buldak-original-hot-sauce": 4,
  "buldak-2x-spicy-hot-sauce": 5,
  "buldak-carbonara-hot-sauce": 2,
  "buldak-potato-chips-original": 3,
  "buldak-potato-chips-habanero-lime": 3,
  "buldak-potato-chips-quattro-cheese": 2,
  "buldak-carbonara-dumpling": 2,
  "buldak-dumpling": 3,
  "buldak-carbo-glass-noodles": 2,
  "buldak-wide-glass-noodle-rose": 2,
  "buldak-mac-and-cheese-carbo": 2,
  "buldak-mac-and-cheese-sweet-corn": 1,
  "buldak-carbonara-fried-rice": 2,
  "buldak-fried-rice": 3,
  "buldak-carbo-frozen-topokki": 2,
  "buldak-frozen-tteokbokki": 3,
  "samyang-ramen": 3,
  "samyang-ramen-extra-spicy": 4,
  "samyang-kimchi-ramen": 3,
  "samyang-jjajang-ramen": 1,
  "samyang-potato-ramen": 2,
  "samyang-vegetasty-noodle-soup": 1,
  "samyang-changgu": 1,
  "samyang-sattobap": 1,
  "samyang-wang-changgu": 1,
  "mep-black-pepper-beef": 2,
  "mep-garlic-clam": 1,
  "mep-red-pepper-chicken-cilantro": 3,
  "tangle-bulgogi-alfredo": 0,
  "tangle-chunky-tomato": 0,
  "tangle-creamy-mushroom": 0,
  "tangle-garlic-oil": 0,
};

/** Editorial heat level (0..5) for a family; unmapped families read as 0. */
export function spiceLevel(familyId: string): number {
  return SPICE_MAP[familyId] ?? 0;
}

/** Word for a level, clamped into range. Always available for a11y + labels. */
export function spiceName(level: number): string {
  const max = SPICE_LEVELS.length - 1;
  const clamped = Math.max(0, Math.min(max, Math.floor(level)));
  return SPICE_LEVELS[clamped] ?? SPICE_LEVELS[0];
}

/* ------------------------------------------------------------------ */
/* Product type                                                        */
/* ------------------------------------------------------------------ */

export type ProductType = "Pouch Noodles" | "Cup Noodles" | "Sauces" | "Snacks";

export const ALL_PRODUCT_TYPES: ProductType[] = [
  "Pouch Noodles",
  "Cup Noodles",
  "Sauces",
  "Snacks",
];

const POUCH_FORMATS = new Set<ProductFamily["formats"][number]>([
  "multi",
  "big-bowl",
  "bowl",
  "pack",
  "box",
  "frozen",
  "shelf-stable",
]);

/** Derive one or more merchandising types for a family from its structure. */
export function typesForFamily(f: ProductFamily): ProductType[] {
  if (f.category === "hot-sauce") return ["Sauces"];
  if (f.category === "potato-chips" || f.category === "snack") return ["Snacks"];

  const types: ProductType[] = [];
  if (f.formats.some((fmt) => fmt === "cup" || fmt === "four-cup")) {
    types.push("Cup Noodles");
  }
  if (f.formats.some((fmt) => POUCH_FORMATS.has(fmt))) {
    types.push("Pouch Noodles");
  }
  return types.length > 0 ? types : ["Pouch Noodles"];
}

export const SPICE_SOURCE_NOTE =
  "Spiciness is an editorial mapping aligned to Buldak's public five-level scale (Mild to Extreme Spicy). Confirm each product against the official Buldak.com listing before treating a rating as official.";
