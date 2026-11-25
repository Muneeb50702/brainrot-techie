// Reel factory: open the 9:16 stage, load a live site in the phone iframe,
// capture every compositor frame over CDP, then encode an IG-ready MP4.
import { chromium } from "playwright-core";
import { mkdirSync, readFileSync, rmSync, writeFileSync, existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const FONTS = {
  "/fonts/brico.woff2": "node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2",
  "/fonts/jbm.woff2": "node_modules/@fontsource-variable/jetbrains-mono/files/jetbrains-mono-latin-wght-normal.woff2",
  "/fonts/archivo.woff2": "node_modules/@fontsource-variable/archivo/files/archivo-latin-wdth-normal.woff2",
};

/** Cut a highlights edit: keep only [start, end] spans (seconds) of `src`, jump-cut together. */
export function cutHighlights(src, spans, out) {
  const parts = spans.map(([a, b], i) => `[0:v]trim=start=${a.toFixed(3)}:end=${b.toFixed(3)},setpts=PTS-STARTPTS[v${i}]`);
  const graph = `${parts.join(";")};${spans.map((_, i) => `[v${i}]`).join("")}concat=n=${spans.length}:v=1:a=0[out]`;
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", src, "-filter_complex", graph, "-map", "[out]", "-r", "30",
     "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-pix_fmt", "yuv420p", "-movflags", "+faststart", out],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("ffmpeg cut failed");
  const total = spans.reduce((s, [a, b]) => s + (b - a), 0);
  console.log(`✂️  ${out}  (${spans.length} cuts, ${total.toFixed(1)}s)`);
}
const EDGE = "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe";
const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";

export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function openStage(siteUrl, { headless = true } = {}) {
  const browser = await chromium.launch({
    executablePath: existsSync(CHROME) ? CHROME : EDGE,
    headless,
    args: ["--enable-gpu-rasterization", "--ignore-gpu-blocklist", "--use-angle=d3d11", "--hide-scrollbars", "--force-color-profile=srgb"],
  });
  const context = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  await context.route("https://reel.stage/**", (route) => {
    const p = new URL(route.request().url()).pathname;
    if (p === "/" || p === "/stage.html")
      return route.fulfill({ contentType: "text/html", body: readFileSync(path.join(ROOT, "reels/stage.html")) });
    if (FONTS[p]) return route.fulfill({ contentType: "font/woff2", body: readFileSync(path.join(ROOT, FONTS[p])) });
    return route.fulfill({ status: 404, body: "" });
  });
  const page = await context.newPage();
  await page.goto("https://reel.stage/");
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate((u) => (document.getElementById("site").src = u), siteUrl);
  const frame = await waitForFrame(page, siteUrl);
  await frame.waitForLoadState("networkidle").catch(() => {});

  const api = {
    browser,
    page,
    frame,
    cap: (html) => page.evaluate((h) => window.cap(h), html),
    end: (html) => page.evaluate((h) => window.end(h), html),
    zoom: (scale, ms = 700) => page.evaluate(([s, m]) => window.zoom(s, m), [scale, ms]),
    /** White ripple at an element's center inside the site, like a finger tap. */
    tap: async (locator) => {
      const pt = await locator.evaluate((el) => {
        const r = el.getBoundingClientRect();
        return { x: r.x + r.width / 2, y: r.y + r.height / 2 };
      });
      await frame.evaluate(({ x, y }) => {
        const d = document.createElement("div");
        Object.assign(d.style, {
          position: "fixed", left: x - 24 + "px", top: y - 24 + "px", width: "48px", height: "48px", borderRadius: "50%",
          background: "rgba(255,255,255,.6)", zIndex: 99999, pointerEvents: "none", transition: "transform .5s ease-out, opacity .5s ease-out",
        });
        document.body.appendChild(d);
        requestAnimationFrame(() => requestAnimationFrame(() => { d.style.transform = "scale(2.4)"; d.style.opacity = "0"; }));
        setTimeout(() => d.remove(), 700);
      }, pt);
    },
    /** Eased scroll inside the site over `ms`. */
    scrollTo: (y, ms) =>
      frame.evaluate(
        ({ to, ms }) =>
          new Promise((res) => {
            const from = scrollY, t0 = performance.now();
            const step = (now) => {
              const p = Math.min(1, (now - t0) / ms);
              const e = p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
              scrollTo(0, from + (to - from) * e);
              p < 1 ? requestAnimationFrame(step) : res();
            };
            requestAnimationFrame(step);
          }),
        { to: y, ms },
      ),
  };
  return api;
}

async function waitForFrame(page, siteUrl) {
  const host = new URL(siteUrl).host;
  for (let i = 0; i < 300; i++) { // up to 30 s: slow networks shouldn't kill a recording
    const f = page.frames().find((fr) => fr.url().includes(host));
    if (f) return f;
    await sleep(100);
  }
  throw new Error("site iframe never loaded");
}

/** Start capturing compositor frames. Returns stop() → frames written to dir. */
export async function startRecording(page, dir) {
  rmSync(dir, { recursive: true, force: true });
  mkdirSync(dir, { recursive: true });
  const cdp = await page.context().newCDPSession(page);
  const frames = [];
  cdp.on("Page.screencastFrame", async ({ data, metadata, sessionId }) => {
    const file = `f${String(frames.length).padStart(5, "0")}.jpg`;
    frames.push({ file, t: metadata.timestamp });
    writeFileSync(path.join(dir, file), Buffer.from(data, "base64"));
    await cdp.send("Page.screencastFrameAck", { sessionId }).catch(() => {});
  });
  await cdp.send("Page.startScreencast", { format: "jpeg", quality: 95, maxWidth: 1080, maxHeight: 1920, everyNthFrame: 1 });
  return async () => {
    await cdp.send("Page.stopScreencast");
    writeFileSync(path.join(dir, "frames.json"), JSON.stringify(frames));
    return frames;
  };
}

/** Variable-timing frames → constant 30fps H.264, IG-friendly. */
export function encode(rawFrames, dir, out, { trimStart = 0 } = {}) {
  // Cross-origin iframes composite separately, so screencast frames can arrive out of
  // timestamp order. Sort by capture time or backward jumps get double-counted (stretched video).
  const frames = [...rawFrames].sort((a, b) => a.t - b.t);
  const lines = [];
  for (let i = 0; i < frames.length; i++) {
    const next = frames[i + 1]?.t ?? frames[i].t + 1 / 30;
    lines.push(`file '${frames[i].file}'`, `duration ${Math.max(0.001, next - frames[i].t).toFixed(4)}`);
  }
  lines.push(`file '${frames.at(-1).file}'`);
  writeFileSync(path.join(dir, "list.txt"), lines.join("\n"));
  mkdirSync(path.dirname(out), { recursive: true });
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-f", "concat", "-safe", "0", "-i", path.join(dir, "list.txt"), "-ss", String(trimStart),
     "-vf", "scale=1080:1920:flags=lanczos,format=yuv420p", "-fps_mode", "cfr", "-r", "30",
     "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-profile:v", "high", "-movflags", "+faststart", out],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("ffmpeg failed");
  const span = frames.at(-1).t - frames[0].t;
  console.log(`🎬 ${out}  (${frames.length} frames over ${span.toFixed(1)}s ≈ ${(frames.length / span).toFixed(0)} fps captured)`);
}

/** Grab one frame from the MP4 as the reel cover. */
export function cover(mp4, at, out) {
  spawnSync("ffmpeg", ["-y", "-loglevel", "error", "-ss", String(at), "-i", mp4, "-frames:v", "1", "-q:v", "2", out], { stdio: "inherit" });
}
