import { useEffect, useRef } from "react";
import { color, hexA } from "../shared/theme";
import { detailFor, type Breakpoint } from "../shared/responsive";

/**
 * The faint network texture behind the step sequence: drifting points with
 * hairlines drawn between near neighbours. Canvas rather than DOM nodes so
 * the count can be cut on phones without changing the markup, and so it costs
 * one paint instead of a few hundred composited layers.
 */
export default function ParticleField({
  breakpoint = "desktop",
  tone = "light",
}: {
  breakpoint?: Breakpoint;
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const detail = detailFor(breakpoint);
    const count = Math.round(70 * detail);
    const dpr = Math.min(window.devicePixelRatio, 2);

    let w = 0;
    let h = 0;
    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();

    const pts = Array.from({ length: count }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: (Math.random() - 0.5) * 0.00018,
      vy: (Math.random() - 0.5) * 0.00018,
      r: 0.6 + Math.random() * 1.2,
    }));

    const dot = tone === "light" ? color.textOnLight : color.textOnDark;
    let raf = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      for (const p of pts) {
        if (!reduced) {
          p.x += p.vx;
          p.y += p.vy;
          if (p.x < 0 || p.x > 1) p.vx *= -1;
          if (p.y < 0 || p.y > 1) p.vy *= -1;
        }
      }

      // Links first, so the points sit on top of their own web.
      ctx.lineWidth = 1;
      for (let i = 0; i < pts.length; i++) {
        for (let j = i + 1; j < pts.length; j++) {
          const dx = (pts[i].x - pts[j].x) * w;
          const dy = (pts[i].y - pts[j].y) * h;
          const d = Math.hypot(dx, dy);
          if (d > 150) continue;
          ctx.strokeStyle = hexA(color.ruby, 0.1 * (1 - d / 150));
          ctx.beginPath();
          ctx.moveTo(pts[i].x * w, pts[i].y * h);
          ctx.lineTo(pts[j].x * w, pts[j].y * h);
          ctx.stroke();
        }
      }

      for (const p of pts) {
        ctx.fillStyle = hexA(dot, 0.22);
        ctx.beginPath();
        ctx.arc(p.x * w, p.y * h, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      if (!reduced) raf = requestAnimationFrame(draw);
    };
    draw();

    const ro = new ResizeObserver(() => {
      resize();
      if (reduced) draw();
    });
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, [breakpoint, tone]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
    />
  );
}
