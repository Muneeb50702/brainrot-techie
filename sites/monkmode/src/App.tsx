import { lazy, Suspense, useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { DayBadge } from "@kit/DayBadge";
import { SourceLink } from "@kit/SourceLink";
import { BRAND } from "@kit/brand";
import { initAudio } from "./game/audio";
import { Menu } from "./components/Menu";
import { Countdown } from "./components/Countdown";
import { Arena, type RunResult } from "./components/Arena";
import { Over } from "./components/Over";

const GrainBg = lazy(() => import("@kit/GrainBg").then((m) => ({ default: m.GrainBg })));

const DAY = 3;
// Demo-only: ?speed=2.5 fast-forwards the game clock for reel recordings.
const SPEED = Math.min(4, Math.max(1, Number(new URLSearchParams(location.search).get("speed")) || 1));
// Demo-only: ?seed=42 replays the same trap plan (reel recordings). Normal runs are random.
const SEED = new URLSearchParams(location.search).has("seed") ? Number(new URLSearchParams(location.search).get("seed")) | 0 : undefined;
const BEST_KEY = "monkmode:best";

type Phase = "menu" | "countdown" | "play" | "over";

const readBest = () => {
  try {
    const v = Number(localStorage.getItem(BEST_KEY));
    return v > 0 ? v : null;
  } catch {
    return null;
  }
};

export default function App() {
  const [phase, setPhase] = useState<Phase>("menu");
  const [sound, setSound] = useState(true);
  const [best, setBest] = useState<number | null>(readBest);
  const [result, setResult] = useState<{ r: RunResult; newBest: boolean } | null>(null);

  const start = () => {
    initAudio(sound); // inside the tap, so browsers allow audio
    setPhase("countdown");
  };

  const onEnd = useCallback(
    (r: RunResult) => {
      const newBest = best === null || r.seconds > best;
      if (newBest) {
        setBest(r.seconds);
        try {
          localStorage.setItem(BEST_KEY, String(r.seconds));
        } catch {
          /* private mode */
        }
      }
      setResult({ r, newBest });
      setPhase("over");
    },
    [best],
  );

  const calm = phase === "menu" || phase === "over";

  return (
    <>
      {calm ? (
        <Suspense fallback={null}>
          <GrainBg colors={["#ff8f2a", "#b3470f", "#34e0b0"]} colorBack="#0c0705" shape="sphere" dim={0.62} />
        </Suspense>
      ) : null}

      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-5">
          <button onClick={() => setPhase("menu")} className="flex items-center gap-2.5 font-mono text-[15px] font-extrabold tracking-tight text-paper">
            <span className="grid size-8 place-items-center rounded-lg bg-saffron text-[15px] shadow-[3px_3px_0_#000]">🧘</span>
            monkmode
          </button>
          <DayBadge day={DAY} />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            {phase === "menu" && <Menu key="menu" best={best} sound={sound} setSound={setSound} onStart={start} />}
            {phase === "over" && result && <Over key="over" r={result.r} best={best ?? result.r.seconds} newBest={result.newBest} onRetry={start} day={DAY} />}
          </AnimatePresence>
        </main>

        <footer className="pb-8 pt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          <SourceLink slug="monkmode" className="mb-4" />
          <p>works best on your phone · runs 100% on your device · no servers</p>
          <p className="mt-1">
            day {DAY} of {BRAND.series} ·{" "}
            <a href={`https://${BRAND.domain}`} className="text-paper/70 underline-offset-4 hover:text-saffron hover:underline">
              {BRAND.domain}
            </a>
          </p>
        </footer>
      </div>

      {phase === "countdown" && <Countdown onDone={() => setPhase("play")} />}
      {phase === "play" && <Arena onEnd={onEnd} speed={SPEED} seed={SEED} />}
    </>
  );
}
