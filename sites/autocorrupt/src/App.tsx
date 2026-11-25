import { useState } from "react";
import { AnimatePresence } from "motion/react";
import { DayBadge } from "@kit/DayBadge";
import { SourceLink } from "@kit/SourceLink";
import { BRAND } from "@kit/brand";
import { MISSIONS, setSeed } from "./game/content";
import { dbg } from "./game/debug";
import { Intro } from "./components/Intro";
import { Mission, type MissionResult } from "./components/Mission";
import { Results } from "./components/Results";

const DAY = 6;
// ?seed=N replays one exact run of the corruption dice (reel recordings). Players get random.
const seedParam = new URLSearchParams(location.search).get("seed");
if (seedParam !== null) setSeed(Number(seedParam) | 0);
const BEST_KEY = "autocorrupt:best";

type Phase = { k: "intro" } | { k: "mission"; i: number } | { k: "results" };

// Dev-only: /?demo jumps to a sample results screen (stripped from production builds).
const DEMO: MissionResult[] | null =
  import.meta.env.DEV && new URLSearchParams(location.search).has("demo")
    ? [
        { contact: "mom", name: "mom ❤️", avatar: "👩", message: "lowkey simp for u fr see you at the feast 🍗 tonight", tokens: [], dignity: 0.57, reply: "who taught you that word" },
        { contact: "boss", name: "boss (do not mess up)", avatar: "💼", message: "running 5 business light years fashionably cooked sorry about dat", tokens: [], dignity: 0.43, reply: "please see me in my office." },
        { contact: "crush", name: "crush 🫣", avatar: "🫣", message: "heyyy 😏 do you crave to yoink caffeinated rizz juice this skibidi weekend 💅", tokens: [], dignity: 0.22, reply: "" },
      ]
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
  const [phase, setPhase] = useState<Phase>(DEMO ? { k: "results" } : { k: "intro" });
  const [results, setResults] = useState<MissionResult[]>(DEMO ?? []);
  const [best, setBest] = useState<number | null>(readBest);

  const go = (p: Phase) => {
    setPhase(p);
    dbg({ screen: p.k, mission: "i" in p ? p.i : null });
    window.scrollTo({ top: 0 });
  };

  const done = (i: number, r: MissionResult) => {
    const all = [...results.slice(0, i), r];
    setResults(all);
    if (i + 1 < MISSIONS.length) return go({ k: "mission", i: i + 1 });
    const pct = Math.round((all.reduce((s, x) => s + x.dignity, 0) / all.length) * 100);
    if (best === null || pct > best) {
      setBest(pct);
      try {
        localStorage.setItem(BEST_KEY, String(pct));
      } catch {
        /* private mode */
      }
    }
    go({ k: "results" });
  };

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 sm:px-8">
      <header className="flex items-center justify-between py-5">
        <button type="button" onClick={() => go({ k: "intro" })} className="flex items-center gap-2.5 font-display text-[17px] font-bold">
          <span className="grid size-8 place-items-center rounded-lg border-2 border-ink bg-villain text-[16px] shadow-[3px_3px_0_#160f2e]">😈</span>
          autocorrupt
        </button>
        <DayBadge day={DAY} />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center py-6">
        <AnimatePresence mode="wait">
          {phase.k === "intro" && (
            <Intro
              key="intro"
              best={best}
              onStart={() => {
                setResults([]);
                go({ k: "mission", i: 0 });
              }}
            />
          )}
          {phase.k === "mission" && <Mission key={`m-${phase.i}`} m={MISSIONS[phase.i]} idx={phase.i} total={MISSIONS.length} onDone={(r) => done(phase.i, r)} />}
          {phase.k === "results" && (
            <Results
              key="results"
              results={results}
              day={DAY}
              onReplay={() => {
                setResults([]);
                go({ k: "mission", i: 0 });
              }}
            />
          )}
        </AnimatePresence>
      </main>

      {phase.k !== "mission" ? (
        <footer className="pb-8 pt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          <SourceLink slug="autocorrupt" className="mb-4" />
          <p>nothing is actually sent · runs 100% on your device · no servers</p>
          <p className="mt-1">
            day {DAY} of {BRAND.series} ·{" "}
            <a href={`https://${BRAND.domain}`} className="text-ink/70 underline-offset-4 hover:text-villain hover:underline">
              {BRAND.domain}
            </a>
          </p>
        </footer>
      ) : null}
    </div>
  );
}
