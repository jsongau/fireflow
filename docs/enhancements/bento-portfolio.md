# Enhancement — Bento Portfolio (Portfolio Pulse)

**Prepared:** 2026-07-07 · **Status:** Enhancement spec (design + drop-in recipe). Upgrades the Portfolio Pulse chapter (`src/components/home/PortfolioPulse/PortfolioPulse.tsx`, `#portfolio`). Depends on the Product Card spec (`product-card.md`) for the cell contents.

---

## 1. Concept and job competency

Portfolio Pulse today is a uniform `repeat(auto-fill, minmax(220px,1fr))` grid — every one of the 45 families gets an identical box, so the flagship Buldak Carbonara looks exactly like a Portfolio-tier snack. That is the opposite of how a category is actually merchandised. This upgrade turns it into an **editorial bento**: the six launch anchors occupy larger cells with big imagery and room to breathe, secondary High-Priority families take medium cells, and the long tail sits in compact cells — a visual hierarchy that mirrors the real priority tiers in the data (`popularityTier`, `priorityLabel`, `isAnchor`).

It stays operational, not decorative: the family↔format toggle, the brand and category filters, and the live "showing N families · M formats" counts all survive intact. The bento *assembles on scroll* — cells settle into place in a short staggered reveal as the section enters the viewport — but the moment it's assembled it behaves like a normal, filterable, keyboard-navigable grid.

**Target-job competency:** *Translate a data-driven priority model into a layout a stakeholder reads at a glance.* A CX manager has to argue "these six are where support volume and marketing attention concentrate." The bento *is* that argument, rendered — the anchors are literally bigger — while the filters and counts keep it a working tool for browsing all 45 families, not a static hero collage.

---

## 2. Technique reinterpreted

Two catalog techniques, reinterpreted to stay legible and honest:

- **Bento grid assemble-on-scroll (IntersectionObserver).** The grid is a CSS Grid with explicit spans (`grid-column`/`grid-row`) per priority tier. One `IntersectionObserver` watches the grid; when it crosses into view, cells reveal with a per-cell `--i` stagger (opacity + a 10px `translateY`, transform/opacity only). It fires **once** and then disconnects — this is an entrance, not a scroll-linked animation that re-triggers or hijacks scrolling.
- **Brand-accent rhythm.** Each cell carries its family's `--card-accent`, so scanning the grid you feel Buldak's chili-red recurring, punctuated by Samyang's brown, Tangle's green, MEP's blue — a rhythm that also teaches the four-brand structure. It's the accent already on every card, arranged so the eye reads the portfolio's shape.

We reinterpret; we do not copy. No parallax, no scroll-scrubbing, no cards that reflow while you read them. When filters change, cells that remain simply stay put and new results fade in — the layout is calm.

---

## 3. Complete runnable recipe

Self-contained. Save as `bento-portfolio-preview.html` and open it. Real families, real anchors, real image paths, live counts. It reuses the Product Card from `product-card.md` (trimmed here to keep one file runnable).

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FireFlow — Bento Portfolio preview</title>
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
}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font-ui);color:var(--ink-800);background:var(--paper-50);line-height:1.55;-webkit-font-smoothing:antialiased}
h1,h2,h3{font-family:var(--font-display);line-height:1.14;margin:0}
button{font-family:var(--font-ui);cursor:pointer}
:focus-visible{outline:3px solid var(--info-500);outline-offset:3px;border-radius:var(--r-sm)}
.wrap{max-width:1200px;margin:0 auto;padding:0 16px}

/* section head */
.pp{padding:56px 0}
.pp-head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:8px}
.pp-eyebrow{text-transform:uppercase;letter-spacing:.14em;font-size:.78rem;color:var(--chili-600);font-weight:700;margin:0 0 6px}
.pp h2{font-size:2.1rem;color:var(--ink-900)}
.pp-lede{color:var(--slate-600);max-width:60ch;margin:10px 0 0}
.pp-lede b{color:var(--ink-900)}

