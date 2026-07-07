# Enhancement — The Heat Dial

**Prepared:** 2026-07-07 · **Status:** Enhancement spec (design + drop-in recipe). Signature product-page interaction. Pairs with the shared motion + sound system (`motion-and-sound-system.md`), which owns the reusable cue module this card consumes.

---

## 1. Concept and job competency

The single most-asked Buldak question is *"how spicy is it?"* — and it is a customer-experience trap. Answer with a number nobody trusts, and you either scare people off or set up a let-down. Answer with a shrug, and you have taught the customer nothing. **The Heat Dial** turns that question into a short, guided, sensory-but-safe explainer. A visitor steps through the portfolio's heat ladder — **mild → moderate → hot → very-hot → extreme** — and at each stop the card shows a real Buldak product, an honest caption, a filling heat meter, and a colour temperature that warms from cream to chili. An optional, opt-in, low-volume WebAudio cue (a soft low tone at mild; a brief filtered-noise "sizzle" that intensifies subtly with heat) rides along with the visible change. It never plays until the visitor turns sound on, and it never carries meaning the eye cannot already see.

**Target-job competency:** *Manage heat expectation — the core Buldak CX theme.* A Manager, Customer Experience at Samyang America owns how heat is communicated on shelf, in digital, and in the inbox. Over-promise and you generate returns and "too spicy" complaints; under-explain and you lose the newcomer. This card models the responsible answer: heat is *positioning in words*, not an invented Scoville figure; the flagship **Original** is honestly "very-hot," not "medium"; **2X Spicy** gets a calm "start small" note and is framed as a flavour experience, never a dare. It is the same discipline the real function needs — set an accurate expectation, protect the anxious first-timer, and never make a medical claim.

---

## 2. Technique reinterpreted

From the catalog: the **hot/cold 3D "swap" card** — a flip that changes `color-scheme` and redraws an animated SVG stroke. Reinterpreted here as a **continuous heat swap** rather than a binary flip, because heat is a ladder, not an on/off state.

- The stepper writes one CSS custom property, `--t` (0 → 1), onto the card. Every warm surface is derived from `--t` with `color-mix()`, so a single number drives the whole colour temperature: paper-cream at `mild`, warm amber mid-ladder, `--chili-600` at `extreme`. No gradients beyond the two token grounds, no glow, no neon, no cartoon flames.
- The meter is an **animated SVG stroke** — a half-circle gauge whose `stroke-dashoffset` eases to the new level. This is the catalog's "animated stroke" idea, kept flame-free: it reads as a calm instrument dial, not a fire.
- The product photo cross-fades between real anchors (`Carbonara → Habanero Lime → Original → 2X Spicy`), the "swap" made honest — each stop is a different real product, not a recoloured guess.
- Under `prefers-reduced-motion: reduce`, the stroke and cross-fade durations zero out: the gauge and photo simply *cut* to the new level and the colour still changes (a colour change is not motion). Nothing auto-plays, nothing moves on its own.

---

## 3. Complete runnable recipe

