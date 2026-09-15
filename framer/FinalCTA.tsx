import { addPropertyControls, ControlType } from "framer"
import { gsap, useGsapContext } from "./gsap";
import { brand, finalCta as copy } from "./copy";
import { color, hexA, layout, rhythm, space, typeScale } from "./theme";
import { GlowButton, Grain, MicroLabel } from "./primitives";
import RevealText from "./RevealText";
import { useBreakpoint } from "./responsive";

/**
 * Final CTA — Norvin-style contact section.
 *
 * Left: the pill label, the headline, a world map sitting dark-on-dark
 * behind it, contact details and the Start Project button. Right: a rounded
 * card holding the Calendly inline embed, themed to the site's palette
 * through Calendly's own colour parameters.
 *
 * Deliberately the calmest section on the page: a plain staggered fade-up on
 * enter and nothing scroll-driven. Its job is the booking, not spectacle.
 */
export default function FinalCTA({
  /** Calendly scheduling link. The embed inherits the site's colours. */
  calendly = brand.calendly,
  /** Until the link is real, the card shows a placeholder panel: a dead
   *  scheduling URL renders as a broken grey frame, which looks like a bug. */
  ready = brand.calendlyReady,
}: {
  calendly?: string;
  ready?: boolean;
}) {
  const bp = useBreakpoint();
  const stacked = bp === "mobile" || bp === "tablet";

  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".cta-item"), { opacity: 0, y: 20 });
      gsap.to(q(".cta-item"), {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.1,
        ease: "power2.out",
        scrollTrigger: { trigger: root, start: "top 72%" },
      });
    },
    [],
    (root) => gsap.set(gsap.utils.selector(root)(".cta-item"), { opacity: 1, y: 0 }),
  );

  // Calendly reads these from the query string; they keep the widget on
  // palette instead of its default blue.
  const embedUrl = `${calendly}?hide_event_type_details=0&hide_gdpr_banner=1&background_color=120D0C&text_color=F6F1EC&primary_color=E01535`;

  return (
    <section
      id="contact"
      ref={rootRef}
      style={{
        position: "relative",
        background: color.black,
        color: color.textOnDark,
        fontFamily: typeScale.bodyLg.fontFamily,
        padding: `${layout.section} ${layout.pad}`,
        overflow: "hidden",
      }}
    >
      <Grain opacity={0.12} />

      <div
        style={{
          position: "relative",
          display: "grid",
          gridTemplateColumns: stacked ? "1fr" : "45% 45%",
          justifyContent: "space-between",
          gap: space.h,
        }}
      >
        {/* ---- left ---- */}
        <div style={{ position: "relative", display: "flex", flexDirection: "column" }}>
          <WorldMap />

          <div
            className="cta-item"
            style={{
              alignSelf: "flex-start",
              display: "inline-flex",
              alignItems: "center",
              gap: space.s,
              padding: `${space.s}px ${space.md}px`,
              borderRadius: 999,
              border: `1px solid ${color.hairlineOnDark}`,
            }}
          >
            <span
              style={{ width: 6, height: 6, borderRadius: "50%", background: color.ruby }}
              aria-hidden="true"
            />
            <MicroLabel tone="dark" style={{ color: color.textOnDark }}>
              {copy.pill}
            </MicroLabel>
          </div>

          <div style={{ position: "relative", marginTop: rhythm.eyebrowToHeadline }}>
            {copy.headline.map((line, i) => (
              <RevealText
                key={line}
                as="h2"
                delay={i * 0.06}
                style={{ ...typeScale.h1, display: "block" }}
              >
                {line}
              </RevealText>
            ))}
          </div>

          <p
            className="cta-item"
            style={{
              position: "relative",
              margin: `${rhythm.headlineToBody}px 0 0`,
              maxWidth: "40ch",
              ...typeScale.bodyLg,
              color: color.textOnDarkMuted,
            }}
          >
            {copy.body}
          </p>

          <div
            className="cta-item"
            style={{ position: "relative", marginTop: space.xxl, display: "flex", flexDirection: "column", gap: space.xs }}
          >
            <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted }}>
              {brand.phoneLabel}
            </span>
            <a href={`tel:${brand.phone}`} style={{ ...typeScale.h3, color: color.textOnDark, textDecoration: "none" }}>
              {brand.phone}
            </a>
            <a
              href={`mailto:${brand.email}`}
              style={{
                ...typeScale.eyebrow,
                textTransform: "none",
                color: color.textOnDarkMuted,
                textDecoration: "none",
              }}
            >
              {brand.email}
            </a>
          </div>

          <div className="cta-item" style={{ position: "relative", marginTop: space.xl }}>
            <GlowButton href={calendly}>{copy.button}</GlowButton>
          </div>
        </div>

        {/* ---- right: the booking card ---- */}
        <div
          className="cta-item"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: space.md,
            padding: space.xl,
            background: color.ink,
            border: `1px solid ${color.hairlineOnDark}`,
            borderRadius: 4,
          }}
        >
          <MicroLabel tone="ruby">{copy.calendlyHeader}</MicroLabel>
          {ready ? (
            <iframe
              title={copy.calendlyHeader}
              src={embedUrl}
              style={{
                width: "100%",
                minHeight: stacked ? 620 : 680,
                border: "none",
                borderRadius: 4,
                background: color.ink,
              }}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: space.md,
                textAlign: "center",
                width: "100%",
                minHeight: stacked ? 620 : 680,
                borderRadius: 4,
                border: `1px dashed ${color.hairlineOnDark}`,
                background: hexA(color.black, 0.4),
                padding: space.xl,
              }}
            >
              <span style={{ ...typeScale.h3, color: color.textOnDark }}>
                Calendly booking widget
              </span>
              <span style={{ ...typeScale.bodyLg, color: color.textOnDarkMuted, maxWidth: "36ch" }}>
                Add the real scheduling link and set calendlyReady in copy.ts. The embed is
                pre-themed to the site: ruby primary, warm black ground.
              </span>
              <GlowButton href={calendly}>{copy.calendlyHeader}</GlowButton>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

