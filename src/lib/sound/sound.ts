/**
 * FireFlow sound engine — a warm, gamified layer of audio feedback built
 * directly on the Web Audio API (no library).
 *
 * Character: bright, bell- and coin-like, "slot-machine pleasant" but always
 * soft and soothing. Every voice runs through a master gain + gentle low-pass
 * so nothing is ever harsh. Repeated clicks are subtly detuned so a burst of
 * interaction feels alive, like a machine paying out, instead of a metronome.
 *
 * Design rules:
 *   - ON by default. The on/off preference persists in localStorage under
 *     "fireflow:sound"; only an explicit "off" turns it off.
 *   - A single AudioContext is created lazily on the first user gesture — never
 *     on load, so nothing autoplays.
 *   - If Web Audio (or storage) is unavailable, every export no-ops safely and
 *     nothing ever throws. Sound is purely decorative: the site is fully usable
 *     in silence with no lost information.
 *   - Respects `prefers-reduced-motion: reduce` by staying silent, since the
 *     audio is part of the same "delight" layer as motion.
 */

export type SoundName =
  // Core UI feedback
  | "select"
  | "confirm"
  | "compareAdd"
  | "stageAdvance"
  | "resolve"
  | "warning"
  | "modalOpen"
  | "modalComplete"
  // Gamified click palette (used by the global click layer)
  | "tick"
  | "chime"
  | "coin"
  | "tab"
  | "pop"
  | "toggle"
  | "sparkle"
  | "jackpot";

export interface PlayOpts {
  /** Pitch offset in cents applied to every voice in the sound. */
  detuneCents?: number;
}

const STORAGE_KEY = "fireflow:sound";

/** Constructor type that also covers the Safari `webkitAudioContext` prefix. */
type AudioContextCtor = typeof AudioContext;

let soundOn: boolean = readStoredPreference();
let ctx: AudioContext | null = null;
let ctxUnavailable = false;
let master: GainNode | null = null;

/**
 * Timestamp of the last sound triggered by an explicit component call. The
 * global click layer reads this to avoid double-firing: React onClick handlers
 * run before the document-level click listener bubbles up, so if a bespoke
 * sound just played for this same click, the global layer stays silent.
 */
let lastExplicitAt = 0;

function now(): number {
  try {
    return performance.now();
  } catch {
    return Date.now();
  }
}

function prefersReducedMotion(): boolean {
  try {
    return (
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  } catch {
    return false;
  }
}

function readStoredPreference(): boolean {
  try {
    // Default ON: only an explicit "off" silences the app.
    return localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    // Storage blocked (private mode, disabled cookies, SSR): default on.
    return true;
  }
}

function writeStoredPreference(on: boolean): void {
  try {
    localStorage.setItem(STORAGE_KEY, on ? "on" : "off");
  } catch {
    // Ignore: preference simply won't persist this session.
  }
}

function getAudioContextCtor(): AudioContextCtor | null {
  if (typeof window === "undefined") return null;
  const w = window as unknown as {
    AudioContext?: AudioContextCtor;
    webkitAudioContext?: AudioContextCtor;
  };
  return w.AudioContext ?? w.webkitAudioContext ?? null;
}

/**
 * Lazily create the shared AudioContext + master bus. Returns null
 * (permanently, after the first failure) when Web Audio is unavailable. Must
 * only be reached from a user gesture so browsers allow the context to start.
 */
function ensureContext(): AudioContext | null {
  if (ctx) return ctx;
  if (ctxUnavailable) return null;
  const Ctor = getAudioContextCtor();
  if (!Ctor) {
    ctxUnavailable = true;
    return null;
  }
  try {
    ctx = new Ctor();
    // Master bus: soft overall level + a gentle low-pass so bright, coin-like
    // tones stay warm and never sharp.
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.9, ctx.currentTime);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(6800, ctx.currentTime);
    lp.Q.setValueAtTime(0.6, ctx.currentTime);
    g.connect(lp);
    lp.connect(ctx.destination);
    master = g;
    return ctx;
  } catch {
    ctxUnavailable = true;
    return null;
  }
}

function busFor(context: AudioContext): AudioNode {
  return master ?? context.destination;
}

export function isSoundOn(): boolean {
  return soundOn;
}

export function setSoundOn(on: boolean): void {
  soundOn = on;
  writeStoredPreference(on);
}

/** Flip the preference and return the new state. */
export function toggleSound(): boolean {
  setSoundOn(!soundOn);
  return soundOn;
}

