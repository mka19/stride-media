import { useEffect, useRef } from "react";
import { gsap, useGsapContext, SCRUB, reveal, approach } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { problem as copy } from "../shared/copy";
import { color, fluid, hexA, layout, numberGradient, rhythm, space, typeScale } from "../shared/theme";
import { Grain, MediaTile, MicroLabel } from "../shared/primitives";
import { useBreakpoint, useStacked } from "../shared/responsive";
import GradientRevealText from "../shared/GradientRevealText";

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
  /** Footage for the objects that sit inline in the About statement. */
  objectMedia = [],
  scrollLength = "720vh",
}: {
  backgroundSrc?: string;
  cardMedia?: string[];
  objectMedia?: string[];
  scrollLength?: string;
}) {
  const surface = useRef<SurfaceHandle | null>(null);
  const bp = useBreakpoint();
  // Pinning is what janks on real phone hardware, and a cycling slot is
  // disorienting on a small screen, so below tablet the section becomes
  // ordinary sequential scroll instead of a shortened version of the pin.
  const stacked = useStacked();

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      // The overlap with the section before this one. Runs on the frame,
      // which this section's own timelines only ever measure, never animate.
      approach(root, ".pb-frame");
      const cards = q(".pb-card");

      // The plate is 16:9 at min(430px, 48vh) tall, so what it takes to
      // cover the frame is known without measuring anything.
      const plateH = Math.min(430, window.innerHeight * 0.48);
      const plateW = (plateH * 16) / 9;
      const coverScale =
        Math.max(window.innerWidth / plateW, window.innerHeight / plateH) * 1.06;

      // The statement resolves by opacity, not by a gradient: the words are
      // white throughout and simply come up from dim to full as the reading
      // reaches them. A clipped fill was a second colour laid over the type;
      // this is the type's own colour, which is what the reference does.
      gsap.set(q(".pb-light"), { opacity: 0 });
      gsap.set(q(".pb-word"), { opacity: 0.16 });
      /*
       * No blur, and a much smaller scale.
       *
       * Three properties were animating on every tile at once — opacity,
       * scale and a 7px blur — and the blur was the worst of them twice
       * over. It forces a full repaint of the tile on every scrubbed frame
       * rather than riding the compositor like transform and opacity do, and
       * a scroll-driven blur is the single most distracting effect on a
       * page: the eye cannot help tracking something coming into focus.
       *
       * 0.94 rather than 0.72 for the same reason the reveal travel came
       * down: at 0.72 you watch the tile grow, at 0.94 you register that it
       * arrived. The movement should be felt, not announced.
       */
      gsap.set(q(".pb-tile"), { opacity: 0.16, scale: 0.94 });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB,
          invalidateOnRefresh: true,
          // Hand the nav its tone at the crossfade's midpoint, so the bar
          // turns with the ground rather than before or after it.
          onUpdate: (self) => surface.current?.setTone(self.progress > 0.5 ? "light" : "dark"),
        },
      });

      // --- part 1: the statement resolves, word by word -------------------
      // `amount` spreads the whole stagger over a fixed slice, so the last
      // word lands at the same point however long the copy is. A per-word
      // value scaled with the word count and ran past the ground change,
      // which cut the sentence off mid-way.
      //
      // Words and objects resolve in the order they are read, spread over the
      // whole dark chapter so the pace is the reader's.
