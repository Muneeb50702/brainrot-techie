import { motion } from "motion/react";

const EXAMPLES: [string, string][] = [
  ["coffee", "caffeinated rizz juice"],
  ["sorry", "my bad fr fr"],
  ["weekend", "weekend 💅"],
  ["five minutes", "5 business light years"],
];

export function Intro({ onStart, best }: { onStart: () => void; best: number | null }) {
  return (
    <motion.section key="intro" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }} className="flex w-full flex-col items-center text-center">
      <span className="glitch-in grid size-16 place-items-center rounded-2xl border-[3px] border-ink bg-villain text-4xl shadow-[5px_5px_0_#160f2e]">😈</span>
      <p className="mt-5 font-display text-sm text-muted">autocorrupt.exe has entered the chat</p>
      <h1 className="mt-3 max-w-[13ch] font-display text-[clamp(2.6rem,11vw,5rem)] font-bold leading-[0.92] tracking-tight">
        autocorrect has gone <span className="cursed text-squiggle">rogue</span>
      </h1>
      <p className="mt-5 max-w-[34ch] text-[16px] leading-relaxed text-ink/75" style={{ fontFamily: "var(--font-chat)" }}>
        text your mom, your boss and your crush. autocorrect will "fix" your words into brainrot. tap the red ones to fix them before you hit send.
      </p>

      <div className="mt-7 w-full max-w-md overflow-hidden rounded-3xl border-[3px] border-ink bg-paper p-4 text-left shadow-[6px_6px_0_#160f2e]" style={{ fontFamily: "var(--font-chat)" }}>
        {EXAMPLES.map(([from, to], i) => (
          <motion.div key={from} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.12 }} className="flex items-center gap-2 py-1.5 text-[15px]">
            <span className="text-muted line-through">{from}</span>
            <span className="text-muted">→</span>
            <span className="cursed font-semibold text-squiggle">{to}</span>
          </motion.div>
        ))}
      </div>

      <button type="button" onClick={onStart} data-begin className="btn-chunky mt-8 h-16 w-full max-w-md bg-bubble px-6 font-display text-[20px] text-white">
        open messages 💬
      </button>
      <p className="mt-4 font-mono text-[11.5px] text-muted">
        {best !== null ? <>your best: <b className="text-ink">{best}% dignity</b> · </> : null}3 texts · 25 s each · nothing is actually sent
      </p>
    </motion.section>
  );
}
