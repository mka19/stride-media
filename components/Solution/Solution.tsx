import { gsap, useGsapContext } from "../shared/gsap";
import { useInView } from "../shared/useInView";
import { useStacked } from "../shared/responsive";
import { solution as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
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
  // A scroll-driven expand to full screen is excessive on a phone: the reel
  // is simply a fixed plate that plays when it comes into view.
  const stacked = useStacked();

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
            scrub: 0.7,
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
          scrub: 0.7,
          invalidateOnRefresh: true,
        },
      });

      // 1. The frame grows to full bleed. Insets and radius animate together
      //    so the corners release exactly as the edges reach the viewport.
      tl.to(q(".sol-intro"), { opacity: 0, y: -24, duration: 0.08, stagger: 0.02 }, 0.04)
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
          {/* Two ways on: take the film in full, or keep going. */}
          <div style={{ display: "flex", alignItems: "center", gap: space.s, pointerEvents: "auto" }}>
            <button
              type="button"
              onClick={() => {
                const v = stageRef.current?.querySelector("video");
                if (v?.requestFullscreen) void v.requestFullscreen();
                else v?.play();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: space.sm,
                height: 40,
                padding: `0 ${space.md}px`,
                borderRadius: 8,
                cursor: "pointer",
                border: "none",
                background: color.boneSoft,
                color: color.textOnLight,
                ...typeScale.eyebrow,
                fontWeight: 500,
              }}
            >
              <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
                <path d="M0 0l11 6-11 6V0z" fill="currentColor" />
              </svg>
              {copy.watchFull}
            </button>
            <MicroLabel tone="dark" style={{ color: color.textOnDark }}>
              {copy.scrollHint}
            </MicroLabel>
          </div>
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
            padding: `calc(${layout.navHeight}px + ${layout.section}) ${layout.pad} ${layout.section}`,
            pointerEvents: "none",
          }}
        >
          <div
            className="sol-head"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: rhythm.headlineToBody,
              maxWidth: "min(840px, 56vw)",
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
          {/* Two ways on: take the film in full, or keep going. */}
          <div style={{ display: "flex", alignItems: "center", gap: space.s, pointerEvents: "auto" }}>
            <button
              type="button"
              onClick={() => {
                const v = stageRef.current?.querySelector("video");
                if (v?.requestFullscreen) void v.requestFullscreen();
                else v?.play();
              }}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: space.sm,
                height: 40,
                padding: `0 ${space.md}px`,
                borderRadius: 8,
                cursor: "pointer",
                border: "none",
                background: color.boneSoft,
                color: color.textOnLight,
                ...typeScale.eyebrow,
                fontWeight: 500,
              }}
            >
              <svg width="11" height="12" viewBox="0 0 11 12" aria-hidden="true">
                <path d="M0 0l11 6-11 6V0z" fill="currentColor" />
              </svg>
              {copy.watchFull}
            </button>
            <MicroLabel tone="dark" style={{ color: color.textOnDark }}>
              {copy.scrollHint}
            </MicroLabel>
          </div>
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
