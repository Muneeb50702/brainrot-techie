import { useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CountUp } from "@kit/CountUp";
import { nodeToPng, shareImage, copyText } from "@kit/share";
import type { AuraResult } from "../aura";
import type { GhData } from "../github";
import { Receipt, signed } from "./Receipt";
import { ShareCard } from "./ShareCard";

const fmt = (n: number) => new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export function Result({ data, aura, day, onReset }: { data: GhData; aura: AuraResult; day: number; onReset: () => void }) {
  const { user } = data;
  const cardRef = useRef<HTMLDivElement>(null);
  const [counted, setCounted] = useState(false);
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const link = `${location.origin}/?u=${user.login}`;
  const shareText = `my github aura is ${signed(aura.total)} (${aura.tier.name} ${aura.tier.emoji}). check yours → ${link}`;

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const onShare = async () => {
    if (!cardRef.current || busy) return;
    setBusy(true);
    try {
      const blob = await nodeToPng(cardRef.current, 1080, 1920);
      const r = await shareImage(blob, `gitaura-${user.login}.png`, shareText);
      if (r === "downloaded") flash("saved 📲 now post it on ur story");
    } catch {
      flash("the card printer jammed. try again");
    } finally {
      setBusy(false);
    }
  };

  const onCopy = async () => flash((await copyText(shareText)) ? "copied. go flex on the group chat" : link);

  return (
    <motion.section
      key={`result-${user.login}`}
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="grid w-full items-start gap-12 lg:grid-cols-[1.1fr_1fr] lg:gap-16"
      aria-live="polite"
    >
      <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
        <div className="flex items-center gap-4">
          <img src={user.avatar_url + "&s=160"} alt="" width={64} height={64} className="size-16 rounded-2xl ring-2 ring-lime ring-offset-4 ring-offset-ink" />
          <div className="text-left">
            <p className="text-xl font-extrabold leading-tight tracking-tight">{user.name ?? user.login}</p>
            <p className="font-mono text-sm text-muted">
              @{user.login} · since {new Date(user.created_at).getFullYear()}
            </p>
          </div>
        </div>

        <p className="mt-10 font-mono text-xs uppercase tracking-[0.35em] text-muted">total aura</p>
        <CountUp
          value={aura.total}
          duration={2.4}
          onDone={() => setCounted(true)}
          className="aura-num block text-[clamp(4.6rem,25vw,10.5rem)] font-extrabold leading-[0.85] tracking-[-0.065em]"
        />
        <style>{`.aura-num{color:${aura.tier.color};text-shadow:0 0 60px ${aura.tier.color}55}`}</style>

        <div className="mt-6 h-14">
          <AnimatePresence>
            {counted ? (
              <motion.span
                initial={{ scale: 0, rotate: -25, opacity: 0 }}
                animate={{ scale: 1, rotate: -3, opacity: 1 }}
                transition={{ type: "spring", stiffness: 420, damping: 14 }}
                className="sticker text-2xl uppercase sm:text-3xl"
                style={{ background: aura.tier.color }}
              >
                {aura.tier.emoji} {aura.tier.name}
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: counted ? 1 : 0 }}
          className="mt-4 max-w-[34ch] text-lg leading-snug text-white/75"
        >
          {aura.tier.verdict}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: counted ? 1 : 0, y: counted ? 0 : 10 }}
          transition={{ delay: 0.15 }}
          className="mt-7 grid w-full max-w-md grid-cols-2 gap-3 text-left"
        >
          <div className="rounded-2xl border border-lime/30 bg-lime/[0.06] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-lime">biggest W</p>
            <p className="mt-1.5 text-sm leading-snug text-white/85">{aura.best ? `${aura.best.emoji} ${aura.best.label}` : "none. sorry bestie"}</p>
          </div>
          <div className="rounded-2xl border border-pink/30 bg-pink/[0.06] p-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-pink">biggest L</p>
            <p className="mt-1.5 text-sm leading-snug text-white/85">{aura.worst ? `${aura.worst.emoji} ${aura.worst.label}` : "no Ls?? suspicious"}</p>
          </div>
        </motion.div>

        <p className="mt-5 font-mono text-[11px] text-muted">
          ⭐ {fmt(aura.stats.stars)} stars · 👥 {fmt(aura.stats.followers)} followers · 📦 {aura.stats.repos} repos · 🧾 {aura.stats.commitsRead} commits read
        </p>

        <div className="mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row">
          <button onClick={onShare} disabled={busy} className="btn-chunky h-14 flex-1 bg-lime px-5 text-[16px] text-ink disabled:opacity-70">
            {busy ? "printing…" : "share my aura 📲"}
          </button>
          <button onClick={onCopy} className="btn-chunky h-14 border-white/20 bg-white/10 px-5 text-[15px] text-white backdrop-blur" style={{ boxShadow: "0 4px 0 0 rgba(255,255,255,.12)" }}>
            copy flex 🔗
          </button>
        </div>
        <button onClick={onReset} className="mt-4 font-mono text-sm text-muted underline-offset-4 hover:text-white hover:underline">
          ↺ check another victim
        </button>
      </div>

      <Receipt user={user} aura={aura} delay={0.6} />

      <ShareCard ref={cardRef} user={user} aura={aura} day={day} />

      <AnimatePresence>
        {toast ? (
          <motion.div
            initial={{ opacity: 0, y: 20, x: "-50%" }}
            animate={{ opacity: 1, y: 0, x: "-50%" }}
            exit={{ opacity: 0, y: 20, x: "-50%" }}
            className="fixed bottom-6 left-1/2 z-50 rounded-full bg-white px-5 py-3 font-mono text-sm font-bold text-ink shadow-2xl"
          >
            {toast}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </motion.section>
  );
}
