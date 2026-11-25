import { AnimatePresence, motion } from "motion/react";

/** autocorrupt.exe: a glitchy pixel villain who comments on every "fix". */
export function Villain({ line, k }: { line: string; k: number }) {
  return (
    <div className="pointer-events-none flex items-end gap-2" aria-live="polite">
      <motion.span
        key={k}
        initial={{ rotate: -12, scale: 0.8 }}
        animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 14 }}
        className="glitch-in grid size-11 shrink-0 place-items-center rounded-lg border-2 border-ink bg-villain text-2xl shadow-[3px_3px_0_#160f2e]"
      >
        😈
      </motion.span>
      <AnimatePresence mode="wait">
        {line ? (
          <motion.span
            key={k}
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0 }}
            className="rounded-xl rounded-bl-sm border-2 border-ink bg-paper px-3 py-1.5 font-display text-[15px] font-semibold"
          >
            {line}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
