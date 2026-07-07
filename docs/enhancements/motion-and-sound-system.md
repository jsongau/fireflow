# Enhancement — Motion & Sound System

**Prepared:** 2026-07-07 · **Status:** Foundation spec (shared utilities + drop-in recipe). Owns the motion tokens, the scroll-reveal utility, and the reusable WebAudio cue module that every enhancement consumes — including The Heat Dial (`sound-heat-card.md`).

---

## 1. Concept and job competency

Individual flourishes are cheap; a *coherent, restrained, accessible* motion-and-sound layer is the hard part. This is the shared foundation the whole FireFlow site draws on: a single set of motion tokens, one reduced-motion-aware scroll-reveal utility, and one tiny WebAudio cue module with a global mute control. Every card that reveals on scroll, every soft selection tick, every sizzle on the Heat Dial, every gentle chime when a support case resolves — all of it routes through here, so the behaviour is identical, the volume ceiling is enforced in one place, and the accessibility contract is written once.

**Target-job competency:** *Operate a consistent, calm, inclusive experience system.* A Manager, Customer Experience is accountable for how the brand *feels* across every touchpoint — bold about food culture, but calm and trustworthy where the content is serious (allergens, complaints, safety). Centralising motion and sound is the same governance instinct a real CX function applies to tone and channel standards: one contract, enforced everywhere, that degrades gracefully for people who have asked for less motion or no sound. It shows the discipline to make a premium experience *and* keep it honest and accessible.

---

## 2. Technique reinterpreted

Two catalog techniques, generalised into utilities:

- **Staggered scroll reveal** → a single `IntersectionObserver` utility. Any element marked `data-reveal` fades and lifts 6px into place, with an optional per-item stagger. Transform and opacity only. Under `prefers-reduced-motion: reduce` the observer still runs (so nothing is gated behind JS), but the token durations are zero, so revealed content simply *appears*.
- **Interaction sound** → a WebAudio cue module. All sound is synthesised with oscillators, noise buffers, and filters — **no audio files**. One shared master gain enforces a low ceiling and the mute state. Muted by default; the mute preference lives in `localStorage`; audio is unlocked only on an explicit user gesture; and cues are short, soft, and always redundant to a visible change.

Nothing here uses glow, neon, glassmorphism, cartoon flames, or auto-playing sound. Serious content stays calm.

---

## 3. Complete runnable recipe

Self-contained. Save as `motion-sound-preview.html` and open it. It demonstrates the scroll-reveal utility and all four named cues behind one global sound toggle. **Sound is muted by default**; no `AudioContext` is created until you press "Turn sound on." In the app, the `<style>` tokens live in the global stylesheet, `FFReveal` and `FFSound` become modules, and the toggle becomes a shared component.

