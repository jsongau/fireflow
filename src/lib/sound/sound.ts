/**
 * FireFlow sound engine — a restrained, optional layer of decorative audio
 * feedback built directly on the Web Audio API (no library).
 *
 * Design rules:
 *   - Off by default. The on/off preference persists in localStorage under
 *     "fireflow:sound", independent of the app store.
 *   - A single AudioContext is created lazily on the first user gesture — never
 *     on load, so nothing autoplays.
 *   - If Web Audio (or storage) is unavailable, every export no-ops safely and
 *     nothing ever throws. Sound is purely decorative: the site is fully usable
 *     in silence with no lost information.
 */

export type SoundName =
  | "select"
  | "confirm"
  | "compareAdd"
  | "stageAdvance"
  | "resolve"
  | "warning"
  | "modalOpen"
  | "modalComplete";

const STORAGE_KEY = "fireflow:sound";

/** Constructor type that also covers the Safari `webkitAudioContext` prefix. */
type AudioContextCtor = typeof AudioContext;

let soundOn: boolean = readStoredPreference();
let ctx: AudioContext | null = null;
let ctxUnavailable = false;

function readStoredPreference(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === "on";
  } catch {
    // Storage blocked (private mode, disabled cookies, SSR): default off.
    return false;
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
 * Lazily create the shared AudioContext. Returns null (permanently, after the
 * first failure) when Web Audio is unavailable. Must only be reached from a
 * user gesture so browsers allow the context to start.
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
    return ctx;
  } catch {
    ctxUnavailable = true;
    return null;
  }
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

/** A single enveloped oscillator note. */
function playTone(
  context: AudioContext,
  opts: {
    type: OscillatorType;
    freq: number;
    at: number;
    dur: number;
    peak: number;
  },
): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.freq, opts.at);

  const attack = Math.min(0.012, opts.dur * 0.3);
  gain.gain.setValueAtTime(0.0001, opts.at);
  gain.gain.exponentialRampToValueAtTime(opts.peak, opts.at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);

  osc.connect(gain);
  gain.connect(context.destination);
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
  },
): void {
  const osc = context.createOscillator();
  const gain = context.createGain();
  osc.type = opts.type;
  osc.frequency.setValueAtTime(opts.from, opts.at);
  osc.frequency.linearRampToValueAtTime(opts.to, opts.at + opts.dur);

  const attack = Math.min(0.02, opts.dur * 0.3);
  gain.gain.setValueAtTime(0.0001, opts.at);
  gain.gain.exponentialRampToValueAtTime(opts.peak, opts.at + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, opts.at + opts.dur);

  osc.connect(gain);
  gain.connect(context.destination);
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
  gain.connect(context.destination);
  src.start(opts.at);
  src.stop(opts.at + opts.dur + 0.02);
}

/**
 * Render one sound. Each is short (<300ms), soft, and low peak-gain, with a
 * distinct-but-related character in the same restrained palette.
 */
function render(context: AudioContext, name: SoundName, t: number): void {
  switch (name) {
    case "select":
      // Soft high tick.
      playTone(context, { type: "sine", freq: 880, at: t, dur: 0.06, peak: 0.06 });
      break;
    case "compareAdd":
      // Brighter, slightly higher sibling of "select".
      playTone(context, { type: "triangle", freq: 1046.5, at: t, dur: 0.05, peak: 0.055 });
      break;
    case "stageAdvance":
      // Short click, a touch of grain.
      playTone(context, { type: "triangle", freq: 660, at: t, dur: 0.04, peak: 0.07 });
      break;
    case "confirm":
      // Warm rising two-note.
      playTone(context, { type: "sine", freq: 523.25, at: t, dur: 0.09, peak: 0.07 });
      playTone(context, { type: "sine", freq: 783.99, at: t + 0.08, dur: 0.12, peak: 0.07 });
      break;
    case "resolve":
      // Gentle rising glide — a "settled" feeling.
      playGlide(context, { type: "sine", from: 587.33, to: 880, at: t, dur: 0.18, peak: 0.08 });
      break;
    case "warning":
      // Low soft buffer plus a quiet low tone — noticeable, never harsh.
      playNoise(context, { at: t, dur: 0.16, peak: 0.06, cutoff: 420 });
      playTone(context, { type: "sine", freq: 174.61, at: t, dur: 0.18, peak: 0.05 });
      break;
    case "modalOpen":
      // Soft swell up.
      playGlide(context, { type: "sine", from: 392, to: 659.25, at: t, dur: 0.22, peak: 0.07 });
      break;
    case "modalComplete":
      // Soft settling two-note swell.
      playTone(context, { type: "sine", freq: 659.25, at: t, dur: 0.1, peak: 0.06 });
      playTone(context, { type: "sine", freq: 987.77, at: t + 0.09, dur: 0.16, peak: 0.06 });
      break;
  }
}

/** Play a named sound. No-ops silently when off or when audio is unavailable. */
export function playSound(name: SoundName): void {
  if (!soundOn) return;
  const context = ensureContext();
  if (!context) return;
  try {
    if (context.state === "suspended") {
      // Resume may reject when not yet unlocked by a gesture; ignore either way.
      void context.resume().catch(() => {});
    }
    render(context, name, context.currentTime);
  } catch {
    // A decorative sound must never surface an error to the user.
  }
}
