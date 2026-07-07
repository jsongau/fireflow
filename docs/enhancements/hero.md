# Enhancement — Product Signal Hero

**Prepared:** 2026-07-07 · **Status:** Enhancement spec (design + drop-in recipe). Upgrades `src/components/home/ProductSignalHero`. Reads real photography from `src/data/images.ts` and real product facts from `src/data/families.ts` / `variants.ts`.

---

## 1. Concept and job competency

The current hero is a strong left-hand editorial column beside a *placeholder* stage (`ProductStage` draws a labeled package silhouette). It reads as a wireframe because the focal object is a drawing, not a product. This enhancement turns the right side into a real stage: the selected Samyang product photographed large on a dark charcoal ground, lit by a single restrained cursor-follow spotlight and given a barely-there tilt so it feels physically present without turning into a toy. The left column keeps its Fraunces headline, gains cleaner brand and role selectors, and the product picker seeds the shared selection that every downstream chapter reads.

The hero has three honest states — **first visit** (nothing selected yet, an invitation), **product selected** (the full stage with four clear next actions), and **returning** (a quiet "picking up where you left off" line). Motion is a courtesy, never a requirement: the spotlight and tilt are pure decoration and vanish under reduced-motion.

**Target-job competency —** *Set the frame for the whole customer experience.* A Manager, Customer Experience decides what a person meets first and how confidently they can act. This hero models that: it presents the product clearly, states who is looking (Explore / Consumer / Vendor), and offers four unambiguous doors — explore, compare, ask as a consumer, ask as a vendor. It is discovery designed to reduce friction, not manufacture excitement.

---

## 2. Technique reinterpreted

Three catalog techniques, each dialed down to "premium and calm" rather than "demo reel":

- **Cursor-follow radial spotlight** → a single soft light on the charcoal stage that tracks the pointer at low opacity (a warm paper-toned glow, ~14% alpha). It is a *lighting* effect on the background, not a neon halo. It is the only place the pointer changes the scene.
- **Pointer 3D tilt** → the product photo tilts a maximum of ~4° on each axis (most catalog demos use 15°+). Enough to read as a real object catching light; never enough to distort the package or hide a claim. Perspective lives on the stage, transform on the image.
- **Staggered reveal + fluid type** → on first paint the eyebrow, headline, lede, controls, and picks lift 8px and fade in with a small per-item delay; the headline uses `clamp()` so it scales from phone to desktop without breakpoints.

Everything is `transform`/`opacity` only. No glassmorphism, no gradient-border glow on the hero (that flourish belongs to the dossier frame), no cartoon flames, no AI copy.

---

## 3. Complete runnable recipe (HTML + CSS + JS)

Self-contained. Paste into a `.html` file and open. Image paths are the real app paths (`/products/<file>.png`); in a standalone file they 404 gracefully into the missing-image placeholder, which is exactly the production fallback. Serve from the app root (or a local server with `public/` mounted) to see the photography.

