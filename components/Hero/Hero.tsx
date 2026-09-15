import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGsapContext } from "../shared/gsap";
import { hero as heroCopy } from "../shared/copy";
import { color, ease, glow, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { GlowButton, Grain, MicroLabel } from "../shared/primitives";
import HeroObject, { type HeroObjectHandle } from "./HeroObject";
import VideoMosaic, { type MosaicTile } from "./VideoMosaic";

/**
 * Hero — three phases across one tall scroll, pinned with position: sticky.
 *
 *   Phase 1 (load)        The 3D glow element alone on a grainy gradient.
 *   Phase 2 (scroll)      It dissolves into the headline as the video mosaic
 *                         rises behind it.
 *   Phase 3 (interactive) Mosaic takes hover: tiles push and compress.
 *
 * The scroll distance is one scrub timeline on the outer section; the inner
 * frame stays stuck to the viewport for its duration. Sticky rather than
 * ScrollTrigger.pin so the section survives being dropped into a Framer page
 * next to other pinned components without fighting them for the scroller.
 */
export default function Hero({
  /** Real client footage, top-left to bottom-right; gaps render as cinematic fills. */
  tiles = [],
  scrollLength = "320vh",
}: {
  tiles?: MosaicTile[];
  scrollLength?: string;
}) {
  const objectRef = useRef<HeroObjectHandle | null>(null);
  const [interactive, setInteractive] = useState(false);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      const frame = q(".hero-frame")[0] as HTMLElement;
      const lines = q(".hero-line-inner");

      // The headline emerges from where the object was rather than sliding
      // in: it scales up from slightly smaller as the object fades away.
      gsap.set(lines, { scale: 0.88, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(q(".hero-mosaic"), { opacity: 0, scale: 1.14 });
      gsap.set(q(".hero-tail"), { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => {
            // Feed the dissolve. 0 -> 1 across the first 55% of the scroll.
            objectRef.current?.setProgress(gsap.utils.clamp(0, 1, self.progress / 0.55));
            // Hover push only once the mosaic has actually arrived.
            setInteractive(self.progress > 0.62);
          },
        },
      });

      tl.to(q(".hero-mosaic"), { opacity: 1, scale: 1, duration: 0.55, ease: "power2.out" }, 0.18)
        .to(q(".hero-veil"), { opacity: 0.55, duration: 0.5 }, 0.2)
        .to(
          lines,
          { scale: 1, opacity: 1, duration: 0.42, stagger: 0.07, ease: "power3.out" },
          0.3,
        )
        .to(q(".hero-glow"), { opacity: 1, duration: 0.4 }, 0.34)
        .to(q(".hero-tail"), { opacity: 1, y: 0, duration: 0.3, stagger: 0.05 }, 0.52)
        .to(q(".hero-intro"), { opacity: 0, y: -20, duration: 0.25 }, 0.05)
        .to(q(".hero-hint"), { opacity: 0, duration: 0.2 }, 0.05);

      // Subtle parallax on the mosaic as the hero hands off to the Problem.
      gsap.to(frame, {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: root, start: "bottom bottom", end: "bottom top", scrub: true },
      });

      return () => ScrollTrigger.refresh();
    },
    [],
    // Reduced motion: land on the phase-3 composition immediately, no scrub.
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".hero-line-inner"), { scale: 1, opacity: 1 });
      gsap.set(q(".hero-mosaic"), { opacity: 1, scale: 1 });
      gsap.set(q(".hero-veil"), { opacity: 0.55 });
      gsap.set(q(".hero-tail, .hero-glow"), { opacity: 1, y: 0 });
      gsap.set(q(".hero-intro, .hero-hint"), { opacity: 0 });
      objectRef.current?.setProgress(1);
      setInteractive(true);
    },
  );

  return (
    <section
      id="top"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        color: color.textOnDark,
        fontFamily: typeScale.body.fontFamily,
      }}
    >
      <div
        className="hero-frame"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          isolation: "isolate",
        }}
      >
        {/* Layer 0 — warm, noisy gradient ground */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            background: `
              radial-gradient(120% 80% at 50% 42%, ${hexA(color.rubyDeep, 0.38)} 0%, transparent 62%),
              radial-gradient(90% 60% at 12% 105%, ${hexA(color.ruby, 0.18)} 0%, transparent 70%),
              linear-gradient(180deg, ${color.black} 0%, ${color.ink} 55%, ${color.black} 100%)
            `,
          }}
        />

        {/* Layer 1 — video mosaic (phase 2 arrival, phase 3 hover) */}
        <div className="hero-mosaic" style={{ position: "absolute", inset: 0 }}>
          <VideoMosaic tiles={tiles} interactive={interactive} />
        </div>

        {/* Layer 2 — veil that keeps type legible over moving footage */}
        <div
          className="hero-veil"
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            opacity: 0,
            pointerEvents: "none",
            background: `linear-gradient(180deg, ${hexA(color.black, 0.8)} 0%, ${hexA(color.black, 0.35)} 45%, ${hexA(color.black, 0.92)} 100%)`,
          }}
        />

        {/* Layer 3 — the 3D element */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div style={{ width: "min(600px, 66vw)", height: "min(600px, 62vh)" }}>
            <HeroObject handleRef={objectRef} />
          </div>
        </div>

        <Grain opacity={0.14} />

        {/* Layer 4 — phase 1 minimal text, retires as the dissolve begins */}
        <div
          className="hero-intro"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            /* Label above the object, supporting line below it — the object
               owns the middle of the screen in phase 1. */
            justifyContent: "space-between",
            pointerEvents: "none",
            padding: `16vh ${layout.pad} 18vh`,
          }}
        >
          <MicroLabel tone="ruby">{heroCopy.label}</MicroLabel>
          <div
            style={{
              ...typeScale.bodyLg,
              color: color.textOnDarkMuted,
              maxWidth: 640,
              textAlign: "center",
            }}
          >
            {heroCopy.sub}
          </div>
        </div>

        {/* Layer 5 — centred headline block, Google Flow style (phase 2/3) */}
        <div
          className="hero-copy"
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: rhythm.headlineToBody,
            padding: `0 ${layout.pad}`,
            pointerEvents: "none",
          }}
        >
          {/* The glow sits behind the headline, not on it. */}
          <div
            className="hero-glow"
            aria-hidden="true"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              transform: "translate(-50%, -50%)",
              width: "min(920px, 80vw)",
              height: "44vh",
              opacity: 0,
              filter: "blur(90px)",
              background: `radial-gradient(50% 50% at 50% 50%, ${hexA(color.ruby, 0.45)} 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <h1
            style={{
              position: "relative",
              margin: 0,
              maxWidth: "17ch",
              ...typeScale.displayXl,
              textWrap: "balance",
            }}
          >
            {heroCopy.headline.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                <span
                  className="hero-line-inner"
                  style={{
                    display: "block",
                    textShadow: i === heroCopy.headline.length - 1 ? glow.textSoft : undefined,
                  }}
                >
                  {line}
                </span>
              </span>
            ))}
          </h1>

          <p
            className="hero-tail"
            style={{
              position: "relative",
              margin: 0,
              maxWidth: 640,
              ...typeScale.bodyLg,
              color: color.textOnDarkMuted,
            }}
          >
            {heroCopy.sub}
          </p>

          <div
            className="hero-tail"
            style={{ position: "relative", pointerEvents: "auto", marginTop: space.sm }}
          >
            <GlowButton href="#contact">{heroCopy.cta}</GlowButton>
          </div>
        </div>

        {/* Phase 1 scroll cue */}
        <div
          className="hero-hint"
          style={{
            position: "absolute",
            left: "50%",
            bottom: space.xxl,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: space.s,
            pointerEvents: "none",
          }}
        >
          <span
            style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted }}
          >
            {heroCopy.scrollHint}
          </span>
          <span
            className="stride-scroll-line"
            style={{
              width: 1,
              height: 46,
              background: `linear-gradient(180deg, ${hexA(color.ruby, 0.9)}, transparent)`,
              transition: `opacity 400ms ${ease.out}`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
