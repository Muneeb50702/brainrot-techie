import { useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { NOTIFS } from "../game/content";
import type { FocusResult } from "../game/scoring";
import { dbg } from "../game/debug";

const DURATION = 20;
const GLITCHES = 4;
const WINDOW = 1.3; // seconds you get to react to a glitch
const VISIBLE = 0.7;

function spaced(n: number, from: number, to: number, gap: number) {
  for (let tries = 0; tries < 200; tries++) {
    const ts = Array.from({ length: n }, () => from + Math.random() * (to - from)).sort((a, b) => a - b);
    if (ts.every((t, i) => i === 0 || t - ts[i - 1] >= gap)) return ts;
  }
  return Array.from({ length: n }, (_, i) => from + (i * (to - from)) / n);
}

/** Vigilance: a boring loading bar. Tap only when it glitches. Notifications are bait. */
export function Focus({ onDone }: { onDone: (r: FocusResult) => void }) {
  const glitchAt = useMemo(() => spaced(GLITCHES, 2.5, DURATION - 2, 3.2), []);
  const notifAt = useMemo(() => spaced(NOTIFS.length, 1.5, DURATION - 1.5, 2.2), []);
  const [t, setT] = useState(0);
  const start = useRef(performance.now());
  const hit = useRef(new Set<number>());
  const stats = useRef({ falseAlarms: 0, notifTaps: 0 });
  const ended = useRef(false);
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let raf = 0;
    const loop = () => {
      const now = (performance.now() - start.current) / 1000;
      setT(now);
      if (now >= DURATION && !ended.current) {
        ended.current = true;
        doneRef.current({ hits: hit.current.size, glitches: GLITCHES, ...stats.current });
        return;
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, []);

  const active = glitchAt.findIndex((g) => t >= g && t < g + WINDOW);
  const showing = glitchAt.some((g) => t >= g && t < g + VISIBLE);
  const notifs = notifAt.map((at, k) => ({ at, k })).filter(({ at }) => t >= at && t < at + 2.4);

  useEffect(() => {
    dbg({ round: "focus", glitch: showing, active: active >= 0 && !hit.current.has(active) });
  }, [showing, active]);

  const tap = (e: React.PointerEvent) => {
    if (ended.current) return;
    if ((e.target as Element).closest("[data-notif]")) {
      stats.current.notifTaps++;
      stats.current.falseAlarms++;
    } else if (active >= 0 && !hit.current.has(active)) hit.current.add(active);
    else stats.current.falseAlarms++;
  };

  // the bar "loads" slowly, jumping back on each glitch
  const pct = Math.min(100, (t / DURATION) * 100 - (showing ? 9 : 0));

  return (
    <div data-focus onPointerDown={tap} className="relative flex min-h-[62vh] w-full touch-none select-none flex-col items-center justify-center gap-6">
      <div className="pointer-events-none fixed inset-x-3 top-3 z-30 flex flex-col gap-2">
        <AnimatePresence>
          {notifs.map(({ k }) => (
            <motion.div
              key={k}
              data-notif
              initial={{ y: -80, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -40, opacity: 0 }}
              className="pointer-events-auto mx-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border-2 border-ink bg-paper p-3 text-left shadow-[4px_4px_0_#141414]"
            >
              <span className="text-2xl">{NOTIFS[k].icon}</span>
              <span>
                <b className="block text-[15px]">{NOTIFS[k].title}</b>
                <span className="block text-[13.5px] text-muted">{NOTIFS[k].body}</span>
              </span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <p className="font-mono text-[13px] uppercase tracking-[0.2em] text-muted">loading attention.exe</p>
      <div className={`card h-16 w-full max-w-md overflow-hidden p-1.5 ${showing ? "[animation:shake_.35s]" : ""}`} style={showing ? { borderColor: "#d62828" } : undefined}>
        <div
          className="h-full rounded-[10px] transition-[width] duration-150"
          style={{
            width: `${Math.max(3, pct)}%`,
            background: showing ? "repeating-linear-gradient(90deg,#d62828 0 10px,#141414 10px 14px)" : "repeating-linear-gradient(45deg,#141414 0 10px,#2b2b2b 10px 20px)",
          }}
        />
      </div>
      <p className="wide text-center text-[clamp(1.4rem,6vw,2rem)] leading-tight">
        tap <span className="hl">only</span> when it glitches
      </p>
      <p className="font-mono text-sm text-muted">{Math.max(0, Math.ceil(DURATION - t))}s · ignore everything else</p>
    </div>
  );
}
