import { createElement, useEffect, useRef, useState } from "react";
import type { CSSProperties, ElementType } from "react";
import { useInView } from "./useInView";
import { prefersReducedMotion } from "./gsap";

const GLYPHS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&/<>*+";

/**
 * Decode reveal: each character cycles through random glyphs before locking
 * to the real one, left to right.
 *
 * Driven from one animation frame loop over the whole string rather than a
 * timer per character — a headline is 20 to 40 characters, and that many
 * intervals all firing independently is both jittery and wasteful.
 *
 * Spaces never scramble. Cycling them makes a headline look like it has the
 * wrong word count until it settles, which reads as broken rather than as
 * decoding.
 */
export default function ScrambleText({
  children,
  as = "span",
  /** Leave unset to fire on scroll into view; pass a flag to drive it. */
  play,
  stagger = 35,
  settle = 520,
  style,
  className,
}: {
  children: string;
  as?: ElementType;
  play?: boolean;
  /** Delay between characters starting, ms. */
  stagger?: number;
  /** How long one character spends scrambling before it locks, ms. */
  settle?: number;
  style?: CSSProperties;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLElement>({ threshold: 0.35 });
  const [shown, setShown] = useState(children);
  const raf = useRef(0);

  const started = play === undefined ? inView : play;

  useEffect(() => {
    if (!started) return;

    if (prefersReducedMotion()) {
      setShown(children);
      return;
    }

    const chars = [...children];
    const start = performance.now();
    // The last character starts last and still needs its full settle.
    const total = chars.length * stagger + settle;

    const tick = (now: number) => {
      const elapsed = now - start;
      let out = "";

      for (let i = 0; i < chars.length; i++) {
        const real = chars[i];
        if (real === " " || real === " ") {
          out += real;
          continue;
        }
        const began = i * stagger;
        if (elapsed < began) {
          // Not started: blank rather than a glyph, so the line grows into
          // place instead of arriving as a wall of noise.
          out += " ";
        } else if (elapsed < began + settle) {
          out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        } else {
          out += real;
        }
      }

      setShown(out);
      if (elapsed < total) raf.current = requestAnimationFrame(tick);
      else setShown(children);
    };

    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [started, children, stagger, settle]);

  return createElement(
    as,
    {
      ref,
      className,
      style,
      // The real string is what assistive tech reads; the scramble is decor.
      "aria-label": children,
      children: <span aria-hidden="true">{shown}</span>,
    },
  );
}
