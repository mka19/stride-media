import { gsap, useGsapContext } from "../shared/gsap";
import { useInView } from "../shared/useInView";
import { solution as copy } from "../shared/copy";
import { color, fluid, font, hexA, layout } from "../shared/theme";
import { MediaTile, MicroLabel } from "../shared/primitives";

/**
 * Solution / What We Do.
 *
 * The centrepiece is one landscape video of client work. It arrives softly
 * as the section is entered, held in a contained frame, then expands to fill
 * the screen edge to edge as the scroll continues. Once it is full bleed a
 * "scroll for more" cue appears, and the three pillars settle over the top
 * of it before the section releases into what follows.
 *
 * The video autoplays muted from the moment it enters, and only while the
 * section is on screen.
 */
export default function Solution({
  /** Landscape client reel. Falls back to a generated cinematic fill. */
  videoSrc,
  poster,
  scrollLength = "420vh",
}: {
  videoSrc?: string;
  poster?: string;
  scrollLength?: string;
}) {
  // The reel starts once the section is half on screen, and only then.
  const { ref: stageRef, inView } = useInView<HTMLDivElement>({ threshold: 0.5 }, false);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      gsap.set(q(".sol-intro"), { opacity: 0, y: 28 });
      gsap.set(q(".sol-stage"), { opacity: 0, scale: 0.94 });
      gsap.set(q(".sol-cue"), { opacity: 0, y: 10 });
      gsap.set(q(".sol-pillar"), { opacity: 0, y: 34 });
      gsap.set(q(".sol-scrim"), { opacity: 0 });

      // The section is visible from the moment it rises into the viewport,
      // well before it pins. This entry pass covers that stretch, so the
      // video arrives softly instead of appearing at the pin.
      gsap
        .timeline({
          scrollTrigger: { trigger: root, start: "top bottom", end: "top top", scrub: 0.7 },
        })
        .to(q(".sol-stage"), { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 0)
        .to(q(".sol-intro"), { opacity: 1, y: 0, duration: 0.4, stagger: 0.06 }, 0.3);

      // Everything from here happens while the frame is pinned.
      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.7 },
      });

      // 1. The frame grows to full bleed. Insets and radius animate together
      //    so the corners release exactly as the edges reach the viewport.
      tl.to(q(".sol-intro"), { opacity: 0, y: -24, duration: 0.1 }, 0.06)
        .to(
          q(".sol-frame"),
          {
            top: "0%",
            left: "0%",
            right: "0%",
            bottom: "0%",
            borderRadius: 0,
            duration: 0.3,
            ease: "power2.inOut",
          },
          0.06,
        )

        // 2. Full screen: the cue to keep going.
        .to(q(".sol-cue"), { opacity: 1, y: 0, duration: 0.08 }, 0.42)

        // 3. The pillars settle over the footage, which dims to carry them.
        .to(q(".sol-cue"), { opacity: 0, duration: 0.06 }, 0.62)
        .to(q(".sol-scrim"), { opacity: 1, duration: 0.1 }, 0.62)
        .to(q(".sol-pillar"), { opacity: 1, y: 0, duration: 0.12, stagger: 0.05 }, 0.66);
    },
    [],
    // Reduced motion: full-bleed video, header and pillars all simply present.
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".sol-intro, .sol-pillar"), { opacity: 1, y: 0 });
      gsap.set(q(".sol-stage"), { opacity: 1, scale: 1 });
      gsap.set(q(".sol-scrim"), { opacity: 1 });
      gsap.set(q(".sol-frame"), { top: "0%", left: "0%", right: "0%", bottom: "0%", borderRadius: 0 });
    },
  );

  return (
    <section
      id="what-we-do"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        color: color.textOnDark,
        fontFamily: font.sans,
      }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* ---- the video, contained at first, then full bleed ---- */}
        <div ref={stageRef} className="sol-stage" style={{ position: "absolute", inset: 0 }}>
          <div
            className="sol-frame"
            style={{
              position: "absolute",
              /* Starting frame: a landscape plate sitting clear of the
                 header above it, roughly 16:9 at desktop widths. */
              top: "32%",
              left: "22%",
              right: "22%",
              bottom: "14%",
              borderRadius: 10,
              overflow: "hidden",
            }}
          >
            <MediaTile
              src={videoSrc}
              poster={poster}
              seed={4}
              play={inView}
              style={{ position: "absolute", inset: 0 }}
            />
            {/* Dims only once the pillars need to sit on top. */}
            <div
              className="sol-scrim"
              aria-hidden="true"
              style={{
                position: "absolute",
                inset: 0,
                background: `linear-gradient(180deg, ${hexA(color.black, 0.5)} 0%, ${hexA(color.black, 0.82)} 100%)`,
              }}
            />
          </div>
        </div>

        {/* ---- header, retires as the video takes the screen ---- */}
        <div
          style={{
            position: "relative",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: `clamp(96px, 13vh, 150px) ${layout.pad} clamp(48px, 7vh, 88px)`,
            pointerEvents: "none",
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: 22, maxWidth: "min(620px, 52vw)" }}>
            <MicroLabel tone="ruby" className="sol-intro">
              {copy.label}
            </MicroLabel>
            <h2
              className="sol-intro"
              style={{
                margin: 0,
                fontFamily: font.display,
                fontWeight: 500,
                fontSize: fluid(30, 68),
                lineHeight: 0.98,
                letterSpacing: "-0.04em",
              }}
            >
              {copy.headline.map((line, i) => (
                <span key={i} style={{ display: "block" }}>
                  {line}
                </span>
              ))}
            </h2>
            <p
              className="sol-intro"
              style={{
                margin: 0,
                maxWidth: "46ch",
                fontSize: fluid(14, 17),
                lineHeight: 1.6,
                color: color.textOnDarkMuted,
              }}
            >
              {copy.body}
            </p>
          </div>

          {/* ---- the three pillars, over the full-bleed footage ---- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: "clamp(20px, 3vw, 56px)",
              alignItems: "start",
            }}
          >
            {copy.pillars.map((pillar) => (
              <div
                key={pillar.n}
                className="sol-pillar"
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12,
                  paddingTop: 20,
                  borderTop: `1px solid ${color.hairlineOnDark}`,
                }}
              >
                <MicroLabel tone="ruby">{pillar.n}</MicroLabel>
                <h3
                  style={{
                    margin: 0,
                    fontFamily: font.display,
                    fontWeight: 500,
                    fontSize: fluid(19, 28),
                    lineHeight: 1.1,
                    letterSpacing: "-0.03em",
                  }}
                >
                  {pillar.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    maxWidth: "34ch",
                    fontSize: fluid(13, 15),
                    lineHeight: 1.6,
                    color: color.textOnDarkMuted,
                  }}
                >
                  {pillar.body}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* ---- scroll cue, only while the video holds the screen ---- */}
        <div
          className="sol-cue"
          style={{
            position: "absolute",
            left: "50%",
            bottom: 34,
            transform: "translateX(-50%)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            pointerEvents: "none",
          }}
        >
          <MicroLabel tone="dark" style={{ color: color.textOnDark }}>
            {copy.scrollHint}
          </MicroLabel>
          <svg
            className="stride-pulse"
            width="18"
            height="11"
            viewBox="0 0 18 11"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M1 1L9 9L17 1"
              stroke={color.ruby}
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>
    </section>
  );
}
