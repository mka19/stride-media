import { gsap, useGsapContext, SCRUB } from "../shared/gsap";
import { useEffect, useRef } from "react";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { testimonials as copy } from "../shared/copy";
import { color, ease, hexA, layout, numberGradient, rhythm, space, typeScale } from "../shared/theme";
import { MicroLabel } from "../shared/primitives";
import GradientRevealText from "../shared/GradientRevealText";
import { useStacked } from "../shared/responsive";

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
  // Vertical offsets only, and small. The cards used to carry a rotation
  // each as well, which put eight different baselines on one row and read as
  // misalignment rather than as a scatter.
  // No resting offset at all. A per-card y offset on top of a stretched grid
  // row moved each card off the row it had just been aligned to, which read
  // as eight cards that had missed their marks rather than as a scatter.
  const rest = Array.from({ length: 8 }, () => ({ x: 0, y: 0, r: 0 }));

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
          scrub: SCRUB,
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
        // Straight up, from a little below, at a depth that varies by column.
        // Coming in from the sides meant eight cards crossing each other's
        // columns on the way to their own.
        const fromX = 0;
        const fromY = stacked ? 40 : 70 + (i % 4) * 22;
        gsap.set(card, {
          opacity: 0,
          x: fromX,
          y: fromY,
          rotation: 0,
          force3D: true,
        });

        const at = 0.05 + i * (0.62 / cards.length);
        tl.to(
          card,
          {
            opacity: 1,
            x: Number((card as HTMLElement).dataset.x ?? 0),
            y: Number((card as HTMLElement).dataset.y ?? 0),
            rotation: Number((card as HTMLElement).dataset.r ?? 0),
            duration: 2.2 / cards.length,
            // Not elastic. On a scrubbed timeline an overshoot oscillation
            // is driven by the wheel rather than by a clock, so every notch
            // of scroll re-enters the wobble and the whole grid reads as
            // jerky. A flat deceleration is what stays smooth on a scrub.
            ease: "power3.out",
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
            fontWeight: 500,
          }}
        >
          {t.initials}
        </span>
        <span style={{ ...typeScale.eyebrow, fontWeight: 500 }}>{t.name}</span>
      </div>
      <p style={{ margin: 0, ...typeScale.bodyLg }}>“{t.quote}”</p>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: space.s }}>
        <span style={{ ...typeScale.eyebrow, color: color.textOnLightMuted }}>{t.handle}</span>
        <span style={{ ...typeScale.h3, fontWeight: 500, ...numberGradient }}>{t.stat}</span>
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
    transition: `box-shadow 420ms ${ease.out}, border-color 420ms ${ease.out}`,
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
            // A fixed four across rather than auto-fit: auto-fit re-flows at
            // every width and the run of eight landed as 3 + 3 + 2 with a
            // hole in it. Rows stretch, so every card in a row is the same
            // height and the type sits on one baseline.
            gridTemplateColumns: stacked ? "1fr" : "repeat(4, 1fr)",
            gap: layout.gutter,
            alignItems: "stretch",
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
                style={{ ...cardStyle, height: "100%" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.boxShadow = `0 34px 80px ${hexA("#0A0A0A", 0.2)}`;
                  e.currentTarget.style.borderColor = hexA(color.accent, 0.4);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardStyle.boxShadow;
                  e.currentTarget.style.borderColor = color.hairlineOnLight;
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
