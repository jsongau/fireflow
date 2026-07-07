# Rankings Lab — UI Upgrade Spec

> Target component: `src/components/home/RankingsLab/RankingsLab.tsx`
> Data: `src/data/rankings.ts` (`RANKING_VIEWS`, `computeRanking`), `src/data/families.ts`, `src/data/images.ts`
> This file is a self-contained recipe. The HTML/CSS/JS block below runs stand-alone in any browser (open it as `.html`) and is a faithful mock of the production behavior. Section 6 maps every piece back to React.

---

## 1. Concept + job competency

The Rankings Lab is FireFlow's answer to the question a Customer Experience manager is asked constantly: *"which products matter most?"* The honest answer is *"it depends what you're measuring"* — so the Lab refuses to publish one leaderboard. It ships **eight named views**, each measuring exactly one thing, each showing its own **source type, confidence, last-reviewed date, and caveat**, and each openly exposing **how it is calculated**.

This maps directly to the Samyang **Manager, Customer Experience** competency of *transparent measurement*: a manager who reports on a portfolio has to be able to say where a number came from, how confident they are, and what it does **not** mean (a retail-engagement snapshot is not sales; a high "guidance opportunity" score is not a defect). The design goal is **calm operational control**, not a dashboard that dazzles — every ranked row is auditable, every derived value is marked, and products are *left unscored rather than guessed*.

The upgrade keeps that governance intact while making the surface look like a premium food-culture product intelligence tool instead of a plain list:

- **Accessible segmented tabs** across the 8 views (roving-tabindex `role="tablist"`).
- **Richer ranked rows**: a real product **thumbnail**, an **animated bar fill** that always carries its numeric value as text, **confidence dots + word**, the derived-input `*` marker, and Open / Compare actions.
- **Per-view meta strip**: source-type chip, confidence chip, last-reviewed date, purpose line, caveat, and the honest "N of 45 scored" count.
- An **expandable "How it's calculated" panel** with subtle spotlight styling that lists each weighted input.

---

## 2. Technique, reinterpreted (never copied)

The brief's reference techniques are reinterpreted here, not lifted:

| Reference technique | How FireFlow reinterprets it |
|---|---|
| Radial spotlight dashboard cards | The meta strip + method panel sit on a **paper card** with a *very* soft radial highlight (`--paper-50` core fading to `--paper-100`) and a **gradient-mask glow border** in `--chili-050`. It reads as warm printed stock catching light, not a neon SaaS glow. |
| Gradient-mask glow borders | A `::before` layer uses `mask` composite so only the 1px border carries a chili→carbo gradient. Content stays on calm paper. |
| Animated bar fills on view | Each row bar animates `width` from 0 → score **once, when scrolled into view** (`IntersectionObserver`), staggered by row. The **number is rendered as text and is correct before, during, and after the animation** — motion is decoration, never the data. |
| Staggered reveal | Rows fade/slide up with a per-index `--i` delay. |
| Accessible tabs | True `role="tablist"` with arrow-key roving tabindex, `aria-selected`, and one visible focus ring. |

Bars are **operational**, not thin candy: 12px tall, rounded, with an inline value label — legible at a glance, no squinting.

---

## 3. Complete runnable recipe (HTML + CSS + JS)

