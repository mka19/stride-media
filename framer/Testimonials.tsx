import { gsap, useGsapContext } from "./gsap";
import { useEffect, useRef } from "react";
import { registerSurface, type SurfaceHandle } from "./surface";
import { testimonials as copy } from "./copy";
import { color, hexA, layout, numberGradient, rhythm, space, typeScale } from "./theme";
import { MicroLabel } from "./primitives";
import GradientRevealText from "./GradientRevealText";
import { useStacked } from "./responsive";

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
export default function Testimonials() {
  const surface = useRef<SurfaceHandle | null>(null);
  const stacked = useStacked();

  // Resting positions: a loose mosaic, deliberately not a grid, with cards
  // overlapping by a little rather than tiling.
  // Resting scatter is a small transform offset per card, not a position:
  // the layout below is a column flow, so cards can never collide no matter
  // how tall their quote runs. Percentage spots could not know that, which
  // is what put cards through each other and off the frame.
  const rest = [
    { x: -7, y: 4, r: -1.4 },
    { x: 8, y: -5, r: 1.1 },
    { x: -5, y: 5, r: 1.3 },
    { x: 9, y: -4, r: -1 },
    { x: -8, y: 5, r: 1.2 },
    { x: 6, y: -5, r: -1.3 },
  ];

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      const cards = q(".ts-card");

      // One scrubbed timeline for every card, so they share a single
      // scroll-driven clock instead of drifting apart. Nothing here touches
      // layout: only transform and opacity, which stay on the compositor.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 75%",
          end: "bottom bottom",
          scrub: 0.7,
          // will-change is a hint, not a free win: held on every card for the
          // life of the page it keeps six layers promoted for nothing, so it
          // goes on while the section is live and comes off when it is not.
          onToggle: ({ isActive }) =>
            cards.forEach((card) => {
              (card as HTMLElement).style.willChange = isActive ? "transform" : "auto";
            }),
        },
      });

      cards.forEach((card, i) => {
        // On a phone the cards simply rise into place: a scatter from off
        // screen reads as drift when the viewport is one column wide.
        const fromX = stacked ? 0 : gsap.utils.random([-1, 1]) * gsap.utils.random(280, 420);
        const fromY = stacked ? 40 : gsap.utils.random([-1, 1]) * gsap.utils.random(180, 260);
        gsap.set(card, {
          opacity: 0,
          x: fromX,
          y: fromY,
          rotation: stacked ? 0 : gsap.utils.random(-15, 15),
          force3D: true,
        });

        const at = 0.06 + i * (0.8 / cards.length);
        tl.to(
          card,
          {
            opacity: 1,
            x: Number((card as HTMLElement).dataset.x ?? 0),
            y: Number((card as HTMLElement).dataset.y ?? 0),
            rotation: Number((card as HTMLElement).dataset.r ?? 0),
            duration: 1.1 / cards.length,
            // Overshoots its resting place and settles, which is what gives
            // the build-up its weight; power3.out lands flat by comparison.
            ease: stacked ? "power3.out" : "elastic.out(1, 0.6)",
            force3D: true,
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
            background: color.accent,
            color: "#fff",
            ...typeScale.eyebrow,
            fontWeight: 600,
          }}
        >
          {t.initials}
        </span>
        <span style={{ ...typeScale.eyebrow, fontWeight: 600 }}>{t.name}</span>
      </div>
      <p style={{ margin: 0, ...typeScale.bodyLg }}>“{t.quote}”</p>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: space.s }}>
        <span style={{ ...typeScale.eyebrow, color: color.textOnLightMuted }}>{t.handle}</span>
        <span style={{ ...typeScale.h3, fontWeight: 600, ...numberGradient }}>{t.stat}</span>
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
    boxShadow: `0 24px 60px ${hexA("#0A0A0A", 0.14)}`,
  };

  return (
    <section
      id="testimonials"
      ref={rootRef}
      style={{
        position: "relative",
        background: color.boneSoft,
        color: color.textOnLight,
        fontFamily: typeScale.bodyLg.fontFamily,
        padding: `${layout.section} ${layout.pad}`,
      }}
    >
      <div className="ts-frame" style={{ display: "flex", flexDirection: "column", gap: rhythm.headerToContent }}>
        <div style={{ display: "flex", flexDirection: "column", gap: rhythm.eyebrowToHeadline, maxWidth: 900 }}>
          <MicroLabel tone="accent">{copy.label}</MicroLabel>
          <GradientRevealText as="h2" tone="light" style={{ ...typeScale.h1, maxWidth: "26ch", textWrap: "balance" }}>
            {copy.headline}
          </GradientRevealText>
        </div>

        {/* A grid rather than CSS columns: columns balance by height, which
            left a void at the foot and ran the cards vertically (01 above 02)
            instead of in reading order. Rows align at the top, so the stagger
            comes from each card's own resting offset. */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
            gap: layout.gutter,
            alignItems: "start",
          }}
        >
          {copy.cards.map((t, i) => {
            const spot = rest[i % rest.length];
            return (
              <article
                key={t.initials}
                className="ts-card"
                data-x={spot.x}
                data-y={spot.y}
                data-r={spot.r}
                style={cardStyle}
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
