# 12 — Visual System

**Prepared:** 2026-07-07 · **Status:** Core doc, complete

Bold, appetizing, energetic, contemporary, operationally credible, premium, highly interactive — and independent from Samyang's official site. Not a SaaS dashboard, not a copied Samyang page, not a cartoon ramen game, not a crypto/neon interface, not a template with product photos pasted in.

## 1. Color tokens

Deep charcoal base, warm cream paper, controlled chili red, carbonara pink, plus lime/amber operational status accents. Two surfaces: dark (immersive/hero/command) and light (reading/dossier/methodology).

```css
:root{
  /* Ink & paper */
  --ink-900:#171311;   /* near-black charcoal, dark surfaces */
  --ink-800:#221b18;
  --ink-700:#332924;
  --paper-50:#faf4ea;  /* warm cream */
  --paper-100:#f3e9da;
  --paper-200:#e7d8c3;

  /* Brand heat */
  --chili-600:#c2341d; /* controlled chili red — primary accent */
  --chili-500:#d94f2f;
  --chili-050:#f7e0d8;
  --carbo-400:#e79bb0; /* carbonara pink — secondary accent */
  --carbo-200:#f4d3dc;

  /* Operational status (never color-alone) */
  --ok-500:#4c9a2a;    /* lime/green — on track */
  --warn-500:#e0a021;  /* amber — attention */
  --risk-600:#c2341d;  /* red — at risk (pair with icon+label) */
  --info-500:#3a7ca5;  /* blue — informational */

  /* Source-type accents (rankings/dossier) */
  --src-official:#3a7ca5;
  --src-retail:#7a6f66;
  --src-editorial:#8a5a2b;
  --src-synthetic:#6b5b95;

  /* Neutrals for operational UI */
  --slate-600:#5b524c; --slate-400:#8b817a; --line:#00000018;
}
```

Contrast: body text on paper and on ink both meet WCAG AA (≥4.5:1); large display text ≥3:1. Chili red is reserved for primary action + true risk; it is never the *only* signal of risk (icon + label always accompany). Amber/lime status carry text labels.

## 2. Brand accents

Each brand gets one accent used sparingly (rail edge, brand tag, Brand Universe panel), never recoloring product imagery:
- Buldak → chili red `--chili-600`
- Samyang → heritage deep amber `#8a5a2b`
- Tangle → protein green `#4c7a52`
- MEP → clam blue-grey `#4a6b7a`

## 3. Typography

Editorial display for headlines; clean operational sans for UI/dashboards — two families, deliberate.

```css
--font-display:"Fraunces","Georgia",serif;   /* editorial, appetizing headlines */
--font-ui:"Inter","system-ui",sans-serif;    /* operational clarity */
--step--1:.833rem; --step-0:1rem; --step-1:1.2rem; --step-2:1.44rem;
--step-3:1.728rem; --step-4:2.07rem; --step-5:2.49rem; --step-6:3.58rem;
```

Rules: display for H1/H2 and pull quotes; UI sans for body, controls, tables, dossier facts, dashboards. Dashboard text never smaller than `--step--1` (no tiny dashboard text). Line length capped ~66ch for reading blocks.

## 4. Grid & spacing

8px base scale (`--space-1:4px … --space-8:64px`). 12-column fluid grid on desktop; content max-width ~1200px, reading blocks ~720px. Chapters alternate full-bleed immersive (dark) and contained calm (light). No more than two dense card grids share a viewport.

## 5. Cards, radii, borders, shadows

```css
--radius-sm:8px; --radius-md:14px; --radius-lg:22px;
--shadow-1:0 1px 2px #0000000f, 0 2px 8px #0000000a;
--shadow-2:0 8px 30px #0000001a;
--border-1:1px solid var(--line);
```

Crisp cards, generous internal padding, thoughtful spacing. Product packaging is a **focal point** (large, staged on a soft radial or paper ground), never wallpaper/tiled behind text.

## 6. Image treatment & product staging

Product PNGs sit on a soft, slightly warm radial ground with a grounded shadow; consistent sizing per format archetype (noodle multi-pack, bowl, cup, bag, bottle, stick, frozen box). Hero product gets a spotlight ground; grid thumbs get a flat paper tile. Missing image → labeled silhouette by format archetype (never a broken image). See `16-PERFORMANCE-AND-ASSET-PLAN.md` for formats/sizes.

## 7. Data visualization

Bars, tabs, scatter, timelines share the token palette. Score bars: neutral track + accent fill + text value. Confidence: labeled badge (High/Med/Low) with a small filled-dots glyph, never color-only. Source type: a 4-color dot keyed to a legend + text label. Charts always have a table/list equivalent.

## 8. Severity & status states

`ok / warn / risk / info` each render as **dot + label + optional icon**, using the status tokens. Risk is red + a warning glyph + the word. Serious-escalation notices use a distinct calm, high-contrast panel (info-blue border, no red alarm styling) — serious content stays calm and clear, never joky, never alarmist.

## 9. Motion

```css
--ease-out:cubic-bezier(.2,.7,.2,1); --dur-1:120ms; --dur-2:220ms; --dur-3:360ms;
@media (prefers-reduced-motion: reduce){ *{--dur-1:0ms;--dur-2:0ms;--dur-3:0ms;} }
```

Motion communicates selection, relationship, state change, progression, confirmation, risk, completion — never idle floating, spinning, tilt, or fire effects. Transitions use transform/opacity only. Everything works, and reads, with motion off.

## 10. Restraint rules (enforced in QA)

One dominant interaction per chapter · alternate immersive/calm · gradients sparingly (soft grounds only, no rainbow SaaS gradients) · minimal glassmorphism · no cartoon flames · one sticky zone shared by chapter-nav + rail (no competing sticky elements; never overlap the future main nav) · strong contrast preserved · red never the sole risk indicator · serious content calm.

## 11. Light/dark surface usage

- **Dark (ink):** hero, Command preview, Brand Universe — immersive, product pops.
- **Light (paper):** Portfolio, Rankings, Compare, Dossier, Methodology, FAQ — reading + operational legibility.
Both fully themed via tokens; both meet contrast AA.
