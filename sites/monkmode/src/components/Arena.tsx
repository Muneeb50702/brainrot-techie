import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import { NOTIFS, POPUPS, T, TRAPS, ZEN, spawnGap, type Notif, type Popup, type TrapKind } from "../game/content";
import * as sfx from "../game/audio";
import { ClaimButton, FakeWin, Floater, GlitchOverlay, IncomingCall, NotifBanner, PopupCard, SkipAd } from "./Baits";
import { Bug, Crack, Dim, FakeOver, FreezeDialog, Hair, LockScreen, Mock, PauseOverlay } from "./Traps";

const activeTraps = (t: number) => TRAPS.filter((tr) => t >= tr.at && t < tr.at + tr.dur);

export type Outcome = "lose" | "trap" | "win";
export type RunResult = { seconds: number; outcome: Outcome; by: string };

type Bait =
  | { id: number; kind: "notif"; n: Notif; born: number; until: number }
  | { id: number; kind: "popup"; p: Popup; x: number; y: number; born: number; until: number }
  | { id: number; kind: "claim"; text: string; x: number; y: number; born: number; until: number }
  | { id: number; kind: "floater" | "glitch" | "skip" | "call"; born: number; until: number };

const CLAIMS = ["claim 1000 aura 🪙", "tap for a free skin 🎁", "+50 rizz 👆", "double tap for luck 🍀", "free wifi 📶 tap"];
const pick = <X,>(a: X[]) => a[(Math.random() * a.length) | 0];
const rand = (a: number, b: number) => a + Math.random() * (b - a);
const zenAt = (t: number) => [...ZEN].reverse().find(([s]) => t >= s)?.[1] ?? "";

function weighted(t: number): Bait["kind"] {
  const table: [Bait["kind"], number][] =
    t < T.popupsFrom
      ? [["notif", 1]]
      : t < T.chaosFrom
        ? [["notif", 55], ["popup", 20], ["claim", 15], ["skip", 10]]
        : t < T.maxChaosFrom
          ? [["notif", 40], ["popup", 20], ["claim", 15], ["floater", 10], ["glitch", 8], ["skip", 7]]
          : [["notif", 35], ["popup", 22], ["claim", 15], ["glitch", 13], ["floater", 8], ["skip", 7]];
  let r = Math.random() * table.reduce((s, [, w]) => s + w, 0);
  for (const [k, w] of table) if ((r -= w) <= 0) return k;
  return "notif";
}

