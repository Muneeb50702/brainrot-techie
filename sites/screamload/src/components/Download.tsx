import { useEffect, useRef, useState } from "react";
import { motion } from "motion/react";
import { toDb, type Mic } from "../game/mic";
import { etaText, FILE, fmtGb, labelFor, neighboursFor, speedFor } from "../game/levels";

export type Stats = { seconds: number; peak: number; avgLoud: number; loudSeconds: number; mode: "mic" | "tap"; taps: number };

const CALIBRATE_S = 0.9;
const TAP_MB = 35;
const SEGMENTS = 24;

function dbg(patch: Record<string, unknown>) {
  const w = window as unknown as { __sl?: Record<string, unknown> };
  w.__sl = { ...(w.__sl ?? {}), ...patch };
}

export function Download({ mic, mode, onDone }: { mic: Mic | null; mode: "mic" | "tap"; onDone: (s: Stats) => void }) {
  const [, force] = useState(0);
  const s = useRef({ t0: performance.now(), last: performance.now(), db: 0, ambient: 0, ambientN: 0, threshold: 66, mb: 0, speed: 0, peak: 0, loudDbSum: 0, loud: 0, elapsed: 0, taps: 0, tapBurst: 0, done: false });
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    let raf = 0;
    let lastPaint = 0;
    const loop = (now: number) => {
      const st = s.current;
      if (st.done) return;
      const dt = Math.min(0.1, (now - st.last) / 1000);
      st.last = now;
      const sinceStart = (now - st.t0) / 1000;

      if (mode === "mic" && mic) {
        const raw = toDb(mic.rms());
        st.db = raw > st.db ? st.db * 0.45 + raw * 0.55 : st.db * 0.85 + raw * 0.15; // fast attack, slow release
        if (sinceStart < CALIBRATE_S) {
          st.ambient += raw;
          st.ambientN++;
          st.threshold = Math.max(66, st.ambient / st.ambientN + 8);
        } else {
          st.speed = speedFor(st.db, st.threshold);
        }
      } else {
        st.tapBurst *= Math.pow(0.04, dt); // tap speed decays fast
        st.speed = st.tapBurst;
        st.db = 0;
      }

      if (sinceStart >= (mode === "mic" ? CALIBRATE_S : 0)) {
        st.elapsed += dt;
        st.mb = Math.min(FILE.mb, st.mb + st.speed * dt);
        if (st.speed > 0.5) {
          st.loud += dt;
          st.loudDbSum += st.db * dt;
        }
        st.peak = Math.max(st.peak, st.db);
      }

      if (st.mb >= FILE.mb) {
        st.done = true;
        dbg({ phase: "done" });
        doneRef.current({ seconds: st.elapsed, peak: st.peak, avgLoud: st.loud ? st.loudDbSum / st.loud : 0, loudSeconds: st.loud, mode, taps: st.taps });
        return;
      }
      if (now - lastPaint > 33) {
        lastPaint = now;
        dbg({ phase: sinceStart < CALIBRATE_S && mode === "mic" ? "calibrating" : "downloading", db: Math.round(st.db), mb: Math.round(st.mb), speed: Math.round(st.speed) });
        force((n) => n + 1);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [mic, mode]);

  const st = s.current;
  const calibrating = mode === "mic" && (performance.now() - st.t0) / 1000 < CALIBRATE_S;
  const going = st.speed > 0.5;
  const pct = (st.mb / FILE.mb) * 100;
  const level = mode === "mic" ? Math.max(0, Math.min(1, (st.db - 40) / 65)) : Math.min(1, st.speed / 500);
  const loudness = Math.max(0, Math.min(1, (st.db - 92) / 14));
  const tap = () => {
    st.taps++;
    st.tapBurst = Math.min(900, st.tapBurst + TAP_MB * 6);
  };

  return (
    <section
      className={`relative w-full max-w-md ${going ? "rumble" : ""}`}
      style={{ ["--amp" as string]: `${(level * 5).toFixed(1)}px` }}
      onPointerDown={mode === "tap" ? tap : undefined}
      data-download
    >
      <div className="pointer-events-none fixed inset-0 z-0 bg-safety transition-opacity duration-100" style={{ opacity: loudness * 0.5 }} />

      <div className="relative z-10 overflow-hidden rounded-2xl border-4 border-hazard bg-ink-2">
        <div className="tape-thin h-3" />
        <div className="p-5">
          <div className="flex items-center justify-between font-mono text-[11px] uppercase tracking-[0.2em]">
            <span className="flex items-center gap-2">
              <span className={`size-2.5 rounded-full ${going ? "animate-pulse bg-signal" : "bg-alarm"}`} />
              {calibrating ? "calibrating… stay quiet 🤫" : going ? "receiving data from your lungs" : "⏸ paused · you stopped screaming"}
            </span>
          </div>
          <h2 className="mt-3 font-display text-[clamp(2.6rem,12vw,4rem)] uppercase leading-none tracking-wide">downloading</h2>
          <p className="mt-1 truncate font-mono text-[13px] text-hazard">📦 {FILE.name}</p>

          <div className="mt-5 h-9 overflow-hidden rounded-lg border-[3px] border-hazard bg-ink p-1">
            <div
              className="stripes h-full rounded-[4px]"
              style={{ width: `${Math.max(1.5, pct)}%`, ["--spd" as string]: `${Math.max(0.12, 1.4 - st.speed / 600)}s`, animationPlayState: going ? "running" : "paused" }}
            />
          </div>
          <div className="mt-2 flex justify-between font-mono text-[12.5px]">
            <span>
              {fmtGb(st.mb)} / {fmtGb(FILE.mb)}
            </span>
            <span className={going ? "text-signal" : "text-alarm"}>{Math.round(st.speed)} MB/s</span>
          </div>
          <p className="mt-1 font-mono text-[12px] text-muted">ETA: {calibrating ? "…" : etaText(FILE.mb - st.mb, st.speed)}</p>
        </div>
      </div>

      {mode === "mic" ? (
        <div className="relative z-10 mt-5 rounded-2xl border-2 border-line bg-ink-2 p-5">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-[10.5px] uppercase tracking-[0.25em] text-muted">volume (≈ dB)</p>
              <p className="font-display text-[clamp(3.6rem,17vw,5.2rem)] leading-none tabular-nums" style={{ color: st.db >= 96 ? "#ff2a2a" : st.db >= 80 ? "#ffd400" : "#f5f5f0" }}>
                {Math.round(st.db)}
              </p>
            </div>
            <p className="pb-2 text-right font-mono text-[13px] text-hazard">{labelFor(st.db)}</p>
          </div>
          <div className="mt-3 flex h-5 gap-[3px]">
            {Array.from({ length: SEGMENTS }, (_, i) => {
              const lit = i / SEGMENTS < level;
              const c = i < SEGMENTS * 0.55 ? "#39ff88" : i < SEGMENTS * 0.8 ? "#ffd400" : "#ff2a2a";
              return <span key={i} className="flex-1 rounded-[2px]" style={{ background: lit ? c : "#2c2c28" }} />;
            })}
          </div>
          <p className="mt-3 font-mono text-[12px] text-muted">neighbours: {neighboursFor(st.loud)}</p>
        </div>
      ) : (
        <button type="button" className="relative z-10 mt-5 h-44 w-full rounded-2xl border-4 border-hazard bg-safety font-display text-5xl uppercase text-ink active:scale-[0.98]">
          tap tap tap 👆
          <span className="mt-2 block font-mono text-[12px] normal-case">{st.taps} taps · your thumb is the router now</span>
        </button>
      )}

      {mode === "mic" ? (
        <motion.p
          className="relative z-10 mt-6 select-none overflow-hidden whitespace-nowrap text-center font-display uppercase leading-none text-hazard"
          style={{ fontSize: `${2.6 + level * 1.7}rem`, letterSpacing: `${level * 0.04}em` }}
        >
          {calibrating ? "shh…" : going ? "a".repeat(4 + Math.round(level * 5)) + "!" : "scream"}
        </motion.p>
      ) : null}
    </section>
  );
}
