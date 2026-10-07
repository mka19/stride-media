import { useEffect, useRef, useState, type ReactNode } from "react";
import { gsap, useGsapContext, prefersReducedMotion } from "../shared/gsap";
import { results as copy } from "../shared/copy";
import { color, ease, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { GlowButton, MediaTile, MicroLabel } from "../shared/primitives";
import { useBreakpoint, useCanHover, useStacked } from "../shared/responsive";
import { useInView } from "../shared/useInView";
import GradientRevealText from "../shared/GradientRevealText";

/**
 * Results / Proof — clipcut.framer.ai reference.
 *
 * A horizontally scrollable row of portrait video cards. No scroll-driven
 * transform here: the row slides in once, staggered from the right, and the
 * ongoing interaction is the row's own horizontal scroll with snap. Each
 * card's reel plays only while that card is on screen.
 */
/**
 * How far a centre card grows past the row it sits in.
 *
 * The carousel scales the middle of the strip up, so the tallest projected
 * card runs about 58px beyond the flat ones at each end. This is that, with
 * room to spare.
 */
const CLIP_HEADROOM = 70;

export default function Results({ clips = [] }: { clips?: string[] }) {
  const bp = useBreakpoint();
  const stacked = useStacked();
  const cardWidth = bp === "mobile" ? "85vw" : bp === "tablet" ? 240 : 280;
  const mobileTrack = useRef<HTMLDivElement | null>(null);
  const [mobileIndex, setMobileIndex] = useState(0);
  const [mobilePaused, setMobilePaused] = useState(false);
  const [activeVideo, setActiveVideo] = useState<string | null>(null);

  const goToMobile = (index: number) => {
    const el = mobileTrack.current;
    const card = el?.children[index] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
  };

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      if (stacked) {
        gsap.set(q(".rs-card"), { opacity: 1, x: 0, clearProps: "transform" });
        return;
      }
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
    [stacked],
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
        <GlowButton href="/videos" style={{ marginTop: space.sm }}>
          {copy.link}
        </GlowButton>
      </div>

      {/* ---- the ticker ---- */}
      {stacked ? (
        <div>
          <div
            ref={mobileTrack}
            aria-label="Client results — swipe horizontally"
            onPointerDown={() => setMobilePaused(true)}
            onPointerUp={() => setMobilePaused(false)}
            onPointerCancel={() => setMobilePaused(false)}
            onTouchEnd={() => setMobilePaused(false)}
            onScroll={(event) => {
              const el = event.currentTarget;
              const card = el.firstElementChild as HTMLElement | null;
              if (!card) return;
              const step = card.offsetWidth + 14;
              setMobileIndex(Math.max(0, Math.min(copy.cards.length - 1, Math.round(el.scrollLeft / step))));
            }}
            style={{
              display: "flex",
              gap: 14,
              overflowX: "auto",
              scrollSnapType: "x mandatory",
              scrollBehavior: "smooth",
              overscrollBehaviorInline: "contain",
              WebkitOverflowScrolling: "touch",
              padding: `10px ${layout.pad}px ${space.lg}px`,
              scrollbarWidth: "none",
              cursor: "grab",
              touchAction: "pan-x pan-y",
            }}
          >
            {copy.cards.map((card, i) => (
              <div key={`${card.views}-${i}`} style={{ flex: "0 0 82vw", scrollSnapAlign: "center" }}>
                <ResultCard card={card} src={clips[i]} seed={i} width="100%" instanceKey={`mobile-${i}`} activeVideo={activeVideo} setActiveVideo={setActiveVideo} />
              </div>
            ))}
          </div>
          <div aria-label={`Result ${mobileIndex + 1} of ${copy.cards.length}`} style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, paddingTop: 6 }}>
            {copy.cards.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show result ${i + 1}`}
                aria-current={mobileIndex === i ? "true" : undefined}
                onClick={() => goToMobile(i)}
                style={{ width: 44, height: 44, padding: 0, border: 0, display: "grid", placeItems: "center", background: "transparent", cursor: "pointer" }}
              >
                <span aria-hidden="true" style={{ position: "relative", display: "block", width: mobileIndex === i ? 32 : 7, height: 7, overflow: "hidden", borderRadius: 999, background: hexA(color.textOnDark, .26), transition: `width 400ms ${ease.out}` }}>
                  {mobileIndex === i && (
                    <span className="testimonial-progress-fill" onAnimationEnd={() => { if (!mobilePaused) goToMobile((mobileIndex + 1) % copy.cards.length); }} style={{ position: "absolute", inset: 0, borderRadius: "inherit", background: color.accent, animationPlayState: mobilePaused ? "paused" : "running" }} />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      ) : (
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
              instanceKey={`ticker-${copyIndex}-${i}`}
              activeVideo={activeVideo}
              setActiveVideo={setActiveVideo}
            />
          )),
        )}
      </Ticker>
      )}
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
        /*
         * The strip has to be clipped horizontally — that is what makes the
         * cards run off the sides — but the clip applies to both axes, and the
         * cards in the middle are scaled up by the perspective, which makes
         * them taller than the row they sit in. A 397px viewport was cutting
         * the bottom off a 513px card: the sector, the sentence and the handle
         * under the figure were all sliced through mid-word.
         *
         * The padding is the headroom the scaled cards need. It is symmetric
         * because they grow about their own centre.
         */
        overflow: "hidden",
        cursor: "grab",
        touchAction: "pan-y",
        perspective: 1500,
        /*
         * The padding here is headroom for the clip, not spacing, and the
         * matching negative margin is what keeps it from becoming spacing.
         *
         * Padding alone moves the clip edge and the content together, so the
         * card met the boundary in exactly the same place. Putting the
         * negative margin on the track instead shrank the content box by as
         * much as the padding added, which came to the same thing. It has to
         * be on this element: the padding grows the clip box, the margin pulls
         * this whole box back out of the flow by the same amount, and the
         * section around it never moves.
         */
        paddingBlock: CLIP_HEADROOM,
        paddingBottom: CLIP_HEADROOM + space.lg,
        marginBlock: -CLIP_HEADROOM,
      }}
    >
      <div
        ref={track}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "clamp(12px, 1.4vw, 22px)",
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
  instanceKey,
  activeVideo,
  setActiveVideo,
}: {
  card: (typeof copy.cards)[number];
  src?: string;
  seed: number;
  width: number | string;
  instanceKey: string;
  activeVideo: string | null;
  setActiveVideo: (key: string | null) => void;
}) {
  const canHover = useCanHover();
  const playing = activeVideo === instanceKey;
  const [hovered, setHovered] = useState(false);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const { ref, inView } = useInView<HTMLDivElement>({ threshold: 0.4 }, false);
  const videoSrc = src?.replace(/\.jpg(?:\?.*)?$/i, ".mp4");

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing && inView) {
      void video.play().catch(() => setActiveVideo(null));
    } else {
      video.pause();
    }
  }, [inView, playing, setActiveVideo]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    setActiveVideo(playing ? null : instanceKey);
  };

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
        color: "inherit",
        textDecoration: "none",
      }}
    >
      <div ref={ref} style={{ position: "relative", width: "100%", height: 420, maxHeight: "56vh", overflow: "hidden", borderRadius: 4 }}>
        {videoSrc && <video ref={videoRef} src={videoSrc} poster={src} playsInline preload="metadata" onEnded={() => setActiveVideo(null)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: color.black }} />}
        {!videoSrc && <MediaTile src={src} seed={seed + 21} radius={4} style={{ position: "absolute", inset: 0 }} />}

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
          className="premium-rise-number"
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
        {videoSrc && (
          <button type="button" onClick={togglePlayback} onPointerEnter={() => setHovered(true)} onPointerLeave={() => setHovered(false)} onPointerMove={(event) => { const rect = event.currentTarget.getBoundingClientRect(); setCursorPos({ x: event.clientX - rect.left, y: event.clientY - rect.top }); }} aria-label={`${playing ? "Pause" : "Play"} ${card.handle} video`} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", border: 0, padding: 0, background: "transparent", color: "#fff", cursor: canHover ? "none" : "pointer" }}>
            <span style={{ position: "absolute", left: canHover ? cursorPos.x : "50%", top: canHover ? cursorPos.y : "50%", transform: "translate(-50%, -50%)", width: 78, height: 78, borderRadius: "50%", border: `1px solid ${hexA("#fff", .42)}`, background: hexA(color.black, .72), display: canHover && !hovered ? "none" : "grid", placeItems: "center", backdropFilter: "blur(10px)", fontSize: 10, lineHeight: 1.1, fontWeight: 600, textTransform: "uppercase", pointerEvents: "none" }}>{playing ? "Pause video" : "Play video"}</span>
          </button>
        )}
      </div>

      <div className="premium-rise-copy" style={{ ...typeScale.eyebrow, color: color.accent }}>{card.metric}</div>
      <p style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>{card.desc}</p>
      <div
        style={{
          ...typeScale.eyebrow,
          textTransform: "none",
          color: hexA(color.textOnDark, 0.4),
          marginTop: "auto",
        }}
      >
        <a className="result-instagram-link" href={card.link} target="_blank" rel="noreferrer" style={{ color: "inherit", textUnderlineOffset: 4 }} aria-label={`Open ${card.handle} reel on Instagram`}>{card.handle} · Instagram <span aria-hidden="true">↗</span></a>
      </div>
    </article>
  );
}
