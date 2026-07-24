# CHANGELOG — FireFlow Product Intelligence
- 2026-07-24 - Ops-first nav + menu trim; 99 Ranch shimmer border + linked-title and Click-me dossier CTA; floating Nathan's Notes companion (scroll-tracked, 12-stop tour); operator-voice rewrite and demo/synthetic language removed site-wide.

## 2026-07-10 — Studies band on the landing page + "Order-to-Cash" nav label

- **Why:** the five deepest screens (order queue, customer master, integration
  map, dimensional model, command center) all lived one page down behind the
  "CX Intelligence" label, and a skimming reviewer never opens a mega nav. The
  90-second audit flagged this as the top findability gap: the depth existed
  but a rushed reader never reached it.
- **StudiesBand** (`src/components/home/StudiesBand/`): new final home section
  (`#studies`, after OpsTeaser) with five cards linking straight to the
  /intelligence sections. Cards read label, kicker, sub, and CTA from the
  route/section table in `src/data/nav.ts` (same source as MegaNav and footer),
  so band copy and menu copy cannot drift. Quiet by design: border/lift hover
  only, visible focus, reduced-motion safe, no arrows, action line is color
  plus weight.
- **Rename:** the MegaNav group, footer column, and route label for
  /intelligence changed from "CX Intelligence" / "Intelligence" to
  "Order-to-Cash" — the term the job description uses and the word a hiring
  manager scans for. URL unchanged (/intelligence), so no links break.
  Tradeoff accepted: the label under-describes War Room and Product Signals;
  the dropdown items carry that breadth.
- **Nathan's Note added** (`studies` in sectionNotes.ts): why the studies are
  named on the landing page (a menu label is a door most reviewers never open)
  and the one-source-table decision.
- Home `sections` in nav.ts gained `{ id: "studies", label: "Studies" }` so
  SubNav and the MiniNav progress rail track it. `tsc -b` green; arrow and
  em-dash sweeps clean.

## 2026-07-10 — "Follow the order": the six-stop guided path through the order story

- **Why:** the strongest story on the site spans five modules across three
  routes, and a visitor giving it three minutes will not assemble that route
  alone. The tour converts existing depth into a sequence; it adds no new
  capability and no new section.
- **The six stops:** Comparison Lab (the item master), the #o2c Order Queue
  (the featured 99 Ranch order), the three line decisions, the short-shipment
  deduction with its reconcile table, the resolution with root cause and
  corrective action, and the /ops board where FF-2231 lands as a governed case.
  The final stop links to /about#fit.
- **Mechanics:** `src/lib/tour/orderTour.ts` (stop definitions, sessionStorage
  step persistence, milestone event) + `src/components/tour/OrderTour.tsx`
  (docked bottom bar plus the home-page entry strip, mounted in App and
  HomePage). Arriving at a stop can preset the comparison, route the deduction
  case, or ask #o2c to advance the lifecycle reducer to a named milestone via
  the `fireflow:o2c-tour` window event; the reducer's gates make replays
  no-ops. Stop 3 invites the visitor to work the decisions themselves; Next
  works them the way Nathan would (current account price, 120 committed + 40
  backordered) so a passive visitor still sees the whole story.
- **Accessibility:** the bar is a labeled region, not a modal; the page stays
  usable. Step changes announce via aria-live, Escape exits, scrolls honor
  reduced motion, targets carry scroll-margin-top, state is words and glyphs.
- **Nathan's Note added** on the entry strip (`order-tour` in sectionNotes.ts):
  why a route exists (a reviewer's minutes are the budget), the Next-does-real-
  work decision, and the refusal to make the tour a modal. The `o2c` note's
  hook also corrected from seven to eight orders now that the featured
  lifecycle order sits in the queue.

## 2026-07-10 — Resolution instruments: credit memo vs courtesy discount (owner's policy, three placements)

- New Nathan judgment recorded (owner, 2026-07-09): a validated claim resolves
  as a credit memo, because the money is owed. A claim the evidence cannot
  settle either way resolves as a complimentary discount on the account's next
  order. Same savings for the account; the wording is deliberate, because a
  credit concedes the claim and a courtesy discount takes care of the
  relationship without conceding facts nobody established. The account is
  always told which one they received.
- Placements, each phrased for its context: the #o2c deduction stage
  `nathanNote` (sapsd.ts), a "Nathan's read on this deduction" aside in the
  Retailer Order Lifecycle deduction panel (where the FF-2231 claim IS
  verified, so it contrasts the two instruments), and one sentence in the
  deduction/chargeback exception's Resolution row. Voice pack and banned-
  pattern rules applied; the stage note's old "where CX and the P&L meet"
  opener was also rewritten off the banned "where X meets Y" pattern.

## 2026-07-10 — Integration Map: sticky reading pane, full-bleed band; gutter rails off on /intelligence

- **Problem (owner report, with screenshot):** in #integration, the flow list is
  taller than the viewport, so clicking a flow updated a detail card below the
  fold and nothing visibly changed.
- **Fix:** the flows block is now a full-bleed two-pane band (inset by
  `--nav-pad`, like the MegaNav): the flow list scrolls on the left, and the
  selected flow's reading pane is sticky on the right, so every click visibly
  swaps the detail beside the list. Deliberately the flip of the Dimensional
  Model study (sticky-left narrow picker there, sticky-right wide reading pane
  here) so the two studies do not feel identical. The selected row carries a
  visible "Reading" word, not just a ring. Below 980px the band stacks and the
  pane goes static.
- **Both gutter trays (CompareRail, MiniNav) no longer render on /intelligence**
  (`showGutterRails` in `App.tsx`): the band needs the gutters and SubNav covers
  section navigation on that page. All other routes keep both rails.
- HANDOFF's "MegaNav is the one full-bleed band" rule amended to record this
  owner-approved exception.

## 2026-07-10 — Retailer Order Lifecycle: one 99 Ranch order worked 850 to deduction inside #o2c

- **New featured order in the #o2c Order Queue** (`ranch99-lifecycle`, 99 Ranch
  Market, PO 4500382711, three Buldak multipack lines). Its queue row is derived
  live from a lifecycle reducer, so its stage, exception, and exposure move down
  the existing spine as the order is worked. The other seven queue orders are
  untouched. No new section, no new dashboard, no nav change.
- **Single source of truth: `src/data/ediLifecycle.ts`.** One reducer state
  machine owns the whole study: line decisions (cross-reference approval, pricing
  exception with two decided outcomes, allocation with backorder), document
  generation gates, deduction, resolution, audit record, and Reset. All
  quantities, prices, and documents derive from one set of constants, so the
  numbers can never disagree across panels. Labeled synthetic throughout; no
  UPCs invented; simplified X12 with a disclosure saying so.
- **Document trail + split-pane X12 viewer** (`OrderLifecycle.tsx`): 850, 997,
  855, 856, 810, 820 as trail chips with word+glyph status. Translated business
  view is the default; raw X12 sits beside it with two-way click-to-highlight
  and per-segment plain-language explanations (on selection or via an Explain
  toggle, never hover-only). The 997 carries the distinction that matters:
  technical receipt is not business acceptance; the 855 is the business answer.
- **Governance is visible:** structural vs business validation as two panels;
  "Advance the order" steps are disabled with the blocking reason in text (the
  855 cannot send until the three line decisions are made; the invoice bills
  shipped, not ordered, quantities). Controlled transitions only; no free drag.
- **Deduction with a separate root cause:** the 855 correctly acknowledged 120
  Carbonara cases plus 40 backordered, the 856 reported 120 shipped, receiving
  counted 116, so the 820 pays $91.60 short under reason code 22. A reconcile
  table walks the count across every checkpoint. The deduction routes into the
  existing case engine as FF-2231 (shortage type, deep link to /ops) and closes
  with root cause, corrective action, owner, verification, and SOP impact, not
  just a credit.
- **Cross-module wiring:** ComparisonLab gains one per-column "Trace in retailer
  order" link (only on the three families in the PO) that opens #o2c with the
  featured order selected via a sessionStorage handoff (`O2C_OPEN_ORDER_KEY`).
  Integration Architecture's `po-in` flow now names the 997 handshake.
- Known limitation: the lifecycle state is deliberately not persisted; leaving
  the page restarts the study (Reset semantics), while a routed FF-2231 persists
  like any other case and is replaced if routed again.

## 2026-07-10 — The dot pills are gone; Nathan's Notes carry the synthetic disclosure

- **SyntheticBadge removed site-wide** (17 placements across 11 components and
  the account page, plus the ops board's "Synthetic data" chip). Every section
  that carried the pill carries a Nathan's Note that says what the section is
  and why its data is synthetic, and every page keeps at least one plain-text
  disclosure (hero disclaimer, section ledes, KPI note, dialog footer, page
  footer), so the honesty guardrail did not move; the glowing dot did. The
  component was deleted from primitives with a comment saying not to bring it
  back.
- **All other dot ornaments retired with it:** the SourceBadge color dot (the
  label already names the source), the Methodology legend dots, the brand
  filter accent dots in the catalog, the Sound toggle's ●/○ (the label says
  On/Off and aria-pressed carries state), and the support launcher's gold dot.
  Semantic glyphs stay: risk chips (○ ◆ ▲ plus a word), trace states, and rail
  markers are state indicators, not decoration, and removing them would break
  the never-color-alone rule.
- Orphaned CSS rules for every removed dot deleted; class parity re-verified.
- **Concurrent-session note.** While this sweep ran, another session added the
  Data Architecture studies to /intelligence (DataModelStudio,
  IntegrationArchitecture, dataArch.ts). Their `data-model` and `integration`
  entries in sectionNotes.ts were overwritten by this session's copy of the
  file; both notes were rewritten and restored here, and the badges in both
  new components were converted to the same no-pill pattern. If that session
  wrote a CHANGELOG entry for the studies, it was lost to the same overwrite;
  the components themselves are intact.

## 2026-07-10 — Every Synthetic label now has a note that says why; six more dropped notes restored

- **The hiring manager summary became a short Nathan's Note** (`acct-summary`),
  same fourth-wall format as every note on the site. The four paragraphs are
  gone; the long form stays behind the "Copy manager summary" button. The
  cross-check links and actions remain in the section.
- **Six more note keys were referenced but missing** (same clobbering that hit
  the acct-* notes in the 07-09 rewrite): `customer-master`, `o2c`,
  `ops-board`, `ops-featured`, `ops-teaser`, `standing-order`. All six teasers
  rendered nothing. Rewritten and restored, each leading with why that section
  is synthetic: the reasoning is the credential (a real customer master or
  queue would be a confidentiality breach; invented data makes the mechanics
  inspectable).
- **Two sections carried a Synthetic label with no note; both got one.**
  `sop-register` on /leadership (one taxonomy or the register lies; targets
  are placeholders to be set against real dispute windows) and `ops-patterns`
  on the ops board's Pattern watch (the third case is not a case).
- Verified: note-key parity is exact both directions (every `SectionNote`
  sectionId defined, every defined note placed); `tsc -b --force` exit 0 on
  the device tree; style sweep clean.

## 2026-07-10 — Account dossier rebuilt: order records open, cases get worked, the lifecycle traces a live PO

The /accounts/99-ranch-market page was hard to navigate and read as a lecture.
Rebuilt around one idea: this is a vendor profile a CX team works, not a course.

- **Purchase orders moved up to position 2**, right under the snapshot. The
  order book is the account; it no longer sits below four sections of prose.
- **Every PO row opens an order record dialog.** The row is the summary; the
  dialog is the argument: quantities, the derived price basis, goods receipts,
  the required action, the SAP objects to read, and a new **fulfillment and
  freight trail** per line: who fulfilled it, the outbound carrier, and where
  the stock came from (synthetic vessel, container and size, forwarder, port of
  discharge and arrival, dated events, and what went wrong in transit).
  PO 4500119842 deliberately prints a **freight trail gap**: the order moved
  collect on the buyer's own routing program, so the forwarder and POD are not
  in our documents, and the honest record prints the hole instead of a guess.
  Dialog is portaled, focus-trapped, Escape closes, focus returns to the row,
  and the open/close is a 220ms fade-and-rise that zeroes out under
  prefers-reduced-motion.
- **The table now fits.** Columns cut from 13 to 10; PO numbers shortened to
  their last four digits (full number on the record and in the button title);
  "Contract price pending validation" prints as "Pending" in the cell; unit
  suffixes moved into the headers; statuses became short words. min-width
  dropped 940px to 640px, so nothing widens the page sideways.
- **The 12-step lifecycle became the "Open order trace".** Same twelve steps,
  traced on the live PO 482207: each step shows clear / exception / pending
  (word plus glyph), one line of what actually happened, and the generic
  failure mode on hover via GlossaryTerm. The lecture is gone; the teaching
  now rides the one order that is on the page.
- **Account cases became a worked board.** Active (3) and Resolved (3) views,
  each case carrying a named assignee with an avatar chip (the same synthetic
  roster as /leadership, so a name here has a workload there), opened and
  resolved dates, an outcome ("How it closed"), and a **case activity timeline**
  of who did what and when. Three resolved cases added: the 2022 allocation
  short that closed as a credit, the year-end receipt split AP question, and a
  997-caught ASN rejection fixed ahead of the truck.
- **Account contacts at the top.** The buyer of record (synthetic purchasing
  agent at the Tawa buying office, on a reserved example domain and a 555
  number, mailto and tel links that behave) and our named account owner.
- **Company notes became Profile notes**: six one-line CRM-style facts with
  updated dates. Trajectory hypotheses cut to one line each. The reasoning
  moved where it belongs, into Nathan's Notes.
- **The page's Nathan's Notes were missing entirely.** The 2026-07-09 notes
  rewrite dropped every acct-* key from sectionNotes.ts, so the five teasers
  the page referenced rendered nothing. Restored and expanded to eight notes:
  acct-po-table (new), acct-buyers-chair, acct-fill-rate, acct-dormant,
  acct-chain, acct-erp (new), acct-kpis (new), acct-documentation. The two new
  JD-facing notes carry the honest SAP claim: oversight of process compliance
  and data integrity as discipline around the system, never configuration.
  The note index at the foot of the page now derives its titles from
  SECTION_NOTES so it cannot drift again.
- Sticky section rail narrowed 180px to 150px; the width went back to the table.
- Honesty check against D-010/D-011/D-012: the sourcing question stays a
  question ("Sourcing watch: unconfirmed, flagged for Sales to ask"); the
  freight identifiers are invented and disclaimed in the page footer, the
  dialog footer, and the data file header.

## 2026-07-09 — Land on the flagship; the pinned rail stops covering the filters

- **The page now opens on Buldak 2X Spicy (Multi).** `initState` in
  `homeStore.tsx` applies `DEFAULT_FAMILY_ID` when neither the URL nor storage
  carries a selection, so a first visit lands with a worked example on screen
  instead of an empty hero. A shared link or a returning visitor's stored
  product still wins; the URL sync writes `?product=buldak-2x-spicy&format=multi`
  on load, so the address bar and the screen agree.
