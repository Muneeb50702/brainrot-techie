import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Scramble } from "@kit/Scramble";
import { Window } from "./Window";

const STEPS = ["mounting childhood.dll", "loading core memories", "installing anxiety v2.0", "syncing with the sun ☀️", "starting life.exe"];

export function Boot({ stepMs = 430 }: { stepMs?: number }) {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setShown((s) => Math.min(STEPS.length, s + 1)), stepMs);
    return () => clearInterval(id);
  }, [stepMs]);

  return (
    <motion.div
      key="boot"
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(10px)" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-md"
      aria-live="polite"
    >
      <Window title="~/life.exe — booting">
        <ul className="space-y-2.5 font-mono text-[13px] sm:text-sm">
          {STEPS.slice(0, shown).map((s, i) => (
            <motion.li key={s} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="flex items-center gap-2">
              <span className="text-lime">›</span>
              <Scramble text={s} duration={380} className={i < shown - 1 ? "text-white/55" : "text-white"} />
              <span className="ml-auto">{i < shown - 1 ? <span className="text-lime">✓</span> : <span className="inline-block h-4 w-2 animate-pulse bg-lime align-middle" />}</span>
            </motion.li>
          ))}
        </ul>
        <div className="mt-4 h-1 w-full overflow-hidden rounded-full bg-line">
          <motion.div className="h-full bg-gradient-to-r from-cyan via-lime to-pink" initial={{ width: "5%" }} animate={{ width: `${(shown / STEPS.length) * 100}%` }} transition={{ duration: 0.4 }} />
        </div>
      </Window>
    </motion.div>
  );
}
