// Day 003 reel: monkmode. The full 60s trap gauntlet, sped up (badge on screen).
// Run: node reels/monkmode.mjs
import { openStage, startRecording, encode, cover, sleep } from "./lib.mjs";

const SPEED = 2.5;
const SEED = Number(process.argv[2] || 120); // traps shuffle per run; a seed replays one plan
const SITE = `https://monkmode.muhammadmuneeb.tech/?speed=${SPEED}&seed=${SEED}`;
const FRAMES = "reels/frames/monkmode";
const OUT = "reels/out/day003-monkmode.mp4";

const s = await openStage(SITE);
const { frame, cap, end, tap, zoom, page } = s;
await sleep(1200);

const badge = (show) =>
  page.evaluate((on) => {
    let b = document.getElementById("speed-badge");
    if (!b) {
      b = document.createElement("div");
      b.id = "speed-badge";
      Object.assign(b.style, {
        position: "absolute", left: "16px", top: "252px", zIndex: 50, padding: "5px 10px", borderRadius: "999px",
        background: "rgba(0,0,0,.65)", color: "#ffd166", font: "700 12px JBM, monospace", letterSpacing: ".08em",
        border: "1px solid rgba(255,209,102,.4)", transition: "opacity .3s",
      });
      b.textContent = "⏩ SPED UP 2.5×";
      document.body.appendChild(b);
    }
    b.style.opacity = on ? "1" : "0";
  }, show);

const stop = await startRecording(page, FRAMES);
const t0 = Date.now();

// 1. hook
await cap(`can you <span class="hl">NOT</span> touch your<br>phone for 60 seconds? 🧘`);
await sleep(2600);

// 2. start
await cap(`one touch = you lose 💀`);
const startBtn = frame.getByRole("button", { name: /monk mode/i });
await tap(startBtn);
await startBtn.evaluate((b) => b.click());
const gStart = Date.now() + 2850;
const at = async (g) => {
  const ms = gStart + (g / SPEED) * 1000 - Date.now();
  if (ms > 0) await sleep(ms);
};
await zoom(0.86, 900);

// 3. the gauntlet: captions generated from this run's actual (shuffled) trap plan
await frame.waitForFunction(() => window.__monkPlan, null, { timeout: 15000 }); // exists once the run starts
const plan = await frame.evaluate(() => window.__monkPlan);
const LINES = {
  hair: `wait there's a <span class="hl">hair</span> on my screen 🪮`,
  freeze: `it <span class="pk">froze</span>?? 🧊`,
  dim: `my screen is turning off 🌑`,
  lock: `it LOCKED?? <span class="hl">(it didn't)</span> 🔒`,
  bug: `there's a BUG on my screen 🪳`,
  crack: `my screen just <span class="pk">cracked</span> 💔`,
  pause: `"tap to resume" ⏸ nice try`,
  fakeover: `wait… i LOST?? 💀`,
};
const fo = plan.traps.find((t) => t.kind === "fakeover");
const beats = [
  [0.2, `it starts calm…`],
  [3.0, `then your phone starts <span class="pk">begging</span> 📲`],
  ...plan.traps.map((t) => [t.at + 0.1, LINES[t.kind], t.kind]),
  [plan.callAt + 0.1, `${plan.caller.name} is calling 📞`],
  [fo.at + fo.dur + 0.1, `JK it was <span class="hl">FAKE</span> 🤡`],
  [60.1, `and then… you WIN 🏆`],
].sort((x, y) => x[0] - y[0]);
// Readability: hold each caption ≥2.2 game-s (delay the next one), fill long quiet gaps.
const FILLERS = [`STAY STRONG 🧘`, `it keeps getting worse 😭`, `don't. touch. it.`, `my thumb is shaking fr`];
for (let i = 1, f = 0; i < beats.length; i++) {
  const prev = beats[i - 1][0];
  if (beats[i][0] < prev + 2.2) beats[i][0] = prev + 2.2;
  if (beats[i][0] - prev > 7 && beats[i][0] < 59) beats.splice(i, 0, [prev + 3.6, FILLERS[f++ % FILLERS.length], "filler"]);
}
let coverAt = 0;
for (const [g, text, kind] of beats) {
  await at(g);
  if (g === 0.2) await badge(true);
  if (kind === "crack") coverAt = (Date.now() - t0) / 1000 + 0.4;
  await cap(text);
}

// 4. fall for the fake win
await sleep(1100);
const win = frame.locator('[data-bait*="YOU WIN"]');
await tap(win);
await win.dispatchEvent("pointerdown");
await badge(false);
await cap(`IT WAS A <span class="pk">TRAP</span> 💀`);
await zoom(1.0, 900);
await sleep(3200);

// 5. end card
await zoom(0.74, 500);
await end(`
  <div class="k pop">CAN U SURVIVE 60s? 👇</div>
  <div class="u pop" style="animation-delay:.08s">monkmode.<br>muhammadmuneeb.tech</div>
  <div class="d pop" style="animation-delay:.16s">DAY 003 · a brainrot website every day</div>
  <div class="g pop" style="animation-delay:.24s">⭐ code: github.com/Muneeb50702/brainrot-techie</div>
  <div class="c pop" style="animation-delay:.34s">comment ur time 💬 (be honest)</div>`);
await sleep(3200);

const frames = await stop();
await s.browser.close();
encode(frames, FRAMES, OUT);
cover(OUT, coverAt || 22, "reels/out/day003-monkmode-cover.jpg");
