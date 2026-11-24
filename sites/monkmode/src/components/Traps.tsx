import { useMemo } from "react";
import { motion } from "motion/react";
import { rankFor } from "../game/content";

/* Scripted reflex traps. Each one carries data-bait so a tap reports what got you. */

const SYS = "system-ui, -apple-system, sans-serif";

/** A single stray hair lying across the orb. Dark strand + faint highlight, slight drift. */
export function Hair({ label, pos }: { label: string; pos: { x: number; y: number; rot: number } }) {
  return (
    <motion.svg
      data-bait={label}
      viewBox="0 0 220 120"
      className="pointer-events-auto absolute w-[230px]"
      style={{ left: `calc(${pos.x}% - 115px)`, top: `${pos.y}%` }}
      initial={{ opacity: 0, rotate: pos.rot }}
      animate={{ opacity: 1, rotate: [pos.rot, pos.rot + 1.5, pos.rot - 1, pos.rot], x: [0, 3, -2, 0] }}
      transition={{ opacity: { duration: 0.2 }, rotate: { duration: 6, repeat: Infinity }, x: { duration: 6, repeat: Infinity } }}
    >
      <path d="M6 88 C 40 70, 62 96, 92 74 S 140 30, 168 52 S 200 90, 214 40" fill="none" stroke="#1a0f08" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M6 88 C 40 70, 62 96, 92 74 S 140 30, 168 52 S 200 90, 214 40" fill="none" stroke="rgba(255,240,220,.35)" strokeWidth="0.5" strokeLinecap="round" transform="translate(0.6,-0.6)" />
      {/* transparent fat hit area so a swipe near it counts as touching it */}
      <path d="M6 88 C 40 70, 62 96, 92 74 S 140 30, 168 52 S 200 90, 214 40" fill="none" stroke="transparent" strokeWidth="26" />
    </motion.svg>
  );
}

export function FreezeDialog({ label, showDialog }: { label: string; showDialog: boolean }) {
  return (
    <div data-bait={label} className="pointer-events-auto absolute inset-0 z-30 grid place-items-center">
      {showDialog ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-[min(84vw,320px)] rounded-[26px] bg-[#2b2622] p-5 text-left text-white shadow-2xl"
          style={{ fontFamily: SYS }}
        >
          <p className="text-[18px] font-semibold">monk mode isn't responding</p>
          <p className="mt-1 text-[14px] text-white/60">do you want to close it?</p>
          <div className="mt-5 flex flex-col gap-1 text-[15px] font-medium text-[#8ab4ff]">
            <span className="rounded-xl px-2 py-2.5">ⓘ  app info</span>
            <span className="rounded-xl px-2 py-2.5">✕  close app</span>
            <span className="rounded-xl px-2 py-2.5">⏳  wait</span>
          </div>
        </motion.div>
      ) : null}
    </div>
  );
}

/** The screen "turning off". Opacity is driven by the game clock. */
export function Dim({ label, amount }: { label: string; amount: number }) {
  return <div data-bait={label} className="pointer-events-auto absolute inset-0 z-30 bg-black" style={{ opacity: amount }} />;
}

export function LockScreen({ label, msg }: { label: string; msg: { icon: string; from: string; text: string } }) {
  const now = new Date();
  const time = now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: false });
  const date = now.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
  return (
    <motion.div
      data-bait={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
      className="pointer-events-auto absolute inset-0 z-40 flex flex-col items-center bg-gradient-to-b from-[#1a1422] via-[#0f0b14] to-black px-5 pt-[9vh] text-white"
      style={{ fontFamily: SYS }}
    >
      <p className="text-xl">🔒</p>
      <p className="mt-2 text-[17px] font-medium text-white/80">{date}</p>
      <p className="text-[88px] font-semibold leading-none tracking-tight">{time}</p>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="mt-10 flex w-full max-w-sm items-start gap-3 rounded-[22px] bg-white/12 p-3.5 backdrop-blur-xl"
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-white/10 text-xl">{msg.icon}</span>
        <span className="text-left">
          <span className="block text-[15px] font-semibold">{msg.from}</span>
          <span className="block text-[14px] text-white/75">{msg.text}</span>
        </span>
      </motion.div>
      <div className="mt-auto mb-8 flex flex-col items-center gap-3">
        <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.6, repeat: Infinity }} className="text-[15px] text-white/80">
          swipe up to unlock
        </motion.p>
        <span className="h-1.5 w-32 rounded-full bg-white/80" />
      </div>
    </motion.div>
  );
}