- **A pinned MiniNav is layout, not an overlay.** Pinned open, the 232px panel
  reached far enough into the content column to sit on the catalog toolbar's
  Filters button. Two changes: the expanded panel narrowed to 188px (derived
  from the widest section label at --step--1 plus the marker column), and the
  pin now publishes `data-mininav-pinned` on the root element, where tokens.css
  raises `--gutter-reserve` to 212px so `--shell-max` shrinks and the content
  column moves clear. Hover expansion still overlays and reserves nothing,
  because it is transient. Unpinned, nothing changed: the 60px spine and the
  84px reserve stand.
- **The catalog count reads as a stat pair.** "45 products · 76 formats" ran as
  one muted sentence. It is now two stats, the number at --step-1 weight 800
  with a small uppercase unit label and a hairline rule between them, and when
  a filter is active the first stat becomes "12 of 45 products", so the readout
  says what you are seeing and what you are not. Same markup serves the phone
  summary row and the desktop bar; aria-live announces changes either way.
- **The product quick view fits the viewport with no inner scroll.** The dialog
  is a flex column capped at 100dvh minus the overlay padding; the photo band
  flexes between 96px and 315px and gives its height back first, so the name,
  heat, actions, and the full-profile link stay on screen at one glance. Under
  760px of viewport height the body tightens its padding and type one step.
  Body overflow stays as a last resort for short landscape phones.
- Mobile pass on the Explore route: verified the existing breakpoints (drawer
  nav at 860, compact product rail at 640, collapsed catalog toolbar at 720,
  grid steps at 1100/760/480) against the new toolbar readout and modal.
- Verified: `tsc -b --force` exit 0 on the working tree. Copy sweep: no arrows,
  no em-dash separators in new visible copy.

## 2026-07-09 — Rewrote all 23 Nathan's Notes (tighter, sharper)
The notes were tedious to read: each ran 8-12 sentences across several labeled
lines. Rewrote every entry in `src/data/sectionNotes.ts` against the
`nathans-notes-voice` skill: a one-line hook plus two to four sentences, the four
gates folded in (customer's cost, operational cause upstream, owner + next update,
one decision Nathan makes), in a manager-briefing-a-peer / trainer / SOP voice.
File dropped from 793 to 238 lines. Ran with three parallel drafting agents
(split ~8 notes each); lead assembled the single file. Honesty intact (no SAP
tenure/config; "I can read SAP SD and own the process around it"). Verified:
`tsc -b` exit 0; no arrows, em-dash separators, or banned words.

## 2026-07-09 — The account is semi-active, and the page does not say why
**A proposed cause was refused. See DECISIONS.md D-012.** The ask was to write in that the account began buying direct from Samyang Korea and importing through China and Taiwan. That is a factual claim about a named retailer's procurement, on a page named for them, handed to their U.S. supplier, and it is not known to be true. The decline is on the page. The cause is not.

- **Purchase order history rebuilt around the real shape of the account.** Eight lines across three orders in 2022 (1,700 cases), two lines across two orders in 2026 (750 cases). Receipts post in partials that straddle a year end. One 2022 line shows a shortage that never became a case, because the confirmed quantity was cut at order entry and the buyer was told before the truck left: thirty cases became a planning adjustment instead of a deduction.
- **New `#trajectory` section.** Cases ordered per year, derived from the purchase order lines themselves via `casesByYear()`, so the chart and the table cannot disagree. Each bar prints its own number, because a length alone is a shape a reader has to estimate.
- **Four hypotheses, ranked by how cheap the evidence is.** First, we lost the shelf (answerable from our own records today). Second, we lost their trust (read the last twelve cases before they went quiet). **Third**, they changed how they source, labeled a commercial question for Sales, with the warning that treating it as fact before confirming it is how a winnable account gets written off. Fourth, nothing changed except the calendar.
- **New Operator Note `acct-dormant`** (33 notes), which is where the import expertise lives. Without naming any company or country, it states what direct import actually transfers to a buyer: FOB terms at origin, ocean freight, marine insurance, the customs entry, duty, FDA prior notice, English labeling compliance and the facility registration behind it, a six-week replenishment cycle in place of a two-day truck, and a container minimum they have to sell through. Then the CX argument: a shortage the domestic supplier could fix in forty-eight hours now sits on a vessel, and there is no ASN to check against a load confirmation because the goods cleared under the buyer's own entry.
- **The note's closing gate is the point of the page.** The open short shipment is not a fill rate statistic on a semi-active account. It is the first order back after three years, and it decides whether there is a third.
- **Bug caught:** FF-2088, an open invoice price dispute, still referenced the 2022 purchase order. An open dispute on a PO almost four years old is not an active case, it is a write-off, and every retailer dispute window closed long before. Repointed to the 2026 order.
- Hero badge changed from "High volume" to "Semi-active"; a status row added to the snapshot; "Why this account matters" rewritten around the harder case, which is the account that stopped ordering.
- Verified: `tsc -b --force` exit 0. No company or country named inside the note (D-010). Every active case references a 2026 order. Nothing from the real SAP document appears anywhere (D-011).

## 2026-07-09 — The page shell gets a gutter; the nav gets its width back

- **The contents rail was covering the Order summary, and the column was the
  cause.** Twenty CSS modules each hardcoded `max-width: 1200px`. At a 1300px
  viewport that leaves 50px of gutter, and the 220px MiniNav had nowhere to go
  but on top of the content. The column is now one token, `--shell-max`, defined
  once in `tokens.css` as `min(1120px, 100vw - 2 * --gutter-reserve)` above
  900px. The page yields the gutter before it yields anything else. Side padding
  drops to `--shell-pad` at the same breakpoint, because the margin is doing that
  work now.
- **The MiniNav rests as a 60px spine.** Its width is derived, not guessed: 2px
  border, two 8px body paddings, 8px link padding, a 24px marker column, an 8px
  gap. It fits inside the 84px reserve at every width from 900px up, so it can no
  longer paint over a card. Hover, keyboard focus, or the pin button widens it to
  the full labeled panel; only the pin persists. Collapsed, the labels are
  clipped rather than `display: none`, so a screen reader still reads the list a
  sighted user sees expanded, and the header prints "4/5" as the one cue the
  spine needs. The old `open` localStorage value migrates to pinned.
- **The MegaNav is full bleed.** The bar and its dropdown run edge to edge and
  inset by `--nav-pad` instead of sharing the content column. "Account Support"
  was wrapping onto a second line and making the bar taller than its siblings:
  `white-space: nowrap` on the group buttons, plus a label step-down under
  1240px, keeps every group on one line down to the 860px drawer cutoff.
- **The dropdown's right pane now argues for the click.** It was a title and one
  blurb. Every destination in `nav.ts` carries a `kicker`, a `sub` line, two or
  three `proof` points, and a `cta` that names the action. The link list prints
  the `sub` under each label, so the list is readable without hovering anything;
  the preview pane carries the promise, the proof, and the button. Proof lines
  are where the synthetic-data disclosure now lives, beside the claim it
  qualifies rather than appended to a paragraph.
- **The footer is compact.** It declared four columns and had five, so the fifth
  wrapped to a second row. It is five columns beside the brand block now, the
  padding goes 64px down to 32px, and the independence disclaimer shares one meta
  row with the research-snapshot date instead of each taking a full-width line.
- **The CompareRail gets the same spine.** It was a 280px panel that covered the
  left edge of the column the moment a visitor added their first product to
  compare. It now rests at 60px inside the reserved gutter and widens on hover,
  focus, or pin, exactly like the MiniNav. Collapsed, the spine still shows the
  product thumbnails it is holding above the count, so the tray answers "what is
  in here" without being opened. The body is no longer unmounted when collapsed:
  everything is clipped rather than removed, which keeps every control in the
  accessibility tree, and `:focus-within` widens the rail so no control can take
  focus while it is invisible. Two subtleties the collapse turned up: a flex
  `gap` is still drawn between siblings clipped to zero width, so the item gap
  had to collapse too or the thumbnail would sit 16px past the spine edge; and a
  `margin-bottom` declared later in the file outranks the collapse rule by source
  order, so `.title` and `.hint` now let the expanded-state rules own their
  margins by specificity.
- **`sop-register` gets a door.** It had full copy and was reachable only from the
  in-page SubNav. It is the register the escalation ladder routes into, so it is
  now the third item in the Leadership dropdown.

## 2026-07-09 — Ops board leads the page; sort moves onto the column header

- **The five sort selects were floating at five different heights, and it was a
  one-line bug.** `.column` declared `grid-template-rows: auto 1fr` while holding
  three children. The header took the `auto` row, the sort row took the `1fr` and
  absorbed all of the column's slack, and the card body was pushed into an implicit
  third row. Because each column holds a different number of cards, each column
  handed its sort row a different amount of stretch. Nothing was misaligned in the
  markup; the grid was one row short of its contents.
- **Sort is now a chip on the column header,** beside the stage name and the count,
  where the thing being sorted already is. It opens a small `role="menu"` popover
  with the four sorts, a tick on the current one, and one line explaining why a
  sorted column is read-only. Escape closes it and returns focus to the chip; a
  pointer-down anywhere else closes it. Under 1400px the chip drops to its glyph,
  because a five-lane board gives each column roughly 200px and no chip that wide
  exists. The `aria-label` and tooltip still name the sort in full.
- **State is carried by shape, not hue,** per the colorblind rule: manual order is
  `≡` with a solid border, any other sort is `⊘` with a dashed border. The old
  "Drag off" pill is gone because the chip itself now says it.
- **The board leads the page.** Order was hero, stats, featured-case walkthrough,
  pattern watch, filters, board. It is now hero, featured strip, filters, board,
  note, pattern watch, walkthrough. The board is the product, and a reader should
  meet it before being asked to read a thousand words about one case.
- **FF-2041, 99 Ranch Market, is unmistakably the case to follow.** A featured strip
  under the hero names it, states its category, priority, stage, and owner, and
  offers both entries: "Follow this case end to end" scrolls to the walkthrough, and
  "Open the full case record" opens the same modal a card opens. The card on the
  board carries a matching `◎ Featured case` ribbon and is 26px taller than its
  neighbors, so the ribbon is bought with real height rather than stolen from the
  content. The walkthrough's eyebrow moved from "The case you came from" to "The
  case to follow", which is true whether the reader arrived from the homepage teaser
  or from the strip.
- **Hero is one panel** with a brand hairline, three status chips, and the queue-health
  strip rendered as a single instrument (1px grid gap over a line-colored surface)
  rather than five floating cards.
- **Two crowding fixes:** `--card-h` 200px to 214px, and the routed-or-held chip on an
  In-progress card gained 4px of clearance, because its bottom border was grazing the
  case reference underneath it.
- Verified: `tsc -b` exit 0. Every `styles.*` reference in `OpsDashboard.tsx` resolves
  to a rule in the module. No arrows in visible copy. Dead `.colSort*` rules removed.
- Not verified here: the popover's paint order above later columns, and the header
  min-height at 1101px. Both need a real desktop browser.

## 2026-07-09 — Account dossier: derived pricing, varied dates, two columns
- **The purchase order prices are no longer typed in. They are quoted.** Each PO line now carries a `skuCode`, and the price is computed at render time by `unitPriceForOrder(sku, casesOnPo(line.po), "distributor")`, the exact function the homepage order builder calls. A price written into the data file would eventually disagree with the price the product quotes, and nobody would know which was wrong. New `SKU_BY_CODE` / `skuForCode` in `skus.ts` to make the lookup possible.
- **Expanding a row now shows where the price came from:** the SKU code, the case pack, the distributor lane, the number of cases on the whole purchase order, and the volume tier that count earns. PO 4500118207 carries 830 cases, which clears the 100-case break, so Buldak Original quotes $32.90 per case against its $37.40 lane base.
- **Dates vary and are recent.** One order placed 02/11/2026 with lines delivering 03/04 and 03/11 to two different DCs, and receipts posting two days apart. A second order on 05/27/2026 whose receipt still has not posted five weeks later. The open short shipment placed 07/06/2026, delivered 07/08, ad running Friday the tenth. A single PO does not land all at once, and the buyer tracks each line.
- **The right "account intelligence" rail is gone.** A third column squeezed the purchase order table into a horizontal scroll, and that table is the one thing on the page a reader has to take in at a glance. Its figures moved to a strip under the hero, where they are read once rather than followed. The honest-claim card and the cross-links moved into the hiring manager summary, which is where they belonged.
- **The left rail is narrower (180px) and collapses to 52px,** handing its width back to the table. Collapsed, it still names the section you are in, set vertically in the gutter, because a navigation control that hides your position is not a navigation control. It opens by default on a desktop and closed on a phone, where an expanded twelve-item list would push the content it navigates off the screen.
- **Table trimmed** from a 1180px minimum to 940px, so it fits a laptop without scrolling sideways once the rail is collapsed, and still scrolls below that rather than shrinking type past legibility.
- **Three bugs caught in the same pass.** `hidden` on the rail list did nothing, because `display: grid` beats the user-agent `display: none`. The `1400px` media query still targeted the rail I had just deleted. And the rail defaulted open on phones. Dead `.intel*` CSS removed; every remaining rule is used.
- Verified: `tsc -b --force` exit 0. No hardcoded price remains in the dossier data. Receipts still sum to received quantity on every line. Nothing from the real SAP document appears anywhere in `src/` (D-011).

## 2026-07-09 — Account operations dossier at /accounts/99-ranch-market
**A real SAP purchase order was supplied for this page and was not used. See DECISIONS.md D-011.** It carried Samyang America's actual wholesale prices, a real PO number, real goods receipt documents, and a real buyer's user id, extracted from a former employer's ERP. Publishing that on a site handed to Samyang America would have demonstrated the one disqualifying trait for a role that owns order-to-cash data. Every identifier on the page is invented. The structure is faithful, and the structure was the whole point.

