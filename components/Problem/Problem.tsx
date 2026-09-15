import { useEffect, useRef } from "react";
import { gsap, useGsapContext } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { problem as copy } from "../shared/copy";
import { color, ease, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
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
  // The nav flips to its light treatment when part 2 takes over, so this
  // section publishes its own tone rather than leaving the nav to guess.
  const surface = useRef<SurfaceHandle | null>(null);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      const cards = q(".pb-card");

      gsap.set(q(".pb-word"), { opacity: 0.12 });
      gsap.set(q(".pb-light"), { opacity: 0, scale: 1.04 });
      gsap.set(cards, { opacity: 0, y: 0 });
      gsap.set(cards[0], { opacity: 1 });
      gsap.set(q(".pb-aside"), { opacity: 0, y: 16 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          // Hand the nav its tone at the crossfade's midpoint, so the bar
          // changes with the background rather than before or after it.
          onUpdate: (self) => surface.current?.setTone(self.progress > 0.39 ? "light" : "dark"),
        },
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
          // Icon, label, headline, image and number all swap at once: the old
          // card fades out while the new one fades in and rises a few pixels.
          // Staggering the parts makes one state look like it is assembling
          // rather than like the slot changing its contents.
          tl.to(cards[i - 1], { opacity: 0, duration: 0.05, ease: "power2.inOut" }, at).fromTo(
            card,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.05, ease: "power2.out" },
            at + 0.012,
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
      surface.current?.setTone("light");
    },
  );

  useEffect(() => {
    const frame = rootRef.current?.querySelector<HTMLElement>(".pb-frame");
    if (!frame) return;
    const handle = registerSurface(frame, "dark");
    surface.current = handle;
    return () => {
      handle.release();
      surface.current = null;
    };
  }, [rootRef]);

  return (
    <section
      id="problem"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        fontFamily: typeScale.body.fontFamily,
      }}
    >
      <div className="pb-frame" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
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
              /* The statement sits in the lower third, over the background. */
              alignContent: "end",
              gap: space.xxl,
              padding: `0 ${layout.pad} 18vh`,
              color: color.textOnDark,
            }}
          >
            <div>
              <MicroLabel tone="ruby" style={{ marginBottom: rhythm.eyebrowToHeadline }}>
                {copy.label}
              </MicroLabel>
              <p
                style={{
                  margin: 0,
                  maxWidth: 720,
                  ...typeScale.bodyLg,
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
                maxWidth: 300,
                ...typeScale.body,
                color: color.textOnDarkMuted,
                borderLeft: `1px solid ${color.hairlineOnDark}`,
                paddingLeft: space.lg,
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
              padding: `calc(${layout.navHeight}px + ${layout.section}) ${layout.pad} ${layout.section}`,
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
                    /* Three columns, as in the reference: the statement on the
                       left, a portrait frame down the middle, the number and
                       its supporting line on the right. */
                    gridTemplateColumns: "40% 30% 30%",
                    alignItems: "stretch",
                    gap: space.lg,
                  }}
                >
                  {/* ---- left: mark, label, parenthetical, statement ---- */}
                  <div style={{ display: "flex", flexDirection: "column", gap: rhythm.eyebrowToHeadline }}>
                    <div className="pb-card-line">
                      <CardIcon index={i} />
                    </div>
                    <MicroLabel tone="light" className="pb-card-line">
                      Problem
                    </MicroLabel>
                    <div
                      className="pb-card-line"
                      style={{
                        ...typeScale.h3,
                        color: color.textOnLight,
                      }}
                    >
                      {card.label}
                    </div>
                    <h3
                      className="pb-card-line"
                      style={{
                        margin: 0,
                        maxWidth: "13ch",
                        ...typeScale.h1,
                      }}
                    >
                      {card.headline}
                    </h3>
                  </div>

                  {/* ---- centre: portrait frame with its caption ---- */}
                  <div
                    className="pb-card-line"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: space.md,
                      minHeight: 0,
                    }}
                  >
                    <div
                      style={{
                        position: "relative",
                        width: "100%",
                        maxWidth: 340,
                        aspectRatio: "3 / 4",
                        maxHeight: "100%",
                      }}
                    >
                      <MediaTile
                        src={cardMedia[i]}
                        seed={i * 5 + 11}
                        style={{ position: "absolute", inset: 0 }}
                      />
                    </div>
                    <span style={{ ...typeScale.labelSm, color: color.textOnLightMuted }}>
                      {card.caption}
                    </span>
                  </div>

                  {/* ---- right: the number, then its supporting line ---- */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      textAlign: "right",
                    }}
                  >
                    <div
                      className="pb-num"
                      style={{
                        ...typeScale.numberXl,
                        color: color.ruby,
                        textShadow: `0 0 30px ${hexA(color.ruby, 0.4)}`,
                      }}
                    >
                      {card.n}
                    </div>
                    <p
                      className="pb-card-line"
                      style={{
                        margin: 0,
                        maxWidth: "34ch",
                        paddingBottom: "6vh",
                        ...typeScale.body,
                        color: color.textOnLightMuted,
                      }}
                    >
                      {card.body}
                    </p>
                  </div>
                </article>
              ))}
            </div>

            {/* Which of the three states is on screen. */}
            <div style={{ display: "flex", gap: space.s, marginTop: space.xl }}>
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
