import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { nodeToPng, shareImage } from "@kit/share";
import {
  bornCloserTo, countdown, fmtCompact, fmtDate, fmtInt, liveStats, milestones, pad, phoneStats, timeline, uptime,
} from "../life";
import { Running, Window } from "./Window";
import { ShareCard } from "./ShareCard";

/** Re-render ~12x/sec so counters visibly tick. */
function useNow(ms = 80) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(id);
  }, [ms]);
  return now;
}

const rise = (i: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { type: "spring" as const, stiffness: 220, damping: 24, delay: 0.08 * i },
});

function Counter({ emoji, label, value, caption, accent, pulseKey, i }: { emoji: string; label: string; value: string; caption: string; accent: string; pulseKey?: number; i: number }) {
  return (
    <motion.div {...rise(i)} className="rounded-2xl border border-line bg-ink/70 p-4 backdrop-blur">
      <div className="flex items-center justify-between font-mono text-[10.5px] font-bold uppercase tracking-[0.22em] text-muted">
        <span>{label}</span>
        <span key={pulseKey} className="text-xl" style={pulseKey !== undefined ? { animation: "beat 0.45s ease-out" } : undefined}>
          {emoji}
        </span>
      </div>
      <p className="mt-2 font-mono text-[clamp(1.55rem,7.2vw,2.1rem)] font-extrabold leading-none tracking-tight tabular-nums" style={{ color: accent }}>
        {value}
      </p>
      <p className="mt-2 text-[13px] leading-snug text-white/60">{caption}</p>
    </motion.div>
  );
}