Self-contained. Save as `heat-dial-preview.html` and open it. It ships a tiny `window.FF` stub and a self-contained `FFSound` mini-module so it runs alone; in the app it uses the shared `FF` global and the shared cue module (`motion-and-sound-system.md`). Real product names, real images from `public/products/`, real heat positioning from `src/data/families.ts`. **Sound is OFF by default** — no `AudioContext` is created until the visitor presses "Turn sound on."

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FireFlow — The Heat Dial</title>
<style>
:root{
  --ink-900:#171311;--ink-800:#221b18;--ink-700:#332924;
  --paper-50:#faf4ea;--paper-100:#f3e9da;--paper-200:#e7d8c3;
  --chili-600:#c2341d;--chili-500:#d94f2f;--chili-050:#f7e0d8;--carbo-400:#e79bb0;
  --samyang-accent:#8a5a2b;
  --ok-500:#4c9a2a;--warn-500:#e0a021;--info-500:#3a7ca5;
  --slate-600:#5b524c;--slate-400:#8b817a;--line:#00000018;
  --src-editorial:#8a5a2b;--src-official:#3a7ca5;
  --font-display:"Fraunces",Georgia,serif;--font-ui:"Inter",system-ui,-apple-system,sans-serif;
  --r-sm:8px;--r-md:14px;--r-lg:22px;
  --sh1:0 1px 2px #0000000f,0 2px 8px #0000000a;--sh2:0 8px 30px #0000001a;
  --ease-out:cubic-bezier(.2,.7,.2,1);--dur-1:120ms;--dur-2:220ms;--dur-3:360ms;
  --t:0; /* heat temperature 0..1, written by JS */
}
@media (prefers-reduced-motion: reduce){:root{--dur-1:0ms;--dur-2:0ms;--dur-3:0ms;}}
*{box-sizing:border-box}
body{margin:0;padding:40px 16px;font-family:var(--font-ui);color:var(--ink-800);
  background:var(--paper-100);line-height:1.55;-webkit-font-smoothing:antialiased;display:grid;place-items:center}
:focus-visible{outline:3px solid var(--info-500);outline-offset:2px;border-radius:6px}
button{font:inherit;cursor:pointer}

/* ---------- card ---------- */
.dial{max-width:560px;width:100%;border-radius:var(--r-lg);overflow:hidden;box-shadow:var(--sh2);
  border:1px solid var(--line);
  /* the whole warm ground is derived from --t */
  background:
    color-mix(in oklab, var(--paper-50), var(--chili-050) calc(var(--t)*70%));
  transition:background var(--dur-3) var(--ease-out)}
.dial__head{padding:20px 22px 6px}
.dial__eyebrow{font-size:.68rem;letter-spacing:.13em;text-transform:uppercase;
  color:color-mix(in oklab,var(--samyang-accent),var(--chili-600) calc(var(--t)*100%))}
.dial__title{font-family:var(--font-display);font-weight:600;font-size:1.5rem;margin:2px 0 0;color:var(--ink-900)}
.dial__lede{margin:8px 0 0;font-size:.9rem;color:var(--slate-600);max-width:46ch}

