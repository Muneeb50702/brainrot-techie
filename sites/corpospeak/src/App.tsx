import { lazy, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { DayBadge } from "@kit/DayBadge";
import { SourceLink } from "@kit/SourceLink";
import { BRAND } from "@kit/brand";
import { callTool, ToolError, type ToolErrorKind } from "@kit/api";
import { nodeToPng, shareImage, copyText } from "@kit/share";
import { Composer } from "./components/Composer";
import { Result } from "./components/Result";
import { Thinking } from "./components/Thinking";
import { ShareCard } from "./components/ShareCard";
import type { Mode, Translation } from "./types";

const GrainBg = lazy(() => import("@kit/GrainBg").then((m) => ({ default: m.GrainBg })));

const DAY = 2;

const ERRORS: Record<ToolErrorKind, string> = {
  rate_limited: "slow down bestie. 8 translations a minute max 🫠",
  not_configured: "the translator is still clocking in. try again in a sec ☕",
  refused: "HR blocked this one 💀 try something else",
  busy: "our AI is on a coffee break. try again in a moment ☕",
  upstream: "the translator tripped over a buzzword. try again",
  bad_input: "type something first (max 400 chars)",
  network: "wifi said no. try again.",
};

export default function App() {
  const [mode, setMode] = useState<Mode>("corp2z");
  const [text, setText] = useState("");
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<Translation | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const reqRef = useRef<AbortController | null>(null);

  const translate = useCallback(async (input: string, m: Mode) => {
    reqRef.current?.abort();
    const ctrl = new AbortController();
    reqRef.current = ctrl;
    setBusy(true);
    setError(null);
    setResult(null);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 50);
    try {
      const r = await callTool<Translation>("corpospeak", { mode: m, text: input }, ctrl.signal);
      setResult(r);
      history.replaceState(null, "", `?m=${m}&t=${encodeURIComponent(input)}`);
    } catch (e) {
      if ((e as DOMException)?.name === "AbortError") return;
      setError(ERRORS[e instanceof ToolError ? e.kind : "upstream"]);
    } finally {
      if (reqRef.current === ctrl) setBusy(false);
    }
  }, []);

  // Deep links: ?m=corp2z&t=... (served from the edge cache when someone shares it)
  useEffect(() => {
    const q = new URLSearchParams(location.search);
    const m = q.get("m") === "z2corp" ? "z2corp" : "corp2z";
    const t = q.get("t")?.slice(0, 400);
    if (t) {
      setMode(m);
      setText(t);
      translate(t, m);
    }
  }, [translate]);

  const changeMode = (m: Mode) => {
    setMode(m);
    setResult(null);
    setError(null);
  };

  const flip = () => {
    if (!result) return;
    const next: Mode = result.mode === "corp2z" ? "z2corp" : "corp2z";
    setMode(next);
    setText(result.translation);
    translate(result.translation, next);
  };

  const flash = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 2600);
  };

  const share = async () => {
    if (!cardRef.current || !result) return;
    try {
      const blob = await nodeToPng(cardRef.current, 1080, 1920);
      const r = await shareImage(blob, `corpospeak-${Date.now()}.png`, `my boss vs the group chat 💀 ${location.href}`);
      if (r === "downloaded") flash("saved 📲 post it on ur story");
    } catch {
      flash("the printer is jammed. try again");
    }
  };

  return (
    <>
      <Suspense fallback={null}>
        <GrainBg colors={["#4f7cff", "#c6ff3d", "#7c5cff"]} shape="wave" />
      </Suspense>
      <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-5">
          <a href="/" className="flex items-center gap-2.5 font-mono text-[15px] font-extrabold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-lime text-[15px] shadow-[3px_3px_0_#000]">👔</span>
            corpospeak
          </a>
          <DayBadge day={DAY} />
        </header>

        <main className="flex flex-1 flex-col items-center pb-10 pt-6 text-center sm:pt-10">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-4 font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
            corporate ↔ gen z translator · no cap
          </motion.p>
          <motion.h1
            initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-[15ch] text-[clamp(2.5rem,10vw,5rem)] font-extrabold leading-[0.92] tracking-[-0.045em]"
          >
            translate your boss into{" "}
            <span className="sticker animate-float text-[0.9em]" style={{ ["--r" as string]: "-3deg" }}>
              gen z
            </span>
          </motion.h1>
          <p className="mt-5 max-w-[36ch] text-[15px] leading-relaxed text-white/65 sm:text-base">
            paste the corporate email. get what they <i>actually</i> mean. or go the other way and make "i'm cooked" sound promotion-ready.
          </p>

          <div className="mt-8 w-full">
            <Composer mode={mode} setMode={changeMode} value={text} setValue={setText} onSubmit={(t) => translate(t, mode)} busy={busy} />
          </div>

          <div ref={resultRef} className="mt-8 w-full scroll-mt-6">
            <AnimatePresence mode="wait">
              {busy ? <Thinking key="thinking" mode={mode} /> : null}
            </AnimatePresence>
            {error ? (
              <p role="alert" className="mx-auto w-fit rounded-xl border border-pink/40 bg-pink/10 px-4 py-2 font-mono text-sm text-pink">
                {error}
              </p>
            ) : null}
            {result && !busy ? (
              <div key={result.input + result.mode}>
                <Result r={result} />
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <button onClick={share} className="btn-chunky h-14 flex-1 bg-lime px-5 text-[16px] text-ink">
                    share card 📲
                  </button>
                  <button onClick={flip} className="btn-chunky h-14 flex-1 border-white/20 bg-white/10 px-5 text-[15px] text-white" style={{ boxShadow: "0 4px 0 0 rgba(255,255,255,.12)" }}>
                    translate it back 🔁
                  </button>
                  <button
                    onClick={async () => flash((await copyText(result.translation)) ? "copied. send it 🫡" : "copy failed")}
                    className="btn-chunky h-14 border-white/20 bg-white/10 px-5 text-[15px] text-white"
                    style={{ boxShadow: "0 4px 0 0 rgba(255,255,255,.12)" }}
                  >
                    copy
                  </button>
                </div>
                <ShareCard ref={cardRef} r={result} day={DAY} />
              </div>
            ) : null}
          </div>
        </main>

        <footer className="pb-8 pt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          <SourceLink slug="corpospeak" className="mb-4" />
          <p>for laughs only · we don't store what you type · don't paste real secrets lol</p>
          <p className="mt-1">
            day {DAY} of {BRAND.series} ·{" "}
            <a href={`https://${BRAND.domain}`} className="text-white/70 underline-offset-4 hover:text-lime hover:underline">
              {BRAND.domain}
            </a>
          </p>
        </footer>
      </div>

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
    </>
  );
}