- **New route `/accounts/99-ranch-market`,** a full page rather than a modal, because the argument is that customer experience in CPG is the entire order chain and a chain does not fit in a dialog. Explicit route, not a `:slug` param, so an unknown account 404s instead of rendering an empty dossier.
- **Twelve sections:** account snapshot, company notes, a twelve-step order lifecycle with a failure mode on each step, an expandable purchase order table, three active cases, ERP and EDI logic, internal routing, KPIs, an SOP library, a risk register, a Nathan's Notes index, and a hiring manager summary with a copy button.
- **The purchase order table is the centerpiece.** Open a row and it shows the goods receipt history: one ordered quantity of 380 CV satisfied by receipts of 164 and 216, summing back to 380. That partial-receipt reconciliation is what a buyer actually does, and it is verified in the data (a check confirms every line's receipts sum to its received quantity).
- **Four new Nathan's Notes** (32 total), each attached to the section whose decision it explains rather than collected in a pile. The strongest is **"What a purchase order looks like from the buyer's chair"**, which makes the only claim on this site that a supplier-side candidate cannot make: Nathan has read a PO from the side that placed it. It connects that to his dental AR experience, where a wrong field at intake failed weeks later as a denied claim. Per D-010, no note names a company.
- **Linked from `/ops` without removing anything.** The account name still opens the quick-look vendor modal; accounts that have a dossier get a second, clearly-named "Dossier" chip beside it, and the case modal gains a link. `accountPageFor()` returns a route only for accounts that actually have a page, because a link to a page that does not exist is worse than no link.
- **Accessibility.** Sticky rail is a real `<nav>` with `aria-current` tracked by one IntersectionObserver, and the active item carries a filled glyph, a heavier weight, and a left rule, not just a color. Risk is a word plus a glyph everywhere (Low ○, Medium ◆, High ▲). A quantity gap shows "▲ 60 short", never a red cell. Tables are real tables with scoped headers. Below 1000px the rail collapses to a tap-to-open list naming the section you are in.
- **The disclaimer appears twice,** at the top of the hero and in the page footer, as specified, and the site footer disclaimer already covers affiliation.
- Verified: `tsc -b --force` exit 0. Nothing from the real SAP screen appears anywhere in `src/`. No arrows, no banned words, no SAP implementation claim, no retailer banner inside any note.

## 2026-07-09 — Five stages, per-column sort
**The lifecycle went from eight stages to five, so the board fits one screen.** A lane a manager has to scroll sideways to reach is a lane that never gets read.

- **Routed is gone as a column.** It made every case look like it was waiting on another department, and most are not: a SKU availability question is opened and closed by Customer Experience without a handoff, and parking it in a Routed lane teaches a manager to look for a transfer that never happened. Routing is now a **property of a case being worked**, derived from the category's owner (`isRoutedOut` / `handlingLabel`) and printed on the card: "Held in Customer Experience" (◉) or "Routed to Supply Chain" (◇). Derived, not stored, so it can never disagree with the routing intake actually performed.
- **Customer updated is gone.** Telling the account is not a place a case rests; it is something that must be true before a case may be called resolved.
- **Improvement review is gone,** and this made the process *stricter*. Half the close-the-loop actions used to live there, which meant a case could be marked Resolved with the root cause never logged. All four follow-ups now hang off Resolved, where a manager has to look at them before closing.
- **Sort is per column, not per board.** `boardSort` became `columnSort: Partial<Record<StageKey, BoardSort>>`. The questions differ by lane: in Reported you want oldest first, because that is the account nobody has answered; in Resolved you want newest, to see what just closed. Each column header carries its own select with a distinct accessible name ("Sort Reported column"). A sorted column cannot be dragged, and says so in words ("▲ Drag off") rather than leaving greyed-out handles to explain themselves.
- **`fireflow:home:v3`.** A persisted `stageIndex` written against eight stages would be silently reinterpreted: an old Routed at 3 becomes Resolution proposed, an old Resolved at 6 is out of range entirely. Bumped rather than mislabeled, same reason v2 existed.
- **Seed remapped by meaning, not by shifting.** Every case was moved to the stage its narrative actually supports, `order` respaced per column so no two cards in a lane tie, and two cases relocated on the evidence of their own text (an 850 with no order confirmation nobody has picked up is Reported, not In progress). Final board: 2 / 3 / 2 / 3 / 4.
- **One lifecycle, not two.** `data/scenarios.ts` and `types/domain.ts` ran their own seven-stage list, so `/support` and `/ops` described different processes. Both realigned.

**Two bugs an audit agent caught.**
- **`/leadership` rendered a false sentence.** `IMPROVEMENT_STAGE` interpolates the final stage label, which used to be "Improvement review" and read as a step you run. It now resolves to "Resolved", so the ninety-day plan said **"Run the resolved step on repeat cases."** Rewritten to name what the stage requires instead of using its label as a verb.
- **`parseHistory` did not clamp** `to`/`from` the way `parseCases` clamps `stageIndex`, so a hand-edited payload could index `LIFECYCLE_LABELS` out of range and render "Moved  to ". Clamped, per the file's own rule that storage is untrusted input even when we wrote it.
- Also: a defensive guard on `onDrop` (the dragover gate holds today, but a refactor could otherwise write an `order` the sort silently ignores, losing the move without a word), and the stale lifecycle comment atop `scenarios.ts`.
- I nearly shipped a `→` as the routed glyph, which the project's own copy rules ban. It is `◇` now.
- Verified: `tsc -b --force` exit 0. No numeric stage assumptions remain. No dead stage key in any rendered string. Colorblind rule holds on every new control.

## 2026-07-09 — MiniNav z-order, mobile toolbar, catalog pagination
- **The MiniNav floater was painting under the catalog toolbar.** Both sat at `z-index: var(--z-rail)`, and the toolbar, being later in the DOM, won the tie. Raising a number on MiniNav alone would have been a guess, so the scale gained a named step: `--z-mininav: 28`, above `--z-subnav` and any in-page sticky control bar, below `--z-nav`. The floating table of contents now clears the toolbar and still passes under the site nav.
- **The catalog toolbar collapses on a phone.** Sticky, it held a search field, a sort select, a three-way density switcher, a Filters button, a type-chip row, and an active-chips row above the first product, eating roughly a third of a 390px viewport. Below 720px it collapses to a single row carrying the live result count and a toggle. State is a word plus a glyph ("Search and filters +" / "Hide search and filters −") and the active-filter count rides on the toggle, so a collapsed bar never hides the fact that filters are on. Above 720px the toggle does not exist and the controls are unconditional.
- **The grid paginates at 12 per page.** Twelve is the largest page that divides cleanly into 2, 3, and 4 columns, so no page ends on a ragged row at any breakpoint. New `CatalogPager`: Previous and Next, elided page numbers around the current page, a "Page 3 of 4 · 45 products" readout, and a jump field, because a keyboard user should not tab through page buttons to reach page 4.
- **Pager details that matter.** The page is **clamped**, not trusted: filtering down from 45 results while sitting on page 4 would otherwise render an empty grid and read as a bug. Any change to the result set (search, sort, filter count, result count) returns the visitor to page one. Changing page scrolls the grid's top edge back into view, respecting `prefers-reduced-motion`, so tapping Next at the bottom does not land you at the bottom of the next page.
- **Phone-specific pager behavior.** The numbered buttons are hidden below 600px: twelve 44px targets do not fit across a 360px viewport, and shrinking them below 44px trades one problem for a worse one. Previous and Next carry navigation, the jump field carries reach, and every control clears the 44px minimum.
- Current page is signaled by `aria-current="page"`, an accessible name that says "current page", a fill, a heavier weight, and an inset rule. A colorblind reader loses only the fill.
- Verified: `tsc -b --force` exit 0.

## 2026-07-09 — Removed the entrance cover
- **`EmployerIntro` deleted.** It mounted in the persistent shell above `<Routes>`, so it sat on top of every route and made navigating between pages feel heavy. Its argument belongs in a cover letter, not in the product chrome. The copy is preserved verbatim in `docs/cover-letter/INTRO-SOURCE.md`, annotated with what to keep, what to check (the "more than eight years" claim must match the résumé exactly; it is the only tenure number that appeared anywhere on the site), and what must never be claimed.
- **Store cleaned.** `introDismissed`, `DISMISS_INTRO`, and `OPEN_INTRO` are gone from `homeStore`, along with the `RESET` branch that preserved the flag and the persistence key that stored it. A stored `introDismissed` from an older visit is now ignored on load rather than reinterpreted.
- **`EmployerClose` had a "Reopen the introduction" button** pointing at an intro that no longer exists. Removed, along with the `useHome`/`dispatch` it existed for and its orphaned `.reopen` CSS.
- **The footer disclaimer had to grow.** The cover was carrying "not affiliated with Samyang America and does not represent access to its internal systems," and deleting it would have left the site without that statement. `INDEPENDENCE_DISCLAIMER` now says it, and additionally carries the **D-010** obligation the old text never did: real grocery banner names appear only as illustrative sample accounts, and no affiliation, contract, or endorsement by any retailer named is implied. It renders in the footer on every route.
- Verified: `tsc -b --force` exit 0. No residual reference to the intro anywhere in `src/`.

## 2026-07-09 — SOP register, pattern watch, and three bugs in yesterday's rules
- **SOP codes on all 29 categories.** Coded by process family (OM order management, DE delivery exceptions, BD billing and deductions, PR pricing, MD master data, QA product and quality, CN consumer), because a flat `SOP-01..29` tells a rep nothing about which binder to open. The code renders on the category pill, rides the case into the routing summary, and appears on the confirmation, so a rep can cite the procedure they followed and a reader can go check it.
- **`SopRegister`** on `/leadership#sop-register`, rendered from `ALL_CATEGORIES`, the same taxonomy account support intake routes against. A register typed out separately from the categories it governs eventually lists a procedure nobody runs and omits one everybody does, and nobody notices until a rep follows the document and the system does something else. There is one list.
- **The category pill now shows its resolve target** under the priority, so the promise is visible at the moment the path is chosen rather than after a form is filled in.
- **`PatternWatch`** on `/ops`: open cases by category against `REPEAT_ISSUE_TRIGGER`, reading the same constant the intake escalation check evaluates, off the same live cases. File a third case in one category through account support and the bar trips here. A dashboard that only describes the complaint-to-pattern loop is a diagram; one you can trip is a demonstration. A flagged row carries the word "Pattern", a glyph, a **diagonal hatch** on the bar, and a thicker left rule: photocopy it in black and white and it still reads.

**Three bugs an audit agent found in the escalation rules shipped hours earlier.**
- **The trace contradicted itself on screen.** `bringIn` spread `category.supporting` unconditionally, so a case that fired no rule rendered "Handled at first contact / Nobody. It closes here." directly above a row reading "Beyond first contact: Finance." Now gated on `escalated`.
- **A blank field was read as a total loss.** `Number("")` is `0`, not `NaN`, so clearing the prefilled "received quantity" made `casesAffected` the entire order, and the trace demanded Manager authority for it. Nothing on that form is required, so an empty field is the normal case. Both fields must now actually be filled before the subtraction means anything.
- **The reship rule fired on cases where a reship is not the remedy.** It read the generic "case quantity affected" field shared by the `order` field set, whose prefill is 120, so checking on an order status told you it needed a manager's approval to reship. Now scoped to `fieldSet === "shortship"`, which is exactly the two categories where a make-good is the remedy. A rule that fires on the wrong case type teaches the team to ignore the rules.
- Also: `CHARGEBACK_ACCEPT_CEILING` named and derived rather than a `$2,500` literal sitting next to derived numbers; `CX` exported from `intake.ts` instead of duplicated as a string; the escalation memo narrowed to the three fields the rules read, so typing an email no longer re-evaluates the SOP.
- Verified: `tsc -b --force` exit 0. Module graph still a DAG (`intake.ts` imports nothing). No unsourced dollar literals remain in `team.ts`. `THRESHOLD_BASIS` renders adjacent to every surface showing a threshold.

## 2026-07-09 — Escalation trace, and the tooltip escapes its cage
- **Tooltip z-index and clipping, fixed properly.** `GlossaryTerm`'s tip was `position: absolute; z-index: 5` inside its own `position: relative` wrapper, which made it a prisoner twice over: any ancestor with `overflow: hidden` clipped it (ops cards, note panel body, support drawer), and any ancestor creating a stacking context capped its z-index, so it rendered *behind* a dialog at `--z-dialog: 60` no matter what number we wrote. It is now **portaled to `document.body`** with `position: fixed` coordinates measured from the trigger. It flips above or below by available room, clamps to the viewport so it can never run off an edge, and re-measures on scroll (capture phase, so it follows its term when the drawer scrolls) and on resize. New `--z-tooltip: 70`, above everything. `pointer-events: none` so it never swallows a click. `aria-describedby` still resolves, because ARIA ids work across the document, not by DOM proximity.
- **`EscalationTrace`: the SOP, shown executing.** The routing step of account support intake now renders every escalation rule evaluated against the case, in order, with the case's own data beside each rule and the consequence spelled out where it fired. Rules that did *not* fire are shown too: a trace listing only what triggered is a conclusion, while a trace listing what was checked is an argument a rep can audit.
- **Four rules, all derived.** Service level (high or critical carries a same-day clock and gets a named lead). Reship authority (cases affected against the ladder, computed from ordered minus received, or the case quantity; when the form captured neither, the rule is **not evaluated rather than guessed at**). The dispute clock (a deduction routes to Finance carrying the retailer's window). And the pattern rule, which counts **open cases already on the ops board in the same category**, so filing a third one trips it in front of you. That is what categorized intake is for, and it is why the rule reads live state instead of a seeded count.
- **One set of numbers.** New `src/data/escalation.ts` owns `RESHIP_CEILING`, `CREDIT_CEILING`, `REPEAT_ISSUE_TRIGGER`, and the `APPROVAL_LEVELS` ladder. `team.ts` now builds its `APPROVAL_MATRIX` strings *from those numbers* and re-exports the ladder, so the authority table published on `/leadership#team` and the check running inside the product cannot drift. The ladder moved into `escalation.ts` rather than importing back from `team.ts`, which would have been a circular module initialization.
- **`THRESHOLD_BASIS` renders on both surfaces.** Every threshold is labeled a proposed operating target, not an industry benchmark, because no published CPG standard sets a reship ceiling or a repeat-issue trigger and quoting one as sourced is how the drill says you lose a room.
- **The colorblind trap in the source prototype, inverted.** The console this pattern came from signaled fired with red and clear with green, which is unreadable to Nathan. Here outcome is a word and a glyph ("Met ▲", "Not met ○"), and a fired rule additionally thickens its left rule from 2px to 5px, so the distinction survives greyscale and print.
- Verified: `tsc -b --force` exit 0. No runtime import cycle (`escalation.ts` imports only types). No hardcoded ladder numbers remain in `team.ts`. Sweeps clean for arrows and banned words.

## 2026-07-09 — Featured case panel on /ops, and three bugs an audit agent found
Two agents: one wrote the copy against the notes voice skill, one adversarially audited the whole new flow.
- **`FeaturedCase`** sits above the board. One case, told end to end: the standfirst, three at-a-glance figures, the eight-stage trail with the real audit trail stamped into the stages it has passed (initials, actor, time) and future-tense glosses on the ones it has not, the closing follow-up actions at Resolved and Improvement review, and a "why this case" line. A visitor arriving from the homepage has never seen a board of synthetic deductions; fourteen cards teach them nothing, one case walked end to end teaches them what the board is for.
- **Every value is derived, never retyped.** Stage count from `LIFECYCLE.length`, owner and metric and service targets from `deriveCase`, stamps from the case's own `history`, closing actions from `followUpsFor`. The panel and the board cannot disagree because there is one source. It reads live from `cases`, so dragging the featured card to a new stage updates the panel with it.
- Falls back to `TEASER_CASE_ID` when there is no `?case=` param, so a visitor landing on `/ops` directly gets the same tour. An unknown id falls through rather than hiding the panel.
- New Nathan's Note, `ops-featured` (28 notes): **"Resolved is signed by a second name."** It earns its place by explaining something the other two ops notes do not, and it is true on screen: `seedHistory` stamps `lead-grace` on any move at or past Resolved, so the close carries different initials than the work. The person who investigated the shortage clears their own board by closing the case, which makes them the worst placed to judge whether the fix reached the shelf.

**Three bugs the audit agent caught, all fixed.**
- **`seedCases.ts` still had `to >= 6`** to decide when the team lead signs off, with a comment admitting it had already been renumbered once when "in-progress" was inserted. This is the exact landmine the lifecycle re-keying was supposed to kill, surviving in the seed. Now `indexOfStage("resolved")`.
- **Focus was lost on closing the case modal from the new panel.** `closeModal` always refocused `[data-card="${id}"]`, the board card. Opened from `FeaturedCase`, focus went to the wrong element, and if the featured case was filtered out of the visible board it went to `document.body`. Both triggers now route through `openCaseFrom(id, trigger)`, which records what opened the dialog; `closeModal` returns focus there, falling back to the card.
- **The panel's Open button never dispatched `SELECT_CASE`,** so opening the full record from the panel left `selectedCaseId` stale and the board's selection ring lit the wrong card. The two entry points into the same dialog now share one function and cannot diverge again.
- Also fixed: "Eight stages" was written as prose in three places next to code that derives it, and the teaser hardcoded "High priority" while the panel derived it. Both now read from the data. Removed an ambiguous "sixty missing cases," where "cases" meant shipping cases in a sentence about support cases.
- Verified: `tsc -b --force` exit 0. Sweeps clean for arrows, banned words, SAP claims, numeric stage literals, and real company names inside notes (D-010). Reduced-motion blocks present in both new stylesheets; the trace walk and its sound both short-circuit.

## 2026-07-09 — Homepage ops teaser, and a deep link into the case board
Three agents: one researched card technique against MDN, web.dev, WCAG and WebKit; one planned the deep link; one wrote the copy against the notes voice skill.
- **The narrative.** `OrderBuilder` now hands off to a new `OpsTeaser` section (`/#ops-teaser`). You build a bulk order, then you meet the order that arrived short. It features **FF-2041**: 540 of 600 cases received, nothing noted on the bill of lading, the driver would not sign the exception, and the account's ad runs Friday. The CTA deep-links to `/ops?case=FF-2041`, where the board selects that card, scrolls it into view, and marks it as arrived.
- **`TEASER_CASE_ID`** exported from `seedCases.ts` so the teaser and the board cannot drift. `OWNER_BY_CATEGORY` exported so the teaser names the same rep the board's audit trail stamps (Aisha B., short-shipment). Owner, metric (Fill Rate), and case type are read from `deriveCase`, never retyped.
- **The pipeline strip.** All eight lifecycle stages, each with a five-word account-side gloss ("Supply Chain runs the recovery"). A `role="switch"` labeled **Trace this case** walks a light down the pipeline, one stage per 260ms, stopping where the case actually sits (Routed). Each stage plays a soft `tick` detuned by its index; the stage the case reached plays `stageAdvance`.
- **Three effects, each with a rule.** A rAF-throttled pointer spotlight, gated behind `(hover: hover) and (pointer: fine)` because on touch `pointermove` only fires during a drag and would strand the highlight under the last finger. A conic-gradient border ring using a registered `@property --angle`, since an unregistered custom property has no defined interpolation and pops at 50% instead of rotating; it is `animation-play-state: paused` until hover or focus, because N simultaneous conic animations is where the technique gets expensive. And a luminance ramp on the stages.
- **The glow never carries the message.** Nathan is colorblind, so brightness (not hue) drives every lit state, and every stage carries a glyph and a word regardless: Done ✓, Now ●, Next ○. Priority is "▲ High priority." The board's arrival marker is a surface lift plus a thickened outline plus a badge reading "◎ From the homepage," and it takes the case-ref slot rather than covering the priority chip, because the card is a fixed 200px with `overflow: hidden`.
- **Fixed a bug I wrote.** The deep-link effect first depended on `useReducedMotion`, which returns `false` on the first render and flips in its own effect. That re-ran the effect, whose cleanup cancelled the pending `requestAnimationFrame` and the highlight timer: the board would have scrolled nowhere and the badge would never have cleared. The effect now reads `matchMedia` directly (no dependency, no race), and the arrival timer lives in its own effect keyed on `arrivedId`.
- **The landmine the plan agent caught.** `homeStore.writeUrl()` rebuilds the query string from its own keys and `replaceState`s it, so `?case=` is stripped from the address bar on the first state sync. Because that is a `replaceState`, react-router never observes it, so the param is read through `useSearchParams()` and never through `window.location.search`.
- **Wired `data-selected`,** which had CSS in `OpsDashboard.module.css` that nothing ever set. Selection was invisible on the board until now.
- The deep link dispatches `SELECT_CASE` only. It never touches `stageIndex`, `enteredStageAt`, the manual `order` key, or the audit trail. An unknown `?case=` id short-circuits and the board renders normally.
- Nathan's Note added for `ops-teaser` (27 notes). Per **D-010**, the note says "one account on this board"; 99 Ranch Market appears only on the card outside it.
- Verified: `tsc -b --force` exit 0. Sweeps clean for arrows, em-dash separators, banned words, SAP claims, and real company names inside notes. (`npm run build` and `verify:data` need a platform-matched `node_modules`; the sandbox has the macOS esbuild binary.)

## 2026-07-09 — Nathan's Notes: the "awaken" entrance
Motion borrowed from `zodi-awaken`: long expo-out curves, a from-state left one frame after mount, staged properties on separate clocks.
- **Tokens.** `--op-ease-awaken` (`cubic-bezier(.16, 1, .3, 1)`), `--op-dur-slide` 560ms, `--op-dur-grow` 900ms, `--op-dur-settle` 620ms, `--op-delay-grow` 340ms, `--op-stagger` 80ms. All collapse to `0ms` under `prefers-reduced-motion`. Product UI keeps `--dur-1..3`; only the fourth wall moves this slowly.
- **The teaser arrives as a pill.** `NoteTeaser` starts at `max-width: 272px`, `border-radius: 999px`, drifted left and transparent, showing only the NS avatar and the tag. It fades and slides in (560ms), pauses (340ms), then widens to the full 760px bar with the radius morphing square (900ms). The hook and the Read affordance fade up last, so no text reflows while the bar is still growing. The overlap is what makes it read as one gesture instead of three.
- **`useAwaken`** (`src/hooks/useAwaken.ts`): one module-scoped `IntersectionObserver` for all 26 notes, each target unobserving itself on first intersection. Twenty-six observers for a once-per-element effect would have put twenty-six callbacks on the scroll path.
- **`useMountTransition`** (`src/hooks/useMountTransition.ts`): `{open && <Panel/>}` cannot animate closed, because React drops the node on the frame the flag flips. This holds it for the exit duration and flips `entered` one frame after mount so the opening transition has a from-state to leave.
- **`hidden` is gone.** `display: none` has no from-state. Both note surfaces now grow through a `grid-template-rows: 0fr` to `1fr` reveal, which finds the natural height with no JS measurement and no `max-height` guess that clips a long note. The body is still **unmounted** while collapsed, so a screen reader never walks 26 closed notes; the wrapper keeps the id `aria-controls` points at.
- **Open slowly, close briskly.** 900ms in, 420ms out (`EXIT_MS` in the TSX must match the CSS). Slow entrances feel considered; slow exits feel like the interface is arguing with you.
- **Staggered body.** `OperatorNotePanel` lines carry an inline `--i` so the delay scales with however many lines a note actually has: title, each line, role-fit, then the synthetic-data disclaimer.
- **Accessibility.** Every duration is `0ms` under `prefers-reduced-motion`, and each stylesheet additionally forces the resting state, because `useReducedMotion` returns `false` on the first render and the CSS must not depend on the effect having run. Nothing signals state by color: the teaser still carries "Read"/"Hide" plus a glyph.
- **Print.** An unawakened note is `opacity: 0`, and a printed page never scrolls, so the observer never fires. Added `@media print` resting states to all three stylesheets. Without it, every note would have silently vanished from a PDF of the site.
- Removed a dead `rotate(180deg)` on the toggle glyph: rotating `+` or `−` is visually identical, and the character already swaps.
- Verified: `tsc -b --force` exit 0. (`npm run build` needs a platform-matched `node_modules`.)

## 2026-07-09 — Ops board: In progress stage, manual order, vendor profiles, follow-ups
Three agents on disjoint files, reconciled by the lead.
- **Lifecycle re-keyed by name, not position.** `stageDetail` switched on `case 0…6` and `CaseBoard` gated panels on `stage >= 1/2/3/4/6`. Inserting a stage would have silently mislabeled every case. `LIFECYCLE` is now `{ key: StageKey; label }[]` with `stageKeyAt`, `indexOfStage`, and `stageAtLeast`. Every consumer compares by meaning. The localStorage key moved to `fireflow:home:v2`, because persisted `stageIndex` numbers from v1 would have been reinterpreted by the insert.
- **New "In progress" stage** between Reported and Verified. Reported now means nobody has picked the case up.
- **`enteredStageAt` and time in stage.** Every card shows how long it has sat in its *current* stage, with an aging cue carrying a word and a glyph: Fresh (○, under 24h), Aging (◆, 24 to 72h), Stalled (▲, over 72h). Total age says how bad it looks; stage time says what to do next.
- **Uniform cards.** Fixed 200px height, inquiry clamped to two lines, `overflow: hidden`, full detail in the modal. A long complaint no longer gets more visual weight than a short one.
- **Manual order is the default sort** (`boardSort: "manual" | "newest" | "oldest" | "account"`). Dragging computes an insertion index from each card's midpoint against the pointer, renders a 2px drop line, and dispatches `REORDER_CASE` with `orderBetween(prev, next)`. Seeded orders are spaced by 100 so a card inserts between two others without renumbering. Sorted views disable drag and say why. Keyboard equivalent: Move up / Move down buttons on every card, announced in the live region.
- **Absolute timestamps** on cards and on every audit-trail entry ("Jul 8, 2:14 PM"), with the relative age still reachable.
- **Vendor profiles** (`src/data/vendors.ts`): the account name on a card opens a profile with partner-since, region, store and DC counts, payment terms, order channel, primary contact, and their open cases on this board. Click stops propagation so it does not also open the case.
- **Closing the loop.** Resolved and Improvement review carry `followUpsFor()` actions (close the loop with the account, notify and thank the responsible team, send the SOP update, log the corrective action) plus a copyable `resolutionNote()` a manager can paste.
- **All Nathan's Notes are now collapsible.** `OperatorNote` renders the tag and title, collapsed by default, with an `aria-expanded` toggle carrying a word and a glyph ("Read note" +, "Hide note" −). Escape from inside the body collapses and returns focus. The board's inline note became `<SectionNote sectionId="ops-board" />`.
- **New `ops-board` note.** The agent deleted its own manual-order and vendor-profile lines to stop the note becoming a feature list. What survived: "Reported means nobody has picked it up," the four-days-in-Routed test, and the refusal that a long message never outranks a short one, because how much an account wrote has nothing to do with how urgent their problem is.
- **Honesty:** `VENDOR_DISCLAIMER` renders inside every profile, stating the relationship, dates, counts, terms, and contact are invented, the banner name is illustrative, no affiliation is implied, and nothing is a credit assessment. No real company is named inside any note (D-010).
- Verified: `tsc -b --force` 0, Linux `npm run build` 0, `verify:data` PASSED. No numeric stage assumptions remain. No arrows, no banned words, no color-only state.

## 2026-07-08 — Nav consolidated to one source; the guided tour is complete
- **`src/data/nav.ts` is now the only navigation model.** `MegaNav.GROUPS` (24 hrefs) and `SiteFooter.FOOTER_COLUMNS` (19 hrefs) are deleted, not left as dead code. Six consumers now read from it: MegaNav, SiteFooter, SubNav, MiniNav, Breadcrumb, usePageSections. Three lists describing the same site could only drift; now there is one.
- The agent chose `NAV_GROUPS` referencing routes and sections over a `group` field on `NavRoute`, because the groups do not map to routes: Account Support spans `/support` sections plus the `/ops` route, and About borrows the Products `brands` section. A field on the route cannot express either.
- Added `hrefForSection`, `activeGroupId`, and optional per-section `blurb` / `mode` / `familyId` so every href, panel description, `SET_MODE` dispatch, and product-photo preview resolves from the route table.
- **Regression proof:** link targets were captured before the refactor and diffed after. MegaNav 24 targets and footer 19 targets match as ordered lists and as sets. Nothing added, removed, or changed.
- **New:** `aria-current="page"` on the active top-level nav group, signaled by weight plus a 2px gold bottom bar, never color alone.
- **The guided tour is finished.** `sectionNotes.ts` carries 25 notes across 25 wired surfaces, exactly one per section. The last two were the hardest in the project: `colors` (obangsaek) states plainly "I am not a scholar of the tradition," hedges where sources hedge (jeok versus hong, cheong spanning blue and green), and explains the refusal to encode state with those five colors because Nathan is colorblind and a color-only cue fails the person who most needs it. `why` states he has never worked at Samyang, has not configured SAP, and that everything operational is invented and labeled, then names what he would be wrong about on day one.
- Verified: `tsc -b --force` 0, Linux `npm run build` 0, `verify:data` PASSED. No section renders two notes. No tenure, SAP configuration, or cultural-expertise claims. No banned words, no arrows.

## 2026-07-08 — Wave 4: navigation layers (SubNav, MiniNav, breadcrumbs)
Two agents, disjoint files, wired by the lead.
- **`src/data/nav.ts`** is now the single source of truth for routes and their sections (`ROUTES`, `routeFor`, `sectionsForRoute`). `MegaNav.GROUPS` and the footer still duplicate this; consolidating them is the next cleanup.
- **`usePageSections`** runs ONE shared `IntersectionObserver` for both SubNav and MiniNav. It reads the live `--sticky-h` at runtime (falling back to a hidden probe element, because browsers do not reliably resolve a `calc()` custom property) and uses `rootMargin: -(sticky+1)px 0px -55% 0px`, so a section only becomes active once it clears the sticky stack.
- **`SubNav`**: sticky per-page section bar at `top: calc(var(--nav-h) + var(--rail-h))`, publishing its own height into `--subnav-h`. Renders nothing on routes with fewer than two sections. Active item carries `aria-current="true"` plus a gold indicator bar plus bold weight plus a diamond glyph. Mobile becomes a scroll-snapping chip row.
- **`MiniNav`**: right-gutter progress rail mirroring CompareRail on the left, hidden below 900px so the only floating element on mobile stays the SupportBar FAB. Reuses the SupportBar step-rail `data-state` pattern: upcoming (hollow ring), current (`◆`, `aria-current`), done (`✓`, filled). Includes a "Section 3 of 5" text readout so progress never depends on decoding markers. Collapsible, persisted to localStorage behind try/catch.
- **`Breadcrumb`**: dynamic `FireFlow / {Route} / {Active section}`, last crumb non-link with `aria-current="page"`. Separator is a hand-drawn monochrome SVG chili in `currentColor` at 55% opacity, `aria-hidden` and `focusable="false"`, so screen readers announce "FireFlow, Intelligence, Command Center" with no glyph noise. One static, decorative, `aria-hidden` obangsaek tick at the trail head. **Deliberately NOT built:** any per-section obangsaek color coder, which would have encoded location by hue and broken the colorblind-safety rule the rest of the site keeps.
- **Token stack:** added `--z-subnav: 25` (between `--z-rail: 20` and `--z-nav: 30`, so the MegaNav dropdown still paints over the SubNav) and `--subnav-h: 0px` (default 0 for the same phantom-offset reason as `--rail-h`). `--sticky-h` recomposed to `nav + rail + subnav`.
- **Cleanup:** deleted the orphaned `src/lib/router/useHashRoute.ts` and the last hardcoded breadcrumb in `App.tsx`. Breadcrumb now precedes SubNav (where you are, then where to go).
- Verified: `tsc -b --force` 0, Linux `npm run build` 0, `verify:data` PASSED. One IntersectionObserver, no arrows, no underlined links, no color-alone state.

## 2026-07-08 — Wave 3: the /leadership page, and the last blocker closed
Three agents, disjoint files, reconciled by the lead. This wave answers the posting's two screening filters.
- **New route `/leadership`** (lazy, 9.8 KB gzip chunk) with four sections and a new **Leadership** mega-nav group.
- **`#results` — Track record.** Nathan's real prior-role results (reviews from roughly 10 to 700+ five-star, back-to-back seven-figure revenue years, billing and dispute SOPs that stopped recurrence) promoted out of a collapsed `<details>` in `EmployerEvidence` into a real section. Each carries "Prior role, not Samyang." A visible `CANNOT_CLAIM` callout states what is not being claimed: no Samyang tenure, no SAP implementation, no Samyang metrics. The honesty is the argument.
- **`#standards` — Standards and SOP playbook.** SLA matrix, escalation ladder, approval authority, deduction-dispute SOP, and communication cadence. Values are **imported from `SupportBar/intake.ts` and `caseBoard.ts`**, never retyped, so the playbook cannot drift from the running product.
- **`#team` — Team and coaching board.** A synthetic roster (team lead plus five reps), workload balance that surfaces an overloaded rep by word and glyph rather than color, an approval-authority matrix (reship, credit, delivery-date change, chargeback disposition), a QA rubric, and a 1:1 cadence. States on the page that it is how Nathan **would** run the function and is **not a claim of having managed this team**. This closes the largest gap against the posting.
- **`#plan` — First 90 days.** Assess, stand up standards, start the improvement loop. Explicitly a plan, not a claim.
- **CommandCenter honesty fixes:** cost-to-serve replaced with a **named driver model** (open deductions, expedited freight, returns and unsaleables, manual order entry, short-ship recovery), each showing its illustrative unit assumption **on screen** so the total is visibly derived rather than conjured. CSAT is no longer a bare 4.5 equal to its own 4.5 target: it is `CSAT_ILLUSTRATIVE = 4.3`, labeled a constant, landing in a **watch** state with a glyph and a word. Fill rate and OTIF also sit in watch, so the scorecard no longer reads uniformly on-target.
- **Doc blocker resolved.** `CASE_STUDY.md` and `docs/homepage/04-TARGET-JOB-TO-HOMEPAGE-MAP.md` claimed a team workload / coaching view that did not exist. It exists now, and both docs were rewritten to describe it accurately, including the synthetic labeling.
- **Notes:** four new Nathan's Notes (`results`, `standards`, `team`, `plan`) written against `skills/nathans-notes-voice`. `sectionNotes.ts` now carries 22 notes across 23 wired surfaces. The `team` note reaches the customer through the roster: "A rep carrying nineteen open cases... Somewhere in that stack is a deduction aging past its dispute window and a buyer who has not heard back."
- Verified: `tsc -b --force` 0, Linux `npm run build` 0, `verify:data` PASSED. No Samyang tenure, no SAP implementation claims, no real company named inside a note, no banned words, no arrows.

## 2026-07-08 — Wave 1 + Wave 2: real routes, page split, guided-tour notes
Five agents, disjoint file ownership, reconciled by the lead.
- **Wave 1 (router, zero visible change):** `react-router-dom` v7, `BrowserRouter`, `vercel.json` SPA rewrite. New `ScrollAndFocusManager` (restores hash scrolling that BrowserRouter intercepts, scroll restoration on POP, focus to `#main` on route change, `aria-live` page announcement) and `RouteMeta` (per-route title, description, canonical). `MegaNav` gained a `NavAnchor` that renders `<Link>` for paths and `<a>` for `#anchors`.
- **Wave 2 (page split):** eight routes. `/` (hero, portfolio, comparison, bulk order), `/products`, `/order`, `/support`, `/intelligence`, `/about`, `/ops`, and a 404. The persistent shell (`EmployerIntro`, `MegaNav`, `SelectedProductRail`, breadcrumb, `<main>`, `SiteFooter`, `CompareRail`, `SupportBar`) hoisted into `App` so it never remounts. **`SupportBar` mounts once**, which is what keeps a half-finished intake alive across navigation. New `SiteFooter`; `HomePage` slimmed from 19 sections to 4.
- **Code splitting:** `React.lazy` per route behind one `Suspense`. Entry bundle dropped from **604 KB to 422 KB** (184 KB to 131 KB gzip); `/intelligence` is now a 37 KB gzip chunk loaded only on demand.
- **Link rewrite:** ~40 call sites. Cross-page links became router `<Link>`/`ButtonLink to=`; same-page links kept bare `#anchor`. Zero `href="/…"` full-reload links remain. `ButtonLink` gained an optional `to` prop.
- **`--rail-h` default 0px** (was 56px): `SelectedProductRail` publishes its real height via `useStickyHeightVar`, so a hardcoded value created a phantom offset on routes without the rail.
- **`/ops` de-duplicated:** the dashboard's own back link removed now that the site nav wraps it. The synthetic badge and the illustrative-banner disclaimer stay (D-010).
- **Guided-tour notes:** `sectionNotes.ts` now carries 18 notes; `SectionNote` (collapsed teaser expanding into the cool serif panel) wired into 19 surfaces, one per section, coordinated by `NotesProvider` so only one opens at a time. Five inline `<OperatorNote>` cards were replaced, not doubled. Written against `skills/nathans-notes-voice`: four gates, concierge standard, no epigrams.
- Honesty verified: no Samyang tenure, no SAP implementation claims, no real company named inside a note, no banned words, no arrows. `tsc -b --force` 0, Linux `npm run build` 0, `verify:data` PASSED.

## 2026-07-08 — Nathan's Notes voice raised to manager register, with customer empathy as a required gate
The notes were operationally sound but read inward: they explained what the system prevents without ever showing the person on the other end of the failure. A hiring manager for a six-figure CX leadership role reads that as process literacy, not leadership.
- **`docs/nathan-writing-style-fireflow/03-OPERATOR-NOTES-VOICE.md` rewritten.** New register: a manager briefing a peer, not a candidate addressing a recruiter. Establishes Nathan's dual-sided credibility as the source of every empathetic line (he has worked the service end and been the buyer waiting on a short shipment) and requires it be used concretely, once per note at most, never announced. Adds the **four gates** every note must pass: the customer's cost, the operational cause, the owner and next action, and Nathan's own judgment (a decision, a refusal, or the first thing he checks). Adds the **concierge standard** as six enforceable rules (say it once, never chase, never learn the org chart, hear before the date slips, get a name not a queue, bad news early and specific). Adds a banned list: delight, customer-obsessed, world-class, seamless, passion for people.
- **New `docs/nathan-writing-style-fireflow/03b-NATHANS-NOTES-WEBSITE-VOICE.md`.** Placement map (which note earns its place where), skills matrix, approved and failing lines, implementation direction. Added to the pack's required reading order in `SKILL.md` as item 4.
- **All live notes rewritten** in `CommandCenter`, `PortfolioPulse`, `ProductSignals`, `CrossFunctionalWarRoom`, `CustomerMasterRecord`, `InquiryPaths`, `OpsDashboard`, and the `SupportBar` note panel. Each now carries a customer's-chair sentence before the operational reasoning. Examples: the InquiryPaths note now names being transferred four times and losing faith in the company rather than the problem; the Customer Master note adds that assembling proof of something the vendor already had on file is unpaid work, and is why accounts stop calling and start deducting; the Ops Dashboard note adds that nobody on the team lets a date pass in silence, because a customer can plan around a delay they were told about. The `SupportBar` confirmation note gains a "Say the hard part early" line and the case note gains "What this costs them."
- Honesty holds: no SAP configuration, implementation, or tenure claims (the Customer Master note still opens by disclaiming configuration experience); no real Samyang data; synthetic labeling untouched.
- **Packaged as a skill.** `skills/nathans-notes-voice/` (SKILL.md plus `references/placement-and-examples.md`) and the installable `skills/nathans-notes-voice.skill`. The skill description triggers on any note, Operator Note, or fourth-wall copy work, including vague asks like "add a note here." `CLAUDE.md` now points at it as required reading before note edits.
- Verified: `tsc -b` exit 0. Visible-copy scan clean for arrows and em-dash separators (remaining hits are code comments). Banned-word scan clean (hits are negative examples inside the style docs).

## 2026-07-08 — O2C workbench shipped: scored Order Queue with visible triage math
Landed the Order Queue rework in the working tree (the earlier "multi-order triage queue" entry recorded the design from an unmerged worktree; this is the shipped implementation, rebuilt on a scoring model rather than the stored priority field).
- **Triage scoring model in `src/data/sapsd.ts`:** `triageOrder` builds every order's score from four visible factors: dollars at risk (1 point per $500, cap 12), age in stage (1 point per day, cap 9), proximity to cash (stage index 0 through 7), and open exception (5 points, clean orders score zero). `triageBand` maps scores to Work now ◆ / Today ▲ / Monitor ○ (glyph plus word, never color alone). `sortQueue`, `filterQueue`, `exposureDollars` helpers. Rationale: a priority you cannot explain is a priority you cannot defend in an operations review, so the UI shows the math instead of asserting a label.
- **`SapProcessIntelligence` rebuilt as a workbench:** h2 is now "Work the book of orders." Queue board of 7 synthetic orders (button rows, aria-pressed plus a visible "selected" word), filter All / Has exception / Clean and sort Score / Age / Exposure via `Segmented`, top scorer selected on mount (Bellwood, score 31). A "Why this score" panel itemizes the four factors with points and plain-language detail, plus a collapsible "How the queue is ranked" rubric. Selecting an order snaps the stage spine to its stage, preselects its exception, and names the order's customer, PO, and product in the stage detail header; prev/next stepping inspects stages without changing the selection. Clean orders get a calm no-open-exception state. Per-order `nathanCall` renders inline in the chapter's existing Nathan's-read pattern (no new `<OperatorNote>` instances).
- Verified on the combined tree after the parallel Ops Dashboard stream finished: `tsc -b --force` exit 0, `npx vite build` exit 0, `verify:data` PASSED, scans clean for arrows, underlined links, and SAP implementation claims.
- **Governance flag:** `<OperatorNote>` placements across the site now number about 8 (War Room, Customer Master, Ops Dashboard additions) against the documented cap of 6 in CLAUDE.md. Not resolved here; needs an owner decision on which notes to keep.

## 2026-07-08 — Ops Dashboard: openable case cards, fuller queue, orphan cleanup
- **Seed queue rebuilt:** 14 cases, exactly two in every lifecycle stage, so Resolved and Improvement review are no longer empty. Each account has a distinct problem written the way that account would word it, drawn from real CPG account-service patterns: an accepted 850 with no order confirmation (the order does not exist in the ERP yet), a signed feature agreement billed at list, an OTIF penalty disputed with a clean ASN scan, a detention charge against a BOL showing the driver arrived outside the window, a spring promotion funded twice (off-invoice and again as a bill-back), and a cost change that never reached the price file and billed three weeks of invoices at the old cost. All four deduction types are represented (shortage, compliance, freight, trade promo).
- **Each case opens its own card:** clicking a card raises a modal (`role="dialog"`, `aria-modal`, Escape to close, focus moved in and returned to the card) showing the account's inquiry as a pull quote with attribution, the stage narration, case facts, routing, service targets, deduction backup, and the upstream fix. The distant bottom detail panel is gone. A "Move to stage" select lives in the modal footer as well as on every card.
- **Orphan cleanup:** the parallel "Operator Notes are always on" change removed `operatorNotesEnabled` from the store but left `components/employer/OperatorNotesToggle/` behind, which no longer type-checked. Deleted it, along with the already-unmounted `components/employer/StoryFloater/`. `tsc -b --force` exit 0 afterward.
- Verified full `npm run build` exit 0 (Linux, fresh install) and `verify:data` PASSED.

## 2026-07-08 — Ops Dashboard: a draggable case board at `#/ops`
A manager's operations board, reachable from the mega nav (Account Support group).
- **Routing without a router:** new `src/lib/router/useHashRoute.ts`. FireFlow's nav is built from in-page anchors, so a "page" route is namespaced under `#/` (which can never collide with `#portfolio` etc.). `App.tsx` renders `OpsDashboard` at `#/ops`, `HomePage` otherwise. No router dependency, no Vercel rewrite needed.
- **New `src/data/seedCases.ts`:** 10 synthetic account cases spread across the lifecycle, drawn from the Asian-American grocery channel (short shipments, promo price mismatches, an OTIF chargeback, an EDI deduction, a reset inquiry, a standing order). Each carries the account's own wording of the inquiry.
- **New `OpsDashboard`** (`src/components/ops/OpsDashboard/`): queue-health stats (open, high or critical, open deductions, average open age, closed), filters by priority and internal owner, a seven-column kanban by lifecycle stage with cards sorted by priority, and a detail panel showing stage narration, case facts, routing, service targets, and deduction backup.
- **Drag and drop, with a keyboard equal:** cards are HTML5-draggable between columns. Because drag is not operable by keyboard or assistive tech, every card also carries a "Move to" select that performs the identical `SET_CASE_STAGE` dispatch, and moves are announced in an `aria-live` region. Drop targets are marked with a dashed edge plus a surface change, never color alone.
- **Seeding vs clearing:** `INITIAL_STATE.routedCases` is the seed queue, so a first visit lands on a worked board. `loadPersisted` distinguishes "never had a board" (seed it) from "cleared the board" (respect it) with a `hasOwnProperty` check. Seeded cases re-attach their account, product, reference, and inquiry text from code via `attachSeedDetails` after hydration, since those fields are deliberately never persisted.
- **Honesty:** the inquiries are fabricated, not real. Retailer banner names are used illustratively the way a case study names a company, with an explicit on-page disclaimer plus a footer stating no affiliation with Samyang or any retailer named. No real customer, order, price, quantity, or metric appears.
- Verified `tsc -b` exit 0 and full `npm run build` exit 0 (Linux, fresh install). Scans clean for arrows and underlined links.

## 2026-07-08 — Intake and Resolution Simulator are now one system (live case board)
Routing a case in the Account Support Intake no longer evaporates at the confirmation screen. The case lands on a live board in the Resolution Simulator, carrying the owner, SAP SD object, EDI document, priority, and service target it was routed with. Intake creates the case; the simulator resolves it.
- **New `src/data/caseBoard.ts`:** the `RoutedCase` model, the seven-stage governed `LIFECYCLE` (Reported, Verified, Routed, Resolution proposed, Customer updated, Resolved, Improvement review), `deriveCase` (rebuilds all display data from the taxonomy given only ids), `stageDetail` (stage-aware narration), `verifiedFacts`, and `formatAge`.
- **Store (`homeStore.tsx`):** added `routedCases` and `selectedCaseId` with `ROUTE_CASE`, `SELECT_CASE`, `SET_CASE_STAGE`, `ADVANCE_CASE`, `CLEAR_CASES`. Board capped at 8 cases, newest first, re-routing a reference replaces it. `RESET` clears the board.
- **Privacy by construction:** `stripCase` persists only identifiers (id, createdAt, role, categoryId, priority, channel, deductionTypeId, stageIndex). Free text a visitor typed (account, product, references) stays in memory for the session and is never written to localStorage, honoring the existing "inquiry text is never stored here" rule. On reload a case re-derives those fields from synthetic prefill. `parseCases` validates every persisted field before trusting it.
- **New `CaseBoard` component** (`src/components/home/CaseBoard/`), mounted at the top of `#simulate`: case chips with reference, category, and current stage; a service clock showing acknowledge target, resolution target, and metric at risk; a clickable seven-stage timeline; and **progressive panels that unlock as the case advances** (verified facts at stage 1, ownership and the SAP object at 2, deduction backup at 3, customer commitment at 4, root cause and corrective action at 6). This fixes the old simulator's core weakness, where every panel was fully revealed from the first frame so nothing actually progressed.
- **Live case age** via a 30-second tick ("opened 3 minutes ago"), labeled an illustrative clock. No fake breach states.
- **SupportBar:** `submitCase` dispatches `ROUTE_CASE`; the confirmation gains a "Work this case in the Resolution Simulator" jump link. The curated scenario picker is relabeled "Reference scenarios" and kept below the live board.
- Verified `tsc -b` exit 0, full `npm run build` exit 0 (Linux, fresh install), `verify:data` PASSED. Scans clean for arrows, underlined links, and persisted free text.

## 2026-07-08 — Order-to-Cash: single scenario replaced by multi-order triage queue
Reworked the Order-to-Cash Process Intelligence chapter (`src/components/home/SapProcessIntelligence/`, `#o2c`) from a single fixed synthetic case into a filterable, sortable Order Queue. Trigger: site-owner feedback that the fixed-scenario version (Northgate Grocers, Buldak Carbonara, a promo-price-mismatch exception, walked across 7 SAP SD stages) read as an educational walkthrough rather than a working tool.
- **Order Queue:** 7 synthetic orders spread across different SAP SD flow stages and exception types (was one order). Filterable All / Has exception / Clean and sortable by priority (customer impact, dollar exposure, SLA age).
- **Selecting an order** loads its case into the existing flow-stage and exception-detail panels — the stage-by-stage UI and exception explorer are reused, not rebuilt.
- **New `<OperatorNote>` instance** framing Nathan's triage philosophy (how he'd prioritize a real queue), bringing the site-wide Operator Notes total to 6 (the documented cap). Per-order "Nathan's read" micro-notes reuse the chapter's existing gated inline-note pattern.
- **Why this over polishing the single scenario:** a queue demonstrates triage judgment on multiple live cases at once, closer to what the role actually does, instead of narrating one case end to end.
- Built in a parallel work stream (isolated worktree); this entry records the design decision and mechanics. Verify `tsc -b` and the honesty/style scans on merge before treating it as shipped.

## 2026-07-08 — Operator Notes are always on; notes toggle removed from the nav
Operator Notes stop being a preference and become part of the product, freeing the crowded mega-nav bar.
- **State removed, not pinned:** deleted `operatorNotesEnabled` from `HomeState`, `INITIAL_STATE`, `RESET`, and the persisted payload, along with the `SET_OPERATOR_NOTES` and `TOGGLE_OPERATOR_NOTES` actions. A pinned-true flag would have left dead state and a permanently-true branch in three components; removing it deletes the branch entirely. Hydration now ignores any stored `operatorNotesEnabled`, so a returning visitor who once opted out still sees the notes.
- **Gates deleted:** `OperatorNote` no longer calls `useHome` at all (it always renders); `SapProcessIntelligence` renders "Nathan's read" unconditionally and dropped its now-unused `useHome` import; `SupportBar` dropped `notesOn` and its three guards, keeping only `dispatch` from the store.
- **Nav decluttered:** removed `<OperatorNotesToggle>` from both the desktop bar and the mobile drawer, and deleted `components/employer/OperatorNotesToggle/` (component + module CSS). `SoundToggle` is now the only global control, so the five group labels no longer wrap to two lines.
- **Intro is one entrance:** the cover's two buttons ("Enter FireFlow" = notes off, "Explore with Nathan" = notes on) collapse to a single "Explore with Nathan" that dispatches `DISMISS_INTRO`. Rewrote the body and hint copy, which previously promised "You can turn them on or off any time" — untrue once the toggle is gone.
- **CLAUDE.md updated** so the fourth-wall rule no longer references `operatorNotesEnabled` or "usable with notes off."
- Verified `tsc -b` exit 0; zero remaining references to the flag, action, or component.

## 2026-07-08 — Sticky rail no longer hides under the nav + toolbar shows product type
Two fixes to the sticky header stack and the catalog toolbar.
- **Sticky rail (`--nav-h` measured, not assumed):** `tokens.css` hardcoded `--nav-h: 64px`, but the nav bar is taller whenever its labels wrap to two lines ("Order & Buy", "CX Intelligence"). The SelectedProductRail sticks at `top: var(--nav-h)`, so it parked too high and the higher-z nav (`--z-nav: 30` over `--z-rail: 20`) painted over its top edge on scroll. New hook `src/lib/layout/useStickyHeightVar.ts` publishes live border-box heights to `:root` via ResizeObserver. MegaNav measures `.bar` (not `<nav>`, whose in-flow mobile drawer would report an 80vh height) into `--nav-h` with `+1` for the bottom border; SelectedProductRail measures itself into `--rail-h`. `--sticky-h` and every `scroll-margin-top` derived from it now stay correct at all breakpoints and zoom levels. Token defaults remain the pre-hydration fallback; the hook removes its inline property on unmount.
- **Catalog toolbar was showing the wrong facet:** the visible quick-filter row was labeled "Type" but rendered `CATEGORIES` (Stir-fry Noodles, Soup Noodles, Protein Pasta, and so on). It now renders `ALL_PRODUCT_TYPES` from `data/spiciness.ts` — Pouch Noodles (36), Cup Noodles (7), Sauces (3), Snacks (6) — wired to the already-existing `model.types` / `toggleType` / `facetCounts.types`. Counts verified against `FAMILIES` (45 families; a family can carry both Pouch and Cup, so the facet sums to 52). The finer category facet stays available in the Filters panel.
- Verified `tsc -b` exit 0; no arrows or em-dash separators introduced.

## 2026-07-08 — Wave C: fourth-wall note panel + obangsaek layer
Implemented Wave C of `docs/recommendations/00-MASTER-BUILD-PLAN.md` (Recs 06 and 05).
- **New `NoteTeaser`** (`src/components/employer/NoteTeaser/`): a slim, collapsible fourth-wall bar pinned in the drawer's note dock. Shows a case-aware one-line hook. `aria-expanded` plus `aria-controls`; state carries a word and a glyph, never color alone.
- **New `OperatorNotePanel`** (`src/components/employer/OperatorNotePanel/`): the full "Nathan's Notes" reading. On screens 1100px and wider it renders **outside the support drawer**, anchored to the left edge, in the cool serif operator voice, so the commentary is visibly separate from the product. Below 1100px it renders `inline` in the dock instead (there is no room beside the drawer). Focus moves to it on open; Escape and "Close note" collapse it and return focus to the teaser.
- **Dialog semantics moved to the overlay** in `SupportBar.tsx` so the left panel lives inside the modal subtree and stays reachable to screen readers under `aria-modal`. The focus trap now spans the drawer and the panel. Escape collapses the note first, then closes the drawer.
- **Note content lifted into a single builder** (`noteContent`), so the teaser hook and the panel body come from one source. It now deepens with the case: pre-fill note, likely scenario, fix it upstream (deduction root cause when a deduction type is chosen), handle the customer, **service target** (from Wave A), **SAP SD object (aligned)** with a hoverable reference (from Wave B), and **before the window closes** with the required backup (from Wave B).
- **Collapse default:** the note starts collapsed on the Details step (longest form) and expands on the routing step. New `useMediaQuery` hook (`src/hooks/useMediaQuery.ts`).
- **Obangsaek layer (Rec 05):** added the `OBANGSAEK` dictionary to `src/data/glossary.ts` (cheong 청, jeok 적, hwang 황, baek 백, heuk 흑, each with direction, element, season, and meaning; hedged where sources diverge on jeok/hong and blue/green). New `FiveColors` section (`src/components/home/FiveColors/`) rendered after Brand Universe, reading the FireFlow palette against obangsaek and labeled a personal design reading, not Samyang brand doctrine. Swatches are decorative; every color is named in text.
- **Panel is a bottom-left card:** the out-of-drawer note is pinned to the bottom-left and sizes to its own content (`max-height: min(72vh, 640px)`, scrolls past that) rather than centering and stretching to match the drawer height. Full border radius, since it now reads as a separate card. Slide-up entrance, reduced-motion safe.
- Verified `tsc -b` exit 0; scans clean for arrows, underlined links, SAP implementation claims, and nested button-in-anchor. Reduced-motion handled in both new components.

## 2026-07-08 — Wave B: SAP SD object mapping, EDI channel, deduction depth
Implemented Wave B of `docs/recommendations/00-MASTER-BUILD-PLAN.md` (Recs 02, 03, 04).
- **Glossary expanded** (`src/data/glossary.ts`): added `SAP_GLOSSARY` (VA03, VA01 (CR), VK13, VL03N, VF03, BP / KNVP, ATP, IDoc) and `EDI_GLOSSARY` (850, 855, 856 ASN, 810, 820, 846, 997, SPS Commerce, GS1-128 label). All conceptual, sourced in the rec docs.
- **Taxonomy extensions** (`intake.ts`), kept as id-keyed lookups so the category tables stay readable: `SAP_OBJECT` (case type to SD object plus reference), `EDI_REF` (the EDI document most in play), `O2C_LINK` (which cases jump to the order-to-cash chapter), `isAccountRole`, the `ChannelId` ladder (EDI, retailer portal, email or phone), and `DEDUCTION_TYPES` (trade-promo, shortage/OS&D, pricing, compliance/OTIF, returns, freight) each carrying validating team, dispute window, required backup, root cause, and typical validity.
- **Widget wiring** (`SupportBar.tsx`): account roles now pick an **order channel**, and when EDI is selected the case names the document in play (hoverable). Deduction cases open a **deduction sub-flow**: type pills drive a validity chip (glyph plus word), the validating team, the dispute window (tracked against Deduction Aging), and a required-backup checklist. The routing summary gained **Order channel**, **SAP SD object (aligned)**, and four deduction rows; order/pricing/billing/deduction cases expose an "Open the order-to-cash chapter" jump link (color and weight, no underline; closes without stealing focus so the anchor lands). Nathan's Notes "Fix it upstream" now uses the deduction type's root cause when one is selected.
- Honesty preserved: SAP references labeled "aligned workflow study, not a live system"; windows and validity ranges are industry illustrations, all data synthetic. Verified `tsc -b` exit 0; scans clean for arrows, prose em-dashes, underlined links, nested button-in-anchor, and SAP implementation/tenure claims.

## 2026-07-08 — Wave A: glossary primitive + service-level targets
- **New `GlossaryTerm` primitive** (`src/components/primitives/GlossaryTerm.tsx` + module CSS): accessible inline hover/tap definition. Opens on hover, keyboard focus, and click (click pins); Escape/blur closes and Escape stops propagation so it does not also close the drawer. Affordance is a dotted underline plus a circled marker glyph (colorblind-safe).
- **New `src/data/glossary.ts`** with the `KPI_GLOSSARY` dictionary (Service Level, Fill Rate, On Time Fulfillment, CSAT, Deduction Aging, Billing Accuracy, Case Resolution Time, Data Integrity).
- **Service-level targets:** added `PRIORITY_TARGET` (synthetic acknowledge plus resolve target per priority) to `intake.ts`. The routing summary shows Acknowledge target and Resolution target rows; "Service metric affected" is a hoverable `GlossaryTerm`; the confirmation adds a combined Service target line.

## 2026-07-08 — Sound: on by default + gamified click layer
Reworked the audio layer (`src/lib/sound/sound.ts`) into a warmer, more playful "slot-machine pleasant" feedback system, and made it audible by default.
- **On by default:** `readStoredPreference` now returns true unless localStorage holds an explicit `"off"`; the SoundToggle reads On on first load. Audio still only actually sounds after the first user gesture (browser autoplay rule), so nothing plays on load.
- **Richer palette:** master gain + gentle low-pass bus keeps every voice soft and never harsh. New sounds added (`tick`, `chime`, `coin`, `tab`, `pop`, `toggle`, `sparkle`, `jackpot`); existing core sounds (`select`, `compareAdd`, `stageAdvance`, `resolve`, `modalComplete`, etc.) enriched into bell/coin/shimmer shapes. Optional `detuneCents` gives per-call pitch variation.
- **Global click layer:** `installGlobalClickSound()` (wired once in `App.tsx`) delegates one document-level click listener so every interactive element makes a sound without hand-wiring. It infers a sound from role/tag/variant, tints pitch per section (major-pentatonic hash of the section id) with ±22-cent jitter so bursts feel alive, and de-dupes against bespoke component sounds via a `lastExplicitAt` timestamp (React onClick runs before the document listener). Elements can opt out with `data-sfx="none"` or override with `data-sfx="<name>"`.
- **Accessibility preserved:** honors `prefers-reduced-motion: reduce` (silent), never the sole signal for any state, no autoplay, safe no-op when Web Audio is unavailable. Verified `tsc -b` exit 0; no arrows/em-dash separators introduced.

## 2026-07-08 — Wave A: glossary primitive + service-level targets
Implemented Wave A of the recommendations plan (`docs/recommendations/00-MASTER-BUILD-PLAN.md`).
- **New `GlossaryTerm` primitive** (`src/components/primitives/GlossaryTerm.tsx` + module CSS): accessible inline hover/tap definition. Opens on hover, keyboard focus, and click (click pins); Escape/blur closes and Escape stops propagation so it does not also close the drawer. Affordance is a dotted underline plus a circled marker glyph (colorblind-safe), no motion required.
- **New `src/data/glossary.ts`** with the `KPI_GLOSSARY` dictionary (Service Level, Fill Rate, On Time Fulfillment, CSAT, Deduction Aging, Billing Accuracy, Case Resolution Time, Data Integrity), definitions grounded in `docs/recommendations/01`.
- **Service-level targets in the widget:** added `PRIORITY_TARGET` (synthetic ack + resolve target per priority) to the SupportBar `intake.ts`. The routing summary now shows Acknowledge target and Resolution target rows, and "Service metric affected" is a hoverable `GlossaryTerm`. The confirmation adds a combined Service target line. SynthNote updated to "Synthetic routing and service-level design."
- Honesty preserved (targets labeled synthetic, never a Samyang commitment). Verified `tsc -b` exit 0; style scan clean (no arrows, prose em-dashes, or underline links).

## 2026-07-08 — All-B2B pivot + online bulk-ordering commerce layer
Removed the individual-consumer complaint path and reframed the whole experience as account service and ordering for retailers and distributors, then added a synthetic B2B commerce layer (bulk ordering, quote/RFQ, standing orders).
- **Types (`src/types/domain.ts`):** `UserMode` is now `"explore" | "retailer" | "distributor"` (added `AccountType`). `InquiryChannel` repurposed to `"order" | "quote" | "standing-order" | "account-issue"`. `ProductFamily.consumerQuestions` renamed to `buyerQuestions`. Added the commerce types: `PriceCents`, `LeadTimeBand`, `SyntheticFlag`, `PriceTier`, `OrderableSku`, `OrderLine`, `QuoteStatus`, `QuoteRequest`, `OrderCadence`, `StandingOrderStatus`, `StandingOrder`, `IssueRelatesTo`.
- **State (`homeStore.tsx`):** added the shared client-side cart `orderLines` with `SET_ORDER_LINE` / `REMOVE_ORDER_LINE` / `CLEAR_ORDER`; URL/localStorage mode parsing coerces any stale `consumer`/`vendor` value to `explore`.
- **Data:** deleted `CONSUMER_ISSUES`; `VENDOR_ISSUES` became `ACCOUNT_ISSUES` (channel `account-issue`, `relatesTo` added, plus quote/standing-order rows). Consumer scenarios deleted; vendor scenarios retargeted to `account-issue` (`ACCOUNT_SCENARIOS`). New synthetic files `skus.ts` (21 orderable SKUs with case packs, MOQ, lead-time bands, volume price tiers), `quotes.ts` (RFQ math + samples), `standingOrders.ts` (recurring-order samples). Integrity checks + `DATA_SUMMARY.skus` added; everything carries a synthetic label and `SYNTHETIC_COMMERCE_DISCLAIMER`.
- **New sections:** `OrderBuilder` (`#order`), `QuoteRequest` (`#quote`), `StandingOrder` (`#standing-order`), mounted in `HomePage` after the dossier. Nav gained an "Order & Buy" group; the old "Consumer Care"/"Vendor Support" groups became "Account Support"; footer columns updated.
- **Reworked** `InquiryPaths` into a single account-issue/escalation flow; `InquiryDialog` renders one B2B account case; `CommandCenter` tiles/labels re-cut around order-to-cash relations; `SupportBar`, `ProductDossier`, `ProductSignalHero`, `SelectedProductRail`, `ComparisonLab`, `BrandUniverse`, `HomepageFAQ` re-pointed off the consumer lane.
- Honesty preserved (all commerce data synthetic and labeled; nothing transmitted). Verified `tsc -b` exit 0; visible-copy sweep clean (no arrows, no prose em-dash separators, no underlined links). `vite build` not run here (Linux sandbox native-binary mismatch, per HANDOFF); builds on the Mac/Vercel.
- **Open flag:** `SupportBar/intake.ts` (concurrent work) still defines a "Consumer" role/category; that conflicts with the all-B2B pivot and should be dropped for consistency.

## 2026-07-08 — SupportBar rebuilt as Account Support Intake (5-step SOP flow)
Replaced the old "Need help with a product?" pop-panel (consumer/vendor toggle plus one "Start a case" link) with a governed multi-step intake drawer that demonstrates structured CX intake, categorization, priority, cross-functional routing, and the service metric each case affects.
- **New taxonomy config** `src/components/home/SupportBar/intake.ts`: six roles (Retailer, Distributor, Broker/Sales Partner, Vendor/Supplier, Internal Team, Consumer); per-role category catalogs (account roles share a 10-item catalog; vendor 6; internal 7; consumer 6); four dynamic field sets (order, pricing, shortship, consumer) plus a generic set; and per-category routing (case type, internal owner, supporting teams, service metric, default priority, next action).
- **Rewrote `SupportBar.tsx`** as a FAB ("Open a support case") opening a right-anchored drawer with a 4-node step rail and 5 stages: Role, Category, dynamic Details, internal-style Routing summary, Confirmation with a synthetic `FF-####` case reference. Priority ladder standard/elevated/high/critical rendered with glyph plus word (colorblind-safe), urgency override on order/generic sets, live-computed missing quantity on shortship, light required-field plus email validation, upload placeholders (no backend). Focus trap, Escape, scroll lock, focus restored to FAB, reduced-motion gated. Operator Note ("Intake is the first control point") gated on `operatorNotesEnabled`.
- **Rewrote `SupportBar.module.css`**: drawer, step rail, selectable role cards and category pills, form grid, summary card, confirmation, priority chips, mobile-friendly at 520px.
- Honesty preserved (all synthetic and labeled; nothing transmitted). Verified `tsc -b` exit 0; no visible arrows, no prose em-dash separators, no underline links in the new copy.

### Same day — test-ready pass (prefill, no required fields, dynamic Nathan's read, CTA rename)
- **Editable prefill per category:** each of the 29 categories now carries a synthetic `prefill` sample (account/contact/PO/SKU/prices/quantities/lot plus a realistic customer inquiry in the description). Selecting a category loads the sample into the detail form so the flow can be walked without typing; every field stays editable.
- **Nothing required:** removed the required-field and email validation gate. Step 3 always advances (demo posture).
- **Scenario-specific Operator Note:** "Nathan's read" now adapts to the selected category with four lines: what was pre-filled, the likely scenario, the upstream fix to prevent it, and how to handle the customer. Added `scenario`/`rootCause`/`handling` to each category in `intake.ts`. Still gated on `operatorNotesEnabled`.
- **CTA rename:** Step 3 button "Review routing" is now "Next". Verified `tsc -b` exit 0; style scan clean.

### Same day — fourth-wall voice + pinned notes
- **New "operator" design system** (`src/styles/tokens.css`): a deliberately COOL, editorial-serif token set (`--op-*` colors, `--font-operator` Spectral serif, `--font-operator-tag` mono) that is the opposite temperature of the warm Buldak Night product UI. Any surface where Nathan steps out of the product now reads unmistakably as commentary while keeping authority.
- **`OperatorNote` restyled + renamed** to this system (indigo left rule, slate panel, serif body, mono tag); the tag now reads "Nathan's Notes" (was "Nathan's read"). This applies everywhere the note is used, not just the drawer.
- **`StoryFloater` restyled** to the same operator system for consistency across fourth-wall surfaces.
- **Pinned Nathan's Notes in the drawer:** the note moved out of the scrolling body into a fixed dock between the form and the footer, so it is always visible and never requires inline scroll (the form scrolls above it). Drawer switched from CSS grid to flex column. Gated on `operatorNotesEnabled`.
- **Back button anchored left:** removed the `:only-child` auto-margin so Back stays left-aligned across every step (previously it jumped to the right when it was the only footer button). Verified `tsc -b` exit 0.

## 2026-07-07 — Employer-layer copy refinement (from md pack)
Applied the uploaded employer-layer pack (extracted to `docs/employer-layer-pack/`). The pack's build items (employer intro, Enter/Explore modes, Operator Notes, SAP O2C chapter, role→feature map, Nathan's Read, employer close, honesty line, deployed-on-the-live-link) were already built; this pass adopts the pack's approved wording:
- EmployerIntro → Variant A copy ("independent customer experience operating model… order flow… billing friction…").
- SAP eyebrow renamed to "Order-to-Cash Process Intelligence · SAP SD aligned workflow study"; `SAP_DISCLOSURE` updated to the approved honesty line.
- Added the role-connection line ("customer experience is not only answering messages…") to EmployerEvidence.
- EmployerClose → approved final close, incl. "The goal is not to pretend this is Samyang's system. The goal is to show how I would approach learning, supporting, and improving the real one."
- Two more Operator Notes with approved copy: Consumer Care (InquiryPaths) and Command Center. Total notes now 5 (≤6 cap).
- Verified `tsc -b` exit 0; no arrows/em-dashes in the new copy.