/* ---------- stage: photo + gauge ---------- */
.dial__stage{position:relative;display:grid;grid-template-columns:1.1fr .9fr;gap:8px;align-items:center;padding:8px 22px 4px}
.dial__photo{position:relative;aspect-ratio:1/1;display:grid;place-items:center}
.dial__photo img{position:absolute;inset:0;margin:auto;max-width:100%;max-height:100%;object-fit:contain;
  opacity:0;transition:opacity var(--dur-3) var(--ease-out);filter:drop-shadow(0 6px 16px #0000001f)}
.dial__photo img.on{opacity:1}
.dial__gaugewrap{display:grid;place-items:center;gap:6px}
.gauge{width:180px;max-width:100%}
.gauge__track{fill:none;stroke:color-mix(in oklab,var(--paper-200),var(--ink-900) 8%);stroke-width:14;stroke-linecap:round}
.gauge__fill{fill:none;stroke:color-mix(in oklab,var(--warn-500),var(--chili-600) calc(var(--t)*100%));
  stroke-width:14;stroke-linecap:round;
  transition:stroke-dashoffset var(--dur-3) var(--ease-out),stroke var(--dur-3) var(--ease-out)}
.gauge__word{font-family:var(--font-display);font-size:1.15rem;color:var(--ink-900);text-transform:capitalize}
.gauge__sub{font-size:.7rem;color:var(--slate-400);letter-spacing:.04em}

/* ---------- caption ---------- */
.dial__caption{padding:6px 22px 2px;min-height:88px}
.dial__prod{font-family:var(--font-display);font-size:1.05rem;color:var(--ink-900);margin:0}
.dial__cap{margin:4px 0 0;font-size:.9rem;color:var(--ink-700)}
.src{display:inline-block;margin-top:8px;font-size:.66rem;letter-spacing:.04em;padding:2px 8px;border-radius:999px;
  border:1px solid var(--line);color:var(--slate-600);background:#fff8}
.src--official{color:var(--src-official)} .src--editorial{color:var(--src-editorial)}

/* ---------- 2X caution ---------- */
.dial__caution{margin:10px 22px 2px;padding:10px 12px;border-radius:var(--r-md);
  background:color-mix(in oklab,var(--paper-50),var(--warn-500) 12%);border:1px solid #0000000f;
  font-size:.84rem;color:var(--ink-700);display:none}
.dial__caution.show{display:block}
.dial__caution b{color:var(--ink-900)}

/* ---------- honesty footer ---------- */
.dial__note{margin:12px 22px 0;font-size:.76rem;color:var(--slate-600);border-top:1px solid var(--line);padding-top:10px}

/* ---------- controls ---------- */
.dial__controls{padding:12px 22px 20px;display:grid;gap:12px}
.ladder{display:grid;gap:6px}
.ladder__label{font-size:.72rem;letter-spacing:.06em;text-transform:uppercase;color:var(--slate-400)}
.ladder input[type=range]{width:100%;accent-color:color-mix(in oklab,var(--warn-500),var(--chili-600) calc(var(--t)*100%))}
.ticks{display:flex;justify-content:space-between;gap:4px}
.tick{flex:1;background:none;border:1px solid var(--line);border-radius:var(--r-sm);padding:6px 2px;
  font-size:.66rem;text-transform:capitalize;color:var(--slate-600);transition:all var(--dur-1) var(--ease-out)}
.tick[aria-current=true]{border-color:color-mix(in oklab,var(--warn-500),var(--chili-600) calc(var(--t)*100%));
  color:var(--ink-900);font-weight:600;background:#fff9}

.soundbar{display:flex;align-items:center;justify-content:space-between;gap:10px;
  border:1px solid var(--line);border-radius:var(--r-md);padding:8px 8px 8px 12px;background:#fff6}
.soundbar__txt{font-size:.78rem;color:var(--slate-600)}
.soundtoggle{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);
  border-radius:999px;padding:7px 14px;background:var(--paper-50);color:var(--ink-800);font-size:.82rem}
.soundtoggle[aria-pressed=true]{background:var(--ink-900);color:var(--paper-50);border-color:var(--ink-900)}
.soundtoggle .dot{width:8px;height:8px;border-radius:50%;background:var(--slate-400)}
.soundtoggle[aria-pressed=true] .dot{background:var(--ok-500)}
</style>
</head>
<body>

<section class="dial" id="dial" aria-labelledby="dialTitle">
  <div class="dial__head">
    <span class="dial__eyebrow">Buldak heat, explained</span>
    <h2 class="dial__title" id="dialTitle">The Heat Dial</h2>
    <p class="dial__lede">Move through the line to see where a flavour sits. Heat is described in words, not a number.</p>
  </div>

  <div class="dial__stage">
    <div class="dial__photo" id="photoStage" aria-hidden="true"><!-- images injected --></div>
    <div class="dial__gaugewrap">
      <svg class="gauge" viewBox="0 0 200 118" role="img" aria-hidden="true">
        <path class="gauge__track" d="M20,104 A80,80 0 0 1 180,104" />
        <path class="gauge__fill" id="gaugeFill" d="M20,104 A80,80 0 0 1 180,104" />
      </svg>
      <div class="gauge__word" id="gaugeWord">Moderate</div>
      <div class="gauge__sub">positioning, not a score</div>
    </div>
  </div>

  <div class="dial__caption">
    <p class="dial__prod" id="capProd"></p>
    <p class="dial__cap" id="capText"></p>
    <span class="src" id="capSrc"></span>
  </div>

  <div class="dial__caution" id="caution" role="note">
    <b>This is our most intense product.</b> If you are trying 2X Spicy, start with a small amount of the
    sauce — you can always add more. It is a bold flavour experience, not a challenge. Best enjoyed with
    something cooling nearby, like rice, cheese, or a cold drink.
  </div>

  <div class="dial__controls">
    <div class="ladder">
      <span class="ladder__label" id="ladderLabel">Heat level</span>
      <input type="range" id="slider" min="0" max="4" step="1" value="1"
             aria-labelledby="ladderLabel" aria-valuetext="Moderate — Buldak Carbonara" />
      <div class="ticks" id="ticks" role="group" aria-label="Choose a heat level"></div>
    </div>

    <div class="soundbar">
      <span class="soundbar__txt">Optional: a soft cue plays with each step.</span>
      <button class="soundtoggle" id="soundBtn" aria-pressed="false" data-act="heatsound">
        <span class="dot" aria-hidden="true"></span><span id="soundLabel">Turn sound on</span>
      </button>
    </div>
  </div>

  <p class="dial__note" id="honNote"></p>
</section>

<script>
/* ---------- window.FF stub (the real app provides window.FF) ---------- */
window.FF = window.FF || {};
const esc = window.FF.esc || (s => String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c])));

/* ---------- real heat ladder (from src/data/families.ts) ---------- */
/* Four stops carry official positioning; "mild" is an editorial floor, tagged as such. */
const LADDER = [
  { word:"mild", prod:"Buldak Cheese", img:"/products/buldak-multi-cheese.png",
    src:"FireFlow editorial", srcClass:"src--editorial",
    cap:"The most approachable stop in the stir-fry line. Cheese and dairy temper the same Buldak base. We place it at the mild end as an editorial read — verify the current package for the official statement.",
    cue:"tone" },
  { word:"moderate", prod:"Buldak Carbonara", img:"/products/buldak-multi-carbonara.png",
    src:"Official positioning", srcClass:"src--official",
    cap:"A creamy, cheese-forward carbonara sauce softens the Buldak heat into the line's most recognised, most approachable flavour. A good first Buldak for most people.",
    cue:"sizzle" },
  { word:"hot", prod:"Buldak Habanero Lime", img:"/products/buldak-multi-habanero-lime.png",
    src:"Official positioning", srcClass:"src--official",
    cap:"Habanero heat lifted by bright lime — a U.S.-localised flavour. Noticeably hotter than Carbonara, still short of the flagship Original.",
    cue:"sizzle" },
  { word:"very-hot", prod:"Buldak Original", img:"/products/buldak-multi-original.png",
    src:"Official positioning", srcClass:"src--official",
    cap:"The flagship spicy-chicken stir-fry — the baseline every other flavour is measured against. Genuinely hot. If this is your first, try it with rice or cheese.",
    cue:"sizzle" },
  { word:"extreme", prod:"Buldak 2X Spicy", img:"/products/buldak-multi-2x-spicy.png",
    src:"Official positioning", srcClass:"src--official",
    cap:"The Original profile at roughly double the heat — the line's most intense product. Positioned for people who already know they love serious spice.",
    cue:"sizzle" },
];
const N = LADDER.length;

/* ---------- FFSound: opt-in, WebAudio-only, low volume ----------
   In the app this is imported from the shared cue module (see
   motion-and-sound-system.md). Bundled here so the preview runs alone. */
const FFSound = (() => {
  const KEY = "ff.sound.enabled";
  const VOL = 0.16;            // low ceiling; every cue peaks below this
  let ctx=null, master=null, noiseBuf=null;
  let enabled=false;
  try { enabled = localStorage.getItem(KEY) === "on"; } catch {}

  function ensureContext(){                 // only ever called inside a user gesture
    if(ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx = new AC();
    master = ctx.createGain(); master.gain.value = 0.9;
    master.connect(ctx.destination);
    return ctx;
  }
  function noise(){
    if(noiseBuf) return noiseBuf;
    const len = Math.floor(ctx.sampleRate * 0.4);
    noiseBuf = ctx.createBuffer(1,len,ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for(let i=0;i<len;i++) d[i] = Math.random()*2-1;
    return noiseBuf;
  }
  function tone(){                           // gentle low sine, for "mild"
    const t=ctx.currentTime, o=ctx.createOscillator(), g=ctx.createGain();
    o.type="sine"; o.frequency.value=196;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(VOL*0.6,t+0.04);
    g.gain.exponentialRampToValueAtTime(0.0001,t+0.5);
    o.connect(g).connect(master); o.start(t); o.stop(t+0.52);
  }
  function sizzle(intensity){                // filtered-noise burst, brighter/louder with heat
    intensity = Math.min(1,Math.max(0,intensity));
    const t=ctx.currentTime;
    const src=ctx.createBufferSource(); src.buffer=noise();
    const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=280;
    const bp=ctx.createBiquadFilter(); bp.type="bandpass";
    const base=900+intensity*2600;
    bp.frequency.setValueAtTime(base*0.7,t);
    bp.frequency.linearRampToValueAtTime(base,t+0.12);
    bp.Q.value=0.7+intensity*0.6;
    const g=ctx.createGain();
    const peak=VOL*(0.45+intensity*0.55), dur=0.16+intensity*0.12;
    g.gain.setValueAtTime(0.0001,t);
    g.gain.exponentialRampToValueAtTime(peak,t+0.03);
    g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    src.connect(hp).connect(bp).connect(g).connect(master);
    src.start(t); src.stop(t+dur+0.02);
  }
  function play(cue, intensity){
    if(!enabled) return;                     // hard opt-in gate
    const c = ensureContext(); if(!c) return;
    if(c.state==="suspended") c.resume();
    if(cue==="tone") tone(); else sizzle(intensity);
  }
  function setEnabled(on){
    enabled=on;
    try{ localStorage.setItem(KEY, on?"on":"off"); }catch{}
    if(on){ const c=ensureContext(); if(c&&c.state==="suspended") c.resume(); }
  }
  return {
    isEnabled:()=>enabled,
    toggle(){ setEnabled(!enabled); return enabled; },
    play,
  };
})();

/* ---------- render + wire ---------- */
const stage=document.getElementById("photoStage");
const gaugeFill=document.getElementById("gaugeFill");
const gaugeWord=document.getElementById("gaugeWord");
const capProd=document.getElementById("capProd");
const capText=document.getElementById("capText");
const capSrc=document.getElementById("capSrc");
const caution=document.getElementById("caution");
const slider=document.getElementById("slider");
const ticks=document.getElementById("ticks");
const dial=document.getElementById("dial");
const soundBtn=document.getElementById("soundBtn");
const soundLabel=document.getElementById("soundLabel");

/* gauge geometry: half circle, radius 80 -> arc length = PI*80 */
const ARC = Math.PI*80;
gaugeFill.style.strokeDasharray = ARC;

/* preload the real photos as stacked <img>, cross-faded by class */
LADDER.forEach((s,i)=>{
  const img=document.createElement("img");
  img.src=s.img; img.alt=""; img.dataset.i=i; stage.appendChild(img);
});
/* honest ticks */
ticks.innerHTML = LADDER.map((s,i)=>
  `<button class="tick" data-i="${i}" data-act="heatstep" aria-current="false">${esc(s.word)}</button>`
).join("");

let current = -1;
function apply(i, fromGesture){
  i = Math.max(0, Math.min(N-1, i));
  const s = LADDER[i];
  const t = i/(N-1);                          // colour temperature
  dial.style.setProperty("--t", t.toFixed(3));

  /* gauge: fill grows with level (mild still shows a little) */
  const fill = (i+1)/N;
  gaugeFill.style.strokeDashoffset = (ARC*(1-fill)).toFixed(2);
  gaugeWord.textContent = s.word;

  /* photo swap */
  stage.querySelectorAll("img").forEach(im=> im.classList.toggle("on", +im.dataset.i===i));

  /* caption */
  capProd.textContent = s.prod;
  capText.textContent = s.cap;
  capSrc.textContent = s.src;
  capSrc.className = "src "+s.srcClass;

  /* 2X caution only at extreme */
  caution.classList.toggle("show", s.word==="extreme");

  /* controls state */
  slider.value = i;
  slider.setAttribute("aria-valuetext", `${s.word} — ${s.prod}`);
  ticks.querySelectorAll(".tick").forEach(b=> b.setAttribute("aria-current", (+b.dataset.i===i)?"true":"false"));

  /* SOUND augments a change that is already visible; only on a real step, only if enabled */
  if(fromGesture && i!==current){
    FFSound.play(s.cue, i/(N-1));
  }
  current = i;
}

/* stepper events (keyboard-native range + clickable ticks) */
slider.addEventListener("input", e=> apply(+e.target.value, true));
ticks.addEventListener("click", e=>{
  const b=e.target.closest("[data-act=heatstep]"); if(!b) return;
  apply(+b.dataset.i, true);
});

/* sound toggle: the click is the gesture that unlocks audio */
function paintToggle(){
  const on=FFSound.isEnabled();
  soundBtn.setAttribute("aria-pressed", on?"true":"false");
  soundLabel.textContent = on ? "Sound on" : "Turn sound on";
}
soundBtn.addEventListener("click", ()=>{ FFSound.toggle(); paintToggle(); });

/* boot: default to "moderate" (Carbonara) — the honest, approachable entry point.
   No sound plays on load even if the stored preference is "on". */
document.getElementById("honNote").innerHTML =
  "Heat here is <b>positioning, not a Scoville number</b>. FireFlow describes where a product sits in the Buldak line, in words. Official stops are drawn from Samyang America product information; the mild stop is a FireFlow editorial read. Always verify the current package.";
paintToggle();
apply(1, false);
</script>
</body>
</html>
```

---

## 4. Accessibility, reduced motion, and the sound-consent model

**Sound consent (the hard contract).**
- **Off by default.** No `AudioContext` exists on load. The first `AudioContext` is created *inside* the click handler of "Turn sound on" (or lazily inside the first `play()`, which itself only runs from a step gesture) — never on page load, never on scroll.
- **Persistent, labelled control.** The toggle shows real text ("Turn sound on" / "Sound on"), carries `aria-pressed`, and has a status dot that is redundant to the text (colour never carries the state alone).
- **Preference is remembered but never auto-plays.** The choice is stored in `localStorage` under `ff.sound.enabled`. If a returning visitor had sound on, the toggle reflects "Sound on," but audio still stays silent until their first in-session gesture (a step) — satisfying the "explicit gesture" rule without startling anyone.
- **Low and short.** Every cue peaks below a `0.16` gain ceiling and lasts ≤ 0.5 s. No cue loops, sustains, or stacks; a rapid drag fires at most one short cue per settled step.
- **Never information-only.** The cue always accompanies a change the eye already sees — the word, the gauge, the photo, and the colour all change together. A muted user loses nothing.

**Reduced motion (independent of sound).**
- `prefers-reduced-motion: reduce` zeroes `--dur-1/2/3`, so the gauge stroke and photo cross-fade *cut* instead of animating. The colour temperature still changes (a colour change is a state, not motion).
- Reduced motion **never** implies sound-on or sound-off; the two preferences are orthogonal. Sound stays opt-in regardless of the motion setting, and the card never auto-plays under either.

**Keyboard and screen reader.**
- The `<input type="range">` is natively keyboard-operable (arrows step the ladder); `aria-valuetext` announces the level word and product ("moderate — Buldak Carbonara") instead of a bare "1."
- Tick buttons are focusable, carry `aria-current`, and duplicate the slider so either input works.
- The gauge SVG and the stacked photos are `aria-hidden` decoration; all meaning lives in the visible, announced caption. Focus rings use `--info-500` at 3px.

---

## 5. States

- **Default / boot:** "moderate" — Buldak Carbonara. Chosen as the honest, approachable entry point rather than the mildest or the hottest.
- **Mild:** Buldak Cheese, editorial tag visible, cream ground, soft low tone cue (if enabled).
- **Moderate → very-hot:** official tag, warming amber ground, sizzle cue brightening with `--t`.
- **Extreme:** Buldak 2X Spicy, chili ground, the calm "start small… not a challenge" caution note appears. No medical language; the data's "not feeling well" question routes to human escalation elsewhere, not to advice here.
- **Sound off (default):** stepping changes everything visually; no audio.
- **Sound on:** each settled step adds one short cue.
- **Reduced motion:** identical content, no easing — instant gauge/photo swap, colour still shifts.
- **No `AudioContext` support:** toggle still stores the preference and the card works fully; `play()` no-ops.
- **Missing photo:** an unmapped `img` simply stays at `opacity:0` behind the caption; consider a paper-toned placeholder in the app (`imageForVariant` already returns `null` for unmapped variants).

---

## 6. Integration notes

### React app

- **Component:** `src/components/product/HeatDial/HeatDial.tsx` + `HeatDial.module.css`. Props: `familyId?: string` (defaults to the flagship ladder) or an explicit `stops` array.
- **Hooks:** `useSound()` from the shared provider (see `motion-and-sound-system.md`) exposes `{ enabled, toggle, play }`; `useReducedMotion()` (a wrapped `matchMedia`) is available if a JS-side guard is ever wanted, though CSS token-zeroing already handles motion.
- **Data:** build `LADDER` from `FAMILIES` in `src/data/families.ts` — read each anchor's `heatPositioning` (`moderate`/`hot`/`very-hot`/`extreme`) and `name`, resolve the photo with `imageForVariant`/`IMAGE_BY_FAMILY` from `src/data/images.ts`, and tag each stop's source with `SOURCE_TYPES` from `src/data/sources.ts` (`official` vs `editorial`). The `HeatPositioning` union already lives in `src/types/domain.ts`; the mild stop is the one editorial addition and must render the editorial source pill.
- **Cue mapping:** `word === "mild"` → `play("tone")`; every hotter stop → `play("sizzle", index/(n-1))`. Fire the cue only when the committed level actually changes and only from a user event.
- **2X caution:** render the caution block whenever `heatPositioning === "extreme"`. Keep the copy in one constant so legal/brand can review it once. Never add dare, challenge, endurance, or medical-outcome language.

### Vanilla single-file preview

- Follows `preview.html` conventions: global `window.FF`, shared `esc()`, and delegated `click` handlers keyed on `data-act`. This card introduces two actions — `data-act="heatstep"` (a ladder tick) and `data-act="heatsound"` (the toggle) — neither of which collides with the existing set (`footgo`, nav actions, etc.).
- To adopt: drop the `<section class="dial">` block onto the product page, include the `FFSound` mini-module (or swap it for the shared module's global), and call the boot sequence once. `esc()` and `window.FF` are already present in `preview.html`.

---

## 7. Tradeoffs and risks

- **The "mild" stop is an editorial judgement.** No Buldak stir-fry noodle is officially "mild"; the line honestly starts warm. Presenting Cheese at the mild end is defensible but is a FireFlow call. Mitigation: the editorial source pill is always visible on that stop, and the honesty note states which stops are official. If brand prefers, drop to a four-stop ladder starting at "moderate."
- **Heat is subjective.** A word like "very-hot" lands differently per person. Mitigation: the whole card is framed as *positioning within the line*, never an absolute promise, and points people to cooling pairings rather than a threshold.
- **Sound is easy to over-build.** A sizzle that is too loud, too long, or fires on every drag frame would violate the "never startle" rule. Mitigation: single cue per settled step, a hard `0.16` gain ceiling, ≤ 0.5 s duration, and no looping. Consider debouncing the range `input` to the settled value if drag chatter appears.
- **2X Spicy is a sensitive product.** The correct posture is calm framing plus a real escalation path for "I don't feel well," which lives in the support flow, not here. This card must never dare, never claim a health effect, and never imply a medical outcome. That constraint is load-bearing and should be reviewed by whoever owns consumer safety copy.
- **Not solved here:** per-format heat differences (Cup vs Multi), allergen surfacing, and localisation of the heat vocabulary. Those belong to the product record and the wider system, not to this single explainer.
```
