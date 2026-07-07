# Enhancement — Product Dossier

**Prepared:** 2026-07-07 · **Status:** Enhancement spec (design + drop-in recipe). Upgrades `src/components/home/ProductDossier`. Reads real photography from `src/data/images.ts` and real format-bound facts from `src/data/variants.ts`.

---

## 1. Concept and job competency

The current dossier is correct but flat: a placeholder stage on the left, a stack of definition lists and a fact card on the right. This enhancement makes the product itself the anchor. A large real photograph sits inside a **glowing brand-accent frame** and **swaps when the format selector changes** (Multi → Big Bowl → Cup show different packaging). The right column keeps its honest, format-bound fact card — allergens, preparation, in-the-package, storage, retail signal, each with a source dot-and-word and a confidence badge, and the explicit "verify the package" line wherever a format carries no official data. Below it, an accessible tabbed **anatomy** organizes the deeper reading into Flavor / Preparation / In the package / Questions, so the panel is scannable instead of a scroll. Related products appear as thumbnail chips; save and consumer/vendor inquiry actions close it out. Emphasis shifts with mode — consumer questions lead in consumer mode, vendor questions in vendor mode.

**Target-job competency —** *Give a precise, sourced answer for the exact thing in front of the customer.* A Manager, Customer Experience cannot say "noodles contain milk" when the milk is in one flavor's Multi pack and unverified for its Cup. This dossier is that discipline rendered as UI: facts are bound to the specific format, sourced, confidence-rated, and never borrowed across formats. Where the data stops, the interface says so plainly instead of guessing — the honest posture a real CX and food-safety function must hold.

---

## 2. Technique reinterpreted

- **Glowing gradient border (mask-composite)** → a brand-accent frame around the photo. A conic/linear gradient fill is clipped to a 1.5px ring using `mask-composite: exclude`, so only the border glows — no filled box, no glassmorphism. The accent is the family's brand token (`--chili-600` Buldak, `--samyang-accent`, `--tangle-accent`, `--mep-accent`). A soft outer bloom (blurred pseudo-element at low alpha) reads as "lit," and it *breathes* only on hover, holding still when motion is reduced.
- **CSS-only tabs via radio, JS-enhanced** → the anatomy tabs work with zero JavaScript: hidden radio inputs + labels, and `:checked ~ .panel` reveals the matching panel. Progressive enhancement then upgrades them to real ARIA `tablist`/`tab`/`tabpanel` with roving `Tab`/arrow-key focus. If the script never runs, the radios still switch panels and remain keyboard-operable.
- **Hover image scale** → the swapped photo scales ~1.03 on hover inside the clipped frame — a small "pick it up" cue, disabled under reduced motion.
- **Cross-fade on format swap** → changing format fades the outgoing photo out and the incoming in (opacity only), so the swap reads as the same object changing package, not a hard cut.

---

## 3. Complete runnable recipe (HTML + CSS + JS)

Self-contained. Real app image paths; they 404 gracefully into the placeholder in a bare file, and load when served from the app root.

