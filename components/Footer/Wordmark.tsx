import { useEffect, useRef } from "react";
import { color } from "../shared/theme";

/**
 * The footer wordmark, drawn to canvas so it can come apart under the
 * cursor: blocks near the pointer scatter and thin out, the way the
 * reference's mark dissolves as you move across it.
 *
 * The clean type is rendered once to an offscreen canvas and blitted each
 * frame; only the blocks inside the pointer's radius are re-drawn with
 * jitter. Redrawing the whole wordmark per frame would cost a full text
 * raster on every pointer move, for an effect that is only ever local.
 */
export default function Wordmark({
  text,
  height = 220,
}: {
  text: string;
  height?: number;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const dpr = Math.min(window.devicePixelRatio, 2);

    let w = 0;
    let h = 0;
    let off: HTMLCanvasElement | null = null;
    let raf = 0;

    // Pointer position in canvas space; starts far away so nothing dissolves.
    let px = -9999;
    let py = -9999;

    const render = () => {
      const octx = off?.getContext("2d");
      if (!off || !octx) return;
      octx.clearRect(0, 0, w, h);
      // Fit the word to the canvas width, whatever the viewport does.
      let size = h * 1.05;
      octx.textBaseline = "middle";
      octx.textAlign = "center";
      octx.fillStyle = color.textOnDark;
      for (; size > 12; size -= 2) {
        octx.font = `700 ${size}px "Familjen Grotesk", Helvetica, Arial, sans-serif`;
        if (octx.measureText(text).width <= w * 0.96) break;
      }
      octx.fillText(text, w / 2, h / 2);
    };

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      off = document.createElement("canvas");
      off.width = w;
      off.height = h;
      render();
    };

    const BLOCK = 6;
    const RADIUS = 150;

    const frame = () => {
      raf = requestAnimationFrame(frame);
      if (!off) return;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(off, 0, 0, w, h);

      if (reduced || px < -1000) return;

      // Clear the neighbourhood, then stamp its blocks back with scatter, so
      // the letters break up rather than smear.
      const x0 = Math.max(0, Math.floor((px - RADIUS) / BLOCK) * BLOCK);
      const x1 = Math.min(w, Math.ceil((px + RADIUS) / BLOCK) * BLOCK);
      const y0 = Math.max(0, Math.floor((py - RADIUS) / BLOCK) * BLOCK);
      const y1 = Math.min(h, Math.ceil((py + RADIUS) / BLOCK) * BLOCK);

      ctx.save();
      ctx.beginPath();
      ctx.arc(px, py, RADIUS, 0, Math.PI * 2);
      ctx.clip();
      ctx.clearRect(x0, y0, x1 - x0, y1 - y0);

      for (let y = y0; y < y1; y += BLOCK) {
        for (let x = x0; x < x1; x += BLOCK) {
          const d = Math.hypot(x + BLOCK / 2 - px, y + BLOCK / 2 - py);
          if (d > RADIUS) continue;
          // Nearer the cursor: more likely to be thrown, more likely to go.
          const t = 1 - d / RADIUS;
          if (Math.random() < t * 0.55) continue;
          const push = t * 26;
          const dx = (Math.random() - 0.5) * push;
          const dy = (Math.random() - 0.5) * push;
          ctx.drawImage(off, x, y, BLOCK, BLOCK, x + dx, y + dy, BLOCK, BLOCK);
        }
      }
      ctx.restore();
    };

    const onPointer = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      // Off the wordmark by a margin: stop dissolving.
      if (px < -RADIUS || px > r.width + RADIUS || py < -RADIUS || py > r.height + RADIUS) {
        px = -9999;
      }
    };

    // The webfont has to be in before the type is rastered, or the wordmark
    // bakes in the fallback face and never updates.
    void document.fonts?.ready.then(() => {
      resize();
    });
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
