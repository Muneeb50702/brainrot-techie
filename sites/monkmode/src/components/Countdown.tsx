import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";

/** 3 · 2 · 1 with "hands off". Touches during the countdown don't count (you're lifting off the button). */
export function Countdown({ onDone }: { onDone: () => void }) {
  const [n, setN] = useState(3);
  useEffect(() => {
    if (n === 0) {
      const id = setTimeout(onDone, 450);
      return () => clearTimeout(id);
    }
    const id = setTimeout(() => setN(n - 1), 800);
    return () => clearTimeout(id);
  }, [n, onDone]);

  return (
    <div className="fixed inset-0 z-20 flex flex-col items-center justify-center bg-ink text-center">
      <AnimatePresence mode="popLayout">
        <motion.p
          key={n}
          initial={{ scale: 2.2, opacity: 0, filter: "blur(10px)" }}
          animate={{ scale: 1, opacity: 1, filter: "blur(0px)" }}
          exit={{ scale: 0.6, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 22 }}
          className="font-mono text-[9rem] font-black leading-none text-saffron"
        >
          {n === 0 ? "🧘" : n}
        </motion.p>
      </AnimatePresence>
      <p className="mt-6 text-3xl font-semibold italic text-paper">{n === 0 ? "go. touch nothing." : "hands OFF the screen 🙌"}</p>
      <p className="mt-3 font-mono text-xs uppercase tracking-[0.3em] text-muted">put it down on the table fr</p>
    </div>
  );
}
