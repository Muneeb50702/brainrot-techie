import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { DayBadge } from "@kit/DayBadge";
import { SourceLink } from "@kit/SourceLink";
import { BRAND } from "@kit/brand";
import {
  focusCooked, focusLine, memoryCooked, memoryLine, reflexCooked, reflexLine, stroopCooked, stroopLine, totalCooked,
  type FocusResult, type MemoryResult, type ReflexResult, type Results, type StroopResult,
} from "./game/scoring";
import { Intake } from "./screens/Intake";
import { Intro, Playing, Verdict } from "./screens/Shell";
import { Analyzing } from "./screens/Analyzing";
import { Report } from "./screens/Report";
import { Reflex } from "./tests/Reflex";
import { Memory } from "./tests/Memory";
import { Stroop } from "./tests/Stroop";
import { Focus } from "./tests/Focus";
import { dbg } from "./game/debug";

const DAY = 5;
const LAST_KEY = "cooked:last";

type Phase =
  | { k: "intake" }
  | { k: "intro"; at: number }
  | { k: "play"; at: number }
  | { k: "verdict"; at: number; value: string; line: string; cooked: number }
  | { k: "analyzing" }
  | { k: "report" };

const readLast = () => {
  try {
    const v = localStorage.getItem(LAST_KEY);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
};

// Dev-only: /?demo jumps straight to a sample report (stripped from production builds).
const DEMO: Results | null =
  import.meta.env.DEV && new URLSearchParams(location.search).has("demo")
    ? {
        reflex: { ms: 354, trials: [340, 368, 351, 357], early: 0 },
        memory: { span: 5 },
        stroop: { acc: 10 / 12, rt: 820, readTheWord: 2, total: 12 },
        focus: { hits: 3, glitches: 4, falseAlarms: 1, notifTaps: 1 },
      }
    : null;

export default function App() {
  const [phase, setPhase] = useState<Phase>(DEMO ? { k: "report" } : { k: "intake" });
  const [res, setRes] = useState<Results>(DEMO ?? {});
  const [last, setLast] = useState<number | null>(readLast);

  const go = (p: Phase) => {
    setPhase(p);
    dbg({ phase: p.k, at: "at" in p ? p.at : null });
    window.scrollTo({ top: 0 });
  };

  const finishRound = useCallback((at: number, patch: Results, value: string, line: string, cooked: number) => {
    setRes((r) => {
      const next = { ...r, ...patch };
      if (at === 3) {
        const pct = totalCooked(next);
        try {
          localStorage.setItem(LAST_KEY, String(pct));
        } catch {
          /* private mode */
        }
        setLast(pct);
      }
      return next;
    });
    go({ k: "verdict", at, value, line, cooked });
    window.setTimeout(() => {
      if (at < 3) go({ k: "intro", at: at + 1 });
      else {
        go({ k: "analyzing" });
        window.setTimeout(() => go({ k: "report" }), 2400);
      }
    }, 1700);
  }, []);

  const start = () => {
    setRes({});
    go({ k: "intro", at: 0 });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between py-5">
        <button onClick={() => go({ k: "intake" })} className="flex items-center gap-2.5 font-mono text-[15px] font-bold tracking-tight">
          <span className="grid size-8 place-items-center rounded-lg border-2 border-ink bg-stamp text-[15px] shadow-[3px_3px_0_#141414]">🧠</span>
          cooked
        </button>
        <DayBadge day={DAY} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {phase.k === "intake" && <Intake key="intake" onStart={start} best={last} />}
          {phase.k === "intro" && <Intro key={`intro-${phase.at}`} at={phase.at} onGo={() => go({ k: "play", at: phase.at })} />}
          {phase.k === "play" && (
            <Playing key={`play-${phase.at}`} at={phase.at}>
              {phase.at === 0 && <Reflex onDone={(r: ReflexResult) => finishRound(0, { reflex: r }, `${r.ms} ms`, reflexLine(r.ms), reflexCooked(r))} />}
              {phase.at === 1 && <Memory onDone={(r: MemoryResult) => finishRound(1, { memory: r }, `span ${r.span}`, memoryLine(r.span), memoryCooked(r))} />}
              {phase.at === 2 && (
                <Stroop onDone={(r: StroopResult) => finishRound(2, { stroop: r }, `${Math.round(r.acc * 100)}%`, stroopLine(r), stroopCooked(r))} />
              )}
              {phase.at === 3 && (
                <Focus onDone={(r: FocusResult) => finishRound(3, { focus: r }, `${r.hits}/${r.glitches}`, focusLine(r), focusCooked(r))} />
              )}
            </Playing>
          )}
          {phase.k === "verdict" && <Verdict key={`verdict-${phase.at}`} at={phase.at} value={phase.value} line={phase.line} cooked={phase.cooked} />}
          {phase.k === "analyzing" && <Analyzing key="analyzing" />}
          {phase.k === "report" && <Report key="report" res={res} day={DAY} onRetake={start} />}
        </AnimatePresence>
      </main>

      {phase.k === "intake" || phase.k === "report" ? (
        <footer className="pb-8 pt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          <SourceLink slug="cooked" className="mb-4" />
          <p>runs 100% on your device · no servers · not medical advice (obviously)</p>
          <p className="mt-1">
            day {DAY} of {BRAND.series} ·{" "}
            <a href={`https://${BRAND.domain}`} className="text-ink/70 underline-offset-4 hover:text-stamp hover:underline">
              {BRAND.domain}
            </a>
          </p>
        </footer>
      ) : null}
    </div>
  );
}
