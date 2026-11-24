import { defineConfig, type UserConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.dirname(fileURLToPath(import.meta.url));

/** Shared Vite config every site uses: React + Tailwind v4 + the @kit alias. */
export function siteConfig(siteDir: string, extra: UserConfig = {}) {
  return defineConfig({
    root: siteDir,
    plugins: [react(), tailwindcss()],
    resolve: { alias: { "@kit": path.join(repoRoot, "packages/kit/src") } },
    server: { fs: { allow: [repoRoot] } },
    build: { outDir: path.join(siteDir, "dist"), emptyOutDir: true },
    ...extra,
  });
}