/** Apply a cents offset to a base frequency. */
function detune(freq: number, cents: number | undefined): number {
  if (!cents) return freq;
  return freq * Math.pow(2, cents / 1200);
}

/** A single enveloped oscillator note. */
function playTone(
  context: AudioContext,
  opts: {
    type: OscillatorType;
    freq: number;
    at: number;
    dur: number;
    peak: number;
    cents?: number;
  },
): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(detune(opts.freq, opts.cents), opts.at);

  const attack = Math.min(0.012, opts.dur * 0.3);
  gain.gain.setValueAtTime(0.0001, opts.at);
  gain.gain.exponentialRampToValueAtTime(opts.peak, opts.at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);

  osc.connect(gain);
  gain.connect(busFor(context));
  osc.start(opts.at);
  osc.stop(opts.at + opts.dur + 0.02);
}

/** A gently gliding oscillator note (rising or falling). */
function playGlide(
  context: AudioContext,
  opts: {
    type: OscillatorType;
    from: number;
    to: number;
    at: number;
    dur: number;
    peak: number;
    cents?: number;
  },
): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(detune(opts.from, opts.cents), opts.at);
  osc.frequency.linearRampToValueAtTime(detune(opts.to, opts.cents), opts.at + opts.dur);

  const attack = Math.min(0.02, opts.dur * 0.3);
  gain.gain.setValueAtTime(0.0001, opts.at);
  gain.gain.exponentialRampToValueAtTime(opts.peak, opts.at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);

  osc.connect(gain);
  gain.connect(busFor(context));
  osc.start(opts.at);
  osc.stop(opts.at + opts.dur + 0.02);
}

/** A short low-pass-filtered noise burst — a soft "buffer" texture. */
function playNoise(
  context: AudioContext,
  opts: { at: number; dur: number; peak: number; cutoff: number },
): void {
  const frames = Math.max(1, Math.floor(context.sampleRate * opts.dur));
  const buffer = context.createBuffer(1, frames, context.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < data.length; i += 1) {
    data[i] = Math.random() * 2 - 1;
  }

  const src = context.createBufferSource();
  src.buffer = buffer;

  const filter = context.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.setValueAtTime(opts.cutoff, opts.at);

  const gain = context.createGain();
  gain.gain.setValueAtTime(0.0001, opts.at);
  gain.gain.exponentialRampToValueAtTime(opts.peak, opts.at + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);

  src.connect(filter);
  filter.connect(gain);
  gain.connect(busFor(context));
  src.start(opts.at);
  src.stop(opts.at + opts.dur + 0.02);
}

/**
 * Render one sound. Each is short, soft, and low peak-gain, with a distinct
 * bell/coin/chime character in the same warm palette. `c` is the per-call
 * cents offset that lets identical clicks feel subtly different.
 */
