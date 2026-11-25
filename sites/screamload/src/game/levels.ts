/* The physics of downloading RAM with your lungs. */

export const FILE = { name: "free_ram_4.20GB.zip", mb: 4300.8 };

/** dB → download speed (MB/s). Nothing below the threshold, then it ramps hard. */
export function speedFor(db: number, threshold: number) {
  if (db <= threshold) return 0;
  const x = Math.min(1.2, (db - threshold) / (100 - threshold));
  return 680 * Math.pow(x, 1.6);
}

export const SCALE: [number, string][] = [
  [0, "silence 🤫"],
  [45, "whisper"],
  [58, "library voice"],
  [68, "normal yap"],
  [78, "group chat irl"],
  [88, "concert 🎤"],
  [96, "jet engine ✈️"],
  [104, "BANSHEE 👻"],
];
export const labelFor = (db: number) => [...SCALE].reverse().find(([min]) => db >= min)![1];

/** Typical loudness of real things (dB SPL), for "your scream = ___". */
export const LIKE: [number, string][] = [
  [0, "a sleeping cat 🐈"],
  [60, "a normal conversation"],
  [70, "a vacuum cleaner"],
  [80, "an alarm clock ⏰"],
  [88, "a blender"],
  [95, "a motorcycle 🏍️"],
  [100, "a hand dryer from hell"],
  [110, "a rock concert 🎸"],
  [120, "a thunderclap ⛈️"],
];
export const likeFor = (db: number) => [...LIKE].reverse().find(([min]) => db >= min)![1];

export function etaText(remainingMb: number, speed: number) {
  if (speed < 0.5) return ["3 business days", "never", "heat death of the universe", "after your mom calls"][Math.floor(Date.now() / 2500) % 4];
  const s = remainingMb / speed;
  return s < 1 ? "<1s" : `${Math.ceil(s)}s`;
}

/** Neighbours get angrier with every loud second. */
export function neighboursFor(loudSeconds: number) {
  if (loudSeconds < 2) return "😴 asleep";
  if (loudSeconds < 5) return "🤨 confused";
  if (loudSeconds < 9) return "😠 banging on the wall";
  if (loudSeconds < 14) return "📞 calling the landlord";
  return "🚓 called the police";
}

export const fmtGb = (mb: number) => `${(mb / 1024).toFixed(2)} GB`;
