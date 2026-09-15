import { gsap, useGsapContext } from "../shared/gsap";
import { problem as copy } from "../shared/copy";
import { color, ease, fluid, font, hexA, layout } from "../shared/theme";
import { Grain, MediaTile, MicroLabel } from "../shared/primitives";

/**
 * Problem — sakazuki.io Philosophy reference.
 *
 * One sticky frame, two parts, driven by a single scrubbed timeline:
 *
 *   Part 1  Dark panel over a cinematic background that never moves. The
 *           intro paragraph reveals a word at a time as the visitor scrolls.
 *   Part 2  Crossfade to a light card. The card is one slot that cycles
 *           through the three pain points in place — the icon, the label, the
 *           headline, the image and the big 01/02/03 all swap inside the same
 *           frame rather than scrolling past as three separate sections.
 *
 * The numbered motif here (01/02/03, hairline ticks) is the same language as
 * How It Works and the Case Study.
 */
export default function Problem({
  /** Cinematic background for part 1; falls back to a generated fill. */
  backgroundSrc,
  /** One image per pain-point card, in order. */
  cardMedia = [],
  scrollLength = "460vh",
}: {
  backgroundSrc?: string;
  cardMedia?: string[];
  scrollLength?: string;
}) {
  const words = copy.intro.split(" ");

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      const cards = q(".pb-card");

      gsap.set(q(".pb-word"), { opacity: 0.12 });
      gsap.set(q(".pb-light"), { opacity: 0, scale: 1.04 });
      gsap.set(cards, { opacity: 0 });
      gsap.set(cards[0], { opacity: 1 });
      gsap.set(q(".pb-aside"), { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.6 },
      });

      // --- part 1: paragraph reveals, word by word ----------------------
      tl.to(q(".pb-word"), { opacity: 1, duration: 0.5, stagger: 0.02, ease: "none" }, 0.02)
        .to(q(".pb-aside"), { opacity: 1, y: 0, duration: 0.12 }, 0.26)
        // --- crossfade into part 2 --------------------------------------
        .to(q(".pb-dark"), { opacity: 0, duration: 0.1 }, 0.34)
        .to(q(".pb-light"), { opacity: 1, scale: 1, duration: 0.12 }, 0.34);

      // --- part 2: one slot, three states -------------------------------
      // Each card holds the slot for an equal share of the remaining scroll,
      // handing over with a short overlap so the swap reads as a change of
      // content, not a change of section.
      const start = 0.46;
      const span = (1 - start) / cards.length;
      cards.forEach((card, i) => {
        const at = start + i * span;
        if (i > 0) {
          tl.to(cards[i - 1], { opacity: 0, duration: 0.05, ease: "power1.inOut" }, at)
            .fromTo(
              card,
              { opacity: 0 },
              { opacity: 1, duration: 0.06, ease: "power1.inOut" },
              at + 0.01,
            )
            .fromTo(
              card.querySelectorAll(".pb-card-line"),
              { y: 26, opacity: 0 },
              { y: 0, opacity: 1, duration: 0.07, stagger: 0.015, ease: "power2.out" },
              at + 0.015,
            )
            .fromTo(
              card.querySelector(".pb-num"),
              { yPercent: 40, opacity: 0 },
              { yPercent: 0, opacity: 1, duration: 0.08, ease: "power2.out" },
              at + 0.015,
            );
        }
        // Progress ticks track whichever card owns the slot.
        tl.to(q(`.pb-tick-${i}`), { scaleX: 1, duration: span * 0.9, ease: "none" }, at);
      });
    },
    [],
    (root) => {
      // Reduced motion: the paragraph is fully legible and the first card is
      // shown; the other two are reachable as static content below it.
      const q = gsap.utils.selector(root);
      gsap.set(q(".pb-word"), { opacity: 1 });
      gsap.set(q(".pb-aside"), { opacity: 1, y: 0 });
      gsap.set(q(".pb-card"), { opacity: 1, position: "relative" });
      gsap.set(q(".pb-light"), { opacity: 1, scale: 1 });
      gsap.set(q(".pb-dark"), { opacity: 1 });
    },
  );

  return (
    <section
      id="problem"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        fontFamily: font.sans,
      }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        {/* ---------------- part 1 — dark, fixed background ------------- */}
        <div className="pb-dark" style={{ position: "absolute", inset: 0 }}>
          <MediaTile
            src={backgroundSrc}
            seed={7}
            style={{ position: "absolute", inset: 0 }}
          />
          {/* The paragraph sits over the image but behind its own veil, so the
              footage stays visible through the type. */}
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${hexA(color.black, 0.78)} 0%, ${hexA(color.black, 0.44)} 45%, ${hexA(color.black, 0.85)} 100%)`,
            }}
          />
          <Grain opacity={0.18} />

          <div
            style={{
              position: "relative",
              height: "100%",
              display: "grid",
              gridTemplateColumns: "minmax(0, 8fr) minmax(0, 4fr)",
              alignContent: "center",
              gap: 48,
              padding: `0 ${layout.pad}`,
              color: color.textOnDark,
            }}
          >
            <div>
              <MicroLabel tone="ruby" style={{ marginBottom: 34 }}>
                {copy.label}
              </MicroLabel>
              <p
                style={{
                  margin: 0,
                  maxWidth: "26ch",
                  fontFamily: font.display,
                  fontWeight: 400,
                  fontSize: fluid(22, 42),
                  lineHeight: 1.32,
                  letterSpacing: "-0.015em",
                }}
              >
                {words.map((w, i) => (
                  <span key={i} className="pb-word" style={{ display: "inline-block" }}>
                    {w}
                    {i < words.length - 1 ? " " : ""}
                  </span>
                ))}
              </p>
            </div>

            <div
              className="pb-aside"
              style={{
                alignSelf: "end",
                paddingBottom: "12vh",
                maxWidth: 300,
                fontSize: fluid(13, 15),
                lineHeight: 1.6,
                color: color.textOnDarkMuted,
                borderLeft: `1px solid ${color.hairlineOnDark}`,
                paddingLeft: 20,
              }}
            >
              {copy.introAside}
            </div>
          </div>
        </div>

        {/* ---------------- part 2 — light cycling card ----------------- */}
        <div
          className="pb-light"
          style={{
            position: "absolute",
            inset: 0,
            background: color.bone,
            color: color.textOnLight,
          }}
        >
          <div
            style={{
              position: "relative",
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              padding: `clamp(90px, 12vh, 140px) ${layout.pad} clamp(60px, 9vh, 96px)`,
            }}
          >
            {/* The slot. Every state stacks here and swaps in place. */}
            <div style={{ position: "relative", flex: 1, minHeight: 0 }}>
              {copy.cards.map((card, i) => (
                <article
                  key={card.n}
                  className="pb-card"
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "grid",
                    gridTemplateColumns: "minmax(0, 6fr) minmax(0, 5fr)",
                    alignItems: "center",
                    gap: "clamp(32px, 5vw, 80px)",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                    <div
                      className="pb-card-line"
                      style={{ display: "flex", alignItems: "center", gap: 14 }}
                    >
                      <CardIcon index={i} />
                      <MicroLabel tone="ruby">{card.label}</MicroLabel>
                    </div>
                    <h3
                      className="pb-card-line"
                      style={{
                        margin: 0,
                        maxWidth: "16ch",
                        fontFamily: font.display,
                        fontWeight: 400,
                        fontSize: fluid(30, 66),
                        lineHeight: 1.02,
                        letterSpacing: "-0.025em",
                      }}
                    >
                      {card.headline}
                    </h3>
                    <p
                      className="pb-card-line"
                      style={{
                        margin: 0,
                        maxWidth: "42ch",
                        fontSize: fluid(14, 17),
                        lineHeight: 1.6,
                        color: color.textOnLightMuted,
                      }}
                    >
                      {card.body}
                    </p>
                  </div>

                  <div style={{ position: "relative", height: "min(60vh, 520px)" }}>
                    <MediaTile
                      src={cardMedia[i]}
                      seed={i * 5 + 11}
                      radius={4}
                      style={{ position: "absolute", inset: 0 }}
                    />
                    {/* The large number, set against the image edge — same
                        motif as How It Works and the Case Study. */}
                    <div
                      className="pb-num"
                      style={{
                        position: "absolute",
                        left: -28,
                        bottom: -18,
                        fontFamily: font.display,
                        fontSize: fluid(68, 168),
                        lineHeight: 0.8,
                        letterSpacing: "-0.04em",
                        color: color.ruby,
                        textShadow: `0 0 28px ${hexA(color.ruby, 0.55)}, 0 0 80px ${hexA(color.ruby, 0.3)}`,
                        pointerEvents: "none",
                      }}
                    >
                      {card.n}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {/* Which of the three states is on screen. */}
            <div style={{ display: "flex", gap: 10, marginTop: 34 }}>
              {copy.cards.map((card, i) => (
                <div
                  key={card.n}
                  style={{
                    position: "relative",
                    flex: 1,
                    height: 1,
                    background: color.hairlineOnLight,
                  }}
                >
                  <div
                    className={`pb-tick-${i}`}
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: color.ruby,
                      transformOrigin: "left center",
                      transform: "scaleX(0)",
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * A small mark per pain point — invisible, ignored, stalled. Drawn rather
 * than pulled from an icon set so they share the site's hairline weight.
 */
function CardIcon({ index }: { index: number }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color.ruby,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    style: { transition: `opacity 400ms ${ease.out}` },
  };

  if (index === 0) {
    // Invisible — an eye, struck through.
    return (
      <svg {...common}>
        <path d="M2 12s3.8-6 10-6 10 6 10 6-3.8 6-10 6-10-6-10-6Z" />
        <circle cx="12" cy="12" r="2.6" />
        <path d="M3 21 21 3" />
      </svg>
    );
  }
  if (index === 1) {
    // Ignored — a flat signal.
    return (
      <svg {...common}>
        <path d="M2 17h4l3-9 3 13 3-8h7" />
      </svg>
    );
  }
  // Stalled — a broken cadence.
  return (
    <svg {...common}>
      <path d="M3 6h5M12 6h3M19 6h2M3 12h2M9 12h9M3 18h7M14 18h7" />
    </svg>
  );
}
