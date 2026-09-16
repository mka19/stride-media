/**
 * Generates the Framer package from components/.
 *
 * Framer code files sit in one flat namespace and import each other as
 * "./Name", so this flattens the folder structure and rewrites the import
 * paths. It also appends property controls to each section, which is what
 * lets someone swap a video or change a scroll length from Framer's UI
 * instead of editing code.
 *
 * Generated, not hand-maintained: the components stay the single source, and
 * `npm run framer` re-cuts the package after any change.
 */
import { readdirSync, readFileSync, writeFileSync, mkdirSync, rmSync, statSync } from "node:fs";
import { join, basename } from "node:path";

const SRC = "components";
const OUT = "framer";

/** Sections get controls; shared modules do not. */
const CONTROLS = {
  Nav: `
addPropertyControls(Nav, {
  soundtrack: {
    type: ControlType.File,
    allowedFileTypes: ["mp3", "wav", "m4a"],
    title: "Soundtrack",
  },
});`,
  CalendlyEmbed: `
addPropertyControls(CalendlyEmbed, {
  url: { type: ControlType.String, title: "Calendly link", defaultValue: "" },
  minHeight: { type: ControlType.Number, title: "Height (desktop)", defaultValue: 760, min: 500, max: 1400 },
  minHeightMobile: { type: ControlType.Number, title: "Height (mobile)", defaultValue: 1040, min: 600, max: 1600 },
});`,
  Hero: `
addPropertyControls(Hero, {
  tiles: {
    type: ControlType.Array,
    title: "Mosaic tiles",
    control: {
      type: ControlType.Object,
      controls: {
        src: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"], title: "Video" },
        caption: { type: ControlType.String, title: "Caption" },
      },
    },
  },
  clientFaces: {
    type: ControlType.Array,
    title: "Client faces",
    control: { type: ControlType.File, allowedFileTypes: ["jpg", "jpeg", "png", "webp"] },
    maxCount: 6,
  },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "320vh" },
});`,
  Problem: `
addPropertyControls(Problem, {
  backgroundSrc: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"], title: "Background" },
  cardMedia: {
    type: ControlType.Array,
    title: "Card portraits",
    control: { type: ControlType.File, allowedFileTypes: ["mp4", "webm", "jpg", "png"] },
    maxCount: 3,
  },
  objectMedia: {
    type: ControlType.Array,
    title: "Sentence tiles",
    control: { type: ControlType.File, allowedFileTypes: ["mp4", "webm", "jpg", "jpeg", "png", "webp"] },
    maxCount: 4,
  },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "460vh" },
});`,
  Solution: `
addPropertyControls(Solution, {
  videoSrc: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"], title: "Reel" },
  poster: { type: ControlType.File, allowedFileTypes: ["jpg", "png"], title: "Poster" },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "420vh" },
});`,
  HowItWorks: `
addPropertyControls(HowItWorks, {
  backgroundSrc: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"], title: "Background" },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "380vh" },
});`,
  CaseStudy: `
addPropertyControls(CaseStudy, {
  gallery: {
    type: ControlType.Array,
    title: "Gallery",
    control: { type: ControlType.File, allowedFileTypes: ["jpg", "jpeg", "png", "webp", "mp4", "webm"] },
    maxCount: 6,
  },
  curtainImage: {
    type: ControlType.File,
    allowedFileTypes: ["jpg", "jpeg", "png", "webp"],
    title: "Curtain still",
  },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "760vh" },
});`,
  WhyStride: `
addPropertyControls(WhyStride, {
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "560vh" },
});`,
  Results: `
addPropertyControls(Results, {
  clips: {
    type: ControlType.Array,
    title: "Clips",
    control: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"] },
    maxCount: 6,
  },
});`,
  FinalCTA: `
addPropertyControls(FinalCTA, {
  calendly: { type: ControlType.String, title: "Calendly URL" },
  ready: { type: ControlType.Boolean, title: "Calendly live", defaultValue: false },
});`,
  FAQ: `
addPropertyControls(FAQ, {
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "300vh" },
});`,
  Footer: `
addPropertyControls(Footer, {
  backgroundSrc: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"], title: "Background" },
});`,
};

/** Framer renders a component at whatever size the canvas gives it. */
const SIZING = {
  Nav: "auto-height",
  Hero: "auto-height",
  Problem: "auto-height",
  Solution: "auto-height",
  HowItWorks: "auto-height",
  CaseStudy: "auto-height",
  WhyStride: "auto-height",
  Results: "auto-height",
  Testimonials: "auto-height",
  FinalCTA: "auto-height",
  FAQ: "auto-height",
  Footer: "auto-height",
};

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    return statSync(path).isDirectory() ? walk(path) : [path];
  });
}

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const files = walk(SRC).filter((f) => /\.tsx?$/.test(f));
const written = [];

