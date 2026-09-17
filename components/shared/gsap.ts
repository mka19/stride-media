/**
 * One registration point for GSAP + ScrollTrigger.
 *
 * Every pinned sequence in the site (Problem, Solution, How It Works, Case
 * Study, Why Stride, Testimonials, FAQ) goes through this module so plugin
 * registration happens exactly once, and so each component can build its
 * timeline inside a context that cleans itself up on unmount — which is what
 * Framer's canvas needs when it re-renders a code component on every edit.
 */
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useLayoutEffect, useRef, type RefObject } from "react";

let registered = false;
if (typeof window !== "undefined" && !registered) {
  gsap.registerPlugin(ScrollTrigger);
  // Mobile browsers fire resize as the URL bar hides and shows, which
  // recalculates every trigger mid-scroll and makes pinned sections jump.
  ScrollTrigger.config({ ignoreMobileResize: true });
  registered = true;
}

export { gsap, ScrollTrigger };

/**
 * One scrub value for the whole site.
 *
 * Scrub is how long a scrubbed timeline takes to catch up with the scroll
 * position, and it is the single biggest contributor to how the page feels
 * under a wheel. Sections used to pick their own between 0.6 and 1.3, so the
 * weight of the scroll changed every time one ended — the page felt tight in
 * one and loose in the next. One value everywhere means the whole document
 * carries the same inertia.
 *
 * A scrubbed timeline reaches its target this many seconds after the scroll
 * does, and that lag is the main lever against the page reading as too
 * reactive. At 1 the sections tracked the wheel almost exactly, so a small
 * wheel movement produced an immediate, equally small jump in every
 * animation at once — which is what "everything fires the moment I touch the
 * wheel" actually is.
 *
 * 1.9 puts nearly two seconds of damping between the input and the motion.
 * Every scroll is still answered — nothing is ignored or thresholded away —
 * but it arrives on a curve instead of a step, which is the difference
 * between the user dragging the page and the page gliding.
 *
 * Deliberately not higher. Past roughly 2.5 the lag stops reading as weight
 * and starts reading as the page not listening: smooth and weighted, never
 * floaty.
 */
export const SCRUB = 0.42;

/**
 * The shared reveal vocabulary. Everything that arrives does so the same
 * way, and everything that leaves is the exact inverse of arriving, so a
 * section read backwards looks like the section read forwards in reverse
 * rather than like a different animation.
 */
export const reveal = {
  /*
   * 16px, down from 24.
   *
   * Editorial typography settles; it does not fly in. At 24 the movement
   * announced itself — you watched the text travel. At 16 it registers as
   * the text arriving without the eye tracking the journey, which is the
   * whole intent.
   */
  y: 16,
  /*
   * expo.out, not power2.out.
   *
   * This is GSAP's match for cubic-bezier(0.16, 1, 0.3, 1): almost all of
   * the distance is covered immediately and the last few pixels take the
   * rest of the time. That long tail is what makes movement feel like it
   * has mass and is coming to rest, rather than simply stopping when its
   * duration runs out. power2 decelerates far too evenly to read as weight.
   */
  ease: "expo.out",
  easeIn: "expo.in",
  easeBoth: "power3.inOut",
  /*
   * The stagger between meaningful elements in one group.
   *
   * Enough to establish an order, short enough that the group still reads
   * as one event rather than as a queue of separate arrivals.
   */
  stagger: 0.1,
} as const;

/**
 * An explicit override for the reduced-motion preference, read once from
 * `?motion=on` / `?motion=off` and then remembered for the tab.
 *
 * Windows turns "Animation effects" off by default on a lot of machines, and
 * Edge and Chrome report that as `prefers-reduced-motion: reduce` — which
 * switched off every scroll sequence on this site at once and made the whole
 * build look broken rather than calm. Honouring the setting is still the
 * default; this only exists so the site can be demonstrated on a machine that
 * has it on without asking anyone to go and change their OS settings.
 */
function motionOverride(): boolean | null {
  try {
    const param = new URLSearchParams(window.location.search).get("motion");
    if (param === "on" || param === "off") {
      window.sessionStorage.setItem("stride-motion", param);
      return param === "on";
    }
    const saved = window.sessionStorage.getItem("stride-motion");
    if (saved === "on" || saved === "off") return saved === "on";
  } catch {
    // Private mode, or storage blocked: fall through to the OS preference.
  }
  return null;
}

