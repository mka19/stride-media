import { chromium } from "playwright";
import { mkdir } from "node:fs/promises";

const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const browser = await chromium.launch({ headless: true, executablePath: edge });
await mkdir("audit/sections", { recursive: true });

for (const [name, width, height] of [["desktop", 1440, 900], ["phone", 393, 852]]) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: name === "phone", hasTouch: name === "phone", deviceScaleFactor: name === "phone" ? 2 : 1 });
  const page = await context.newPage();
  await page.goto("http://127.0.0.1:4173/?motion=off", { waitUntil: "networkidle" });
  for (const selector of ["#faq", "footer", "#top"]) {
    await page.locator(selector).screenshot({ path: `audit/sections/${name}-${selector.replace(/[^a-z]/g, "")}.png` });
  }
  await context.close();
}
await browser.close();
