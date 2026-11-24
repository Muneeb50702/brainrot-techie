/* Everything your phone throws at you. Generic app names only (no real brands). */

export type Notif = { icon: string; app: string; title: string; body: string; blur?: boolean };

export const NOTIFS: Notif[] = [
  { icon: "💬", app: "messages", title: "mom", body: "call me. now." },
  { icon: "👀", app: "stories", title: "your crush", body: "viewed your story" },
  { icon: "🔥", app: "streaks", title: "streak alert", body: "your 312-day streak dies in 2 min 😱" },
  { icon: "📸", app: "photos", title: "someone liked your photo", body: "tap to see who 👀" },
  { icon: "📦", app: "delivery", title: "your package is here", body: "tap to see a photo of your door" },
  { icon: "🎮", app: "squad", title: "squad", body: "we're waiting. get on bro" },
  { icon: "📅", app: "calendar", title: "quick sync", body: "starts in 5 min 🙂" },
  { icon: "📚", app: "school", title: "assignment due", body: "in 47 minutes. you started?" },
  { icon: "🎵", app: "music", title: "your fav artist", body: "just dropped a surprise album" },
  { icon: "❤️", app: "dating", title: "3 new matches", body: "one of them is 'perfect for you'" },
  { icon: "🪫", app: "system", title: "storage almost full", body: "tap to free up space" },
  { icon: "💀", app: "feed", title: "you got ratioed", body: "1.2k replies under your post" },
  { icon: "👻", app: "messages", title: "unknown number", body: "hey… who's this? 👀" },
  { icon: "🪙", app: "wallet", title: "+500 aura received", body: "tap to accept" },
  { icon: "🧑‍💻", app: "work chat", title: "your manager", body: "got a sec?" },
  { icon: "🗞️", app: "news", title: "BREAKING", body: "something huge just happened (tap)" },
  { icon: "🫂", app: "group chat", title: "the gc (47 new)", body: "WAIT DID U SEE THIS" },
  { icon: "🍕", app: "food", title: "your order", body: "is 2 min away 🛵" },
  { icon: "🫣", app: "messages", title: "your crush", body: "i need to tell u something ngl", blur: true },
  { icon: "📸", app: "screenshots", title: "someone screenshotted your chat", body: "tap to see who 👀" },
  { icon: "🫣", app: "group chat", title: "they're talking about you", body: "omg did u see what they posted", blur: true },
];

export type Popup = { title: string; body?: string; buttons: string[]; label: string };

export const POPUPS: Popup[] = [
  { title: "are you still there?", buttons: ["yes 👋"], label: "an 'are you still there?' popup" },
  { title: "⚠️ battery 1%", body: "tap to enable saver mode", buttons: ["save battery"], label: "a fake low battery warning" },
  { title: "accept cookies? 🍪", body: "we use cookies to ruin your focus", buttons: ["accept", "reject"], label: "a cookie banner (both buttons lose lol)" },
  { title: "rate monk mode", body: "⭐⭐⭐⭐⭐", buttons: ["rate 5 stars"], label: "a rate-this-app popup" },
  { title: "your screen is dirty 🧽", body: "tap to clean it", buttons: ["clean screen"], label: "'your screen is dirty'" },
  { title: "new update available", body: "life.exe v2.0", buttons: ["update now"], label: "a fake update" },
  { title: "you dropped this 👑", buttons: ["pick it up"], label: "'you dropped this 👑'" },
  { title: "free aura giveaway 🎁", body: "first 10 taps only", buttons: ["claim"], label: "a free aura giveaway" },
  { title: "☐  i'm not a robot", body: "verify to continue", buttons: ["verify"], label: "a fake 'i'm not a robot' checkbox 🤖" },
  { title: "🔇 your sound is off", body: "tap to hear the secret message", buttons: ["unmute"], label: "a fake 'tap to unmute'" },
  { title: "⚠️ tap within 3 seconds", body: "or lose all your progress", buttons: ["save progress"], label: "a fake 'tap or lose your progress' threat" },
  { title: "only 0.3% reach 60s", body: "wanna see the leaderboard?", buttons: ["show me"], label: "a fake leaderboard flex" },
];

export const ZEN: [number, string][] = [
  [0, "breathe in…"],
  [3, "ignore the noise"],
  [8, "it's just pixels"],
  [17, "be the monk 🧘"],
  [24, "STAY STRONG"],
  [34, "your thumb is twitching"],
  [44, "nothing here is real"],
  [56, "almost there…"],
  [58, "…"],
];

/** Game timeline in seconds. */
export const T = {
  notifsFrom: 3,
  popupsFrom: 8,
  callDuration: 6,
  chaosFrom: 34,
  maxChaosFrom: 44,
  calmFrom: 57.5,
  fakeWin: 60,
  suspicious: 68,
  ascend: 75,
};

