import { forwardRef } from "react";
import { dayLabel, siteHost } from "@kit/brand";
import { rankFor } from "../game/content";
import type { MissionResult } from "./Mission";

const PIXEL = '"Pixelify Sans Variable", monospace';
const CHAT = "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif";

/** 1080×1920 "damage report": the cursed texts + replies. Captured node stays position:relative. */
export const ShareCard = forwardRef<HTMLDivElement, { results: MissionResult[]; dignity: number; day: number }>(function ShareCard({ results, dignity, day }, ref) {
  const rank = rankFor(dignity / 100);
  const good = dignity >= 65;
  return (
    <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
      <div
        ref={ref}
        style={{
          position: "relative", width: 1080, height: 1920, overflow: "hidden", boxSizing: "border-box", padding: "180px 70px 0",
          color: "#160f2e", backgroundColor: "#e7e3ff",
          backgroundImage: "radial-gradient(rgba(22,15,46,.1) 3px, transparent 3px)", backgroundSize: "36px 36px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontFamily: PIXEL }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16, fontSize: 46, fontWeight: 700 }}>
            <span style={{ width: 72, height: 72, display: "grid", placeItems: "center", background: "#ff3e9a", border: "5px solid #160f2e", borderRadius: 16, fontSize: 44 }}>😈</span>
            autocorrupt
          </div>
          <span style={{ fontSize: 32, background: "#ffe94d", border: "4px solid #160f2e", padding: "8px 22px", borderRadius: 999, fontWeight: 700 }}>{dayLabel(day)}</span>
        </div>

        <div style={{ marginTop: 44, fontFamily: PIXEL, textAlign: "center" }}>
          <div style={{ fontSize: 40, color: "#6d6492" }}>dignity preserved</div>
          <div style={{ fontSize: 190, fontWeight: 700, lineHeight: 0.9, color: good ? "#19c37d" : "#ff2d55" }}>{dignity}%</div>
          <div style={{ display: "inline-block", marginTop: 14, fontSize: 46, fontWeight: 700, background: "#ffe94d", border: "5px solid #160f2e", boxShadow: "8px 8px 0 #160f2e", borderRadius: 16, padding: "6px 28px", transform: "rotate(-3deg)", textTransform: "uppercase" }}>
            {rank.emoji} {rank.title}
          </div>
        </div>

        <div style={{ marginTop: 48, display: "flex", flexDirection: "column", gap: 20, fontFamily: CHAT }}>
          {results.map((r) => (
            <div key={r.contact} style={{ background: "#fff", border: "5px solid #160f2e", borderRadius: 36, boxShadow: "9px 9px 0 #160f2e", padding: "16px 26px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 26, color: "#6d6492", marginBottom: 10 }}>
                <span style={{ fontSize: 32 }}>{r.avatar}</span>
                <b style={{ color: "#160f2e" }}>{r.contact}</b>
                <span style={{ marginLeft: "auto", fontFamily: PIXEL, fontSize: 30, color: r.dignity >= 0.65 ? "#19c37d" : "#ff2d55" }}>{Math.round(r.dignity * 100)}%</span>
              </div>
              <div style={{ marginLeft: "auto", width: "fit-content", maxWidth: "88%", background: "#2b59ff", color: "#fff", borderRadius: "28px 28px 8px 28px", padding: "10px 20px", fontSize: 29, lineHeight: 1.22 }}>{r.message}</div>
              {r.reply ? (
                <div style={{ marginTop: 8, width: "fit-content", maxWidth: "85%", background: "#ebe8f5", borderRadius: "28px 28px 28px 8px", padding: "10px 20px", fontSize: 29, lineHeight: 1.22 }}>{r.reply}</div>
              ) : (
                <div style={{ marginTop: 8, textAlign: "right", fontSize: 26, fontWeight: 700, color: "#ff2d55" }}>left on read 💀</div>
              )}
            </div>
          ))}
        </div>

        <div style={{ position: "absolute", bottom: 190, left: 0, right: 0, textAlign: "center", fontFamily: PIXEL }}>
          <div style={{ fontSize: 30, color: "#6d6492" }}>can you beat autocorrect? →</div>
          <div style={{ marginTop: 8, fontSize: 40, fontWeight: 700, color: "#2b59ff" }}>{siteHost("autocorrupt")}</div>
        </div>
      </div>
    </div>
  );
});
