import { useEffect, useRef } from "react";
import { color } from "./theme";
import { prefersReducedMotion } from "./gsap";

/**
 * The footer wordmark, drawn to canvas so it can come apart under the
 * cursor: blocks near the pointer scatter and thin out, the way the
 * reference's mark dissolves as you move across it.
 *
 * The clean type is rendered once to an offscreen canvas and blitted each
 * frame; only the blocks inside the pointer's reach are re-drawn with
 * jitter. Redrawing the whole wordmark per frame would cost a full text
 * raster on every pointer move, for an effect that is only ever local.
 *
 * Three things keep the effect smooth rather than mechanical:
 *
 *   · the erase is a radial gradient, not a clipped circle, so the dissolve
 *     has no edge — the earlier version cut a hard disc out of the letters
 *     and you could see the circle travelling across the word;
 *   · the pointer is eased toward its target and the whole effect fades in
 *     and out with an intensity value, so entering and leaving the mark is a
 *     transition rather than a switch;
 *   · each block's displacement comes from a hash of its own coordinates,
 *     not from Math.random() per frame, so blocks drift steadily outward
 *     instead of strobing in place.
 */
export default function Wordmark({
  text,
  height = 220,
}: {
  text: string;
  /** Any CSS length. The type is sized to fill the width within it. */
  height?: number | string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = prefersReducedMotion();
    const dpr = Math.min(window.devicePixelRatio, 2);

    let w = 0;
    let h = 0;
    let off: HTMLCanvasElement | null = null;
    let raf = 0;

    // Pointer target, the eased position that follows it, and how much of the
    // effect is currently applied. Starting off-canvas means nothing dissolves
    // until the cursor actually arrives.
    let tx = -9999;
    let ty = -9999;
    let sx = -9999;
    let sy = -9999;
    let inside = false;
    let intensity = 0;

    const FONT = '600 100px "Familjen Grotesk", Helvetica, Arial, sans-serif';

    const render = () => {
      const octx = off?.getContext("2d");
      if (!off || !octx) return;
      octx.clearRect(0, 0, w, h);

      // Size from the width first so the word reaches both edges, then clamp
      // to what the box can show. Measuring once at 100px and scaling beats
      // stepping the size down in a loop — it lands on the exact fit.
      octx.font = FONT;
      const unit = octx.measureText(text).width / 100 || 1;
      const byWidth = (w * 0.99) / unit;
      // Cap height is roughly 0.76 of the em for this face; keeping the caps
      // inside the box is what stops the tops of the letters being clipped.
      const byHeight = h / 0.76;
      const size = Math.max(12, Math.min(byWidth, byHeight));

      octx.font = `600 ${size}px "Familjen Grotesk", Helvetica, Arial, sans-serif`;
      octx.textBaseline = "middle";
      octx.textAlign = "center";
      octx.fillStyle = color.textOnDark;
      octx.fillText(text, w / 2, h / 2);
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      render();
    };

    const BLOCK = 6;
    const RADIUS = 170;

    // A stable pseudo-random value per block, so a block's scatter is a
    // property of where it is rather than of which frame this is.
    const hash = (x: number, y: number, salt: number) => {
      let n = Math.imul(x, 374761393) ^ Math.imul(y, 668265263) ^ Math.imul(salt, 2246822519);
      n = Math.imul(n ^ (n >>> 13), 1274126177);
      return ((n ^ (n >>> 16)) >>> 0) / 4294967295;
    };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!off || !w || !h) return;

      // Ease the pointer and the strength of the effect. Both are what make
      // hovering feel like the mark reacting rather than snapping.
      if (sx < -1000 && inside) {
        sx = tx;
        sy = ty;
      }
      sx += (tx - sx) * 0.16;
      sy += (ty - sy) * 0.16;
      intensity += ((inside ? 1 : 0) - intensity) * 0.08;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(off, 0, 0, w, h);

      if (reduced || intensity < 0.01) return;

      // 1. Thin the letters out under the cursor with a soft radial erase —
      //    a gradient, so the dissolve has no boundary of its own.
      const fade = ctx.createRadialGradient(sx, sy, 0, sx, sy, RADIUS);
      fade.addColorStop(0, `rgba(0,0,0,${0.96 * intensity})`);
      fade.addColorStop(0.45, `rgba(0,0,0,${0.72 * intensity})`);
      fade.addColorStop(0.75, `rgba(0,0,0,${0.3 * intensity})`);
      fade.addColorStop(1, "rgba(0,0,0,0)");
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      ctx.fillStyle = fade;
      ctx.fillRect(sx - RADIUS, sy - RADIUS, RADIUS * 2, RADIUS * 2);
      ctx.restore();

      // 2. Stamp the erased blocks back, thrown outward and faded with
      //    distance, which is what reads as the word coming apart.
      const x0 = Math.max(0, Math.floor((sx - RADIUS) / BLOCK) * BLOCK);
      const x1 = Math.min(w, Math.ceil((sx + RADIUS) / BLOCK) * BLOCK);
      const y0 = Math.max(0, Math.floor((sy - RADIUS) / BLOCK) * BLOCK);
      const y1 = Math.min(h, Math.ceil((sy + RADIUS) / BLOCK) * BLOCK);

      for (let y = y0; y < y1; y += BLOCK) {
        for (let x = x0; x < x1; x += BLOCK) {
          const d = Math.hypot(x + BLOCK / 2 - sx, y + BLOCK / 2 - sy);
          if (d > RADIUS) continue;

          // Nearer the cursor: thrown further, more likely to be dropped.
          const t = (1 - d / RADIUS) * intensity;
          const keep = hash(x, y, 7);
          if (keep < t * 0.5) continue;

          const push = t * 30;
          const dx = (hash(x, y, 1) - 0.5) * push;
          const dy = (hash(x, y, 2) - 0.5) * push;
          ctx.globalAlpha = Math.min(1, (1 - t * 0.55) * intensity + (1 - intensity));
          ctx.drawImage(off, x, y, BLOCK, BLOCK, x + dx, y + dy, BLOCK, BLOCK);
        }
      }
      ctx.globalAlpha = 1;
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      tx = e.clientX - r.left;
      ty = e.clientY - r.top;
      // A margin either side, so the effect eases away as the cursor leaves
      // rather than cutting out at the edge of the box.
      inside =
        tx > -RADIUS * 0.6 &&
        tx < r.width + RADIUS * 0.6 &&
        ty > -RADIUS * 0.6 &&
        ty < r.height + RADIUS * 0.6;
    };

    // The webfont has to be in before the type is rastered, or the wordmark
    // bakes in the fallback face and never updates.
    void document.fonts?.ready.then(resize);
    resize();
    frame();

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    window.addEventListener("pointermove", onPointer, { passive: true });

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
    };
  }, [text]);

  return (
    <canvas
      ref={ref}
      role="img"
      aria-label={text}
      style={{ display: "block", width: "100%", height, maxWidth: "100%" }}
    />
  );
}
