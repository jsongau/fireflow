/**
 * Real Samyang product photography mapping.
 *
 * Photos live in `public/products/` (Vite serves `public/` at the site root,
 * so a file `public/products/foo.png` is referenced as `/products/foo.png`).
 *
 * Filenames were extracted from official assets and normalized to lowercase.
 * They do NOT follow a single clean convention — most are
 * `buldak-<format>-<flavor>`, but several are one-off spellings (and a couple
 * carry upstream typos we preserve exactly, e.g. `budakcarbonarastick`,
 * `buldak-potato-habarnero`). Every path below is verified to exist against
 * the extracted file set; families/variants without a real photo are left
 * unmapped so the UI falls back to a placeholder rather than a broken image.
 *
 * Tangle, MEP, and Samyang-branded photos: sourced directly from
 * samyangamerica.com/images/products/ (same official source and transparent-
 * cutout style as the Buldak set above). Filenames match the source site's
 * own naming exactly, including its inconsistent casing (e.g.
 * `mep-Black-Pepper-Beef.png`). Fetch them with
 * `fetch-missing-product-photos.sh` at the repo root before these paths will
 * resolve to real images.
 */

const P = (file: string) => `${import.meta.env.BASE_URL}products/${file}.png`;

/**
 * Variant id (`<familyId>--<format>`) -> product image path.
 * Only variants with a real, format-appropriate photo are listed.
 */
