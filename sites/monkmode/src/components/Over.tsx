import { useRef, useState } from "react";
import { motion } from "motion/react";
import { copyText, nodeToPng, shareImage } from "@kit/share";
import { isTrapLabel, rankFor } from "../game/content";
import type { RunResult } from "./Arena";
import { ShareCard } from "./ShareCard";

export function Over({ r, best, newBest, onRetry, day }: { r: RunResult; best: number; newBest: boolean; onRetry: () => void; day: number }) {
  const base = rankFor(r.seconds, r.outcome);
  // Lost to a scripted fake? Your reflexes snitched, so the roast says so.
  const rank = isTrapLabel(r.by) ? { ...base, roast: "that was FAKE. your reflexes snitched on you 💀" } : base;
  const cardRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const won = r.outcome === "win";
  const text = won
    ? `i didn't touch my phone for 75 seconds. ascended 🌌 can you? ${location.origin}`
    : `i lasted ${r.seconds.toFixed(2)}s in monk mode 🧘 got cooked by ${r.by}. can you beat it? ${location.origin}`;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };
  const share = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await nodeToPng(cardRef.current, 1080, 1920);
      const res = await shareImage(blob, "monkmode.png", text);
      if (res === "downloaded") flash("saved 📲 post it on ur story");
    } catch {
      flash("the monk dropped the camera. try again");
    }
  };

  return (
    <motion.section
      key="over"
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center text-center"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">{won ? "run complete" : r.outcome === "trap" ? "it was a trap" : "you touched it"}</p>
      <h2 className="mt-3 text-[clamp(2.6rem,11vw,5rem)] font-black leading-[0.9] tracking-tight text-paper">
        {won ? "ASCENDED 🌌" : r.outcome === "trap" ? "it was a trap 💀" : "you touched it 💀"}
      </h2>

      <div className="mt-8 rounded-[28px] border border-line bg-ink-2/80 px-8 py-6 backdrop-blur">
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">you lasted</p>
        <p className="font-mono text-[clamp(3.6rem,18vw,6rem)] font-black leading-none tabular-nums text-saffron">
          {r.seconds.toFixed(2)}
          <span className="text-[0.45em] text-paper/60">s</span>
        </p>
        {newBest ? <p className="mt-2 font-mono text-xs font-bold text-jade">🎉 new personal best</p> : <p className="mt-2 font-mono text-xs text-muted">best: {best.toFixed(2)}s</p>}
      </div>

      {!won ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="mt-5 w-full max-w-md rounded-[22px] border border-chili/40 bg-chili/10 px-5 py-4">
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.25em] text-chili">what got you</p>
          <p className="mt-1.5 text-[19px] font-semibold leading-snug text-paper">{r.by}</p>
        </motion.div>
      ) : null}

      <motion.span
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: -3 }}
        transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.4 }}
        className="sticker mt-7 text-2xl uppercase"
        style={{ background: rank.color }}
      >
        {rank.emoji} {rank.name}
      </motion.span>
      <p className="mt-4 max-w-[32ch] text-[16px] italic text-paper/70">{rank.roast}</p>

      <div className="mt-8 flex w-full max-w-md flex-col gap-3">
        <button onClick={onRetry} className="btn-chunky h-14 bg-saffron px-5 text-[17px] text-ink">
          {won ? "do it again 🧘" : "one more try 🧘"}
        </button>
        <div className="flex gap-3">
          <button onClick={share} className="btn-chunky h-12 flex-1 border-white/15 bg-white/10 px-4 text-[15px] text-paper" style={{ boxShadow: "0 4px 0 0 rgba(255,255,255,.1)" }}>
            share card 📲
          </button>
          <button
            onClick={async () => flash((await copyText(text)) ? "copied. challenge the gc 😈" : "copy failed")}
            className="btn-chunky h-12 flex-1 border-white/15 bg-white/10 px-4 text-[15px] text-paper"
            style={{ boxShadow: "0 4px 0 0 rgba(255,255,255,.1)" }}
          >
            challenge a friend 😈
          </button>
        </div>
      </div>
      {!won ? <p className="mt-5 font-mono text-[11px] text-muted">psst: 9 traps, new order every run. nothing you see is real 👀</p> : null}

      <ShareCard ref={cardRef} r={r} day={day} />
      {toast ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-paper px-5 py-3 font-mono text-sm font-bold text-ink shadow-2xl">{toast}</div> : null}
    </motion.section>
  );
}