```html
<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FireFlow — Product Signal Hero</title>
<style>
:root{
  --ink-900:#171311; --ink-800:#221b18; --ink-700:#332924;
  --paper-50:#faf4ea; --paper-100:#f3e9da; --paper-200:#e7d8c3;
  --chili-600:#c2341d; --chili-500:#d94f2f; --chili-050:#f7e0d8;
  --carbo-400:#e79bb0; --samyang-accent:#8a5a2b; --tangle-accent:#4c7a52; --mep-accent:#4a6b7a;
  --ok-500:#4c9a2a; --info-500:#3a7ca5;
  --r-8:8px; --r-14:14px; --r-22:22px;
  --sh-1:0 1px 2px rgba(23,19,17,.08),0 2px 8px rgba(23,19,17,.06);
  --sh-2:0 12px 40px rgba(23,19,17,.28);
  --dur-1:120ms; --dur-2:220ms; --dur-3:360ms; --ease:cubic-bezier(.2,.7,.2,1);
  --ui:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --display:"Fraunces","Iowan Old Style",Georgia,serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper-50);color:var(--ink-900);font-family:var(--ui);
  -webkit-font-smoothing:antialiased}

/* ---- Hero shell: dark charcoal surface ---- */
.hero{position:relative;background:
    radial-gradient(120% 80% at 78% 18%, #241d19 0%, var(--ink-900) 60%, #100c0a 100%);
  color:var(--paper-50);overflow:clip}
.hero .inner{max-width:1160px;margin:0 auto;padding:clamp(2rem,5vw,4.5rem) clamp(1rem,4vw,2.5rem);
  display:grid;gap:clamp(1.5rem,4vw,3rem);grid-template-columns:1.05fr 1fr;align-items:center}
@media(max-width:860px){.hero .inner{grid-template-columns:1fr}}

/* ---- Left column ---- */
.eyebrow{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--carbo-400);
  margin:0 0 .9rem;font-weight:600}
h1.h1{font-family:var(--display);font-weight:560;line-height:1.04;letter-spacing:-.01em;
  font-size:clamp(2.1rem,4.6vw,3.5rem);margin:0 0 1rem;color:var(--paper-50);
  font-optical-sizing:auto}
.lede{font-size:clamp(1rem,1.4vw,1.12rem);line-height:1.55;color:var(--paper-200);
  max-width:46ch;margin:0 0 1.4rem}
.returning{font-size:.92rem;color:var(--paper-100);background:rgba(247,224,216,.06);
  border:1px solid rgba(231,155,176,.28);border-radius:var(--r-14);
  padding:.6rem .85rem;margin:0 0 1.3rem;max-width:44ch}
.returning strong{color:var(--paper-50)}
.textbtn{background:none;border:0;color:var(--carbo-400);font:inherit;font-size:.9rem;
  text-decoration:underline;text-underline-offset:2px;cursor:pointer;padding:0}

/* ---- Selectors ---- */
.controls{display:flex;flex-wrap:wrap;gap:1.2rem 2rem;margin:0 0 1.5rem}
.ctl-label{display:block;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--paper-200);margin:0 0 .45rem;font-weight:600}
.seg{display:inline-flex;background:rgba(250,244,234,.06);border:1px solid rgba(250,244,234,.14);
  border-radius:999px;padding:3px}
.seg button{appearance:none;border:0;background:none;color:var(--paper-100);font:inherit;
  font-size:.83rem;font-weight:500;padding:.4rem .8rem;border-radius:999px;cursor:pointer;
  transition:background var(--dur-1) var(--ease),color var(--dur-1) var(--ease)}
.seg button[aria-pressed=true]{background:var(--paper-50);color:var(--ink-900)}
.seg button:hover:not([aria-pressed=true]){background:rgba(250,244,234,.1)}

/* ---- Product picker ---- */
.picks{list-style:none;display:flex;flex-wrap:wrap;gap:.5rem;padding:0;margin:0}
.pick{appearance:none;border:1px solid rgba(250,244,234,.2);background:rgba(250,244,234,.04);
  color:var(--paper-100);font:inherit;font-size:.85rem;padding:.44rem .8rem;border-radius:999px;
  cursor:pointer;transition:border-color var(--dur-1) var(--ease),background var(--dur-1) var(--ease),
    transform var(--dur-1) var(--ease)}
.pick:hover{border-color:var(--carbo-400);background:rgba(231,155,176,.12)}
.pick[aria-pressed=true]{background:var(--chili-500);border-color:var(--chili-500);color:#fff;
  font-weight:600}

/* ---- Right column: the stage ---- */
.focus{position:relative}
.stage{position:relative;aspect-ratio:4/3.4;border-radius:var(--r-22);overflow:hidden;
  background:
    radial-gradient(70% 60% at 50% 30%, #2b221d 0%, #1a1512 68%, #120d0b 100%);
  box-shadow:var(--sh-2),inset 0 0 0 1px rgba(250,244,234,.06);
  perspective:1100px;isolation:isolate}
/* cursor spotlight lives here, driven by --mx/--my */
.stage::before{content:"";position:absolute;inset:0;z-index:0;pointer-events:none;
  background:radial-gradient(300px 300px at var(--mx,50%) var(--my,32%),
    rgba(247,232,214,.16),rgba(247,232,214,0) 62%);
  opacity:0;transition:opacity var(--dur-3) var(--ease)}
.stage.lit::before{opacity:1}
.tiltwrap{position:absolute;inset:0;display:grid;place-items:center;z-index:1;
  transform-style:preserve-3d}
.photo{max-width:78%;max-height:82%;object-fit:contain;
  filter:drop-shadow(0 26px 34px rgba(0,0,0,.5));
  transform:rotateX(var(--ry,0deg)) rotateY(var(--rx,0deg)) translateZ(0);
  transition:transform var(--dur-3) var(--ease);will-change:transform}
/* image skeleton */
.photo[data-loading=true]{opacity:0}
.skeleton{position:absolute;inset:12% 14%;z-index:1;border-radius:var(--r-14);
  background:linear-gradient(100deg,rgba(250,244,234,.05) 30%,rgba(250,244,234,.12) 50%,
    rgba(250,244,234,.05) 70%);background-size:200% 100%;animation:shimmer 1.3s linear infinite}
@keyframes shimmer{to{background-position:-200% 0}}
/* missing-image placeholder */
.noimg{position:absolute;inset:0;z-index:1;display:grid;place-content:center;gap:.5rem;
  text-align:center;color:var(--paper-200);padding:2rem}
.noimg .badge{font-family:var(--display);font-size:1.4rem;color:var(--paper-100)}
.noimg small{font-size:.78rem;color:var(--paper-200);opacity:.8}

/* ---- Focus meta / actions ---- */
.focus-meta{margin-top:1rem}
.focus-name{font-family:var(--display);font-size:1.5rem;font-weight:560;margin:0;color:var(--paper-50)}
.focus-sub{font-size:.9rem;color:var(--paper-200);margin:.25rem 0 .7rem}
.src{display:inline-flex;align-items:center;gap:.4rem;font-size:.74rem;letter-spacing:.04em;
  text-transform:uppercase;color:var(--paper-200)}
.src .dot{width:8px;height:8px;border-radius:50%;background:var(--ok-500)}
.actions{display:flex;flex-wrap:wrap;gap:.55rem;margin-top:1rem}
.btn{appearance:none;border:1px solid transparent;font:inherit;font-size:.87rem;font-weight:600;
  padding:.55rem .95rem;border-radius:var(--r-8);cursor:pointer;text-decoration:none;
  display:inline-flex;align-items:center;transition:transform var(--dur-1) var(--ease),
    background var(--dur-1) var(--ease),border-color var(--dur-1) var(--ease)}
.btn:active{transform:translateY(1px)}
.btn-primary{background:var(--chili-500);color:#fff}
.btn-primary:hover{background:var(--chili-600)}
.btn-secondary{background:rgba(250,244,234,.08);border-color:rgba(250,244,234,.24);color:var(--paper-50)}
.btn-secondary:hover{background:rgba(250,244,234,.16)}

/* ---- First-visit empty state ---- */
.empty{border:1px dashed rgba(250,244,234,.24);border-radius:var(--r-22);
  padding:clamp(1.5rem,4vw,2.5rem);text-align:center;background:rgba(250,244,234,.03)}
.empty h2{font-family:var(--display);font-weight:560;font-size:1.5rem;margin:0 0 .5rem;color:var(--paper-50)}
.empty p{color:var(--paper-200);margin:0;font-size:.95rem;line-height:1.5;max-width:34ch;
  margin-inline:auto}

/* ---- Focus visibility (keyboard) ---- */
.hero :is(button,a,.pick):focus-visible{outline:3px solid var(--carbo-400);outline-offset:2px;
  border-radius:var(--r-8)}

/* ---- Staggered reveal ---- */
.reveal{opacity:0;transform:translateY(8px)}
.hero.ready .reveal{opacity:1;transform:none;
  transition:opacity var(--dur-3) var(--ease),transform var(--dur-3) var(--ease)}
.hero.ready .reveal:nth-child(1){transition-delay:0ms}
.hero.ready .reveal:nth-child(2){transition-delay:60ms}
.hero.ready .reveal:nth-child(3){transition-delay:120ms}
.hero.ready .reveal:nth-child(4){transition-delay:180ms}
.hero.ready .reveal:nth-child(5){transition-delay:240ms}

/* ---- Reduced motion: static, usable ---- */
@media(prefers-reduced-motion:reduce){
  .reveal{opacity:1;transform:none;transition:none}
  .photo{transform:none!important;transition:none}
  .stage::before{display:none}
  .skeleton{animation:none}
}
</style>

<section id="hero" class="hero" aria-labelledby="hero-h">
  <div class="inner">
    <div class="copy">
      <p class="eyebrow reveal">FireFlow Product Intelligence</p>
      <h1 id="hero-h" class="h1 reveal">Know the product. Understand the friction. Resolve the experience.</h1>
      <p class="lede reveal">Explore Samyang America&rsquo;s public U.S. product portfolio, compare how each
        product is experienced, and see how consumer and vendor questions become structured Customer
        Experience workflows.</p>

      <p class="returning reveal" id="returning" hidden>
        Welcome back. Picking up where you left off: <strong id="ret-name"></strong>.
        <button class="textbtn" id="startfresh" type="button">Start fresh</button>
      </p>

      <div class="controls reveal">
        <div>
          <span class="ctl-label" id="brand-label">Brand</span>
          <div class="seg" role="group" aria-labelledby="brand-label" id="brandseg"></div>
        </div>
        <div>
          <span class="ctl-label" id="mode-label">Viewing as</span>
          <div class="seg" role="group" aria-labelledby="mode-label" id="modeseg"></div>
        </div>
      </div>

      <ul class="picks reveal" id="picks" aria-label="Choose a product"></ul>
    </div>

    <div class="focus">
      <!-- filled by render() -->
    </div>
  </div>
</section>

<script>
/* ---------- Real data (subset mirrored from families.ts / images.ts) ---------- */
const IMG = f => `/products/${f}.png`;
const FAMILIES = [
  {id:"buldak-carbonara",name:"Buldak Carbonara",brand:"buldak",accent:"--chili-600",
   cat:"Noodles",heat:"Moderate heat",img:IMG("buldak-multi-carbonara"),anchor:true,
   sub:"Walmart: 8,830 ratings",source:"official"},
  {id:"buldak-original",name:"Buldak Original",brand:"buldak",accent:"--chili-600",
   cat:"Noodles",heat:"Very hot",img:IMG("buldak-multi-original"),anchor:true,
   sub:"Walmart: 3,174 ratings",source:"official"},
  {id:"buldak-2x-spicy",name:"Buldak 2X Spicy",brand:"buldak",accent:"--chili-600",
   cat:"Noodles",heat:"Extreme heat",img:IMG("buldak-multi-2x-spicy"),anchor:true,
   sub:"The challenge anchor",source:"official"},
  {id:"buldak-habanero-lime",name:"Buldak Habanero Lime",brand:"buldak",accent:"--chili-600",
   cat:"Noodles",heat:"Hot",img:IMG("buldak-multi-habanero-lime"),anchor:true,
   sub:"U.S.-localized flavor",source:"official"},
  {id:"buldak-original-hot-sauce",name:"Buldak Original Hot Sauce",brand:"buldak",accent:"--chili-600",
   cat:"Hot sauce",heat:"Sauce-dependent",img:IMG("buldak-sauce-original"),anchor:true,
   sub:"Walmart: Overall Pick",source:"official"},
  {id:"buldak-carbonara-hot-sauce",name:"Buldak Carbonara Hot Sauce",brand:"buldak",accent:"--chili-600",
   cat:"Hot sauce",heat:"Sauce-dependent",img:IMG("buldak-sauce-carbonara"),anchor:true,
   sub:"Walmart: Overall Pick",source:"official"},
  /* a few non-anchor Buldak picks for the Buldak filter */
  {id:"buldak-cheese",name:"Buldak Cheese",brand:"buldak",accent:"--chili-600",cat:"Noodles",
   heat:"Moderate heat",img:IMG("buldak-multi-cheese"),sub:"Cheese-forward",source:"official"},
  {id:"buldak-rose",name:"Buldak Rosé",brand:"buldak",accent:"--chili-600",cat:"Noodles",
   heat:"Moderate heat",img:IMG("buldak-multi-rose"),sub:"Tomato-and-cream rosé",source:"official"},
  /* Samyang / Tangle / MEP have no photography -> exercise the placeholder state */
  {id:"samyang-ramen",name:"Samyang Ramen",brand:"samyang",accent:"--samyang-accent",
   cat:"Soup noodles",heat:"Moderate heat",img:null,sub:"Heritage soup ramen",source:"official"},
  {id:"tangle-bulgogi-alfredo",name:"Tangle Bulgogi Alfredo",brand:"tangle",accent:"--tangle-accent",
   cat:"Protein pasta",heat:"Mild",img:null,sub:"15g protein (Multi)",source:"official"},
  {id:"mep-black-pepper-beef",name:"MEP Black Pepper & Beef",brand:"mep",accent:"--mep-accent",
   cat:"Soup noodles",heat:"Mild",img:null,sub:"Black-pepper broth",source:"official"},
];
const BRAND_FILTERS=[["featured","Featured"],["buldak","Buldak"],["samyang","Samyang"],
  ["tangle","Tangle"],["mep","MEP"]];
const MODES=[["explore","Explore"],["consumer","Consumer"],["vendor","Vendor"]];
const SOURCE_COLOR={official:"--ok-500","retail-signal":"--info-500",editorial:"--samyang-accent",
  synthetic:"--paper-200"};

/* ---------- Minimal shared state (mirrors homeStore) ---------- */
const FF = { familyId:null, brand:"featured", mode:"explore", returning:false };
const esc = s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const byId = id => FAMILIES.find(f=>f.id===id) || null;
function picksFor(filter){
  if(filter==="featured") return FAMILIES.filter(f=>f.anchor);
  return FAMILIES.filter(f=>f.brand===filter).slice(0,8);
}

/* ---------- Render ---------- */
const focus = document.querySelector(".focus");
const picksEl = document.getElementById("picks");
const brandSeg = document.getElementById("brandseg");
const modeSeg = document.getElementById("modeseg");
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

function seg(container,items,current,onPick){
  container.innerHTML="";
  for(const [val,label] of items){
    const b=document.createElement("button");
    b.type="button";b.textContent=label;b.dataset.val=val;
    b.setAttribute("aria-pressed",String(val===current));
    b.addEventListener("click",()=>onPick(val));
    container.appendChild(b);
  }
}
function renderPicks(){
  const list=picksFor(FF.brand);
  picksEl.innerHTML="";
  for(const f of list){
    const li=document.createElement("li");
    const b=document.createElement("button");
    b.className="pick";b.textContent=f.name;
    b.setAttribute("aria-pressed",String(f.id===FF.familyId));
    b.addEventListener("click",()=>selectFamily(f.id));
    li.appendChild(b);picksEl.appendChild(li);
  }
}
function renderFocus(){
  const f=byId(FF.familyId);
  if(!f){
    focus.innerHTML=`
      <div class="empty">
        <h2>Pick a product to begin</h2>
        <p>Choose one of the featured products to see how FireFlow carries it through discovery,
        comparison, and support.</p>
      </div>`;
    return;
  }
  const hasImg = !!f.img;
  focus.innerHTML=`
    <div class="stage" id="stage" style="--accent:var(${f.accent})">
      ${hasImg?`<div class="skeleton" id="skel"></div>
        <div class="tiltwrap" id="tilt">
          <img class="photo" id="photo" data-loading="true" width="640" height="640"
               loading="lazy" decoding="async"
               src="${esc(f.img)}" alt="${esc(f.name)} package">
        </div>`
      :`<div class="noimg">
          <span class="badge">${esc(f.name)}</span>
          <small>Photography not in our public set for this product — staged in the app.</small>
        </div>`}
    </div>
    <div class="focus-meta">
      <p class="focus-name">${esc(f.name)}</p>
      <p class="focus-sub">${esc(f.cat)} · ${esc(f.heat)}${f.sub?` · ${esc(f.sub)}`:""}</p>
      <span class="src"><span class="dot" style="background:var(${SOURCE_COLOR[f.source]})"></span>
        ${esc(f.source==="retail-signal"?"Retail signal":f.source)}</span>
      <div class="actions">
        <a class="btn btn-primary" href="#product" data-act="explore">Explore product</a>
        <a class="btn btn-secondary" href="#compare" data-act="compare">Compare</a>
        <a class="btn btn-secondary" href="#resolve" data-act="consumer">Ask as a consumer</a>
        <a class="btn btn-secondary" href="#vendor" data-act="vendor">Ask as a vendor</a>
      </div>
    </div>`;
  if(hasImg) wireImage();
  wireActions(f);
  if(hasImg && !reduce) wireTiltSpotlight();
}
function wireImage(){
  const img=document.getElementById("photo"), skel=document.getElementById("skel");
  const done=()=>{img.dataset.loading="false";skel&&skel.remove();};
  if(img.complete && img.naturalWidth>0) done();
  img.addEventListener("load",done);
  img.addEventListener("error",()=>{
    // swap to missing-image placeholder
    const stage=document.getElementById("stage");
    stage.innerHTML=`<div class="noimg"><span class="badge">Image unavailable</span>
      <small>Serve from the app root to load /products photography.</small></div>`;
  });
}
function wireActions(f){
  focus.querySelectorAll("[data-act]").forEach(a=>{
    a.addEventListener("click",()=>{
      const act=a.dataset.act;
      if(act==="consumer"||act==="vendor") setMode(act);
      // ADD_COMPARE / navigation handled by the app in React
      console.log("action:",act,f.id);
    });
  });
}
function wireTiltSpotlight(){
  const stage=document.getElementById("stage");
  const tilt=document.getElementById("tilt");
  const MAX=4; // degrees
  stage.addEventListener("pointermove",e=>{
    const r=stage.getBoundingClientRect();
    const px=(e.clientX-r.left)/r.width, py=(e.clientY-r.top)/r.height;
    stage.style.setProperty("--mx",(px*100).toFixed(1)+"%");
    stage.style.setProperty("--my",(py*100).toFixed(1)+"%");
    tilt.style.setProperty("--rx",((px-.5)*2*MAX).toFixed(2)+"deg");
    tilt.style.setProperty("--ry",(-(py-.5)*2*MAX).toFixed(2)+"deg");
    stage.classList.add("lit");
  });
  stage.addEventListener("pointerleave",()=>{
    stage.classList.remove("lit");
    tilt.style.setProperty("--rx","0deg");tilt.style.setProperty("--ry","0deg");
  });
}

/* ---------- State transitions ---------- */
function selectFamily(id){FF.familyId=id;const f=byId(id);if(f)FF.brand=FF.brand;renderPicks();renderFocus();}
function setBrand(b){FF.brand=b;seg(brandSeg,BRAND_FILTERS,FF.brand,setBrand);renderPicks();}
function setMode(m){FF.mode=m;seg(modeSeg,MODES,FF.mode,setMode);}

/* ---------- Returning-user memory (localStorage, non-sensitive) ---------- */
function initReturning(){
  try{
    const raw=localStorage.getItem("fireflow:home");
    if(raw){
      const p=JSON.parse(raw);
      if(p.selectedFamilyId && byId(p.selectedFamilyId)){
        FF.familyId=p.selectedFamilyId; FF.returning=true;
        if(p.selectedBrand) FF.brand=p.selectedBrand;
        if(p.userMode) FF.mode=p.userMode;
      }
    }
  }catch{}
  const box=document.getElementById("returning");
  if(FF.returning){
    document.getElementById("ret-name").textContent=byId(FF.familyId).name;
    box.hidden=false;
  }
  document.getElementById("startfresh").addEventListener("click",()=>{
    FF.familyId=null;FF.returning=false;box.hidden=true;
    try{localStorage.removeItem("fireflow:home");}catch{}
    renderPicks();renderFocus();
  });
}
function persist(){
  try{localStorage.setItem("fireflow:home",JSON.stringify(
    {selectedFamilyId:FF.familyId,selectedBrand:FF.brand,userMode:FF.mode}));}catch{}
}

/* ---------- Boot ---------- */
seg(brandSeg,BRAND_FILTERS,FF.brand,setBrand);
seg(modeSeg,MODES,FF.mode,setMode);
initReturning();
renderPicks();
renderFocus();
// staggered reveal after first paint
requestAnimationFrame(()=>document.getElementById("hero").classList.add("ready"));
// persist selection on unload (demo; React persists on every change)
addEventListener("beforeunload",persist);
</script>
```

