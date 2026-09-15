# Stride Media — Website Build Spec
*Master brief for Claude Code. Build in Framer Code Components (React/Three.js/GSAP as needed).*

---

## 1. Brand Context

Stride Media is a small, full-service content agency using AI to build personal brands for entrepreneurs. Currently serving real estate agents, expanding to all entrepreneur types (coaches, founders, creators).

**Services:** Strategy, content calendar, video scripting, AI-powered video production, editing — end to end, no filming required by the client.

**Pain points solved:** lack of recognition/visibility, scripts that don't work, low engagement, inconsistent delivery from other agencies, weak positioning.

**Differentiators:**
- AI-powered speed without sacrificing quality
- Full-service (strategy → delivery), not piecemeal
- Engagement-focused scripts, not just pretty content
- No filming required
- Personal brand positioning angle
- Small, nimble, high-touch

**Tone:** Professional + trendy + a little playful. Never overhype the "AI" angle — focus on results and confidence for the entrepreneur.

---

## 2. Visual Direction (global)

- **Feel:** Luxury/premium AI content studio — cinematic, editorial. Explicitly NOT tech/Web3/SaaS-dashboard.
- **Base mode:** Dark, warm rich black (not cold tech-black)
- **Accent color:** Ruby/crimson red, with a **glowing neon treatment** on CTAs, key stat numbers, hover states, and a subtle glow behind the hero headline
- **Typography/layout:** Trionn-style — large editorial sections, generous whitespace, asymmetric hero, refined micro-labels
- **Motion:** Smooth fades, subtle parallax, elegant reveals. No glitch/scan-line/dashboard-style animation anywhere.
- **Imagery:** Abstract/cinematic visuals, not literal stock or dashboard graphics
- **Grid:** Wide grid, 96px page padding at 1920px viewport width
- **Numbered-step motif:** Recurs across Problem, How It Works, and Case Study sections — consistent visual language

---

## 3. Section Order

1. Nav / Header
2. Hero
3. Problem
4. Solution / What We Do
5. How It Works
6. Case Study
7. Why Stride
8. Results / Proof
9. Testimonials
10. Final CTA (Calendly)
11. FAQ
12. Footer

*(No Pricing section.)*

---

## 4. Section-by-Section Specs

### Nav / Header
Reference: designxhand.com/experience
- Sticky nav, section links adapted to Stride's own section names
- As user scrolls through a section, the underline below that nav item fills left-to-right showing scroll progress; moves to the next item as the next section begins

### Hero
References: Anubis Chain (3D glow), Google Flow (video mosaic bg)
- **Phase 1 (load):** Single centered 3D glowing rotating element (custom shape — dimensional, glowing, slow rotation), minimal text, dark noisy/grainy gradient background
- **Phase 2 (scroll):** The 3D element morphs/dissolves into the headline text; background transitions into a Google Flow-style video mosaic (grid of small looping video tiles)
- **Phase 3 (interactive):** On hover, the hovered video tile expands smoothly while neighboring tiles compress — bento-style push effect, very smooth/eased, no jarring snaps

### Problem
Reference: sakazuki.io Philosophy section
- **Part 1:** Dark pinned/sticky section, cinematic background image/video, paragraph text about the company sits over/behind the image, text reveals as user scrolls, background stays fixed
- **Part 2:** Crossfade transition into a light card layout, also pinned — the same card "slot" cycles through 3 states as user scrolls further (icon, small label like "( invisible )", headline, image, large number 01/02/03) — content swaps in place, not 3 separate scroll sections
- Content: company intro paragraph (part 1) + 3 real pain points as cycling cards (part 2)

### Solution / What We Do
- Centerpiece: landscape video of client work
- Transitions in smoothly as user scrolls into the section (no abrupt cut)
- Video expands to fill the full screen
- After expansion, a "scroll for more" indicator appears
- Video autoplays, muted, as it scrolls into view

