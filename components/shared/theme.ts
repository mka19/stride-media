/**
 * Stride Media — design tokens.
 * Single source of truth for colour, type and rhythm. In Framer, paste this
 * file as its own code file and import it from each section component.
 */

export const color = {
  /* Warm rich black — the base. Never a cold blue-black. */
  black: "#0B0807",
  ink: "#120D0C",
  inkSoft: "#1A1312",
  /* Light surfaces used by Problem pt.2, How It Works intro, Why Stride, Testimonials */
  bone: "#F4F0EA",
  boneSoft: "#EAE4DB",
  warmNeutral: "#D8CEC2",
  /* Ruby / crimson accent */
  ruby: "#E01535",
  rubyBright: "#FF2E4D",
  rubyDeep: "#8E0A20",
  textOnDark: "#F6F1EC",
  textOnDarkMuted: "rgba(246,241,236,0.56)",
  textOnLight: "#141010",
  textOnLightMuted: "rgba(20,16,16,0.56)",
  hairlineOnDark: "rgba(246,241,236,0.14)",
  hairlineOnLight: "rgba(20,16,16,0.14)",
} as const;

/** Neon treatment for CTAs, stat numbers, hover states, hero headline. */
export const glow = {
  text: `0 0 18px ${hexA(color.ruby, 0.55)}, 0 0 54px ${hexA(color.ruby, 0.28)}`,
  textSoft: `0 0 28px ${hexA(color.ruby, 0.32)}`,
  box: `0 0 0 1px ${hexA(color.ruby, 0.5)}, 0 0 24px ${hexA(color.ruby, 0.35)}, 0 0 70px ${hexA(color.ruby, 0.18)}`,
  boxStrong: `0 0 0 1px ${hexA(color.rubyBright, 0.8)}, 0 0 32px ${hexA(color.rubyBright, 0.55)}, 0 0 96px ${hexA(color.ruby, 0.3)}`,
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
  /** Hero headline, Why Stride's stacked words. */
  displayLg: {
    fontFamily: SANS,
    fontSize: fluid(44, 104),
    fontWeight: 700,
    lineHeight: 0.94,
    letterSpacing: "-0.042em",
  },
  /** Every section and sub-section headline. */
  h1: {
    fontFamily: SANS,
    fontSize: fluid(34, 60),
    fontWeight: 600,
    lineHeight: 1.0,
    letterSpacing: "-0.035em",
  },
  /** Card headlines, questions, stats — the working headline size. */
  h3: {
    fontFamily: SANS,
    fontSize: fluid(21, 28),
    fontWeight: 600,
    lineHeight: 1.15,
    letterSpacing: "-0.02em",
  },
  /** Oversized numerals: 01/02/03 and the case-study metrics. */
  numberXl: {
    fontFamily: SANS,
    fontSize: fluid(64, 132),
    fontWeight: 700,
    lineHeight: 0.8,
    letterSpacing: "-0.05em",
  },
  /** All running text. */
  bodyLg: {
    fontFamily: SANS,
    fontSize: fluid(16, 19),
    fontWeight: 400,
    lineHeight: 1.6,
    letterSpacing: "-0.005em",
  },
  /** Every small label: eyebrows, nav, captions, meta. */
  eyebrow: {
    fontFamily: SANS,
    fontSize: fluid(12, 13),
    fontWeight: 600,
    lineHeight: 1.3,
    letterSpacing: "0.08em",
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
  eyebrowToHeadline: space.md, // 16
  headlineToBody: space.lg, // 24
  bodyToCta: space.xl, // 32
  betweenCards: space.lg, // 24
  headerToContent: space.h, // 64
} as const;

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
  /* Elegant, never snappy. Used for every reveal and the bento push. */
  out: "cubic-bezier(0.22, 1, 0.36, 1)",
  /* Overshoots and settles — the bento rebalance and other spring moments. */
  spring: "cubic-bezier(0.34, 1.42, 0.64, 1)",
  inOut: "cubic-bezier(0.65, 0, 0.35, 1)",
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
