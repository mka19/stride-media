import { useEffect, useRef, useState } from "react";
import type { CSSProperties } from "react";
import { color, ease, hexA } from "./theme";

/**
 * The sound toggle that sits beside the CTA.
 *
 * It never starts on its own. Nothing plays until it is clicked — browsers
 * block autoplay with sound anyway, but more to the point a site that starts
 * playing music at a visitor is a site they close. The icon shows which
 * state it is in, and the bars animate only while a track is actually
 * playing.
 *
 * With no `src` it still toggles, so the control can be placed and styled
 * before the track exists; it simply has nothing to play yet.
 */
export default function SoundButton({
  src,
  size = 44,
  tone = "dark",
  style,
}: {
  /** The track. Without one the button toggles but stays silent. */
  src?: string;
  size?: number;
  /** Surface behind the control. Light surfaces need an ink treatment. */
  tone?: "dark" | "light";
  style?: CSSProperties;
}) {
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const onLight = tone === "light";

  useEffect(() => {
    const el = audioRef.current;
    if (!el || !src) return;
    if (on) {
      el.volume = 0.35;
      void el.play().catch(() => setOn(false));
    } else {
      el.pause();
    }
  }, [on, src]);

  // Stop the audio if the component goes away mid-track.
  useEffect(() => () => audioRef.current?.pause(), []);

  const bar = (x: number, h: number, delay: number) => (
    <rect
      x={x}
      y={(16 - h) / 2}
      width="1.6"
      height={h}
      rx="0.8"
      fill="currentColor"
      style={
        on
          ? { animation: `stride-eq 900ms ${delay}ms ease-in-out infinite`, transformOrigin: "center" }
          : undefined
      }
    />
  );

  return (
    <>
      <button
        type="button"
        className="stride-press"
        aria-pressed={on}
        aria-label={on ? "Mute" : "Play sound"}
        onClick={() => setOn((v) => !v)}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          height: size,
          padding: 0,
          borderRadius: 8,
          cursor: "pointer",
          border: `1px solid ${
            on ? hexA(color.accent, onLight ? 0.45 : 0.3) : hexA(onLight ? color.black : "#FFFFFF", onLight ? 0.18 : 0.14)
          }`,
          background: on
            ? hexA(color.accent, onLight ? 0.12 : 0.18)
            : hexA(onLight ? color.black : "#FFFFFF", onLight ? 0.055 : 0.04),
          color: on ? (onLight ? color.accent : color.accentBright) : hexA(onLight ? color.black : "#FFFFFF", onLight ? 0.76 : 0.65),
          transition: `background ${ease.hoverMs}ms ${ease.hover}, color ${ease.hoverMs}ms ${ease.hover}, border-color ${ease.hoverMs}ms ${ease.hover}, transform ${ease.pressMs}ms ${ease.out}`,
          ...style,
        }}
      >
        <svg width="18" height="16" viewBox="0 0 18 16" fill="none" aria-hidden="true">
          {bar(2, 6, 0)}
          {bar(5.2, 11, 120)}
          {bar(8.4, 16, 240)}
          {bar(11.6, 11, 360)}
          {bar(14.8, 6, 480)}
          {!on && (
            <line
              x1="1"
              y1="15"
              x2="17"
              y2="1"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          )}
        </svg>
      </button>
      {src ? <audio ref={audioRef} src={src} loop preload="none" /> : null}
    </>
  );
}
