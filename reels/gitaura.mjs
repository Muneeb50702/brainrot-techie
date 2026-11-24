// Day 001 reel: gitaura. Run: node reels/gitaura.mjs [githubUser]
import { openStage, startRecording, encode, cover, sleep } from "./lib.mjs";

const USER = process.argv[2] || "torvalds";
const SITE = "https://gitaura.muhammadmuneeb.tech/";
const FRAMES = "reels/frames/gitaura";
const OUT = "reels/out/day001-gitaura.mp4";

const s = await openStage(SITE);
const { frame, cap, end, tap, scrollTo, zoom } = s;
await sleep(1200); // let the shader + fonts settle before rolling

const stop = await startRecording(s.page, FRAMES);
const t0 = Date.now();

// 1. hook
await cap(`i built a site that rates<br>your <span class="hl">github aura</span> 💀`);
await sleep(2600);

// 2. type the victim
await cap(`testing it on the guy<br>who <span class="pk">made linux</span> 👀`);
const input = frame.locator("input");
await input.focus();
await input.pressSequentially(USER, { delay: 105 });
await sleep(350);
const btn = frame.locator('button[type="submit"]');
await tap(btn);
await btn.evaluate((b) => b.closest("form").requestSubmit());

// 3. loading
await sleep(450);
await zoom(0.9, 900);
await cap(`it reads ur commits, stars<br>&amp; <span class="hl">3am energy</span> 🦇`);
await frame.getByText("total aura", { exact: true }).first().waitFor({ timeout: 20000 });

// 4. the count (punch in on the number)
await zoom(1.0, 900);
await cap(`linus torvalds gets…`);
await sleep(2700);
const tier = (await frame.locator(".sticker").first().innerText()).trim().toLowerCase();
await cap(`<span class="hl">${tier}</span><br>ok he's him fr`);
await sleep(2200);

// 5. the receipt
await cap(`and the receipt is <span class="pk">brutal</span> 🧾`);
const receiptTop = await frame
  .locator("text=*** AURA RECEIPT ***")
  .evaluate((el) => el.getBoundingClientRect().top + scrollY - 40);
await scrollTo(receiptTop, 1600);
await sleep(1200);
await scrollTo(receiptTop + 260, 1400);
await sleep(700);

// 6. end card
await zoom(0.74, 500);
await end(`
  <div class="k pop">CHECK UR AURA 👇</div>
  <div class="u pop" style="animation-delay:.08s">gitaura.<br>muhammadmuneeb.tech</div>
  <div class="d pop" style="animation-delay:.16s">DAY 001 · a brainrot website every day</div>
  <div class="c pop" style="animation-delay:.28s">comment ur score 💬</div>`);
await sleep(3200);

const frames = await stop();
console.log(`recorded ${(Date.now() - t0) / 1000}s`);
await s.browser.close();

encode(frames, FRAMES, OUT);
cover(OUT, 13.2, "reels/out/day001-gitaura-cover.jpg");
