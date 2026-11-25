import { BRAND, dayLabel } from "./brand";
import { cn } from "./cn";

/** "DAY 001 · a brainrot website every day" pill. Links to the root domain. */
export function DayBadge({ day, className }: { day: number; className?: string }) {
  return (
    <a
      href={`https://${BRAND.domain}`}
      target="_blank"
      rel="noreferrer"
      className={cn(
        "group inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-line bg-ink/70 py-1 pl-1 pr-3 font-mono text-[11px] tracking-wide text-muted backdrop-blur-md transition-colors hover:text-white",
        className,
      )}
    >
      <span className="rounded-full bg-lime px-2 py-0.5 font-bold text-ink">{dayLabel(day)}</span>
      <span className="hidden sm:inline">{BRAND.series}</span>
      <span className="sm:hidden">brainrot daily</span>
      {BRAND.instagram ? <span className="text-white/70">{BRAND.instagram}</span> : null}
    </a>
  );
}
