# QA Acceptance Checklist

## Deployment

- [ ] Confirmed actual Vercel entry point.
- [ ] Confirmed whether `preview.html` is used.
- [ ] Public link shows employer layer or clear entry into it.
- [ ] No old preview is being shared accidentally.
- [ ] Build completes.
- [ ] Data verification completes.

## Employer intro

- [ ] Employer understands what FireFlow is within 8 seconds.
- [ ] Intro says Nathan built it.
- [ ] Intro says it is independent.
- [ ] Intro explains product mode and Nathan mode.
- [ ] Intro does not over-explain.
- [ ] Intro has no generic corporate language.

## Fourth-wall layer

- [ ] “Explore with Nathan” works.
- [ ] Operator Notes toggle works.
- [ ] Notes appear in useful sections.
- [ ] Notes can be hidden.
- [ ] Notes do not block product use.
- [ ] Mobile notes are readable and not cramped.
- [ ] Desktop notes do not overlap content.

## SAP / Order-to-Cash

- [ ] Section title says “Order-to-Cash Process Intelligence.”
- [ ] Supporting label says “SAP SD aligned workflow study.”
- [ ] Honesty line is visible.
- [ ] No direct SAP implementation claims.
- [ ] Order entry, pricing, delivery, billing, customer record, and order management concepts are visible.
- [ ] The section explains why this matters to CX.

## Role evidence

- [ ] Role-to-feature evidence map exists.
- [ ] Evidence map is easy to scan.
- [ ] It connects product features to job requirements.
- [ ] It avoids résumé-wall formatting.
- [ ] It contains no fabricated metrics.

## Interaction

- [ ] Nav works.
- [ ] All anchors work.
- [ ] Product selection works.
- [ ] Compare works.
- [ ] Support widget works.
- [ ] Inquiry demo submission has success and failure states if a form exists.
- [ ] Sound is opt in.
- [ ] Reduced motion is respected.
- [ ] Keyboard navigation works.
- [ ] Focus states are visible.

## Technical

- [ ] No console errors.
- [ ] No broken images.
- [ ] No broken imports.
- [ ] No dead CTAs.
- [ ] No hidden horizontal overflow on mobile.
- [ ] Sticky rail works at 1440, 1366, 1280, and 1024 widths.
- [ ] Public build matches local build.

## Final report required

Claude must report:

- Files changed
- Commands run
- Build results
- Data verification results
- Which URL / file should be shared
- Remaining limitations
- Any claims intentionally avoided
