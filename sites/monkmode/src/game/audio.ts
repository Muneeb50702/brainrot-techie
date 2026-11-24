/* Tiny WebAudio synth: notification dings, a ringtone and an error buzz. No audio files. */

let ctx: AudioContext | null = null;
let enabled = true;
let ringTimer: number | null = null;

/** Must be called from a user gesture (the start button) so browsers allow audio. */
export function initAudio(on: boolean) {
  enabled = on;
  if (!on) return;
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume();
  } catch {
    enabled = false;
  }
}

function tone(freq: number, start: number, dur: number, type: OscillatorType = "sine", gain = 0.12) {
  if (!ctx || !enabled) return;
  const t0 = ctx.currentTime + start;
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const buzz = (pattern: number | number[]) => {
  try {
    navigator.vibrate?.(pattern);
  } catch {
    /* unsupported */
  }
};

export function ding() {
  tone(1318, 0, 0.18);
  tone(1760, 0.09, 0.22);
  buzz(40);
}

export function pop() {
  tone(660, 0, 0.12, "triangle", 0.1);
  buzz(25);
}

export function error() {
  tone(110, 0, 0.35, "sawtooth", 0.08);
  tone(98, 0.12, 0.35, "sawtooth", 0.08);
  buzz([60, 40, 60]);
}

export function startRing() {
  stopRing();
  const ring = () => {
    for (let i = 0; i < 6; i++) tone(i % 2 ? 784 : 988, i * 0.09, 0.08, "square", 0.05);
    buzz([400, 200, 400]);
  };
  ring();
  ringTimer = window.setInterval(ring, 1400);
}

export function stopRing() {
  if (ringTimer !== null) window.clearInterval(ringTimer);
  ringTimer = null;
}

/** Glass crack: a burst of filtered noise + a low thud. */
export function crack() {
  if (!ctx || !enabled) return;
  const len = Math.floor(ctx.sampleRate * 0.25);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < len; i++) data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
  const src = ctx.createBufferSource();
  const hp = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = buf;
  hp.type = "highpass";
  hp.frequency.value = 1800;
  g.gain.value = 0.35;
  src.connect(hp).connect(g).connect(ctx.destination);
  src.start();
  tone(70, 0, 0.25, "sine", 0.2);
  buzz([30, 30, 80]);
}

/** Lock-screen click. */
export function click() {
  tone(2400, 0, 0.03, "square", 0.05);
  tone(1200, 0.02, 0.04, "square", 0.04);
}

export function lose() {
  stopRing();
  tone(392, 0, 0.18, "triangle", 0.12);
  tone(311, 0.16, 0.18, "triangle", 0.12);
  tone(196, 0.32, 0.5, "triangle", 0.12);
  buzz(300);
}

export function win() {
  [523, 659, 784, 1046].forEach((f, i) => tone(f, i * 0.12, 0.3, "triangle", 0.1));
}
