/**
 * The one global stylesheet the components need.
 *
 * Framer code components can't ship a .css file, so `injectStrideStyles()`
 * adds the keyframes once per page, guarded by an id so repeated component
 * mounts (and Framer's canvas re-renders) never stack duplicates. The preview
 * harness gets the same rules from src/index.css instead.
 */
const STYLE_ID = "stride-global-styles";
const FONT_ID = "stride-fonts";

/** One family, four weights. */
export const strideFontHref =
  "https://fonts.googleapis.com/css2?family=Familjen+Grotesk:ital,wght@0,400..700;1,400..700&display=swap";

export const strideKeyframes = `
/* Lenis owns smooth scrolling; the native one would fight it. */
html { scroll-behavior: auto; }

/* Base size is the body token, so inherited text is on the scale too. */
body {
  font-family: "Neue Haas Grotesk Display", "Familjen Grotesk", -apple-system, BlinkMacSystemFont,
    "Segoe UI", Helvetica, Arial, sans-serif;
  font-size: clamp(16px, 15.00px + 0.2083vw, 19px);
  line-height: 1.6;
}
/*
 * Side and section padding step at the spec's breakpoints. Inline styles
 * cannot carry media queries, so the steps live here and every section reads
 * them through layout.pad / layout.section.
 */
:root { --stride-pad: 24px; --stride-section: 64px; }
@media (min-width: 769px)  { :root { --stride-pad: 48px; --stride-section: 96px; } }
@media (min-width: 1440px) { :root { --stride-pad: 72px; --stride-section: 128px; } }
@media (min-width: 1920px) { :root { --stride-pad: 96px; --stride-section: 160px; } }

/*
 * Keyboard focus.
 *
 * There was no focus style anywhere on this site — every control fell back to
 * whatever the browser draws, which on a dark ground is close to nothing.
 * :focus-visible only fires for keyboard and assistive navigation, so a mouse
 * click never leaves a ring behind on a button.
 */
:focus-visible {
  outline: 2px solid #8B5CF6;
  outline-offset: 3px;
  border-radius: 8px;
}
:focus:not(:focus-visible) { outline: none; }

/*
 * Press feedback.
 *
 * A control that does nothing between the press and the result reads as not
 * having heard the press at all. This is deliberately small — the press is
 * confirmation, not an animation — and short enough to land inside the same
 * moment as the click.
 */
.stride-press { transition: transform 150ms cubic-bezier(0.23, 1, 0.32, 1); }
.stride-press:active { transform: scale(0.97); }
@media (prefers-reduced-motion: reduce) {
  /* The feedback stays; only the movement goes. */
  .stride-press:active { transform: none; opacity: 0.82; }
}

/*
 * Optical spacing.
 *
 * Every gap in the spec is measured between what the eye sees — the cap of
 * one line and the baseline of the next — but a text box also carries the
 * half-leading above and below it. At 64/72 that is four extra pixels at each
 * end, so a 24px gap under a headline read as 37. The text-box property trims
 * half-leading out of the box, which makes the tokens land as drawn.
 * Browsers without it simply keep the old, slightly looser spacing.
 */
/*
 * A clipped gradient fill is painted only inside its element's box, and at a
 * line-height under 1 the descenders hang outside it — the tail of a g simply
 * missing. Padding gives them room; where text-box is supported the trimmed
 * box does the same without also showing up as a gap under the line.
 */


@supports (text-box: trim-both cap alphabetic) {
  h1, h2, h3, h4, h5, p, .stride-trim { text-box: trim-both cap alphabetic; }
  /* Explicitly not trimmed. A trimmed box here is cap-to-descender, which
     pulls two stacked lines closer than the leading says; the negative margin
     above already keeps the descender padding out of the layout. */
  .stride-ink, .stride-ink * { text-box: normal; }
}

@keyframes stride-drift {
  0%   { transform: scale(1.06) translate3d(0, 0, 0); }
  50%  { transform: scale(1.16) translate3d(-2.5%, -2%, 0); }
  100% { transform: scale(1.06) translate3d(0, 0, 0); }
}
.stride-drift { animation: stride-drift 26s ease-in-out infinite; }

/* The "scroll for more" chevron: a slow breath, never a bounce. */
@keyframes stride-pulse {
  0%, 100% { transform: translateY(0); opacity: 0.55; }
  50%      { transform: translateY(4px); opacity: 1; }
}
.stride-pulse { animation: stride-pulse 2.2s ease-in-out infinite; }

/*
 * The preloader's camera. Same shape as the Uiverse washing machine it is
 * built from: the body rocks a fraction of a degree and the round thing
 * inside it turns, fast then slow then fast, the way a lens racks focus
 * rather than the way a motor runs.
 */
@keyframes stride-cam-spin {
  0%   { transform: rotate(0deg); }
  50%  { transform: rotate(360deg); }
  75%  { transform: rotate(750deg); }
  100% { transform: rotate(1800deg); }
}
.stride-cam-lens { animation: stride-cam-spin 5s ease-in-out infinite; }

@keyframes stride-cam-shake {
  0%, 50%, 100%       { transform: rotate(0deg); }
  65%, 80%, 88%, 96%  { transform: rotate(0.5deg); }
  50.1%, 75%, 84%, 92%{ transform: rotate(-0.5deg); }
}
.stride-cam { animation: stride-cam-shake 5s ease-in-out infinite; }

/* The record light breathes rather than blinks: a hard blink at this size
   reads as a fault indicator. */
@keyframes stride-cam-rec {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0.25; }
}
.stride-cam-rec { animation: stride-cam-rec 1.6s ease-in-out infinite; }

/* Continuous rotations stay linear so they never visibly speed up or slow. */
@keyframes stride-spin { to { transform: rotate(360deg); } }
.stride-spin { animation: stride-spin 20s linear infinite; }

/* The sound button's bars, while a track is playing. */
@keyframes stride-eq {
  0%, 100% { transform: scaleY(0.35); }
  50%      { transform: scaleY(1); }
}

/* Ambient dots: a slow float that never resets abruptly. */
@keyframes stride-float {
  0%   { transform: translate3d(0, 0, 0); }
  25%  { transform: translate3d(26px, -34px, 0); }
  50%  { transform: translate3d(48px, -8px, 0); }
  75%  { transform: translate3d(18px, 28px, 0); }
  100% { transform: translate3d(0, 0, 0); }
}
.stride-float { animation-name: stride-float; animation-timing-function: ease-in-out; animation-iteration-count: infinite; }

/*
 * No reduced-motion block here.
 *
 * The scroll sequences stopped following the OS setting a while ago, because
 * following it silently removed a whole chapter and piled every pinned
 * section on top of itself. This stylesheet kept following it, so on a
 * machine with the setting on the ambient drift froze while everything
 * around it moved — the JS override cannot reach a media query.
 */
`;

export function injectStrideStyles() {
  if (typeof document === "undefined") return;

  if (!document.getElementById(FONT_ID)) {
    const link = document.createElement("link");
    link.id = FONT_ID;
    link.rel = "stylesheet";
    link.href = strideFontHref;
    document.head.appendChild(link);
  }

  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = strideKeyframes;
  document.head.appendChild(el);
}
