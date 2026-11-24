import { forwardRef } from "react";
import { dayLabel, siteHost } from "@kit/brand";
import { bornCloserTo, fmtCompact, fmtDate, fmtInt, liveStats, milestones, phoneStats, uptime } from "../life";

const MONO = '"JetBrains Mono Variable", monospace';

/** 1080×1920 "uptime report". Snapshot of the moment you tap share. Captured node stays position:relative. */
export const ShareCard = forwardRef<HTMLDivElement, { birth: Date; screenHours: number; day: number }>(function ShareCard({ birth, screenHours, day }, ref) {
  const now = Date.now();
  const up = uptime(birth, now);
  const live = liveStats(birth, now);
  const phone = phoneStats(birth, screenHours, now);
  const closer = bornCloserTo(birth, now);
  const ms = milestones(birth, now);

  const rows: [string, string, string][] = [
    ["❤️", "heartbeats", fmtInt(live.heartbeats)],
    ["🌍", "km through space", fmtCompact(live.spaceKm)],
    ["🫁", "breaths", fmtInt(live.breaths)],
    ["📱", "years on phone", `${phone.years.toFixed(1)}y`],
    ["😴", "years asleep", `${phone.sleepYears.toFixed(1)}y`],
  ];

  return (
    <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
      <div
        ref={ref}
        style={{
          position: "relative", width: 1080, height: 1920, overflow: "hidden", background: "#07070a", color: "#fff",
          fontFamily: '"Bricolage Grotesque Variable", system-ui, sans-serif', padding: "190px 80px 0", boxSizing: "border-box",
        }}
      >
        <div style={{ position: "absolute", width: 1100, height: 1100, left: -420, top: -320, borderRadius: "50%", background: "radial-gradient(circle, rgba(61,232,255,.4), transparent 62%)" }} />
        <div style={{ position: "absolute", width: 1000, height: 1000, right: -420, bottom: -260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,61,165,.42), transparent 62%)" }} />

        <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontFamily: MONO, fontWeight: 800, fontSize: 44 }}>💻 life.exe</div>
          <span style={{ fontFamily: MONO, fontWeight: 800, fontSize: 30, background: "#c6ff3d", color: "#07070a", padding: "10px 22px", borderRadius: 999 }}>{dayLabel(day)}</span>
        </div>

        <div style={{ position: "relative", marginTop: 80, fontFamily: MONO, fontSize: 30, letterSpacing: 10, color: "#8b8b9c" }}>UPTIME</div>
        <div style={{ position: "relative", fontSize: 210, fontWeight: 800, lineHeight: 0.9, letterSpacing: -10 }}>
          <span style={{ color: "#c6ff3d" }}>{up.years}y</span> {up.days}d
        </div>
        <div style={{ position: "relative", marginTop: 18, fontFamily: MONO, fontSize: 32, color: "#8b8b9c" }}>0 restarts · 0 updates · still buggy</div>

        <div style={{ position: "relative", marginTop: 60, background: "rgba(255,255,255,.06)", border: "2px solid #23232d", borderRadius: 32, padding: "26px 40px" }}>
          {rows.map(([e, l, v]) => (
            <div key={l} style={{ display: "flex", alignItems: "center", gap: 20, padding: "16px 0", borderBottom: "2px dashed rgba(255,255,255,.08)", fontSize: 38 }}>
              <span style={{ width: 52 }}>{e}</span>
              <span style={{ flex: 1, color: "rgba(255,255,255,.7)" }}>{l}</span>
              <span style={{ fontFamily: MONO, fontWeight: 800 }}>{v}</span>
            </div>
          ))}
        </div>

        {closer ? (
          <div style={{ position: "relative", marginTop: 56, fontSize: 56, fontWeight: 800, lineHeight: 1.08, letterSpacing: -1 }}>
            born closer to{" "}
            <span style={{ background: "#ff3da5", padding: "0 14px", borderRadius: 12, display: "inline-block", transform: "rotate(-2deg)" }}>
              {closer.label} {closer.emoji}
            </span>{" "}
            than to today 💀
          </div>
        ) : null}

        <div style={{ position: "relative", marginTop: 44, fontFamily: MONO, fontSize: 32, color: "rgba(255,255,255,.75)", lineHeight: 1.5 }}>
          ⏱️ 1,000,000,000 seconds old on
          <br />
          <span style={{ color: "#3de8ff", fontWeight: 800 }}>{fmtDate(ms.billionSeconds)}</span>
        </div>

        <div style={{ position: "absolute", bottom: 210, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 28, color: "#8b8b9c", letterSpacing: 4 }}>RUN YOURS →</div>
          <div style={{ marginTop: 10, fontSize: 52, fontWeight: 800, color: "#c6ff3d" }}>{siteHost("life-exe")}</div>
        </div>
      </div>
    </div>
  );
});