---

## 4. Accessibility, reduced motion, mobile

- **Keyboard + focus.** Every control is a real `<button>`/`<a>`. Selectors are `role="group"` with a labelled heading; picks use `aria-pressed`. A single high-contrast `:focus-visible` ring (`--carbo-400`, 3px) shows on all interactive elements against the dark ground.
- **One `h1`.** The hero owns the page's only `h1`. The empty-state title is an `h2` (still the highest heading in the focus region, below the hero `h1`).
- **No info by hover/color alone.** The source badge is a dot **plus** a word ("Official"). The selected product is conveyed by `aria-pressed` and a filled chili chip, not color alone. The spotlight/tilt add nothing semantic.
- **Images.** Real `alt` text (`"<name> package"`), explicit `width`/`height` to reserve space and prevent layout shift, `loading="lazy"` + `decoding="async"`.
- **Reduced motion.** `prefers-reduced-motion:reduce` removes the reveal transition, disables tilt (`transform:none!important`), hides the spotlight, and stops the skeleton shimmer. The pointer listeners are never wired when reduce is set, so the scene is fully static and usable.
- **Mobile.** Grid collapses to one column at 860px; the stage keeps its aspect ratio and drops below the copy. Type scales via `clamp()`. Tilt/spotlight are pointer-driven, so touch users simply get the clean static stage.

