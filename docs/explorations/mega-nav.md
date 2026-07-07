# Mega-Nav Exploration — Options A / B / C

A design exploration for the FireFlow primary navigation, re-skinned from the beige
production theme into a striking dark "Korean-spicy" palette (molten Samyang red and
ember over charcoal, with gold / jade / cobalt as an *obangsaek* nod). Three distinct
mega-dropdown patterns are shown side by side against dummy page content so each panel
can be seen overlaying a real layout.

- **Preview:** `previews/mega-nav.html` (self-contained, no build step — open in a browser)
- **IA:** the five fixed FireFlow groups — Explore, Consumer Care, Vendor Support,
  CX Intelligence, About. Every sub-link resolves to an `#anchor`; not-yet-built
  destinations carry a small **Planned** tag rather than a dead link.

---

## The three concepts

### Option A — Grid with a featured product
A wide multi-column panel. Each group leads with a single featured SKU (real product
image, a one-line editorial read, one call to action) sitting beside a three-column
grid of the group's links. The featured cell gives the menu an editorial anchor and a
merchandising moment without turning into a storefront.

- **Best for:** groups where one SKU or destination is the obvious front door
  (Explore → Buldak Carbonara; Vendor Support → Buldak Original Sauce).
- **Feel:** magazine cover. Confident, opinionated, image-forward.

### Option B — Split list with a live preview
A two-pane panel: the group's categories on the left, a preview pane on the right that
updates the instant a category is hovered **or focused**. The preview carries a product
image plus one line of context, so a reader gets a sense of the destination before
committing to the click. The preview region is an `aria-live="polite"` area, so the
change is announced to assistive tech on keyboard focus, not just on mouse hover.

- **Best for:** dense groups where a short description meaningfully disambiguates
  siblings (Consumer Care, CX Intelligence).
- **Feel:** control surface. Calm, information-rich, responsive to intent.

### Option C — The flavor wall
Explore opens as a strip of real product thumbnails — the SKUs consumers actually ask
about — each a small card with name and a plain heat/format note. The other four groups
stay as tidy, scannable link columns. The asymmetry signals that Explore is the
product-discovery surface while the rest are utility.

- **Best for:** leading with product breadth and personality on the discovery group
  while keeping service groups quiet.
- **Feel:** market stall. Visual, tactile, product-first.

---

## Technique

- **Data-driven render.** One `GROUPS` array (the fixed IA) plus small lookup maps
  (`FEAT`, `PREVIMG`, `WALL`) drive all three navbars, all fifteen panels, and the
  mobile drawer through builder functions. Changing a link once updates every variant —
  the same shape the React port would use.
- **Semantic structure.** Each variant is a `<nav>` with an accessible label; group
  triggers are real `<button>`s carrying `aria-expanded` / `aria-haspopup` /
  `aria-controls`; each panel is a labelled `role="region"`. No `div`-as-button.
- **Animation via transform/opacity only.** Panels open with a short
  `translateY + opacity` keyframe (`panelIn`, 180ms). No layout-thrashing properties
  animate. Hover lift on the flavor-wall tiles is a `translateY` transform.
- **One panel open at a time.** Opening any trigger calls `closeAll(except)`, which
  collapses every other open trigger across all three navbars, so the page never shows
  two panels at once.
- **No hover-only access.** Hover is a convenience, never a requirement: every panel is
  reachable and fully operable by keyboard, and Option B's preview updates on `focus`
  exactly as it does on `mouseenter`.

## Keyboard model & accessibility

Implemented once and shared by all three variants:

| Context | Key | Behaviour |
|---|---|---|
| On a group trigger | `Tab` | Move between triggers in normal tab order |
| On a group trigger | `Enter` / `Space` / `Down` | Open the panel and move focus to its first item |
| On a group trigger | `Left` / `Right` | Move focus to the previous / next group (wraps) — menubar-style |
| On a group trigger | `Home` / `End` | Jump to the first / last group |
| On a group trigger | `Esc` | Close any open panel |
| Inside a panel | `Down` / `Right` | Next item (roving focus, wraps) |
| Inside a panel | `Up` / `Left` | Previous item (wraps) |
| Inside a panel | `Home` / `End` | First / last item |
| Inside a panel | `Esc` | Close the panel **and return focus to its trigger** |
| Anywhere | click outside / `Esc` | Close everything |

Additional a11y details:
- **Focus return.** Closing with `Esc` always returns focus to the trigger that owned
  the panel, so the reader never loses their place.
- **Focus-out close.** A `focusout` listener on each `<nav>` closes that nav's panels
  once focus leaves the whole navbar (covers `Tab`-ing past the last item).
