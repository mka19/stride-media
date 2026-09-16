import { gsap, useGsapContext, SCRUB } from "./gsap";
import { useEffect, useRef } from "react";
import { registerSurface, type SurfaceHandle } from "./surface";
import { testimonials as copy } from "./copy";
import { color, ease, hexA, layout, numberGradient, rhythm, space, typeScale } from "./theme";
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

      /*
       * The arrival is the one from vishakha-sharma21/animation-gsap: a card
       * starts small and high, fanned out to the side it belongs to, and
       * converges on its place as the scroll advances — scale and position
       * resolving on a smoothstep rather than on a single tween, so the last
       * part of the move is slower than the first without ever stopping.
       *
       * smoothstep is applied as the ease rather than by interpolating by
       * hand on every update: same curve, but it stays on GSAP's own clock
       * with the rest of the page.
       */
      const smoothStep = "power2.inOut";

      cards.forEach((card, i) => {
        const col = i % 4;
        // Outer columns come from further out and lean more, so the group
        // opens from the middle rather than sliding in as a block.
        const lean = [-1, -0.42, 0.42, 1][col];
        const fromX = stacked ? 0 : lean * 132;
        const fromY = stacked ? 40 : -96;

        gsap.set(card, {
          opacity: 0,
          xPercent: 0,
          x: fromX,
          y: fromY,
          rotation: stacked ? 0 : lean * 6,
          scale: stacked ? 0.94 : 0.42,
          transformOrigin: "50% 50%",
          force3D: true,
        });

        const at = 0.04 + i * (0.52 / cards.length);
        const span = 1.9 / cards.length;

        // Opacity resolves in the first fifth of the card's own slice, so it
        // is legible for most of the travel rather than arriving already
        // there — the reference fades in over cardProgress < 0.2.
        tl.to(card, { opacity: 1, duration: span * 0.2, ease: "none" }, at);

        // Most of the way in: up to three quarters of its size, still leaning.
        tl.to(
          card,
          { scale: stacked ? 1 : 0.78, y: fromY * 0.18, duration: span * 0.55, ease: smoothStep },
          at,
        );

        // And the last of it: the lean, the offset and the last quarter of
        // the scale all resolve together, which is what makes the card read
        // as settling into a place rather than as stopping.
        tl.to(
          card,
          {
            x: 0,
            y: 0,
            rotation: 0,
            scale: 1,
            duration: span * 0.45,
            ease: "power2.out",
            force3D: true,
          },
          at + span * 0.55,
        );
      });
    },
    [stacked],
    (root) =>
      gsap.set(gsap.utils.selector(root)(".ts-card"), { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 }),
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
      {/* Four lines of room whether the quote needs them or not, so every
          card in the row puts its figure on the same line. */}
      <p
        style={{
          margin: 0,
          ...typeScale.bodyLg,
          flex: "1 1 auto",
          display: "-webkit-box",
          WebkitBoxOrient: "vertical",
          WebkitLineClamp: 4,
          overflow: "hidden",
        }}
      >
        “{t.quote}”
      </p>
      {/* The figure gets its own line rather than sharing one with the
          sector: side by side, a long figure wrapped to three lines and the
          card turned into a stack of purple. */}
      <div style={{ display: "flex", flexDirection: "column", gap: space.xs }}>
        <span style={{ ...typeScale.eyebrow, color: color.textOnLightMuted }}>{t.handle}</span>
        <span style={{ ...typeScale.h3, fontWeight: 500, whiteSpace: "nowrap", ...numberGradient }}>
          {t.stat}
        </span>
      </div>
    </>
  );

  const cardStyle = {
    display: "flex",
    flexDirection: "column" as const,
    gap: space.md,
    padding: space.lg,
    background: color.bone,
    borderRadius: 4,
    boxShadow: `0 24px 60px ${hexA("#0A0A0A", 0.14)}`,
    transition: `box-shadow ${ease.hoverMs}ms ${ease.hover}`,
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
            // Every row the same height, not just every card within a row:
            // stretch alone gave the two rows 240 and 214, which read as two
            // different card sizes rather than as one set.
            gridAutoRows: stacked ? "auto" : "1fr",
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
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.boxShadow = cardStyle.boxShadow;
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
