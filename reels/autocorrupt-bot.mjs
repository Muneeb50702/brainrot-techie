// A scripted human that plays autocorrupt.muhammadmuneeb.tech via the page's window.__ac mirror.
// `fixes[i]` = how many cursed words to tap-fix in mission i (the rest get sent cursed).
export async function playAutocorrupt(frame, hooks = {}) {
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  const st = () => frame.evaluate(() => window.__ac || {});
  const waitFor = (fn, arg, timeout = 40000) => frame.waitForFunction(fn, arg, { timeout, polling: 25 });
  const on = async (name, ...a) => hooks[name] && (await hooks[name](...a));
  const click = (sel) => frame.locator(sel).first().evaluate((el) => el.click());
  const press = (sel) => frame.locator(sel).first().dispatchEvent("pointerdown");
  const keyboard = frame.keyboard ?? frame.page().keyboard;
  const human = (a, b) => a + Math.random() * (b - a);
  const fixes = hooks.fixes ?? [1, 0, 1];

  await on("intro");
  await click("[data-begin]");
  for (let i = 0; i < 3; i++) {
    await waitFor((n) => window.__ac?.mission === n && window.__ac?.phase === "brief", i);
    await on("brief", i);
    await click("[data-start]");
    await waitFor(() => window.__ac?.phase === "typing");
    await frame.locator("input").first().evaluate((el) => el.focus());
    await on("typing", i);
    const words = (await st()).target.split(" ");
    let fixed = 0;
    for (let w = 0; w < words.length; w++) {
      await keyboard.type(words[w], { delay: human(55, 85) });
      if (w < words.length - 1) {
        await keyboard.type(" ");
        await sleep(human(140, 260));
        const s = await st();
        const last = s.tokens[s.tokens.length - 1];
        if (last?.cursed) {
          await on("cursed", i, last.text);
          if (fixed < fixes[i]) {
            fixed++;
            await sleep(human(650, 900)); // let the viewer read the damage, then fix it
            await on("fix", i, last.text);
            await press(`[data-cursed="${last.id}"]`);
            await sleep(400);
          }
        }
      }
    }
    await sleep(human(300, 500));
    await on("send", i);
    await press("[data-send]");
    await waitFor(() => window.__ac?.phase === "replied");
    await on("replied", i);
    await click("[data-next]");
  }
  await waitFor(() => window.__ac?.screen === "results");
  await on("results");
}
