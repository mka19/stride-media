import { useEffect, useRef } from "react";
import { color, hexA } from "../shared/theme";
import { detailFor, type Breakpoint } from "../shared/responsive";

/**
 * The texture behind the step sequence: a drifting dot network, hairline
 * streaks, crosshair registration marks, and chunks travelling toward the
 * viewer on their own depth, some carrying a small annotation.
 *
 * All of it is one canvas. As DOM it would be a few hundred composited
 * layers redrawn every frame; here it costs a single paint, and the counts
 * scale down on phones through the shared detail multiplier.
 */
export default function FieldTexture({
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
    const dpr = Math.min(window.devicePixelRatio, 2);
    const ink = tone === "light" ? color.textOnLight : color.textOnDark;

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

    const rand = (a: number, b: number) => a + Math.random() * (b - a);

    const dots = Array.from({ length: Math.round(46 * detail) }, () => ({
      x: Math.random(),
      y: Math.random(),
      vx: rand(-0.00016, 0.00016),
      vy: rand(-0.00016, 0.00016),
    }));

    const crosses = Array.from({ length: Math.round(7 * detail) }, () => ({
      x: Math.random(),
      y: Math.random(),
      r: rand(6, 13),
    }));

    const streaks = Array.from({ length: Math.round(5 * detail) }, () => ({
      x: Math.random(),
      y: Math.random(),
      len: rand(0.12, 0.3),
      angle: rand(-0.5, 0.5),
      speed: rand(0.02, 0.06),
    }));

    // Chunks travel toward the viewer: z shrinks, so scale and offset grow.
    const LABELS = ["// strategy", "// script", "// render", "// edit", "// deliver", "// hook test"];
    const chunks = Array.from({ length: Math.round(14 * detail) }, (_, i) => ({
      ax: rand(-1, 1),
      ay: rand(-1, 1),
      z: rand(0.25, 1.6),
      spin: rand(-0.4, 0.4),
      label: i % 3 === 0 ? LABELS[i % LABELS.length] : "",
      n: String((i % 3) + 1).padStart(2, "0"),
    }));

    let raf = 0;
    let prev = performance.now();

    const draw = (now: number) => {
      raf = requestAnimationFrame(draw);
      const dt = reduced ? 0 : Math.min(64, now - prev) / 1000;
      prev = now;
      ctx.clearRect(0, 0, w, h);

      // --- dot network ---
      for (const d of dots) {
        d.x += d.vx * dt * 60;
        d.y += d.vy * dt * 60;
        if (d.x < 0 || d.x > 1) d.vx *= -1;
        if (d.y < 0 || d.y > 1) d.vy *= -1;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = (dots[i].x - dots[j].x) * w;
          const dy = (dots[i].y - dots[j].y) * h;
          const dist = Math.hypot(dx, dy);
          if (dist > 160) continue;
          ctx.strokeStyle = hexA(color.accent, 0.09 * (1 - dist / 160));
          ctx.beginPath();
          ctx.moveTo(dots[i].x * w, dots[i].y * h);
          ctx.lineTo(dots[j].x * w, dots[j].y * h);
          ctx.stroke();
        }
      }
      for (const d of dots) {
        ctx.fillStyle = hexA(ink, 0.2);
        ctx.fillRect(d.x * w - 1, d.y * h - 1, 2, 2);
      }

      // --- hairline streaks ---
      for (const s of streaks) {
        s.x += s.speed * dt;
        if (s.x > 1.3) s.x = -0.3;
        const x = s.x * w;
        const y = s.y * h;
        const grad = ctx.createLinearGradient(x, y, x + s.len * w, y + s.angle * s.len * w);
        grad.addColorStop(0, hexA(ink, 0));
        grad.addColorStop(0.5, hexA(ink, 0.3));
        grad.addColorStop(1, hexA(ink, 0));
        ctx.strokeStyle = grad;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + s.len * w, y + s.angle * s.len * w);
        ctx.stroke();
      }

      // --- registration crosses ---
      ctx.strokeStyle = hexA(ink, 0.22);
      for (const c of crosses) {
        const x = c.x * w;
        const y = c.y * h;
        ctx.beginPath();
        ctx.moveTo(x - c.r, y);
        ctx.lineTo(x + c.r, y);
        ctx.moveTo(x, y - c.r);
        ctx.lineTo(x, y + c.r);
        ctx.stroke();
      }

      // --- chunks, nearest drawn last ---
      const ordered = [...chunks].sort((a, b) => b.z - a.z);
      for (const c of ordered) {
        c.z -= dt * 0.055;
        if (c.z < 0.18) {
          c.z = 1.7;
          c.ax = rand(-1, 1);
          c.ay = rand(-1, 1);
        }
        const scale = 0.4 / c.z;
        const x = w / 2 + c.ax * w * 0.55 * scale;
        const y = h / 2 + c.ay * h * 0.55 * scale;
        const size = 26 * scale;
        // Fade in from the distance and back out as it passes the viewer.
        const alpha = Math.min(1, (1.7 - c.z) * 1.6) * Math.min(1, c.z * 2.2) * 0.5;
        if (alpha <= 0.01) continue;

        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(c.spin * (1.7 - c.z));
        ctx.fillStyle = hexA(ink, alpha * 0.1);
        ctx.strokeStyle = hexA(ink, alpha * 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.rect(-size / 2, -size / 2, size, size);
        ctx.fill();
        ctx.stroke();
        // The step number, riding the chunk.
        ctx.fillStyle = hexA(color.accent, alpha * 0.85);
        ctx.font = `600 ${Math.max(7, size * 0.34)}px "Familjen Grotesk", Helvetica, Arial, sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(c.n, 0, 0);
        ctx.restore();

        if (c.label && scale > 0.35) {
          ctx.fillStyle = hexA(ink, alpha * 0.55);
          ctx.font = `500 ${Math.max(8, 10 * Math.min(1.4, scale))}px "Familjen Grotesk", Helvetica, Arial, sans-serif`;
          ctx.textAlign = "left";
          ctx.fillText(c.label, x + size * 0.7, y - size * 0.4);
        }
      }
    };
    raf = requestAnimationFrame(draw);

    const ro = new ResizeObserver(resize);
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
