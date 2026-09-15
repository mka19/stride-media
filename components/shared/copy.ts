/**
 * Stride Media — site copy, one source.
 *
 * The build spec references an external `stride-media-website-copy.md`, which
 * was not supplied. Everything below is written from the brand context in
 * section 1 of the spec and is meant to be replaced verbatim once that doc
 * lands: swap the strings here and every section updates. Line lengths are
 * already tuned to the layouts they sit in, so keep replacements roughly the
 * same length.
 */

export const brand = {
  name: "Stride Media",
  mark: "STRIDE",
  tagline: "Personal brands, built at speed.",
  phone: "+1 (415) 555-0128",
  email: "hello@stridemedia.co",
  url: "stridemedia.co",
  calendly: "https://calendly.com/stride-media/intro",
} as const;

export const nav = {
  items: [
    { id: "problem", label: "Problem" },
    { id: "what-we-do", label: "What We Do" },
    { id: "how-it-works", label: "How It Works" },
    { id: "case-study", label: "Case Study" },
    { id: "results", label: "Results" },
    { id: "faq", label: "FAQ" },
  ],
  cta: "Book a call",
} as const;

export const hero = {
  label: "Content studio",
  headline: ["Be the name", "they already", "know."],
  sub: "We build personal brands for entrepreneurs — strategy, scripts, production and delivery. You never pick up a camera.",
  cta: "Book a strategy call",
  scrollHint: "Scroll",
} as const;

export const problem = {
  label: "( the problem )",
  intro:
    "Stride Media is a small, full-service content studio. We build the personal brand of the person behind the business — the strategy, the calendar, the scripts, the edit — and we ship it every week without asking you to film a thing.",
  introAside: "Built for entrepreneurs who are good at the work and invisible because of it.",
  cards: [
    {
      n: "01",
      label: "( invisible )",
      headline: "You are the best-kept secret in your market.",
      body: "The work is excellent. Nobody outside your referral list knows it. Every deal starts cold because your name carries nothing ahead of it.",
    },
    {
      n: "02",
      label: "( ignored )",
      headline: "The scripts are pretty. The engagement is flat.",
      body: "Most agencies write for the feed, not for the viewer. Polished videos that nobody finishes, nobody saves, and nobody books from.",
    },
    {
      n: "03",
      label: "( stalled )",
      headline: "Three posts, then silence for a month.",
      body: "Inconsistent delivery kills compounding. You lose the algorithm, the audience, and the six weeks you already paid for.",
    },
  ],
} as const;

export const solution = {
  label: "( what we do )",
  headline: "End to end. Nothing on your plate.",
  body: "Positioning, content calendar, scripting, AI-assisted production, edit and delivery — one studio, one line of accountability.",
  scrollHint: "Scroll for more",
} as const;

export const howItWorks = {
  label: "( how it works )",
  headline: "Three steps. Then it just runs.",
  body: "Onboarding takes a week. After that, content arrives on a schedule you can set your calendar by — and your only job is to approve it.",
  steps: [
    {
      n: "01",
      title: "Strategy call",
      body: "Forty-five minutes on your market, your offer and the person you want to be known as. We leave with a positioning angle and a 90-day content thesis.",
    },
    {
      n: "02",
      title: "We build",
      body: "Calendar, hooks, scripts, production and edit. AI carries the volume; our team carries the taste. You approve, you don't produce.",
    },
    {
      n: "03",
      title: "You show up",
      body: "Content lands on schedule, every week. We read what performed, feed it back into the next batch, and keep the compounding going.",
    },
  ],
  closing: "One studio. Strategy through delivery.",
} as const;

export const caseStudy = {
  label: "( case study )",
  client: "Marisa Okonjo",
  clientContext: "Real estate — Bay Area",
  headline: ["Why Marisa", "trusted Stride"],
  intro:
    "Eleven years in the market, four hundred closings, and an audience of nine hundred people. We had one quarter to fix the second number.",
  gallery: [
    { caption: "Ep. 04 — Listing walkthrough" },
    { caption: "Hook test — 'nobody tells you'" },
    { caption: "Positioning frame" },
    { caption: "Ep. 09 — Buyer myths" },
    { caption: "Studio pass — colour" },
    { caption: "Ep. 12 — The 3% rule" },
    { caption: "Thumbnail set B" },
    { caption: "Ep. 17 — Off-market" },
  ],
  resultsLabel: "( ninety days later )",
  resultsHeadline: "The number that mattered moved.",
  metrics: [
    { value: "41", suffix: "×", label: "Reach, month one to month three" },
    { value: "2.4", suffix: "M", label: "Views across the quarter" },
    { value: "68", suffix: "", label: "Inbound conversations from content" },
    { value: "9", suffix: "", label: "Listings sourced, no cold outreach" },
  ],
} as const;

