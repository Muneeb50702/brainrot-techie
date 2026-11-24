import type { FormEvent } from "react";
import { AnimatePresence, motion } from "motion/react";
import { BorderBeamPanel } from "@kit/BorderBeamPanel";
import { MODE_META, PRESETS, type Mode } from "../types";

const MAX = 400;

function ModeSwitch({ mode, setMode }: { mode: Mode; setMode: (m: Mode) => void }) {
  return (
    <div role="tablist" aria-label="Translation direction" className="relative grid grid-cols-2 rounded-2xl border border-line bg-ink/70 p-1 font-mono text-[13px] backdrop-blur sm:text-sm">
      {(["corp2z", "z2corp"] as Mode[]).map((m) => {
        const meta = MODE_META[m];
        const active = m === mode;
        return (
          <button
            key={m}
            role="tab"
            aria-selected={active}
            onClick={() => setMode(m)}
            className={`relative z-10 flex items-center justify-center gap-1.5 rounded-xl px-2 py-2.5 font-bold transition-colors ${active ? "text-ink" : "text-white/60 hover:text-white"}`}
          >
            {active ? (
              <motion.span layoutId="mode-pill" className="absolute inset-0 -z-10 rounded-xl bg-lime" transition={{ type: "spring", stiffness: 500, damping: 34 }} />
            ) : null}
            <span className="sm:hidden">
              {meta.fromEmoji} {meta.from.replace("corporate", "corp")} → {meta.toEmoji} {meta.to.replace("corporate", "corp")}
            </span>
            <span className="hidden sm:inline">
              {meta.fromEmoji} {meta.from} → {meta.toEmoji} {meta.to}
            </span>
          </button>
        );
      })}
    </div>
  );
}

export function Composer({
  mode,
  setMode,
  value,
  setValue,
  onSubmit,
  busy,
}: {
  mode: Mode;
  setMode: (m: Mode) => void;
  value: string;
  setValue: (v: string) => void;
  onSubmit: (text: string) => void;
  busy: boolean;
}) {
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !busy) onSubmit(value.trim());
  };
  const corp = mode === "corp2z";

  return (
    <div className="w-full space-y-3">
      <ModeSwitch mode={mode} setMode={setMode} />

      <BorderBeamPanel radius={22} colors={corp ? ["#4f7cff", "#c6ff3d"] : ["#c6ff3d", "#ff3da5"]}>
        <form onSubmit={submit}>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 6 }}
              transition={{ duration: 0.18 }}
              className="border-b border-line px-4 py-3 text-left font-mono text-[11.5px] leading-relaxed text-muted"
            >
              {corp ? (
                <>
                  <p>
                    <span className="text-white/40">from:</span> your manager &lt;boss@company.example&gt;
                  </p>
                  <p>
                    <span className="text-white/40">subject:</span> quick sync 🙂
                  </p>
                </>
              ) : (
                <p className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-lime shadow-[0_0_8px_#c6ff3d]" />
                  the group chat 💬 · 4 online · typing…
                </p>
              )}
            </motion.div>
          </AnimatePresence>

          <textarea
            value={value}
            onChange={(e) => setValue(e.target.value.slice(0, MAX))}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) submit(e);
            }}
            rows={3}
            aria-label={corp ? "Corporate text to translate" : "Gen Z text to translate"}
            placeholder={corp ? "paste the corporate email that ruined your morning…" : "type it how you'd say it in the gc…"}
            className="block w-full resize-none bg-transparent px-4 pt-4 pb-2 text-[17px] leading-snug text-white outline-none placeholder:text-white/25"
          />
          <div className="flex items-center justify-between gap-3 px-3 pb-3">
            <span className="pl-1 font-mono text-[11px] text-muted">
              {value.length}/{MAX}
            </span>
            <button type="submit" disabled={busy || !value.trim()} className="btn-chunky h-12 bg-lime px-5 text-[16px] text-ink disabled:opacity-50">
              {busy ? "translating…" : "translate 🔁"}
            </button>
          </div>
        </form>
      </BorderBeamPanel>

      <div className="flex flex-wrap justify-center gap-2 pt-1">
        {PRESETS[mode].map((p) => (
          <button
            key={p}
            type="button"
            disabled={busy}
            onClick={() => {
              setValue(p);
              onSubmit(p);
            }}
            className="max-w-full truncate rounded-full border border-line bg-ink/60 px-3 py-1.5 text-left font-mono text-[11.5px] text-white/70 backdrop-blur transition-colors hover:border-lime hover:text-lime disabled:opacity-50"
          >
            {p}
          </button>
        ))}
      </div>
    </div>
  );
}
