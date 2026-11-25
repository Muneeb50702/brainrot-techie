// Day 007 reel: screamload. A synthetic scream (reels/make-scream.py) is fed to Chrome as the
// microphone, so the LIVE site downloads at the real speed its meter reads. Nothing sped up.
// Captions are keyed to the site's own state (window.__sl). Run: node reels/screamload.mjs
import { existsSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { openStage, startRecording, encode, cover, sleep, cutHighlights } from "./lib.mjs";

const SITE = "https://screamload.muhammadmuneeb.tech/";
const WAV = path.resolve("reels/frames/scream.wav");
const FRAMES = "reels/frames/screamload";
const RAW = "reels/frames/screamload-full.mp4";
const OUT = "reels/out/day007-screamload.mp4";

if (!existsSync(WAV)) {
  const r = spawnSync("python", ["-I", "reels/make-scream.py", WAV], { stdio: "inherit" });
  if (r.status !== 0) throw new Error("couldn't synthesize the scream (needs python + numpy)");
}

const s = await openStage(SITE, {
  permissions: ["microphone"],
  args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream", `--use-file-for-fake-audio-capture=${WAV}`, "--autoplay-policy=no-user-gesture-required"],
});
const { frame, cap, end, zoom, page, tap } = s;

// hazard-tape stage, captions in the site's Anton
await page.addStyleTag({
  content: `
  @font-face{font-family:"Anton";src:url("/fonts/anton.woff2") format("woff2")}
  @font-face{font-family:"Martian";src:url("/fonts/martian.woff2") format("woff2");font-weight:100 900}
  html,body{background:#0b0b0b!important}
  .bg{background:radial-gradient(60% 35% at 50% 0%,rgba(255,212,0,.22),transparent 70%),radial-gradient(50% 30% at 50% 100%,rgba(255,90,31,.25),transparent 70%),#0b0b0b!important}
  .grid{display:none!important}
  body::before{content:"";position:absolute;left:0;right:0;top:0;height:20px;z-index:3;background:repeating-linear-gradient(-45deg,#ffd400 0 18px,#0b0b0b 18px 36px)}
  #cap{top:40px;height:210px;color:#f5f5f0;font-family:Anton,Impact,sans-serif;font-weight:400;font-size:40px;line-height:1.02;letter-spacing:.01em;text-transform:uppercase}
  .hl{background:#ffd400!important;color:#0b0b0b!important;box-shadow:4px 4px 0 #ff5a1f!important;border-radius:.08em!important;padding:0 .12em!important}
  .pk{color:#ff5a1f!important}.hz{color:#ffd400}.al{color:#ff2a2a}.sm{font-size:.62em;letter-spacing:.04em}
  #phone{border-color:#161616!important;box-shadow:0 0 0 3px #ffd400,0 40px 140px -30px rgba(255,212,0,.45)!important}
  #end{background:radial-gradient(70% 40% at 50% 45%,rgba(255,212,0,.13),transparent 70%),#0b0b0b!important;backdrop-filter:none!important}
  #end::before{content:"";position:absolute;left:0;right:0;top:0;height:20px;background:repeating-linear-gradient(-45deg,#ffd400 0 18px,#0b0b0b 18px 36px)}
  #end::after{content:"";position:absolute;left:0;right:0;bottom:0;height:20px;background:repeating-linear-gradient(-45deg,#ffd400 0 18px,#0b0b0b 18px 36px)}
  #end .k{font-family:Martian,monospace!important;color:#a3a39a!important;letter-spacing:.2em;font-size:13px}
  #end .u{font-family:Anton,Impact,sans-serif!important;font-weight:400!important;color:#ffd400!important;font-size:50px!important;letter-spacing:.01em!important;text-transform:uppercase;line-height:1.02!important}
  #end .d{font-family:Martian,monospace!important;background:#ffd400!important;color:#0b0b0b!important;font-size:12px}
  #end .g{font-family:Martian,monospace!important;font-size:11.5px;border-color:#2c2c28!important}
  #end .c{font-family:Anton,Impact,sans-serif!important;font-weight:400!important;text-transform:uppercase;font-size:30px;color:#f5f5f0}
`,
});
await page.evaluate(() => Promise.all([document.fonts.load('40px "Anton"'), document.fonts.load('600 13px "Martian"')]));
await sleep(1200);

const stop = await startRecording(page, FRAMES);
const t0 = Date.now();
const marks = {};
const mark = (k) => (marks[k] ??= (Date.now() - t0) / 1000);
let lastCap = 0;
const say = async (k, html) => {
  mark(k);
  lastCap = Date.now();
  await cap(html);
};

// ── hook ──
await say("intro", `i made a site where your<br>download speed = how<br>loud you <span class="hl">scream</span> 📢`);
await sleep(2700);
await say("file", `the file:<br><span class="hz">free_ram_4.20GB.zip</span> 💾`);
await sleep(1500);

const mic = frame.locator("[data-mic]");
await tap(mic);
await mic.evaluate((el) => el.click());
mark("tapMic");

// ── the download, captioned off the site's own meter ──
await zoom(0.9, 700);
const sl = () =>
  frame.evaluate(() => ({
    ...(window.__sl || {}),
    nb: (document.querySelector("[data-download]")?.textContent || "").match(/neighbours: (.+)$/)?.[1] || "",
  }));
for (let guard = 0; guard < 900; guard++) {
  const st = await sl();
  if (st.phase === "done") break;
  const going = (st.speed ?? 0) > 0;
  const quiet = Date.now() - lastCap > 1700;
  if (st.phase === "calibrating" && !marks.calib) await say("calib", `step 1: stay quiet 🤫<br><span class="sm hz">(it's calibrating ur room)</span>`);
  else if (going && !marks.scream1) await say("scream1", `step 2:<br><span class="hl">aaaaaaaaaa</span> 😱`);
  else if (!going && marks.scream1 && !marks.pause && st.phase === "downloading") await say("pause", `stop screaming =<br>download <span class="al">paused</span> 💀`);
  else if (going && marks.pause && !marks.scream2) await say("scream2", `louder = <span class="hl">faster</span> 📈`);
  else if (marks.scream2 && !marks.wall && quiet && /wall/.test(st.nb)) await say("wall", `neighbours: <span class="pk">banging<br>on the wall</span> 😠`);
  else if (marks.scream2 && !marks.landlord && quiet && /landlord|police/.test(st.nb)) await say("landlord", `neighbours: <span class="pk">calling<br>the landlord</span> 📞`);
  await sleep(50);
}

// ── done → open the file → the twist ──
mark("done");
await zoom(0.74, 600);
const secs = await frame.evaluate(() => document.querySelector("main h2")?.textContent?.trim() || "");
await say("doneCap", `4.20 GB in <span class="hl">${secs}</span> 🫁`);
await sleep(1500);
await say("openCap", `now open the file 📂`);
await sleep(700);
const open = frame.locator("[data-open]");
await tap(open);
mark("openTap");
await open.evaluate((el) => el.click());
await sleep(350);
await say("open", `wait… <span class="hl">you can't<br>download RAM</span> 💀`);
await sleep(2400);
await s.scrollTo(300, 900);
const rank = await frame.evaluate(() => document.querySelector(".sticker")?.textContent?.trim() || "");
await say("rank", `my lungs: <span class="hl">${rank}</span>`);
await sleep(2300);

mark("end");
await end(`
  <div class="k pop">CAN U OUT-SCREAM ME? 👇</div>
  <div class="u pop" style="animation-delay:.08s">screamload.<br>muhammadmuneeb.tech</div>
  <div class="d pop" style="animation-delay:.16s">DAY 007 · a brainrot website every day</div>
  <div class="g pop" style="animation-delay:.24s">⭐ code: github.com/Muneeb50702/brainrot-techie</div>
  <div class="c pop" style="animation-delay:.34s">comment ur time 😱⏱️</div>`);
await sleep(3400);

const frames = await stop();
await s.browser.close();
encode(frames, FRAMES, RAW);
const M = marks;
console.log("marks:", Object.fromEntries(Object.entries(M).map(([k, v]) => [k, +v.toFixed(2)])));

const spans = [
  [M.intro + 0.15, M.openCap + 0.2], // hook → the whole real-time download → result
  [M.openTap - 0.25, M.open + 2.3], // open file → the twist
  [M.rank - 0.15, M.rank + 2.1], // lungs rank
  [M.end, M.end + 3.3],
].filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a);
cutHighlights(RAW, spans, OUT);
cover(OUT, Math.max(0.5, (M.landlord ?? M.scream2 + 2.5) - (M.intro + 0.15) + 0.6), "reels/out/day007-screamload-cover.jpg");
