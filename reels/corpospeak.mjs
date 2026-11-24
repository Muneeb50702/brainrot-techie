// Day 002 reel: corpospeak. Run: node reels/corpospeak.mjs
import { openStage, startRecording, encode, cover, sleep } from "./lib.mjs";

const SITE = "https://corpospeak.muhammadmuneeb.tech/";
const FRAMES = "reels/frames/corpospeak";
const OUT = "reels/out/day002-corpospeak.mp4";
const BOSS = "Can you hop on a quick call? Nothing to worry about 🙂";
const GENZ = "bro prod is cooked and it's not my fault fr";

const s = await openStage(SITE);
const { frame, cap, end, tap, scrollTo, zoom } = s;

// Warm the edge cache so the reel doesn't sit on a loading spinner (same inputs → cache HIT).
for (const [mode, text] of [["corp2z", BOSS], ["z2corp", GENZ]]) {
  await frame.evaluate(
    ([m, t]) => fetch("https://rot-api.muhammadmuneeb.tech/v1/corpospeak", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ mode: m, text: t }) }).then((r) => r.status),
    [mode, text],
  );
}
await sleep(1200);

const stop = await startRecording(s.page, FRAMES);

// 1. hook
await cap(`i built a translator for<br>when your boss texts <span class="hl">"quick call?"</span> 💀`);
await sleep(2600);

// 2. type the boss message
await cap(`we all know this message 😐`);
const box = frame.locator("textarea");
await box.focus();
await box.pressSequentially(BOSS, { delay: 45 });
await sleep(300);
const btn = frame.locator('button[type="submit"]');
await tap(btn);
await btn.click();

// 3. the translation (punch in)
await zoom(1.0, 900);
await cap(`gen z translation:`);
const top = await frame.locator("text=gen z translation").first().evaluate((el) => el.getBoundingClientRect().top + scrollY - 140);
await scrollTo(top, 900);
await frame.locator("text=what they actually mean").waitFor({ timeout: 30000 });
await sleep(400);
await cap(`and what they <span class="pk">actually</span> mean 🚩`);
const meaning = await frame.locator("text=what they actually mean").first().evaluate((el) => el.getBoundingClientRect().top + scrollY - 160);
await scrollTo(meaning, 1100);
await sleep(2600);

// 4. reverse mode
await zoom(0.74, 600);
await cap(`it also works <span class="hl">backwards</span> 👔`);
await scrollTo(0, 900);
await frame.getByRole("tab").nth(1).click();
await sleep(300);
await box.fill("");
await box.pressSequentially(GENZ, { delay: 40 });
await tap(btn);
await btn.click();
await zoom(1.0, 900);
await frame.locator("text=Subject:").first().waitFor({ timeout: 30000 });
const mail = await frame.locator("text=Subject:").first().evaluate((el) => el.getBoundingClientRect().top + scrollY - 140);
await scrollTo(mail, 900);
await cap(`"prod is cooked" → <span class="hl">promotion ready</span>`);
await sleep(3800);

// 5. open source + end card
await zoom(0.74, 600);
await cap(`free + <span class="hl">open source</span> 🫡`);
await scrollTo(99999, 1200);
await tap(frame.locator('a[href*="github.com/Muneeb50702"]').first());
await sleep(1300);
await end(`
  <div class="k pop">TRANSLATE UR BOSS 👇</div>
  <div class="u pop" style="animation-delay:.08s">corpospeak.<br>muhammadmuneeb.tech</div>
  <div class="d pop" style="animation-delay:.16s">DAY 002 · a brainrot website every day</div>
  <div class="g pop" style="animation-delay:.24s">⭐ code: github.com/Muneeb50702/brainrot-techie</div>
  <div class="c pop" style="animation-delay:.34s">worst work text u got? 💬</div>`);
await sleep(3400);

const frames = await stop();
await s.browser.close();
encode(frames, FRAMES, OUT);
cover(OUT, 11.5, "reels/out/day002-corpospeak-cover.jpg");
