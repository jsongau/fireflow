# CLAUDE.md — FireFlow (auto-loaded context)

You are continuing **FireFlow Product Intelligence**, an independent, interactive
Customer Experience portfolio by **Nathan J. Song**, built to support an
application for **Manager, Customer Experience at Samyang America**. It is a
portfolio artifact, not a real product. All operational data is synthetic and labeled.

**Before doing anything substantial, read `HANDOFF.md` (state + architecture) and
`CHANGELOG.md` (history). For copy or employer-layer work, read the packs in
`docs/nathan-writing-style-fireflow/` and `docs/employer-layer-pack/`.**

**Before writing or editing any Nathan's Note / Operator Note, read
`skills/nathans-notes-voice/SKILL.md`.** It is the canonical note voice: the four
gates (the customer's cost, the operational cause, the owner and next action,
Nathan's judgment) plus the concierge standard. `skills/nathans-notes-voice.skill`
is the installable copy.

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
- Deploy — HARD RULE (2026-07-09, see `skills/deploy-from-project/SKILL.md`): every
  deploy runs from the project root, never from `~` or any parent. Always the chained
  form `cd ~/Claude/Projects/Samyang && npx vercel --prod`, and verify
  `.vercel/project.json` names `samyang` first. If the CLI asks about deploying the
  home directory the answer is always N; when prompted, do NOT connect git — it would
  deploy stale committed code. This applies to instructions handed to Nathan too:
  never give a bare deploy command without the `cd`. Live: https://samyang-xi.vercel.app

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
- **Fourth wall:** break it only at the intro and in Operator Notes. Operator Notes are
  **always on** — no `operatorNotesEnabled` flag, no nav toggle, one intro entrance.
  Notes read as builder commentary, never as product UI or a real Samyang annotation.
- **Operator Notes, guided-tour rule (2026-07-09):** there is **no cap** on the number of
  notes. Every section may carry **exactly one** note. Notes are **collapsed to a one-line
  teaser by default** (`NoteTeaser`) and expand on demand into the docked panel
  (`OperatorNotePanel`). Nothing auto-expands except the intro cover. One note per
  section, one panel open at a time. The old ≤6 cap existed to stop notes becoming
  wallpaper; collapse-by-default achieves the same end while allowing a note everywhere.
  The cap is now gone from `skills/nathans-notes-voice/` and the writing-style packs as
  well, so no agent inherits a contradiction. The surviving test is **per note**: it
  explains a decision visible on screen, or it does not ship. A note that only narrates
  what the section already shows is still clutter, and deleting it is still right.
  **Before writing any note, read `docs/nathan-writing-style-fireflow/03-OPERATOR-NOTES-VOICE.md`
  and `08-BANNED-AI-PATTERNS.md`.** No epigrams, no "not X, but Y" reversals, no
  punchline endings. Judgment shows through operating detail, not phrasing.
- Don't nest `<Button>` in `<a>` — use the `ButtonLink` primitive. Comparison is
  head-to-head: `MAX_COMPARE = 2`.

## Working style
Nathan works iteratively and values visual quality, UX, honest claims, and
implementation readiness. State a decision, why it fits the role, the tradeoff, then
build. Keep `README.md`, `PROJECT_STATE.md`, `CHANGELOG.md`, `DECISIONS.md`,
`KNOWN_LIMITATIONS.md`, `CASE_STUDY.md`, and `HANDOFF.md` current as the project evolves.
