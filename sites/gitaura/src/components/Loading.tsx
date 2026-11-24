import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { BorderBeamPanel } from "@kit/BorderBeamPanel";
import { Scramble } from "@kit/Scramble";

const STEPS = [
  "fetching profile",
  "counting stars ⭐",
  "reading commit messages (pain)",
  "checking 3am activity 🦇",
  "detecting tutorial hell",
  "calculating aura",
];

export function Loading({ username, stepMs = 420 }: { username: string; stepMs?: number }) {
  const [shown, setShown] = useState(1);
  useEffect(() => {
    const id = setInterval(() => setShown((s) => Math.min(STEPS.length, s + 1)), stepMs);
    return () => clearInterval(id);
  }, [stepMs]);

  return (
    <motion.section
      key="loading"
      initial={{ opacity: 0, scale: 0.96, filter: "blur(8px)" }}
      animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 1.03, filter: "blur(10px)" }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-lg"
      aria-live="polite"
    >
      <BorderBeamPanel idleSpeed={220} radius={22} className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="size-3 rounded-full bg-pink" />
          <span className="size-3 rounded-full bg-[#ffd23d]" />
          <span className="size-3 rounded-full bg-lime" />
          <span className="ml-2 truncate font-mono text-xs text-muted">~/gitaura — scanning @{username}</span>
        </div>
        <ul className="space-y-2.5 px-5 py-5 text-left font-mono text-[13px] sm:text-sm">
          {STEPS.slice(0, shown).map((s, i) => {
            const done = i < shown - 1;
            return (
              <motion.li
                key={s}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                className="flex items-center gap-2"
              >
                <span className="text-lime">›</span>
                <Scramble text={s} duration={380} className={done ? "text-white/55" : "text-white"} />
                <span className="ml-auto">
                  {done ? (
                    <span className="text-lime">✓</span>
                  ) : (
                    <span className="inline-block h-4 w-2 animate-pulse bg-lime align-middle" />
                  )}
                </span>
              </motion.li>
            );
          })}
        </ul>
        <div className="h-1 w-full bg-line">
          <motion.div
            className="h-full bg-gradient-to-r from-lime via-cyan to-pink"
            initial={{ width: "4%" }}
            animate={{ width: `${(shown / STEPS.length) * 100}%` }}
            transition={{ ease: "easeOut", duration: 0.4 }}
          />
        </div>
      </BorderBeamPanel>
    </motion.section>
  );
}
