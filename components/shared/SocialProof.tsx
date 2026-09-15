import { useState } from "react";
import type { CSSProperties } from "react";
import { color, ease, hexA, space, typeScale } from "./theme";
import { useCanHover } from "./responsive";

/**
 * The client-proof pill: a row of overlapping faces, five stars, and a count.
 *
 * The faces sit on top of each other at rest and fan out under the cursor,
 * so the row reads as one object until it is asked to show who is in it.
 * The stack's width animates along with the spread — without that the block
 * either leaves a gap at rest or pushes the stars sideways on hover.
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
  /** Client photographs. Gaps render as a tinted fill. */
  faces?: string[];
  style?: CSSProperties;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const canHover = useCanHover();
  const expanded = open && canHover;

  const SIZE = 40;
  const overlap = expanded ? SIZE + 6 : SIZE * 0.62;
  const slots = Math.max(5, faces.length);

  return (
    <div
      className={className}
      onPointerEnter={() => setOpen(true)}
      onPointerLeave={() => setOpen(false)}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: space.md,
        padding: `${space.sm}px ${space.lg}px ${space.sm}px ${space.sm}px`,
        borderRadius: 999,
        background: hexA("#FFFFFF", 0.05),
        border: `1px solid ${hexA("#FFFFFF", 0.12)}`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
        ...style,
      }}
    >
      <div
        style={{
          position: "relative",
          height: SIZE,
          width: overlap * (slots - 1) + SIZE,
          transition: `width 420ms ${ease.out}`,
        }}
      >
        {Array.from({ length: slots }, (_, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: i * overlap,
              top: 0,
              width: SIZE,
              height: SIZE,
              borderRadius: "50%",
              overflow: "hidden",
              border: `2px solid ${color.black}`,
              // The accent disc leads the row, as in the reference.
              background:
                i === 0
                  ? color.accent
                  : `linear-gradient(145deg, ${hexA(color.accentBright, 0.5)}, ${color.inkSoft})`,
              transition: `left 420ms ${ease.out}`,
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

      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        <span aria-hidden="true" style={{ letterSpacing: "0.1em", fontSize: 13, lineHeight: 1 }}>
          ★★★★★
        </span>
        <span style={{ ...typeScale.eyebrow, textTransform: "none", color: color.textOnDarkMuted }}>
          <strong style={{ color: color.textOnDark, fontWeight: 600 }}>{count}</strong> {label}
        </span>
      </div>
    </div>
  );
}
