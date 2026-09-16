import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef } from "react";
import { gsap, useGsapContext, SCRUB } from "./gsap";
import { registerSurface, type SurfaceHandle } from "./surface";
import { caseStudy as copy } from "./copy";
import { color, ease, hexA, layout, numberGradient, rhythm, space, typeScale } from "./theme";
import { Grain, MediaTile, MicroLabel } from "./primitives";
import GradientRevealText from "./GradientRevealText";
import HoverBadge from "./HoverBadge";
import SlatCurtain, { type SlatHandle } from "./SlatCurtain";
import { useStacked } from "./responsive";

/**
 * Case Study — sondaven.com reference.
 *
 *   1. Dark atmospheric intro, grain and a soft glow behind the headline.
 *   2. The ground turns warm neutral and the collage scrolls diagonally from
 *      bottom-right to upper-left, each image on its own depth so they
 *      overlap rather than travelling as one block. Captions counter nothing
 *      — the images are never rotated — so they stay readable.
 *   3. The gallery clears into the metrics chapter.
 *   4. The metrics chapter arrives on a new ground.
 *
 * On phones the diagonal parallax is dropped for a swipeable row, since
 * scroll-driven diagonal movement reads as drift on a narrow viewport.
 */
export default function CaseStudy({
  gallery = [],
  curtainImage,
  scrollLength = "760vh",
}: {
  gallery?: string[];
  /**
   * Optional still carried by the curtain at both ends of the section. With
   * one, the slats are slices of the picture and it comes apart as they
   * retract; without one they are a plain plate, as before.
   */
  curtainImage?: string;
  scrollLength?: string;
}) {
  const surface = useRef<SurfaceHandle | null>(null);
  const slats = useRef<SlatHandle | null>(null);
  const slatsOut = useRef<SlatHandle | null>(null);
  const stacked = useStacked();

  // Three staggered rows, sized and spaced so no two plates ever touch, and
  // all of them travelling at the same rate.
  //
  // They used to each have their own speed, which is what made them overlap:
  // a faster plate catches a slower one and crosses it. Their positions are
  // fixed relative to each other now and the whole arrangement moves as one
  // sheet, so what is laid out clear stays clear for the whole crossing.
  // Widths are a share of the frame and the rows are far enough apart that
  // even a 21:9 viewport, where a plate is at its tallest, leaves a gap.
  // Six: the conveyor shows three at a time, so six is two full turns of
  // it — enough to read as a body of work without becoming a slideshow.
  const plates = copy.gallery.slice(0, 6).map((item, i) => ({
    ...item,
    src: gallery[i],
    // Two to a row, four rows deep. The field is taller than the frame on
    // purpose: the sheet travels up through it, so the lower rows are still
    // below the fold when the first ones are being read.
    // Every plate's right edge stays inside the frame — one of them used to
    // sit at 78% with a 23% width and hung over the edge for its whole pass.
    // A diagonal walk: each plate sits off the last one's corner, so the
    // next always arrives across from the one leaving rather than beside it.
    x: [8, 52, 14, 58, 6, 50, 16, 54][i % 8],
    y: [10, 38, 44, 12, 30, 52, 8, 36][i % 8],
    w: 34,
  }));

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      // The gallery owns this slice of the scroll and nothing else overlaps
      // it, so the plates are gone before the results chapter is readable.
      const GALLERY_IN = 0.34;
      const GALLERY_OUT = 0.74;

      // The line is already in place under the curtain — the slats retracting
      // are what reveals it. Fading it up underneath would be two reveals of
      // the same words.
      gsap.set(q(".cs-metrics"), { opacity: 0 });
      gsap.set(q(".cs-results-head"), { opacity: 0, y: 30 });
      gsap.set(q(".cs-metric"), { opacity: 0, y: 64 });

      // Each figure starts at zero and is counted up to its real value the
      // first time the chapter is reached. Running it on the scrub instead
      // would make the numbers walk backwards whenever the visitor scrolls
      // up, which reads as a glitch rather than a tally.
      const plateEls = q(".cs-plate") as HTMLElement[];
      const digits = q(".cs-num") as HTMLElement[];
      digits.forEach((node) => {
        node.textContent = (0).toFixed(Number(node.dataset.dec ?? 0));
      });

      let counted = false;
      const countUp = () => {
        if (counted) return;
        counted = true;
        digits.forEach((node, i) => {
          const to = Number(node.dataset.to ?? 0);
          const dec = Number(node.dataset.dec ?? 0);
          const tally = { v: 0 };
          gsap.to(tally, {
            v: to,
            duration: 1.5,
            delay: i * 0.08,
            ease: "power2.out",
            onUpdate: () => {
              node.textContent = tally.v.toFixed(dec);
            },
          });
        });
      };

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB,
          onUpdate: (self) =>
            surface.current?.setTone(self.progress < 0.34 ? "light" : "dark"),
        },
      });

      // 1. The screen is covered in slats over a white ground. They pull back
      //    from the middle outward and the line is left standing in the
      //    clearing — sondaven.com's reveal.
      const curtain = { p: 0 };
      tl.to(
        curtain,
        {
          p: 1,
          duration: 0.22,
          ease: "none",
          onUpdate: () => slats.current?.setProgress(curtain.p),
        },
        0.02,
      )

        // 2. The line leaves and the ground turns over: white to black, which
        //    is the ground the plates travel across.
        .to(q(".cs-intro"), { opacity: 0, duration: 0.06 }, 0.3)
        // The curtain finishes at 0.24 and the ground waits until 0.3, so the
        // last bar is gone before the white starts going anywhere.
        .to(q(".cs-white"), { opacity: 0, duration: 0.08, ease: "power2.inOut" }, 0.3);

      /*
       * The conveyor.
       *
       * One card is the subject at any moment. It arrives from the bottom
       * right, crosses to the centre, and carries on out of the top left.
       * The next one starts its own crossing exactly when the one ahead
       * reaches the middle, so the frame reads: half a card arriving in the
       * bottom-right corner, the subject in the centre, half a card leaving
       * through the top-left corner. Never two subjects at once.
       *
       * Each card gets one tween across the whole diagonal rather than an
       * entrance and an exit stitched together, because a scrub shows the
       * seam between two tweens as a hesitation in the middle of the travel
       * — which is exactly where the eye is.
       */
      const TRAVEL = (GALLERY_OUT - GALLERY_IN) / (plateEls.length * 0.25 + 0.75);
      // A quarter of its own travel between one card and the next: at that
      // spacing the card behind is a quarter in (half out of frame at the
      // bottom right) when the one ahead is at the centre.
      const STEP = TRAVEL * 0.25;

      plateEls.forEach((plate, i) => {
        const at = GALLERY_IN + i * STEP;

        // Far enough that the ends of the diagonal are off the frame
        // entirely, so half of the travel is spent half-visible in a corner
        // rather than sitting just inside the edge.
        gsap.set(plate, { xPercent: -50, yPercent: -50, force3D: true });

        tl.fromTo(
          plate,
          { x: "78vw", y: "72vh", scale: 0.74, opacity: 0 },
          {
            x: "-78vw",
            y: "-72vh",
            scale: 0.74,
            opacity: 0,
            duration: TRAVEL,
            ease: "none",
            force3D: true,
          },
          at,
        );

        // Size and presence peak in the middle of that travel and fall away
        // again, so the subject is the biggest and the brightest thing in
        // the frame and the two corners are plainly on their way somewhere.
        // Linear on purpose. On an eased rise the card in the bottom-right
        // corner was already at nine tenths of full presence by the time it
        // was a quarter of the way in, so two cards read as the subject at
        // once. Straight lines put it at exactly half — half the presence,
        // half out of the frame — which is what the corner is for.
        tl.to(plate, { scale: 1, opacity: 1, duration: TRAVEL * 0.5, ease: "none" }, at)
          .to(
            plate,
            { scale: 0.74, opacity: 0, duration: TRAVEL * 0.5, ease: "none" },
            at + TRAVEL * 0.5,
          );
      });

      // 3. the collage clears, and only then does the metrics chapter open —
      //    behind the same curtain the section opened with, so the two ends
      //    of it are the same device rather than two different transitions.
      const curtainOut = { p: 0 };
      tl.set(q(".cs-metrics"), { opacity: 1 }, GALLERY_OUT).to(
        curtainOut,
        {
          p: 1,
          duration: 0.16,
          ease: "none",
          onUpdate: () => slatsOut.current?.setProgress(curtainOut.p),
        },
        GALLERY_OUT,
      );

      tl
        
        // 4. the headline lands in the centre of the empty frame
        .to(
          q(".cs-results-head"),
          { opacity: 1, y: 0, duration: 0.06, stagger: 0.02, ease: "power2.out" },
          0.68,
        )

        // 5. the numbers rise from below their rule, one after another
        .to(
          q(".cs-metric"),
          { opacity: 1, y: 0, duration: 0.07, stagger: 0.035, ease: "power3.out" },
          0.76,
        )

        // 6. and count up to their value once they are in place
        .call(countUp, undefined, GALLERY_OUT + 0.1)

        // A held tail so the finished chapter is readable before the section
        // hands over, and so the positions above stay a fixed share of the
        // scroll rather than drifting with the last tween.
        .to({}, { duration: 0.02 }, 0.98);
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".cs-intro-item, .cs-metric, .cs-results-head"), { opacity: 1, y: 0, scale: 1 });
      gsap.set(q(".cs-metrics"), { opacity: 1 });
      gsap.set(q(".cs-white"), { opacity: 0 });
      slats.current?.setProgress(1);
      slatsOut.current?.setProgress(1);
      gsap.set(q(".cs-plate"), { opacity: 1, scale: 1, x: 0, y: 0 });
    },
  );

  useEffect(() => {
    const frame = rootRef.current?.querySelector<HTMLElement>(".cs-frame");
    if (!frame) return;
    const handle = registerSurface(frame, "dark");
    surface.current = handle;
    return () => {
      handle.release();
      surface.current = null;
    };
  }, [rootRef, stacked]);

  const headline = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        gap: rhythm.headlineToBody,
        maxWidth: 900,
      }}
    >
      <MicroLabel tone="light" className="cs-intro-item">
        {copy.label}
      </MicroLabel>
      <h2 className="cs-intro-item" style={{ margin: 0, ...typeScale.h1 }}>
        {copy.headline.map((line, i) => (
          <GradientRevealText key={i} as="span" tone="light" style={{ display: "block" }}>
            {line}
          </GradientRevealText>
        ))}
      </h2>
      <p
        className="cs-intro-item"
        style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnLightMuted, maxWidth: "48ch" }}
      >
        {copy.intro}
      </p>
    </div>
  );

  const metrics = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: stacked ? "1fr" : "repeat(4, 1fr)",
        gap: layout.gutter,
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {copy.metrics.map((m, i) => (
        <div
          key={m.label}
          className="cs-metric"
          style={{
            // A panel per figure: label at the head, the number set large
            // under it, and the sentence on the floor of the card, so the
            // three read as three registers rather than as a stack.
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: space.h,
            minHeight: 300,
            padding: `${space.lg}px`,
            borderRadius: 12,
            background: hexA(color.textOnLight, 0.04),
            textAlign: "left",
            transition: `background ${ease.hoverMs}ms ${ease.hover}`,
          }}
          /* One colour rising from the floor of the card, at an alpha you
             notice only next to a card that does not have it. The old hover
             was a lavender wash across the whole plate with a second stop
             fading out of it, which read as a gradient applied to a card
             rather than as the card responding. */
          onMouseEnter={(e) => {
            e.currentTarget.style.background = `linear-gradient(0deg, ${hexA(color.accent, 0.1)} 0%, ${hexA(color.textOnLight, 0.04)} 62%)`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = hexA(color.textOnLight, 0.04);
          }}
        >
          {/* Two lines, and the room for two whether or not the words need
              it, so the figures under them all start at the same height. */}
          <div
            style={{
              ...typeScale.h3,
              color: color.textOnLight,
              maxWidth: "12ch",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {m.label}
          </div>

          <div
            style={{
              ...typeScale.numberXl,
              ...numberGradient,
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span className="cs-num" data-to={m.value} data-dec={m.value.includes(".") ? 1 : 0}>
              {m.value}
            </span>
            {m.suffix}
          </div>

          <p
            style={{
              margin: 0,
              ...typeScale.bodyLg,
              color: color.textOnLightMuted,
              maxWidth: "26ch",
              display: "-webkit-box",
              WebkitBoxOrient: "vertical",
              WebkitLineClamp: 2,
              overflow: "hidden",
            }}
          >
            {copy.metricNotes?.[i] ?? ""}
          </p>
        </div>
      ))}
    </div>
  );

  if (stacked) {
    return (
      /* The ground is light here, as it is in the scrolled version: every
         block in this branch — the headline, the results label, the metric
         cards — is drawn in dark ink. On the black ground it used to carry,
         the headline was very nearly invisible. */
      <section
        id="case-study"
        style={{ background: color.bone, color: color.textOnLight, fontFamily: typeScale.bodyLg.fontFamily }}
      >
        <div style={{ position: "relative", padding: `${layout.section} ${layout.pad}` }}>
          <Grain opacity={0.18} />
          <div style={{ position: "relative", display: "grid", placeItems: "center" }}>{headline}</div>
        </div>

        {/* A swipeable row rather than diagonal parallax. */}
        <div
          style={{
            display: "flex",
            gap: layout.gutter,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            padding: `0 ${layout.pad} ${layout.section}`,
            background: color.warmNeutral,
          }}
        >
          {plates.map((plate) => (
            <figure
              key={plate.caption}
              style={{
                flex: "0 0 85%",
                margin: 0,
                scrollSnapAlign: "center",
                display: "flex",
                flexDirection: "column",
                gap: space.s,
                paddingTop: layout.section,
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3" }}>
                <MediaTile src={plate.src} seed={plate.w} style={{ position: "absolute", inset: 0 }} />
              </div>
              <figcaption style={{ ...typeScale.eyebrow, color: color.textOnLightMuted }}>
                {plate.caption}
              </figcaption>
            </figure>
          ))}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: rhythm.headerToContent,
            padding: `${layout.section} ${layout.pad}`,
          }}
        >
          <MicroLabel tone="light">{copy.resultsLabel}</MicroLabel>
          <h3 style={{ margin: 0, ...typeScale.h1 }}>{copy.resultsHeadline}</h3>
          {metrics}
        </div>
      </section>
    );
  }

  return (
    <section
      id="case-study"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        fontFamily: typeScale.bodyLg.fontFamily,
      }}
    >
      <div className="cs-frame" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* ---- the opening ground: white, and it goes to black on scroll ---- */}
        <div
          className="cs-white"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: color.bone }}
        />

        {/* ---- the conveyor: bottom right, through the centre, out top left ---- */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {/* Every card is laid out in the same place — the middle of the
              frame — and the timeline is the only thing that says where it
              is on its way through. Laying them out at different points and
              then translating them is what used to put two of them on top of
              each other: a percentage translate is a share of the element's
              own width, so equal percentages moved unequal distances. */}
          {plates.map((plate) => (
            <figure
              key={plate.caption}
              className="cs-plate"
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                width: "min(760px, 46vw)",
                margin: 0,
                transform: "translate(-50%, -50%)",
                opacity: 0,
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 10" }}>
                <MediaTile src={plate.src} seed={plate.w} style={{ position: "absolute", inset: 0 }} />
                <figcaption
                  style={{
                    position: "absolute",
                    left: space.s,
                    bottom: space.s,
                    ...typeScale.eyebrow,
                    color: hexA("#FFFFFF", 0.82),
                    textShadow: "0 1px 10px rgba(0,0,0,0.65)",
                  }}
                >
                  {plate.caption}
                </figcaption>
                <HoverBadge top={copy.hoverTop}>{copy.hoverMain}</HoverBadge>
              </div>
            </figure>
          ))}
        </div>

        {/* ---- the line, uncovered by the slats ---- */}
        <div
          className="cs-intro"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: `0 ${layout.pad}`,
            color: color.textOnLight,
          }}
        >
          <div style={{ position: "relative" }}>{headline}</div>
        </div>

        {/* ---- the slat curtain over it, retracting centre-out ---- */}
        <div
          className="cs-curtain"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <SlatCurtain handleRef={slats} color={color.black} imageSrc={curtainImage} />
        </div>

        {/* ---- the metrics chapter ---- */}
        <div
          className="cs-metrics"
          style={{
            position: "absolute",
            inset: 0,
            // A full-frame chapter: it must not cover the gallery at rest.
            opacity: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            textAlign: "center",
            gap: rhythm.headerToContent,
            padding: `calc(${layout.navHeight}px + ${layout.section}) ${layout.pad} ${layout.section}`,
            background: color.bone,
            color: color.textOnLight,
          }}
        >
          <Grain opacity={0.08} />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: rhythm.eyebrowToHeadline,
            }}
          >
            <MicroLabel tone="accent" className="cs-results-head">
              {copy.resultsLabel}
            </MicroLabel>
            <h3
              className="cs-results-head"
              style={{ margin: 0, ...typeScale.h1, maxWidth: "18ch", textWrap: "balance", color: color.textOnLight }}
            >
              {copy.resultsHeadline}
            </h3>
          </div>
          <div style={{ position: "relative", width: "100%" }}>{metrics}</div>

          {/* The same curtain again, opening onto the numbers. */}
          <div
            className="cs-curtain-out"
            style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
          >
            <SlatCurtain handleRef={slatsOut} color={color.black} imageSrc={curtainImage} />
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

addPropertyControls(CaseStudy, {
  gallery: {
    type: ControlType.Array,
    title: "Gallery",
    control: { type: ControlType.File, allowedFileTypes: ["jpg", "png", "mp4"] },
    maxCount: 8,
  },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "560vh" },
});
