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
 */
export const SCRUB = 1;

/**
 * The shared reveal vocabulary. Everything that arrives does so the same
 * way, and everything that leaves is the exact inverse of arriving, so a
 * section read backwards looks like the section read forwards in reverse
 * rather than like a different animation.
 */
export const reveal = {
  y: 24,
  ease: "power2.out",
  easeIn: "power2.in",
  easeBoth: "power2.inOut",
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
 * This deliberately does NOT follow the OS setting on its own. Windows ships
 * with "Animation effects" off on a lot of machines and Edge reports that as
 * `prefers-reduced-motion: reduce`, so following it silently meant a large
 * share of visitors — the owner of this site included — got a page where the
 * Problem's dark statement chapter never rendered at all and every pinned
 * section painted all of its states on top of each other. That is not a calm
 * version of the design; it is a broken one.
 *
 * Motion is on unless it is turned off explicitly, with `?motion=off`, which
 * is remembered for the tab. Honouring the OS preference again is a matter of
 * making each static fallback lay its section out correctly first — until
 * then, the fallback is worse than the animation it replaces.
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

    return () => {
      window.clearTimeout(t);
      window.removeEventListener("load", refresh);
      ctx.revert();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return ref;
}
