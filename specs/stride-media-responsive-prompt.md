# Stride Media — Responsive Prompt (Tablet & Mobile)
Pair this with the spacing/typography doc and each section's transition prompt. Covers how every section adapts below desktop.

---

## Breakpoints (from spacing doc, repeated here for reference)

| Breakpoint | Range | Side padding | Section vertical padding |
|---|---|---|---|
| Desktop | 1920px+ | 96px | 160px |
| Laptop | 1440px | 72px | 128px |
| Tablet | 768–1024px | 48px | 96px |
| Mobile | below 768px | 24px | 64px |

Type sizes at each step are already defined per-token in the spacing/typography doc (desktop vs. mobile columns). Use linear interpolation (`clamp()` in CSS) between desktop and mobile values across the tablet range rather than a hard jump.

---

## General Rules for All Sections on Tablet/Mobile

1. **No hover-dependent interactions.** Anything triggered by `:hover` on desktop (Hero's mosaic tile expand, Case Study card hover states) needs a touch equivalent — either remove the interaction entirely on touch devices, or trigger it on tap instead. Detect via `(hover: hover)` media query, not just viewport width.
2. **Reduce or disable heavy scroll-pinning on mobile.** Long pinned sections (Problem, How It Works, Case Study) can feel janky on mobile scroll performance and disorienting on a small screen. Convert pinned/scrubbed sequences to simple sequential scroll (each state becomes its own normal-height section, no pinning) below the tablet breakpoint.
3. **Reduce 3D complexity on mobile.** Three.js scenes (Hero object, Why Stride object) should render at lower particle/vertex counts or fall back to a simpler pre-rendered loop/video on mobile to protect performance and battery.
4. **Stack multi-column layouts to single column** below tablet breakpoint, in reading order (usually: label → headline → image → description).
5. **Disable parallax/diagonal-scroll effects on mobile** (Case Study gallery) — replace with a simple vertical stack or horizontal swipeable carousel instead of scroll-driven diagonal movement.
6. **Video autoplay:** confirm `muted` + `playsinline` attributes are set (required for iOS autoplay). Reduce video resolution/quality served on mobile via responsive `<source>` or CDN transform.

---

## Per-Section Responsive Behavior

### Nav / Header
- **Tablet:** same horizontal nav, tighter gaps (24px between items instead of 32px)
- **Mobile:** collapse to a hamburger menu; logo stays left-aligned, menu icon right-aligned. Scroll-progress underline mechanic is dropped in the collapsed menu (not meaningful when nav is hidden) — instead, show a simple horizontal scroll-progress bar for the whole page at the very top of the viewport (2px height, full width)

### Hero
- **Tablet:** 3D object scales down proportionally (~60% of desktop size), video mosaic grid reduces from full grid to a simpler 2-3 column arrangement
- **Mobile:** 3D object further reduced (~40% of desktop size) or replaced with a lightweight pre-rendered loop video if performance testing shows frame drops. Video mosaic simplifies to a single looping background video (no interactive hover-grid — that interaction doesn't translate to touch). Headline uses `display-xl` mobile size (48px) per the type scale.

### Problem
- **Tablet:** Part 2 card layout stacks to 2 rows instead of 3 side-by-side columns (label+headline row, then image+number row), pinning behavior retained but shortened duration
- **Mobile:** pinning removed — Part 1 paragraph becomes a normal-scroll static block, Part 2 becomes 3 separate full-width stacked cards (label → headline → image → number → description, single column) instead of a pinned cycling slot

### Solution / What We Do
- **Tablet:** same scroll-expand behavior, slightly reduced max-scale
- **Mobile:** scroll-driven full-screen expand can feel excessive on small screens — simplify to a fixed-size video player that autoplays muted on scroll-into-view, no expand-to-fullscreen scrub. Keep the "scroll for more" indicator.

### How It Works
- **Tablet:** pinned step sequence retained, particle background density reduced for performance
- **Mobile:** pinning removed — intro panel, glow transition (simplified to a quick crossfade, no particle glow), and the three steps become sequential full-width stacked blocks (number above headline above description). Closing rotating icon retained but at reduced size (~50% of desktop)

### Case Study
- **Tablet:** diagonal gallery simplifies to a straight horizontal swipeable carousel (swipe left/right through images) instead of diagonal scroll-parallax
- **Mobile:** same horizontal swipe carousel, single image visible at a time, dot pagination indicator below. Intro dark panel and closing brand moment remain as simple sequential sections (no pin/scrub)

### Why Stride
- **Tablet:** stacked headline retained, 3D object scales down (~60%), capability labels stack below the object instead of beside it
- **Mobile:** letter-scatter effect simplified to a straightforward fade (scatter animation is desktop-only, replace with plain crossfade on mobile), 3D object further reduced or swapped for a static rotating GIF/video loop if performance requires it, capability labels become a simple stacked list below the object (auto-advancing or tap-to-reveal instead of scroll-cycling)

### Results / Proof
- **Tablet:** carousel card width reduces to ~240px, same horizontal scroll behavior
- **Mobile:** carousel card width ~85% of viewport width (one card + peek of next), native touch scroll-snap

### Testimonials
- **Tablet:** scattered mosaic simplifies to a looser 2-column staggered layout (still overlapping slightly, less chaotic than desktop)
- **Mobile:** fly-in scatter animation replaced with simple sequential fade-up cards in a single column (scatter physics don't read well on a narrow viewport)

### Final CTA
- **Tablet:** two columns stack to one column, world map illustration scales down and sits behind the headline as before
- **Mobile:** single column: headline → contact info → Start Project button → Calendly embed below (Calendly's own responsive mode handles the widget sizing)

### FAQ
- **Tablet:** "FAQ" letter intro retained, shrink-and-move transition duration shortened slightly
- **Mobile:** large letter intro simplified to a smaller static "FAQ" label at top (skip the shrink animation — not enough screen real estate to read well), accordion list full-width immediately below

### Footer
- **Tablet:** illustration scales down (~60% of desktop), content stacks normally below
- **Mobile:** illustration further reduced (~40%) or simplified (fewer particle elements for performance), all footer content centered and stacked vertically with standard mobile spacing (16px gaps)

---

## Performance Notes (mobile specifically)
- Lazy-load all video and 3D assets — nothing below the fold should load/decode until it's near the viewport
- Cap particle counts (Hero background grain, How It Works network texture, Footer floating dots) more aggressively on mobile — target 30-50% of desktop particle count
- Test actual scroll performance on a mid-tier device, not just Chrome DevTools mobile emulation — scroll-pinned sections are the most likely to jank on real hardware
