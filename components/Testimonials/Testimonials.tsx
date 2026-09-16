import { gsap, ScrollTrigger, useGsapContext, SCRUB } from "../shared/gsap";
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
      const cards = q(".ts-card") as HTMLElement[];

      /*
       * Driven the way vishakha-sharma21/animation-gsap drives it: one
       * ScrollTrigger, and on every update each card's position is worked out
       * from the section's progress by hand.
       *
       * The tween version of this was not the same thing. Eight cards with
       * three tweens each is twenty-four curves resolving against one another,
       * every one of them lagging the scrub by its own amount — which is what
       * made the arrival read as stepped. Here there is a single number, and
       * every card is a pure function of it. Nothing can drift, because there
       * is nothing to drift against.
       *
       * smoothStep is the reference's easing: 3t² − 2t³, flat at both ends,
       * so a card leaves and reaches its place without a corner at either.
       */
      const smoothStep = (p: number) => p * p * (3 - 2 * p);
      const lerp = gsap.utils.interpolate;
      const clamp = gsap.utils.clamp;

      ScrollTrigger.create({
        trigger: root,
        start: "top 78%",
        end: "bottom bottom",
        scrub: SCRUB,
        // will-change is a hint, not a free win: held on every card for the
        // life of the page it keeps eight layers promoted for nothing, so it
        // goes on while the section is live and comes off when it is not.
        onToggle: ({ isActive }) =>
          cards.forEach((card) => {
            card.style.willChange = isActive ? "transform, opacity" : "auto";
          }),
        onUpdate: (self) => {
          const progress = self.progress;

          cards.forEach((card, i) => {
            const col = i % 4;
            // The row is the delay and the column is the lean, so a row
            // arrives together and opens from its middle.
            const delay = Math.floor(i / 4) * 0.5 + col * 0.08;
            const cardProgress = clamp(0, 1, (progress - delay * 0.1) / (0.9 - delay * 0.1));

            // Up from below, overshooting its place and settling back into
            // it — the two-stage move is what stops it arriving flat.
            let y: string;
            if (cardProgress < 0.4) {
              y = lerp("14%", "-4%", smoothStep(cardProgress / 0.4));
            } else if (cardProgress < 0.6) {
              y = lerp("-4%", "0%", smoothStep((cardProgress - 0.4) / 0.2));
            } else {
              y = "0%";
            }

            // Small, then most of the way, then the last of it.
            let scale: number;
            if (cardProgress < 0.4) {
              scale = lerp(0.62, 0.92, smoothStep(cardProgress / 0.4));
            } else if (cardProgress < 0.6) {
              scale = lerp(0.92, 1, smoothStep((cardProgress - 0.4) / 0.2));
            } else {
              scale = 1;
            }

            // Legible for most of the travel rather than arriving already
            // there: presence resolves in the first fifth of the card's run.
            const opacity = cardProgress < 0.2 ? smoothStep(cardProgress / 0.2) : 1;

            // Fanned out to the side the card belongs to, converging on its
            // own column over the last two fifths.
            const lean = [-1, -0.4, 0.4, 1][col];
            let x: string;
            let rotate: number;
            if (cardProgress < 0.6) {
              x = `${lean * 26}%`;
              rotate = lean * 5;
            } else {
              const n = smoothStep((cardProgress - 0.6) / 0.4);
              x = lerp(`${lean * 26}%`, "0%", n);
              rotate = lerp(lean * 5, 0, n);
            }

            gsap.set(card, { x, y, rotate, scale, opacity, force3D: true });
          });
        },
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
