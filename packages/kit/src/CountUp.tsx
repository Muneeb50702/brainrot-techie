import { useEffect, useState } from "react";
import { animate } from "motion";
import { useReducedMotion } from "./hooks";

/** Rolls a number from 0 to `value` with an expo ease-out. Shows a sign by default. */
export function CountUp({
  value,
  duration = 2.2,
  delay = 0,
  signed = true,
  className,
  onDone,
}: {
  value: number;
  duration?: number;
  delay?: number;
  signed?: boolean;
  className?: string;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [n, setN] = useState(reduced ? value : 0);

  useEffect(() => {
    if (reduced) {
      setN(value);
      onDone?.();
      return;
    }
    const controls = animate(0, value, {
      duration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setN(Math.round(v)),
      onComplete: () => onDone?.(),
    });
    return () => controls.stop();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, duration, delay, reduced]);

  const sign = signed ? (n > 0 ? "+" : n < 0 ? "−" : "") : n < 0 ? "−" : "";
  return (
    <span className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {sign}
      {Math.abs(n).toLocaleString("en-US")}
    </span>
  );
}