```html
<!doctype html>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>FireFlow — Product Dossier</title>
<style>
:root{
  --ink-900:#171311; --ink-800:#221b18; --ink-700:#332924;
  --paper-50:#faf4ea; --paper-100:#f3e9da; --paper-200:#e7d8c3;
  --chili-600:#c2341d; --chili-500:#d94f2f; --chili-050:#f7e0d8;
  --carbo-400:#e79bb0; --samyang-accent:#8a5a2b; --tangle-accent:#4c7a52; --mep-accent:#4a6b7a;
  --ok-500:#4c9a2a; --info-500:#3a7ca5;
  --r-8:8px; --r-14:14px; --r-22:22px;
  --sh-1:0 1px 2px rgba(23,19,17,.08),0 2px 8px rgba(23,19,17,.06);
  --sh-2:0 12px 40px rgba(23,19,17,.16);
  --dur-1:120ms; --dur-2:220ms; --dur-3:360ms; --ease:cubic-bezier(.2,.7,.2,1);
  --ui:"Inter",system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;
  --display:"Fraunces","Iowan Old Style",Georgia,serif;
}
*{box-sizing:border-box}
body{margin:0;background:var(--paper-50);color:var(--ink-900);font-family:var(--ui);
  -webkit-font-smoothing:antialiased}
.section{padding:clamp(2rem,5vw,4rem) clamp(1rem,4vw,2.5rem)}
.inner{max-width:1120px;margin:0 auto}
.eyebrow{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:var(--chili-600);
  margin:0 0 .4rem;font-weight:600}
h2.h2{font-family:var(--display);font-weight:560;font-size:clamp(1.7rem,3vw,2.4rem);
  letter-spacing:-.01em;margin:0 0 1.6rem;color:var(--ink-900)}
.grid{display:grid;grid-template-columns:minmax(0,.9fr) minmax(0,1.1fr);
  gap:clamp(1.5rem,4vw,3rem);align-items:start}
@media(max-width:820px){.grid{grid-template-columns:1fr}}

/* ---------- Left: framed swappable photo ---------- */
.stagewrap{position:relative}
.frame{position:relative;border-radius:var(--r-22);padding:14px;
  background:radial-gradient(80% 70% at 50% 30%,#fff 0%,var(--paper-100) 100%);
  box-shadow:var(--sh-2)}
/* glowing gradient border via mask-composite */
.frame::before{content:"";position:absolute;inset:0;border-radius:var(--r-22);padding:1.5px;
  background:conic-gradient(from 210deg,
    var(--accent) 0deg, color-mix(in oklab,var(--accent),#fff 55%) 120deg,
    var(--accent) 240deg, color-mix(in oklab,var(--accent),#000 20%) 360deg);
  -webkit-mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  -webkit-mask-composite:xor;mask:linear-gradient(#000 0 0) content-box,linear-gradient(#000 0 0);
  mask-composite:exclude;pointer-events:none}
/* soft outer bloom, breathes on hover only */
.frame::after{content:"";position:absolute;inset:-6px;border-radius:calc(var(--r-22) + 6px);
  z-index:-1;background:var(--accent);filter:blur(22px);opacity:.14;
  transition:opacity var(--dur-3) var(--ease)}
.frame:hover::after{opacity:.24}
.photobox{position:relative;aspect-ratio:1/1;border-radius:var(--r-14);overflow:hidden;
  background:var(--paper-50);display:grid;place-items:center}
.photo{max-width:88%;max-height:88%;object-fit:contain;
  transition:opacity var(--dur-2) var(--ease),transform var(--dur-3) var(--ease);
  filter:drop-shadow(0 14px 20px rgba(23,19,17,.18))}
.frame:hover .photo{transform:scale(1.03)}
.photo.swapping{opacity:0}
.photo[data-loading=true]{opacity:0}
.skeleton{position:absolute;inset:6%;border-radius:var(--r-8);
  background:linear-gradient(100deg,var(--paper-100) 30%,var(--paper-200) 50%,var(--paper-100) 70%);
  background-size:200% 100%;animation:shimmer 1.3s linear infinite}
@keyframes shimmer{to{background-position:-200% 0}}
.noimg{position:absolute;inset:0;display:grid;place-content:center;gap:.4rem;text-align:center;
  padding:1.5rem;color:var(--ink-700)}
.noimg .badge{font-family:var(--display);font-size:1.25rem;color:var(--ink-800)}
.noimg small{font-size:.76rem;color:var(--ink-700);opacity:.75}

.fieldlabel{display:block;font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;
  color:var(--ink-700);font-weight:600;margin:1rem 0 .45rem}
/* format selector (segmented) */
.seg{display:inline-flex;flex-wrap:wrap;gap:3px;background:var(--paper-100);
  border:1px solid var(--paper-200);border-radius:999px;padding:3px}
.seg button{appearance:none;border:0;background:none;color:var(--ink-700);font:inherit;
  font-size:.83rem;font-weight:500;padding:.4rem .8rem;border-radius:999px;cursor:pointer;
  transition:background var(--dur-1) var(--ease),color var(--dur-1) var(--ease)}
.seg button[aria-pressed=true]{background:var(--ink-900);color:var(--paper-50)}
.seg button:hover:not([aria-pressed=true]){background:var(--paper-200)}
.saverow{margin-top:1rem}

/* ---------- Buttons ---------- */
.btn{appearance:none;border:1px solid transparent;font:inherit;font-size:.87rem;font-weight:600;
  padding:.55rem .95rem;border-radius:var(--r-8);cursor:pointer;text-decoration:none;
  display:inline-flex;align-items:center;gap:.4rem;
  transition:transform var(--dur-1) var(--ease),background var(--dur-1) var(--ease),
    border-color var(--dur-1) var(--ease)}
.btn:active{transform:translateY(1px)}
.btn-primary{background:var(--chili-500);color:#fff}.btn-primary:hover{background:var(--chili-600)}
.btn-secondary{background:var(--paper-100);border-color:var(--paper-200);color:var(--ink-800)}
.btn-secondary:hover{background:var(--paper-200)}
.btn-ghost{background:none;border-color:var(--paper-200);color:var(--ink-800)}
.btn-ghost:hover{background:var(--paper-100)}

/* ---------- Right: heading + fact card ---------- */
.brandline{font-size:.85rem;color:var(--ink-700);margin:0 0 .3rem;font-weight:600;
  letter-spacing:.02em}
.name{font-family:var(--display);font-weight:560;font-size:clamp(1.5rem,2.6vw,2rem);
  margin:0 0 .6rem;color:var(--ink-900)}
.story{font-size:1rem;line-height:1.55;color:var(--ink-700);margin:0 0 1.2rem;max-width:52ch}

.factcard{border:1px solid var(--paper-200);border-radius:var(--r-14);background:#fff;
  box-shadow:var(--sh-1);padding:1.1rem 1.2rem;margin:0 0 1.4rem}
.facthead{display:flex;align-items:center;justify-content:space-between;gap:.75rem;
  padding-bottom:.6rem;margin-bottom:.6rem;border-bottom:1px solid var(--paper-100)}
.facthead h4{font-size:.95rem;margin:0;color:var(--ink-900)}
.fact{display:grid;grid-template-columns:9rem 1fr;gap:.75rem;padding:.5rem 0;
  border-bottom:1px solid var(--paper-50)}
.fact:last-of-type{border-bottom:0}
@media(max-width:520px){.fact{grid-template-columns:1fr;gap:.2rem}}
.factlabel{font-size:.78rem;letter-spacing:.04em;text-transform:uppercase;color:var(--ink-700);
  font-weight:600;display:flex;align-items:center;gap:.4rem;flex-wrap:wrap}
.factvalue{font-size:.92rem;line-height:1.45;color:var(--ink-800)}
.factunknown{font-size:.9rem;line-height:1.45;color:var(--ink-700);font-style:italic}
.reminder{font-size:.8rem;color:var(--ink-700);margin:.8rem 0 0;padding-top:.7rem;
  border-top:1px dashed var(--paper-200)}

/* source + confidence badges: dot + word (never color alone) */
.badge-src,.badge-conf{display:inline-flex;align-items:center;gap:.35rem;font-size:.7rem;
  letter-spacing:.03em;text-transform:uppercase;font-weight:600;color:var(--ink-700)}
.badge-src .dot{width:8px;height:8px;border-radius:50%}
.badge-conf{border:1px solid var(--paper-200);border-radius:999px;padding:.15rem .5rem;
  background:var(--paper-50)}
.badge-conf .dot{width:7px;height:7px;border-radius:50%}

/* ---------- Anatomy tabs (CSS-only radios, JS-enhanced) ---------- */
.anatomy{margin:0 0 1.4rem}
.tabs{border:1px solid var(--paper-200);border-radius:var(--r-14);overflow:hidden;background:#fff}
.tablist{display:flex;flex-wrap:wrap;background:var(--paper-100);border-bottom:1px solid var(--paper-200)}
.tabs input[type=radio]{position:absolute;opacity:0;pointer-events:none}
.tablabel{flex:1 1 auto;text-align:center;padding:.65rem .8rem;font-size:.85rem;font-weight:600;
  color:var(--ink-700);cursor:pointer;border-bottom:2px solid transparent;
  transition:background var(--dur-1) var(--ease),color var(--dur-1) var(--ease)}
.tablabel:hover{background:var(--paper-200)}
/* CSS-only selected state (no JS) */
#tab-flavor:checked ~ .tablist label[for=tab-flavor],
#tab-prep:checked ~ .tablist label[for=tab-prep],
#tab-pkg:checked ~ .tablist label[for=tab-pkg],
#tab-q:checked ~ .tablist label[for=tab-q]{color:var(--ink-900);background:#fff;
  border-bottom-color:var(--chili-500)}
.panel{padding:1rem 1.1rem;font-size:.94rem;line-height:1.55;color:var(--ink-800);display:none}
#tab-flavor:checked ~ .panels #p-flavor,
#tab-prep:checked ~ .panels #p-prep,
#tab-pkg:checked ~ .panels #p-pkg,
#tab-q:checked ~ .panels #p-q{display:block}
.panel ul{margin:.3rem 0 0;padding-left:1.1rem}
.panel li{margin:.3rem 0}
/* keyboard focus for radio-driven labels */
.tabs input[type=radio]:focus-visible + .tablist label,
.tablabel:focus-visible{outline:3px solid var(--info-500);outline-offset:-3px}
/* mode emphasis */
.qblock.muted{opacity:.5}
.qblock h5{margin:.2rem 0 .4rem;font-size:.85rem;color:var(--ink-900)}

/* ---------- Related chips (with thumbnails) ---------- */
.related{margin:0 0 1.4rem}
.relchips{display:flex;flex-wrap:wrap;gap:.55rem}
.relchip{display:inline-flex;align-items:center;gap:.5rem;appearance:none;
  border:1px solid var(--paper-200);background:#fff;border-radius:999px;padding:.3rem .7rem .3rem .35rem;
  font:inherit;font-size:.85rem;font-weight:600;color:var(--ink-800);cursor:pointer;
  transition:border-color var(--dur-1) var(--ease),background var(--dur-1) var(--ease)}
.relchip:hover{border-color:var(--chili-500);background:var(--chili-050)}
.relchip img,.relchip .thumbfallback{width:26px;height:26px;border-radius:50%;object-fit:cover;
  background:var(--paper-100);flex:0 0 auto}
.relchip .thumbfallback{display:grid;place-items:center;font-size:.7rem;color:var(--ink-700)}

.dossieractions{display:flex;flex-wrap:wrap;gap:.55rem;margin:0 0 1.2rem}
.sourceline{font-size:.78rem;color:var(--ink-700);display:flex;align-items:center;gap:.45rem;
  flex-wrap:wrap}

/* no-selection prompt */
.prompt{font-size:1rem;color:var(--ink-700);max-width:44ch}

/* focus visibility */
.section :is(button,a,label):focus-visible{outline:3px solid var(--info-500);outline-offset:2px;
  border-radius:var(--r-8)}

@media(prefers-reduced-motion:reduce){
  .photo,.frame::after,.frame:hover .photo{transition:none;transform:none}
  .skeleton{animation:none}
}
</style>

<section id="product" class="section" aria-labelledby="product-h">
  <div class="inner">
    <p class="eyebrow">Explore</p>
    <h2 id="product-h" class="h2">Product Dossier</h2>
    <div id="root"><!-- render() fills this --></div>
  </div>
</section>

<script>
/* ---------- Real data (mirrors families.ts + variants.ts + images.ts) ---------- */
const IMG=f=>`/products/${f}.png`;
const SRC_COLOR={official:"--ok-500","retail-signal":"--info-500",editorial:"--samyang-accent",
  synthetic:"--paper-200"};
const SRC_WORD={official:"Official","retail-signal":"Retail signal",editorial:"Editorial",
  synthetic:"Synthetic"};
const CONF_COLOR={high:"--ok-500",medium:"--info-500",low:"--paper-200"};

/* One fully-populated anchor family: Buldak Carbonara, with real per-format facts. */
const FAMILY={
  id:"buldak-carbonara",brand:"Buldak",accent:"--chili-600",category:"Noodles",
  name:"Buldak Carbonara",heat:"Moderate heat",style:"Stir-fry",creaminess:4,
  story:"A creamy, cheese-forward carbonara sauce softens the Buldak heat into the portfolio's "
    +"most approachable and most recognized flavor.",
  source:{type:"official",note:"Allergens (wheat, soy, milk) and preparation from catalog flagship "
    +"profiles (Multi).",lastVerified:"2026-07-07"},
  consumerQuestions:["Is Carbonara mild?","How is it different from Cream Carbonara?",
    "My sauce or cheese powder packet is missing.","It came out too watery — how much water should I keep?",
    "Does it contain milk?","Which formats are available?"],
  vendorQuestions:["Which formats are available (Multi, Big Bowl, Cup)?",
    "Availability and lead time by format?","Are marketing assets available for the Carbonara family?"],
  related:[{id:"buldak-cream-carbonara",name:"Cream Carbonara",img:IMG("buldak-multi-cream-carbonara")},
    {id:"buldak-quattro-cheese",name:"Quattro Cheese",img:IMG("buldak-multi-quattro-cheese")},
    {id:"buldak-original",name:"Original",img:IMG("buldak-multi-original")}],
};
/* Format-bound variants — honesty rule: only Multi carries official allergens/prep. */
const VARIANTS=[
  {id:"buldak-carbonara--multi",format:"multi",label:"Multi (5-pack)",img:IMG("buldak-multi-carbonara"),
   confidence:"high",
   allergens:["wheat","soy","milk"],allergenSource:"official",
   preparation:"Cook noodles about five minutes, drain leaving some water, add liquid sauce and "
     +"cheese powder, mix well.",preparationSource:"official",
   components:["Noodle block","Liquid sauce","Cheese powder"],storage:"ambient",
   retailSignals:[{retailer:"Walmart",marker:"8,830 ratings",date:"2026-07-07"},
     {retailer:"Walmart",marker:"5K+ bought since yesterday",date:"2026-07-07"},
     {retailer:"Target",marker:"827 reviews",date:"2026-07-07"}]},
  {id:"buldak-carbonara--big-bowl",format:"big-bowl",label:"Big Bowl",img:IMG("buldak-big-bowl-carbonara"),
   confidence:"medium",allergens:[],preparation:null,components:[],storage:null,retailSignals:[]},
  {id:"buldak-carbonara--cup",format:"cup",label:"Cup",img:IMG("buldak-cup-carbonara"),
   confidence:"medium",allergens:[],preparation:null,components:[],storage:null,retailSignals:[]},
];
const VERIFY_PACKAGE_REMINDER="Allergen and preparation details are printed on the current package. "
  +"For anything safety-related, always verify the package you have.";
const STORAGE_LABEL={ambient:"Ambient","refrigerate-after-opening":"Refrigerate after opening",
  frozen:"Keep frozen"};

/* ---------- Minimal shared state (mirrors homeStore) ---------- */
const FF={familyId:FAMILY.id,variantId:VARIANTS[0].id,mode:"explore",saved:false};
const esc=s=>String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
const variant=()=>VARIANTS.find(v=>v.id===FF.variantId)||VARIANTS[0];

const root=document.getElementById("root");
const reduce=matchMedia("(prefers-reduced-motion:reduce)").matches;

function srcBadge(type){return `<span class="badge-src"><span class="dot"
  style="background:var(${SRC_COLOR[type]})"></span>${esc(SRC_WORD[type])}</span>`;}
function confBadge(level){return `<span class="badge-conf"><span class="dot"
  style="background:var(${CONF_COLOR[level]})"></span>${esc(level)} confidence</span>`;}

function render(){
  const v=variant();
  const consumerMuted=FF.mode==="vendor", vendorMuted=FF.mode==="consumer";
  root.innerHTML=`
  <div class="grid">
    <!-- LEFT -->
    <div>
      <div class="stagewrap">
        <div class="frame" style="--accent:var(${FAMILY.accent})">
          <div class="photobox" id="photobox">
            <div class="skeleton" id="skel"></div>
            <img class="photo" id="photo" data-loading="true" width="560" height="560"
                 loading="lazy" decoding="async" src="${esc(v.img)}"
                 alt="${esc(FAMILY.name)}, ${esc(v.label)} package">
          </div>
        </div>
      </div>
      <span class="fieldlabel" id="fmt-label">Format</span>
      <div class="seg" role="group" aria-labelledby="fmt-label" id="fmtseg"></div>
      <div class="saverow">
        <button class="btn ${FF.saved?"btn-secondary":"btn-ghost"}" id="savebtn" type="button"
          aria-pressed="${FF.saved}">${FF.saved?"Saved":"Save product"}</button>
      </div>
    </div>

    <!-- RIGHT -->
    <div>
      <p class="brandline">${esc(FAMILY.brand)} · ${esc(FAMILY.category)}</p>
      <h3 class="name">${esc(FAMILY.name)}</h3>
      <p class="story">${esc(FAMILY.story)}</p>

      <div class="factcard">
        <div class="facthead">
          <h4>For ${esc(v.label)}</h4>
          ${confBadge(v.confidence)}
        </div>
        <div class="fact">
          <span class="factlabel">Allergens</span>
          ${v.allergens.length
            ? `<span class="factvalue">${esc(v.allergens.join(", "))} ${srcBadge(v.allergenSource)}</span>`
            : `<span class="factunknown">Not in our public data for this exact format. Verify the current package.</span>`}
        </div>
        <div class="fact">
          <span class="factlabel">Preparation</span>
          ${v.preparation
            ? `<span class="factvalue">${esc(v.preparation)}</span>`
            : `<span class="factunknown">Format-specific preparation not in public data — verify the package.</span>`}
        </div>
        ${v.components.length?`<div class="fact">
          <span class="factlabel">In the package</span>
          <span class="factvalue">${esc(v.components.join(" · "))}</span></div>`:""}
        ${v.storage?`<div class="fact">
          <span class="factlabel">Storage</span>
          <span class="factvalue">${esc(STORAGE_LABEL[v.storage])}</span></div>`:""}
        ${v.retailSignals.length?`<div class="fact">
          <span class="factlabel">Retail signal ${srcBadge("retail-signal")}</span>
          <span class="factvalue">${esc(v.retailSignals.map(s=>`${s.retailer}: ${s.marker} (${s.date})`).join(" · "))}</span></div>`:""}
        <p class="reminder">${esc(VERIFY_PACKAGE_REMINDER)}</p>
      </div>

      <!-- ANATOMY: CSS-only radio tabs, JS-enhanced to ARIA below -->
      <div class="anatomy" id="anatomy">
        <div class="tabs">
          <input type="radio" name="anatomy" id="tab-flavor" ${FF.mode==="explore"?"checked":""}>
          <input type="radio" name="anatomy" id="tab-prep">
          <input type="radio" name="anatomy" id="tab-pkg">
          <input type="radio" name="anatomy" id="tab-q" ${FF.mode!=="explore"?"checked":""}>
          <div class="tablist" role="tablist" aria-label="Product anatomy">
            <label class="tablabel" for="tab-flavor" role="tab" tabindex="0">Flavor</label>
            <label class="tablabel" for="tab-prep" role="tab" tabindex="-1">Preparation</label>
            <label class="tablabel" for="tab-pkg" role="tab" tabindex="-1">In the package</label>
            <label class="tablabel" for="tab-q" role="tab" tabindex="-1">Questions</label>
          </div>
          <div class="panels">
            <div class="panel" id="p-flavor" role="tabpanel">
              <p>${esc(FAMILY.story)}</p>
              <ul><li>Heat: ${esc(FAMILY.heat)}</li><li>Style: ${esc(FAMILY.style)}</li>
                <li>Creaminess (editorial): ${FAMILY.creaminess}/5</li></ul>
            </div>
            <div class="panel" id="p-prep" role="tabpanel">
              ${v.preparation?`<p>${esc(v.preparation)}</p>`
                :`<p class="factunknown">Preparation for ${esc(v.label)} isn't in our public data — verify the package.</p>`}
            </div>
            <div class="panel" id="p-pkg" role="tabpanel">
              ${v.components.length?`<ul>${v.components.map(c=>`<li>${esc(c)}</li>`).join("")}</ul>`
                :`<p class="factunknown">Package contents for ${esc(v.label)} aren't in our public data — verify the package.</p>`}
            </div>
            <div class="panel" id="p-q" role="tabpanel">
              <div class="qblock ${consumerMuted?"muted":""}">
                <h5>Common consumer questions</h5>
                <ul>${FAMILY.consumerQuestions.map(q=>`<li>${esc(q)}</li>`).join("")}</ul>
              </div>
              <div class="qblock ${vendorMuted?"muted":""}">
                <h5>Common vendor questions</h5>
                <ul>${FAMILY.vendorQuestions.map(q=>`<li>${esc(q)}</li>`).join("")}</ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="related">
        <span class="fieldlabel">Related</span>
        <div class="relchips">
          ${FAMILY.related.map(r=>`<button class="relchip" data-rel="${esc(r.id)}" type="button">
            <img src="${esc(r.img)}" alt="" width="26" height="26" loading="lazy"
              onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'thumbfallback',textContent:'${esc(r.name.slice(0,1))}'}))">
            ${esc(r.name)}</button>`).join("")}
        </div>
      </div>

      <div class="dossieractions">
        <a class="btn btn-primary" href="#resolve" data-act="consumer">Ask as a consumer</a>
        <a class="btn btn-secondary" href="#vendor" data-act="vendor">Ask as a vendor</a>
        <a class="btn btn-ghost" href="#compare" data-act="compare">Add to compare</a>
      </div>

      <p class="sourceline">${srcBadge(FAMILY.source.type)} ${esc(FAMILY.source.note)}
        · Last verified ${esc(FAMILY.source.lastVerified)}</p>
    </div>
  </div>`;

  wireFormatSeg();
  wireImage();
  wireSave();
  wireRelated();
  wireActions();
  enhanceTabs();
}

/* ---------- Wiring ---------- */
function wireFormatSeg(){
  const seg=document.getElementById("fmtseg");
  seg.innerHTML="";
  for(const v of VARIANTS){
    const b=document.createElement("button");
    b.type="button";b.textContent=v.label;
    b.setAttribute("aria-pressed",String(v.id===FF.variantId));
    b.addEventListener("click",()=>swapFormat(v.id));
    seg.appendChild(b);
  }
}
function swapFormat(id){
  if(id===FF.variantId) return;
  const img=document.getElementById("photo");
  const finish=()=>{FF.variantId=id;render();};
  if(reduce||!img){finish();return;}
  img.classList.add("swapping");
  setTimeout(finish,180); // matches --dur-2 fade
}
function wireImage(){
  const img=document.getElementById("photo"), skel=document.getElementById("skel");
  const done=()=>{img.dataset.loading="false";skel&&skel.remove();};
  if(img.complete&&img.naturalWidth>0) done();
  img.addEventListener("load",done);
  img.addEventListener("error",()=>{
    const box=document.getElementById("photobox");
    box.innerHTML=`<div class="noimg"><span class="badge">${esc(FAMILY.name)}</span>
      <small>Photography not available here — serve from the app root to load /products images.</small></div>`;
  });
}
function wireSave(){
  document.getElementById("savebtn").addEventListener("click",()=>{FF.saved=!FF.saved;render();});
}
function wireRelated(){
  root.querySelectorAll("[data-rel]").forEach(b=>b.addEventListener("click",()=>{
    console.log("SELECT_FAMILY",b.dataset.rel); // React dispatches; demo logs
  }));
}
function wireActions(){
  root.querySelectorAll("[data-act]").forEach(a=>a.addEventListener("click",()=>{
    const act=a.dataset.act;
    if(act==="consumer"||act==="vendor"){FF.mode=act;render();}
    console.log("action",act);
  }));
}
/* Progressive enhancement: upgrade radio tabs to ARIA roving-focus tablist */
function enhanceTabs(){
  const tabs=[...root.querySelectorAll('.tablabel')];
  const radios={"tab-flavor":0,"tab-prep":1,"tab-pkg":2,"tab-q":3};
  tabs.forEach((t,i)=>{
    const forId=t.getAttribute("for");
    const input=document.getElementById(forId);
    const panelId="p-"+forId.replace("tab-","");
    t.setAttribute("aria-controls",panelId);
    t.setAttribute("aria-selected",String(input.checked));
    document.getElementById(panelId).setAttribute("aria-labelledby",forId);
    const activate=()=>{
      tabs.forEach(x=>{x.setAttribute("aria-selected","false");x.tabIndex=-1;});
      t.setAttribute("aria-selected","true");t.tabIndex=0;input.checked=true;t.focus();
    };
    t.addEventListener("click",activate);
    t.addEventListener("keydown",e=>{
      let j=null;
      if(e.key==="ArrowRight"||e.key==="ArrowDown") j=(i+1)%tabs.length;
      if(e.key==="ArrowLeft"||e.key==="ArrowUp") j=(i-1+tabs.length)%tabs.length;
      if(e.key==="Home") j=0; if(e.key==="End") j=tabs.length-1;
      if(j!==null){e.preventDefault();tabs[j].click();}
    });
  });
}

render();
</script>
```

