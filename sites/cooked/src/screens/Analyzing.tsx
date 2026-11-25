import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Scramble } from "@kit/Scramble";

const LINES = ["scanning neurons…", "measuring brainrot levels…", "counting skibidi damage…", "consulting the doctor…"];

/** 2.4 s of fake-but-fun "brain scan": an outlined brain with a sweeping scan line. */
export function Analyzing() {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => Math.min(LINES.length - 1, n + 1)), 600);
    return () => clearInterval(id);
  }, []);
  return (
    <motion.section key="analyzing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-6">
      <div className="card relative grid size-56 place-items-center overflow-hidden">
        <svg viewBox="0 0 120 100" className="w-40" fill="none" stroke="#141414" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <path d="M58 14c-8-8-24-6-28 4-10-2-18 8-14 18-8 4-8 18 2 22-2 10 8 18 18 14 4 10 18 10 22 2V14z" />
          <path d="M62 14c8-8 24-6 28 4 10-2 18 8 14 18 8 4 8 18-2 22 2 10-8 18-18 14-4 10-18 10-22 2V14z" />
          <path d="M30 34c6 0 10 4 10 10M24 58c6-2 12 0 14 6M90 34c-6 0-10 4-10 10M96 58c-6-2-12 0-14 6M60 30v50" />
        </svg>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1/3 bg-gradient-to-b from-transparent via-hl/70 to-transparent" style={{ animation: "scan 1.1s linear infinite" }} />
      </div>
      <Scramble key={i} text={LINES[i]} duration={420} className="font-mono text-sm" />
    </motion.section>
  );
}
