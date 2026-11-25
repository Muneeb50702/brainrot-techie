// Day 006 reel: autocorrupt. The bot plays the live site; we jump-cut the corrupt → fix →
// send → reply beats of all three texts (nothing sped up). Run: node reels/autocorrupt.mjs
import { openStage, startRecording, encode, cover, sleep, cutHighlights } from "./lib.mjs";
import { playAutocorrupt } from "./autocorrupt-bot.mjs";

const SITE = "https://autocorrupt.muhammadmuneeb.tech/?seed=3"; // seeded dice: a reproducible, properly chaotic run
const FRAMES = "reels/frames/autocorrupt";
const RAW = "reels/frames/autocorrupt-full.mp4";
const OUT = "reels/out/day006-autocorrupt.mp4";

const s = await openStage(SITE);
const { frame, cap, end, zoom, page } = s;

// lilac "cursed messenger" stage, captions in the villain's pixel font
await page.addStyleTag({
  content: `
  @font-face{font-family:"Pixelify";src:url("/fonts/pixelify.woff2") format("woff2");font-weight:400 700}
  html,body{background:#e7e3ff!important}
  body{background-image:radial-gradient(rgba(22,15,46,.1) 1.6px,transparent 1.6px)!important;background-size:16px 16px!important}
  .bg,.grid{display:none!important}
  #cap{color:#160f2e;font-family:Pixelify,monospace;font-weight:700;font-size:31px;letter-spacing:0;text-shadow:none}
  .hl{background:#ffe94d!important;color:#160f2e!important;box-shadow:3px 3px 0 #160f2e!important}
  .pk{color:#ff2d55!important}
  #phone{border-color:#160f2e!important;box-shadow:12px 12px 0 #160f2e!important}
  #end{background:rgba(231,227,255,.95)!important;color:#160f2e!important;backdrop-filter:none!important}
  #end .k{color:#6d6492!important;font-family:Pixelify,monospace!important;letter-spacing:.1em}
  #end .u{color:#2b59ff!important;font-family:Pixelify,monospace!important}
  #end .d{background:#ffe94d!important;color:#160f2e!important;border:2px solid #160f2e}
  #end .g{color:#160f2e!important;border-color:#160f2e!important;background:#fff!important}
  #end .c{color:#160f2e!important;font-family:Pixelify,monospace!important}
`,
});
await page.evaluate(() => document.fonts.load('700 31px "Pixelify"'));
await sleep(1000);

const stop = await startRecording(page, FRAMES);
const t0 = Date.now();
const marks = {};
const mark = (k) => (marks[k] ??= (Date.now() - t0) / 1000);
const dignity = () => frame.evaluate(() => {
  const el = [...document.querySelectorAll("main span")].find((e) => /dignity preserved/.test(e.textContent || ""));
  return Number((el?.textContent || "").match(/(\d+)%/)?.[1] ?? 0);
});

await playAutocorrupt(frame, {
  fixes: [1, 0, 1],
  intro: async () => {
    mark("intro");
    await cap(`autocorrect has gone <span class="pk">rogue</span> 😈`);
    await sleep(1900);
    await cap(`so i made it text my mom,<br>my boss <span class="hl">&amp; my crush</span> 💀`);
    await sleep(2000);
  },
  brief: async (i) => {
    mark(`brief${i}`);
    await cap([`text 1: mom ❤️`, `text 2: my <span class="pk">BOSS</span> 💼`, `text 3: my crush 🫣<br><span class="pk">(it's fully possessed now)</span>`][i]);
    await sleep(1400);
  },
  typing: async (i) => {
    mark(`typing${i}`);
    if (i === 1) await zoom(0.95, 600);
  },
  cursed: async (i) => {
    if (marks[`cursed${i}`]) return;
    mark(`cursed${i}`);
    await cap([`it keeps "fixing" my words 😭`, `NOT IN FRONT OF MY BOSS 😭`, `it changes them BACK 😭`][i]);
  },
  fix: async (i) => {
    mark(`fix${i}`);
    if (i === 0) await cap(`tap to fix it… <span class="hl">it fights back</span>`);
  },
  send: async (i) => {
    mark(`send${i}`);
    await cap(`send it 🙏`);
  },
  replied: async (i) => {
    mark(`replied${i}`);
    const d = await dignity();
    const lines = [
      d >= 90 ? `ok mom approves 😮‍💨` : `mom has questions 💀`,
      d >= 90 ? `phew. still employed` : `i'm getting fired 💀`,
      d >= 90 ? `WE HAVE A DATE??` : `crush: <span class="pk">"lmao what"</span> 😭`,
    ];
    const noReply = await frame.evaluate(() => /left on read/.test(document.querySelector("main")?.textContent || ""));
    await cap(i === 2 && noReply ? `left on read 💀💀💀` : lines[i]);
    await sleep(1600);
  },
  results: async () => {
    mark("results");
    await zoom(1.0, 800);
    await cap(`the damage report:`);
    await sleep(3600);
  },
});

mark("end");
await zoom(0.74, 500);
await end(`
  <div class="k pop">CAN U BEAT AUTOCORRECT? 👇</div>
  <div class="u pop" style="animation-delay:.08s">autocorrupt.<br>muhammadmuneeb.tech</div>
  <div class="d pop" style="animation-delay:.16s">DAY 006 · a brainrot website every day</div>
  <div class="g pop" style="animation-delay:.24s">⭐ code: github.com/Muneeb50702/brainrot-techie</div>
  <div class="c pop" style="animation-delay:.34s">comment ur worst autocorrect fail 💬</div>`);
await sleep(3400);

const frames = await stop();
await s.browser.close();
encode(frames, FRAMES, RAW);
const M = marks;
console.log("marks:", Object.fromEntries(Object.entries(M).map(([k, v]) => [k, +v.toFixed(2)])));

const spans = [
  [M.intro + 0.2, M.intro + 3.9], // hook ×2 captions over the intro
  [M.brief0 + 0.3, M.brief0 + 1.5],
  [M.cursed0 - 1.5, (M.fix0 ?? M.cursed0) + 1.1], // a word gets cursed → tapped back
  [M.send0 - 0.2, M.send0 + 1.0], // sent → delivered
  [M.replied0 - 0.2, M.replied0 + 1.5], // mom's reply
  [M.brief1 + 0.3, M.brief1 + 1.3],
  [M.cursed1 - 1.4, M.cursed1 + 1.3],
  [M.send1 - 0.2, M.send1 + 0.9],
  [M.replied1 - 0.2, M.replied1 + 1.6], // boss
  [M.brief2 + 0.3, M.brief2 + 1.6], // "FULLY POSSESSED"
  [M.send2 - 3.2, M.send2 + 0.9], // the crush text falling apart
  [M.replied2 - 0.2, M.replied2 + 1.7], // reply / left on read
  [M.results + 0.3, M.results + 3.8], // dignity %
  [M.end, M.end + 3.4],
].filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a);
cutHighlights(RAW, spans, OUT);
const coverAt = spans.slice(0, 12).reduce((t, [a, b]) => t + (b - a), 0) - 0.6; // the last reply beat
cover(OUT, coverAt, "reels/out/day006-autocorrupt-cover.jpg");
