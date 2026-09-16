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
    // A separate channel from the pointer's local dissolve: pressing blows
    // the whole mark apart, wherever the cursor happens to be, and releasing
    // draws it back. It eases in and out on the same frame loop, so the
    // explosion and the return are one continuous move rather than a swap
    // between two states.
    let pressed = false;
    // Two channels, not one. `spread` is how far the blocks are from home;
    // `veil` is how much of the clean mark underneath is erased. On the way
    // out they move together. On the way back the veil is held up until the
    // blocks are nearly home — with one value the erase lifted as the blocks
    // were still travelling, so the word reassembled underneath its own
    // debris and the particles arrived late, which is backwards.
    let spread = 0;
    let veil = 0;
    let last = performance.now();

    const FONT = '500 100px "Familjen Grotesk", Helvetica, Arial, sans-serif';

    const render = () => {
      const octx = off?.getContext("2d");
      if (!off || !octx) return;
      octx.clearRect(0, 0, w, h);

      // Size from the width first so the word reaches both edges, then clamp
      // to what the box can show. Measuring once at 100px and scaling beats
      // stepping the size down in a loop — it lands on the exact fit.
      octx.font = FONT;
      const unit = octx.measureText(text).width / 100 || 1;
      const byWidth = (w * 0.995) / unit;
      // Cap height is roughly 0.76 of the em for this face; keeping the caps
      // inside the box is what stops the tops of the letters being clipped.
      const byHeight = h / 0.76;
      const size = Math.max(12, Math.min(byWidth, byHeight));

      octx.font = `500 ${size}px "Familjen Grotesk", Helvetica, Arial, sans-serif`;
      octx.textBaseline = "middle";
      octx.textAlign = "center";
      octx.fillStyle = color.textOnDark;
      octx.fillText(text, w / 2, h / 2);
    };

    let fitting = false;

    const resize = () => {
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      if (!w || !h) return;

      /*
       * Fit the box to the type, in both directions.
       *
       * The word is sized from the width, so any height above that is dead
       * space inside the canvas — and dead space in a canvas reads as a gap
       * under the mark that no tightening of the layout around it can remove.
       *
       * It has to be able to grow as well as shrink. It only shrank before,
       * so when the box came in shorter than the width demanded the type was
       * sized down to fit the height and sat centred with a gap at each end,
       * which is the opposite of a wordmark that spans the page.
       */
      if (!fitting) {
        const probe = document.createElement("canvas").getContext("2d");
        if (probe) {
          probe.font = FONT;
          const unit = probe.measureText(text).width / 100 || 1;
          const byWidth = (w * 0.995) / unit;
          const capPx = Math.round(byWidth * 0.76);
          if (capPx > 24 && Math.abs(capPx - h) > 2) {
            fitting = true;
            canvas.style.height = `${capPx}px`;
            requestAnimationFrame(() => {
              fitting = false;
            });
            h = capPx;
          }
        }
      }
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

      // Ease the pointer and the strength of the effect against the clock,
      // not against the frame. A per-frame factor makes every one of these
      // settle at whatever rate the page happens to be running at, and this
      // page carries a 3D scene and a shader: at fifteen frames a second the
      // mark was still in pieces seconds after the press ended.
      const now = performance.now();
      const dt = Math.min(0.05, (now - last) / 1000);
      last = now;
      const approach = (tau: number) => 1 - Math.exp(-dt / tau);

      if (sx < -1000 && inside) {
        sx = tx;
        sy = ty;
      }
      const follow = approach(0.09);
      sx += (tx - sx) * follow;
      sy += (ty - sy) * follow;

      intensity += ((inside ? 1 : 0) - intensity) * approach(0.13);
      // Out fast, back slower: a mark that reassembles at the speed it came
      // apart reads as a rewind rather than as settling.
      spread += ((pressed ? 1 : 0) - spread) * approach(pressed ? 0.09 : 0.26);
      // Held at full while the blocks are still out, then released as they
      // land: the mark is only uncovered once there is something home to
      // uncover.
      const veilTarget = pressed ? 1 : Math.min(1, spread * 3.2);
      veil += (veilTarget - veil) * approach(pressed ? 0.09 : 0.1);

      // Both channels snap at the tail. An exponential never reaches zero,
      // and while either has anything left the loop keeps stamping blocks a
      // fraction of a pixel out of place — a permanently ragged mark.
      if (!inside && intensity < 0.02) intensity = 0;
      if (!pressed && spread < 0.01) spread = 0;
      if (!pressed && spread === 0 && veil < 0.012) veil = 0;

      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(off, 0, 0, w, h);

      if (reduced || (intensity === 0 && spread === 0 && veil === 0)) return;

      // 1. Thin the letters out under the cursor with a soft radial erase —
      //    a gradient, so the dissolve has no boundary of its own. Under a
      //    press the erase covers the whole mark instead.
      ctx.save();
      ctx.globalCompositeOperation = "destination-out";
      if (veil > 0) {
        ctx.fillStyle = `rgba(0,0,0,${veil})`;
        ctx.fillRect(0, 0, w, h);
      }
      if (intensity > 0) {
        const fade = ctx.createRadialGradient(sx, sy, 0, sx, sy, RADIUS);
        fade.addColorStop(0, `rgba(0,0,0,${0.96 * intensity})`);
        fade.addColorStop(0.45, `rgba(0,0,0,${0.72 * intensity})`);
        fade.addColorStop(0.75, `rgba(0,0,0,${0.3 * intensity})`);
        fade.addColorStop(1, "rgba(0,0,0,0)");
        ctx.fillStyle = fade;
        ctx.fillRect(sx - RADIUS, sy - RADIUS, RADIUS * 2, RADIUS * 2);
      }
      ctx.restore();

      // 2. Stamp the erased blocks back, thrown outward and faded with
      //    distance, which is what reads as the word coming apart.
      // Under a press every block is in play; otherwise only the ones the
      // cursor is over.
      const full = spread > 0 || veil > 0;
      const x0 = full ? 0 : Math.max(0, Math.floor((sx - RADIUS) / BLOCK) * BLOCK);
      const x1 = full ? w : Math.min(w, Math.ceil((sx + RADIUS) / BLOCK) * BLOCK);
      const y0 = full ? 0 : Math.max(0, Math.floor((sy - RADIUS) / BLOCK) * BLOCK);
      const y1 = full ? h : Math.min(h, Math.ceil((sy + RADIUS) / BLOCK) * BLOCK);

      const cx = w / 2;
      const cy = h / 2;

      for (let y = y0; y < y1; y += BLOCK) {
        for (let x = x0; x < x1; x += BLOCK) {
          const d = Math.hypot(x + BLOCK / 2 - sx, y + BLOCK / 2 - sy);

          // Local dissolve under the cursor.
          const t = d > RADIUS ? 0 : (1 - d / RADIUS) * intensity;

          // The press throws every block outward from the middle of the mark,
          // so the word opens rather than scattering into noise.
          const ox = x + BLOCK / 2 - cx;
          const oy = y + BLOCK / 2 - cy;
          const len = Math.hypot(ox, oy) || 1;
          const throwDist = spread * (90 + hash(x, y, 4) * 260);
          const bx = (ox / len) * throwDist;
          const by = (oy / len) * throwDist * 0.55;

          const keep = hash(x, y, 7);
          if (keep < t * 0.5) continue;
          if (spread > 0.02 && keep < spread * 0.22) continue;

          const push = t * 30;
          const dx = (hash(x, y, 1) - 0.5) * push + bx;
          const dy = (hash(x, y, 2) - 0.5) * push + by;

          const localAlpha = Math.min(1, (1 - t * 0.55) * intensity + (1 - intensity));
          ctx.globalAlpha = Math.max(0, localAlpha * (1 - spread * 0.25));
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

    // The loop runs continuously here, so these only set the flag.
    const onDown = () => {
      pressed = true;
    };
    const onUp = () => {
      pressed = false;
    };

    canvas.addEventListener("pointerdown", onDown);
    // Released on anything that can end a press, not just the one event: a
    // press that is never cleared leaves the mark permanently in pieces, and
    // that is a worse failure than releasing one frame early.
    canvas.addEventListener("pointerup", onUp);
    window.addEventListener("pointerup", onUp);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("pointercancel", onUp);
    window.addEventListener("blur", onUp);
    canvas.addEventListener("pointerleave", onUp);

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
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("pointercancel", onUp);
      window.removeEventListener("blur", onUp);
      canvas.removeEventListener("pointerleave", onUp);
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