### How It Works
Reference: anubischain.ai "How it Works"
- **(1)** Light intro panel: eyebrow label, bold headline, supporting paragraph
- **(2)** Glowing dark transition flash — brand logo/icon briefly revealed in the glow — dissolves into next section
- **(3)** Pinned/scroll-driven step sequence over a subtle particle/network background texture; steps numbered 01/02/03 appear one at a time as user scrolls
- **(4)** Closing panel: large rotating/spinning brand icon + closing line of text beneath
- Content: 3 steps — Strategy Call, We Build, You Show Up

### Case Study
Reference: sondaven.com/en "Why Son Daven Captivate"
- **Part 1:** Dark atmospheric intro panel, grain/texture, soft light glow, centered headline ("Why [Client] Trusted Stride" style)
- **Part 2:** Background shifts to warm neutral tone; collage of images scatters and scrolls diagonally (bottom-right → upper-left) as user scrolls, staggered/overlapping (not a grid), each image has a small caption/watermark
- **Part 3:** Centered brand mark/logo appears on a solid color card as the gallery clears
- **Part 4:** Smooth transition into next sub-section (e.g. a results/metrics chapter) with new background

### Results / Proof
Reference: clipcut.framer.ai "Real videos, Real numbers"
- Horizontal scrollable/carousel row of video cards
- Each card: autoplaying muted portrait video thumbnail, small circular client avatar/logo (top-left), bold stat overlay (e.g. view count), secondary stat line + one-line description below, client handle/account name at bottom
- Section header: eyebrow label + headline + short supporting line + "See More Works" link

### Why Stride
Reference: trionn.com capabilities section
- **(1)** Bold stacked-word headline on light background
- **(2)** Background transitions to dark, headline becomes white-on-dark, then fades
- **(3)** Letters scatter/fly apart briefly (word deconstructing)
- **(4)** Textured 3D object fades in, slowly rotates as fixed centerpiece
- **(5)** Capability/differentiator labels cycle in one at a time next to the object, each with a short description
- **(6)** Transitions into Results/Testimonials
- Content — capabilities to cycle: AI-Powered Content, Engagement-Focused Scripts, Full-Service Strategy, Video Production & Editing, Personal Brand Positioning, Consistent Delivery

### Testimonials
Reference: trionn.com scattered card gallery
- Light neutral background
- Cards fly in one at a time from varying directions as user scrolls, accumulating progressively into a staggered, overlapping mosaic (not a neat grid)
- Each card: client photo/logo, short quote snippet, name/handle, a stat

### Final CTA
Reference: Norvin-style contact section
- **Left column:** "Contact Us" pill label, large bold headline, world map illustration as subtle dark decorative background, contact info (phone/email), "Start Project" button with arrow icon
- **Right column:** Rounded card panel containing an **embedded Calendly booking widget**, styled to match the site's dark + ruby-red theme (use Calendly's brand color override options)

### FAQ
Reference: sondaven.com FAQ section
- Intro: large spaced-out letters spelling "FAQ" across the screen, subtle animated background elements
- Transition: big letters shrink and move to a smaller position (top-left) as a numbered accordion list fills in
- Accordion: questions numbered 01–08+, plus/expand icon, expands to reveal answer on click

### Footer
Reference: sondaven.com footer
- Centerpiece: large decorative brand illustration/icon centered as visual anchor, subtle floating particle/dot elements around it
- Footer content: brand name, contact number, website URL, tagline — laid out below/around the illustration

---

## 5. Copy Reference

Full section copy (hero headlines, problem/solution copy, FAQ answers, etc.) is available in a separate document: `stride-media-website-copy.md`. Use it as the copy source, adapting line lengths to fit each section's actual layout.

---

## 6. Build Notes

- Build **section by section**, starting with Nav + Hero (most complex: 3D morph + video mosaic)
- Use GSAP ScrollTrigger for pinned/scroll-driven sequences (Problem, How It Works, Case Study)
- Use Three.js for 3D elements (Hero glow shape, Why Stride rotating object)
- Each finished component should be pasted into Framer as a Code Component
- Reference screenshots/videos for each section should be provided alongside this spec when building that specific section
