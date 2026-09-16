import { useEffect, useRef, useState } from "react";
import { color, ease, hexA, typeScale } from "./theme";
import { prefersReducedMotion } from "./gsap";

/**
 * The opening hold.
 *
 * A camera sitting on the black ground with its lens turning, held for five
 * seconds while the page behind it finishes measuring itself. The build is
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
 * It never holds longer than it says it will: five seconds, or until the
 * window has loaded if that takes longer, and a hard ceiling at eight so a
 * stalled asset can never leave someone looking at a camera.
 */

const HOLD_MS = 5000;
const CEILING_MS = 8000;

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
      }, 700);
    };

    // The hold is a floor, not a fixed wait: if the window is still loading
    // at five seconds it gets the time it needs, up to the ceiling.
    let ceiling = 0;
    const floor = window.setTimeout(() => {
      if (document.readyState === "complete") finish();
      else window.addEventListener("load", finish, { once: true });
    }, HOLD_MS);
    ceiling = window.setTimeout(finish, CEILING_MS);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(floor);
      window.clearTimeout(ceiling);
      window.removeEventListener("load", finish);
      document.body.style.overflow = prevOverflow;
    };
  }, [onDone]);

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
        transition: `opacity 700ms ${ease.out}`,
      }}
    >
      <div className={still ? undefined : "stride-cam"} style={camera}>
        {/* The lens. The turning ring is the aperture, the dark centre is the
            glass, and the highlight is a single sweep across it. */}
        <span className={still ? undefined : "stride-cam-lens"} style={lens} />
        {/* Record light: the one thing on the body that is not grey. */}
        <span className={still ? undefined : "stride-cam-rec"} style={rec} />
      </div>

      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        <span style={{ ...typeScale.eyebrow, color: hexA("#FFFFFF", 0.5) }}>
          Stride Media
        </span>
        {/* A line that fills rather than a spinner: five seconds of a spinner
            reads as a page that is stuck, five seconds of a line that is
            three quarters along reads as five seconds. */}
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

/*
 * The body, drawn the way the reference draws its washing machine: one
 * element, a stack of gradients, each layer positioned and sized by hand.
 * Top to bottom — the hot shoe, the mode dial, the grip ridges, the top
 * plate's seam, and the shell itself.
 */
const camera: React.CSSProperties = {
  position: "relative",
  width: 168,
  height: 116,
  borderRadius: 14,
  backgroundColor: "#17171A",
  backgroundRepeat: "no-repeat",
  backgroundImage: [
    // hot shoe
    "linear-gradient(#2E2E33, #2E2E33)",
    // mode dial
    "radial-gradient(circle at center, #34343A 42%, #202024 43%)",
    // grip ridges, left
    "repeating-linear-gradient(90deg, #232327 0 2px, #1B1B1F 2px 5px)",
    // the seam under the top plate
    "linear-gradient(rgba(255,255,255,0.10), rgba(255,255,255,0.10))",
    // the top plate itself, a shade lighter than the shell
    "linear-gradient(#202024, #1A1A1E)",
  ].join(","),
  backgroundPosition: "62px -9px, 118px 4px, 14px 62px, 0 26px, 0 0",
  backgroundSize: "34px 12px, 26px 26px, 26px 30px, 100% 1px, 100% 26px",
  boxShadow: `0 26px 70px ${hexA("#000000", 0.6)}, inset 0 1px 0 rgba(255,255,255,0.06)`,
  transformOrigin: "50% 120%",
};

const lens: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 14,
  margin: "auto",
  width: 72,
  height: 72,
  borderRadius: "50%",
  boxSizing: "border-box",
  border: "7px solid #232327",
  backgroundColor: "#0C0C0F",
  backgroundRepeat: "no-repeat",
  backgroundImage: [
    // the aperture blades
    `conic-gradient(${hexA("#FFFFFF", 0.1)} 0deg 18deg, transparent 18deg 60deg, ${hexA(
      "#FFFFFF",
      0.1,
    )} 60deg 78deg, transparent 78deg 120deg, ${hexA("#FFFFFF", 0.1)} 120deg 138deg, transparent 138deg 180deg, ${hexA(
      "#FFFFFF",
      0.1,
    )} 180deg 198deg, transparent 198deg 240deg, ${hexA("#FFFFFF", 0.1)} 240deg 258deg, transparent 258deg 300deg, ${hexA(
      "#FFFFFF",
      0.1,
    )} 300deg 318deg, transparent 318deg 360deg)`,
    // the glass: the accent only ever shows up as a coating on it
    `radial-gradient(circle at 34% 30%, ${hexA(color.accentBright, 0.55)} 0%, ${hexA(
      color.accent,
      0.3,
    )} 34%, #0A0A0C 72%)`,
  ].join(","),
  backgroundSize: "100% 100%, 100% 100%",
  boxShadow: `0 0 0 3px #121215 inset, 0 0 0 1px ${hexA("#FFFFFF", 0.08)}, 0 0 26px ${hexA(
    color.accent,
    0.3,
  )}`,
};

const rec: React.CSSProperties = {
  position: "absolute",
  top: 36,
  left: 18,
  width: 7,
  height: 7,
  borderRadius: "50%",
  background: color.accent,
  boxShadow: `0 0 10px ${hexA(color.accent, 0.9)}`,
};