/** `speed` > 1 only for demo recordings (?speed=2.5); the game clock runs that much faster. */
export function Arena({ onEnd, speed = 1 }: { onEnd: (r: RunResult) => void; speed?: number }) {
  const [t, setT] = useState(0);
  const [baits, setBaits] = useState<Bait[]>([]);
  const [fakeWin, setFakeWin] = useState(false);
  const [shake, setShake] = useState(false);

  const start = useRef(performance.now());
  const ended = useRef(false);
  const nextSpawn = useRef(T.notifsFrom);
  const callDone = useRef(false);
  const calmed = useRef(false);
  const ids = useRef(0);
  const baitsRef = useRef<Bait[]>([]);
  const fakeWinRef = useRef(false);
  const fired = useRef(new Set<TrapKind>());
  baitsRef.current = baits;

  const finish = useCallback(
    (outcome: Outcome, by: string) => {
      if (ended.current) return;
      ended.current = true;
      sfx.stopRing();
      outcome === "win" ? sfx.win() : sfx.lose();
      onEnd({ seconds: ((performance.now() - start.current) / 1000) * speed, outcome, by });
    },
    [onEnd, speed],
  );

  const spawn = useCallback((now: number) => {
    const kind = weighted(now);
    const id = ++ids.current;
    const cur = baitsRef.current;
    let b: Bait | null = null;
    if (kind === "notif") {
      b = { id, kind, n: pick(NOTIFS), born: now, until: now + 4.6 };
      sfx.ding();
    } else if (kind === "popup" && cur.filter((x) => x.kind === "popup").length < 2) {
      b = { id, kind, p: pick(POPUPS), x: rand(32, 68), y: rand(38, 66), born: now, until: now + 3.8 };
      sfx.pop();
    } else if (kind === "claim") {
      b = { id, kind, text: pick(CLAIMS), x: rand(25, 75), y: rand(30, 80), born: now, until: now + 3 };
      sfx.pop();
    } else if (kind === "floater" && !cur.some((x) => x.kind === "floater")) {
      b = { id, kind, born: now, until: now + 12 };
    } else if (kind === "skip" && !cur.some((x) => x.kind === "skip")) {
      b = { id, kind, born: now, until: now + 6 };
    } else if (kind === "glitch") {
      b = { id, kind, born: now, until: now + 1.2 };
      sfx.error();
      setShake(true);
      setTimeout(() => setShake(false), 950);
    }
    if (!b) return;
    const next = [...cur, b];
    const notifs = next.filter((x) => x.kind === "notif");
    setBaits(notifs.length > 3 ? next.filter((x) => x !== notifs[0]) : next);
  }, []);

  // Main loop: clock + expiry + scheduler.
  useEffect(() => {
    let raf = 0;
    let lastPaint = 0;
    const loop = (ts: number) => {
      if (ended.current) return;
      const now = ((ts - start.current) / 1000) * speed;
      if (ts - lastPaint > 30) {
        setT(now);
        lastPaint = ts;
      }
      const cur = baitsRef.current;
      let alive = cur.filter((b) => b.until > now);
      if (alive.length !== cur.length) {
        if (cur.some((b) => b.kind === "call") && !alive.some((b) => b.kind === "call")) sfx.stopRing();
        setBaits(alive);
      }

      // Scripted traps: fire each one's entry effect exactly once.
      const traps = activeTraps(now);
      for (const tr of traps) {
        if (fired.current.has(tr.kind)) continue;
        fired.current.add(tr.kind);
        if (tr.kind === "crack") {
          sfx.crack();
          setShake(true);
          setTimeout(() => setShake(false), 950);
        } else if (tr.kind === "lock") sfx.click();
        else if (tr.kind === "fakeover") sfx.lose();
        if (tr.kind === "dim" || tr.kind === "lock" || tr.kind === "pause" || tr.kind === "fakeover") {
          alive = [];
          setBaits([]);
        }
      }
      const blocked = traps.some((tr) => tr.blocking);

      if (fakeWinRef.current) {
        if (now >= T.ascend) finish("win", "nothing. absolutely nothing.");
      } else if (now >= T.fakeWin) {
        fakeWinRef.current = true;
        setFakeWin(true);
        setBaits([]);
        sfx.win();
      } else if (now >= T.calmFrom) {
        if (!calmed.current) {
          calmed.current = true;
          setBaits([]);
        }
      } else if (now >= T.call && !callDone.current) {
        callDone.current = true;
        setBaits([...alive.filter((b) => b.kind === "notif"), { id: ++ids.current, kind: "call", born: now, until: now + T.callDuration }]);
        sfx.startRing();
        nextSpawn.current = now + T.callDuration + 0.4;
      } else if (now >= nextSpawn.current && !blocked && !alive.some((b) => b.kind === "call")) {
        spawn(now);
        nextSpawn.current = now + spawnGap(now) * rand(0.7, 1.3);
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [finish, spawn, speed]);

  // Any touch, key, wheel or leaving the tab = you lose. Capture phase so nothing can swallow it.
  useEffect(() => {
    const armedAt = performance.now() + 200;
    const onTouch = (e: Event) => {
      if (ended.current || performance.now() < armedAt) return;
      const bait = (e.target as Element | null)?.closest?.("[data-bait]") as HTMLElement | null;
      const by =
        bait?.dataset.bait ??
        (e.type === "keydown" ? "your keyboard ⌨️" : e.type === "wheel" ? "the scroll wheel 🖱️" : "literally nothing. you just tapped. why? 💀");
      finish(fakeWinRef.current ? "trap" : "lose", by);
    };
    const onHide = () => {
      if (document.hidden) finish(fakeWinRef.current ? "trap" : "lose", "leaving to check your phone 💀");
    };
    const opts = { capture: true } as const;
    window.addEventListener("pointerdown", onTouch, opts);
    window.addEventListener("touchstart", onTouch, opts);
    window.addEventListener("keydown", onTouch, opts);
    window.addEventListener("wheel", onTouch, opts);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pointerdown", onTouch, opts);
      window.removeEventListener("touchstart", onTouch, opts);
      window.removeEventListener("keydown", onTouch, opts);
      window.removeEventListener("wheel", onTouch, opts);
      document.removeEventListener("visibilitychange", onHide);
      sfx.stopRing();
    };
  }, [finish]);

  // Lock the page + keep the screen awake for the run.
  useEffect(() => {
    document.documentElement.classList.add("playing");
    let lock: { release(): Promise<void> } | null = null;
    (navigator as Navigator & { wakeLock?: { request(t: "screen"): Promise<{ release(): Promise<void> }> } }).wakeLock
      ?.request("screen")
      .then((l) => (lock = l))
      .catch(() => {});
    return () => {
      document.documentElement.classList.remove("playing");
      void lock?.release().catch(() => {});
    };
  }, []);

  const traps = activeTraps(t);
  const trap = (k: TrapKind) => traps.find((tr) => tr.kind === k);
  const freeze = trap("freeze");
  const shownT = freeze ? freeze.at : t; // the clock "hangs" during the fake freeze
  const mock = TRAPS.find((tr) => tr.after && t >= tr.at + tr.dur && t < tr.at + tr.dur + 2.3);
  const dim = trap("dim");

  const progress = Math.min(1, shownT / T.fakeWin);
  const chaos = Math.max(0, Math.min(1, (t - T.chaosFrom + 6) / 30));
  const notifs = baits.filter((b): b is Extract<Bait, { kind: "notif" }> => b.kind === "notif");
  const call = baits.find((b) => b.kind === "call");
  const skip = baits.find((b) => b.kind === "skip");

  return (
    <div className={`fixed inset-0 z-20 overflow-hidden bg-ink ${shake ? "shake" : ""}`} aria-live="polite">
      {/* chaos tint creeps in */}
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-700" style={{ opacity: chaos * 0.6, background: "radial-gradient(80% 60% at 50% 50%, transparent, rgba(255,64,64,.35))" }} />

      {/* the calm center */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <div className="relative grid size-64 place-items-center sm:size-72">
          <svg viewBox="0 0 100 100" className="absolute inset-0 -rotate-90">
            <circle cx="50" cy="50" r="47" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="2" />
            <circle cx="50" cy="50" r="47" fill="none" stroke={chaos > 0.5 ? "#ff4040" : "#ff8f2a"} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={`${progress * 295.3} 295.3`} />
          </svg>
          <div
            className="size-44 rounded-full sm:size-52"
            style={{
              animation: "breathe 4s ease-in-out infinite",
              animationPlayState: freeze ? "paused" : "running",
              background: `radial-gradient(circle at 40% 35%, #ffd166, ${chaos > 0.5 ? "#ff4040" : "#ff8f2a"} 45%, #b3470f 75%, transparent 76%)`,
              boxShadow: `0 0 90px ${chaos > 0.5 ? "rgba(255,64,64,.45)" : "rgba(255,143,42,.45)"}`,
            }}
          />
          <span className="absolute font-mono text-[44px] font-bold tabular-nums text-ink sm:text-[52px]">{shownT.toFixed(2)}</span>
        </div>
        <p className="mt-8 text-[26px] font-semibold italic tracking-tight text-paper/85">{zenAt(shownT)}</p>
        <p className="mt-2 font-mono text-[11px] uppercase tracking-[0.3em] text-muted">don't touch anything</p>
      </div>

      {/* baits */}
      <div className="pointer-events-none absolute inset-x-3 top-[max(env(safe-area-inset-top),12px)] z-20 flex flex-col gap-2">
        <AnimatePresence initial={false}>
          {[...notifs].reverse().map((b, i) => (
            <NotifBanner key={b.id} n={b.n} index={i} />
          ))}
        </AnimatePresence>
      </div>
      <div className="pointer-events-none absolute inset-0 z-10">
        <AnimatePresence>
          {baits.map((b) =>
            b.kind === "popup" ? (
              <PopupCard key={b.id} p={b.p} x={b.x} y={b.y} />
            ) : b.kind === "claim" ? (
              <ClaimButton key={b.id} x={b.x} y={b.y} text={b.text} label={`a '${b.text}' button`} />
            ) : b.kind === "floater" ? (
              <Floater key={b.id} />
            ) : b.kind === "glitch" ? (
              <GlitchOverlay key={b.id} />
            ) : null,
          )}
          {skip ? <SkipAd key={skip.id} seconds={Math.max(0, 3 - Math.floor(t - skip.born))} /> : null}
        </AnimatePresence>
      </div>
      <AnimatePresence>{call ? <IncomingCall key={call.id} declineIn={Math.max(0, Math.ceil(call.until - t))} /> : null}</AnimatePresence>

      {/* scripted reflex traps */}
      {trap("hair") ? <Hair label={trap("hair")!.label} /> : null}
      {freeze ? <FreezeDialog label={freeze.label} showDialog={t - freeze.at > 1.4} /> : null}
      {trap("bug") ? <Bug label={trap("bug")!.label} /> : null}
      {trap("crack") ? <Crack label={trap("crack")!.label} /> : null}
      {dim ? <Dim label={dim.label} amount={Math.min(1, (t - dim.at) / (dim.dur - 0.4))} /> : null}
      {trap("lock") ? <LockScreen label={trap("lock")!.label} /> : null}
      {trap("pause") ? <PauseOverlay label={trap("pause")!.label} /> : null}
      {trap("fakeover") ? <FakeOver label={trap("fakeover")!.label} seconds={trap("fakeover")!.at - 0.37} /> : null}
      <AnimatePresence>{mock ? <Mock key={mock.kind} text={mock.after!} /> : null}</AnimatePresence>

      {fakeWin ? <FakeWin suspicious={t >= T.suspicious} /> : null}
    </div>
  );
}
