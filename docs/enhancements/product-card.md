# Enhancement — Product Card

**Prepared:** 2026-07-07 · **Status:** Enhancement spec (design + drop-in recipe). The reusable card that replaces the flat `.card` used in Portfolio Pulse, rankings-linked lists, and the Dossier "Related" chips. One component, three surfaces.

---

## 1. Concept and job competency

The current portfolio card is a white rectangle with a 6px accent stripe and three lines of text (`PortfolioPulse.tsx`, `.card`). It reads as a database row. Samyang's portfolio is *food* — Buldak Carbonara has a pink lid, the 2X Spicy pack is aggressively red, the sauces are glossy bottles. The card should lead with the real product photograph as a focal object on a warm ground, the way a premium grocery or a good menu presents a dish, while every operational fact stays legible in plain text.

The card carries four facts that a CX manager actually triages on: **brand**, **name**, **heat** (as a labeled indicator, never color), and **reach** (priority label + how many formats sit under the family). Clicking anywhere selects the product and drives the shared store, so the same click works whether the card is in the grid, a ranking row, or a related-products strip.

**Target-job competency:** *Present a large, repetitive catalog so a person can recognize and act on the right item fast.* Samyang America lists 76 formats as separate SKUs; FireFlow normalizes them into 45 families. A card that makes a family instantly recognizable — by its actual photo and a heat word you can read — is the retrieval half of good customer experience: the manager (or a customer) finds the exact product before anyone types a word.

---

## 2. Technique reinterpreted

Three catalog techniques, reinterpreted so they stay **decorative only** — every fact is present in the DOM as text regardless of motion or pointer:

- **Pointer 3D tilt.** On `pointermove` the card tilts a few degrees toward the cursor (`rotateX/rotateY` on an inner wrapper). It gives the photographed package a sense of being a real object you can turn. Capped at ~6°, transform-only, and reset on leave.
- **Single moving glare.** One soft diagonal highlight (`::after`, `mix-blend-mode: soft-light`) tracks the pointer across the image — a reflection sliding over glossy packaging, not a neon sweep. Exactly one, low opacity.
- **Brand-accent glowing border.** On hover/focus a gradient ring appears using the `::before` + `mask-composite: exclude` cutout so only the 1.5px border glows in the family's brand color (`--card-accent`). It signals "this is the one you're pointing at" without moving layout.

All three are gated behind `(hover: hover) and (pointer: fine)` and `prefers-reduced-motion: no-preference`. With reduced motion or on touch, the card is a flat, fully usable button — the tilt, glare, and glow simply never attach.

---

## 3. Complete runnable recipe

Self-contained. Save as `product-card-preview.html` and open it. Real anchors, real image paths from `src/data/images.ts`, and the branded-silhouette fallback for the Samyang/Tangle/MEP families that have no photography yet.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FireFlow — Product Card preview</title>
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
body{margin:0;font-family:var(--font-ui);color:var(--ink-800);background:var(--paper-50);line-height:1.55;-webkit-font-smoothing:antialiased;padding:40px 16px}
h1{font-family:var(--font-display);font-weight:700}
:focus-visible{outline:3px solid var(--info-500);outline-offset:3px;border-radius:var(--r-md)}
.wrap{max-width:1080px;margin:0 auto}
.demo-grid{list-style:none;padding:0;margin:24px 0 0;display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:18px}

