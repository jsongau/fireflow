# Resolution Simulator — UI Upgrade Spec

> Target component: `src/components/home/ResolutionSimulator/ResolutionSimulator.tsx`
> Data: `src/data/scenarios.ts` (`SCENARIOS`, `CONSUMER_SCENARIOS`, `VENDOR_SCENARIOS`), `src/data/families.ts`
> The HTML/CSS/JS block below runs stand-alone (open as `.html`). Everything shown is **synthetic** and labeled as such. Section 6 maps it back to React.

---

## 1. Concept + job competency

The Resolution Simulator is the operational centerpiece of FireFlow: it shows how a *reported issue* becomes a *governed case*. A shopper's missing sauce packet or a distributor's short-shipped PO enters at `reported` and moves through a seven-stage lifecycle — `reported → verified → routed → resolution-proposed → customer-updated → resolved → improvement-review` — with, at every step, a clear separation of **verified facts vs. assumptions**, **one accountable owner**, a **visible next customer update**, and **approvals required before any commitment**.

This is the heart of the Samyang **Manager, Customer Experience** role: *escalation governance, deduction handling, and order-to-cash discipline*. The vendor scenarios are explicit about it — a retailer deduction/chargeback is reconciled against proof-of-delivery before it is accepted or disputed; a partial PO fill is owned by CX with Supply Chain and Sales collaborating; an EDI 850 rejection protects the ship date while the mapping is fixed. The consumer scenarios show the same rigor at consumer scale (a missing component is logged by lot code for pattern-watch, not just replaced).

The upgrade turns the current plain stepper into something that *looks* like a real case console while keeping every honesty guarantee:

- A **case header** with severity as **icon + word** (never color alone) and a persistent **Synthetic** marker.
- A **restrained SVG stroke-progress lifecycle timeline** — clickable stage nodes, animated progress fill, plus **Prev / Advance** controls.
- **Animated stage transitions** for the active stage detail.
- The full **governed-case anatomy** as calm cards: verified facts, evidence + why, owner, collaborators, next customer update, resolution options, approvals, root cause, corrective action.
- **Consumer + vendor scenario pickers.**

---

## 2. Technique, reinterpreted (never copied)

| Reference technique | How FireFlow reinterprets it |
|---|---|
| SVG stroke-dashoffset timeline progress | A single horizontal SVG track carries a **progress stroke** whose `stroke-dashoffset` animates from "empty" to the fraction `currentIndex / (stages-1)`. It reads as a fountain-pen line being drawn across a ledger, in `--chili-600 → --carbo-400`. |
| Clickable timeline | Real semantic `<button>` stage nodes sit *on* the track (not fragile SVG hit areas), so keyboard/AT users get first-class access; the SVG stroke is the visual progress behind them. |
| Animated stage transitions | The active-stage detail block cross-fades / slides on change (`--t-med`), so advancing feels like turning to the next page of a case file. |
| Radial spotlight cards | Anatomy cards sit on warm paper with a soft radial highlight and a **gradient-mask hairline border**; the header card carries a slightly stronger wash to anchor the case. |
| Staggered reveal | Anatomy cards rise in with a per-index delay when the case loads. |

Restraint is the point: this is *calm operational control*, not a mission-control HUD. No neon, no glass, no arrows-as-drama.

---

## 3. Complete runnable recipe (HTML + CSS + JS)

