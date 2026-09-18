import { useEffect, useRef } from "react";
import { color, space, typeScale } from "./theme";
import { prefersReducedMotion } from "./gsap";
import { StrideMark } from "./primitives";

/**
 * A strip of oversized text travelling continuously between two hairlines —
 * a breather between major sections.
 *
 * The run is rendered twice and the offset wraps at half the track width, so
 * the loop has no seam. It is driven from an animation frame rather than a
 * CSS keyframe because the duration then depends on the content's real width
 * instead of a guess: the strip travels at a fixed speed in pixels per
 * second whatever the words are, which is what keeps two marquees on one
 * page reading as the same device.
 */
export default function Marquee({
  items,
  // A moving headline rather than a news crawl, but not so slow that it
  // reads as stalled.
  speed = 46,
  direction = -1,
}: {
  items: readonly string[];
  /** Pixels per second. */
  speed?: number;
  /** -1 travels left, 1 travels right. */
  direction?: -1 | 1;
}) {
  const track = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    let offset = 0;
    let prev = performance.now();
    let raf = 0;

    // Drag state. A throw hands its velocity to the loop and it decays back
    // into the steady travel, so letting go does not stop the strip dead.
    let dragging = false;
    let lastX = 0;
    let throwV = 0;
    const view = el.parentElement as HTMLElement | null;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - prev) / 1000;
      prev = now;
      const span = el.scrollWidth / 2 || 1;

      if (!dragging) {
        offset += (speed * dt - throwV * dt) * direction;
        throwV *= 0.94;
        if (Math.abs(throwV) < 1) throwV = 0;
      }
      // Wrap in both directions: a drag can push the offset negative, and a
      // bare modulo leaves that as a negative translate and a visible gap.
      offset = ((offset % span) + span) % span;
      /*
       * Always translated backwards, whichever way the strip travels.
       *
       * The direction used to be applied to the transform, so a
       * right-travelling strip was pushed from 0 to +span — and with only two
       * copies laid out there is nothing to the left of the first one, so the
       * band emptied from the left as the offset grew. Direction belongs on
       * which way the offset advances; the transform stays in [-span, 0],
       * where the second copy always covers what the first one leaves.
       */
      el.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };
    raf = requestAnimationFrame(frame);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      lastX = e.clientX;
      throwV = 0;
      view?.setPointerCapture(e.pointerId);
      if (view) view.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      offset -= dx;
      throwV = dx * 12 * direction;
      const span = el.scrollWidth / 2 || 1;
      offset = ((offset % span) + span) % span;
      el.style.transform = `translate3d(${-offset}px, 0, 0)`;
    };
    const onUp = (e: PointerEvent) => {
      dragging = false;
      view?.releasePointerCapture?.(e.pointerId);
      if (view) view.style.cursor = "grab";
    };

    view?.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      view?.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [speed, direction, items]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        overflow: "hidden",
        cursor: "grab",
        touchAction: "pan-y",
        userSelect: "none",
        background: color.black,
        borderTop: `1px solid ${color.hairlineOnDark}`,
        borderBottom: `1px solid ${color.hairlineOnDark}`,
        paddingBlock: space.lg,
      }}
    >
      <div
        ref={track}
        style={{ display: "flex", width: "max-content", willChange: "transform" }}
      >
        {[0, 1].map((copyIndex) => (
          <div key={copyIndex} style={{ display: "flex", flexShrink: 0 }}>
            {items.map((item, i) => (
              <span
                key={`${copyIndex}-${i}`}
                style={{
                  display: "flex",
                  alignItems: "center",
                  // Generous air either side of the separator: the words and
                  // the mark between them were running together at the old
                  // gutter-width spacing.
                  gap: space.hh,
                  paddingRight: space.hh,
                  ...typeScale.displayLg,
                  color: color.textOnDark,
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                {item}
                <span
                  className="stride-spin"
                  style={{ display: "inline-grid", placeItems: "center", flex: "0 0 auto", animationDuration: "7s" }}
                >
                  <StrideMark size={48} tint={color.accent} />
                </span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