---

## 5. States

| State | Trigger | What renders |
|---|---|---|
| **First visit** | no `selectedFamilyId` | dashed "Pick a product to begin" card; picker invites selection |
| **Product selected** | a pick chosen | full charcoal stage, photo, meta, source badge, four actions |
| **Returning** | localStorage has a valid family | "Welcome back… <name>" line + Start fresh; selection restored |
| **Image skeleton** | photo requested, not yet loaded | shimmering `.skeleton` over the stage; photo at `opacity:0` |
| **Missing image** | family has no photo (Samyang/Tangle/MEP) *or* `onerror` | `.noimg` block: product name + honest "not in our public set" note |

---

## 6. Integration notes

**React (`ProductSignalHero.tsx`).**
- Keep the current `useHome()` wiring. Replace the `<ProductStage .../>` call in `.focus` with a new `<HeroStage>` that resolves the photo via `imageForVariant(state.selectedVariantId, family.id)` from `@/data/images.ts`, falling back to `IMAGE_BY_FAMILY[family.id]`; when it returns `null`, render the `.noimg` placeholder (this is why Samyang/Tangle/MEP degrade honestly).
- Props: `HeroStage({ src: string | null, name, brandName, accentToken })`. Track `loading` state; on `<img onLoad>` clear the skeleton, on `onError` swap to the placeholder.
- Tilt/spotlight: a `useEffect` that attaches `pointermove`/`pointerleave` to the stage ref and sets CSS custom properties, guarded by `useReducedMotion()` (or a `matchMedia` check) so it never attaches under reduce. Clean up listeners on unmount.
- Actions keep the existing dispatches: Explore → `href="#product"`; Compare → `dispatch({type:"ADD_COMPARE",familyId})`; Ask as a consumer/vendor → `dispatch({type:"SET_MODE",mode})`. The picker keeps `dispatch({type:"SELECT_FAMILY",familyId})`, which already seeds `selectedVariantId` + `selectedBrand` in the reducer — the shared state the rest of the page reads.
- Returning line already exists via `state.returningUser`; keep it.

