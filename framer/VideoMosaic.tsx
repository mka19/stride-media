import { useState } from "react";
import { MediaTile } from "./primitives";
import { color, ease, hexA } from "./theme";

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


/**
 * How much a tile swells or gives way, as a scale factor.
 *
 * This used to be a flex-grow weight, and animating flex-grow is what made
 * the hero stutter: every frame of the transition re-ran layout for all
 * forty-eight cells, and layout is the one thing that cannot be handed to the
 * GPU. The grid is fixed now and the push is a transform, so the same read —
 * one tile coming forward, its neighbours easing back — costs a composite
 * instead of a full layout pass.
 */
function swell(dCol: number, dRow: number, hovered: boolean) {
  if (!hovered) return 1;
  const d = Math.max(dCol, dRow);
  if (d === 0) return 1.22;
  if (d === 1) return 0.94;
  if (d === 2) return 0.98;
  return 1;
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
  // Touch fires a hover on tap and then leaves it stuck on the tile the
  // finger last touched, so the push is for real pointers only.
  const pointer =
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
  /* Transform and opacity only, and a single flat deceleration: a curve that
     overshoots and comes back doubles the number of composited frames for the
     same read. */
  const transition = `transform 620ms ${ease.out}`;

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
            flexGrow: 1,
            flexBasis: 0,
            minHeight: 0,
          }}
        >
          {Array.from({ length: columns }, (_, col) => {
            const i = row * columns + col;
            const isHovered = hover?.col === col && hover?.row === row;
            return (
              <div
                key={col}
                onMouseEnter={() => interactive && pointer && setHover({ col, row })}
                style={{
                  position: "relative",
                  flexGrow: 1,
                  flexBasis: 0,
                  minWidth: 0,
                  zIndex: isHovered ? 2 : 1,
                  transform: `scale(${swell(
                    hover ? Math.abs(col - hover.col) : 99,
                    hover ? Math.abs(row - hover.row) : 99,
                    hover !== null,
                  )})`,
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
