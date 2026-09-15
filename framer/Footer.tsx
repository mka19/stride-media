import { addPropertyControls, ControlType } from "framer"
import { gsap, useGsapContext } from "./gsap";
import { brand, footer as copy } from "./copy";
import { color, ease, hexA, layout, space, typeScale } from "./theme";
import { Grain, MediaTile } from "./primitives";
import { useBreakpoint, detailFor } from "./responsive";
import Wordmark from "./Wordmark";

/**
 * Footer — Clipfolio reference.
 *
 * Full-bleed footage behind the whole block, numbered links down the left,
 * social links down the right, and the wordmark filling the width beneath
 * them, coming apart into blocks wherever the cursor crosses it. The meta
 * row sits along the bottom edge.
 */
export default function Footer({
  /** Cinematic footage behind the footer; falls back to a generated fill. */
  backgroundSrc,
}: {
  backgroundSrc?: string;
}) {
  const bp = useBreakpoint();
  const stacked = bp === "mobile";
  const dots = Math.round(14 * detailFor(bp));

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".ft-item"), { opacity: 0, y: 16 });
      gsap.set(q(".ft-word"), { opacity: 0, scale: 0.96 });

      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 80%" } })
        .to(q(".ft-item"), { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 })
        .to(q(".ft-word"), { opacity: 1, scale: 1, duration: 0.7, ease: "power2.out" }, 0.15);
    },
    [stacked],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".ft-item"), { opacity: 1, y: 0 });
      gsap.set(q(".ft-word"), { opacity: 1, scale: 1 });
    },
  );

  const linkStyle = {
    ...typeScale.bodyLg,
    color: color.textOnDarkMuted,
    textDecoration: "none",
    transition: `color 400ms ${ease.out}`,
  };

  return (
    <footer
      ref={rootRef}
      style={{
        position: "relative",
        background: color.black,
        color: color.textOnDark,
        fontFamily: typeScale.bodyLg.fontFamily,
        overflow: "hidden",
      }}
    >
      {/* ---- footage behind everything ---- */}
      <MediaTile src={backgroundSrc} seed={31} style={{ position: "absolute", inset: 0 }} />
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(180deg, ${hexA(color.black, 0.72)} 0%, ${hexA(color.black, 0.5)} 45%, ${hexA(color.black, 0.88)} 100%)`,
        }}
      />
      <Grain opacity={0.16} />

      {/* drifting dots, as before */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: dots }, (_, i) => (
          <span
            key={i}
            className="stride-float"
            style={{
              position: "absolute",
              left: `${(i * 41) % 96}%`,
              top: `${(i * 57) % 88}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              borderRadius: "50%",
              background: hexA(color.accent, 0.45),
              animationDelay: `${-i * 1.9}s`,
              animationDuration: `${15 + (i % 5) * 3}s`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          // A full-width wordmark is ~24vw tall, which pushed the footer past
          // the last screen and slid the link rows up under the fixed nav.
          // The rhythm around it is tightened so the whole footer lands
          // inside one viewport with the nav cleared.
          gap: `${space.h}px`,
          padding: `${space.hh}px ${layout.pad} ${space.xl}px`,
          minHeight: stacked ? undefined : "70vh",
          justifyContent: "space-between",
        }}
      >
        {/* ---- links: numbered left, social right ---- */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: stacked ? "1fr 1fr" : "auto auto",
            justifyContent: "space-between",
            gap: space.xl,
          }}
        >
          <nav
            className="ft-item"
            aria-label="Footer"
            style={{ display: "flex", flexDirection: "column", gap: space.s }}
          >
            {copy.nav.map((item) => (
              <a
                key={item.n}
                href={item.href}
                style={{ ...linkStyle, display: "flex", gap: space.s }}
                onMouseEnter={(e) => (e.currentTarget.style.color = color.textOnDark)}
                onMouseLeave={(e) => (e.currentTarget.style.color = color.textOnDarkMuted)}
              >
                <span style={{ ...typeScale.eyebrow, color: color.accent }}>{item.n}</span>
                {item.label}
              </a>
            ))}
          </nav>

          <nav
            className="ft-item"
            aria-label="Social"
            style={{
              display: "flex",
              flexDirection: "column",
              gap: space.s,
              textAlign: stacked ? "left" : "right",
            }}
          >
            {copy.socials.map((item) => (
              <a
                key={item.label}
                href={item.href}
                style={linkStyle}
                onMouseEnter={(e) => (e.currentTarget.style.color = color.textOnDark)}
                onMouseLeave={(e) => (e.currentTarget.style.color = color.textOnDarkMuted)}
              >
                {item.label}
              </a>
            ))}
          </nav>
        </div>

        {/* ---- the wordmark, dissolving under the cursor ----
             Pulled out of the column's side padding so the type runs the
             full width of the page; the height is set from the viewport so
             the word always reaches both edges rather than sitting as a
             small mark in the middle of an empty band. */}
        <div
          className="ft-word"
          style={{ marginInline: `calc(-1 * ${layout.pad})`, width: "auto" }}
        >
          <Wordmark text={copy.wordmark} height={stacked ? "30vw" : "min(24vw, 44vh)"} />
        </div>

        {/* ---- meta row ---- */}
        <div
          className="ft-item"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            gap: space.md,
            paddingTop: space.lg,
            borderTop: `1px solid ${color.hairlineOnDark}`,
            ...typeScale.eyebrow,
            color: color.textOnDarkMuted,
          }}
        >
          <span>
            @{brand.url.replace(/\..*$/, "")} — {copy.rights}
          </span>
          <span>
            {copy.basedLabel} {copy.basedIn}
          </span>
          <a
            href={`mailto:${brand.email}`}
            style={{ color: "inherit", textDecoration: "none", textTransform: "none" }}
          >
            {brand.email}
          </a>
          <span style={{ display: "flex", gap: space.md }}>
            {copy.legal.map((item) => (
              <a key={item} href="#top" style={{ color: "inherit", textDecoration: "none" }}>
                {item}
              </a>
            ))}
          </span>
        </div>
      </div>
    </footer>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(Footer, {
  backgroundSrc: { type: ControlType.File, allowedFileTypes: ["mp4", "webm"], title: "Background" },
});
