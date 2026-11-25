/* Missions, the rogue autocorrect's dictionary, and how each contact reacts to what survived. */

export type Contact = "mom" | "boss" | "crush";

export type Mission = {
  contact: Contact;
  name: string;
  avatar: string;
  status: string;
  prompt: string; // their message that you're replying to (empty = you start it)
  target: string; // what you're trying to send
  chance: number; // probability a committed word gets corrupted
  seconds: number;
  extras: boolean; // also sprinkles "fr" / emoji / letter-stretch on top
};

export const MISSIONS: Mission[] = [
  { contact: "mom", name: "mom ❤️", avatar: "👩", status: "online", prompt: "are you coming home for dinner tonight?", target: "love you see you at dinner tonight", chance: 0.4, seconds: 25, extras: false },
  { contact: "boss", name: "boss (do not mess up)", avatar: "💼", status: "last seen 2 min ago", prompt: "the meeting started 5 min ago. where are you?", target: "running five minutes late sorry about that", chance: 0.55, seconds: 25, extras: false },
  { contact: "crush", name: "crush 🫣", avatar: "🫣", status: "online", prompt: "", target: "hey do you want to grab coffee this weekend", chance: 0.7, seconds: 25, extras: true },
];

/** word → what autocorrupt "fixes" it to. Several options so runs differ. */
export const CORRUPT: Record<string, string[]> = {
  love: ["lowkey simp for", "rizz", "ratio"],
  you: ["u fr", "bestie", "chat"],
  see: ["perceive", "stalk", "witness"],
  at: ["@", "at the function"],
  dinner: ["the feast 🍗", "din din", "the mukbang"],
  tonight: ["2nite no cap", "at 3am", "tonight (it's giving)"],
  running: ["sprinting (emotionally)", "speedrunning", "lowkey running"],
  five: ["5 business", "fifty", "skibidi"],
  minutes: ["light years", "business days", "seasons"],
  late: ["fashionably cooked", "delulu", "l8"],
  sorry: ["my bad fr fr", "not sorry", "sowwy 🥺"],
  about: ["abt", "aboot"],
  that: ["dat", "allat"],
  hey: ["heyyy 😏", "hiii bestie", "sup gorgeous"],
  do: ["would", "dew"],
  want: ["crave", "lowkey need", "yearn"],
  to: ["2", "too"],
  grab: ["yoink", "manifest", "steal"],
  coffee: ["caffeinated rizz juice", "bean water", "a date ❤️"],
  this: ["this skibidi", "dis"],
  weekend: ["weekend 💅", "lifetime", "wedding"],
};

/** The corruption dice. Random for players; `?seed=N` replays one exact run (used for reels). */
let rng: () => number = Math.random;
export const roll = () => rng();
export function setSeed(seed: number) {
  let a = seed >>> 0;
  rng = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const EXTRAS = [" fr", " 💀", " no cap", " 😩", " (respectfully)"];

/** Pick a corruption for a word (dictionary first, else a generic mutation). */
export function corruptWord(word: string, extras: boolean, rnd: () => number = roll): string {
  const key = word.toLowerCase().replace(/[^a-z]/g, "");
  const opts = CORRUPT[key];
  let out = opts ? opts[Math.floor(rnd() * opts.length)] : stretch(word);
  if (extras && rnd() < 0.45) out += EXTRAS[Math.floor(rnd() * EXTRAS.length)];
  return out;
}

const stretch = (w: string) => (w.length > 2 ? w + w.slice(-1).repeat(3) : w.toUpperCase());

/** Villain lines when it strikes / when you fix a word. */
export const STRIKE = ["fixed it for u 😈", "you're welcome", "much better", "trust me bestie", "autocorrected ✨", "i know what u meant"];
export const UNDO = ["fine. FINE.", "nobody asked u", "ok boomer", "i'll be back", "ugh"];

/** Each contact's reply, by how much dignity survived (0–1). */
export const REPLIES: Record<Contact, [number, string][]> = {
  mom: [
    [0.9, "love you too sweetie ❤️ dinner at 7"],
    [0.6, "are you okay??"],
    [0.3, "who taught you that word"],
    [0, "who is this. what have you done with my child"],
  ],
  boss: [
    [0.9, "no worries, thanks for the heads up 👍"],
    [0.6, "…ok?"],
    [0.3, "please see me in my office."],
    [0, "this conversation is now with HR."],
  ],
  crush: [
    [0.9, "omg yes!! saturday? ☕"],
    [0.6, "haha… sure?"],
    [0.3, "lmao what 😭"],
    [0, ""], // left on read
  ],
};

export function replyFor(contact: Contact, dignity: number) {
  return REPLIES[contact].find(([min]) => dignity >= min)![1];
}

export type Rank = { title: string; emoji: string; line: string };
export function rankFor(dignity: number): Rank {
  if (dignity >= 0.9) return { title: "texting legend", emoji: "🏆", line: "autocorrect had zero power over you. touch grass, you've earned it." };
  if (dignity >= 0.65) return { title: "survived (barely)", emoji: "😮‍💨", line: "a few words got possessed. your mom has questions." };
  if (dignity >= 0.35) return { title: "autocorrupted", emoji: "🫠", line: "half your vocabulary now belongs to the algorithm." };
  return { title: "fully possessed", emoji: "😈", line: "you didn't send those texts. the autocorrect did. through you." };
}