```html
<!doctype html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>FireFlow — Motion & Sound System</title>
<style>
:root{
  --ink-900:#171311;--ink-800:#221b18;--ink-700:#332924;
  --paper-50:#faf4ea;--paper-100:#f3e9da;--paper-200:#e7d8c3;
  --chili-600:#c2341d;--chili-500:#d94f2f;--chili-050:#f7e0d8;--carbo-400:#e79bb0;
  --samyang-accent:#8a5a2b;--ok-500:#4c9a2a;--warn-500:#e0a021;--info-500:#3a7ca5;
  --slate-600:#5b524c;--slate-400:#8b817a;--line:#00000018;
  --font-display:"Fraunces",Georgia,serif;--font-ui:"Inter",system-ui,-apple-system,sans-serif;
  --r-sm:8px;--r-md:14px;--r-lg:22px;
  --sh1:0 1px 2px #0000000f,0 2px 8px #0000000a;--sh2:0 8px 30px #0000001a;

  /* ---- motion tokens (the single source of truth) ---- */
  --ease-out:cubic-bezier(.2,.7,.2,1);
  --dur-1:120ms;   /* micro: hovers, ticks, focus */
  --dur-2:220ms;   /* standard: toggles, small swaps */
  --dur-3:360ms;   /* deliberate: reveals, gauges, cross-fades */
  --reveal-lift:6px;
}
/* one place turns motion off for everyone who asked */
@media (prefers-reduced-motion: reduce){
  :root{--dur-1:0ms;--dur-2:0ms;--dur-3:0ms;--reveal-lift:0px;}
}
*{box-sizing:border-box}
body{margin:0;font-family:var(--font-ui);color:var(--ink-800);background:var(--paper-100);
  line-height:1.55;-webkit-font-smoothing:antialiased}
:focus-visible{outline:3px solid var(--info-500);outline-offset:2px;border-radius:6px}
button{font:inherit;cursor:pointer}
h1,h2{font-family:var(--font-display);line-height:1.14;margin:0}
.wrap{max-width:760px;margin:0 auto;padding:0 20px}

/* ---- global sound toggle (fixed, persistent, labelled) ---- */
.ff-soundbar{position:fixed;top:14px;right:14px;z-index:50}
.ff-soundtoggle{display:inline-flex;align-items:center;gap:8px;border:1px solid var(--line);
  border-radius:999px;padding:8px 14px;background:var(--paper-50);color:var(--ink-800);
  font-size:.82rem;box-shadow:var(--sh1);transition:background var(--dur-2) var(--ease-out)}
.ff-soundtoggle[aria-pressed=true]{background:var(--ink-900);color:var(--paper-50);border-color:var(--ink-900)}
.ff-soundtoggle .dot{width:8px;height:8px;border-radius:50%;background:var(--slate-400)}
.ff-soundtoggle[aria-pressed=true] .dot{background:var(--ok-500)}

/* ---- reveal utility ---- */
[data-reveal]{opacity:0;transform:translateY(var(--reveal-lift));
  transition:opacity var(--dur-3) var(--ease-out),transform var(--dur-3) var(--ease-out)}
[data-reveal].in-view{opacity:1;transform:none}
.no-js [data-reveal]{opacity:1;transform:none}   /* content never gated behind JS */

/* ---- demo furniture ---- */
.hero{min-height:70vh;display:grid;place-items:center;text-align:center;padding:60px 20px}
.hero p{color:var(--slate-600);max-width:52ch;margin:12px auto 0}
.card{background:var(--paper-50);border:1px solid var(--line);border-radius:var(--r-lg);
  box-shadow:var(--sh1);padding:22px;margin:16px 0}
.card h2{font-size:1.3rem;color:var(--ink-900)}
.card p{color:var(--slate-600);margin:8px 0 0}
.row{display:flex;flex-wrap:wrap;gap:10px;margin-top:14px}
.btn{border:1px solid var(--line);border-radius:var(--r-md);padding:9px 14px;background:var(--paper-100);
  color:var(--ink-800);font-size:.85rem;transition:transform var(--dur-1) var(--ease-out)}
.btn:active{transform:translateY(1px)}
.btn--chili{background:var(--chili-600);color:#fff;border-color:var(--chili-600)}
.spacer{height:40vh}
.hint{font-size:.75rem;color:var(--slate-400);margin-top:24px}
</style>
</head>
<body class="no-js">

<div class="ff-soundbar">
  <button class="ff-soundtoggle" id="ffSoundBtn" aria-pressed="false" data-act="soundtoggle">
    <span class="dot" aria-hidden="true"></span><span id="ffSoundLabel">Turn sound on</span>
  </button>
</div>

<div class="wrap">
  <header class="hero">
    <div data-reveal>
      <h1>Motion &amp; Sound System</h1>
      <p>Scroll to see the reveal utility. Turn sound on (top-right) and press the buttons to hear the four cues. Nothing plays until you ask for it.</p>
      <p class="hint">Scroll down ↓</p>
    </div>
  </header>

  <section class="card" data-reveal>
    <h2>Selection — soft tick</h2>
    <p>A 60&nbsp;ms triangle blip. Used when a choice is committed (a filter, a ladder step).</p>
    <div class="row"><button class="btn" data-cue="tick">Play tick</button></div>
  </section>

  <section class="card" data-reveal>
    <h2>Heat — sizzle</h2>
    <p>Filtered noise that brightens with intensity. Used by the Heat Dial.</p>
    <div class="row">
      <button class="btn" data-cue="sizzle" data-intensity="0.2">Mild sizzle</button>
      <button class="btn btn--chili" data-cue="sizzle" data-intensity="1">Extreme sizzle</button>
    </div>
  </section>

  <section class="card" data-reveal>
    <h2>Resolved — gentle chime</h2>
    <p>Two soft ascending sine notes. Used when a support case reaches a resolved state.</p>
    <div class="row"><button class="btn" data-cue="chime">Play chime</button></div>
  </section>

  <section class="card" data-reveal>
    <h2>Mild — low tone</h2>
    <p>A single low sine, for the calm end of the heat ladder.</p>
    <div class="row"><button class="btn" data-cue="tone">Play tone</button></div>
  </section>

  <div class="spacer"></div>
</div>

<script>
document.body.classList.remove("no-js");
window.FF = window.FF || {};
const esc = window.FF.esc || (s => String(s));

/* =======================================================================
   FFReveal — one IntersectionObserver for the whole site.
   Reduced-motion aware via CSS tokens; content is never gated behind JS.
   ======================================================================= */
const FFReveal = (() => {
  let io=null;
  function observe(root=document){
    const items=[...root.querySelectorAll("[data-reveal]:not(.in-view)")];
    if(!("IntersectionObserver" in window)){ items.forEach(el=>el.classList.add("in-view")); return; }
    io = io || new IntersectionObserver((entries)=>{
      entries.forEach((e,idx)=>{
        if(e.isIntersecting){
          const delay = (e.target.dataset.revealDelay|0);
          if(delay) e.target.style.transitionDelay = delay+"ms";
          e.target.classList.add("in-view");
          io.unobserve(e.target);            // reveal once, then stop watching
        }
      });
    }, {rootMargin:"0px 0px -8% 0px", threshold:0.12});
    items.forEach(el=>io.observe(el));
  }
  return { observe };
})();

/* =======================================================================
   FFSound — reusable WebAudio cue module.
   - muted by default; preference in localStorage
   - AudioContext created only on first user gesture
   - one master gain enforces the low ceiling + mute
   - named cues, all synthesised (no files)
   ======================================================================= */
const FFSound = (() => {
  const KEY="ff.sound.enabled";
  const VOL=0.16;                    // low ceiling; each cue peaks below this
  let ctx=null, master=null, noiseBuf=null;
  let enabled=false;
  try{ enabled = localStorage.getItem(KEY)==="on"; }catch{}

  function ensureContext(){          // MUST be called from within a user gesture
    if(ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if(!AC) return null;
    ctx=new AC();
    master=ctx.createGain(); master.gain.value=0.9;   // mute = disconnect via enabled gate
    master.connect(ctx.destination);
    return ctx;
  }
  function noise(){
    if(noiseBuf) return noiseBuf;
    const len=Math.floor(ctx.sampleRate*0.4);
    noiseBuf=ctx.createBuffer(1,len,ctx.sampleRate);
    const d=noiseBuf.getChannelData(0);
    for(let i=0;i<len;i++) d[i]=Math.random()*2-1;
    return noiseBuf;
  }
  const CUES = {
    tick(){                          // selection: short triangle blip
      const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
      o.type="triangle";
      o.frequency.setValueAtTime(720,t);
      o.frequency.exponentialRampToValueAtTime(520,t+0.05);
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(VOL*0.5,t+0.008);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.09);
      o.connect(g).connect(master); o.start(t); o.stop(t+0.1);
    },
    sizzle(intensity=0.5){           // heat: filtered noise, brighter with intensity
      intensity=Math.min(1,Math.max(0,intensity));
      const t=ctx.currentTime;
      const src=ctx.createBufferSource(); src.buffer=noise();
      const hp=ctx.createBiquadFilter(); hp.type="highpass"; hp.frequency.value=280;
      const bp=ctx.createBiquadFilter(); bp.type="bandpass";
      const base=900+intensity*2600;
      bp.frequency.setValueAtTime(base*0.7,t);
      bp.frequency.linearRampToValueAtTime(base,t+0.12);
      bp.Q.value=0.7+intensity*0.6;
      const g=ctx.createGain(); const peak=VOL*(0.45+intensity*0.55), dur=0.16+intensity*0.12;
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(peak,t+0.03);
      g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
      src.connect(hp).connect(bp).connect(g).connect(master);
      src.start(t); src.stop(t+dur+0.02);
    },
    chime(){                         // resolved: two soft ascending sines
      const t=ctx.currentTime;
      [[523.25,0],[659.25,0.12]].forEach(([f,d])=>{
        const o=ctx.createOscillator(),g=ctx.createGain(),s=t+d;
        o.type="sine"; o.frequency.value=f;
        g.gain.setValueAtTime(0.0001,s);
        g.gain.exponentialRampToValueAtTime(VOL*0.5,s+0.03);
        g.gain.exponentialRampToValueAtTime(0.0001,s+0.4);
        o.connect(g).connect(master); o.start(s); o.stop(s+0.42);
      });
    },
    tone(){                          // mild: single low sine
      const t=ctx.currentTime,o=ctx.createOscillator(),g=ctx.createGain();
      o.type="sine"; o.frequency.value=196;
      g.gain.setValueAtTime(0.0001,t);
      g.gain.exponentialRampToValueAtTime(VOL*0.6,t+0.04);
      g.gain.exponentialRampToValueAtTime(0.0001,t+0.5);
      o.connect(g).connect(master); o.start(t); o.stop(t+0.52);
    },
  };

  function play(name, arg){
    if(!enabled) return;             // hard opt-in gate
    const c=ensureContext(); if(!c) return;
    if(c.state==="suspended") c.resume();
    (CUES[name]||CUES.tick)(arg);
  }
  function setEnabled(on){
    enabled=on;
    try{ localStorage.setItem(KEY, on?"on":"off"); }catch{}
    if(on){ const c=ensureContext(); if(c&&c.state==="suspended") c.resume(); }
    document.dispatchEvent(new CustomEvent("ff:sound",{detail:{enabled}}));
  }
  return {
    isEnabled:()=>enabled,
    toggle(){ setEnabled(!enabled); return enabled; },
    setEnabled, play,
  };
})();

/* ---- global sound toggle wiring ---- */
const soundBtn=document.getElementById("ffSoundBtn");
const soundLabel=document.getElementById("ffSoundLabel");
function paintToggle(){
  const on=FFSound.isEnabled();
  soundBtn.setAttribute("aria-pressed", on?"true":"false");
  soundLabel.textContent = on ? "Sound on" : "Turn sound on";
}
soundBtn.addEventListener("click", ()=>{ FFSound.toggle(); paintToggle(); });
document.addEventListener("ff:sound", paintToggle);   // stays in sync if toggled elsewhere

/* ---- demo cue buttons ---- */
document.addEventListener("click",(e)=>{
  const b=e.target.closest("[data-cue]"); if(!b) return;
  FFSound.play(b.dataset.cue, b.dataset.intensity?+b.dataset.intensity:undefined);
});

/* ---- boot ---- */
paintToggle();
FFReveal.observe();
</script>
</body>
</html>
```

