import { useEffect, useRef, useState } from "react";
import type { ReflexResult } from "../game/scoring";
import { dbg } from "../game/debug";

const TRIALS = 4;
type S = "wait" | "go" | "early" | "shown";
const median = (a: number[]) => {
  const s = [...a].sort((x, y) => x - y);
  const m = s.length >> 1;
  return s.length % 2 ? s[m] : Math.round((s[m - 1] + s[m]) / 2);
};

/** Tap the instant the panel turns green. 4 trials, median ms. Tapping early restarts the trial. */
export function Reflex({ onDone }: { onDone: (r: ReflexResult) => void }) {
  const [s, setS] = useState<S>("wait");
  const [times, setTimes] = useState<number[]>([]);
  const [last, setLast] = useState(0);
  const goAt = useRef(0);
  const timer = useRef<number | undefined>(undefined);
  const early = useRef(0);
  const done = useRef(false);

  const arm = () => {
    setS("wait");
    dbg({ round: "reflex", state: "wait" });
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      goAt.current = performance.now();
      setS("go");
      dbg({ state: "go" });
    }, 1100 + Math.random() * 1900);
  };

  useEffect(() => {
    arm();
    return () => window.clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tap = () => {
    if (done.current) return;
    if (s === "wait") {
      window.clearTimeout(timer.current);
      early.current++;
      setS("early");
      dbg({ state: "early" });
      window.setTimeout(arm, 900);
    } else if (s === "go") {
      const ms = Math.round(performance.now() - goAt.current);
      const next = [...times, ms];
      setTimes(next);
      setLast(ms);
      setS("shown");
      dbg({ state: "shown" });
      window.setTimeout(() => {
        if (next.length >= TRIALS) {
          done.current = true;
          onDone({ ms: median(next), trials: next, early: early.current });
        } else arm();
      }, 800);
    }
  };

  const look = {
    wait: { bg: "#141414", fg: "#f3ede1", big: "wait…", small: "tap the moment it turns green" },
    go: { bg: "#1f8a4c", fg: "#ffffff", big: "TAP!", small: "NOW NOW NOW" },
    early: { bg: "#d62828", fg: "#ffffff", big: "too early 💀", small: "patience is a skill. try again" },
    shown: { bg: "#ffe14d", fg: "#141414", big: `${last} ms`, small: `trial ${times.length}/${TRIALS}` },
  }[s];

  return (
    <div className="flex w-full flex-col items-center gap-4">
      <button
        type="button"
        onPointerDown={tap}
        data-reflex={s}
        aria-label="Reaction test area. Tap when it turns green."
        className="card grid h-[56vh] max-h-[460px] w-full max-w-md touch-none select-none place-items-center transition-colors duration-75"
        style={{ background: look.bg, color: look.fg }}
      >
        <span className="text-center">
          <span className="wide block text-[clamp(2.6rem,13vw,4.5rem)] leading-none">{look.big}</span>
          <span className="mt-3 block font-mono text-sm opacity-80">{look.small}</span>
        </span>
      </button>
      <div className="flex gap-2" aria-hidden>
        {Array.from({ length: TRIALS }, (_, k) => (
          <span key={k} className={`h-2.5 w-10 rounded-full border-2 border-ink ${k < times.length ? "bg-ink" : ""}`} />
        ))}
      </div>
    </div>
  );
}
