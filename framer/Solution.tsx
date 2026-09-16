import { addPropertyControls, ControlType } from "framer"
import { useState } from "react";
import { gsap, useGsapContext, SCRUB } from "./gsap";
import { useInView } from "./useInView";
import { useStacked } from "./responsive";
import { solution as copy } from "./copy";
import { color, hexA, layout, rhythm, space, typeScale } from "./theme";
import { MediaTile, MicroLabel } from "./primitives";

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
  // A scroll-driven expand to full screen is excessive on a phone: the reel
  // is simply a fixed plate that plays when it comes into view.
  const stacked = useStacked();
  // The reel keeps playing for as long as it holds the screen. Once the
  // scroll carries past it and the pillars take over it stops — and it picks
  // straight back up if the visitor scrolls back into it.
  const [pastReel, setPastReel] = useState(false);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      // The entry pass and the pinned pass must not touch the same element.
      // Both are scrubbed, so whichever ScrollTrigger updated last won: the
      // entry timeline sat at progress 1 re-asserting opacity 1 and undoing
      // the pin timeline's fade-out, which left the intro copy painted on top
      // of the full-bleed video. The group animates on entry, the items
      // inside it animate under the pin.
      gsap.set(q(".sol-head"), { opacity: 0, y: 28 });
      gsap.set(q(".sol-stage"), { opacity: 0, scale: 0.94 });
      gsap.set(q(".sol-cue"), { opacity: 0, y: 10 });
      gsap.set(q(".sol-pillar"), { opacity: 0, y: 34 });
      gsap.set(q(".sol-scrim"), { opacity: 0 });

      // The contained frame starts below the header rather than at a fixed
      // percentage: the header's height depends on the viewport and the copy,
      // and a guessed percentage put the plate through the headline.
      const frame = q(".sol-frame")[0] as HTMLElement;
      const head = q(".sol-head")[0] as HTMLElement;
      const stage = q(".sol-stage")[0] as HTMLElement;

      const placeFrame = () => {
        const stageBox = stage.getBoundingClientRect();
        const headBox = head.getBoundingClientRect();

        // Fit a real 16:9 plate into what is left between the header and the
        // bottom of the frame. Fixed percentage insets produced a letterbox
        // strip: the header's height set the top edge and the percentages set
        // the rest, so the aspect was whatever happened to be left over.
        const top = headBox.bottom - stageBox.top + space.xxl;
        const availH = stageBox.height - top - space.hh;
        const availW = stageBox.width * 0.72;

        let h = Math.max(160, availH);
        let w = (h * 16) / 9;
        if (w > availW) {
          w = availW;
          h = (w * 9) / 16;
        }

        const left = (stageBox.width - w) / 2;
        gsap.set(frame, {
          top: top + Math.max(0, (availH - h) / 2),
          left,
          right: left,
          bottom: stageBox.height - (top + Math.max(0, (availH - h) / 2) + h),
          borderRadius: 10,
        });
      };

      placeFrame();

      // The section is visible from the moment it rises into the viewport,
      // well before it pins. This entry pass covers that stretch, so the
      // video arrives softly instead of appearing at the pin.
      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top bottom",
            end: "top top",
            scrub: SCRUB,
            invalidateOnRefresh: true,
            onRefresh: placeFrame,
          },
        })
        .to(q(".sol-stage"), { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 0)
        .to(q(".sol-head"), { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }, 0.3);

      // Everything from here happens while the frame is pinned.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB,
          invalidateOnRefresh: true,
          // The reel stops exactly where the pillars begin to settle over it.
          onUpdate: (self) => setPastReel(self.progress > 0.5),
          onLeaveBack: () => setPastReel(false),
        },
      });

      // 1. The frame grows to full bleed. Insets and radius animate together
      //    so the corners release exactly as the edges reach the viewport.
      // The header does not leave, it recedes. It shrinks away over exactly
      // the stretch the plate uses to grow — one movement read two ways,
      // rather than copy blinking out and a plate expanding after it. Scaled
      // from the group so the three lines stay set to each other.
      gsap.set(q(".sol-intro-group"), { transformOrigin: "50% 50%" });
      tl.to(
        q(".sol-intro-group"),
        { scale: 0.62, opacity: 0, duration: 0.3, ease: "power2.inOut" },
        0.04,
      )
        .to(
          frame,
          {
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            borderRadius: 0,
            duration: 0.3,
            ease: "power2.inOut",
          },
          0.04,
        )

        // 2. Full screen: the cue to keep going. It used to arrive six
        //    percent after the frame landed and then sit unchanged for a
        //    fifth of the section — two screens where nothing moved at all.
        .to(q(".sol-cue"), { opacity: 1, y: 0, duration: 0.07 }, 0.34)

        // 3. The pillars settle over the footage, which dims to carry them.
        .to(q(".sol-cue"), { opacity: 0, duration: 0.05 }, 0.5)
        .to(q(".sol-scrim"), { opacity: 1, duration: 0.09 }, 0.5)
        .to(q(".sol-pillar"), { opacity: 1, y: 0, duration: 0.12, stagger: 0.06 }, 0.55);
    },
    [],
    // Reduced motion: full-bleed video, header and pillars all simply present.
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".sol-head, .sol-intro, .sol-pillar"), { opacity: 1, y: 0 });
      gsap.set(q(".sol-stage"), { opacity: 1, scale: 1 });
      gsap.set(q(".sol-scrim"), { opacity: 1 });
      gsap.set(q(".sol-frame"), { top: 0, left: 0, right: 0, bottom: 0, borderRadius: 0 });
    },
  );

  if (stacked) {
    return (
      <section
        id="what-we-do"
        style={{
          background: color.black,
          color: color.textOnDark,
          fontFamily: typeScale.bodyLg.fontFamily,
          display: "flex",
          flexDirection: "column",
          gap: rhythm.headerToContent,
          padding: `${layout.section} ${layout.pad}`,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: rhythm.headlineToBody }}>
          <MicroLabel tone="accent">{copy.label}</MicroLabel>
          <h2 style={{ margin: 0, ...typeScale.h1 }}>
            {copy.headline.map((line, i) => (
              <span key={i} style={{ display: "block" }}>
                {line}
              </span>
            ))}
          </h2>
          <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted, maxWidth: "52ch" }}>
            {copy.body}
          </p>
        </div>

        <div ref={stageRef} style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
          <MediaTile
            src={videoSrc}
            poster={poster}
            seed={4}
            play={inView}
            radius={10}
            style={{ position: "absolute", inset: 0 }}
          />
        </div>

        <div
          style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: space.s }}
        >
          {/* One plain line, no controls. The film is already playing; this
              only says what the two ways on are. */}
          <span
            style={{
              ...typeScale.eyebrow,
              color: color.textOnDark,
              opacity: 0.74,
              textAlign: "center",
            }}
          >
            {copy.scrollHint}
          </span>
          <svg className="stride-pulse" width="18" height="11" viewBox="0 0 18 11" fill="none" aria-hidden="true">
            <path d="M1 1L9 9L17 1" stroke={color.accent} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: layout.section }}>
          {copy.pillars.map((pillar) => (
            <div
              key={pillar.n}
              style={{
                display: "flex",
                flexDirection: "column",
                gap: space.s,
                paddingTop: space.lg,
                borderTop: `1px solid ${color.hairlineOnDark}`,
              }}
            >
              <MicroLabel tone="accent">{pillar.n}</MicroLabel>
              <h3 style={{ margin: 0, ...typeScale.h3 }}>{pillar.title}</h3>
              <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>
                {pillar.body}
              </p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="what-we-do"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        color: color.textOnDark,
        fontFamily: typeScale.bodyLg.fontFamily,
      }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* ---- the video, contained at first, then full bleed ---- */}
        <div ref={stageRef} className="sol-stage" style={{ position: "absolute", inset: 0 }}>
          <div
            className="sol-frame"
            style={{
              position: "absolute",
              /* Fallback only — the real insets are measured on mount and on
                 every ScrollTrigger refresh, so the plate always clears the
                 header whatever the viewport does to it. */
              top: "38%",
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
              play={inView && !pastReel}
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
            padding: `calc(${layout.navHeight}px + ${layout.section}) ${layout.pad} ${layout.section}`,
            pointerEvents: "none",
          }}
        >
          <div
            className="sol-head"
            style={{
              // Centred on the frame, and held down in its lower part so the
              // plate has the middle of the screen to grow into rather than
              // sharing it with the header.
              maxWidth: "min(840px, 56vw)",
              margin: "auto auto 0",
            }}
          >
            {/* The entry pass animates .sol-head and the pinned pass animates
                this group. Two scrubbed timelines writing the same property
                on the same element fight, and whichever updated last wins —
                which is how the intro copy ended up painted over the video. */}
            <div
              className="sol-intro-group"
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                textAlign: "center",
                gap: rhythm.headlineToBody,
              }}
            >
            <MicroLabel tone="accent" className="sol-intro">
              {copy.label}
            </MicroLabel>
            <h2
              className="sol-intro"
              style={{
                margin: 0,
                maxWidth: "28ch",
                textWrap: "balance",
                ...typeScale.h1,
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
                maxWidth: "52ch",
                textWrap: "balance",
                ...typeScale.bodyLg,
                color: color.textOnDarkMuted,
              }}
            >
              {copy.body}
              </p>
            </div>
          </div>

          {/* ---- the three pillars, over the full-bleed footage ---- */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
              gap: space.lg,
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
                  gap: space.s,
                  paddingTop: space.lg,
                  borderTop: `1px solid ${color.hairlineOnDark}`,
                }}
              >
                <MicroLabel tone="accent">{pillar.n}</MicroLabel>
                <h3
                  style={{
                    margin: 0,
                    ...typeScale.h3,
                  }}
                >
                  {pillar.title}
                </h3>
                <p
                  style={{
                    margin: 0,
                    maxWidth: "34ch",
                    ...typeScale.bodyLg,
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
            // Spanned and centred by the flex, not by translateX(-50%): the
            // timeline animates this element's y, and GSAP writes the whole
            // transform — so the -50% that was centring it was overwritten
            // the moment the cue moved.
            left: 0,
            right: 0,
            bottom: space.xxl,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: space.s,
            pointerEvents: "none",
          }}
        >
          {/* One plain line, no controls. The film is already playing; this
              only says what the two ways on are. */}
          <span
            style={{
              ...typeScale.eyebrow,
              color: color.textOnDark,
              opacity: 0.74,
              textAlign: "center",
            }}
          >
            {copy.scrollHint}
          </span>
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
              stroke={color.accent}
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

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(Solution, {
  videoSrc: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"], title: "Reel" },
  poster: { type: ControlType.File, allowedFileTypes: ["jpg", "png"], title: "Poster" },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "420vh" },
});