---

## 4. Accessibility, reduced motion, mobile

- **Keyboard + focus.** Format selector and actions are real buttons/links. The anatomy tabs are keyboard-operable in **two** ways: as native radios (Tab to the group, arrow keys switch) with no JS, and after enhancement as an ARIA `tablist` with roving `tabindex`, arrow/Home/End keys, and `aria-selected`/`aria-controls`. A visible `--info-500` focus ring shows on every control.
- **Heading order.** The page `h1` lives in the hero; this section leads with `h2` "Product Dossier", then `h3` product name, then `h4` inside the fact card, then `h5` in the questions panel. No level skips.
- **No info by hover/color alone.** Source is a dot **and** a word ("Official", "Retail signal"); confidence is a dot **and** the word "high/medium confidence". Mode emphasis dims the non-active question block via opacity **and** both blocks are always present with headings, so nothing is hidden by color. The glow frame is decorative (`pointer-events:none`).
- **"Verify the package."** Any format without official data renders an explicit italic sentence in the fact card *and* in the matching anatomy panel — never a blank or an inherited value from another format.
- **Images.** Photos carry descriptive `alt` (name + format); related thumbnails use empty `alt=""` (decorative beside a text label) and an `onerror` letter fallback. All images have `width`/`height` and `loading="lazy"`.
- **Reduced motion.** Disables photo scale, the frame bloom transition, and the swap cross-fade (format changes instantly), and stops the skeleton shimmer. Everything stays fully usable.
- **Mobile.** Grid collapses to one column at 820px; fact rows stack at 520px; the format segmented control wraps. Touch users get instant swaps and no hover dependency.

