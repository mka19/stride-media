import { gsap, ScrollTrigger, useGsapContext } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { useEffect, useRef } from "react";
import { howItWorks as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { Grain, StrideMark } from "../shared/primitives";
import { useBreakpoint } from "../shared/responsive";
import FieldTexture from "./FieldTexture";
import RevealText from "../shared/RevealText";

/**
 * How It Works — anubischain.ai reference.
 *
 *   1. Light intro panel: eyebrow, headline, supporting paragraph.
 *   2. A glowing dark flash with the mark revealed inside it — the chapter
 *      break between the intro and the steps.
 *   3. Pinned step sequence over the network texture: 01, 02, 03 arrive one
 *      at a time as the scroll continues.
 *   4. Closing panel: the mark turning slowly, closing line beneath it.
 *
 * Below the tablet breakpoint the pin is dropped and the four beats become
 * ordinary stacked blocks, with the flash reduced to a plain crossfade.
 */
export default function HowItWorks({ scrollLength = "380vh" }: { scrollLength?: string }) {
  const surface = useRef<SurfaceHandle | null>(null);
  const bp = useBreakpoint();
  const stacked = bp === "mobile";

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      gsap.set(q(".hw-intro-item"), { opacity: 0, y: 20 });
      gsap.set(q(".hw-flash"), { opacity: 0 });
      gsap.set(q(".hw-flash-mark"), { opacity: 0, scale: 0.7 });
      gsap.set(q(".hw-steps"), { opacity: 0 });
      gsap.set(q(".hw-step"), { opacity: 0, y: 15 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          // Intro and steps are light; the flash and closing panel are dark.
          onUpdate: (self) => {
            const p = self.progress;
            surface.current?.setTone(p > 0.2 && p < 0.3 ? "dark" : "light");
          },
        },
      });

      // 1. intro
      tl.to(q(".hw-intro-item"), { opacity: 1, y: 0, duration: 0.06, stagger: 0.02 }, 0.02)
        .to(q(".hw-intro"), { opacity: 0, duration: 0.04 }, 0.2)

        // 3. the steps, one at a time
        .to(q(".hw-steps"), { opacity: 1, duration: 0.03 }, 0.28);

      // 2. The flash is a fixed ~700ms burst fired at the checkpoint, not a
      // scrubbed tween: scrubbing would tie its length to how fast the
      // visitor happens to be scrolling, and the spec calls for a quick
      // chapter break of a set duration.
      const flash = gsap
        .timeline({ paused: true })
        .to(q(".hw-flash"), { opacity: 1, duration: 0.12, ease: "power2.out" })
        .to(q(".hw-flash-mark"), { opacity: 1, scale: 1, duration: 0.18, ease: "power2.out" }, 0.06)
        .to(q(".hw-flash-mark"), { opacity: 0, scale: 1.25, duration: 0.2, ease: "power2.in" }, 0.36)
        .to(q(".hw-flash"), { opacity: 0, duration: 0.18, ease: "power2.in" }, 0.5);

      ScrollTrigger.create({
        trigger: root,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          const inWindow = self.progress > 0.2 && self.progress < 0.3;
          if (inWindow && !flash.isActive() && flash.progress() === 0) flash.play(0);
          if (!inWindow && flash.progress() === 1) flash.progress(0).pause();
        },
      });

      const steps = q(".hw-step");
      steps.forEach((step, i) => {
        const at = 0.3 + i * 0.22;
        tl.to(step, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, at);
        // They share the same centre, so the previous one clears out.
        if (i > 0) tl.to(steps[i - 1], { opacity: 0, y: -15, duration: 0.05 }, at);
      });

    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".hw-intro-item, .hw-step"), { opacity: 1, y: 0 });
      gsap.set(q(".hw-steps"), { opacity: 1 });
      gsap.set(q(".hw-flash"), { opacity: 0 });
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
          ...typeScale.labelSm,
          fontWeight: 600,
          padding: `${space.xs}px ${space.sm}px`,
          color: color.ruby,
          border: `1px solid ${hexA(color.ruby, 0.5)}`,
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
          background: color.ruby,
          color: "#fff",
        }}
      >
        {label}
      </span>
      <span style={{ width: 3, background: hexA(color.ruby, 0.55) }} />
      <span style={{ width: 3, background: hexA(color.ruby, 0.3) }} />
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

  const stepList = copy.steps.map((step) => (
    <div
      key={step.n}
      className="hw-step"
      style={{
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
      <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnLightMuted }}>{step.body}</p>
    </div>
  ));

  if (stacked) {
    return (
      <section
        id="how-it-works"
        style={{ background: color.bone, color: color.textOnLight, fontFamily: typeScale.body.fontFamily }}
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
        fontFamily: typeScale.body.fontFamily,
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
            color: color.textOnLight,
          }}
        >
          <FieldTexture breakpoint={bp} tone="light" />
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

        {/* ---- the chapter-break flash ---- */}
        <div
          className="hw-flash"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: `radial-gradient(60% 60% at 50% 50%, ${hexA(color.ruby, 0.55)} 0%, ${color.black} 72%)`,
          }}
        >
          <Grain opacity={0.2} />
          <div className="hw-flash-mark" style={{ position: "relative", lineHeight: 0 }}>
            <StrideMark size={180} glowing />
          </div>
        </div>

      </div>
    </section>
  );
}
