import { useEffect, useRef } from "react";
import { gsap, useGsapContext } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { caseStudy as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { Grain, MediaTile, MicroLabel } from "../shared/primitives";
import { useBreakpoint } from "../shared/responsive";

/**
 * Case Study — sondaven.com reference.
 *
 *   1. Dark atmospheric intro, grain and a soft glow behind the headline.
 *   2. The ground turns warm neutral and the collage scrolls diagonally from
 *      bottom-right to upper-left, each image on its own depth so they
 *      overlap rather than travelling as one block. Captions counter nothing
 *      — the images are never rotated — so they stay readable.
 *   3. The gallery clears and the mark lands on a solid ruby card.
 *   4. The metrics chapter arrives on a new ground.
 *
 * On phones the diagonal parallax is dropped for a swipeable row, since
 * scroll-driven diagonal movement reads as drift on a narrow viewport.
 */
export default function CaseStudy({
  gallery = [],
  scrollLength = "560vh",
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

      gsap.set(q(".cs-intro-item"), { opacity: 0, y: 24, scale: 0.98 });
      gsap.set(q(".cs-warm"), { opacity: 0 });
      gsap.set(q(".cs-metrics"), { opacity: 0 });
      gsap.set(q(".cs-metric"), { opacity: 0, y: 20 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) =>
            surface.current?.setTone(self.progress > 0.16 && self.progress < 0.68 ? "light" : "dark"),
        },
      });

      // 1. the dark intro
      tl.to(q(".cs-intro-item"), { opacity: 1, y: 0, scale: 1, duration: 0.06, stagger: 0.02 }, 0.02)
        .to(q(".cs-intro"), { opacity: 0, duration: 0.05 }, 0.14)

        // 2. warm ground for the gallery
        .to(q(".cs-warm"), { opacity: 1, duration: 0.06 }, 0.14);

      // Every plate crosses the frame bottom-right to upper-left, each at its
      // own rate, which is what makes them overlap on the way through.
      q(".cs-plate").forEach((plate) => {
        const speed = Number((plate as HTMLElement).dataset.speed ?? 1);
        gsap.fromTo(
          plate,
          { xPercent: 90 * speed, yPercent: 120 * speed, opacity: 0 },
          {
            xPercent: -110 * speed,
            yPercent: -150 * speed,
            opacity: 1,
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.6,
            },
          },
        );
      });

      // 3. the collage clears straight into the metrics chapter
      tl.to(q(".cs-warm"), { opacity: 0, duration: 0.06 }, 0.68)
        .to(q(".cs-metrics"), { opacity: 1, duration: 0.06 }, 0.7)
        .to(q(".cs-metric"), { opacity: 1, y: 0, duration: 0.07, stagger: 0.03 }, 0.76);
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".cs-intro-item, .cs-metric"), { opacity: 1, y: 0, scale: 1 });
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
      <MicroLabel tone="ruby" className="cs-intro-item">
        {copy.label}
      </MicroLabel>
      <h2 className="cs-intro-item" style={{ margin: 0, ...typeScale.h1, color: color.textOnDark }}>
        {copy.headline.map((line, i) => (
          <span key={i} style={{ display: "block" }}>
            {line}
          </span>
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
      }}
    >
      {copy.metrics.map((m) => (
        <div
          key={m.label}
          className="cs-metric"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: space.s,
            paddingTop: space.lg,
            borderTop: `1px solid ${color.hairlineOnDark}`,
          }}
        >
          <div
            style={{
              ...typeScale.numberXl,
              fontSize: typeScale.h1.fontSize,
              color: color.ruby,
              textShadow: `0 0 28px ${hexA(color.ruby, 0.45)}`,
            }}
          >
            {m.value}
            {m.suffix}
          </div>
          <div style={{ ...typeScale.body, color: color.textOnDarkMuted }}>{m.label}</div>
        </div>
      ))}
    </div>
  );

  if (stacked) {
    return (
      <section
        id="case-study"
        style={{ background: color.black, color: color.textOnDark, fontFamily: typeScale.body.fontFamily }}
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
              <figcaption style={{ ...typeScale.labelSm, color: color.textOnLightMuted }}>
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
          <MicroLabel tone="ruby">{copy.resultsLabel}</MicroLabel>
          <h3 style={{ margin: 0, ...typeScale.h2 }}>{copy.resultsHeadline}</h3>
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
        fontFamily: typeScale.body.fontFamily,
      }}
    >
      <div className="cs-frame" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* ---- warm ground for the gallery ---- */}
        <div
          className="cs-warm"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: color.warmNeutral }}
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
              }}
            >
              <div style={{ position: "relative", width: "100%", aspectRatio: "4 / 3" }}>
                <MediaTile src={plate.src} seed={plate.w} style={{ position: "absolute", inset: 0 }} />
                <figcaption
                  style={{
                    position: "absolute",
                    left: space.s,
                    bottom: space.s,
                    ...typeScale.labelSm,
                    color: hexA("#FFFFFF", 0.82),
                    textShadow: "0 1px 10px rgba(0,0,0,0.65)",
                  }}
                >
                  {plate.caption}
                </figcaption>
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
            background: `radial-gradient(70% 55% at 50% 45%, ${hexA(color.rubyDeep, 0.5)} 0%, ${color.black} 72%)`,
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
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            gap: rhythm.headerToContent,
            padding: `calc(${layout.navHeight}px + ${layout.section}) ${layout.pad} ${layout.section}`,
            background: color.ink,
            color: color.textOnDark,
          }}
        >
          <Grain opacity={0.14} />
          <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: rhythm.eyebrowToHeadline }}>
            <MicroLabel tone="ruby">{copy.resultsLabel}</MicroLabel>
            <h3 style={{ margin: 0, ...typeScale.h1, maxWidth: "18ch" }}>{copy.resultsHeadline}</h3>
          </div>
          <div style={{ position: "relative" }}>{metrics}</div>
        </div>
      </div>
    </section>
  );
}
