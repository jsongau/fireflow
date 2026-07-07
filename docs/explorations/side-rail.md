# Exploration — Sticky Side-Rail (Options A / B / C)

**Prepared:** 2026-07-07 · **Status:** Design exploration (three variants + drop-in recipe). Preview: `previews/side-rail.html`. Theme: the striking dark Korean-spicy re-skin, away from beige.

---

## 0. What this is

A sticky side-rail that carries the **currently selected product and its quick actions** down a long page, so the user never has to re-enter context. The demo pins **Buldak Carbonara** (Multi, 5-pack, heat **Moderate · 2/5**, Buldak accent) and keeps four actions reachable throughout: **Consumer care**, **Vendor support**, **Add to compare**, **Reset**.

Three postures are specced, each a genuinely different answer to the same job:

- **Option A — slim icon rail that unfurls.** A 72px column of icons on the left; hover or keyboard focus widens it, scales the icons, and slides labels in. Collapsed, each icon still names itself.
- **Option B — rich right context rail, always open.** Product photo, brand, format, heat, and all four actions, present the whole scroll. The most legible, at the cost of a permanent column.
- **Option C — right-edge dock of vertical tabs.** Four tabs (Product / Care / Vendor / Compare) ride the edge and slide out a small task-specific panel on activation.

The preview stacks all three as separate sticky containing blocks with tall dummy bodies, plus a sticky legend at the top, so the pin-and-release behavior is visible in each.

---

## 1. Concept per option

**A — Icon rail.** The rail is a quiet margin until reached for. It is the minimalist choice: near-zero footprint, full function on demand. It suits pages where the reading column deserves the whole width and context is a tool you occasionally pick up. The unfurl is a deliberate, reversible gesture — icons scale, labels slide, product name and heat resolve from a compact pip strip to the labelled word "Moderate."

**B — Context rail.** The dossier laid open. Nothing is hidden and nothing depends on hover, which makes it the strongest accessibility posture of the three. It is for long working sessions — a CX manager triaging, a buyer building an order — where the product is the spine of the task and the photo anchors recognition (people remember the package, not the SKU). Its cost is a permanent 320px column.

**C — Tab dock.** The middle path. The reading column stays full width; context parks on the right edge as four labelled tabs, each opening a small panel organized by task rather than by icon. Product shows photo + heat; Care surfaces Consumer care; Vendor surfaces Vendor support; Compare groups Add to compare with Reset. Calmer than a modal drawer: it slides a narrow panel, leaves the page interactive, and closes on Escape or a second press.

---

## 2. Technique

All motion is **transform + opacity only** — no width/left animation driving layout thrash except the intentional, GPU-cheap rail-width transition on A (a single container property, not per-child reflow), and a `max-width` easing on C's panel guarded so opacity/transform carry the perceived motion.

- **A** — width transition on `.a-rail`, driven by `:hover` and `:focus-within` (so tabbing a child expands the whole rail). Icons scale via `transform: scale()`; labels ride in on `translateX` + `opacity`. Collapsed tooltips are pure CSS `::after` using `content: attr(data-label)`, suppressed once the rail is expanded (labels are then visible). The compact heat pips swap to the full labelled heat via display toggles tied to the same hover/focus state.
- **B** — no reveal logic at all; it is a static sticky card. The only motion is button hover/press feedback (`background`, `translateY(1px)`).
- **C** — `role="tablist"` of `role="tab"` buttons with `aria-controls` / `aria-expanded`. Activation swaps panel content (a small JS template map) and toggles `.open`, which animates `opacity` + `translateX`. A single `openTab` guard guarantees only one panel is open. Vanilla JS, ~80 lines, no dependencies.

The shared pieces — heat pips, brand chip, action button, toast live-region — are one set of classes reused across all three, so the app implements them once.

---

## 3. Accessibility

- **In the tab order.** Every action is a real `<button>` (or `role="tab"`), reachable by keyboard in all three options. Nothing is pointer-only.
- **Collapsed rail still labelled (A).** Each collapsed icon carries a full `aria-label` for assistive tech *and* a visible tooltip (`data-label`) for sighted pointer/keyboard users. Meaning never rides on the icon glyph alone.
- **No info by hover or color alone.** Heat is stated as the word "Moderate" plus a "2 / 5" reading, not just red pips. Brand shows the "Buldak" wordmark, not only its accent color. Add-to-compare state is announced via `aria-pressed` and a toast, not a color change.
- **Visible focus.** A solid 3px `--cobalt` `:focus-visible` ring, offset, on every interactive element.
- **Live feedback.** A `role="status" aria-live="polite"` toast announces each action ("Opening Consumer care", "Added to compare", "Selection reset").
- **C keyboard model.** Up/Down (and Left/Right) arrows move focus between tabs, Home/End jump to ends, Enter/Space opens, Escape closes and returns focus to the originating tab. Outside-click closes for pointer users.
- **Touch.** Every target is ≥44px (icon buttons are 44px rows; mobile bar items are ≥52px).

---

## 4. Reduced motion

`@media (prefers-reduced-motion: reduce)` zeroes `--dur-1/2/3` and hard-disables all `transition`/`animation` via a catch-all rule, and switches `scroll-behavior` to `auto`. Result: the icon rail expands **instantly**, the C panel appears/disappears with **no slide**, and nothing else moves. Function and layout are identical with motion off — the animations are decorative only.

---

## 5. Mobile

Below **820px** each option collapses so it never overlaps the reading column awkwardly:

