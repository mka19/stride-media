import { addPropertyControls, ControlType } from "framer"
import { useEffect, useRef, useState } from "react";
import { color, hexA, space, typeScale } from "./theme";

/**
 * Calendly, inline.
 *
 * The whole booking flow happens on this page: pick a date, pick a time, fill
 * in name and email, confirm. Nobody is redirected and nothing opens in a new
 * tab. Calendly owns the hard parts — real availability, timezones, the
 * confirmation email, rescheduling and cancellation links — through its own
 * official inline widget, which is the only supported way to do this without
 * a backend.
 *
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │  PASTE YOUR CALENDLY LINK ON THE NEXT LINE. IT IS THE ONLY EDIT.        │
 * └─────────────────────────────────────────────────────────────────────────┘
 */
export const CALENDLY_URL = "https://calendly.com/ayubvideos/30min";

/**
 * Until that constant is a real link, the component renders a panel saying so
 * rather than trying to load it.
 *
 * This is checked rather than left to a second "ready" flag to remember to
 * flip, because a placeholder handed to Calendly does not fail quietly — it
 * loads their 404 inside the card, which looks exactly like a broken embed.
 */
function isPlaceholder(url: string) {
  return !url || !/^https?:\/\/(calendly\.com|.*\.calendly\.com)\//i.test(url.trim());
}

/**
 * Query parameters that come along for the ride and should not.
 *
 * The link people actually copy is rarely the bare event URL — it is whatever
 * was in the Instagram bio, which arrives carrying campaign tags, a Facebook
 * click id and often `month`, which pins the widget to whatever month the
 * link was generated in. A visitor would open the booking calendar already
 * scrolled to a month a year out.
 */
const NOISE = /^(utm_|fbclid$|gclid$|msclkid$|mc_cid$|mc_eid$|_gl$|month$|date$|utm_id$)/i;

/**
 * Build the URL the widget is actually given.
 *
 * Doing this with URL and URLSearchParams rather than string concatenation is
 * not fussiness: the previous version appended "?hide_gdpr_banner=1", which
 * produces a second question mark — and a broken link — the moment anyone
 * pastes a URL that already has a query on it. Which is exactly what the real
 * link turned out to be.
 */
function buildEmbedUrl(
  raw: string,
  colors: { background: string; text: string; primary: string },
) {
  const hex = (c: string) => c.replace("#", "").slice(0, 6);
  try {
    const u = new URL(raw.trim());
    for (const key of [...u.searchParams.keys()]) {
      if (NOISE.test(key)) u.searchParams.delete(key);
    }
    u.searchParams.set("hide_gdpr_banner", "1");
    u.searchParams.set("background_color", hex(colors.background));
    u.searchParams.set("text_color", hex(colors.text));
    u.searchParams.set("primary_color", hex(colors.primary));
    return u.toString();
  } catch {
    return raw;
  }
}

const WIDGET_SRC = "https://assets.calendly.com/assets/external/widget.js";

/**
 * One load of Calendly's script per page, however many embeds are on it.
 *
 * The promise is held at module scope rather than in a ref: two components
 * mounting in the same tick would each see an empty ref, each append a script
 * tag, and Calendly would initialise twice over the same element. Everything
 * after the first mount waits on the same promise.
 */
let widgetPromise: Promise<void> | null = null;

function loadWidget(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.Calendly) return Promise.resolve();
  if (widgetPromise) return widgetPromise;

  widgetPromise = new Promise<void>((resolve, reject) => {
    // A script tag may already be on the page — pasted into Framer's site
    // settings, say — in which case listen to that one instead of adding a
    // second.
    const existing = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SRC}"]`,
    );
    const script = existing ?? document.createElement("script");
    const done = () => resolve();
    script.addEventListener("load", done, { once: true });
    script.addEventListener(
      "error",
      () => {
        // Let a later mount try again rather than caching the failure.
        widgetPromise = null;
        reject(new Error("Calendly widget script failed to load"));
      },
      { once: true },
    );
    if (!existing) {
      script.src = WIDGET_SRC;
      script.async = true;
      document.head.appendChild(script);
    } else if (window.Calendly) {
      done();
    }
  });

  return widgetPromise;
}

