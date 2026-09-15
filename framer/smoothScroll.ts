import Lenis from "lenis";
import { gsap, ScrollTrigger, prefersReducedMotion } from "./gsap";

/**
 * Smooth scroll.
 *
 * Lenis and ScrollTrigger both want to be the thing that decides when the
 * page has moved. Left alone they run on separate clocks and every pinned
 * section drifts a frame or two behind the scroll. Wiring them together is
 * the whole job here:
 *
 *   - Lenis is driven from GSAP's ticker, so both advance on one clock.
 *   - ScrollTrigger.update runs on Lenis's scroll event, so triggers read
 *     the eased position rather than the raw one.
 *   - GSAP's lag smoothing is turned off, because Lenis is already doing the
 *     smoothing and the two together overshoot.
 *
 * Lenis drives the window scroller, so no scrollerProxy is needed and every
 * existing trigger keeps working untouched.
 *
 * Returns a teardown, and does nothing at all under prefers-reduced-motion:
 * easing the page away from the visitor's input is exactly what that setting
 * asks us not to do.
 */
/** Sticky nav height: anchored sections stop below the bar, not under it. */
const NAV_OFFSET = 88;

export function initSmoothScroll(): () => void {
  if (typeof window === "undefined") return () => {};
  if (prefersReducedMotion()) return () => {};

  const lenis = new Lenis({
    duration: 1.2,
    // Heavy at the start, long settle — the weightless feel comes from the
    // tail of this curve, not from the duration.
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    // Touch devices already have their own momentum; adding ours fights it.
    syncTouch: false,
  });

  const onScroll = () => ScrollTrigger.update();
  lenis.on("scroll", onScroll);

  // In-page anchors have to go through Lenis. Left to the browser they jump
  // the native scroller while Lenis holds its own position, and the two
  // disagree until the next wheel event — which shows up as scrubbed
  // sections resolving at the wrong point in their timeline.
  const onClick = (e: MouseEvent) => {
    const link = (e.target as HTMLElement | null)?.closest?.('a[href^="#"]');
    const href = link?.getAttribute("href");
    if (!href || href === "#") return;
    const target = document.querySelector(href);
    if (!target) return;
    e.preventDefault();
    lenis.scrollTo(target as HTMLElement, { offset: -NAV_OFFSET });
  };
  document.addEventListener("click", onClick);

  const raf = (time: number) => lenis.raf(time * 1000);
  gsap.ticker.add(raf);
  gsap.ticker.lagSmoothing(0);

  return () => {
    document.removeEventListener("click", onClick);
    lenis.off("scroll", onScroll);
    gsap.ticker.remove(raf);
    gsap.ticker.lagSmoothing(500, 33);
    lenis.destroy();
  };
}
