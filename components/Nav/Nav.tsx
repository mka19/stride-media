import { useEffect, useRef, useState } from "react";
import { useBreakpoint, useNavRoom } from "../shared/responsive";
import { brand, nav as navCopy } from "../shared/copy";
import { color, ease, hexA, layout, space, typeScale } from "../shared/theme";
import { GlowButton, StrideMark } from "../shared/primitives";
import SoundButton from "../shared/SoundButton";
import { subscribeSurface, toneAt, type Tone } from "../shared/surface";
import { prefersReducedMotion } from "../shared/gsap";

type NavTransition = {
  phase: "enter" | "cover" | "reveal";
  label: string;
  x: number;
  y: number;
};

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
  /**
   * A track for the sound button. Without one the button toggles silently.
   * It is never played until the button is pressed — nothing on this site
   * makes noise at a visitor who has not asked for it.
   */
  /*
   * Relative, not rooted.
   *
   * "/audio/…" resolves against the origin, which is right for a site served
   * from its own domain and wrong everywhere else — in the published artifact
   * it pointed at claude.ai/audio and returned a 404, so the button toggled
   * and nothing played. Relative to the page, it finds the file wherever the
   * page happens to be.
   */
  soundtrack = "audio/stride-theme.mp3",
}: {
  height?: number;
  soundtrack?: string;
}) {
  const [activeIndex, setActiveIndex] = useState(-1);
  const [progress, setProgress] = useState(0);
  const [lifted, setLifted] = useState(false);
  const [tone, setTone] = useState<Tone>("dark");
  const [pageProgress, setPageProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [navHidden, setNavHidden] = useState(false);
  const [transition, setTransition] = useState<NavTransition | null>(null);
  const lastScroll = useRef(0);
  const direction = useRef<1 | -1 | 0>(0);
  const directionTravel = useRef(0);
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  // The rail shows only where eight labels actually fit; below that the menu
  // carries them, and a tablet keeps the sound toggle and the CTA in the bar.
  const navRoom = useNavRoom();
  const railVisible = !isMobile && navRoom;

  useEffect(() => {
    if (!isMobile || !menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMenuOpen(false);
    };
    window.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener("keydown", close);
    };
  }, [isMobile, menuOpen]);

  const jumpTo = (event: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    const target = document.getElementById(id);
    if (!target) return;
    event.preventDefault();
    setMenuOpen(false);
    const lenis = (window as Window & { __strideLenis?: { scrollTo: (target: HTMLElement, options?: Record<string, unknown>) => void } }).__strideLenis;
    const label = id === "top" ? "STRIDE MEDIA" : navCopy.items.find((item) => item.id === id)?.label ?? id.replaceAll("-", " ");

    if (prefersReducedMotion()) {
      if (lenis) lenis.scrollTo(target, { offset: -height, immediate: true, force: true });
      else window.scrollTo({ top: Math.max(0, target.offsetTop - height), behavior: "auto" });
      window.history.replaceState(null, "", `#${id}`);
      return;
    }

    if (transition) return;
    const x = event.clientX || window.innerWidth / 2;
    const y = event.clientY || height / 2;
    setTransition({ phase: "enter", label, x, y });
    window.requestAnimationFrame(() => setTransition((current) => current ? { ...current, phase: "cover" } : current));

    window.setTimeout(() => {
      if (lenis) lenis.scrollTo(target, { offset: -height, immediate: true, force: true });
      else window.scrollTo({ top: Math.max(0, target.offsetTop - height), behavior: "auto" });
      window.history.replaceState(null, "", `#${id}`);
      window.requestAnimationFrame(() => setTransition((current) => current ? { ...current, phase: "reveal" } : current));
    }, 470);
    window.setTimeout(() => setTransition(null), 1160);
  };

  useEffect(() => {
    let frame = 0;

    const measure = () => {
      frame = 0;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastScroll.current;
      setLifted(y > 24);
      const nextDirection: 1 | -1 | 0 = delta > 0.5 ? 1 : delta < -0.5 ? -1 : 0;
      if (nextDirection && nextDirection !== direction.current) {
        direction.current = nextDirection;
        directionTravel.current = 0;
      }
      if (nextDirection) directionTravel.current += Math.abs(delta);

      // Accumulated travel prevents tiny trackpad/Lenis oscillations from
      // making the bar flash. Upward intent reveals sooner than downward
      // intent hides, which keeps navigation easy to recover.
      if (menuOpen || y < height * 0.7) setNavHidden(false);
      else if (direction.current === 1 && directionTravel.current > 30) {
        setNavHidden(true);
        directionTravel.current = 0;
      } else if (direction.current === -1 && directionTravel.current > 16) {
        setNavHidden(false);
        directionTravel.current = 0;
      }
      lastScroll.current = y;

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
  }, [height, menuOpen]);

  const light = tone === "light";
  const ink = menuOpen ? color.textOnDark : light ? color.textOnLight : color.textOnDark;
  const inkMuted = light ? hexA(color.textOnLight, 0.72) : hexA(color.textOnDark, 0.64);
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
        background: menuOpen ? color.black : lifted ? hexA(light ? color.bone : color.black, light ? 0.78 : 0.7) : "transparent",
        backdropFilter: lifted ? "blur(18px) saturate(1.2)" : "none",
        WebkitBackdropFilter: lifted ? "blur(18px) saturate(1.2)" : "none",
        transform: navHidden ? `translate3d(0, ${-height}px, 0)` : "none",
        willChange: "transform",
        transition: `transform 680ms cubic-bezier(.16,1,.3,1), background 520ms ${ease.out}, color 360ms ${ease.out}`,
      }}
    >
      {/* Wordmark. No underline: the fill treatment belongs to section links. */}
      <a
        href="#top"
        onClick={(event) => jumpTo(event, "top")}
        style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          gap: space.s,
          paddingRight: isMobile ? 0 : space.xxl,
          textDecoration: "none",
          color: "inherit",
          opacity: navHidden ? 0 : 1,
          transform: navHidden ? "translateY(-8px)" : "translateY(0)",
          transition: "opacity 240ms ease, transform 520ms cubic-bezier(.16,1,.3,1)",
        }}
      >
        <StrideMark size={26} glowing />
        <span style={{ ...typeScale.eyebrow, fontWeight: 500 }}>
          {brand.mark}
        </span>
      </a>

      <nav
        className="stride-nav-links"
        aria-label="Sections"
        style={{
          display: railVisible ? "flex" : "none",
          alignItems: "stretch",
          flex: 1,
          minWidth: 0,
          opacity: navHidden ? 0 : 1,
          transform: navHidden ? "translateY(-8px)" : "translateY(0)",
          pointerEvents: navHidden ? "none" : "auto",
          transition: "opacity 240ms ease, transform 520ms cubic-bezier(.16,1,.3,1)",
        }}
      >
        {navCopy.items.map((item, i) => {
          const done = activeIndex > i;
          const active = activeIndex === i;
          return (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => jumpTo(event, item.id)}
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
        {!railVisible && !isMobile && (
          <button
            type="button"
            className="stride-press"
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
        )}
        {(
          <div
            style={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              padding: 6,
              borderRadius: 16,
              transform: navHidden
                ? isMobile
                  ? "translate3d(0,0,0) scale(.96)"
                  : `translate3d(0, ${height}px, 0) scale(1)`
                : "translate3d(0,0,0) scale(.96)",
              transformOrigin: "right center",
              background: navHidden ? "rgba(8,8,8,0.94)" : "rgba(8,8,8,0)",
              backdropFilter: navHidden ? "blur(20px) saturate(1.25)" : "blur(0px) saturate(1)",
              WebkitBackdropFilter: navHidden ? "blur(20px) saturate(1.25)" : "blur(0px) saturate(1)",
              boxShadow: "none",
              willChange: "transform, background-color",
              transition: [
                "transform 680ms cubic-bezier(.16,1,.3,1)",
                "background-color 520ms cubic-bezier(.16,1,.3,1)",
                "backdrop-filter 520ms cubic-bezier(.16,1,.3,1)",
              ].join(", "),
            }}
          >
            {/* Sound sits beside the CTA, as a pair. It never starts on its
                own — nothing plays until it is clicked. */}
            <SoundButton
              src={soundtrack}
              tone={navHidden ? "dark" : light ? "light" : "dark"}
              size={46}
              style={{ marginRight: 8, marginLeft: isMobile ? 8 : railVisible ? 0 : 8 }}
            />
            {!isMobile && <GlowButton href="#contact">{navCopy.cta}</GlowButton>}
          </div>
        )}
        {isMobile && (
          <button
            type="button"
            className="stride-press"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((v) => !v)}
            style={{
              position: "relative",
              width: 44,
              height: 44,
              padding: 12,
              background: "transparent",
              border: "none",
              cursor: "pointer",
            }}
          >
            <span style={{ position: "absolute", left: 11, right: 11, top: "50%", height: 1.5, background: ink, transform: menuOpen ? "rotate(45deg)" : "translateY(-4px)", transition: `transform 560ms ${ease.out}, background 400ms ${ease.out}` }} />
            <span style={{ position: "absolute", left: 11, right: 11, top: "50%", height: 1.5, background: ink, transform: menuOpen ? "rotate(-45deg)" : "translateY(4px)", transition: `transform 560ms ${ease.out}, background 400ms ${ease.out}` }} />
          </button>
        )}
      </div>

      {/* Collapsed nav: the whole page's progress, since the per-section
          underlines are not on screen to read. */}
      {!railVisible && !navHidden && (
        <span
          aria-hidden="true"
          style={{
            position: "absolute",
            left: 0,
            right: 0,
            bottom: 0,
            height: 1,
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
            // The header's backdrop-filter creates a containing block on
            // mobile browsers, so a fixed child only inherited the header's
            // height. Size the panel explicitly from the header instead.
            position: "absolute",
            top: height,
            left: -layout.pad,
            width: "100vw",
            height: `calc(100dvh - ${height}px)`,
            overflowY: "auto",
            background: color.black,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            gap: space.lg,
            padding: `${space.xl}px ${layout.pad}`,
            zIndex: 1000,
          }}
        >
          {navCopy.items.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={(event) => jumpTo(event, item.id)}
              style={{ ...typeScale.h3, color: color.textOnDark, textDecoration: "none", width: "100%", textAlign: "center" }}
            >
              {item.label}
            </a>
          ))}
        </div>
      )}

      {transition && (
        <div
          aria-live="polite"
          aria-label={`Opening ${transition.label}`}
          style={{
            position: "absolute",
            left: -layout.pad,
            top: 0,
            width: "100vw",
            height: "100dvh",
            zIndex: 3000,
            display: "grid",
            placeItems: "center",
            overflow: "hidden",
            pointerEvents: "all",
            background: color.black,
            clipPath: transition.phase === "enter"
              ? `circle(0 at ${transition.x}px ${transition.y}px)`
              : transition.phase === "cover"
                ? `circle(150vmax at ${transition.x}px ${transition.y}px)`
                : "circle(0 at 50% 50%)",
            transition: transition.phase === "reveal"
              ? `clip-path 680ms cubic-bezier(.16,1,.3,1)`
              : `clip-path 460ms cubic-bezier(.65,0,.35,1)`,
            willChange: "clip-path",
          }}
        >
          <div
            style={{
              display: "grid",
              justifyItems: "center",
              gap: space.md,
              opacity: transition.phase === "cover" ? 1 : 0,
              transform: transition.phase === "cover" ? "translateY(0) scale(1)" : "translateY(10px) scale(.96)",
              transition: `opacity 260ms ${ease.out}, transform 520ms ${ease.out}`,
            }}
          >
            <StrideMark size={72} glowing />
            <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted, letterSpacing: ".12em" }}>{transition.label}</span>
          </div>
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
        transition: `border-color 400ms ${ease.out}, background 400ms ${ease.out}, box-shadow 400ms ${ease.out}`,
      }}
    />
  );
}