- **Visible focus.** A single high-contrast `:focus-visible` ring (gold on charcoal)
  applies to every interactive element; it is never removed.
- **Announced previews.** Option B's preview pane is `aria-live="polite"`, so category
  changes are spoken on focus.
- **Touch targets.** Triggers, links, tiles, and drawer controls are all ≥44px tall.
- **Skip link** to the first option; a persistent *obangsaek* rule is decorative and
  `aria-hidden`.
- **Contrast.** Warm off-white text (`--text`) on charcoal panels, red/ember reserved
  for accents and state (the open-trigger underline), not for body text.

## Reduced motion

`@media (prefers-reduced-motion: reduce)` disables `scroll-behavior`, removes the panel
open keyframe, cancels the tile hover-lift, and neutralises transitions globally. Panels
still open and close — instantly, without movement — so nothing about the interaction
depends on animation.

## Mobile

Below 820px the horizontal group list is hidden and a **Menu** button appears in each
navbar. It opens a shared full-screen drawer:

- `role="dialog"` + `aria-modal="true"`, scroll of the page body locked while open.
- Groups are native `<details>`/`<summary>` disclosure sections — accessible and
  zero-JS for the expand/collapse itself.
- A lightweight focus trap keeps `Tab` inside the drawer; `Esc` or the **Close menu**
  button dismisses it and returns focus to the Menu button that opened it.
- The trigger's `aria-expanded` reflects drawer state.

Intermediate widths reflow the panels: Option A and B collapse to a single column, the
flavor wall steps 4 → 2 → 1, and Option B's preview stacks above the description.

## Job competency — why this matters for the CX role

- **Two service lanes, one spine.** The IA keeps **Consumer Care** and **Vendor
  Support** as first-class sibling groups. The mega-nav makes the dual mandate of a
  Manager, Customer Experience legible at a glance: a shopper's allergen question and a
  distributor's deduction dispute are both one reach away, and Option B's split preview
  literally shows each lane's destination before the click.
- **Operational navigability.** Grouping is by *job to be done* (find a product, help a
  consumer, support a vendor, read the intelligence, understand the method), not by
  internal org chart. **Planned** tags set honest expectations about what is built
  versus scoped — the kind of roadmap transparency the role is accountable for.
- **Product fluency.** Real SKU imagery throughout (Buldak Carbonara, 2x Spicy, Original
  Sauce, Potato) signals fluency with the actual Samyang America catalog rather than
  placeholder chrome.

## Integration — React + vanilla

The exploration is deliberately framework-free so it can be reviewed instantly, but it
is shaped to port cleanly into the React + Vite + TS app:

- The `GROUPS` array maps 1:1 to a typed `NavGroup[]` config; builder functions become
  a `<MegaNav variant="A|B|C">` component and small `PanelA` / `PanelB` / `PanelC`
  children.
- The keyboard controller is the reference behaviour for a `useMegaNav()` hook (open
  state, `closeAll`, roving focus, focus-return-on-Escape). ARIA attributes shown here
  are exactly what the components should emit.
- Option B's preview state (`syncPreview`) becomes a single `activeCategory` piece of
  state driving the right pane — no imperative DOM writes in the React version.
- Because behaviour is expressed through ARIA + data attributes, the vanilla version and
  the eventual React version stay behaviourally identical, which keeps this file useful
  as a spec, not just a mockup.

## Tradeoffs

| | Strength | Cost / watch-outs |
|---|---|---|
| **A — Grid + featured** | Editorial, merchandises one destination, familiar mega-menu | Featured cell needs curation per group; tallest panel; one image per open = more bytes |
| **B — Split + preview** | Richest disambiguation, strong keyboard/SR story via live region | Two-step read (scan list, glance preview); preview copy must be maintained per link; least conventional |
| **C — Flavor wall** | Product-first personality, fast visual scan of Explore | Only Explore is enriched (others plain); image-heavy strip is the biggest payload; can feel storefront-like if overused |

**Cross-cutting cost:** real product PNGs are large. Production should serve responsive
`srcset` / AVIF and lazy-load panel images (already `loading="lazy"` here). Every image
has an `onerror` fallback to an inline SVG placeholder, so a missing asset degrades to a
labelled tile rather than a broken icon.

**Recommendation:** Option B as the primary pattern for the two service groups (its
preview earns its keep where sibling links are similar), Option C's flavor wall for
Explore, and Option A's featured cell held in reserve for campaign moments. All three
share one controller, so a hybrid is a configuration choice, not a rewrite.
