import { useEffect, useState } from "react";
import { useReducedMotion } from "@kit/hooks";

/** Types text out like a chat message, ~32 chars/sec. Grapheme-safe so emojis don't split. */
export function Typewriter({ text, cps = 32, onDone }: { text: string; cps?: number; onDone?: () => void }) {
  const reduced = useReducedMotion();
  const parts = Array.from(new Intl.Segmenter(undefined, { granularity: "grapheme" }).segment(text), (s) => s.segment);
  const [n, setN] = useState(reduced ? parts.length : 0);

  useEffect(() => {
    if (reduced) {
      setN(parts.length);
      onDone?.();
      return;
    }
    setN(0);
    const id = setInterval(() => {
      setN((c) => {
        if (c + 1 >= parts.length) {
          clearInterval(id);
          onDone?.();
          return parts.length;
        }
        return c + 1;
      });
    }, 1000 / cps);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text, reduced]);

  return (
    <span aria-label={text}>
      <span aria-hidden>{parts.slice(0, n).join("")}</span>
      {n < parts.length ? <span aria-hidden className="ml-0.5 inline-block h-[1em] w-[2px] translate-y-[2px] animate-pulse bg-current" /> : null}
    </span>
  );
}
