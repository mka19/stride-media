import { gsap, useGsapContext, SCRUB, reveal } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { useEffect, useRef } from "react";
import { howItWorks as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { MediaTile, MicroLabel } from "../shared/primitives";
import { useBreakpoint, useStacked } from "../shared/responsive";
import FieldTexture from "./FieldTexture";
import GradientRevealText from "../shared/GradientRevealText";

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
  const stacked = useStacked();

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
          scrub: SCRUB,
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

      // The intro arrives on the way in, before the frame pins. Waiting for
      // the pin meant the white ground filled the viewport with nothing on
      // it for a whole screen of scroll as the section rose.
      //
      // It runs on its own trigger, and deliberately on a different element
      // from the pin timeline's fade-out: two scrubbed timelines writing the
      // same property fight, and whichever updated last wins.
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top bottom", end: "top top", scrub: SCRUB },
        })
        .to(q(".hw-intro-item"), { opacity: 1, y: 0, duration: 0.4, stagger: 0.06, ease: reveal.ease }, 0.45);

      // 1. The intro leaves the way it came: the same drift, the same
      //    stagger, the same curve, simply run the other way. It used to
      //    blink out over six percent of the pin with no movement at all,
      //    which read as a cut rather than as the panel retiring. The steps
      //    are already fading up underneath before it has finished, so the
      //    screen is never empty between the two.
      tl.to(
        q(".hw-intro-item"),
        { opacity: 0, y: -reveal.y, duration: 0.14, stagger: 0.04, ease: reveal.easeIn },
        0.12,
      ).to(q(".hw-steps"), { opacity: 1, duration: 0.12, ease: reveal.ease }, 0.18);

      // 2. the steps fly toward the viewer and past
      const steps = q(".hw-step");
      const first = 0.26;
      const span = (0.98 - first) / steps.length;
      steps.forEach((step, i) => {
        const at = first + i * span;

        tl.fromTo(
          step,
          { opacity: 0, scale: 0.45 },
          { opacity: 1, scale: 1, duration: span * 0.4, ease: "power2.out" },
          at,
        );

        // Past the viewer: it keeps growing as it fades, so it reads as the
        // camera going through it rather than the text simply leaving.
        //
        // The exit finishes at 0.96 of the step's own slice, and the next
        // step does not start until 1.0 — they used to run together, with
        // one step still expanding across the screen while the next was
        // already legible on top of it. It also goes much further now:
        // stopping at 1.9 read as a zoom, where carrying on past the frame
        // reads as passing through the words.
        if (i < steps.length - 1) {
          tl.to(
            step,
            { opacity: 0, scale: 3.4, duration: span * 0.41, ease: "power2.in" },
            at + span * 0.55,
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
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: rhythm.eyebrowToHeadline,
        }}
      >
        <MicroLabel className="hw-intro-item">How it works</MicroLabel>
        <GradientRevealText
        as="h2"
        tone="light"
        className="hw-intro-item"
        style={{ ...typeScale.h1, maxWidth: "18ch", textWrap: "balance" }}
      >
        {copy.headline}
        </GradientRevealText>
      </div>
      <p
        className="hw-intro-item"
        style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnLightMuted, maxWidth: "52ch" }}
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
        // Two different relationships, two different gaps: a label sits
        // close to what it labels, and body copy stands off its headline.
        // One gap for both put the label as far from the title as the
        // paragraph was.
        gap: rhythm.headlineToBody,
        maxWidth: 720,
        margin: "0 auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: rhythm.eyebrowToHeadline,
        }}
      >
        <MicroLabel number={step.n}>{step.tag}</MicroLabel>
        <h3 style={{ margin: 0, maxWidth: "24ch", textWrap: "balance", ...typeScale.h1 }}>
          {step.title}
        </h3>
      </div>
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
