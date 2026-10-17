import { useRef, useState } from "react";
import { testimonials as copy } from "../shared/copy";
import { color, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { MediaTile, MicroLabel } from "../shared/primitives";
import GradientRevealText from "../shared/GradientRevealText";
import { useStacked } from "../shared/responsive";
import { useInView } from "../shared/useInView";

/**
 * Synthesia-inspired video testimonial carousel.
 *
 * Every card begins as a cinematic thumbnail with a key quote and client
 * identity. Real video URLs play inline; until those arrive, MediaTile keeps
 * the final composition visible without inventing client footage.
 */
export default function Testimonials({ videos = [], posters = [] }: { videos?: string[]; posters?: string[] }) {
  const stacked = useStacked();
  const { ref } = useInView<HTMLElement>({ threshold: 0.18 }, false);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const [paused, setPaused] = useState(false);
  // Only render supplied client footage. This prevents placeholder stories
  // from appearing as real testimonials while additional interviews arrive.
  const items = copy.cards.slice(0, videos.length);

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(items.length - 1, index));
    const card = track.current?.children[next] as HTMLElement | undefined;
    const rail = track.current;
    if (rail && card) {
      // Horizontal-only movement. scrollIntoView also moved the document on
      // the block axis, so the timed carousel could pull visitors down to the
      // testimonial section while they were reading somewhere else.
      const left = card.offsetLeft - (rail.clientWidth - card.offsetWidth) / 2;
      rail.scrollTo({ left: Math.max(0, left), behavior: "smooth" });
    }
    setActive(next);
    setPlaying(null);
  };

  return (
    <section
      id="testimonials"
      ref={ref}
      style={{
        background: color.black,
        color: color.textOnDark,
        fontFamily: typeScale.bodyLg.fontFamily,
        padding: `${layout.section} 0`,
        overflow: "hidden",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: rhythm.headerToContent }}>
        <header
          style={{
            paddingInline: layout.pad,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: space.lg,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: rhythm.eyebrowToHeadline, maxWidth: 850 }}>
            <MicroLabel tone="accent">Client stories</MicroLabel>
            <GradientRevealText as="h2" style={{ ...typeScale.h1, maxWidth: "22ch", textWrap: "balance" }}>
              Real people. Real results. In their own words.
            </GradientRevealText>
          </div>
          {!stacked && items.length > 1 && (
            <div style={{ display: "flex", gap: space.s }}>
              <Arrow label="Previous testimonial" direction={-1} onClick={() => goTo(active - 1)} disabled={active === 0} />
              <Arrow label="Next testimonial" direction={1} onClick={() => goTo(active + 1)} disabled={active === items.length - 1} />
            </div>
          )}
        </header>

        <div
          ref={track}
          onPointerEnter={() => setPaused(true)}
          onPointerLeave={() => setPaused(false)}
          onPointerDown={() => setPaused(true)}
          onPointerUp={() => setPaused(false)}
          onPointerCancel={() => setPaused(false)}
          onTouchStart={() => setPaused(true)}
          onTouchEnd={() => setPaused(false)}
          onScroll={(event) => {
            const el = event.currentTarget;
            const first = el.firstElementChild as HTMLElement | null;
            const step = (first?.offsetWidth ?? 1) + (stacked ? 16 : 24);
            const next = Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / step)));
            setActive(next);
          }}
          style={{
            display: items.length === 1 ? "flex" : "grid",
            gridAutoFlow: "column",
            gridAutoColumns: stacked ? "74vw" : "clamp(290px, 27vw, 390px)",
            gap: stacked ? 16 : 24,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            overscrollBehaviorInline: "contain",
            scrollbarWidth: "none",
            WebkitOverflowScrolling: "touch",
            touchAction: "auto",
            cursor: items.length > 1 ? "grab" : "default",
            paddingInline: stacked ? "13vw" : layout.pad,
            paddingBottom: space.md,
            justifyContent: items.length === 1 ? "center" : undefined,
          }}
        >
          {items.map((item, index) => {
            const src = videos[index];
            const isPlaying = playing === index && Boolean(src);
            return (
              <article
                key={`${item.name}-${index}`}
                style={{
                  position: "relative",
                  width: stacked ? "74vw" : "clamp(290px, 27vw, 390px)",
                  flex: "0 0 auto",
                  aspectRatio: stacked ? "9 / 15" : "9 / 11.2",
                  overflow: "hidden",
                  borderRadius: stacked ? 10 : 12,
                  background: "#111",
                  scrollSnapAlign: "center",
                  border: 0,
                  boxShadow: "none",
                  transform: active === index ? "scale(1)" : "scale(.965)",
                  opacity: active === index ? 1 : .7,
                  transition: "transform 600ms cubic-bezier(.16,1,.3,1), opacity 450ms ease, box-shadow 600ms ease",
                }}
              >
                {isPlaying ? (
                  <video
                    src={src}
                    controls
                    autoPlay
                    playsInline
                    preload="metadata"
                    onEnded={() => setPlaying(null)}
                    style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", background: color.black }}
                  />
                ) : (
                  <>
                    <MediaTile
                      src={posters[index]}
                      seed={41 + index * 9}
                      play={false}
                      style={{ position: "absolute", inset: 0, transform: "scale(1.02)" }}
                    />
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${hexA(color.black, .08)} 10%, ${hexA(color.black, .9)} 100%)` }} />
                    <div style={{ position: "absolute", top: space.lg, left: space.lg, right: space.lg, display: "flex", justifyContent: "space-between", alignItems: "center", gap: space.md }}>
                      <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted }}>Client story · {String(index + 1).padStart(2, "0")}</span>
                      <span style={{ ...typeScale.eyebrow, letterSpacing: ".12em", color: color.accentOnDark }}>STRIDE MEDIA</span>
                    </div>
                    <div style={{ position: "absolute", left: space.lg, right: space.lg, bottom: space.lg, display: "flex", flexDirection: "column", gap: stacked ? space.md : space.lg }}>
                      <p style={{ margin: 0, maxWidth: "27ch", fontFamily: typeScale.h3.fontFamily, fontSize: stacked ? "clamp(17px, 4.7vw, 21px)" : "clamp(24px, 2.1vw, 34px)", lineHeight: stacked ? 1.28 : 1.08, letterSpacing: stacked ? "-.02em" : "-.035em", fontWeight: 500, textWrap: "balance", textShadow: "0 2px 18px rgba(0,0,0,.72)" }}>
                        “{item.quote.replace("Stride Media.", "")}
                        <span style={{ color: color.accentOnDark }}>Stride Media.</span>”
                      </p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: space.lg, paddingTop: space.md, borderTop: `1px solid ${hexA("#fff", .16)}` }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: space.xs }}>
                          <span style={{ ...typeScale.bodyLg, fontWeight: 600, color: color.textOnDark }}>{item.name}</span>
                          <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted }}>{item.handle}</span>
                        </div>
                        <span style={{ ...typeScale.eyebrow, maxWidth: "14ch", textAlign: "right", lineHeight: 1.35, color: color.accentOnDark }}>{item.stat}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      aria-label={src ? `Play testimonial from ${item.name}` : "Video coming soon"}
                      disabled={!src}
                      onClick={() => setPlaying(index)}
                      style={{
                        position: "absolute",
                        inset: 0,
                        margin: "auto",
                        width: stacked ? 58 : 68,
                        height: stacked ? 58 : 68,
                        borderRadius: "50%",
                        border: `1px solid ${hexA("#fff", .3)}`,
                        background: hexA(color.black, .56),
                        color: "#fff",
                        display: "grid",
                        placeItems: "center",
                        cursor: src ? "pointer" : "default",
                        backdropFilter: "blur(12px)",
                      }}
                    >
                      <span aria-hidden="true" style={{ marginLeft: 4, width: 0, height: 0, borderTop: "9px solid transparent", borderBottom: "9px solid transparent", borderLeft: "14px solid currentColor" }} />
                    </button>
                  </>
                )}
              </article>
            );
          })}
        </div>

        <div style={{ paddingInline: layout.pad, display: "flex", alignItems: "center", justifyContent: "space-between", gap: space.md }}>
          <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted }}>{stacked ? "Swipe to watch" : "Drag to explore"}</span>
          <div style={{ display: "flex", gap: 7 }}>
            {items.map((item, index) => (
              <button
                key={item.name}
                type="button"
                aria-label={`Show testimonial ${index + 1}`}
                aria-current={active === index}
                onClick={() => goTo(index)}
                style={{ width: 44, height: 44, padding: 0, border: 0, background: "transparent", display: "grid", placeItems: "center", cursor: "pointer" }}
              >
                <span
                  aria-hidden="true"
                  style={{
                    position: "relative",
                    display: "block",
                    width: active === index ? 34 : 8,
                    height: 8,
                    overflow: "hidden",
                    borderRadius: 99,
                    background: hexA("#fff", .22),
                    transition: "width 360ms cubic-bezier(.16,1,.3,1)",
                  }}
                >
                  {active === index && (
                    <span
                      className="testimonial-progress-fill"
                      onAnimationEnd={() => {
                        if (!paused && playing === null) goTo((active + 1) % items.length);
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        borderRadius: "inherit",
                        background: color.accent,
                        animationPlayState: paused || playing !== null ? "paused" : "running",
                      }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Arrow({ label, direction, onClick, disabled }: { label: string; direction: -1 | 1; onClick: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      aria-label={label}
      disabled={disabled}
      onClick={onClick}
      style={{
        width: 48,
        height: 48,
        borderRadius: "50%",
        border: `1px solid ${hexA("#fff", .2)}`,
        background: disabled ? hexA("#fff", .03) : hexA("#fff", .08),
        color: color.textOnDark,
        cursor: disabled ? "default" : "pointer",
        opacity: disabled ? .35 : 1,
      }}
    >
      {direction < 0 ? "←" : "→"}
    </button>
  );
}