Save as `rankings-lab.html` and open in a browser. Real ranking content is embedded (`FF.rankings`) with values computed from the production model in `src/data/rankings.ts`.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FireFlow — Rankings Lab</title>
<style>
  :root{
    --ink-900:#171311; --ink-800:#221b18; --ink-700:#332924;
    --paper-50:#faf4ea; --paper-100:#f3e9da; --paper-200:#e7d8c3;
    --chili-600:#c2341d; --chili-500:#d94f2f; --chili-050:#f7e0d8;
    --carbo-400:#e79bb0;
    --ok-500:#4c9a2a; --warn-500:#e0a021; --risk-600:#c2341d; --info-500:#3a7ca5;
    --src-official:#3a7ca5; --src-retail:#7a6f66; --src-editorial:#8a5a2b; --src-synthetic:#6b5b95;
    --r-8:8px; --r-14:14px; --r-22:22px;
    --shadow-1:0 1px 2px rgba(23,19,17,.08), 0 1px 3px rgba(23,19,17,.06);
    --shadow-2:0 6px 18px rgba(23,19,17,.10), 0 2px 6px rgba(23,19,17,.08);
    --font-display:"Fraunces", Georgia, "Times New Roman", serif;
    --font-ui:"Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    --ease:cubic-bezier(.2,.7,.2,1);
    --t-fast:120ms; --t-med:220ms; --t-slow:360ms;
  }
  *{box-sizing:border-box}
  body{
    margin:0; background:var(--paper-100); color:var(--ink-800);
    font-family:var(--font-ui); line-height:1.5;
    -webkit-font-smoothing:antialiased;
  }
  .wrap{max-width:1040px; margin:0 auto; padding:48px 20px 96px}
  .eyebrow{font:600 12px/1 var(--font-ui); letter-spacing:.14em; text-transform:uppercase; color:var(--chili-600); margin:0 0 10px}
  h1{font-family:var(--font-display); font-weight:600; font-size:clamp(30px,5vw,44px); margin:0 0 12px; color:var(--ink-900); letter-spacing:-.01em}
  .lede{max-width:64ch; margin:0 0 28px; color:var(--ink-700); font-size:16px}

  /* ---- Tabs ---- */
  .tablist{display:flex; flex-wrap:wrap; gap:8px; margin:0 0 22px; padding:6px; background:var(--paper-50);
    border:1px solid var(--paper-200); border-radius:var(--r-22); box-shadow:var(--shadow-1)}
  .tab{appearance:none; border:1px solid transparent; background:transparent; cursor:pointer;
    font:600 13.5px/1 var(--font-ui); color:var(--ink-700); padding:9px 14px; border-radius:var(--r-14);
    transition:background var(--t-fast) var(--ease), color var(--t-fast) var(--ease)}
  .tab:hover{background:var(--paper-100)}
  .tab[aria-selected="true"]{background:var(--ink-900); color:var(--paper-50)}
  .tab:focus-visible{outline:3px solid var(--info-500); outline-offset:2px}

  /* ---- Spotlight card (meta + list + method) ---- */
  .card{position:relative; border-radius:var(--r-22); background:
      radial-gradient(120% 90% at 18% 0%, var(--paper-50) 0%, var(--paper-100) 62%);
    box-shadow:var(--shadow-2); padding:26px clamp(18px,3vw,30px); overflow:hidden}
  .card::before{content:""; position:absolute; inset:0; border-radius:inherit; padding:1px; pointer-events:none;
    background:linear-gradient(135deg, var(--chili-050), var(--carbo-400) 45%, transparent 75%);
    -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
    -webkit-mask-composite:xor; mask-composite:exclude}

  .metaStrip{display:flex; flex-wrap:wrap; align-items:center; gap:10px; margin-bottom:8px}
  .chip{display:inline-flex; align-items:center; gap:7px; font:600 12px/1 var(--font-ui);
    padding:6px 10px; border-radius:999px; background:var(--paper-50); border:1px solid var(--paper-200); color:var(--ink-700)}
  .chip .dot{width:8px; height:8px; border-radius:50%}
  .chip .dots{display:inline-flex; gap:3px}
  .chip .dots i{width:6px; height:6px; border-radius:50%; background:var(--paper-200)}
  .chip .dots i.on{background:var(--ink-700)}
  .reviewed{font:500 12.5px/1 var(--font-ui); color:var(--ink-700); opacity:.8}
  .purpose{font-family:var(--font-display); font-size:19px; color:var(--ink-900); margin:6px 0 4px; font-weight:500}
  .caveat{margin:6px 0 0; font-size:13px; color:var(--src-editorial); border-left:3px solid var(--warn-500);
    padding:4px 0 4px 10px; background:linear-gradient(90deg, rgba(224,160,33,.08), transparent)}
  .count{margin:12px 0 4px; font-size:13px; color:var(--ink-700)}
  .count b{color:var(--ink-900)}

  /* ---- Ranked rows ---- */
  ol.list{list-style:none; margin:18px 0 0; padding:0; display:grid; gap:8px}
  .row{display:grid; grid-template-columns:26px 44px 1fr auto; align-items:center; gap:14px;
    padding:12px 14px; background:var(--paper-50); border:1px solid var(--paper-200); border-radius:var(--r-14);
    opacity:0; transform:translateY(8px); animation:rise var(--t-slow) var(--ease) forwards; animation-delay:calc(var(--i) * 45ms)}
  @keyframes rise{to{opacity:1; transform:none}}
  .rank{font-family:var(--font-display); font-weight:600; font-size:18px; color:var(--ink-900); text-align:center}
  .thumb{width:44px; height:44px; border-radius:10px; background:var(--paper-100); border:1px solid var(--paper-200);
    display:grid; place-items:center; overflow:hidden; flex:none}
  .thumb img{width:100%; height:100%; object-fit:contain}
  .thumb .fallback{font:700 13px/1 var(--font-ui); color:var(--chili-600)}
  .rowMain{min-width:0}
  .nameBtn{appearance:none; background:none; border:none; padding:0; cursor:pointer; text-align:left;
    font:600 15px/1.25 var(--font-ui); color:var(--ink-900)}
  .nameBtn:hover{color:var(--chili-600)}
  .nameBtn:focus-visible{outline:3px solid var(--info-500); outline-offset:3px; border-radius:4px}
  .star{color:var(--warn-500); font-weight:700; text-decoration:none; cursor:help; margin-left:3px}
  .barRow{display:flex; align-items:center; gap:10px; margin-top:7px}
  .barWrap{position:relative; flex:1; height:12px; border-radius:999px; background:var(--paper-200); overflow:hidden}
  .bar{position:absolute; inset:0 auto 0 0; width:0; border-radius:999px;
    background:linear-gradient(90deg, var(--chili-600), var(--chili-500));
    transition:width 900ms var(--ease)}
  .scoreNum{font:700 14px/1 var(--font-ui); color:var(--ink-900); min-width:26px; text-align:right; font-variant-numeric:tabular-nums}
  .rowMeta{display:flex; align-items:center; gap:10px; margin-top:8px; flex-wrap:wrap}
  .rowActions{display:flex; gap:8px}
  .btn{appearance:none; cursor:pointer; font:600 12.5px/1 var(--font-ui); padding:8px 12px; border-radius:var(--r-8);
    border:1px solid var(--paper-200); background:var(--paper-50); color:var(--ink-800)}
  .btn:hover{border-color:var(--chili-500); color:var(--chili-600)}
  .btn.primary{background:var(--ink-900); color:var(--paper-50); border-color:var(--ink-900)}
  .btn.primary:hover{background:var(--chili-600); border-color:var(--chili-600); color:var(--paper-50)}
  .btn:focus-visible{outline:3px solid var(--info-500); outline-offset:2px}
  .btn[disabled]{opacity:.5; cursor:default}

  /* ---- Method panel ---- */
  details.method{margin-top:22px; border:1px solid var(--paper-200); border-radius:var(--r-14);
    background:radial-gradient(120% 140% at 100% 0%, var(--paper-50), var(--paper-100) 70%); overflow:hidden}
  details.method>summary{cursor:pointer; list-style:none; padding:14px 18px; font:600 14px/1 var(--font-ui);
    color:var(--ink-900); display:flex; align-items:center; justify-content:space-between}
  details.method>summary::-webkit-details-marker{display:none}
  details.method>summary::after{content:"Show"; font:600 12px/1 var(--font-ui); color:var(--chili-600)}
  details.method[open]>summary::after{content:"Hide"}
  details.method>summary:focus-visible{outline:3px solid var(--info-500); outline-offset:-3px}
  .weights{margin:0; padding:4px 18px 18px; display:grid; gap:8px}
  .wRow{display:grid; grid-template-columns:1fr 120px 44px; align-items:center; gap:12px; font-size:13px}
  .wLabel{color:var(--ink-800)}
  .wTrack{height:8px; border-radius:999px; background:var(--paper-200); overflow:hidden}
  .wFill{height:100%; background:var(--carbo-400); border-radius:999px}
  .wPct{text-align:right; font-variant-numeric:tabular-nums; color:var(--ink-700); font-weight:600}
  .methodNote{margin:0; padding:0 18px 16px; font-size:12.5px; color:var(--ink-700)}

  @media (max-width:640px){
    .row{grid-template-columns:24px 40px 1fr; }
    .rowActions{grid-column:1 / -1; justify-content:flex-start; margin-top:4px}
    .wRow{grid-template-columns:1fr 70px 40px}
  }
  @media (prefers-reduced-motion:reduce){
    .row{animation:none; opacity:1; transform:none}
    .bar{transition:none}
  }