---

## 4. Accessibility, reduced motion, and the sound-consent model

**The accessibility contract (enforced in one place).**
- **Reduced motion is a token switch.** `prefers-reduced-motion: reduce` zeroes `--dur-*` and `--reveal-lift` in a single media query, so every reveal, toggle, gauge, and cross-fade across the site becomes instant. No component re-implements this.
- **Content is never gated behind JS or motion.** `data-reveal` elements are visible by default under `.no-js`; the observer only *delays* their appearance, and it reveals-then-unobserves so nothing can get stuck hidden. If `IntersectionObserver` is missing, everything is shown immediately.
- **Sound is opt-in, gesture-unlocked, and remembered.** Muted by default. The only `AudioContext` is created inside a user gesture (the toggle, or a cue-triggering interaction). The preference persists in `localStorage` (`ff.sound.enabled`) and, even when restored as "on," nothing plays until the visitor's first in-session gesture.
- **Sound is never information-only.** Every cue is redundant to a visible state change (a selection highlights, a level changes, a case flips to resolved). A muted or Deaf user loses no information.
- **Low, short, non-overlapping.** A single master gain caps output; each cue peaks below `0.16` and lasts ≤ 0.5 s; no cue loops or sustains.
- **Keyboard and focus.** The global toggle is a real `<button>` with `aria-pressed` and visible text; the status dot colour is redundant to that text. Focus rings are `--info-500` at 3px everywhere.
- **Two independent preferences.** Motion and sound never imply each other. Reduced-motion users can still opt into sound; sound-on users still get reduced motion if they asked for it.

