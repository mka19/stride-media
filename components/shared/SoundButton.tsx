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
  style,
}: {
  /** The track. Without one the button toggles but stays silent. */
  src?: string;
  size?: number;
  style?: CSSProperties;
}) {
  const [on, setOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

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
          border: `1px solid ${hexA("#FFFFFF", on ? 0.3 : 0.14)}`,
          background: on ? hexA(color.accent, 0.18) : hexA("#FFFFFF", 0.04),
          color: on ? color.accentBright : hexA("#FFFFFF", 0.65),
          transition: `background 380ms ${ease.out}, color 380ms ${ease.out}, border-color 380ms ${ease.out}`,
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
