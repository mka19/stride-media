# Stride Media — Framer code components

37 files. Generated from `components/` by `npm run framer` — edit the
source, not these.

## 1. Install the packages

Framer → project menu → **Packages** → add:

    three   gsap   lenis

React and `framer` are already there.

## 2. Paste the files in this order

Framer → **Assets → Code → New File**, name it exactly as listed (no
extension), paste the whole file. Order matters: a file pasted before
something it imports will show an error until the other one exists.

 1. copy
 2. gsap
 3. responsive
 4. SlatCurtain
 5. SmearLabel
 6. styles
 7. surface
 8. theme
 9. useInView
10. CalendlyEmbed  —  needs theme
11. FieldTexture  —  needs theme, responsive, gsap
12. GradientRevealText  —  needs gsap, theme
13. HeroObject  —  needs theme, responsive
14. HoverBadge  —  needs theme, responsive
15. LiquidField  —  needs gsap
16. Marquee  —  needs theme, gsap
17. Preloader  —  needs theme, gsap
18. primitives  —  needs theme, styles, SmearLabel
19. RevealText  —  needs gsap
20. ScrambleText  —  needs useInView, gsap
21. smoothScroll  —  needs gsap
22. SocialProof  —  needs theme, responsive
23. SoundButton  —  needs theme
24. Wordmark  —  needs theme, gsap
25. CaseStudy  —  needs gsap, surface, copy, theme, primitives, GradientRevealText, HoverBadge, SlatCurtain, responsive
26. FAQ  —  needs gsap, copy, theme, responsive, GradientRevealText
27. FinalCTA  —  needs gsap, copy, theme, primitives, GradientRevealText, CalendlyEmbed, responsive
28. Footer  —  needs gsap, copy, theme, primitives, responsive, Wordmark
29. HowItWorks  —  needs gsap, surface, copy, theme, primitives, responsive, FieldTexture, GradientRevealText
30. Nav  —  needs responsive, copy, theme, primitives, SoundButton, surface
31. Problem  —  needs gsap, surface, copy, theme, primitives, responsive, GradientRevealText
32. Results  —  needs gsap, copy, theme, primitives, responsive, useInView, GradientRevealText
33. Solution  —  needs gsap, useInView, responsive, copy, theme, primitives, GradientRevealText
34. Testimonials  —  needs gsap, surface, copy, theme, primitives, GradientRevealText, responsive
35. VideoMosaic  —  needs primitives, theme
36. WhyStride  —  needs gsap, surface, copy, theme, primitives, responsive, HeroObject, GradientRevealText
37. Hero  —  needs gsap, copy, theme, primitives, responsive, GradientRevealText, SocialProof, LiquidField, HeroObject, VideoMosaic

Errors while pasting are expected and clear themselves as the list fills in.

## 3. Put the sections on the page, in order

Nav, Hero, Problem, Solution, HowItWorks, Marquee, CaseStudy, WhyStride,
Marquee, Results, Testimonials, FinalCTA, FAQ, Footer.

Each is full-bleed: set width to **Fill** and height to **Auto**. Do not put
them inside a scrolling frame — they drive the page scroll themselves.

## 4. Turn on smooth scroll — once

Framer → **Site Settings → Custom Code → End of `<body>`**:

    <script type="module">
      import { initSmoothScroll } from "./smoothScroll"
      initSmoothScroll()
    </script>

Once for the whole site. Calling it in more than one place puts two copies of
Lenis on the same scroller and they fight.

## 5. The booking link

`CalendlyEmbed` has the link as `CALENDLY_URL` at the top of the file, and
also as a **Calendly link** property on the component. Either works; the
property wins. Until it is a real calendly.com URL the component says so
rather than loading a 404 inside the card.

## 6. Assets

Every section exposes its media as Framer file properties, so nothing needs a
code edit. Upload to Framer assets and pick them in the properties panel.

| Section | Property |
| --- | --- |
| Hero | Mosaic tiles, Client faces |
| Problem | Background, Card portraits, Sentence tiles |
| Solution | Reel, Poster |
| HowItWorks | Background |
| CaseStudy | Gallery (6), Curtain still |
| Results | Clips |
| Footer | Background |
| Nav | Soundtrack |

Video: MP4 / H.264, muted, 3–5 seconds, under ~2MB. They loop silently.
Stills work in every slot too. Anything left empty falls back to a generated
gradient that looks deliberate.

## Notes

- The sound button never plays on its own. It is silent until clicked.
- `scrollLength` on each section sets how much scroll its sequence takes.
  Longer is slower. They are strings like "420vh".
- The build tag is a `data-build` attribute on the footer, not visible text.