## 2026-07-07 — Post-deploy UX fixes (compare, nav, cards, left rail)
- **Comparison capped at 2** (head-to-head versus): `MAX_COMPARE` 4 → 2; Comparison Lab copy updated to "Compare two products, side by side."
- **Product cards open the profile:** clicking a Portfolio Pulse card now selects the product and smooth-scrolls to its Product Dossier (`#product`) for inspection.
- **Mega-nav submenu opens on hover** as well as click: added `onMouseEnter` on the group buttons and `onMouseLeave` on the whole nav (so moving the pointer down into the panel keeps it open). Click and keyboard still work. (Could not reproduce the reported "submenu doesn't show" in the sandbox browser, which only renders the mobile drawer; hover-open is the reliable desktop fix — verify on redeploy.)
- **New collapsible left CompareRail** (`src/components/home/CompareRail/`): a sticky left tray that appears only when products are added to compare, opens automatically, and can be collapsed by hand to a thin edge tab. Shows the compared products with remove, a "Compare these" jump to `#compare`, and clear. Hidden ≤900px (the compact top rail covers mobile). Verified `tsc -b` exit 0.

## 2026-07-07 — Full-site writing-style sweep + more sound triggers
- **Writing-style sweep (Phase 8):** rewrote ~56 em-dash sentence separators across component copy and data blurbs into sentences/commas/colons per Nathan's pack (40 in components via an agent, 16 in `src/data/*` by the lead); removed the one visible arrow (`Open in simulator →` in CommandCenter); replaced all three hover-underline link rules (`.compare`, `.footerLink`, hero `.textBtn`) with colour changes. Preserved standalone `—` used as "no value" table cells (they aren't prose) and left code comments alone. Whole-repo scan now shows zero visible arrows, zero prose em-dash separators, zero underline-hover links.
- **More sound triggers:** `playSound` wired at product select (PortfolioPulse), compare add (SelectedProductRail, both desktop + mobile panel), resolution advance/complete (ResolutionSimulator: `stageAdvance`/`resolve`), in addition to the earlier SAP stage advance and dialog open. Full vocabulary in use: select, compareAdd, stageAdvance, resolve, modalOpen, confirm.
- Verified: `node_modules/.bin/tsc -b --force` exits 0 across the whole project after all changes.

