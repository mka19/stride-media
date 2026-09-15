import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";

export type SlatHandle = { setProgress: (p: number) => void };

/**
 * A curtain of vertical slats that retracts to uncover what is beneath —
 * sondaven.com's "why … captivate" reveal.
 *
 * The screen starts covered in bars. They pull back from the middle outward,
 * each one on its own schedule, so the ground opens as a ragged ellipse
 * rather than as a wipe with a straight edge. Bars near the centre go first
 * and the corners hold longest, which is what makes the centred line in the
 * clearing read as the thing being uncovered.
 *
 * Canvas rather than a few hundred DOM nodes: at 13px columns this is ~150
 * bars redrawn on a scrub, and that many elements with their own transforms
 * drops frames on the scroll.
 */
export default function SlatCurtain({
  handleRef,
  color = "#0A0A0A",
  columnWidth = 13,
  style,
  className,
}: {
  handleRef: { current: SlatHandle | null };
  /** The slats' colour — the opposite of the ground they cover. */
  color?: string;
  columnWidth?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    let w = 0;
    let h = 0;
    let progress = 0;

    /** Per-column: when it starts opening, how long it takes, how it splits. */
    let cols: { x: number; start: number; span: number; fromTop: number }[] = [];

    // A stable value per column, so a bar's schedule is a property of where it
    // is rather than of when the component happened to mount.
    const hash = (i: number, salt: number) => {
      let n = Math.imul(i + 1, 374761393) ^ Math.imul(salt, 2246822519);
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    };

    const build = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      const count = Math.max(8, Math.ceil(w / columnWidth));
      cols = [];
      for (let i = 0; i < count; i++) {
        const x = (i * w) / count;
        // Distance from the middle, 0 at the centre and 1 at either edge.
        const d = Math.abs((x + w / (count * 2)) / w - 0.5) * 2;
        // Centre first, edges last, with enough jitter that the opening edge
        // is ragged instead of a clean arc.
        //
        // start + span never exceeds 1. They used to sum to as much as 1.34,
        // so the slowest columns were still part-closed when the curtain
        // reached the end of its travel and bars were left standing at the
        // edges of the frame while the ground beneath them changed.
        const start = d * 0.45 + hash(i, 1) * 0.2;
        cols.push({
          x,
          start,
          span: 0.3 + hash(i, 2) * 0.05,
          fromTop: 0.35 + hash(i, 3) * 0.3,
        });
      }
    };

    const draw = () => {
      if (!w || !h || !cols.length) return;
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = color;
      const cw = w / cols.length + 1;

      for (const c of cols) {
        const open = Math.min(1, Math.max(0, (progress - c.start) / c.span));
        if (open >= 1) continue;
        const covered = (1 - open) * h;
        // The bar retracts to both edges at once, split unevenly, which is
        // what leaves slats hanging from the top and rising from the bottom
        // at the same moment rather than one clean shutter.
        const top = covered * c.fromTop;
        const bottom = covered - top;
        if (top > 0.5) ctx.fillRect(c.x, 0, cw, top);
        if (bottom > 0.5) ctx.fillRect(c.x, h - bottom, cw, bottom);
      }
    };

    build();
    draw();

    handleRef.current = {
      setProgress: (p: number) => {
        const next = Math.min(1, Math.max(0, p));
        if (next === progress) return;
        progress = next;
        draw();
      },
    };

    const ro = new ResizeObserver(() => {
      build();
      draw();
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      handleRef.current = null;
    };
  }, [handleRef, color, columnWidth]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