/*
       * The words lead; the objects follow them.
       *
       * These used to start a hundredth apart and run over the same 0.3
       * slice, so the whole chapter was two staggered groups resolving
       * simultaneously — the reader's eye had a sentence assembling on one
       * side and six tiles assembling on the other, with nothing to say
       * which was the point. Reading is the primary act here, so the
       * sentence gets the chapter's opening to itself and the objects
       * settle in underneath it once it is most of the way there.
       *
       * The tiles' own stagger is shortened too. They are supporting
       * movement: they should register as having appeared, not perform an
       * entrance of their own alongside the one already running.
       */
      tl.to(
        q(".pb-word"),
        { opacity: 1, duration: 0.06, ease: "none", stagger: { amount: 0.3 } },
        0.02,
      ).to(
        q(".pb-tile"),
        {
          opacity: 1,
          scale: 1,
          duration: 0.05,
          ease: reveal.ease,
          stagger: { amount: 0.18 },
        },
        0.2,
      );

      tl

        // --- bridge -------------------------------------------------------
        // The statement holds from 0.25 to 0.42 before it leaves. It used to
        // start fading three percent after the last word landed, which is
        // about a hundred pixels of scroll — the sentence was gone before it
        // could be read, so the whole dark chapter registered as missing.
        //
        // Sequenced, not crossfaded. Fading both layers over the same beat
        // left them each half-transparent in the middle, so the footage
        // showed through the white and the bridge read as a grey wash. Now
        // the statement leaves first, the opaque light layer rises over the
        // footage, and only then does the dark layer drop out — there is no
        // frame where two grounds are visible at once.
        .to(q(".pb-statement"), { opacity: 0, y: -16, duration: 0.06, ease: reveal.easeIn }, 0.4)
        .to(q(".pb-light"), { opacity: 1, duration: 0.09, ease: "power2.inOut" }, 0.43)
        .set(q(".pb-dark"), { opacity: 0 }, 0.54);

      // --- part 2: the footage never leaves the screen --------------------
      //
      // Each state's plate arrives already covering the frame, shrinks into
      // its slot while the card's text fades in around it, holds, then grows
      // back out to cover — and the next plate fades up underneath it at the
      // same size, so the handover happens between two full-bleed frames and
      // there is never a moment without footage on screen. The last state
      // expands too: the section leaves through the footage the same way
      // every state inside it did.
      const start = 0.52;
      const span = (1 - start) / cards.length;

      cards.forEach((card, i) => {
        const at = start + i * span;
        const media = card.querySelector(".pb-media") as HTMLElement | null;
        const text = card.querySelectorAll(".pb-text");

        gsap.set(card, { opacity: 0 });
        if (media) gsap.set(media, { scale: coverScale, transformOrigin: "50% 50%" });

        // 1. take over the screen from the plate before it, at the same size
        tl.to(card, { opacity: 1, duration: 0.05 }, at);
        if (i > 0) tl.to(cards[i - 1], { opacity: 0, duration: 0.05 }, at + 0.03);

        // 2. settle into the slot, and let the card build around it
        if (media) {
          tl.to(media, { scale: 1, duration: span * 0.3, ease: "power2.inOut" }, at + 0.02);
        }
        tl.fromTo(
          text,
          // 16px, matching the shared reveal travel. This was 26 — the one
          // place on the page where body copy travelled further than the
          // headings did.
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, duration: span * 0.22, ease: reveal.ease },
          at + span * 0.18,
        );

        // 3. the text goes, and the plate grows back out to cover
        // Leaving is the exact inverse of arriving, at the same distance.
        tl.to(text, { opacity: 0, y: -16, duration: span * 0.16, ease: reveal.easeIn }, at + span * 0.66);
        if (media) {
          tl.to(
            media,
            { scale: coverScale, duration: span * 0.32, ease: "power2.inOut" },
            at + span * 0.68,
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
      gsap.set(q(".pb-tile"), { opacity: 1, scale: 1 });
      gsap.set(q(".pb-light"), { opacity: 1 });
      gsap.set(q(".pb-dark"), { opacity: 0 });
      gsap.set(q(".pb-card"), { opacity: 0 });
      gsap.set(q(".pb-media"), { transformOrigin: "50% 50%" });
      gsap.set(q(".pb-text"), { opacity: 1 });
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
              <GradientRevealText
                as="h3"
                tone="light"
                style={{ ...typeScale.h1, fontSize: fluid(26, 44), maxWidth: "100%", textWrap: "balance" }}
              >
                {card.headline}
              </GradientRevealText>
              <div style={{ position: "relative", width: "100%", aspectRatio: "16 / 9" }}>
                <MediaTile
                  src={cardMedia[i]}
                  seed={i * 5 + 11}
                  style={{ position: "absolute", inset: 0 }}
                />
              </div>
              <div style={{ ...typeScale.numberXl, ...numberGradient }}>{card.n}</div>
              <p
                style={{
                  margin: 0,
                  maxWidth: "40ch",
                  ...typeScale.bodyLg,
                  color: color.textOnLightMuted,
                }}
              >
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
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        fontFamily: typeScale.bodyLg.fontFamily,
      }}
    >
      {/*
        Two chapters share one scroll container, and the nav lists them as two
        entries — so they need two anchors, spanning the stretch of scroll each
        one actually occupies.

        The nav's ABOUT link used to point at an id nothing had: the whole
        section was `id="problem"`, so clicking ABOUT did nothing at all and
        the ABOUT entry never lit up as you passed it. These are zero-visual
        markers, but they have real height, because the nav reads their
        bounding boxes to work out where you are and how far through.

        0.52 is where the card chain starts on the timeline; the same number
        splits the anchors, so the nav changes over exactly when the chapter
        does rather than at a guessed point.
      */}
      <span
        id="about"
        aria-hidden="true"
        style={{ position: "absolute", top: 0, height: "52%", left: 0, right: 0, pointerEvents: "none" }}
      />
      <span
        id="problem"
        aria-hidden="true"
        style={{ position: "absolute", top: "52%", bottom: 0, left: 0, right: 0, pointerEvents: "none" }}
      />

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

          {/* The About chapter — the statement runs the full measure from
              the page margin, with the site's own objects sitting inline in
              the sentence. Words resolve from low-opacity white to full
              white as the chapter is read; the objects settle out of a blur
              at the point the reading reaches them. */}
          <div
            className="pb-statement"
            style={{
              position: "absolute",
              inset: 0,
              display: "flex",
              flexDirection: "column",
              /*
               * The rule and the two blocks under it stay on the floor of the
               * frame; the label and the statement are centred in what is
               * left above them.
               *
               * The label used to be pinned to the top by space-between, a
               * third of a screen above the words it labels, which read as
               * two unrelated things. Centring the whole column fixed that
               * but brought the rule up with it. So the column ends at the
               * floor and the pair centres itself in the space above, with
               * the auto margins on the group below doing the work.
               */
              justifyContent: "flex-end",
              alignItems: "center",
              textAlign: "center",
              padding: `calc(${layout.navHeight}px + ${space.xl}px) ${layout.pad} ${space.hh}px`,
              color: color.textOnDark,
            }}
          >
            <div
              style={{
                // Centred in the space the floor group leaves. Sixteen between
                // the label and the words it labels.
                margin: "auto 0",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 16,
              }}
            >
              <MicroLabel tone="accent">{copy.label}</MicroLabel>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
            <p
              style={{
                margin: 0,
                ...typeScale.h3,
                fontSize: fluid(26, 48),
                lineHeight: fluid(29, 52),
                // A block, not a flex row: flex sizes each row to its tallest
                // item and ignores line-height, so the object tiles set the
                // row height and the leading went wherever they put it.
                display: "block",
                textAlign: "center",
                textTransform: "uppercase",
                fontWeight: 500,
                maxWidth: "min(1680px, 94vw)",
              }}
            >
              {copy.introSequence.map((token, i) =>
                typeof token === "number" ? (
                  <span
                    key={i}
                    className="pb-tile"
                    aria-hidden="true"
                    style={{
                      position: "relative",
                      display: "inline-block",
                      width: "1.06em",
                      height: "1.06em",
                      /*
                       * A tile needs more air than a word does. A word's
                       * neighbours are letters with their own side bearings;
                       * a tile is a solid block to its own edge, so the same
                       * 0.26em that reads as a word space reads as the tile
                       * touching the caps either side of it. The left margin
                       * adds to the previous word's trailing space and the
                       * right one stands alone, so both gaps come to 0.32em.
                       */
                      margin: "0 0.32em 0 0.06em",
                      borderRadius: "0.18em",
                      overflow: "hidden",
                      // Sat on the text's own baseline band, so it rides the
                      // line rather than pushing the row taller than the
                      // leading allows for.
                      verticalAlign: "-0.18em",
                      boxShadow: `0 0 0 1px ${hexA("#FFFFFF", 0.14)}`,
                      willChange: "transform, filter",
                    }}
                  >
                    <MediaTile
                      src={objectMedia[token]}
                      seed={token * 9 + 3}
                      radius={0}
                      style={{ position: "absolute", inset: 0 }}
                    />
                  </span>
                ) : (
                  <span
                    key={i}
                    className="pb-word"
                    style={{ display: "inline-block", marginRight: "0.26em" }}
                  >
                    {token}
                  </span>
                ),
              )}
              </p>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: space.xl, width: "100%" }}>
              <div style={{ height: 1, background: color.hairlineOnDark }} />
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                  gap: space.hh,
                  textAlign: "left",
                  width: "100%",
                }}
              >
                <div
                  style={{
                    ...typeScale.eyebrow,
                    lineHeight: fluid(19, 22),
                    color: color.textOnDarkMuted,
                  }}
                >
                  {copy.aboutCaps.map((line) => (
                    <span key={line} style={{ display: "block" }}>
                      {line}
                    </span>
                  ))}
                </div>
                <p
                  style={{
                    margin: 0,
                    ...typeScale.bodyLg,
                    fontSize: fluid(13, 15),
                    color: color.textOnDarkMuted,
                    maxWidth: "44ch",
                  }}
                >
                  {copy.aboutMission}
                </p>
              </div>
            </div>
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
              // Only the nav needs clearing at the top; the section token on
              // top of it pushed the slot into the lower half of the frame
              // and left a dead band above every card.
              padding: `calc(${layout.navHeight}px + ${space.xl}px) ${layout.pad} ${space.xl}px`,
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
                       beside the number — rather than three narrow columns.
                       On desktop the outer columns are equal and the portrait
                       takes exactly the width its aspect ratio needs, so the
                       plate sits on the centre line of the screen rather than
                       wherever a 40/30/30 split happened to leave it. */
                    gridTemplateColumns: bp === "tablet" ? "1fr 1fr" : "1fr auto 1fr",
                    gap: layout.gutter,
                    alignItems: "center",
                    // Shorter, because the plate is landscape now: at the old height a
                    // 16:9 frame took most of the row's width and squeezed the
                    // two text columns either side of it.
                    height: "min(430px, 48vh)",
                  }}
                >
                  {/* ---- left: icon, eyebrow, sub-label, headline ---- */}
                  <div
                    className="pb-text"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      gap: rhythm.eyebrowToHeadline,
                      gridColumn: bp === "tablet" ? "1 / -1" : undefined,
                      height: "100%",
                      minWidth: 0,
                    }}
                  >
                    <CardIcon index={i} />
                    <MicroLabel tone="light">Problem</MicroLabel>
                    <div style={{ ...typeScale.h3 }}>{card.label}</div>
                    <GradientRevealText
                      as="h3"
                      tone="light"
                      style={{
                        ...typeScale.h1,
                        // Sized to its own column rather than to a character
                        // count: at the full h1 the line ran past the column
                        // rule below it and took three lines to do it.
                        fontSize: fluid(26, 44),
                        lineHeight: fluid(31, 50),
                        maxWidth: "100%",
                        textWrap: "balance",
                      }}
                    >
                      {card.headline}
                    </GradientRevealText>
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
                      // No stretching: the column is as wide as the plate, and
                      // the plate is as wide as its own aspect ratio allows.
                      minWidth: 0,
                    }}
                  >
                    <div
                      className="pb-media"
                      style={{
                        position: "relative",
                        height: "100%",
                        aspectRatio: "16 / 9",
                        // The portrait settles out of a push-in across the
                        // card's hold; without the clip it would bleed past
                        // its own frame as it scales.
                        overflow: "hidden",
                      }}
                    >
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
                    className="pb-text"
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      // Pinned to the column's full height, the number was
                      // stranded in the top corner with its own description
                      // half a frame below it. They belong together.
                      justifyContent: "center",
                      alignItems: "flex-end",
                      textAlign: "right",
                      gap: rhythm.headlineToBody,
                      height: "100%",
                    }}
                  >
                    <div
                      className="pb-number"
                      style={{
                        ...typeScale.numberXl,
                        ...numberGradient,
                        // No halo. The glow behind the figure bled across the
                        // column as a pale smear and read as a stray layer
                        // rather than as light.
                        willChange: "transform",
                      }}
                    >
                      {card.n}
                    </div>
                    <p
                      style={{
                        margin: 0,
                        maxWidth: "40ch",
                        textWrap: "balance",
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
