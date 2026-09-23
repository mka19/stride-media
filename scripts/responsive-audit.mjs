import { chromium } from "playwright";
import { mkdir, writeFile } from "node:fs/promises";

const url = process.argv[2] || "http://127.0.0.1:4173/?motion=off";
const edge = "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
const profiles = [
  ["phone-360", 360, 800, true], ["phone-393", 393, 852, true],
  ["tablet-768", 768, 1024, true], ["tablet-820", 820, 1180, true],
  ["tablet-landscape", 1180, 820, true], ["desktop-1366", 1366, 768, false],
  ["desktop-1440", 1440, 900, false], ["desktop-1920", 1920, 1080, false],
];
const browser = await chromium.launch({ headless: true, executablePath: edge });
const report = { url, generatedAt: new Date().toISOString(), profiles: [] };
await mkdir("audit/responsive", { recursive: true });

for (const [name, width, height, mobile] of profiles) {
  const context = await browser.newContext({ viewport: { width, height }, isMobile: mobile, hasTouch: mobile, deviceScaleFactor: mobile ? 2 : 1 });
  const page = await context.newPage();
  const errors = [];
  page.on("console", m => { if (m.type() === "error") errors.push(m.text()); });
  page.on("pageerror", e => errors.push(String(e)));
  await page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  const data = await page.evaluate(() => {
    const px = value => Math.round(parseFloat(value || "0") * 10) / 10;
    const style = el => getComputedStyle(el);
    const rect = el => el.getBoundingClientRect();
    const visible = el => { const r = rect(el); const s = style(el); return r.width > 0 && r.height > 0 && s.display !== "none" && s.visibility !== "hidden"; };
    const sectionData = [...document.querySelectorAll("section, footer")].map((el, index) => {
      const s = style(el); const r = rect(el);
      const headings = [...el.querySelectorAll("h1,h2,h3")].filter(visible).slice(0, 4).map(h => ({
        tag: h.tagName, text: (h.textContent || "").trim().slice(0, 55), size: px(style(h).fontSize), line: px(style(h).lineHeight), width: Math.round(rect(h).width),
      }));
      const paragraphs = [...el.querySelectorAll("p")].filter(visible).slice(0, 3).map(p => ({
        text: (p.textContent || "").trim().slice(0, 55), size: px(style(p).fontSize), line: px(style(p).lineHeight), width: Math.round(rect(p).width),
      }));
      return { id: el.id || `section-${index}`, height: Math.round(r.height), padding: [px(s.paddingTop), px(s.paddingRight), px(s.paddingBottom), px(s.paddingLeft)], headings, paragraphs };
    });
    const tinyText = [...document.querySelectorAll("body *")].filter(el => visible(el) && el.children.length === 0 && (el.textContent || "").trim() && px(style(el).fontSize) < 11).slice(0, 30).map(el => ({ text: el.textContent.trim().slice(0, 45), size: px(style(el).fontSize) }));
    const smallTargets = [...document.querySelectorAll("a,button,input,[role=button],[role=slider]")].filter(visible).map(el => ({ el, r: rect(el) })).filter(({r}) => r.width < 44 || r.height < 44).slice(0, 40).map(({el,r}) => ({ text: (el.getAttribute("aria-label") || el.textContent || "").trim().slice(0, 45), w: Math.round(r.width), h: Math.round(r.height) }));
    const clippedText = [...document.querySelectorAll("h1,h2,h3,p,a,button,span")].filter(visible).filter(el => el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2).slice(0, 40).map(el => ({ text: (el.textContent || "").trim().slice(0, 45), client: [el.clientWidth, el.clientHeight], scroll: [el.scrollWidth, el.scrollHeight] }));
    return {
      viewport: [innerWidth, innerHeight], document: [document.documentElement.scrollWidth, document.documentElement.scrollHeight], overflowX: Math.max(0, document.documentElement.scrollWidth - innerWidth),
      sections: sectionData, tinyText, smallTargets, clippedText,
    };
  });
  report.profiles.push({ name, errors, ...data });
  await page.screenshot({ path: `audit/responsive/${name}.png`, fullPage: false });
  await context.close();
}
await browser.close();
await writeFile("audit/responsive/report.json", JSON.stringify(report, null, 2));
console.log(JSON.stringify(report, null, 2));
