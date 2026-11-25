// Usage: npm run <dev|build|preview|deploy> -- <slug> [extra vite args]
import { spawnSync } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";

const [cmd, slug, ...rest] = process.argv.slice(2);
const sites = existsSync("sites")
  ? readdirSync("sites", { withFileTypes: true })
      .filter((d) => d.isDirectory() && !d.name.startsWith("_"))
      .map((d) => d.name)
  : [];

if (!slug || !sites.includes(slug)) {
  console.error(`usage: npm run ${cmd} -- <slug>\nsites: ${sites.join(", ") || "(none yet)"}`);
  process.exit(1);
}

const dir = `sites/${slug}`;
const run = (bin, args) => {
  // Windows needs a shell to find npx.cmd; pass one command string (args here never contain spaces).
  const r =
    process.platform === "win32"
      ? spawnSync([bin, ...args].join(" "), { stdio: "inherit", shell: true })
      : spawnSync(bin, args, { stdio: "inherit" });
  if (r.status !== 0) process.exit(r.status ?? 1);
};
const vite = (...args) => run("npx", ["vite", ...args, "--config", `${dir}/vite.config.ts`]);

switch (cmd) {
  case "dev":
    vite(...rest);
    break;
  case "build":
    vite("build");
    break;
  case "preview":
    vite("build");
    vite("preview", ...rest);
    break;
  case "deploy": {
    vite("build");
    run("npx", ["wrangler", "deploy", "--config", `${dir}/wrangler.jsonc`]);
    // A brand-new custom domain needs a few seconds before its DNS record exists. Asking the
    // local router too early makes it cache "doesn't exist" for 30 min (the zone's negative TTL),
    // so confirm through Cloudflare's own DNS-over-HTTPS first, and only then hit the site.
    const host = `${slug}.muhammadmuneeb.tech`;
    const dnsReady = async () => {
      const r = await fetch(`https://cloudflare-dns.com/dns-query?name=${host}&type=A`, { headers: { accept: "application/dns-json" } });
      const j = await r.json();
      return j.Status === 0 && Array.isArray(j.Answer) && j.Answer.length > 0;
    };
    let ok = false;
    for (let i = 0; i < 40 && !ok; i++) {
      ok = await dnsReady().catch(() => false);
      if (!ok) await new Promise((res) => setTimeout(res, 3000));
    }
    if (!ok) {
      console.log(`\n⏳ deployed, but DNS for ${host} isn't up yet. Don't open it for a minute.`);
      break;
    }
    const status = await fetch(`https://${host}/`).then((r) => r.status).catch(() => 0);
    console.log(`\n✅ live at https://${host} (DNS confirmed via 1.1.1.1, HTTP ${status || "pending"})`);
    break;
  }
  default:
    console.error(`unknown command: ${cmd}`);
    process.exit(1);
}
