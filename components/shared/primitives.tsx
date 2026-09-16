import { type CSSProperties, type ReactNode, useEffect, useId, useRef } from "react";
import { color, ease, hexA, space, typeScale } from "./theme";
import { injectStrideStyles } from "./styles";
import SmearLabel from "./SmearLabel";

/* ------------------------------------------------------------------ *
 * Brand mark
 * ------------------------------------------------------------------ */

/**
 * The Stride mark: a forward-leaning aperture. Used in the nav, the How It
 * Works transition flash, the Case Study logo card and the footer anchor.
 * Pure SVG so it can glow, rotate and scale without a raster asset.
 */
/**
 * The mark, flat.
 *
 * The same five paths the hero extrudes into 3D — four corner forms around a
 * concave four-point star — so the logo in the bar and the object on the
 * screen are one drawing rather than two that resemble each other. The
 * viewBox is the artboard's own, untouched, because the shape is the client's
 * and nothing here should be redrawing it.
 *
 * It is filled, not stroked: `tint` is the fill. The old mark was a stroked
 * circle and chevron, which is why the prop used to be called `stroke`.
 */
/**
 * The mark, flat.
 *
 * The same five paths the hero extrudes into 3D — four corner forms around a
 * concave four-point star — so the logo in the bar and the object on the
 * screen are one drawing rather than two that resemble each other. The
 * viewBox is the artboard's own, untouched, because the shape is the client's
 * and nothing here should be redrawing it.
 *
 * `metal` is the default and gives it the same polished silver the hero
 * object has: a gradient running from a lit top-left to a dark lower right,
 * a bright edge along the top, and a shadow under it. At 26px there is no
 * room for real shading, and none is needed — a metal surface reads as metal
 * from the direction of its falloff more than from any detail in it.
 *
 * `tint` paints it flat in one colour instead, for anywhere the gradient
 * would be wrong.
 */
export function StrideMark({
  size = 40,
  tint,
  glowing = false,
  style,
}: {
  size?: number;
  /** A flat colour. Left unset, the mark is silver. */
  tint?: string;
  glowing?: boolean;
  style?: CSSProperties;
}) {
  const id = useId().replace(/:/g, "");
  const fill = tint ?? `url(#${id}-metal)`;

  return (
    <svg
      width={size}
      height={size}
      viewBox="19 12.25 80 80"
      aria-hidden="true"
      style={{
        display: "block",
        overflow: "visible",
        filter: glowing
          ? tint
            ? `drop-shadow(0 0 10px ${hexA(tint, 0.6)})`
            : // Silver does not glow; it catches light and casts a shadow.
              `drop-shadow(0 1px 1px ${hexA("#000000", 0.55)}) drop-shadow(0 0 14px ${hexA(color.accent, 0.3)})`
          : undefined,
        ...style,
      }}
    >
      <defs>
        <linearGradient id={`${id}-metal`} x1="0" y1="0" x2="0.65" y2="1">
          <stop offset="0%" stopColor="#FFFFFF" />
          <stop offset="34%" stopColor="#E4E6EC" />
          <stop offset="56%" stopColor="#9AA0AE" />
          <stop offset="78%" stopColor="#C9CDD8" />
          <stop offset="100%" stopColor="#6E7482" />
        </linearGradient>
      </defs>

      <g fill={fill}>
        <path d="M 28 44 L 28 32 L 36 24 L 49 24 L 41 32 L 38 32 L 35.5 34.5 L 35.5 37 Z" />
        <path d="M 90 44 L 90 32 L 82 24 L 69 24 L 77 32 L 80 32 L 82.5 34.5 L 82.5 37 Z" />
        <path d="M 28 60.5 L 28 72.5 L 36 80.5 L 49 80.5 L 41 72.5 L 38 72.5 L 35.5 70 L 35.5 67.5 Z" />
        <path d="M 90 60.5 L 90 72.5 L 82 80.5 L 69 80.5 L 77 72.5 L 80 72.5 L 82.5 70 L 82.5 67.5 Z" />
        <path d="M 59 37.25 C 59 48.5 62.75 52.25 74 52.25 C 62.75 52.25 59 56 59 67.25 C 59 56 55.25 52.25 44 52.25 C 55.25 52.25 59 48.5 59 37.25 Z" />
      </g>
    </svg>
  );
}

/* ------------------------------------------------------------------ *
 * Type
 * ------------------------------------------------------------------ */

/**
 * Every label and eyebrow on the site: a filled tag with two ticks after it,
 * optionally preceded by its number in an outlined box.
 *
 * One component rather than a style guideline, so the treatment cannot drift
 * between sections — there are labels in eleven of them.
 */
