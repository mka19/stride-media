import { useEffect, useRef } from "react";
import { color, hexA } from "../shared/theme";
import { detailFor, type Breakpoint } from "../shared/responsive";

/**
 * The footer's decorative anchor: the brand mark rendered as a field of fine
 * vertical strokes rather than a flat fill, the way the reference draws its
 * totem. The mark is filled to an offscreen canvas, then each column is
 * sampled and redrawn as broken hairlines whose density follows the shape.
 *
 * It is deliberately still. The mark turns in Why Stride, where rotation is
 * the point; here it is a backdrop, and a second spinning copy would compete.
 */
export default function MarkEtching({
  size = 360,
  breakpoint = "desktop",
  tone = color.ruby,
}: {
  size?: number;
  breakpoint?: Breakpoint;
  tone?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const dpr = Math.min(window.devicePixelRatio, 2);
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 1. Fill the mark into an offscreen buffer at the same scale.
    const off = document.createElement("canvas");
    off.width = size;
    off.height = size;
    const octx = off.getContext("2d");
    if (!octx) return;

    const s = size / 100;
    octx.setTransform(s, 0, 0, s, 0, 0);
    octx.fillStyle = "#fff";

    // Ring, chevron and bar — the same geometry as StrideMark, filled.
    octx.beginPath();
    octx.arc(50, 50, 46, 0, Math.PI * 2);
    octx.arc(50, 50, 41, 0, Math.PI * 2, true);
    octx.fill("evenodd");

    octx.beginPath();
    octx.moveTo(26, 68);
    octx.lineTo(50, 18);
    octx.lineTo(74, 68);
    octx.lineTo(66, 68);
    octx.lineTo(50, 34);
    octx.lineTo(34, 68);
    octx.closePath();
    octx.fill();

    octx.beginPath();
    octx.rect(34, 78, 32, 7);
    octx.fill();

    // 2. Redraw it as broken vertical strokes, density following the shape.
    const data = octx.getImageData(0, 0, size, size).data;
    const step = Math.max(2, Math.round(3 / detailFor(breakpoint)));
    ctx.clearRect(0, 0, size, size);
    ctx.lineWidth = 1;

    for (let x = 0; x < size; x += step) {
      let runStart = -1;
      for (let y = 0; y <= size; y++) {
        const inside = y < size && data[(y * size + x) * 4 + 3] > 40;
        if (inside && runStart === -1) runStart = y;
        if (!inside && runStart !== -1) {
          // Break each run into a few segments so it reads as etched strokes
          // rather than a solid column.
          let y0 = runStart;
          while (y0 < y) {
            const len = 4 + Math.random() * 16;
            const y1 = Math.min(y, y0 + len);
            ctx.strokeStyle = hexA(tone, 0.25 + Math.random() * 0.5);
            ctx.beginPath();
            ctx.moveTo(x + 0.5, y0);
            ctx.lineTo(x + 0.5, y1);
            ctx.stroke();
            y0 = y1 + Math.random() * 5;
          }
          runStart = -1;
        }
      }
    }
  }, [size, breakpoint, tone]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ width: size, height: size, display: "block", maxWidth: "100%" }}
    />
  );
}
