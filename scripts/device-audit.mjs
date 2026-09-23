import { chromium, webkit } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";

const baseUrl = process.argv[2] || "http://127.0.0.1:4173/?motion=on";
const outDir = "audit/device";
await mkdir(outDir, { recursive: true });

const profiles = [
  { name: "iphone-se", width: 375, height: 667, mobile: true, touch: true },
  { name: "iphone-15", width: 393, height: 852, mobile: true, touch: true },
  { name: "android-small", width: 360, height: 800, mobile: true, touch: true },
  { name: "ipad-portrait", width: 820, height: 1180, mobile: true, touch: true },
  { name: "ipad-landscape", width: 1180, height: 820, mobile: true, touch: true },
];

const engines = [
  { name: "chromium", launcher: chromium },
  { name: "webkit", launcher: webkit },
];

const report = { url: baseUrl, generatedAt: new Date().toISOString(), runs: [], unavailable: [] };

for (const engine of engines) {
  let browser;
  try {
    browser = await engine.launcher.launch({ headless: true });
  } catch (error) {
    const edgeFallback = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    const chromeFallback = join(process.env.LOCALAPPDATA || "", "ms-playwright", "chromium-1243", "chrome-win64", "chrome.exe");
    const fallback = existsSync(edgeFallback) ? edgeFallback : chromeFallback;
    if (engine.name === "chromium" && existsSync(fallback)) {
      browser = await engine.launcher.launch({ headless: true, executablePath: fallback });
    } else {
      report.unavailable.push({ engine: engine.name, reason: String(error).split("\n")[0] });
      continue;
    }
  }

  for (const profile of profiles) {
    const context = await browser.newContext({
      viewport: { width: profile.width, height: profile.height },
      isMobile: profile.mobile,
      hasTouch: profile.touch,
      deviceScaleFactor: profile.mobile ? 2 : 1,
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));

    const started = Date.now();
    let result;
    try {
      await page.goto(baseUrl, { waitUntil: "networkidle", timeout: 60_000 });
      await page.evaluate(async () => {
        const distance = Math.max(0, document.documentElement.scrollHeight - innerHeight);
        const steps = 24;
        for (let i = 0; i <= steps; i += 1) {
          scrollTo(0, (distance * i) / steps);
          await new Promise((resolve) => setTimeout(resolve, 80));
        }
        scrollTo(0, 0);
      });
      result = await page.evaluate(async () => {
        const sectionIds = ["top", "about", "problem", "what-we-do", "how-it-works", "case-study", "why-stride", "results", "contact", "faq"];
        const sections = Object.fromEntries(sectionIds.map((id) => [id, Boolean(document.getElementById(id))]));
        const frames = await new Promise((resolve) => {
          let count = 0;
          const start = performance.now();
          const tick = (now) => {
            count += 1;
            if (now - start >= 3000) resolve({ count, elapsed: now - start });
            else requestAnimationFrame(tick);
          };
          requestAnimationFrame(tick);
        });
        const overflow = Math.max(0, document.documentElement.scrollWidth - innerWidth);
        const whyCards = document.querySelectorAll(".ws-mobile-card").length;
        const resultScroller = document.querySelector('[aria-label="Client results — swipe horizontally"]');
        const legalLinks = [...document.querySelectorAll("footer a")].filter((a) => /terms|privacy/i.test(a.textContent || "")).map((a) => a.getAttribute("href"));
        return {
          viewport: { width: innerWidth, height: innerHeight },
          documentHeight: document.documentElement.scrollHeight,
          overflow,
          sections,
          whyCards,
          resultScroller: Boolean(resultScroller),
          legalLinks,
          averageRafFps: Math.round((frames.count / frames.elapsed) * 1000),
        };
      });
      await page.screenshot({ path: `${outDir}/${engine.name}-${profile.name}.png`, fullPage: false });
    } catch (error) {
      result = { failed: true, reason: String(error) };
    }
    report.runs.push({
      engine: engine.name,
      profile: profile.name,
      durationMs: Date.now() - started,
      errors,
      ...result,
    });
    await context.close();
  }
  await browser.close();
}

await writeFile(`${outDir}/report.json`, JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
