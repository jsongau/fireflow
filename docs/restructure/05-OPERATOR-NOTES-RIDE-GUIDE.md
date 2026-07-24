# 05 — Nathan's Notes as a Guided Tour

The owner's brief: a note on **every section of every page**, reading like the guide on a
Disneyland ride. What this is, why he built it, what it is meant to show, and how a real
Customer Experience manager would resolve the problem in front of you.

That is a good instinct and it is a **deliberate change to an existing rule.** Record it.

---

## The rule this replaces

`CLAUDE.md` and `docs/nathan-writing-style-fireflow/03-OPERATOR-NOTES-VOICE.md` both cap
Operator Notes at **five or six across the main experience**, on the grounds that
"constant commentary" is weaker than a few meaningful notes. `HANDOFF.md` already flags
that the count drifted past the cap; it is now roughly ten.

The cap existed to stop the fourth wall becoming wallpaper. That risk is real and the
audit named it: over-used commentary reads as self-indulgent.

**The resolution is not to abandon the cap. It is to change what a note costs the reader.**
A note that shouts on every section is wallpaper. A note that whispers one line and opens
on demand is a guide.

### The new rule (update `CLAUDE.md`)
> Every section may carry exactly one Nathan's Note. Notes are **collapsed to a one-line
> teaser by default** and expand on demand into the docked panel. No note auto-expands.
> No section carries more than one. The intro cover remains the only automatic fourth-wall
> break.

---

## The mechanism already exists

Wave C of the previous plan built exactly the right primitives. Reuse them, do not invent:

- `src/components/employer/NoteTeaser/NoteTeaser.tsx` — the slim collapsed bar: avatar, the
  label "Nathan's Notes", a one-line case-aware hook, and a Read/Hide control with a glyph
  plus a word. `aria-expanded` and `aria-controls`.
- `src/components/employer/OperatorNotePanel/OperatorNotePanel.tsx` — the expanded reading,
  in the cool indigo serif "operator" voice, rendered **outside** the content it discusses
  (bottom-left card on wide screens, inline below 1100px). Focus moves in on open, Escape
  returns focus to the teaser.
- `src/components/employer/OperatorNote/OperatorNote.tsx` — the always-visible inline card.
  **Use this sparingly now.** It is the loud form.

### Per-section pattern
Each section renders a `NoteTeaser` pinned at its foot (or in its header rail). Activating
it opens the `OperatorNotePanel` for that section. Only one panel is open at a time: lift
`openNoteId` into a small `NotesProvider` context so opening a second note closes the first.

---

## The four questions every note must answer

Straight from `03-OPERATOR-NOTES-VOICE.md`, plus the owner's tour framing. A note is not
finished until it answers all four, in this order:

1. **What is this?** Name the thing in plain operational language.
2. **What problem does it prevent?** The operational truth. Where does this break in real life?
3. **Why did I build it this way?** The design decision and its tradeoff.
4. **How would I resolve it as a manager?** Who owns the next action, what the customer is
   told, and what stops it recurring.

Optionally a fifth line: **Role fit.** One line tying it to the posting. Use it on the
strongest sections only, not all of them, or it becomes a drumbeat.

---

## Voice rules (this is where the last pass failed)

Read `03-OPERATOR-NOTES-VOICE.md` and `08-BANNED-AI-PATTERNS.md` **before writing a single
note.** Not after.

**Banned, and they are seductive:**
- Epigrams and punchlines. "Age is a symptom, not the disease." Anything engineered to be
  quotable.
- The "not X, but Y" reversal, and its cousin "X is not the goal. Y is."
- Triads. Three parallel clauses building to a flourish.
- A closing line that reframes the whole paragraph.
- Abstract praise of the product. Replace with the operating detail.
- Explaining an obvious click.
- The banned word list: seamless, robust, leverage, unlock, elevate, world-class, and the rest.

**The test:** would a real Customer Experience manager say this sentence out loud to a peer
on a Tuesday? If it sounds like a LinkedIn post, rewrite it. Judgment shows through
specifics, not through phrasing.

**Approved shape**, from the pack:
> A hold is not a failure. An invisible hold is. I designed this stage to show the reason,
> the owner, and the next customer update before the delay becomes a service problem.

Flat, first-person, concrete, no wordplay.

**A rewritten example**, showing the failure and the fix:

*Wrong (aphorism mode):*
> I do not work a board from top to bottom. I work it by what expires. Age is a symptom,
> not the disease.

*Right (operating detail):*
> I work the board by what expires first. Deduction disputes carry retailer windows,
> commonly thirty to ninety days, so a chargeback sitting at day fifty-five gets picked up
> before a delivery complaint that arrived this morning. The window closes whether or not
> anyone is looking at it.

---

## Note inventory to write

One per section. Written against the four questions. Cross-reference the section list in
`03-CONTENT-MIGRATION-MAP.md`.

| Route | Sections needing a note |
|---|---|
| `/` | Hero, Portfolio Pulse, Comparison Lab, featured Ops preview |
| `/products` | Rankings Lab, Product Dossier, Brand Universe |
| `/order` | Bulk order, Quote, Standing order |
| `/support` | Open a case, Resolution walkthrough |
| `/ops` | Board-level ("How I work this board"), plus the per-case note in each card modal |
| `/intelligence` | Order-to-Cash, Customer Master, Command Center, War Room, Product Signals |
| `/leadership` | Team, Standards, First 90 days, Track record |
| `/about` | What this demonstrates, Why I built it, Five Colors, Methodology, FAQ |

Roughly 27 notes. Under the old cap that would be indefensible. Under the collapse-by-default
rule it is a tour a reader opts into, section by section.

The `/ops` board note and its per-case notes already exist and are written in the corrected
voice. Use them as the reference standard.

---

## Guardrails that do not change

- Notes are commentary, never product UI, never a system status, never a real Samyang
  annotation. The cool indigo serif system exists to make that unmistakable.
- No SAP implementation or tenure claims inside a note.
- No arrows in visible copy. No em dashes as sentence separators. No underlined links.
- State (open, closed, current) carries a glyph and a word, never color alone.
- Every note is keyboard reachable, Escape closes, focus returns to the teaser, and the
  panel respects `prefers-reduced-motion`.
- One automatic fourth-wall break only: the intro cover. Nothing else auto-expands.
