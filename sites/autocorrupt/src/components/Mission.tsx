import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { replyFor, roll, STRIKE, UNDO, type Mission as M } from "../game/content";
import { commitWord, dignityOf, fixToken, messageOf, recurse, type Token } from "../game/engine";
import { dbg } from "../game/debug";
import { Villain } from "./Villain";

export type MissionResult = { contact: M["contact"]; name: string; avatar: string; message: string; tokens: Token[]; dignity: number; reply: string };

type Phase = "brief" | "typing" | "sent" | "read" | "typingReply" | "replied";
const pick = (a: string[]) => a[Math.floor(Math.random() * a.length)];

export function Mission({ m, idx, total, onDone }: { m: M; idx: number; total: number; onDone: (r: MissionResult) => void }) {
  const [phase, setPhase] = useState<Phase>("brief");
  const [tokens, setTokens] = useState<Token[]>([]);
  const [partial, setPartial] = useState("");
  const [left, setLeft] = useState(m.seconds);
  const [villain, setVillain] = useState({ line: "", k: 0 });
  const [result, setResult] = useState<MissionResult | null>(null);
  const input = useRef<HTMLInputElement>(null);
  const tokRef = useRef(tokens);
  tokRef.current = tokens;
  const partRef = useRef(partial);
  partRef.current = partial;
  const sentRef = useRef(false);

  const say = (line: string) => setVillain((v) => ({ line, k: v.k + 1 }));

  useEffect(() => {
    dbg({ mission: idx, phase, target: m.target, tokens: tokens.map((t) => ({ id: t.id, text: t.text, cursed: t.cursed })), partial });
  }, [idx, phase, m.target, tokens, partial]);

  // countdown → auto-send
  useEffect(() => {
    if (phase !== "typing") return;
    const id = window.setInterval(() => setLeft((s) => Math.max(0, +(s - 0.1).toFixed(1))), 100);
    return () => clearInterval(id);
  }, [phase]);
  useEffect(() => {
    if (phase === "typing" && left <= 0) send();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [left, phase]);

  // on the crush mission, words you fixed can relapse 😈
  useEffect(() => {
    if (phase !== "typing" || !m.extras) return;
    const id = window.setInterval(() => {
      const fixed = tokRef.current.filter((t) => !t.cursed && t.orig.length >= 3);
      if (fixed.length && roll() < 0.35) {
        const victim = fixed[Math.floor(roll() * fixed.length)];
        setTokens((ts) => ts.map((t) => (t.id === victim.id ? recurse(t, m) : t)));
        say("nope. changed it back 😈");
      }
    }, 3200);
    return () => clearInterval(id);
  }, [phase, m]);

  const start = () => {
    setPhase("typing");
    input.current?.focus(); // inside the tap, so phones open the keyboard
    say("i'll help u type 😈");
  };

  const onChange = (v: string) => {
    if (phase !== "typing") return;
    if (!/\s/.test(v)) return setPartial(v);
    const parts = v.split(/\s+/);
    const rest = parts.pop() ?? "";
    const added: Token[] = [];
    for (const w of parts) if (w) added.push(commitWord(w, m));
    if (added.length) {
      setTokens((ts) => [...ts, ...added]);
      if (added.some((t) => t.cursed)) say(pick(STRIKE));
    }
    setPartial(rest);
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      send();
    } else if (e.key === "Backspace" && partRef.current === "" && tokRef.current.length) {
      e.preventDefault();
      const last = tokRef.current[tokRef.current.length - 1];
      setTokens((ts) => ts.slice(0, -1));
      setPartial(last.cursed ? last.orig : last.text);
    }
  };

  const fix = (id: number) => {
    setTokens((ts) => ts.map((t) => (t.id === id ? fixToken(t) : t)));
    say(pick(UNDO));
    input.current?.focus();
  };

  function send() {
    if (sentRef.current) return;
    sentRef.current = true;
    const toks = tokRef.current;
    const part = partRef.current;
    const dignity = dignityOf(toks, part, m.target);
    const res: MissionResult = {
      contact: m.contact, name: m.name, avatar: m.avatar,
      message: messageOf(toks, part) || "…", tokens: toks, dignity, reply: replyFor(m.contact, dignity),
    };
    setResult(res);
    input.current?.blur();
    setPhase("sent");
    window.setTimeout(() => setPhase("read"), 900);
    window.setTimeout(() => setPhase("typingReply"), 1700);
    window.setTimeout(() => setPhase("replied"), res.reply ? 3300 : 2600);
  }

  const words = m.target.split(" ");
  const cursedCount = tokens.filter((t) => t.cursed).length;

  return (
    <motion.section key={`m-${idx}`} initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -50 }} transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="relative w-full max-w-md">
      {/* the phone chat */}
      <div className="overflow-hidden rounded-[28px] border-[3px] border-ink bg-paper shadow-[8px_8px_0_#160f2e]" style={{ fontFamily: "var(--font-chat)" }}>
        <header className="flex items-center gap-3 border-b border-line bg-[#f7f5ff] px-4 py-3">
          <span className="grid size-10 place-items-center rounded-full bg-grey text-xl">{m.avatar}</span>
          <span className="min-w-0 flex-1">
            <b className="block truncate text-[15px]">{m.name}</b>
            <span className="block text-[12px] text-muted">{phase === "typingReply" ? "typing…" : m.status}</span>
          </span>
          <span className="font-display text-sm text-muted">
            {idx + 1}/{total}
          </span>
        </header>

        <div className="flex min-h-[230px] flex-col gap-2 px-3 py-4 text-[15.5px] leading-snug">
          {m.prompt ? (
            <div className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-grey px-3.5 py-2">{m.prompt}</div>
          ) : (
            <p className="self-center text-[12px] text-muted">you haven't texted in 3 days. make it count.</p>
          )}

          {result ? (
            <>
              <motion.div initial={{ opacity: 0, y: 14, scale: 0.95 }} animate={{ opacity: 1, y: 0, scale: 1 }} className="max-w-[85%] self-end rounded-2xl rounded-br-md bg-bubble px-3.5 py-2 text-white">
                {result.tokens.length
                  ? result.tokens.map((t, i) => (
                      <span key={t.id}>
                        {i ? " " : ""}
                        <span className={t.cursed ? "rounded bg-acid/90 px-0.5 text-ink" : ""}>{t.text}</span>
                      </span>
                    ))
                  : result.message}
                {partial.trim() ? ` ${partial.trim()}` : ""}
              </motion.div>
              <p className="-mt-1 self-end pr-1 text-[11px] text-muted">{phase === "sent" ? "Delivered" : "Read 9:41"}</p>
              {phase === "typingReply" && result.reply ? (
                <div className="flex gap-1 self-start rounded-2xl bg-grey px-3.5 py-3">
                  {[0, 1, 2].map((d) => (
                    <span key={d} className="size-2 rounded-full bg-muted" style={{ animation: `typing-dot 1s ${d * 0.15}s infinite` }} />
                  ))}
                </div>
              ) : null}
              {phase === "replied" && result.reply ? (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="max-w-[80%] self-start rounded-2xl rounded-bl-md bg-grey px-3.5 py-2">
                  {result.reply}
                </motion.div>
              ) : null}
              {phase === "replied" && !result.reply ? <p className="self-end pr-1 text-[12px] font-semibold text-squiggle">left on read 💀</p> : null}
            </>
          ) : null}
        </div>

        {/* composer */}
        {phase === "typing" || phase === "brief" ? (
          <div className="border-t border-line bg-[#f7f5ff] p-3">
            <div className="mb-2 flex flex-wrap gap-x-1.5 gap-y-0.5 font-display text-[13px] text-muted">
              <span className="text-ink">type:</span>
              {words.map((w, i) => (
                <span key={i} className={i === tokens.length ? "rounded bg-acid px-1 text-ink" : i < tokens.length ? "opacity-40" : ""}>
                  {w}
                </span>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <div onPointerDown={(e) => { e.preventDefault(); input.current?.focus(); }} data-composer className="relative min-h-[46px] flex-1 cursor-text rounded-2xl border-2 border-line bg-paper px-3 py-2.5 text-[16px] leading-snug">
                {tokens.map((t, i) => (
                  <span key={t.id}>
                    {i ? " " : ""}
                    {t.cursed ? (
                      <button
                        type="button"
                        data-cursed={t.id}
                        onPointerDown={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          fix(t.id);
                        }}
                        className="cursed glitch-in rounded font-semibold text-squiggle"
                      >
                        {t.text}
                      </button>
                    ) : (
                      <span>{t.text}</span>
                    )}
                  </span>
                ))}
                {tokens.length ? " " : ""}
                <span>{partial}</span>
                {phase === "typing" ? <span className="ml-px inline-block h-[1.1em] w-[2px] translate-y-[3px] animate-pulse bg-bubble" /> : null}
                {!tokens.length && !partial ? <span className="text-muted">text message</span> : null}
                <input
                  ref={input}
                  value={partial}
                  onChange={(e) => onChange(e.target.value)}
                  onKeyDown={onKeyDown}
                  aria-label={`Type your text to ${m.contact}`}
                  autoCapitalize="none"
                  autoCorrect="off"
                  autoComplete="off"
                  spellCheck={false}
                  enterKeyHint="send"
                  className="absolute bottom-0 left-0 h-px w-px opacity-0"
                  style={{ fontSize: 16 }}
                />
              </div>
              <button type="button" data-send onPointerDown={(e) => { e.preventDefault(); send(); }} disabled={phase !== "typing"} className="grid size-11 shrink-0 place-items-center rounded-full bg-bubble text-xl text-white disabled:opacity-40" aria-label="Send">
                ↑
              </button>
            </div>
            {phase === "typing" ? (
              <div className="mt-2 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-line">
                  <div className="h-full rounded-full bg-villain transition-[width] duration-100" style={{ width: `${(left / m.seconds) * 100}%` }} />
                </div>
                <span className="font-display text-[12px] tabular-nums text-muted">{Math.ceil(left)}s</span>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      {phase === "typing" ? (
        <div className="mt-4 flex items-center justify-between">
          <Villain line={villain.line} k={villain.k} />
          {cursedCount ? <span className="font-display text-[13px] text-squiggle">tap red words to fix</span> : null}
        </div>
      ) : null}

      {/* brief */}
      <AnimatePresence>
        {phase === "brief" ? (
          <motion.div exit={{ opacity: 0 }} className="absolute inset-0 z-10 grid place-items-center rounded-[28px] bg-lilac/85 p-5 backdrop-blur-sm">
            <div className="w-full rounded-3xl border-[3px] border-ink bg-paper p-5 text-center shadow-[6px_6px_0_#160f2e]">
              <p className="font-display text-sm text-muted">mission {idx + 1}/{total}</p>
              <p className="mt-2 text-5xl">{m.avatar}</p>
              <p className="mt-2 font-display text-2xl font-bold">text your {m.contact}:</p>
              <p className="mx-auto mt-3 max-w-[26ch] rounded-2xl rounded-br-md bg-bubble px-4 py-2.5 text-[16px] text-white" style={{ fontFamily: "var(--font-chat)" }}>
                {m.target}
              </p>
              <p className="mt-4 font-display text-[14px] text-villain">
                autocorrect is {["a little sus", "kinda evil", "FULLY POSSESSED"][idx] ?? "evil"} this round 😈
              </p>
              <button type="button" data-start onClick={start} className="btn-chunky mt-5 h-14 w-full bg-ink px-5 font-display text-[18px] text-paper">
                start typing ⌨️
              </button>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      {/* verdict for this text */}
      {phase === "replied" && result ? (
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-5 flex items-center justify-between gap-3">
          <span className="font-display text-[17px]">
            dignity preserved: <b className={result.dignity >= 0.65 ? "text-mint" : "text-squiggle"}>{Math.round(result.dignity * 100)}%</b>
          </span>
          <button type="button" data-next onClick={() => onDone(result)} className="btn-chunky h-12 bg-villain px-5 font-display text-[16px] text-ink">
            {idx + 1 < total ? "next text →" : "results →"}
          </button>
        </motion.div>
      ) : null}
    </motion.section>
  );
}
