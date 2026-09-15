import { useEffect, useRef } from "react";
import { gsap, useGsapContext } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { caseStudy as copy } from "../shared/copy";
import { color, hexA, layout, numberGradient, rhythm, space, typeScale } from "../shared/theme";
import { Grain, MediaTile, MicroLabel } from "../shared/primitives";
import GradientRevealText from "../shared/GradientRevealText";
import HoverBadge from "../shared/HoverBadge";
import SlatCurtain, { type SlatHandle } from "../shared/SlatCurtain";
import { useStacked } from "../shared/responsive";

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
  scrollLength = "760vh",
}: {
  gallery?: string[];
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
  const plates = copy.gallery.map((item, i) => ({
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
          scrub: 1,
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

      // Every plate crosses the frame bottom-right to upper-left, each at its
      // own rate, which is what makes them overlap on the way through.
      //
      // The crossing is confined to GALLERY_IN..GALLERY_OUT and lives on the
      // same timeline as everything else, so the last plate has left the frame
      // before the metrics chapter starts. It used to run the full scroll on a
      // timeline of its own, which is why plates were still travelling across
      // the headline and the numbers.
      // One plate at a time, each arriving diagonally across from the one
      // going. The sheet used to carry all eight past the frame together,
      // which meant four or five were on screen at once and none of them
      // was the subject.
      const sheet = q(".cs-sheet");
      const span = GALLERY_OUT - GALLERY_IN;
      const each = span / plateEls.length;

      tl.set(sheet, { opacity: 1 }, GALLERY_IN).fromTo(
        sheet,
        { xPercent: 4, yPercent: 6 },
        { xPercent: -4, yPercent: -6, ease: "none", duration: span },
        GALLERY_IN,
      );

      plateEls.forEach((plate, i) => {
        const at = GALLERY_IN + i * each;
        tl.fromTo(
          plate,
          { opacity: 0, scale: 0.88, y: 56 },
          { opacity: 1, scale: 1, y: 0, duration: each * 0.45, ease: "power3.out" },
          at,
        ).to(
          plate,
          { opacity: 0, scale: 1.08, y: -48, duration: each * 0.4, ease: "power2.in" },
          at + each * 0.72,
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
        .call(countUp, undefined, 0.78)

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
      gsap.set(q(".cs-sheet"), { opacity: 1 });
      gsap.set(q(".cs-plate"), { opacity: 1, scale: 1, y: 0 });
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
            background: hexA(color.textOnLight, 0.035),
            border: `1px solid ${hexA(color.textOnLight, 0.08)}`,
            textAlign: "left",
          }}
        >
          <div style={{ ...typeScale.h3, color: color.textOnLight }}>{m.label}</div>

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

          <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnLightMuted, maxWidth: "26ch" }}>
            {copy.metricNotes?.[i] ?? ""}
          </p>
        </div>
      ))}
    </div>
  );

  if (stacked) {
    return (
      <section
        id="case-study"
        style={{ background: color.black, color: color.textOnDark, fontFamily: typeScale.bodyLg.fontFamily }}
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

        {/* ---- the collage, travelling bottom-right to upper-left ---- */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {/* One sheet, moved as a single element. Translating each plate by
              its own percentage moved them different distances, because a
              percentage translate is a share of the element's own width and
              the plates are different sizes — which is what put them back on
              top of each other however carefully they were laid out. */}
          <div className="cs-sheet" style={{ position: "absolute", inset: 0, opacity: 0 }}>
            {plates.map((plate) => (
            <figure
              key={plate.caption}
              className="cs-plate"
              style={{
                position: "absolute",
                left: `${plate.x}%`,
                top: `${plate.y}%`,
                width: `${plate.w}%`,
                margin: 0,
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3" }}>
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
          <SlatCurtain handleRef={slats} color={color.black} />
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
            <SlatCurtain handleRef={slatsOut} color={color.black} />
          </div>
        </div>
      </div>
    </section>
  );
}
