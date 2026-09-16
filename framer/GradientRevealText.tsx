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
  start = "top 86%",
  style,
  className,
}: {
  children: string;
  as?: ElementType;
  /** Which ground it sits on — decides the colour it resolves to. */
  tone?: "dark" | "light";
  /** Where the pass fires as the line comes into view. */
  start?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const final = tone === "light" ? color.textOnLight : color.textOnDark;
  // The type is its finished colour throughout. What moves is a narrow band
  // of accent passing over it — the text is never in a second colour waiting
  // to be resolved, which is what an unrevealed half looked like.
  const band = tone === "light" ? hexA(color.accent, 0.9) : color.accentBright;
  const paint = useRef<((p: number) => void) | null>(null);

  const rootRef = useGsapContext(
    (root) => {
      // −24 → 124 rather than 0 → 100: the edge has width, so the sweep has
      // to start and finish outside the box for the first and last letters to
      // be fully purple and fully resolved.
      const write = (p: number) => {
        root.style.backgroundImage = `linear-gradient(95deg, ${final} 0%, ${final} ${p - 11}%, ${band} ${p}%, ${final} ${p + 11}%, ${final} 100%)`;
      };
      paint.current = write;
      write(-18);

      // One pass as the line arrives, not tied to the scroll. A band that
      // tracks the scrollbar can be parked halfway across a word; a single
      // pass on entry reads as light moving over the type and leaves it in
      // its finished state whatever the visitor does next.
      const sweep = { p: -18 };
      gsap.to(sweep, {
        p: 118,
        duration: 1.5,
        ease: "power1.inOut",
        onUpdate: () => write(sweep.p),
        onComplete: () => {
          root.style.backgroundImage = `linear-gradient(95deg, ${final} 0%, ${final} 100%)`;
        },
        scrollTrigger: { trigger: root, start, once: true },
      });
    },
    [children, tone, start],
    (root) => {
      root.style.backgroundImage = `linear-gradient(95deg, ${final} 0%, ${final} 100%)`;
    },
  );

  return createElement(
    as,
    {
      ref: rootRef,
      className: className ? `stride-ink ${className}` : "stride-ink",
      style: {
        ...style,
        /*
         * A clipped gradient is painted only inside the element's box, so at
         * these line-heights the descenders hang outside it and read as
         * cropped — the tail of a g simply missing. The padding gives them
         * room.
         *
         * As a heading in its own right that is all it needs: the stylesheet
         * trims the half-leading off the box, and the padding replaces it
         * with exactly the descender room, which is how the 24px under a
         * headline stays 24. Used as one of several lines inside a heading
         * the padding would instead show up as extra leading between those
         * lines, so there it is taken straight back out again.
         */
        margin: as === "span" ? "0 0 -0.14em" : 0,
        paddingBottom: "0.14em",
        backgroundImage: `linear-gradient(95deg, ${final} 0%, ${final} 100%)`,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
        WebkitTextFillColor: "transparent",
      },
    },
    children,
  );
}
