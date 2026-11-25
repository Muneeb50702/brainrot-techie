/* How cooked is your brain: four real cognitive tests, each mapped to 0 (raw) … 1 (charcoal)
   against published human averages. The jokes are on top; the math underneath is honest. */

export type RoundId = "reflex" | "memory" | "stroop" | "focus";

export type ReflexResult = { ms: number; trials: number[]; early: number };
export type MemoryResult = { span: number };
export type StroopResult = { acc: number; rt: number; readTheWord: number; total: number };
export type FocusResult = { hits: number; glitches: number; falseAlarms: number; notifTaps: number };

export type Results = {
  reflex?: ReflexResult;
  memory?: MemoryResult;
  stroop?: StroopResult;
  focus?: FocusResult;
};

const clamp01 = (n: number) => Math.max(0, Math.min(1, n));

/** Visual reaction time: ~250 ms is the typical adult median (phones add ~30–50 ms of touch latency). */
export const reflexCooked = (r: ReflexResult) => clamp01((r.ms - 230) / 270 + r.early * 0.06);
/** Short-term memory span: "7 ± 2" (Miller). We use a 9-tile spatial sequence; ~6 is typical. */
export const memoryCooked = (r: MemoryResult) => clamp01((8 - r.span) / 5);
/** Stroop interference: errors + slow responses on colour/word conflicts. */
export const stroopCooked = (r: StroopResult) => clamp01(0.6 * clamp01((1 - r.acc) / 0.35) + 0.4 * clamp01((r.rt - 650) / 900));
/** Sustained attention (vigilance): missed glitches + taps on distractions. */
export const focusCooked = (r: FocusResult) => clamp01(((r.glitches - r.hits) / Math.max(1, r.glitches)) * 0.7 + r.falseAlarms * 0.12);

export const WEIGHTS: Record<RoundId, number> = { reflex: 0.2, memory: 0.3, stroop: 0.25, focus: 0.25 };

export function perRound(res: Results): Record<RoundId, number> {
  return {
    reflex: res.reflex ? reflexCooked(res.reflex) : 0.5,
    memory: res.memory ? memoryCooked(res.memory) : 0.5,
    stroop: res.stroop ? stroopCooked(res.stroop) : 0.5,
    focus: res.focus ? focusCooked(res.focus) : 0.5,
  };
}

export function totalCooked(res: Results): number {
  const p = perRound(res);
  return Math.round(100 * (Object.keys(WEIGHTS) as RoundId[]).reduce((s, k) => s + p[k] * WEIGHTS[k], 0));
}

export type Doneness = { name: string; emoji: string; color: string; note: string; rx: string };

export function doneness(pct: number): Doneness {
  if (pct < 15) return { name: "raw", emoji: "🥩", color: "#1f8a4c", note: "fresh. the algorithm hasn't touched you. honestly suspicious.", rx: "keep doing whatever you're doing (logging off?)" };
  if (pct < 30) return { name: "rare", emoji: "🥩", color: "#2443d6", note: "mostly intact. a little scroll damage around the edges.", rx: "one walk outside, no phone, daily." };
  if (pct < 50) return { name: "medium", emoji: "🍖", color: "#d99a00", note: "the brainrot is spreading but you're still in there.", rx: "touch grass 2x daily. with your hands." };
  if (pct < 70) return { name: "well done", emoji: "🍗", color: "#e8590c", note: "your attention span has left the chat. it took the snacks.", rx: "screen time limits. you won't follow them." };
  if (pct < 85) return { name: "burnt", emoji: "🔥", color: "#d62828", note: "the frontal lobe is sending you to voicemail.", rx: "airplane mode for 3–5 business days." };
  return { name: "charcoal", emoji: "💀", color: "#141414", note: "there is nothing left to cook. this is just ash and memes.", rx: "throw the phone in a lake (respectfully)." };
}

export function reflexLine(ms: number) {
  if (ms < 200) return "pro gamer reflexes 🎮";
  if (ms < 250) return "cat-like. respect 🐈";
  if (ms < 300) return "average human";
  if (ms < 350) return "a 2012 android phone 📱";
  if (ms < 450) return "a windows update 💾";
  return "dial-up internet ☎️";
}

export function memoryLine(span: number) {
  if (span >= 8) return "photographic memory 📸";
  if (span >= 6) return "average human brain";
  if (span >= 4) return "forgot why you walked into the room";
  return "goldfish behaviour 🐠";
}

export function stroopLine(r: StroopResult) {
  if (r.readTheWord === 0 && r.acc >= 0.95) return "brain firewall: intact 🛡️";
  if (r.readTheWord <= 1) return "slight glitch in the matrix";
  return `your brain read the WORD instead of the colour ${r.readTheWord}×`;
}

export function focusLine(r: FocusResult) {
  if (r.notifTaps > 0) return `tapped a fake notification ${r.notifTaps}× 💀`;
  if (r.hits === r.glitches && r.falseAlarms === 0) return "locked in. zero distractions 🎯";
  if (r.hits === r.glitches) return `caught every glitch, ${r.falseAlarms} panic tap${r.falseAlarms > 1 ? "s" : ""}`;
  return `missed ${r.glitches - r.hits} of ${r.glitches} glitches`;
}
