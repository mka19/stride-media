import { useRef, useState } from "react";
import { gsap, SCRUB, useGsapContext } from "../shared/gsap";
import { color, hexA, layout, space, typeScale } from "../shared/theme";
import { MicroLabel } from "../shared/primitives";
import { useBreakpoint, useStacked } from "../shared/responsive";

/**
 * A tactile before/after bridge between FAQ and the footer.
 *
 * The divider is usable with mouse, touch and keyboard. During the final
 * scroll beat the comparison closes into the Stride mark, which settles at
 * the bottom edge so the footer receives the same symbol instead of starting
 * as an unrelated block.
 */
export default function ComparisonTransition({ scrollLength = "105vh" }: { scrollLength?: string }) {
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
        .to(q(".compare-copy"), { opacity: 0, y: -14, duration: 0.16, ease: "power1.inOut" }, 0.7)
        .to(q(".compare-shell"), { scale: 0.7, borderRadius: 0, opacity: 0.08, duration: 0.24, ease: "power1.inOut" }, 0.72)
        // The comparison card clears completely. The Stride mark is the
        // handoff into the footer, so it remains visible and settled.
        .to(q(".compare-shell"), { opacity: 0, duration: 0.06, ease: "power2.in" }, 0.94);
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
      <img src="/comparison-with-stride.png" alt="A polished real-estate Instagram profile after working with Stride Media" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "contain", objectPosition: "center", background: "#080b0d", userSelect: "none", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, width: `${split}%`, overflow: "hidden", background: "#080b0d" }}>
        <img src="/comparison-without-stride.png" alt="The real-estate Instagram profile before working with Stride Media" style={{ position: "absolute", left: 0, top: 0, width: `calc(100vw - ${layout.pad} - ${layout.pad})`, height: "100%", objectFit: "contain", objectPosition: "center", background: "#080b0d", userSelect: "none", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, width: `calc(100vw - ${layout.pad} - ${layout.pad})`, background: "linear-gradient(180deg, rgba(0,0,0,.12), transparent 34%, rgba(0,0,0,.08))", pointerEvents: "none" }} />
        <MicroLabel tone="accent" style={{ position: "absolute", left: stacked ? 18 : 32, top: stacked ? 22 : 32, whiteSpace: "nowrap", opacity: Math.min(1, split / 28), transition: "opacity 420ms ease" }}>Without Stride</MicroLabel>
      </div>

      <MicroLabel tone="accent" style={{ position: "absolute", right: stacked ? 18 : 32, top: stacked ? 22 : 32, whiteSpace: "nowrap", opacity: Math.min(1, (100 - split) / 28), transition: "opacity 420ms ease" }}>With Stride</MicroLabel>

      <div className="compare-copy" style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", pointerEvents: "none" }}>
        <div style={{ textAlign: "center", padding: stacked ? 14 : layout.pad }}>
          <h2 style={{ margin: `${space.lg}px 0 0`, ...typeScale.h1, fontSize: stacked ? "clamp(28px, 8vw, 38px)" : undefined, lineHeight: stacked ? 1.02 : undefined, color: "#fff", mixBlendMode: "difference" }}>
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
    return <section ref={rootRef} style={{ position: "relative", height: "clamp(360px, 72vw, 440px)", background: color.black }}>{shell}</section>;
  }

  return (
    <section ref={rootRef} style={{ position: "relative", height: scrollLength, background: color.black, color: color.textOnDark }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {shell}
      </div>
    </section>
  );
}
