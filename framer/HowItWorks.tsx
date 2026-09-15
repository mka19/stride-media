import { addPropertyControls, ControlType } from "framer"
import { gsap, useGsapContext } from "./gsap";
import { registerSurface, type SurfaceHandle } from "./surface";
import { useEffect, useRef } from "react";
import { howItWorks as copy } from "./copy";
import { color, hexA, layout, rhythm, space, typeScale } from "./theme";
import { MediaTile } from "./primitives";
import { useBreakpoint } from "./responsive";
import FieldTexture from "./FieldTexture";
import RevealText from "./RevealText";

/**
 * How It Works — anubischain.ai reference.
 *
 *   1. Intro panel: eyebrow, headline, supporting paragraph.
 *   2. A pinned flight: footage behind the whole section pushes forward as
 *      the scroll advances, and each step arrives small and grows toward the
 *      viewer before passing them, so the section reads as moving further in
 *      rather than as three slides changing.
 *
 * Below the tablet breakpoint the pin is dropped and the four beats become
 * ordinary stacked blocks, with the flash reduced to a plain crossfade.
 */
export default function HowItWorks({
  /** Footage behind the flight; falls back to a generated fill. */
  backgroundSrc,
  scrollLength = "380vh",
}: {
  backgroundSrc?: string;
  scrollLength?: string;
}) {
  const surface = useRef<SurfaceHandle | null>(null);
  const bp = useBreakpoint();
  const stacked = bp === "mobile";

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      gsap.set(q(".hw-intro-item"), { opacity: 0, y: 20 });
      gsap.set(q(".hw-steps"), { opacity: 0 });
      // Each step waits far off, small, and comes toward the viewer.
      gsap.set(q(".hw-step"), { opacity: 0, scale: 0.45, transformOrigin: "50% 50%" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => surface.current?.setTone(self.progress > 0.2 ? "dark" : "light"),
        },
      });

      // The footage pushes forward for the whole pin, so the ground under
      // the steps is always still moving in — that continuous push is what
      // makes the section read as travel rather than as slides.
      tl.fromTo(
        q(".hw-flight"),
        { scale: 1 },
        { scale: 1.75, ease: "none", duration: 1 },
        0,
      );

      // 1. intro clears
      tl.to(q(".hw-intro-item"), { opacity: 1, y: 0, duration: 0.05, stagger: 0.02 }, 0.02)
        .to(q(".hw-intro"), { opacity: 0, duration: 0.06 }, 0.18)
        .to(q(".hw-steps"), { opacity: 1, duration: 0.05 }, 0.2);

      // 2. the steps fly toward the viewer and past
      const steps = q(".hw-step");
      const first = 0.26;
      const span = (0.98 - first) / steps.length;
      steps.forEach((step, i) => {
        const at = first + i * span;
        tl.fromTo(
          step,
          { opacity: 0, scale: 0.45 },
          { opacity: 1, scale: 1, duration: span * 0.55, ease: "power2.out" },
          at,
        );
        // Past the viewer: it keeps growing as it fades, so it reads as the
        // camera going through it rather than the text simply leaving.
        if (i < steps.length - 1) {
          tl.to(
            step,
            { opacity: 0, scale: 1.9, duration: span * 0.45, ease: "power2.in" },
            at + span * 0.6,
          );
        }
      });
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".hw-intro-item, .hw-step"), { opacity: 1, y: 0, scale: 1 });
      gsap.set(q(".hw-steps"), { opacity: 1 });
    },
  );

  useEffect(() => {
    const frame = rootRef.current?.querySelector<HTMLElement>(".hw-frame");
    if (!frame) return;
    const handle = registerSurface(frame, "light");
    surface.current = handle;
    return () => {
      handle.release();
      surface.current = null;
    };
  }, [rootRef, stacked]);

  /** The reference's tag: the number in its own box, the label beside it. */
  const tag = (n: string, label: string) => (
    <span style={{ display: "inline-flex", alignItems: "stretch", gap: 2 }}>
      <span
        style={{
          ...typeScale.eyebrow,
          fontWeight: 600,
          padding: `${space.xs}px ${space.sm}px`,
          color: color.accent,
          border: `1px solid ${hexA(color.accent, 0.5)}`,
        }}
      >
        {n}
      </span>
      <span
        style={{
          ...typeScale.eyebrow,
          display: "inline-flex",
          alignItems: "center",
          padding: `${space.xs}px ${space.s}px`,
          background: color.accent,
          color: "#fff",
        }}
      >
        {label}
      </span>
      <span style={{ width: 3, background: hexA(color.accent, 0.55) }} />
      <span style={{ width: 3, background: hexA(color.accent, 0.3) }} />
    </span>
  );

  const intro = (
    <div
      className="hw-intro"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: rhythm.headlineToBody,
        maxWidth: 800,
        margin: "0 auto",
      }}
    >
      <span className="hw-intro-item">{tag("//", "How it works")}</span>
      <RevealText as="h2" className="hw-intro-item" style={{ ...typeScale.h1 }}>
        {copy.headline}
      </RevealText>
      <p
        className="hw-intro-item"
        style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnLightMuted }}
      >
        {copy.body}
      </p>
    </div>
  );

  const stepList = copy.steps.map((step, i) => (
    <div
      key={step.n}
      className="hw-step"
      style={{
        // Steps share a centre, so only the first rests visible.
        opacity: !stacked && i > 0 ? 0 : 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: rhythm.headlineToBody,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      {tag(step.n, step.tag)}
      <h3 style={{ margin: 0, ...typeScale.h1 }}>{step.title}</h3>
      <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>{step.body}</p>
    </div>
  ));

  if (stacked) {
    return (
      <section
        id="how-it-works"
        style={{ background: color.bone, color: color.textOnLight, fontFamily: typeScale.bodyLg.fontFamily }}
      >
        <div style={{ padding: `${layout.section} ${layout.pad}` }}>{intro}</div>
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            gap: layout.section,
            padding: `${layout.section} ${layout.pad}`,
          }}
        >
          <FieldTexture breakpoint={bp} tone="light" />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: layout.section }}>
            {stepList}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="how-it-works"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.bone,
        fontFamily: typeScale.bodyLg.fontFamily,
      }}
    >
      <div
        className="hw-frame"
        style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}
      >
        {/* ---- intro panel ---- */}
        <div
          className="hw-intro"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: `0 ${layout.pad}`,
            color: color.textOnLight,
          }}
        >
          {intro}
        </div>

        {/* ---- the step sequence, over the network texture ---- */}
        <div
          className="hw-steps"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: space.xxl,
            padding: `calc(${layout.navHeight}px + ${layout.section}) ${layout.pad} ${layout.section}`,
            color: color.textOnDark,
            overflow: "hidden",
          }}
        >
          {/* The footage, pushing forward for the length of the pin. */}
          <div className="hw-flight" style={{ position: "absolute", inset: 0, willChange: "transform" }}>
            <MediaTile src={backgroundSrc} seed={19} style={{ position: "absolute", inset: 0 }} />
            <div
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: `radial-gradient(70% 70% at 50% 50%, ${hexA(color.black, 0.45)} 0%, ${hexA(color.black, 0.88)} 100%)`,
              }}
            />
          </div>
          <FieldTexture breakpoint={bp} tone="dark" />
          {/* Every step occupies the same centre, so the sequence reads as
              one panel changing rather than a column scrolling past. */}
          <div style={{ position: "relative", display: "grid" }}>
            {stepList.map((step, i) => (
              <div key={i} style={{ gridArea: "1 / 1" }}>
                {step}
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(HowItWorks, {
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "380vh" },
});