export const IMAGE_BY_VARIANT: Record<string, string> = {
  // --- Buldak Carbonara (noodles) ---
  "buldak-carbonara--multi": P("buldak-multi-carbonara"),
  "buldak-carbonara--big-bowl": P("buldak-big-bowl-carbonara"),
  "buldak-carbonara--cup": P("buldak-cup-carbonara"),

  // --- Buldak Original (noodles) ---
  "buldak-original--multi": P("buldak-multi-original"),
  "buldak-original--big-bowl": P("buldak-big-bowl-original"),
  "buldak-original--cup": P("buldak-cup-original"),

  // --- Buldak 2X Spicy (noodles) ---
  "buldak-2x-spicy--multi": P("buldak-multi-2x-spicy"),
  "buldak-2x-spicy--big-bowl": P("buldak-big-bowl-2x-spicy"),
  "buldak-2x-spicy--cup": P("buldak-cup-2x-spicy"),

  // --- Buldak Cheese (noodles) ---
  "buldak-cheese--multi": P("buldak-multi-cheese"),
  "buldak-cheese--big-bowl": P("buldak-big-bowl-cheese"),
  "buldak-cheese--cup": P("buldak-cup-cheese"),

  // --- Buldak Cream Carbonara (noodles) --- (big-bowl has no photo -> falls back to multi)
  "buldak-cream-carbonara--multi": P("buldak-multi-cream-carbonara"),

  // --- Buldak Habanero Lime (noodles) ---
  "buldak-habanero-lime--multi": P("buldak-multi-habanero-lime"),
  "buldak-habanero-lime--big-bowl": P("buldak-big-bowl-habanero-lime"),

  // --- Buldak Quattro Cheese (noodles) ---
  "buldak-quattro-cheese--multi": P("buldak-multi-quattro-cheese"),
  "buldak-quattro-cheese--big-bowl": P("buldak-big-bowl-quattro-cheese"),

  // --- Buldak Rosé (noodles) ---
  "buldak-rose--multi": P("buldak-multi-rose"),
  "buldak-rose--big-bowl": P("buldak-rose"),

  // --- Buldak Swicy (noodles) ---
  "buldak-swicy--multi": P("buldak-multi-swicy"),
  "buldak-swicy--big-bowl": P("buldak-swicy-bowl"),

  // --- Buldak Taco (noodles) ---
  "buldak-taco--multi": P("buldak-multi-taco"),
  "buldak-taco--big-bowl": P("buldak-taco-bowl"),

  // --- Buldak Yakisoba (noodles) ---
  "buldak-yakisoba--multi": P("buldak-multi-yakisoba"),

  // --- Buldak Korean Chicken (noodles, big-bowl only) ---
  "buldak-korean-chicken--big-bowl": P("buldak-cup-koreanchicken"),

  // --- Buldak Birria (noodles) ---
  "buldak-birria--multi": P("buldakbirriamulti"),
  "buldak-birria--big-bowl": P("birria-bowl"),

  // --- Buldak Original Hot Sauce ---
  "buldak-original-hot-sauce--sauce-200g": P("buldak-sauce-original"),
  "buldak-original-hot-sauce--sauce-350g": P("buldak-sauce-original-350g"),
  "buldak-original-hot-sauce--sauce-stick": P("buldakstick"),

  // --- Buldak Carbonara Hot Sauce ---
  "buldak-carbonara-hot-sauce--sauce-200g": P("buldak-sauce-carbonara"),
  "buldak-carbonara-hot-sauce--sauce-350g": P("buldak-sauce-carbonara-350g"),
  "buldak-carbonara-hot-sauce--sauce-stick": P("budakcarbonarastick"),

  // --- Buldak 2X Spicy Hot Sauce ---
  "buldak-2x-spicy-hot-sauce--sauce-200g": P("buldak-sauce-2x-spicy"),

  // --- Buldak Potato Chips ---
  "buldak-potato-chips-original--bag": P("buldak-potato-original"),
  "buldak-potato-chips-habanero-lime--bag": P("buldak-potato-habarnero"),
  "buldak-potato-chips-quattro-cheese--bag": P("buldak-potato-cheese"),

  // --- Buldak Mac & Cheese Carbo ---
  "buldak-mac-and-cheese-carbo--box": P("mccarbobox"),
  "buldak-mac-and-cheese-carbo--four-cup": P("mccarbobowl4pack"),

  // --- Buldak Mac & Cheese Sweet Corn ---
  "buldak-mac-and-cheese-sweet-corn--box": P("mccheesebox"),
  "buldak-mac-and-cheese-sweet-corn--four-cup": P("mccheese4pack"),

  // --- Buldak Glass Noodles ---
  "buldak-carbo-glass-noodles--pack": P("glass-noodle-carbonara-big-bowl-0112"),
  "buldak-wide-glass-noodle-rose--pack": P("buldak-hmr-wide-glass-noodle-rose"),

  // --- Buldak Dumplings (frozen) ---
  "buldak-carbonara-dumpling--frozen": P("buldak-carbonara-dumpling"),
  "buldak-dumpling--frozen": P("buldak-frozen-giant-dumpling"),

  // --- Buldak Fried Rice (frozen) ---
  "buldak-carbonara-fried-rice--frozen": P("buldak-frozen-carbonara-fried-rice"),
  "buldak-fried-rice--frozen": P("buldak-frozen-fried-rice"),

  // --- Buldak Tteokbokki ---
  "buldak-frozen-tteokbokki--frozen": P("buldak-frozen-topokki"),
  "buldak-frozen-tteokbokki--shelf-stable": P("buldak-hmr-topokki"),
  "buldak-carbo-frozen-topokki--frozen": P("carbofrozentopokki"),
  "buldak-carbo-frozen-topokki--shelf-stable": P("buldak-hmr-carbonara-topokki"),

  // --- Tangle (pasta) ---
  "tangle-garlic-oil--multi": P("multi-garlic-oil"),
  "tangle-garlic-oil--big-bowl": P("bigbowl-garlic-oil"),
  "tangle-creamy-mushroom--multi": P("multi-creamy-mushroom"),
  "tangle-creamy-mushroom--big-bowl": P("bigbowl-creamy-mushroom"),
  "tangle-bulgogi-alfredo--multi": P("multi-bulgogi-alfredo"),
  "tangle-bulgogi-alfredo--big-bowl": P("bigbowl-bulgogi-alfredo"),
  "tangle-chunky-tomato--multi": P("multi-chunky-tomato"),
  "tangle-chunky-tomato--big-bowl": P("bigbowl-chunky-tomato"),

  // --- MEP ---
  "mep-black-pepper-beef--multi": P("mep-Black-Pepper-Beef"),
  "mep-black-pepper-beef--bowl": P("mep-Black-Pepper-Beef-bowl"),
  "mep-garlic-clam--multi": P("mep-Garlic-Clam"),
  "mep-garlic-clam--bowl": P("mep-Garlic-Clam-bowl"),
  "mep-red-pepper-chicken-cilantro--multi": P("mep-Redc-Pepper"),
  "mep-red-pepper-chicken-cilantro--bowl": P("mep-Redc-Pepper-bowl"),

  // --- Samyang-branded ---
  "samyang-ramen--multi": P("samyang-multi-original"),
  "samyang-ramen--cup": P("samyang-cup-original"),
  "samyang-jjajang-ramen--multi": P("samyang-multi-jjajang"),
  "samyang-ramen-extra-spicy--multi": P("samyang-multi-extra-spicy"),
  "samyang-kimchi-ramen--multi": P("samyang-multi-kimchi"),
  "samyang-potato-ramen--multi": P("samyang-multi-potato"),
  "samyang-vegetasty-noodle-soup--multi": P("samyang-multi-vegetasty"),
  "samyang-sattobap--bag": P("sato"),
  "samyang-wang-changgu--bag": P("wang"),
  "samyang-changgu--bag": P("changgu"),
};