/* Scripted psychological traps. Each hijacks a reflex, not curiosity.
   `blocking` traps cover the screen, so random spawns pause while they run. */
export type TrapKind = "hair" | "freeze" | "dim" | "lock" | "bug" | "crack" | "pause" | "fakeover";
export type Trap = { kind: TrapKind; at: number; dur: number; blocking: boolean; label: string; after?: string };

/** Trap catalog. Timing is NOT fixed: makePlan() shuffles order + timing every run. */
export const TRAP_DEFS: Record<TrapKind, Omit<Trap, "at">> = {
  hair: { kind: "hair", dur: 5, blocking: false, label: "a fake hair on your screen 🪮 (it was never there)" },
  freeze: { kind: "freeze", dur: 4, blocking: true, label: "the fake 'not responding' freeze 🧊", after: "it's not frozen. you are 🧊" },
  dim: { kind: "dim", dur: 3, blocking: true, label: "your screen 'turning off' 🌑 (it wasn't)" },
  lock: { kind: "lock", dur: 5, blocking: true, label: "the fake lock screen 🔒 (your phone never locked)", after: "not locked lol 🔒 still in monk mode" },
  bug: { kind: "bug", dur: 4.5, blocking: false, label: "a fake bug crawling on your screen 🪳" },
  crack: { kind: "crack", dur: 4, blocking: false, label: "a fake screen crack 💔 (your screen is fine)", after: "your screen is fine. your discipline isn't 💔" },
  pause: { kind: "pause", dur: 4, blocking: true, label: "the fake pause screen ⏸", after: "there's no pause button in monk mode 🧘" },
  fakeover: { kind: "fakeover", dur: 5, blocking: true, label: "the FAKE game over screen 🤡 (you never touched it)", after: "jk 👀 you never touched it. keep going" },
};
export const isTrapLabel = (label: string) => Object.values(TRAP_DEFS).some((d) => d.label === label);

export type Caller = { name: string; emoji: string; line: string };
const CALLERS: Caller[] = [
  { name: "bestie", emoji: "💅", line: "PICK UP IT'S AN EMERGENCY" },
  { name: "mom", emoji: "👩", line: "pick up. now." },
  { name: "your crush", emoji: "🫣", line: "they never call… what if it's important" },
  { name: "unknown number", emoji: "❓", line: "could be important…" },
  { name: "delivery guy", emoji: "🛵", line: "i'm outside, come get it" },
  { name: "boss", emoji: "💼", line: "quick question 🙂" },
];
const LOCK_MSGS = [
  { icon: "💬", from: "mom", text: "why aren't you answering?? call me back" },
  { icon: "🫣", from: "your crush", text: "hey u up? 👀" },
  { icon: "🫂", from: "the gc", text: "99+ new messages · WAIT DID U SEE THIS" },
  { icon: "📦", from: "delivery", text: "your order has arrived. tap to see photo" },
  { icon: "🔥", from: "streaks", text: "your streak dies in 60 seconds 😱" },
];

export type Plan = {
  seed: number;
  traps: Trap[];
  callAt: number;
  caller: Caller;
  lockMsg: (typeof LOCK_MSGS)[number];
  hair: { x: number; y: number; rot: number };
  crack: { x: number; y: number };
  bugFromRight: boolean;
};

/** Small seeded PRNG so a seed (e.g. ?seed=42 for reel recordings) replays the same run. */
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** A fresh trap schedule for one run: shuffled order, random gaps, random variants.
 *  Blocking (full-screen) traps never overlap; dim always flows into lock; the fake
 *  game over never lands before 18s (or "you lasted 4s" would give it away). */
