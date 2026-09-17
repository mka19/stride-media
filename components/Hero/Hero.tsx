import { useRef, useState } from "react";
import { gsap, ScrollTrigger, useGsapContext, SCRUB } from "../shared/gsap";
import { hero as heroCopy } from "../shared/copy";
import { color, ease, glow, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { GlowButton, Grain, MicroLabel } from "../shared/primitives";
import { useBreakpoint, useCanHover } from "../shared/responsive";
import GradientRevealText from "../shared/GradientRevealText";
import SocialProof from "../shared/SocialProof";
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
  /** Client photographs for the proof row. Gaps render as tinted discs. */
  clientFaces = [],
  scrollLength = "320vh",
}: {
  tiles?: MosaicTile[];
  clientFaces?: string[];
  scrollLength?: string;
}) {
  const objectRef = useRef<HeroObjectHandle | null>(null);
  const [interactive, setInteractive] = useState(false);
  // The headline decodes at the point the object hands the screen over to it.
  const bp = useBreakpoint();
  const canHover = useCanHover();
  // The object steps down with the viewport; the mosaic's push needs a real
  // pointer, so on touch it becomes a single quiet backdrop instead.

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      const lines = q(".hero-line-inner");

      // The headline emerges from where the object was rather than sliding
      // in: it scales up from slightly smaller as the object fades away.
      gsap.set(lines, { yPercent: 112, scale: 0.985, opacity: 0, transformOrigin: "50% 50%" });
      gsap.set(q(".hero-mosaic"), { opacity: 0, scale: 1.14 });
      gsap.set(q(".hero-tail"), { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB,
          onUpdate: (self) => {
            // Finish the expensive particle hand-off promptly, then let the
            // headline composition breathe for the rest of the pinned scene.
            objectRef.current?.setProgress(gsap.utils.clamp(0, 1, self.progress / 0.43));
            // Hover push only once the mosaic has actually arrived.
            setInteractive(self.progress > 0.54);
          },
        },
      });

      tl.to(q(".hero-mosaic"), { opacity: 1, scale: 1, duration: 0.46, ease: "power2.out" }, 0.12)
        .to(q(".hero-veil"), { opacity: 0.68, duration: 0.38 }, 0.14)
        .to(
          lines,
          { yPercent: 0, scale: 1, opacity: 1, duration: 0.3, stagger: 0.055, ease: "power3.out" },
          0.18,
        )
        .to(q(".hero-glow"), { opacity: 1, duration: 0.34 }, 0.22)
        .to(q(".hero-tail"), { opacity: 1, y: 0, duration: 0.26, stagger: 0.04 }, 0.37)
        .to(q(".hero-intro"), { opacity: 0, y: -20, duration: 0.25 }, 0.05)
        .to(q(".hero-hint"), { opacity: 0, duration: 0.2 }, 0.05);

      // Parallax on the mosaic itself, not on the sticky frame. Moving the
      // frame lifted it clear of the section's own bottom edge and left a
      // band of bare background showing under it at the hand-off.
      gsap.to(q(".hero-mosaic"), {
        yPercent: -6,
        ease: "none",
        scrollTrigger: { trigger: root, start: "bottom bottom", end: "bottom top", scrub: SCRUB },
      });

      return () => ScrollTrigger.refresh();
    },
    [],
    // Reduced motion: land on the phase-3 composition immediately, no scrub.
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".hero-line-inner"), { yPercent: 0, scale: 1, opacity: 1 });
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
        fontFamily: typeScale.bodyLg.fontFamily,
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
              radial-gradient(120% 80% at 50% 42%, ${hexA(color.accentDeep, 0.38)} 0%, transparent 62%),
              radial-gradient(90% 60% at 12% 105%, ${hexA(color.accent, 0.18)} 0%, transparent 70%),
              linear-gradient(180deg, ${color.black} 0%, ${color.ink} 55%, ${color.black} 100%)
            `,
          }}
        />

        {/* Layer 1 — video mosaic (phase 2 arrival, phase 3 hover) */}
        <div className="hero-mosaic" style={{ position: "absolute", inset: 0 }}>
          <VideoMosaic
            tiles={tiles}
            interactive={interactive && canHover}
            columns={bp === "mobile" ? 1 : bp === "tablet" ? 6 : 12}
            rows={bp === "mobile" ? 1 : bp === "tablet" ? 3 : 4}
          />
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
          {/* The canvas fills the frame. It used to be a square the size of
              the mark, which clipped the dissolve — the particles travel
              outward and stopped dead at the box's edges. */}
          <div style={{ position: "absolute", inset: 0 }}>
            <HeroObject handleRef={objectRef} breakpoint={bp} liquidBackground />
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
            padding: `19vh ${layout.pad} 16vh`,
          }}
        >
          <MicroLabel tone="accent">{heroCopy.label}</MicroLabel>
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
            gap: 0,
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
              background: `radial-gradient(50% 50% at 50% 50%, ${hexA(color.accent, 0.45)} 0%, transparent 70%)`,
              pointerEvents: "none",
            }}
          />

          <SocialProof
            className="hero-tail"
            count={heroCopy.proofCount}
            label={heroCopy.proofLabel}
            faces={clientFaces}
            /* It labels the headline, so it takes the eyebrow gap. */
            style={{ marginBottom: rhythm.eyebrowToHeadline }}
          />
          <h1
            style={{
              position: "relative",
              margin: 0,
              marginBottom: rhythm.headlineToBody,
              maxWidth: "26ch",
              ...typeScale.displayLg,
              ...(bp === "mobile" ? { fontSize: "clamp(29px, 8vw, 34px)", lineHeight: "clamp(33px, 9vw, 38px)" } : {}),
              textWrap: "balance",
            }}
          >
            {heroCopy.headline.map((line, i) => (
              <span key={i} style={{ display: "block", overflow: "hidden" }}>
                <GradientRevealText
                  as="span"
                  tone="dark"
                  className="hero-line-inner"
                  style={{
                    display: "block",
                    textShadow: i === heroCopy.headline.length - 1 ? glow.textSoft : undefined,
                  }}
                >
                  {line}
                </GradientRevealText>
              </span>
            ))}
          </h1>

          <p
            className="hero-tail"
            style={{
              position: "relative",
              margin: 0,
              marginBottom: rhythm.bodyToCta,
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
              height: 48,
              background: `linear-gradient(180deg, ${hexA(color.accent, 0.9)}, transparent)`,
              transition: `opacity 400ms ${ease.out}`,
            }}
          />
        </div>
      </div>
    </section>
  );
}
