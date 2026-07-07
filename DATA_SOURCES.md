# DATA_SOURCES — FireFlow Product Intelligence

Every fact in the build carries a source type. This file is the registry.

## Source types (as shown in UI)
- **Official** — Samyang America public product information (packaging, allergen statements, preparation, positioning) as captured in the supplied catalog.
- **Public retail signal** — engagement/merchandising markers from third-party retail listings (e.g., Walmart/Target review counts, "Overall Pick"), date-stamped. Not sales.
- **FireFlow editorial** — scores/interpretations the project author created (e.g., First-Time Buyer Fit, flavor-map axes).
- **Synthetic** — invented operational data for demonstration (cases, metrics, owners, timelines). Always labeled.

## Primary supplied sources
| Source | Type | Use | Notes |
|---|---|---|---|
| `samyang_product_catalog_ux_all_markdown.zip` (21 md) | Official + editorial (mixed, labeled per field) | Families, variants, categories, formats, flagship facts, rankings inputs, inquiry taxonomies | The main product/UX specification. |
| `samyang job.pdf` | Official (job posting) | Job→homepage mapping, acceptance test | Indeed posting, Manager CX, Brea CA. |
| `SAMYANG AMERICA_files.zip` product PNGs (54) | Reference imagery | Visual reference / staging placeholders | Rights unresolved — see KNOWN_LIMITATIONS. |
| `indexv5.html` | Structural reference | Interaction/pacing patterns to reinterpret | Do not copy code/design. |
| `animal-template-v2.zip` | Methodology reference | Doc rigor, seven-stage, JSON architecture, honest scoring | Do not copy zodiac content. |

## Retail-signal snapshots captured (date-sensitive, label as research snapshot)
- Buldak Carbonara: Walmart 8,830 ratings, "5K+ bought since yesterday"; Target 827 reviews.
- Buldak Original: Walmart 3,174 ratings; Target 253 reviews.
- Buldak Original Hot Sauce: Walmart 416 ratings, "Overall Pick."
- Buldak Carbonara Hot Sauce: Walmart 737 ratings, "Overall Pick."
- Buldak Yakisoba: Target 102 reviews; Serious Eats taste-test favorite (preference test, not sales).
- Buldak Swicy: Target 72 reviews (Multi marked new).
- Potato Chips Original/Habanero Lime/Quattro Cheese: Target ~76 / ~62 / ~60 reviews.

All snapshot numbers display with retailer + "research snapshot, [date]" and are never aggregated into a sales claim.

## Official facts captured for anchors (examples; variant-bound)
- Buldak Carbonara (Multi): allergens wheat/soy/milk; prep cook 5 min, retain some water, add sauce + cheese powder, mix.
- Buldak Original (Multi): allergens wheat/soy/sesame; prep cook 5 min, retain ~4 oz water, add sauce, stir-fry, add flakes.
- Buldak 2X Spicy (Multi): allergens wheat/soy/sesame.
- Buldak Habanero Lime (Multi): allergens wheat/soy; noodles+flakes cook together, sauce added after.
- Buldak Original Hot Sauce (200g): allergens wheat/soybean/coconut; refrigerate after opening.
- Buldak Carbonara Hot Sauce (200g): allergens wheat/soybean/milk/coconut; refrigerate after opening.

## Standing reminder (shown in UI)
Ingredients, allergens, packaging, and preparation may change; always verify the current physical package. Last-reviewed dates accompany product facts.
