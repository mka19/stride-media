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

export type MosaicTile = { src?: string; caption?: string; views?: string; href?: string };


/**
 * Weights: the hovered track takes the space and its neighbours give it up.
 *
 * This is a real push — the tile grows and the ones beside it compress — so
 * it has to be flex-grow rather than a transform: a scaled tile overlaps its
 * neighbours instead of displacing them, which is a different effect. The
 * cost is that every frame of the transition re-runs layout for all
 * forty-eight cells, so the transition is kept short and each cell is a
 * containment boundary, which keeps that layout work inside the tile.
 */
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
  onHoverChange,
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
  onHoverChange?: (hovered: boolean) => void;
}) {
  const [hover, setHover] = useState<{ col: number; row: number } | null>(null);

  // Offset every row and the second half of wide layouts so the same reel
  // never forms a repeated vertical or horizontal strip. The source set can
  // be smaller than the mosaic, but the composition should still feel varied.
  const tileAt = (row: number, col: number) => {
    if (!tiles.length) return {};
    const wideOffset = Math.floor(col / Math.max(1, tiles.length)) * 3;
    return tiles[(col + row * 2 + wideOffset) % tiles.length];
  };
  // Touch fires a hover on tap and then leaves it stuck on the tile the
  // finger last touched, so the push is for real pointers only.
  const pointer =
    typeof window !== "undefined" &&
    window.matchMedia?.("(hover: hover) and (pointer: fine)").matches;
  /* One flat deceleration, and shorter than it was: a curve that overshoots
     and comes back doubles the number of frames the grid spends being
     re-measured, and so does a long one. */
  const transition = `flex-grow 420ms ${ease.out}`;

  return (
    <div
      aria-label="Featured Stride reels"
      onMouseLeave={() => { setHover(null); onHoverChange?.(false); }}
      style={{
        position: "absolute",
        inset: 0,
        display: "flex",
        flexDirection: "column",
        gap,
        padding: gap,
        overflow: "hidden",
        background: "#070609",
        opacity,
        pointerEvents: interactive ? "auto" : "none",
      }}
    >
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: "8% 4%",
          background: `radial-gradient(circle at 22% 42%, ${hexA(color.accentBright,.34)}, transparent 34%), radial-gradient(circle at 76% 58%, ${hexA(color.accent,.3)}, transparent 38%), radial-gradient(circle at 52% 18%, ${hexA(color.accentDeep,.24)}, transparent 32%)`,
          filter: "blur(54px)",
          transform: "scale(1.12)",
          pointerEvents: "none",
        }}
      />
      {Array.from({ length: rows }, (_, row) => (
        <div
          key={row}
          style={{
            display: "flex",
            gap,
            flexGrow: weight(row, hover?.row ?? null),
            flexBasis: 0,
            minHeight: 0,
            position: "relative",
            zIndex: 1,
            transition,
          }}
        >
          {Array.from({ length: columns }, (_, col) => {
            const i = row * columns + col;
            const isHovered = hover?.col === col && hover?.row === row;
            const tile = tileAt(row, col);
            const tileContent = (
              <>
                <MediaTile
                  src={tile.src}
                  seed={i + 3}
                  play={active}
                  radius={6}
                  style={{ position: "absolute", inset: 0 }}
                />
                <div
                  className="hero-liquid-field"
                  aria-hidden="true"
                  style={{
                    position: "absolute",
                    inset: 0,
                    opacity: isHovered ? 0 : 1,
                    background: `radial-gradient(90% 120% at ${18 + (i * 17) % 68}% ${16 + (i * 29) % 62}%, ${hexA(color.accentBright,.72)} 0%, transparent 52%), radial-gradient(110% 90% at ${82 - (i * 13) % 62}% ${80 - (i * 19) % 58}%, ${hexA(color.accentDeep,.86)} 0%, transparent 58%), linear-gradient(${125 + (i * 23) % 110}deg, #07070a, #24103f 52%, #080808)`,
                    transition: `opacity 520ms ${ease.out}`,
                    animationDelay: `${-(i % 8) * .7}s`,
                  }}
                />
                <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `linear-gradient(180deg, ${hexA(color.black,.12)}, ${hexA(color.black,isHovered ? .7 : .22)})` }} />
                <span className="hero-tile-views" style={{ position: "absolute", left: 12, top: 11, color: "#fff", fontSize: "clamp(17px, 1.25vw, 24px)", lineHeight: 1, letterSpacing: "-.025em", fontWeight: 650, textShadow: "0 2px 16px rgba(0,0,0,.9)" }}>{tile.views}</span>
                <span style={{ position: "absolute", left: 12, right: 12, bottom: 11, display: "flex", justifyContent: "space-between", gap: 12, color: "#fff", fontSize: 12, lineHeight: 1.25, fontWeight: 500, opacity: isHovered ? 1 : 0, transform: `translateY(${isHovered ? 0 : 8}px)`, transition: `opacity 320ms ease, transform 420ms ${ease.out}` }}><span>{tile.caption}</span><span aria-hidden="true">↗</span></span>
              </>
            );
            const frameStyle = {
              position: "relative" as const,
              flexGrow: weight(col, hover?.col ?? null),
              flexBasis: 0,
              minWidth: 0,
              contain: "layout paint" as const,
              transition,
              borderRadius: 6,
              overflow: "hidden",
              border: `1px solid ${hexA(color.accentBright, isHovered ? .5 : .14)}`,
              boxShadow: isHovered ? `0 0 0 1px ${hexA(color.accentBright,.5)}, 0 20px 64px ${hexA(color.accent,.34)}` : `0 10px 34px ${hexA(color.accentDeep,.2)}, 0 0 24px ${hexA(color.accent,.1)}`,
            };
            return tile.href ? (
              <a
                key={col}
                href={tile.href}
                target="_blank"
                rel="noreferrer"
                aria-label={`${tile.caption}, ${tile.views}. Open on Instagram`}
                onMouseEnter={() => { if (interactive && pointer) { setHover({ col, row }); onHoverChange?.(true); } }}
                onFocus={() => { if (interactive) { setHover({ col, row }); onHoverChange?.(true); } }}
                onBlur={() => { setHover(null); onHoverChange?.(false); }}
                style={frameStyle}
              >
                {tileContent}
              </a>
            ) : (
              <div key={col} onMouseEnter={() => { if (interactive && pointer) { setHover({ col, row }); onHoverChange?.(true); } }} style={frameStyle}>{tileContent}</div>
            );
          })}
        </div>
      ))}
    </div>
  );
}
