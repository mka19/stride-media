import { gsap, useGsapContext } from "../shared/gsap";
import { useEffect, useRef } from "react";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { testimonials as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { MicroLabel } from "../shared/primitives";
import RevealText from "../shared/RevealText";
import { useBreakpoint } from "../shared/responsive";

/**
 * Testimonials — trionn.com scattered gallery reference.
 *
 * Cards fly in one at a time from randomised off-screen offsets and settle
 * into an overlapping mosaic. Each card's arrival is tied to its own scroll
 * checkpoint rather than a timer, so the build-up is paced by the visitor.
 * By the end of the section the whole mosaic is on screen together.
 *
 * On phones the scatter is dropped for sequential fade-ups in one column:
 * scatter physics read as drift on a narrow viewport.
 */
export default function Testimonials({ scrollLength = "420vh" }: { scrollLength?: string }) {
  const surface = useRef<SurfaceHandle | null>(null);
  const bp = useBreakpoint();
  const stacked = bp === "mobile";

  // Resting positions: a loose mosaic, deliberately not a grid, with cards
  // overlapping by a little rather than tiling.
  // Two loose bands that clear the header above them, overlapping by a
  // little rather than tiling.
  const spots = [
    { x: 3, y: 34, r: -3, z: 1 },
    { x: 34, y: 30, r: 2, z: 3 },
    { x: 66, y: 36, r: -2, z: 2 },
    { x: 13, y: 60, r: 3, z: 4 },
    { x: 43, y: 64, r: -1.5, z: 5 },
    { x: 71, y: 58, r: 2.5, z: 3 },
  ];

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      const cards = q(".ts-card");

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.7 },
      });

      cards.forEach((card, i) => {
        // Each card comes from its own direction, well outside the frame.
        const fromX = gsap.utils.random([-1, 1]) * gsap.utils.random(280, 420);
        const fromY = gsap.utils.random([-1, 1]) * gsap.utils.random(180, 260);
        gsap.set(card, { opacity: 0, x: fromX, y: fromY, rotation: gsap.utils.random(-15, 15) });

        const at = 0.06 + i * (0.8 / cards.length);
        tl.to(
          card,
          {
            opacity: 1,
            x: 0,
            y: 0,
            rotation: Number((card as HTMLElement).dataset.rest ?? 0),
            duration: 0.6 / cards.length,
            ease: "power2.out",
          },
          at,
        );
      });
    },
    [stacked],
    (root) =>
      gsap.set(gsap.utils.selector(root)(".ts-card"), { opacity: 1, x: 0, y: 0, rotation: 0 }),
  );

  useEffect(() => {
    const frame = rootRef.current?.querySelector<HTMLElement>(".ts-frame");
    if (!frame) return;
    const handle = registerSurface(frame, "light");
    surface.current = handle;
    return () => {
      handle.release();
      surface.current = null;
    };
  }, [rootRef, stacked]);

  const card = (t: (typeof copy.cards)[number]) => (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: space.s }}>
        <span
          style={{
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: color.ruby,
            color: "#fff",
            ...typeScale.labelSm,
            fontWeight: 600,
          }}
        >
          {t.initials}
        </span>
        <span style={{ ...typeScale.labelSm, fontWeight: 600 }}>{t.name}</span>
      </div>
      <p style={{ margin: 0, ...typeScale.body }}>“{t.quote}”</p>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: space.s }}>
        <span style={{ ...typeScale.labelSm, color: color.textOnLightMuted }}>{t.handle}</span>
        <span style={{ ...typeScale.h3, fontWeight: 700, color: color.ruby }}>{t.stat}</span>
      </div>
    </>
  );

  const cardStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: space.md,
    padding: space.lg,
    background: color.bone,
    border: `1px solid ${color.hairlineOnLight}`,
    borderRadius: 4,
    boxShadow: `0 24px 60px ${hexA("#2A2020", 0.12)}`,
  };

  if (stacked) {
    return (
      <section
        id="testimonials"
        style={{
          background: color.boneSoft,
          color: color.textOnLight,
          fontFamily: typeScale.body.fontFamily,
          display: "flex",
          flexDirection: "column",
          gap: rhythm.headerToContent,
          padding: `${layout.section} ${layout.pad}`,
        }}
      >
        <MicroLabel tone="ruby">{copy.label}</MicroLabel>
        <RevealText as="h2" style={{ ...typeScale.h2 }}>
          {copy.headline}
        </RevealText>
        <div style={{ display: "flex", flexDirection: "column", gap: layout.gutter }}>
          {copy.cards.map((t) => (
            <article key={t.initials} style={cardStyle}>
              {card(t)}
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="testimonials"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.boneSoft,
        fontFamily: typeScale.body.fontFamily,
      }}
    >
      <div
        className="ts-frame"
        style={{
          position: "sticky",
          top: 0,
          height: "100vh",
          overflow: "hidden",
          color: color.textOnLight,
        }}
      >
        <div
          style={{
            position: "absolute",
            top: `calc(${layout.navHeight}px + ${layout.section})`,
            left: layout.pad,
            right: layout.pad,
            display: "flex",
            flexDirection: "column",
            gap: rhythm.eyebrowToHeadline,
            maxWidth: 640,
          }}
        >
          <MicroLabel tone="ruby">{copy.label}</MicroLabel>
          <RevealText as="h2" style={{ ...typeScale.h2 }}>
            {copy.headline}
          </RevealText>
        </div>

        <div style={{ position: "absolute", inset: 0 }}>
          {copy.cards.map((t, i) => {
            const spot = spots[i % spots.length];
            return (
              <article
                key={t.initials}
                className="ts-card"
                data-rest={spot.r}
                style={{
                  position: "absolute",
                  left: `${spot.x}%`,
                  top: `${spot.y}%`,
                  width: 320,
                  maxWidth: "80vw",
                  zIndex: spot.z,
                  ...cardStyle,
                }}
              >
                {card(t)}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
