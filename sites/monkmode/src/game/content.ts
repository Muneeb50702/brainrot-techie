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
  call: 17,
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

export const TRAPS: Trap[] = [
  { kind: "hair", at: 6, dur: 7, blocking: false, label: "a fake hair on your screen 🪮 (it was never there)" },
  { kind: "freeze", at: 11.5, dur: 4, blocking: true, label: "the fake 'not responding' freeze 🧊", after: "it's not frozen. you are 🧊" },
  { kind: "dim", at: 25, dur: 3, blocking: true, label: "your screen 'turning off' 🌑 (it wasn't)" },
  { kind: "lock", at: 28, dur: 5.5, blocking: true, label: "the fake lock screen 🔒 (your phone never locked)", after: "not locked lol 🔒 still in monk mode" },
  { kind: "bug", at: 37.5, dur: 5.5, blocking: false, label: "a fake bug crawling on your screen 🪳" },
  { kind: "crack", at: 42, dur: 4.5, blocking: false, label: "a fake screen crack 💔 (your screen is fine)", after: "your screen is fine. your discipline isn't 💔" },
  { kind: "pause", at: 46.5, dur: 4, blocking: true, label: "the fake pause screen ⏸", after: "there's no pause button in monk mode 🧘" },
  { kind: "fakeover", at: 51, dur: 5.5, blocking: true, label: "the FAKE game over screen 🤡 (you never touched it)", after: "jk 👀 you never touched it. keep going" },
];

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