export const whyStride = {
  label: "( why stride )",
  headline: ["FULL", "SERVICE", "STUDIO"],
  capabilities: [
    { n: "01", title: "AI-Powered Content", body: "Volume that used to take a crew of six, produced in days — without the flat, templated look it usually comes with." },
    { n: "02", title: "Engagement-Focused Scripts", body: "Written for the first three seconds and the last one. Hooks tested, retention read, the next batch written off the data." },
    { n: "03", title: "Full-Service Strategy", body: "Positioning through delivery under one roof. No stitching together a strategist, an editor and a freelancer who ghosts." },
    { n: "04", title: "Video Production & Editing", body: "Colour, sound, pacing and captions handled in-house. Every asset leaves looking like it belongs to one brand." },
    { n: "05", title: "Personal Brand Positioning", body: "People follow people. We build the angle that makes you the obvious call in your market, not another company page." },
    { n: "06", title: "Consistent Delivery", body: "A schedule you can plan around. Small studio, senior team, one point of contact who answers." },
  ],
} as const;

export const results = {
  label: "( results )",
  headline: "Real videos, real numbers.",
  body: "A sample of what left the studio this quarter.",
  link: "See more works",
  cards: [
    { views: "3.1M", metric: "412K likes · 9.8K saves", desc: "Cold-open listing walkthrough, no face to camera for the first five seconds.", handle: "@marisaokonjo", client: "MO" },
    { views: "880K", metric: "61K likes · 4.2K shares", desc: "Buyer-myth series, episode two. Ran as a four-part hook test.", handle: "@devinhaleyre", client: "DH" },
    { views: "1.4M", metric: "97K likes · 12K saves", desc: "Founder story cut, repurposed from a single forty-minute interview.", handle: "@theclarkgroup", client: "CG" },
    { views: "620K", metric: "44K likes · 3.1K comments", desc: "Coaching offer explainer. Booked out the following month's calendar.", handle: "@ameliaruiz", client: "AR" },
    { views: "2.2M", metric: "155K likes · 18K saves", desc: "Off-market segment. Highest save rate of anything we shipped this year.", handle: "@nkosibuilds", client: "NB" },
    { views: "510K", metric: "38K likes · 2.6K shares", desc: "Ninety-second market update, delivered weekly for eleven straight weeks.", handle: "@sarahlinhomes", client: "SL" },
  ],
} as const;

export const testimonials = {
  label: "( testimonials )",
  headline: "What it did for them.",
  cards: [
    { quote: "I stopped introducing myself. People arrive already knowing what I do.", name: "Marisa Okonjo", handle: "@marisaokonjo", stat: "41× reach in 90 days", initials: "MO" },
    { quote: "Two agencies before this. Stride is the first one that shipped every single week.", name: "Devin Haley", handle: "@devinhaleyre", stat: "11 weeks, zero missed", initials: "DH" },
    { quote: "I have not been on a filming call in four months and my feed has never looked better.", name: "Amelia Ruiz", handle: "@ameliaruiz", stat: "Calendar booked out", initials: "AR" },
    { quote: "The scripts are the thing. Everything else is table stakes — they write like they want it watched.", name: "Nkosi Bello", handle: "@nkosibuilds", stat: "18K saves, one video", initials: "NB" },
    { quote: "Nine listings last quarter came out of content. None of them were cold.", name: "The Clark Group", handle: "@theclarkgroup", stat: "9 listings sourced", initials: "CG" },
    { quote: "Small team, senior people, one person I call. That is the whole pitch and they mean it.", name: "Sarah Lin", handle: "@sarahlinhomes", stat: "Weekly since March", initials: "SL" },
  ],
} as const;

export const finalCta = {
  pill: "Contact us",
  headline: ["Let's build the", "name they", "already know."],
  body: "Forty-five minutes. We'll tell you the angle we'd take before you pay us anything.",
  button: "Start project",
} as const;

export const faq = {
  items: [
    { q: "Do I need to film anything?", a: "No. That is the point of the studio. We produce with AI-assisted video and existing assets, and where we do need you, it is a single forty-minute interview call that we cut into months of content." },
    { q: "How fast does the first batch land?", a: "Onboarding is a week. Strategy call in the first two days, positioning and calendar back by day four, first approved batch in your hands by the end of week two." },
    { q: "Is this just AI slop with my name on it?", a: "No. AI carries the volume — rough cuts, variants, production passes. Strategy, scripts and the final edit are human, senior and opinionated. If a video is not good enough to put our name on, it does not ship." },
    { q: "What do you actually need from me?", a: "The strategy call, one interview session, and approvals. Everything else is ours." },
    { q: "Do you only work with real estate agents?", a: "That is where we started and where most of our proof lives. The system works for any entrepreneur whose business runs on being known — coaches, founders, creators. The positioning work is the same." },
    { q: "Who owns the content?", a: "You do. Every asset, every raw file, every script, on delivery." },
    { q: "How is this different from the agency that let me down?", a: "Small team, senior people, one point of contact, and a delivery schedule we publish in advance. Most agencies fail on consistency, not on craft. We built the studio around that." },
    { q: "What does it cost?", a: "It depends on volume and how much positioning work you need up front. We quote on the strategy call, after we have seen the market you are in — no packages priced before we know the work." },
  ],
} as const;

export const footer = {
  tagline: "Personal brands, built at speed.",
  note: "Strategy · Scripts · Production · Delivery",
} as const;
