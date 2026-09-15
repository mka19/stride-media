# Working directly in Framer

Skipping Figma is the right call here. Figma would mean designing it once,
then rebuilding it in Framer anyway. Framer is the real thing, so design in
the real thing.

The split: **you own layout, type and spacing on the canvas. The code
components own anything that moves.**

---

## Step 1 — Paste the code package

Everything is in `framer/` in this repo, with the paste order in
`framer/README.md`. Do that first: the page is assembled from those
components, so there is nothing to lay out until they exist.

Short version: add `gsap`, `three` and `lenis` from the npm panel, then
create a code file per file in `framer/`, working down the order in that
README.

---

## Step 2 — Set up styles so the canvas matches the code

In Framer, create Color Styles and Text Styles from
`specs/figma-tokens.md`. Same values, and Framer names them the same way
Figma does.

This matters more than it sounds. Anything you add on the canvas later —
a new section, a stray heading — picks up a style instead of a one-off
value, and the page stays consistent with the components around it.

---

## Step 3 — Build the page

Drop the sections in order, full width, auto height:

```
Nav · Hero · Problem · Solution · HowItWorks · CaseStudy
WhyStride · Results · Testimonials · FinalCTA · FAQ · Footer
```

Give each section frame its **id**, or the nav's progress underlines have
nothing to measure:

```
top · problem · what-we-do · how-it-works · case-study · results · faq · contact
```

Then apply the smooth-scroll override to the page frame, once — the snippet
is in `framer/README.md`.

---

## What to design on the canvas, and what to leave alone

**Design freely on the canvas:**

- **Final CTA** — it is a static layout plus the Calendly embed. Rebuild it
  natively if you prefer; nothing about it needs code.
- **Any new section** you decide to add.
- Spacing between sections, page background, anything global.

**Leave to the code components:**

| Section | Why |
|---|---|
| Hero | Three.js object, the dissolve, the hover-push mosaic |
| Problem | Pinned slot that cycles three states in place |
| Solution | Frame that scrubs open to full bleed |
| How It Works | Canvas field, pinned step sequence |
| Case Study | Diagonal parallax with per-plate depth |
| Why Stride | 3D centrepiece, letter scatter, cycling labels |
| Results | Dragging ticker with momentum |
| Testimonials | Scroll-driven scatter with elastic settle |
| FAQ | Letters parking, accordion |
| Footer | Wordmark dissolving under the cursor |
| Nav | Per-section scroll-progress underlines |

Framer's own effects cannot do these. They are not a stubborn choice — the
motion is the reason the site reads the way it does.

---

## Changing things without touching code

**Media and pacing** are property controls on each section. Select it on the
canvas and the panel gives you: videos and images, Calendly URL and its live
switch, and scroll lengths.

**Scroll length is your pacing dial.** `420vh` means the section is a bit
over four screens tall and the pinned frame holds for that distance. Shorten
it, the sequence runs faster. Lengthen it, it holds longer. It is the single
most useful thing to adjust once you are looking at the real page.

**Copy** lives in `copy.ts`. Edit it there and every section updates
together — it is one file, and sections share strings deliberately.

---

## Sending changes back to me

Screenshot, plus one line naming the component and what should differ:

```
Component: Problem
Screenshot attached.
Change: the portrait should be 40% of the width, not 30%, and the number
        should sit above the description rather than opposite it.
```

For motion, use the template in `how-to-send-references.md`.

If you rebuild a section natively on the canvas and want it in code
instead, send the screenshot and say so — that is a straightforward port,
and it means the section stops depending on canvas edits.

---

## One thing to watch

If you add any other smooth-scroll plugin or a Framer scroll effect that
takes over the scroller, turn one of them off. Two smooth scrollers fight
every frame, and every pinned section on the site desyncs at once.