export function MicroLabel({
  children,
  tone = "dark",
  number,
  className,
  style,
}: {
  children: ReactNode;
  /** Which surface the tag sits on. */
  tone?: "dark" | "light" | "accent";
  /** Shown in its own outlined box ahead of the label. */
  number?: string;
  className?: string;
  style?: CSSProperties;
}) {
  const onLight = tone === "light";
  return (
    <span
      className={className}
      style={{ display: "inline-flex", alignItems: "stretch", gap: 2, ...style }}
    >
      {number && (
        <span
          style={{
            ...typeScale.eyebrow,
            display: "inline-flex",
            alignItems: "center",
            padding: `${space.xs}px ${space.sm}px`,
            color: color.accentOnDark,
            background: hexA(color.accent, 0.16),
          }}
        >
          {number}
        </span>
      )}
      <span
        style={{
          ...typeScale.eyebrow,
          display: "inline-flex",
          alignItems: "center",
          padding: `${space.xs}px ${space.s}px`,
          background: color.accent,
          color: onLight ? "#FFFFFF" : color.textOnDark,
        }}
      >
        {children}
      </span>
      <span style={{ width: 3, background: hexA(color.accent, 0.55) }} />
      <span style={{ width: 3, background: hexA(color.accent, 0.3) }} />
    </span>
  );
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

  /*
   * The solid button is bone with dark type, not accent with white — a light
   * plate is what carries a smear: the letters have somewhere to move
   * against. An 8px radius rather than a pill, so it reads as a plate and
   * not as a tag.
   */
  const base: CSSProperties = {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: space.s,
    height: 48,
    padding: `0 ${space.lg}px`,
    borderRadius: 8,
    border: solid ? "none" : `1px solid ${color.hairlineOnDark}`,
    cursor: "pointer",
    textDecoration: "none",
    overflow: "hidden",
    ...typeScale.eyebrow,
    fontWeight: 500,
    background: solid ? color.boneSoft : "transparent",
    color: solid ? color.textOnLight : color.textOnDark,
    transition: `background ${ease.hoverMs}ms ${ease.hover}, color ${ease.hoverMs}ms ${ease.hover}, border-color ${ease.hoverMs}ms ${ease.hover}, transform ${ease.pressMs}ms ${ease.out}`,
    ...style,
  };

  const hoverIn = (el: HTMLElement) => {
    if (solid) {
      el.style.background = "#FFFFFF";
    } else {
      el.style.background = hexA("#FFFFFF", 0.06);
      el.style.borderColor = hexA("#FFFFFF", 0.3);
    }
  };
  const hoverOut = (el: HTMLElement) => {
    el.style.background = base.background as string;
    if (!solid) el.style.borderColor = color.hairlineOnDark;
  };

  const handlers = {
    onMouseEnter: (e: React.MouseEvent<HTMLElement>) => hoverIn(e.currentTarget),
    onMouseLeave: (e: React.MouseEvent<HTMLElement>) => hoverOut(e.currentTarget),
    onFocus: (e: React.FocusEvent<HTMLElement>) => hoverIn(e.currentTarget),
    onBlur: (e: React.FocusEvent<HTMLElement>) => hoverOut(e.currentTarget),
  };

  const label = typeof children === "string" ? <SmearLabel>{children}</SmearLabel> : children;

  const inner = (
    <>
      {label}
      {arrow && <ArrowIcon />}
    </>
  );

  return href ? (
    <a href={href} className="stride-press" style={base} {...handlers}>
      {inner}
    </a>
  ) : (
    <button type="button" className="stride-press" onClick={onClick} style={base} {...handlers}>
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
/**
 * Which element a source wants.
 *
 * Every slot on this site was a video, so a still handed to one rendered an
 * empty <video> — a black rectangle with no error. Judging it by extension is
 * crude but it is the only thing available without a network request, and it
 * covers what anyone actually drops in. A source with no extension, or a
 * query string on the end, falls through to video, which is the common case.
 */
function isImage(src: string) {
  return /\.(jpe?g|png|webp|avif|gif|svg)(\?|#|$)/i.test(src);
}

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
  const hue = (262 + seed * 37.5) % 360;
  // Strays get pulled back toward the accent rather than drifting off-brand.
  const violet = hue > 300 || hue < 220 ? 262 : hue;
  const fallback: CSSProperties = {
    backgroundImage: `
      radial-gradient(120% 90% at ${20 + ((seed * 23) % 60)}% ${15 + ((seed * 31) % 50)}%, ${hexA(color.accentBright, 0.5)} 0%, transparent 55%),
      radial-gradient(100% 120% at ${70 - ((seed * 17) % 50)}% ${85 - ((seed * 13) % 45)}%, hsla(${violet}, 62%, 46%, 0.45) 0%, transparent 60%),
      linear-gradient(${140 + ((seed * 47) % 80)}deg, ${color.ink} 0%, ${color.accentDeep} 130%)
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
      {src && isImage(src) ? (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
        />
      ) : src ? (
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted
          loop
          playsInline
          preload="metadata"
          // Nothing below the fold decodes until it is near the viewport.
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          {...({ loading: "lazy" } as any)}
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
            left: space.s,
            bottom: space.s,
            ...typeScale.eyebrow,
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
