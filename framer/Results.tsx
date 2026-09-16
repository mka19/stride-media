import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef, type ReactNode } from "react";
import { gsap, useGsapContext, prefersReducedMotion } from "./gsap";
import { results as copy } from "./copy";
import { color, hexA, layout, rhythm, space, typeScale } from "./theme";
import { GlowButton, MediaTile, MicroLabel } from "./primitives";
import { useBreakpoint } from "./responsive";
import { useInView } from "./useInView";
import GradientRevealText from "./GradientRevealText";

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
        fontFamily: typeScale.bodyLg.fontFamily,
        // The ticker is a full-bleed band that runs off both edges, so a
        // full section token under it read as a gap rather than as rhythm.
        // The next section brings its own top padding.
        paddingTop: layout.section,
        paddingBottom: `${space.h}px`,
        overflow: "hidden",
      }}
    >
      {/* ---- header, centred above the row ---- */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          gap: rhythm.eyebrowToHeadline,
          padding: `0 ${layout.pad}`,
          marginBottom: rhythm.headerToContent,
        }}
      >
        <MicroLabel tone="accent">{copy.label}</MicroLabel>
        <GradientRevealText as="h2" tone="dark" style={{ ...typeScale.h1, maxWidth: "18ch", textWrap: "balance" }}>
          {copy.headline}
        </GradientRevealText>
        <p
          style={{
            margin: 0,
            maxWidth: 640,
            ...typeScale.bodyLg,
            color: color.textOnDarkMuted,
          }}
        >
          {copy.body}
        </p>
        {/* The same plate as every other call to action on the site — a
            coloured text link here read as a different kind of control. */}
        <GlowButton href="#contact" style={{ marginTop: space.sm }}>
          {copy.link}
        </GlowButton>
      </div>

      {/* ---- the ticker ---- */}
      <Ticker>
        {/* The set is rendered twice so the wrap is seamless: when the first
            copy has travelled its full width, the offset resets to zero and
            the second copy is already sitting exactly where it left off. */}
        {[0, 1].map((copyIndex) =>
          copy.cards.map((card, i) => (
            <ResultCard
              key={`${copyIndex}-${card.views}-${card.handle}`}
              card={card}
              src={clips[i]}
              seed={i}
              width={cardWidth}
            />
          )),
        )}
      </Ticker>
    </section>
  );
}

/**
 * A row that drifts continuously and can be thrown by hand.
 *
 * The drift is a transform driven from the animation frame rather than the
 * element's scrollLeft, so dragging and the idle motion share one position
 * and never fight each other. Dragging sets the offset directly and hands
 * back a little velocity on release; the drift resumes from wherever the
 * throw settles. It halts under prefers-reduced-motion and while a pointer
 * is held down.
 */
function Ticker({ children }: { children: ReactNode }) {
  const viewport = useRef<HTMLDivElement | null>(null);
  const track = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = track.current;
    const view = viewport.current;
    if (!el || !view) return;

    const reduced = prefersReducedMotion();

    let offset = 0;
    let velocity = 0;
    let dragging = false;
    let lastX = 0;
    let lastT = 0;
    let raf = 0;
    let prev = performance.now();

    // One full set is half the track, since the set is rendered twice.
    const span = () => el.scrollWidth / 2 || 1;

    const frame = (now: number) => {
      raf = requestAnimationFrame(frame);
      const dt = Math.min(64, now - prev) / 1000;
      prev = now;

      if (!dragging) {
        // A throw decays into the steady drift rather than stopping dead.
        velocity *= Math.pow(0.0015, dt);
        const drift = reduced ? 0 : 34; // px per second
        offset += (drift + velocity) * dt;
      }

      const s = span();
      offset = ((offset % s) + s) % s;
      el.style.transform = `translate3d(${-offset}px, 0, 0)`;

      // Curve the row away at both edges: each card is turned and pushed
      // back in proportion to how far it sits from the middle of the
      // viewport, so the centre of the run is the largest and the ends fall
      // away into the dark rather than being cut off by a hard edge.
      const mid = view.clientWidth / 2;
      for (const card of el.children as HTMLCollectionOf<HTMLElement>) {
        const r = card.getBoundingClientRect();
        const viewBox = view.getBoundingClientRect();
        const t = Math.max(-1.2, Math.min(1.2, (r.left + r.width / 2 - viewBox.left - mid) / mid));
        const a = Math.abs(t);
        card.style.transform = `perspective(1500px) rotateY(${-t * 34}deg) translateZ(${-a * 210}px) scale(${1 - a * 0.1})`;
        card.style.opacity = String(1 - a * 0.35);
      }
    };
    raf = requestAnimationFrame(frame);

    const onDown = (e: PointerEvent) => {
      dragging = true;
      velocity = 0;
      lastX = e.clientX;
      lastT = performance.now();
      view.setPointerCapture(e.pointerId);
      view.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const now = performance.now();
      const dt = Math.max(1, now - lastT);
      offset -= dx;
      velocity = (-dx / dt) * 1000;
      lastX = e.clientX;
      lastT = now;
    };
    const onUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      view.releasePointerCapture(e.pointerId);
      view.style.cursor = "grab";
    };

    view.addEventListener("pointerdown", onDown);
    view.addEventListener("pointermove", onMove);
    view.addEventListener("pointerup", onUp);
    view.addEventListener("pointercancel", onUp);

    return () => {
      cancelAnimationFrame(raf);
      view.removeEventListener("pointerdown", onDown);
      view.removeEventListener("pointermove", onMove);
      view.removeEventListener("pointerup", onUp);
      view.removeEventListener("pointercancel", onUp);
    };
  }, []);

  return (
    <div
      ref={viewport}
      style={{
        overflow: "hidden",
        cursor: "grab",
        touchAction: "pan-y",
        perspective: 1500,
        paddingBottom: space.lg,
      }}
    >
      <div
        ref={track}
        style={{
          display: "flex",
          alignItems: "center",
          gap: layout.gutter,
          width: "max-content",
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
      >
        {children}
      </div>
    </div>
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
        display: "flex",
        flexDirection: "column",
        gap: space.s,
        userSelect: "none",
        transformStyle: "preserve-3d",
        willChange: "transform, opacity",
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
            ...typeScale.eyebrow,
            fontWeight: 500,
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
            fontWeight: 500,
            color: color.textOnDark,
            textShadow: `0 2px 18px ${hexA(color.black, 0.8)}`,
          }}
        >
          {card.views} Views
        </div>
      </div>

      <div style={{ ...typeScale.eyebrow, color: color.accent }}>{card.metric}</div>
      <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>{card.desc}</p>
      <div
        style={{
          ...typeScale.eyebrow,
          textTransform: "none",
          color: hexA(color.textOnDark, 0.4),
          marginTop: "auto",
        }}
      >
        {card.handle}
      </div>
    </article>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(Results, {
  clips: {
    type: ControlType.Array,
    title: "Clips",
    control: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"] },
    maxCount: 6,
  },
});
