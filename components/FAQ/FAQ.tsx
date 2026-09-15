import { useState } from "react";
import { gsap, useGsapContext } from "../shared/gsap";
import { faq as copy } from "../shared/copy";
import { color, ease, hexA, layout, space, typeScale } from "../shared/theme";
import { useBreakpoint } from "../shared/responsive";

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
export default function FAQ({ scrollLength = "300vh" }: { scrollLength?: string }) {
  const [open, setOpen] = useState<number | null>(0);
  const bp = useBreakpoint();
  const stacked = bp === "mobile";

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".faq-item"), { opacity: 0, x: 40 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: 0.7 },
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
    <div style={{ width: "100%", maxWidth: 900 }}>
      {copy.items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div
            key={item.q}
            className="faq-item"
            style={{ borderTop: `1px solid ${color.hairlineOnDark}` }}
          >
            <button
              type="button"
              id={`faq-q-${i}`}
              aria-expanded={isOpen}
              aria-controls={`faq-a-${i}`}
              onClick={() => setOpen(isOpen ? null : i)}
              style={{
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: space.lg,
                padding: `${space.lg}px 0`,
                background: "transparent",
                border: "none",
                cursor: "pointer",
                textAlign: "left",
                color: color.textOnDark,
              }}
            >
              <span style={{ ...typeScale.labelSm, color: color.ruby, minWidth: 32 }}>
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
                    background: color.ruby,
                  }}
                />
                <span
                  style={{
                    position: "absolute",
                    left: 7.5,
                    top: 0,
                    width: 1,
                    height: 16,
                    background: color.ruby,
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
              <div style={{ overflow: "hidden" }}>
                <p
                  style={{
                    margin: 0,
                    paddingBottom: space.lg,
                    paddingLeft: 56,
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
          fontFamily: typeScale.body.fontFamily,
          display: "flex",
          flexDirection: "column",
          gap: space.xl,
          padding: `${layout.section} ${layout.pad}`,
        }}
      >
        <h2 style={{ margin: 0, ...typeScale.h2, letterSpacing: "0.12em" }}>{copy.label}</h2>
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
        fontFamily: typeScale.body.fontFamily,
      }}
    >
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden" }}>
        <AmbientShapes />

        {/* The letters: spread, then shrunk into the corner. */}
        <div
          className="faq-letters"
          style={{
            position: "absolute",
            top: `calc(${layout.navHeight}px + ${layout.section})`,
            left: layout.pad,
            width: `calc(52% - ${layout.pad})`,
            display: "flex",
            justifyContent: "space-between",
            transformOrigin: "left top",
            color: color.textOnDark,
            pointerEvents: "none",
          }}
        >
          {copy.label.split("").map((ch, i) => (
            <span
              key={i}
              className="faq-letter"
              style={{ ...typeScale.displayXl, fontSize: "18vw", lineHeight: 0.9 }}
            >
              {ch}
            </span>
          ))}
        </div>

        {/* The list fills the space the letters vacate. */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
            padding: `calc(${layout.navHeight}px + ${layout.section}) ${layout.pad} ${layout.section}`,
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
      {[0, 1, 2, 3, 4].map((i) => (
        <span
          key={i}
          className="stride-float"
          style={{
            position: "absolute",
            left: `${8 + i * 19}%`,
            top: `${18 + ((i * 37) % 60)}%`,
            width: 6 + (i % 3) * 4,
            height: 6 + (i % 3) * 4,
            borderRadius: "50%",
            background: hexA(color.ruby, 0.35),
            animationDelay: `${-i * 3.5}s`,
            animationDuration: `${16 + i * 4}s`,
          }}
        />
      ))}
    </div>
  );
}
