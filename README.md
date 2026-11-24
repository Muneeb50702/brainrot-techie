# brainrot-techie

A brainrot website every day. Each site lives at `https://<slug>.muhammadmuneeb.tech`.
The backlog is in [IDEAS.md](IDEAS.md).

## Layout
```
packages/kit/     shared brand: tokens, fonts, GrainBg shader, BorderBeamPanel (21st.dev),
                  Scramble, CountUp, Marquee, DayBadge, share-card helpers
sites/<slug>/     one Vite + React + Tailwind v4 app per day, plus its wrangler.jsonc
reels/            9:16 reel factory: stage.html + lib.mjs + one script per day
```

## Daily loop
```powershell
npm run dev -- gitaura        # local dev on :5173
npm run deploy -- gitaura     # build + ship to gitaura.muhammadmuneeb.tech
node reels/gitaura.mjs        # record reels/out/day001-gitaura.mp4 (+ cover)
```

## Hosting
Every site is its own **assets-only Cloudflare Worker** with a `custom_domain` route, so
`wrangler deploy` creates the DNS record and SSL itself. On the free plan, static requests
are unlimited and you get 100 Workers (100 days). After that it's $5/mo for 500, or merge old sites.

## New site checklist
1. Copy `sites/gitaura` → `sites/<slug>`; update `DAY`, `<title>`/OG tags, the `wrangler.jsonc` name + pattern.
2. Mobile-first (traffic = Instagram in-app browser). One shareable output with the URL on it.
3. `npm run deploy -- <slug>` → copy `reels/gitaura.mjs` → record → post.
