import { useEffect, useRef, useState } from "react";
import { color, ease, hexA, typeScale } from "./theme";
import { prefersReducedMotion } from "./gsap";

/**
 * The opening hold.
 *
 * A brief camera ident while the page behind it finishes measuring itself. The build is
 * the one from Uiverse's washing machine — a body drawn entirely in stacked
 * gradients, with a round element spinning inside it — redrawn as the thing
 * this studio actually points at people.
 *
 * Two jobs, and the second one matters more than the look:
 *
 *   - The scroll sequences measure their own trigger positions on mount, and
 *     those measurements are wrong until the fonts have settled and the
 *     images have decoded. Holding the page still for the first few seconds
 *     and refreshing at the end means nothing is ever read at a position that
 *     was measured against a different layout.
 *   - The scroller is locked while it is up, so a visitor cannot scroll
 *     through three pinned sections before they have been laid out.
 *
 * It holds for just over one second, then refreshes the scroll measurements
 * after the curtain has left.
 */

const HOLD_MS = 1100;

export default function Preloader({
  /** Runs once the curtain is gone and the page has been re-measured. */
  onDone,
}: {
  onDone?: () => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const [gone, setGone] = useState(false);
  const [progress, setProgress] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    // The scroll position is restored by the browser before we get here, and
    // a pinned section measured from halfway down is measured wrong.
    window.scrollTo(0, 0);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const started = performance.now();
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      setProgress(Math.min(1, (performance.now() - started) / HOLD_MS));
    };
    raf = requestAnimationFrame(tick);

    const finish = () => {
      if (done.current) return;
      done.current = true;
      cancelAnimationFrame(raf);
      document.body.style.overflow = prevOverflow;
      setLeaving(true);
      // Out of the tree once the fade is over, so its layer is not held for
      // the life of the page.
      window.setTimeout(() => {
        setGone(true);
        onDone?.();
      }, 350);
    };

    const hold = window.setTimeout(finish, HOLD_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(hold);
      document.body.style.overflow = prevOverflow;
    };
    /*
     * Deliberately empty, not [onDone].
     *
     * onDone arrives as an inline arrow, so its identity changes on every
     * render of the parent — and with it in the dependency list, a single
     * re-render anywhere above would tear the whole hold down and start the
     * five seconds again. The callback is only ever read at the end.
     */
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (gone) return null;

  const still = prefersReducedMotion();

  return (
    <div
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 40,
        background: color.black,
        opacity: leaving ? 0 : 1,
        pointerEvents: leaving ? "none" : "auto",
        transition: `opacity 350ms ${ease.out}`,
      }}
    >
      <svg
        className={still ? undefined : "stride-loader-mark"}
        width="188"
        height="188"
        viewBox="19 12.25 80 80"
        role="img"
        aria-label="Stride Media"
        style={{ overflow: "visible", filter: `drop-shadow(0 24px 36px ${hexA("#000", 0.7)}) drop-shadow(0 0 24px ${hexA(color.accent, 0.2)})` }}
      >
        <defs>
          <linearGradient id="loader-chrome" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#51545B" />
            <stop offset="0.2" stopColor="#F7F8FA" />
            <stop offset="0.36" stopColor="#777B84" />
            <stop offset="0.56" stopColor="#24262B" />
            <stop offset="0.74" stopColor="#DDE0E5" />
            <stop offset="1" stopColor="#5E626B" />
          </linearGradient>
          <filter id="loader-depth" x="-30%" y="-30%" width="160%" height="170%">
            <feDropShadow dx="1.8" dy="2.8" stdDeviation="1.1" floodColor="#000" floodOpacity=".85" />
            <feDropShadow dx="-.5" dy="-.7" stdDeviation=".35" floodColor="#fff" floodOpacity=".65" />
          </filter>
        </defs>
        <g fill="url(#loader-chrome)" stroke="#F3F4F6" strokeWidth=".35" filter="url(#loader-depth)">
          <path d="M28 44V32l8-8h13l-8 8h-3l-2.5 2.5V37Z" />
          <path d="M90 44V32l-8-8H69l8 8h3l2.5 2.5V37Z" />
          <path d="M28 60.5v12l8 8h13l-8-8h-3L35.5 70v-2.5Z" />
          <path d="M90 60.5v12l-8 8H69l8-8h3l2.5-2.5v-2.5Z" />
          <path d="M59 37.25c0 11.25 3.75 15 15 15-11.25 0-15 3.75-15 15 0-11.25-3.75-15-15-15 11.25 0 15-3.75 15-15Z" />
        </g>
      </svg>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <span style={{ ...typeScale.eyebrow, color: hexA("#FFFFFF", 0.5) }}>
          Stride Media
        </span>
        {/* A short progress line keeps the ident legible without delaying the hero. */}
        <span
          style={{
            position: "relative",
            display: "block",
            width: 168,
            height: 2,
            borderRadius: 2,
            background: hexA("#FFFFFF", 0.12),
            overflow: "hidden",
          }}
        >
          <span
            style={{
              position: "absolute",
              inset: 0,
              transformOrigin: "0% 50%",
              transform: `scaleX(${leaving ? 1 : progress})`,
              background: `linear-gradient(90deg, ${color.accent}, ${color.accentBright})`,
            }}
          />
        </span>
      </div>
    </div>
  );
}

