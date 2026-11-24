import type Anthropic from "@anthropic-ai/sdk";
import type { z } from "zod";

export interface RateLimiter {
  limit(options: { key: string }): Promise<{ success: boolean }>;
}

export interface Env {
  ANTHROPIC_API_KEY?: string;
  MODEL: string;
  EFFORT: "low" | "medium" | "high" | "xhigh" | "max";
  PER_IP: RateLimiter;
  GLOBAL: RateLimiter;
}

export interface Ctx {
  waitUntil(promise: Promise<unknown>): void;
}

/** One AI-powered site = one tool: validated input in, JSON out. Prompts never leave the server. */
export interface Tool<I> {
  input: z.ZodType<I>;
  run(client: Anthropic, env: Env, input: I): Promise<Record<string, unknown>>;
}

/** Claude declined (stop_reason "refusal") or returned nothing parseable. Not cached. */
export class RefusedError extends Error {}

/** Models that accept server-side refusal fallbacks (Haiku 5.5 has none). */
export const supportsFallbacks = (model: string) => /^claude-(opus-5-5|opus-5|sonnet-5-5|fable-5)/.test(model);
