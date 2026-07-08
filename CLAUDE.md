# CLAUDE.md — FireFlow (auto-loaded context)

You are continuing **FireFlow Product Intelligence**, an independent, interactive
Customer Experience portfolio by **Nathan J. Song**, built to support an
application for **Manager, Customer Experience at Samyang America**. It is a
portfolio artifact, not a real product. All operational data is synthetic and labeled.

**Before doing anything substantial, read `HANDOFF.md` (state + architecture) and
`CHANGELOG.md` (history). For copy or employer-layer work, read the packs in
`docs/nathan-writing-style-fireflow/` and `docs/employer-layer-pack/`.**

## Canonical
- The **React + Vite + TypeScript app in `src/` is the product.** Entry: `index.html`
  → `src/main.tsx` → `src/pages/HomePage.tsx`.
- `preview.html` + `preview-data.js` are a **legacy** single-file demo, out of sync
  with the React app. Do not treat them as canonical.
- Do not rebuild from scratch. Preserve working features and the "Buldak Night" dark visual system.

## Build / deploy
- Type gate: `tsc -b` (`node_modules/.bin/tsc -b`) — runs anywhere, must stay green.
- `npm run build` (`tsc -b && vite build`) and `npm run verify:data` need a
  platform-matched `node_modules` (they fail in a Linux sandbox if it was installed
  on macOS). Run `npm install` first on a fresh machine.
- Deploy: `npx vercel --prod` from the folder (builds on Vercel; when prompted, do
  NOT connect git — it would deploy stale committed code). Live: https://samyang-xi.vercel.app

## Non-negotiable rules
- **Honesty:** no SAP implementation/integration/tenure claims; no "8 years of SAP";
  no real Samyang data, customers, orders, or metrics; keep synthetic data labeled.
  SAP section is "Order-to-Cash Process Intelligence · SAP SD aligned workflow study."
- **Writing style** (see the nathan-writing-style pack): no arrows in visible copy
  (→, ->, ↗); no em dashes as sentence separators (a lone `—` as a "no value" table
  cell is fine); no underlined links (use color/weight); plain American English; CTAs
  name the action. Grep-sweep after copy edits.
- **Accessibility:** Nathan is colorblind — never signal state by color alone (add
  glyph/word/shape). Keyboard operable; respect `prefers-reduced-motion`; visible focus.
- **Fourth wall:** break it only at the intro and in optional Operator Notes (≤6,
  gated on `operatorNotesEnabled`); no popups on every section; product usable with notes off.
- Don't nest `<Button>` in `<a>` — use the `ButtonLink` primitive. Comparison is
  head-to-head: `MAX_COMPARE = 2`.

## Working style
Nathan works iteratively and values visual quality, UX, honest claims, and
implementation readiness. State a decision, why it fits the role, the tradeoff, then
build. Keep `README.md`, `PROJECT_STATE.md`, `CHANGELOG.md`, `DECISIONS.md`,
`KNOWN_LIMITATIONS.md`, `CASE_STUDY.md`, and `HANDOFF.md` current as the project evolves.
