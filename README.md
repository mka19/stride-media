# Stride Media — website build

React / Three.js / GSAP components for the Stride Media site, written to be
pasted into Framer as Code Components.

## Layout

```
components/
  Nav/        Nav.tsx                     sticky nav, scroll-progress underlines
  Hero/       Hero.tsx                    three-phase hero
              HeroObject.tsx              Three.js brand mark + dissolve
              VideoMosaic.tsx             Google-Flow mosaic + bento hover push
  shared/     theme.ts                    colour, type, spacing, glow tokens
              copy.ts                     all site copy, one file
              primitives.tsx              StrideMark, GlowButton, Grain, MediaTile
              gsap.ts                     GSAP + ScrollTrigger registration
              styles.ts                   the one keyframe, injectable into Framer
              useInView.ts                lightweight in-view hook
specs/        the build spec
assets/       one folder per section — drop reference images and footage here
src/          preview harness (not part of the Framer deliverable)
```

## Running the preview

```sh
npm install
npm run dev
```

The harness at `src/App.tsx` mounts the finished sections at real scroll
lengths so the pinned sequences can be checked in a browser before they go
into Framer. Sections are added to it as they're built.

## Pasting into Framer

1. Create a code file per `shared/` module first (`theme.ts`, `copy.ts`,
   `styles.ts`, `primitives.tsx`, `gsap.ts`) — the section components import
   from them, and Framer resolves imports between its own code files.
2. Add `gsap` and `three` from the npm panel.
3. Paste each section component into its own code file. They take props with
   sensible defaults, so each one renders on the canvas with no configuration.
4. Nav finds sections by `id` (`problem`, `what-we-do`, `how-it-works`,
   `case-study`, `results`, `faq`). Give each Framer section the matching id
   or the progress underlines have nothing to measure.

Every component cleans up after itself (GSAP contexts revert, the WebGL
renderer disposes) because Framer's canvas remounts components on every edit.

## Media

`MediaTile` takes a `src`. Without one it renders a deterministic cinematic
gradient, which is how the site looks until real footage is dropped in — the
mosaic, the Results carousel and the Case Study gallery all read correctly
either way. Pass real clips through each section's props to replace them.

## Copy

`components/shared/copy.ts` is the single source. The spec references an
external `stride-media-website-copy.md`, which hasn't been supplied; the
current strings are written from the brand context in the spec and are meant
to be swapped for the real copy line for line.

## Motion

Every scroll sequence checks `prefers-reduced-motion` and falls back to the
section's resolved end state, so nothing depends on animation to be readable.
