/** Tiny read-only state mirror for automated reel recordings (reels/cooked.mjs). Not used by the UI. */
export function dbg(patch: Record<string, unknown>) {
  const w = window as unknown as { __cooked?: Record<string, unknown> };
  w.__cooked = { ...(w.__cooked ?? {}), ...patch };
}