**Vanilla preview.** Global `FF` mirrors the store shape (`familyId`/`brand`/`mode`). `esc()` guards all interpolated text. `IMG(file)` builds the real `/products/<file>.png` path. Actions carry `data-act` so a host page can intercept them. `localStorage` key `fireflow:home` matches the app, so the preview and the app share returning-user memory.

---

## 7. Tradeoffs and risks

- **Photography rights / availability.** `ProductStage` exists because official imagery had unresolved rights. This spec assumes the verified `/products/*.png` set is cleared for the portfolio; anything unmapped (all Samyang/Tangle/MEP, Mac & Cheese Sweet Corn) must fall through to the placeholder, never a broken image. The `imageForVariant` resolver already encodes this.
- **Tilt can feel gimmicky if over-tuned.** Capped at 4° and perspective-limited; resist raising it. If QA finds it distracting on trackpads, ship spotlight-only.
- **Pointer effects on hybrid devices.** A touch tap on a laptop with a mouse could momentarily light the stage; harmless and non-semantic. Gate on `matchMedia("(pointer:fine)")` if you want to be strict.
- **Contrast on the dark stage.** All text uses `--paper-*` on charcoal; verify AA (the paper-200 sub-line on `#1a1512` passes for ≥16px). Do not drop sub-text below 14px on the dark ground.
- **Layout shift.** Explicit image dimensions + reserved `aspect-ratio` stage prevent CLS even before the photo loads.