/**
 * True when the scroll choreography should be skipped.
 *
 * The OS setting is honoured again. It was ignored for a while because
 * following it silently produced a broken page rather than a calm one: the
 * Problem's dark statement chapter never rendered, and every pinned section
 * painted all of its chapters on top of each other. The cause was the
 * fallback, not the preference — a pinned layout with its timeline removed
 * has nothing left to separate its chapters.
 *
 * That is fixed at the layout level now: `useStacked()` is true under reduced
 * motion, so these sections render the flow layout they already have for
 * phones — same chapters, same copy, in order, as ordinary blocks. Nothing is
 * hidden and nothing overlaps, which is what the preference actually asks
 * for. `?motion=on` still forces the full choreography for a demo.
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return true;
  return motionOverride() === false;
}

/**
 * Scoped GSAP context bound to a container ref.
 *
 * `build` runs after layout, receives the container element, and anything it
 * animates or triggers is reverted when the component unmounts. When reduced
 * motion is on, `build` is skipped entirely and `staticFallback` runs instead
 * so the section still reads correctly without any scroll choreography.
 */
export function useGsapContext(
  build: (root: HTMLElement, ctx: gsap.Context) => void,
  deps: unknown[] = [],
  staticFallback?: (root: HTMLElement) => void,
): RefObject<HTMLDivElement | null> {
  const ref = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    const root = ref.current;
    if (!root) return;

    if (prefersReducedMotion()) {
      staticFallback?.(root);
      return;
    }

    const ctx = gsap.context((self) => build(root, self), root);
    // Sections below the fold measure wrong until fonts and media settle.
    const refresh = () => ScrollTrigger.refresh();
    const t = window.setTimeout(refresh, 250);
    window.addEventListener("load", refresh);
    // Web fonts can settle after `load`, and a headline reflowing by a line
    // moves every trigger below it.
    void document.fonts?.ready.then(refresh);

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}

/**
 * The overlap between one section leaving and the next arriving.
 *
 * Without this a pinned section's first trigger is `top top`, which means it
 * sits completely inert until the instant its top edge reaches the top of the
 * window — and then its whole sequence begins at once. The previous section
 * has finished and left by then, so nothing is ever on screen mid-movement
 * and the page reads as slides changing rather than as a camera moving
 * through it. Solution and HowItWorks already had an approach of their own;
 * Problem, CaseStudy, WhyStride and FAQ began cold.
 *
 * The window is the viewport-height of scroll before the section pins, which
 * is exactly the stretch where both sections are on screen together: the
 * outgoing one is still leaving while this one resolves underneath it.
 *
 * Deliberately one property.
 *
 * Not a translate — these frames are `position: sticky` inside
 * `overflow: hidden`, so moving one vertically opens a gap at the edge it
 * moves away from. And not a scale, which on a full-bleed frame reads as the
 * page zooming rather than as the section arriving. A fade covers it, costs a
 * composite rather than a layout, and cannot possibly disagree with the
 * layout underneath.
 *
 * From 0.55 rather than from 0. This is supporting movement: it should be
 * felt as the section resolving into place, not watched as a black rectangle
 * filling in.
 *
 * The target must be an element the section's own pinned timeline never
 * touches. Two scrubbed timelines writing the same property fight, and
 * whichever updated last wins — which shows up as flicker at the boundary
 * rather than as an error.
 */
export function approach(root: HTMLElement, selector: string) {
  const el = root.querySelector<HTMLElement>(selector);
  if (!el) return;
  gsap.set(el, { opacity: 0.55 });
  gsap.to(el, {
    opacity: 1,
    ease: "none",
    scrollTrigger: {
      trigger: root,
      start: "top bottom",
      /*
       * Finished a quarter of a viewport before the section pins, not at it.
       *
       * Ending on "top top" looks right and measures wrong. A scrubbed tween
       * reaches its target SCRUB seconds after the scroll does, so a fade
       * that is only told to finish at the pin is still catching up for
       * nearly two seconds afterwards — the section takes the screen and
       * spends its whole first beat visibly dim. Probing it found frames
       * sitting at 0.79 while pinned.
       *
       * Ending early gives the scrub the last stretch of approach to settle
       * in, so the section is already at full strength by the time it owns
       * the screen.
       */
      end: "top 25%",
      scrub: SCRUB,
      invalidateOnRefresh: true,
    },
  });
}
