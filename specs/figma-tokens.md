# Figma setup — the tokens the build already uses

Set these up once as Figma variables and text styles. A design built on them
translates to code almost mechanically; a design built on other values means
someone has to decide what each one maps to, and that is where things drift.

Every value below is read straight out of `components/shared/theme.ts`.

---

## Colour variables

| Figma name | Value | Where it goes |
|---|---|---|
| `black` | `#080808` | Page ground on dark sections |
| `ink` | `#111111` | Raised dark surfaces, cards |
| `ink/soft` | `#1A1A1A` | Media wells, insets |
| `white` | `#FFFFFF` | Light section ground, text on dark |
| `grey/50` | `#F4F4F5` | Second light ground (Testimonials) |
| `grey/200` | `#E4E4E7` | Case-study gallery ground |
| `accent` | `#7C3AED` | CTAs, underline fill, numbers, labels |
| `accent/bright` | `#A78BFA` | Glow only — never a fill |
| `accent/deep` | `#4C1D95` | Deep tone in gradients and the 3D mark |
| `text/on-dark` | `#FFFFFF` | |
| `text/on-dark-muted` | `#FFFFFF` at 58% | Secondary text on dark |
| `text/on-light` | `#0A0A0A` | |
| `text/on-light-muted` | `#0A0A0A` at 58% | Secondary text on light |
| `hairline/on-dark` | `#FFFFFF` at 14% | Rules, borders |
| `hairline/on-light` | `#0A0A0A` at 14% | |

**Glow is a shadow, not a colour.** The CTA glow is three stacked effects:
`accent` at 50% as a 1px spread, `accent` at 35% blurred 24, `accent` at 18%
blurred 70. On hover it lifts to `accent/bright`.

---

## Text styles

One family throughout: **Familjen Grotesk**. Weight does the differentiating.
Sizes below are desktop at 1920 / mobile at 390; the build interpolates
between them, so design the two ends and the middle takes care of itself.

| Style | Desktop | Mobile | Weight | Tracking | Use |
|---|---|---|---|---|---|
| `display-lg` | 104 | 44 | 700 | −4.2% | Hero headline, Why Stride words |
| `h1` | 60 | 34 | 600 | −3.5% | Every section headline |
| `h3` | 28 | 21 | 600 | −2% | Card headlines, questions, stats |
| `number-xl` | 132 | 64 | 700 | −5% | 01/02/03, metrics |
| `body-lg` | 19 | 16 | 400 | −0.5% | All running text |
| `eyebrow` | 13 | 12 | 600 | **+8%** | All small text, **uppercase** |

Line heights: display-lg 0.94, h1 1.0, h3 1.15, number-xl 0.8, body-lg 1.6,
eyebrow 1.3.

There are only six. If a design needs a seventh size, that is worth a
conversation rather than a new token — the scale was cut down to six
deliberately.

---

## Spacing

Use only: **4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160**.

The relationships that repeat:

| Gap | Value |
|---|---|
| Eyebrow to headline | 16 |
| Headline to body | 24 |
| Body to CTA | 32 |
| Between cards | 24 |
| Section header to content | 64 |

---

## Frames

| Viewport | Frame width | Side padding | Section padding |
|---|---|---|---|
| Desktop | 1920 | 96 | 160 |
| Laptop | 1440 | 72 | 128 |
| Tablet | 1024 | 48 | 96 |
| Mobile | 390 | 24 | 64 |

Grid: 12 columns, 24 gutter. Nav is 88 tall and fixed, so anything that must
sit below it starts at 88 plus the section padding.

Buttons: 56 tall, 32 side padding, fully rounded, `eyebrow` at weight 600.

---

## What to send back

Per section:

1. **PNG exports at 1920 and 390.** Both — the mobile layout is a real
   decision, not a squeeze, and several sections change structure rather
   than scale.
2. **A note for anything that leaves the tokens** — if a size or gap is
   deliberately off-scale, say so, otherwise it reads as a rounding error.
3. **The motion**, in the format in `how-to-send-references.md`: trigger,
   duration, easing, stagger, distance.

Static frames cannot say what moves. A design without that note gets built
with the motion that is already there, which may not be what you pictured.

---

## What not to spend time on in Figma

- **The 3D mark and the hero object.** They are geometry and lighting in
  code; a flat frame cannot specify them. Design the silhouette, and leave
  the material to the build.
- **Scroll pacing.** How long a pinned section holds is a scroll length in
  code, not a frame height.
- **Placeholder media.** The gradient fills are stand-ins. Draw a box, mark
  it as footage, and it will be swapped for whatever the real clip is.
