import { useState } from "react";
import { gsap, useGsapContext, SCRUB, approach } from "../shared/gsap";
import { faq as copy } from "../shared/copy";
import { color, ease, hexA, layout, space, typeScale } from "../shared/theme";
import { useStacked } from "../shared/responsive";
import GradientRevealText from "../shared/GradientRevealText";

/**
 * FAQ — sondaven.com reference.
 *
 * The three letters open spread across the screen with ambient shapes
 * drifting behind them. As the visitor scrolls they shrink and travel to a
 * small position top-left while the numbered list fills the space they
 * leave — one continuous motion, not two animations in sequence.
 *
 * On phones the letters are simply a small static label: there is not enough
 * width for the spread to read, per the responsive prompt.
 */
export default function FAQ({ scrollLength = "700vh" }: { scrollLength?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const stacked = useStacked();

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);

      // The overlap with the section before this one. Runs on the frame,
      // which this section's own timelines only ever measure, never animate.
      approach(root, ".faq-frame");
      gsap.set(q(".faq-item"), { opacity: 0, x: 40 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: SCRUB },
      });

      // The letters shrink and travel while the list grows in: the two
      // overlap deliberately so it reads as one move.
      tl.to(
        q(".faq-letters"),
        { scale: 0.2, duration: 0.3, ease: "power2.inOut" },
        0.05,
      )
        .to(q(".faq-letter"), { letterSpacing: "0.02em", duration: 0.3, stagger: 0.02 }, 0.05)
        .to(q(".faq-item"), { opacity: 1, x: 0, duration: 0.3, stagger: 0.05, ease: "power2.out" }, 0.18);
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".faq-item"), { opacity: 1, x: 0 });
      gsap.set(q(".faq-letters"), { scale: 0.2 });
    },
  );

  const list = (
    <div style={{ width: "100%", maxWidth: 900, margin: "0 auto" }}>
      {copy.items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="faq-item"
            style={{ borderTop: `1px solid ${color.hairlineOnDark}` }}
          >
            <button
              className="stride-press"
              type="button"
              id={`faq-q-${i}`}
              aria-expanded={isOpen}
              aria-controls={`faq-a-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%",
                // A grid, so the answer below can be placed in the same
                // column as the question rather than guessing at a padding
                // that has to match a min-width plus a flex gap.
                display: "grid",
                gridTemplateColumns: `64px 1fr 16px`,
                alignItems: "center",
                gap: space.lg,
                padding: `${space.md}px 0`,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                font: "inherit",
                color: color.textOnDark,
              }}
            >
              <span
                style={{
                  ...typeScale.eyebrow,
                  color: color.accentOnDark,
                  minWidth: 64,
                }}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <span style={{ ...typeScale.h3, flex: 1 }}>{item.q}</span>
              <span
                aria-hidden="true"
                style={{
                  position: "relative",
                  width: 16,
                  height: 16,
                  flexShrink: 0,
                  transform: `rotate(${isOpen ? 45 : 0}deg)`,
                  transition: `transform 300ms ${ease.out}`,
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    top: 7.5,
                    left: 0,
                    width: 16,
                    height: 1,
                    background: color.accent,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 7.5,
                    top: 0,
                    width: 1,
                    height: 16,
                    background: color.accent,
                  }}
                />
              </span>
            </button>

            <div
              id={`faq-a-${i}`}
              role="region"
              aria-labelledby={`faq-q-${i}`}
              style={{
                display: "grid",
                gridTemplateRows: isOpen ? "1fr" : "0fr",
                transition: `grid-template-rows 300ms ${ease.out}`,
              }}
            >
              <div
                style={{
                  overflow: "hidden",
                  display: "grid",
                  gridTemplateColumns: `64px 1fr 16px`,
                  gap: space.lg,
                }}
              >
                <span />
                <p
                  style={{
                    margin: 0,
                    paddingBottom: space.md,
                    maxWidth: "62ch",
                    ...typeScale.bodyLg,
                    color: color.textOnDarkMuted,
                  }}
                >
                  {item.a}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  if (stacked) {
    return (
      <section
        id="faq"
        style={{
          background: color.black,
          color: color.textOnDark,
          fontFamily: typeScale.bodyLg.fontFamily,
          display: "flex",
          flexDirection: "column",
          gap: space.xl,
          padding: `${layout.section} ${layout.pad}`,
        }}
      >
        <GradientRevealText as="h2" style={{ ...typeScale.h1 }}>
          {copy.label}
        </GradientRevealText>
        {list}
      </section>
    );
  }

  return (
    <section
      id="faq"
      ref={rootRef}
      style={{
        position: "relative",
        height: scrollLength,
        background: color.black,
        fontFamily: typeScale.bodyLg.fontFamily,
      }}
    >
      <div className="faq-frame" style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <AmbientShapes />

        {/* The letters: spread, then shrunk into the corner. */}
        <div
          className="faq-letters"
          style={{
            position: "absolute",
            top: `calc(${layout.navHeight}px + ${layout.section})`,
            left: layout.pad,
            right: layout.pad,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            transformOrigin: "left top",
            color: color.textOnDark,
            pointerEvents: "none",
          }}
        >
          {/* Letters spread across the frame with the supporting lines set
              between them, as in the reference — not three letters alone. */}
          {/* The one size off the type scale on purpose: these letters span
              the viewport, so they track its width instead of capping at
              display-xl's 120px. */}
          <span className="faq-letter" style={{ ...typeScale.displayLg, fontSize: "11vw", lineHeight: "11.7vw" }}>
            F
          </span>
          <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted, maxWidth: "14ch" }}>
            Answers to key questions
          </span>
          <span className="faq-letter" style={{ ...typeScale.displayLg, fontSize: "11vw", lineHeight: "11.7vw" }}>
            A
          </span>
          <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted, maxWidth: "14ch" }}>
            All you need to know
          </span>
          <span className="faq-letter" style={{ ...typeScale.displayLg, fontSize: "11vw", lineHeight: "11.7vw" }}>
            Q
          </span>
        </div>

        {/* The list fills the space the letters vacate. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            paddingTop: `calc(${layout.navHeight}px + ${layout.section} + 96px)`,
            paddingLeft: layout.pad,
            paddingRight: layout.pad,
            paddingBottom: layout.section,
            color: color.textOnDark,
          }}
        >
          {list}
        </div>
      </div>
    </section>
  );
}

/** Slow ambient drift behind the letters — the reference's birds, abstracted. */
function AmbientShapes() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      {[0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
        <span
          key={i}
          className="stride-float"
          style={{
            position: "absolute",
            left: `${6 + ((i * 23) % 88)}%`,
            top: `${12 + ((i * 41) % 74)}%`,
            width: 6 + (i % 3) * 4,
            height: 6 + (i % 3) * 4,
            borderRadius: "50%",
            background: hexA(color.accent, 0.35),
            animationDelay: `${-i * 4.5}s`,
            animationDuration: `${34 + i * 6}s`,
          }}
        />
      ))}
    </div>
  );
}
