import { motion } from "motion/react";

const TESTS = [
  ["⚡", "reflex", "tap the second it turns green"],
  ["🧠", "memory", "repeat a growing emoji pattern"],
  ["🎨", "brain glitch", "tap the colour, not the word"],
  ["🫠", "focus", "ignore the notifications"],
];

export function Intake({ onStart, best }: { onStart: () => void; best: number | null }) {
  return (
    <motion.section
      key="intake"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center text-center"
    >
      <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">dept. of brainrot · form 69-b</p>
      <h1 className="wide mt-4 max-w-[11ch] text-[clamp(2.7rem,12.5vw,5.8rem)] leading-[0.86]">
        how cooked is your brain?
      </h1>
      <div className="relative mt-4">
        <span className="stamp text-[clamp(1.4rem,6vw,2.2rem)]" style={{ animation: "slam .55s cubic-bezier(.2,1.4,.4,1) .35s both" }}>
          cooked?
        </span>
      </div>
      <p className="mt-6 max-w-[34ch] text-[15.5px] leading-relaxed text-ink/75">
        4 real brain tests. about 90 seconds. we compare you to the average human and tell you exactly how done you are. 🥩→💀
      </p>

      <div className="card mt-8 w-full max-w-md divide-y-2 divide-dashed divide-line p-2 text-left">
        {TESTS.map(([e, name, desc], i) => (
          <div key={name} className="flex items-center gap-3 px-3 py-3">
            <span className="font-mono text-xs text-muted">0{i + 1}</span>
            <span className="text-2xl">{e}</span>
            <span>
              <b className="wide block text-[15px] uppercase">{name}</b>
              <span className="block font-mono text-[12.5px] text-muted">{desc}</span>
            </span>
          </div>
        ))}
      </div>

      <button onClick={onStart} className="btn-chunky mt-8 h-16 w-full max-w-md bg-stamp px-6 text-[19px] text-white" style={{ fontStretch: "125%" }}>
        start brain scan 🧠
      </button>
      <p className="mt-4 font-mono text-[11.5px] text-muted">
        {best !== null ? (
          <>
            your last scan: <b className="text-ink">{best}% cooked</b> ·{" "}
          </>
        ) : null}
        works best on your phone · nothing leaves your device
      </p>
    </motion.section>
  );
}
