import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef, useState } from "react";
import { gsap, useGsapContext } from "./gsap";
import { registerSurface, type SurfaceHandle } from "./surface";
import { whyStride as copy } from "./copy";
import { color, hexA, layout, rhythm, space, typeScale } from "./theme";
import { Grain, MicroLabel } from "./primitives";
import { useBreakpoint, useStacked } from "./responsive";
import HeroObject, { type HeroObjectHandle } from "./HeroObject";

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
export default function WhyStride({ scrollLength = "560vh" }: { scrollLength?: string }) {
  const surface = useRef<SurfaceHandle | null>(null);
  const objectRef = useRef<HeroObjectHandle | null>(null);
  const bp = useBreakpoint();
  const stacked = useStacked();
  const [, setTick] = useState(0);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      gsap.set(q(".ws-word"), { opacity: 0, y: 30 });
      gsap.set(q(".ws-dark"), { opacity: 0 });
      gsap.set(q(".ws-object"), { opacity: 0, scale: 0.8 });
      gsap.set(q(".ws-card"), { opacity: 0 });
      // The object never dissolves here: it is the fixed centrepiece.
      objectRef.current?.setProgress(0);

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top top",
          end: "bottom bottom",
          scrub: 0.6,
          onUpdate: (self) => surface.current?.setTone(self.progress < 0.17 ? "light" : "dark"),
        },
      });

      // 1. the stacked headline
      tl.to(q(".ws-word"), { opacity: 1, y: 0, duration: 0.05, stagger: 0.02 }, 0.02)

        // 2. ground and type invert together, one move
        .to(q(".ws-dark"), { opacity: 1, duration: 0.05 }, 0.17)
        .to(q(".ws-headline"), { color: color.textOnDark, duration: 0.05 }, 0.17);

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
      const field = root.getBoundingClientRect();
      const cx = field.left + field.width / 2;
      const cy = field.top + field.height / 2;
      // Far enough that the letters clear the frame rather than
      // gathering in a loose cloud around the middle of it.
      const reach = window.innerWidth * 0.82;
      const lift = window.innerHeight * 0.78;

      letters.forEach((letter, i) => {
        const box = letter.getBoundingClientRect();
        const dx = box.left + box.width / 2 - cx;
        const dy = box.top + box.height / 2 - cy;
        const len = Math.hypot(dx, dy) || 1;
        // A floor on the radius so a letter sitting near the centre still
        // gets thrown somewhere rather than barely moving.
        const push = 0.72 + 0.4 * Math.min(1, len / (field.width * 0.34));

        tl.to(
          letter,
          {
            x: (dx / len) * reach * push,
            y: (dy / len) * lift * push,
            rotation: (dx < 0 ? -1 : 1) * (48 + (i % 5) * 26),
            scale: 1.25,
            opacity: 0,
            // Long and decelerating: the old move was a tenth of the section
            // on power2.in, which snapped them off the screen.
            duration: 0.22,
            ease: "power2.out",
          },
          0.24 + (i % 4) * 0.012,
        );
      });

      // 4. the object arrives and stays
      tl.to(q(".ws-object"), { opacity: 1, scale: 1, duration: 0.08, ease: "power2.out" }, 0.44);

      // 5. The services arrive in pairs, one card either side of the object.
      //    Each pair slides in from its own edge, holds while it is read,
      //    then carries on inward and goes behind the object — the layer
      //    they sit on is under it, so the card is occluded rather than
      //    fading over the top of it. The last pair holds to the end of the
      //    section, so nothing is mid-move when the next one starts.
      const cards = q(".ws-card") as HTMLElement[];
      const pairs = Math.max(1, ...cards.map((c) => Number(c.dataset.pair ?? 0) + 1));
      const first = 0.52;
      const each = (1 - first) / pairs;

      cards.forEach((card) => {
        const pair = Number(card.dataset.pair ?? 0);
        const fromLeft = card.dataset.side === "left";
        const at = first + pair * each;
        const away = fromLeft ? 1 : -1;

        tl.fromTo(
          card,
          { opacity: 0, x: -away * 90, y: 18 },
          { opacity: 1, x: 0, y: 0, duration: each * 0.34, ease: "power3.out" },
          at,
        );
        if (pair < pairs - 1) {
          tl.to(
            card,
            { opacity: 0, x: away * 190, duration: each * 0.3, ease: "power2.in" },
            at + each * 0.66,
          );
        }
      });
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".ws-word, .ws-letter"), { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 });
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
        background: hexA("#FFFFFF", 0.035),
        border: `1px solid ${hexA("#FFFFFF", 0.1)}`,
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
              <span key={w} style={{ display: "block" }}>
                {w}
              </span>
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
          <MicroLabel tone="accent" style={{ marginBottom: rhythm.eyebrowToHeadline }}>
            {copy.label}
          </MicroLabel>
          {copy.headline.map((word) => (
            <div key={word} className="ws-word" style={{ ...typeScale.displayLg }}>
              {/* Each letter stays its own span because the scatter needs
                  them individually. The letters themselves simply arrive —
                  a decode on top of the scatter was two effects on one word. */}
              {word.split("").map((ch, i) => (
                <span key={i} className="ws-letter" style={{ display: "inline-block" }}>
                  {ch}
                </span>
              ))}
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
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: `0 ${layout.pad}`,
            pointerEvents: "none",
          }}
        >
          {(["left", "right"] as const).map((side) => (
            <div
              key={side}
              style={{ position: "relative", width: "min(420px, 27vw)", minHeight: 290 }}
            >
              {copy.capabilities
                .filter((_, i) => (side === "left" ? i % 2 === 0 : i % 2 === 1))
                .map((cap, pair) => (
                  <div
                    key={cap.n}
                    className="ws-card"
                    data-side={side}
                    data-pair={pair}
                    style={{
                      position: "absolute",
                      inset: 0,
                      // Only the first pair rests visible, for a render with
                      // no timeline behind it.
                      opacity: pair === 0 ? 1 : 0,
                    }}
                  >
                    {capability(cap, pair, "")}
                  </div>
                ))}
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
  scrollLength: { type: ControlType.String, title: "Scroll length", defaultValue: "560vh" },
});
