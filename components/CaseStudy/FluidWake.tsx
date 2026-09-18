import { useEffect, useRef } from "react";
import { prefersReducedMotion } from "../shared/gsap";

type Drop = { x: number; y: number; vx: number; vy: number; life: number; size: number };

/** A card-local, velocity-driven fluid wake with a cheap 2D canvas pass. */
export default function FluidWake() {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    const host = canvas?.parentElement;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !host || !ctx || prefersReducedMotion() || !matchMedia("(hover: hover)").matches) return;

    const drops: Drop[] = [];
    let previous: { x: number; y: number; time: number } | null = null;
    let raf = 0;
    let width = 1;
    let height = 1;
    const dpr = Math.min(devicePixelRatio, 1.5);

    const resize = () => {
      const box = host.getBoundingClientRect();
      width = Math.max(1, box.width);
      height = Math.max(1, box.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    const move = (event: PointerEvent) => {
      const box = host.getBoundingClientRect();
      const x = event.clientX - box.left;
      const y = event.clientY - box.top;
      const now = performance.now();
      if (x < 0 || y < 0 || x > width || y > height) return;

      const dx = previous ? x - previous.x : 0;
      const dy = previous ? y - previous.y : 0;
      const distance = Math.hypot(dx, dy);
      const count = Math.max(1, Math.min(7, Math.ceil(distance / 12)));
      for (let i = 0; i < count; i += 1) {
        const p = (i + 1) / count;
        drops.push({
          x: x - dx * (1 - p),
          y: y - dy * (1 - p),
          vx: dx * 0.045 + (Math.random() - 0.5) * 0.35,
          vy: dy * 0.045 + (Math.random() - 0.5) * 0.35,
          life: 1,
          size: 20 + Math.min(26, distance * 0.38) + Math.random() * 10,
        });
      }
      if (drops.length > 90) drops.splice(0, drops.length - 90);
      previous = { x, y, time: now };
    };

    const leave = () => { previous = null; };

    const frame = () => {
      raf = requestAnimationFrame(frame);
      ctx.clearRect(0, 0, width, height);
      ctx.globalCompositeOperation = "screen";

      for (let i = drops.length - 1; i >= 0; i -= 1) {
        const drop = drops[i];
        drop.life *= 0.935;
        drop.x += drop.vx;
        drop.y += drop.vy;
        drop.vx *= 0.965;
        drop.vy *= 0.965;
        drop.size *= 1.012;
        if (drop.life < 0.025) {
          drops.splice(i, 1);
          continue;
        }

        const gradient = ctx.createRadialGradient(drop.x, drop.y, 0, drop.x, drop.y, drop.size);
        gradient.addColorStop(0, `rgba(184,156,255,${0.22 * drop.life})`);
        gradient.addColorStop(0.34, `rgba(124,58,237,${0.18 * drop.life})`);
        gradient.addColorStop(0.72, `rgba(65,24,126,${0.09 * drop.life})`);
        gradient.addColorStop(1, "rgba(30,8,68,0)");
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(drop.x, drop.y, drop.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = "source-over";
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);
    host.addEventListener("pointermove", move, { passive: true });
    host.addEventListener("pointerleave", leave);
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      host.removeEventListener("pointermove", move);
      host.removeEventListener("pointerleave", leave);
    };
  }, []);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none", mixBlendMode: "screen", zIndex: 2 }}
    />
  );
}
