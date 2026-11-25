import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { COLORS, makeStroop } from "../game/content";
import type { StroopResult } from "../game/scoring";
import { dbg } from "../game/debug";

const N = 12;

/** Stroop: tap the INK colour, not what the word says. */
export function Stroop({ onDone }: { onDone: (r: StroopResult) => void }) {
  const trials = useMemo(() => makeStroop(N), []);
  const [i, setI] = useState(0);
  const [flash, setFlash] = useState<null | boolean>(null);
  const shownAt = useRef(performance.now());
  const stats = useRef({ correct: 0, rts: [] as number[], readTheWord: 0 });
  const busy = useRef(false);
  const t = trials[i];

  useEffect(() => {
    shownAt.current = performance.now();
    busy.current = false;
    if (t) dbg({ round: "stroop", i, word: t.word, ink: t.ink });
  }, [i, t]);

  const answer = (c: number) => {
    if (busy.current || !t) return;
    busy.current = true;
    const rt = performance.now() - shownAt.current;
    const ok = c === t.ink;
    if (ok) stats.current.correct++;
    else if (t.isColourWord && COLORS[c].name.toUpperCase() === t.word) stats.current.readTheWord++;
    stats.current.rts.push(rt);
    setFlash(ok);
    window.setTimeout(() => {
      setFlash(null);
      if (i + 1 >= N) {
        const s = stats.current;
        onDone({ acc: s.correct / N, rt: Math.round(s.rts.reduce((a, b) => a + b, 0) / s.rts.length), readTheWord: s.readTheWord, total: N });
      } else setI(i + 1);
    }, 260);
  };

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <p className="font-mono text-sm">
        {i + 1}/{N} · tap the <b className="hl">colour</b>, not the word
      </p>
      <div className="card relative grid h-[30vh] max-h-[240px] w-full max-w-md place-items-center overflow-hidden">
        <AnimatePresence mode="popLayout">
          <motion.span
            key={i}
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 1.15, opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="wide text-[clamp(2.4rem,13vw,4.4rem)] leading-none"
            style={{ color: t ? COLORS[t.ink].hex : undefined }}
          >
            {t?.word}
          </motion.span>
        </AnimatePresence>
        {flash !== null ? (
          <span className={`absolute right-3 top-2 font-mono text-2xl font-bold ${flash ? "text-sage" : "text-stamp"}`}>{flash ? "✓" : "✗"}</span>
        ) : null}
      </div>
      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {COLORS.map((c, k) => (
          <button
            key={c.name}
            type="button"
            data-colour={k}
            onPointerDown={() => answer(k)}
            className="btn-chunky h-16 touch-none select-none bg-paper text-[17px] text-ink"
          >
            <span className="size-5 rounded-full border-2 border-ink" style={{ background: c.hex }} />
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
