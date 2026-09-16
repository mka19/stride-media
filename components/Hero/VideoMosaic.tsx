import { useState } from "react";
import { MediaTile } from "../shared/primitives";
import { color, ease, hexA } from "../shared/theme";

/**
 * Google-Flow-style video mosaic — the hero's phase-2 background, and the
 * surface for phase 3's bento push.
 *
 * Layout is nested flex (a column of rows, each row a run of tiles) rather
 * than CSS grid, because `flex-grow` transitions are reliable everywhere
 * while animated `grid-template-columns` is not. Hovering a tile grows its
 * row and its column weight; every other row and column gives up the space
 * proportionally, so neighbours compress instead of the layout jumping. The
 * long ease is the whole point of the effect — nothing snaps.
 */

export type MosaicTile = { src?: string; caption?: string };


/** Weights: hovered track expands, its immediate neighbours take the hit. */
function weight(index: number, hovered: number | null) {
  if (hovered === null) return 1;
  const d = Math.abs(index - hovered);
  if (d === 0) return 2.05;
  if (d === 1) return 0.72;
  return 0.86;
}

export default function VideoMosaic({
  tiles = [],
  active = true,
  interactive = true,
  opacity = 1,
  gap = 10,
  columns = 5,
  rows = 3,
}: {
  /** Real client footage when available; empty entries render as cinematic fills. */
  tiles?: MosaicTile[];
  /** Videos only play while the hero is on screen. */
  active?: boolean;
  /** Hover push is switched on once the mosaic has finished arriving. */
  interactive?: boolean;
  opacity?: number;
  gap?: number;
  /** Tablet thins the grid; a phone gets a single quiet backdrop tile. */
  columns?: number;
  rows?: number;
}) {
  const [hover, setHover] = useState<{ col: number; row: number } | null>(null);

  const cells = Array.from({ length: columns * rows }, (_, i) => tiles[i] ?? {});
  /* Not a spring. Animating flex-grow re-runs layout for every cell on every
     frame, and a curve that overshoots and comes back doubles the number of
     frames where the whole grid is being re-measured — which is where the
     jerk came from. A long, flat deceleration does the same job for one
     pass instead of two. */
  const transition = `flex-grow 900ms ${ease.out}`;

  return (
    <div
      aria-hidden="true"
      onMouseLeave={() => setHover(null)}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        gap,
        padding: gap,
        opacity,
        pointerEvents: interactive ? "auto" : "none",
      }}
    >
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          style={{
            display: "flex",
            gap,
            flexGrow: weight(row, hover?.row ?? null),
            flexBasis: 0,
            minHeight: 0,
            transition,
          }}
        >
          {Array.from({ length: columns }, (_, col) => {
            const i = row * columns + col;
            const isHovered = hover?.col === col && hover?.row === row;
            return (
              <div
                key={col}
                onMouseEnter={() => interactive && setHover({ col, row })}
                style={{
                  position: "relative",
                  flexGrow: weight(col, hover?.col ?? null),
                  flexBasis: 0,
                  minWidth: 0,
                  transition,
                }}
              >
                <MediaTile
                  src={cells[i].src}
                  caption={isHovered ? cells[i].caption : undefined}
                  seed={i + 3}
                  play={active}
                  radius={6}
                  style={{
                    position: "absolute",
                    inset: 0,
                    boxShadow: isHovered
                      ? `0 0 0 1px ${hexA(color.accent, 0.55)}, 0 18px 60px ${hexA(color.black, 0.6)}`
                      : "none",
                    transition: `box-shadow 700ms ${ease.out}`,
                  }}
                >
                  {/* Unhovered tiles sit back behind a wash so the headline
                      keeps the foreground; the hovered one clears. */}
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: hexA(color.black, isHovered ? 0.12 : 0.52),
                      transition: `background 700ms ${ease.out}`,
                    }}
                  />
                </MediaTile>
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
