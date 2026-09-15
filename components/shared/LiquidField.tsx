import { useEffect, useRef } from "react";
import type { CSSProperties } from "react";
import { prefersReducedMotion } from "./gsap";

/**
 * A slow liquid wash for a section's ground — vercel.com's fluid backdrop.
 *
 * Domain-warped value noise on a single full-bleed quad: one fbm field is
 * used to displace the coordinates fed to a second, which is what turns
 * smooth noise into something that folds and flows rather than drifting.
 * It runs at a crawl — a full fold takes the better part of a minute — and
 * sits at low contrast, so it reads as the ground having depth rather than
 * as an animation playing behind the type.
 *
 * Raw WebGL rather than three.js: this is one quad and one fragment shader,
 * and pulling the whole renderer in for it costs more than it is worth on a
 * page that already has a scene of its own running.
 *
 * At half resolution and upscaled. The field has no edges or fine detail to
 * lose, so a quarter of the fragment work buys nothing visible.
 */
export default function LiquidField({
  opacity = 0.9,
  speed = 1,
  style,
  className,
}: {
  opacity?: number;
  /** Multiplier on an already very slow clock. */
  speed?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const gl = canvas.getContext("webgl", {
      alpha: true,
      antialias: false,
      premultipliedAlpha: false,
      powerPreference: "low-power",
    });
    if (!gl) return;

    const vert = `
      attribute vec2 aPos;
      void main() { gl_Position = vec4(aPos, 0.0, 1.0); }
    `;

    const frag = `
      precision mediump float;
      uniform vec2 uSize;
      uniform float uTime;
      uniform float uAlpha;

      float hash(vec2 p) {
        return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
      }

      float noise(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        vec2 u = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash(i + vec2(0.0, 0.0)), hash(i + vec2(1.0, 0.0)), u.x),
          mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x),
          u.y
        );
      }

      float fbm(vec2 p) {
        float v = 0.0;
        float a = 0.5;
        for (int i = 0; i < 4; i++) {
          v += a * noise(p);
          p *= 2.02;
          a *= 0.5;
        }
        return v;
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / uSize;
        vec2 p = uv * vec2(uSize.x / uSize.y, 1.0) * 1.7;
        float t = uTime;

        // One field displaces the next: without the warp this is smooth
        // noise drifting, with it the field folds over itself.
        vec2 q = vec2(fbm(p + vec2(0.0, t * 0.16)), fbm(p + vec2(4.7, -t * 0.13)));
        vec2 r = vec2(
          fbm(p + 3.0 * q + vec2(1.7, 9.2) + t * 0.09),
          fbm(p + 3.0 * q + vec2(8.3, 2.8) - t * 0.075)
        );
        float f = fbm(p + 3.4 * r);

        vec3 deep   = vec3(0.035, 0.024, 0.078);
        vec3 mid    = vec3(0.243, 0.129, 0.478);
        vec3 bright = vec3(0.553, 0.373, 0.925);

        vec3 col = mix(deep, mid, smoothstep(0.24, 0.72, f));
        col = mix(col, bright, smoothstep(0.55, 0.96, f) * 0.85);

        // Softest at the edges, so it never draws a boundary of its own.
        float vig = smoothstep(1.55, 0.05, length(uv - 0.5));
        gl_FragColor = vec4(col, uAlpha * vig);
      }
    `;

    const compile = (type: number, src: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, src);
      gl.compileShader(sh);
      return sh;
    };

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, vert));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, frag));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uSize = gl.getUniformLocation(prog, "uSize");
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uAlpha = gl.getUniformLocation(prog, "uAlpha");
    gl.uniform1f(uAlpha, opacity);

    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    const resize = () => {
      const w = Math.max(1, Math.round(canvas.clientWidth * 0.6));
      const h = Math.max(1, Math.round(canvas.clientHeight * 0.6));
      if (canvas.width === w && canvas.height === h) return;
      canvas.width = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
      gl.uniform2f(uSize, w, h);
    };
    resize();

    const reduced = prefersReducedMotion();
    let raf = 0;
    const start = performance.now();

    const frame = () => {
      raf = requestAnimationFrame(frame);
      resize();
      gl.uniform1f(uTime, ((performance.now() - start) / 1000) * speed);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    };

    if (reduced) {
      // One frame, held: the texture without the motion.
      gl.uniform1f(uTime, 12);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    } else {
      frame();
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [opacity, speed]);

  return (
    <canvas
      ref={ref}
      aria-hidden="true"
      className={className}
      style={{ display: "block", width: "100%", height: "100%", ...style }}
    />
  );
}
