import type { ReactNode } from "react";
import { motion } from "motion/react";

export const ROUNDS = [
  { id: "reflex", n: "01", title: "reflex", emoji: "⚡", how: "the box turns green at a random moment. tap it as fast as you can. 4 tries.", why: "measures reaction time · average human ≈ 250 ms" },
  { id: "memory", n: "02", title: "memory", emoji: "🧠", how: "tiles light up in order. tap them back in the same order. it gets longer every round.", why: "measures short-term memory · average span ≈ 6–7" },
  { id: "stroop", n: "03", title: "brain glitch", emoji: "🎨", how: "tap the COLOUR the word is printed in. not what it says. your brain will fight you.", why: "the stroop test · measures impulse control" },
  { id: "focus", n: "04", title: "focus", emoji: "🫠", how: "a loading bar. tap ONLY when it glitches red. notifications will try to distract you.", why: "measures sustained attention · 20 seconds" },
] as const;

export function Progress({ at }: { at: number }) {
  return (
    <div className="flex items-center gap-1.5" aria-label={`test ${at + 1} of 4`}>
      {ROUNDS.map((r, i) => (
        <span key={r.id} className={`h-2 rounded-full border-2 border-ink transition-all ${i < at ? "w-6 bg-ink" : i === at ? "w-10 bg-hl" : "w-6"}`} />
      ))}
    </div>
  );
}

export function Intro({ at, onGo }: { at: number; onGo: () => void }) {
  const r = ROUNDS[at];
  return (
    <motion.section
      key={`intro-${at}`}
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center text-center"
    >
      <Progress at={at} />
      <p className="mt-8 font-mono text-xs uppercase tracking-[0.3em] text-muted">test {r.n} / 04</p>
      <p className="mt-2 text-6xl">{r.emoji}</p>
      <h2 className="wide mt-3 text-[clamp(2.4rem,11vw,4.2rem)] uppercase leading-none">{r.title}</h2>
      <p className="mt-5 max-w-[32ch] text-[16px] leading-relaxed">{r.how}</p>
      <p className="mt-3 font-mono text-[12px] text-muted">{r.why}</p>
      <button onClick={onGo} data-go className="btn-chunky mt-8 h-14 w-full max-w-xs bg-ink px-6 text-[17px] text-cream">
        i'm ready ▶
      </button>
    </motion.section>
  );
}

export function Playing({ at, children }: { at: number; children: ReactNode }) {
  return (
    <motion.section key={`play-${at}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex w-full flex-col items-center gap-6">
      <Progress at={at} />
      {children}
    </motion.section>
  );
}

/** Instant verdict between tests: the value + a comparison, for 1.6 s. */
export function Verdict({ at, value, line, cooked }: { at: number; value: string; line: string; cooked: number }) {
  const r = ROUNDS[at];
  return (
    <motion.section
      key={`verdict-${at}`}
      initial={{ opacity: 0, scale: 0.94 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 1.04 }}
      transition={{ duration: 0.3 }}
      className="flex w-full flex-col items-center text-center"
    >
      <Progress at={at + 1} />
      <p className="mt-10 font-mono text-xs uppercase tracking-[0.3em] text-muted">
        {r.emoji} {r.title} result
      </p>
      <p className="wide mt-3 text-[clamp(3rem,15vw,5.5rem)] leading-none">{value}</p>
      <p className="mt-3 text-lg">
        = <span className="hl font-semibold">{line}</span>
      </p>
      <p className="mt-6 font-mono text-sm text-muted">this part of your brain: {Math.round(cooked * 100)}% cooked</p>
    </motion.section>
  );
}
