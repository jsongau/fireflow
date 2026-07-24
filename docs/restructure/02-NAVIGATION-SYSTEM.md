# 02 — Navigation System: mega nav, sub nav, mini nav, breadcrumbs

Four layers. One source of truth: create `src/data/nav.ts` exporting `ROUTES` (top
level) and per-route `SECTIONS`. Today `MegaNav.GROUPS` and `HomePage.FOOTER_COLUMNS`
are duplicated and already drifting. Every layer below reads from `nav.ts`.

---

## Layer 1 — Mega Nav

Six top items, each a **route**. The dropdown panel lists that route's **sections**.
Today every nav item is an anchor on one page; after the split each item navigates.

| Top item | Route | Panel lists |
|---|---|---|
| Products | `/products` | Rankings Lab, Product Dossier, Brand Universe |
| Order | `/order` | Build a bulk order, Request a quote, Set a standing order |
| Support | `/support` | Open an account case, Resolution walkthrough, **Ops Dashboard** (`/ops`) |
| Intelligence | `/intelligence` | Order-to-Cash, Customer Master, Command Center, War Room, Product Signals |
| Leadership | `/leadership` | Team and coaching, Standards and SOP, First 90 days, Track record |
| About | `/about` | What this demonstrates, Why I built FireFlow, Five Colors, Methodology, FAQ |

The `FireFlow / Product Intelligence` lockup stays left and links to `/`, so Home needs
no top item.

### Naming changes and why
- "Explore" becomes **Products**. "Explore" is a vague verb-label; the writing pack says
  name the destination.
- "Order & Buy" becomes **Order**; "Account Support" becomes **Support**; "CX
  Intelligence" becomes **Intelligence**. Single words read as an instrument, not
  marketing, and they fit the collapse budget.
- **Leadership** is new and carries the JD's biggest gap.
- Ops Dashboard is promoted out of a pseudo-route (`#/ops`) into a real route, listed
  first in the Support panel and featured on Home.

### Behavior
Each top button is both a link and a disclosure. Clicking the label navigates; the
chevron opens the panel. A functional chevron inside a dropdown control is permitted by
the writing pack and must be `aria-hidden`. Keep the existing roving-tabindex model
(ArrowLeft/Right/Home/End, Escape closes and restores focus) and `aria-haspopup` /
`aria-expanded`.

Add `aria-current="page"` on the top item matching the active route. Signal it with
**weight plus a 2px gold bottom bar** (a `box-shadow` or `border-bottom`), never color
alone and never a text-decoration underline.

Keep `SoundToggle` as the only bar control. Do not reintroduce an Operator Notes toggle;
notes are always on.

---

## Layer 2 — Sub Nav (per-page sticky bar)

`src/components/navigation/SubNav/SubNav.tsx`. Lists the current route's sections and
tracks scroll. Mounted by each page, not globally, because its contents are route-specific.

```tsx
<nav className={styles.subnav} aria-label="On this page">
  <ul role="list">
    {sections.map((s) => (
      <li key={s.id}>
        <a href={`#${s.id}`} aria-current={s.id === activeId ? "true" : undefined}>
          {s.label}
        </a>
      </li>
    ))}
  </ul>
