import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { TILES } from "../game/content";
import type { MemoryResult } from "../game/scoring";
import { dbg } from "../game/debug";

const START = 3;
const MAX = 10;
type Phase = "show" | "input" | "right" | "wrong";

function makeSeq(n: number) {
  const out: number[] = [];
  while (out.length < n) {
    const k = Math.floor(Math.random() * TILES.length);
    if (k !== out[out.length - 1]) out.push(k); // no immediate repeats
  }
  return out;
}

/** Spatial span: watch tiles light up, tap them back in order. +1 each round, one life. */
export function Memory({ onDone }: { onDone: (r: MemoryResult) => void }) {
  const [level, setLevel] = useState(START);
  const [seq, setSeq] = useState(() => makeSeq(START));
  const [phase, setPhase] = useState<Phase>("show");
  const [lit, setLit] = useState<number | null>(null);
  const [pos, setPos] = useState(0);
  const [bad, setBad] = useState<number | null>(null);
  const timers = useRef<number[]>([]);

  // play the sequence
  useEffect(() => {
    if (phase !== "show") return;
    dbg({ round: "memory", mphase: "show", seq, level });
    const ts: number[] = [];
    seq.forEach((k, i) => {
      ts.push(window.setTimeout(() => setLit(k), 450 + i * 680));
      ts.push(window.setTimeout(() => setLit(null), 450 + i * 680 + 480));
    });
    ts.push(
      window.setTimeout(() => {
        setPhase("input");
        setPos(0);
        dbg({ mphase: "input" });
      }, 450 + seq.length * 680),
    );
    timers.current = ts;
    return () => ts.forEach(clearTimeout);
  }, [phase, seq, level]);

  const tap = (k: number) => {
    if (phase !== "input") return;
    if (k !== seq[pos]) {
      setBad(k);
      setPhase("wrong");
      dbg({ mphase: "wrong" });
      window.setTimeout(() => onDone({ span: level - 1 }), 1100);
      return;
    }
    setLit(k);
    window.setTimeout(() => setLit(null), 160);
    if (pos + 1 === seq.length) {
      setPhase("right");
      dbg({ mphase: "right" });
      window.setTimeout(() => {
        if (level >= MAX) return onDone({ span: MAX });
        const n = level + 1;
        setLevel(n);
        setSeq(makeSeq(n));
        setPhase("show");
      }, 700);
    } else setPos(pos + 1);
  };

  const status = phase === "show" ? "watch closely 👀" : phase === "input" ? `your turn · ${pos}/${seq.length}` : phase === "right" ? "correct ✓" : "wrong tile 💀";

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <div className="flex items-baseline gap-3 font-mono text-sm">
        <span className="rounded-md bg-ink px-2 py-0.5 font-bold text-cream">level {level}</span>
        <span className={phase === "wrong" ? "font-bold text-stamp" : phase === "right" ? "font-bold text-sage" : ""}>{status}</span>
      </div>
      <div className={`grid w-full max-w-[340px] grid-cols-3 gap-3 ${phase === "wrong" ? "[animation:shake_.4s]" : ""}`}>
        {TILES.map((e, k) => {
          const on = lit === k;
          const wrong = bad === k && phase === "wrong";
          return (
            <motion.button
              key={k}
              type="button"
              data-tile={k}
              onPointerDown={() => tap(k)}
              animate={{ scale: on ? 1.08 : 1, y: on ? -3 : 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 22 }}
              disabled={phase !== "input"}
              className="card grid aspect-square touch-none select-none place-items-center text-[clamp(2rem,10vw,2.8rem)] disabled:cursor-default"
              style={{ background: wrong ? "#d62828" : on ? "#ffe14d" : undefined, boxShadow: on ? "2px 2px 0 0 #141414" : undefined }}
            >
              {e}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
}
