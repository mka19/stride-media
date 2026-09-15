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
  return bp === "mobile" && !canHover;
}

/** Phones get a fraction of the particle and vertex counts. */
export function detailFor(bp: Breakpoint): number {
  if (bp === "mobile") return 0.35;
  if (bp === "tablet") return 0.65;
  return 1;
}