export default function CalendlyEmbed({
  /** Overridable so the same component can serve more than one event type. */
  url = CALENDLY_URL,
  /**
   * How tall the widget stands. Calendly's own flow needs real room — the
   * month grid, the times column and then the name/email form all live inside
   * this one box, and anything under about 700px puts its own scrollbar
   * inside the page, which is the worst of both.
   */
  minHeight = 760,
  minHeightMobile = 1040,
  /** Matches the widget to the page instead of its default blue. */
  background = color.black,
  text = color.textOnDark,
  primary = color.accent,
  style,
}: {
  url?: string;
  minHeight?: number;
  minHeightMobile?: number;
  background?: string;
  text?: string;
  primary?: string;
  style?: React.CSSProperties;
}) {
  const host = useRef<HTMLDivElement | null>(null);
  const [failed, setFailed] = useState(false);
  const placeholder = isPlaceholder(url);

  const themed = buildEmbedUrl(url, { background, text, primary });

  useEffect(() => {
    if (placeholder) return;
    const el = host.current;
    if (!el) return;

    let cancelled = false;
    loadWidget()
      .then(() => {
        if (cancelled || !host.current) return;
        // initInlineWidget appends an iframe. On a re-run — a hot reload, or
        // the url prop changing — the old one has to go first or they stack.
        host.current.innerHTML = "";
        window.Calendly?.initInlineWidget({
          url: themed,
          parentElement: host.current,
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });

    return () => {
      cancelled = true;
      if (el) el.innerHTML = "";
    };
  }, [themed, placeholder]);

  const frame: React.CSSProperties = {
    width: "100%",
    // Never wider than its column, whatever the widget does inside it: this
    // is what keeps a phone from getting a sideways scrollbar.
    maxWidth: "100%",
    overflow: "hidden",
    borderRadius: 4,
    background: hexA(color.black, 0.4),
    ...style,
  };

  /*
   * If the script could not load, fall back to the frame it would have made.
   *
   * Calendly's widget.js does one thing: it puts an iframe pointing at the
   * scheduling URL inside the element you give it. So where a page forbids
   * third-party scripts — a sandboxed preview, a strict content policy — the
   * booking flow is still perfectly reachable by making that iframe directly.
   * The visitor gets the same calendar, the same times and the same form; the
   * only thing lost is the widget's event callbacks, which nothing here uses.
   *
   * This matters more than being purist about the official embed: the panel
   * that used to appear instead said "booking is offline", which is a dead
   * end on the one section of the site whose entire job is to take a booking.
   */
  if (failed && !placeholder) {
    return (
      <>
        <style>{`
          .stride-calendly { min-height: ${minHeightMobile}px; }
          @media (min-width: 769px) { .stride-calendly { min-height: ${minHeight}px; } }
        `}</style>
        <iframe
          className="stride-calendly"
          title="Booking calendar"
          src={themed}
          style={{ ...frame, border: "none", display: "block" }}
        />
      </>
    );
  }

  if (placeholder) {
    return (
      <div
        style={{
          ...frame,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: space.md,
          textAlign: "center",
          padding: space.xl,
          minHeight: 420,
          border: `1px dashed ${color.hairlineOnDark}`,
        }}
      >
        <span style={{ ...typeScale.h3, color: color.textOnDark }}>Booking opens here</span>
        <span style={{ ...typeScale.bodyLg, color: color.textOnDarkMuted, maxWidth: "34ch" }}>
          Paste the Calendly link into CALENDLY_URL in CalendlyEmbed.tsx and the booking flow
          appears here.
        </span>
      </div>
    );
  }

  return (
    <>
      {/* Calendly sizes its own iframe to 100% of this element, so the height
          has to come from here. The media query cannot be an inline style. */}
      <style>{`
        .stride-calendly { min-height: ${minHeightMobile}px; }
        @media (min-width: 769px) { .stride-calendly { min-height: ${minHeight}px; } }
      `}</style>
      <div
        ref={host}
        className="stride-calendly calendly-inline-widget"
        data-auto-load="false"
        aria-label="Booking calendar"
        style={frame}
      />
    </>
  );
}

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (opts: {
        url: string;
        parentElement: HTMLElement;
        prefill?: Record<string, unknown>;
        utm?: Record<string, unknown>;
      }) => void;
    };
  }
}

/**
 * @framerSupportedLayoutWidth any
 * @framerSupportedLayoutHeight auto-height
 */

addPropertyControls(CalendlyEmbed, {
  url: { type: ControlType.String, title: "Calendly link", defaultValue: "" },
  minHeight: { type: ControlType.Number, title: "Height (desktop)", defaultValue: 760, min: 500, max: 1400 },
  minHeightMobile: { type: ControlType.Number, title: "Height (mobile)", defaultValue: 1040, min: 600, max: 1600 },
});
