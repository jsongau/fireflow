# Recommendation 06 — Fourth-Wall Operator Notes (teaser inside, full note outside, on the left)

## Why this exists
Jay's direction: make the operator notes collapsible, and move the detailed version
*outside* the support drawer, to the left, in its own nicely displayed panel, so it
clearly breaks the fourth wall. Inside the drawer we keep only a compact **teaser**;
clicking it opens the full "Nathan's Notes" reading on the left. This separates the
product (the support case) from the commentary (how Nathan thinks), which is the whole
point of the fourth-wall device, and it frees vertical space in the drawer (the note was
crowding the Details step).

## Interaction design
Three states:
1. **Teaser (in-drawer, collapsed default on Details):** a slim bar pinned above the
   footer with the operator avatar, the label "Nathan's Notes", a one-line hook drawn
   from the current case ("Here is how I'd handle this…"), and a "Read the note" affordance
   with an expand glyph. Compact, ~1–2 lines, so the form breathes.
2. **Expanded panel (out-of-drawer, left side):** clicking the teaser reveals a
   left-anchored panel, visually separate from the warm support drawer, in the cool
   serif "operator" system. It carries the full reading: the pre-fill note, Likely
   scenario, Fix it upstream, Handle the customer, plus (when the other recommendations
   land) the SAP object, the service target, and the deduction root cause for that case.
3. **Dismissed:** the left panel can be closed back to the teaser; state persists per
   session.

Fun / interactive touches (kept tasteful, never gimmicky):
- The teaser hook is case-aware and changes as the visitor moves through categories.
- Smooth slide-in from the left edge (respects `prefers-reduced-motion`: no transform,
  just show).
- A subtle "typing/among the stacks" flourish is out of scope; keep it premium and calm.
- The left panel is keyboard reachable and announced; Escape returns focus to the teaser.

## Layout rules
- The left operator panel is a **sibling** of the SupportBar, not a child of the drawer,
  so it is literally outside the support box. On wide screens it sits at the left edge,
  mirroring the drawer on the right; the page content is between them.
- On narrow / mobile screens there is not room for a true left panel beside the drawer,
  so it falls back to the in-drawer expanded note (the current pinned behavior),
  collapsible. Never let the two overlap or cause horizontal scroll.
- It must coordinate with the existing bottom-left `StoryFloater` (same corner family):
  when the operator panel is open, tuck or offset the floater so they do not stack. They
  share the operator palette already, so they read as one voice.

## Collapsible requirement (explicit yes from Jay)
- Notes are collapsible on every step; **collapsed by default on the Details step**
  (where the form is longest), expanded-teaser elsewhere is fine.
- Gated on `operatorNotesEnabled` (the existing toggle). With notes off, neither the
  teaser nor the panel renders, and the drawer works fully.

## How it weaves into the build
- **New component:** `OperatorNotePanel` (the left, out-of-box reading) + a `NoteTeaser`
  (the in-drawer bar). Both consume the same note content the drawer already builds.
- **Refactor:** lift the note content (title + scenario/rootCause/handling, later SAP +
  SLA + deduction lines) into a small builder so the teaser and the panel render the
  same source.
- **State:** a lightweight open/closed piece of local state in SupportBar, passed to the
  panel; or a tiny context if StoryFloater needs to coordinate.
- **Styling:** reuse the `--op-*` operator tokens and the serif voice; the panel gets a
  slightly richer treatment than the inline card (it is now a feature, not a footnote).

## Accessibility
- Teaser is a `<button aria-expanded>` controlling the panel via `aria-controls`.
- Panel is `role="dialog"`/`aria-label` or a labeled `region`; focus moves in on open,
  Escape closes and returns focus to the teaser; visible focus throughout.
- Colorblind-safe: expand/collapse shown with a glyph + word, not color.

## Acceptance criteria
- On Details, the drawer shows only the compact teaser by default; the form has room.
- Clicking the teaser opens the full note in a left-side panel, clearly outside the
  drawer, in the cool serif voice.
- The panel is case-aware and updates as the category changes.
- Keyboard + reduced-motion + colorblind checks pass; no horizontal overflow at 1440,
  1280, 1024, and mobile widths.
- With `operatorNotesEnabled` off, nothing renders and the flow still works.
- `tsc -b` green; style sweep clean.

## Dependencies
- Content depth grows once Recommendations 01, 02, and 04 land (SLA line, SAP object,
  deduction root cause). Build the panel to accept those optional lines from the start.
