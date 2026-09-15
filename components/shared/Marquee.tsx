import { useEffect, useRef } from "react";
import { color, space, typeScale } from "./theme";
import { prefersReducedMotion } from "./gsap";

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
  // Slow. A ticker this size reads as a moving headline, not a news crawl,
  // and at 60px/s the words were gone before they were read.
  speed = 26,
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

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - prev) / 1000;
      prev = now;
      const span = el.scrollWidth / 2 || 1;
      offset = (offset + speed * dt) % span;
      el.style.transform = `translate3d(${direction * offset}px, 0, 0)`;
    };
    raf = requestAnimationFrame(frame);

    return () => cancelAnimationFrame(raf);
  }, [speed, direction, items]);

  return (
    <div
      aria-hidden="true"
      style={{
        position: "relative",
        overflow: "hidden",
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
                <span style={{ color: color.accent, opacity: 0.8 }}>+</span>
              </span>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
