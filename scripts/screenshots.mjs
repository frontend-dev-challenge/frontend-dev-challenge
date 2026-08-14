import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { chromium } from "playwright";
import { createServer } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT_DIR = path.join(ROOT, "screenshots");

const SCREENS = [
  ["wallet-connected", "#wallet-connected"],
  ["balance-displayed", "#balance-displayed"],
  ["successful-transaction", "#successful-transaction"],
  ["transaction-result", "#transaction-result"],
];

fs.mkdirSync(OUT_DIR, { recursive: true });

// Serve the demo page with Vite's dev server (handles JSX + CSS on the fly).
// Override the production `base` path so the demo is served from the root.
const server = await createServer({ root: ROOT, base: "/", logLevel: "error" });
await server.listen();
const baseUrl = `http://localhost:${server.config.server.port}`;

const browser = await chromium.launch();

try {
  const page = await browser.newPage({
    viewport: { width: 640, height: 900 },
    deviceScaleFactor: 2,
  });

  await page.goto(`${baseUrl}/demo/demo.html`, { waitUntil: "networkidle" });

  for (const [name, selector] of SCREENS) {
    const el = page.locator(selector);
    await el.waitFor({ state: "visible" });
    await el.screenshot({ path: path.join(OUT_DIR, `${name}.png`) });
    console.log(`✓ ${name}.png`);
  }
} finally {
  await browser.close();
  await server.close();
}
