# Session handoff — 2026-07-09, layout shell and navigation

Written for the next agent picking up FireFlow in a fresh account. Read this,
then `CLAUDE.md`, then `HANDOFF.md`, then `CHANGELOG.md`. This file covers what
changed on 2026-07-09 in the layout/navigation session and the traps that came
with it. It does not replace the standing rules in `CLAUDE.md`.

---

## 0. Read this first: repository state

**The work is on disk. It is not in git.**

- Last commit: `44bb940` (2026-07-08) "Add CLAUDE.md + HANDOFF.md; SAP chapter,
  employer layer, dialog, sound, left rail, style pass"
- Working tree at time of writing: 199 changed paths (25 modified, 68 untracked,
  plus staged adds and two deletions).
- Remote: `https://github.com/jsongau/fireflow.git`, branch `main`.

**If you clone from GitHub you will get code from 2026-07-08 and none of this.**
Work from the folder on disk (`~/Claude/Projects/Samyang`), or commit and push
first:

```bash
cd ~/Claude/Projects/Samyang
git add -A
git commit -m "Page shell gutter, full-bleed mega nav, rich dropdown, spine rails, compact footer"
git push origin main
```

This is also why the deploy command must **not** connect the git repo when it
offers: `vercel` uploads the working tree (`gitDirty: 1` on every recent
deployment), and linking git would ship the stale commit instead.

### Concurrent writes — verify before you trust

During this session, `DECISIONS.md` was modified at `18:27Z` and a CHANGELOG
entry ("The account is semi-active, and the page does not say why", plus decision
`D-012`) appeared **above** the entry this session wrote. Neither was written by
this session. Another agent or session was writing to the same folder at the same
time.

Files touched by that other work, not by this session:
`src/pages/AccountPage.tsx`, `src/pages/AccountPage.module.css`,
`src/data/accounts/ranch99.ts`, `src/data/sectionNotes.ts`,
`src/components/ops/OpsDashboard/*`, `src/components/ops/FeaturedCase/FeaturedCase.tsx`,
`src/components/navigation/SubNav/SubNav.tsx`, `src/lib/layout/useStickyHeightVar.ts`,
`DECISIONS.md`.

Before building on anything in this document, run `git status` and `git diff` and
confirm the tree is what you expect. Do not assume one session owns the folder.

---

## 1. Deploy: the command that works, and the one that silently does not

Live: **https://samyang-xi.vercel.app**
Project `samyang` (team `cover-capy`), framework `vite`, source `cli`.
Current production deployment: `dpl_7FpEb5Yt8TbWTPHs7YwAVKCFra3T`, created
`1783624014`, CSS bundle `index-CHy2qZDp.css`.

```bash
cd ~/Claude/Projects/Samyang && npx -y tsc -b --force && npx -y vercel@latest --prod
```

**The `-y` is not optional.** Without it, `npx` prints:

```
Need to install the following packages:
vercel@55.0.0
Ok to proceed? (y)
```

That prompt eats the next line of stdin. If anything follows on the clipboard or
in a chained paste, npm reads it as "not y", prints `npm error canceled`, and
**exits zero-ish without deploying**. Two deploys were lost to this before it was
spotted. The failure is silent unless you read the output.

### How to prove a deploy actually shipped

Do not trust "Ready in 29s". Compare the deployment's `createdAt` against the
newest file in the tree:

```bash
DEPLOY=1783624014   # from the Vercel API / MCP get_deployment
find src -type f -newermt "@$DEPLOY" | wc -l   # must be 0
```

Then fetch the production stylesheet and grep it for a string that only exists in
the new code. For this session's change:

```
--shell-max: min(1120px, calc(100vw - 2 * var(--gutter-reserve)))
```

A build lacking that line is the old build, regardless of what the CLI said.

Note: `npm run build` and `npm run verify:data` fail in a Linux sandbox when
`node_modules` was installed on macOS (rollup/esbuild native binary mismatch).
`tsc -b` runs anywhere and is the portable gate. Vercel builds on its own Linux
servers, so the mismatch never reaches production.

---

## 2. What changed today

### 2.1 The page shell now has a gutter

**Problem.** Twenty CSS modules each hardcoded `max-width: 1200px`. At a 1300px
viewport that leaves 50px of gutter per side, and the 220px MiniNav had nowhere
to go but on top of the content. It was covering the Order summary card.

**Fix.** The content column is now one token, declared once in
`src/styles/tokens.css` and read by every section wrapper:

