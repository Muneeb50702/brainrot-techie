/** The 9 memory tiles (a 3×3 spatial span test, brainrot edition). */
export const TILES = ["🍕", "🐸", "💀", "🔥", "🧠", "👀", "🥶", "🫠", "🗿"];

/** Stroop: tap the INK colour. Colour words mostly conflict with their ink; slang words are wildcards. */
export const COLORS = [
  { name: "red", hex: "#d62828" },
  { name: "blue", hex: "#2443d6" },
  { name: "green", hex: "#1f8a4c" },
  { name: "yellow", hex: "#d99a00" },
] as const;
export const SLANG = ["SKIBIDI", "RIZZ", "AURA", "SIGMA", "COOKED", "DELULU"];

export type StroopTrial = { word: string; ink: number; isColourWord: boolean };

export function makeStroop(n = 12): StroopTrial[] {
  const out: StroopTrial[] = [];
  for (let i = 0; i < n; i++) {
    const ink = Math.floor(Math.random() * COLORS.length);
    if (Math.random() < 0.7) {
      let w = Math.floor(Math.random() * COLORS.length);
      if (w === ink) w = (w + 1 + Math.floor(Math.random() * 3)) % COLORS.length; // always conflicting
      out.push({ word: COLORS[w].name.toUpperCase(), ink, isColourWord: true });
    } else {
      out.push({ word: SLANG[Math.floor(Math.random() * SLANG.length)], ink, isColourWord: false });
    }
  }
  return out;
}

/** Focus test distractions. Tapping any of them counts against you. */
export const NOTIFS = [
  { icon: "💬", title: "mom", body: "call me" },
  { icon: "👀", title: "your crush", body: "liked your story" },
  { icon: "🔥", title: "streak alert", body: "ends in 1 minute 😱" },
  { icon: "🫂", title: "the gc", body: "WAIT LOOK AT THIS" },
  { icon: "🪫", title: "battery 5%", body: "tap to save power" },
  { icon: "📦", title: "delivery", body: "your package is here" },
];
