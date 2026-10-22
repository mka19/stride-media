import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { StrideMark } from "./primitives";
import { color, ease } from "./theme";
import { prefersReducedMotion } from "./gsap";

type Phase = "enter" | "cover" | "reveal";

type TransitionState = {
  phase: Phase;
  label: string;
  x: number;
  y: number;
};

const visitedKey = "stride-session-loaded";

export default function PageTransition() {
  const [state, setState] = useState<TransitionState | null>(null);

  useEffect(() => {
    const follow = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const anchor = (event.target as Element | null)?.closest("a[href]") as HTMLAnchorElement | null;
      if (!anchor || anchor.target === "_blank" || anchor.hasAttribute("download")) return;
      const destination = new URL(anchor.href, window.location.href);
      if (destination.origin !== window.location.origin) return;
      if (destination.pathname === window.location.pathname && destination.search === window.location.search) return;
      if (prefersReducedMotion()) return;

      event.preventDefault();
      const label = anchor.textContent?.replace(/\s+/g, " ").trim() || "STRIDE MEDIA";
      setState({ phase: "enter", label, x: event.clientX || window.innerWidth / 2, y: event.clientY || window.innerHeight / 2 });
      window.requestAnimationFrame(() => setState((current) => current ? { ...current, phase: "cover" } : current));
      window.setTimeout(() => {
        sessionStorage.setItem(visitedKey, "1");
        window.location.assign(destination.href);
      }, 470);
    };
    document.addEventListener("click", follow);
    return () => document.removeEventListener("click", follow);
  }, []);

  if (!state) return null;

  return createPortal(
    <div aria-live="polite" aria-label={`Opening ${state.label}`} style={{
      position: "fixed", inset: 0, zIndex: 10000, display: "grid", placeItems: "center", overflow: "hidden",
      pointerEvents: "all", background: color.black,
      clipPath: state.phase === "enter" ? `circle(0 at ${state.x}px ${state.y}px)` : state.phase === "cover" ? `circle(150vmax at ${state.x}px ${state.y}px)` : "circle(0 at 50% 50%)",
      transition: state.phase === "reveal" ? "clip-path 680ms cubic-bezier(.16,1,.3,1)" : "clip-path 460ms cubic-bezier(.65,0,.35,1)",
      willChange: "clip-path",
    }}>
      <div style={{ display: "grid", justifyItems: "center", opacity: state.phase === "cover" ? 1 : 0, transform: state.phase === "cover" ? "translateY(0) scale(1)" : "translateY(10px) scale(.96)", transition: `opacity 260ms ${ease.out}, transform 520ms ${ease.out}` }}>
        <StrideMark size={72} glowing />
      </div>
    </div>,
    document.body,
  );
}
