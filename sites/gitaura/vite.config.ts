import path from "node:path";
import { fileURLToPath } from "node:url";
import { siteConfig } from "../../vite.shared";

export default siteConfig(path.dirname(fileURLToPath(import.meta.url)));