function render(context: AudioContext, name: SoundName, t: number, c?: number): void {
  switch (name) {
    /* ---- Gamified click palette ------------------------------------- */
    case "tick":
      // Default click: soft marimba pluck with a whisper of shimmer on top.
      playTone(context, { type: "triangle", freq: 784, at: t, dur: 0.06, peak: 0.05, cents: c });
      playTone(context, { type: "sine", freq: 1568, at: t, dur: 0.04, peak: 0.02, cents: c });
      break;
    case "pop":
      // Tiny rounded blip — light controls, chips, small toggles.
      playTone(context, { type: "sine", freq: 932.33, at: t, dur: 0.05, peak: 0.055, cents: c });
      break;
    case "chime":
      // Two-note bell up a major third — links and navigation follows.
      playTone(context, { type: "sine", freq: 659.25, at: t, dur: 0.1, peak: 0.06, cents: c });
      playTone(context, { type: "sine", freq: 830.61, at: t + 0.06, dur: 0.14, peak: 0.06, cents: c });
      break;
    case "coin":
      // Bright "cha-ching" — two quick high plinks, a coin dropping in.
      playTone(context, { type: "triangle", freq: 1046.5, at: t, dur: 0.05, peak: 0.06, cents: c });
      playTone(context, { type: "triangle", freq: 1396.91, at: t + 0.05, dur: 0.08, peak: 0.06, cents: c });
      break;
    case "tab":
      // Warm wooden knock plus a high sparkle — primary section tabs.
      playTone(context, { type: "triangle", freq: 440, at: t, dur: 0.05, peak: 0.06, cents: c });
      playTone(context, { type: "sine", freq: 1760, at: t + 0.02, dur: 0.05, peak: 0.025, cents: c });
      break;
    case "sparkle":
      // Fast high triad shimmer — a light celebratory flourish.
      playTone(context, { type: "sine", freq: 1046.5, at: t, dur: 0.05, peak: 0.045, cents: c });
      playTone(context, { type: "sine", freq: 1318.51, at: t + 0.035, dur: 0.05, peak: 0.045, cents: c });
      playTone(context, { type: "sine", freq: 1567.98, at: t + 0.07, dur: 0.07, peak: 0.045, cents: c });
      break;
    case "jackpot":
      // Soft ascending arpeggio C-E-G-C — a satisfying payout.
      playTone(context, { type: "sine", freq: 523.25, at: t, dur: 0.07, peak: 0.06, cents: c });
      playTone(context, { type: "sine", freq: 659.25, at: t + 0.06, dur: 0.07, peak: 0.06, cents: c });
      playTone(context, { type: "sine", freq: 783.99, at: t + 0.12, dur: 0.07, peak: 0.06, cents: c });
      playTone(context, { type: "sine", freq: 1046.5, at: t + 0.18, dur: 0.16, peak: 0.065, cents: c });
      break;
    case "toggle":
      // Down-up flip — switches and disclosure controls.
      playTone(context, { type: "sine", freq: 587.33, at: t, dur: 0.06, peak: 0.055, cents: c });
      playTone(context, { type: "sine", freq: 880, at: t + 0.06, dur: 0.1, peak: 0.055, cents: c });
      break;

    /* ---- Core UI feedback (bespoke component calls) ------------------ */
    case "select":
      // Soft bell tick with a faint octave shimmer.
      playTone(context, { type: "sine", freq: 880, at: t, dur: 0.06, peak: 0.06, cents: c });
      playTone(context, { type: "sine", freq: 1760, at: t, dur: 0.035, peak: 0.02, cents: c });
      break;
    case "compareAdd":
      // Brighter coin-like sibling of "select".
      playTone(context, { type: "triangle", freq: 1046.5, at: t, dur: 0.05, peak: 0.055, cents: c });
      playTone(context, { type: "triangle", freq: 1396.91, at: t + 0.05, dur: 0.07, peak: 0.05, cents: c });
      break;
    case "stageAdvance":
      // Satisfying step: a short knock nudged upward.
      playGlide(context, { type: "triangle", from: 620, to: 760, at: t, dur: 0.08, peak: 0.07, cents: c });
      break;
    case "confirm":
      // Warm rising two-note, resolving to a fifth above.
      playTone(context, { type: "sine", freq: 523.25, at: t, dur: 0.09, peak: 0.07, cents: c });
      playTone(context, { type: "sine", freq: 783.99, at: t + 0.08, dur: 0.14, peak: 0.07, cents: c });
      break;
    case "resolve":
      // Gentle rising glide that lands on a bright bell — a "settled" feeling.
      playGlide(context, { type: "sine", from: 587.33, to: 880, at: t, dur: 0.18, peak: 0.08, cents: c });
      playTone(context, { type: "sine", freq: 1174.66, at: t + 0.16, dur: 0.16, peak: 0.05, cents: c });
      break;
    case "warning":
      // Low soft buffer plus a quiet low tone — noticeable, never harsh.
      playNoise(context, { at: t, dur: 0.16, peak: 0.06, cutoff: 420 });
      playTone(context, { type: "sine", freq: 174.61, at: t, dur: 0.18, peak: 0.05, cents: c });
      break;
    case "modalOpen":
      // Soft swell up.
      playGlide(context, { type: "sine", from: 392, to: 659.25, at: t, dur: 0.22, peak: 0.07, cents: c });
      break;
    case "modalComplete":
      // Soft settling two-note swell with a shimmer tail.
      playTone(context, { type: "sine", freq: 659.25, at: t, dur: 0.1, peak: 0.06, cents: c });
      playTone(context, { type: "sine", freq: 987.77, at: t + 0.09, dur: 0.16, peak: 0.06, cents: c });
      playTone(context, { type: "sine", freq: 1318.51, at: t + 0.16, dur: 0.14, peak: 0.035, cents: c });
      break;
  }
}

