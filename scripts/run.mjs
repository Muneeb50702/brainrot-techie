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
  case "deploy":
    vite("build");
    run("npx", ["wrangler", "deploy", "--config", `${dir}/wrangler.jsonc`]);
    console.log(`\n✅ live at https://${slug}.muhammadmuneeb.tech`);
    break;
  default:
    console.error(`unknown command: ${cmd}`);
    process.exit(1);
}