- **A →** compact sticky **bottom bar**: the rail turns horizontal, scrolls its icons, shows short labels, and pins to the bottom of its section.
- **B →** compact sticky **top context strip**: the rich card reflows to a single row (small photo · name · heat · a 4-up action grid) and pins under the legend, so the product stays visible without eating a column.
- **C →** the dock drops to a **bottom bar** of the same four tabs, and the panel opens **upward as a sheet** — never floating over the content, never trapping a scroll.

In the preview these use `position: sticky` (top/bottom) within each section so all three demonstrate on one page; in the real app the single active rail is `position: fixed` (see §7).

---

## 6. Job competency — continuity and proactive service

The rail is the CX principle *never make the customer repeat information*, expressed as an interface. A consumer who selected Buldak Carbonara to check allergens should not reselect it to ask about preparation; a buyer reviewing it for an order should not lose it when scrolling to freight terms. The selection is the running memory of the page.

It is also **proactive service made visible**: the next action a person is likely to want — Consumer care for an eater, Vendor support for a partner — is offered before they go looking for it, ranked by intent (consumer volume leads; staging/reset actions sit quietly below a divider). That is exactly the dual-audience, continuity-first posture the Samyang CX manager role is about: two labelled service lanes plus low-friction staging, carried through the whole page.

---

## 7. Integration

### React app

- **Component:** `src/components/rail/SelectedProductRail/` with one presentational core (`RailBody.tsx` — photo, heat, brand, the four action buttons) and three shells that arrange it: `RailIcon.tsx` (A), `RailContext.tsx` (B), `RailDock.tsx` (C). A `variant` prop or a build flag picks one; the shared `RailBody` means heat/brand/action markup is authored once.
- **State:** read `selectedFamilyId`, `selectedVariantId`, `userMode`, and `compareIds` from the home store (`state/homeStore.tsx`). Consumer care / Vendor support dispatch `SET_MODE` then route; Add to compare dispatches `TOGGLE_COMPARE` (drives `aria-pressed`); Reset dispatches `CLEAR_SELECTION`.
- **Images:** use the real `imageForVariant(variantId, familyId)` / `IMAGE_BY_FAMILY` from `src/data/images.ts`, with the `ProductStage` placeholder as the `onError` fallback — never a broken image (every `<img>` in the preview already carries `onerror`).
- **The shared sticky zone (must not fight the mega-nav).** The mega-nav spec establishes **one** sticky container, `.ff-topzone`, with a hard rule of no competing sticky elements. This side-rail must respect that:
  - **Option B and A-as-strip** belong *inside the reading layout*, sticking to `top: var(--ff-topzone-h)` (the measured height of the shared top zone), so the rail pins directly **below** the mega-nav + selected-product row, never overlapping it. They are column-level sticky, not page-level — this does not add a second page-spanning sticky element, it adds a sticky *column* within the content grid, which the visual-system restraint rule permits.
  - **Option C's dock** is edge-anchored and also sticks at `top: var(--ff-topzone-h)`; on mobile it becomes the one fixed bottom bar. Because the mega-nav already renders the selected-product **rail row** (row 2 of the zone), Option C is best read as the *expanded, action-rich companion* to that thin row — the row states the product, the dock offers the deeper task panels. If C ships, the row-2 rail can shrink to product identity only, avoiding duplicate action sets.
  - Set `scroll-margin-top: var(--ff-topzone-h)` on sections (already the mega-nav convention) so anchor jumps clear both the top zone and any pinned rail.

### Vanilla single-file preview

- `previews/side-rail.html` is self-contained and follows the existing `preview.html` conventions: CSS-variable theme, a delegated `click` handler, `data-*` hooks (`data-toast`, `data-tab`), and a small render/template map for C's panels. To fold into `preview.html`, lift the `.a-* / .b-* / .c-*` blocks, reuse the existing `esc()` helper, and wire the buttons to the real store dispatchers listed above. The `data-*` names do not collide with the current set.

---

## 8. Tradeoffs

- **A (icon rail).** Smallest footprint, but the reveal is a hover/focus dependency — mitigated by always-present `aria-label` + tooltip and full keyboard focus-expand, yet it is still the option that hides the most by default. Best when reading width is precious.
- **B (context rail).** Most accessible and most legible (zero hover dependency, everything on screen), but it permanently spends a 320px column and can feel heavy on shorter pages. Best when the page is long and the product is the spine of the task.
- **C (tab dock).** Lightest permanent footprint with richer-than-icons content on demand, but it is the most JavaScript (tablist keyboard model, panel state) and it risks **duplicating** the mega-nav's row-2 rail actions — resolved by demoting that row to identity-only if C ships. Best as the expanded companion to a thin sticky rail row.
- **Cross-cutting:** all three reference real product PNGs; keep them `loading="lazy"` and rely on the `onError` placeholder. And all three must defer to the single shared sticky zone — the biggest integration risk is two things trying to pin at `top: 0`; the fix is column-level/edge-level stickiness offset by `--ff-topzone-h`, never a second full-width sticky bar.

---

## 9. Recommendation

Ship **Option B** as the default for the long product/dossier pages (accessibility-first, no hover dependency, the photo does real orienting work), and keep **Option C** in reserve as the companion to a slimmed mega-nav rail row where horizontal space is tight. **Option A** is the fallback for the narrowest layouts where even 320px is too much. All three are built from one shared `RailBody`, so the choice is a shell, not a rewrite.
