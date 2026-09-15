import { useEffect, useState } from "react";
import { brand, nav as navCopy } from "../shared/copy";
import { color, ease, font, hexA, layout, microLabel } from "../shared/theme";
import { GlowButton, StrideMark } from "../shared/primitives";
import { subscribeSurface, toneAt, type Tone } from "../shared/surface";

/**
 * Sticky nav — designxhand.com/experience reference, locked.
 *
 * A thin hairline runs the full width along the bottom of the bar, divided
 * into one segment per nav item. As the visitor scrolls through the section
 * an item points at, that item's segment fills left to right in ruby; when
 * the next section takes over, the previous segment stays complete and the
 * next one starts. Each label carries a small hollow dot marker, and a short
 * tick sits at the left edge of every segment.
 *
 * Progress is read from the sections' own bounding boxes once per animation
 * frame rather than through a ScrollTrigger per item, which keeps the nav
 * independent of the section components — they're separate Framer code
 * components and can't be relied on to register anything.
 *
 * The bar also flips to a light treatment (ink text, dark hairline, bone
 * backing) whenever a section that declared itself light is under it. The
 * declaration comes from shared/surface, not from reading the DOM, because
 * Problem changes tone halfway through its own scroll.
 */
export default function Nav({
  /** Height of the bar; the underline segments sit on its bottom edge. */
  height = 68,
}: {
  height?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [lifted, setLifted] = useState(false);
  const [tone, setTone] = useState<Tone>("dark");

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      setLifted(window.scrollY > 24);

      // The section straddling this line owns the fill. A third of the way
      // down means handover happens when a section visually takes the screen.
      const anchor = window.innerHeight * 0.34;
      let found = -1;
      let ratio = 0;

      navCopy.items.forEach((item, i) => {
        const el = document.getElementById(item.id);
        if (!el) return;
        const rect = el.getBoundingClientRect();
        if (rect.top <= anchor && rect.bottom > anchor) {
          found = i;
          ratio = Math.min(1, Math.max(0, (anchor - rect.top) / Math.max(1, rect.height)));
        }
      });

      setActiveIndex(found);
      setProgress(found === -1 ? 0 : ratio);
      setTone(toneAt(height / 2));
    };

    const onScroll = () => {
      if (!frame) frame = window.requestAnimationFrame(measure);
    };

    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // A section can change its own tone without the page scrolling.
    const unsubscribe = subscribeSurface(onScroll);
    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      unsubscribe();
    };
  }, [height]);

  const light = tone === "light";
  const ink = light ? color.textOnLight : color.textOnDark;
  const inkMuted = light ? color.textOnLightMuted : color.textOnDarkMuted;
  const hairline = light ? color.hairlineOnLight : color.hairlineOnDark;

  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        height,
        display: "flex",
        alignItems: "stretch",
        paddingLeft: layout.pad,
        paddingRight: layout.pad,
        fontFamily: font.sans,
        color: ink,
        background: lifted ? hexA(light ? color.bone : color.black, light ? 0.78 : 0.7) : "transparent",
        backdropFilter: lifted ? "blur(18px) saturate(1.2)" : "none",
        WebkitBackdropFilter: lifted ? "blur(18px) saturate(1.2)" : "none",
        transition: `background 600ms ${ease.out}, color 600ms ${ease.out}`,
      }}
    >
      {/* Wordmark cell — its segment is solid, the anchor the rest reads from. */}
      <a
        href="#top"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: 11,
          paddingRight: 48,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <StrideMark size={24} glowing />
        <span style={{ ...microLabel, fontFamily: font.sans, fontSize: 13, letterSpacing: "0.18em" }}>
          {brand.mark}
        </span>
        <Segment fill={1} active={false} tick={false} width="58%" hairline={hairline} />
      </a>

      <nav
        className="stride-nav-links"
        aria-label="Sections"
        style={{ display: "flex", alignItems: "stretch", flex: 1, minWidth: 0 }}
      >
        {navCopy.items.map((item, i) => {
          const done = activeIndex > i;
          const active = activeIndex === i;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              style={{
                position: "relative",
                flex: 1,
                minWidth: 0,
                display: "flex",
                alignItems: "center",
                gap: 10,
                paddingLeft: 18,
                textDecoration: "none",
                fontSize: 13,
                letterSpacing: "0.01em",
                whiteSpace: "nowrap",
                color: active ? ink : inkMuted,
                transition: `color 400ms ${ease.out}`,
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = ink)}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = active ? ink : inkMuted;
              }}
            >
              <Dot lit={active || done} ink={ink} />
              {item.label}
              <Segment fill={done ? 1 : active ? progress : 0} active={active} hairline={hairline} />
            </a>
          );
        })}
      </nav>

      <div style={{ position: "relative", display: "flex", alignItems: "center", paddingLeft: 24 }}>
        <GlowButton href="#contact" style={{ padding: "11px 20px" }}>
          {navCopy.cta}
        </GlowButton>
        <Segment fill={0} active={false} hairline={hairline} />
      </div>
    </header>
  );
}

/** One division of the bar's bottom hairline, with its own scroll fill. */
function Segment({
  fill,
  active,
  hairline,
  tick = true,
  width = "100%",
}: {
  fill: number;
  active: boolean;
  hairline: string;
  tick?: boolean;
  width?: string;
}) {
  return (
    <span
      aria-hidden="true"
      style={{
        position: "absolute",
        left: 0,
        bottom: 0,
        width,
        height: 1,
        background: hairline,
        transition: `background 600ms ${ease.out}`,
      }}
    >
      {tick && (
        <span
          style={{
            position: "absolute",
            left: 0,
            bottom: 0,
            width: 1,
            height: 5,
            background: hairline,
            transition: `background 600ms ${ease.out}`,
          }}
        />
      )}
      <span
        style={{
          position: "absolute",
          inset: 0,
          background: color.ruby,
          boxShadow: active ? `0 0 10px ${hexA(color.ruby, 0.9)}` : "none",
          transformOrigin: "left center",
          transform: `scaleX(${fill})`,
          /* The active segment tracks scroll directly — easing it would
             visibly lag the page. Completed ones ease to full. */
          transition: active ? "none" : `transform 500ms ${ease.out}`,
        }}
      />
    </span>
  );
}

/** Small hollow marker before each label; lights ruby once its section is live. */
function Dot({ lit, ink }: { lit: boolean; ink: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 5,
        height: 5,
        flexShrink: 0,
        borderRadius: "50%",
        border: `1px solid ${lit ? color.ruby : hexA(ink, 0.4)}`,
        background: lit ? color.ruby : "transparent",
        boxShadow: lit ? `0 0 8px ${hexA(color.ruby, 0.8)}` : "none",
        transition: `all 400ms ${ease.out}`,
      }}
    />
  );
}
