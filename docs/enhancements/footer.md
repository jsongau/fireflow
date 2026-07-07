# Enhancement — Site Footer

**Prepared:** 2026-07-07 · **Status:** Enhancement spec (design + drop-in recipe). Chapter 18 in the IA (`06-HOMEPAGE-INFORMATION-ARCHITECTURE.md`), built in the nav wave alongside the mega navigation.

---

## 1. Concept and job competency

The current footer is three stacked lines: a one-sentence summary, the disclaimer, and a research date. It is honest but flat. This replaces it with a working footer that does real navigation and carries the project's trust posture in full: four link columns matched to the five nav groups, a sources-and-methodology block, the independence disclaimer, the research date, and an accessibility statement. One restrained flourish: a thin chili-red hairline across the top that draws in from the center when the footer scrolls into view, and holds still when motion is reduced.

**Target-job competency:** *Close the loop with transparent sourcing and governance.* A CX manager is trusted with what the organization says publicly and how claims are supported. This footer states plainly what FireFlow is, what each fact traces to (official, public retail signal, editorial, synthetic), what it does not claim, and when the research was captured. That is the same discipline a real CX function needs for consumer-facing statements, allergen accuracy, and vendor communications. The footer is where the project's honesty is legible at a glance.

---

## 2. Technique reinterpreted

From the catalog: **staggered reveal on scroll**, reinterpreted at the most restrained possible scale for a footer, plus a single crafted **hairline** flourish.

- An `IntersectionObserver` adds `.in-view` when the footer enters the viewport. The columns fade and lift 6px with a small per-column delay, and the top hairline scales from the center outward (`transform: scaleX(0)` to `1`, `transform-origin: center`). Transform and opacity only; no gradients beyond the two token grounds, no glow, no glassmorphism.
- Under `prefers-reduced-motion: reduce`, the observer still runs but every transition duration is zero, so the hairline and columns are simply present. The reveal is decoration, never a gate on content.
- The hairline is one 2px line in `--chili-600`, the brand's controlled accent. It reads as a finishing rule on a printed page, not an effect.

---

## 3. Complete runnable recipe

Self-contained. Save as `footer-preview.html` and open it. Ships a small `window.FF` stub so it runs alone; in the app it reads the real global `FF`. Real column links map to live anchors or carry a visible "Planned" tag. Real independence disclaimer and source types.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FireFlow — Footer preview</title>
<style>
:root{
  --ink-900:#171311;--ink-800:#221b18;--ink-700:#332924;
  --paper-50:#faf4ea;--paper-100:#f3e9da;--paper-200:#e7d8c3;
  --chili-600:#c2341d;--chili-500:#d94f2f;--chili-050:#f7e0d8;--carbo-400:#e79bb0;
  --samyang-accent:#8a5a2b;--tangle-accent:#4c7a52;--mep-accent:#4a6b7a;
  --ok-500:#4c9a2a;--warn-500:#e0a021;--info-500:#3a7ca5;
  --src-official:#3a7ca5;--src-retail:#7a6f66;--src-editorial:#8a5a2b;--src-synthetic:#6b5b95;
  --slate-600:#5b524c;--slate-400:#8b817a;--line:#00000018;
  --font-display:"Fraunces",Georgia,serif;--font-ui:"Inter",system-ui,-apple-system,sans-serif;
  --r-sm:8px;--r-md:14px;--r-lg:22px;
  --sh1:0 1px 2px #0000000f,0 2px 8px #0000000a;--sh2:0 8px 30px #0000001a;
  --ease-out:cubic-bezier(.2,.7,.2,1);--dur-1:120ms;--dur-2:220ms;--dur-3:360ms;
}
@media (prefers-reduced-motion: reduce){:root{--dur-1:0ms;--dur-2:0ms;--dur-3:0ms;}}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font-ui);color:var(--ink-800);background:var(--paper-50);line-height:1.55;-webkit-font-smoothing:antialiased}
h2,h3{font-family:var(--font-display);line-height:1.14;margin:0}
a{color:var(--chili-600);text-decoration:none}
:focus-visible{outline:3px solid var(--info-500);outline-offset:2px;border-radius:6px}
.spacer{height:120vh;display:grid;place-items:center;color:var(--slate-400)}

/* ---------- footer ---------- */
.ff-footer{position:relative;background:var(--ink-900);color:var(--paper-100);padding:56px 16px 28px;overflow:hidden}
/* the crafted flourish: a chili hairline drawn from the center */
.ff-footer::before{content:"";position:absolute;top:0;left:0;right:0;height:2px;background:var(--chili-600);
  transform:scaleX(0);transform-origin:center;transition:transform var(--dur-3) var(--ease-out)}
