import { useState } from "react";
import { motion } from "motion/react";
import type { CorpToZ, Translation, ZToCorp } from "../types";
import { Meter } from "./Meter";
import { Typewriter } from "./Typewriter";

const pop = (delay: number) => ({
  initial: { opacity: 0, y: 14, scale: 0.97 },
  animate: { opacity: 1, y: 0, scale: 1 },
  transition: { type: "spring" as const, stiffness: 260, damping: 22, delay },
});

function Label({ children }: { children: React.ReactNode }) {
  return <p className="mb-1.5 font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] opacity-60">{children}</p>;
}

function Vibe({ vibe, color }: { vibe: string; color: string }) {
  return (
    <motion.span
      initial={{ scale: 0, rotate: -20 }}
      animate={{ scale: 1, rotate: -3 }}
      transition={{ type: "spring", stiffness: 420, damping: 14 }}
      className="sticker text-lg uppercase"
      style={{ background: color }}
    >
      {vibe}
    </motion.span>
  );
}

function ChatResult({ r }: { r: CorpToZ }) {
  const [typed, setTyped] = useState(false);
  return (
    <div className="space-y-4">
      <motion.div {...pop(0)} className="flex">
        <div className="max-w-[88%] rounded-3xl rounded-bl-md border border-[#4f7cff]/40 bg-[#4f7cff]/15 px-4 py-3 text-left">
          <Label>👔 your manager</Label>
          <p className="text-[15px] leading-snug text-white/90">{r.input}</p>
        </div>
      </motion.div>
      <motion.div {...pop(0.35)} className="flex justify-end">
        <div className="max-w-[88%] rounded-3xl rounded-br-md bg-lime px-4 py-3 text-left text-ink shadow-[0_10px_40px_-10px_rgba(198,255,61,0.6)]">
          <Label>💀 gen z translation</Label>
          <p className="text-[17px] font-semibold leading-snug">
            <Typewriter text={r.translation} onDone={() => setTyped(true)} />
          </p>
        </div>
      </motion.div>

      {typed ? (
        <>
          <motion.div {...pop(0.05)} className="rounded-3xl border border-pink/40 bg-pink/10 p-5 text-left">
            <Label>🔍 what they actually mean</Label>
            <p className="text-[clamp(1.4rem,5.5vw,2rem)] font-extrabold leading-[1.05] tracking-tight text-white">{r.real_meaning}</p>
          </motion.div>
          <motion.div {...pop(0.2)} className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-ink/60 p-5 backdrop-blur">
            <Meter label="red flag level" value={r.red_flag} color="#ff3da5" emoji="🚩" delay={0.3} />
            <Vibe vibe={r.vibe} color="#ff3da5" />
          </motion.div>
        </>
      ) : null}
    </div>
  );
}

function EmailResult({ r }: { r: ZToCorp }) {
  const [typed, setTyped] = useState(false);
  return (
    <div className="space-y-4">
      <motion.div {...pop(0)} className="flex justify-end">
        <div className="max-w-[88%] rounded-3xl rounded-br-md bg-lime px-4 py-3 text-left text-ink">
          <Label>💀 what you said</Label>
          <p className="text-[16px] font-semibold leading-snug">{r.input}</p>
        </div>
      </motion.div>
      <motion.div {...pop(0.35)} className="overflow-hidden rounded-3xl bg-paper text-left text-ink shadow-[0_20px_60px_-20px_rgba(79,124,255,0.6)]">
        <div className="space-y-0.5 border-b border-ink/10 bg-[#e9e4d8] px-5 py-3 font-mono text-[11.5px] text-ink/70">
          <p>
            <b>From:</b> you@company.example
          </p>
          <p>
            <b>To:</b> all-staff@company.example
          </p>
          <p className="text-ink">
            <b>Subject:</b> {r.subject}
          </p>
        </div>
        <div className="px-5 py-5 font-serif text-[16px] leading-relaxed">
          <p>Hi team,</p>
          <p className="mt-3">
            <Typewriter text={r.translation} cps={45} onDone={() => setTyped(true)} />
          </p>
          <p className="mt-3">
            Best regards,
            <br />
            You
            <br />
            <span className="text-[13px] text-ink/60">Senior Synergy Associate · Q4 Alignment Taskforce</span>
          </p>
        </div>
      </motion.div>
      {typed ? (
        <motion.div {...pop(0.1)} className="flex flex-col items-center gap-5 rounded-3xl border border-line bg-ink/60 p-5 backdrop-blur">
          <Meter label="synergy level" value={r.synergy} color="#4f7cff" emoji="👔" delay={0.2} />
          <Vibe vibe={r.vibe} color="#c6ff3d" />
        </motion.div>
      ) : null}
    </div>
  );
}

export function Result({ r }: { r: Translation }) {
  return r.mode === "corp2z" ? <ChatResult r={r} /> : <EmailResult r={r} />;
}
