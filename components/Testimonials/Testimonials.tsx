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
export default function Testimonials({ videos = [] }: { videos?: string[] }) {
  const stacked = useStacked();
  const { ref } = useInView<HTMLElement>({ threshold: 0.18 }, false);
  const track = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState<number | null>(null);
  const items = copy.cards.slice(0, 6);

  const goTo = (index: number) => {
    const next = Math.max(0, Math.min(items.length - 1, index));
    const card = track.current?.children[next] as HTMLElement | undefined;
    card?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
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
            flexDirection: stacked ? "column" : "row",
            alignItems: stacked ? "flex-start" : "flex-end",
            justifyContent: "space-between",
            gap: space.lg,
          }}
        >
          <div style={{ display: "flex", flexDirection: "column", gap: rhythm.eyebrowToHeadline, maxWidth: 850 }}>
            <MicroLabel tone="accent">Client stories</MicroLabel>
            <GradientRevealText as="h2" style={{ ...typeScale.h1, maxWidth: "22ch", textWrap: "balance" }}>
              Real people. Real results. In their own words.
            </GradientRevealText>
          </div>
          {!stacked && (
            <div style={{ display: "flex", gap: space.s }}>
              <Arrow label="Previous testimonial" direction={-1} onClick={() => goTo(active - 1)} disabled={active === 0} />
              <Arrow label="Next testimonial" direction={1} onClick={() => goTo(active + 1)} disabled={active === items.length - 1} />
            </div>
          )}
        </header>

        <div
          ref={track}
          onScroll={(event) => {
            const el = event.currentTarget;
            const first = el.firstElementChild as HTMLElement | null;
            const step = (first?.offsetWidth ?? 1) + (stacked ? 16 : 24);
            setActive(Math.max(0, Math.min(items.length - 1, Math.round(el.scrollLeft / step))));
          }}
          style={{
            display: "grid",
            gridAutoFlow: "column",
            gridAutoColumns: stacked ? "84vw" : "clamp(360px, 42vw, 680px)",
            gap: stacked ? 16 : 24,
            overflowX: "auto",
            scrollSnapType: "x mandatory",
            scrollBehavior: "smooth",
            overscrollBehaviorInline: "contain",
            scrollbarWidth: "none",
            paddingInline: stacked ? "8vw" : layout.pad,
            paddingBottom: space.md,
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
                  aspectRatio: stacked ? "4 / 5" : "16 / 10",
                  overflow: "hidden",
                  borderRadius: stacked ? 12 : 16,
                  background: "#111",
                  scrollSnapAlign: "center",
                  border: `1px solid ${active === index ? hexA(color.accent, .75) : hexA("#fff", .12)}`,
                  boxShadow: active === index ? `0 28px 90px ${hexA(color.accent, .18)}` : "none",
                  transform: active === index ? "scale(1)" : "scale(.965)",
                  opacity: active === index ? 1 : .7,
                  transition: "transform 600ms cubic-bezier(.16,1,.3,1), opacity 450ms ease, border-color 450ms ease, box-shadow 600ms ease",
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
                      src={src}
                      seed={41 + index * 9}
                      play={false}
                      style={{ position: "absolute", inset: 0, transform: "scale(1.02)" }}
                    />
                    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${hexA(color.black, .08)} 10%, ${hexA(color.black, .9)} 100%)` }} />
                    <div style={{ position: "absolute", top: space.lg, left: space.lg, right: space.lg, display: "flex", justifyContent: "space-between", alignItems: "center", gap: space.md }}>
                      <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted }}>Client story · {String(index + 1).padStart(2, "0")}</span>
                      <span style={{ ...typeScale.eyebrow, letterSpacing: ".12em" }}>STRIDE</span>
                    </div>
                    <div style={{ position: "absolute", left: space.lg, right: space.lg, bottom: space.lg, display: "flex", flexDirection: "column", gap: space.md }}>
                      <p style={{ margin: 0, ...typeScale.h3, maxWidth: "30ch", textWrap: "balance" }}>“{item.quote}”</p>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: space.md }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: space.xs }}>
                          <span style={{ ...typeScale.eyebrow, color: color.accentOnDark }}>{item.name}</span>
                          <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted }}>{item.handle}</span>
                        </div>
                        <span style={{ ...typeScale.h3, color: color.textOnDark }}>{item.stat}</span>
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
                        width: 68,
                        height: 68,
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
                <span aria-hidden="true" style={{ width: active === index ? 26 : 8, height: 8, borderRadius: 99, background: active === index ? color.accent : hexA("#fff", .22), transition: "width 360ms cubic-bezier(.16,1,.3,1)" }} />
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
