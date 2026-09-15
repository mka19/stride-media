import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef, useState } from "react";
import { gsap, useGsapContext } from "./gsap";
import { registerSurface, type SurfaceHandle } from "./surface";
import { whyStride as copy } from "./copy";
import { color, hexA, layout, rhythm, space, typeScale } from "./theme";
import { Grain, MicroLabel } from "./primitives";
import ScrambleText from "./ScrambleText";
import { useBreakpoint, useStacked } from "./responsive";
import HeroObject, { type HeroObjectHandle } from "./HeroObject";

/**
 * Why Stride — trionn.com capabilities reference.
 *
 *   1. Stacked-word headline on light, each word its own line, tight stack.
 *   2. The ground turns dark and the headline turns white in the same move,
 *      then fades.
 *   3. Its letters scatter outward with a little rotation before going.
 *   4. The 3D mark fades in at centre and turns, and keeps turning.
 *   5. Capability labels cycle in one at a time beside it, fixed right, each
 *      crossfading into the next with no blank gap.
 *   6. It clears into Testimonials.
 *
 * On phones the scatter is replaced by a plain crossfade and the labels
 * become a stacked list, per the responsive prompt.
 */
export default function WhyStride({ scrollLength = "560vh" }: { scrollLength?: string }) {
  const surface = useRef<SurfaceHandle | null>(null);
  const objectRef = useRef<HeroObjectHandle | null>(null);
  const bp = useBreakpoint();
  const stacked = useStacked();
  const [, setTick] = useState(0);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      gsap.set(q(".ws-word"), { opacity: 0, y: 30 });
      gsap.set(q(".ws-dark"), { opacity: 0 });
      gsap.set(q(".ws-object"), { opacity: 0, scale: 0.8 });
      gsap.set(q(".ws-cap"), { opacity: 0, x: 15 });
      // The object never dissolves here: it is the fixed centrepiece.
      objectRef.current?.setProgress(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => surface.current?.setTone(self.progress < 0.17 ? "light" : "dark"),
        },
      });

      // 1. the stacked headline
      tl.to(q(".ws-word"), { opacity: 1, y: 0, duration: 0.05, stagger: 0.02 }, 0.02)

        // 2. ground and type invert together, one move
        .to(q(".ws-dark"), { opacity: 1, duration: 0.05 }, 0.17)
        .to(q(".ws-headline"), { color: color.textOnDark, duration: 0.05 }, 0.17);

      // 3. the letters scatter, each to its own offset and rotation
      const letters = q(".ws-letter");
      letters.forEach((letter) => {
        tl.to(
          letter,
          {
            x: gsap.utils.random(-320, 320),
            y: gsap.utils.random(-220, 220),
            rotation: gsap.utils.random(-25, 25),
            opacity: 0,
            duration: 0.09,
            ease: "power2.in",
          },
          0.26 + Math.random() * 0.03,
        );
      });

      // 4. the object arrives and stays
      tl.to(q(".ws-object"), { opacity: 1, scale: 1, duration: 0.07, ease: "power2.out" }, 0.36);

      // 5. the capability labels, crossfading with a slight overlap so there
      //    is never a blank gap between them
      const caps = q(".ws-cap");
      const first = 0.46;
      const each = (0.96 - first) / caps.length;
      caps.forEach((cap, i) => {
        const at = first + i * each;
        tl.to(cap, { opacity: 1, x: 0, duration: each * 0.3, ease: "power2.out" }, at);
        if (i < caps.length - 1) {
          tl.to(cap, { opacity: 0, x: -15, duration: each * 0.3, ease: "power2.in" }, at + each * 0.7);
        }
      });
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".ws-word, .ws-letter"), { opacity: 1, x: 0, y: 0, rotation: 0 });
      gsap.set(q(".ws-dark, .ws-object"), { opacity: 1, scale: 1 });
      gsap.set(q(".ws-cap"), { opacity: 1, x: 0 });
    },
  );

  useEffect(() => {
    const frame = rootRef.current?.querySelector<HTMLElement>(".ws-frame");
    if (!frame) return;
    const handle = registerSurface(frame, "light");
    surface.current = handle;
    // The object handle attaches after this component's first paint.
    const t = window.setTimeout(() => setTick((v) => v + 1), 60);
    return () => {
      window.clearTimeout(t);
      handle.release();
      surface.current = null;
    };
  }, [rootRef, stacked]);

  const capability = (cap: (typeof copy.capabilities)[number], className = "") => (
    <div
      key={cap.n}
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: space.s, maxWidth: "34ch" }}
    >
      <MicroLabel tone="accent">{cap.n}</MicroLabel>
      <h3 style={{ margin: 0, ...typeScale.h3, color: color.textOnDark }}>{cap.title}</h3>
      <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>{cap.body}</p>
    </div>
  );

  if (stacked) {
    return (
      <section
        id="why-stride"
        style={{ background: color.black, color: color.textOnDark, fontFamily: typeScale.bodyLg.fontFamily }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: rhythm.headerToContent,
            padding: `${layout.section} ${layout.pad}`,
          }}
        >
          <MicroLabel tone="accent">{copy.label}</MicroLabel>
          <h2 style={{ margin: 0, ...typeScale.displayLg, lineHeight: 0.9 }}>
            {copy.headline.map((w) => (
              <span key={w} style={{ display: "block" }}>
                {w}
              </span>
            ))}
          </h2>
          <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>
            {copy.transition}
          </p>
          <div style={{ position: "relative", width: "100%", height: "44vh" }}>
            <HeroObject handleRef={objectRef} breakpoint={bp} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: layout.section }}>
            {copy.capabilities.map((cap) => capability(cap))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="why-stride"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.bone,
        fontFamily: typeScale.bodyLg.fontFamily,
      }}
    >
      <div className="ws-frame" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <div
          className="ws-dark"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: color.black }}
        />
        <Grain opacity={0.14} />

        {/* ---- the 3D centrepiece ---- */}
        <div
          className="ws-object"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ width: "min(560px, 46vw)", height: "min(560px, 60vh)" }}>
            <HeroObject handleRef={objectRef} breakpoint={bp} />
          </div>
        </div>

        {/* ---- the stacked headline, which scatters ---- */}
        <div
          className="ws-headline"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: `0 ${layout.pad}`,
            color: color.textOnLight,
          }}
        >
          <MicroLabel tone="accent" style={{ marginBottom: rhythm.eyebrowToHeadline }}>
            {copy.label}
          </MicroLabel>
          {copy.headline.map((word) => (
            <div key={word} className="ws-word" style={{ ...typeScale.displayLg, lineHeight: 0.88 }}>
              {/* Each letter stays its own span: the scatter needs them
                  individually, and the decode runs before that. */}
              {word.split("").map((ch, i) => (
                <span key={i} className="ws-letter" style={{ display: "inline-block" }}>
                  <ScrambleText as="span" settle={420} stagger={30}>
                    {ch}
                  </ScrambleText>
                </span>
              ))}
            </div>
          ))}
        </div>

        {/* ---- capability labels, fixed right beside the object ---- */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: `0 ${layout.pad}`,
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "relative", width: "min(420px, 34vw)", minHeight: 220 }}>
            {copy.capabilities.map((cap, i) => (
              <div
                key={cap.n}
                className="ws-cap"
                // Stacked in one box: only the first rests visible.
                style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : 0 }}
              >
                {capability(cap)}
              </div>
            ))}
          </div>
        </div>

        {/* The transition line, stated once the ground has turned. */}
        <div
          style={{
            position: "absolute",
            left: layout.pad,
            right: layout.pad,
            bottom: layout.section,
            textAlign: "center",
            ...typeScale.bodyLg,
            color: hexA(color.textOnDark, 0.5),
          }}
        >
          {copy.transition}
        </div>
      </div>
    </section>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(WhyStride, {
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "560vh" },
});