</style>
</head>
<body>
<main class="wrap">
  <p class="eyebrow">Explore</p>
  <h1>Rankings Lab</h1>
  <p class="lede">No single &ldquo;best&rdquo; list. Each view measures one thing, shows how it is calculated,
    and labels its source and confidence. Retail counts are engagement snapshots, never sales.</p>

  <div class="tablist" role="tablist" aria-label="Ranking view" id="tablist"></div>

  <section class="card" role="tabpanel" id="panel" aria-live="polite">
    <div class="metaStrip" id="metaStrip"></div>
    <p class="purpose" id="purpose"></p>
    <p class="caveat" id="caveat" hidden></p>
    <p class="count" id="count"></p>
    <ol class="list" id="list"></ol>
    <details class="method" id="method">
      <summary id="methodSummary"></summary>
      <div class="weights" id="weights"></div>
      <p class="methodNote">Scores normalize 0&ndash;100. An asterisk (<span class="star">*</span>) marks families whose
        inputs are derived from tier and category rather than authored &mdash; shown at lower confidence, never presented as fact.</p>
    </details>
  </section>
</main>

<script>
/* ---- esc(): the project's HTML-escape helper (shared with the vanilla preview harness) ---- */
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

/* ---- FF: global data namespace. In production this is computed by computeRanking(); ----
   here every view carries precomputed entries so the mock is faithful and offline. */
