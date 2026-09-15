# Stride Media — Framer code components (B62)

35 files. Paste them in the order below: each one only imports files above
it, so nothing is ever missing when you paste it.

## Before you paste anything

Framer → **Assets → npm** and add these three packages:

    gsap
    three
    lenis

## Paste order

Framer → **Assets → Code → New File**, name it exactly as listed (no `.tsx`
in the name — Framer adds it), and paste the file's contents.

**1. Tokens and plumbing** — no imports of their own, so these go first.

    theme        copy        styles       gsap
    surface      responsive  useInView    smoothScroll

**2. Shared pieces** — used by the sections.

    primitives   SmearLabel  SoundButton  SocialProof
    GradientRevealText       RevealText   ScrambleText
    Marquee      HoverBadge  SlatCurtain  LiquidField
    FieldTexture VideoMosaic HeroObject   Wordmark

**3. The sections** — these are the components you place on the canvas.

    Nav          Hero        Problem      Solution
    HowItWorks   CaseStudy   WhyStride    Results
    Testimonials FinalCTA    FAQ          Footer

## Putting the page together

On the canvas, stack the twelve section components in this order, each one
full width:

    Nav · Hero · Problem · Solution · HowItWorks · Marquee
    CaseStudy · WhyStride · Marquee · Results · Testimonials
    FinalCTA · FAQ · Footer

Nav is `position: fixed` in its own code, so place it once at the top and
leave it out of the flow.

`Marquee` appears twice, with `items` set from the two lists in `copy` —
`marquee.process` after How It Works, `marquee.outcome` after Why Stride.

## Smooth scroll

`smoothScroll` sets up Lenis. Call it **once** for the whole page, from an
Overrides file or from a wrapper component — not from each section, or
several instances of Lenis fight over the same scroller.

```tsx
import { useEffect } from "react"
import { initSmoothScroll } from "https://framer.com/m/smoothScroll"

export function withSmoothScroll(Component): ComponentType {
    return (props) => {
        useEffect(() => initSmoothScroll(), [])
        return <Component {...props} />
    }
}
```

## Your footage

Every section takes its media as a property, and each one shows a generated
fill until you give it something. Select the component on the canvas and use
the right-hand panel:

| Component      | Property       | What goes in it                         |
| -------------- | -------------- | --------------------------------------- |
| `Hero`         | Tiles          | the mosaic behind the headline          |
| `Hero`         | Client Faces   | photographs for the proof row           |
| `Problem`      | Background     | the film behind the About chapter       |
| `Problem`      | Card Media     | one clip per pain point                 |
| `Problem`      | Object Media   | the objects inline in the statement     |
| `Solution`     | Video          | the film that grows to full screen      |
| `HowItWorks`   | Background     | the ground the steps fly through        |
| `CaseStudy`    | Gallery        | the plates, in order                    |
| `Results`      | Clips          | the reels in the carousel               |
| `Footer`       | Background     | the film behind the wordmark            |
| `Nav`          | Soundtrack     | the track the sound button plays        |

## Still to fill in

- `FinalCTA` → **Calendly URL**, and switch **Calendly live** on once it works
- `copy` → `[Client]`, `[Client Name]`, `[City]` and the phone number
- `primitives` → `StrideMark` is a placeholder mark
