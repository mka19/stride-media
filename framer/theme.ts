/**
 * Stride Media — design tokens.
 * Single source of truth for colour, type and rhythm. In Framer, paste this
 * file as its own code file and import it from each section component.
 */

export const color = {
  /* Neutral black and grey ground — no warmth in the base. */
  black: "#080808",
  ink: "#111111",
  inkSoft: "#1A1A1A",
  /* Light surfaces: Problem part 2, How It Works, Testimonials */
  bone: "#FFFFFF",
  boneSoft: "#F4F4F5",
  warmNeutral: "#E4E4E7",
  /* Purple accent */
  accent: "#7C3AED",
  accentBright: "#A78BFA",
  /*
   * #7C3AED is 3.5:1 on the near-black ground — fine for a 26px number, under
   * the 4.5:1 floor for 12px label text. Small accent type on dark uses this
   * instead; it is the same hue, lifted until it clears.
   */
  accentOnDark: "#A78BFA",
  accentDeep: "#4C1D95",
  textOnDark: "#FFFFFF",
  textOnDarkMuted: "rgba(255, 255, 255, 0.58)",
  textOnLight: "#0A0A0A",
  textOnLightMuted: "rgba(10, 10, 10, 0.58)",
  hairlineOnDark: "rgba(255, 255, 255, 0.14)",
  hairlineOnLight: "rgba(10, 10, 10, 0.14)",
} as const;

/** Neon treatment for CTAs, stat numbers, hover states, hero headline. */
export const glow = {
  text: `0 0 18px ${hexA(color.accent, 0.55)}, 0 0 54px ${hexA(color.accent, 0.28)}`,
  textSoft: `0 0 28px ${hexA(color.accent, 0.32)}`,
  box: `0 0 0 1px ${hexA(color.accent, 0.5)}, 0 0 24px ${hexA(color.accent, 0.35)}, 0 0 70px ${hexA(color.accent, 0.18)}`,
  boxStrong: `0 0 0 1px ${hexA(color.accentBright, 0.8)}, 0 0 32px ${hexA(color.accentBright, 0.55)}, 0 0 96px ${hexA(color.accent, 0.3)}`,
} as const;

/*
 * One family for everything, weight does the differentiation. Familjen
 * Grotesk is the free face from Trionn's own stack; Neue Haas Grotesk is
 * commercial, so it leads and takes over automatically if the licensed
 * webfont is ever added.
 */
const SANS = `"Neue Haas Grotesk Display", "Familjen Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`;

export const font = {
  sans: SANS,
  /** Kept as an alias so nothing has to special-case display type. */
  display: SANS,
} as const;

/**
 * Type scale. Every size on the site comes from this table — no one-off
 * values. Each token carries its own weight, leading and tracking, so a
 * component spreads the token and adds nothing but colour.
 */
export const typeScale = {
  /**
   * Six tokens, and every size on the site comes from one of them.
   *
   * Leading is set in pixels and paired to its size, and the pair holds its
   * proportion down to the phone end, so a headline has the same colour on a
   * 390 screen as on a 1920 one:
   *
   *   number 115/117    display 96/100    h1 64/72
   *   h3      26/30     body     18/22    eyebrow 12/15
   *
   * Tracking is −1px on the headline sizes. At 18px and under it is 0 —
   * negative tracking closes small type up until it is harder to read, and
   * an uppercase label at 12px suffers most.
   *
   * Weights: medium (500) for statements, regular (400) for everything else.
   */

  /** Hero headline, Why Stride's stacked words, the marquee. */
  displayLg: {
    fontFamily: SANS,
    fontSize: fluid(40, 96),
    fontWeight: 500,
    lineHeight: fluid(42, 100),
    letterSpacing: "-1px",
  },
  /** Every section and sub-section headline, and the About statement. */
  h1: {
    fontFamily: SANS,
    fontSize: fluid(36, 64),
    fontWeight: 500,
    lineHeight: fluid(41, 72),
    letterSpacing: "-1px",
  },
  /** Card headlines, questions, stats — the working headline size. */
  h3: {
    fontFamily: SANS,
    fontSize: fluid(20, 26),
    fontWeight: 400,
    lineHeight: fluid(23, 30),
    letterSpacing: "-1px",
  },
  /** Oversized numerals: 01/02/03 and the case-study metrics. */
  numberXl: {
    fontFamily: SANS,
    fontSize: fluid(56, 115),
    fontWeight: 500,
    lineHeight: fluid(57, 117),
    letterSpacing: "-1px",
  },
  /** All running text. */
  bodyLg: {
    fontFamily: SANS,
    fontSize: fluid(15, 18),
    fontWeight: 400,
    lineHeight: fluid(18, 22),
    // Nothing at 18px or under takes tracking.
    letterSpacing: "0",
  },
  /** Every small label: eyebrows, nav, captions, meta. */
  eyebrow: {
    fontFamily: SANS,
    fontSize: fluid(11, 12),
    fontWeight: 400,
    lineHeight: fluid(14, 15),
    // Nothing at this size takes negative tracking — it closes the caps up.
    letterSpacing: "0",
    textTransform: "uppercase" as const,
  },
} as const;

