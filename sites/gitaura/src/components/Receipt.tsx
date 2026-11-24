import { motion } from "motion/react";
import type { AuraResult } from "../aura";
import type { GhUser } from "../github";

const ZIGZAG =
  "conic-gradient(from 135deg at top,#0000,#000 1deg 89deg,#0000 90deg) top/14px 51% repeat-x," +
  "conic-gradient(from -45deg at bottom,#0000,#000 1deg 89deg,#0000 90deg) bottom/14px 51% repeat-x";

export const signed = (n: number) => `${n > 0 ? "+" : n < 0 ? "−" : ""}${Math.abs(n).toLocaleString("en-US")}`;

export function Barcode({ seed, className }: { seed: number; className?: string }) {
  // Deterministic bar widths from the user id, so the same user = the same barcode.
  const bars = Array.from({ length: 46 }, (_, i) => 1 + (((seed * 9301 + i * 49297) % 233280) % 4));
  return (
    <div className={className} aria-hidden style={{ display: "flex", gap: 2, height: "100%", alignItems: "stretch" }}>
      {bars.map((w, i) => (
        <span key={i} style={{ width: w * 1.6, background: i % 7 === 3 ? "transparent" : "#07070a" }} />
      ))}
    </div>
  );
}

export function Receipt({ user, aura, delay = 0 }: { user: GhUser; aura: AuraResult; delay?: number }) {
  const date = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, rotate: -1.5 }}
      animate={{ opacity: 1, y: 0, rotate: -0.6 }}
      transition={{ delay, type: "spring", stiffness: 120, damping: 16 }}
      className="mx-auto w-full max-w-md bg-paper px-5 pb-9 pt-8 font-mono text-[12.5px] leading-snug text-ink shadow-[0_30px_80px_-20px_rgba(198,255,61,0.25)] sm:px-7 sm:text-[13px]"
      style={{ WebkitMask: ZIGZAG, mask: ZIGZAG }}
    >
      <div className="text-center">
        <p className="text-[15px] font-extrabold tracking-[0.2em]">*** AURA RECEIPT ***</p>
        <p className="mt-1 text-[11px] opacity-60">gitaura · #{String(user.id % 100000).padStart(5, "0")} · {date}</p>
        <p className="mt-0.5 text-[11px] opacity-60">customer: @{user.login}</p>
      </div>
      <div className="my-4 border-t-2 border-dashed border-ink/40" />
      <ul className="space-y-2">
        {aura.items.map((it, i) => (
          <motion.li
            key={it.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: delay + 0.25 + i * 0.09 }}
            className="flex items-start gap-2"
          >
            <span className="w-5 shrink-0 text-center">{it.emoji}</span>
            <span className="flex-1">{it.label}</span>
            <span className={`shrink-0 pl-2 font-bold tabular-nums ${it.points < 0 ? "text-[#d6005f]" : ""}`}>{signed(it.points)}</span>
          </motion.li>
        ))}
      </ul>
      <div className="my-4 border-t-2 border-dashed border-ink/40" />
      <div className="flex items-end justify-between text-[15px] font-extrabold">
        <span>TOTAL AURA</span>
        <span className="text-[22px] tabular-nums">{signed(aura.total)}</span>
      </div>
      <div className="mt-1 flex justify-between text-[11px] opacity-70">
        <span>rank</span>
        <span>
          {aura.tier.emoji} {aura.tier.name.toUpperCase()}
        </span>
      </div>
      <div className="mt-6 h-12 opacity-90">
        <Barcode seed={user.id} className="justify-center" />
      </div>
      <p className="mt-3 text-center text-[11px] opacity-60">thank u for ur commits. no refunds. 🧾</p>
    </motion.div>
  );
}
