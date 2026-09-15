/**
 * The one global stylesheet the components need.
 *
 * Framer code components can't ship a .css file, so `injectStrideStyles()`
 * adds the keyframes once per page, guarded by an id so repeated component
 * mounts (and Framer's canvas re-renders) never stack duplicates. The preview
 * harness gets the same rules from src/index.css instead.
 */
const STYLE_ID = "stride-global-styles";

export const strideKeyframes = `
@keyframes stride-drift {
  0%   { transform: scale(1.06) translate3d(0, 0, 0); }
  50%  { transform: scale(1.16) translate3d(-2.5%, -2%, 0); }
  100% { transform: scale(1.06) translate3d(0, 0, 0); }
}
.stride-drift { animation: stride-drift 26s ease-in-out infinite; }

@media (prefers-reduced-motion: reduce) {
  .stride-drift { animation: none; }
}
`;

export function injectStrideStyles() {
  if (typeof document === "undefined") return;
  if (document.getElementById(STYLE_ID)) return;
  const el = document.createElement("style");
  el.id = STYLE_ID;
  el.textContent = strideKeyframes;
  document.head.appendChild(el);
}
