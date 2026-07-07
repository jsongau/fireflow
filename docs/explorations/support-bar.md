# Exploration — Floating support widget (Options A, B, C)

**Prepared:** 2026-07-07 · **Status:** Design exploration (three variants, one runnable preview). A floating bottom-right customer-service control for FireFlow Product Intelligence, shown in three distinct patterns so we can pick one before building. Preview: `previews/support-bar.html`.

This is a re-skin study on the striking dark theme (molten Samyang red and ember on charcoal, with gold, jade, and cobalt accents). No beige surfaces. Because three floating widgets on one page would overlap, each Option is mounted inside its own bordered device frame (`position:relative`, roughly 340 to 380 wide by 560 tall) so its FAB sits bottom-right inside that frame and opens on its own.

---

## 1. Concept and job competency

FireFlow serves two audiences that need different help. A shopper who bought a pack of Buldak Carbonara wants to report a missing sauce packet or ask how hot the 2X Spicy really is. A grocery buyer or distributor wants an order status, a damaged-case claim, or a deduction review. A single "Contact us" button flattens those two people into one queue and slows both down. The floating widget is the always-present entry point that sorts them before a case is ever opened, and holds the line on the one rule that matters most: serious safety issues leave the self-service path and reach a person, and the system never diagnoses or gives medical advice.

**Target-job competency:** *Route consumer care and retailer support as separate workflows, and govern escalation of serious issues.* Manager, Customer Experience at Samyang America is a role that owns both a consumer inbox and a vendor relationship. Each Option shows that split in the interface itself, and each carries the same calm, plainly worded safety note. The variants differ in how much they do at the door: Option A sorts and lists, Option B searches, Option C sets expectations. All three keep the escalation governance identical, which is the point.

---

## 2. The three variants

### Option A — Consumer or vendor concierge
The FAB opens a two-choice router. One button reads "I bought the product" (consumer care), the other "I sell or stock the product" (vendor and retailer support). Choosing a path shows that audience's common issues as a short list plus a primary "Start a consumer case" or "Start a vendor case" action, with a back control to return to the split. The serious-issue note sits on the opening screen and again inside the consumer path.

- **Consumer issues shown:** missing sauce, powder, or flakes; damaged or crushed package; leaking sauce bottle; allergen question about a format; heat level or preparation help; where to buy.
- **Vendor issues shown:** product information and specs; order status or partial fill; delivery delay; damaged cases on arrival; pricing, invoice, or deduction; EDI or marketing assets.
- **Best when:** the two audiences are roughly balanced and we want the widget to carry the routing that FireFlow's two case paths already assume.

### Option B — Quick-help launcher
The FAB opens a searchable list. Typing filters the common issues and highlights the matched text, with a live count for screen readers. Below the list sit two calm anchors: "Ask about a product" for a question the list does not cover, and a specialist-escalation note for the serious cases. The list mixes the most frequent consumer issues with one combined vendor entry, so a person self-serves in one or two keystrokes.

- **Best when:** most traffic is consumers with a known, repeating set of issues, and search is faster than a menu. The one vendor row keeps retailers from feeling shut out without splitting the whole interface.

### Option C — Compact status bar
The smallest footprint. The FAB is an icon-only circle. It opens a short card that states when to expect a reply, offers a single "Start a case" button, and carries a small consumer/vendor toggle that swaps the response expectations and the case label. No issue list, no search.

- **Best when:** the page is dense and the widget must stay out of the way, or when setting expectations up front matters more than triage. Response times are labeled as example service levels for this study, not a published commitment, in line with the project's no-invented-facts rule.

---

## 3. Technique

All three share one mechanic: a floating action button that is closed by default and expands into a panel anchored to the FAB. Opening animates scale and opacity from a bottom-right transform origin (roughly 200ms), so the panel appears to grow out of the button rather than fly in. The FAB itself is the toggle and carries `aria-expanded`; the panel is a `role="dialog"` with `aria-modal="true"` and a labelled title.

The variants layer small, self-contained behaviors on top:

- **Option A** swaps views by toggling a `hidden` attribute on `[data-view]` blocks and moving focus into the newly shown view, so the router, consumer, and vendor screens never leave the trapped panel.
- **Option B** filters on `input`, matching a keyword string plus the visible label, wrapping the matched substring in a `<mark>`, and updating a polite live region with the match count. An empty state appears when nothing matches.
- **Option C** is a pressed-state toggle (`aria-pressed`) that shows one status block, hides the other, and rewrites the case-button label.

Nothing here needs a framework. The whole preview is one file with a small initializer that wires every `[data-ffw]` root the same way.

---

## 4. Accessibility

**Focus trap.** Each open panel traps Tab and Shift+Tab within its own focusable elements. On open, focus moves to the first useful control (the search field in B, the first choice in A, the toggle in C). While closed, the panel carries the `inert` attribute, so its controls are removed from the tab order and from assistive-tech reading entirely, rather than only visually hidden. The trap is scoped per panel, so the three demo widgets never fight over focus.

**Escape and focus return.** Escape closes the open panel and returns focus to the FAB that opened it, so a keyboard or screen-reader user is never stranded. The visible close control and a second click on the FAB do the same. `stopPropagation` on Escape keeps one keypress from closing more than one demo widget.

