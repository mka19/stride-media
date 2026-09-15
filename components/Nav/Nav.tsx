import { useEffect, useState } from "react";
import { useBreakpoint } from "../shared/responsive";
import { brand, nav as navCopy } from "../shared/copy";
import { color, ease, hexA, layout, space, typeScale } from "../shared/theme";
import { GlowButton, StrideMark } from "../shared/primitives";
import { subscribeSurface, toneAt, type Tone } from "../shared/surface";

/**
 * Sticky nav — designxhand.com/experience reference, locked.
 *
 * A thin hairline runs the full width along the bottom of the bar, divided
 * into one segment per section link. Every segment starts empty and is only
 * ever filled by scroll progress; the wordmark has no segment at all. As the visitor scrolls through the section
 * an item points at, that item's segment fills left to right in the accent;
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
  height = layout.navHeight,
}: {
  height?: number;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [lifted, setLifted] = useState(false);
  const [tone, setTone] = useState<Tone>("dark");
  const [pageProgress, setPageProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

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

      // Collapsed nav has no per-section underlines to read, so the page's
      // own progress takes their place as a bar across the top.
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setPageProgress(scrollable > 0 ? Math.min(1, window.scrollY / scrollable) : 0);
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

  // Nav links sit 32px apart; the underline segments tile the bar beneath them.
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
        fontFamily: typeScale.eyebrow.fontFamily,
        color: ink,
        background: lifted ? hexA(light ? color.bone : color.black, light ? 0.78 : 0.7) : "transparent",
        backdropFilter: lifted ? "blur(18px) saturate(1.2)" : "none",
        WebkitBackdropFilter: lifted ? "blur(18px) saturate(1.2)" : "none",
        transition: `background 600ms ${ease.out}, color 600ms ${ease.out}`,
      }}
    >
      {/* Wordmark. No underline: the fill treatment belongs to section links. */}
      <a
        href="#top"
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: space.s,
          paddingRight: space.xxl,
          textDecoration: "none",
          color: "inherit",
        }}
      >
        <StrideMark size={24} glowing />
        <span style={{ ...typeScale.eyebrow, fontWeight: 500 }}>
          {brand.mark}
        </span>
      </a>

      <nav
        className="stride-nav-links"
        aria-label="Sections"
        style={{
          display: isMobile ? "none" : "flex",
          alignItems: "stretch",
          flex: 1,
          minWidth: 0,
        }}
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
                gap: space.s,
                paddingLeft: bp === "tablet" ? space.s : space.md,
                textDecoration: "none",
                ...typeScale.eyebrow,
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

      <div
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          marginLeft: "auto",
          paddingLeft: space.xl,
        }}
      >
        {isMobile ? (
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              display: "grid",
              gap: 5,
              width: 44,
              height: 44,
              padding: space.s,
              background: "transparent",
              border: "none",
              cursor: "pointer",
              alignContent: "center",
            }}
          >
            <span style={{ height: 1.5, background: ink, transition: `background 600ms ${ease.out}` }} />
            <span style={{ height: 1.5, background: ink, transition: `background 600ms ${ease.out}` }} />
          </button>
        ) : (
          <>
            <GlowButton href="#contact">{navCopy.cta}</GlowButton>
            <Segment fill={0} active={false} hairline={hairline} />
          </>
        )}
      </div>

      {/* Collapsed nav: the whole page's progress, since the per-section
          underlines are not on screen to read. */}
      {isMobile && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 2,
            background: hairline,
          }}
        >
          <span
            style={{
              display: "block",
              height: "100%",
              width: "100%",
              background: color.accent,
              transformOrigin: "left center",
              transform: `scaleX(${pageProgress})`,
            }}
          />
        </span>
      )}

      {/* Mobile menu panel */}
      {isMobile && menuOpen && (
        <div
          style={{
            position: "fixed",
            top: height,
            left: 0,
            right: 0,
            bottom: 0,
            background: light ? color.bone : color.black,
            display: "flex",
            flexDirection: "column",
            gap: space.lg,
            padding: `${space.xl}px ${layout.pad}`,
          }}
        >
          {navCopy.items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setMenuOpen(false)}
              style={{ ...typeScale.h3, color: ink, textDecoration: "none" }}
            >
              {item.label}
            </a>
          ))}
          <GlowButton href="#contact" style={{ marginTop: space.md, alignSelf: "flex-start" }}>
            {navCopy.cta}
          </GlowButton>
        </div>
      )}
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
          background: color.accent,
          boxShadow: active ? `0 0 10px ${hexA(color.accent, 0.9)}` : "none",
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

/** Small hollow marker before each label; lights up once its section is live. */
function Dot({ lit, ink }: { lit: boolean; ink: string }) {
  return (
    <span
      aria-hidden="true"
      style={{
        width: 5,
        height: 5,
        flexShrink: 0,
        borderRadius: "50%",
        border: `1px solid ${lit ? color.accent : hexA(ink, 0.4)}`,
        background: lit ? color.accent : "transparent",
        boxShadow: lit ? `0 0 8px ${hexA(color.accent, 0.8)}` : "none",
        transition: `all 400ms ${ease.out}`,
      }}
    />
  );
}
