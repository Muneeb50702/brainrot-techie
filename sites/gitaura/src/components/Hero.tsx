import { useState, type FormEvent } from "react";
import { motion } from "motion/react";
import { BorderBeamPanel } from "@kit/BorderBeamPanel";
import { Marquee } from "@kit/Marquee";
import { Bolt } from "@kit/Bolt";
import { SourceLink } from "@kit/SourceLink";

const TRY = ["torvalds", "gaearon", "sindresorhus", "yyx990803"];

const TICKER: [number, string][] = [
  [333, "commits at 3am"],
  [-420, "20 commits that say \"fix\""],
  [200, "rust main (we know)"],
  [-150, "follows 900, followed by 12"],
  [100, "profile README. main character"],
  [-240, "6 todo apps. tutorial hell"],
  [138, "emotional damage: \"pls work\""],
  [-69, "html main"],
  [120, "conventional commits. corporate rizz"],
  [-200, "last push 400 days ago"],
];

function Chip({ p, label }: { p: number; label: string }) {
  const up = p > 0;
  return (
    <span className="mx-1.5 inline-flex items-center gap-2 whitespace-nowrap rounded-full border border-line bg-ink/70 px-3 py-1.5 font-mono text-xs text-white/80 backdrop-blur">
      <span className={up ? "font-bold text-lime" : "font-bold text-pink"}>
        {up ? "+" : "−"}
        {Math.abs(p)}
      </span>
      {label}
    </span>
  );
}

export function Hero({ onSubmit, error }: { onSubmit: (u: string) => void; error?: string }) {
  const [value, setValue] = useState("");
  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim()) onSubmit(value);
  };

  return (
    <motion.section
      key="hero"
      initial={{ opacity: 0, y: 24, filter: "blur(8px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ opacity: 0, y: -24, filter: "blur(8px)" }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex w-full flex-col items-center text-center"
    >
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-5 font-mono text-[11px] uppercase tracking-[0.25em] text-muted"
      >
        github aura calculator · no cap
      </motion.p>

      <h1 className="max-w-[14ch] text-[clamp(2.7rem,10.5vw,6.2rem)] font-extrabold leading-[0.9] tracking-[-0.045em]">
        how much{" "}
        <span className="sticker animate-float text-[0.92em]" style={{ ["--r" as string]: "-3deg" }}>
          aura
        </span>{" "}
        does your github have?
      </h1>

      <p className="mt-6 max-w-[38ch] text-[15px] leading-relaxed text-white/65 sm:text-base">
        we read your public commits, stars &amp; 3am energy. then we judge you. no login. no servers. no mercy.
      </p>

      <BorderBeamPanel className="mt-9 max-w-xl p-2" radius={22}>
        <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
          <label className="flex min-w-0 flex-1 items-center rounded-2xl bg-ink px-4 font-mono text-[15px] focus-within:ring-2 focus-within:ring-lime/60">
            <span className="select-none text-muted">github.com/</span>
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="username"
              aria-label="GitHub username"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
              className="h-14 min-w-0 flex-1 bg-transparent text-white outline-none placeholder:text-white/25"
            />
          </label>
          <button type="submit" className="btn-chunky h-14 bg-lime px-6 text-[17px] text-ink">
            calc aura <Bolt className="size-5" />
          </button>
        </form>
      </BorderBeamPanel>

      {error ? (
        <motion.p
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          role="alert"
          className="mt-4 rounded-xl border border-pink/40 bg-pink/10 px-4 py-2 font-mono text-sm text-pink"
        >
          {error}
        </motion.p>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 font-mono text-xs text-muted">
        <span>or stalk:</span>
        {TRY.map((u) => (
          <button
            key={u}
            type="button"
            onClick={() => onSubmit(u)}
            className="rounded-full border border-line px-2.5 py-1 text-white/70 transition-colors hover:border-lime hover:text-lime"
          >
            @{u}
          </button>
        ))}
      </div>

      <SourceLink slug="gitaura" className="mt-6" />

      <div className="mt-12 w-screen max-w-none space-y-3">
        <Marquee duration={45}>
          {TICKER.slice(0, 5).map(([p, l]) => (
            <Chip key={l} p={p} label={l} />
          ))}
        </Marquee>
        <Marquee duration={52} reverse>
          {TICKER.slice(5).map(([p, l]) => (
            <Chip key={l} p={p} label={l} />
          ))}
        </Marquee>
      </div>
    </motion.section>
  );
}