---

## 5. States

| State | Trigger | What renders |
|---|---|---|
| **No selection** | no `selectedFamilyId` | eyebrow + `h2` + "Select a product from the portfolio to open its dossier." |
| **Format-bound (official)** | Multi selected | full allergens/prep/components/storage/retail with source + high-confidence badges |
| **Format-bound (absent)** | Big Bowl / Cup selected | "Not in our public data for this exact format. Verify the current package." + medium-confidence badge; anatomy panels echo the same honesty |
| **Image skeleton** | photo loading | shimmering `.skeleton` inside the frame; photo at `opacity:0` |
| **Missing image** | family without photography, or `onerror` | `.noimg` block with product name + honest note |
| **Format swap** | selector change | outgoing photo cross-fades out, new format re-renders and fades in |

---

## 6. Integration notes

**React (`ProductDossier.tsx`).**
- Replace the left `<ProductStage>` with a `<DossierPhoto>` that resolves the image via `imageForVariant(variant.id, family.id)` from `@/data/images.ts`. Keep the existing `Segmented` format control bound to `dispatch({type:"SELECT_VARIANT",variantId})`; on change, apply the `.swapping` class for one `--dur-2` tick before swapping `src` (skip when `useReducedMotion()`), then clear it on `<img onLoad>`. On `onError`, render the `.noimg` placeholder.
- The glow frame is pure CSS: wrap the photo in `.frame` and set `style={{"--accent":`var(${brand.accentToken})`}}`. `brand.accentToken` already comes through (`--chili-600`, `--samyang-accent`, etc.).
- Fact card: keep the current JSX — it already binds allergens/prep/components/storage/retail to `variant` and shows the "verify the package" fallbacks and `VERIFY_PACKAGE_REMINDER` from `@/data/sources`. Reuse the existing `SourceBadge` and `ConfidenceBadge` primitives (dot + word) rather than the inline versions here.
- Anatomy tabs: extract a `<Anatomy>` component. Ship the radio-based markup for SSR/no-JS, then in a `useEffect` add the ARIA roles + roving focus (the `enhanceTabs()` logic). Content comes from `family.flavorStory`, `variant.preparation`, `variant.components`, and `family.consumerQuestions`/`vendorQuestions`. Drive the muted class from `state.userMode` (the current component already does this for the questions block).
- Related chips: map `family.relatedFamilyIds` → `FAMILY_BY_ID`, resolve each thumbnail via `imageForVariant(defaultVariantForFamily(id)?.id, id)`, and dispatch `SELECT_FAMILY` on click (as today). Add the thumbnail + letter fallback.
- Actions keep existing dispatches: consumer/vendor → `SET_MODE`; Add to compare → `ADD_COMPARE`; Save → `TOGGLE_SAVE` (reads `state.savedProductIds`).

