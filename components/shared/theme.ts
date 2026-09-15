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
 * Trionn's own stack: Neue Haas Grotesk for text, Familjen Grotesk, and
 * Martian Mono for labels. Neue Haas is commercial, so it leads the sans
 * stack and takes over automatically if the licensed webfont is ever added;
 * until then Familjen Grotesk carries both display and text, and both free
 * faces load from Google Fonts in shared/styles.ts.
 */
export const font = {
  display: `"Familjen Grotesk", "Neue Haas Grotesk Display", "Helvetica Neue", Helvetica, Arial, sans-serif`,
  sans: `"Neue Haas Grotesk Display", "Familjen Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  mono: `"Martian Mono", ui-monospace, SFMono-Regular, "SF Mono", Menlo, monospace`,
} as const;

/** Micro-label used above every section headline. */
export const microLabel = {
  fontFamily: font.mono,
  fontSize: "10px",
  letterSpacing: "0.12em",
  textTransform: "uppercase" as const,
  fontWeight: 500,
};

/** Wide grid — 96px page padding at 1920. Clamps down gracefully on phones. */
export const layout = {
  pad: "clamp(20px, 5vw, 96px)",
  maxWidth: "1728px",
  section: "clamp(96px, 12vh, 180px)",
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
