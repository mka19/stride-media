import { useState } from "react";
import type { CSSProperties } from "react";
import { color, ease, hexA, space, typeScale } from "./theme";
import { useBreakpoint, useCanHover } from "./responsive";

/**
 * The client-proof row: a run of overlapping faces, a rating, and a count.
 *
 * The faces sit on top of each other at rest and fan out under the cursor,
 * so the row reads as one object until it is asked to show who is in it.
 * The stack's own width animates with the spread — without that the row
 * either leaves a gap at rest or shoves the rating sideways on hover.
 *
 * No panel behind it. A bordered pill on top of the hero's mosaic read as a
 * component borrowed from somewhere else; the site states things on the
 * ground they sit on, and this follows that.
 */
export default function SocialProof({
  count,
  label,
  faces = [],
  style,
  className,
}: {
  /** e.g. "115+" */
  count: string;
  /** e.g. "happy clients" */
  label: string;
  /** Client photographs. Gaps render as a tinted disc with a hairline ring. */
  faces?: string[];
  style?: CSSProperties;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const canHover = useCanHover();
  const mobile = useBreakpoint() === "mobile";
  const expanded = open && canHover;

  const SIZE = 36;
  const step = expanded ? SIZE + 8 : SIZE * 0.58;
  const slots = Math.max(5, faces.length);

  return (
    <div
      className={className}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      style={{
        display: "inline-flex",
        flexDirection: mobile ? "column" : "row",
        alignItems: mobile ? "center" : "center",
        justifyContent: "center",
        gap: mobile ? space.sm : space.md,
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          height: SIZE,
          width: step * (slots - 1) + SIZE,
          transition: `width 460ms ${ease.out}`,
        }}
      >
        {Array.from({ length: slots }, (_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: i * step,
              top: 0,
              width: SIZE,
              height: SIZE,
              borderRadius: "50%",
              overflow: "hidden",
              // A hairline ring in the site's own weight, not a heavy stroke.
              boxShadow: `0 0 0 1px ${hexA("#FFFFFF", 0.22)}`,
              background: `linear-gradient(150deg, ${hexA(color.accentBright, 0.3)}, ${hexA(color.accentDeep, 0.55)})`,
              transition: `left 460ms ${ease.out}`,
              zIndex: slots - i,
            }}
          >
            {faces[i] ? (
              <img
                src={faces[i]}
                alt=""
                style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
              />
            ) : null}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: space.s }}>
        <span style={{ display: "inline-flex", gap: 3 }} aria-hidden="true">
          {Array.from({ length: 5 }, (_, i) => (
            <svg key={i} width="13" height="13" viewBox="0 0 24 24" fill={color.accentBright}>
              <path d="M12 2.5l2.9 6.05 6.6.86-4.85 4.6 1.23 6.54L12 17.4l-5.88 3.15 1.23-6.54L2.5 9.41l6.6-.86L12 2.5z" />
            </svg>
          ))}
        </span>
        <span style={{ ...typeScale.eyebrow, color: color.textOnDarkMuted }}>
          <span style={{ color: color.textOnDark }}>{count}</span> {label}
        </span>
      </div>
    </div>
  );
}
