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
  imageSrc,
  imageScrim = 0.42,
  style,
  className,
}: {
  handleRef: { current: SlatHandle | null };
  /** The slats' colour — the opposite of the ground they cover. */
  color?: string;
  columnWidth?: number;
  /**
   * Optional still behind the slats. With one, the curtain is not a flat
   * plate but the image itself being taken apart: each bar carries the slice
   * of the picture that sits exactly where it is, so the image stays
   * registered to the screen and shreds away rather than sliding off.
   */
  imageSrc?: string;
  /** How far the still is pushed back under `color`, so copy stays legible. */
  imageScrim?: number;
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

    /* The still, cover-fitted to the canvas once per resize, so the per-bar
       draw is a straight blit rather than a re-scale on every frame. */
    let art: HTMLCanvasElement | null = null;
    let img: HTMLImageElement | null = null;

    const paintArt = () => {
      if (!img || !img.complete || !img.naturalWidth || !w || !h) {
        art = null;
        return;
      }
      const c = document.createElement("canvas");
      c.width = w * dpr;
      c.height = h * dpr;
      const g = c.getContext("2d");
      if (!g) return;
      g.setTransform(dpr, 0, 0, dpr, 0, 0);
      const scale = Math.max(w / img.naturalWidth, h / img.naturalHeight);
      const dw = img.naturalWidth * scale;
      const dh = img.naturalHeight * scale;
      g.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
      g.fillStyle = color;
      g.globalAlpha = imageScrim;
      g.fillRect(0, 0, w, h);
      art = c;
    };

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

      // One bar: the still's own slice when there is a still, the flat
      // colour otherwise. Either way the paint comes from where the bar is,
      // never from where it started.
      const slat = (x: number, y: number, bw: number, bh: number) => {
        if (art) {
          ctx.drawImage(art, x * dpr, y * dpr, bw * dpr, bh * dpr, x, y, bw, bh);
          return;
        }
        ctx.fillRect(x, y, bw, bh);
      };

      for (const c of cols) {
        const open = Math.min(1, Math.max(0, (progress - c.start) / c.span));
        if (open >= 1) continue;
        const covered = (1 - open) * h;
        // The bar retracts to both edges at once, split unevenly, which is
        // what leaves slats hanging from the top and rising from the bottom
        // at the same moment rather than one clean shutter.
        const top = covered * c.fromTop;
        const bottom = covered - top;
        if (top > 0.5) slat(c.x, 0, cw, top);
        if (bottom > 0.5) slat(c.x, h - bottom, cw, bottom);
      }
    };

    if (imageSrc) {
      img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        paintArt();
        draw();
      };
      img.src = imageSrc;
    }

    build();
    paintArt();
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
      paintArt();
      draw();
    });
    ro.observe(canvas);

    return () => {
      ro.disconnect();
      handleRef.current = null;
    };
  }, [handleRef, color, columnWidth, imageSrc, imageScrim]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
