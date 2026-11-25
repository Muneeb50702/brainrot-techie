import { motion } from "motion/react";

export function Intro({ onMic, onTap, error, best }: { onMic: () => void; onTap: () => void; error: string | null; best: number | null }) {
  return (
    <motion.section key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.97 }} transition={{ duration: 0.4 }} className="flex w-full flex-col items-center text-center">
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">⚠ hearing protection recommended</p>
      <h1 className="mt-4 font-display text-[clamp(3.8rem,20vw,7.5rem)] uppercase leading-[0.95] tracking-wide">
        scream
        <br />
        <span className="text-hazard">to download</span>
      </h1>
      <p className="mt-6 max-w-[33ch] font-mono text-[13.5px] leading-relaxed text-paper/80">
        your download speed depends on how loud you scream. quiet = paused. loud = fast. the file: <span className="text-hazard">free_ram_4.20GB.zip</span>
      </p>

      <div className="mt-6 grid w-full max-w-md grid-cols-3 gap-2 font-mono text-[11px]">
        {[
          ["🤫", "whisper", "0 MB/s"],
          ["🗣️", "yap", "~3 MB/s"],
          ["😱", "SCREAM", "600 MB/s"],
        ].map(([e, a, b]) => (
          <div key={a} className="rounded-xl border-2 border-line bg-ink-2 px-2 py-3">
            <p className="text-2xl">{e}</p>
            <p className="mt-1 uppercase">{a}</p>
            <p className="text-hazard">{b}</p>
          </div>
        ))}
      </div>

      <button type="button" onClick={onMic} data-mic className="mt-8 h-16 w-full max-w-md rounded-2xl border-4 border-ink bg-hazard font-display text-3xl uppercase tracking-wide text-ink shadow-[0_6px_0_#ff5a1f] active:translate-y-1 active:shadow-[0_2px_0_#ff5a1f]">
        allow mic &amp; download 📢
      </button>
      {error ? <p role="alert" className="mt-4 max-w-sm rounded-xl border-2 border-alarm px-4 py-2 font-mono text-[12.5px] text-alarm">{error}</p> : null}
      <button type="button" onClick={onTap} data-tapmode className="mt-4 font-mono text-[12.5px] text-muted underline underline-offset-4 hover:text-hazard">
        can't scream rn? (class · library · 3am) → tap mode 👆
      </button>

      <p className="mt-6 max-w-sm font-mono text-[11px] leading-relaxed text-muted">
        🔒 your mic audio never leaves your phone and nothing is recorded. we only measure how loud it is.
        {best !== null ? <> · your best: <b className="text-hazard">{best.toFixed(1)}s</b></> : null}
      </p>
      <div className="tape mt-10 h-5 w-screen" />
    </motion.section>
  );
}
