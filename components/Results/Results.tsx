import { gsap, useGsapContext } from "../shared/gsap";
import { results as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { ArrowIcon, MediaTile, MicroLabel } from "../shared/primitives";
import { useBreakpoint } from "../shared/responsive";
import { useInView } from "../shared/useInView";

/**
 * Results / Proof — clipcut.framer.ai reference.
 *
 * A horizontally scrollable row of portrait video cards. No scroll-driven
 * transform here: the row slides in once, staggered from the right, and the
 * ongoing interaction is the row's own horizontal scroll with snap. Each
 * card's reel plays only while that card is on screen.
 */
export default function Results({ clips = [] }: { clips?: string[] }) {
  const bp = useBreakpoint();
  const cardWidth = bp === "mobile" ? "85vw" : bp === "tablet" ? 240 : 280;

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".rs-card"), { opacity: 0, x: 60 });
      gsap.to(q(".rs-card"), {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 75%" },
      });
    },
    [],
    (root) => gsap.set(gsap.utils.selector(root)(".rs-card"), { opacity: 1, x: 0 }),
  );

  return (
    <section
      id="results"
      ref={rootRef}
      style={{
        background: color.black,
        color: color.textOnDark,
        fontFamily: typeScale.body.fontFamily,
        paddingBlock: layout.section,
        overflow: "hidden",
      }}
    >
      {/* ---- header ---- */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "flex-end",
          justifyContent: "space-between",
          gap: space.xl,
          padding: `0 ${layout.pad}`,
          marginBottom: rhythm.headerToContent,
        }}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: rhythm.eyebrowToHeadline, maxWidth: 640 }}>
          <MicroLabel tone="ruby">{copy.label}</MicroLabel>
          <h2 style={{ margin: 0, ...typeScale.h2 }}>{copy.headline}</h2>
          <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>{copy.body}</p>
        </div>

        <a
          href="#contact"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: space.s,
            ...typeScale.labelSm,
            fontWeight: 600,
            color: color.ruby,
            textDecoration: "none",
          }}
        >
          {copy.link}
          <ArrowIcon />
        </a>
      </div>

      {/* ---- the row ---- */}
      <div
        style={{
          display: "flex",
          gap: layout.gutter,
          overflowX: "auto",
          scrollSnapType: "x mandatory",
          padding: `0 ${layout.pad} ${space.lg}`,
        }}
      >
        {copy.cards.map((card, i) => (
          <ResultCard key={card.views + card.handle} card={card} src={clips[i]} seed={i} width={cardWidth} />
        ))}
      </div>
    </section>
  );
}

function ResultCard({
  card,
  src,
  seed,
  width,
}: {
  card: (typeof copy.cards)[number];
  src?: string;
  seed: number;
  width: number | string;
}) {
  // Each reel plays only while its own card is on screen.
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 }, false);

  return (
    <article
      className="rs-card"
      style={{
        flex: `0 0 ${typeof width === "number" ? `${width}px` : width}`,
        scrollSnapAlign: "start",
        display: "flex",
        flexDirection: "column",
        gap: space.s,
      }}
    >
      <div ref={ref} style={{ position: "relative", width: "100%", height: 420, maxHeight: "56vh" }}>
        <MediaTile src={src} seed={seed + 21} play={inView} radius={4} style={{ position: "absolute", inset: 0 }} />

        {/* client avatar, top-left */}
        <div
          style={{
            position: "absolute",
            top: space.md,
            left: space.md,
            width: 32,
            height: 32,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            background: hexA(color.black, 0.55),
            border: `1px solid ${hexA("#FFFFFF", 0.3)}`,
            ...typeScale.labelSm,
            fontWeight: 600,
            color: color.textOnDark,
          }}
        >
          {card.client}
        </div>

        {/* the stat that matters, over the reel */}
        <div
          style={{
            position: "absolute",
            left: space.md,
            bottom: space.md,
            ...typeScale.h3,
            fontWeight: 700,
            color: color.textOnDark,
            textShadow: `0 2px 18px ${hexA(color.black, 0.8)}`,
          }}
        >
          {card.views} Views
        </div>
      </div>

      <div style={{ ...typeScale.labelSm, color: color.ruby }}>{card.metric}</div>
      <p style={{ margin: 0, ...typeScale.body, color: color.textOnDarkMuted }}>{card.desc}</p>
      <div style={{ ...typeScale.labelSm, color: hexA(color.textOnDark, 0.4), marginTop: "auto" }}>
        {card.handle}
      </div>
    </article>
  );
}