/** Internal: play without touching the explicit-call timestamp. */
function playInternal(name: SoundName, opts?: PlayOpts): void {
  if (!soundOn) return;
  if (prefersReducedMotion()) return;
  const context = ensureContext();
  if (!context) return;
  try {
    if (context.state === "suspended") {
      // Resume may reject when not yet unlocked by a gesture; ignore either way.
      void context.resume().catch(() => {});
    }
    render(context, name, context.currentTime, opts?.detuneCents);
  } catch {
    // A decorative sound must never surface an error to the user.
  }
}

/**
 * Play a named sound from a component (bespoke feedback). No-ops silently when
 * off or when audio is unavailable. Records the time so the global click layer
 * knows not to also fire for this same interaction.
 */
export function playSound(name: SoundName, opts?: PlayOpts): void {
  lastExplicitAt = now();
  playInternal(name, opts);
}

/* ------------------------------------------------------------------ */
/* Global click layer                                                  */
/* ------------------------------------------------------------------ */

const INTERACTIVE_SELECTOR =
  'a[href], button, summary, label, select, [role="button"], [role="menuitem"], [role="tab"], [role="switch"], [data-sfx]';

/** Stable-ish hash of a string into a small non-negative integer. */
function hashString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i += 1) {
    h = (h * 31 + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

/** Major-pentatonic cents so different sections sit in a pleasant scale. */
const PENTATONIC_CENTS = [0, 200, 400, 700, 900, 1200];

/** Per-section pitch so each area of the page has its own tonal color. */
function sectionCents(el: Element): number {
  const section = el.closest("section[id], [data-section]");
  const id =
    (section as HTMLElement | null)?.id ||
    (section as HTMLElement | null)?.dataset?.section ||
    "";
  if (!id) return 0;
  return PENTATONIC_CENTS[hashString(id) % PENTATONIC_CENTS.length] ?? 0;
}

/** Small random jitter (in cents) so repeated identical clicks feel alive. */
function jitterCents(): number {
  return Math.round((Math.random() - 0.5) * 44); // ±22 cents
}

/** Decide which sound an arbitrary interactive element should make. */
function inferSound(el: Element): SoundName | null {
  const target = el.closest(INTERACTIVE_SELECTOR) as HTMLElement | null;
  if (!target) return null;

  const explicit = target.dataset.sfx;
  if (explicit) {
    if (explicit === "none" || explicit === "custom") return null;
    return explicit as SoundName;
  }

  const role = target.getAttribute("role");
  if (role === "menuitem" || role === "tab") return "tab";
  if (role === "switch") return "toggle";

  const tag = target.tagName.toLowerCase();
  if (tag === "summary") return "toggle";
  if (tag === "select" || tag === "label") return "pop";

  if (tag === "a") {
    // In-page section jumps feel like navigating; outward links get a chime too.
    return "chime";
  }

  // Buttons: primary calls-to-action get the richer "coin", the rest a tick.
  const cls = target.className && typeof target.className === "string" ? target.className : "";
  const variant = target.dataset.variant ?? "";
  const type = (target as HTMLButtonElement).type ?? "";
  if (
    type === "submit" ||
    /primary|cta|submit|confirm|order|checkout|send/i.test(cls) ||
    /primary|cta/i.test(variant)
  ) {
    return "coin";
  }
  return "tick";
}

let globalInstalled = false;

/**
 * Install a single delegated click listener so every interactive element makes
 * a sound, without wiring each one by hand. Bespoke component sounds still win:
 * because React onClick handlers run before this document-level listener, a
 * recent explicit playSound suppresses the generic one for the same click.
 *
 * Returns a cleanup function. Safe to call once at app start.
 */
export function installGlobalClickSound(): () => void {
  if (typeof document === "undefined" || globalInstalled) {
    return () => {};
  }
  globalInstalled = true;

  const onClick = (e: MouseEvent) => {
    // Ignore programmatic or modified clicks that aren't a plain activation.
    if (e.defaultPrevented) return;
    const path = e.target as Element | null;
    if (!path || typeof path.closest !== "function") return;

    const el = path.closest(INTERACTIVE_SELECTOR);
    if (!el) return;

    // A bespoke sound already fired for this interaction — don't double up.
    if (now() - lastExplicitAt < 90) return;

    const name = inferSound(el);
    if (!name) return;

    const cents = sectionCents(el) + jitterCents();
    playInternal(name, { detuneCents: cents });
  };

  document.addEventListener("click", onClick, false);
  return () => {
    document.removeEventListener("click", onClick, false);
    globalInstalled = false;
  };
}