</nav>
```

### Sticky stack and tokens
- `--nav-h` (MegaNav) at `top: 0`, `z-index: var(--z-nav)` (30).
- `--rail-h` (SelectedProductRail) at `top: var(--nav-h)`, `--z-rail` (20).
  **Change its default from `56px` to `0`** so routes without the rail get no phantom offset.
- **New `--subnav-h`**, measured with `useStickyHeightVar(subnavRef, "--subnav-h")`.
  SubNav is `position: sticky; top: calc(var(--nav-h) + var(--rail-h)); z-index: var(--z-subnav);`
- **New `--z-subnav: 25`**, between rail (20) and nav (30), so the MegaNav dropdown still
  paints over the SubNav.
- Recompose: `--sticky-h: calc(var(--nav-h) + var(--rail-h) + var(--subnav-h));` and keep
  `html { scroll-padding-top: var(--sticky-h); }` plus per-section `scroll-margin-top`.

Treatment mirrors the rail: `background: color-mix(in srgb, var(--surface-1) 92%, transparent);`
`backdrop-filter: blur(8px); border-bottom: 1px solid var(--line);`

Mobile: a horizontally scrollable chip row (`overflow-x: auto; scroll-snap-type: x proximity`).

### Active-section detection
One shared `IntersectionObserver` in a `usePageSections(sections)` hook, consumed by both
SubNav and MiniNav (do not run two observers).

```ts
new IntersectionObserver(cb, {
  rootMargin: `-${stickyPx + 1}px 0px -55% 0px`,
  threshold: 0,
});
```

The top inset equals the measured `--sticky-h`, so a section becomes active only once it
clears the sticky stack. The `-55%` bottom inset switches near the upper third.

### Accessibility
Native `<a>` links: Tab moves, Enter activates. Visible `:focus-visible` ring in `--gold`.
Active item gets `aria-current="true"` plus **weight and a bottom indicator bar**, with a
small `aria-hidden` diamond glyph before the label. Reserve `aria-current="page"` for the
MegaNav route match. On click, `preventDefault`, `history.replaceState` the hash, and
`scrollIntoView({ behavior: prefersReduced ? "auto" : "smooth" })`.

---

## Layer 3 — Mini Nav (in-page progress)

`src/components/navigation/MiniNav/MiniNav.tsx`. A vertical "where am I" indicator for
long routes: primarily `/intelligence`, secondarily `/leadership` and `/about`.

Desktop: fixed to the **right** gutter, mirroring CompareRail on the left, so they never
collide. `top: calc(var(--sticky-h) + var(--space-4))`,
`max-height: calc(100vh - var(--sticky-h) - var(--space-8))`, `z-index: var(--z-rail)`.

### Progress model (never color alone)
Reuse the SupportBar step-rail pattern exactly: `data-state="done | current | upcoming"`.

- `upcoming`: hollow ring, `--text-2` label.
- `current`: filled ring with `--accent` border, bold label, `aria-current="true"`, a `◆` inside.
- `done`: filled marker with a `✓` glyph (`aria-hidden`), `--ok` fill. The check is the cue; color is secondary.

A thin vertical connector fills up to `current`. Include a text readout, "Section 3 of 5,"
so progress is available without decoding markers.

Collapsible with a labeled toggle ("Hide contents" / "Show contents"), persisted like
CompareRail. **Hidden below 900px**, matching CompareRail, so the only fixed element left
on mobile is the SupportBar FAB.

---

## Layer 4 — Breadcrumbs

Current: `FireFlow / Product Intelligence / U.S. Portfolio` with `aria-hidden` slashes.
After routing it becomes `FireFlow / {Route} / {Active section}`, last crumb non-link with
`aria-current="page"`.

The owner wants these "spicy chill" to signal brand loyalty. Three options were evaluated.

### Option A — Monochrome pepper separator (RECOMMENDED)
Replace the `/` with a small inline **SVG chili outline**, roughly 12px, drawn in
`currentColor` at about 55% opacity (`--text-2`). Not an emoji: a hand-tuned monochrome
SVG so it renders identically everywhere and inherits text color. Optionally a single
static pepper tick before the first crumb instead.

Accessibility: `<svg aria-hidden="true" focusable="false">`. The screen reader announces
"FireFlow, Intelligence, Order-to-Cash" with no glyph noise. Monochrome and opacity-based,
so it encodes nothing by color. Colorblind-safe by construction.

**Professionalism risk: LOW.** Reads as a considered brand detail.

### Option B — Heat-level badge appended to the trail (USE WITH CARE)
A chip after the crumbs, `Heat: Very hot ◆◆◆◇◇`, reusing the SelectedProductRail heat
pattern. Only meaningful on `/products` where a product is in context; meaningless on
`/intelligence` or `/about`.

Accessibility: diamonds `aria-hidden`; the word "Very hot" is the real signal. Filled vs
hollow shape carries level without the ember color. Safe.

**Professionalism risk: MEDIUM.** Fine as a contextual product badge. Do **not** fuse it
into the breadcrumb. A breadcrumb is a location trail; loading it with a heat meter muddies
its job.

### Option C — Obangsaek accent (HIGHEST RISK)
A five-segment obangsaek bar at the trail head, or one swatch keyed to the current section.

Obangsaek is inherently color-first, which is precisely the trap for a colorblind owner.
It is acceptable **only** as a fixed decorative brand mark: all five colors always shown,
`aria-hidden`, never encoding which section you are on. The moment one color signals the
active route it breaks the color-alone rule, and once you pair it with a shape and a label
the color adds nothing.

**Professionalism risk: HIGH.**

### Decision
Ship **Option A**, optionally with **one static obangsaek tick** at the trail head. Both
purely decorative and `aria-hidden`. This signals brand fluency at a whisper while the
breadcrumb keeps doing its plain job.

**Explicit warning:** do not build Option C as a per-section color coder, and do not let
Option B's heat meter become part of the trail. Those are the treatments most likely to
read as gimmicky to a hiring manager, and Option C's live color coding would directly
break the colorblind-safety rule the rest of the site is careful about.

---

## Coexistence: z-index and sticky stacking

Top to bottom:

| Layer | position | token | value |
|---|---|---|---|
| SupportBar overlay / drawer (open) | fixed | `--z-dialog` | 60 |
| SupportBar FAB (closed) | fixed | `--z-modal` | 50 |
| MegaNav bar + dropdown panel | sticky | `--z-nav` | 30 |
| **SubNav (new)** | sticky | **`--z-subnav`** | **25** |
| SelectedProductRail | sticky | `--z-rail` | 20 |
| CompareRail (left, fixed) | fixed | `--z-rail` | 20 |
| **MiniNav (right, fixed)** | fixed | `--z-rail` | 20 |

The MegaNav dropdown must keep painting over SubNav and the rail; 25 preserves that. The
SupportBar FAB deliberately stays above the header at 50, so account support is reachable
even while the nav panel is open.

Mobile: SubNav becomes a chip row; SelectedProductRail keeps its compact one-row
disclosure below 640px; CompareRail and MiniNav are both `display: none` below 900px. The
only floating element left is the FAB.

---

## Copy sweep after wiring
Confirm no `→ -> ↗` in any nav label or CTA. No underlined links (use `--gold` plus weight
plus shape). Every active-state indicator pairs color with a glyph, word, or shape. Every
CTA names the action.
