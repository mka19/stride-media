import { useRef, type ReactNode } from "react";
import { color, ease, hexA, space, typeScale } from "./theme";
import { useCanHover } from "./responsive";

/**
 * A round badge that appears under the cursor while it is over the frame,
 * and follows it.
 *
 * Position is written straight to the element's transform on pointermove
 * rather than held in state: the cursor fires a lot of events, and a React
 * render per event is both wasteful and a frame behind the pointer.
 *
 * It renders nothing at all where a pointer cannot hover, rather than
 * rendering and hiding — on touch there is no cursor for it to follow, and
 * a badge that never appears is just markup.
 */
export default function HoverBadge({
  children,
  top,
  size = 132,
}: {
  /** The bold line. */
  children: ReactNode;
  /** The small italic line above it. */
  top?: string;
  size?: number;
}) {
  const badge = useRef<HTMLDivElement | null>(null);
  const canHover = useCanHover();

  if (!canHover) return null;

  const move = (e: React.PointerEvent<HTMLDivElement>) => {
    const el = badge.current;
    if (!el) return;
    const box = e.currentTarget.getBoundingClientRect();
    el.style.transform = `translate3d(${e.clientX - box.left - size / 2}px, ${
      e.clientY - box.top - size / 2
    }px, 0) scale(var(--badge-scale, 0))`;
  };

  const show = (on: boolean) => (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.style.setProperty("--badge-scale", on ? "1" : "0");
  };

  return (
    <div
      onPointerMove={move}
      onPointerEnter={show(true)}
      onPointerLeave={show(false)}
      style={{
        position: "absolute",
        inset: 0,
        cursor: "pointer",
        ["--badge-scale" as string]: 0,
      }}
    >
      <div
        ref={badge}
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: size,
          height: size,
          borderRadius: "50%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: space.xs,
          textAlign: "center",
          pointerEvents: "none",
          background: hexA(color.black, 0.72),
          backdropFilter: "blur(6px)",
          WebkitBackdropFilter: "blur(6px)",
          color: color.textOnDark,
          transform: "translate3d(0, 0, 0) scale(var(--badge-scale, 0))",
          transition: `scale 420ms ${ease.spring}`,
          willChange: "transform",
        }}
      >
        {top && (
          <span
            style={{
              ...typeScale.eyebrow,
              textTransform: "none",
              letterSpacing: "0.01em",
              fontStyle: "italic",
              fontWeight: 400,
              opacity: 0.8,
            }}
          >
            {top}
          </span>
        )}
        <span style={{ ...typeScale.h3, lineHeight: 1.05, maxWidth: size - 28 }}>{children}</span>
      </div>
    </div>
  );
}