/* ===================== PRODUCT CARD ===================== */
.ff-card{
  position:relative;display:block;width:100%;text-align:left;
  background:linear-gradient(180deg,var(--paper-50),#fff 42%);
  border:1px solid var(--line);border-radius:var(--r-md);
  box-shadow:var(--sh1);padding:0;cursor:pointer;
  color:var(--ink-800);font-family:var(--font-ui);
  transition:box-shadow var(--dur-2) var(--ease-out),transform var(--dur-2) var(--ease-out);
  transform-style:preserve-3d;perspective:900px;isolation:isolate;
}
.ff-card:hover{box-shadow:var(--sh2)}
.ff-card[aria-pressed="true"]{border-color:var(--card-accent,var(--chili-600))}

/* glowing brand-accent border via mask-composite cutout (::before ring) */
.ff-card::before{
  content:"";position:absolute;inset:0;border-radius:inherit;padding:1.5px;pointer-events:none;
  background:linear-gradient(135deg,var(--card-accent,var(--chili-600)),#ffffff00 40%,#ffffff00 60%,var(--card-accent,var(--chili-600)));
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask-composite:exclude;
  opacity:0;transition:opacity var(--dur-2) var(--ease-out);z-index:3;
}
.ff-card:hover::before,.ff-card:focus-visible::before,.ff-card[aria-pressed="true"]::before{opacity:1}

/* the tilt target — everything visible lives inside so the hit-area stays flat */
.ff-card-tilt{
  display:block;border-radius:inherit;
  transform:rotateX(0deg) rotateY(0deg);
  transition:transform var(--dur-2) var(--ease-out);
  will-change:transform;transform-style:preserve-3d;
}

/* hero media on a soft warm ground */
.ff-card-media{
  position:relative;display:grid;place-items:center;
  aspect-ratio:4/3;border-radius:var(--r-md) var(--r-md) 0 0;overflow:hidden;
  background:
    radial-gradient(120% 100% at 50% 18%,#ffffff 0%,var(--paper-100) 55%,var(--paper-200) 100%);
}
.ff-card-media img{
  max-width:78%;max-height:82%;object-fit:contain;
  filter:drop-shadow(0 10px 16px #00000026);
  transform:translateZ(30px) scale(1);
  transition:transform var(--dur-3) var(--ease-out);
}
.ff-card:hover .ff-card-media img{transform:translateZ(30px) scale(1.05)}

/* single moving glare */
.ff-card-glare{
  position:absolute;inset:-40%;pointer-events:none;opacity:0;
  background:radial-gradient(closest-side,#ffffffcc,#ffffff00 70%);
  mix-blend-mode:soft-light;
  transform:translate(var(--gx,50%),var(--gy,20%));
  transition:opacity var(--dur-2) var(--ease-out);z-index:2;
}
.ff-card:hover .ff-card-glare{opacity:.9}

/* branded silhouette fallback (Samyang / Tangle / MEP have no photo) */
.ff-card-fallback{
  display:none;width:56%;aspect-ratio:3/4;border-radius:12px;
  background:linear-gradient(165deg,#fff,var(--paper-100));
  border:1px solid #00000012;box-shadow:var(--sh1);
  position:relative;overflow:hidden;place-items:end center;padding:14px;text-align:center;
}
.ff-card-fallback[data-show="1"]{display:grid}
.ff-card-fallback::before{content:"";position:absolute;inset:0 0 auto 0;height:38%;background:var(--card-accent,var(--samyang-accent));opacity:.9}
.ff-card-fallback .fb-mark{position:absolute;top:8px;left:0;right:0;color:#fff;font-family:var(--font-display);font-weight:700;font-size:1.1rem}
.ff-card-fallback .fb-name{position:relative;font-family:var(--font-display);font-weight:700;color:var(--ink-900);font-size:.92rem;line-height:1.1}

/* image loading skeleton */
.ff-card-media.is-loading{background:linear-gradient(100deg,var(--paper-100) 30%,var(--paper-50) 50%,var(--paper-100) 70%);background-size:200% 100%;animation:ffshimmer 1.4s linear infinite}
@keyframes ffshimmer{to{background-position:-200% 0}}
.ff-card-media.is-loading img{opacity:0}

/* body */
.ff-card-body{display:grid;gap:6px;padding:14px 16px 16px;position:relative;z-index:1}
.ff-card-brand{font-size:.68rem;text-transform:uppercase;letter-spacing:.08em;color:var(--slate-400);font-weight:700}
.ff-card-name{font-family:var(--font-display);font-weight:700;font-size:1.18rem;line-height:1.12;color:var(--ink-900)}
.ff-card-meta{font-size:.82rem;color:var(--slate-600);display:flex;gap:8px;align-items:center;flex-wrap:wrap}

/* heat indicator: dots + word, never color-only */
.ff-heat{display:inline-flex;align-items:center;gap:7px;font-size:.8rem;font-weight:600;color:var(--ink-700)}
.ff-heat .pips{display:inline-flex;gap:3px}
.ff-heat .pip{width:7px;height:7px;border-radius:50%;border:1px solid var(--slate-400);background:transparent}
.ff-heat .pip.on{background:var(--ink-700);border-color:var(--ink-700)}
.ff-heat .word{color:var(--slate-600)}

/* priority / anchor tag */
.ff-tag{
  position:absolute;top:10px;left:10px;z-index:3;
  font-size:.66rem;font-weight:700;letter-spacing:.03em;text-transform:uppercase;
  padding:.28em .6em;border-radius:999px;
  background:#ffffffe6;border:1px solid var(--line);color:var(--ink-800);
  backdrop-filter:saturate(1.1);
}
.ff-tag[data-anchor="1"]{color:#fff;background:var(--card-accent,var(--chili-600));border-color:transparent}

/* disable all decoration where it shouldn't run */
@media (prefers-reduced-motion: reduce){
  .ff-card,.ff-card-tilt,.ff-card-media img{transition:none}
  .ff-card-tilt{transform:none!important}
  .ff-card-glare{display:none}
  .ff-card:hover .ff-card-media img{transform:translateZ(30px)}
  .ff-card-media.is-loading{animation:none}
}
@media (hover: none),(pointer: coarse){
  .ff-card-glare{display:none}
  .ff-card-tilt{transform:none!important}
}
</style>
</head>
<body>
<div class="wrap">
  <h1>Product card</h1>
  <p style="color:var(--slate-600)">Real photos where they exist; branded silhouette for Samyang / Tangle / MEP. Tilt, glare, and glow are decorative — every fact is text.</p>
  <ul class="demo-grid" id="grid" aria-label="Products"></ul>
</div>

<script>
/* ---- window.FF stub (the real app already provides window.FF) ---- */
window.FF = window.FF || {
  brands:[
    {id:"buldak",name:"Buldak",accentToken:"--chili-600"},
    {id:"samyang",name:"Samyang",accentToken:"--samyang-accent"},
    {id:"tangle",name:"Tangle",accentToken:"--tangle-accent"},
    {id:"mep",name:"MEP",accentToken:"--mep-accent"}
  ],
  categories:[
    {id:"noodles",label:"Noodles"},{id:"hot-sauce",label:"Hot sauce"},
    {id:"soup-noodles",label:"Soup noodles"},{id:"protein-pasta",label:"Protein pasta"}
  ],
  /* a representative slice of the 45 families */
  families:[
    {id:"buldak-carbonara",brand:"buldak",name:"Buldak Carbonara",category:"noodles",formats:["multi","big-bowl","cup"],priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"moderate"},
    {id:"buldak-original",brand:"buldak",name:"Buldak Original",category:"noodles",formats:["multi","big-bowl","cup"],priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"very-hot"},
    {id:"buldak-2x-spicy",brand:"buldak",name:"Buldak 2X Spicy",category:"noodles",formats:["multi","big-bowl","cup"],priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"extreme"},
    {id:"buldak-habanero-lime",brand:"buldak",name:"Buldak Habanero Lime",category:"noodles",formats:["multi","big-bowl"],priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"hot"},
    {id:"buldak-original-hot-sauce",brand:"buldak",name:"Buldak Original Hot Sauce",category:"hot-sauce",formats:["sauce-200g","sauce-350g","sauce-stick"],priorityLabel:"Launch Anchor",isAnchor:true,heatPositioning:"sauce-dependent"},
    {id:"buldak-rose",brand:"buldak",name:"Buldak Rosé",category:"noodles",formats:["multi","big-bowl"],priorityLabel:"High Priority",isAnchor:false,heatPositioning:"moderate"},
    {id:"samyang-ramen",brand:"samyang",name:"Samyang Ramen",category:"soup-noodles",formats:["multi","cup"],priorityLabel:"Heritage Anchor",isAnchor:false,heatPositioning:"mild"},
    {id:"tangle-bulgogi-alfredo",brand:"tangle",name:"Tangle Bulgogi Alfredo",category:"protein-pasta",formats:["multi","big-bowl"],priorityLabel:"High Priority",isAnchor:false,heatPositioning:"mild"}
  ],
  /* IMAGES: variant id -> path, then family id -> hero path. From src/data/images.ts */
  IMAGES:{
    byVariant:{
      "buldak-carbonara--multi":"/products/buldak-multi-carbonara.png",
      "buldak-original--multi":"/products/buldak-multi-original.png",
      "buldak-2x-spicy--multi":"/products/buldak-multi-2x-spicy.png",
      "buldak-habanero-lime--multi":"/products/buldak-multi-habanero-lime.png",
      "buldak-original-hot-sauce--sauce-200g":"/products/buldak-sauce-original.png",
      "buldak-rose--multi":"/products/buldak-multi-rose.png"
    },
    byFamily:{
      "buldak-carbonara":"/products/buldak-multi-carbonara.png",
      "buldak-original":"/products/buldak-multi-original.png",
      "buldak-2x-spicy":"/products/buldak-multi-2x-spicy.png",
      "buldak-habanero-lime":"/products/buldak-multi-habanero-lime.png",
      "buldak-original-hot-sauce":"/products/buldak-sauce-original.png",
      "buldak-rose":"/products/buldak-multi-rose.png"
      /* samyang-ramen, tangle-bulgogi-alfredo: intentionally absent -> silhouette */
    }
  },
  imageForVariant:function(variantId,familyId){
    return this.IMAGES.byVariant[variantId] || this.IMAGES.byFamily[familyId] || null;
  }
};

/* ---- shared helpers (mirror preview.html) ---- */
const FF = window.FF;
const esc=s=>String(s==null?'':s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const brandById=Object.fromEntries(FF.brands.map(b=>[b.id,b]));
const catById=Object.fromEntries(FF.categories.map(c=>[c.id,c]));
const st={familyId:null};

/* heat word + pip count. Word is authoritative; pips are reinforcement. */
const HEAT={
  "mild":{word:"Mild",pips:1},
  "moderate":{word:"Moderate",pips:2},
  "hot":{word:"Hot",pips:3},
  "very-hot":{word:"Very hot",pips:4},
  "extreme":{word:"Extreme",pips:5},
  "sauce-dependent":{word:"Heat varies",pips:0},
  "not-applicable":{word:"—",pips:0}
};
function heatHTML(pos){
  const h=HEAT[pos]||HEAT["not-applicable"];
  let pips="";
  for(let i=0;i<5;i++)pips+=`<span class="pip${i<h.pips?' on':''}"></span>`;
  const label=h.pips?`Heat ${h.pips} of 5, ${h.word}`:h.word;
  return `<span class="ff-heat"><span class="pips" role="img" aria-label="${esc(label)}">${pips}</span><span class="word" aria-hidden="true">${esc(h.word)}</span></span>`;
}

/* image variant id = first format (mirror app's default-variant rule) */
function heroVariantId(f){return `${f.id}--${f.formats[0]}`}

/* ---- the card render-string builder ---- */
function cardHTML(f){
  const b=brandById[f.brand];
  const cat=catById[f.category];
  const accent=b?b.accentToken:"--chili-600";
  const img=FF.imageForVariant(heroVariantId(f),f.id);
  const pressed=f.id===st.familyId;
  const nf=f.formats.length;
  const tag=f.priorityLabel||(f.isAnchor?"Anchor":"");
  const media=img
    ? `<span class="ff-card-media is-loading">
         <img src="${esc(img)}" alt="${esc(f.name)} package" width="480" height="360" loading="lazy" decoding="async"
              onload="this.parentElement.classList.remove('is-loading')"
              onerror="this.style.display='none';this.parentElement.classList.remove('is-loading');this.parentElement.querySelector('.ff-card-fallback').setAttribute('data-show','1')">
         <span class="ff-card-glare" aria-hidden="true"></span>
         <span class="ff-card-fallback"><span class="fb-mark">${esc(b?b.name:'')}</span><span class="fb-name">${esc(f.name)}</span></span>
       </span>`
    : `<span class="ff-card-media">
         <span class="ff-card-glare" aria-hidden="true"></span>
         <span class="ff-card-fallback" data-show="1"><span class="fb-mark">${esc(b?b.name:'')}</span><span class="fb-name">${esc(f.name)}</span></span>
       </span>`;
  return `<li>
    <button class="ff-card" style="--card-accent:var(${accent})" data-act="pick" data-fid="${f.id}"
      aria-pressed="${pressed}" aria-label="${esc(f.name)}, ${esc(cat?cat.label:'')}, ${esc(HEAT[f.heatPositioning]?HEAT[f.heatPositioning].word:'')}, ${nf} format${nf>1?'s':''}">
      ${tag?`<span class="ff-tag" data-anchor="${f.isAnchor?'1':'0'}">${esc(tag)}</span>`:''}
      <span class="ff-card-tilt">
        ${media}
        <span class="ff-card-body">
          <span class="ff-card-brand">${esc(b?b.name:'')}</span>
          <span class="ff-card-name">${esc(f.name)}</span>
          ${heatHTML(f.heatPositioning)}
          <span class="ff-card-meta">${esc(cat?cat.label:'')}<span aria-hidden="true">·</span>${nf} format${nf>1?'s':''}</span>
        </span>
      </span>
    </button>
  </li>`;
}

function render(){
  document.getElementById('grid').innerHTML=FF.families.map(cardHTML).join('');
  attachTilt();
}

/* ---- delegated selection (data-act, mirrors preview.html) ---- */
document.addEventListener('click',e=>{
  const a=e.target.closest('[data-act]');if(!a)return;
  if(a.dataset.act==='pick'){st.familyId=a.dataset.fid;render();}
});

/* ---- pointer tilt + glare (decorative; gated) ---- */
const CAN_TILT = matchMedia('(hover: hover) and (pointer: fine)').matches
  && !matchMedia('(prefers-reduced-motion: reduce)').matches;
function attachTilt(){
  if(!CAN_TILT)return;
  document.querySelectorAll('.ff-card').forEach(card=>{
    const tilt=card.querySelector('.ff-card-tilt');
    const glare=card.querySelector('.ff-card-glare');
    let raf=null;
    card.addEventListener('pointermove',ev=>{
      const r=card.getBoundingClientRect();
      const px=(ev.clientX-r.left)/r.width;   // 0..1
      const py=(ev.clientY-r.top)/r.height;   // 0..1
      if(raf)cancelAnimationFrame(raf);
      raf=requestAnimationFrame(()=>{
        const ry=(px-0.5)*12;   // deg, max ~6
        const rx=(0.5-py)*12;
        tilt.style.transform=`rotateX(${rx}deg) rotateY(${ry}deg)`;
        if(glare){glare.style.setProperty('--gx',(px*100-20)+'%');glare.style.setProperty('--gy',(py*100-30)+'%');}
      });
    });
    card.addEventListener('pointerleave',()=>{
      if(raf)cancelAnimationFrame(raf);
      tilt.style.transform='';
    });
  });
}

render();
</script>
</body>
</html>
```

---

## 4. Accessibility, reduced motion, mobile

**Semantics and keyboard.** The card *is* a `<button aria-pressed>` — one tab stop, Enter/Space activates, native focus, and the pressed state is exposed to assistive tech. It carries a full `aria-label` ("Buldak 2X Spicy, Noodles, Extreme, 3 formats") so a screen-reader user hears every fact the sighted layout shows. The heat pips are wrapped in a `role="img"` with a spoken label ("Heat 5 of 5, Extreme"); the visible word is `aria-hidden` to avoid a double read. Focus shows the 3px `--info-500` ring (offset outside the card) and the same accent glow sighted hover gets.

**No info by hover or color alone.** Heat is always rendered as **pips + the word** in the static body — it is never revealed on hover and never encoded in color (the accent glow is purely "you're pointing here"). The priority/anchor tag is a word ("Launch Anchor"), not a colored dot. Tilt, glare, and the glow border add nothing to comprehension; remove them and the card is complete.

**Reduced motion.** `prefers-reduced-motion: reduce` and the `CAN_TILT` guard mean the JS listeners never attach, the tilt/scale transitions are zeroed, the glare is `display:none`, and the skeleton shimmer stops. The card appears static, flat, and fully usable — same layout, same facts, same selection behavior.

**Touch and mobile.** Under `(hover:none)/(pointer:coarse)` the tilt and glare are disabled (no hover to track), so touch users get a clean flat card. The whole card is the target, far above the 44px minimum. The grid uses `minmax(240px,1fr)` so cards reflow to one column on narrow screens without clipping the photo.

---

## 5. States

- **Image loading skeleton.** `.ff-card-media.is-loading` shows a warm shimmer behind a hidden `<img>`; `onload` removes the class. Cards never pop in blank, and `width`/`height` on the `<img>` reserve the 4:3 box so nothing shifts (CLS = 0).
- **Missing-image placeholder.** When `imageForVariant` returns `null` (every Samyang, Tangle, MEP family, and Buldak Mac & Cheese Sweet Corn), the card renders the **branded silhouette** immediately (`data-show="1"`): a package-shaped block with the accent lid and the product name. If a mapped file 404s at runtime, `onerror` swaps to the same silhouette — never a broken-image icon.
- **Selected.** `aria-pressed="true"` sets a persistent accent border and keeps the glow on, so the current selection is obvious after the pointer leaves.
- **Empty context.** The card itself is never empty; the *grid* handles "no matches" (see the Bento spec's empty-filter state). A lone card with no data is not a valid state — the builder requires a family.

---

## 6. Integration

### React app

- **Component:** `src/components/product/ProductCard/ProductCard.tsx` + `ProductCard.module.css` (the CSS above) + `useCardTilt.ts` (the pointer/glare hook, guarded by a `usePrefersReducedMotion()` + `matchMedia('(pointer:fine)')` check so it no-ops on touch/reduced-motion).
- **Props:**
  ```ts
  interface ProductCardProps {
    family: ProductFamily;                 // from src/data/families.ts
    variantId?: string;                    // optional: image + selection target (defaults to `${id}--${formats[0]}`)
    selected?: boolean;                    // -> aria-pressed
    onSelect: (familyId: string, variantId?: string) => void;  // dispatch SELECT_FAMILY / SELECT_VARIANT
    size?: "sm" | "md" | "lg";             // lg = bento featured cell (see Bento spec)
  }
  ```
- **Data:** brand accent via `BRAND_BY_ID[family.brand].accentToken` -> `--card-accent`; image via `imageForVariant(variantId, family.id)` from `src/data/images.ts`, with the `ProductStage`/silhouette as the `onError` and null-return fallback. Heat from `family.heatPositioning`; the pip/word map lives in a small `heatLabel.ts` so the Dossier and cards agree. Formats count is `family.formats.length`; tag is `family.priorityLabel`.
- **Where it mounts:** replaces the inline `.card` markup in `PortfolioPulse.tsx`, the family name button in the rankings list rows, and the `.relchip` related-products strip in the Dossier — all three call the same `onSelect` that today dispatches `SELECT_FAMILY`.

### Vanilla single-file preview

- Follows `preview.html` conventions exactly: global `window.FF`, the shared `esc()` helper, a `cardHTML(f)` render-string builder, and the delegated `click` handler keyed on `data-act="pick"` (the existing action — no new verb needed).
- **One addition to `FF`:** the `IMAGES` map (`byVariant` / `byFamily`) plus `imageForVariant(variantId, familyId)`, ported verbatim from `src/data/images.ts`. `preview.html`'s current `stageHTML()` fake-package placeholder is replaced by `cardHTML()`; the silhouette becomes the fallback path, so the preview and the app share one image resolver.

---

## 7. Tradeoffs and risks

- **Real photos are heavyweight.** 45+ PNGs at grid scale is real bandwidth. Mitigation: `loading="lazy"` + reserved `width`/`height`, `decoding="async"`, and only the family/first-format hero loads per card (not every variant). If it ever bites, swap `/products/*.png` for a responsive `<picture>` with `webp` and `srcset` — the builder is the only touch-point.
- **Tilt on a native `<button>` with 3D transform** can, on some engines, subtly affect click hit-testing at extreme angles. Mitigation: the tilt lives on an inner `.ff-card-tilt` wrapper while the `<button>` stays flat, and the angle is capped at ~6°. The button, not the tilted layer, owns the pointer.
- **`mask-composite` support.** The glowing border needs `mask-composite: exclude` (and `-webkit-mask-composite: xor`). Modern evergreen browsers have it; where absent the ring simply doesn't paint and the card falls back to its solid `border` + accent border-color on select — no loss of function, only of flourish.
- **Silhouette vs. photo inconsistency.** A grid mixing real Buldak photos with silhouette Samyang/Tangle/MEP cards can look uneven. That is honest (the photography genuinely doesn't exist yet) and the silhouette is deliberately branded and calm rather than a gray box. When real assets land, only the `IMAGES` map changes.
- **Not solved here:** multi-variant imagery on the card face (e.g. showing Cup vs. Big Bowl). The card shows one hero; format-level imagery is the Dossier's job. Keeping the card to a single focal object is deliberate — recognition first, detail on the product page.
```