const SRC = {
  official:{short:"Official", token:"--src-official"},
  "retail-signal":{short:"Retail signal", token:"--src-retail"},
  editorial:{short:"Editorial", token:"--src-editorial"},
  synthetic:{short:"Synthetic", token:"--src-synthetic"},
};
const CONF = {high:3, medium:2, low:1};
const INPUT_LABELS = {
  officialProminence:"Official prominence", retailVisibility:"Retail visibility",
  categoryImportance:"Category importance", supportInquiryValue:"Support & inquiry value",
  evidenceConfidence:"Evidence confidence", heatAccessibility:"Heat accessibility",
  familiarFlavor:"Familiar flavor", preparationSimplicity:"Preparation simplicity",
  formatConvenience:"Format breadth", guidanceConfidence:"Guidance confidence",
  categoryGrowth:"Category growth", educationNeed:"Education need",
  marketingSupportPotential:"Marketing support", inquiryDemand:"Inquiry demand",
  componentComplexity:"Component complexity", handlingComplexity:"Handling complexity",
  allergenComplexity:"Allergen complexity", preparationSteps:"Preparation steps",
};
const IMG = f => `/products/${f}.png`; // matches src/data/images.ts P()
const e = (name, familyId, img, score, confidence, derived=false) => ({name, familyId, img: img?IMG(img):null, score, confidence, derived});