export function Dashboard({ birth, onReset, day }: { birth: Date; onReset: () => void; day: number }) {
  const now = useNow();
  const [screenHours, setScreenHours] = useState(7);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  const up = uptime(birth, now);
  const live = liveStats(birth, now);
  const phone = phoneStats(birth, screenHours, now);
  const closer = bornCloserTo(birth, now);
  const tl = timeline(birth);
  const ms = milestones(birth, now);
  const passed = (d: Date) => d.getTime() <= now;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };
  const share = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await nodeToPng(cardRef.current, 1080, 1920);
      const r = await shareImage(blob, "life-exe.png", `my life.exe uptime report 💀 check yours → ${location.origin}`);
      if (r === "downloaded") flash("saved 📲 post it on ur story");
    } catch {
      flash("screenshot.exe crashed. try again");
    }
  };

  return (
    <motion.div key="dash" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -20 }} className="w-full space-y-4 text-left">
      {/* UPTIME */}
      <motion.div {...rise(0)}>
        <Window title="life.exe" status={<Running />}>
          <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">uptime</p>
          <p className="mt-1 text-[clamp(3.2rem,16vw,6.5rem)] font-extrabold leading-[0.88] tracking-[-0.05em]">
            <span className="text-gradient">{up.years}y</span> <span className="text-white">{up.days}d</span>
          </p>
          <p className="mt-1 font-mono text-[clamp(1.6rem,7.5vw,2.6rem)] font-bold tabular-nums text-white/90">
            {pad(up.hours)}:{pad(up.minutes)}:<span className="text-lime">{pad(up.seconds)}</span>
          </p>
          <p className="mt-3 font-mono text-xs text-muted">
            running since {fmtDate(birth)} · 0 restarts · 0 updates · still buggy
          </p>
        </Window>
      </motion.div>

      {/* LIVE COUNTERS */}
      <div className="grid gap-3 sm:grid-cols-2">
        <Counter i={1} emoji="❤️" label="heartbeats" value={fmtInt(live.heartbeats)} accent="#ff3da5" pulseKey={Math.floor(live.heartbeats)} caption="no breaks. no PTO. hardest worker you know." />
        <Counter i={2} emoji="🌍" label="km through space" value={fmtInt(live.spaceKm)} accent="#3de8ff" caption="you're on a rock doing 29.78 km/s. no seatbelt." />
        <Counter i={3} emoji="🫁" label="breaths" value={fmtInt(live.breaths)} accent="#c6ff3d" caption="free oxygen. no subscription. W." />
        <Counter i={4} emoji="👁️" label="blinks" value={fmtInt(live.blinks)} accent="#f3efe6" caption="you just blinked. probably." />
      </div>

      {/* PUNCHLINE */}
      {closer ? (
        <motion.div {...rise(5)} className="rounded-[22px] border border-pink/40 bg-pink/10 p-5">
          <p className="font-mono text-[10.5px] font-bold uppercase tracking-[0.25em] text-pink">⚠️ critical warning</p>
          <p className="mt-2 text-[clamp(1.7rem,7vw,2.6rem)] font-extrabold leading-[1.02] tracking-tight">
            you were born closer to{" "}
            <span className="sticker" style={{ background: "#ff3da5", color: "#fff", ["--r" as string]: "-2deg" }}>
              {closer.label} {closer.emoji}
            </span>{" "}
            ({closer.year}) than to today 💀
          </p>
        </motion.div>
      ) : null}

      {/* PHONE / SLEEP */}
      <motion.div {...rise(6)}>
        <Window title="system usage — where ur life went">
          <label className="block font-mono text-[11px] uppercase tracking-[0.22em] text-muted">
            daily screen time: <span className="text-lime">{screenHours}h</span>
            <input
              type="range"
              min={0}
              max={16}
              step={0.5}
              value={screenHours}
              onChange={(e) => setScreenHours(Number(e.target.value))}
              className="mt-3 block w-full accent-[#c6ff3d]"
              aria-label="Daily screen time in hours"
            />
          </label>
          <div className="mt-5 grid grid-cols-2 gap-4">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">📱 on your phone</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight text-lime">{phone.years.toFixed(1)}y</p>
              <p className="mt-1 text-[12.5px] text-white/55">since {phone.since.getFullYear()}. staring at a rectangle.</p>
            </div>
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-muted">😴 sleep mode</p>
              <p className="mt-1 text-4xl font-extrabold tracking-tight text-cyan">{phone.sleepYears.toFixed(1)}y</p>
              <p className="mt-1 text-[12.5px] text-white/55">a third of your life. goated.</p>
            </div>
          </div>
          <p className="mt-5 rounded-2xl bg-white/5 p-4 text-[15px] leading-snug text-white/85">
            👍 your thumb has scrolled about <b className="text-lime">{fmtInt(phone.scrolledKm)} km</b>. that's Mount Everest{" "}
            <b className="text-lime">{phone.everests.toFixed(0)}×</b>. thumb never skips leg day.
            <span className="mt-2 block text-[13px] text-white/50">
              at {screenHours}h/day you'll hit <b className="text-white/80">{phone.projectedYears.toFixed(1)} years</b> of phone time by age 80.
            </span>
          </p>
        </Window>
      </motion.div>

      {/* TIMELINE */}
      <motion.div {...rise(7)}>
        <Window title="patch notes — things younger than you">
          <div className="flex flex-wrap gap-2">
            {tl.youngerThanYou.map((e) => (
              <span key={e.label} className="rounded-full border border-lime/40 bg-lime/10 px-3 py-1.5 font-mono text-xs text-lime">
                {e.emoji} {e.label} ({e.date.slice(0, 4)})
              </span>
            ))}
            {tl.youngerThanYou.length === 0 ? <span className="font-mono text-xs text-muted">nothing in our list is younger than you. you're the update.</span> : null}
          </div>
          {tl.olderThanYou.length ? (
            <p className="mt-4 font-mono text-[11.5px] text-muted">
              older than you: {tl.olderThanYou.map((e) => `${e.emoji} ${e.label}`).join(" · ")}
            </p>
          ) : null}
        </Window>
      </motion.div>

      {/* MILESTONES */}
      <motion.div {...rise(8)}>
        <Window title="scheduled tasks">
          <ul className="space-y-3 text-[14.5px]">
            <li className="flex items-baseline justify-between gap-3">
              <span>🎂 next birthday</span>
              <span className="font-mono tabular-nums text-lime">{countdown(ms.nextBirthday, now)}</span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span>⏱️ 1,000,000,000 seconds old</span>
              <span className="text-right font-mono text-[13px] text-white/80">{passed(ms.billionSeconds) ? `done ✓ ${fmtDate(ms.billionSeconds)}` : fmtDate(ms.billionSeconds)}</span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span>📅 10,000 days old</span>
              <span className="text-right font-mono text-[13px] text-white/80">{passed(ms.tenThousandDays) ? `done ✓ ${fmtDate(ms.tenThousandDays)}` : fmtDate(ms.tenThousandDays)}</span>
            </li>
            <li className="flex items-baseline justify-between gap-3">
              <span>❤️ 1 billionth heartbeat</span>
              <span className="text-right font-mono text-[13px] text-white/80">{passed(ms.billionHeartbeats) ? `done ✓ ${fmtDate(ms.billionHeartbeats)}` : fmtDate(ms.billionHeartbeats)}</span>
            </li>
          </ul>
          <p className="mt-4 font-mono text-[11px] text-muted">🩸 your heart has pumped ~{fmtCompact(live.bloodLiters)} liters of blood. fr.</p>
        </Window>
      </motion.div>

      {/* ACTIONS */}
      <motion.div {...rise(9)} className="flex flex-col gap-3 pt-2 sm:flex-row">
        <button onClick={share} className="btn-chunky h-14 flex-1 bg-lime px-5 text-[16px] text-ink">
          share my uptime 📲
        </button>
        <button onClick={onReset} className="btn-chunky h-14 flex-1 border-white/20 bg-white/10 px-5 text-[15px] text-white" style={{ boxShadow: "0 4px 0 0 rgba(255,255,255,.12)" }}>
          check a friend 👀
        </button>
      </motion.div>

      <p className="pt-2 text-center font-mono text-[10.5px] leading-relaxed text-muted">
        math on averages: 80 bpm · 16 breaths/min · 15 blinks/min awake · 8h sleep · earth orbit 29.78 km/s · ~40 m scrolled per screen-hour. ur mileage may vary.
      </p>

      <ShareCard ref={cardRef} birth={birth} screenHours={screenHours} day={day} />

      {toast ? (
        <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-white px-5 py-3 font-mono text-sm font-bold text-ink shadow-2xl">{toast}</div>
      ) : null}
    </motion.div>
  );
}
