import { useRef, useState } from "react";
import { motion } from "motion/react";
import { CountUp } from "@kit/CountUp";
import { copyText, nodeToPng, shareImage } from "@kit/share";
import { rankFor } from "../game/content";
import type { MissionResult } from "./Mission";
import { ShareCard } from "./ShareCard";

export function Results({ results, day, onReplay }: { results: MissionResult[]; day: number; onReplay: () => void }) {
  const dignity = Math.round((results.reduce((s, r) => s + r.dignity, 0) / results.length) * 100);
  const rank = rankFor(dignity / 100);
  const cardRef = useRef<HTMLDivElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const worst = [...results].sort((a, b) => a.dignity - b.dignity)[0];
  const text = `autocorrect made me text my ${worst.contact} "${worst.message}" 💀 dignity preserved: ${dignity}%. try it → ${location.origin}`;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };
  const share = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await nodeToPng(cardRef.current, 1080, 1920);
      const out = await shareImage(blob, "autocorrupt.png", text);
      if (out === "downloaded") flash("saved 📲 post it on ur story");
    } catch {
      flash("autocorrect corrupted the screenshot. try again");
    }
  };

  return (
    <motion.section key="results" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex w-full flex-col items-center text-center">
      <p className="font-display text-sm text-muted">texts sent. damage report:</p>
      <p className="mt-2 font-display text-[clamp(1.2rem,5vw,1.6rem)]">dignity preserved</p>
      <p className="font-display text-[clamp(5rem,26vw,9rem)] font-bold leading-[0.85]" style={{ color: dignity >= 65 ? "#19c37d" : "#ff2d55" }}>
        <CountUp value={dignity} duration={1.8} signed={false} />%
      </p>
      <motion.span initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: -3 }} transition={{ type: "spring", stiffness: 420, damping: 14, delay: 1.2 }} className="sticker mt-4 font-display text-2xl uppercase">
        {rank.emoji} {rank.title}
      </motion.span>
      <p className="mt-4 max-w-[32ch] text-[15.5px] text-ink/75" style={{ fontFamily: "var(--font-chat)" }}>
        {rank.line}
      </p>

      <div className="mt-7 w-full max-w-md space-y-3 text-left" style={{ fontFamily: "var(--font-chat)" }}>
        {results.map((r, i) => (
          <motion.div key={r.contact} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 + i * 0.15 }} className="rounded-3xl border-[3px] border-ink bg-paper p-3.5 shadow-[5px_5px_0_#160f2e]">
            <div className="mb-2 flex items-center gap-2 text-[13px] text-muted">
              <span className="text-lg">{r.avatar}</span>
              <b className="text-ink">{r.name}</b>
              <span className={`ml-auto font-display text-[14px] ${r.dignity >= 0.65 ? "text-mint" : "text-squiggle"}`}>{Math.round(r.dignity * 100)}%</span>
            </div>
            <p className="ml-auto w-fit max-w-[88%] rounded-2xl rounded-br-md bg-bubble px-3 py-1.5 text-[14.5px] text-white">{r.message}</p>
            {r.reply ? <p className="mt-1.5 w-fit max-w-[85%] rounded-2xl rounded-bl-md bg-grey px-3 py-1.5 text-[14.5px]">{r.reply}</p> : <p className="mt-1 text-right text-[12px] font-semibold text-squiggle">left on read 💀</p>}
          </motion.div>
        ))}
      </div>

      <div className="mt-7 flex w-full max-w-md flex-col gap-3">
        <button type="button" onClick={share} className="btn-chunky h-14 bg-bubble px-5 font-display text-[18px] text-white">
          share the damage 📲
        </button>
        <div className="flex gap-3">
          <button type="button" onClick={onReplay} className="btn-chunky h-12 flex-1 bg-paper px-4 font-display text-[16px] text-ink">
            try again 🔁
          </button>
          <button type="button" onClick={async () => flash((await copyText(text)) ? "copied. send it (yourself this time)" : "copy failed")} className="btn-chunky h-12 flex-1 bg-acid px-4 font-display text-[16px] text-ink">
            challenge a friend 😈
          </button>
        </div>
      </div>

      <ShareCard ref={cardRef} results={results} dignity={dignity} day={day} />
      {toast ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 font-display text-sm text-paper shadow-2xl">{toast}</div> : null}
    </motion.section>
  );
}