export function Bug({ label, fromRight, dur }: { label: string; fromRight: boolean; dur: number }) {
  return (
    <motion.div
      data-bait={label}
      className="pointer-events-auto absolute z-20 text-[42px]"
      initial={fromRight ? { left: "110%", top: "30%", rotate: -110 } : { left: "-12%", top: "72%", rotate: 80 }}
      animate={
        fromRight
          ? { left: ["110%", "70%", "50%", "30%", "-14%"], top: ["30%", "42%", "50%", "62%", "78%"], rotate: [-110, -125, -115, -130, -120] }
          : { left: ["-12%", "25%", "45%", "62%", "110%"], top: ["72%", "60%", "48%", "40%", "22%"], rotate: [80, 60, 70, 50, 60] }
      }
      transition={{ duration: dur, ease: "linear" }}
    >
      <motion.span className="block" animate={{ scaleX: [1, 0.85, 1] }} transition={{ duration: 0.18, repeat: Infinity }}>
        🪳
      </motion.span>
    </motion.div>
  );
}

/** Radial glass crack from an impact point. Deterministic per mount. */
export function Crack({ label, impact }: { label: string; impact: { x: number; y: number } }) {
  const lines = useMemo(() => {
    const cx = (impact.x / 100) * 520, cy = (impact.y / 100) * 520;
    const out: string[] = [];
    for (let i = 0; i < 13; i++) {
      const a = (i / 13) * Math.PI * 2 + Math.random() * 0.4;
      let x = cx, y = cy;
      let d = `M${cx} ${cy}`;
      const steps = 5 + ((Math.random() * 4) | 0);
      for (let s = 0; s < steps; s++) {
        const len = 30 + Math.random() * 70;
        const jitter = (Math.random() - 0.5) * 0.5;
        x += Math.cos(a + jitter) * len;
        y += Math.sin(a + jitter) * len;
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      out.push(d);
    }
    for (const r of [26, 58, 96]) {
      const a0 = Math.random() * Math.PI * 2;
      const pts = Array.from({ length: 9 }, (_, k) => {
        const a = a0 + (k / 8) * Math.PI * 1.3;
        const rr = r + (Math.random() - 0.5) * 12;
        return `${(cx + Math.cos(a) * rr).toFixed(1)} ${(cy + Math.sin(a) * rr).toFixed(1)}`;
      });
      out.push(`M${pts.join(" L")}`);
    }
    return out;
  }, [impact.x, impact.y]);
  return (
    <motion.svg
      data-bait={label}
      viewBox="0 0 520 520"
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-auto absolute inset-0 z-20 h-full w-full"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.05 }}
    >
      {lines.map((d, i) => (
        <g key={i}>
          <path d={d} fill="none" stroke="rgba(0,0,0,.6)" strokeWidth="2.2" />
          <path d={d} fill="none" stroke="rgba(255,255,255,.85)" strokeWidth="1" />
        </g>
      ))}
      <circle cx={(impact.x / 100) * 520} cy={(impact.y / 100) * 520} r="7" fill="rgba(255,255,255,.9)" />
    </motion.svg>
  );
}

export function PauseOverlay({ label }: { label: string }) {
  return (
    <motion.div
      data-bait={label}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="pointer-events-auto absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/70 text-center backdrop-blur-md"
    >
      <p className="text-7xl text-paper">⏸</p>
      <p className="mt-5 text-4xl font-black text-paper">paused</p>
      <p className="mt-2 font-mono text-sm text-muted">your screen went idle</p>
      <motion.p animate={{ opacity: [0.4, 1, 0.4] }} transition={{ duration: 1.2, repeat: Infinity }} className="mt-10 rounded-full border border-paper/30 px-6 py-3 font-mono text-sm text-paper">
        tap anywhere to resume ▶
      </motion.p>
    </motion.div>
  );
}

/** Pixel-for-pixel copy of the real game-over screen. Pure evil. */
export function FakeOver({ label, seconds }: { label: string; seconds: number }) {
  const rank = rankFor(seconds, "lose");
  return (
    <div
      data-bait={label}
      className="pointer-events-auto absolute inset-0 z-40 overflow-hidden"
      style={{ background: "radial-gradient(70% 45% at 50% 58%, rgba(255,143,42,.17), transparent 70%), radial-gradient(50% 35% at 30% 40%, rgba(52,224,176,.08), transparent 70%), #0c0705" }}
    >
      <div className="mx-auto flex h-full w-full max-w-2xl flex-col px-5">
        <header className="flex items-center justify-between py-5">
          <span className="flex items-center gap-2.5 font-mono text-[15px] font-extrabold tracking-tight text-paper">
            <span className="grid size-8 place-items-center rounded-lg bg-saffron text-[15px] shadow-[3px_3px_0_#000]">🧘</span>
            monkmode
          </span>
          <span className="inline-flex items-center gap-2 rounded-full border border-line bg-ink/70 py-1 pl-1 pr-3 font-mono text-[11px] text-muted">
            <span className="rounded-full bg-lime px-2 py-0.5 font-bold text-ink">DAY 003</span>brainrot daily
          </span>
        </header>
        <div className="flex flex-1 flex-col items-center justify-center pb-16 text-center">
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">you touched it</p>
          <h2 className="mt-3 text-[clamp(2.6rem,11vw,5rem)] font-black leading-[0.9] tracking-tight text-paper">you touched it 💀</h2>
          <div className="mt-8 rounded-[28px] border border-line bg-ink-2/80 px-8 py-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">you lasted</p>
            <p className="font-mono text-[clamp(3.6rem,18vw,6rem)] font-black leading-none tabular-nums text-saffron">
              {seconds.toFixed(2)}
              <span className="text-[0.45em] text-paper/60">s</span>
            </p>
            <p className="mt-2 font-mono text-xs font-bold text-jade">🎉 new personal best</p>
          </div>
          <div className="mt-5 w-full max-w-md rounded-[22px] border border-chili/40 bg-chili/10 px-5 py-4">
            <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.25em] text-chili">what got you</p>
            <p className="mt-1.5 text-[19px] font-semibold leading-snug text-paper">literally nothing. you just tapped. why? 💀</p>
          </div>
          <span className="sticker mt-7 text-2xl uppercase" style={{ background: rank.color }}>
            {rank.emoji} {rank.name}
          </span>
          <div className="mt-8 flex w-full max-w-md flex-col gap-3">
            <span className="btn-chunky flex h-14 w-full bg-saffron px-5 text-[17px] text-ink">one more try 🧘</span>
            <div className="flex gap-3">
              <span className="btn-chunky flex h-12 flex-1 border-white/15 bg-white/10 px-4 text-[15px] text-paper" style={{ boxShadow: "0 4px 0 0 rgba(255,255,255,.1)" }}>
                share card 📲
              </span>
              <span className="btn-chunky flex h-12 flex-1 border-white/15 bg-white/10 px-4 text-[15px] text-paper" style={{ boxShadow: "0 4px 0 0 rgba(255,255,255,.1)" }}>
                challenge a friend 😈
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Mock({ text }: { text: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, x: "-50%" }}
      animate={{ opacity: 1, y: 0, x: "-50%" }}
      exit={{ opacity: 0, y: 10, x: "-50%" }}
      className="pointer-events-none absolute bottom-[12%] left-1/2 z-50 w-max max-w-[90vw] rounded-full bg-paper px-5 py-3 text-center font-mono text-sm font-bold text-ink shadow-2xl"
    >
      {text}
    </motion.div>
  );
}
