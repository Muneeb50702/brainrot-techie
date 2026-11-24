/* Border Beam Panel, from 21st.dev (@rmahammad), originally Motiq
   (https://motiq.dev/components/border-beam-panel). MIT licensed.
   Adapted: shared hooks/cn, brainrot defaults (lime + pink comets on ink). */
import * as React from "react";
import { cn } from "./cn";
import { useReducedMotion, useVisibilityPause } from "./hooks";

export interface BorderBeamPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  /** One comet, or two opposed comets 180° apart. */
  beams?: 1 | 2;
  colors?: [string, string?];
  thickness?: number;
  /** Resting angular velocity in deg/s. */
  idleSpeed?: number;
  /** Hover/focus angular velocity in deg/s. */
  hoverSpeed?: number;
  glow?: boolean;
  radius?: number;
  seed?: number;
}

/** Delta-time spring: the SPEED is sprung so comets coast instead of snapping. */
class Spring {
  x: number;
  v = 0;
  target: number;
  k: number;
  d: number;
  constructor(value: number, k: number, d: number) {
    this.x = value;
    this.target = value;
    this.k = k;
    this.d = d;
  }
  step(dt: number) {
    const a = this.k * (this.target - this.x) - this.d * this.v;
    this.v += a * dt;
    this.x += this.v * dt;
    return this.x;
  }
}

const clamp = (n: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, n));

function comet(tail: string, head: string, tip: string, midAlpha: number, start: number) {
  return [
    `color-mix(in srgb, ${tail} 4%, transparent) ${start + 18}deg`,
    `color-mix(in srgb, ${tail} ${midAlpha}%, transparent) ${start + 46}deg`,
    `${head} ${start + 56}deg`,
    `${tip} ${start + 60}deg`,
    `transparent ${start + 63}deg`,
  ].join(", ");
}

function ringGradient(beams: 1 | 2, colors: [string, string?]) {
  const c0 = colors[0];
  const stops = ["transparent 0deg", comet(c0, c0, `color-mix(in srgb, ${c0} 22%, #ffffff)`, 55, 0)];
  if (beams === 2) {
    const c1 = colors[1] ?? c0;
    stops.push("transparent 198deg", comet(c1, c1, `color-mix(in srgb, ${c1} 26%, #ffffff)`, 50, 198));
  }
  stops.push("transparent 360deg");
  return `conic-gradient(from var(--mk-beam-a, 0deg), ${stops.join(", ")})`;
}

export function BorderBeamPanel({
  children,
  beams = 2,
  colors = ["#c6ff3d", "#ff3da5"],
  thickness = 2,
  idleSpeed = 42,
  hoverSpeed = 240,
  glow = true,
  radius = 20,
  seed = 1,
  className,
  style,
  ...props
}: BorderBeamPanelProps) {
  const uid = React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const cls = `mk-beam-${uid}`;
  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const reduced = useReducedMotion();
  const onScreen = useVisibilityPause(rootRef, 0.05);
  const animate = !reduced && onScreen;

  const startAngle = React.useMemo(() => (((seed * 137.508) % 360) + 360) % 360, [seed]);
  const speedRef = React.useRef(new Spring(idleSpeed, 30, 11));
  const angleRef = React.useRef(startAngle);
  const live = React.useRef({ idleSpeed, hoverSpeed });
  live.current = { idleSpeed, hoverSpeed };

  const paint = React.useCallback((angle: number) => {
    rootRef.current?.style.setProperty("--mk-beam-a", `${(((angle % 360) + 360) % 360).toFixed(2)}deg`);
  }, []);

  React.useEffect(() => {
    if (!animate) return;
    let raf = 0;
    let last = 0;
    const frame = (now: number) => {
      if (!last) last = now;
      const dt = clamp((now - last) / 1000, 0, 0.05);
      last = now;
      angleRef.current += speedRef.current.step(dt) * dt;
      paint(angleRef.current);
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [animate, paint]);

  React.useEffect(() => {
    if (reduced) paint(40);
  }, [reduced, paint]);

  const surge = React.useCallback(() => (speedRef.current.target = live.current.hoverSpeed), []);
  const settle = React.useCallback(() => (speedRef.current.target = live.current.idleSpeed), []);
  const gradient = React.useMemo(() => ringGradient(beams, colors), [beams, colors]);

  const css = `
.${cls} .mk-beam-ring, .${cls} .mk-beam-glow { position:absolute; inset:-1px; border-radius:${radius}px; pointer-events:none; background:${gradient}; }
.${cls} .mk-beam-ring { padding:${Math.max(1, thickness)}px; -webkit-mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0); -webkit-mask-composite:xor; mask:linear-gradient(#fff 0 0) content-box,linear-gradient(#fff 0 0); mask-composite:exclude; }
.${cls} .mk-beam-glow { filter:blur(16px); opacity:.4; z-index:-1; }
@media (forced-colors: active) { .${cls} .mk-beam-ring, .${cls} .mk-beam-glow { display:none; } }`;

  return (
    <div
      ref={rootRef}
      onPointerEnter={surge}
      onPointerLeave={settle}
      onFocus={surge}
      onBlur={settle}
      className={cn("relative w-full border border-line bg-ink-2/80 backdrop-blur-xl", cls, className)}
      style={{ borderRadius: radius, isolation: "isolate", ["--mk-beam-a" as string]: `${startAngle.toFixed(2)}deg`, ...style }}
      {...props}
    >
      <style dangerouslySetInnerHTML={{ __html: css }} />
      {glow ? <div aria-hidden="true" className="mk-beam-glow" /> : null}
      <div aria-hidden="true" className="mk-beam-ring" />
      {children}
    </div>
  );
}
