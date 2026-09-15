import { createElement, useRef } from "react";
import type { CSSProperties, ElementType } from "react";
import { gsap, useGsapContext } from "./gsap";
import { color, hexA } from "./theme";

/**
 * A headline whose fill sweeps in as it arrives — wearedirect.co "Featured
 * Projects" reference. The letters start in a soft accent tint and turn to
 * their final colour left to right, so the line reads as being written in
 * rather than as a block of type fading up.
 *
 * The sweep is one gradient across the whole element, clipped to the glyphs,
 * so a two-line headline wipes as a single object rather than line by line.
 *
 * The gradient string is rewritten each frame from a tweened proxy rather
 * than animating a CSS custom property: a registered `@property` would be
 * cheaper, but it is not available everywhere this has to run, and without
 * registration a custom property is a string the browser will not
 * interpolate — the sweep would jump rather than travel.
 */
export default function GradientRevealText({
  children,
  as = "div",
  tone = "dark",
  start = "top 92%",
  end = "top 45%",
  style,
  className,
}: {
  children: string;
  as?: ElementType;
  /** Which ground it sits on — decides the colour it resolves to. */
  tone?: "dark" | "light";
  /** The sweep is tied to these two scroll points, not to a clock. */
  start?: string;
  end?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const final = tone === "light" ? color.textOnLight : color.textOnDark;
  const tint = hexA(color.accent, tone === "light" ? 0.42 : 0.55);
  const paint = useRef<((p: number) => void) | null>(null);

  const rootRef = useGsapContext(
    (root) => {
      // −24 → 124 rather than 0 → 100: the soft edge is 20% wide, so the
      // sweep has to start and finish outside the box for the first and last
      // letters to be fully tinted and fully resolved.
      const write = (p: number) => {
        root.style.backgroundImage = `linear-gradient(95deg, ${final} 0%, ${final} ${p - 14}%, ${tint} ${p + 6}%, ${tint} 100%)`;
      };
      paint.current = write;
      write(-24);

      // Scrubbed rather than fired once: in the reference the fill resolves
      // as the line travels up the viewport, so a half-swept headline is a
      // state you can stop on. A timed tween finishes in a few hundred
      // milliseconds and is over before the line has finished arriving.
      const sweep = { p: -24 };
      gsap.to(sweep, {
        p: 124,
        ease: "none",
        onUpdate: () => write(sweep.p),
        scrollTrigger: { trigger: root, start, end, scrub: 0.5 },
      });
    },
    [children, tone, start, end],
    (root) => {
      root.style.backgroundImage = `linear-gradient(95deg, ${final} 0%, ${final} 100%)`;
    },
  );

  return createElement(
    as,
    {
      ref: rootRef,
      className,
      style: {
        ...style,
        margin: 0,
        backgroundImage: `linear-gradient(95deg, ${final} 0%, ${final} -38%, ${tint} -18%, ${tint} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      },
    },
    children,
  );
}