/* view toggle (family/format) */
.seg{display:inline-flex;gap:4px;padding:4px;background:#00000010;border:1px solid var(--line);border-radius:999px}
.seg button{font-weight:600;font-size:.82rem;border:none;background:transparent;color:var(--ink-800);border-radius:999px;padding:.5em 1em;min-height:38px}
.seg button[aria-pressed="true"]{background:var(--ink-900);color:var(--paper-50)}

/* filters */
.pp-filters{margin:18px 0 4px;display:grid;gap:8px}
.chiprow{display:flex;flex-wrap:wrap;gap:8px}
.chip{font-weight:600;font-size:.82rem;background:#fff;border:1px solid var(--line);border-radius:999px;padding:.45em .85em;min-height:38px;display:inline-flex;align-items:center;gap:8px;color:var(--ink-800)}
.chip[aria-pressed="true"]{background:var(--ink-900);color:var(--paper-50);border-color:var(--ink-900)}
.chipdot{width:9px;height:9px;border-radius:50%}
.pp-count{font-size:.85rem;color:var(--slate-600);margin:12px 0 0}
.pp-count b{color:var(--ink-900)}

/* ===== BENTO GRID ===== */
.bento{list-style:none;padding:0;margin:16px 0 0;display:grid;gap:16px;
  grid-template-columns:repeat(6,1fr);grid-auto-rows:minmax(120px,auto);grid-auto-flow:dense}
/* spans by tier */
.bento > li{grid-column:span 2;grid-row:span 1}          /* default / compact */
.bento > li[data-span="md"]{grid-column:span 3}
.bento > li[data-span="lg"]{grid-column:span 3;grid-row:span 2}
@media (max-width:900px){
  .bento{grid-template-columns:repeat(4,1fr)}
  .bento > li,.bento > li[data-span="md"]{grid-column:span 2}
  .bento > li[data-span="lg"]{grid-column:span 4;grid-row:span 2}
}
@media (max-width:560px){
  .bento{grid-template-columns:1fr}
  .bento > li,.bento > li[data-span="md"],.bento > li[data-span="lg"]{grid-column:span 1;grid-row:span 1}
}

/* assemble-on-scroll reveal */
.bento > li{opacity:0;transform:translateY(10px)}
.bento.is-in > li{opacity:1;transform:none;
  transition:opacity var(--dur-3) var(--ease-out),transform var(--dur-3) var(--ease-out);
  transition-delay:calc(var(--i,0)*45ms)}
@media (prefers-reduced-motion: reduce){
  .bento > li{opacity:1!important;transform:none!important;transition:none!important}
}

/* ---- card (see product-card.md; trimmed to essentials here) ---- */
.ff-card{position:relative;display:block;width:100%;height:100%;text-align:left;
  background:linear-gradient(180deg,var(--paper-50),#fff 42%);border:1px solid var(--line);
  border-radius:var(--r-md);box-shadow:var(--sh1);padding:0;color:var(--ink-800);font-family:var(--font-ui);
  transition:box-shadow var(--dur-2) var(--ease-out);overflow:hidden;display:flex;flex-direction:column}
.ff-card:hover{box-shadow:var(--sh2)}
.ff-card[aria-pressed="true"]{border-color:var(--card-accent,var(--chili-600));outline:2px solid var(--card-accent,var(--chili-600));outline-offset:-1px}
.ff-card::before{content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;pointer-events:none;
  background:linear-gradient(135deg,var(--card-accent,var(--chili-600)),#ffffff00 40%,#ffffff00 60%,var(--card-accent,var(--chili-600)));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;opacity:0;transition:opacity var(--dur-2) var(--ease-out);z-index:3}
.ff-card:hover::before,.ff-card:focus-visible::before,.ff-card[aria-pressed="true"]::before{opacity:1}
.ff-card-media{position:relative;display:grid;place-items:center;aspect-ratio:4/3;overflow:hidden;flex:1;
  background:radial-gradient(120% 100% at 50% 18%,#fff 0%,var(--paper-100) 55%,var(--paper-200) 100%)}
.ff-card-media img{max-width:78%;max-height:82%;object-fit:contain;filter:drop-shadow(0 10px 16px #00000026);transition:transform var(--dur-3) var(--ease-out)}
.ff-card:hover .ff-card-media img{transform:scale(1.05)}
.ff-card-media.is-loading{background:linear-gradient(100deg,var(--paper-100) 30%,var(--paper-50) 50%,var(--paper-100) 70%);background-size:200% 100%;animation:ffshimmer 1.4s linear infinite}
.ff-card-media.is-loading img{opacity:0}
@keyframes ffshimmer{to{background-position:-200% 0}}
@media (prefers-reduced-motion: reduce){.ff-card-media.is-loading{animation:none}.ff-card:hover .ff-card-media img{transform:none}}
.ff-card-fallback{display:none;width:56%;aspect-ratio:3/4;border-radius:12px;background:linear-gradient(165deg,#fff,var(--paper-100));
  border:1px solid #00000012;box-shadow:var(--sh1);position:relative;overflow:hidden;place-items:end center;padding:14px;text-align:center}
.ff-card-fallback[data-show="1"]{display:grid}
.ff-card-fallback::before{content:"";position:absolute;inset:0 0 auto 0;height:38%;background:var(--card-accent,var(--samyang-accent));opacity:.9}
.ff-card-fallback .fb-mark{position:absolute;top:8px;left:0;right:0;color:#fff;font-family:var(--font-display);font-weight:700}
.ff-card-fallback .fb-name{position:relative;font-family:var(--font-display);font-weight:700;color:var(--ink-900);font-size:.92rem;line-height:1.1}
.ff-card-body{display:grid;gap:6px;padding:14px 16px 16px;position:relative;z-index:1}
.ff-card-brand{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:var(--slate-400);font-weight:700}
.ff-card-name{font-family:var(--font-display);font-weight:700;font-size:1.12rem;line-height:1.12;color:var(--ink-900)}
li[data-span="lg"] .ff-card-name{font-size:1.5rem}
.ff-card-meta{font-size:.82rem;color:var(--slate-600);display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.ff-heat{display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:600;color:var(--ink-700)}
.ff-heat .pips{display:inline-flex;gap:3px}
.ff-heat .pip{width:7px;height:7px;border-radius:50%;border:1px solid var(--slate-400)}
.ff-heat .pip.on{background:var(--ink-700);border-color:var(--ink-700)}
.ff-heat .word{color:var(--slate-600)}
.ff-tag{position:absolute;top:10px;left:10px;z-index:3;font-size:.66rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;
  padding:.28em .6em;border-radius:999px;background:#ffffffe6;border:1px solid var(--line);color:var(--ink-800)}
.ff-tag[data-anchor="1"]{color:#fff;background:var(--card-accent,var(--chili-600));border-color:transparent}
/* format view: a compact format list appended under the body */
.fmtlist{list-style:none;display:flex;flex-wrap:wrap;gap:6px;padding:0 16px 16px;margin:0}
.fmtlist .fmt{font-size:.78rem;font-weight:600;background:var(--paper-100);border:1px solid var(--line);border-radius:999px;padding:.3em .7em;min-height:34px;display:inline-flex;align-items:center;color:var(--ink-800)}
.fmtlist .fmt[aria-pressed="true"]{background:var(--ink-900);color:var(--paper-50)}

/* empty state */
.pp-empty{border:1px dashed var(--line);border-radius:var(--r-md);padding:36px;text-align:center;color:var(--slate-600);background:#fff;margin-top:16px}
.pp-empty b{color:var(--ink-900);font-family:var(--font-display)}
.pp-empty button{margin-top:12px;background:var(--ink-900);color:var(--paper-50);border:none;border-radius:999px;padding:.5em 1.1em;min-height:40px;font-weight:600}
</style>
</head>
<body>
<section class="pp" id="portfolio" aria-labelledby="pp-h">
  <div class="wrap">
    <header class="pp-head">
      <div>
        <p class="pp-eyebrow">Explore</p>
        <h2 id="pp-h">Portfolio Pulse</h2>
        <p class="pp-lede">Samyang America lists formats as separate products. FireFlow normalizes them into
          <b>45 families</b> across <b>76 formats</b>, so you browse flavors, not repetition.
          The six launch anchors lead; everything else is one click away.</p>
      </div>
      <div class="seg" role="group" aria-label="Family or format view" id="viewseg"></div>
    </header>

    <div class="pp-filters">
      <div class="chiprow" role="group" aria-label="Filter by brand" id="brandrow"></div>
      <div class="chiprow" role="group" aria-label="Filter by category" id="catrow"></div>
    </div>
    <p class="pp-count" id="count" aria-live="polite"></p>

    <ul class="bento" id="bento" aria-label="Products"></ul>
    <div id="emptyslot"></div>
  </div>
</section>

<script>
/* ---- window.FF stub (real app provides window.FF) ---- */
window.FF = window.FF || {
  brands:[
    {id:"buldak",name:"Buldak",accentToken:"--chili-600"},
    {id:"samyang",name:"Samyang",accentToken:"--samyang-accent"},
    {id:"tangle",name:"Tangle",accentToken:"--tangle-accent"},
    {id:"mep",name:"MEP",accentToken:"--mep-accent"}
  ],
  categories:[
    {id:"noodles",label:"Noodles"},{id:"hot-sauce",label:"Hot sauce"},
    {id:"soup-noodles",label:"Soup noodles"},{id:"protein-pasta",label:"Protein pasta"},
    {id:"potato-chips",label:"Potato chips"}
  ],
  formats:[
    {id:"multi",label:"Multi"},{id:"big-bowl",label:"Big Bowl"},{id:"cup",label:"Cup"},
    {id:"sauce-200g",label:"200g"},{id:"sauce-350g",label:"350g"},{id:"sauce-stick",label:"Stick"},
    {id:"bag",label:"Bag"}
  ],
  /* representative slice of the real 45 families */
  families:[
    {id:"buldak-carbonara",brand:"buldak",name:"Buldak Carbonara",category:"noodles",formats:["multi","big-bowl","cup"],popularityTier:"A",priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"moderate"},
    {id:"buldak-original",brand:"buldak",name:"Buldak Original",category:"noodles",formats:["multi","big-bowl","cup"],popularityTier:"A",priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"very-hot"},
    {id:"buldak-2x-spicy",brand:"buldak",name:"Buldak 2X Spicy",category:"noodles",formats:["multi","big-bowl","cup"],popularityTier:"A",priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"extreme"},
    {id:"buldak-habanero-lime",brand:"buldak",name:"Buldak Habanero Lime",category:"noodles",formats:["multi","big-bowl"],popularityTier:"A",priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"hot"},
    {id:"buldak-original-hot-sauce",brand:"buldak",name:"Buldak Original Hot Sauce",category:"hot-sauce",formats:["sauce-200g","sauce-350g","sauce-stick"],popularityTier:"A",priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"sauce-dependent"},
    {id:"buldak-carbonara-hot-sauce",brand:"buldak",name:"Buldak Carbonara Hot Sauce",category:"hot-sauce",formats:["sauce-200g","sauce-350g","sauce-stick"],popularityTier:"A",priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"sauce-dependent"},
    {id:"buldak-rose",brand:"buldak",name:"Buldak Rosé",category:"noodles",formats:["multi","big-bowl"],popularityTier:"B",priorityLabel:"High Priority",isAnchor:false,heatPositioning:"moderate"},
    {id:"buldak-cheese",brand:"buldak",name:"Buldak Cheese",category:"noodles",formats:["multi","big-bowl","cup"],popularityTier:"B",priorityLabel:"High Priority",isAnchor:false,heatPositioning:"moderate"},
    {id:"buldak-quattro-cheese",brand:"buldak",name:"Buldak Quattro Cheese",category:"noodles",formats:["multi","big-bowl"],popularityTier:"B",priorityLabel:"High Priority",isAnchor:false,heatPositioning:"moderate"},
    {id:"buldak-potato-chips-original",brand:"buldak",name:"Buldak Potato Chips Original",category:"potato-chips",formats:["bag"],popularityTier:"B",priorityLabel:"High Priority",isAnchor:false,heatPositioning:"hot"},
    {id:"samyang-ramen",brand:"samyang",name:"Samyang Ramen",category:"soup-noodles",formats:["multi","cup"],popularityTier:"B",priorityLabel:"Heritage Anchor",isAnchor:false,heatPositioning:"mild"},
    {id:"samyang-jjajang-ramen",brand:"samyang",name:"Samyang Jjajang Ramen",category:"soup-noodles",formats:["multi"],popularityTier:"B",priorityLabel:"High Priority",isAnchor:false,heatPositioning:"mild"},
    {id:"tangle-bulgogi-alfredo",brand:"tangle",name:"Tangle Bulgogi Alfredo",category:"protein-pasta",formats:["multi","big-bowl"],popularityTier:"B",priorityLabel:"High Priority",isAnchor:false,heatPositioning:"mild"},
    {id:"tangle-chunky-tomato",brand:"tangle",name:"Tangle Chunky Tomato",category:"protein-pasta",formats:["multi","big-bowl"],popularityTier:"B",priorityLabel:"High Priority",isAnchor:false,heatPositioning:"mild"},
    {id:"mep-black-pepper-beef",brand:"mep",name:"MEP Black Pepper & Beef",category:"soup-noodles",formats:["multi","bowl"],popularityTier:"C",priorityLabel:"Portfolio",isAnchor:false,heatPositioning:"mild"},
    {id:"mep-garlic-clam",brand:"mep",name:"MEP Garlic & Clam",category:"soup-noodles",formats:["multi","bowl"],popularityTier:"C",priorityLabel:"Portfolio",isAnchor:false,heatPositioning:"mild"}
  ],
  IMAGES:{
    byVariant:{
      "buldak-carbonara--multi":"/products/buldak-multi-carbonara.png",
      "buldak-original--multi":"/products/buldak-multi-original.png",
      "buldak-2x-spicy--multi":"/products/buldak-multi-2x-spicy.png",
      "buldak-habanero-lime--multi":"/products/buldak-multi-habanero-lime.png",
      "buldak-original-hot-sauce--sauce-200g":"/products/buldak-sauce-original.png",
      "buldak-carbonara-hot-sauce--sauce-200g":"/products/buldak-sauce-carbonara.png",
      "buldak-rose--multi":"/products/buldak-multi-rose.png",
      "buldak-cheese--multi":"/products/buldak-multi-cheese.png",
      "buldak-quattro-cheese--multi":"/products/buldak-multi-quattro-cheese.png",
      "buldak-potato-chips-original--bag":"/products/buldak-potato-original.png"
    },
    byFamily:{
      "buldak-carbonara":"/products/buldak-multi-carbonara.png","buldak-original":"/products/buldak-multi-original.png",
      "buldak-2x-spicy":"/products/buldak-multi-2x-spicy.png","buldak-habanero-lime":"/products/buldak-multi-habanero-lime.png",
      "buldak-original-hot-sauce":"/products/buldak-sauce-original.png","buldak-carbonara-hot-sauce":"/products/buldak-sauce-carbonara.png",
      "buldak-rose":"/products/buldak-multi-rose.png","buldak-cheese":"/products/buldak-multi-cheese.png",
      "buldak-quattro-cheese":"/products/buldak-multi-quattro-cheese.png","buldak-potato-chips-original":"/products/buldak-potato-original.png"
      /* samyang-*, tangle-*, mep-* intentionally absent -> silhouette */
    }
  },
  imageForVariant:function(vid,fid){return this.IMAGES.byVariant[vid]||this.IMAGES.byFamily[fid]||null}
};

/* ---- helpers (mirror preview.html) ---- */
const FF=window.FF;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const brandById=Object.fromEntries(FF.brands.map(b=>[b.id,b]));
const catById=Object.fromEntries(FF.categories.map(c=>[c.id,c]));
const fmtById=Object.fromEntries(FF.formats.map(f=>[f.id,f]));
const st={familyId:null,variantId:null,view:"family",brand:"all",cat:"all"};

const HEAT={mild:{word:"Mild",pips:1},moderate:{word:"Moderate",pips:2},hot:{word:"Hot",pips:3},
  "very-hot":{word:"Very hot",pips:4},extreme:{word:"Extreme",pips:5},
  "sauce-dependent":{word:"Heat varies",pips:0},"not-applicable":{word:"—",pips:0}};
function heatHTML(pos){
  const h=HEAT[pos]||HEAT["not-applicable"];let pips="";
  for(let i=0;i<5;i++)pips+=`<span class="pip${i<h.pips?' on':''}"></span>`;
  const label=h.pips?`Heat ${h.pips} of 5, ${h.word}`:h.word;
  return `<span class="ff-heat"><span class="pips" role="img" aria-label="${esc(label)}">${pips}</span><span class="word" aria-hidden="true">${esc(h.word)}</span></span>`;
}
/* cell span by priority: anchors large, High Priority medium, rest compact */
function spanFor(f){if(f.isAnchor)return"lg";if(f.priorityLabel==="High Priority"||f.priorityLabel==="Heritage Anchor")return"md";return"sm"}
function heroVariantId(f){return `${f.id}--${f.formats[0]}`}

/* ---- one bento cell = one product card ---- */
function cellHTML(f,i){
  const b=brandById[f.brand],cat=catById[f.category];
  const accent=b?b.accentToken:"--chili-600";
  const img=FF.imageForVariant(heroVariantId(f),f.id);
  const pressed=f.id===st.familyId;
  const nf=f.formats.length;
  const tag=f.priorityLabel;
  const media=img
    ? `<span class="ff-card-media is-loading"><img src="${esc(img)}" alt="${esc(f.name)} package" width="480" height="360" loading="lazy" decoding="async"
         onload="this.parentElement.classList.remove('is-loading')"
         onerror="this.style.display='none';this.parentElement.classList.remove('is-loading');this.parentElement.querySelector('.ff-card-fallback').setAttribute('data-show','1')">
         <span class="ff-card-fallback"><span class="fb-mark">${esc(b?b.name:'')}</span><span class="fb-name">${esc(f.name)}</span></span></span>`
    : `<span class="ff-card-media"><span class="ff-card-fallback" data-show="1"><span class="fb-mark">${esc(b?b.name:'')}</span><span class="fb-name">${esc(f.name)}</span></span></span>`;
  const formatList = st.view==="format"
    ? `<ul class="fmtlist" aria-label="${esc(f.name)} formats">${f.formats.map(fmt=>{
        const vid=`${f.id}--${fmt}`;
        return `<li><button class="fmt" data-act="pickvar" data-fid="${f.id}" data-vid="${vid}" aria-pressed="${vid===st.variantId}">${esc(fmtById[fmt]?fmtById[fmt].label:fmt)}</button></li>`;
      }).join('')}</ul>`
    : '';
  return `<li data-span="${spanFor(f)}" style="--i:${i}">
    <div class="ff-card" style="--card-accent:var(${accent})" role="group" aria-label="${esc(f.name)}">
      <button class="ff-card" style="all:unset;position:absolute;inset:0;cursor:pointer;z-index:1"
        data-act="pick" data-fid="${f.id}" aria-pressed="${pressed}"
        aria-label="Select ${esc(f.name)}, ${esc(cat?cat.label:'')}, ${esc((HEAT[f.heatPositioning]||{}).word||'')}, ${nf} format${nf>1?'s':''}"></button>
      ${tag?`<span class="ff-tag" data-anchor="${f.isAnchor?'1':'0'}">${esc(tag)}</span>`:''}
      ${media}
      <span class="ff-card-body">
        <span class="ff-card-brand">${esc(b?b.name:'')}</span>
        <span class="ff-card-name">${esc(f.name)}</span>
        ${heatHTML(f.heatPositioning)}
        <span class="ff-card-meta">${esc(cat?cat.label:'')}<span aria-hidden="true">·</span>${nf} format${nf>1?'s':''}</span>
      </span>
      ${formatList}
    </div>
  </li>`;
}

/* ---- filtering ---- */
function filtered(){
  return FF.families.filter(f=>
    (st.brand==="all"||f.brand===st.brand)&&
    (st.cat==="all"||f.category===st.cat));
}
/* categories available under the current brand */
function catsInScope(){
  const ids=new Set(FF.families.filter(f=>st.brand==="all"||f.brand===st.brand).map(f=>f.category));
  return FF.categories.filter(c=>ids.has(c.id));
}

/* ---- render pieces ---- */
function renderControls(){
  document.getElementById('viewseg').innerHTML=[["family","Family view"],["format","Format view"]]
    .map(([v,l])=>`<button data-act="view" data-view="${v}" aria-pressed="${st.view===v}">${l}</button>`).join('');
  document.getElementById('brandrow').innerHTML=[["all","All brands"],...FF.brands.map(b=>[b.id,b.name])]
    .map(([id,l])=>`<button class="chip" data-act="brand" data-brand="${id}" aria-pressed="${st.brand===id}">${id!=='all'?`<span class="chipdot" style="background:var(${brandById[id].accentToken})"></span>`:''}${l}</button>`).join('');
  document.getElementById('catrow').innerHTML=[["all","All categories"],...catsInScope().map(c=>[c.id,c.label])]
    .map(([id,l])=>`<button class="chip" data-act="cat" data-cat="${id}" aria-pressed="${st.cat===id}">${l}</button>`).join('');
}
function renderGrid(){
  const list=filtered();
  const totalFormats=list.reduce((n,f)=>n+f.formats.length,0);
  document.getElementById('count').innerHTML=`Showing <b>${list.length}</b> famil${list.length===1?'y':'ies'} · <b>${totalFormats}</b> formats`;
  const bento=document.getElementById('bento');
  const slot=document.getElementById('emptyslot');
  if(!list.length){
    bento.innerHTML='';
    slot.innerHTML=`<div class="pp-empty"><b>No families match these filters.</b>
      <p>Try a different brand, or clear the category.</p>
      <button data-act="clear">Clear filters</button></div>`;
    return;
  }
  slot.innerHTML='';
  bento.innerHTML=list.map(cellHTML).join('');
  observeGrid(bento);
}
function render(){renderControls();renderGrid()}

/* ---- assemble-on-scroll (fires once, then disconnects) ---- */
const REDUCED=matchMedia('(prefers-reduced-motion: reduce)').matches;
let io=null;
function observeGrid(bento){
  if(REDUCED||!('IntersectionObserver'in window)){bento.classList.add('is-in');return;}
  if(io)io.disconnect();
  bento.classList.remove('is-in');
  io=new IntersectionObserver((entries,obs)=>{
    entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('is-in');obs.disconnect();}});
  },{threshold:0.12});
  io.observe(bento);
}

/* ---- delegated actions (data-act, mirrors preview.html) ---- */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');if(!a)return;
  const d=a.dataset;
  if(d.act==='pick'){st.familyId=d.fid;st.variantId=`${d.fid}--${(FF.families.find(x=>x.id===d.fid)||{}).formats[0]}`;render();}
  else if(d.act==='pickvar'){st.familyId=d.fid;st.variantId=d.vid;render();}
  else if(d.act==='view'){st.view=d.view;render();}
  else if(d.act==='brand'){st.brand=d.brand;st.cat='all';render();}
  else if(d.act==='cat'){st.cat=d.cat;render();}
  else if(d.act==='clear'){st.brand='all';st.cat='all';render();}
});

render();
</script>
</body>
</html>
```

> Note: the preview nests a stretched `<button data-act="pick">` inside the card for a runnable single-file demo. In React, prefer the Product Card component's own `<button class="ff-card">` (whole card is one button) and render the format-view chips as a sibling row outside it — nested buttons are invalid HTML and only tolerated here for the standalone preview. See §5.

---

## 4. Accessibility, reduced motion, mobile

**Semantics and keyboard.** The section is a labelled `<section aria-labelledby>` with a real `<h2>`. The view toggle is a `role="group"` of `aria-pressed` buttons; the two filter rows are `role="group"` with `aria-label`. Every cell's primary action is a real button that selects the family (Tab reaches each; Enter/Space activates). In format view, each format chip is its own `aria-pressed` button and a 34–38px target. The live count uses `aria-live="polite"`, so filtering announces the new "12 families · 22 formats" without moving focus.

**No info by color, hover, or size alone.** The bento *adds* emphasis with size, but priority is always also stated as a word — the `Launch Anchor` / `High Priority` / `Heritage Anchor` / `Portfolio` tag is in the DOM on every card, so a screen-reader user gets the same tiering a sighted user infers from the layout. Heat is pips **plus** the word (see `product-card.md`). Nothing about a product is revealed only on hover.

**Reduced motion.** `prefers-reduced-motion: reduce` forces `.bento > li` to `opacity:1; transform:none` and the IntersectionObserver early-returns with `.is-in` applied immediately — the final grid is present on first paint, no stagger, no fade. The image shimmer and hover-scale are also disabled. Filtering still works; only the entrance animation is gone.

**Touch and mobile.** The grid collapses from 6 columns → 4 (≤900px) → 1 (≤560px); at the narrowest, all cells become equal single-column rows so no card is squeezed. Every interactive element clears 44px (cards are large; format chips are min-height 34–38px with generous padding — bump to 44px in the app token if QA flags it). Filters wrap onto multiple lines rather than scrolling horizontally.

---

## 5. States

- **Image loading skeleton.** Each cell's `.ff-card-media` starts `is-loading` (warm shimmer) and clears on `onload`; `width`/`height` on the `<img>` reserve the box so the assemble reveal doesn't fight layout shift.
- **Empty filter.** When a brand+category combination yields nothing, the grid is emptied and an editorial empty card appears — "No families match these filters" with a **Clear filters** button (`data-act="clear"`) — instead of a blank void. Because category chips are already scoped to the selected brand (`catsInScope`), most dead-ends are prevented before they happen.
- **Missing-image placeholder.** Every Samyang, Tangle, and MEP cell (no photography yet) renders the branded silhouette immediately; a 404 on a mapped Buldak file falls back to the same silhouette via `onerror`. The bento therefore never shows a broken image, and the brand-accent rhythm still reads because the silhouette is tinted by `--card-accent`.
- **Selected.** The selected family's cell keeps the accent glow + outline after the pointer leaves, so the current pick is visible while the user scrolls to another chapter.
- **Filtering transition.** On filter change the grid re-renders and re-observes; if the section is already in view the new set assembles once. Cells do not animate on every keystroke — the observer only fires on the entrance into view.

---

## 6. Integration

### React app

- **Component:** upgrade `src/components/home/PortfolioPulse/PortfolioPulse.tsx` in place. Keep the existing `useHome()` store wiring, `brandFilter`/`categoryFilter`/`view` state, the `filtered`/`totalVariants`/`categoriesInScope` `useMemo`s, and the `SELECT_FAMILY`/`SELECT_VARIANT`/`SET_BRAND` dispatches — none of that logic changes. Replace only the `<ul class={styles.grid}>` markup with `<ul className={styles.bento}>` and render `<ProductCard family={f} size={spanFor(f)==="lg"?"lg":"md"} selected={...} onSelect={...} />` per family (the card from `product-card.md`).
- **Span helper:** add `spanFor(family)` → `"lg" | "md" | "sm"` (anchors large, High/Heritage medium, else compact) and set it as `data-span` on the `<li>`; the CSS grid rules above handle the rest.
- **Format view:** when `view === "format"`, render the format chips as a sibling `<ul>` after the `<ProductCard>` inside the `<li>` (not nested in the card button) — each chip dispatches `SELECT_FAMILY` + `SELECT_VARIANT`, exactly as the current `styles.formatList` buttons do.
- **Assemble-on-scroll:** a `useBentoReveal(ref)` hook creates one `IntersectionObserver` on the `<ul>` in `useEffect`, adds `is-in` once, then disconnects; it early-returns (adding `is-in` immediately) when `usePrefersReducedMotion()` is true. Re-run on `filtered` change so a filtered set assembles if the section is in view.
- **CSS:** the `.bento` grid rules and reveal go in `PortfolioPulse.module.css`; the card styles live in `ProductCard.module.css` (shared). No new dependencies.

### Vanilla single-file preview

- Follows `preview.html` conventions exactly: global `window.FF`, shared `esc()`, `render*()` string builders (`renderControls`, `renderGrid`, `cellHTML`), and a delegated `click` handler on `data-act`. The verbs reuse the existing set — `pick`, `pickvar` — and add `view`, `brand`, `cat`, `clear` (the current preview uses `pfview`/`pfbrand`/`pfcat`; rename to match or keep both — they don't collide with other sections).
- **Adopting in `preview.html`:** replace the body of the existing `renderPortfolio()` with `renderControls()` + `renderGrid()`, swap the flat `.grid` for `.bento`, and reuse the shared `IMAGES`/`imageForVariant` added for the Product Card. The existing `st.pfBrand`/`st.pfCat`/`st.pfView` keys map straight onto `st.brand`/`st.cat`/`st.view` here.
- In the app the nested stretched-button hack in the preview is unnecessary: use the Product Card's own whole-card `<button>` and keep the format chips as an outside sibling row.

---

## 7. Tradeoffs and risks

- **`grid-auto-flow: dense` can reorder cells** to backfill gaps, so visual order may diverge from DOM order. DOM order (which drives Tab and screen-reader reading) stays priority-sorted — anchors first — so keyboard/AT order is correct even if a compact cell floats up into a visual gap. If the visual reshuffling ever reads as random, drop `dense` and accept occasional gaps.
- **Big imagery in large cells is the heaviest thing on the homepage.** Six anchor cells load full PNGs above the fold. Mitigation: `loading="lazy"` on offscreen cells, reserved dimensions, and — as a follow-up — `<picture>`/`webp` in the shared image resolver. Consider `fetchpriority="high"` on the first anchor only.
- **Bento hierarchy encodes an opinion** (that anchors deserve more space). That is the point, and it's defensible because it mirrors the `isAnchor`/`priorityLabel` data — but the word-tag on every card is what keeps it honest and accessible rather than "big = arbitrarily important."
- **Assemble-on-scroll must not feel like a toy.** Risk: too long or too bouncy and it reads as a marketing splash, undercutting the operational tone. Mitigation: one short (≤360ms) transform+opacity settle, 45ms stagger, fires once, no easing overshoot, fully off under reduced motion. It's a settle, not a performance.
- **Not solved here:** virtualization. Rendering all 45 families is fine; if the grid later shows every one of the 76 *variants* in format view simultaneously, revisit with windowing. At 45 families it is not warranted.
```