window.FF = { rankings: [
  { id:"portfolio-priority", label:"Portfolio Priority", sourceType:"editorial", confidence:"medium",
    lastReviewed:"2026-07-07",
    purpose:"Which products we'd build and staff support for first.",
    caveat:"FireFlow editorial index. Not an official Samyang ranking or bestseller list.",
    weights:{officialProminence:.25, retailVisibility:.25, formatConvenience:.15, categoryImportance:.15, supportInquiryValue:.1, evidenceConfidence:.1},
    scored:20, total:45, entries:[
      e("Buldak Carbonara","buldak-carbonara","buldak-multi-carbonara",92,"medium"),
      e("Buldak Original","buldak-original","buldak-multi-original",89,"medium"),
      e("Buldak 2X Spicy","buldak-2x-spicy","buldak-multi-2x-spicy",83,"medium"),
      e("Buldak Carbonara Hot Sauce","buldak-carbonara-hot-sauce","buldak-sauce-carbonara",83,"medium"),
      e("Buldak Original Hot Sauce","buldak-original-hot-sauce","buldak-sauce-original",80,"medium"),
      e("Buldak Habanero Lime","buldak-habanero-lime","buldak-multi-habanero-lime",74,"medium"),
      e("Buldak Cheese","buldak-cheese","buldak-multi-cheese",73,"low",true),
      e("Buldak Quattro Cheese","buldak-quattro-cheese","buldak-multi-quattro-cheese",66,"low",true),
      e("Buldak Rosé","buldak-rose","buldak-multi-rose",66,"low",true),
      e("Buldak Cream Carbonara","buldak-cream-carbonara","buldak-multi-cream-carbonara",66,"low",true),
      e("Buldak Swicy","buldak-swicy","buldak-multi-swicy",63,"low",true),
      e("Buldak Mac and Cheese Carbo","buldak-mac-and-cheese-carbo","mccarbobox",52,"low",true),
    ]},
  { id:"first-time-fit", label:"First-Time Buyer Fit", sourceType:"editorial", confidence:"medium",
    lastReviewed:"2026-07-07",
    purpose:"How approachable this is for someone new to Buldak-level heat.",
    caveat:"Editorial experience score, not an official rating. Products without a heat reading are not scored here.",
    weights:{heatAccessibility:.3, familiarFlavor:.25, preparationSimplicity:.2, formatConvenience:.15, guidanceConfidence:.1},
    scored:6, total:45, entries:[
      e("Buldak Carbonara Hot Sauce","buldak-carbonara-hot-sauce","buldak-sauce-carbonara",76,"medium"),
      e("Buldak Original Hot Sauce","buldak-original-hot-sauce","buldak-sauce-original",74,"medium"),
      e("Buldak Carbonara","buldak-carbonara","buldak-multi-carbonara",72,"medium"),
      e("Buldak Original","buldak-original","buldak-multi-original",67,"medium"),
      e("Buldak Habanero Lime","buldak-habanero-lime","buldak-multi-habanero-lime",57,"medium"),
      e("Buldak 2X Spicy","buldak-2x-spicy","buldak-multi-2x-spicy",53,"medium"),
    ]},
  { id:"vendor-opportunity", label:"Vendor Opportunity", sourceType:"editorial", confidence:"low",
    lastReviewed:"2026-07-07",
    purpose:"Where a retailer or distributor conversation is most worth having.",
    caveat:null,
    weights:{retailVisibility:.2, categoryGrowth:.2, formatConvenience:.15, educationNeed:.15, marketingSupportPotential:.15, inquiryDemand:.15},
    scored:6, total:45, entries:[
      e("Buldak Carbonara","buldak-carbonara","buldak-multi-carbonara",84,"low"),
      e("Buldak Carbonara Hot Sauce","buldak-carbonara-hot-sauce","buldak-sauce-carbonara",77,"low"),
      e("Buldak 2X Spicy","buldak-2x-spicy","buldak-multi-2x-spicy",75,"low"),
      e("Buldak Original Hot Sauce","buldak-original-hot-sauce","buldak-sauce-original",75,"low"),
      e("Buldak Original","buldak-original","buldak-multi-original",74,"low"),
      e("Buldak Habanero Lime","buldak-habanero-lime","buldak-multi-habanero-lime",68,"low"),
    ]},
  { id:"customer-guidance", label:"Customer Guidance Opportunity", sourceType:"editorial", confidence:"medium",
    lastReviewed:"2026-07-07",
    purpose:"Where clearer information or support would most improve the experience.",
    caveat:"A high score means better guidance could help. It does NOT mean the product is defective.",
    weights:{preparationSteps:.25, allergenComplexity:.25, componentComplexity:.25, inquiryDemand:.25},
    scored:20, total:45, entries:[
      e("Buldak Carbonara","buldak-carbonara","buldak-multi-carbonara",66,"medium"),
      e("Buldak Original","buldak-original","buldak-multi-original",61,"medium"),
      e("Buldak 2X Spicy","buldak-2x-spicy","buldak-multi-2x-spicy",61,"medium"),
      e("Buldak Habanero Lime","buldak-habanero-lime","buldak-multi-habanero-lime",58,"medium"),
      e("Buldak Cheese","buldak-cheese","buldak-multi-cheese",48,"low",true),
      e("Buldak Carbonara Hot Sauce","buldak-carbonara-hot-sauce","buldak-sauce-carbonara",40,"medium"),
    ]},
  { id:"support-complexity", label:"Support Complexity", sourceType:"editorial", confidence:"medium",
    lastReviewed:"2026-07-07",
    purpose:"How much operational care a product needs to support well.",
    caveat:null,
    weights:{componentComplexity:.25, handlingComplexity:.2, allergenComplexity:.2, preparationSteps:.2, formatConvenience:.15},
    scored:20, total:45, entries:[
      e("Buldak Carbonara","buldak-carbonara","buldak-multi-carbonara",55,"medium"),
      e("Buldak Carbonara Dumpling","buldak-carbonara-dumpling","buldak-carbonara-dumpling",54,"low",true),
      e("Buldak Original","buldak-original","buldak-multi-original",52,"medium"),
      e("Buldak 2X Spicy","buldak-2x-spicy","buldak-multi-2x-spicy",52,"medium"),
      e("Buldak Habanero Lime","buldak-habanero-lime","buldak-multi-habanero-lime",48,"medium"),
      e("Buldak Carbonara Fried Rice","buldak-carbonara-fried-rice","buldak-frozen-carbonara-fried-rice",47,"low",true),
    ]},
  { id:"format-versatility", label:"Format Versatility", sourceType:"official", confidence:"high",
    lastReviewed:"2026-07-07",
    purpose:"How many ways a family shows up on shelf (Multi, Big Bowl, Cup, bottle, frozen, etc.).",
    caveat:null,
    weights:{formatConvenience:1},
    scored:45, total:45, entries:[
      e("Buldak Carbonara","buldak-carbonara","buldak-multi-carbonara",100,"high"),
      e("Buldak Original","buldak-original","buldak-multi-original",100,"high"),
      e("Buldak 2X Spicy","buldak-2x-spicy","buldak-multi-2x-spicy",100,"high"),
      e("Buldak Cheese","buldak-cheese","buldak-multi-cheese",100,"high"),
      e("Buldak Carbonara Hot Sauce","buldak-carbonara-hot-sauce","buldak-sauce-carbonara",100,"high"),
      e("Buldak Original Hot Sauce","buldak-original-hot-sauce","buldak-sauce-original",100,"high"),
      e("Buldak Habanero Lime","buldak-habanero-lime","buldak-multi-habanero-lime",67,"high"),
      e("Buldak Rosé","buldak-rose","buldak-multi-rose",67,"high"),
      e("Buldak Quattro Cheese","buldak-quattro-cheese","buldak-multi-quattro-cheese",67,"high"),
      e("Buldak Mac and Cheese Carbo","buldak-mac-and-cheese-carbo","mccarbobox",67,"high"),
      e("Buldak Carbonara Dumpling","buldak-carbonara-dumpling","buldak-carbonara-dumpling",33,"high"),
      e("Buldak Korean Chicken","buldak-korean-chicken","buldak-cup-koreanchicken",33,"high"),
    ]},
  { id:"retail-visibility", label:"Retail Visibility", sourceType:"retail-signal", confidence:"low",
    lastReviewed:"2026-07-07",
    purpose:"Public retail engagement snapshot — single-listing, date-stamped. Not sales.",
    caveat:"Public retail engagement only. Not total sales, unique customers, or market share.",
    weights:{retailVisibility:1},
    scored:6, total:45, entries:[
      e("Buldak Carbonara","buldak-carbonara","buldak-multi-carbonara",95,"low"),
      e("Buldak Carbonara Hot Sauce","buldak-carbonara-hot-sauce","buldak-sauce-carbonara",85,"low"),
      e("Buldak Original","buldak-original","buldak-multi-original",80,"low"),
      e("Buldak Original Hot Sauce","buldak-original-hot-sauce","buldak-sauce-original",75,"low"),
      e("Buldak 2X Spicy","buldak-2x-spicy","buldak-multi-2x-spicy",70,"low"),
      e("Buldak Habanero Lime","buldak-habanero-lime","buldak-multi-habanero-lime",60,"low"),
    ]},
  { id:"evidence-confidence", label:"Evidence Confidence", sourceType:"editorial", confidence:"high",
    lastReviewed:"2026-07-07",
    purpose:"How well-sourced this product's data is right now.",
    caveat:null,
    weights:{evidenceConfidence:1},
    scored:45, total:45, entries:[
      e("Buldak Carbonara","buldak-carbonara","buldak-multi-carbonara",85,"high"),
      e("Buldak Original","buldak-original","buldak-multi-original",85,"high"),
      e("Buldak 2X Spicy","buldak-2x-spicy","buldak-multi-2x-spicy",80,"high"),
      e("Buldak Carbonara Hot Sauce","buldak-carbonara-hot-sauce","buldak-sauce-carbonara",80,"high"),
      e("Buldak Original Hot Sauce","buldak-original-hot-sauce","buldak-sauce-original",80,"high"),
      e("Buldak Habanero Lime","buldak-habanero-lime","buldak-multi-habanero-lime",75,"high"),
      e("Buldak Cheese","buldak-cheese","buldak-multi-cheese",35,"low",true),
      e("Buldak Rosé","buldak-rose","buldak-multi-rose",35,"low",true),
      e("Buldak Quattro Cheese","buldak-quattro-cheese","buldak-multi-quattro-cheese",35,"low",true),
      e("Buldak Cream Carbonara","buldak-cream-carbonara","buldak-multi-cream-carbonara",35,"low",true),
    ]},
]};

