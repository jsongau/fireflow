# Comparison UI exploration (Options A / B / C)

Design exploration for FireFlow Product Intelligence, the independent portfolio built for the
Manager, Customer Experience application at Samyang America. The brief: show three genuinely
different ways to compare two or three Buldak products across photo, brand, heat, creaminess,
formats, allergens, serving style and first time fit.

- Preview file: `previews/comparison.html` (self contained, opens with no build step)
- Theme: the striking dark Korean spicy re-skin. Charcoal and near black surfaces, molten Samyang
  red and ember, with gold, jade and cobalt as controlled secondary accents (an obangsaek nod).
  No beige. Warm off white text. A `매운맛` chip and a five colour obangsaek dot cluster carry the
  Korean flourish; Anton and Black Han Sans supply the bold condensed display type with a system
  fallback.

## Data honesty (applies to all three)

This is the part that matters most for a food brand, and it is the same rule the production data
layer already enforces in `src/data/variants.ts`.

- **Allergens and preparation are bound to the exact format.** The values shown are the Multi pack
  statement. Carbonara, Original and 2X Spicy carry official allergens on file
  (`wheat, soy, milk` for the carbonara line; `wheat, soy, sesame` for Original and 2X Spicy).
  Where a format has no confirmed data, the UI says **Verify the current package** rather than
  guessing. Preparation is a live example: Carbonara and Original Multi have official steps, while
  Cream Carbonara, Quattro Cheese and 2X Spicy Multi honestly show the verify state.
- **No invented Scoville numbers.** Heat is expressed as the brand's positioning words
  (Moderate, Very hot, Extreme). For the battle bars those words are placed on a fixed 1 to 5
  ladder, and the label always says "positioning, not Scoville" so the ordering is never mistaken
  for a measured spice figure.
- **Editorial scores are labelled editorial.** Creaminess (0 to 5) and first time fit are our read,
  not a lab result, and every surface that shows them carries the editorial tag.
- A shared legend at the top defines the three states (official, editorial, verify) once, so the
  meaning travels with the reader across all three options.

---

## Option A. Side by side spec table

**Concept.** The classic three column spec sheet, tuned for the real support problem: the creamy
Buldak trio (Carbonara, Cream Carbonara, Quattro Cheese) looks almost identical on the shelf, so
the job is to surface what actually separates them. A sticky product header row keeps the photos
and names in view while the attribute rows scroll underneath.

**Technique.**
- Semantic `<table>` with a `<caption>`, `scope="col"` on every product header and `scope="row"` on
  every attribute label.
- Two toggles. **Highlight differences** adds a Same or Differs flag to each row and a left accent
  bar on differing rows. **Hide matching rows** drops rows whose values are identical across all
  three, leaving only the decision relevant facts.
- Same or different is computed from a text only comparison key per attribute, independent of the
  rich rendered cell.

**Accessibility.** Real table semantics give screen readers row and column context. The
scroll region is a focusable `role="region"` with a label. The difference signal is an icon plus
the word Same or Differs, never colour alone.

**Reduced motion.** No motion in this option, so nothing to suppress.

**Mobile.** The table keeps a sensible min width and scrolls horizontally inside its own region;
the header row and the first attribute column both stay sticky so you never lose your place.

**Tradeoffs.** Densest and most scannable for a like for like read, but three wide columns get
tight on a phone and it is the least dramatic of the three visually.

---

## Option B. Versus battle

**Concept.** Two products face off across a center divider with a `VS` and a vertical `대결` mark.
Animated stat bars for heat and creaminess fill when the panel scrolls into view. It is the most
expressive layout and reads well in a portfolio or a launch deck.

**Technique.**
- Each side has a swap `<select>` so either product can be changed, which rebuilds that side and
  re animates its bars. Default matchup is Carbonara against Original, which gives a strong contrast
  on both heat and creaminess.
- Bars animate width from 0 to a target set through a `--fill` CSS custom property. An
  `IntersectionObserver` adds the fill class the first time the battle enters the viewport.
- The numeric or word value sits in text next to every bar, so the bar is reinforcement, not the
  only carrier of the value.

**Accessibility.** Each swap control has its own label. The value is always present as text
(for example "Very hot (4 of 5)" and "0 of 5"), so the meaning does not depend on bar width or
colour. The divider glyphs are decorative and hidden from assistive tech.

**Reduced motion.** When `prefers-reduced-motion: reduce` is set, the bars are painted at their
final width instantly with no transition, handled in both CSS and the fill logic.

**Mobile.** The three column battle collapses to a single stacked column, the divider turns
horizontal, and the right side drops its mirrored alignment so both panels read top to bottom.

**Tradeoffs.** High impact and memorable, but it compares only two products at a time and spends
more vertical space per fact than the table.

---

## Option C. Diff focus

**Concept.** A single column of attributes. Each row shows both product values and flags them as
Same or Differs with an icon and a word. A toggle collapses the list to only the rows that differ,
which is the fastest way to answer "what is actually different between these two".

**Technique.**
- Two product pickers at the top set the left and right item; a running count reports how many of
  the seven attributes differ.
- Same or different is computed per row from a text comparison key. The **Show only differences**
  toggle filters the list without losing the header summary.
- Differing rows get a subtle tint plus the Differs flag; matching rows get the Same flag.

**Accessibility.** Both flags pair an icon with a word, so nothing relies on colour. The header
count uses `aria-live="polite"` so a screen reader hears the summary update when the products or the
filter change. Every control is a native labelled `<select>` or checkbox.

**Reduced motion.** No motion in this option.

**Mobile.** The four column row reflows into a stacked grid: the attribute name spans the top, the
two values sit side by side, and the flag drops to its own line.

**Tradeoffs.** The clearest for a plain two way question and the most compact, but it does not carry
the photography or the shelf feel that A and B do.

---

## Job competency notes

- **Product knowledge.** The comparison dimensions match how Samyang's own line splits: the creamy
  carbonara family versus the sesame led Original and 2X Spicy, with formats (Multi, Big Bowl, Cup)
  treated as distinct because their facts genuinely differ. Preparation and allergen handling mirror
  the real Multi pack statements already captured in the data layer.
- **Customer guidance.** First time fit is written the way a support agent would actually steer a
  nervous first buyer: point the newcomer at the creamy moderate options, flag Original as a smaller
  first taste, and be honest that 2X Spicy is for experienced heat eaters. The verify the package
  language models the correct answer when data is not confirmed, which protects an allergy sensitive
  customer.

## Integration path (React and vanilla)

The preview is intentionally framework free so it opens instantly for review, but every piece maps
onto the existing app in `src/components/home/ComparisonLab/`.

- The vanilla `P` product object corresponds to `ProductFamily` plus its default `ProductVariant`.
  In React these come from `FAMILY_BY_ID` and `defaultVariantForFamily`, so no new data is invented.
- Option A is the closest to the current `ComparisonLab.tsx` table; it adds the highlight toggle and
  the icon plus word flags to the existing hide matching behaviour.
- Options B and C become sibling view components behind a segmented control, each reading the same
  `state.compareIds` from `useHome`.
- The bar animation belongs in a small hook that respects the existing `useReducedMotion` hook
  rather than reading `matchMedia` inline.

## Overall tradeoffs

A is the workhorse for detail and multi item scanning, B is the showpiece for two item impact, and C
is the quickest path to a plain answer. A production build would most likely ship A as the default
and offer B or C as an alternate view, since all three read from one data model and one honesty
legend.