for (const file of files) {
  const name = basename(file).replace(/\.tsx?$/, "");
  let code = readFileSync(file, "utf8");

  // Framer's code files are flat: every local import becomes a sibling.
  code = code.replace(/from "\.\.?\/(?:[\w-]+\/)*([\w-]+)"/g, 'from "./$1"');

  let controls = CONTROLS[name];
  /*
   * The scroll-length control's default is read from the component, not
   * written here.
   *
   * Two copies of a number drift, and these had: Problem's control said
   * 460vh against a real default of 620vh. That is worse than a stale
   * comment, because a Framer control always passes its default down — so
   * dropping the component on a canvas silently overrode the tuned value
   * with the stale one, and the section ran its whole sequence in three
   * quarters of the scroll it was choreographed for. Parsing it means the
   * panel always opens on whatever the component actually does.
   */
  if (controls) {
    const tuned = code.match(/scrollLength = "(\d+vh)"/)?.[1];
    if (tuned) {
      controls = controls.replace(
        /(scrollLength:[^}]*defaultValue: ")\d+vh(")/,
        `$1${tuned}$2`,
      );
    }
  }
  if (controls) {
    code =
      `import { addPropertyControls, ControlType } from "framer"\n` +
      code +
      `\n/**\n * @framerSupportedLayoutWidth any\n * @framerSupportedLayoutHeight ${SIZING[name] ?? "auto-height"}\n */\n` +
      controls +
      "\n";
  }

  const out = join(OUT, basename(file));
  writeFileSync(out, code);
  written.push(basename(file));
}

/*
 * The README is generated too, so the paste order can never drift from the
 * imports. It is derived from the real dependency graph rather than written
 * out by hand — a file pasted before something it imports is the single most
 * common way this package fails on the way into Framer.
 */
const dep = {};
for (const f of written) {
  const name = f.replace(/\.(tsx|ts)$/, "");
  const code = readFileSync(join(OUT, f), "utf8");
  dep[name] = [...code.matchAll(/from "\.\/([^"]+)"/g)].map((m) => m[1]);
}
/*
 * Ordered by how deep a file sits in the graph, not by the order a depth-first
 * walk happens to reach it. Both are valid — nothing is ever listed before
 * something it imports — but this one groups the shared modules at the top
 * and the sections at the bottom, which is the order a person would expect to
 * be working in.
 */
const depth = (n, stack = []) => {
  if (stack.includes(n)) return 0;
  const deps = dep[n] ?? [];
  return deps.length ? 1 + Math.max(...deps.map((d) => depth(d, [...stack, n]))) : 0;
};
const order = Object.keys(dep).sort(
  (a, b) => depth(a) - depth(b) || a.localeCompare(b),
);

const readme = `# Stride Media — Framer code components

${written.length} files. Generated from \`components/\` by \`npm run framer\` — edit the
source, not these.

## 1. Install the packages

Framer → project menu → **Packages** → add:

    three   gsap   lenis

React and \`framer\` are already there.

## 2. Paste the files in this order

Framer → **Assets → Code → New File**, name it exactly as listed (no
extension), paste the whole file. Order matters: a file pasted before
something it imports will show an error until the other one exists.

${order.map((n, i) => `${String(i + 1).padStart(2)}. ${n}${dep[n]?.length ? `  —  needs ${dep[n].join(", ")}` : ""}`).join("\n")}

Errors while pasting are expected and clear themselves as the list fills in.

## 3. Put the sections on the page, in order

Nav, Hero, Problem, Solution, HowItWorks, Marquee, CaseStudy, WhyStride,
Marquee, Results, Testimonials, FinalCTA, FAQ, Footer.

Each is full-bleed: set width to **Fill** and height to **Auto**. Do not put
them inside a scrolling frame — they drive the page scroll themselves.

## 4. Turn on smooth scroll — once

Framer → **Site Settings → Custom Code → End of \`<body>\`**:

    <script type="module">
      import { initSmoothScroll } from "./smoothScroll"
      initSmoothScroll()
    </script>

Once for the whole site. Calling it in more than one place puts two copies of
Lenis on the same scroller and they fight.

## 5. The booking link

\`CalendlyEmbed\` has the link as \`CALENDLY_URL\` at the top of the file, and
also as a **Calendly link** property on the component. Either works; the
property wins. Until it is a real calendly.com URL the component says so
rather than loading a 404 inside the card.

## 6. Assets

Every section exposes its media as Framer file properties, so nothing needs a
code edit. Upload to Framer assets and pick them in the properties panel.

| Section | Property |
| --- | --- |
| Hero | Mosaic tiles, Client faces |
| Problem | Background, Card portraits, Sentence tiles |
| Solution | Reel, Poster |
| HowItWorks | Background |
| CaseStudy | Gallery (6), Curtain still |
| Results | Clips |
| Footer | Background |
| Nav | Soundtrack |

Video: MP4 / H.264, muted, 3–5 seconds, under ~2MB. They loop silently.
Stills work in every slot too. Anything left empty falls back to a generated
gradient that looks deliberate.

## Notes

- The sound button never plays on its own. It is silent until clicked.
- \`scrollLength\` on each section sets how much scroll its sequence takes.
  Longer is slower. They are strings like "420vh".
- The build tag is a \`data-build\` attribute on the footer, not visible text.
`;
writeFileSync(join(OUT, "README.md"), readme);

console.log(`wrote ${written.length} files + README.md to ${OUT}/`);
