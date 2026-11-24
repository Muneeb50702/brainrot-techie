import { forwardRef } from "react";
import { dayLabel, siteHost } from "@kit/brand";
import type { Translation } from "../types";

const MONO = '"JetBrains Mono Variable", monospace';
const fit = (s: string, big: number, small: number, limit = 90) => (s.length > limit ? small : big);

/** 1080×1920 story card. The outer wrapper is off-screen; the captured node stays position:relative. */
export const ShareCard = forwardRef<HTMLDivElement, { r: Translation; day: number }>(function ShareCard({ r, day }, ref) {
  const corp = r.mode === "corp2z";
  const fromLabel = corp ? "👔 CORPORATE SAID" : "💀 GEN Z SAID";
  const toLabel = corp ? "💀 GEN Z HEARD" : "👔 CORPORATE VERSION";
  const score = corp ? r.red_flag : r.synergy;
  const scoreLabel = corp ? "🚩 RED FLAG LEVEL" : "👔 SYNERGY LEVEL";
  const accent = corp ? "#ff3da5" : "#4f7cff";

  return (
    <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
      <div
        ref={ref}
        style={{
          position: "relative",
          width: 1080,
          height: 1920,
          overflow: "hidden",
          background: "#07070a",
          color: "#fff",
          fontFamily: '"Bricolage Grotesque Variable", system-ui, sans-serif',
          padding: "190px 80px 0",
          boxSizing: "border-box",
        }}
      >
        <div style={{ position: "absolute", width: 1100, height: 1100, left: -450, top: -350, borderRadius: "50%", background: "radial-gradient(circle, rgba(79,124,255,.5), transparent 62%)" }} />
        <div style={{ position: "absolute", width: 1000, height: 1000, right: -420, bottom: -300, borderRadius: "50%", background: "radial-gradient(circle, rgba(198,255,61,.28), transparent 62%)" }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 42 }}>👔→💀 corpospeak</div>
          <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, background: "#c6ff3d", color: "#07070a", padding: "10px 22px", borderRadius: 999 }}>{dayLabel(day)}</span>
        </div>

        <div style={{ position: "relative", marginTop: 70, fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: "#8b8b9c" }}>{fromLabel}</div>
        <div
          style={{
            position: "relative",
            marginTop: 18,
            background: corp ? "rgba(79,124,255,.18)" : "#c6ff3d",
            color: corp ? "#fff" : "#07070a",
            border: corp ? "3px solid rgba(79,124,255,.5)" : "none",
            borderRadius: "48px 48px 48px 12px",
            padding: "34px 40px",
            fontSize: fit(r.input, 44, 36),
            fontWeight: corp ? 500 : 700,
            lineHeight: 1.2,
          }}
        >
          {r.input}
        </div>

        <div style={{ position: "relative", textAlign: "center", margin: "34px 0", fontSize: 64 }}>⬇️</div>

        <div style={{ position: "relative", fontFamily: MONO, fontSize: 28, letterSpacing: 6, color: "#8b8b9c", textAlign: "right" }}>{toLabel}</div>
        <div
          style={{
            position: "relative",
            marginTop: 18,
            background: corp ? "#c6ff3d" : "#f3efe6",
            color: "#07070a",
            borderRadius: "48px 48px 12px 48px",
            padding: "34px 40px",
            fontSize: fit(r.translation, 50, 38),
            fontWeight: 800,
            lineHeight: 1.15,
            fontFamily: corp ? undefined : "Georgia, serif",
          }}
        >
          {!corp ? <div style={{ fontFamily: MONO, fontSize: 24, fontWeight: 700, opacity: 0.6, marginBottom: 14 }}>Subject: {r.subject}</div> : null}
          {r.translation}
        </div>

        {corp ? (
          <div style={{ position: "relative", marginTop: 40, fontSize: 44, fontWeight: 800, lineHeight: 1.15 }}>
            <span style={{ color: accent }}>real meaning:</span> {r.real_meaning}
          </div>
        ) : null}

        <div style={{ position: "relative", marginTop: 44 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontFamily: MONO, fontSize: 28, color: "#8b8b9c", letterSpacing: 4 }}>
            <span>{scoreLabel}</span>
            <span style={{ color: "#fff", fontWeight: 800 }}>{score}/100</span>
          </div>
          <div style={{ marginTop: 14, height: 26, borderRadius: 999, background: "rgba(255,255,255,.1)", overflow: "hidden" }}>
            <div style={{ width: `${Math.max(3, score)}%`, height: "100%", borderRadius: 999, background: accent }} />
          </div>
          <div style={{ marginTop: 28, display: "inline-block", background: accent, color: corp ? "#fff" : "#fff", fontWeight: 800, fontSize: 44, padding: "6px 26px", borderRadius: 16, transform: "rotate(-3deg)", boxShadow: "8px 8px 0 #000", textTransform: "uppercase" }}>
            {r.vibe}
          </div>
        </div>

        <div style={{ position: "absolute", bottom: 210, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 28, color: "#8b8b9c", letterSpacing: 4 }}>TRANSLATE YOUR BOSS →</div>
          <div style={{ marginTop: 10, fontSize: 50, fontWeight: 800, color: "#c6ff3d" }}>{siteHost("corpospeak")}</div>
        </div>
      </div>
    </div>
  );
});
