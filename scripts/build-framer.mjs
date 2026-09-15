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
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "380vh" },
});`,
  CaseStudy: `
addPropertyControls(CaseStudy, {
  gallery: {
    type: ControlType.Array,
    title: "Gallery",
    control: { type: ControlType.File, allowedFileTypes: ["jpg", "png", "mp4"] },
    maxCount: 8,
  },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "560vh" },
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

  const controls = CONTROLS[name];
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

console.log(`wrote ${written.length} files to ${OUT}/`);
