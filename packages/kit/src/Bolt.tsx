export function Bolt({ className, size }: { className?: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className} width={size ?? 40} height={size ?? 40} fill="currentColor">
      <path d="M13.5 2 4 14h6.5L9 22l11-13h-7z" />
    </svg>
  );
}