```css
:root {
  --shell-max: 1200px;
  --shell-pad: var(--space-4);
  --spine-w: 60px;        /* derived, see 2.3 */
  --gutter-reserve: 84px; /* spine + 12px offset + 12px scrollbar buffer */
  --nav-pad: clamp(16px, 2.4vw, 40px);
}

@media (min-width: 900px) {   /* the tray breakpoint */
  :root {
    --shell-max: min(1120px, calc(100vw - 2 * var(--gutter-reserve)));
    --shell-pad: var(--space-3);
  }
}
```

The page yields gutter before it yields anything else. Side padding tightens at
the same breakpoint because the margin is doing that work now.

**Invariant: never reintroduce a hardcoded `max-width: 1200px`.** Grep for it
after any layout change. The one deliberate exception is
`SelectedProductRail.module.css` `.compact`, which keeps `var(--space-3)`
horizontal padding below 640px because it is a control strip that wants the
pixels; it is commented in place.

### 2.2 The MegaNav is full bleed

`.bar` and `.panelInner` no longer share the content column. They are `width:
100%` and inset by `--nav-pad`. The bar is chrome, not content, and the full
width is what buys room for every group label on one line.

**"Account Support" was wrapping** onto a second line and making the bar taller
than its siblings. Fixes: `white-space: nowrap` on `.groupBtn`, a font/padding
step-down under 1240px, and `.brandTag` hidden under 1120px. Every group stays on
one line from 1920px down to the 860px drawer cutoff.

**Invariant: MegaNav does not use `--shell-max`. Group labels never wrap.**

### 2.3 Both gutter trays rest as spines

`MiniNav` (right) and `CompareRail` (left) were always-open panels, 220px and
280px. Both now rest at `--spine-w` (60px) and widen on `:hover`,
`:focus-within`, or `.railPinned`. Expansion is pure CSS; React holds only the
pin. MiniNav persists its pin to `localStorage` (`fireflow:mininav`; the old
`"open"` value migrates to pinned). CompareRail's pin is session-only.

`--spine-w` is **derived, not chosen**:

```
2px rail border + 2 x 8px body padding + 8px link padding
  + 24px marker column + 8px column gap = 60px
```

If you change any of those five terms, recompute `--spine-w` and
`--gutter-reserve` together. The 32px CompareRail thumbnail fits with **zero
tolerance**.

Collapsed, the CompareRail spine still shows the product thumbnails it holds,
above the count. A comparison tray that cannot say what is in it is not worth the
pixels.

**Three traps, all now commented in the source. Do not rediscover them:**

1. **A flex `gap` is drawn between siblings clipped to zero width.** Two live
   gaps pushed the 32px thumbnail 16px past the spine edge. The gap has to
   collapse too (`.item { gap: 0 }`, restored on expand).
2. **A `margin` declared later in the file beats the collapse rule on source
   order.** `.title` and `.hint` had to drop their base margins and let the
   expanded-state rules (`.rail:hover .title`, higher specificity) own them.
3. **`overflow-y: auto` on the collapsed body is a trap.** A classic scrollbar
   appearing would eat the horizontal space and clip the thumbnail. Collapsed
   body is `overflow: hidden`; scrolling returns on expand.

**Accessibility invariant.** Collapsed content is *clipped*
(`max-width: 0` / `max-height: 0` + `overflow: hidden`), never `display: none` or
`visibility: hidden`. That keeps every label and control in the accessibility
tree, so a screen reader reads the same list a sighted user sees expanded. This
is also why expansion must trigger on `:focus-within` and not on `:hover` alone:
it guarantees a control can never take focus while it is invisible. The spine
header prints `4/5` as its one visual cue; the full "Section 4 of 5" readout is
`.srOnly`.

### 2.4 The MegaNav dropdown argues for the click

The right pane was a title and one blurb. That tells a visitor what a section is
*called*, never why to open it.

`src/data/nav.ts` gained a `NavDetail` interface. `NavSection` and `NavGroupItem`
both extend it, and `detailOf()` copies the payload through `resolveRef()`:

| field | job |
|---|---|
| `kicker` | what kind of thing this is, two or three words |
| `sub` | one line under the label **in the list**, so the list is scannable without hovering |
| `blurb` | the one-line promise, shown large in the preview |
| `proof` | two or three concrete specifics the visitor can verify on arrival |
| `cta` | the named action, matching what happens next |

All 25 nav destinations carry all five. Verified: zero thin cards.

**The `proof` list is where the synthetic-data and no-SAP-implementation
disclosures now live**, beside the claim they qualify, rather than appended to a
paragraph. Example, `/intelligence#o2c`:

