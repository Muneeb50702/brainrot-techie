// Day 004 reel: sukoon, the brainrot antidote. Full-bleed (no phone frame), WITH the site's
// own procedural audio: every AudioContext output is teed into a MediaRecorder, then muxed.
// Run: node reels/sukoon.mjs
import { chromium } from "playwright-core";
import { writeFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import { startRecording, encode, cover, sleep } from "./lib.mjs";

const SITE = "https://sukoon.muhammadmuneeb.tech/?scene=rain-glass&seed=7";
const FRAMES = "reels/frames/sukoon";
const SILENT = "reels/out/day004-sukoon-silent.mp4";
const AUDIO = "reels/frames/sukoon-audio.webm";
const OUT = "reels/out/day004-sukoon.mp4";
const WORRY = "my deadline is tomorrow";

const browser = await chromium.launch({
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required", "--enable-gpu-rasterization", "--ignore-gpu-blocklist", "--use-angle=d3d11", "--hide-scrollbars"],
});
const context = await browser.newContext({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });

// Tee every AudioContext's output into a MediaStream we can record (playback is unchanged).
await context.addInitScript(() => {
  const desc = Object.getOwnPropertyDescriptor(BaseAudioContext.prototype, "destination");
  Object.defineProperty(BaseAudioContext.prototype, "destination", {
    configurable: true,
    get() {
      const real = desc.get.call(this);
      if (!this.__tap) {
        const g = new GainNode(this);
        g.connect(real);
        const ms = new MediaStreamAudioDestinationNode(this);
        g.connect(ms);
        this.__tap = g;
        (window.__taps ||= []).push(ms.stream);
      }
      return this.__tap;
    },
  });
});

const page = await context.newPage();
await page.goto(SITE);
await page.evaluate(() => document.fonts.ready);
await sleep(3000);

// Caption + end-card layer, in the site's own handwriting (Caveat) and serif.
await page.evaluate(() => {
  const st = document.createElement("style");
  st.textContent = `
    #reel-cap{position:fixed;left:7%;right:7%;top:14%;z-index:2147483647;text-align:center;
      font:500 44px/1.08 Caveat,'Segoe Print',cursive;color:#f6f3ff;letter-spacing:.2px;
      text-shadow:0 2px 16px rgba(8,10,28,.9),0 0 44px rgba(150,140,255,.35);
      opacity:0;transform:translateY(10px);transition:opacity .9s ease,transform .9s ease;pointer-events:none}
    #reel-cap.on{opacity:1;transform:none}
    #reel-end{position:fixed;inset:0;z-index:2147483647;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:16px;
      background:radial-gradient(90% 60% at 50% 50%,rgba(14,16,40,.55),rgba(8,9,24,.82));backdrop-filter:blur(12px);
      opacity:0;transition:opacity 1.6s ease;pointer-events:none;color:#ece9f7;text-align:center}
    #reel-end.on{opacity:1}
    #reel-end .t{font:400 64px/1 'Iowan Old Style','Palatino Linotype',Palatino,Georgia,serif;letter-spacing:2px}
    #reel-end .s{font:italic 20px/1.2 'Palatino Linotype',Georgia,serif;color:#b9b5d6}
    #reel-end .u{margin-top:18px;font:600 17px/1 system-ui,sans-serif;padding:10px 18px;border-radius:999px;border:1px solid rgba(220,215,255,.35);background:rgba(255,255,255,.06)}
    #reel-end .d{font:700 11px/1 ui-monospace,monospace;letter-spacing:.25em;color:#9d99c4}
    #reel-end .c{margin-top:10px;font:500 30px/1 Caveat,cursive;color:#f6f3ff}`;
  document.head.appendChild(st);
  const cap = document.createElement("div");
  cap.id = "reel-cap";
  document.body.appendChild(cap);
  const end = document.createElement("div");
  end.id = "reel-end";
  document.body.appendChild(end);
  window.reelCap = async (html, top = "14%") => {
    cap.classList.remove("on");
    await new Promise((r) => setTimeout(r, html ? 650 : 0));
    cap.style.top = top;
    cap.innerHTML = html;
    if (html) requestAnimationFrame(() => cap.classList.add("on"));
  };
  window.reelEnd = (html) => {
    end.innerHTML = html;
    requestAnimationFrame(() => end.classList.add("on"));
  };
});
const cap = (html, top) => page.evaluate(([h, t]) => window.reelCap(h, t), [html, top]);
// engine.goTo() called mid-load/fade only overwrites one "pending" slot, so intermediate scenes get
// dropped. Drive it by its real state: wait idle → goTo → wait until the scene is fading in (or fully in).
const ENGINE_IDLE = () => { const e = window.__sukoon.engine; return !e.loading && !e.next_; };
const go = async (id, seed = 3, fadeS = 2.0, { full = false } = {}) => {
  await page.waitForFunction(ENGINE_IDLE, null, { timeout: 20000, polling: 30 });
  await page.evaluate(([i, sd, f]) => { window.__sukoon.engine.goTo(i, { seed: sd, fadeS: f }); }, [id, seed, fadeS]);
  await page.waitForFunction(
    ([i, whole]) => {
      const e = window.__sukoon.engine;
      return whole ? e.cur?.meta?.id === i && !e.next_ && !e.loading : e.next_?.meta?.id === i || (e.cur?.meta?.id === i && !e.loading);
    },
    [id, full],
    { timeout: 20000, polling: 30 },
  );
};

// Pre-warm every scene chunk we'll use (so cross-fades start instantly), then back to the landing scene.
for (const id of ["deep-sea", "lanterns", "petals", "nebula", "voronoi-glass", "soap-film", "moon-water", "kaleidoscope", "fireflies", "aurora", "let-it-go", "candle"]) {
  await page.evaluate((i) => window.__sukoon.engine.goTo(i, { seed: 3, fadeS: 0.05 }), id);
  await sleep(250);
}
await page.evaluate(() => window.__sukoon.engine.goTo("rain-glass", { seed: 7, fadeS: 0.05 }));
await sleep(2500);

const stop = await startRecording(page, FRAMES);
const tVideo = Date.now();

// 1. hook, over the landing ("Sukoon · a quiet place" on rain glass)
await sleep(150);
await cap(`after 3 days of brainrot…`, "44%");
await sleep(2000);
await cap(`i built the opposite 🫧`, "44%");
const coverAt = (Date.now() - tVideo) / 1000 + 1.2; // the hook frame: title + rain + caption
await sleep(1900);

// 2. enter (sound starts here) → skip the name step
await cap("");
await page.getByRole("button", { name: "enter" }).first().click();
await sleep(250);
const cont = page.getByRole("button", { name: "continue" });
if (await cont.count()) await cont.first().click();
await sleep(250);
const tAudio = Date.now();
await page.evaluate(() => {
  const s = window.__taps?.[0];
  if (!s) return;
  window.__chunks = [];
  window.__rec = new MediaRecorder(s, { mimeType: "audio/webm;codecs=opus", audioBitsPerSecond: 192000 });
  window.__rec.ondataavailable = (e) => window.__chunks.push(e.data);
  window.__rec.start(250);
});
// Fade out the app chrome (bottom bar, scene titles, edge buttons) for clean shots.
// Let it go's writing overlay lives on <body>, outside #ui, so it stays usable.
await page.addStyleTag({ content: "#ui{transition:opacity .8s ease;opacity:0!important;pointer-events:none!important}" });

// 3. a gentle flick through the most beautiful worlds (native cross-fades)
const MONTAGE = [
  ["deep-sea", 4], ["lanterns", 2], ["petals", 5], ["nebula", 3],
  ["voronoi-glass", 2], ["soap-film", 6], ["moon-water", 3], ["kaleidoscope", 4],
];
await cap(`48 calm little worlds 🫧`);
for (let i = 0; i < MONTAGE.length; i++) {
  const [id, seed] = MONTAGE[i];
  await go(id, seed, 0.6, { full: true }); // every world gets equal screen time
  if (i === 4) await cap(`for when your brain is fried 🫠`);
  await sleep(450);
}

// 4. slow down: two worlds that show it's alive, not a video
await go("fireflies", 3, 1.6);
await cap(`the fireflies slowly sync up.<br>like real ones ✨`);
await sleep(3000);
await go("aurora", 3, 1.8);
await cap(`nothing here is a video.<br>it's all drawn live, right now`);
await sleep(3000);

// 5. let it go: type a real worry, watch it dissolve
await go("let-it-go", 3, 1.6, { full: true }); // textarea needs the scene live
await cap(`type a worry…`, "66%");
await sleep(1400);
const ta = page.locator("textarea").first();
if (await ta.count()) {
  await ta.focus();
  await ta.pressSequentially(WORRY, { delay: 45 });
  await sleep(400);
  await page.keyboard.press("Enter");
  await cap(`…and watch it dissolve`, "66%");
  await sleep(3200);
}

// 6b. cozy close
await go("candle", 3, 1.0);
await cap("");
await sleep(500);
await cap(`and a tiny friend keeps you company 🕯️`);
await sleep(2700);

// 6. end card
await cap("");
await page.evaluate(() =>
  window.reelEnd(`
    <div class="t">Sukoon</div>
    <div class="s">a quiet place for a loud brain</div>
    <div class="u">sukoon.muhammadmuneeb.tech</div>
    <div class="d">DAY 004 · THE BRAINROT ANTIDOTE</div>
    <div class="c">headphones on 🎧 · save this for later 🔖</div>`),
);
await sleep(3800);

// stop + collect audio
const b64 = await page.evaluate(async () => {
  if (!window.__rec) return null;
  window.__rec.stop();
  await new Promise((r) => setTimeout(r, 500));
  const buf = new Uint8Array(await new Blob(window.__chunks, { type: "audio/webm" }).arrayBuffer());
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
});
const frames = await stop();
await browser.close();

encode(frames, FRAMES, SILENT);
const dur = Number(spawnSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", SILENT]).stdout.toString().trim());
if (b64) {
  writeFileSync(AUDIO, Buffer.from(b64, "base64"));
  const offMs = Math.max(0, tAudio - tVideo);
  const fadeOutAt = Math.max(0, dur - 2.5).toFixed(2);
  const r = spawnSync(
    "ffmpeg",
    ["-y", "-loglevel", "error", "-i", SILENT, "-i", AUDIO,
     "-filter_complex", `[1:a]adelay=${offMs}|${offMs},loudnorm=I=-16:TP=-1.5:LRA=11,afade=t=in:st=${(offMs / 1000).toFixed(2)}:d=2,apad,afade=t=out:st=${fadeOutAt}:d=2.5[a]`,
     "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-t", dur.toFixed(2), "-movflags", "+faststart", OUT],
    { stdio: "inherit" },
  );
  if (r.status !== 0) throw new Error("mux failed");
  console.log(`🔊 ${OUT} (audio offset ${offMs} ms, ${dur.toFixed(1)}s)`);
} else {
  console.log("no audio captured; silent version only:", SILENT);
}
cover(SILENT, coverAt, "reels/out/day004-sukoon-cover.jpg");