**ARIA.** The FAB has a descriptive `aria-label` ("Open FireFlow support. Choose consumer or vendor help."), `aria-expanded`, and `aria-controls` pointing at its panel. The panel is `role="dialog" aria-modal="true"` with `aria-labelledby` on its heading. Option B's result count is an `aria-live="polite"` region. Option C's role switch is a labeled button group with `aria-pressed`.

**No information by color alone.** Every state carries a word or an icon, not just a hue. The consumer and vendor choices have both an icon and a text label plus a sublabel. The heat and issue rows read as text. The escalation note leads with a shield icon and a bold "A serious issue" heading, and the gold left border is reinforcement, never the only signal. The status lines in Option C pair each colored icon with its own sentence.

---

## 5. Reduced motion

Under `prefers-reduced-motion: reduce`, the scale-and-fade transition is removed and the panel simply appears and disappears with no transform and no bounce. The FAB's hover lift is also dropped. Open and close stay instant and complete, so the widget is fully usable for anyone who has asked the system to stop animating. Nothing about comprehension or routing depends on the motion.

---

## 6. Mobile and touch

The FAB and every control inside the panels meet a 44px minimum target (the FAB is 52px tall, issue rows and actions are at least 44 to 46px). The panel width is `min(316px, calc(100% - 36px))`, so it never runs past the frame or, in production, the viewport edge, and it grows upward from the FAB rather than covering the whole screen. The widget occupies only the bottom-right corner and does not lay a full-screen backdrop over the page, so it never obscures the content behind it or traps a touch user who taps outside it. On narrow screens the three frames in the preview stack to one column.

---

## 7. Integration

### React component
Each Option is one component, `SupportWidget`, with a `variant` prop:

```ts
interface SupportWidgetProps {
  variant: "router" | "launcher" | "status";  // A | B | C
  onStartCase: (path: "consumer" | "vendor", topic?: string) => void;
  onEscalate: () => void;   // routes a serious issue to a specialist
  hours?: SupportHours;     // Option C copy; kept in data, not hardcoded
}
```

- **Structure:** a `useFocusTrap(panelRef, isOpen)` hook (Tab wrap, initial focus, `inert` toggle), a `useReturnFocus(fabRef)` hook (Escape and close return focus to the FAB), and a `usePrefersReducedMotion()` guard that swaps the CSS transition for an instant show. State is local: `open`, plus `view` for A, `query` for B, `role` for C.
- **Data:** the common-issue lists come from a `SUPPORT_TOPICS` map keyed by `consumer` and `vendor`, so the same source feeds A's lists, B's searchable set, and any future page. The escalation copy and the "no medical advice" line live in one `ESCALATION_NOTICE` constant shared by all three variants, so the governance wording can never drift between them.
- **Mount:** one instance per page, fixed to the bottom-right, above app content via a portal so the trap and stacking are predictable.

### Vanilla single-file preview
`previews/support-bar.html` follows the repo's preview conventions: no build step, a single initializer over `[data-ffw]` roots, an `esc()` helper for the search highlight, and delegated handlers keyed on `data-goto`, `data-role`, and `data-search`. The device-frame wrappers and the faux app content behind each widget exist only to demo three floating widgets side by side; production mounts one widget against the real page.

---

## 8. Tradeoffs and risks

- **`inert` support.** The closed-panel handling uses the `inert` attribute to keep controls out of the tab order. It is supported in current evergreen browsers; where it is absent, the panel is still visually hidden and the focus trap only activates on open, so the failure mode is a slightly looser tab order, not a broken widget. A tiny polyfill closes the gap if the audience needs it.
- **Three dialogs on one page.** The preview mounts three `aria-modal` dialogs so we can compare them. That is a demo artifact. On a real page only one exists, which is the correct pattern; the spec and the trap are written for the single-widget case.
- **Option A depth vs. Option C speed.** A sorts and lists, which is thorough but adds a step before a case starts. C sets expectations in the smallest space but self-serves nothing. B sits between them. The choice is a real product decision about how much work happens at the door, not a visual preference.
- **Search quality in Option B.** The filter matches a hand-written keyword string plus the label. It is honest and fast for a known list, but it will not catch every phrasing. If the topic set grows, the keyword strings become the maintenance cost, and a small synonym map or a real search index would replace them.
- **Stated response times.** Option C shows example hours and turnaround. These are illustrative for the study and labeled as such. Before anything ships, real service levels have to come from the actual support operation, or the copy stays generic.
- **Not solved here:** the case form itself, authentication for vendor accounts, live-agent handoff, and localization. Each Option ends at "start a case" or "talk to a specialist"; what happens after the click is a separate flow.

---

## Copy audit note

- Arrow scan: passed (no `->`, `→`, or decorative arrows in copy; SVG chevrons are functional back and toggle icons only).
- Em-dash-as-separator scan: passed.
- Banned-phrase scan: passed (no "seamless", "peace of mind", "empower", "one stop shop", and the like).
- CTA specificity scan: passed ("Start a consumer case", "Start a vendor case", "Ask about a product", "Talk to a specialist").
- Factual-claim scan: passed (response times labeled as example service levels, not a commitment; no invented data).
