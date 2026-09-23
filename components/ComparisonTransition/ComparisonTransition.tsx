import { useRef, useState } from "react";
import { gsap, SCRUB, useGsapContext } from "../shared/gsap";
import { color, hexA, layout, space, typeScale } from "../shared/theme";
import { MicroLabel, StrideMark } from "../shared/primitives";
import { useBreakpoint, useStacked } from "../shared/responsive";

/**
 * A tactile before/after bridge between FAQ and the footer.
 *
 * The divider is usable with mouse, touch and keyboard. During the final
 * scroll beat the comparison closes into the Stride mark, which settles at
 * the bottom edge so the footer receives the same symbol instead of starting
 * as an unrelated block.
 */
export default function ComparisonTransition({ scrollLength = "170vh" }: { scrollLength?: string }) {
  const [split, setSplit] = useState(50);
  const drag = useRef(false);
  const bp = useBreakpoint();
  const stacked = useStacked() || bp === "tablet";

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      if (stacked) {
        gsap.set(q(".compare-shell, .compare-copy"), { opacity: 1, scale: 1, y: 0, borderRadius: 0 });
        gsap.set(q(".compare-mark"), { opacity: 0 });
        return;
      }
      gsap.set(q(".compare-shell"), { scale: 0.9, borderRadius: 18 });
      gsap.set(q(".compare-copy"), { opacity: 1, y: 0 });
      gsap.set(q(".compare-mark"), { opacity: 0, scale: 0.55, y: 30 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: SCRUB },
      });
      tl.to(q(".compare-shell"), { scale: 1, borderRadius: 0, duration: 0.32, ease: "power2.inOut" }, 0)
        .to(q(".compare-copy"), { opacity: 0, y: -14, duration: 0.2, ease: "power1.inOut" }, 0.42)
        .to(q(".compare-shell"), { scale: 0.56, borderRadius: 24, opacity: 0.08, duration: 0.32, ease: "power1.inOut" }, 0.52)
        .to(q(".compare-mark"), { opacity: 1, scale: 1, y: 0, duration: 0.3, ease: "power2.out" }, 0.58)
        .to(q(".compare-mark"), { y: "24vh", scale: 0.78, duration: 0.26, ease: "power1.inOut" }, 0.76)
        // The comparison card clears completely. The Stride mark is the
        // handoff into the footer, so it remains visible and settled.
        .to(q(".compare-shell"), { opacity: 0, duration: 0.12, ease: "power2.in" }, 0.88);
    },
    [stacked],
    (root) => {
      gsap.set(root.querySelectorAll(".compare-shell, .compare-copy, .compare-mark"), { opacity: 1, scale: 1, y: 0 });
    },
  );

  const update = (clientX: number, el: HTMLElement) => {
    const box = el.getBoundingClientRect();
    setSplit(Math.max(0, Math.min(100, ((clientX - box.left) / Math.max(1, box.width)) * 100)));
  };

  const shell = (
    <div
      className="compare-shell"
      onPointerDown={(e) => {
        drag.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        update(e.clientX, e.currentTarget);
      }}
      onPointerMove={(e) => drag.current && update(e.clientX, e.currentTarget)}
      onPointerUp={() => (drag.current = false)}
      onPointerCancel={() => (drag.current = false)}
      onLostPointerCapture={() => (drag.current = false)}
      style={{
        position: "absolute",
        inset: stacked ? `${space.xxl}px ${layout.pad}` : `${layout.navHeight + space.xl}px ${layout.pad} ${space.xl}px`,
        overflow: "hidden",
        cursor: "ew-resize",
        touchAction: "pan-y",
        background: "#0a0710",
        boxShadow: `0 0 0 1px ${hexA("#fff", .12)}`,
      }}
    >
      <div style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 76% 38%, ${hexA(color.accentBright, .72)}, transparent 17%), radial-gradient(circle at 52% 62%, ${hexA(color.accent, .48)}, transparent 30%), linear-gradient(125deg, #050507 0%, #23113f 52%, #08060d 100%)` }} />
      <div style={{ position: "absolute", inset: 0, width: `${split}%`, overflow: "hidden", background: "linear-gradient(125deg, #e8e5ee 0%, #bdb7ca 44%, #f7f5f8 100%)" }}>
        <div style={{ position: "absolute", inset: 0, width: "100vw", background: `radial-gradient(circle at 28% 36%, ${hexA(color.accent, .35)}, transparent 18%), radial-gradient(circle at 56% 72%, rgba(15,15,19,.18), transparent 26%), linear-gradient(135deg, rgba(255,255,255,.72), transparent 48%)` }} />
        <MicroLabel tone="accent" style={{ position: "absolute", left: stacked ? 18 : 32, top: stacked ? 22 : 32, whiteSpace: "nowrap", opacity: Math.min(1, split / 28), transition: "opacity 420ms ease" }}>Without Stride</MicroLabel>
      </div>

      <MicroLabel tone="accent" style={{ position: "absolute", right: stacked ? 18 : 32, top: stacked ? 22 : 32, whiteSpace: "nowrap", opacity: Math.min(1, (100 - split) / 28), transition: "opacity 420ms ease" }}>With Stride</MicroLabel>

      <div className="compare-copy" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div style={{ textAlign: "center", padding: layout.pad }}>
          <h2 style={{ margin: `${space.lg}px 0 0`, ...typeScale.h1, color: "#fff", mixBlendMode: "difference" }}>
            From invisible to unmistakable.
          </h2>
          <span style={{ display: "block", marginTop: space.lg, ...typeScale.eyebrow, color: "#fff", mixBlendMode: "difference", opacity: .72 }}>Drag to compare</span>
        </div>
      </div>

      <div style={{ position: "absolute", top: 0, bottom: 0, left: `${split}%`, width: 1, background: hexA("#fff", .88), boxShadow: `0 0 18px ${hexA(color.accentBright, .8)}`, transform: "translateX(-.5px)", pointerEvents: "none" }}>
        <button
          type="button"
          aria-label="Image comparison position"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(split)}
          aria-orientation="horizontal"
          role="slider"
          onKeyDown={(e) => {
            if (["ArrowLeft", "ArrowRight", "Home", "End"].includes(e.key)) e.preventDefault();
            if (e.key === "ArrowLeft") setSplit((v) => Math.max(0, v - 5));
            if (e.key === "ArrowRight") setSplit((v) => Math.min(100, v + 5));
            if (e.key === "Home") setSplit(0);
            if (e.key === "End") setSplit(100);
          }}
          style={{ position: "absolute", left: "50%", top: "50%", width: 54, height: 54, transform: "translate(-50%, -50%)", borderRadius: "50%", border: `1px solid ${hexA("#fff", .45)}`, background: "rgba(8,8,12,.82)", color: "#fff", display: "grid", placeItems: "center", font: "inherit" }}
        >
          ↔
        </button>
      </div>
    </div>
  );

  if (stacked) {
    return <section ref={rootRef} style={{ position: "relative", height: "clamp(520px, 68vh, 640px)", background: color.black }}>{shell}</section>;
  }

  return (
    <section ref={rootRef} style={{ position: "relative", height: scrollLength, background: color.black, color: color.textOnDark }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {shell}
        <div className="compare-mark" aria-hidden="true" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
          <StrideMark size={132} glowing />
        </div>
      </div>
    </section>
  );
}
