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
  // A solid accent ahead of the sweep, not a wash: the reveal reads as a
  // band of purple pushing across and leaving the finished colour behind it.
  const tint = tone === "light" ? hexA(color.accent, 0.85) : color.accent;
  const paint = useRef<((p: number) => void) | null>(null);

  const rootRef = useGsapContext(
    (root) => {
      // −24 → 124 rather than 0 → 100: the edge has width, so the sweep has
      // to start and finish outside the box for the first and last letters to
      // be fully purple and fully resolved.
      const write = (p: number) => {
        root.style.backgroundImage = `linear-gradient(95deg, ${final} 0%, ${final} ${p - 5}%, ${tint} ${p + 3}%, ${tint} 100%)`;
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
        // The fill is clipped to the glyphs and painted only inside the
        // element's box. At a line-height under 1 the descenders hang outside
        // that box, get no paint, and read as cropped — the tail of a g
        // simply missing. The padding gives the box room for them.
        paddingBottom: "0.14em",
        backgroundImage: `linear-gradient(95deg, ${final} 0%, ${final} -29%, ${tint} -21%, ${tint} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      },
    },
    children,
  );
}
