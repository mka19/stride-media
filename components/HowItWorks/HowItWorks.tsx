import { gsap, useGsapContext } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { useEffect, useRef } from "react";
import { howItWorks as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { Grain, MicroLabel, StrideMark } from "../shared/primitives";
import { useBreakpoint } from "../shared/responsive";
import ParticleField from "./ParticleField";

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
export default function HowItWorks({ scrollLength = "480vh" }: { scrollLength?: string }) {
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
      gsap.set(q(".hw-close"), { opacity: 0 });
      gsap.set(q(".hw-close-line"), { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          // Intro and steps are light; the flash and closing panel are dark.
          onUpdate: (self) => {
            const p = self.progress;
            surface.current?.setTone(p > 0.2 && p < 0.3 ? "dark" : p > 0.78 ? "dark" : "light");
          },
        },
      });

      // 1. intro
      tl.to(q(".hw-intro-item"), { opacity: 1, y: 0, duration: 0.06, stagger: 0.02 }, 0.02)
        .to(q(".hw-intro"), { opacity: 0, duration: 0.04 }, 0.2)

        // 2. the flash: glow blooms, the mark shows inside it, then it clears
        .to(q(".hw-flash"), { opacity: 1, duration: 0.03 }, 0.2)
        .to(q(".hw-flash-mark"), { opacity: 1, scale: 1, duration: 0.03 }, 0.22)
        .to(q(".hw-flash-mark"), { opacity: 0, scale: 1.25, duration: 0.03 }, 0.26)
        .to(q(".hw-flash"), { opacity: 0, duration: 0.04 }, 0.28)

        // 3. the steps, one at a time
        .to(q(".hw-steps"), { opacity: 1, duration: 0.03 }, 0.28);

      const steps = q(".hw-step");
      steps.forEach((step, i) => {
        const at = 0.34 + i * 0.13;
        tl.to(step, { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" }, at);
        // Earlier steps stay on screen but recede, so the active one leads.
        if (i > 0) tl.to(steps[i - 1], { opacity: 0.32, duration: 0.05 }, at);
      });

      // 4. closing panel
      tl.to(q(".hw-steps"), { opacity: 0, duration: 0.04 }, 0.78)
        .to(q(".hw-close"), { opacity: 1, duration: 0.05 }, 0.78)
        .to(q(".hw-close-line"), { opacity: 1, y: 0, duration: 0.05 }, 0.84);
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".hw-intro-item, .hw-step, .hw-close-line"), { opacity: 1, y: 0 });
      gsap.set(q(".hw-steps, .hw-close"), { opacity: 1 });
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
      <MicroLabel tone="ruby" className="hw-intro-item">
        {copy.label}
      </MicroLabel>
      <h2 className="hw-intro-item" style={{ margin: 0, ...typeScale.h1 }}>
        {copy.headline}
      </h2>
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
        display: "grid",
        gridTemplateColumns: stacked ? "1fr" : "auto 1fr",
        gap: stacked ? space.md : space.xxl,
        alignItems: "start",
      }}
    >
      <div style={{ ...typeScale.numberXl, color: color.ruby, lineHeight: 0.8 }}>{step.n}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: space.md, maxWidth: "46ch" }}>
        <h3 style={{ margin: 0, ...typeScale.h2 }}>{step.title}</h3>
        <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnLightMuted }}>{step.body}</p>
      </div>
    </div>
  ));

  const closing = (
    <div
      className="hw-close-inner"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: space.xxl,
        textAlign: "center",
      }}
    >
      <div className="stride-spin" style={{ lineHeight: 0 }}>
        <StrideMark size={stacked ? 96 : 190} glowing />
      </div>
      <p
        className="hw-close-line"
        style={{ margin: 0, ...typeScale.h2, color: color.textOnDark, maxWidth: "20ch" }}
      >
        {copy.closing}
      </p>
    </div>
  );

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
          <ParticleField breakpoint={bp} tone="light" />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: layout.section }}>
            {stepList}
          </div>
        </div>
        <div
          style={{
            position: "relative",
            background: color.black,
            padding: `${layout.section} ${layout.pad}`,
          }}
        >
          <Grain opacity={0.16} />
          <div style={{ position: "relative" }}>{closing}</div>
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
          <ParticleField breakpoint={bp} tone="light" />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: space.h,
              maxWidth: 1000,
            }}
          >
            {stepList}
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

        {/* ---- closing panel ---- */}
        <div
          className="hw-close"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            background: color.black,
            padding: `0 ${layout.pad}`,
          }}
        >
          <Grain opacity={0.16} />
          <div style={{ position: "relative" }}>{closing}</div>
        </div>
      </div>
    </section>
  );
}