/**
 * The decorative map: continent blobs traced as simple paths, dark-on-dark so
 * it reads as texture behind the headline rather than as a chart.
 */
function WorldMap() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 400 200"
      style={{
        position: "absolute",
        left: "-6%",
        top: "4%",
        width: "112%",
        opacity: 0.5,
        pointerEvents: "none",
      }}
    >
      <g fill={hexA(color.textOnDark, 0.055)}>
        <path d="M40 58c14-12 34-18 52-12 10 3 14 12 26 12 9 0 14-7 23-6 11 1 13 12 9 20-5 11-18 14-24 24-5 9-3 21-11 28-9 8-24 6-33-1-12-9-16-26-24-39-6-9-19-17-18-26Z" />
        <path d="M96 132c9-4 20 2 24 11 5 11 2 24-4 34-4 7-13 13-20 9-8-5-7-17-6-26 1-11 0-24 6-28Z" />
        <path d="M176 44c12-8 28-9 42-5 9 3 12 13 21 15 11 3 23-4 33 1 9 5 9 18 4 27-6 11-20 13-31 17-13 5-24 15-38 15-11 0-21-8-25-18-5-13-2-28 2-41 2-5 4-9 6-11Z" />
        <path d="M206 108c10-3 21 3 25 12 5 11 3 25-2 36-4 9-14 17-24 15-11-3-14-17-14-28 0-12 3-31 15-35Z" />
        <path d="M286 62c14-6 31-3 43 6 10 8 15 22 12 34-3 13-16 21-29 22-14 1-28-6-35-18-7-13-4-31 9-40Z" />
        <path d="M320 138c9-5 21 0 25 9 4 10-1 22-10 27-9 4-20 0-24-9-4-10 0-22 9-27Z" />
      </g>
    </svg>
  );
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(FinalCTA, {
  calendly: { type: ControlType.String, title: "Calendly URL" },
  ready: { type: ControlType.Boolean, title: "Calendly live", defaultValue: false },
});
