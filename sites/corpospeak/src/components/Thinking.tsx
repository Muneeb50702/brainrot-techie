import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { Scramble } from "@kit/Scramble";
import type { Mode } from "../types";

const LINES: Record<Mode, string[]> = {
  corp2z: ["decoding corporate…", "removing the professionalism…", "consulting the group chat…", "calculating red flags 🚩"],
  z2corp: ["adding synergy…", "consulting HR…", "removing all personality…", "scheduling a follow-up…"],
};

/** Typing bubble + rotating scramble status while the model works. */
export function Thinking({ mode }: { mode: Mode }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % LINES[mode].length), 1100);
    return () => clearInterval(id);
  }, [mode]);

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="flex flex-col items-center gap-4 py-6" aria-live="polite">
      <div className="flex gap-1.5 rounded-3xl rounded-bl-md bg-white/10 px-5 py-4">
        {[0, 1, 2].map((d) => (
          <motion.span
            key={d}
            className="size-2.5 rounded-full bg-lime"
            animate={{ y: [0, -6, 0], opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 0.9, repeat: Infinity, delay: d * 0.15 }}
          />
        ))}
      </div>
      <Scramble key={i} text={LINES[mode][i]} duration={450} className="font-mono text-sm text-white/70" />
    </motion.div>
  );
}
