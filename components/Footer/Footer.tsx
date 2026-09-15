import { gsap, useGsapContext } from "../shared/gsap";
import { brand, footer as copy } from "../shared/copy";
import { color, hexA, layout, space, typeScale } from "../shared/theme";
import { Grain } from "../shared/primitives";
import MarkEtching from "./MarkEtching";
import { useBreakpoint, detailFor } from "../shared/responsive";

/**
 * Footer — sondaven.com reference.
 *
 * The mark is the visual anchor, scaled up and set centre with dots drifting
 * around it. Brand name, contact and links sit beneath, arriving just behind
 * the illustration.
 */
export default function Footer() {
  const bp = useBreakpoint();
  const detail = detailFor(bp);
  const markSize = bp === "mobile" ? 150 : bp === "tablet" ? 240 : 360;
  const dots = Math.round(18 * detail);

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".ft-mark"), { opacity: 0, scale: 0.9 });
      gsap.set(q(".ft-item"), { opacity: 0, y: 16 });

      gsap
        .timeline({ scrollTrigger: { trigger: root, start: "top 80%" } })
        .to(q(".ft-mark"), { opacity: 1, scale: 1, duration: 0.6, ease: "power2.out" })
        .to(q(".ft-item"), { opacity: 1, y: 0, duration: 0.5, stagger: 0.15 }, 0.15);
    },
    [],
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".ft-mark"), { opacity: 1, scale: 1 });
      gsap.set(q(".ft-item"), { opacity: 1, y: 0 });
    },
  );

  return (
    <footer
      ref={rootRef}
      style={{
        position: "relative",
        background: color.black,
        color: color.textOnDark,
        fontFamily: typeScale.body.fontFamily,
        padding: `${layout.section} ${layout.pad}`,
        overflow: "hidden",
        textAlign: "center",
      }}
    >
      <Grain opacity={0.14} />

      {/* drifting dots around the anchor */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: dots }, (_, i) => (
          <span
            key={i}
            className="stride-float"
            style={{
              position: "absolute",
              left: `${(i * 37) % 96}%`,
              top: `${(i * 53) % 88}%`,
              width: 2 + (i % 3),
              height: 2 + (i % 3),
              borderRadius: "50%",
              background: hexA(color.ruby, 0.4),
              animationDelay: `${-i * 1.7}s`,
              animationDuration: `${14 + (i % 5) * 3}s`,
            }}
          />
        ))}
      </div>

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: space.xl,
        }}
      >
        <div className="ft-mark" style={{ lineHeight: 0 }}>
          <MarkEtching size={markSize} breakpoint={bp} />
        </div>

        <h2 className="ft-item" style={{ margin: 0, ...typeScale.h2 }}>
          {brand.name}
        </h2>

        <p className="ft-item" style={{ margin: 0, ...typeScale.bodyLg, color: color.textOnDarkMuted }}>
          {copy.tagline}
        </p>

        <div
          className="ft-item"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: space.xl,
            ...typeScale.labelSm,
          }}
        >
          {copy.links.map((link) => (
            <a
              key={link}
              href="#top"
              style={{ color: color.textOnDarkMuted, textDecoration: "none" }}
            >
              {link}
            </a>
          ))}
        </div>

        <div
          className="ft-item"
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: space.xl,
            ...typeScale.labelSm,
            color: color.textOnDarkMuted,
          }}
        >
          <a href={`tel:${brand.phone}`} style={{ color: "inherit", textDecoration: "none" }}>
            {brand.phone}
          </a>
          <a href={`mailto:${brand.email}`} style={{ color: "inherit", textDecoration: "none" }}>
            {brand.email}
          </a>
          <span>{brand.url}</span>
        </div>
      </div>
    </footer>
  );
}
