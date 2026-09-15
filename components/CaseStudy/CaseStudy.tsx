import { useEffect, useRef } from "react";
import { gsap, useGsapContext } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { caseStudy as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { Grain, MediaTile, MicroLabel } from "../shared/primitives";
import ScrambleText from "../shared/ScrambleText";
import HoverBadge from "../shared/HoverBadge";
import { useBreakpoint } from "../shared/responsive";

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
  const bp = useBreakpoint();
  const stacked = bp === "mobile";

  // Each plate gets its own lane and speed so the collage travels as a spread
  // rather than a single sheet.
  const plates = copy.gallery.map((item, i) => ({
    ...item,
    src: gallery[i],
    x: [8, 62, 30, 78, 14, 48, 70, 24][i % 8],
    y: [18, 8, 52, 38, 74, 64, 22, 88][i % 8],
    // Spacing doc: gallery plates vary between 240 and 480 wide.
    w: [320, 240, 480, 280, 400, 260, 360, 300][i % 8],
    speed: [1, 1.5, 0.8, 1.7, 1.2, 0.65, 1.35, 0.95][i % 8],
  }));

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      // The gallery owns this slice of the scroll and nothing else overlaps
      // it, so the plates are gone before the results chapter is readable.
      const GALLERY_IN = 0.14;
      const GALLERY_OUT = 0.62;

      gsap.set(q(".cs-intro-item"), { opacity: 0, y: 24, scale: 0.98 });
      gsap.set(q(".cs-warm"), { opacity: 0 });
      gsap.set(q(".cs-metrics"), { opacity: 0 });
      gsap.set(q(".cs-results-head"), { opacity: 0, y: 30 });
      gsap.set(q(".cs-metric"), { opacity: 0, y: 64 });

      // Each figure starts at zero and is counted up to its real value the
      // first time the chapter is reached. Running it on the scrub instead
      // would make the numbers walk backwards whenever the visitor scrolls
      // up, which reads as a glitch rather than a tally.
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
          scrub: 0.6,
          onUpdate: (self) =>
            surface.current?.setTone(self.progress > 0.16 && self.progress < 0.62 ? "light" : "dark"),
        },
      });

      // 1. the dark intro
      tl.to(q(".cs-intro-item"), { opacity: 1, y: 0, scale: 1, duration: 0.06, stagger: 0.02 }, 0.02)
        .to(q(".cs-intro"), { opacity: 0, duration: 0.05 }, 0.14)

        // 2. warm ground for the gallery
        .to(q(".cs-warm"), { opacity: 1, duration: 0.06 }, 0.14);

      // Every plate crosses the frame bottom-right to upper-left, each at its
      // own rate, which is what makes them overlap on the way through.
      //
      // The crossing is confined to GALLERY_IN..GALLERY_OUT and lives on the
      // same timeline as everything else, so the last plate has left the frame
      // before the metrics chapter starts. It used to run the full scroll on a
      // timeline of its own, which is why plates were still travelling across
      // the headline and the numbers.
      q(".cs-plate").forEach((plate) => {
        const speed = Number((plate as HTMLElement).dataset.speed ?? 1);

        // Travel and fade are separate: tweening opacity across the whole
        // crossing left every plate at half strength in the middle of the
        // frame, so overlapping plates showed through each other and their
        // captions read over whatever sat behind. The fade happens in the
        // first and last few percent; the plate is solid for the crossing.
        tl.fromTo(
          plate,
          { xPercent: 90 * speed, yPercent: 120 * speed },
          {
            xPercent: -110 * speed,
            yPercent: -150 * speed,
            ease: "none",
            duration: GALLERY_OUT - GALLERY_IN,
          },
          GALLERY_IN,
        )
          .fromTo(
            plate,
            { opacity: 0 },
            { opacity: 1, duration: 0.04, ease: "power1.out" },
            GALLERY_IN,
          )
          .to(plate, { opacity: 0, duration: 0.04, ease: "power1.in" }, GALLERY_OUT - 0.04);
      });

      // 3. the collage clears, and only then does the metrics chapter open
      tl.to(q(".cs-warm"), { opacity: 0, duration: 0.06 }, GALLERY_OUT)
        .to(q(".cs-metrics"), { opacity: 1, duration: 0.05 }, GALLERY_OUT + 0.02)

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
      gsap.set(q(".cs-metrics, .cs-warm"), { opacity: 1 });
      gsap.set(q(".cs-plate"), { opacity: 1 });
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
      <MicroLabel tone="accent" className="cs-intro-item">
        {copy.label}
      </MicroLabel>
      <h2 className="cs-intro-item" style={{ margin: 0, ...typeScale.h1, color: color.textOnDark }}>
        {copy.headline.map((line, i) => (
          <ScrambleText key={i} as="span" style={{ display: "block" }}>
            {line}
          </ScrambleText>
        ))}
      </h2>
      <p
        className="cs-intro-item"
        style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted, maxWidth: "48ch" }}
      >
        {copy.intro}
      </p>
    </div>
  );

  const metrics = (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: stacked ? "1fr 1fr" : "repeat(4, 1fr)",
        gap: layout.gutter,
        width: "100%",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      {copy.metrics.map((m) => (
        <div
          key={m.label}
          className="cs-metric"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: stacked ? "flex-start" : "center",
            textAlign: stacked ? "left" : "center",
            gap: space.s,
            paddingTop: space.lg,
            borderTop: `1px solid ${color.hairlineOnDark}`,
          }}
        >
          <div
            style={{
              ...typeScale.numberXl,
              fontSize: typeScale.h1.fontSize,
              color: color.accent,
              textShadow: `0 0 28px ${hexA(color.accent, 0.45)}`,
              // The tally rewrites this node every frame; a tabular figure
              // keeps the column from jittering as the digits change.
              fontVariantNumeric: "tabular-nums",
            }}
          >
            <span className="cs-num" data-to={m.value} data-dec={m.value.includes(".") ? 1 : 0}>
              {m.value}
            </span>
            {m.suffix}
          </div>
          <div style={{ ...typeScale.bodyLg, color: color.textOnDarkMuted }}>{m.label}</div>
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
          <MicroLabel tone="accent">{copy.resultsLabel}</MicroLabel>
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
        {/* ---- warm ground for the gallery ---- */}
        <div
          className="cs-warm"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, opacity: 0, background: color.warmNeutral }}
        />

        {/* ---- the collage, travelling bottom-right to upper-left ---- */}
        <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
          {plates.map((plate) => (
            <figure
              key={plate.caption}
              className="cs-plate"
              data-speed={plate.speed}
              style={{
                position: "absolute",
                left: `${plate.x}%`,
                top: `${plate.y}%`,
                width: plate.w,
                maxWidth: "46vw",
                margin: 0,
                // Faster plates are nearer, so they stack above the slower ones.
                zIndex: Math.round(plate.speed * 10),
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

        {/* ---- dark intro ---- */}
        <div
          className="cs-intro"
          style={{
            position: "absolute",
            inset: 0,
            display: "grid",
            placeItems: "center",
            padding: `0 ${layout.pad}`,
            background: `radial-gradient(70% 55% at 50% 45%, ${hexA(color.accentDeep, 0.5)} 0%, ${color.black} 72%)`,
          }}
        >
          <Grain opacity={0.2} />
          <div style={{ position: "relative" }}>{headline}</div>
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
            background: color.ink,
            color: color.textOnDark,
          }}
        >
          <Grain opacity={0.14} />
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
              style={{ margin: 0, ...typeScale.h1, maxWidth: "18ch", textWrap: "balance" }}
            >
              {copy.resultsHeadline}
            </h3>
          </div>
          <div style={{ position: "relative", width: "100%" }}>{metrics}</div>
        </div>
      </div>
    </section>
  );
}
