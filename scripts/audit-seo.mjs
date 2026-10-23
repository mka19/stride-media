import { existsSync, readFileSync } from "node:fs";

const xml = readFileSync("dist/sitemap.xml", "utf8");
const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1]);
let failures = 0;

for (const url of urls) {
  const pathname = new URL(url).pathname;
  const file = pathname === "/"
    ? "dist/index.html"
    : pathname.endsWith(".html")
      ? `dist${pathname}`
      : `dist${pathname}/index.html`;
  const exists = existsSync(file);
  const html = exists ? readFileSync(file, "utf8") : "";
  const title = html.match(/<title>(.*?)<\/title>/)?.[1];
  const canonical = html.match(/<link rel="canonical" href="([^"]+)/)?.[1];
  const robots = html.match(/<meta name="robots" content="([^"]+)/)?.[1];
  const jsonText = html.match(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1];
  let validJsonLd = !jsonText;
  try { if (jsonText) JSON.parse(jsonText); validJsonLd = true; } catch { /* reported below */ }
  const passed = exists && canonical === url && robots?.startsWith("index,follow") && validJsonLd && title;
  if (!passed) failures += 1;
  console.log(`${passed ? "PASS" : "FAIL"} ${pathname} | ${title ?? "NO TITLE"} | ${canonical ?? "NO CANONICAL"}`);
}

console.log(`Sitemap URLs: ${urls.length}; failures: ${failures}`);
if (failures) process.exitCode = 1;
