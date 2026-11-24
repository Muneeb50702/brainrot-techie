# 🧠 brainrot-techie

**a brainrot website every day.** gen-z humor on the outside, real logic on the inside.
every site ships to `<slug>.muhammadmuneeb.tech`, gets a reel, and the code lands here. built in public, open source, no cap. **every site runs 100% in your browser: no servers, no API bills, $0.**

| day | site | what it does |
|---|---|---|
| 001 | [gitaura.muhammadmuneeb.tech](https://gitaura.muhammadmuneeb.tech) · [code](sites/gitaura) | GitHub username → aura score from real public stats (3am commits, lazy `fix` messages, stars, tutorial hell). Brutal receipt + story card. |
| 002 | [life-exe.muhammadmuneeb.tech](https://life-exe.muhammadmuneeb.tech) · [code](sites/life-exe) | Your life as a running program: live uptime, heartbeats, km through space, years on your phone, and the stat that makes you feel old ("born closer to Pac-Man than to today"). |

Coming next: [IDEAS.md](IDEAS.md). Got an idea? [open an issue](../../issues).

## Stack
- **Vite + React 19 + Tailwind v4 + Motion**, one small app per site
- **Shared kit** ([packages/kit](packages/kit/src)): brand tokens, self-hosted fonts, a Paper Shaders grain background,
  a 21st.dev border-beam panel, scramble text, count-up, marquee, and share-card rendering (html-to-image)
- **Cloudflare Workers static assets**: each site is its own assets-only Worker with a `custom_domain`
  route, so a deploy creates the DNS record and SSL by itself. Static requests are free and unlimited
- **Reel factory** ([reels](reels)): a 9:16 stage with the live site in a phone frame, driven by Playwright,
  frames captured over CDP and encoded with ffmpeg. The reels are generated from code too

## Run it
```bash
npm install
npm run dev -- gitaura        # local dev on :5173
npm run build -- gitaura      # production build → sites/gitaura/dist
```
Deploying to your own domain: change `pattern` in `sites/<slug>/wrangler.jsonc` and `domain` in
`packages/kit/src/brand.ts`, then `npm run deploy -- <slug>` (needs `wrangler login`).


## Layout
```
packages/kit/     shared brand + components
sites/<slug>/     one site per day (+ its wrangler.jsonc)
reels/            reel stage, recorder lib, one script per day, captions
```

## License
[MIT](LICENSE). Fork it, remix it, make your own brainrot. A link back is appreciated 🫡
