/** Read-only state mirror for the automated reel bot (reels/autocorrupt-bot.mjs). Not used by the UI. */
export function dbg(patch: Record<string, unknown>) {
  const w = window as unknown as { __ac?: Record<string, unknown> };
  w.__ac = { ...(w.__ac ?? {}), ...patch };
}
