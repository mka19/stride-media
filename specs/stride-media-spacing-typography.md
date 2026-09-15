# Stride Media — Spacing, Alignment & Typography System
One consistent scale applied across all sections, mapped to how each reference actually uses it.

---

## Base Grid (global, all sections)

- Viewport reference: 1920px wide
- Page side padding: 96px left/right (scale down proportionally on smaller viewports — see breakpoints below)
- Max content width: 1728px (1920 − 96×2)
- Column system: 12-column grid, 24px gutter
- Vertical section padding: 160px top/bottom on desktop (large editorial breathing room, matches Trionn). Reduce to 96px on tablet, 64px on mobile.

**Breakpoints (padding scales down together):**
| Viewport | Side padding | Section vertical padding |
|---|---|---|
| 1920px+ | 96px | 160px |
| 1440px | 72px | 128px |
| 1024px (tablet) | 48px | 96px |
| 768px and below (mobile) | 24px | 64px |

---

## Typography Scale (global tokens — use these exact steps everywhere, no one-off sizes)

| Token | Size (desktop) | Size (mobile) | Weight | Usage |
|---|---|---|---|---|
| `display-xl` | 120px | 48px | 700 | Hero headline, Why Stride opening stacked words |
| `display-lg` | 88px | 40px | 700 | Section-transition headlines (e.g. FAQ big letters, glow-transition text) |
| `h1` | 64px | 36px | 600 | Section headlines (How It Works intro, Case Study headline, Final CTA headline) |
| `h2` | 44px | 28px | 600 | Sub-section headlines (Solution headline, Results headline) |
| `h3` | 28px | 22px | 600 | Card headlines (Problem card headline, testimonial card headline if any) |
| `number-xl` | 140px | 72px | 700 | Oversized numerals (Problem 01/02/03, How It Works step numbers) |
| `body-lg` | 20px | 17px | 400 | Section supporting paragraphs |
| `body` | 16px | 15px | 400 | Card descriptions, testimonial quotes |
| `eyebrow` | 13px | 12px | 600, uppercase, +0.08em tracking | Small labels ("Problem", "Client Results", "Contact Us") |
| `label-sm` | 14px | 13px | 500 | Nav links, stat lines, captions |

**Font:** pick one elegant sans (Trionn-style) for everything — no serif, no second display face. Weight does the differentiation (400/500/600/700), matching the "type-only, single family" anti-slop rule.

---

## Spacing Scale (use these step values everywhere — no arbitrary pixel values)

`4, 8, 12, 16, 24, 32, 48, 64, 96, 128, 160`

- Gap between eyebrow label and headline: 16px
- Gap between headline and supporting paragraph: 24px
- Gap between paragraph and CTA button: 32px
- Gap between cards in a grid/row: 24px (desktop), 16px (mobile)
- Gap between section header block and section content below: 64px

---

## Per-Section Alignment & Sizing (mapped from references, using the tokens above)

### Nav / Header
- Height: 88px
- Logo: `label-sm` weight 600, left-aligned at 96px from edge
- Nav links: `label-sm`, right-aligned, 32px gap between items
- Underline: 1px, sits 6px below each label

### Hero
- Headline: `display-xl`, centered (Phase 1→2 morph text)
- Subheadline: `body-lg`, centered, max-width 640px, 24px below headline
- CTA button: standard button size (see Buttons below), 32px below subheadline
- Video mosaic tiles: 12-column grid, 8px gaps between tiles (tighter than content grid — mosaic reads as texture, not content)

### Problem
- Part 1 paragraph: `body-lg`, max-width 720px, left-aligned, positioned in lower-third of viewport over the background
- Part 2 card: eyebrow `eyebrow` token top-left, sub-label `h3` below it, headline `h1` below that — all left column, 40% width. Image center column, 30% width. Number `number-xl` right column, 30% width, right-aligned. Description `body` below the number.

### Solution / What We Do
- No text-heavy layout — video is the full content. "Scroll for more" indicator: `label-sm`, centered, 48px from bottom edge

### How It Works
- Intro: eyebrow → `h1` headline (24px gap) → `body-lg` paragraph (24px gap), all centered, max-width 800px
- Step sequence: number `number-xl` left-aligned, headline `h2` + description `body-lg` right of number, 48px gap between number and text block
- Closing panel: rotating icon centered, closing line `body-lg` centered 48px below icon

### Case Study
- Headline: `h1`, centered, max-width 900px
- Gallery images: varied sizes (240px–480px wide), diagonal scatter — no fixed grid, but maintain minimum 24px visual clearance between any two images at closest approach
- Caption per image: `label-sm`, bottom-left corner of each image, 12px inset

### Why Stride
- Opening stacked headline: `display-xl`, left-aligned, each word on its own line, 0px line-gap (tight stack, matches Trionn reference)
- 3D object: centered, occupies roughly 40% of viewport height
- Capability labels: `h3` label + `body` description, positioned beside the object (alternating left/right as they cycle, or fixed to one side — pick fixed-right for consistency with Problem's right-aligned numbers)

### Results / Proof
- Section header: eyebrow → `h2` headline (16px gap) → `body-lg` subline (16px gap), left-aligned, max-width 640px
- Cards: fixed width 280px, height 420px (portrait), 24px gap between cards
- Stat overlay on video: `h3` weight 700, top-left inset 16px
- Secondary stat + description: `label-sm` + `body`, below video, 12px gap

### Testimonials
- Cards: fixed width 320px, variable height (content-driven), scattered with minimum 16px clearance at overlap points
- Quote text: `body`, name/handle: `label-sm` weight 600, stat: `h3` weight 700

### Final CTA
- Left column: 45% width. Pill label `eyebrow` → `h1` headline (24px gap) → contact info `body` (48px gap) → button (32px gap)
- Right column: 45% width, rounded card, Calendly embed fills the card with 32px internal padding
- Gutter between columns: 64px

### FAQ
- "FAQ" letters: `display-xl`, spread across full width with generous letter-spacing during intro state
- Accordion: full-width list, max-width 900px, each item 24px vertical padding, question `h3`, answer `body-lg`, 16px gap between question and expanded answer

### Footer
- Illustration: centered, occupies roughly 35% of viewport height
- Brand name: `h2`, centered below illustration, 32px gap
- Contact/links row: `label-sm`, centered, 16px gap from brand name, items separated by 32px

---

## Buttons (global)
- Height: 56px
- Horizontal padding: 32px
- Text: `label-sm` weight 600, uppercase optional (match reference — Norvin uses uppercase for CTA buttons)
- Primary button: ruby-red fill with neon glow (box-shadow blur ~24px at low opacity in accent color), white text
- Secondary/ghost button: transparent fill, 1px border in accent color, accent-colored text

---

## Consistency Checklist (before considering the build "done")
- [ ] No font size used anywhere outside the token table above
- [ ] No spacing value used anywhere outside the 4/8/12/16/24/32/48/64/96/128/160 scale
- [ ] All section headlines use the same weight for the same token (e.g. every `h1` is weight 600, nowhere is an `h1` accidentally 700)
- [ ] Eyebrow labels are styled identically everywhere (same size, tracking, case, color)
- [ ] Numbered elements (Problem, How It Works) use the same `number-xl` token and same right/left alignment convention
- [ ] Side padding is 96px on every section at desktop width — nothing bleeds edge-to-edge except intentional full-bleed moments (Solution's expanded video, Hero's mosaic background)
- [ ] Button sizing/padding is identical across every CTA on the site
