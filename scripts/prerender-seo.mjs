import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const siteUrl = "https://stridemedia.co";
const pages = [
  {
    path: "/videos",
    title: "Client Video Results | Stride Media Dubai",
    description: "Watch verified short-form video results produced by Stride Media for property advisors and entrepreneurs in Dubai.",
    image: "/og-image.png",
  },
  {
    path: "/case-studies/anna-herbst",
    title: "Anna Herbst Case Study | Stride Media Dubai",
    description: "Anna grew from 800 to 15K organic followers with positioning, production and a lead-generation content system built by Stride Media.",
    image: "/case-studies/portraits/anna-herbst.webp",
  },
  {
    path: "/case-studies/monish-bakhru",
    title: "Monish Bakhru Case Study | Stride Media Dubai",
    description: "Monish Bakhru grew a quiet 30K account into a 55.6K verified growth engine through consistent, investor-focused content.",
    image: "/case-studies/portraits/monish-bakhru.webp",
  },
  {
    path: "/case-studies/imtaz-ahmed",
    title: "Imtaz Ahmed Case Study | Stride Media Dubai",
    description: "See how investor-focused content generated AED 20M+ in property sales for Imtaz Ahmed in three months.",
    image: "/case-studies/portraits/imtaz-ahmed.webp",
  },
  {
    path: "/case-studies/yasmin-shafi",
    title: "Yasmin Shafi Case Study | Stride Media Dubai",
    description: "Yasmin Shafi grew from roughly 100 followers to 101K with a warm, useful and conversion-led content system.",
    image: "/case-studies/portraits/yasmin-shafi.webp",
  },
  {
    path: "/case-studies/maaz-kadri",
    title: "Maaz Kadri Case Study | Stride Media Dubai",
    description: "See how research, consistency and experimentation helped Maaz Kadri reach 12 million views and scale across Instagram and Facebook.",
    image: "/case-studies/portraits/maaz-kadri.webp",
  },
  {
    path: "/case-studies/anonymous-learning",
    title: "Anonymous Client Retrospective | Stride Media Dubai",
    description: "A transparent Stride Media project retrospective about creative alignment, testing and the lessons that improved every later partnership.",
    image: "/case-studies/portraits/anonymous-client.png",
  },
];

const escape = (value) => value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
const source = await readFile(resolve("dist/index.html"), "utf8");

for (const page of pages) {
  const canonical = `${siteUrl}${page.path}`;
  const image = `${siteUrl}${page.image}`;
  let html = source
    .replace(/<title>.*?<\/title>/, `<title>${escape(page.title)}</title>`)
    .replace(/<meta name="description" content="[^"]*"\s*\/>/, `<meta name="description" content="${escape(page.description)}" />`)
    .replace(/<link rel="canonical" href="[^"]*"\s*\/>/, `<link rel="canonical" href="${canonical}" />`)
    .replace(/<meta property="og:title" content="[^"]*"\s*\/>/, `<meta property="og:title" content="${escape(page.title)}" />`)
    .replace(/<meta property="og:description" content="[^"]*"\s*\/>/, `<meta property="og:description" content="${escape(page.description)}" />`)
    .replace(/<meta property="og:url" content="[^"]*"\s*\/>/, `<meta property="og:url" content="${canonical}" />`)
    .replace(/<meta property="og:image" content="[^"]*"\s*\/>/, `<meta property="og:image" content="${image}" />`)
    .replace(/<meta property="og:image:alt" content="[^"]*"\s*\/>/, `<meta property="og:image:alt" content="${escape(page.title)}" />`)
    .replace(/<meta name="twitter:title" content="[^"]*"\s*\/>/, `<meta name="twitter:title" content="${escape(page.title)}" />`)
    .replace(/<meta name="twitter:description" content="[^"]*"\s*\/>/, `<meta name="twitter:description" content="${escape(page.description)}" />`)
    .replace(/<meta name="twitter:image" content="[^"]*"\s*\/>/, `<meta name="twitter:image" content="${image}" />`);

  if (page.path.startsWith("/case-studies/")) {
    html = html.replace('<meta property="og:type" content="website" />', '<meta property="og:type" content="article" />');
  }

  const output = resolve(`dist${page.path}/index.html`);
  await mkdir(dirname(output), { recursive: true });
  await writeFile(output, html, "utf8");
}

console.log(`Generated ${pages.length} search-ready route documents.`);
