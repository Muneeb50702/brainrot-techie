import { motion } from "motion/react";
import { Marquee } from "@kit/Marquee";

const TICKER = [
  "📞 bestie is calling…",
  "💬 mom: call me. now.",
  "🔥 your streak dies in 2 min",
  "🍪 accept cookies?",
  "🚫 don't tap this",
  "⚠ SYSTEM ERROR",
  "👀 your crush viewed your story",
  "🏆 YOU WIN! (or do you)",
];

export function Menu({ best, sound, setSound, onStart }: { best: number | null; sound: boolean; setSound: (v: boolean) => void; onStart: () => void }) {
  return (
    <motion.section
      key="menu"
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, scale: 0.96, filter: "blur(10px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center text-center"
    >
      <p className="mb-5 font-mono text-[11px] uppercase tracking-[0.3em] text-muted">a game about doing nothing</p>
      <h1 className="max-w-[12ch] text-[clamp(2.9rem,12vw,6rem)] font-black leading-[0.88] tracking-[-0.035em] text-paper">
        can you{" "}
        <span className="sticker italic" style={{ ["--r" as string]: "-4deg" }}>
          NOT
        </span>{" "}
        touch your phone?
      </h1>
      <p className="mt-6 max-w-[34ch] text-[16px] leading-relaxed text-paper/65">
        60 seconds. zero touches. your phone will try <i>everything</i> to make you tap. one touch and you're cooked.
      </p>

      <motion.button
        onClick={onStart}
        whileTap={{ scale: 0.94 }}
        className="relative mt-10 grid size-44 place-items-center rounded-full text-ink"
        style={{ background: "radial-gradient(circle at 40% 35%, #ffd166, #ff8f2a 50%, #b3470f 90%)", boxShadow: "0 0 80px rgba(255,143,42,.5), inset 0 -10px 30px rgba(0,0,0,.25)", animation: "breathe 4s ease-in-out infinite" }}
      >
        <span className="text-[20px] font-black leading-tight">
          enter
          <br />
          monk mode
          <br />
          <span className="text-3xl">🧘</span>
        </span>
      </motion.button>

      <div className="mt-8 flex flex-wrap justify-center gap-2 font-mono text-[11px] text-paper/70">
        {["no taps", "no swipes", "no leaving the tab", "trust nothing 👀"].map((r) => (
          <span key={r} className="rounded-full border border-line bg-ink-2/70 px-3 py-1.5">
            🚫 {r}
          </span>
        ))}
      </div>

      <div className="mt-5 flex items-center gap-4 font-mono text-xs text-muted">
        <span>best: {best !== null ? <b className="text-saffron">{best.toFixed(2)}s</b> : "none yet"}</span>
        <button onClick={() => setSound(!sound)} className="rounded-full border border-line px-3 py-1 hover:text-paper">
          sound {sound ? "on 🔊" : "off 🔇"}
        </button>
      </div>

      <div className="mt-12 w-screen">
        <Marquee duration={42}>
          {TICKER.map((t) => (
            <span key={t} className="mx-1.5 whitespace-nowrap rounded-2xl border border-white/10 bg-[#2a211b]/80 px-3.5 py-2 text-[13px] text-paper/85 backdrop-blur" style={{ fontFamily: "system-ui, sans-serif" }}>
              {t}
            </span>
          ))}
        </Marquee>
      </div>
    </motion.section>
  );
}
