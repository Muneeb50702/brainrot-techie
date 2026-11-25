import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { copyText, nodeToPng, shareImage } from "@kit/share";
import { FILE, likeFor, neighboursFor } from "../game/levels";
import type { Stats } from "./Download";
import { ShareCard } from "./ShareCard";

export function rankFor(s: Stats) {
  if (s.mode === "tap") return { title: "silent but deadly", emoji: "👆", line: "downloaded 4.2 GB with your thumb. the library is proud of you." };
  if (s.seconds < 9) return { title: "certified banshee", emoji: "👻", line: "the windows are cracked. the download is complete. worth it." };
  if (s.seconds < 15) return { title: "lung legend", emoji: "🫁", line: "fibre-optic lungs. your ISP is scared of you." };
  if (s.seconds < 25) return { title: "decent screamer", emoji: "😤", line: "solid effort. your neighbours disagree." };
  return { title: "polite screamer", emoji: "🥱", line: "that was a strongly worded whisper, bestie." };
}

export function Done({ stats, best, day, onAgain }: { stats: Stats; best: number | null; day: number; onAgain: () => void }) {
  const [opened, setOpened] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const rank = rankFor(stats);
  const text =
    stats.mode === "mic"
      ? `i downloaded 4.20 GB of RAM by screaming at ${Math.round(stats.peak)} dB in ${stats.seconds.toFixed(1)}s 😱 beat that → ${location.origin}`
      : `i downloaded 4.20 GB of RAM with ${stats.taps} taps 👆 → ${location.origin}`;
  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };
  const share = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await nodeToPng(cardRef.current, 1080, 1920);
      const out = await shareImage(blob, "screamload.png", text);
      if (out === "downloaded") flash("saved 📲 post it on ur story");
    } catch {
      flash("the screenshot got scared. try again");
    }
  };

  return (
    <motion.section key="done" initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} className="flex w-full flex-col items-center text-center">
      <div className="tape h-4 w-screen" />
      <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.3em] text-signal">● download complete</p>
      <h2 className="mt-2 font-display text-[clamp(3.4rem,17vw,6rem)] uppercase leading-none">
        {stats.seconds.toFixed(1)}
        <span className="text-hazard">s</span>
      </h2>
      <p className="mt-2 font-mono text-[13px] text-paper/80">📦 {FILE.name} · 4.20 GB</p>

      <AnimatePresence mode="wait">
        {!opened ? (
          <motion.button key="open" type="button" data-open exit={{ opacity: 0 }} onClick={() => setOpened(true)} className="mt-7 h-14 w-full max-w-md rounded-2xl border-4 border-ink bg-hazard font-display text-2xl uppercase text-ink shadow-[0_6px_0_#ff5a1f]">
            open file 📂
          </motion.button>
        ) : (
          <motion.div key="err" initial={{ opacity: 0, y: 14, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="mt-7 w-full max-w-md overflow-hidden rounded-2xl border-4 border-alarm bg-ink-2 text-left">
            <div className="flex items-center justify-between bg-alarm px-4 py-2 font-mono text-[12px] font-bold text-ink">
              <span>⚠ error</span>
              <span>×</span>
            </div>
            <div className="p-4">
              <p className="font-display text-3xl uppercase leading-tight">you can't download RAM 💀</p>
              <p className="mt-2 font-mono text-[12.5px] text-paper/75">file is empty. but your neighbours heard everything.</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {opened ? (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="mt-6 w-full max-w-md">
          <div className="grid grid-cols-2 gap-2 text-left font-mono">
            {stats.mode === "mic" ? (
              <>
                <Stat k="peak" v={`${Math.round(stats.peak)} dB`} sub={`≈ ${likeFor(stats.peak)}`} />
                <Stat k="avg scream" v={`${Math.round(stats.avgLoud)} dB`} sub={`${stats.loudSeconds.toFixed(1)}s of screaming`} />
              </>
            ) : (
              <>
                <Stat k="taps" v={String(stats.taps)} sub="thumb: destroyed" />
                <Stat k="volume" v="0 dB" sub="the library is safe" />
              </>
            )}
            <Stat k="time" v={`${stats.seconds.toFixed(1)}s`} sub={best !== null && stats.seconds <= best ? "🎉 new best" : best !== null ? `best: ${best.toFixed(1)}s` : "first download"} />
            <Stat k="neighbours" v={stats.mode === "mic" ? neighboursFor(stats.loudSeconds).split(" ")[0] : "😴"} sub={stats.mode === "mic" ? neighboursFor(stats.loudSeconds).split(" ").slice(1).join(" ") : "never knew"} />
          </div>
          <motion.span initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: -3 }} transition={{ type: "spring", stiffness: 420, damping: 14, delay: 0.5 }} className="sticker mt-6 font-display text-2xl uppercase tracking-wide">
            {rank.emoji} {rank.title}
          </motion.span>
          <p className="mt-4 font-mono text-[13px] text-paper/75">{rank.line}</p>

          <div className="mt-7 flex flex-col gap-3">
            <button type="button" onClick={share} className="h-14 rounded-2xl border-4 border-ink bg-safety font-display text-2xl uppercase tracking-wide text-ink shadow-[0_6px_0_#ffd400]">
              share my scream 📲
            </button>
            <div className="flex gap-3">
              <button type="button" onClick={onAgain} className="h-12 flex-1 rounded-xl border-2 border-hazard font-mono text-[13px] text-hazard">
                download more RAM 🔁
              </button>
              <button type="button" onClick={async () => flash((await copyText(text)) ? "copied. make the gc scream 😈" : "copy failed")} className="h-12 flex-1 rounded-xl border-2 border-line font-mono text-[13px] text-paper">
                challenge a friend 😈
              </button>
            </div>
          </div>
        </motion.div>
      ) : null}

      <ShareCard ref={cardRef} stats={stats} day={day} />
      {toast ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-hazard px-5 py-3 font-mono text-sm font-bold text-ink">{toast}</div> : null}
    </motion.section>
  );
}

function Stat({ k, v, sub }: { k: string; v: string; sub: string }) {
  return (
    <div className="rounded-xl border-2 border-line bg-ink-2 p-3">
      <p className="text-[10px] uppercase tracking-[0.2em] text-muted">{k}</p>
      <p className="mt-1 font-display text-3xl leading-none text-hazard">{v}</p>
      <p className="mt-1 text-[11px] text-paper/70">{sub}</p>
    </div>
  );
}
