import { corruptWord, roll, type Mission } from "./content";

export type Token = { id: number; text: string; orig: string; cursed: boolean };

let nextId = 1;
const norm = (w: string) => w.toLowerCase().replace(/[^a-z0-9]/g, "");

/** Commit one finished word: maybe the rogue autocorrect gets it. */
export function commitWord(word: string, m: Mission, rnd: () => number = roll): Token {
  const cursed = word.length >= 2 && rnd() < m.chance;
  return { id: nextId++, orig: word, text: cursed ? corruptWord(word, m.extras, rnd) : word, cursed };
}

export const fixToken = (t: Token): Token => ({ ...t, text: t.orig, cursed: false });
export const recurse = (t: Token, m: Mission): Token => ({ ...t, text: corruptWord(t.orig, m.extras), cursed: true });

/** The text that actually gets sent. */
export const messageOf = (tokens: Token[], partial: string) => [...tokens.map((t) => t.text), partial.trim()].filter(Boolean).join(" ");

/** Dignity = share of the intended words that arrived intact, in order. */
export function dignityOf(tokens: Token[], partial: string, target: string): number {
  const want = target.split(" ");
  const got = [...tokens, ...(partial.trim() ? [{ id: 0, text: partial.trim(), orig: partial.trim(), cursed: false }] : [])];
  let ok = 0;
  want.forEach((w, i) => {
    const t = got[i];
    if (t && !t.cursed && norm(t.text) === norm(w)) ok++;
  });
  return ok / want.length;
}

/** Which target word you're on (for the guide strip). */
export const progressOf = (tokens: Token[]) => tokens.length;
