import { useRef, useState } from "react";
import { gsap, SCRUB, useGsapContext } from "../shared/gsap";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
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
        .to(q(".compare-copy"), { opacity: 1, y: 0, duration: 0.16, ease: "power1.inOut" }, 0.7);
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
        inset: bp === "mobile" ? 0 : stacked ? `${space.xxl}px ${layout.pad}` : `${layout.navHeight + 165}px ${layout.pad} 50px`,
        overflow: "hidden",
        cursor: "ew-resize",
        touchAction: "pan-y",
        background: "#0a0710",
        boxShadow: `0 0 0 1px ${hexA("#fff", .12)}`,
      }}
    >
      <img src="/comparison-with-stride.png" alt="A polished real-estate Instagram profile after working with Stride Media" style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: bp === "mobile" ? "contain" : "cover", objectPosition: "top center", background: "#080b0d", userSelect: "none", pointerEvents: "none" }} />
      <div style={{ position: "absolute", inset: 0, width: `${split}%`, overflow: "hidden", background: "#080b0d" }}>
        <img src="/comparison-without-stride.png" alt="The real-estate Instagram profile before working with Stride Media" style={{ position: "absolute", left: 0, top: 0, width: `calc(100vw - ${layout.pad} - ${layout.pad})`, height: "100%", objectFit: bp === "mobile" ? "contain" : "cover", objectPosition: "top center", background: "#080b0d", userSelect: "none", pointerEvents: "none" }} />
        <div aria-hidden="true" style={{ position: "absolute", inset: 0, width: `calc(100vw - ${layout.pad} - ${layout.pad})`, background: "linear-gradient(180deg, rgba(0,0,0,.12), transparent 34%, rgba(0,0,0,.08))", pointerEvents: "none" }} />
        <MicroLabel tone="accent" style={{ position: "absolute", left: stacked ? 12 : 32, top: stacked ? undefined : 32, bottom: stacked ? 14 : undefined, whiteSpace: "nowrap", opacity: Math.min(1, split / 28), transition: "opacity 420ms ease" }}>Without Stride</MicroLabel>
      </div>

      {bp === "mobile" ? (
        <div style={{ position: "absolute", left: `${split}%`, right: 0, top: 0, bottom: 0, overflow: "hidden", pointerEvents: "none" }}>
          <MicroLabel tone="accent" style={{ position: "absolute", right: 12, bottom: 14, whiteSpace: "nowrap" }}>With Stride</MicroLabel>
        </div>
      ) : (
        <MicroLabel tone="accent" style={{ position: "absolute", right: stacked ? 12 : 32, top: stacked ? undefined : 32, bottom: stacked ? 14 : undefined, whiteSpace: "nowrap", opacity: Math.min(1, (100 - split) / 28), transition: "opacity 420ms ease" }}>With Stride</MicroLabel>
      )}

      <div className="compare-copy" style={{ position: "absolute", inset: 0, display: bp === "tablet" ? "grid" : "none", placeItems: "center", pointerEvents: "none" }}>
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
    if (bp === "mobile") {
      return (
        <section ref={rootRef} style={{ position: "relative", padding: `0 ${layout.pad} 20px`, background: color.black }}>
          <div className="compare-mobile-heading" style={{ margin: 0, padding: 0, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: 6 }}>
            <span style={{ display: "block", margin: 0, ...typeScale.eyebrow, color: hexA("#fff", .72) }}>Drag to compare</span>
            <h2 style={{ margin: 0, ...typeScale.h1, fontSize: "clamp(28px, 8vw, 38px)", lineHeight: 1.02, color: "#fff" }}>From invisible to unmistakable.</h2>
          </div>
          <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 2", marginTop: 16 }}>
            {shell}
          </div>
        </section>
      );
    }
    return <section ref={rootRef} style={{ position: "relative", height: "clamp(360px, 72vw, 440px)", background: color.black }}>{shell}</section>;
  }

  return (
    <section ref={rootRef} style={{ position: "relative", height: scrollLength, background: color.black, color: color.textOnDark }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <header style={{ position: "absolute", top: layout.navHeight + space.xl, left: layout.pad, right: layout.pad, textAlign: "center" }}>
          <h2 style={{ margin: 0, ...typeScale.h1, color: color.textOnDark }}>From invisible to unmistakable.</h2>
          <span style={{ display: "block", marginTop: rhythm.eyebrowToHeadline, ...typeScale.eyebrow, color: color.textOnDarkMuted }}>Drag to compare</span>
        </header>
        {shell}
      </div>
    </section>
  );
}
