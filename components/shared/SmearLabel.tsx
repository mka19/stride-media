import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

/**
 * A label whose letters are dragged toward the cursor and blurred as it
 * passes over them, so the word smears under the pointer and settles back
 * when it leaves.
 *
 * Per character rather than as one filter: an SVG displacement map over the
 * whole button is a full-surface filter on every pointer move, which drops
 * frames on a nav bar that is composited over a scrolling page. Translating
 * and blurring individual spans is a transform and a filter on a handful of
 * tiny elements, and it reads the same.
 *
 * Every character eases toward its target on one shared rAF loop, so the
 * smear trails the cursor rather than snapping to it, and it unwinds on its
 * own when the pointer leaves.
 */
export default function SmearLabel({
  children,
  reach = 58,
  pull = 0.42,
  blur = 2.6,
  style,
}: {
  children: string;
  /** How far either side of a letter the cursor starts to affect it. */
  reach?: number;
  /** How far a letter travels toward the cursor, as a share of the distance. */
  pull?: number;
  /** Peak blur on the letter directly under the cursor. */
  blur?: number;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const root = ref.current;
    if (!root) return;
    if (!window.matchMedia?.("(hover: hover) and (pointer: fine)").matches) return;

    const chars = Array.from(root.querySelectorAll<HTMLElement>("[data-ch]"));
    if (!chars.length) return;

    let px = -9999;
    let raf = 0;
    const state = chars.map(() => ({ x: 0, b: 0 }));

    const frame = () => {
      raf = requestAnimationFrame(frame);
      const box = root.getBoundingClientRect();
      let moved = false;

      chars.forEach((ch, i) => {
        const r = ch.getBoundingClientRect();
        const centre = r.left + r.width / 2 - box.left;
        const d = px - centre;
        const near = px < -1000 ? 0 : Math.max(0, 1 - Math.abs(d) / reach);
        // Squared falloff: the letter under the cursor takes nearly all of
        // the movement and its neighbours only lean, which is what makes it
        // read as a smear rather than as the whole word sliding.
        const strength = near * near;
        const targetX = d * pull * strength;
        const targetB = blur * strength;

        const s = state[i];
        s.x += (targetX - s.x) * 0.16;
        s.b += (targetB - s.b) * 0.16;
        if (Math.abs(s.x) > 0.02 || s.b > 0.02) moved = true;

        ch.style.transform = `translate3d(${s.x.toFixed(2)}px, 0, 0)`;
        ch.style.filter = s.b > 0.05 ? `blur(${s.b.toFixed(2)}px)` : "none";
      });

      // Park the loop once everything is home and the cursor has gone.
      if (!moved && px < -1000) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    };

    const wake = () => {
      if (!raf) frame();
    };
    const onMove = (e: PointerEvent) => {
      const box = root.getBoundingClientRect();
      px = e.clientX - box.left;
      wake();
    };
    const onLeave = () => {
      px = -9999;
      wake();
    };

    const host = root.parentElement ?? root;
    host.addEventListener("pointermove", onMove);
    host.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      host.removeEventListener("pointermove", onMove);
      host.removeEventListener("pointerleave", onLeave);
    };
  }, [children, reach, pull, blur]);

  return (
    <span ref={ref} aria-label={children} style={{ display: "inline-flex", ...style }}>
      {children.split("").map((ch, i) => (
        <span
          key={i}
          data-ch=""
          aria-hidden="true"
          style={{
            display: "inline-block",
            whiteSpace: "pre",
            willChange: "transform, filter",
          }}
        >
          {ch}
        </span>
      ))}
    </span>
  );
}