Save as `resolution-simulator.html`. Real scenario content is embedded in `FF.scenarios` (a representative subset of `src/data/scenarios.ts`: 3 consumer + 2 vendor).

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>FireFlow — Resolution Simulator</title>
<style>
  :root{
    --ink-900:#171311; --ink-800:#221b18; --ink-700:#332924;
    --paper-50:#faf4ea; --paper-100:#f3e9da; --paper-200:#e7d8c3;
    --chili-600:#c2341d; --chili-500:#d94f2f; --chili-050:#f7e0d8; --carbo-400:#e79bb0;
    --ok-500:#4c9a2a; --warn-500:#e0a021; --risk-600:#c2341d; --info-500:#3a7ca5;
    --src-synthetic:#6b5b95;
    --r-8:8px; --r-14:14px; --r-22:22px;
    --shadow-1:0 1px 2px rgba(23,19,17,.08), 0 1px 3px rgba(23,19,17,.06);
    --shadow-2:0 6px 18px rgba(23,19,17,.10), 0 2px 6px rgba(23,19,17,.08);
    --font-display:"Fraunces", Georgia, "Times New Roman", serif;
    --font-ui:"Inter", system-ui, -apple-system, Segoe UI, Roboto, sans-serif;
    --ease:cubic-bezier(.2,.7,.2,1);
    --t-fast:120ms; --t-med:220ms; --t-slow:360ms;
  }
  *{box-sizing:border-box}
  body{margin:0; background:var(--paper-100); color:var(--ink-800); font-family:var(--font-ui); line-height:1.5; -webkit-font-smoothing:antialiased}
  .wrap{max-width:1040px; margin:0 auto; padding:48px 20px 96px}
  .eyebrow{font:600 12px/1 var(--font-ui); letter-spacing:.14em; text-transform:uppercase; color:var(--chili-600); margin:0 0 10px}
  h1{font-family:var(--font-display); font-weight:600; font-size:clamp(30px,5vw,44px); margin:0 0 12px; color:var(--ink-900); letter-spacing:-.01em}
  .lede{max-width:66ch; margin:0 0 26px; color:var(--ink-700); font-size:16px}

  /* ---- Pickers ---- */
  .pickers{display:grid; gap:14px; margin-bottom:26px}
  @media(min-width:760px){.pickers{grid-template-columns:1fr 1fr}}
  .pgroup{background:var(--paper-50); border:1px solid var(--paper-200); border-radius:var(--r-14); padding:12px 14px; box-shadow:var(--shadow-1)}
  .plabel{font:600 11px/1 var(--font-ui); letter-spacing:.12em; text-transform:uppercase; color:var(--ink-700); margin:0 0 10px}
  .picks{display:flex; flex-wrap:wrap; gap:8px}
  .pick{appearance:none; cursor:pointer; font:600 13px/1.2 var(--font-ui); text-align:left; padding:9px 12px; border-radius:var(--r-8);
    border:1px solid var(--paper-200); background:var(--paper-100); color:var(--ink-800); transition:border-color var(--t-fast) var(--ease), background var(--t-fast) var(--ease)}
  .pick:hover{border-color:var(--chili-500); color:var(--chili-600)}
  .pick[aria-pressed="true"]{background:var(--ink-900); color:var(--paper-50); border-color:var(--ink-900)}
  .pick:focus-visible{outline:3px solid var(--info-500); outline-offset:2px}

  /* ---- Case shell ---- */
  .case{position:relative; border-radius:var(--r-22); box-shadow:var(--shadow-2); overflow:hidden;
    background:radial-gradient(120% 80% at 16% 0%, var(--paper-50), var(--paper-100) 60%)}
  .case::before{content:""; position:absolute; inset:0; border-radius:inherit; padding:1px; pointer-events:none;
    background:linear-gradient(135deg, var(--chili-050), var(--carbo-400) 45%, transparent 78%);
    -webkit-mask:linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0); -webkit-mask-composite:xor; mask-composite:exclude}
  .caseInner{padding:24px clamp(18px,3vw,30px) 28px}

  .chead{display:flex; flex-wrap:wrap; gap:14px; align-items:flex-start; justify-content:space-between}
  .ctitle{font-family:var(--font-display); font-size:23px; font-weight:600; color:var(--ink-900); margin:0}
  .csub{margin:4px 0 0; font-size:13.5px; color:var(--ink-700)}
  .ctags{display:flex; align-items:center; gap:10px; flex-wrap:wrap}
  .sev{display:inline-flex; align-items:center; gap:8px; font:700 12.5px/1 var(--font-ui); padding:7px 12px; border-radius:999px;
    border:1px solid var(--paper-200); background:var(--paper-50); color:var(--ink-900)}
  .sev svg{width:15px; height:15px; flex:none}
  .sev[data-sev="standard"] svg{color:var(--info-500)}
  .sev[data-sev="elevated"] svg{color:var(--warn-500)}
  .sev[data-sev="priority"] svg{color:var(--chili-600)}
  .sev[data-sev="specialist"] svg{color:var(--risk-600)}
  .synthetic{display:inline-flex; align-items:center; gap:7px; font:600 12px/1 var(--font-ui); padding:6px 10px; border-radius:999px;
    background:var(--paper-50); border:1px solid var(--paper-200); color:var(--ink-700)}
  .synthetic .dot{width:8px; height:8px; border-radius:50%; background:var(--src-synthetic)}

  .reported{margin:18px 0 6px; font-size:14.5px; color:var(--ink-800); background:var(--paper-50);
    border:1px solid var(--paper-200); border-radius:var(--r-14); padding:12px 14px}
  .reported b{color:var(--ink-900)}

  /* ---- Timeline ---- */
  .timeline{position:relative; margin:24px 0 4px; padding:8px 0 0}
  .tSvg{position:absolute; left:0; right:0; top:26px; width:100%; height:8px; overflow:visible}
  .tTrack{stroke:var(--paper-200); stroke-width:6; stroke-linecap:round}
  .tProg{stroke:url(#tGrad); stroke-width:6; stroke-linecap:round; transition:stroke-dashoffset var(--t-slow) var(--ease)}
  .tNodes{position:relative; display:flex; justify-content:space-between; gap:4px}
  .tNode{appearance:none; background:none; border:none; cursor:pointer; padding:0; display:flex; flex-direction:column; align-items:center; gap:8px; flex:1; min-width:0}
  .tDot{width:20px; height:20px; border-radius:50%; background:var(--paper-100); border:3px solid var(--paper-200); z-index:1;
    transition:background var(--t-med) var(--ease), border-color var(--t-med) var(--ease), transform var(--t-med) var(--ease)}
  .tNode[data-state="done"] .tDot{background:var(--chili-600); border-color:var(--chili-600)}
  .tNode[data-state="current"] .tDot{background:var(--paper-50); border-color:var(--chili-600); transform:scale(1.25); box-shadow:0 0 0 4px var(--chili-050)}
  .tCap{font:600 11px/1.25 var(--font-ui); color:var(--ink-700); text-align:center}
  .tNode[data-state="current"] .tCap{color:var(--ink-900)}
  .tNode[data-state="done"] .tCap{color:var(--ink-800)}
  .tNode:focus-visible{outline:3px solid var(--info-500); outline-offset:3px; border-radius:8px}

  /* ---- Active stage detail ---- */
  .stage{margin:22px 0 8px; background:var(--paper-50); border:1px solid var(--paper-200); border-radius:var(--r-14); padding:16px 18px}
  .stage h3{margin:0 0 6px; font-family:var(--font-display); font-size:18px; color:var(--ink-900); font-weight:600}
  .stage p{margin:0; font-size:14px; color:var(--ink-800)}
  .stageAnim{animation:fade var(--t-med) var(--ease)}
  @keyframes fade{from{opacity:0; transform:translateY(6px)} to{opacity:1; transform:none}}
  .stepMeta{margin:8px 0 0; font-size:12px; color:var(--ink-700)}
  .nav{display:flex; gap:10px; margin-top:14px}
  .btn{appearance:none; cursor:pointer; font:600 13px/1 var(--font-ui); padding:10px 16px; border-radius:var(--r-8);
    border:1px solid var(--paper-200); background:var(--paper-100); color:var(--ink-800)}
  .btn:hover{border-color:var(--chili-500); color:var(--chili-600)}
  .btn.primary{background:var(--ink-900); color:var(--paper-50); border-color:var(--ink-900)}
  .btn.primary:hover{background:var(--chili-600); border-color:var(--chili-600)}
  .btn:focus-visible{outline:3px solid var(--info-500); outline-offset:2px}
  .btn[disabled]{opacity:.45; cursor:default}

  /* ---- Anatomy cards ---- */
  .anatomy{display:grid; gap:12px; margin-top:22px; grid-template-columns:1fr}
  @media(min-width:680px){.anatomy{grid-template-columns:1fr 1fr}}
  .acard{background:var(--paper-50); border:1px solid var(--paper-200); border-radius:var(--r-14); padding:14px 16px;
    opacity:0; transform:translateY(8px); animation:rise var(--t-slow) var(--ease) forwards; animation-delay:calc(var(--i) * 55ms)}
  @keyframes rise{to{opacity:1; transform:none}}
  .acard h4{margin:0 0 8px; font:700 11px/1 var(--font-ui); letter-spacing:.1em; text-transform:uppercase; color:var(--chili-600)}
  .acard ul{margin:0; padding-left:18px; display:grid; gap:5px}
  .acard li, .acard p{font-size:13.5px; color:var(--ink-800); margin:0}
  .acard p+p{margin-top:6px}
  .acard b{color:var(--ink-900)}
  .acard.assumption{border-left:3px solid var(--warn-500)}
  .acard.owner{background:radial-gradient(120% 140% at 100% 0%, var(--paper-50), var(--paper-100) 70%)}
  .why{color:var(--ink-700); font-size:12px}

  .foot{margin:20px 0 0; font-size:12.5px; color:var(--ink-700); border-top:1px dashed var(--paper-200); padding-top:14px}

  @media (prefers-reduced-motion:reduce){
    .tProg{transition:none}
    .stageAnim{animation:none}
    .acard{animation:none; opacity:1; transform:none}
    .tNode[data-state="current"] .tDot{transform:none}
  }
</style>
</head>
<body>
<main class="wrap">
  <p class="eyebrow">Resolve</p>
  <h1>Resolution Simulator</h1>
  <p class="lede">How a reported issue becomes a governed case &mdash; verified facts separated from assumptions,
    one accountable owner, a visible next update, and approvals required before any commitment.</p>

  <div class="pickers" id="pickers"></div>

  <section class="case" aria-labelledby="caseTitle">
    <div class="caseInner">
      <div class="chead">
        <div>
          <h2 class="ctitle" id="caseTitle"></h2>
          <p class="csub" id="caseSub"></p>
        </div>
        <div class="ctags" id="caseTags"></div>
      </div>

      <p class="reported" id="reported"></p>

      <div class="timeline">
        <svg class="tSvg" id="tSvg" preserveAspectRatio="none" aria-hidden="true">
          <defs><linearGradient id="tGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stop-color="var(--chili-600)"/><stop offset="1" stop-color="var(--carbo-400)"/>
          </linearGradient></defs>
          <line class="tTrack" x1="10" y1="4" x2="990" y2="4"/>
          <line class="tProg" id="tProg" x1="10" y1="4" x2="990" y2="4"/>
        </svg>
        <div class="tNodes" id="tNodes" role="group" aria-label="Case lifecycle stages"></div>
      </div>

      <div class="stage" aria-live="polite">
        <div id="stageBody"></div>
        <p class="stepMeta" id="stepMeta"></p>
        <div class="nav">
          <button class="btn" id="prev" data-act="prev">Previous</button>
          <button class="btn primary" id="next" data-act="next">Advance</button>
        </div>
      </div>

      <div class="anatomy" id="anatomy"></div>

      <p class="foot" id="foot"></p>
    </div>
  </section>
</main>

<script>
function esc(s){return String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}

/* severity icon (shape, never color alone) + word */
const SEV = {
  standard:{word:"Standard", icon:'<circle cx="8" cy="8" r="6" fill="currentColor"/>'},
  elevated:{word:"Elevated", icon:'<path d="M8 1.5 15 14H1z" fill="currentColor"/>'},
  priority:{word:"Priority", icon:'<path d="M8 1 15 8 8 15 1 8z" fill="currentColor"/>'},
  specialist:{word:"Specialist escalation", icon:'<path d="M8 1 14 3v5c0 4-3 6-6 7-3-1-6-3-6-7V3z" fill="currentColor"/>'},
};
const FAMILY_NAME = {
  "buldak-carbonara":"Buldak Carbonara", "buldak-original":"Buldak Original",
  "buldak-original-hot-sauce":"Buldak Original Hot Sauce", "buldak-potato-chips-original":"Buldak Potato Chips Original",
};

/* FF: global namespace with precomputed scenario content (subset of src/data/scenarios.ts) */
window.FF = { scenarios: [
  { id:"s-carbonara-missing-sauce", channel:"consumer", title:"Missing Carbonara sauce packet",
    familyId:"buldak-carbonara", severity:"standard",
    reported:"A shopper opened a Buldak Carbonara Multi pack and found the cheese powder present but the liquid sauce sachet missing.",
    verifiedFacts:["Product and format confirmed from the photo (Carbonara Multi).","Expected components for this format: noodle block, liquid sauce, cheese powder.","Lot code captured from the package."],
    evidenceNeeded:["Photo of the opened package and contents","Lot code / best-by"],
    owner:"Consumer Care specialist", collaborators:["Quality (only if the lot code recurs)"],
    customerUpdateCommitment:"First reply within one business day; replacement decision within two.",
    resolutionOptions:["Replacement product","Refund via point of purchase","Coupon"],
    approvalsRequired:["Supervisor approval if compensation exceeds the standard replacement threshold"],
    rootCause:"Single-pack fill miss; not yet a pattern.",
    correctiveAction:"Log the lot code; if the same lot recurs, open a Quality review of that fill line.",
    stages:[
      {stage:"reported",title:"Reported",detail:"Consumer submits the issue with the product pre-identified as Carbonara Multi."},
      {stage:"verified",title:"Verified",detail:"Photo confirms the missing liquid sauce; expected components known from the format."},
      {stage:"routed",title:"Routed",detail:"Assigned to a Consumer Care owner; lot code logged for pattern watch."},
      {stage:"resolution-proposed",title:"Resolution proposed",detail:"Replacement offered; refund alternative noted."},
      {stage:"customer-updated",title:"Customer updated",detail:"Owner confirms the resolution and the next step, within the committed window."},
      {stage:"resolved",title:"Resolved",detail:"Replacement dispatched / refund confirmed; case closed with CSAT request."},
      {stage:"improvement-review",title:"Improvement review",detail:"Lot code added to the fill-miss signal; escalates to Quality only if it recurs."},
    ]},
  { id:"s-sauce-leaking", channel:"consumer", title:"Leaking hot sauce bottle",
    familyId:"buldak-original-hot-sauce", severity:"elevated",
    reported:"A 200g Original Hot Sauce bottle arrived leaking with a loose cap.",
    verifiedFacts:["Leak and cap condition confirmed by photo.","Lot code captured.","Seal-integrity concern noted."],
    evidenceNeeded:["Photo of bottle, cap and seal","Lot code"],
    owner:"Consumer Care specialist", collaborators:["Quality (seal integrity)"],
    customerUpdateCommitment:"First reply within one business day; Quality note within three.",
    resolutionOptions:["Replacement","Refund"],
    approvalsRequired:["Quality sign-off if seal-integrity pattern emerges"],
    rootCause:"Possible cap-torque or seal issue; monitor by lot.",
    correctiveAction:"Track lot codes; escalate to Quality if the same lot recurs.",
    stages:[
      {stage:"reported",title:"Reported",detail:"Consumer reports leak; product pre-identified as 200g Original sauce."},
      {stage:"verified",title:"Verified",detail:"Photo confirms leak and loose cap; lot code logged."},
      {stage:"routed",title:"Routed",detail:"Owner assigned; Quality flagged for seal watch."},
      {stage:"resolution-proposed",title:"Resolution proposed",detail:"Replacement offered."},
      {stage:"customer-updated",title:"Customer updated",detail:"Resolution and Quality follow-up communicated."},
      {stage:"resolved",title:"Resolved",detail:"Replacement sent; case closed."},
      {stage:"improvement-review",title:"Improvement review",detail:"Contributes to a seal-integrity signal by lot."},
    ]},
  { id:"s-carbonara-allergen", channel:"consumer", title:"Milk allergen question — Carbonara",
    familyId:"buldak-carbonara", severity:"priority",
    reported:"A shopper asks whether Buldak Carbonara Multi contains milk.",
    verifiedFacts:["Official Carbonara Multi allergen statement lists wheat, soy, and milk.","Standing reminder: packaging can change; the current physical package is authoritative."],
    evidenceNeeded:["Exact product and format","The specific allergen concern"],
    owner:"Consumer Care specialist", collaborators:["Quality / Regulatory (approved allergen language)"],
    customerUpdateCommitment:"Same-day factual answer using approved language.",
    resolutionOptions:["Provide the official allergen statement for that exact format","Direct to verify the current package"],
    approvalsRequired:["Uses pre-approved allergen language only; no ad-hoc medical guidance"],
    rootCause:"Information need, not a defect.",
    correctiveAction:"If milk-allergen questions cluster on creamy variants, improve on-page allergen clarity.",
    stages:[
      {stage:"reported",title:"Reported",detail:"Consumer asks an allergen question with the product pre-identified."},
      {stage:"verified",title:"Verified",detail:"Answer drawn from the official Carbonara Multi statement (wheat, soy, milk)."},
      {stage:"routed",title:"Routed",detail:"Handled by Consumer Care using approved language; Regulatory available."},
      {stage:"resolution-proposed",title:"Resolution proposed",detail:"Official statement shared; verify-the-package reminder included."},
      {stage:"customer-updated",title:"Customer updated",detail:"Factual reply delivered same day."},
      {stage:"resolved",title:"Resolved",detail:"Question answered; no defect implied."},
      {stage:"improvement-review",title:"Improvement review",detail:"Feeds a guidance signal on creamy-variant allergen clarity."},
    ]},
  { id:"s-carbonara-partial-order", channel:"vendor", title:"Partial Carbonara order (backorder)",
    familyId:"buldak-carbonara", severity:"elevated",
    reported:"A distributor's PO for Buldak Carbonara Multi shipped short against the ordered quantity.",
    verifiedFacts:["PO number confirmed; ordered vs. shipped quantities reconciled.","Backordered lines identified with a projected availability window."],
    evidenceNeeded:["PO number","Expected vs. received quantities"],
    owner:"Customer Experience manager", collaborators:["Supply Chain","Sales"],
    customerUpdateCommitment:"Acknowledge same day; confirmed backorder date within two business days.",
    resolutionOptions:["Ship balance on a confirmed date","Offer a substitute format where agreed","Adjust the PO with buyer approval"],
    approvalsRequired:["Delivery-date commitment","Any substitution","Any credit"],
    rootCause:"Allocation shortfall on a high-demand SKU.",
    correctiveAction:"Review demand signal with Supply Chain; adjust safety stock / allocation for the anchor SKU.",
    stages:[
      {stage:"reported",title:"Reported",detail:"Distributor reports the short ship against a PO."},
      {stage:"verified",title:"Verified",detail:"Order Management reconciles ordered vs. shipped; backorder lines identified."},
      {stage:"routed",title:"Routed",detail:"CX owns the case; Supply Chain and Sales collaborate."},
      {stage:"resolution-proposed",title:"Resolution proposed",detail:"Balance shipment on a confirmed date; substitution optional with approval."},
      {stage:"customer-updated",title:"Customer updated",detail:"Buyer receives the confirmed backorder date and the next update time."},
      {stage:"resolved",title:"Resolved",detail:"Balance shipped as committed; PO closed."},
      {stage:"improvement-review",title:"Improvement review",detail:"Feeds an allocation/fill-rate signal for the anchor SKU."},
    ]},
  { id:"s-retailer-deduction", channel:"vendor", title:"Retailer deduction / chargeback",
    familyId:"buldak-original", severity:"priority",
    reported:"A retailer took a deduction citing a shortage on a received shipment of Buldak Original.",
    verifiedFacts:["Deduction/claim number and reason code captured.","Proof of delivery and packing documents pulled for reconciliation."],
    evidenceNeeded:["Deduction / claim number","Reason code","Proof of delivery, BOL, packing list"],
    owner:"Customer Experience manager", collaborators:["Finance","Supply Chain","Logistics"],
    customerUpdateCommitment:"Acknowledge within one business day; validity decision within the retailer's dispute window.",
    resolutionOptions:["Accept the deduction if substantiated","Dispute with documentation if not","Partial resolution"],
    approvalsRequired:["Any deduction acceptance / write-off","Any dispute submission"],
    rootCause:"Claimed shortage — determine whether pick/pack, transit, or receiving.",
    correctiveAction:"If a pattern by reason code emerges, drive corrective action with the responsible function.",
    stages:[
      {stage:"reported",title:"Reported",detail:"Deduction posts against the account with a reason code."},
      {stage:"verified",title:"Verified",detail:"Documents reconciled to test whether the shortage is substantiated."},
      {stage:"routed",title:"Routed",detail:"CX leads; Finance, Supply Chain and Logistics collaborate."},
      {stage:"resolution-proposed",title:"Resolution proposed",detail:"Accept if valid, dispute with evidence if not — with approval."},
      {stage:"customer-updated",title:"Customer updated",detail:"Retailer receives the decision and rationale within the dispute window."},
      {stage:"resolved",title:"Resolved",detail:"Deduction cleared or disputed; ledger reconciled."},
      {stage:"improvement-review",title:"Improvement review",detail:"Grouped into a deduction-by-reason-code signal for corrective action."},
    ]},
]};

const scenarios = FF.scenarios;
const consumer = scenarios.filter(s => s.channel==="consumer");
const vendor   = scenarios.filter(s => s.channel==="vendor");
const $ = id => document.getElementById(id);
const reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;

let currentId = consumer[0].id;
let stageIndex = 0;

function renderPickers(){
  const group = (label, list) => `
    <div class="pgroup">
      <p class="plabel">${esc(label)}</p>
      <div class="picks" role="group" aria-label="${esc(label)} scenarios">
        ${list.map(s => `<button class="pick" data-act="pick" data-id="${s.id}"
           aria-pressed="${s.id===currentId}">${esc(s.title)}</button>`).join("")}
      </div>
    </div>`;
  $("pickers").innerHTML = group("Consumer", consumer) + group("Vendor", vendor);
}

function scenario(){ return scenarios.find(s => s.id===currentId); }

function renderTimeline(sc){
  const n = sc.stages.length;
  $("tNodes").innerHTML = sc.stages.map((st,i) => {
    const state = i < stageIndex ? "done" : i === stageIndex ? "current" : "future";
    return `<button class="tNode" data-act="stage" data-idx="${i}" data-state="${state}"
      ${i===stageIndex?'aria-current="step"':''} aria-label="Stage ${i+1} of ${n}: ${esc(st.title)}">
      <span class="tDot" aria-hidden="true"></span><span class="tCap">${esc(st.title)}</span></button>`;
  }).join("");
  // SVG stroke progress: viewBox is 1000 wide; dash covers the drawable span (10..990 = 980).
  const prog = $("tProg");
  const span = 980;
  prog.setAttribute("stroke-dasharray", span);
  const frac = n>1 ? stageIndex/(n-1) : 1;
  const draw = () => prog.setAttribute("stroke-dashoffset", span * (1 - frac));
  if(reduce){ draw(); } else { prog.setAttribute("stroke-dashoffset", span); requestAnimationFrame(()=>requestAnimationFrame(draw)); }
}

function renderStage(sc){
  const st = sc.stages[Math.min(stageIndex, sc.stages.length-1)];
  $("stageBody").innerHTML = `<div class="stageAnim"><h3>${esc(st.title)}</h3><p>${esc(st.detail)}</p></div>`;
  $("stepMeta").textContent = `Step ${stageIndex+1} of ${sc.stages.length}`;
  $("prev").disabled = stageIndex===0;
  const atEnd = stageIndex >= sc.stages.length-1;
  $("next").disabled = atEnd;
  $("next").textContent = atEnd ? "Complete" : "Advance";
}

function list(items){ return `<ul>${items.map(x=>`<li>${esc(x)}</li>`).join("")}</ul>`; }

function renderAnatomy(sc){
  const cards = [
    {cls:"", h:"Verified facts", body:list(sc.verifiedFacts)},
    {cls:"assumption", h:"Evidence needed & why", body:list(sc.evidenceNeeded) +
       `<p class="why">Requested to confirm the facts above before any commitment — assumptions are never treated as verified.</p>`},
    {cls:"owner", h:"Ownership", body:`<p><b>Owner:</b> ${esc(sc.owner)}</p><p><b>Collaborators:</b> ${esc(sc.collaborators.join(", ")||"—")}</p>`},
    {cls:"", h:"Next customer update", body:`<p>${esc(sc.customerUpdateCommitment)}</p>`},
    {cls:"", h:"Resolution options", body:list(sc.resolutionOptions)},
    {cls:"", h:"Approvals required", body:list(sc.approvalsRequired)},
    {cls:"", h:"Root cause", body:`<p>${esc(sc.rootCause)}</p>`},
    {cls:"", h:"Corrective action", body:`<p>${esc(sc.correctiveAction)}</p>`},
  ];
  $("anatomy").innerHTML = cards.map((c,i) =>
    `<div class="acard ${c.cls}" style="--i:${i}"><h4>${esc(c.h)}</h4>${c.body}</div>`).join("");
}

function renderCase(){
  const sc = scenario();
  $("caseTitle").textContent = sc.title;
  $("caseSub").textContent = `${FAMILY_NAME[sc.familyId] ?? sc.familyId} · ${sc.channel==="consumer"?"Consumer":"Vendor"} case`;
  const sev = SEV[sc.severity];
  $("caseTags").innerHTML =
    `<span class="sev" data-sev="${sc.severity}"><svg viewBox="0 0 16 16" aria-hidden="true">${sev.icon}</svg>${esc(sev.word)}</span>` +
    `<span class="synthetic"><span class="dot" aria-hidden="true"></span>Synthetic</span>`;
  $("reported").innerHTML = `<b>Reported:</b> ${esc(sc.reported)}`;
  renderTimeline(sc); renderStage(sc); renderAnatomy(sc);
  $("foot").textContent = `All names, cases, owners, and outcomes here are fictional, created to demonstrate the workflow. ${scenarios.length} representative scenarios are included.`;
}

/* interaction: data-act delegation */
document.addEventListener("click", ev => {
  const t = ev.target.closest("[data-act]"); if(!t) return;
  const sc = scenario(); const act = t.dataset.act;
  if(act==="pick"){ currentId = t.dataset.id; stageIndex = 0; renderPickers(); renderCase(); }
  else if(act==="stage"){ stageIndex = +t.dataset.idx; renderTimeline(sc); renderStage(sc); }
  else if(act==="prev"){ stageIndex = Math.max(0, stageIndex-1); renderTimeline(sc); renderStage(sc); }
  else if(act==="next"){ stageIndex = Math.min(sc.stages.length-1, stageIndex+1); renderTimeline(sc); renderStage(sc); }
});

/* Left/Right arrow keys move between timeline stages */
$("tNodes").addEventListener("keydown", ev => {
  const sc = scenario(); const n = sc.stages.length;
  if(ev.key==="ArrowRight"){ stageIndex=Math.min(n-1,stageIndex+1); }
  else if(ev.key==="ArrowLeft"){ stageIndex=Math.max(0,stageIndex-1); }
  else if(ev.key==="Home"){ stageIndex=0; } else if(ev.key==="End"){ stageIndex=n-1; }
  else return;
  ev.preventDefault(); renderTimeline(sc); renderStage(sc);
  $("tNodes").querySelector('[data-state="current"]').focus();
});

renderPickers(); renderCase();
</script>
</body>
</html>
```

---

## 4. Accessibility, reduced motion, mobile

**Keyboard & focus.** Every control is a real `<button>`: scenario picks, timeline stage nodes, Prev/Advance. Timeline nodes support Left/Right/Home/End arrow navigation and keep focus on the current node after a move. All controls show one `--info-500` `:focus-visible` ring. The SVG progress line is purely decorative (`aria-hidden`) — it never carries information a keyboard user can't otherwise reach.

**No info by hover or color alone.**
- **Severity** is an **icon shape + the word** ("Priority", diamond glyph) — the shape distinguishes levels even in grayscale; color is redundant reinforcement, never the sole signal.
- **Stage state** is conveyed by the caption text, `aria-current="step"`, and the `aria-label` ("Stage 4 of 7: Resolution proposed"), plus dot fill/scale — not color alone.
- The **Synthetic** marker is a dot **plus** the word, and the footer restates that everything is fictional.
- **Verified facts vs. assumptions** is a labeled distinction (two separate cards with explicit headers and a "why"), not a color code.

**Reduced motion.** `prefers-reduced-motion: reduce` removes the stroke-dashoffset transition (progress jumps to final), the stage cross-fade, the card stagger, and the current-dot scale. The timeline still shows the correct progress fraction instantly — motion is never the carrier of state.

**Screen readers.** The active-stage block is `aria-live="polite"` so advancing announces the new stage; the case is `aria-labelledby` the title; anatomy cards use real headings and lists.

**Mobile.** Pickers stack to one column under 760px; anatomy cards to one column under 680px. The timeline keeps all 7 nodes in a flex row with wrapping captions; the SVG uses `preserveAspectRatio="none"` so the track spans the full width at any size. Buttons are ≥40px tall for touch.

---

## 5. States

| State | Treatment |
|---|---|
| **Default** | First consumer scenario, stage 0 (`reported`); progress stroke empty; Prev disabled. |
| **Scenario switch** | `stageIndex` resets to 0, pickers re-mark `aria-pressed`, whole case re-renders, progress redraws from empty. |
| **Stage advance / node click / arrow key** | Progress stroke animates to `index/(n-1)`, dot states update (done/current/future), stage detail cross-fades, step meta updates. |
| **First stage** | Previous disabled. |
| **Final stage** (`improvement-review`) | Advance becomes a disabled **Complete**; progress fully drawn. |
| **Severity variants** | standard = circle/info, elevated = triangle/warn, priority = diamond/chili, specialist = shield/risk — always icon + word. |
| **Vendor vs. consumer** | Owner shifts (Consumer Care specialist vs. Customer Experience manager); collaborators and approvals reflect deduction / order-to-cash governance. |
| **Assumptions card** | Always visually distinct (warn left-border) with an explicit "why we need this before committing" note. |
| **Reduced motion** | All transitions resolve to final state instantly. |

---

## 6. Integration notes

### React (production)
- The component already lives at `src/components/home/ResolutionSimulator/ResolutionSimulator.tsx` and uses `useHome()` + `dispatch({type:"SELECT_SCENARIO"})` and local `stageIndex` state (`useState` + `useEffect` reset on `scenario.id`). Keep all of that.
- **Timeline upgrade**: replace the current plain `<ol>` stepper with the SVG-backed version — an `<svg aria-hidden>` track+progress behind a flex row of `<button>` stage nodes. Compute `strokeDashoffset = span*(1 - stageIndex/(stages-1))` in render; drive the animation with CSS `transition` on the stroke. Gate the initial "draw from empty" behind a `useEffect`/`requestAnimationFrame` and skip it under reduced motion.
- **Severity**: add an icon map (`Record<Severity,{word,icon}>`) and render `<Icon/> + word`; the existing `data-sev` attribute already exists for styling — keep icon + word, never color alone.
- **Anatomy**: the eight cards already exist; the enhancement is styling (paper cards, gradient-mask border, staggered rise) and splitting **Verified facts** from **Evidence needed & why** with the assumption treatment. Reuse `SyntheticBadge` and the existing synthetic footer copy.
- Keep the `family?.name ?? scenario.familyId` subtitle and the `{SCENARIOS.length} representative scenarios` footer.

### Vanilla preview harness
Matches the shared conventions so it drops into the static preview unchanged:
- **`window.FF`** — global namespace holding **precomputed scenario objects** (mirror of `src/data/scenarios.ts`), so the preview runs with no bundler or imports.
- **`esc()`** — the shared HTML-escape helper for every interpolated string.
- **`data-act`** — one delegated document click handler dispatches `pick | stage | prev | next` (the same actions the React `dispatch` / `setStageIndex` fire); `data-id` and `data-idx` carry the payload.
- Family display names come from a small lookup here; in React they come from `FAMILY_BY_ID`.

---

## 7. Tradeoffs & risks

- **SVG stroke + responsive width.** Using a fixed `viewBox` width (1000) with `preserveAspectRatio="none"` stretches the stroke to fit; the dash math stays in viewBox units so it's width-independent. The cost is the stroke scales horizontally — acceptable for a straight line, but don't add text or circles inside this SVG (they'd distort). Nodes are HTML on top for exactly this reason.
- **Node click vs. stroke sync.** Progress and node states are re-derived from a single `stageIndex` on every render, so they can't drift. Keep that single source of truth in React (don't animate the stroke off a separate ref).
- **Precomputed scenarios can drift** from `scenarios.ts` in the vanilla mock; regenerate `FF.scenarios` from the real data (or a build step) when scenarios change. React reads the real data directly and has no such risk.
- **Content density.** Eight anatomy cards plus a timeline is a lot on one screen; the two-column grid and staggered reveal keep it from feeling like a wall. Resist adding more cards — the governance story is already complete.
- **"Synthetic" must stay loud.** The badge, subtitle, and footer are the guardrail that keeps invented cases from being mistaken for real Samyang incidents. They are required, not decorative — this is a portfolio artifact demonstrating judgment, and the honesty *is* the judgment on display.
