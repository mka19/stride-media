import { createElement, useMemo } from "react";
import type { CSSProperties, ElementType } from "react";
import { gsap, useGsapContext } from "./gsap";

/**
 * Trionn-style text reveal: the line is split into words, each sitting in its
 * own clipping box, and they rise into place one after another as the text
 * comes into view.
 *
 * Words rather than characters: at display sizes a per-character stagger
 * reads as a effect applied to type, where per-word reads as the sentence
 * arriving. The mask is what sells it — without the clip the words fade in
 * rather than appearing from behind an edge.
 *
 * Fires once on enter rather than on a scrub, so it is safe to use inside a
 * section whose own timeline is scrubbed, as long as no ancestor is
 * animating the same property.
 */
export default function RevealText({
  children,
  as = "div",
  delay = 0,
  stagger = 0.045,
  duration = 0.85,
  start = "top 85%",
  style,
  className,
}: {
  children: string;
  as?: ElementType;
  delay?: number;
  stagger?: number;
  duration?: number;
  /** ScrollTrigger start; loosen it for text that sits low in its section. */
  start?: string;
  style?: CSSProperties;
  className?: string;
}) {
  const words = useMemo(() => children.split(" "), [children]);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".rv-word"), { yPercent: 116 });
      gsap.to(q(".rv-word"), {
        yPercent: 0,
        duration,
        delay,
        stagger,
        ease: "power3.out",
        scrollTrigger: { trigger: root, start, once: true },
      });
    },
    [children],
    (root) => gsap.set(gsap.utils.selector(root)(".rv-word"), { yPercent: 0 }),
  );

  return createElement(
    as,
    { ref: rootRef, className, style: { ...style, margin: 0 } },
    words.map((word, i) => (
      // The wrapper clips; the inner span is what moves. The trailing space
      // lives outside the clip so the line still breaks naturally.
      <span key={i} style={{ display: "inline-block", overflow: "hidden", verticalAlign: "bottom" }}>
        <span className="rv-word" style={{ display: "inline-block", willChange: "transform" }}>
          {word}
          {i < words.length - 1 ? " " : ""}
        </span>
      </span>
    )),
  );
}