## 2026-07-07 — Next wave (3 parallel agents): mobile rail, inquiry dialog, sound
Ran three agents with strict file ownership; lead reconciled the shared files. **Full `tsc -b --force` passes (exit 0)** across the whole project after integration — the TypeScript half of `npm run build` genuinely verified here (only `vite`/esbuild bundling still needs Nathan's machine).
- **Mobile compact selected-product rail (Phase 2.3):** at ≤640px the rail collapses to one row (thumbnail + shortened name + mode word + a single expand control with `aria-expanded`/`aria-controls`); the expand opens a disclosure panel with consumer care, vendor support, add to compare, compare count, reset, and format+heat. Escape closes and returns focus to the button. Desktop layout unchanged (CSS-media-query swap). Stays one row at 390px.
- **Inquiry submission dialog (Phase 6):** new `InquiryDialog` opened by a "Submit demonstration inquiry" button in each Two Paths issue. Inherits product/format/mode/issue from state (no re-entry). Consumer and vendor views with a deterministic synthetic case ref (e.g. FF-2047), routing, evidence, SLA, partners, specialist-escalation notice (no medical advice), and a link to the SAP chapter for O2C issues. Real dialog semantics: `role="dialog"`, `aria-modal`, focus trap, Escape, focus restore, body-scroll lock, overlay at `--z-dialog` (60, above the support bar), near-full-height on mobile, reduced-motion aware. States clearly that nothing was transmitted to Samyang.
- **Sound system (Phase 7):** `src/lib/sound/sound.ts` — a dependency-free Web Audio engine, off by default, persisted under `fireflow:sound`, AudioContext created lazily on first gesture, safe no-op when audio is unavailable. Named sounds: select/confirm/compareAdd/stageAdvance/resolve/warning/modalOpen/modalComplete. `SoundToggle` (glyph+word, keyboard, `aria-pressed`) mounted in the nav beside Operator Notes. Lead wired two triggers (SAP stage advance, dialog open); the rest are documented one-line adds. The site is fully usable and information-complete in silence.
- Added `--z-dialog: 60` token. Fixed a pre-existing em dash in the rail's empty-state hint.

## 2026-07-07 — Continuation pass: reliability + employer layer (Explore with Nathan)
Canonical implementation is the React app under `src/`. `preview.html` + `preview-data.js` are a **legacy** single-file demo and are not maintained in parity with newer chapters (SAP SD, employer layer).

**Lane 1 — reliability**
- Repaired `npm run verify:data`: `tsx` was reading the root `tsconfig.json` (a solution file with no `paths`), so the `@/` alias didn't resolve. Added `baseUrl` + `paths` to the root `tsconfig.json` so `tsx` resolves `@/` for the whole data graph. `tsc -b` is unaffected (it builds the referenced configs).
- Fixed dead `#vendor` routes: `ProductDossier` and `ComparisonLab` vendor actions now set `userMode: "vendor"` and route to the shared `#resolve` section. No `#vendor` references remain in `src`.
- Removed invalid nested interactive controls (anchor wrapping `<Button>`): added a `ButtonLink` primitive (an anchor styled as a button, one element) and converted the actions in `ProductSignalHero`, `ProductDossier`, and `InquiryPaths`.

**Lane 2 — employer layer**
- Added `operatorNotesEnabled` + `introDismissed` to the store (persisted; preserved across product `RESET`; new actions `SET_OPERATOR_NOTES`, `TOGGLE_OPERATOR_NOTES`, `DISMISS_INTRO`, `OPEN_INTRO`).
- New `src/components/employer/`: `EmployerIntro` (the "Explore with Nathan" / "Enter FireFlow" cover), `OperatorNote` (reusable "Nathan's read", renders only when notes are on), `OperatorNotesToggle` (quiet nav control, glyph+word, keyboard, aria-pressed), `EmployerEvidence` (`#fit`, capability→feature map), `EmployerClose` (`#why`, with résumé/contact actions gated behind `src/config/employer.ts` so no dead button ships).
- Operator Notes placements (3, within the ≤6 limit), copy from Nathan's writing-style pack: Portfolio normalization, Product Signals continuous improvement, and the SAP chapter's per-stage note (now gated on the toggle). Fixed `→` arrows in the Product Signals lede as part of the copy pass.
- Writing-style pack extracted to `docs/nathan-writing-style-fireflow/` for reference.

Not done this pass (documented for the next wave): mobile compact selected-product rail (Phase 2.3), inquiry submission modals (Phase 6), sound system (Phase 7), and the full-site writing-style sweep (Phase 8). `npm run build` / `npm run verify:data` must be run on Nathan's machine — the sandbox `node_modules` is a macOS esbuild binary and the registry is blocked, so Vite/tsx can't execute here; all changes were statically verified.

## 2026-07-07 — Fable pass: SAP SD / Order-to-Cash chapter (Phase 4)
- New chapter **SAP SD Process Intelligence** (`src/components/home/SapProcessIntelligence/`, anchor `#o2c`), placed between the Resolution Simulator and Command Center; wired into the mega-nav (CX Intelligence group) and footer (Care & Support).
- New data layer `src/data/sapsd.ts`: 23-term SAP SD glossary, an 8-stage order-to-cash document flow (Customer PO → Sales Order → Validation/Hold → Delivery → Goods Issue → Invoice → Payment/Deduction → Resolution), and 11 selectable order exceptions — all referentially verified (Node type-strip check: 0 broken refs).
- Interactive: click a flow node to open its detail (what it represents, data required, owner, what CX watches, where it breaks, evidence, downstream impact, metric) with prev/next stepping; exception explorer marks exceptions tied to the current stage.
- **Accessible glossary tooltips**: each SAP term is a `<button>` with `aria-describedby` (screen readers get the definition on focus), a CSS tip shown on hover **and** keyboard focus, click/tap-to-pin with Escape to close — plus a full always-visible glossary `<details>` so no definition is hover-only. Colorblind-safe: flow states use glyph + step number + label + the words "current"/"completed", never colour alone.
- **Fourth-wall "Nathan's read"** first-person callout on every stage — showcases process knowledge and maps it to his retail customer-operations experience. Honest positioning stated once via `SAP_DISCLOSURE`: process demonstration, not an SAP replica; no claim of Samyang system access or SAP tenure; all orders/customers/amounts synthetic and labeled.

## 2026-07-07 — Fable pass: reliability repairs (Phase 1–2, in progress)
- **Audit:** confirmed production entry point = the Vite/React app (`index.html` → `src/main.tsx`), not the `preview.html` single-file mirror. Reproduced two sticky-layout defects by reading the source.
- **Fixed: selected-product rail was invisible on scroll.** `MegaNav .nav` (sticky `top:0`, z 30) and `SelectedProductRail .rail` (sticky `top:0`, z 20) both stuck to the same `top:0`; once scrolled, the higher-z nav painted over the rail so it vanished. Added `--nav-h`/`--rail-h`/`--sticky-h` tokens and changed the rail to `top: var(--nav-h)` so it sticks directly beneath the nav.
- **Fixed: in-page anchors (incl. #compare / Comparison Lab) landed hidden under the sticky headers.** Sections used an inconsistent `scroll-margin-top` of 64px/72px, but nav+rail together are ~120px. Replaced all 12 hardcoded values across the home CSS modules with `scroll-margin-top: var(--sticky-h)` so every anchor clears both bars.
- Note: `preview.html` (Track A legacy demo) not yet mirrored. Build/test gate (`npm run build`, `verify:data`, Playwright) must run on Nathan's machine — the sandbox `node_modules` is a macOS esbuild binary and the npm registry is blocked here, so Vite/tsx can't execute in this environment.

## 2026-07-07 — Spiciness scale + facets (from buldak.com analysis)
- Analyzed buldak.com/us/product (official 5-level spiciness scale, faceted filters, card anatomy); built a concept preview (previews/spiciness-facets.html) in our dark theme, then integrated into React.
- Added src/data/spiciness.ts (editorial 0–5 map for all 45 families aligned to Buldak's public scale, typesForFamily, SPICE_SOURCE_NOTE), a PepperScale primitive (chili SVG + word, accessible), spiciness badges on Portfolio cards, Spiciness + Type facets in Portfolio Pulse, a Spiciness attribute in Dossier, and a Spiciness row in Comparison. Labeled editorial, not official. Static-verified (0 missing imports/exports/unused; 62 files).

## 2026-07-07
- Completed full source audit: job PDF, product catalog (21 md), assets ZIP (54 PNG / 11 JS / 8 CSS), indexv5.html, Sun Bear template.
- Confirmed 45-family / 76-variant structure across Buldak, Samyang, Tangle, MEP.
- Confirmed build decisions: React+Vite+TS; core-docs-first; Tier-A (6-anchor) MVP.
- Wrote core homepage docs: MASTER build plan, 00 Executive Summary, 04 Job Map, 06 Information Architecture, 08 Ranking & Comparison Model, 09 Interaction Module Map, 10 Selected Product State Model, 12 Visual System.
- Created governance files: PROJECT_STATE, DECISIONS (D-001–D-008), DATA_SOURCES, KNOWN_LIMITATIONS, README.
- Stubbed remaining docs: 01, 02, 03, 05, 07, 11, 13, 14, 15, 16, 17, 18, 19, 20.

### Phase 1 — data foundation
- Scaffolded React + Vite + TypeScript project (strict tsconfig, path alias `@/`, tokens + base CSS).
- Built typed domain model (`src/types/domain.ts`): families, variants, brands, categories, formats, rankings, inquiries, scenarios, sources.
- Authored data: 45 families (`families.ts`), 76 generated variants (`variants.ts`, official facts bound only to sourced formats), 4 brands, 11 categories, 13 formats, 8 ranking views + compute engine (`rankings.ts`), consumer/vendor issue taxonomy (`issues.ts`), 7 synthetic resolution scenarios (`scenarios.ts`), source registry + disclaimers (`sources.ts`).
- Added integrity checks (`data/index.ts`) + verification script (`scripts/verify-data.ts`).
- Verified via Node type-stripping: 45 families / 76 variants / 6 anchors, brand split Buldak 29 / Samyang 9 / Tangle 4 / MEP 3, all cross-references valid, 0 integrity errors, all 8 ranking views compute; honesty rules hold (First-Time Fit + Retail Visibility score anchors only, no guessed values).
- Note: npm registry is blocked in the build sandbox; `npm install` + `npm run build`/`dev`/`verify:data` must be run on Nathan's machine.

### Phases 2–4 — design foundation, shell, hero, rail
- Shared state store (`state/homeStore.tsx`): context + reducer, URL sync (`?product/format/mode/compare`), localStorage for non-sensitive prefs only, returning-user memory, reset.
- Primitives: `Button`, `Segmented` (accessible radiogroup, arrow-key nav), `SourceBadge`/`ConfidenceBadge`/`SyntheticBadge` (never color-alone), `ProductStage` (brand-accented package placeholder by format archetype — honest stand-in until image rights resolved). Plus `useReducedMotion` hook.
- Product Signal Hero (`components/home/ProductSignalHero`): first-visit / product-selected / returning states; brand + role (Explore/Consumer/Vendor) selectors; product picker seeds shared state; four actions (Explore, Compare, Ask as consumer, Ask as vendor); dark surface; responsive; reduced-motion.
- Selected Product Rail (`components/home/SelectedProductRail`): sticky context bar carrying product/format/mode/compare-count through the page; consumer/vendor quick actions; reset.
- Page shell (`pages/HomePage`): skip link, compact header, context trail, main, scaffolded chapter anchors (portfolio/rankings/compare/product/resolve/vendor), footer with independence disclaimer + research date. App root wraps the state provider.
- Verified statically: all `@/` imports resolve, all 7 CSS modules present, strict-TS issues hand-fixed (Dispatch import, CSS custom-property cast). Full `tsc`/`vite` build to be run on Nathan's machine.

### Phases 6–10 — Explore layer
- Portfolio Pulse: brand + category filters, family↔format view toggle (teaches 45→76 normalization), selectable cards wired to shared state, live counts, empty state.
- Rankings Lab: accessible tabs over all 8 ranking views; per-view source + confidence + caveat + last-reviewed; ranked rows with score bars, confidence badges, missing-input markers, Open + Compare actions; "how it's calculated" weights panel; honest "not scored rather than guessed" note.
- Comparison Lab: preset comparisons, up to 4 products, semantic table, hide-matching + difference highlighting, per-column consumer/vendor actions, allergens/prep shown for each product's default format (variant-bound), empty state.
- Product Dossier: format selector rebinds facts; allergens/prep/components/storage/retail-signal per exact variant with source + confidence; "verify the package" wherever format data is absent; related products, consumer/vendor questions (mode-aware), save, inquiry actions, source + last-verified.
- Wired all four into HomePage in IA order (portfolio → rankings → compare → product); resolve/vendor remain scaffolded anchors. 40 source files; imports + CSS modules verified.

### Phases 11–12 — Resolve layer
- Two Paths (InquiryPaths): consumer + vendor columns, pre-populated with the selected product/format (never re-enter); issues filtered to the product's category; on select, shows severity, routing, the Identify→Verify→Evidence→Route→Resolve→Update steps, per-issue evidence "why we ask", and a calm specialist-escalation notice for allergen/injury/tampering issues (no medical advice); mode-aware emphasis; "See this resolved / Start a case" hands off to the simulator. Anchors #resolve and #vendor.
- Resolution Simulator: consumer + vendor scenario pickers; interactive case lifecycle timeline (Reported → Verified → Routed → Resolution proposed → Customer updated → Resolved → Improvement review) with clickable + Prev/Advance stepping; full case attributes (verified facts, evidence, owner, collaborators, update commitment, resolution options, approvals, root cause, corrective action); everything labeled synthetic. Anchor #simulate.
- Wired into HomePage after the dossier; remaining scaffolded anchors now #command / #signals / #methodology. 44 source files; imports, CSS modules, and in-page anchor targets verified.

### Redesign wave — real images + richer interactions (agents)
- Scraped current interactive-CSS-card techniques (freefrontend) for inspiration; catalogued: pointer 3D tilt + glare, cursor spotlight, mask-composite glow borders, hot/cold swap, fanned/bento reveals, Popover-API mega nav, SVG stroke progress.
- Extracted 54 real Samyang product PNGs to public/products/ (normalized names). Agent built src/data/images.ts (IMAGE_BY_VARIANT 49, IMAGE_BY_FAMILY 28, imageForVariant helper) + public/products/manifest.json; 0 missing files.
- 6 parallel agents wrote 10 enhancement specs to docs/enhancements/: mega-nav, footer, product-card, bento-portfolio, sound-heat-card, motion-and-sound-system, hero, dossier, rankings, simulator — each with a runnable recipe, a11y + reduced-motion + sound-consent contracts, and React + vanilla integration notes.
- Rebuilt preview.html as v2: real product photos throughout (hero, bento portfolio cards, rankings thumbnails, compare, dossier, related chips, nav feature); pointer 3D tilt + mask-composite glow product cards; cursor-spotlight hero; accessible mega nav with per-group panels + featured product + mobile drawer; scroll-reveal (IntersectionObserver, reduced-motion aware); animated ranking bars + SVG heat gauge; rich footer with source legend + disclaimer; and "The Heat Dial" — a WebAudio sound-toggle card (muted by default, gesture-gated, localStorage pref) mapping heat expectation to a calm, honest ladder.
- Verified: both script blocks syntax-clean; headless smoke test 13/13 render branches pass (incl. Heat Dial steps + no-image fallback); image paths resolve.

### Design exploration + Buldak Night integration
- Scraped current mega-menu + sidebar pattern galleries; 6 parallel agents produced 3 live preview options each (previews/*.html) + specs (docs/explorations/*.md) for: product listing, comparison, mega nav, side rail, floating support bar, and the UX-kit/theme — all on a striking dark Korean-spicy theme with real product photos.
- Nathan chose: theme "Buldak Night" (near-black + molten red/ember + gold); product listing C (immersive cursor-glow); comparison B (versus/battle w/ animated stat bars); mega nav B (split panel + live preview pane); side rail B (rich context rail w/ photo); support bar C (compact floating status bar).
- Externalized preview data to preview-data.js (template now editable); archived the light "Gochu Pop" build to previews/_archive/.
- Integration agent rebuilt preview.html into the dark Buldak Night skin (no beige) with the 5 chosen components wired into the FF data + state + data-act pipeline, plus a persistent focus-trapped support FAB. Independently verified: app syntax OK; 0 leftover cream hexes; 0 stray ../public paths; 9 string-render branches non-empty + nav/rail/support + full render() run with 0 throws.

### Finish — remaining chapters + final QA (single-file build complete)
- Added the CX-intelligence + trust chapters: CX Command Center preview (drill-down synthetic KPI tiles + case queue), Product Signals (inquiry→pattern→root cause→action→measure loop, 6 signals), Brand Universe (four differentiated brand panels), and FAQ (10 honest answers). Reordered to Explore → Resolve → Command → Signals → Brands → Methodology → FAQ. Nav + footer links updated; all synthetic ops data clearly labeled.
- Final QA on preview.html (118KB): app syntax OK; 13 anchors all resolve (no dead links); new section ids present; headless smoke test 6/6 render paths + full render() with 0 failures.
- PROJECT_STATE updated to reflect two tracks: Track A single-file build = COMPLETE + verified deliverable (preview.html + preview-data.js + public/products); Track B React app = core built, Buldak Night dark-theme + component port pending (needs npm to build/verify).

### React port to Buldak Night (Track B)
- Foundation agent: rewrote tokens.css (dark semantic tokens + compatibility aliases + Anton/Inter @import), base.css (dark-native), and the four primitives' CSS to dark/neo; wired real photos into ProductStage via imageForVariant (additive optional familyId/variantId props).
- Three parallel agents: dark-restyled Explore (Portfolio/Rankings/Comparison/Dossier) + Resolve (InquiryPaths/Simulator) modules and wired product images/thumbnails; built new React components CommandCenter, ProductSignals, BrandUniverse, HomepageFAQ, Methodology, MegaNav (split panel), SelectedProductRail (rich context), SupportBar (floating); reassembled HomePage in IA order with a dark footer.
- Verification (npm blocked here, so static only): fixed the one real build-breaker — added missing `export type UserMode` to domain.ts (the store imported it); confirmed all `@/` imports resolve, every named import has a matching export, 0 unused, all 91 CSS tokens resolve. Final `npm run build` on Nathan's machine is the remaining gate.