.ff-footer.in-view::before{transform:scaleX(1)}
.ff-in{max-width:1200px;margin:0 auto}

.ff-top{display:grid;grid-template-columns:1.3fr 2.7fr;gap:40px;align-items:start}
.ff-brandcol .fb-name{font-family:var(--font-display);font-weight:700;font-size:1.6rem;color:var(--paper-50)}
.ff-brandcol .fb-tag{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--carbo-400);display:block;margin-top:2px}
.ff-brandcol p{color:#e7d8c3b3;max-width:44ch;margin:14px 0 0;font-size:.92rem}

.ff-cols{display:grid;grid-template-columns:repeat(4,1fr);gap:24px}
.ff-col h3{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--carbo-400);font-weight:700;margin-bottom:12px}
.ff-col ul{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.ff-col a{color:var(--paper-100);font-weight:600;font-size:.9rem}
.ff-col a:hover,.ff-col a:focus-visible{color:var(--paper-50);text-decoration:underline}
.ff-plan{font-size:.6rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--carbo-400);
  border:1px solid #ffffff2e;border-radius:999px;padding:.1em .45em;margin-left:6px}
.ff-col .planned{color:#e7d8c380;font-weight:600;font-size:.9rem}

/* reveal: columns + brand lift in, staggered */
.ff-reveal{opacity:0;transform:translateY(6px)}
.ff-footer.in-view .ff-reveal{opacity:1;transform:none;
  transition:opacity var(--dur-2) var(--ease-out),transform var(--dur-2) var(--ease-out);
  transition-delay:calc(var(--i,0)*70ms)}

/* sources + methodology strip */
.ff-sources{margin:36px 0 0;padding:20px 0 0;border-top:1px solid #ffffff1f;
  display:grid;grid-template-columns:1.4fr 1fr;gap:32px;align-items:start}
.ff-sources h3{font-size:.7rem;letter-spacing:.12em;text-transform:uppercase;color:var(--carbo-400);font-weight:700;margin-bottom:12px}
.ff-srclist{list-style:none;margin:0;padding:0;display:grid;gap:8px}
.ff-srclist li{display:flex;align-items:baseline;gap:10px;font-size:.85rem;color:#e7d8c3cc}
.ff-srclist .dot{width:9px;height:9px;border-radius:50%;flex:none;transform:translateY(3px)}
.ff-srclist b{color:var(--paper-50);font-weight:700}
.ff-method a{color:var(--paper-100);font-weight:600}
.ff-method p{color:#e7d8c3b3;font-size:.85rem;margin:6px 0 0}

/* legal + accessibility + date */
.ff-legal{margin:32px 0 0;padding:20px 0 0;border-top:1px solid #ffffff1f;
  display:grid;grid-template-columns:2fr 1fr;gap:32px;align-items:end}
.ff-disc{color:#e7d8c3b3;font-size:.82rem;max-width:82ch;margin:0}
.ff-meta{display:grid;gap:6px;justify-items:end;text-align:right}
.ff-meta .m{font-size:.78rem;color:#e7d8c399}
.ff-meta .m b{color:var(--paper-100);font-weight:700}
.ff-a11y{color:var(--paper-100);font-weight:600;font-size:.82rem}

@media (max-width:860px){
  .ff-top{grid-template-columns:1fr;gap:28px}
  .ff-cols{grid-template-columns:1fr 1fr}
  .ff-sources,.ff-legal{grid-template-columns:1fr;gap:20px}
  .ff-meta{justify-items:start;text-align:left}
}
@media (max-width:480px){ .ff-cols{grid-template-columns:1fr} }
</style>
</head>
<body>
<div class="spacer">Scroll down to reveal the footer</div>

<footer class="ff-footer" id="footer" role="contentinfo">
  <div class="ff-in" id="footIn"></div>
</footer>

<script>
/* ---- window.FF stub (the real app already provides window.FF) ---- */
window.FF = window.FF || {
  researchDate:"2026-07-07",
  summary:{families:45,formats:76},
  disclaimer:"FireFlow CX is an independent portfolio concept created from publicly available information. It is not affiliated with, commissioned by, or connected to Samyang America or Samyang Foods. All customers, orders, shipments, complaints, employees, metrics, financial values, lot codes, and outcomes shown are fictional.",
  sourceTypes:{
    official:{short:"Official",token:"--src-official",description:"Packaging, allergen, preparation, and positioning facts from public product information."},
    "retail-signal":{short:"Public retail signal",token:"--src-retail",description:"Engagement markers from third-party retail listings, date-stamped. Not sales."},
    editorial:{short:"FireFlow editorial",token:"--src-editorial",description:"Scores and interpretations created by this project, not official ratings."},
    synthetic:{short:"Synthetic",token:"--src-synthetic",description:"Invented for demonstration: cases, metrics, owners, timelines. Not real."}
  }
};

const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

/* footer columns map to the five nav groups; every link is a live anchor or Planned */
const COLS=[
  {h:"Explore",links:[
    {t:"All products",href:"#portfolio"},
    {t:"Product rankings",href:"#rankings"},
    {t:"Compare",href:"#compare"},
    {t:"Brands",planned:true},
    {t:"Flavor explorer",planned:true}
  ]},
  {h:"Consumer Care",links:[
    {t:"Product help",href:"#product"},
    {t:"Preparation",href:"#product"},
    {t:"Ingredients and allergens",href:"#product"},
    {t:"Report an issue",href:"#resolve"},
    {t:"Case status",href:"#simulate"}
  ]},
  {h:"Vendor Support",links:[
    {t:"Product info",href:"#product"},
    {t:"Availability",href:"#vendor"},
    {t:"Order and shipment support",href:"#vendor"},
    {t:"Pricing and invoices",href:"#vendor"},
    {t:"Marketing assets",planned:true}
  ]},
  {h:"CX Intelligence",links:[
    {t:"Command Center",href:"#command"},
    {t:"Product signals",href:"#signals"},
    {t:"Continuous improvement",href:"#signals"},
    {t:"Methodology",href:"#methodology"},
    {t:"Case study",planned:true}
  ]}
];

function linkLI(l){
  if(l.planned)return `<li><span class="planned">${esc(l.t)}<span class="ff-plan">Planned</span></span></li>`;
  return `<li><a href="${l.href}" data-act="footgo">${esc(l.t)}</a></li>`;
}

function renderFooter(){
  const s=FF.summary,st=FF.sourceTypes;
  const srcOrder=["official","retail-signal","editorial","synthetic"];
  document.getElementById('footIn').innerHTML=`
    <div class="ff-top">
      <div class="ff-brandcol ff-reveal" style="--i:0">
        <span class="fb-name">FireFlow</span><span class="fb-tag">Product Intelligence</span>
        <p>An independent Customer Experience portfolio concept exploring Samyang America's public U.S. portfolio: ${s.families} product families across ${s.formats} formats. Explore the products, resolve a consumer or vendor question, and see how cases become improvement.</p>
      </div>
      <nav class="ff-cols" aria-label="Footer">
        ${COLS.map((c,i)=>`<div class="ff-col ff-reveal" style="--i:${i+1}">
          <h3>${esc(c.h)}</h3><ul>${c.links.map(linkLI).join('')}</ul></div>`).join('')}
      </nav>
    </div>

    <div class="ff-sources ff-reveal" style="--i:5">
      <div>
        <h3>How to read the facts</h3>
        <ul class="ff-srclist">
          ${srcOrder.map(k=>`<li><span class="dot" style="background:var(${st[k].token})"></span>
            <span><b>${esc(st[k].short)}.</b> ${esc(st[k].description)}</span></li>`).join('')}
        </ul>
      </div>
      <div class="ff-method">
        <h3>Sources and methodology</h3>
        <a href="#methodology" data-act="footgo">Read how rankings are built and what is unknown</a>
        <p>Every fact carries a source type. Ingredients, allergens, packaging, and preparation may change. Always verify the current physical package.</p>
      </div>
    </div>

    <div class="ff-legal ff-reveal" style="--i:6">
      <p class="ff-disc">${esc(FF.disclaimer)}</p>
      <div class="ff-meta">
        <a class="ff-a11y" href="#methodology" data-act="footgo">Accessibility: built to WCAG 2.1 AA. Report a barrier</a>
        <span class="m">Research snapshot: <b>${esc(FF.researchDate)}</b></span>
        <span class="m">Built by <b>Nathan J. Song</b></span>
      </div>
    </div>`;
}

/* reveal on scroll; respects reduced motion because durations are token-zeroed */
function observe(){
  const f=document.getElementById('footer');
  if(!('IntersectionObserver'in window)){f.classList.add('in-view');return}
  const io=new IntersectionObserver((es)=>{
    es.forEach(en=>{if(en.isIntersecting){f.classList.add('in-view');io.disconnect();}});
  },{threshold:0.2});
  io.observe(f);
}

/* delegated anchor scroll (matches preview.html data-act convention) */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act="footgo"]');if(!a)return;
  const href=a.getAttribute('href');
  if(href&&href.startsWith('#')){const el=document.querySelector(href);
    if(el){e.preventDefault();history.replaceState(null,'',href);el.scrollIntoView({behavior:'smooth',block:'start'});}}
});

renderFooter();observe();
</script>
</body>
</html>
```

---

## 4. Accessibility, reduced motion, mobile

**Semantics.** One `<footer role="contentinfo">`. Link groups sit in a `<nav aria-label="Footer">` with real `<h3>` column headings, so a screen-reader user can jump between sections. Every link names its destination; there is no "Learn more." The source-type list is a plain list where each entry states the type name and what it means in words, so the four colored dots are reinforcement, never the only signal. The accessibility statement is itself a footer link.

**No info by color or hover alone.** Source types are labeled in text (Official, Public retail signal, FireFlow editorial, Synthetic). Planned links carry the visible word "Planned." Focus is a solid 3px `--info-500` ring on every link.

**Reduced motion.** The `IntersectionObserver` still adds `.in-view`, but under `prefers-reduced-motion: reduce` the token durations are zero, so the hairline is simply drawn and the columns are simply present. If JavaScript never runs, add `.in-view` as a default or rely on the fact that the base state is fully readable; the reveal only affects opacity and transform, so a no-JS footer still shows everything (see the risk note). Only transform and opacity animate.

**Mobile.** Columns reflow from four to two (860px) to one (480px). The brand blurb sits above the columns. The legal row stacks and left-aligns. All links keep comfortable spacing for touch. The hairline and reveal behave the same at every width.

---

## 5. Integration

### React app

- **Component:** `src/components/nav/SiteFooter/SiteFooter.tsx` with `SiteFooter.module.css`. Small `useInView` hook (a wrapped `IntersectionObserver`) toggles the `in-view` class; reuse `useReducedMotion` if a JS-side guard is ever wanted, though CSS token-zeroing already handles motion.
- **Where it mounts:** in `HomePage.tsx`, replace the current inline `<footer className={styles.footer}>` block with `<SiteFooter />` as the last child. It pairs with `MegaNav` (see `mega-nav.md`); both are the nav-wave chapters 17 and 18.
- **Data:** pull `DATA_SUMMARY` (families, formats) from `src/data`, `INDEPENDENCE_DISCLAIMER` and `SOURCE_TYPES` and `VERIFY_PACKAGE_REMINDER` from `src/data/sources.ts`, and the research date constant already used by the current footer (`2026-07-07`). Column links reuse the same anchor set as the mega nav.
- **Anchors live today:** `#portfolio, #rankings, #compare, #product, #resolve, #vendor, #simulate, #command, #signals, #methodology`. Unbuilt destinations (Brands, Flavor explorer, Marketing assets, Case study) render with the visible "Planned" tag and no `href` — no empty placeholder links (QA gate).
- **Accessibility link:** point "Report a barrier" at the real methodology/limitations anchor for now (`#methodology`), or a `mailto:` once an address is chosen. Do not ship a dead link.

### Vanilla single-file preview

- Follows `preview.html` conventions: global `window.FF`, shared `esc()`, a `renderFooter()` string builder, and a delegated `click` handler keyed on `data-act="footgo"`. `FF` already exposes `sourceTypes`, `disclaimer`, and a summary; add `researchDate` if it is not present.
- To adopt in `preview.html`: replace the existing `<footer>` markup and its two `textContent` writes (`footlead`, `footdisc`) with the `<footer id="footer">` above, call `renderFooter()` from the boot sequence, and call `observe()` once. The `footgo` action does not collide with the current `data-act` set.

---

## 6. Tradeoffs and risks

- **Reveal depends on JavaScript.** If JS fails, the `.ff-reveal` elements start at `opacity:0`. Mitigation: ship the footer with `in-view` applied server-side or as a default class, and treat the observer as an enhancement that only delays the class; or scope the `opacity:0` start state inside a `.js` class set by a tiny inline script. Either way the disclaimer and links must be visible without JS.
- **A four-column footer is more surface to maintain.** The columns duplicate the mega-nav IA, so the two can drift. Mitigation: source both from one shared groups definition (the same `GROUPS`/`COLS` data), so a change lands in one place.
- **The disclaimer is long.** It is load-bearing for the project's honesty and should not be trimmed for aesthetics. Mitigation: it sits in a calm, high-contrast block at the base, not hidden behind a toggle.
- **Hairline subtlety.** At 2px in `--chili-600` on `--ink-900` the flourish is deliberately quiet; on a very short viewport the footer may already be in view on load, so the observer fires immediately and the draw is barely seen. That is acceptable: the reveal is a finishing touch, not a feature.
- **Not solved here:** newsletter signup, social links, or locale switching. None are part of this project's IA or honesty posture, so the footer stays a navigation-and-trust surface rather than a marketing one.
```
