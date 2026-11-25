import { useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import { CountUp } from "@kit/CountUp";
import { copyText, nodeToPng, shareImage } from "@kit/share";
import { doneness, focusLine, memoryLine, perRound, reflexLine, stroopLine, totalCooked, type Results } from "../game/scoring";
import { ShareCard } from "./ShareCard";

export const SCALE = [
  ["raw", "#1f8a4c"],
  ["rare", "#2443d6"],
  ["medium", "#d99a00"],
  ["well done", "#e8590c"],
  ["burnt", "#d62828"],
  ["charcoal", "#141414"],
] as const;

export function rows(res: Results) {
  const p = perRound(res);
  return [
    { e: "⚡", name: "reflex", value: `${res.reflex?.ms ?? "–"} ms`, line: res.reflex ? reflexLine(res.reflex.ms) : "", c: p.reflex },
    { e: "🧠", name: "memory", value: `span ${res.memory?.span ?? "–"}`, line: res.memory ? memoryLine(res.memory.span) : "", c: p.memory },
    { e: "🎨", name: "brain glitch", value: `${Math.round((res.stroop?.acc ?? 0) * 100)}%`, line: res.stroop ? stroopLine(res.stroop) : "", c: p.stroop },
    { e: "🫠", name: "focus", value: `${res.focus?.hits ?? 0}/${res.focus?.glitches ?? 4}`, line: res.focus ? focusLine(res.focus) : "", c: p.focus },
  ];
}

export function DonenessBar({ pct }: { pct: number }) {
  return (
    <div className="w-full">
      <div className="relative h-4 overflow-hidden rounded-full border-2 border-ink" style={{ background: `linear-gradient(90deg, ${SCALE.map(([, c], i) => `${c} ${(i / (SCALE.length - 1)) * 100}%`).join(",")})` }} />
      <motion.div className="relative h-0" initial={{ left: "0%" }} animate={{ left: `${pct}%` }} transition={{ duration: 2.2, ease: [0.16, 1, 0.3, 1] }}>
        <span className="absolute -translate-x-1/2 -translate-y-[30px] text-lg leading-none">▼</span>
      </motion.div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] uppercase text-muted">
        {SCALE.map(([n]) => (
          <span key={n}>{n}</span>
        ))}
      </div>
    </div>
  );
}

export function Report({ res, day, onRetake }: { res: Results; day: number; onRetake: () => void }) {
  const pct = useMemo(() => totalCooked(res), [res]);
  const d = doneness(pct);
  const r = rows(res);
  const [stamped, setStamped] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const id = useMemo(() => String(Math.floor(Math.random() * 90000) + 10000), []);
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  const text = `my brain is ${pct}% cooked (${d.name} ${d.emoji}). how cooked is yours? ${location.origin}`;

  const flash = (m: string) => {
    setToast(m);
    setTimeout(() => setToast(null), 2600);
  };
  const share = async () => {
    if (!cardRef.current) return;
    try {
      const blob = await nodeToPng(cardRef.current, 1080, 1920);
      const out = await shareImage(blob, "brain-scan.png", text);
      if (out === "downloaded") flash("saved 📲 post it on ur story");
    } catch {
      flash("the scanner jammed. try again");
    }
  };

  return (
    <motion.section key="report" initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }} className="flex w-full flex-col items-center">
      <div className="card relative w-full max-w-md overflow-hidden p-5 text-left sm:p-6">
        <div className="flex items-start justify-between font-mono text-[11px] uppercase tracking-[0.15em] text-muted">
          <span>
            brain scan report
            <br />#{id} · {date}
          </span>
          <span className="text-right">
            patient: you
            <br />
            referred by: the algorithm
          </span>
        </div>
        <div className="my-4 border-t-2 border-dashed border-line" />

        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">diagnosis</p>
        <div className="flex items-end gap-2">
          <CountUp value={pct} duration={2.2} signed={false} onDone={() => setStamped(true)} className="wide text-[clamp(4.5rem,24vw,7.5rem)] leading-[0.85]" />
          <span className="wide pb-2 text-[clamp(1.6rem,7vw,2.4rem)] leading-none">%</span>
        </div>
        <p className="wide text-[clamp(1.6rem,7.5vw,2.4rem)] uppercase leading-none">cooked</p>

        {stamped ? (
          <span className="stamp absolute right-4 top-[150px] text-[clamp(1.2rem,5.6vw,1.8rem)]" style={{ animation: "slam .5s cubic-bezier(.2,1.4,.4,1) both", borderColor: d.color, color: d.color }}>
            {d.name} {d.emoji}
          </span>
        ) : null}

        <div className="mt-6">
          <DonenessBar pct={pct} />
        </div>
        <div className="my-5 border-t-2 border-dashed border-line" />

        <div className="space-y-3">
          {r.map((x, i) => (
            <motion.div key={x.name} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 + i * 0.12 }}>
              <div className="flex items-baseline gap-2">
                <span className="text-lg">{x.e}</span>
                <b className="wide text-[13px] uppercase">{x.name}</b>
                <span className="ml-auto font-mono text-[13px] font-semibold">{x.value}</span>
              </div>
              <div className="mt-1 flex items-center gap-2">
                <span className="flex-1 font-mono text-[11.5px] text-muted">{x.line}</span>
                <span className="h-2 w-20 overflow-hidden rounded-full border border-ink">
                  <span className="block h-full" style={{ width: `${Math.max(4, x.c * 100)}%`, background: doneness(x.c * 100).color }} />
                </span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="my-5 border-t-2 border-dashed border-line" />
        <p className="font-mono text-[11px] uppercase tracking-[0.3em] text-muted">doctor's note</p>
        <p className="mt-1 text-[17px] italic leading-snug text-pen">"{d.note}"</p>
        <p className="mt-3 font-mono text-[12.5px]">
          <b>℞</b> {d.rx}
        </p>
        <p className="mt-4 text-right font-mono text-[11px] italic text-muted">— dr. b. rot, md (medically dramatic)</p>
      </div>

      <div className="mt-6 flex w-full max-w-md flex-col gap-3">
        <button onClick={share} className="btn-chunky h-14 bg-stamp px-5 text-[17px] text-white">
          share my brain scan 📲
        </button>
        <div className="flex gap-3">
          <button onClick={onRetake} className="btn-chunky h-12 flex-1 bg-paper px-4 text-[15px] text-ink">
            retake 🔁
          </button>
          <button onClick={async () => flash((await copyText(text)) ? "copied. make the gc take it 😈" : "copy failed")} className="btn-chunky h-12 flex-1 bg-hl px-4 text-[15px] text-ink">
            challenge a friend 😈
          </button>
        </div>
      </div>
      <p className="mt-5 max-w-sm text-center font-mono text-[10.5px] leading-relaxed text-muted">
        based on real tests (reaction time, spatial memory span, stroop, vigilance) vs. typical adult results. for fun, not a diagnosis. touch grass anyway.
      </p>

      <ShareCard ref={cardRef} res={res} pct={pct} day={day} id={id} />
      {toast ? <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-3 font-mono text-sm font-bold text-cream shadow-2xl">{toast}</div> : null}
    </motion.section>
  );
}