/**
 * Family id -> best hero image (prefer the Multi noodle / 200g sauce / bag
 * snack shot). Used when a specific variant has no dedicated photo.
 */
export const IMAGE_BY_FAMILY: Record<string, string> = {
  "buldak-carbonara": P("buldak-multi-carbonara"),
  "buldak-original": P("buldak-multi-original"),
  "buldak-2x-spicy": P("buldak-multi-2x-spicy"),
  "buldak-cheese": P("buldak-multi-cheese"),
  "buldak-cream-carbonara": P("buldak-multi-cream-carbonara"),
  "buldak-habanero-lime": P("buldak-multi-habanero-lime"),
  "buldak-quattro-cheese": P("buldak-multi-quattro-cheese"),
  "buldak-rose": P("buldak-multi-rose"),
  "buldak-swicy": P("buldak-multi-swicy"),
  "buldak-taco": P("buldak-multi-taco"),
  "buldak-yakisoba": P("buldak-multi-yakisoba"),
  "buldak-korean-chicken": P("buldak-cup-koreanchicken"),
  "buldak-birria": P("buldakbirriamulti"),
  "buldak-original-hot-sauce": P("buldak-sauce-original"),
  "buldak-carbonara-hot-sauce": P("buldak-sauce-carbonara"),
  "buldak-2x-spicy-hot-sauce": P("buldak-sauce-2x-spicy"),
  "buldak-potato-chips-original": P("buldak-potato-original"),
  "buldak-potato-chips-habanero-lime": P("buldak-potato-habarnero"),
  "buldak-potato-chips-quattro-cheese": P("buldak-potato-cheese"),
  "buldak-mac-and-cheese-carbo": P("mccarbobox"),
  "buldak-mac-and-cheese-sweet-corn": P("mccheesebox"),
  "buldak-carbo-glass-noodles": P("glass-noodle-carbonara-big-bowl-0112"),
  "buldak-wide-glass-noodle-rose": P("buldak-hmr-wide-glass-noodle-rose"),
  "buldak-carbonara-dumpling": P("buldak-carbonara-dumpling"),
  "buldak-dumpling": P("buldak-frozen-giant-dumpling"),
  "buldak-carbonara-fried-rice": P("buldak-frozen-carbonara-fried-rice"),
  "buldak-fried-rice": P("buldak-frozen-fried-rice"),
  "buldak-frozen-tteokbokki": P("buldak-frozen-topokki"),
  "buldak-carbo-frozen-topokki": P("carbofrozentopokki"),

  "tangle-garlic-oil": P("multi-garlic-oil"),
  "tangle-creamy-mushroom": P("multi-creamy-mushroom"),
  "tangle-bulgogi-alfredo": P("multi-bulgogi-alfredo"),
  "tangle-chunky-tomato": P("multi-chunky-tomato"),

  "mep-black-pepper-beef": P("mep-Black-Pepper-Beef"),
  "mep-garlic-clam": P("mep-Garlic-Clam"),
  "mep-red-pepper-chicken-cilantro": P("mep-Redc-Pepper"),

  "samyang-ramen": P("samyang-multi-original"),
  "samyang-jjajang-ramen": P("samyang-multi-jjajang"),
  "samyang-ramen-extra-spicy": P("samyang-multi-extra-spicy"),
  "samyang-kimchi-ramen": P("samyang-multi-kimchi"),
  "samyang-potato-ramen": P("samyang-multi-potato"),
  "samyang-vegetasty-noodle-soup": P("samyang-multi-vegetasty"),
  "samyang-sattobap": P("sato"),
  "samyang-wang-changgu": P("wang"),
  "samyang-changgu": P("changgu"),
};

/**
 * Resolve the best available image for a variant:
 *   1. exact variant photo, else
 *   2. the family hero photo, else
 *   3. null (caller shows a placeholder).
 */
export function imageForVariant(
  variantId: string,
  familyId: string,
): string | null {
  return IMAGE_BY_VARIANT[variantId] ?? IMAGE_BY_FAMILY[familyId] ?? null;
}
