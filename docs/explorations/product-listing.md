# Product Listing — Design Exploration (A / B / C)

Preview: [`previews/product-listing.html`](../../previews/product-listing.html) — one self-contained file, three interactive variants stacked top to bottom with a sticky legend.

## Purpose

Explore three genuinely different ways to display the Buldak product line for FireFlow, re-skinned into the striking dark "Samyang spicy" theme. All three render the **same eight real products** from the same data object, so the comparison is about layout and interaction, not content. Products span the full heat range so the treatment of heat is visible in each: Cream Carbonara (Mild, 1) → Carbonara / Rosé / Quattro Cheese (Moderate, 2) → Habanero Lime / Yakisoba (Hot, 3) → Original (Very hot, 4) → 2X Spicy (Extreme, 5).

Each product card carries: real photo, brand, **heat as pips + word**, format count, a 매운맛 (spicy) chip, a **View product** action, and an **Add to compare** action. A shared compare tray collects picks from any option.

## Shared theme

Dark charcoal/near-black surfaces, molten Samyang red + ember accents, with gold / jade / cobalt used sparingly as the obangsaek (Korean five-color) secondary. Warm off-white text. Bold condensed display type (Anton / Black Han Sans with an Arial-Narrow system fallback, so it stays strong offline). A faint SVG gochugaru-grain overlay and a small 火 mark keep the Korean-spicy flavor without going costumey.

---

## Option A — Editorial magazine grid

**Concept.** The Buldak shelf treated like a magazine spread: big photography on dark, generous whitespace-on-dark, and a hero tile for the flagship (2X Spicy) that spans two columns. Reads as a considered brand statement, not a search-results dump.

**Technique.** Pointer-driven 3D tilt (`perspective` + `rotateX/Y`) with a radial glare that follows the cursor, and the pack image lifts and scales on `translateZ`. All movement is `transform`/`opacity` only, rAF-throttled, and skipped entirely for touch pointers and reduced-motion users. Fluid `clamp()` type scales the headlines from mobile to desktop.

**Best for.** A homepage or category hero where storytelling and product photography carry the page.

**Tradeoffs.** Lowest information density; the hero tile is editorially nice but costs vertical space. The tilt is a "wow" moment that must never carry meaning — verified below.

## Option B — Flame-tier ranked list

**Concept.** A scannable ladder ranked mildest → hottest, so a customer choosing by spice tolerance can read top-to-bottom. Each row shows brand, name, heat, and format count inline; expanding a row slides out prep notes and stats without navigating away.

**Technique.** An animated heat meter fills on scroll-into-view via IntersectionObserver (width transition on a gradient bar). The detail row uses the `grid-template-rows: 0fr → 1fr` slide-reveal so height animates with no JS measurement. The header is a real `<button aria-expanded>` controlling an `aria-controls` panel.

**Best for.** A "shop by heat" / guided-selection view — directly mirrors how a CX team steers newcomers away from 2X Spicy and toward Carbonara or Cream Carbonara.

**Tradeoffs.** Single-column list is photography-light and long on mobile. The meter is a visual flourish; the authoritative heat value stays as pips + the word in the row itself, so the meter can be ignored by AT.

## Option C — Immersive showcase

**Concept.** A dense, tactile gallery on near-black. Each card carries one obangsaek accent color, so the grid keeps a five-color rhythm across the set. Tighter cards make side-by-side compare fast.

**Technique.** A mask-composite glowing border (`-webkit-mask-composite: xor` / `mask-composite: exclude` on a padded pseudo-element) plus an inner radial glow, both following the cursor via `--mx/--my` custom properties. Border and glow also appear on `:focus-within`, so keyboard users get the same affordance. Image scales on hover/focus.

**Best for.** A full catalog browse grid where compare-and-decide is the primary job.

**Tradeoffs.** The near-black surface + glow is the most "designed" and the least neutral; smaller cards mean shorter copy (no editorial note on the card face). The obangsaek accents are decorative rhythm, not encoded data.

---

## Accessibility

- **No information by hover or color alone.** Heat is always pips **plus the word** (e.g. "Very hot") with an off-screen "Heat level 4 of 5" label. All hover/tilt/glow effects are pure decoration; removing them loses nothing. The 매운맛 chip and obangsaek dots are `aria-hidden` decoration.
- **Keyboard operable + visible focus.** Every action is a real `<button>`; a single high-contrast gold focus ring (`:focus-visible`) applies everywhere. Option B rows are `aria-expanded` buttons; Option C's glow triggers on `:focus-within`.
- **Semantic HTML.** `header` / `main` / `section[aria-labelledby]` / `article`, list semantics on the tier list, `aria-pressed` on compare toggles, `role="status"` live region for feedback.
- **Touch targets ≥ 44px.** All buttons are min 44px tall; nav pills and tray controls ≥ 36px.
- **Images** are `loading="lazy"` + `decoding="async"` with a text fallback injected on `onerror` (brand + name), so a missing photo never leaves an empty box.

## Reduced motion

`prefers-reduced-motion: reduce` collapses all transitions/animations, disables the JS tilt and cursor-glow listeners (guarded by `matchMedia` at runtime), fills the heat meters instantly, and reveals all content immediately (no staggered fade). Nothing becomes unusable — only calmer.

## Mobile

Grid A: 3 → 2 → 1 columns, hero tile de-emphasized. Grid C: 4 → 2 → 1. Tier list B: meter hides on narrow screens (heat stays as inline pips + word), detail padding resets. Tilt/glare are pointer-type gated so touch never triggers jitter. Type is fluid via `clamp()`.

## Job-competency tie

- **Product knowledge.** Each option surfaces the same structured attributes (brand, heat, formats) and the editorial notes encode real guidance — e.g. the Original has "no dairy to soften it," Cream Carbonara is "where nervous newcomers should begin."
- **Customer guidance / CX.** Option B is literally a guided "shop by heat" ladder, and the compare tray models the "help me choose between these" conversation a CX manager runs daily. Heat is communicated redundantly (pips + word + meter) the way a good rep repeats "this one's a 5 out of 5, extreme — start milder."

## Integration notes (React + vanilla)

- The single `PRODUCTS` array maps 1:1 to a typed `Product[]` (`id, name, brand, img, heat, word, formats, accent, note`). In React this becomes the props for a `<ProductCard variant="A|B|C">` component; the three renderers here are the JSX bodies.
- Interactions are progressive enhancement: tilt, cursor-glow, meter animation, and staggered reveal are all additive listeners/observers keyed off data attributes, so they port cleanly to `useEffect` hooks (or drop entirely with CSS-only fallback).
- The compare tray is app-level shared state → lift to a `CompareContext` / store; `View product` (stubbed as a toast here) becomes a router link to the PDP. Heat pips, the 매운맛 chip, and the obangsaek dot are small presentational subcomponents shared across variants.
- Images move to the framework's asset pipeline / `<img>` with real `srcset`; the `onerror` fallback stays as a defensive default.

## Recommendation

Lead with **Option B** for a guided "shop by heat" surface (best CX fit), **Option A** for a brand/hero moment, and hold **Option C** for the full catalog grid — they are complementary rather than mutually exclusive, and all three consume the identical data contract.
