import { lazy, Suspense, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { DayBadge } from "@kit/DayBadge";
import { SourceLink } from "@kit/SourceLink";
import { BRAND } from "@kit/brand";
import { parseBirthday, validateBirthday, type BirthdayError } from "./life";
import { Hero } from "./components/Hero";
import { Boot } from "./components/Boot";
import { Dashboard } from "./components/Dashboard";

const GrainBg = lazy(() => import("@kit/GrainBg").then((m) => ({ default: m.GrainBg })));

const DAY = 2;
const BOOT_MS = 2400;
const KEY = "life-exe:bday"; // localStorage only, never sent anywhere

const ERRORS: Record<BirthdayError, string> = {
  invalid: "that's not a date bestie",
  future: "you haven't been born yet?? life.exe not found 💀",
  ancient: "over 120 years old?? bro is a vampire 🧛 enter a real date",
};

type Phase = { name: "idle"; error?: string } | { name: "boot"; birth: Date } | { name: "dash"; birth: Date };

export default function App() {
  const [saved] = useState(() => {
    try {
      return localStorage.getItem(KEY) ?? "";
    } catch {
      return "";
    }
  });
  const [phase, setPhase] = useState<Phase>({ name: "idle" });

  const run = (value: string) => {
    const birth = parseBirthday(value);
    const err = validateBirthday(birth);
    if (err || !birth) return setPhase({ name: "idle", error: ERRORS[err ?? "invalid"] });
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* private mode */
    }
    setPhase({ name: "boot", birth });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
    if (phase.name !== "boot") return;
    const id = setTimeout(() => setPhase({ name: "dash", birth: phase.birth }), BOOT_MS);
    return () => clearTimeout(id);
  }, [phase]);

  return (
    <>
      <Suspense fallback={null}>
        <GrainBg colors={["#7c5cff", "#ff3da5", "#3de8ff"]} shape="ripple" dim={0.7} />
      </Suspense>
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-5">
          <button onClick={() => setPhase({ name: "idle" })} className="flex items-center gap-2.5 font-mono text-[15px] font-extrabold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-lime text-[15px] shadow-[3px_3px_0_#000]">💻</span>
            life.exe
          </button>
          <DayBadge day={DAY} />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-8">
          <AnimatePresence mode="wait">
            {phase.name === "idle" && <Hero key="hero" initial={saved} onRun={run} error={phase.error} />}
            {phase.name === "boot" && <Boot key="boot" />}
            {phase.name === "dash" && <Dashboard key="dash" birth={phase.birth} day={DAY} onReset={() => setPhase({ name: "idle" })} />}
          </AnimatePresence>
        </main>

        <footer className="pb-8 pt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          <SourceLink slug="life-exe" className="mb-4" />
          <p>runs 100% on your device · nothing is stored on a server · there is no server</p>
          <p className="mt-1">
            day {DAY} of {BRAND.series} ·{" "}
            <a href={`https://${BRAND.domain}`} className="text-white/70 underline-offset-4 hover:text-lime hover:underline">
              {BRAND.domain}
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
