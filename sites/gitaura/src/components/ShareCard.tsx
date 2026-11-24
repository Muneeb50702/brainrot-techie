import { forwardRef } from "react";
import { siteHost, dayLabel } from "@kit/brand";
import type { AuraResult } from "../aura";
import type { GhUser } from "../github";
import { Barcode, signed } from "./Receipt";
import { Bolt } from "@kit/Bolt";

/** 1080×1920 story card, laid out off-screen in fixed px and rasterized with html-to-image.
 *  Content stays inside the IG story safe zone (~250px top/bottom). */
export const ShareCard = forwardRef<HTMLDivElement, { user: GhUser; aura: AuraResult; day: number }>(function ShareCard(
  { user, aura, day },
  ref,
) {
  const top = [...aura.items]
    .filter((i) => i.label !== "base aura (u exist)")
    .sort((a, b) => Math.abs(b.points) - Math.abs(a.points))
    .slice(0, 4);
  const big = Math.abs(aura.total) >= 10000 ? 180 : 230;

  return (
    // Off-screen wrapper. The captured node itself must stay position:relative,
    // or html-to-image's clone renders outside its own SVG viewport (blank PNG).
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
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        padding: "190px 90px 200px",
        boxSizing: "border-box",
      }}
    >
      {/* light blobs */}
      <div style={{ position: "absolute", width: 1100, height: 1100, left: -420, top: -300, borderRadius: "50%", background: "radial-gradient(circle, rgba(124,92,255,.55), transparent 62%)" }} />
      <div style={{ position: "absolute", width: 1000, height: 1000, right: -420, bottom: -260, borderRadius: "50%", background: "radial-gradient(circle, rgba(255,61,165,.45), transparent 62%)" }} />
      <div style={{ position: "absolute", width: 700, height: 700, right: -200, top: 380, borderRadius: "50%", background: "radial-gradient(circle, rgba(198,255,61,.22), transparent 62%)" }} />

      <div style={{ position: "relative", width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: '"JetBrains Mono Variable", monospace', fontWeight: 800, fontSize: 42 }}>
          <span style={{ width: 64, height: 64, borderRadius: 16, background: "#c6ff3d", color: "#07070a", display: "grid", placeItems: "center" }}>
            <Bolt className="" />
          </span>
          gitaura
        </div>
        <span style={{ fontFamily: '"JetBrains Mono Variable", monospace', fontWeight: 800, fontSize: 30, background: "#c6ff3d", color: "#07070a", padding: "10px 22px", borderRadius: 999 }}>
          {dayLabel(day)}
        </span>
      </div>

      <div style={{ position: "relative", marginTop: 70, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <img
          src={user.avatar_url + "&s=400"}
          crossOrigin="anonymous"
          alt=""
          width={190}
          height={190}
          style={{ width: 190, height: 190, borderRadius: 48, border: "6px solid #c6ff3d", objectFit: "cover" }}
        />
        <div style={{ marginTop: 26, fontSize: 60, fontWeight: 800, letterSpacing: -1.5 }}>@{user.login}</div>
        <div style={{ marginTop: 40, fontFamily: '"JetBrains Mono Variable", monospace', fontSize: 30, letterSpacing: 10, color: "#8b8b9c" }}>TOTAL AURA</div>
        <div style={{ fontSize: big, fontWeight: 800, lineHeight: 0.95, letterSpacing: -10, color: aura.tier.color, textShadow: `0 0 80px ${aura.tier.color}55` }}>
          {signed(aura.total)}
        </div>
        <div
          style={{
            marginTop: 26,
            fontSize: 54,
            fontWeight: 800,
            background: aura.tier.color,
            color: "#07070a",
            padding: "8px 30px",
            borderRadius: 18,
            transform: "rotate(-3deg)",
            boxShadow: "8px 8px 0 #000",
            textTransform: "uppercase",
          }}
        >
          {aura.tier.emoji} {aura.tier.name}
        </div>
        <div style={{ marginTop: 40, maxWidth: 820, textAlign: "center", fontSize: 36, lineHeight: 1.25, color: "rgba(255,255,255,.72)" }}>{aura.tier.verdict}</div>
      </div>

      <div
        style={{
          position: "relative",
          marginTop: 56,
          width: 860,
          background: "#f3efe6",
          color: "#07070a",
          borderRadius: 18,
          padding: "34px 40px 28px",
          fontFamily: '"JetBrains Mono Variable", monospace',
          fontSize: 27,
          transform: "rotate(-1deg)",
        }}
      >
        {top.map((it) => (
          <div key={it.label} style={{ display: "flex", gap: 16, marginBottom: 14, alignItems: "flex-start" }}>
            <span style={{ width: 36 }}>{it.emoji}</span>
            <span style={{ flex: 1, lineHeight: 1.25 }}>{it.label}</span>
            <span style={{ fontWeight: 800, color: it.points < 0 ? "#d6005f" : "#07070a" }}>{signed(it.points)}</span>
          </div>
        ))}
        <div style={{ borderTop: "3px dashed rgba(7,7,10,.35)", margin: "18px 0 14px" }} />
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontWeight: 800, fontSize: 32 }}>
          <span>TOTAL</span>
          <span style={{ height: 44, width: 300, opacity: 0.85 }}>
            <Barcode seed={user.id} />
          </span>
          <span>{signed(aura.total)}</span>
        </div>
      </div>

      <div style={{ position: "absolute", bottom: 210, left: 0, right: 0, textAlign: "center" }}>
        <div style={{ fontFamily: '"JetBrains Mono Variable", monospace', fontSize: 28, color: "#8b8b9c", letterSpacing: 4 }}>CHECK YOURS →</div>
        <div style={{ marginTop: 10, fontSize: 50, fontWeight: 800, color: "#c6ff3d", letterSpacing: -1 }}>{siteHost("gitaura")}</div>
      </div>
    </div>
    </div>
  );
});
