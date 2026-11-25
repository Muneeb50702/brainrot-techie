import { forwardRef } from "react";
import { dayLabel, siteHost } from "@kit/brand";
import { likeFor } from "../game/levels";
import type { Stats } from "./Download";
import { rankFor } from "./Done";

const ANTON = '"Anton", Impact, sans-serif';
const MONO = '"Martian Mono Variable", monospace';
const TAPE = "repeating-linear-gradient(-45deg,#ffd400 0 34px,#0b0b0b 34px 68px)";

/** 1080×1920 hazard-tape result card. Captured node stays position:relative. */
export const ShareCard = forwardRef<HTMLDivElement, { stats: Stats; day: number }>(function ShareCard({ stats, day }, ref) {
  const rank = rankFor(stats);
  const mic = stats.mode === "mic";
  return (
    <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
      <div ref={ref} style={{ position: "relative", width: 1080, height: 1920, overflow: "hidden", background: "#0b0b0b", color: "#f5f5f0", boxSizing: "border-box" }}>
        <div style={{ height: 44, background: TAPE, marginTop: 150 }} />
        <div style={{ padding: "40px 80px 0" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div style={{ fontFamily: ANTON, fontSize: 54, letterSpacing: 2, textTransform: "uppercase" }}>📢 screamload</div>
            <span style={{ fontFamily: MONO, fontSize: 28, fontWeight: 700, background: "#ffd400", color: "#0b0b0b", padding: "10px 22px", borderRadius: 12 }}>{dayLabel(day)}</span>
          </div>

          <div style={{ marginTop: 60, fontFamily: MONO, fontSize: 30, color: "#39ff88", letterSpacing: 6 }}>● DOWNLOAD COMPLETE</div>
          <div style={{ fontFamily: MONO, fontSize: 32, color: "#ffd400", marginTop: 12 }}>📦 free_ram_4.20GB.zip</div>
          <div style={{ marginTop: 24, height: 60, border: "8px solid #ffd400", borderRadius: 14, padding: 6 }}>
            <div style={{ height: "100%", borderRadius: 6, background: "repeating-linear-gradient(-45deg,#ffd400 0 22px,#ff5a1f 22px 44px)" }} />
          </div>

          <div style={{ marginTop: 50, fontFamily: MONO, fontSize: 30, color: "#8a8a80", letterSpacing: 6 }}>{mic ? "DOWNLOADED BY SCREAMING FOR" : "DOWNLOADED BY TAPPING FOR"}</div>
          <div style={{ fontFamily: ANTON, fontSize: 300, lineHeight: 0.9, letterSpacing: 4 }}>
            {stats.seconds.toFixed(1)}
            <span style={{ color: "#ffd400" }}>S</span>
          </div>

          <div style={{ display: "flex", gap: 24, marginTop: 40 }}>
            {(mic
              ? [["PEAK", `${Math.round(stats.peak)} dB`, `≈ ${likeFor(stats.peak)}`], ["SCREAMING", `${stats.loudSeconds.toFixed(1)}s`, "neighbours: not ok"]]
              : [["TAPS", String(stats.taps), "thumb: destroyed"], ["VOLUME", "0 dB", "library: safe"]]
            ).map(([k, v, sub]) => (
              <div key={k} style={{ flex: 1, border: "5px solid #2c2c28", borderRadius: 24, padding: "24px 28px", background: "#161616" }}>
                <div style={{ fontFamily: MONO, fontSize: 24, color: "#8a8a80", letterSpacing: 4 }}>{k}</div>
                <div style={{ fontFamily: ANTON, fontSize: 92, color: "#ffd400", lineHeight: 1.05 }}>{v}</div>
                <div style={{ fontFamily: MONO, fontSize: 24, color: "#f5f5f0bb" }}>{sub}</div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 44, display: "inline-block", fontFamily: ANTON, fontSize: 70, textTransform: "uppercase", background: "#ffd400", color: "#0b0b0b", padding: "6px 30px", borderRadius: 14, transform: "rotate(-3deg)", letterSpacing: 2 }}>
            {rank.emoji} {rank.title}
          </div>
          <div style={{ marginTop: 34, fontFamily: MONO, fontSize: 30, color: "#ff2a2a" }}>⚠ ERROR: you can't download RAM</div>
        </div>

        <div style={{ position: "absolute", bottom: 200, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 28, color: "#8a8a80", letterSpacing: 4 }}>SCREAM FASTER THAN ME →</div>
          <div style={{ marginTop: 10, fontFamily: ANTON, fontSize: 64, letterSpacing: 2, color: "#ffd400" }}>{siteHost("screamload")}</div>
        </div>
        <div style={{ position: "absolute", bottom: 120, left: 0, right: 0, height: 44, background: TAPE }} />
      </div>
    </div>
  );
});
