# Stride Media — Transition Prompts (Text-Only, No Video Decoding Needed)
Each block below is a self-contained animation/transition description for one section. Paste directly into Claude Code — no video file required.

---

## NAV / HEADER — Transition Prompt

As the user scrolls through a section, the underline beneath that section's nav label fills from left to right in the ruby-red accent color, tracking scroll progress through that section (0% at section start, 100% at section end). When the user crosses into the next section, that nav item's underline is left full/complete, and the next nav item begins filling from 0%. The fill should update continuously and smoothly as the user scrolls — not in discrete steps. Use a scroll-progress listener (0 to 1) mapped to underline width per section, updated on every scroll frame (throttled/rAF for performance).

---

## HERO — Transition Prompt

**Phase 1 (0% scroll, page load):** A single 3D object sits centered on screen, glowing in ruby-red, slowly auto-rotating on its Y axis. Background is a dark, warm-black gradient with subtle film-grain noise. Minimal text on screen.

**Phase 1 → 2 (scroll 0–40% of hero height):** As the user scrolls, the 3D object scales down and its opacity fades to 0 while simultaneously the hero headline text fades in and scales up from a slightly smaller size, appearing to "emerge" from where the object was — a morph/crossfade, not a hard cut. At the same time, the background gradient crossfades into a grid of small looping video tiles (the mosaic), which fades in in sync with the object fading out.

**Phase 2 → 3 (scroll 40–100% of hero height, and idle state):** Once the mosaic is fully visible, it becomes interactive. On mouse hover over any tile, that tile scales up smoothly (spring easing, ~400ms) while the surrounding tiles compress/shrink to make room, like a bento grid rebalancing. On mouse leave, all tiles ease back to their default grid size. Use spring physics (e.g. Framer Motion's `spring` or GSAP's `elastic.out(1, 0.8)`) — never a linear or snap transition.

---

## PROBLEM — Transition Prompt

**Part 1 (pinned, dark):** Section pins (position: sticky or ScrollTrigger pin) while a cinematic background image/video stays fixed. A paragraph of text fades in line-by-line or word-by-word as the user scrolls through this pinned duration (e.g. each line triggers at a scroll-progress checkpoint). Background does not move — only the text animates.

**Part 1 → 2 (transition):** Once the text fully reveals, the entire pinned section crossfades (opacity 1→0 on dark layer, 0→1 on light layer) into a new pinned section with a light background.

**Part 2 (pinned, light, cycling cards):** A single card "slot" stays in the same screen position. As the user continues scrolling through this pinned duration, the card's content swaps at set scroll checkpoints (e.g. 0–33% = card 1, 33–66% = card 2, 66–100% = card 3). Each swap should crossfade the icon, label, headline, image, and number simultaneously (not staggered) — old content fades out (~200ms) while new content fades in (~200ms), with a slight upward slide (8–12px) on the incoming content for polish.

---

## SOLUTION / WHAT WE DO — Transition Prompt

As the section scrolls into view, a landscape video fades in and scales up slightly from 95% to 100% size (subtle, not dramatic). The video is muted and begins autoplaying as soon as it's ~50% visible in the viewport (use IntersectionObserver). As the user continues scrolling, the video's container scales up further and its border-radius reduces to 0, until it fills the entire viewport edge-to-edge (full-bleed). This scale-up should be tied directly to scroll position via ScrollTrigger (scrub: true) so it feels physically connected to the scroll, not a timed animation. Once the video reaches full-screen, a small pulsing "scroll for more" chevron/indicator fades in at the bottom center, inviting the user to continue scrolling into the next section.

---

## HOW IT WORKS — Transition Prompt

**Step 1 (intro panel):** Light background. Eyebrow label, headline, and paragraph fade/slide in from below (20px translateY, opacity 0→1) as the section enters the viewport.

**Step 1 → 2 (glow transition):** As the user scrolls past the intro panel, the background rapidly transitions to a dark, glowing version of the ruby-red accent — think a radial glow expanding from center, briefly revealing the Stride icon/logo silhouette within the glow (opacity peak ~60% through the transition, then fades). This should feel like a quick "flash" — roughly 600–800ms — then dissolve into the next panel's background.

**Step 3 (pinned step sequence):** Section pins. Light background with a faint particle/network texture (small dots connected by thin lines, subtle parallax drift). As the user scrolls through the pinned duration, three steps (01, 02, 03) appear one at a time at fixed scroll checkpoints — each step fades in (opacity + 15px upward slide) while the previous step fades out, OR all three remain visible but the active one is highlighted/scaled slightly larger — pick whichever reads cleaner, but keep it consistent with the numbered-step motif used elsewhere.

**Step 4 (closing panel):** A large icon/mark continuously rotates (slow, constant rotation — e.g. 20s per full rotation, linear easing, never stopping) as the centerpiece, with a closing line of text fading in beneath it once this panel is in view.

---

## CASE STUDY — Transition Prompt

**Part 1 (dark intro):** Dark background with grain/noise texture and a soft radial light glow behind the centered headline. Headline fades/scales in on section enter.

**Part 1 → 2 (transition):** Background crossfades from dark textured to a warm neutral flat tone as the user scrolls.

