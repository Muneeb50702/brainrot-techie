import { forwardRef } from "react";
import { dayLabel, siteHost } from "@kit/brand";
import { doneness, type Results } from "../game/scoring";
import { rows, SCALE } from "./Report";

const MONO = '"IBM Plex Mono", monospace';
const WIDE = { fontFamily: '"Archivo Variable", sans-serif', fontStretch: "125%", fontWeight: 900 } as const;

/** 1080×1920 lab-report story card. Captured node stays position:relative. */
export const ShareCard = forwardRef<HTMLDivElement, { res: Results; pct: number; day: number; id: string }>(function ShareCard({ res, pct, day, id }, ref) {
  const d = doneness(pct);
  const r = rows(res);
  return (
    <div aria-hidden style={{ position: "fixed", left: -99999, top: 0, pointerEvents: "none" }}>
      <div
        ref={ref}
        style={{
          position: "relative", width: 1080, height: 1920, overflow: "hidden", boxSizing: "border-box", padding: "180px 80px 0",
          color: "#141414", fontFamily: '"Archivo Variable", sans-serif',
          backgroundColor: "#f3ede1",
          backgroundImage: "linear-gradient(rgba(20,20,20,.06) 2px, transparent 2px), linear-gradient(90deg, rgba(20,20,20,.06) 2px, transparent 2px)",
          backgroundSize: "48px 48px",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ ...WIDE, fontSize: 44 }}>🧠 cooked</div>
          <span style={{ fontFamily: MONO, fontWeight: 700, fontSize: 30, background: "#ffe14d", border: "4px solid #141414", padding: "8px 20px", borderRadius: 999 }}>{dayLabel(day)}</span>
        </div>

        <div style={{ position: "relative", marginTop: 50, background: "#fbf8f1", border: "5px solid #141414", borderRadius: 36, boxShadow: "14px 14px 0 #141414", padding: "44px 50px" }}>
          <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 4, color: "#6f6a60", display: "flex", justifyContent: "space-between" }}>
            <span>BRAIN SCAN REPORT #{id}</span>
            <span>PATIENT: YOU</span>
          </div>
          <div style={{ borderTop: "4px dashed #d8cfbe", margin: "26px 0" }} />
          <div style={{ fontFamily: MONO, fontSize: 24, letterSpacing: 8, color: "#6f6a60" }}>DIAGNOSIS</div>
          <div style={{ ...WIDE, fontSize: 250, lineHeight: 0.85, letterSpacing: -8 }}>
            {pct}
            <span style={{ fontSize: 120 }}>%</span>
          </div>
          <div style={{ ...WIDE, fontSize: 96, lineHeight: 1 }}>COOKED</div>
          <div
            style={{
              ...WIDE, position: "absolute", right: 34, top: 128, fontSize: 54, textTransform: "uppercase", color: d.color, background: "rgba(251,248,241,.55)",
              border: `8px solid ${d.color}`, borderRadius: 18, padding: "4px 20px", transform: "rotate(-9deg)",
            }}
          >
            {d.name} {d.emoji}
          </div>

          <div style={{ marginTop: 40, height: 30, borderRadius: 999, border: "4px solid #141414", background: `linear-gradient(90deg, ${SCALE.map(([, c], i) => `${c} ${(i / (SCALE.length - 1)) * 100}%`).join(",")})`, position: "relative" }}>
            <div style={{ position: "absolute", left: `${pct}%`, top: -54, transform: "translateX(-50%)", fontSize: 44 }}>▼</div>
          </div>

          <div style={{ borderTop: "4px dashed #d8cfbe", margin: "36px 0 22px" }} />
          {r.map((x) => (
            <div key={x.name} style={{ display: "flex", alignItems: "baseline", gap: 18, padding: "12px 0", fontSize: 34 }}>
              <span>{x.e}</span>
              <span style={{ ...WIDE, fontSize: 26, textTransform: "uppercase" }}>{x.name}</span>
              <span style={{ flex: 1, fontFamily: MONO, fontSize: 24, color: "#6f6a60", textAlign: "right" }}>{x.line}</span>
            </div>
          ))}
          <div style={{ borderTop: "4px dashed #d8cfbe", margin: "22px 0 18px" }} />
          <div style={{ fontStyle: "italic", fontSize: 38, lineHeight: 1.25, color: "#2443d6" }}>"{d.note}"</div>
        </div>

        <div style={{ position: "absolute", bottom: 210, left: 0, right: 0, textAlign: "center" }}>
          <div style={{ fontFamily: MONO, fontSize: 30, letterSpacing: 4, color: "#6f6a60" }}>HOW COOKED IS YOURS? →</div>
          <div style={{ ...WIDE, fontStretch: "100%", marginTop: 12, fontSize: 50, color: "#d62828" }}>{siteHost("cooked")}</div>
        </div>
      </div>
    </div>
  );
});
