import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef, useState } from "react";
import { gsap, useGsapContext, SCRUB, approach } from "./gsap";
import { registerSurface, type SurfaceHandle } from "./surface";
import { whyStride as copy } from "./copy";
import { color, hexA, layout, rhythm, space, typeScale } from "./theme";
import { Grain, MicroLabel } from "./primitives";
import { useBreakpoint, useStacked } from "./responsive";
import HeroObject, { type HeroObjectHandle } from "./HeroObject";
import GradientRevealText from "./GradientRevealText";

/**
 * Why Stride — trionn.com capabilities reference.
 *
 *   1. Stacked-word headline on light, each word its own line, tight stack.
 *   2. The ground turns dark and the headline turns white in the same move,
 *      then fades.
 *   3. Its letters scatter outward with a little rotation before going.
 *   4. The 3D mark fades in at centre and turns, and keeps turning.
 *   5. Capability labels cycle in one at a time beside it, fixed right, each
 *      crossfading into the next with no blank gap.
 *   6. It clears into Testimonials.
 *
 * On phones the scatter is replaced by a plain crossfade and the labels
 * become a stacked list, per the responsive prompt.
 */
export default function WhyStride({ scrollLength = "650vh" }: { scrollLength?: string }) {
  const surface = useRef<SurfaceHandle | null>(null);
  const objectRef = useRef<HeroObjectHandle | null>(null);
  const bp = useBreakpoint();
  const stacked = useStacked();
  const [, setTick] = useState(0);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      // The overlap with the section before this one. Runs on the frame,
      // which this section's own timelines only ever measure, never animate.
      approach(root, ".ws-frame");

      // Parked a full line below its window, not nudged and faded.
      gsap.set(q(".ws-word"), { yPercent: 108 });
      gsap.set(q(".ws-mask"), { overflow: "hidden" });
      gsap.set(q(".ws-dark"), { opacity: 0 });
      // It opens as the biggest thing on the screen and settles back, so the
      // section starts on the mark rather than on a line of type.
      gsap.set(q(".ws-object"), { opacity: 0, scale: 1.62 });
      gsap.set(q(".ws-card"), { opacity: 0 });
      // The object never dissolves here: it is the fixed centrepiece.
      objectRef.current?.setProgress(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB,
          onUpdate: (self) => surface.current?.setTone(self.progress < 0.2 ? "light" : "dark"),
        },
      });

      /*
       * 1. The words, first.
       *
       * The section states the four things it does, throws them off the
       * screen, and the mark is what is left standing behind them. The mark
       * arriving first was tried and it inverts the argument: the object is
       * the answer to the words, so it cannot precede them.
       */
      tl.to(
        q(".ws-word"),
        { yPercent: 0, duration: 0.07, stagger: 0.03, ease: "power3.out" },
        0.03,
      )

        // 2. The ground turns over under them, and the type inverts with it.
        .to(q(".ws-dark"), { opacity: 1, duration: 0.07 }, 0.22)
        .to(q(".ws-headline"), { color: color.textOnDark, duration: 0.07 }, 0.22)

        /* The window that uncovers each word would also clip it on the way
           out — the letters travel well past the block they belong to. It is
           opened once the last word has landed and before the scatter begins,
           and closes again on the way back up. */
        .set(q(".ws-mask"), { overflow: "visible" }, 0.30);

      // 3. The letters scatter — trionn.com's services reveal: they are
      //    thrown right out of the frame, turning as they go.
      //
      //    The direction is not random. Each letter leaves along the line
      //    from the middle of the block through its own position, so the
      //    whole word opens outward from its centre and nothing crosses
      //    anything else on the way out. Random offsets read as noise; this
      //    reads as the word being pushed apart, which is the difference
      //    between the two references.
      //
      //    Everything derives from the letter's own index and position, so
      //    the same letter takes the same path every time rather than a new
      //    one on each rebuild.
      const letters = q(".ws-letter") as HTMLElement[];
      // The frame, not the section. `root` is the whole scroll length — six
      // viewports of it — so its centre sat far below the screen and every
      // letter's outward vector pointed almost straight up. Normalised, that
      // left the horizontal component at nearly nothing, which is why they
      // rose as one clump instead of opening outward.
      const frameEl = (q(".ws-frame")[0] as HTMLElement | undefined) ?? root;
      const field = frameEl.getBoundingClientRect();
      const cx = field.left + field.width / 2;
      const cy = field.top + field.height / 2;
      // Far enough that the letters clear the frame rather than
      // gathering in a loose cloud around the middle of it.
      /*
       * Past the frame, not to its edge.
       *
       * At 0.82 of the width a letter starting near the middle ended up just
       * inside the frame and then faded where it stood, which reads as the
       * type dissolving rather than being thrown. One and a half viewports
       * puts every letter, including the ones that start closest to the
       * centre, outside the frame before it is allowed to disappear.
       */
      const reach = window.innerWidth * 1.5;
      const lift = window.innerHeight * 1.35;

      // The scatter starts once the ground has turned and the words have
      // been readable on it for a beat.
      const at = 0.34;

      letters.forEach((letter, i) => {
        const box = letter.getBoundingClientRect();
        const dx = box.left + box.width / 2 - cx;
        const dy = box.top + box.height / 2 - cy;
        const len = Math.hypot(dx, dy) || 1;
        /*
         * Direction: where the letter sits, blended with a fan.
         *
         * Position alone was not enough. The words are stacked and narrow, so
         * nearly every letter's vector from the block's centre pointed up or
         * down — which is why the field filled a column and left the sides of
         * the screen empty instead of exploding into it. Mixing in the golden
         * angle, stepped once per letter, guarantees the twenty-five of them
         * are spread right round the circle while the positional half keeps
         * the whole thing still reading as opening out from the middle.
         */
        const fan = i * 2.399963;
        const bx = (dx / len) * 0.5 + Math.cos(fan) * 0.5;
        const by = (dy / len) * 0.5 + Math.sin(fan) * 0.5;
        const blen = Math.hypot(bx, by) || 1;

        // Every letter clears the frame: the floor is what stops the ones
        // that start near the middle from stalling just outside the block.
        const push = 0.95 + 0.35 * Math.min(1, len / (field.width * 0.34));

        tl.to(
          letter,
          {
            x: (bx / blen) * reach * push,
            y: (by / blen) * lift * push,
            rotation: (dx < 0 ? -1 : 1) * (55 + (i % 7) * 34),
            // Varied, so the field has depth: some letters come at you and
            // some fall away, as in the reference. A single scale read as one
            // flat sheet of type pulling apart.
            scale: [2.1, 0.7, 1.5, 0.9, 2.6, 1.1, 0.6, 1.8][i % 8],
            // Long and decelerating: the old move was a tenth of the section
            // on power2.in, which snapped them off the screen.
            duration: 0.18,
            ease: "power2.out",
          },
          at + (i % 4) * 0.012,
        );

        /*
         * Opacity is its own tween, and a late one.
         *
         * Carrying it in the move above faded each letter out over the whole
         * travel, so by the time it was halfway across it was already gone —
         * which is why the type looked like it dissolved on the spot instead
         * of leaving. It now holds full strength for most of the throw and
         * goes out over the last third, by which point it is off the frame
         * anyway.
         */
        tl.to(
          letter,
          { opacity: 0, duration: 0.06, ease: "power1.in" },
          at + 0.12 + (i % 4) * 0.012,
        );
      });

      /*
       * 4. And the mark is what the type was hiding.
       *
       * It comes up large as the last letters clear the frame, then settles
       * back to its resting size — so it reads as having been behind them all
       * along rather than as a fifth thing arriving.
       */
      tl.fromTo(
        q(".ws-object"),
        { opacity: 0, scale: 1.62 },
        { opacity: 1, duration: 0.07, ease: "power2.out" },
        0.48,
      ).to(q(".ws-object"), { scale: 1, duration: 0.1, ease: "power2.inOut" }, 0.54);

      // The label has done its job by the time the type has gone; leaving it
      // sat on top of the mark.
      tl.to(q(".ws-label"), { opacity: 0, duration: 0.08 }, 0.56);

      /*
       * 5. The services advance like a ticker.
       *
       * Two stations are on screen, one either side of the mark. A card comes
       * in from off the right edge into the right-hand station; when it moves
       * across to the left-hand one, the card that was there leaves past the
       * left edge and the next card enters the right — all three at once, on
       * the same scroll. Nothing crossfades in place: a card is always either
       * standing in a station or travelling between two of them.
       *
       * The stations are measured rather than assumed, so the right-hand one
       * is wherever the frame's right edge actually is, and they are measured
       * again on every refresh.
       */
      const cards = q(".ws-card") as HTMLElement[];
      const first = 0.62;
      // Each card spends one step arriving, one crossing, one leaving, and the
      // steps overlap by exactly one — so the whole run is n + 2 steps long
      // with a little tail.
      const STEP = (1 - first) / (cards.length + 1.45);

      /*
       * One pitch, four positions.
       *
       * The distance between the two on-screen stations is the pitch, and the
       * two off-screen positions are one pitch beyond each of them. That is
       * the whole trick to cards that never touch: every step advances a card
       * by exactly one pitch and every step has the same shape, so two cards
       * are always exactly one pitch apart — at any point in the move, not
       * just when they are standing still.
       *
       * The previous version had unequal gaps (a short hop in from the right,
       * a long crossing, a short exit) and a different ease on each leg. The
       * card leaving used a slow-in curve while the card crossing used an
       * ease-in-out, so at the same moment the leaver was a fifth of the way
       * out and the arriver four fifths of the way in — and they overlapped
       * by a hundred and twenty pixels. Same distance, same curve, every leg.
       */
      const pitch = () => {
        const frame = (q(".ws-frame")[0] as HTMLElement | undefined) ?? root;
        const card = cards[0] as HTMLElement;
        const pad = card.offsetLeft;
        return Math.max(1, frame.clientWidth - pad * 2 - card.offsetWidth);
      };

      cards.forEach((card, i) => {
        const at = first + i * STEP;
        // The move takes most of the step and the rest is a rest: a card
        // stands in its station long enough to be read before it is carried
        // on. The hold is what makes it a ticker rather than a conveyor.
        /*
         * Most of the step is travel.
         *
         * At two thirds the cards spent a third of every step standing dead
         * still, and on a scrub that reads as stop-start rather than as a
         * ticker — the pause is long enough to register as the animation
         * having jammed. A longer move on a gentler curve keeps them going
         * almost continuously while still easing into each station.
         */
        const MOVE = STEP * 0.88;
        const leg = { duration: MOVE, ease: "power1.inOut", force3D: true } as const;

        gsap.set(card, { x: () => pitch() * 2, opacity: 0, force3D: true });

        // Off the right edge, into the right-hand station.
        tl.fromTo(
          card,
          { x: () => pitch() * 2, opacity: 0 },
          { x: () => pitch(), opacity: 1, ...leg },
          at,
        );

        // Across to the left-hand station, as the card ahead of it leaves.
        tl.to(card, { x: 0, ...leg }, at + STEP);

        // And out past the left edge, one pitch further on — except for the
        // last one, which stands in the left-hand station to the end of the
        // section. Letting it leave too emptied the frame for the last fifth
        // of the scroll.
        if (i < cards.length - 1) {
          tl.to(card, { x: () => -pitch(), opacity: 0, ...leg }, at + STEP * 2);
        }
      });
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".ws-word, .ws-letter"), { opacity: 1, x: 0, y: 0, yPercent: 0, rotation: 0, scale: 1 });
      gsap.set(q(".ws-mask"), { overflow: "visible" });
      gsap.set(q(".ws-dark, .ws-object"), { opacity: 1, scale: 1 });
      gsap.set(q(".ws-card"), { opacity: 1, x: 0, y: 0 });
    },
  );

  useEffect(() => {
    const frame = rootRef.current?.querySelector<HTMLElement>(".ws-frame");
    if (!frame) return;
    const handle = registerSurface(frame, "light");
    surface.current = handle;
    // The object handle attaches after this component's first paint.
    const t = window.setTimeout(() => setTick((v) => v + 1), 60);
    return () => {
      window.clearTimeout(t);
      handle.release();
      surface.current = null;
    };
  }, [rootRef, stacked]);

  /** A line-art mark in the corner of a card, alternating between two. */
  const cardGlyph = (i: number) =>
    i % 2 === 0 ? (
      <svg width="74" height="74" viewBox="0 0 74 74" fill="none" aria-hidden="true">
        {Array.from({ length: 10 }, (_, k) => (
          <line
            key={k}
            x1={6 + k * 7}
            y1={10}
            x2={6 + k * 7}
            y2={64}
            stroke={hexA("#FFFFFF", 0.42)}
            strokeWidth="1"
          />
        ))}
      </svg>
    ) : (
      <svg width="74" height="74" viewBox="0 0 74 74" fill="none" aria-hidden="true">
        {[10, 19, 28].map((r, k) => (
          <g key={k}>
            <path
              d={`M 34 ${37 - r} A ${r} ${r} 0 0 0 34 ${37 + r}`}
              stroke={hexA("#FFFFFF", 0.42)}
              strokeWidth="1"
            />
            <path
              d={`M 40 ${37 - r} A ${r} ${r} 0 0 1 40 ${37 + r}`}
              stroke={hexA("#FFFFFF", 0.42)}
              strokeWidth="1"
            />
          </g>
        ))}
      </svg>
    );

  /**
   * A service card — trionn.com's services panel: a translucent plate with a
   * hairline edge, the title set large against a line-art mark, and the copy
   * held down at the foot so the two read as separate registers rather than
   * as one paragraph.
   */
  const capability = (cap: (typeof copy.capabilities)[number], i = 0, className = "") => (
    <article
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: space.h,
        minHeight: 290,
        padding: `${space.xl}px`,
        // A plate, not a framed box: the fill is what separates the card
        // from the ground, and an outline on top of it only draws a rectangle.
        background: hexA("#FFFFFF", 0.05),
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: space.lg }}>
        <h3 style={{ margin: 0, ...typeScale.h3, color: color.textOnDark, maxWidth: "12ch" }}>
          {cap.title}
        </h3>
        <span style={{ flex: "0 0 auto", opacity: 0.9 }}>{cardGlyph(i)}</span>
      </div>
      <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted, maxWidth: "34ch" }}>
        {cap.body}
      </p>
    </article>
  );

  if (stacked) {
    return (
      <section
        id="why-stride"
        style={{ background: color.black, color: color.textOnDark, fontFamily: typeScale.bodyLg.fontFamily }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: rhythm.headerToContent,
            padding: `${layout.section} ${layout.pad}`,
          }}
        >
          <MicroLabel tone="accent">{copy.label}</MicroLabel>
          <h2 style={{ margin: 0, ...typeScale.displayLg }}>
            {copy.headline.map((w) => (
              <GradientRevealText key={w} as="span" style={{ display: "block" }}>
                {w}
              </GradientRevealText>
            ))}
          </h2>
          <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>
            {copy.transition}
          </p>
          <div style={{ position: "relative", width: "100%", height: "44vh" }}>
            <HeroObject handleRef={objectRef} breakpoint={bp} />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: layout.section }}>
            {copy.capabilities.map((cap, i) => capability(cap, i))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section
      id="why-stride"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.bone,
        fontFamily: typeScale.bodyLg.fontFamily,
      }}
    >
      <div className="ws-frame" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <div
          className="ws-dark"
          aria-hidden="true"
          style={{ position: "absolute", inset: 0, background: color.black }}
        />
        <Grain opacity={0.14} />

        {/* ---- the 3D centrepiece ---- */}
        <div
          className="ws-object"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 2,
            display: "grid",
            placeItems: "center",
            pointerEvents: "none",
          }}
        >
          <div style={{ width: "min(560px, 46vw)", height: "min(560px, 60vh)" }}>
            <HeroObject handleRef={objectRef} breakpoint={bp} />
          </div>
        </div>

        {/* ---- the stacked headline, which scatters ---- */}
        <div
          className="ws-headline"
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: `0 ${layout.pad}`,
            color: color.textOnLight,
          }}
        >
          <MicroLabel
            className="ws-label"
            tone="accent"
            style={{ marginBottom: rhythm.eyebrowToHeadline }}
          >
            {copy.label}
          </MicroLabel>
          {copy.headline.map((word) => (
            /* Each word rides in a window of its own height. The word starts
               below its window and slides up into it, so it is uncovered
               rather than faded on — a pull-up, not an appearance. */
            <div key={word} className="ws-mask" style={{ overflow: "hidden" }}>
            <div className="ws-word" style={{ ...typeScale.displayLg }}>
              {/* Each letter stays its own span because the scatter needs
                  them individually. The letters themselves simply arrive —
                  a decode on top of the scatter was two effects on one word. */}
              {word.split("").map((ch, i) => (
                <span key={i} className="ws-letter" style={{ display: "inline-block" }}>
                  {ch}
                </span>
              ))}
            </div>
            </div>
          ))}
        </div>

        {/* ---- the services, arriving in pairs either side of the object ----
             This layer sits under the object so a card travelling inward
             disappears behind it rather than over it. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 1,
            pointerEvents: "none",
          }}
        >
          {/* One queue, not two columns.
              Every card is laid out in the left-hand station and the timeline
              moves it: in from off the right edge, across to the left-hand
              station as the one ahead of it leaves, and out past the left
              edge. Two stations are on screen at a time, either side of the
              mark, and a card advances a station as the card ahead advances
              one — which is the whole read. */}
          {copy.capabilities.map((cap, i) => (
            <div
              key={cap.n}
              className="ws-card"
              data-index={i}
              style={{
                position: "absolute",
                left: layout.pad,
                top: "50%",
                width: "min(420px, 27vw)",
                minHeight: 290,
                marginTop: -145,
                opacity: 0,
              }}
            >
              {capability(cap, i, "")}
            </div>
          ))}
        </div>

        {/* The transition line, stated once the ground has turned. */}
        <div
          style={{
            position: "absolute",
            left: layout.pad,
            right: layout.pad,
            bottom: layout.section,
            textAlign: "center",
            ...typeScale.bodyLg,
            color: hexA(color.textOnDark, 0.5),
          }}
        >
          {copy.transition}
        </div>
      </div>
    </section>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(WhyStride, {
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "650vh" },
});