/* ---- render ---- */
const views = FF.rankings;
let active = views[0].id;
const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

function confChip(level){
  const dots = [0,1,2].map(i => `<i class="${i < CONF[level] ? "on":""}"></i>`).join("");
  return `<span class="chip"><span class="dots" aria-hidden="true">${dots}</span>${esc(level[0].toUpperCase()+level.slice(1))} confidence</span>`;
}
function srcChip(type){
  const m = SRC[type];
  return `<span class="chip"><span class="dot" style="background:var(${m.token})" aria-hidden="true"></span>${esc(m.short)}</span>`;
}

function renderTabs(){
  $("tablist").innerHTML = views.map((v,i) =>
    `<button class="tab" role="tab" id="tab-${v.id}" aria-controls="panel"
       aria-selected="${v.id===active}" tabindex="${v.id===active?0:-1}"
       data-act="tab" data-view="${v.id}">${esc(v.label)}</button>`).join("");
}

function renderPanel(){
  const v = views.find(x => x.id === active);
  $("panel").setAttribute("aria-labelledby", "tab-"+v.id);
  $("metaStrip").innerHTML = srcChip(v.sourceType) + confChip(v.confidence) +
    `<span class="reviewed">Reviewed ${esc(v.lastReviewed)}</span>`;
  $("purpose").textContent = v.purpose;
  const cav = $("caveat");
  if(v.caveat){ cav.hidden=false; cav.textContent = v.caveat; } else { cav.hidden=true; }
  $("count").innerHTML = `<b>${v.scored}</b> of ${v.total} families scored` +
    (v.scored < v.total ? ` &mdash; others are not scored here rather than guessed.` : "");

  $("list").innerHTML = v.entries.map((en,i) => {
    const thumb = en.img
      ? `<span class="thumb"><img src="${esc(en.img)}" alt="" loading="lazy"
           onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'fallback',textContent:'${esc(en.name.replace(/[^A-Za-z ]/g,'').split(' ').filter(Boolean).slice(1,3).map(w=>w[0]).join('')||'B')}'}))"></span>`
      : `<span class="thumb"><span class="fallback">${esc(en.name.split(' ').slice(1,3).map(w=>w[0]).join(''))}</span></span>`;
    const star = en.derived
      ? `<abbr class="star" title="Some inputs derived from tier and category rather than authored — lower confidence">*</abbr>` : "";
    return `<li class="row" style="--i:${i}">
      <span class="rank">${i+1}</span>
      ${thumb}
      <span class="rowMain">
        <button class="nameBtn" data-act="open" data-family="${en.familyId}">${esc(en.name)}${star}</button>
        <span class="barRow">
          <span class="barWrap"><span class="bar" data-score="${en.score}"></span></span>
          <span class="scoreNum">${en.score}</span>
        </span>
        <span class="rowMeta">${confChip(en.confidence)}</span>
      </span>
      <span class="rowActions">
        <button class="btn" data-act="open" data-family="${en.familyId}">Open</button>
        <button class="btn primary" data-act="compare" data-family="${en.familyId}">Compare</button>
      </span>
    </li>`;
  }).join("");

  // Method panel
  $("methodSummary").textContent = `How ${v.label} is calculated`;
  const entriesW = Object.entries(v.weights);
  $("weights").innerHTML = entriesW.map(([k,w]) => {
    const pct = Math.round(w*100);
    return `<div class="wRow"><span class="wLabel">${esc(INPUT_LABELS[k]||k)}</span>
      <span class="wTrack"><span class="wFill" style="width:${pct}%"></span></span>
      <span class="wPct">${pct}%</span></div>`;
  }).join("");

  animateBars();
}