**Vanilla preview.** Global `FF` mirrors the store (`familyId`/`variantId`/`mode`/`saved`). `esc()` guards interpolation. `IMG(file)` builds real `/products/<file>.png` paths. `data-act` marks the four actions; `data-rel` marks related chips. Confidence/source use the dot+word pattern that maps to the React `ConfidenceBadge`/`SourceBadge` primitives.

---

## 7. Tradeoffs and risks

- **`mask-composite` support.** The border-only glow needs `mask-composite: exclude` (+ `-webkit-` prefix). Broadly supported now, but include the standard *and* webkit lines (done). Fallback if unsupported: the frame simply shows the padded paper ground with the soft bloom — still acceptable, never broken.
- **`color-mix` in the gradient.** Used for the accent's light/dark stops. If you must support very old engines, precompute two accent tints per brand token instead.
- **Two tab implementations.** Radio + ARIA layered together must stay in sync — the enhancement sets `aria-selected` from the radio's `checked`. Test that clicking a label and arrow-keying both update the visible panel and the `aria-selected` state. If they drift, prefer a single JS-driven `tablist` and keep the radios only as the no-JS fallback.
- **Format honesty vs. perceived emptiness.** Big Bowl/Cup deliberately show little. That is the point (D-005), but it can read as "missing data" to a stakeholder. The confidence badge + explicit sentence frame it as a *deliberate* boundary, not an oversight.
- **Photo aspect ratios.** Package shots vary (tall bottles vs. wide bowls). The square `.photobox` with `object-fit:contain` handles both without cropping a claim off the label; do not switch to `cover`.
- **Swap timing.** The 180ms cross-fade must not gate interaction — the new panel renders regardless. Under reduced motion it is instant.
