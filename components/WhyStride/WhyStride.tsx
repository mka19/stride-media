import { useEffect, useRef, useState } from "react";
import { gsap, useGsapContext } from "../shared/gsap";
import { registerSurface, type SurfaceHandle } from "../shared/surface";
import { whyStride as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { Grain, MicroLabel } from "../shared/primitives";
import { useBreakpoint, useStacked } from "../shared/responsive";
import HeroObject, { type HeroObjectHandle } from "../Hero/HeroObject";

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
      gsap.set(q(".ws-cap"), { opacity: 0, x: 15 });
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
      const reach = Math.min(window.innerWidth * 0.52, 980);
      const lift = Math.min(window.innerHeight * 0.46, 520);

      letters.forEach((letter, i) => {
        const box = letter.getBoundingClientRect();
        const dx = box.left + box.width / 2 - cx;
        const dy = box.top + box.height / 2 - cy;
        const len = Math.hypot(dx, dy) || 1;
        // A floor on the radius so a letter sitting near the centre still
        // gets thrown somewhere rather than barely moving.
        const push = 0.45 + 0.55 * Math.min(1, len / (field.width * 0.42));

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

      // 5. the capability labels, crossfading with a slight overlap so there
      //    is never a blank gap between them
      const caps = q(".ws-cap");
      const first = 0.46;
      const each = (0.96 - first) / caps.length;
      caps.forEach((cap, i) => {
        const at = first + i * each;
        tl.to(cap, { opacity: 1, x: 0, duration: each * 0.3, ease: "power2.out" }, at);
        if (i < caps.length - 1) {
          tl.to(cap, { opacity: 0, x: -15, duration: each * 0.3, ease: "power2.in" }, at + each * 0.7);
        }
      });
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".ws-word, .ws-letter"), { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 });
      gsap.set(q(".ws-dark, .ws-object"), { opacity: 1, scale: 1 });
      gsap.set(q(".ws-cap"), { opacity: 1, x: 0 });
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

  const capability = (cap: (typeof copy.capabilities)[number], className = "") => (
    <div
      key={cap.n}
      className={className}
      style={{ display: "flex", flexDirection: "column", gap: space.s, maxWidth: "34ch" }}
    >
      <MicroLabel tone="accent">{cap.n}</MicroLabel>
      <h3 style={{ margin: 0, ...typeScale.h3, color: color.textOnDark }}>{cap.title}</h3>
      <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>{cap.body}</p>
    </div>
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
          <h2 style={{ margin: 0, ...typeScale.displayLg, lineHeight: 0.9 }}>
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
            {copy.capabilities.map((cap) => capability(cap))}
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
            <div key={word} className="ws-word" style={{ ...typeScale.displayLg, lineHeight: 0.88 }}>
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

        {/* ---- capability labels, fixed right beside the object ---- */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: `0 ${layout.pad}`,
            pointerEvents: "none",
          }}
        >
          <div style={{ position: "relative", width: "min(420px, 34vw)", minHeight: 220 }}>
            {copy.capabilities.map((cap, i) => (
              <div
                key={cap.n}
                className="ws-cap"
                // Stacked in one box: only the first rests visible.
                style={{ position: "absolute", inset: 0, opacity: i === 0 ? 1 : 0 }}
              >
                {capability(cap)}
              </div>
            ))}
          </div>
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