/**
 * Spacing steps. Nothing on the site uses a gap outside this set.
 */
export const space = {
  xs: 4,
  sm: 8,
  s: 12,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  h: 64,
  hh: 96,
  hhh: 128,
  max: 160,
} as const;

/** The recurring relationships from the spec, so sections don't re-decide. */
export const rhythm = {
  eyebrowToHeadline: 12,
  headlineToBody: 24,
  bodyToCta: space.xl, // 32
  betweenCards: space.lg, // 24
  headerToContent: space.h, // 64
} as const;

/**
 * Big numerals are filled with a gradient rather than a flat accent, so a
 * figure reads as lit from one side instead of as a block of colour. Applied
 * to the stat numbers, the numbered card marks and the metric tallies.
 *
 * `WebkitTextFillColor` is what actually clears the glyph in WebKit; `color`
 * alone leaves the text painted over the gradient. A text-shadow still draws
 * from the glyph outline, so the accent glow survives the transparent fill.
 */
export const numberGradient = {
  // Same reason as the swept headlines: a clipped fill is painted only inside
  // the box, and numberXl's 0.8 line-height leaves the glyph hanging out of it.
  paddingBottom: "0.1em",
  backgroundImage: `linear-gradient(104deg, ${color.accent} 0%, ${color.accentBright} 100%)`,
  WebkitBackgroundClip: "text",
  backgroundClip: "text",
  color: "transparent",
  WebkitTextFillColor: "transparent",
} as const;

/**
 * Bumped on every publish. It is printed in the footer meta row so a stale
 * cached copy can be identified from the page itself rather than argued
 * about — a single HTML file served from one URL caches hard.
 */
export const BUILD = "B94";

/** Micro-label above section headlines — the eyebrow token, nothing else. */
export const microLabel = typeScale.eyebrow;

/** Wide grid — 96px page padding at 1920. Clamps down gracefully on phones. */
/*
 * Side and vertical padding step at the breakpoints in the spec rather than
 * scaling continuously, so they are defined as custom properties in
 * shared/styles.ts and read from here. The fallbacks are the mobile values.
 */
export const layout = {
  pad: "var(--stride-pad, 24px)",
  section: "var(--stride-section, 64px)",
  maxWidth: "1728px",
  gutter: 24,
  columns: 12,
  navHeight: 88,
} as const;

export const ease = {
  /* The strong ease-out. Hand-rolled curves that "look about right" are how
     a page ends up with five easings that almost match; this is the canonical
     one and every transition on the site uses it. */
  out: "cubic-bezier(0.23, 1, 0.32, 1)",
  /* Overshoots and settles — the bento rebalance and other spring moments. */
  spring: "cubic-bezier(0.34, 1.42, 0.64, 1)",
  inOut: "cubic-bezier(0.77, 0, 0.175, 1)",
  /* Hover and colour changes are not entrances — they get the plain curve,
     and they stay inside the 300ms ceiling that keeps a control feeling
     answerable rather than syrupy. */
  hover: "ease",
  hoverMs: 200,
  /* Press feedback: fast enough to read as the button taking the press. */
  pressMs: 150,
  gsapOut: "power3.out",
  gsapInOut: "power2.inOut",
} as const;

/** #RRGGBB + alpha -> rgba() string. */
export function hexA(hex: string, alpha: number): string {
  const h = hex.replace("#", "");
  const n = parseInt(
    h.length === 3
      ? h
          .split("")
          .map((c) => c + c)
          .join("")
      : h,
    16,
  );
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
}

/** Fluid type helper: scales between a phone and a 1920 viewport. */
export function fluid(minPx: number, maxPx: number, minVw = 480, maxVw = 1920) {
  const slope = (maxPx - minPx) / (maxVw - minVw);
  const intercept = minPx - slope * minVw;
  return `clamp(${minPx}px, ${intercept.toFixed(2)}px + ${(slope * 100).toFixed(4)}vw, ${maxPx}px)`;
}
