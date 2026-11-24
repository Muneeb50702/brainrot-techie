import { motion } from "motion/react";

/** 0–100 bar that fills with a spring, plus a big number. */
export function Meter({ label, value, color, emoji, delay = 0 }: { label: string; value: number; color: string; emoji: string; delay?: number }) {
  return (
    <div className="w-full">
      <div className="mb-2 flex items-end justify-between font-mono text-[11px] uppercase tracking-[0.25em] text-muted">
        <span>{label}</span>
        <span className="text-2xl font-extrabold tracking-tight text-white normal-case" style={{ fontFamily: "var(--font-display)" }}>
          {emoji} {value}
          <span className="text-sm text-muted">/100</span>
        </span>
      </div>
      <div className="h-3 w-full overflow-hidden rounded-full bg-white/10">
        <motion.div
          className="h-full rounded-full"
          style={{ background: color, boxShadow: `0 0 20px ${color}` }}
          initial={{ width: "0%" }}
          animate={{ width: `${Math.max(3, value)}%` }}
          transition={{ type: "spring", stiffness: 60, damping: 14, delay }}
        />
      </div>
    </div>
  );
}
