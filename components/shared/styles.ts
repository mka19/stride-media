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

/** Familjen Grotesk + Martian Mono, the two free faces in Trionn's stack. */
export const strideFontHref =
  "https://fonts.googleapis.com/css2?family=Familjen+Grotesk:ital,wght@0,400..700;1,400..700&family=Martian+Mono:wght@300..600&display=swap";

export const strideKeyframes = `
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

@media (prefers-reduced-motion: reduce) {
  .stride-drift { animation: none; }
  .stride-pulse { animation: none; }
}
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
