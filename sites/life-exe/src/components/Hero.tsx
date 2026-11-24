import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { BorderBeamPanel } from "@kit/BorderBeamPanel";
import { Marquee } from "@kit/Marquee";

const TEASERS = [
  "❤️ 1,002,334,112 heartbeats",
  "🌍 21.8 billion km through space",
  "💀 born closer to Pac-Man than to today",
  "📱 4.2 years staring at a rectangle",
  "😴 7.8 years in sleep mode",
  "🎂 1 billion seconds old on a random tuesday",
];

export function Hero({ initial, onRun, error }: { initial: string; onRun: (v: string) => void; error?: string }) {
  const [value, setValue] = useState(initial);
  const today = new Date().toISOString().slice(0, 10);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value) onRun(value);
  };

  return (
    <motion.section
      key="hero"
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center text-center"
    >
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">task manager for your existence</p>
      <h1 className="max-w-[13ch] text-[clamp(2.8rem,11vw,6rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
        your life, but it's an{" "}
        <span className="sticker animate-float font-mono text-[0.85em]" style={{ ["--r" as string]: "-3deg" }}>
          .exe
        </span>
      </h1>
      <p className="mt-6 max-w-[36ch] text-[15px] leading-relaxed text-white/65 sm:text-base">
        enter your birthday. watch your heartbeats, breaths and km through space tick live. plus one stat that'll make you feel old 💀
      </p>

      <BorderBeamPanel className="mt-9 max-w-md p-2" radius={22} colors={["#3de8ff", "#ff3da5"]}>
        <form onSubmit={submit} className="flex flex-col gap-2">
          <label className="flex items-center justify-between gap-3 rounded-2xl bg-ink px-4 font-mono text-[15px] focus-within:ring-2 focus-within:ring-lime/60">
            <span className="shrink-0 select-none text-muted">born on</span>
            <input
              type="date"
              required
              value={value}
              min="1906-01-01"
              max={today}
              onChange={(e) => setValue(e.target.value)}
              aria-label="Your birthday"
              className="h-14 min-w-0 flex-1 bg-transparent text-right text-white outline-none [color-scheme:dark]"
            />
          </label>
          <button type="submit" className="btn-chunky h-14 bg-lime px-6 text-[17px] text-ink">
            run life.exe ▶
          </button>
        </form>
      </BorderBeamPanel>

      {error ? (
        <motion.p initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} role="alert" className="mt-4 rounded-xl border border-pink/40 bg-pink/10 px-4 py-2 font-mono text-sm text-pink">
          {error}
        </motion.p>
      ) : null}
      <p className="mt-4 font-mono text-[11px] text-muted">🔒 your birthday never leaves your phone. no servers. no cap.</p>

      <div className="mt-12 w-screen">
        <Marquee duration={40}>
          {TEASERS.map((t) => (
            <span key={t} className="mx-1.5 whitespace-nowrap rounded-full border border-line bg-ink/70 px-3 py-1.5 font-mono text-xs text-white/80 backdrop-blur">
              {t}
            </span>
          ))}
        </Marquee>
      </div>
    </motion.section>
  );
}
