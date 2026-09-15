import { useEffect, useRef, useState } from "react";
import { ScrollTrigger, prefersReducedMotion } from "./gsap";
import { BUILD } from "./theme";

/**
 * A temporary read-out of the things that decide whether this build animates.
 *
 * Every symptom reported so far — a section absent, a section frozen — has
 * more than one possible cause, and describing them to each other has not
 * separated them. This prints the deciding facts on the page itself so a
 * single screenshot says which one it is. Remove once the cause is known.
 */
export default function Diagnostics() {
  const [state, setState] = useState({
    w: 0,
    h: 0,
    bp: "-",
    reduceOS: false,
    motionOff: false,
    triggers: 0,
    scrollY: 0,
    darkOpacity: "-",
    solHead: "-",
  });
  const raf = useRef(0);

  useEffect(() => {
    const tick = () => {
      raf.current = requestAnimationFrame(tick);
      const w = window.innerWidth;
      const narrow = w < 769;
      const canHover = window.matchMedia?.("(hover: hover) and (pointer: fine)").matches ?? true;
      const bp = narrow && !canHover ? "STACKED (no motion)" : "animated";
      const op = (sel: string) => {
        const el = document.querySelector(sel);
        return el ? getComputedStyle(el).opacity.slice(0, 4) : "none";
      };
      setState({
        w,
        h: window.innerHeight,
        bp,
        reduceOS: window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ?? false,
        motionOff: prefersReducedMotion(),
        triggers: ScrollTrigger.getAll().length,
        scrollY: Math.round(window.scrollY),
        darkOpacity: op(".pb-dark"),
        solHead: op(".sol-head"),
      });
    };
    tick();
    return () => cancelAnimationFrame(raf.current);
  }, []);

  const row = (k: string, v: string, bad = false) => (
    <div style={{ display: "flex", justifyContent: "space-between", gap: 12 }}>
      <span style={{ opacity: 0.6 }}>{k}</span>
      <span style={{ color: bad ? "#FF6B6B" : "#A78BFA", fontWeight: 700 }}>{v}</span>
    </div>
  );

  return (
    <div
      style={{
        position: "fixed",
        left: 12,
        bottom: 12,
        zIndex: 99999,
        width: 250,
        padding: "10px 12px",
        borderRadius: 8,
        background: "rgba(8,8,8,0.92)",
        border: "1px solid rgba(167,139,250,0.5)",
        color: "#fff",
        font: "600 11px/1.55 ui-monospace, SFMono-Regular, Menlo, monospace",
        pointerEvents: "none",
      }}
    >
      <div style={{ color: "#A78BFA", marginBottom: 6, letterSpacing: "0.1em" }}>
        STRIDE DIAGNOSTICS {BUILD}
      </div>
      {row("viewport", `${state.w}x${state.h}`)}
      {row("sections", state.bp, state.bp.startsWith("STACKED"))}
      {row("OS reduce-motion", state.reduceOS ? "ON" : "off")}
      {row("animation", state.motionOff ? "DISABLED" : "enabled", state.motionOff)}
      {row("scroll triggers", String(state.triggers), state.triggers === 0)}
      {row("scrollY (move me)", String(state.scrollY), false)}
      {row("problem dark", state.darkOpacity)}
      {row("whatwedo head", state.solHead)}
    </div>
  );
}
