import { type CSSProperties, type ReactNode, useEffect, useRef } from "react";
import { color, ease, font, glow, hexA, microLabel } from "./theme";
import { injectStrideStyles } from "./styles";

/* ------------------------------------------------------------------ *
 * Brand mark
 * ------------------------------------------------------------------ */

/**
 * The Stride mark: a forward-leaning aperture. Used in the nav, the How It
 * Works transition flash, the Case Study logo card and the footer anchor.
 * Pure SVG so it can glow, rotate and scale without a raster asset.
 */
export function StrideMark({
  size = 40,
  stroke = color.ruby,
  glowing = false,
  style,
}: {
  size?: number;
  stroke?: string;
  glowing?: boolean;
  style?: CSSProperties;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
      style={{
        filter: glowing
          ? `drop-shadow(0 0 12px ${hexA(stroke, 0.7)}) drop-shadow(0 0 40px ${hexA(stroke, 0.4)})`
          : undefined,
        ...style,
      }}
    >
      <circle cx="50" cy="50" r="46" stroke={stroke} strokeWidth="1.5" opacity="0.5" />
      <path d="M50 4 L50 96" stroke={stroke} strokeWidth="1" opacity="0.25" />
      <path
        d="M26 68 L50 18 L74 68"
        stroke={stroke}
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M34 82 L66 82" stroke={stroke} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Type
 * ------------------------------------------------------------------ */

export function MicroLabel({
  children,
  tone = "dark",
  style,
}: {
  children: ReactNode;
  /** Which surface the label sits on. */
  tone?: "dark" | "light" | "ruby";
  style?: CSSProperties;
}) {
  const c =
    tone === "ruby" ? color.ruby : tone === "light" ? color.textOnLightMuted : color.textOnDarkMuted;
  return <div style={{ ...microLabel, color: c, ...style }}>{children}</div>;
}

/* ------------------------------------------------------------------ *
 * CTA
 * ------------------------------------------------------------------ */

export function ArrowIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path
        d="M3 13L13 3M13 3H5.5M13 3V10.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Neon-treated primary action. Glow lifts on hover, never flickers. */
export function GlowButton({
  children,
  href,
  onClick,
  variant = "solid",
  arrow = true,
  style,
}: {
  children: ReactNode;
  href?: string;
  onClick?: () => void;
  variant?: "solid" | "ghost";
  arrow?: boolean;
  style?: CSSProperties;
}) {
  const solid = variant === "solid";
  const base: CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    gap: 10,
    padding: "16px 28px",
    borderRadius: 999,
    border: "none",
    cursor: "pointer",
    textDecoration: "none",
    fontFamily: font.sans,
    fontSize: 14,
    fontWeight: 500,
    letterSpacing: "0.01em",
    background: solid ? color.ruby : "transparent",
    color: solid ? "#fff" : color.textOnDark,
    boxShadow: solid ? glow.box : `inset 0 0 0 1px ${color.hairlineOnDark}`,
    transition: `box-shadow 520ms ${ease.out}, transform 520ms ${ease.out}, background 520ms ${ease.out}`,
    ...style,
  };

  const hoverIn = (el: HTMLElement) => {
    el.style.boxShadow = solid ? glow.boxStrong : `inset 0 0 0 1px ${hexA(color.ruby, 0.6)}, ${glow.textSoft}`;
    el.style.transform = "translateY(-2px)";
    if (!solid) el.style.background = hexA(color.ruby, 0.08);
  };
  const hoverOut = (el: HTMLElement) => {
    el.style.boxShadow = base.boxShadow as string;
    el.style.transform = "translateY(0)";
    if (!solid) el.style.background = "transparent";
  };

  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => hoverIn(e.currentTarget),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => hoverOut(e.currentTarget),
    onFocus: (e: React.FocusEvent<HTMLElement>) => hoverIn(e.currentTarget),
    onBlur: (e: React.FocusEvent<HTMLElement>) => hoverOut(e.currentTarget),
  };

  const inner = (
    <>
      {children}
      {arrow && <ArrowIcon />}
    </>
  );

  return href ? (
    <a href={href} style={base} {...handlers}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} style={base} {...handlers}>
      {inner}
    </button>
  );
}

/* ------------------------------------------------------------------ *
 * Surfaces
 * ------------------------------------------------------------------ */

/**
 * Film grain. An SVG fractal-noise turbulence tiled over the section — the
 * texture that keeps the warm black from reading as flat digital black.
 */
export function Grain({ opacity = 0.16, blend = "overlay" as const }) {
  return (
    <div
      aria-hidden="true"
      style={{
        position: "absolute",
        inset: 0,
        pointerEvents: "none",
        opacity,
        mixBlendMode: blend,
        backgroundImage:
          "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.82' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")",
        backgroundSize: "220px 220px",
      }}
    />
  );
}

/* ------------------------------------------------------------------ *
 * Media
 * ------------------------------------------------------------------ */

/**
 * A piece of client work.
 *
 * With a `src` it is a muted, looping, inline-playing video that only starts
 * once it is on screen. Without one — which is how the site ships until real
 * footage is dropped in — it renders a deterministic cinematic gradient
 * derived from `seed`, so every tile in a mosaic looks different but the set
 * still reads as one palette. Swap `src` in and nothing else changes.
 */
export function MediaTile({
  src,
  poster,
  seed = 0,
  caption,
  play = true,
  radius = 0,
  style,
  children,
}: {
  src?: string;
  poster?: string;
  seed?: number;
  caption?: string;
  play?: boolean;
  radius?: number;
  style?: CSSProperties;
  children?: ReactNode;
}) {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Pasted into Framer there is no stylesheet; the drift keyframe comes from here.
  useEffect(injectStrideStyles, []);

  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    if (play) {
      // Autoplay can still be refused (data saver, battery); a paused poster
      // is an acceptable outcome, an unhandled rejection is not.
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  }, [play, src]);

  // Golden-angle hue walk keeps neighbouring tiles distinct but related.
  const hue = (12 + seed * 37.5) % 360;
  const warm = hue > 40 && hue < 300 ? 348 : hue; // pull strays back toward ruby
  const fallback: CSSProperties = {
    backgroundImage: `
      radial-gradient(120% 90% at ${20 + ((seed * 23) % 60)}% ${15 + ((seed * 31) % 50)}%, ${hexA(color.rubyBright, 0.5)} 0%, transparent 55%),
      radial-gradient(100% 120% at ${70 - ((seed * 17) % 50)}% ${85 - ((seed * 13) % 45)}%, hsla(${warm}, 62%, 42%, 0.45) 0%, transparent 60%),
      linear-gradient(${140 + ((seed * 47) % 80)}deg, ${color.ink} 0%, ${color.rubyDeep} 130%)
    `,
    backgroundColor: color.ink,
  };

  return (
    <div
      style={{
        position: "relative",
        overflow: "hidden",
        borderRadius: radius,
        background: color.ink,
        ...style,
      }}
    >
      {src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : (
        <div
          className="stride-drift"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: "-12%",
            ...fallback,
            animationDelay: `${-(seed % 12) * 1.7}s`,
            animationPlayState: play ? "running" : "paused",
          }}
        />
      )}
      {!src && <Grain opacity={0.2} />}
      {caption && (
        <div
          style={{
            position: "absolute",
            left: 12,
            bottom: 10,
            ...microLabel,
            fontSize: 9,
            color: hexA("#FFFFFF", 0.7),
            textShadow: "0 1px 8px rgba(0,0,0,0.6)",
          }}
        >
          {caption}
        </div>
      )}
      {children}
    </div>
  );
}
