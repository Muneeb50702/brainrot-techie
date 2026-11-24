import type { ReactNode } from "react";
import { motion } from "motion/react";
import type { Caller, Notif, Popup } from "../game/content";

/* Every bait carries data-bait="<label>" so a tap on it reports exactly what got you. */

export function NotifBanner({ n, index }: { n: Notif; index: number }) {
  return (
    <motion.div
      data-bait={`${n.icon} ${n.title}: "${n.body}"`}
      layout
      initial={{ y: -90, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1 - index * 0.12, scale: 1 - index * 0.035 }}
      exit={{ y: -40, opacity: 0 }}
      transition={{ type: "spring", stiffness: 380, damping: 30 }}
      className="pointer-events-auto mx-auto flex w-full max-w-sm items-start gap-3 rounded-[22px] border border-white/10 bg-[#2a211b]/90 p-3.5 text-left shadow-2xl backdrop-blur-xl"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-xl">{n.icon}</span>
      <span className="min-w-0 flex-1">
        <span className="flex justify-between text-[11px] uppercase tracking-wide text-white/45">
          <span>{n.app}</span>
          <span>now</span>
        </span>
        <span className="block truncate text-[15px] font-semibold text-white">{n.title}</span>
        {n.blur ? (
          <span className="block text-[14px] leading-snug text-white/75">
            <span className="select-none" style={{ filter: "blur(5px)" }}>{n.body}</span>
            <span className="ml-1 text-[12px] text-white/50">· tap to read 👀</span>
          </span>
        ) : (
          <span className="block text-[14px] leading-snug text-white/75">{n.body}</span>
        )}
      </span>
    </motion.div>
  );
}

/** Centers a bait on (x%, y%) and keeps it on screen. Motion owns `transform` on the child, so centering lives here. */
function Anchor({ x, y, children }: { x: number; y: number; children: ReactNode }) {
  return (
    <div className="absolute" style={{ left: `clamp(150px, ${x}%, calc(100% - 150px))`, top: `${y}%`, transform: "translate(-50%, -50%)" }}>
      {children}
    </div>
  );
}

export function PopupCard({ p, x, y }: { p: Popup; x: number; y: number }) {
  return (
    <Anchor x={x} y={y}>
    <motion.div
      data-bait={p.label}
      initial={{ scale: 0.6, opacity: 0, rotate: -4 }}
      animate={{ scale: 1, opacity: 1, rotate: 0 }}
      exit={{ scale: 0.8, opacity: 0 }}
      transition={{ type: "spring", stiffness: 420, damping: 20 }}
      className="pointer-events-auto w-[min(78vw,300px)] rounded-3xl bg-paper p-5 text-center text-ink shadow-[0_30px_80px_-10px_rgba(0,0,0,0.7)]"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <p className="text-[18px] font-bold leading-tight">{p.title}</p>
      {p.body ? <p className="mt-1.5 text-[14px] text-ink/65">{p.body}</p> : null}
      <div className="mt-4 flex gap-2">
        {p.buttons.map((b, i) => (
          <span key={b} className={`flex-1 rounded-xl px-3 py-2.5 text-[15px] font-semibold ${i === 0 ? "bg-[#0a84ff] text-white" : "bg-ink/10 text-ink"}`}>
            {b}
          </span>
        ))}
      </div>
    </motion.div>
    </Anchor>
  );
}

export function ClaimButton({ x, y, text, label }: { x: number; y: number; text: string; label: string }) {
  return (
    <Anchor x={x} y={y}>
      <motion.div
        data-bait={label}
        initial={{ scale: 0 }}
        animate={{ scale: [1, 1.12, 1] }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ scale: { duration: 0.7, repeat: Infinity } }}
        className="pointer-events-auto whitespace-nowrap rounded-full bg-gold px-5 py-3 font-mono text-[15px] font-extrabold text-ink shadow-[0_0_40px_rgba(255,209,102,0.7)]"
      >
        {text}
      </motion.div>
    </Anchor>
  );
}

export function Floater() {
  return (
    <motion.div
      data-bait="the 'DON'T TAP THIS' button. you tapped it."
      initial={{ left: "6%", top: "70%", rotate: -8 }}
      animate={{ left: ["6%", "40%", "10%", "36%", "6%"], top: ["70%", "35%", "22%", "78%", "70%"], rotate: [-8, 10, -6, 8, -8] }}
      exit={{ scale: 0, opacity: 0 }}
      transition={{ duration: 5, ease: "easeInOut", repeat: Infinity }}
      className="pointer-events-auto absolute rounded-2xl border-4 border-ink bg-chili px-5 py-3 text-[18px] font-black uppercase text-white shadow-[6px_6px_0_#000]"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      don't tap this 🚫
    </motion.div>
  );
}

