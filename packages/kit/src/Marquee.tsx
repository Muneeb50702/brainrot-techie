import type { ReactNode } from "react";
import { cn } from "./cn";

/** Infinite horizontal ticker. Children are rendered twice for a seamless loop. */
export function Marquee({
  children,
  duration = 40,
  reverse = false,
  className,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn("relative flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)]", className)}
      style={{ ["--marquee-duration" as string]: `${duration}s` }}
    >
      <div className="flex w-max shrink-0 animate-marquee" style={{ animationDirection: reverse ? "reverse" : "normal" }}>
        <div className="flex shrink-0 items-center">{children}</div>
        <div aria-hidden className="flex shrink-0 items-center">
          {children}
        </div>
      </div>
    </div>
  );
}
