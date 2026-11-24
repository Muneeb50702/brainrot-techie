import { lazy, Suspense, useCallback, useEffect, useState } from "react";
import { AnimatePresence } from "motion/react";
import { DayBadge } from "@kit/DayBadge";
import { Bolt } from "@kit/Bolt";
import { BRAND } from "@kit/brand";
import { cleanUsername, fetchGitHub, GhError, isValidUsername, type GhData, type GhErrorKind } from "./github";
import { computeAura, type AuraResult } from "./aura";
import { Hero } from "./components/Hero";
import { Loading } from "./components/Loading";
import { Result } from "./components/Result";

// WebGL shader is decoration: load it after first paint so the form is interactive ASAP.
const GrainBg = lazy(() => import("@kit/GrainBg").then((m) => ({ default: m.GrainBg })));

const DAY = 1;
const MIN_LOADING_MS = 2600; // the suspense is part of the content

type State =
  | { phase: "idle"; error?: string }
  | { phase: "loading"; username: string }
  | { phase: "result"; data: GhData; aura: AuraResult };

const ERRORS: Record<GhErrorKind, (e: GhError) => string> = {
  invalid: () => "that's not a valid github username bestie",
  notfound: () => "user not found. −100 aura for the typo 💀",
  org: () => "that's an org. orgs don't have aura, they have shareholders.",
  network: () => "wifi said no. try again.",
  ratelimit: (e) => {
    const mins = e.resetAt ? Math.max(1, Math.ceil((e.resetAt - Date.now()) / 60000)) : 30;
    return `github said touch grass (rate limit). back in ~${mins} min.`;
  },
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function App() {
  const [state, setState] = useState<State>({ phase: "idle" });

  const run = useCallback(async (raw: string) => {
    const username = cleanUsername(raw);
    if (!isValidUsername(username)) {
      setState({ phase: "idle", error: ERRORS.invalid(new GhError("invalid")) });
      return;
    }
    setState({ phase: "loading", username });
    window.scrollTo({ top: 0, behavior: "smooth" });
    try {
      const [data] = await Promise.all([fetchGitHub(username), sleep(MIN_LOADING_MS)]);
      setState({ phase: "result", data, aura: computeAura(data) });
      history.replaceState(null, "", `?u=${data.user.login}`);
    } catch (e) {
      const err = e instanceof GhError ? e : new GhError("network");
      setState({ phase: "idle", error: ERRORS[err.kind](err) });
      history.replaceState(null, "", location.pathname);
    }
  }, []);

  useEffect(() => {
    const u = new URLSearchParams(location.search).get("u");
    if (u) run(u);
  }, [run]);

  const reset = () => {
    setState({ phase: "idle" });
    history.replaceState(null, "", location.pathname);
  };

  return (
    <>
      <Suspense fallback={null}>
        <GrainBg />
      </Suspense>
      <div className="mx-auto flex min-h-dvh w-full max-w-6xl flex-col px-5 sm:px-8">
        <header className="flex items-center justify-between py-5">
          <button onClick={reset} className="flex items-center gap-2.5 font-mono text-[15px] font-extrabold tracking-tight">
            <span className="grid size-8 place-items-center rounded-lg bg-lime text-ink shadow-[3px_3px_0_#000]">
              <Bolt className="size-5" />
            </span>
            gitaura
          </button>
          <DayBadge day={DAY} />
        </header>

        <main className="flex flex-1 flex-col items-center justify-center py-8 sm:py-12">
          <AnimatePresence mode="wait">
            {state.phase === "idle" && <Hero key="hero" onSubmit={run} error={state.error} />}
            {state.phase === "loading" && <Loading key="loading" username={state.username} />}
            {state.phase === "result" && (
              <Result key={`r-${state.data.user.login}`} data={state.data} aura={state.aura} day={DAY} onReset={reset} />
            )}
          </AnimatePresence>
        </main>

        <footer className="pb-8 pt-6 text-center font-mono text-[11px] leading-relaxed text-muted">
          <p>public data only · runs 100% in your browser · not affiliated with github</p>
          <p className="mt-1">
            day {DAY} of {BRAND.series} ·{" "}
            <a href={`https://${BRAND.domain}`} className="text-white/70 underline-offset-4 hover:text-lime hover:underline">
              {BRAND.domain}
            </a>
          </p>
        </footer>
      </div>
    </>
  );
}
