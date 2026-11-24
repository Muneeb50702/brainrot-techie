import type { ReactNode } from "react";
import { cn } from "@kit/cn";

/** OS-style app window: traffic lights + title bar. The whole site is "running" inside these. */
export function Window({ title, status, children, className }: { title: string; status?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={cn("overflow-hidden rounded-[22px] border border-line bg-ink-2/80 text-left backdrop-blur-xl", className)}>
      <header className="flex items-center gap-2 border-b border-line px-4 py-2.5">
        <span className="size-3 rounded-full bg-pink" />
        <span className="size-3 rounded-full bg-[#ffd23d]" />
        <span className="size-3 rounded-full bg-lime" />
        <span className="ml-2 truncate font-mono text-[11.5px] text-muted">{title}</span>
        {status ? <span className="ml-auto shrink-0 font-mono text-[11px]">{status}</span> : null}
      </header>
      <div className="p-4 sm:p-5">{children}</div>
    </section>
  );
}

export function Running() {
  return (
    <span className="inline-flex items-center gap-1.5 text-lime">
      <span className="size-1.5 animate-pulse rounded-full bg-lime shadow-[0_0_8px_#c6ff3d]" />
      running
    </span>
  );
}
