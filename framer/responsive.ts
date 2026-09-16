import { useEffect, useState } from "react";

/**
 * Breakpoints and input capability.
 *
 * Sections use these to decide structure, not just size: below the tablet
 * breakpoint the pinned, scrubbed sequences are replaced by ordinary
 * sequential scroll rather than being shrunk, because pinning is what janks
 * on real phone hardware and disorients on a small screen.
 */
export type Breakpoint = "mobile" | "tablet" | "laptop" | "desktop";

const QUERIES: [Breakpoint, string][] = [
  ["desktop", "(min-width: 1920px)"],
  ["laptop", "(min-width: 1440px)"],
  ["tablet", "(min-width: 769px)"],
];

function read(): Breakpoint {
  if (typeof window === "undefined" || !window.matchMedia) return "desktop";
  for (const [name, query] of QUERIES) {
    if (window.matchMedia(query).matches) return name;
  }
  return "mobile";
}

export function useBreakpoint(): Breakpoint {
  // Server and first paint assume desktop; the effect corrects immediately.
  const [bp, setBp] = useState<Breakpoint>(read);

  useEffect(() => {
    const lists = QUERIES.map(([, q]) => window.matchMedia(q));
    const onChange = () => setBp(read());
    lists.forEach((l) => l.addEventListener("change", onChange));
    onChange();
    return () => lists.forEach((l) => l.removeEventListener("change", onChange));
  }, []);

  return bp;
}

/** True only where a real pointer can hover — not inferred from width. */
export function useCanHover(): boolean {
  const [can, setCan] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(hover: hover) and (pointer: fine)");
    const onChange = () => setCan(mq.matches);
    mq.addEventListener("change", onChange);
    onChange();
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return can;
}

/**
 * True when a section should drop its pinned, scrubbed sequence for ordinary
 * sequential scroll.
 *
 * Width alone was the wrong test. Pinning is dropped because it janks on
 * phone hardware and disorients on a small touch screen — not because a
 * window is narrow. A desktop browser in a narrow panel, which is how this
 * build is previewed, was being handed the phone layout: no pinned Problem
 * chapter at all, and What We Do and How It Works static, which reads as a
 * missing section and two frozen ones.
 *
 * So it takes both: a small viewport AND no real pointer.
 */
export function useStacked(): boolean {
  const bp = useBreakpoint();
  const canHover = useCanHover();
  // Called before the test, never inside it: `||` short-circuits, and a hook
  // that runs on some renders and not others corrupts the hook order.
  const reduce = useReducedMotion();
  // Reduced motion takes the same road. Every one of these sections already
  // has a flow layout for phones — the same chapters, in order, as ordinary
  // blocks — and that is exactly what "present the final readable state"
  // asks for. Trying instead to leave the pinned layout standing and simply
  // not animate it is what broke before: a pinned frame with no timeline
  // paints all of its chapters on top of each other.
  return (bp === "mobile" && !canHover) || reduce;
}

/**
 * The visitor's motion preference, live.
 *
 * `prefersReducedMotion()` in shared/gsap.ts is the same decision read once
 * for an imperative timeline; this is the version a component can render
 * from, and it re-renders if the preference changes under it.
 */
export function useReducedMotion(): boolean {
  const [reduce, setReduce] = useState(() => readReduce());

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReduce(readReduce());
    mq.addEventListener("change", onChange);
    onChange();
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return reduce;
}

function readReduce(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  // `?motion=on` / `?motion=off` still wins, so the build can be shown on a
  // machine with the OS setting on without touching that machine's settings.
  try {
    const param = new URLSearchParams(window.location.search).get("motion");
    const saved = window.sessionStorage.getItem("stride-motion");
    const choice = param === "on" || param === "off" ? param : saved;
    if (choice === "on") return false;
    if (choice === "off") return true;
  } catch {
    // Storage blocked: fall through to the OS preference.
  }
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/**
 * True when the bar is wide enough for the full section rail.
 *
 * The breakpoints are about layout structure; this is about one row of eight
 * links fitting. Between 861 and 1439 the old rule said "not mobile, show
 * them", and each link is nowrap with flex: 1 — so they ran into each other
 * rather than shrinking. Eight labels plus the mark plus the CTA need about
 * 1200px before they stop colliding.
 */
export function useNavRoom(): boolean {
  const [room, setRoom] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1200px)");
    const onChange = () => setRoom(mq.matches);
    mq.addEventListener("change", onChange);
    onChange();
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return room;
}

/** Phones get a fraction of the particle and vertex counts. */
export function detailFor(bp: Breakpoint): number {
  if (bp === "mobile") return 0.35;
  if (bp === "tablet") return 0.65;
  return 1;
}
