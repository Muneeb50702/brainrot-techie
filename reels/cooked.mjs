// Day 005 reel: cooked. The bot takes the REAL 90-second test live; we log a timestamp at
// every highlight, then jump-cut the best beats into ~30 s (no speed-up, real reaction times).
// Run: node reels/cooked.mjs
import { openStage, startRecording, encode, cover, sleep, cutHighlights } from "./lib.mjs";
import { playCooked } from "./cooked-bot.mjs";

const SITE = "https://cooked.muhammadmuneeb.tech/";
const FRAMES = "reels/frames/cooked";
const RAW = "reels/frames/cooked-full.mp4";
const OUT = "reels/out/day005-cooked.mp4";

const s = await openStage(SITE);
const { frame, cap, end, zoom, page } = s;

// Light "lab report" stage to match the site: graph paper, ink captions, highlighter + stamp red.
await page.addStyleTag({
  content: `
  @font-face{font-family:"Archivo";src:url("/fonts/archivo.woff2") format("woff2");font-weight:100 900;font-stretch:62% 125%}
  html,body{background:#f3ede1!important}
  body{background-image:linear-gradient(rgba(20,20,20,.07) 1px,transparent 1px),linear-gradient(90deg,rgba(20,20,20,.07) 1px,transparent 1px)!important;background-size:27px 27px!important}
  .bg,.grid{display:none!important}
  #cap{color:#141414;font-family:Archivo,sans-serif;font-stretch:125%;font-weight:900;font-size:30px;letter-spacing:-.02em;text-shadow:none}
  .hl{background:#ffe14d!important;color:#141414!important;box-shadow:3px 3px 0 #141414!important}
  .pk{color:#d62828!important}
  #phone{border-color:#141414!important;box-shadow:12px 12px 0 #141414!important}
  #end{background:rgba(243,237,225,.94)!important;color:#141414!important;backdrop-filter:none!important}
  #end .k{color:#6f6a60!important}
  #end .u{color:#d62828!important;font-family:Archivo,sans-serif!important;font-stretch:110%}
  #end .d{background:#ffe14d!important;color:#141414!important;border:2px solid #141414}
  #end .g{color:#141414!important;border-color:#141414!important;background:#fbf8f1!important}
  #end .c{color:#141414!important}
`,
});
await page.evaluate(() => document.fonts.load('900 30px "Archivo"'));
await sleep(1000);

const stop = await startRecording(page, FRAMES);
const t0 = Date.now();
const marks = {};
const mark = (k) => (marks[k] ??= (Date.now() - t0) / 1000);
const text = (sel) => frame.locator(sel).first().innerText().catch(() => "");

await playCooked(frame, {
  slipAt: 6,
  intake: async () => {
    mark("intake");
    await cap(`how cooked is your <span class="pk">brain</span>? 🧠`);
    await sleep(2600);
  },
  intro: async (i) => {
    mark(`intro${i}`);
    await sleep(700);
  },
  play: async (i) => {
    mark(`play${i}`);
    if (i === 0) {
      await zoom(0.9, 600);
      await cap(`test 1: tap the second<br>it turns <span class="hl">green</span> ⚡`);
    } else if (i === 1) await cap(`test 2: memory 🧠`);
    else if (i === 2) await cap(`test 3: tap the <span class="hl">COLOUR</span>,<br>not the word 🎨`);
    else await cap(`test 4: tap only when it glitches.<br><span class="pk">ignore the notifications</span> 🫠`);
  },
  reflexTap: async (trial) => {
    if (trial === 1) mark("reflexTap");
  },
  verdict: async (i) => {
    mark(`verdict${i}`);
    if (i === 0) {
      // caption from the site's own verdict, so it always matches the measured ms
      const ms = (await text("main p.wide")).trim();
      const line = (await text("main .hl")).trim();
      await cap(`${ms}?? <span class="pk">${line}</span> 💀`);
    }
  },
  memoryInput: async (level) => {
    if (level === 3) mark("mem3");
    if (level === 6) {
      mark("mem6");
      await cap(`level 6… <span class="pk">brain.exe stopped responding</span> 💀`);
    }
  },
  memorySlip: async () => mark("memSlip"),
  stroopSlip: async () => {
    if (!marks.stroopSlip) {
      mark("stroopSlip");
      await cap(`…my brain read the WORD 😭`);
    }
  },
  glitchTap: async () => mark("glitch"),
  notifTap: async () => {
    mark("notif");
    await cap(`i tapped the notification. <span class="pk">i'm cooked</span> 💀`);
  },
  analyzing: async () => {
    mark("analyzing");
    await cap(`analyzing brain…`);
  },
  report: async () => {
    mark("report");
    await zoom(1.0, 900);
    await cap(`the diagnosis:`);
    await sleep(5200);
  },
});

// end card
mark("end");
await zoom(0.74, 500);
await end(`
  <div class="k pop">HOW COOKED IS YOURS? 👇</div>
  <div class="u pop" style="animation-delay:.08s">cooked.<br>muhammadmuneeb.tech</div>
  <div class="d pop" style="animation-delay:.16s">DAY 005 · a brainrot website every day</div>
  <div class="g pop" style="animation-delay:.24s">⭐ code: github.com/Muneeb50702/brainrot-techie</div>
  <div class="c pop" style="animation-delay:.34s">comment ur % 💬</div>`);
await sleep(3400);

const frames = await stop();
await s.browser.close();
encode(frames, FRAMES, RAW);
console.log("marks:", Object.fromEntries(Object.entries(marks).map(([k, v]) => [k, +v.toFixed(2)])));

// highlights edit (seconds in the raw recording)
const M = marks;
const spans = [
  [M.intake + 0.2, M.intake + 2.8], // hook on the intake form
  [M.reflexTap - 1.5, M.reflexTap + 1.0], // wait… TAP! → ms
  [M.verdict0 + 0.45, M.verdict0 + 2.0], // "325 ms = a 2012 android phone"
  [M.mem3 - 2.3, M.mem3 + 1.9], // tiles light up, tapped back
  [M.mem6 - 0.4, M.memSlip + 1.5], // level 6 → wrong tile
  [M.stroopSlip - 1.6, M.stroopSlip + 1.0], // colour words, the slip
  [M.notif - 1.4, M.notif + 1.1], // tapping the fake notification
  [M.analyzing + 0.1, M.analyzing + 1.5], // brain scan
  [M.report + 0.1, M.report + 5.3], // count-up + stamp slam
  [M.end, M.end + 3.4], // end card
].filter(([a, b]) => Number.isFinite(a) && Number.isFinite(b) && b > a);
cutHighlights(RAW, spans, OUT);
cover(OUT, spans.slice(0, -2).reduce((t, [a, b]) => t + (b - a), 0) + 3.4, "reels/out/day005-cooked-cover.jpg");