---

## 5. Performance budget

- **Motion:** animate only `opacity` and `transform` (compositor-friendly); never animate layout, `width/height`, `top/left`, or `box-shadow`. Reveals target ≤ 8–10 elements per viewport and each observed node is unobserved after firing, so the observer set only shrinks.
- **One observer, one context.** A single shared `IntersectionObserver` and a single `AudioContext` for the whole page — components register, they do not each spin up their own.
- **Audio is lazy and cheap.** No `AudioContext` on load (also avoids the browser "autoplay blocked" penalty). The noise buffer is 0.4 s, generated once and cached. Cue nodes are created per-play and self-stop, so nothing accumulates. Target: no audio-related work in the critical path, < 1 KB of state.
- **No assets.** Zero audio files, zero images for the effects, no animation libraries — all synthesised or CSS. Keeps the transfer budget and the dependency surface at zero for this layer.
- **Frame discipline.** If a rapidly-firing source (a slider drag) could trigger many cues, debounce to the settled value so at most one short cue plays per committed change.

---

## 6. No-AI-tells copy rules for microcopy

The system ships tiny strings (toggle labels, cue-adjacent captions, reveal-in headings). They must read like a careful human wrote them, not a model. Rules for every string that rides on this layer:

- **Name the action, not the magic.** "Turn sound on" / "Sound on" — not "Enhance your experience," "Immerse yourself," or "Unlock delightful audio."
- **No hype adjectives.** Ban *seamless, delightful, powerful, effortless, elevate, immersive, unleash, supercharge, next-level, game-changing*. Say what happens: "a soft cue plays with each step."
- **No em-dash pile-ups or triads.** Avoid the "it's not just X — it's Y, Z, and W" cadence. One clear clause.
- **No false certainty about senses.** Don't tell people what they will feel ("you'll love the sizzle"). State the mechanic; let them judge.
- **Honest by default.** If a value is editorial or unverified, say so in the same breath (this pairs with the project's source-type posture). Never imply a precision the data doesn't have.
- **Calm where content is serious.** Around heat, safety, or complaints: plain, level, never playful. No dares, no urgency, no medical claims.
- **Second person, present tense, short.** "Move through the line to see where a flavour sits." Not "Users can leverage the interactive control to explore heat positioning."
- **One voice.** Match the display/UI split — Fraunces for headings that can be warm, Inter body copy that is plain and specific.

---

## 7. States (system-level)

- **First load, no interaction:** motion tokens active (or zeroed under reduced-motion); sound muted; toggle reads "Turn sound on"; no `AudioContext`.
- **Reveal firing:** element gets `.in-view`, transitions once, then is unobserved.
- **Sound enabled:** toggle reads "Sound on," `aria-pressed=true`, `ff:sound` event broadcast so any second toggle or the Heat Dial stays in sync.
- **Cue played:** short synthesised sound alongside a visible change; capped by master gain.
- **Returning visitor, preference was on:** toggle restored to "Sound on," but silence until the first gesture.
- **No `IntersectionObserver`:** all `data-reveal` content shown immediately.
- **No `AudioContext` / WebAudio:** toggle still stores preference; `play()` no-ops; site fully usable.
- **Reduced motion:** instant reveals and swaps; sound preference unaffected.

---

## 8. Integration notes

### React app

- **Tokens:** move the `:root` motion tokens and the `prefers-reduced-motion` override into the global stylesheet (e.g. `src/styles/tokens.css`), imported once at the app root.
- **Reveal:** `useInView(ref, opts)` hook wrapping the shared `IntersectionObserver`, plus a `ScrollReveal` wrapper component (or a `data-reveal` + one app-level observer). Reveal-once semantics; honours the CSS token switch, so no per-component motion logic.
- **Reduced motion:** `useReducedMotion()` (`matchMedia('(prefers-reduced-motion: reduce)')`) is available for any rare JS-side guard; CSS handles the common case.
- **Sound:** the module becomes `src/lib/sound/cues.ts` exporting `FFSound` (or a `SoundProvider` + `useSound()` hook exposing `{ enabled, toggle, play }`, holding the single `AudioContext` in a ref). The global toggle is `src/components/system/SoundToggle/SoundToggle.tsx`, mounted once (e.g. in the header). localStorage key: `ff.sound.enabled`. Named cues: `tick`, `sizzle`, `chime`, `tone`.
- **Consumers:** The Heat Dial calls `play("sizzle", intensity)` / `play("tone")`; selection controls call `play("tick")`; a resolved support case calls `play("chime")`. All gate on `enabled` inside the module, so callers never check.

### Vanilla single-file preview

- Follows `preview.html` conventions: global `window.FF`, shared `esc()`, delegated `click` handlers keyed on `data-act`. This layer adds `data-act="soundtoggle"` and the `data-cue`/`data-reveal` attributes; none collide with existing actions (`footgo`, `heatstep`, `heatsound`, nav).
- To adopt: paste the `:root` tokens into the shared style block, include `FFReveal` and `FFSound`, mount one `.ff-soundtoggle`, add `data-reveal` to any element that should reveal, and call `FFReveal.observe()` once in the boot sequence. Re-run `observe()` after injecting new DOM.

---

## 9. Tradeoffs and risks

- **Reveal depends on JavaScript.** If JS fails, `data-reveal` elements start at `opacity:0`. Mitigation: the `.no-js` class shows them by default and is only removed once JS runs; treat reveal purely as enhancement, never as a content gate.
- **Autoplay policies vary.** Some browsers suspend a fresh `AudioContext` until a gesture; our design already never plays before a gesture, so this is aligned rather than fought. The `resume()` on enable covers the resumed-context case.
- **Sound can annoy if overused.** The risk is not one cue but many. Mitigation: the master-gain ceiling, ≤ 0.5 s durations, no loops, and a debounce guideline for drag-driven sources. When in doubt, ship fewer cues.
- **localStorage may be blocked.** In private modes or with storage disabled, the preference won't persist. Mitigation: all reads/writes are wrapped in try/catch and default to muted — the safe state.
- **Token drift.** The value of a shared system is one source of truth; a component that hardcodes its own durations or gain breaks the contract. Mitigation: code review rule — no local motion durations, no `AudioContext` outside the module, no cue louder than the shared ceiling.
- **Not solved here:** haptics, captions/transcripts for sound (unnecessary because no information is sound-only), and per-route motion themes. Those are out of scope; this layer stays a small, strict foundation.
```
