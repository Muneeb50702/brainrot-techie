import Anthropic from "@anthropic-ai/sdk";
import { RefusedError, type Ctx, type Env, type Tool } from "./types";
import { corpospeak } from "./tools/corpospeak";

// Register every AI-powered day here.
const TOOLS: Record<string, Tool<any>> = { corpospeak };

const ORIGIN_RE = /^https:\/\/[a-z0-9-]+\.muhammadmuneeb\.tech$|^http:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const CACHE_TTL = 60 * 60 * 24;

function corsHeaders(origin: string | null): Record<string, string> {
  const h: Record<string, string> = {
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type",
    "Access-Control-Max-Age": "86400",
    Vary: "Origin",
  };
  if (origin && ORIGIN_RE.test(origin)) h["Access-Control-Allow-Origin"] = origin;
  return h;
}

const json = (body: unknown, status: number, headers: Record<string, string>) =>
  new Response(JSON.stringify(body), { status, headers: { ...headers, "content-type": "application/json; charset=utf-8" } });

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default {
  async fetch(req: Request, env: Env, ctx: Ctx): Promise<Response> {
    const origin = req.headers.get("Origin");
    const h = corsHeaders(origin);
    if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: h });

    const url = new URL(req.url);
    if (req.method === "GET" && url.pathname === "/") return json({ ok: true, tools: Object.keys(TOOLS) }, 200, h);

    const name = url.pathname.match(/^\/v1\/([a-z0-9-]+)$/)?.[1];
    const tool = name ? TOOLS[name] : undefined;
    if (!name || !tool || req.method !== "POST") return json({ error: "not_found" }, 404, h);
    if (!origin || !ORIGIN_RE.test(origin)) return json({ error: "forbidden_origin" }, 403, h);

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: "bad_json" }, 400, h);
    }
    const parsed = tool.input.safeParse(body);
    if (!parsed.success) return json({ error: "bad_input" }, 400, h);

    // Same input → same answer from the edge cache: free, instant, no rate-limit hit.
    const cache = (caches as unknown as { default: Cache }).default;
    const cacheKey = new Request(`https://rot-api.cache/${name}/${await sha256(JSON.stringify(parsed.data))}`);
    const hit = await cache.match(cacheKey);
    if (hit) return json(await hit.json(), 200, { ...h, "x-cache": "HIT" });

    const ip = req.headers.get("CF-Connecting-IP") ?? "anon";
    const [mine, all] = await Promise.all([env.PER_IP.limit({ key: `${name}:${ip}` }), env.GLOBAL.limit({ key: "all" })]);
    if (!mine.success || !all.success) return json({ error: "rate_limited" }, 429, h);

    if (!env.ANTHROPIC_API_KEY) return json({ error: "not_configured" }, 503, h);

    try {
      const client = new Anthropic({ apiKey: env.ANTHROPIC_API_KEY, maxRetries: 1, timeout: 45_000 });
      const out = await tool.run(client, env, parsed.data);
      ctx.waitUntil(
        cache.put(cacheKey, new Response(JSON.stringify(out), { headers: { "Cache-Control": `public, max-age=${CACHE_TTL}` } })),
      );
      return json(out, 200, { ...h, "x-cache": "MISS" });
    } catch (e) {
      if (e instanceof RefusedError) return json({ error: "refused" }, 422, h);
      if (e instanceof Anthropic.RateLimitError) return json({ error: "busy" }, 503, h);
      if (e instanceof Anthropic.AuthenticationError) return json({ error: "not_configured" }, 503, h);
      if (e instanceof Anthropic.APIError) {
        console.error("anthropic", e.status, e.message);
        return json({ error: "upstream" }, 502, h);
      }
      console.error(e);
      return json({ error: "upstream" }, 502, h);
    }
  },
};
