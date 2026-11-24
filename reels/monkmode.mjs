// Day 003 reel: monkmode. The full 60s trap gauntlet, sped up (badge on screen).
// Run: node reels/monkmode.mjs
import { openStage, startRecording, encode, cover, sleep } from "./lib.mjs";

const SPEED = 2.5;
const SITE = `https://monkmode.muhammadmuneeb.tech/?speed=${SPEED}`;
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

// 3. the gauntlet (captions keyed to game time)
const beats = [
  [0.2, `it starts calm…`],
  [3.2, `then your phone starts <span class="pk">begging</span> 📲`],
  [6.3, `wait there's a <span class="hl">hair</span> on my screen 🪮`],
  [11.7, `it <span class="pk">froze</span>?? 🧊`],
  [17.1, `bestie is calling 📞`],
  [25.1, `your screen is turning off 🌑`],
  [28.2, `it LOCKED?? <span class="hl">(it didn't)</span> 🔒`],
  [34.2, `then: chaos mode 🔥`],
  [42.1, `my screen just <span class="pk">cracked</span> 💔`],
  [46.6, `"tap to resume" ⏸ nice try`],
  [51.1, `wait… i LOST?? 💀`],
  [56.6, `JK it was <span class="hl">FAKE</span> 🤡`],
  [60.1, `and then… you WIN 🏆`],
];
let coverAt = 0;
for (const [g, text] of beats) {
  await at(g);
  if (g === 0.2) await badge(true);
  if (g === 42.1) coverAt = (Date.now() - t0) / 1000 + 0.4;
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