export function makePlan(seed = (Math.random() * 2 ** 31) | 0): Plan {
  const rnd = mulberry32(seed);
  const pick = <X,>(a: X[]) => a[Math.floor(rnd() * a.length)];
  const shuffle = <X,>(arr: X[]) => {
    const out = [...arr];
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [out[i], out[j]] = [out[j], out[i]];
    }
    return out;
  };
  const START = 5, END = 56.5, MIN_GAP = 1.4;
  type Unit = { id: "freeze" | "call" | "dimlock" | "pause" | "fakeover"; dur: number; tail: number };
  const UNITS: Unit[] = [
    { id: "freeze", dur: 4, tail: 2.3 },
    { id: "call", dur: T.callDuration, tail: 0.6 },
    { id: "dimlock", dur: 8, tail: 2.3 },
    { id: "pause", dur: 4, tail: 2.3 },
    { id: "fakeover", dur: 5, tail: 2.3 },
  ];

  let placed: { id: Unit["id"]; at: number }[] = [];
  for (let attempt = 0; attempt < 50; attempt++) {
    const order = shuffle(UNITS);
    const used = order.reduce((s, u) => s + u.dur + u.tail + MIN_GAP, 0);
    const slack = Math.max(0, END - START - used);
    const weights = order.map(() => rnd());
    const wsum = weights.reduce((a, b) => a + b, 0) + rnd(); // + trailing slack
    let t = START;
    placed = order.map((u, i) => {
      t += MIN_GAP + (slack * weights[i]) / wsum;
      const at = t;
      t += u.dur + u.tail;
      return { id: u.id, at };
    });
    const fo = placed.find((p) => p.id === "fakeover")!;
    if (fo.at >= 18) break;
  }

  const traps: Trap[] = [];
  let callAt = 20;
  for (const p of placed) {
    const at = +p.at.toFixed(2);
    if (p.id === "call") callAt = at;
    else if (p.id === "dimlock") traps.push({ ...TRAP_DEFS.dim, at }, { ...TRAP_DEFS.lock, at: at + TRAP_DEFS.dim.dur });
    else traps.push({ ...TRAP_DEFS[p.id], at });
  }

  // Small traps go into the free windows between full-screen traps (never under one).
  // If no window is long enough, the trap is shortened to fit, so all 8 traps always happen.
  const busy = [...traps.filter((x) => x.blocking).map((x) => [x.at, x.at + x.dur]), [callAt, callAt + T.callDuration]].sort((x, y) => x[0] - y[0]);
  const windows: [number, number][] = [];
  let cursor = 3;
  for (const [bs, be] of busy) {
    if (bs - cursor > 0.3) windows.push([cursor, bs - 0.15]);
    cursor = Math.max(cursor, be + 0.15);
  }
  if (57 - cursor > 0.3) windows.push([cursor, 57]);
  for (const kind of shuffle(["hair", "bug", "crack"] as const)) {
    const want = TRAP_DEFS[kind].dur;
    const fits = windows.filter(([ws, we]) => we - ws >= want);
    if (fits.length) {
      const [ws, we] = pick(fits);
      traps.push({ ...TRAP_DEFS[kind], at: +(ws + rnd() * (we - ws - want)).toFixed(2) });
    } else {
      const [ws, we] = windows.reduce((best, w) => (w[1] - w[0] > best[1] - best[0] ? w : best), [0, 0] as [number, number]);
      if (we - ws >= 2.5) traps.push({ ...TRAP_DEFS[kind], at: +ws.toFixed(2), dur: +(we - ws).toFixed(2) });
    }
  }

  return {
    seed,
    traps: traps.sort((a, b) => a.at - b.at),
    callAt,
    caller: pick(CALLERS),
    lockMsg: pick(LOCK_MSGS),
    hair: { x: 30 + rnd() * 40, y: 30 + rnd() * 18, rot: -40 + rnd() * 80 },
    crack: { x: 25 + rnd() * 50, y: 25 + rnd() * 45 },
    bugFromRight: rnd() < 0.5,
  };
}

/** Seconds between spawns. Shrinks as the clock runs. */
export function spawnGap(t: number) {
  if (t < T.popupsFrom) return 1.8;
  if (t < T.chaosFrom) return 1.25;
  if (t < T.maxChaosFrom) return 0.85;
  return 0.55;
}

export type Rank = { name: string; emoji: string; color: string; roast: string };

export function rankFor(seconds: number, outcome: "lose" | "trap" | "win"): Rank {
  if (outcome === "win") return { name: "ascended", emoji: "🌌", color: "#c6ff3d", roast: "75 seconds. zero touches. you're him. now go touch grass. literally." };
  if (outcome === "trap") return { name: "almost monk", emoji: "🤡", color: "#ff3da5", roast: "survived 60 seconds then fell for a FAKE win screen 💀" };
  if (seconds < 5) return { name: "dopamine goblin", emoji: "🐀", color: "#ff3da5", roast: "you lasted shorter than a video intro." };
  if (seconds < 15) return { name: "brainrot victim", emoji: "🧟", color: "#ff3da5", roast: "your attention span has left the chat." };
  if (seconds < 30) return { name: "npc energy", emoji: "🫥", color: "#8b8b9c", roast: "the notifications won. as they always do." };
  if (seconds < 45) return { name: "mid monk", emoji: "😐", color: "#3de8ff", roast: "respectable. your thumb still twitched though." };
  return { name: "certified monk", emoji: "🧘", color: "#c6ff3d", roast: "45+ seconds. elite discipline. the call was RIGHT there." };
}
