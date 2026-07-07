# Enhancement — Mega Navigation

**Prepared:** 2026-07-07 · **Status:** Enhancement spec (design + drop-in recipe). Chapter 17 in the IA (`06-HOMEPAGE-INFORMATION-ARCHITECTURE.md`), built in the nav wave. Do not widen the five top-level groups (nav-budget rule, IA §8).

---

## 1. Concept and job competency

The current header is a plain wordmark bar. This replaces it with a slim sticky top bar that opens one rich mega-panel per group, and it does the one thing a generic SaaS nav never does: it stays aware of the selected product. When Buldak Carbonara is selected, the bar shows it, and every group's panel offers the two quick actions that matter for that product right now, one for a consumer and one for a vendor.

The five groups are the fixed IA and are not widened:

- **Explore** — product rankings, all products, compare, brands, categories, flavor explorer
- **Consumer Care** — product help, preparation, ingredients and allergens, report an issue, case status
- **Vendor Support** — product info, availability, order support, shipment support, pricing and invoices, marketing assets
- **CX Intelligence** — Command Center, product signals, cases, continuous improvement, methodology
- **About** — case study, sources, limitations, about Nathan

**Target-job competency:** *Design clear self-service paths for two different audiences and keep the customer's context continuous so no one has to repeat themselves.* The Samyang CX manager runs both consumer care and vendor/customer support. This nav is the structural proof: two labelled service lanes (Consumer Care, Vendor Support), an operating lane (CX Intelligence), and a discovery lane (Explore), with the selected product carried through all of them. That is the CX principle *never make the customer repeat information*, expressed as navigation.

### The single shared sticky zone

The brief's hard rule: the new top bar must not fight the existing sticky selected-product rail. **Proposal: one sticky container, two stacked rows.**

```
┌─ .ff-topzone  (position: sticky; top: 0; one z-index) ──────────┐
│  Row 1  .ff-topbar   FireFlow · [Explore][Consumer Care]…[About] │  slim, 56px
│  Row 2  .ff-rail     Buldak Carbonara · Multi · consumer · Reset │  only when a
└─────────────────────────────────────────────────────────────────┘  product is set
```

Row 2 is the existing `SelectedProductRail`, moved inside the same sticky wrapper. There is exactly one sticky element on the page, matching the visual-system restraint rule (12 §10: "one sticky zone shared by chapter-nav + rail; no competing sticky elements"). The chapter scroll-spy rail (IA §3) is a third row in the same zone when it ships; the mega-panels open *below* the whole zone so they never overlap it. `scroll-margin-top` on sections is set from the zone's measured height (a CSS variable `--ff-topzone-h`) so anchor jumps land cleanly under it.

---

## 2. Technique reinterpreted

From the catalog: **native Popover API + CSS anchor positioning**, plus a **staggered reveal** on the panel contents.

- Each group trigger is a real `<button popovertarget>`; each panel is `[popover]`. Where the browser supports it, the panel is tethered under its trigger with `anchor-name` / `position-anchor` / `position-area`, and the top layer handles stacking and light-dismiss for free.
- Where Popover or anchor positioning is missing (Safari and Firefox lag on anchor positioning as of this research date), a small JS fallback toggles `.is-open`, positions the panel under the trigger with `getBoundingClientRect`, and wires Escape and outside-click itself. Same markup, same keyboard model, both paths.
- The reveal is a `transform: translateY(6px)` + `opacity` fade with a per-cell `--i` stagger, collapsed entirely under `prefers-reduced-motion`. Transform and opacity only, no layout thrash.

We reinterpret, we do not copy any card's code. No glow borders, no tilt, no spotlight here; a navigation surface stays calm and operational.

---

## 3. Complete runnable recipe

Self-contained. Save as `mega-nav-preview.html` and open it. It ships a tiny `window.FF` stub so it runs alone; in the app it reads the real global `FF` (see §5). Real product names, real anchors, real independence framing.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FireFlow — Mega Navigation preview</title>
<style>
:root{
  --ink-900:#171311;--ink-800:#221b18;--ink-700:#332924;
  --paper-50:#faf4ea;--paper-100:#f3e9da;--paper-200:#e7d8c3;
  --chili-600:#c2341d;--chili-500:#d94f2f;--chili-050:#f7e0d8;--carbo-400:#e79bb0;
  --samyang-accent:#8a5a2b;--tangle-accent:#4c7a52;--mep-accent:#4a6b7a;
  --ok-500:#4c9a2a;--warn-500:#e0a021;--info-500:#3a7ca5;
  --slate-600:#5b524c;--slate-400:#8b817a;--line:#00000018;
  --font-display:"Fraunces",Georgia,serif;--font-ui:"Inter",system-ui,-apple-system,sans-serif;
  --r-sm:8px;--r-md:14px;--r-lg:22px;
  --sh1:0 1px 2px #0000000f,0 2px 8px #0000000a;--sh2:0 8px 30px #0000001a;
  --ease-out:cubic-bezier(.2,.7,.2,1);--dur-1:120ms;--dur-2:220ms;--dur-3:360ms;
  --ff-topzone-h:56px;
}
@media (prefers-reduced-motion: reduce){:root{--dur-1:0ms;--dur-2:0ms;--dur-3:0ms;}}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font-ui);color:var(--ink-800);background:var(--paper-50);line-height:1.55;-webkit-font-smoothing:antialiased}
h1,h2,h3,h4{font-family:var(--font-display);line-height:1.14;margin:0 0 12px}
button{font-family:var(--font-ui);cursor:pointer}
a{color:var(--chili-600);text-decoration:none}
.wrap{max-width:1200px;margin:0 auto;padding:0 16px}
.skip-link{position:absolute;left:-9999px;top:0;background:var(--ink-900);color:var(--paper-50);padding:10px 14px;border-radius:0 0 8px 0;z-index:100}
.skip-link:focus{left:0}
:focus-visible{outline:3px solid var(--info-500);outline-offset:2px;border-radius:6px}