**Part 2 (diagonal gallery, pinned or long-scroll):** Multiple images enter from the bottom-right of the viewport and travel diagonally toward the upper-left as the user scrolls, at staggered speeds/offsets so they overlap rather than moving in unison (parallax — some images move faster than others based on assigned depth/z-index). Each image has a small caption in one corner, always readable (counter-rotate if the image itself has any rotation). This is best built with GSAP ScrollTrigger `scrub` on each image's x/y transform, offset by a stagger delay per image.

**Part 3 (closing brand moment):** Once the gallery clears (images have scrolled fully past), a centered logo/mark on a solid ruby-red card fades and scales in (from 90% to 100% scale, opacity 0→1).

**Part 4 (exit transition):** Crossfade/scroll into the next section's background.

---

## WHY STRIDE — Transition Prompt

**Step 1:** Bold stacked-word headline fades/slides in on light background as section enters.

**Step 2 (light → dark):** Background crossfades to dark; the headline's text color crossfades from dark-on-light to white-on-dark simultaneously (not a separate step — happens in the same transition), then the whole headline fades out.

**Step 3 (letter scatter):** As the headline fades out, its individual letters separate and scatter outward in random directions with slight rotation (e.g. each letter animates to a random `x`, `y`, `rotate` offset over ~600ms, staggered by ~20ms per letter), then fade to opacity 0.

**Step 4 (3D object reveal):** A textured 3D object fades and scales in (0.8→1 scale, opacity 0→1) at the screen center, then begins a slow continuous rotation (linear, ~25s per revolution) that persists through the rest of this section.

**Step 5 (orbiting labels):** While the object keeps rotating, text labels cycle in one at a time beside it — each label fades/slides in (from the side, ~15px), stays visible for a set scroll duration or timed interval, then fades/slides out as the next label fades in. Use a crossfade overlap (~150ms) so there's no blank gap between labels.

**Step 6 (exit):** Section fades/scrolls out into Results.

---

## RESULTS / PROOF — Transition Prompt

As the section scrolls into view, the row of video cards fades/slides in from the right (staggered, ~80ms delay per card) in a single pass. The row itself is horizontally scrollable (via scroll-snap or drag), independent of the page's vertical scroll. Each video autoplays muted and loops as soon as its card is in view (IntersectionObserver per card). No complex scroll-driven transform needed here — the entry animation is a simple staggered fade/slide-in; the ongoing interaction is horizontal scroll/drag.

---

## TESTIMONIALS — Transition Prompt

As the user scrolls through this section, individual testimonial cards fly in one at a time from randomized off-screen positions (assign each card a random starting `x`/`y` offset and rotation, e.g. ±300px horizontally, ±200px vertically, ±15deg rotation) and animate to their final resting position in the mosaic layout (ease-out, ~500–700ms per card, staggered by scroll-triggered checkpoints rather than a fixed timer — each card's entry should be tied to a specific scroll-progress point so the build-up feels controlled by the user's scroll speed). Cards should overlap slightly in their final positions (z-index layered) rather than sitting in a clean non-overlapping grid.

---

## FINAL CTA — Transition Prompt

Standard fade/slide-in on section enter (headline and form both slide up ~20px with fade, staggered ~100ms apart — headline first, then the Calendly card). No complex scroll-driven transform needed; this section should feel calm and stable compared to the more elaborate sections before it, since its job is conversion, not spectacle.

---

## FAQ — Transition Prompt

**Intro:** Large individual letters spelling "FAQ" are positioned spread across the screen (not touching), with a few small ambient background elements (particles or a subtle drifting shape) moving slowly and continuously behind them.

**Transition:** As the user scrolls, the large letters animate — each shrinking in scale and translating toward a smaller final position in the top-left corner (staggered slightly per letter, ~50ms offset), while simultaneously a list of numbered accordion items fades/slides in from the right side to fill the newly available space. This should feel like one continuous motion (letters shrinking away while the list grows in), not two separate disconnected animations.

**Accordion interaction:** Each FAQ item has a plus icon that rotates 45° into an "x" (or the answer panel simply expands with height auto-animation) on click, revealing the answer with a smooth height expand (~300ms ease) and fade-in of the answer text.

---

## FOOTER — Transition Prompt

A large decorative brand illustration/icon fades and scales in at the center as the footer enters the viewport (0.9→1 scale, opacity 0→1, ~600ms). Small particle/dot elements around it drift slowly and continuously (gentle floating motion, randomized per particle, looping — like slow-moving fireflies, never resetting abruptly). Footer text content (brand name, contact info, links) fades in beneath/around the illustration shortly after (staggered ~150ms behind the illustration's entrance).

---

## General Motion Rules (apply to all of the above)
- Default easing: `ease-out` or `power2.out` for entrances, `power2.inOut` for scroll-scrubbed transforms
- Avoid linear easing except for continuous rotations (which should stay linear so they don't visibly speed up/slow down)
- Nothing should snap instantly — minimum transition duration ~200ms, most should be 400–700ms
- Scroll-scrubbed animations (tied directly to scroll position via `scrub: true`) should be used for anything described as "as the user scrolls," while timed/triggered animations (fire once on enter) should be used for simple fade-ins
- Stagger delays across multiple elements should stay in the 20–150ms range — long enough to read as intentional, short enough to not feel sluggish
