import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { gsap, useGsapContext, SCRUB, approach } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { whyStride as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { Grain, MicroLabel } from "../shared/primitives";
import { useBreakpoint, useStacked } from "../shared/responsive";
import type { HeroObjectHandle } from "../Hero/HeroObject";
import GradientRevealText from "../shared/GradientRevealText";

const HeroObject = lazy(() => import("../Hero/HeroObject"));

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
export default function WhyStride({ scrollLength = "380vh" }: { scrollLength?: string }) {
  const surface = useRef<SurfaceHandle | null>(null);
  const objectRef = useRef<HeroObjectHandle | null>(null);
  const mobileRoot = useRef<HTMLElement | null>(null);
  const bp = useBreakpoint();
  // Every phone gets the readable stacked cards. Some mobile browsers report
  // hover support (stylus/emulation), which previously selected the desktop
  // pinned ticker and left all six cards parked offscreen.
  const stacked = useStacked() || bp === "mobile";
  const [, setTick] = useState(0);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      // The overlap with the section before this one. Runs on the frame,
      // which this section's own timelines only ever measure, never animate.
      approach(root, ".ws-frame");

      // Parked a full line below its window, not nudged and faded.
      gsap.set(q(".ws-word"), { yPercent: 0 });
      gsap.set(q(".ws-mask"), { overflow: "hidden" });
      gsap.set(q(".ws-dark"), { opacity: 0 });
      // The mark is revealed as a physical object entering the scene: small
      // at first, then smoothly growing into its final centred position.
      gsap.set(q(".ws-object"), { opacity: 0, scale: 0.92, transformOrigin: "50% 50%" });
      gsap.set(q(".ws-headline"), { opacity: 1, color: color.textOnLight });
      gsap.set(q(".ws-card"), { opacity: 0 });
      gsap.set(q(".ws-transition"), { opacity: 0 });
      // The object never dissolves here: it is the fixed centrepiece.
      objectRef.current?.setProgress(0);
      objectRef.current?.setVariant(0);

      // Give the opening mark and the text-scatter their own readable beats
      // before the capability ticker begins.
      const variantFirst = 0.36;
      const variantStep = (1 - variantFirst) / (copy.capabilities.length + 1.45);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: SCRUB,
          onUpdate: (self) => {
            surface.current?.setTone(self.progress < 0.2 ? "light" : "dark");
            const index = self.progress < variantFirst + variantStep * 2.05
              ? 0
              : 1 + Math.min(copy.capabilities.length - 1, Math.floor((self.progress - variantFirst - variantStep * 2.05) / variantStep));
            objectRef.current?.setVariant(index);
          },
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
      tl.to(q(".ws-dark"), { opacity: 1, duration: 0.07 }, 0.06)
        .to(q(".ws-headline"), { color: color.textOnDark, duration: 0.07 }, 0.06)

        /* The window that uncovers each word would also clip it on the way
           out — the letters travel well past the block they belong to. It is
           opened once the last word has landed and before the scatter begins,
           and closes again on the way back up. */
        .set(q(".ws-mask"), { overflow: "visible" }, 0.17);

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
      const at = 0.18;

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
      tl.to(q(".ws-object"), { opacity: 1, scale: 1, duration: 0.045, ease: "power1.out" }, 0.32)
        .to(q(".ws-transition"), { opacity: 1, duration: 0.04 }, 0.34);

      // The label has done its job by the time the type has gone; leaving it
      // sat on top of the mark.
      tl.to(
        q(".ws-label"),
        { opacity: 0, y: -14, scale: 0.92, filter: "blur(7px)", duration: 0.1, ease: "power2.in" },
        0.3,
      );

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
      const first = variantFirst;
      // Each card spends one step arriving, one crossing, one leaving, and the
      // steps overlap by exactly one — so the whole run is n + 2 steps long
      // with a little tail.
      const STEP = variantStep;

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
      gsap.set(q(".ws-transition"), { opacity: 1 });
      objectRef.current?.setVariant(0);
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

  useEffect(() => {
    if (!stacked || !mobileRoot.current) return;
    const cards = [...mobileRoot.current.querySelectorAll<HTMLElement>(".ws-mobile-card")];
    const observer = new IntersectionObserver(
      (entries) => {
        const active = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top - window.innerHeight * .58) - Math.abs(b.boundingClientRect.top - window.innerHeight * .58))[0];
        if (!active) return;
        objectRef.current?.setVariant(Number((active.target as HTMLElement).dataset.index ?? 0) + 1);
      },
      { rootMargin: "-38% 0px -38% 0px", threshold: 0 },
    );
    cards.forEach((card) => observer.observe(card));
    objectRef.current?.setVariant(1);
    return () => observer.disconnect();
  }, [stacked]);

  /** One readable line icon for each capability. */
  const cardGlyph = (i: number) => {
    const size = stacked ? 56 : 74;
    const paths = [
      <><rect x="10" y="16" width="54" height="42" rx="5"/><path d="m31 27 18 10-18 10Z"/><path d="M18 10v12M56 10v12M18 52v12M56 52v12"/></>,
      <><circle cx="37" cy="37" r="25"/><circle cx="37" cy="37" r="14"/><circle cx="37" cy="37" r="4"/><path d="M55 19 43 31"/></>,
      <><path d="M37 9 46 28 65 37 46 46 37 65 28 46 9 37 28 28Z"/><circle cx="37" cy="37" r="5"/></>,
      <><path d="M12 18h50v38H12Z"/><path d="m31 27 17 10-17 10Z"/><path d="M17 62h40"/></>,
      <><circle cx="37" cy="28" r="11"/><path d="M18 62c2-14 9-22 19-22s17 8 19 22"/><path d="M9 28h10M55 28h10"/></>,
      <><rect x="12" y="15" width="50" height="47" rx="6"/><path d="M12 28h50M23 9v12M51 9v12M26 45l8 8 16-18"/></>,
    ];
    return <svg width={size} height={size} viewBox="0 0 74 74" fill="none" stroke={hexA("#FFFFFF", .58)} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{paths[i] ?? paths[0]}</svg>;
  };


  /**
   * A service card — trionn.com's services panel: a translucent plate with a
   * hairline edge, the title set large against a line-art mark, and the copy
   * held down at the foot so the two read as separate registers rather than
   * as one paragraph.
   */
  const capability = (cap: (typeof copy.capabilities)[number], i = 0, className = "") => (
    <article
      key={cap.n}
      className={className}
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: space.h,
        minHeight: stacked ? 198 : 290,
        padding: `${stacked ? 20 : space.xl}px`,
        opacity: 1,
        visibility: "visible",
        color: color.textOnDark,
        // A plate, not a framed box: the fill is what separates the card
        // from the ground, and an outline on top of it only draws a rectangle.
        background: stacked ? "#202024" : hexA("#FFFFFF", 0.05),
        border: stacked ? `1px solid ${hexA("#FFFFFF", 0.14)}` : "none",
        borderRadius: stacked ? 16 : 0,
        backdropFilter: stacked ? "none" : "blur(6px)",
        WebkitBackdropFilter: stacked ? "none" : "blur(6px)",
      }}
    >
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: space.lg }}>
        <h3 style={{ margin: 0, ...typeScale.h3, color: "#FFFFFF", maxWidth: "12ch" }}>
          {cap.title}
        </h3>
        <span style={{ flex: "0 0 auto", opacity: 0.9 }}>{cardGlyph(i)}</span>
      </div>
      <p style={{ margin: 0, ...typeScale.bodyLg, color: stacked ? hexA("#FFFFFF", .78) : color.textOnDarkMuted, maxWidth: "34ch" }}>
        {cap.body}
      </p>
    </article>
  );

  if (stacked) {
    return (
      <section
        id="why-stride"
        ref={mobileRoot}
        style={{ background: color.black, color: color.textOnDark, fontFamily: typeScale.bodyLg.fontFamily }}
      >
        <div
          className="ws-transition"
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            padding: `104px ${layout.pad} 128px`,
          }}
        >
          <MicroLabel tone="accent">{copy.label}</MicroLabel>
          <h2 style={{ margin: `${rhythm.eyebrowToHeadline}px 0 0`, ...typeScale.h1, fontSize: "clamp(36px, 10vw, 48px)", lineHeight: .96, letterSpacing: "-.04em" }}>
            {copy.headline.map((w) => (
              <GradientRevealText key={w} as="span" style={{ display: "block" }}>
                {w}
              </GradientRevealText>
            ))}
          </h2>
          <p style={{ margin: `${rhythm.headlineToBody}px 0 0`, maxWidth: "34ch", ...typeScale.bodyLg, lineHeight: 1.5, color: color.textOnDarkMuted }}>
            {copy.transition}
          </p>
          <div style={{ position: "sticky", top: layout.navHeight + 12, zIndex: 8, width: "min(100%, 420px)", margin: "30px auto 0", height: 200, overflow: "hidden", borderRadius: 20, border: `1px solid ${hexA("#fff", .14)}`, background: "#08080a", boxShadow: "0 24px 70px rgba(0,0,0,.42)" }}>
            <div style={{ position: "absolute", inset: "2%", filter: "brightness(1.45) contrast(1.06)", transform: "translateZ(0)" }}><Suspense fallback={null}><HeroObject handleRef={objectRef} breakpoint={bp} /></Suspense></div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative", zIndex: 9, marginTop: 18, width: "100%", textAlign: "left", paddingBottom: 32 }}>
            {copy.capabilities.map((cap, i) => (
              <div
                key={cap.n}
                className="ws-mobile-card"
                data-index={i}
                style={{
                  position: "sticky",
                  top: layout.navHeight + 226,
                  zIndex: 10 + i,
                  marginTop: i === 0 ? 0 : 30,
                  marginBottom: i < copy.capabilities.length - 1 ? "32vh" : 0,
                  opacity: 1,
                  visibility: "visible",
                  transform: "none",
                  boxShadow: "0 -12px 34px rgba(0,0,0,.48)",
                }}
              >
                {capability(cap, i)}
              </div>
            ))}
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
            filter: "brightness(1.35)",
          }}
        >
          <div style={{ width: "min(560px, 46vw)", height: "min(560px, 60vh)" }}>
            <Suspense fallback={null}><HeroObject handleRef={objectRef} breakpoint={bp} /></Suspense>
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
            color: color.textOnDark,
            zIndex: 4,
            pointerEvents: "none",
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
