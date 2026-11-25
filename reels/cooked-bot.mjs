// A scripted "human" that plays cooked.muhammadmuneeb.tech end to end, via the page's
// window.__cooked debug mirror. Used by the playtest and by the reel (reels/cooked.mjs).
// `frame` is any Playwright Page/Frame showing the site; `hooks` let a reel add captions per step.
export async function playCooked(frame, hooks = {}) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const state = () => frame.evaluate(() => window.__cooked || {});
  const waitFor = (fn, arg, timeout = 30000) => frame.waitForFunction(fn, arg, { timeout, polling: 20 });
  const press = (sel) => frame.locator(sel).first().dispatchEvent("pointerdown");
  const human = (a, b) => a + Math.random() * (b - a);
  const on = async (name, ...a) => hooks[name] && (await hooks[name](...a));
  // .click() can't verify "stable" inside a scaled cross-origin phone frame; click the element directly
  const click = (loc) => loc.first().evaluate((el) => el.click());

  await on("intake");
  await click(frame.getByRole("button", { name: /start brain scan/i }));

  // --- 01 reflex: react to green after a human-ish delay
  await waitFor(() => window.__cooked?.phase === "intro" && window.__cooked?.at === 0);
  await on("intro", 0);
  await click(frame.locator("[data-go]"));
  await on("play", 0);
  for (let trial = 0; trial < 4; trial++) {
    await waitFor(() => window.__cooked?.state === "go");
    await sleep(human(250, 330));
    await on("reflexTap", trial);
    await press("[data-reflex]");
    await waitFor(() => window.__cooked?.state !== "go");
  }
  await waitFor(() => window.__cooked?.phase === "verdict");
  await on("verdict", 0);

  // --- 02 memory: replay each sequence; deliberately slip at level `slipAt`
  const slipAt = hooks.slipAt ?? 6;
  await waitFor(() => window.__cooked?.phase === "intro" && window.__cooked?.at === 1);
  await on("intro", 1);
  await click(frame.locator("[data-go]"));
  await on("play", 1);
  for (;;) {
    await waitFor(() => window.__cooked?.mphase === "input" || window.__cooked?.phase === "verdict");
    const s = await state();
    if (s.phase === "verdict") break;
    await on("memoryInput", s.level);
    for (let k = 0; k < s.seq.length; k++) {
      let tile = s.seq[k];
      if (s.level >= slipAt && k === s.seq.length - 2) {
        tile = (tile + 4) % 9; // the human brain gives up
        await on("memorySlip", s.level);
      }
      await sleep(human(230, 380));
      await press(`[data-tile="${tile}"]`);
      if (tile !== s.seq[k]) break;
    }
    await waitFor(() => ["right", "wrong"].includes(window.__cooked?.mphase) || window.__cooked?.phase === "verdict");
    if ((await state()).mphase === "wrong") break;
    await waitFor(() => window.__cooked?.mphase === "show" || window.__cooked?.phase === "verdict");
  }
  await waitFor(() => window.__cooked?.phase === "verdict");
  await on("verdict", 1);

  // --- 03 stroop: mostly right, but "read the word" twice
  await waitFor(() => window.__cooked?.phase === "intro" && window.__cooked?.at === 2);
  await on("intro", 2);
  await click(frame.locator("[data-go]"));
  await on("play", 2);
  const COLOURS = ["RED", "BLUE", "GREEN", "YELLOW"];
  let slips = 0;
  for (let i = 0; i < 12; i++) {
    await waitFor((n) => window.__cooked?.round === "stroop" && window.__cooked?.i === n, i);
    const s = await state();
    await sleep(human(520, 900));
    const wordIdx = COLOURS.indexOf(s.word);
    const slip = wordIdx >= 0 && slips < 2 && (i === 4 || i === 9);
    if (slip) await on("stroopSlip", i);
    const pick = slip ? (slips++, wordIdx) : s.ink;
    await press(`[data-colour="${pick}"]`);
    await on("stroopTap", i);
  }
  await waitFor(() => window.__cooked?.phase === "verdict");
  await on("verdict", 2);

  // --- 04 focus: catch most glitches, fall for one notification
  await waitFor(() => window.__cooked?.phase === "intro" && window.__cooked?.at === 3);
  await on("intro", 3);
  await click(frame.locator("[data-go]"));
  await on("play", 3);
  let fellForNotif = false;
  const started = Date.now();
  for (;;) {
    const s = await state();
    if (s.phase === "verdict") break;
    if (s.active) {
      await sleep(human(330, 520));
      await on("glitchTap");
      await press("[data-focus]");
      await waitFor(() => !window.__cooked?.active || window.__cooked?.phase === "verdict", undefined, 3000).catch(() => {});
    } else if (!fellForNotif && Date.now() - started > 6000 && (await frame.evaluate(() => !!document.querySelector("[data-notif]")))) {
      fellForNotif = true;
      await on("notifTap");
      await press("[data-notif]");
    }
    await sleep(40);
  }
  await on("verdict", 3);
  await waitFor(() => window.__cooked?.phase === "analyzing");
  await on("analyzing");
  await waitFor(() => window.__cooked?.phase === "report");
  await on("report");
}
