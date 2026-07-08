# FireFlow — Handoff / Continuation Brief

Read this first, then `CHANGELOG.md` (detailed history), then the two doc packs in
`docs/` when you touch copy or the employer layer.

## What this is
FireFlow Product Intelligence — an independent, interactive Customer Experience
operating model built by **Nathan J. Song** to support an application for
**Manager, Customer Experience at Samyang America**. It is a portfolio artifact,
not a real product. Everything operational is synthetic and labeled.

## Canonical implementation (important)
The **React + Vite + TypeScript app under `src/` is the real product.** Entry:
`index.html` → `src/main.tsx` → `src/app/App.tsx` → `src/pages/HomePage.tsx`.
`preview.html` + `preview-data.js` are a **legacy** single-file demo and are
NOT in sync with the React app — do not treat them as canonical, and don't spend
effort maintaining them unless explicitly asked.

## Live URL + deploy
- Live: **https://samyang-xi.vercel.app** (Vercel, CoverCapy Hobby account, project `samyang`).
- Deploy method: from the project folder run `npx vercel --prod`. It uploads the
  working directory and builds on Vercel's Linux servers. When prompted, do NOT
  connect the git repo (it would deploy stale committed code instead of the
  working tree). Re-run the same command to publish updates.
- The old `fireflow-capy-j.vercel.app` (CapyJ Pro-trial) is a stale earlier deploy — ignore it.

## Build / verify
- `tsc -b` (type-check) runs anywhere and currently **passes clean**. Use it as your gate.
- `npm run build` (= `tsc -b && vite build`) and `npm run verify:data` need a
  `node_modules` matching the machine's platform. They build fine on the user's
  Mac and on Vercel, but FAIL in a Linux sandbox if `node_modules` was installed
  on macOS (rollup/esbuild native binary mismatch). On a fresh machine: `npm install` first.
- `verify:data` was fixed by adding `baseUrl`+`paths` to the root `tsconfig.json`
  so `tsx` resolves the `@/` alias.

## Architecture quick map
- State: `src/state/homeStore.tsx` — context+reducer. Notable fields:
  `selectedFamilyId/selectedVariantId/selectedBrand`, `userMode` (explore|consumer|vendor),
  `compareIds` (**MAX_COMPARE = 2**, head-to-head), `operatorNotesEnabled`, `introDismissed`.
  Persists non-sensitive prefs to `localStorage`; URL-syncs selection. `RESET` preserves
  the notes preference and intro-seen flag.
- Data: `src/data/*` — `families` (45), `variants` (76), `brands`, `categories`,
  `rankings` (8 views), `issues`, `scenarios`, `sources`, `spiciness`, `images`,
  and `sapsd.ts` (SAP SD glossary + order-to-cash flow + exceptions + disclosure).
- Home chapters: `src/components/home/*` — ProductSignalHero, PortfolioPulse,
  RankingsLab, ComparisonLab, ProductDossier, InquiryPaths, ResolutionSimulator,
  **SapProcessIntelligence** (#o2c), CommandCenter, ProductSignals, BrandUniverse,
  Methodology, HomepageFAQ, SupportBar (floating), SelectedProductRail (sticky top,
  compact on mobile), **CompareRail** (collapsible left tray, ≥900px), **InquiryDialog**,
  **SoundToggle**.
- Employer layer: `src/components/employer/*` — EmployerIntro (Enter FireFlow /
  Explore with Nathan cover), OperatorNote + OperatorNotesToggle (the "Nathan's read"
  system, gated on `operatorNotesEnabled`), EmployerEvidence (#fit role→feature map),
  EmployerClose (#why). Config: `src/config/employer.ts` (résumé/contact actions are
  hidden until filled in — never ship a dead button).
- Primitives: `src/components/primitives/*` — Button, **ButtonLink** (use this for a
  button-styled anchor; never nest `<Button>` inside `<a>`), Segmented, badges,
  PepperScale, ProductStage.
- Sound: `src/lib/sound/sound.ts` — Web Audio, off by default, gesture-gated, safe no-op.
- Sticky offsets: tokens `--nav-h`/`--rail-h`/`--sticky-h` in `src/styles/tokens.css`;
  sections use `scroll-margin-top: var(--sticky-h)` so anchors clear the sticky headers.

## Hard rules (do not break)
- **Honesty:** no SAP implementation/integration/tenure claims; no "8 years of SAP";
  no real Samyang data, customers, orders, or metrics; all ops data synthetic + labeled.
  SAP section is "Order-to-Cash Process Intelligence · SAP SD aligned workflow study."
- **Writing style** (see `docs/nathan-writing-style-fireflow/`): no arrows in visible
  copy (no →, ->, ↗); no em dashes as sentence separators (a lone `—` as a "no value"
  table cell is fine); no underlined links (color/weight only); plain American English;
  CTAs name the action. Run a grep sweep after copy edits.
- **Accessibility:** Nathan is colorblind — never signal state by color alone (add
  glyph/word/shape). Keyboard operable; respect `prefers-reduced-motion`; visible focus.
- **Fourth wall:** break it at the threshold (intro) and in optional Operator Notes only;
  keep ≤6 notes; never popups on every section; product stays usable with notes off.

## Reference packs in the repo
- `docs/nathan-writing-style-fireflow/` — Nathan's voice + banned patterns.
- `docs/employer-layer-pack/` — the employer-layer brief, approved copy bank, SAP
  guardrails, role→feature map, fourth-wall rules, and a QA acceptance checklist (file 10).

## Verified vs not (as of this handoff)
- Verified: `tsc -b` exit 0; all in-page anchors resolve; no nested anchor/button;
  no dead `#vendor` routes; style scans clean; data references resolve.
- NOT verified here (needs a real desktop browser + a redeploy): runtime console
  errors, exact responsive behavior at 1440/1366/1280/1024, screen-reader pass, and
  the mega-nav submenu-on-hover (the sandbox browser only renders the mobile drawer).

## Open threads / good next steps
- Redeploy and confirm on real desktop: submenu-on-hover, card→dossier scroll, the
  left CompareRail opening when 2 products are compared.
- Full responsive + a11y QA at the four widths above; check for horizontal overflow.
- Optionally sync `preview.html` to the React app, or delete it and rely on the deploy.
- More `playSound` trigger points if desired (engine + toggle already exist).
- Work through the employer-pack QA checklist (`docs/employer-layer-pack/10-*`) on the live site.

## How to continue in a new session
Point the new Claude at this folder and say: "Read HANDOFF.md and CHANGELOG.md,
then continue." Keep the React app in `src/` canonical; don't rebuild from scratch;
preserve the Buldak Night visual system and the honesty guardrails.
