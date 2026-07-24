# FireFlow — Master Build Plan (Recommendations 01–06)

Owner: Nathan J. Song. Purpose: take the six researched recommendations and weave them
into the existing FireFlow React app so the Account Support Intake and the surrounding
chapters showcase, concretely, the knowledge the Manager, Customer Experience role at
Samyang America is scanning for: service-level governance, SAP SD / order-to-cash
literacy, EDI / SPS Commerce awareness, deduction management, cross-functional handoff,
and brand fluency. Everything stays synthetic and labeled per `CLAUDE.md`.

Read the six specs alongside this plan:
- `01-service-level-targets.md`
- `02-sap-sd-object-mapping.md`
- `03-edi-sps-commerce.md`
- `04-deduction-dispute-depth.md`
- `05-korean-colors-glossary.md`
- `06-operator-notes-fourth-wall.md`

## The through-line (what a recruiter should conclude)
"He treats customer experience as an operating system. A case comes in, and he already
knows its owner, the SAP SD object it touches, the EDI document behind it, the service
metric and target it puts at risk, the deduction exposure if it slips, and the upstream
fix so it stops recurring. And he understands the brand and culture he'd be serving."

## Build order (dependency-aware)
Each wave is shippable on its own and keeps `tsc -b` green.

### Wave A — Foundations (unlocks everything else)
1. **Glossary primitive (Rec 05, first half).** Build `GlossaryTerm` + `glossary.ts`
   with empty-ish dictionaries wired. This is a dependency for 01/02/03. No visible risk.
2. **Service-level targets (Rec 01).** Add `ackTarget`/`resolveTarget` to the priority
   ladder; render on summary + confirmation. Add the `kpi` dictionary entries. Highest
   value-to-effort ratio, and immediately visible.

### Wave B — Operational depth (the resume keywords)
3. **SAP SD object mapping (Rec 02).** Add `sapObject` + `o2cLink` per category; summary
   row + `#o2c` jump link; `sap` glossary dictionary. Deepen the `#o2c` chapter with the
   document-flow + case-type table.
4. **EDI / SPS Commerce (Rec 03).** Add `orderChannel` + optional `ediRef`; channel pill
   + summary line; `edi` glossary dictionary. Optional "how a retail order arrives" strip
   in `#o2c`.
5. **Deduction dispute depth (Rec 04).** Extend the deduction case with `deductionType`,
   validity + window panel, and the backup checklist. Cross-link to 02 (delivery object)
   and 03 (ASN/compliance).

### Wave C — Voice + brand (the human layer)
6. **Fourth-wall operator notes (Rec 06).** Refactor the note into a `NoteTeaser`
   (in-drawer, collapsible, default-collapsed on Details) + `OperatorNotePanel`
   (left-side, outside the drawer). Feed it the richer content from Waves A/B (SLA line,
   SAP object, deduction root cause).
7. **Obangsaek layer (Rec 05, second half).** Fill the `obangsaek` dictionary; add the
   optional "Five colors" strip in `#brands`/`#methodology`; map the palette as a
   designer's note.

Rationale: Waves A/B make the note *worth* expanding (more real content), so the Wave C
panel lands with substance instead of just scenario copy.

## Where each recommendation touches the code
| Rec | Model enhancement | New page/section | Glossary | New component |
|---|---|---|---|---|
| 01 SLA | `intake.ts` priority targets; summary/confirmation rows | (optional) Command Center headers | `kpi` | — |
| 02 SAP SD | `intake.ts` `sapObject`, `o2cLink`; summary row | expand `#o2c` | `sap` | — |
| 03 EDI | `intake.ts` `orderChannel`, `ediRef`; pill + row | (optional) `#o2c` strip | `edi` | — |
| 04 Deduction | deduction case sub-flow in SupportBar | (optional) lifecycle strip | reuse kpi | validity/backup panel (local) |
| 05 Glossary/obangsaek | wrap terms site-wide | (optional) five-colors strip | `sap`/`edi`/`kpi`/`obangsaek` | `GlossaryTerm` |
| 06 Notes | refactor note builder | — | — | `NoteTeaser`, `OperatorNotePanel` |

Primary files in play: `src/components/home/SupportBar/intake.ts`,
`src/components/home/SupportBar/SupportBar.tsx` (+ module CSS),
`src/components/home/SapProcessIntelligence/*` (the `#o2c` chapter),
`src/components/employer/OperatorNote/*`, `src/components/employer/StoryFloater/*`,
new `src/components/primitives/GlossaryTerm.*`, new `src/data/glossary.ts`,
`src/styles/tokens.css` (operator tokens already exist).

## Data model deltas (single source of truth: `intake.ts`)
Extend `CategoryDef` (all optional so nothing breaks mid-migration):
- `sapObject?: { label: string; tcode?: string }` (Rec 02)
- `o2cLink?: boolean` (Rec 02)
- `orderChannel?: "edi" | "portal" | "manual"` and `ediRef?: string` (Rec 03)
- `deductionType`-related config lives on the deduction category or a small sub-map (Rec 04)
Extend the priority ladder with `ackTarget` / `resolveTarget` (Rec 01).
The note builder reads `scenario`/`rootCause`/`handling` (exist) plus the new
`sapObject`, SLA target, and deduction root cause for the Wave C panel.

## Honesty guardrails (apply to every wave)
- "SAP SD aligned workflow study"; never claim a live system, integration, or tenure.
- All accounts, orders, PO/ASN/invoice/deduction numbers, prices, windows, and metrics
  stay synthetic and labeled. Retailer examples (Walmart OTIF, dispute windows) are
  industry illustrations, not Samyang data.
- Obangsaek is accurate and respectful; palette mapping is a personal design reading.
- Writing style: no arrows in visible copy, no em-dash sentence separators, no underlined
  links, plain American English, CTAs name the action. Grep-sweep after each wave.
- Accessibility: colorblind-safe (glyph/word/shape, never color alone), keyboard
  operable, visible focus, respects `prefers-reduced-motion`.

## Verification per wave (definition of done)
1. `node_modules/.bin/tsc -b` exits 0.
2. Style sweep: no `→ ↗ ->`, no prose `—` separators, no `text-decoration: underline`
   on links in changed files.
3. Colorblind + keyboard pass on any new interactive control.
4. No horizontal overflow at 1440 / 1280 / 1024 / mobile.
5. Update `CHANGELOG.md`, and `HANDOFF.md` if architecture changed.
6. Redeploy note: `npx vercel --prod` from the folder (do not connect git).

## Suggested first PR
Wave A (glossary primitive + service-level targets). It is low-risk, immediately
visible, unblocks 02/03, and lands the "puts a clock on every case" governance signal
that the JD leads with.
