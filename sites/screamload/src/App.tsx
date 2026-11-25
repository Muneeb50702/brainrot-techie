import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { DayBadge } from "@kit/DayBadge";
import { SourceLink } from "@kit/SourceLink";
import { BRAND } from "@kit/brand";
import { openMic, type Mic } from "./game/mic";
import { Intro } from "./components/Intro";
import { Download, type Stats } from "./components/Download";
import { Done } from "./components/Done";

const DAY = 7;
const BEST_KEY = "screamload:best";

type Phase = { k: "intro" } | { k: "download"; mode: "mic" | "tap" } | { k: "done"; stats: Stats };

// Dev-only: /?demo jumps to a sample result (stripped from production builds).
const DEMO: Stats | null =
  import.meta.env.DEV && new URLSearchParams(location.search).has("demo")
    ? { seconds: 11.3, peak: 98.4, avgLoud: 91.2, loudSeconds: 10.6, mode: "mic", taps: 0 }
    : null;

const readBest = () => {
  try {
    const v = localStorage.getItem(BEST_KEY);
    return v === null ? null : Number(v);
  } catch {
    return null;
  }
};

export default function App() {
  const [phase, setPhase] = useState<Phase>(DEMO ? { k: "done", stats: DEMO } : { k: "intro" });
  const [mic, setMic] = useState<Mic | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [best, setBest] = useState<number | null>(readBest);

  const startMic = async () => {
    setError(null);
    try {
      const m = mic ?? (await openMic());
      setMic(m);
      setPhase({ k: "download", mode: "mic" });
    } catch {
      setError("no mic = no download. allow the microphone (or use tap mode below).");
    }
  };

  const finish = (stats: Stats) => {
    if (stats.mode === "mic" && (best === null || stats.seconds < best)) {
      setBest(stats.seconds);
      try {
        localStorage.setItem(BEST_KEY, String(stats.seconds));
      } catch {
        /* private mode */
      }
    }
    setPhase({ k: "done", stats });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 sm:px-8">
      <header className="relative z-20 flex items-center justify-between py-5">
        <button type="button" onClick={() => setPhase({ k: "intro" })} className="flex items-center gap-2 font-display text-xl uppercase tracking-wide">
          <span className="grid size-8 place-items-center rounded-lg border-2 border-hazard bg-ink text-base">📢</span>
          screamload
        </button>
        <DayBadge day={DAY} />
      </header>

      <main className="relative z-10 flex flex-1 flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {phase.k === "intro" && <Intro key="intro" onMic={startMic} onTap={() => setPhase({ k: "download", mode: "tap" })} error={error} best={best} />}
          {phase.k === "download" && <Download key={`dl-${phase.mode}`} mic={mic} mode={phase.mode} onDone={finish} />}
          {phase.k === "done" && <Done key="done" stats={phase.stats} best={best} day={DAY} onAgain={() => setPhase({ k: "intro" })} />}
        </AnimatePresence>
      </main>

      {phase.k !== "download" ? (
        <footer className="relative z-10 pb-8 pt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          <SourceLink slug="screamload" className="mb-4" />
          <p>mic audio never leaves your device · nothing recorded · no servers</p>
          <p className="mt-1">
            day {DAY} of {BRAND.series} ·{" "}
            <a href={`https://${BRAND.domain}`} className="text-paper/70 underline-offset-4 hover:text-hazard hover:underline">
              {BRAND.domain}
            </a>
          </p>
        </footer>
      ) : null}
    </div>
  );
}