/* ---------- single shared sticky zone ---------- */
.ff-topzone{position:sticky;top:0;z-index:40;background:var(--ink-900)}
.ff-topbar{display:flex;align-items:center;gap:4px;min-height:56px;padding:0 16px;max-width:1200px;margin:0 auto}
.ff-brand{display:flex;align-items:baseline;gap:8px;margin-right:12px;text-decoration:none}
.ff-brand b{font-family:var(--font-display);font-weight:700;font-size:1.28rem;color:var(--paper-50)}
.ff-brand span{font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;color:var(--carbo-400)}
/* group triggers form a menubar */
.ff-menubar{display:flex;gap:2px;flex:1}
.ff-trigger{position:relative;background:transparent;border:1px solid transparent;border-radius:999px;color:var(--paper-100);
  font-weight:600;font-size:.9rem;padding:.5em .9em;min-height:40px;display:inline-flex;align-items:center;gap:8px}
.ff-trigger:hover{background:#ffffff14}
.ff-trigger[aria-expanded="true"]{background:var(--paper-50);color:var(--ink-900)}
.ff-caret{width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg) translateY(-1px);opacity:.7}
.ff-topactions{display:flex;align-items:center;gap:8px;margin-left:auto}
.ff-scope{display:none;align-items:center;gap:8px;color:var(--paper-100);font-size:.82rem}
.ff-scope.on{display:inline-flex}
.ff-scope .sc-acc{width:9px;height:9px;border-radius:50%}
.ff-scope b{color:var(--paper-50);font-weight:700}
.ff-scope .sc-fmt{color:#e7d8c3aa}

/* row 2: selected-product rail, same sticky zone */
.ff-rail{display:none;background:var(--paper-50);border-top:1px solid #ffffff14;border-bottom:1px solid var(--line);box-shadow:var(--sh1)}
.ff-rail.on{display:block}
.ff-rail .in{max-width:1200px;margin:0 auto;display:flex;align-items:center;gap:12px;flex-wrap:wrap;padding:8px 16px}
.ff-rail .r-acc{width:10px;height:10px;border-radius:50%;flex:none}
.ff-rail .r-name{font-weight:700;color:var(--ink-900)}
.ff-rail .r-fmt{font-weight:500;color:var(--slate-600)}
.ff-rail .r-mode{font-size:.78rem;font-weight:700;text-transform:capitalize;padding:.2em .6em;border-radius:999px;border:1px solid var(--line);color:var(--slate-600)}
.ff-rail .r-mode[data-mode="consumer"]{color:var(--info-500);border-color:var(--info-500)}
.ff-rail .r-mode[data-mode="vendor"]{color:var(--samyang-accent);border-color:var(--samyang-accent)}
.ff-rail .sp{flex:1}
.ff-rail .r-link{font-size:.82rem;font-weight:600;color:var(--ink-800)}
.ff-rail .r-reset{font-size:.82rem;font-weight:600;background:none;border:1px solid var(--line);border-radius:999px;padding:.3em .8em;min-height:34px;color:var(--slate-600)}

/* ---------- mega panels ---------- */
.ff-panel{margin:0;border:0;padding:0;background:transparent;inset:auto;overflow:visible}
.ff-panel::backdrop{background:#17131133}
.ff-panel .sheet{width:min(920px,calc(100vw - 24px));background:var(--paper-50);color:var(--ink-800);
  border:1px solid var(--line);border-radius:0 0 var(--r-lg) var(--r-lg);box-shadow:var(--sh2);
  padding:20px;display:grid;grid-template-columns:1.35fr 1fr;gap:20px}
/* anchor positioning where supported */
@supports (anchor-name: --a){
  .ff-trigger{anchor-name:var(--anchor)}
  .ff-panel{position:fixed;position-anchor:var(--anchor);position-area:bottom span-right;margin-top:6px;
    inset:auto;left:auto;right:auto}
}
/* JS-fallback positioning */
.ff-panel.js-fallback{position:fixed;top:var(--pop-top,64px);left:var(--pop-left,16px)}
/* reveal */
.ff-panel:not(.is-anim) .sheet{opacity:0;transform:translateY(6px)}
.ff-panel.is-anim .sheet{opacity:1;transform:none;transition:opacity var(--dur-2) var(--ease-out),transform var(--dur-2) var(--ease-out)}
.ff-col h3{font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;color:var(--slate-400);font-weight:700;margin:0 0 10px}
.ff-links{list-style:none;margin:0;padding:0;display:grid;gap:2px}
.ff-links li{opacity:0;transform:translateY(6px)}
.ff-panel.is-anim .ff-links li{opacity:1;transform:none;transition:opacity var(--dur-2) var(--ease-out),transform var(--dur-2) var(--ease-out);transition-delay:calc(var(--i,0)*22ms)}
.ff-link{display:flex;align-items:baseline;gap:8px;padding:.55em .6em;border-radius:var(--r-sm);color:var(--ink-800);font-weight:600;font-size:.92rem}
.ff-link:hover,.ff-link:focus-visible{background:var(--paper-100)}
.ff-link .d{font-weight:500;font-size:.8rem;color:var(--slate-600)}
.ff-plan{font-size:.62rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:var(--samyang-accent);
  background:#8a5a2b1a;border-radius:999px;padding:.15em .5em;align-self:center}
/* featured cell */
.ff-feature{background:linear-gradient(180deg,var(--paper-100),var(--paper-50));border:1px solid var(--line);border-radius:var(--r-md);padding:16px;display:grid;gap:10px;align-content:start}
.ff-feature .fx-eyebrow{font-size:.68rem;letter-spacing:.1em;text-transform:uppercase;color:var(--chili-600);font-weight:700}
.ff-feature .fx-stage{position:relative;display:grid;place-items:center;aspect-ratio:16/10;border-radius:var(--r-sm);
  background:radial-gradient(closest-side,#00000010,#00000000 72%)}
.ff-feature img{max-width:78%;max-height:150px;object-fit:contain;filter:drop-shadow(0 8px 14px #00000026)}
.ff-feature .fx-fallback{width:56%;aspect-ratio:3/4;border-radius:10px;background:linear-gradient(160deg,#fff,#f0e6d8);border:1px solid #00000012;display:none;place-items:end center;padding:12px;text-align:center}
.ff-feature .fx-name{font-family:var(--font-display);font-weight:700;color:var(--ink-900)}
.ff-feature .fx-scope{font-size:.82rem;color:var(--slate-600)}
.ff-feature .fx-actions{display:flex;flex-wrap:wrap;gap:8px}
.ff-btn{font-weight:600;font-size:.82rem;border:1px solid transparent;border-radius:var(--r-sm);padding:.5em .8em;min-height:38px;display:inline-flex;align-items:center;gap:8px}
.ff-btn.primary{background:var(--chili-600);color:var(--paper-50)}
.ff-btn.secondary{background:transparent;color:var(--ink-800);border-color:var(--ink-700)}
.ff-feature .fx-empty{font-size:.85rem;color:var(--slate-600)}

/* ---------- mobile drawer ---------- */
.ff-burger{display:none;background:transparent;border:1px solid #ffffff33;border-radius:var(--r-sm);color:var(--paper-50);
  min-height:44px;min-width:44px;align-items:center;justify-content:center}
.ff-burger .bl{display:block;width:20px;height:2px;background:currentColor;margin:3px 0}
.ff-drawer{position:fixed;inset:0;z-index:60;background:var(--paper-50);display:none;flex-direction:column}
.ff-drawer.on{display:flex}
.ff-drawer .dh{display:flex;align-items:center;justify-content:space-between;padding:12px 16px;background:var(--ink-900);color:var(--paper-50)}
.ff-drawer .dclose{background:transparent;border:1px solid #ffffff33;border-radius:var(--r-sm);color:var(--paper-50);min-height:44px;min-width:44px}
.ff-drawer .db{overflow:auto;padding:8px 16px 40px}
.ff-disc{border-bottom:1px solid var(--line)}
.ff-disc>summary{list-style:none;cursor:pointer;display:flex;align-items:center;justify-content:space-between;
  padding:14px 4px;font-weight:700;color:var(--ink-900);min-height:44px}
.ff-disc>summary::-webkit-details-marker{display:none}
.ff-disc>summary .chev{width:9px;height:9px;border-right:2px solid var(--slate-400);border-bottom:2px solid var(--slate-400);transform:rotate(45deg)}
.ff-disc[open]>summary .chev{transform:rotate(-135deg)}
.ff-disc .dlinks{list-style:none;margin:0;padding:0 4px 12px;display:grid;gap:2px}

@media (max-width:860px){
  .ff-menubar,.ff-scope{display:none}
  .ff-burger{display:inline-flex}
  .ff-panel .sheet{grid-template-columns:1fr}
}
/* demo page body */
.demo{padding:48px 16px;max-width:900px;margin:0 auto}
.demo section{scroll-margin-top:calc(var(--ff-topzone-h) + 12px);min-height:60vh;padding:24px 0;border-bottom:1px solid var(--line)}
.demo .toolbar{display:flex;gap:8px;flex-wrap:wrap;margin:16px 0}
.demo .toolbar button{background:#fff;border:1px solid var(--line);border-radius:999px;padding:.4em .8em;min-height:38px;font-weight:600}
</style>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>

<!-- ONE sticky zone: nav row + rail row -->
<div class="ff-topzone" id="topzone">
  <div class="ff-topbar">
    <a class="ff-brand" href="#main"><b>FireFlow</b><span>Product Intelligence</span></a>

    <nav class="ff-menubar" id="menubar" aria-label="Main"></nav>

    <div class="ff-topactions">
      <span class="ff-scope" id="scope" aria-live="polite"></span>
      <button class="ff-burger" id="burger" aria-expanded="false" aria-controls="drawer" aria-label="Open menu">
        <span aria-hidden="true"><span class="bl"></span><span class="bl"></span><span class="bl"></span></span>
      </button>
    </div>
  </div>

  <div class="ff-rail" id="rail" role="region" aria-label="Selected product"></div>
</div>

<!-- panels injected here -->
<div id="panels"></div>

<!-- mobile drawer -->
<div class="ff-drawer" id="drawer" role="dialog" aria-modal="true" aria-label="Menu" hidden>
  <div class="dh"><b style="font-family:var(--font-display)">Menu</b>
    <button class="dclose" id="dclose" aria-label="Close menu">Close</button></div>
  <div class="db" id="drawerBody"></div>
</div>

<main id="main" class="demo">
  <p class="toolbar">
    <button data-demo="pick">Select Buldak Carbonara</button>
    <button data-demo="mode-consumer">View as consumer</button>
    <button data-demo="mode-vendor">View as vendor</button>
    <button data-demo="reset">Reset selection</button>
  </p>
  <section id="portfolio"><h2>All products</h2><p>Portfolio Pulse chapter.</p></section>
  <section id="rankings"><h2>Product rankings</h2><p>Rankings Lab chapter.</p></section>
  <section id="compare"><h2>Compare</h2><p>Comparison Lab chapter.</p></section>
  <section id="product"><h2>Product help</h2><p>Product Dossier chapter.</p></section>
  <section id="resolve"><h2>Report an issue</h2><p>Consumer inquiry path.</p></section>
  <section id="vendor"><h2>Vendor support</h2><p>Vendor inquiry path.</p></section>
  <section id="simulate"><h2>Case status</h2><p>Resolution Simulator chapter.</p></section>
  <section id="command"><h2>Command Center</h2><p>CX Command Center preview.</p></section>
  <section id="signals"><h2>Product signals</h2><p>Signals and continuous improvement.</p></section>
  <section id="methodology"><h2>Methodology</h2><p>Methodology and trust chapter.</p></section>
</main>

<script>
/* ---- window.FF stub (the real app already provides window.FF) ---- */
window.FF = window.FF || {
  disclaimer:"FireFlow CX is an independent portfolio concept created from publicly available information. It is not affiliated with, commissioned by, or connected to Samyang America or Samyang Foods.",
  brands:[
    {id:"buldak",name:"Buldak",accentToken:"--chili-600"},
    {id:"samyang",name:"Samyang",accentToken:"--samyang-accent"},
    {id:"tangle",name:"Tangle",accentToken:"--tangle-accent"},
    {id:"mep",name:"MEP",accentToken:"--mep-accent"}
  ],
  families:[{id:"buldak-carbonara",brand:"buldak",name:"Buldak Carbonara"}],
  imageForFamily:function(id){
    var m={"buldak-carbonara":"/products/buldak-multi-carbonara.png"};
    return m[id]||null;
  }
};

/* ---- shared helpers (mirror preview.html) ---- */
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const brandById=Object.fromEntries(FF.brands.map(b=>[b.id,b]));

/* selection state — in the app this is the shared home store */
const nav={familyId:null,brand:null,mode:'explore'};

/* ---- IA: five fixed groups. type: 'anchor' | 'planned' ---- */
const GROUPS=[
  {id:"explore",label:"Explore",cols:[
    {h:"Discover",links:[
      {t:"Product rankings",d:"Multi-axis, sourced",act:"go",href:"#rankings"},
      {t:"All products",d:"45 families, 76 formats",act:"go",href:"#portfolio"},
      {t:"Compare formats and flavors",d:"Up to four side by side",act:"go",href:"#compare"},
      {t:"Categories",d:"Noodles, sauces, snacks, frozen",act:"go",href:"#portfolio"},
      {t:"Brands",d:"Buldak, Samyang, Tangle, MEP",type:"planned"},
      {t:"Flavor explorer",d:"Heat and format map",type:"planned"}
    ]}
  ]},
  {id:"consumer",label:"Consumer Care",mode:"consumer",cols:[
    {h:"Get help with a product",links:[
      {t:"Product help",d:"Facts for the selected product",act:"go",href:"#product",setMode:"consumer"},
      {t:"Preparation",d:"How to cook it",act:"go",href:"#product",setMode:"consumer"},
      {t:"Ingredients and allergens",d:"Always verify the package",act:"go",href:"#product",setMode:"consumer"},
      {t:"Report an issue",d:"Start a consumer case",act:"go",href:"#resolve",setMode:"consumer"},
      {t:"Case status",d:"Follow a case you started",act:"go",href:"#simulate"}
    ]}
  ]},
  {id:"vendor",label:"Vendor Support",mode:"vendor",cols:[
    {h:"For retail and distribution partners",links:[
      {t:"Product info",d:"Specs and sell sheets",act:"go",href:"#product",setMode:"vendor"},
      {t:"Availability",d:"What is orderable",act:"go",href:"#vendor",setMode:"vendor"},
      {t:"Order support",d:"Purchase order questions",act:"go",href:"#vendor",setMode:"vendor"},
      {t:"Shipment support",d:"Delivery and freight",act:"go",href:"#vendor",setMode:"vendor"},
      {t:"Pricing and invoices",d:"Deductions and disputes",act:"go",href:"#vendor",setMode:"vendor"},
      {t:"Marketing assets",d:"Approved imagery and copy",type:"planned"}
    ]}
  ]},
  {id:"cx",label:"CX Intelligence",cols:[
    {h:"How the work is run",links:[
      {t:"Command Center",d:"Manager case queue",act:"go",href:"#command"},
      {t:"Product signals",d:"Repeated cases become reviews",act:"go",href:"#signals"},
      {t:"Cases",d:"Resolution walkthrough",act:"go",href:"#simulate"},
      {t:"Continuous improvement",d:"Root cause and corrective action",act:"go",href:"#signals"},
      {t:"Methodology",d:"How rankings are built",act:"go",href:"#methodology"}
    ]}
  ]},
  {id:"about",label:"About",cols:[
    {h:"About this project",links:[
      {t:"Sources",d:"Official, retail, editorial, synthetic",act:"go",href:"#methodology"},
      {t:"Limitations",d:"What this does not claim",act:"go",href:"#methodology"},
      {t:"Case study",d:"How and why it was built",type:"planned"},
      {t:"About Nathan",d:"The person behind FireFlow",type:"planned"}
    ]}
  ]}
];

/* featured product image per group, keyed to a real /products file */
const supportsPopover = HTMLElement.prototype.hasOwnProperty('popover');
const supportsAnchor = CSS && CSS.supports && CSS.supports('anchor-name: --a');

/* ---- build a link row ---- */
function linkHTML(l,i){
  if(l.type==='planned'){
    return `<li style="--i:${i}"><span class="ff-link" aria-disabled="true" style="color:var(--slate-400)">
      ${esc(l.t)} <span class="ff-plan">Planned</span>${l.d?`<span class="d">${esc(l.d)}</span>`:''}</span></li>`;
  }
  return `<li style="--i:${i}"><a class="ff-link" href="${l.href}" data-act="navgo"
    ${l.setMode?`data-setmode="${l.setMode}"`:''}>${esc(l.t)}${l.d?`<span class="d">${esc(l.d)}</span>`:''}</a></li>`;
}

/* ---- featured cell: real product image + quick consumer/vendor actions ---- */
function featureHTML(g){
  const f=nav.familyId?FF.families.find(x=>x.id===nav.familyId):null;
  if(f){
    const img=FF.imageForFamily?FF.imageForFamily(f.id):null;
    return `<aside class="ff-feature" aria-label="Selected product">
      <span class="fx-eyebrow">Selected product</span>
      <div class="fx-stage">
        ${img?`<img src="${img}" alt="${esc(f.name)} package" onerror="this.style.display='none';this.nextElementSibling.style.display='grid'">`:''}
        <div class="fx-fallback" style="${img?'':'display:grid'}"><span style="font-weight:700;color:var(--ink-900)">${esc(f.name)}</span></div>
      </div>
      <div><div class="fx-name">${esc(f.name)}</div><div class="fx-scope">Ask about this product</div></div>
      <div class="fx-actions">
        <a class="ff-btn primary" href="#resolve" data-act="navgo" data-setmode="consumer">Report an issue</a>
        <a class="ff-btn secondary" href="#vendor" data-act="navgo" data-setmode="vendor">Vendor support</a>
      </div>
    </aside>`;
  }
  /* nothing selected: point at the discovery chapter */
  return `<aside class="ff-feature" aria-label="Featured">
    <span class="fx-eyebrow">Start here</span>
    <div class="fx-stage"><div class="fx-fallback" style="display:grid"><span style="font-weight:700;color:var(--ink-900)">Pick a product</span></div></div>
    <p class="fx-empty">No product selected yet. Open All products to pick one, then every panel offers the actions for it.</p>
    <div class="fx-actions"><a class="ff-btn primary" href="#portfolio" data-act="navgo">See all products</a></div>
  </aside>`;
}

/* ---- render the menubar + panels ---- */
function renderNav(){
  const mb=document.getElementById('menubar');
  mb.setAttribute('role','menubar');
  mb.innerHTML=GROUPS.map((g,gi)=>`
    <button class="ff-trigger" id="trg-${g.id}" role="menuitem"
      aria-haspopup="menu" aria-expanded="false" aria-controls="pan-${g.id}"
      ${supportsPopover?`popovertarget="pan-${g.id}"`:''}
      tabindex="${gi===0?'0':'-1'}" style="--anchor:--trg-${g.id}">
      ${esc(g.label)}<span class="ff-caret" aria-hidden="true"></span>
    </button>`).join('');

  const wrap=document.getElementById('panels');
  wrap.innerHTML=GROUPS.map(g=>{
    const cols=g.cols.map(c=>`<div class="ff-col"><h3>${esc(c.h)}</h3>
      <ul class="ff-links" role="menu" aria-label="${esc(g.label)}">${c.links.map(linkHTML).join('')}</ul></div>`).join('');
    return `<div class="ff-panel" id="pan-${g.id}" ${supportsPopover?'popover':''}
      role="menu" aria-labelledby="trg-${g.id}" style="--anchor:--trg-${g.id}">
      <div class="sheet"><div>${cols}</div>${featureHTML(g)}</div></div>`;
  }).join('');
}

/* ---- rail (row 2 of the sticky zone) + scope chip in the bar ---- */
function renderRail(){
  const rail=document.getElementById('rail');
  const scope=document.getElementById('scope');
  const f=nav.familyId?FF.families.find(x=>x.id===nav.familyId):null;
  const b=f?brandById[f.brand]:null;
  if(!f){rail.classList.remove('on');scope.classList.remove('on');scope.innerHTML='';rail.innerHTML='';measure();return}
  scope.classList.add('on');
  scope.innerHTML=`<span class="sc-acc" style="background:var(${b.accentToken})"></span><b>${esc(f.name)}</b>`;
  rail.classList.add('on');
  rail.innerHTML=`<div class="in">
    <span class="r-acc" style="background:var(${b.accentToken})" aria-hidden="true"></span>
    <span class="r-name">${esc(f.name)}</span><span class="r-fmt">· Multi</span>
    <span class="r-mode" data-mode="${nav.mode}">${esc(nav.mode)}</span>
    <span class="sp"></span>
    <a class="r-link" href="#resolve" data-act="navgo" data-setmode="consumer">Consumer care</a>
    <a class="r-link" href="#vendor" data-act="navgo" data-setmode="vendor">Vendor support</a>
    <button class="r-reset" data-act="navreset">Reset</button>
  </div>`;
  measure();
}

/* keep --ff-topzone-h accurate so anchors clear the sticky zone */
function measure(){
  const h=document.getElementById('topzone').offsetHeight;
  document.documentElement.style.setProperty('--ff-topzone-h',h+'px');
}

/* ---------- open / close with full keyboard model ---------- */
let openId=null;
function panelEl(id){return document.getElementById('pan-'+id)}
function trgEl(id){return document.getElementById('trg-'+id)}

function openPanel(id,focusFirst){
  if(openId&&openId!==id)closePanel(openId,false);
  const p=panelEl(id),t=trgEl(id);
  if(supportsPopover){try{p.showPopover()}catch(e){}}
  if(!supportsAnchor||!supportsPopover){
    p.classList.add('js-fallback');
    const r=t.getBoundingClientRect();
    p.style.setProperty('--pop-top',(r.bottom+6)+'px');
    p.style.setProperty('--pop-left',Math.max(12,Math.min(r.left,window.innerWidth-940))+'px');
    p.style.display='block';
  }
  t.setAttribute('aria-expanded','true');
  requestAnimationFrame(()=>p.classList.add('is-anim'));
  openId=id;
  if(focusFirst){const a=p.querySelector('a.ff-link');if(a)a.focus();}
}
function closePanel(id,returnFocus){
  const p=panelEl(id),t=trgEl(id);
  p.classList.remove('is-anim');
  if(supportsPopover){try{p.hidePopover()}catch(e){}}
  else{p.style.display='none';p.classList.remove('js-fallback');}
  t.setAttribute('aria-expanded','false');
  if(openId===id)openId=null;
  if(returnFocus)t.focus();
}
function togglePanel(id){openId===id?closePanel(id,true):openPanel(id,false)}

/* roving-tabindex arrow model across the group triggers */
function moveTrigger(dir){
  const ids=GROUPS.map(g=>g.id);
  const cur=document.activeElement&&document.activeElement.id&&document.activeElement.id.startsWith('trg-')
    ? document.activeElement.id.slice(4):ids[0];
  let i=ids.indexOf(cur);
  i=(i+dir+ids.length)%ids.length;
  ids.forEach(x=>trgEl(x).setAttribute('tabindex','-1'));
  const t=trgEl(ids[i]);t.setAttribute('tabindex','0');t.focus();
  if(openId)openPanel(ids[i],false); /* if a panel is open, follow along */
}

document.addEventListener('keydown',e=>{
  const inBar=document.activeElement&&document.activeElement.classList&&document.activeElement.classList.contains('ff-trigger');
  if(inBar){
    if(e.key==='ArrowRight'){e.preventDefault();moveTrigger(1)}
    else if(e.key==='ArrowLeft'){e.preventDefault();moveTrigger(-1)}
    else if(e.key==='ArrowDown'||e.key==='Enter'||e.key===' '){
      e.preventDefault();const id=document.activeElement.id.slice(4);openPanel(id,true)}
  }
  if(e.key==='Escape'&&openId){e.preventDefault();closePanel(openId,true)}
});

/* light dismiss for the JS-fallback path (Popover does this itself) */
document.addEventListener('click',e=>{
  if(openId&&!supportsPopover){
    const p=panelEl(openId),t=trgEl(openId);
    if(!p.contains(e.target)&&!t.contains(e.target))closePanel(openId,false);
  }
});

/* trigger clicks (works alongside popovertarget as progressive enhancement) */
document.getElementById('menubar').addEventListener('click',e=>{
  const t=e.target.closest('.ff-trigger');if(!t)return;
  if(!supportsPopover){e.preventDefault();togglePanel(t.id.slice(4));}
  else{setTimeout(()=>{ /* sync aria + reveal with native toggle */
    GROUPS.forEach(g=>{const open=panelEl(g.id).matches(':popover-open');
      trgEl(g.id).setAttribute('aria-expanded',open?'true':'false');
      if(open){openId=g.id;requestAnimationFrame(()=>panelEl(g.id).classList.add('is-anim'));}});
  },0);}
});

/* ---------- delegated link + rail actions ---------- */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');if(!a)return;
  const act=a.dataset.act;
  if(act==='navgo'){
    if(a.dataset.setmode)nav.mode=a.dataset.setmode;
    if(openId)closePanel(openId,false);
    closeDrawer();
    renderRail();
    const href=a.getAttribute('href');
    if(href&&href.startsWith('#')){const el=document.querySelector(href);
      if(el){e.preventDefault();history.replaceState(null,'',href);
        el.scrollIntoView({behavior:'smooth',block:'start'});}}
  } else if(act==='navreset'){
    nav.familyId=null;nav.brand=null;nav.mode='explore';renderNav();renderRail();
  }
});

/* ---------- mobile drawer ---------- */
function renderDrawer(){
  document.getElementById('drawerBody').innerHTML=GROUPS.map((g,i)=>`
    <details class="ff-disc" ${i===0?'open':''}>
      <summary>${esc(g.label)}<span class="chev" aria-hidden="true"></span></summary>
      ${g.cols.map(c=>`<ul class="dlinks">${c.links.map((l,li)=>l.type==='planned'
        ? `<li><span class="ff-link" aria-disabled="true" style="color:var(--slate-400)">${esc(l.t)} <span class="ff-plan">Planned</span></span></li>`
        : `<li><a class="ff-link" href="${l.href}" data-act="navgo" ${l.setMode?`data-setmode="${l.setMode}"`:''}>${esc(l.t)}</a></li>`).join('')}</ul>`).join('')}
    </details>`).join('');
}
let lastFocus=null;
function openDrawer(){
  const d=document.getElementById('drawer');d.hidden=false;d.classList.add('on');
  document.getElementById('burger').setAttribute('aria-expanded','true');
  lastFocus=document.activeElement;document.getElementById('dclose').focus();
  document.body.style.overflow='hidden';
}
function closeDrawer(){
  const d=document.getElementById('drawer');if(!d.classList.contains('on'))return;
  d.classList.remove('on');d.hidden=true;
  document.getElementById('burger').setAttribute('aria-expanded','false');
  document.body.style.overflow='';
  if(lastFocus)lastFocus.focus();
}
document.getElementById('burger').addEventListener('click',openDrawer);
document.getElementById('dclose').addEventListener('click',closeDrawer);
document.getElementById('drawer').addEventListener('keydown',e=>{
  if(e.key==='Escape'){e.preventDefault();closeDrawer();return}
  if(e.key==='Tab'){ /* focus trap */
    const f=document.getElementById('drawer').querySelectorAll('a[href],button,summary,[tabindex]:not([tabindex="-1"])');
    if(!f.length)return;const first=f[0],last=f[f.length-1];
    if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}
    else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
});

/* ---------- demo controls (the app dispatches to the real store instead) ---------- */
document.querySelector('.toolbar').addEventListener('click',e=>{
  const b=e.target.closest('[data-demo]');if(!b)return;
  const d=b.dataset.demo;
  if(d==='pick'){nav.familyId='buldak-carbonara';nav.brand='buldak';}
  else if(d==='mode-consumer')nav.mode='consumer';
  else if(d==='mode-vendor')nav.mode='vendor';
  else if(d==='reset'){nav.familyId=null;nav.brand=null;nav.mode='explore';}
  renderNav();renderRail();
});

/* boot */
renderNav();renderRail();renderDrawer();measure();
window.addEventListener('resize',measure);
</script>
</body>
</html>
```

---

## 4. Accessibility, reduced motion, mobile

**Semantics and keyboard (desktop).** The bar is a `role="menubar"` of `role="menuitem"` buttons with roving `tabindex` (one tab stop for the whole bar). Left and Right arrows move between groups; Down, Enter, or Space opens a panel and moves focus to its first link; Escape closes the panel and returns focus to its trigger. Each trigger carries `aria-haspopup="menu"`, `aria-expanded`, and `aria-controls`. Panels are `role="menu"` labelled by their trigger. Nothing is hover-only; every open path has a keyboard and click equivalent, and every trigger label is real text.

**Popover path.** With the Popover API, panels live in the top layer, so they are never clipped by the sticky zone, light-dismiss and Escape are native, and stacking is automatic. `aria-expanded` is synced on the native `toggle`. The JS fallback reproduces open, position, Escape, and outside-click for browsers without Popover or anchor positioning.

**No info by color or hover alone.** Planned items are marked with the visible word "Planned," not a color. The viewing mode in the rail shows the word (consumer / vendor), with color as reinforcement only. Focus is a solid 3px `--info-500` ring.

**Reduced motion.** `prefers-reduced-motion: reduce` zeroes `--dur-1/2/3`, so the panel reveal and link stagger collapse to an instant show. Layout and function are identical with motion off. Only transform and opacity animate.

**Touch and mobile.** Below 860px the menubar is replaced by a 44px burger that opens a full-screen `role="dialog" aria-modal="true"` drawer with disclosure sections (`<details>`). The drawer traps focus, returns focus to the burger on close, closes on Escape, and locks body scroll. All targets are at least 44px. Panels collapse to a single column so the featured cell stacks under the links.

---

## 5. Integration

### React app

- **Component:** `src/components/nav/MegaNav/MegaNav.tsx`, plus `useMegaNav.ts` for the open/close and roving-tabindex logic and `MegaNav.module.css` for the styles above.
- **Where it mounts:** in `HomePage.tsx`, replace the current `<header>` and the standalone `<SelectedProductRail />` with a single `<StickyZone>` wrapper that renders `<MegaNav />` as row 1 and `<SelectedProductRail />` as row 2 (later, the chapter scroll-spy rail as row 3). This creates the one shared sticky zone. Move `position: sticky; top: 0` onto `StickyZone` and drop it from `SelectedProductRail.module.css`, since the rail no longer sticks on its own.
- **State:** read `selectedFamilyId`, `selectedVariantId`, and `userMode` from the home store (`state/homeStore.tsx`). Link clicks dispatch `SET_MODE` (mirroring the rail's existing `onClick`) and then let the anchor scroll. Set `--ff-topzone-h` from a `ResizeObserver` on the zone so `scroll-margin-top` on every `<section>` stays correct.
- **Images:** the featured cell uses the real `imageForVariant(variantId, familyId)` / `IMAGE_BY_FAMILY` from `src/data/images.ts`, with the `ProductStage` placeholder as the `onError` fallback (never a broken image).
- **Anchors that are live today:** `#portfolio, #rankings, #compare, #product, #resolve, #vendor, #simulate` plus the placeholder sections `#command, #signals, #methodology`. Links to unbuilt chapters (Brands, Flavor explorer, Marketing assets, Case study, About Nathan) render with the visible "Planned" tag and no `href`, satisfying the "no empty placeholder links" QA gate.

### Vanilla single-file preview

- Follows the existing `preview.html` conventions exactly: a global `window.FF` data object, the shared `esc()` helper, `render<Section>()` string builders (`renderNav`, `renderRail`, `renderDrawer`), and a delegated `click` handler keyed on `data-act` (`navgo`, `navreset`). `imageForFamily(id)` is added to `FF` (the preview already exposes families/variants/brands; add the `IMAGE_BY_FAMILY` map).
- To adopt in `preview.html`: drop the `.ff-topzone` markup above the existing `#rail`, fold the current `renderRail()` body into row 2, and call `renderNav()` from the existing `render()` cycle. The `data-act` names do not collide with the current set (`pick`, `mode`, `rank`, `add`, etc.).

---

## 6. Tradeoffs and risks

- **Popover and anchor positioning support is uneven at this research date.** Chrome ships both; Safari and Firefox lag on anchor positioning. The JS fallback covers this, but it is a second code path to keep in sync. Mitigation: the markup and keyboard model are identical across paths; only positioning and dismiss differ.
- **A menubar is a strong ARIA contract.** Full arrow-key semantics are more code than a row of links. Justified here because the target job is about structured service design, and the pattern reads as competence. If it ever feels heavy, the same panels work as plain disclosure buttons with a lighter contract.
- **Featured image weight.** Panels reference real PNGs. They should be lazy and only the selected product's image is likely to load, but a cold panel open fetches one image. Mitigation: `loading="lazy"`, small transforms only, and the CSS fallback if the file is missing.
- **Two-row sticky height on mobile.** Nav plus rail could eat vertical space. Mitigation: on mobile the nav collapses to a single 56px bar (burger), and the rail row wraps compactly; `--ff-topzone-h` keeps anchor offsets correct regardless of height.
- **Not solved here:** the chapter scroll-spy rail (IA §3) is the eventual row 3 of the same zone. This spec leaves room for it but does not build it, to avoid competing sticky elements before that wave.
```
