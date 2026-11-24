import { BRAND } from "./brand";

export type ToolErrorKind = "rate_limited" | "not_configured" | "refused" | "busy" | "upstream" | "bad_input" | "network";

export class ToolError extends Error {
  kind: ToolErrorKind;
  constructor(kind: ToolErrorKind) {
    super(kind);
    this.kind = kind;
  }
}

/** POST to the shared AI backend: /v1/<tool>. Throws ToolError with a kind the UI can roast. */
export async function callTool<T>(tool: string, body: unknown, signal?: AbortSignal): Promise<T> {
  let res: Response;
  try {
    res = await fetch(`${BRAND.api}/v1/${tool}`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(body),
      signal,
    });
  } catch {
    throw new ToolError("network");
  }
  if (res.ok) return (await res.json()) as T;
  const err = ((await res.json().catch(() => ({}))) as { error?: string }).error;
  const known: ToolErrorKind[] = ["rate_limited", "not_configured", "refused", "busy", "upstream", "bad_input"];
  throw new ToolError(known.includes(err as ToolErrorKind) ? (err as ToolErrorKind) : "upstream");
}
