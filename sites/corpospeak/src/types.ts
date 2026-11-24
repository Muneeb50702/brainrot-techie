export type Mode = "corp2z" | "z2corp";

export type CorpToZ = { mode: "corp2z"; input: string; translation: string; real_meaning: string; red_flag: number; vibe: string };
export type ZToCorp = { mode: "z2corp"; input: string; subject: string; translation: string; synergy: number; vibe: string };
export type Translation = CorpToZ | ZToCorp;

export const PRESETS: Record<Mode, string[]> = {
  corp2z: [
    "Per my last email, the deadline was yesterday.",
    "Can you hop on a quick call? Nothing to worry about 🙂",
    "We're like a family here, so we expect some flexibility on weekends.",
    "Great work this quarter! Let's revisit compensation next year.",
    "Let's take this offline and circle back once we're aligned.",
  ],
  z2corp: [
    "bro prod is cooked and it's not my fault fr",
    "this meeting could've been a text no cap",
    "i'm not coming in today, my vibe is off",
    "the intern lowkey ate with that deck",
    "can i get a raise or nah 💀",
  ],
};

export const MODE_META: Record<Mode, { from: string; to: string; fromEmoji: string; toEmoji: string }> = {
  corp2z: { from: "corporate", to: "gen z", fromEmoji: "👔", toEmoji: "💀" },
  z2corp: { from: "gen z", to: "corporate", fromEmoji: "💀", toEmoji: "👔" },
};
