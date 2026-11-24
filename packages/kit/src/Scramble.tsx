import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "./hooks";

const GLYPHS = "!<>-_\\/[]{}—=+*^?#01ABCDEFGHIJKLMNOPQRSTUVWXYZ$%&";

/** Hacker-style decode: random glyphs settle left→right into the real text. */
export function Scramble({
  text,
  duration = 700,
  className,
  onDone,
}: {
  text: string;
  duration?: number;
  className?: string;
  onDone?: () => void;
}) {
  const reduced = useReducedMotion();
  const [out, setOut] = useState(reduced ? text : "");
  const doneRef = useRef(onDone);
  doneRef.current = onDone;

  useEffect(() => {
    if (reduced) {
      setOut(text);
      doneRef.current?.();
      return;
    }
    const chars = Array.from(text);
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const settled = Math.floor(p * chars.length);
      let s = "";
      for (let i = 0; i < chars.length; i++) {
        if (i < settled || chars[i] === " ") s += chars[i];
        else s += GLYPHS[(Math.random() * GLYPHS.length) | 0];
      }
      setOut(s);
      if (p < 1) raf = requestAnimationFrame(tick);
      else doneRef.current?.();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, duration, reduced]);

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  );
}