function animateBars(){
  const bars = document.querySelectorAll(".bar");
  if(reduce){ bars.forEach(b => b.style.width = b.dataset.score+"%"); return; }
  const io = new IntersectionObserver((rows, obs) => {
    rows.forEach(r => { if(r.isIntersecting){
      const b = r.target; setTimeout(()=> b.style.width = b.dataset.score+"%", 40); obs.unobserve(b);
    }});
  }, {threshold:.3});
  bars.forEach(b => { b.style.width = "0%"; io.observe(b); });
}

/* ---- event delegation via data-act ---- */
document.addEventListener("click", ev => {
  const t = ev.target.closest("[data-act]"); if(!t) return;
  const act = t.dataset.act;
  if(act === "tab"){ active = t.dataset.view; renderTabs(); renderPanel();
    document.getElementById("tab-"+active).focus(); }
  else if(act === "open"){ console.log("[FF] SELECT_FAMILY", t.dataset.family); }
  else if(act === "compare"){ console.log("[FF] ADD_COMPARE", t.dataset.family); }
});

/* ---- roving tabindex: Left/Right/Home/End ---- */
$("tablist").addEventListener("keydown", ev => {
  const tabs = [...$("tablist").querySelectorAll(".tab")];
  let i = tabs.findIndex(t => t.getAttribute("aria-selected")==="true");
  if(ev.key==="ArrowRight"||ev.key==="ArrowDown") i = (i+1)%tabs.length;
  else if(ev.key==="ArrowLeft"||ev.key==="ArrowUp") i = (i-1+tabs.length)%tabs.length;
  else if(ev.key==="Home") i = 0;
  else if(ev.key==="End") i = tabs.length-1;
  else return;
  ev.preventDefault(); active = tabs[i].dataset.view; renderTabs(); renderPanel(); tabs[i].focus();
});

