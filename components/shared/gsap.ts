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

/** True when the visitor has asked for reduced motion, or we're server-side. */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return true;
  const forced = motionOverride();
  if (forced !== null) return !forced;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
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