> ▪ Score an order on four visible factors, with the arithmetic shown
> ▪ Exceptions mapped to the SD objects they actually touch
> ▪ A workflow study aligned to SAP SD. Not an implementation.

**Invariant: a new nav destination without `proof` and `cta` renders a thin card.
Fill all five fields. Put the disclosure in the last proof line.**

Bullet glyph is `▪` via `::before`, not an arrow — arrows are banned in visible
copy (`docs/nathan-writing-style-fireflow/`).

`sop-register` was given a door: it had full copy and was reachable only from the
in-page SubNav, despite being the register the escalation ladder routes into. It
is now the third item in the Leadership dropdown, which brings that group to five.

### 2.5 The footer is compact

It declared `repeat(4, 1fr)` and had five columns, so the fifth silently wrapped
to a second row. Now five columns beside the brand block, padding 64px down to
32px, and the independence disclaimer shares one `.footerMeta` row with the
research-snapshot date instead of each taking a full-width line.

---

## 3. Verification performed, and what was not

**Passed.**
- `tsc -b` exit 0, repeatedly, including after every edit.
- All 25 `NAV_GROUPS` destinations resolve to a route/section carrying `kicker`,
  `sub`, `blurb`, `proof` (≥2 lines), and `cta`. Zero thin cards.
- Class parity both directions on MegaNav, MiniNav, CompareRail, SiteFooter: no
  `styles.X` without a CSS class, no orphaned classes.
- Style sweep on all new copy: no arrows, no em dashes as sentence separators, no
  banned words from `08-BANNED-AI-PATTERNS.md`, no "from X to Y" openers.
- Spine box math confirmed against the global `box-sizing: border-box`.
- `prefers-reduced-motion` covers every transitioning property on both rails.
- Zero `max-width: 1200px` remaining in `src/`.
- Production CSS bundle contains both `--shell-max` declarations.
- Deployment `createdAt` is newer than every file in the tree.

**Not verified. This is the open item.**

Nobody has *looked* at the deployed page. Chrome was blocked from the domain by
policy on the machine running the agent, so verification stopped at build
artifacts. Confirm visually at 1280px and 1440px, after a hard refresh
(`Cmd+Shift+R` — the old stylesheet is cached):

1. Mega nav: every group label on one line, bar is one row tall.
2. Both spines sit clear of the content column. The Order summary is uncovered.
3. Hovering a nav group renders the preview card: kicker, title, blurb, proof
   list, CTA button. Hovering a *different* item in the list swaps the card and
   moves the accent bar on `.catLinkActive`.
4. Footer's five columns land in one row.
5. Add two products to compare: the CompareRail spine shows both thumbnails and
   the count, and widens on hover without jumping.

If a spine still overlaps content at some width, `--gutter-reserve` is the single
knob. Raise it; `--shell-max` follows automatically.

---

## 4. Standing rules this session did not change

Restated because they are easy to break from a layout change:

- **Honesty.** No SAP implementation, integration, or tenure claims. No real
  Samyang data, customers, orders, or metrics. Synthetic data stays labeled.
- **Writing style.** No arrows in visible copy (`→ -> ↗`). No em dashes as
  sentence separators (a lone `—` as a "no value" table cell is fine). No
  underlined links: color and weight only. Plain American English. CTAs name the
  action. Grep-sweep after any copy edit.
- **Accessibility.** Nathan is colorblind. Never signal state by color alone; add
  a glyph, word, or shape. In this session: `.catLinkActive` pairs its background
  with an inset 3px accent bar, and the active nav group pairs `font-weight: 800`
  with an inset gold bar.
- **Fourth wall.** Broken only at the intro and in Operator Notes. Notes are
  always on, collapsed to a `NoteTeaser` by default, one per section, one panel
  open at a time. Before writing one, read
  `docs/nathan-writing-style-fireflow/03-OPERATOR-NOTES-VOICE.md` and
  `08-BANNED-AI-PATTERNS.md`.
- Never nest `<Button>` inside `<a>`; use `ButtonLink`. `MAX_COMPARE = 2`.

---

## 5. Suggested next steps

1. **Commit and push.** Nothing above survives a fresh clone until you do.
2. Do the visual pass in section 3. It is the only thing standing between this
   work and "verified".
3. Resolve the concurrent-writer situation before two accounts edit this folder.
4. Optional: `preview.html` + `preview-data.js` are a legacy single-file demo,
   long out of sync with the React app. Delete them or stop maintaining them.