renderTabs(); renderPanel();
</script>
</body>
</html>
```

---

## 4. Accessibility, reduced motion, mobile

**Keyboard & focus.** Tabs are a real `role="tablist"` with roving tabindex — only the selected tab is in the Tab order; Left/Right/Up/Down/Home/End move between them and immediately swap the panel. Every interactive element (`nameBtn`, `Open`, `Compare`, method `summary`) shows a single high-contrast `--info-500` focus ring via `:focus-visible`.

**No info by hover or color alone.**
- The **score is always plain text** (`.scoreNum`) next to the bar. If the bar animation never runs, the number is still correct.
- **Confidence** is dots **plus** the word ("Medium confidence"), never the dots alone.
- **Source type** is a colored dot **plus** its label ("Retail signal").
- The **derived marker** is a literal `*` with an `abbr title`, not a color.
- The caveat is a bordered text block, not merely a tinted row.

**Reduced motion.** `prefers-reduced-motion: reduce` disables the row stagger animation (rows appear at final state) and the bar `width` transition; `animateBars()` branches to set every bar straight to its final width with no `IntersectionObserver` delay. Nothing important is gated behind motion.

**Screen readers.** The panel is `aria-live="polite"` and re-labelled by the active tab on each switch, so a view change is announced. Thumbnails use empty `alt=""` (decorative — the product name is the adjacent text). Ranked rows are a semantic `<ol>` so position is conveyed natively.

**Mobile.** Under 640px the row collapses to `rank / thumb / main`, and the actions wrap to a full-width line below. The method weight rows shrink their track column. Tabs already wrap. Type never drops below 12.5px — this is an operational dashboard, not fine print.

---

## 5. States

| State | Treatment |
|---|---|
| **Default** | First tab (`portfolio-priority`) selected; top 12 rows; bars animate on scroll-in. |
| **View switch** | Panel content replaced, `aria-live` announces, focus returns to the newly selected tab, bars re-animate. |
| **Few families scored** (`first-time-fit`, `retail-visibility`) | Count line reads e.g. "6 of 45 families scored — others are not scored here rather than guessed." The honest exclusion is the message, not an error. |
| **Derived entry** | `*` marker + Low-confidence chip; weight/inputs came from tier + category. |
| **Missing thumbnail** | `<img onerror>` swaps to an initials `.fallback` chip (e.g. "CH"), so a missing/offline `/products/*.png` never shows a broken image. |
| **Method collapsed / expanded** | `details` toggles; summary shows Show/Hide affordance; weights render as labeled mini-bars with % text. |
| **Reduced motion** | Rows and bars appear instantly at final state. |
| **Empty view** (defensive) | If `entries` were ever empty, the count line still renders and the `<ol>` is simply empty — no crash. |

---

## 6. Integration notes

### React (production)
- The component already lives at `src/components/home/RankingsLab/RankingsLab.tsx`. This spec is an **enhancement of the existing markup**, not a rewrite — keep `useHome()`, `dispatch({type:"SET_RANKING_MODE"})`, `SELECT_FAMILY`, and `ADD_COMPARE`.
- Replace the plain `<ol>` rows with the richer row: add the **thumbnail** via `imageForVariant`/`IMAGE_BY_FAMILY` from `src/data/images.ts` (`imageForVariant(entry.familyId+"--multi", entry.familyId)` or fall back to family hero), the **animated bar**, **`ConfidenceBadge`** (already imported), and the `*` marker (already present as `styles.missing`).
- Swap the flat tab buttons for **roving tabindex**: track selected index, set `tabIndex={selected?0:-1}`, and handle `onKeyDown` on the `tablist` exactly as the vanilla `keydown` handler does.
- **Bar animation**: use a small `useEffect` + `IntersectionObserver` (or a `useInView` hook) keyed on `view.id`; on reduced motion set `width` to the final value immediately. Read `window.matchMedia("(prefers-reduced-motion:reduce)")`.
- **Meta strip / method panel**: reuse `<SourceBadge type={view.sourceType}/>`, `<ConfidenceBadge level={view.confidence}/>`, and render `view.weights` as the mini-bar list instead of plain `<li>weight X%</li>`.
- Continue slicing `computeRanking(view.id).slice(0,12)` — never present a single "best"; the tabs are the whole point.

### Vanilla preview harness
The recipe follows the shared preview conventions so it drops into the static harness unchanged:
- **`window.FF`** — global namespace holding **precomputed entries** per view (mirrors `computeRanking` output so the preview needs no bundler). In the harness, populate `FF.rankings` from a build step that runs `computeRanking` for all 8 views.
- **`esc()`** — the shared HTML-escape helper used for every interpolated string.
- **`data-act` / `data-view` / `data-family`** — all interaction is event-delegated off one document click listener (`data-act="tab|open|compare"`), matching the harness pattern; `open`/`compare` just log the action the React `dispatch` would fire.
- Thumbnails reference the real `/products/<file>.png` paths from `images.ts`; the `onerror` fallback keeps the preview clean when assets aren't served.

---

## 7. Tradeoffs & risks

- **Precomputed entries can drift.** The vanilla `FF.rankings` values are a snapshot of `computeRanking`. If weights or `rankingInputs` change, regenerate them (ideally via a build script) or the preview will silently disagree with production. The React component has no such risk — it computes live.
- **`IntersectionObserver` + re-render.** Re-observing bars on every view switch is cheap here (≤12 rows) but must `unobserve` after firing to avoid leaks; the recipe does. In React, tie the observer's lifecycle to `view.id` so it re-runs on tab change.
- **Thumbnail weight.** 12 product images per view is fine with `loading="lazy"`, but on very slow connections the initials fallback should feel intentional, not like failure — it does, because the name is always adjacent.
- **Spotlight restraint.** The gradient-mask border and radial paper wash are deliberately low-contrast; pushed harder they'd read as generic SaaS glow. Keep opacity conservative to preserve the "premium printed stock" feel.
- **Honesty is load-bearing.** The `*` marker, the "not scored rather than guessed" count, and the per-view caveat are not decoration — removing any of them breaks the transparent-measurement claim that makes this a credible CX artifact. Treat them as required, not optional polish.
