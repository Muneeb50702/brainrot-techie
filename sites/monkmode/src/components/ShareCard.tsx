import { forwardRef } from "react";
import { dayLabel, siteHost } from "@kit/brand";
import { rankFor } from "../game/content";
import type { RunResult } from "./Arena";

const MONO = '"JetBrains Mono Variable", monospace';
const SERIF = '"Fraunces Variable", Georgia, serif';

/** 1080×1920 result card in the saffron-monk palette. Captured node stays position:relative. */
export const ShareCard = forwardRef<HTMLDivElement, { r: RunResult; day: number }>(function ShareCard({ r, day }, ref) {
  const rank = rankFor(r.seconds, r.outcome);
  const won = r.outcome === "win";
  return (
    <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
      <div
        ref={ref}
        style={{ position: "relative", width: 1080, height: 1920, overflow: "hidden", background: "#0c0705", color: "#f7ead6", fontFamily: SERIF, padding: "200px 90px 0", boxSizing: "border-box", textAlign: "center" }}
      >
        <div style={{ position: "absolute", width: 1200, height: 1200, left: -60, top: 260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,143,42,.35), transparent 60%)" }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 42 }}>🧘 monk mode</div>
          <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, background: "#ff8f2a", color: "#0c0705", padding: "10px 22px", borderRadius: 999 }}>{dayLabel(day)}</span>
        </div>

        <div style={{ position: "relative", marginTop: 110, fontFamily: MONO, fontSize: 32, letterSpacing: 10, color: "#a3907e" }}>
          {won ? "DIDN'T TOUCH MY PHONE FOR" : "I LASTED"}
        </div>
        <div style={{ position: "relative", fontFamily: MONO, fontSize: 250, fontWeight: 900, lineHeight: 1, color: "#ff8f2a", letterSpacing: -10 }}>
          {r.seconds.toFixed(2)}
          <span style={{ fontSize: 110, color: "rgba(247,234,214,.6)" }}>s</span>
        </div>

        <div style={{ position: "relative", marginTop: 40, display: "inline-block", background: rank.color, color: "#0c0705", fontWeight: 900, fontSize: 64, padding: "10px 36px", borderRadius: 20, transform: "rotate(-3deg)", boxShadow: "10px 10px 0 #000", textTransform: "uppercase" }}>
          {rank.emoji} {rank.name}
        </div>

        {!won ? (
          <div style={{ position: "relative", marginTop: 90, background: "rgba(255,64,64,.12)", border: "3px solid rgba(255,64,64,.45)", borderRadius: 36, padding: "36px 44px" }}>
            <div style={{ fontFamily: MONO, fontSize: 28, letterSpacing: 8, color: "#ff4040", fontWeight: 800 }}>WHAT GOT ME</div>
            <div style={{ marginTop: 14, fontSize: 52, fontWeight: 700, lineHeight: 1.15 }}>{r.by}</div>
          </div>
        ) : (
          <div style={{ position: "relative", marginTop: 90, fontSize: 56, fontStyle: "italic", lineHeight: 1.2 }}>zero touches. ignored the fake win screen. i'm him. 🌌</div>
        )}

        <div style={{ position: "absolute", bottom: 210, left: 0, right: 0 }}>
          <div style={{ fontFamily: MONO, fontSize: 30, color: "#a3907e", letterSpacing: 4 }}>CAN YOU BEAT IT? →</div>
          <div style={{ marginTop: 10, fontSize: 56, fontWeight: 800, color: "#ff8f2a" }}>{siteHost("monkmode")}</div>
        </div>
      </div>
    </div>
  );
});