export function SkipAd({ seconds }: { seconds: number }) {
  const ready = seconds <= 0;
  return (
    <motion.div
      data-bait="a 'skip ad' button"
      initial={{ x: 120, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 120, opacity: 0 }}
      className="pointer-events-auto absolute bottom-[14%] right-3 rounded-l-lg border border-white/30 bg-black/80 px-4 py-2.5 text-[14px] text-white"
      style={{ fontFamily: "system-ui, sans-serif" }}
    >
      {ready ? "skip ad ⏭" : `skip in ${seconds}…`}
    </motion.div>
  );
}

export function GlitchOverlay() {
  return (
    <motion.div
      data-bait="a fake SYSTEM ERROR"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="pointer-events-auto absolute inset-0 grid place-items-center bg-chili/25 backdrop-blur-[2px]"
    >
      <div className="rounded-2xl border-2 border-chili bg-black/85 px-6 py-5 text-center font-mono text-chili" style={{ animation: "glitch 0.35s steps(2) infinite" }}>
        <p className="text-xl font-bold">⚠ SYSTEM ERROR</p>
        <p className="mt-1 text-sm">0xBRAINROT · tap to fix</p>
      </div>
    </motion.div>
  );
}

export function IncomingCall({ caller, declineIn }: { caller: Caller; declineIn: number }) {
  return (
    <motion.div
      data-bait={`📞 ${caller.name} calling`}
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "-100%", opacity: 0 }}
      transition={{ type: "spring", stiffness: 220, damping: 28 }}
      className="pointer-events-auto absolute inset-0 z-30 flex flex-col items-center justify-between bg-gradient-to-b from-[#3b2417] via-[#1d140e] to-black px-6 py-[16vh] text-white"
      style={{ fontFamily: "system-ui, -apple-system, sans-serif" }}
    >
      <div className="text-center">
        <motion.div
          animate={{ scale: [1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity }}
          className="mx-auto grid size-28 place-items-center rounded-full bg-gradient-to-br from-saffron to-chili text-6xl shadow-[0_0_60px_rgba(255,143,42,0.5)]"
        >
          {caller.emoji}
        </motion.div>
        <p className="mt-6 text-[34px] font-semibold">{caller.name}</p>
        <p className="mt-1 text-white/60">mobile · incoming call…</p>
        <p className="mt-3 text-sm text-white/40">"{caller.line}"</p>
      </div>
      <div className="flex w-full max-w-xs justify-between">
        <span className="flex flex-col items-center gap-2 text-sm text-white/70">
          <span className="grid size-[72px] place-items-center rounded-full bg-[#ff3b30] text-3xl">📵</span>
          decline
        </span>
        <span className="flex flex-col items-center gap-2 text-sm text-white/70">
          <motion.span animate={{ y: [0, -8, 0] }} transition={{ duration: 0.8, repeat: Infinity }} className="grid size-[72px] place-items-center rounded-full bg-[#34c759] text-3xl">
            📞
          </motion.span>
          accept
        </span>
      </div>
      <p className="text-xs text-white/30">missed call in {declineIn}s</p>
    </motion.div>
  );
}

export function FakeWin({ suspicious }: { suspicious: boolean }) {
  return (
    <motion.div
      data-bait="the fake 'YOU WIN' screen 💀"
      initial={{ opacity: 0, scale: 1.1 }}
      animate={{ opacity: 1, scale: 1 }}
      className="pointer-events-auto absolute inset-0 z-40 flex flex-col items-center justify-center bg-gradient-to-b from-gold via-saffron to-robe px-8 text-center text-ink"
    >
      <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.1, 1] }} transition={{ duration: 1.4, repeat: Infinity }} className="text-8xl">
        🏆
      </motion.div>
      <p className="mt-6 text-[clamp(2.6rem,12vw,4.5rem)] font-black leading-[0.9] tracking-tight">YOU WIN!</p>
      <p className="mt-3 max-w-[22ch] text-lg font-semibold">60 seconds. you're a certified monk 🧘</p>
      <motion.p animate={{ opacity: [0.5, 1, 0.5] }} transition={{ duration: 1.1, repeat: Infinity }} className="mt-10 rounded-full bg-ink px-6 py-3 font-mono text-base font-bold text-gold">
        tap anywhere to claim your badge 👆
      </motion.p>
      {suspicious ? (
        <motion.p initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-8 font-mono text-sm font-bold">
          …why aren't you tapping? 🤨
        </motion.p>
      ) : null}
    </motion.div>
  );
}
