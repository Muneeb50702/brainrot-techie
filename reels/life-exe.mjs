// Day 002 reel: life.exe. Run: node reels/life-exe.mjs [YYYY-MM-DD]
import { openStage, startRecording, encode, cover, sleep } from "./lib.mjs";

const BDAY = process.argv[2] || "2003-03-12";
const YEAR = BDAY.slice(0, 4);
const SITE = "https://life-exe.muhammadmuneeb.tech/";
const FRAMES = "reels/frames/life-exe";
const OUT = "reels/out/day002-life-exe.mp4";

const ageMin = (Date.now() - new Date(BDAY + "T00:00:00").getTime()) / 60000;
const heartM = Math.round((ageMin * 80) / 1e6);
const spaceB = Math.round((ageMin * 60 * 29.78) / 1e9);

const s = await openStage(SITE);
const { frame, cap, end, tap, scrollTo, zoom } = s;
await sleep(1200);
const stop = await startRecording(s.page, FRAMES);
const t0 = Date.now();

const scrollToText = async (text, offset = 120, ms = 1000) => {
  const y = await frame.getByText(text, { exact: false }).first().evaluate((el, o) => el.getBoundingClientRect().top + scrollY - o, offset);
  await scrollTo(y, ms);
};

// 1. hook
await cap(`i turned your life into a<br><span class="hl">running program</span> 💻`);
await sleep(2100);

// 2. run it
await cap(`born in ${YEAR}? let's run it 👇`);
await frame.locator('input[type="date"]').fill(BDAY);
await sleep(700);
const run = frame.getByRole("button", { name: /run life\.exe/ });
await tap(run);
// click() hit-tests through the scaled phone frame and misses; submit the form directly.
await run.evaluate((b) => b.closest("form").requestSubmit());
await zoom(0.9, 900);
await sleep(700);
await cap(`booting life.exe…`);
await frame.getByText("uptime", { exact: true }).first().waitFor({ timeout: 10000 });

// 3. the dashboard (punch in)
await zoom(1.0, 900);
await cap(`${2026 - Number(YEAR)} years of uptime.<br>0 restarts. still buggy 💀`);
await sleep(1900);
await cap(`your heart: <span class="pk">${heartM} million</span><br>beats. no PTO ❤️`);
await scrollToText("heartbeats", 60, 800);
await sleep(1700);
await cap(`${spaceB} billion km through<br>space. <span class="hl">for free</span> 🌍`);
await sleep(1800);

// 4. the punchline
await cap(`and this one <span class="pk">hurts</span> 💀`);
await scrollToText("critical warning", 70, 1000);
const coverAt = (Date.now() - t0) / 1000 + 0.8;
await sleep(2600);

// 5. drag the screen-time slider live
await cap(`now slide ur screen time 📱`);
await scrollToText("daily screen time", 60, 900);
await sleep(300);
await frame.locator('input[type="range"]').evaluate(async (el) => {
  const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
  for (let v = 7; v <= 12; v += 0.5) {
    set.call(el, String(v));
    el.dispatchEvent(new Event("input", { bubbles: true }));
    await new Promise((r) => setTimeout(r, 160));
  }
});
await cap(`years of ur life.<br>on a <span class="hl">rectangle</span> 📱`);
await sleep(1900);

// 6. milestones
await cap(`+ ur <span class="hl">1 billion second</span><br>birthday 🎂`);
await scrollToText("scheduled tasks", 40, 1000);
await sleep(2000);

// 7. open source + end card
await zoom(0.74, 600);
await cap(`free + <span class="hl">open source</span> 🫡`);
await scrollTo(99999, 1100);
await tap(frame.locator('a[href*="github.com/Muneeb50702"]').first());
await sleep(1200);
await end(`
  <div class="k pop">RUN YOUR LIFE 👇</div>
  <div class="u pop" style="animation-delay:.08s">life-exe.<br>muhammadmuneeb.tech</div>
  <div class="d pop" style="animation-delay:.16s">DAY 002 · a brainrot website every day</div>
  <div class="g pop" style="animation-delay:.24s">⭐ code: github.com/Muneeb50702/brainrot-techie</div>
  <div class="c pop" style="animation-delay:.34s">what were u born closer to? 💬</div>`);
await sleep(3000);

const frames = await stop();
await s.browser.close();
encode(frames, FRAMES, OUT);
cover(OUT, coverAt, "reels/out/day002-life-exe-cover.jpg");
