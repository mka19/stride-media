import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef } from "react";
import { gsap, useGsapContext } from "./gsap";
import { registerSurface, type SurfaceHandle } from "./surface";
import { problem as copy } from "./copy";
import { color, hexA, layout, rhythm, space, typeScale } from "./theme";
import { Grain, MediaTile, MicroLabel } from "./primitives";
import { useBreakpoint } from "./responsive";

/**
 * Problem — sakazuki.io Philosophy reference.
 *
 *   Part 1  Pinned and dark, over a background that never moves. The
 *           statement reveals a word at a time, centred at 720px.
 *   Bridge  The dark layer crossfades out as the light layer crossfades in.
 *   Part 2  Pinned and light. One card slot holds the same screen position
 *           and cycles through the three pain points at scroll checkpoints —
 *           icon, label, headline, portrait and number all swap together,
 *           the incoming state rising ~10px as it fades in.
 *
 * Columns are 40 / 30 / 30: statement, portrait, number and description.
 */

export default function Problem({
  /** Cinematic footage for part 1. Falls back to a generated fill. */
  backgroundSrc,
  /** One image per pain point, in order. */
  cardMedia = [],
  scrollLength = "460vh",
}: {
  backgroundSrc?: string;
  cardMedia?: string[];
  scrollLength?: string;
}) {
  const words = copy.intro.split(" ");
  const surface = useRef<SurfaceHandle | null>(null);
  const bp = useBreakpoint();
  // Pinning is what janks on real phone hardware, and a cycling slot is
  // disorienting on a small screen, so below tablet the section becomes
  // ordinary sequential scroll instead of a shortened version of the pin.
  const stacked = bp === "mobile";

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      const cards = q(".pb-card");

      gsap.set(q(".pb-word"), { opacity: 0.12 });
      gsap.set(q(".pb-light"), { opacity: 0 });
      gsap.set(cards, { opacity: 0 });
      gsap.set(cards[0], { opacity: 1 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          invalidateOnRefresh: true,
          // Hand the nav its tone at the crossfade's midpoint, so the bar
          // turns with the ground rather than before or after it.
          onUpdate: (self) => surface.current?.setTone(self.progress > 0.36 ? "light" : "dark"),
        },
      });

      // --- part 1: the statement reveals, word by word --------------------
      // `amount` spreads the whole stagger over a fixed slice, so the last
      // word always lands at 0.25 however long the copy is. A per-word value
      // scaled with the word count and ran past the crossfade, which cut away
      // mid-sentence.
      tl.to(
        q(".pb-word"),
        { opacity: 1, duration: 0.05, stagger: { amount: 0.18 }, ease: "none" },
        0.02,
      )

        // --- bridge: a straight crossfade between the two layers -----------
        .to(q(".pb-dark"), { opacity: 0, duration: 0.06 }, 0.32)
        .to(q(".pb-light"), { opacity: 1, duration: 0.06 }, 0.32);

      // --- part 2: one slot, three states at even checkpoints -------------
      const start = 0.44;
      const span = (1 - start) / cards.length;
      cards.forEach((card, i) => {
        const at = start + i * span;
        if (i > 0) {
          // Everything swaps together: icon, label, headline, portrait and
          // number. Staggering the parts makes a state look like it is
          // assembling rather than like the slot changing its contents.
          tl.to(cards[i - 1], { opacity: 0, duration: 0.04, ease: "power2.inOut" }, at).fromTo(
            card,
            { opacity: 0, y: 10 },
            { opacity: 1, y: 0, duration: 0.04, ease: "power2.out" },
            at + 0.01,
          );
        }
        tl.to(q(`.pb-tick-${i}`), { scaleX: 1, duration: span * 0.9, ease: "none" }, at);
      });
    },
    [],
    // Reduced motion: the light card, its first state and the portrait in
    // place, with the statement fully legible above it.
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".pb-word"), { opacity: 1 });
      gsap.set(q(".pb-light"), { opacity: 1 });
      gsap.set(q(".pb-dark"), { opacity: 0 });
      gsap.set(q(".pb-card"), { opacity: 0 });
      gsap.set(q(".pb-card")[0], { opacity: 1 });
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

  if (stacked) {
    return (
      <section
        id="problem"
        style={{
          background: color.bone,
          color: color.textOnLight,
          fontFamily: typeScale.bodyLg.fontFamily,
        }}
      >
        {/* Part 1 — a normal block over the background, no pin, no reveal. */}
        <div style={{ position: "relative", background: color.black }}>
          <MediaTile src={backgroundSrc} seed={7} style={{ position: "absolute", inset: 0 }} />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${hexA(color.black, 0.8)} 0%, ${hexA(color.black, 0.88)} 100%)`,
            }}
          />
          <Grain opacity={0.18} />
          <div
            style={{
              position: "relative",
              display: "flex",
              flexDirection: "column",
              gap: rhythm.eyebrowToHeadline,
              padding: `${layout.section} ${layout.pad}`,
              color: color.textOnDark,
            }}
          >
            <MicroLabel tone="accent">{copy.label}</MicroLabel>
            <p style={{ margin: 0, ...typeScale.bodyLg }}>{copy.intro}</p>
          </div>
        </div>

        {/* Part 2 — three full-width cards in reading order. */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: layout.section,
            padding: `${layout.section} ${layout.pad}`,
          }}
        >
          {copy.cards.map((card, i) => (
            <article
              key={card.n}
              style={{ display: "flex", flexDirection: "column", gap: rhythm.eyebrowToHeadline }}
            >
              <CardIcon index={i} />
              <MicroLabel tone="light">Problem</MicroLabel>
              <div style={{ ...typeScale.h3 }}>{card.label}</div>
              <h3 style={{ margin: 0, ...typeScale.h1 }}>{card.headline}</h3>
              <div style={{ position: "relative", width: "100%", aspectRatio: "3 / 4" }}>
                <MediaTile
                  src={cardMedia[i]}
                  seed={i * 5 + 11}
                  style={{ position: "absolute", inset: 0 }}
                />
              </div>
              <div style={{ ...typeScale.numberXl, color: color.accent }}>{card.n}</div>
              <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnLightMuted }}>
                {card.body}
              </p>
            </article>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      id="problem"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        fontFamily: typeScale.bodyLg.fontFamily,
      }}
    >
      <div
        className="pb-frame"
        style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}
      >
        {/* ---------------- part 1 — dark, fixed background ---------------- */}
        <div className="pb-dark" style={{ position: "absolute", inset: 0 }}>
          <MediaTile src={backgroundSrc} seed={7} style={{ position: "absolute", inset: 0 }} />
          <div
            aria-hidden="true"
            style={{
              position: "absolute",
              inset: 0,
              background: `linear-gradient(180deg, ${hexA(color.black, 0.78)} 0%, ${hexA(color.black, 0.5)} 45%, ${hexA(color.black, 0.85)} 100%)`,
            }}
          />
          <Grain opacity={0.18} />

          {/* The statement: 720px, left-aligned, in the lower third. */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              gap: rhythm.eyebrowToHeadline,
              padding: `0 ${layout.pad}`,
              color: color.textOnDark,
            }}
          >
            <MicroLabel tone="accent">{copy.label}</MicroLabel>
            <p style={{ margin: 0, maxWidth: 720, ...typeScale.bodyLg }}>
              {words.map((w, i) => (
                <span key={i} className="pb-word" style={{ display: "inline-block" }}>
                  {w}
                  {i < words.length - 1 ? "\u00A0" : ""}
                </span>
              ))}
            </p>
          </div>
        </div>

        {/* ---------------- part 2 — light, cycling card ------------------- */}
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
            <div
              style={{
                position: "relative",
                flex: 1,
                minHeight: 0,
                display: "flex",
                alignItems: "center",
              }}
            >
              {copy.cards.map((card, i) => (
                <article
                  key={card.n}
                  className="pb-card"
                  style={{
                    position: "absolute",
                    left: 0,
                    right: 0,
                    /* The resting state is in the markup, not left to script.
                       Rendered without the scroll timeline — a static render,
                       or Framer's canvas — all three states would otherwise
                       paint at once, on top of each other. */
                    opacity: i === 0 ? 1 : 0,
                    display: "grid",
                    /* Tablet drops to two rows — statement, then portrait
                       beside the number — rather than three narrow columns. */
                    gridTemplateColumns: bp === "tablet" ? "1fr 1fr" : "40% 30% 30%",
                    gap: layout.gutter,
                    alignItems: "center",
                    height: "min(520px, 58vh)",
                  }}
                >
                  {/* ---- left: icon, eyebrow, sub-label, headline ---- */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      gap: rhythm.eyebrowToHeadline,
                      gridColumn: bp === "tablet" ? "1 / -1" : undefined,
                    }}
                  >
                    <CardIcon index={i} />
                    <MicroLabel tone="light">Problem</MicroLabel>
                    <div style={{ ...typeScale.h3 }}>{card.label}</div>
                    <h3 style={{ margin: 0, maxWidth: "13ch", ...typeScale.h1 }}>{card.headline}</h3>
                  </div>

                  {/* ---- centre: the portrait and its caption ---- */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: space.md,
                      height: "100%",
                    }}
                  >
                    <div style={{ position: "relative", height: "100%", aspectRatio: "3 / 4" }}>
                      <MediaTile
                        src={cardMedia[i]}
                        seed={i * 5 + 11}
                        style={{ position: "absolute", inset: 0 }}
                      />
                    </div>
                    <span style={{ ...typeScale.eyebrow, color: color.textOnLightMuted }}>
                      {card.caption}
                    </span>
                  </div>

                  {/* ---- right: the number, then its description ---- */}
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      alignItems: "flex-end",
                      textAlign: "right",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        ...typeScale.numberXl,
                        color: color.accent,
                        textShadow: `0 0 30px ${hexA(color.accent, 0.4)}`,
                      }}
                    >
                      {card.n}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        maxWidth: "34ch",
                        ...typeScale.bodyLg,
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
                      background: color.accent,
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
 * A mark per pain point — invisible, unscripted, inconsistent. Drawn rather
 * than pulled from an icon set so they carry the site's hairline weight.
 */
function CardIcon({ index }: { index: number }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: color.accent,
    strokeWidth: 1.4,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
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
    // Unscripted — a flat signal with nothing to catch on.
    return (
      <svg {...common}>
        <path d="M2 17h4l3-9 3 13 3-8h7" />
      </svg>
    );
  }
  // Inconsistent — a broken cadence.
  return (
    <svg {...common}>
      <path d="M3 6h5M12 6h3M19 6h2M3 12h2M9 12h9M3 18h7M14 18h7" />
    </svg>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(Problem, {
  backgroundSrc: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"], title: "Background" },
  cardMedia: {
    type: ControlType.Array,
    title: "Card portraits",
    control: { type: ControlType.File, allowedFileTypes: ["mp4", "webm", "jpg", "png"] },
    maxCount: 3,
  },
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "460vh" },
});
