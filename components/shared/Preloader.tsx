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
      <div className={still ? undefined : "stride-cam"} style={camera}>
        {/* The barrel stands still and the glass turns inside it, which is
            what a lens actually does. */}
        <span style={lens}>
          <span className={still ? undefined : "stride-cam-lens"} style={glass} />
          {/* The highlight belongs to the room, not to the glass, so it does
              not rotate with it. */}
          <span style={glint} />
        </span>
        {/* Record light: the one thing on the body that is not grey. */}
        <span className={still ? undefined : "stride-cam-rec"} style={rec} />
      </div>

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

/*
 * The body, drawn the way the reference draws its washing machine: one
 * element, a stack of gradients, each layer positioned and sized by hand.
 * Top to bottom — the hot shoe, the mode dial, the grip ridges, the top
 * plate's seam, and the shell itself.
 */
const camera: React.CSSProperties = {
  position: "relative",
  width: 188,
  height: 126,
  borderRadius: 16,
  backgroundColor: "#17171A",
  backgroundRepeat: "no-repeat",
  backgroundImage: [
    // A hot shoe with a lit top edge rather than a flat grey block.
    "linear-gradient(#3A3A41 0 60%, #232328 60%)",
    // The mode dial: a knurled disc, lit from the upper left.
    "repeating-conic-gradient(from 0deg, #45454F 0deg 9deg, #3A3A44 9deg 18deg)",
    "radial-gradient(circle at 38% 34%, #4A4A54 0%, #30303A 48%, #1C1C22 52%, #262630 100%)",
    // Grip: ridges with a highlight down the left of each, which is what
    // makes moulded rubber read as moulded rather than as stripes.
    "repeating-linear-gradient(90deg, #2C2C32 0 1px, #232329 1px 3px, #191920 3px 5px)",
    // The seam under the top plate, and a thin lit edge above it.
    "linear-gradient(rgba(255,255,255,0.16), rgba(255,255,255,0.16))",
    "linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.55))",
    // The top plate, lighter than the shell and falling off toward the seam.
    "linear-gradient(#3A3A45 0%, #2A2A34 70%, #232330 100%)",
    // The shell: light from above, darker at the base, with a soft sheen
    // sweeping across the middle.
    "linear-gradient(105deg, transparent 30%, rgba(255,255,255,0.05) 46%, transparent 58%)",
    "linear-gradient(#2E2E38 0%, #202029 55%, #17171E 100%)",
  ].join(","),
  backgroundPosition:
    "68px -10px, 132px 6px, 132px 6px, 16px 70px, 0 28px, 0 29px, 0 0, 0 0, 0 0",
  backgroundSize:
    "36px 13px, 24px 24px, 24px 24px, 28px 34px, 100% 1px, 100% 1px, 100% 28px, 100% 100%, 100% 100%",
  boxShadow: [
    // Grounded: a contact shadow close in, and a soft one spread wide.
    `0 2px 0 ${hexA("#FFFFFF", 0.05)} inset`,
    `0 -14px 24px ${hexA("#000000", 0.45)} inset`,
    `0 18px 30px ${hexA("#000000", 0.55)}`,
    `0 40px 90px ${hexA("#000000", 0.6)}`,
  ].join(","),
  transformOrigin: "50% 120%",
};

const lens: React.CSSProperties = {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 15,
  margin: "auto",
  width: 78,
  height: 78,
  borderRadius: "50%",
  boxSizing: "border-box",
  overflow: "hidden",
  // The barrel: a machined ring, lit from the upper left and falling away to
  // the lower right, the way a turned metal collar catches a single source.
  backgroundImage:
    "conic-gradient(from 210deg, #6B6B7A 0deg, #3A3A46 80deg, #22222C 175deg, #55555F 285deg, #6B6B7A 360deg)",
  boxShadow: [
    `0 0 0 1px ${hexA("#FFFFFF", 0.12)}`,
    `0 0 22px ${hexA(color.accent, 0.3)}`,
  ].join(","),
};

/*
 * The glass, as its own round element.
 *
 * These layers were background images on the barrel, sized to 56% — and a
 * background layer paints its box, not a circle, so the aperture and the
 * coating rendered as a square that visibly rotated inside a round lens. A
 * child with its own border-radius is round by construction.
 */
const glass: React.CSSProperties = {
  position: "absolute",
  inset: 9,
  borderRadius: "50%",
  backgroundColor: "#08080A",
  backgroundImage: [
    // The aperture blades, only just visible through the coating.
    `conic-gradient(${hexA("#FFFFFF", 0.07)} 0deg 16deg, transparent 16deg 60deg, ${hexA("#FFFFFF", 0.07)} 60deg 76deg, transparent 76deg 120deg, ${hexA("#FFFFFF", 0.07)} 120deg 136deg, transparent 136deg 180deg, ${hexA("#FFFFFF", 0.07)} 180deg 196deg, transparent 196deg 240deg, ${hexA("#FFFFFF", 0.07)} 240deg 256deg, transparent 256deg 300deg, ${hexA("#FFFFFF", 0.07)} 300deg 316deg, transparent 316deg 360deg)`,
    // The coating: the colour a multi-coated element throws back.
    `radial-gradient(circle at 36% 30%, ${hexA(color.accentBright, 0.5)} 0%, ${hexA(color.accent, 0.32)} 26%, #0B0B12 62%, #060608 100%)`,
  ].join(","),
  boxShadow: `0 0 12px 5px ${hexA("#000000", 0.75)} inset`,
};

/** The room, reflected: a hot spot and the crescent above it. */
const glint: React.CSSProperties = {
  position: "absolute",
  inset: 9,
  borderRadius: "50%",
  pointerEvents: "none",
  backgroundImage: [
    "radial-gradient(circle at 33% 25%, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.2) 8%, transparent 18%)",
    "radial-gradient(ellipse 58% 20% at 50% 16%, rgba(255,255,255,0.16) 0%, transparent 72%)",
  ].join(","),
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
