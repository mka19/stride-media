/**
 * Stride Media — site copy.
 *
 * Source: stride-media-website-copy-v2.md, used as written. Line breaks are
 * the only thing adapted, to fit each section's actual measure.
 *
 * PLACEHOLDERS still to be filled: the phone number, the case-study client
 * name, and the contract terms in FAQ 06. They are written as obvious
 * placeholders on purpose — nothing invented is standing in for a real
 * number or a real client.
 */

export const brand = {
  name: "Stride Media",
  /* The bar carries the full name, not a shortening of it. */
  mark: "STRIDE MEDIA",
  tagline: "AI Creators. Real Recognition.",
  phone: "+1 (000) 000-0000", // PLACEHOLDER
  phoneLabel: "Call us 24/7",
  email: "hello@stridemedia.co", // PLACEHOLDER
  url: "stridemedia.co",
  /*
   * The scheduling link does not live here.
   *
   * It is CALENDLY_URL in shared/CalendlyEmbed.tsx, next to the code that
   * uses it, so there is exactly one place to paste it. Keeping a second copy
   * in the copy file is how a site ends up with the booking button and the
   * booking widget pointing at different events.
   */
} as const;

export const nav = {
  items: [
    { id: "about", label: "About" },
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
  /** The proof row above the headline. */
  proofCount: "115+",
  proofLabel: "happy clients",
  headline: ["BUILD A BRAND", "THAT GETS RECOGNIZED"],
  sub: "AI-powered video content for entrepreneurs who want authority, engagement and results. You never pick up a camera.",
  cta: "Book your free strategy call",
  scrollHint: "Scroll",
} as const;

export const problem = {
  /** The dark opening chapter is the studio's About statement. */
  label: "About",
  intro:
    "Stride Media exists because talented entrepreneurs keep losing to louder, less capable competitors. Not on skill, on visibility. We build the video presence that makes recognition inevitable, using AI to move faster than any traditional agency, without cutting corners on quality.",
  /**
   * The same statement, broken where it should break. The pinned chapter
   * reveals one of these at a time, so the break points are a writing
   * decision rather than whatever the measure happens to do at a given width.
   */
  /**
   * The About statement as a sequence: words, and the points where one of the
   * site's own objects sits inline in the sentence. A number is an object
   * slot; everything else is a word. Kept as one list so the reveal can walk
   * words and objects in the order they are read.
   */
  /*
   * Four tiles, at irregular intervals rather than one per line — a tile
   * landing in the same place in every line reads as a layout, not as
   * something caught in the sentence. The tail is long enough that the last
   * line is a line of copy and not two words trailing off the end.
   */
  introSequence: [
    "STRIDE", "MEDIA", "EXISTS", "BECAUSE", "ENTREPRENEURS", 0,
    "KEEP", "LOSING", "TO", "LOUDER,", "LESS", 1,
    "CAPABLE", "COMPETITORS.", "NOT", "ON", "SKILL,", 2,
    "ON", "VISIBILITY.", "WE", "MAKE", "IT", 3,
    "IMPOSSIBLE", "TO", "IGNORE.",
  ] as (string | number)[]
,
  introAside: "Built for entrepreneurs who are good at the work and invisible because of it.",
  /** The two blocks under the rule, left and right. */
  aboutCaps: ["WE BUILD FOR RECOGNITION.", "STRATEGY FIRST, SHIPPED MONTHLY."],
  aboutMission:
    "Our mission is to make expertise impossible to ignore, with video that earns attention instead of buying it.",
  cards: [
    {
      n: "01",
      label: "Invisible",
      headline: "Stride brings you into focus.",
      body: "You've got the expertise and the results. But online, you're invisible, or worse, posting content that gets zero engagement.",
      caption: "Ep. 04 — Listing walkthrough",
    },
    {
      n: "02",
      label: "Unscripted",
      headline: "Stride gives video a purpose.",
      body: "Most content fails before it's filmed. No hook, no structure, nothing that makes someone stop scrolling. A script that doesn't work, no camera can save.",
      caption: "Hook test — retention pass",
    },
    {
      n: "03",
      label: "Inconsistent",
      headline: "Stride delivers, every time.",
      body: "Late deliverables, dropped projects, agencies that ghost mid-campaign. Momentum dies the moment delivery becomes unreliable.",
      caption: "Week 11 — on schedule",
    },
  ],
} as const;

export const solution = {
  label: "What we do",
  headline: ["We build your", "personal brand. Start to finish."],
  body: "Stride Media handles everything, so you never have to touch a camera, write a script, or guess what works.",
  videoCaption: "Watch how it comes together",
  // One plain cue, no controls: the film keeps playing while it holds the
  // screen, and the line simply says what the two options are.
  scrollHint: "Keep watching to understand us better, or scroll for more",
  pillars: [
    {
      n: "01",
      title: "Strategy",
      body: "We position you as the go-to authority in your industry, not just another face in the feed.",
    },
    {
      n: "02",
      title: "Scripts That Convert",
      body: "Every script is built to drive engagement, comments and trust, not just views.",
    },
    {
      n: "03",
      title: "AI-Powered Production",
      body: "High-quality video content, delivered fast, without filming a single second yourself.",
    },
  ],
} as const;

export const howItWorks = {
  label: "How it works",
  headline: "Your brand, built in 3 steps",
  body: "No guesswork, no back-and-forth. A clear process that turns your expertise into content people actually watch.",
  steps: [
    {
      n: "01",
      tag: "Call",
      title: "Strategy Call",
      body: "We learn your business, your audience and your goals. No cookie-cutter onboarding.",
    },
    {
      n: "02",
      tag: "Build",
      title: "We Build",
      body: "Our team creates your scripts, positioning and video content, fully done-for-you.",
    },
    {
      n: "03",
      tag: "Publish",
      title: "You Show Up",
      body: "You post, grow and get recognized. We handle the rest, every month.",
    },
  ],
  closing: "Why entrepreneurs choose Stride.",
} as const;

export const caseStudy = {
  label: "Case study",
  client: "[Client]", // PLACEHOLDER — real client name pending
  clientContext: "Real estate",
  headline: ["Why [Client]", "trusted Stride"],
  intro: "One entrepreneur. One invisible brand. One system that changed that.",
  gallery: [
    { caption: "Strategy call — day one" },
    { caption: "Positioning frame" },
    { caption: "Hook test — variant B" },
    { caption: "Ep. 09 — Buyer myths" },
    { caption: "Studio pass — colour" },
    { caption: "Ep. 12 — The 3% rule" },
    { caption: "Thumbnail set" },
    { caption: "Ep. 17 — Off-market" },
  ],
  brandMoment: "This is what Stride builds.",
  /** The hover badge over each gallery plate. */
  hoverTop: "View",
  hoverMain: "case study",
  resultsLabel: "Ninety days later",
  resultsHeadline: "The number that mattered moved.",
  /** The sentence on the floor of each metric card. */
  /* Two lines each, at the card's measure — the cards sit in a row and an
     odd one running to three broke the line they share. */
  metricNotes: [
    "Reach from month one to month three, same cadence.",
    "Views across the quarter, from a standing start.",
    "Inbound conversations that began with content.",
    "Listings sourced from the feed, no cold outreach.",
  ],
  metrics: [
    { value: "41", suffix: "×", label: "Reach in ninety days" },
    { value: "2.4", suffix: "M", label: "Views across the quarter" },
    { value: "68", suffix: "", label: "Inbound conversations" },
    { value: "9", suffix: "", label: "Listings sourced" },
  ],
} as const;

export const whyStride = {
  label: "Why Stride",
  headline: ["AI", "VIDEO", "SCRIPTS", "POSITIONING"],
  transition: "Not another content factory.",
  capabilities: [
    {
      n: "01",
      title: "AI-Powered Content Creation",
      body: "Faster than traditional production, without sacrificing quality.",
    },
    {
      n: "02",
      title: "Engagement-Focused Scripts",
      body: "Built to drive comments, shares and trust, not just views.",
    },
    {
      n: "03",
      title: "Full-Service Strategy",
      body: "From positioning to delivery, handled end to end.",
    },
    {
      n: "04",
      title: "Video Production & Editing",
      body: "High-quality output, zero filming required.",
    },
    {
      n: "05",
      title: "Personal Brand Positioning",
      body: "You become the authority, not just another feed post.",
    },
    {
      n: "06",
      title: "Consistent Delivery",
      body: "Every month, on time, without exception.",
    },
  ],
} as const;

export const results = {
  label: "Client Results",
  headline: "Real videos, real numbers",
  body: "Every video below was strategized, scripted and delivered by our team. The numbers speak for themselves.",
  link: "See More Works",
  cards: [
    { views: "758K", metric: "2.3× engagement growth", desc: "Optimized content structure for better watch time.", handle: "@client-handle", client: "01" },
    { views: "1.2M", metric: "+10K followers in 30 days", desc: "Consistent strategy with high-retention edits.", handle: "@client-handle", client: "02" },
    { views: "623K", metric: "+5K followers in 1 month", desc: "Content system built for consistency and growth.", handle: "@client-handle", client: "03" },
    { views: "2.2M", metric: "18K saves", desc: "Off-market segment with the highest save rate of the quarter.", handle: "@client-handle", client: "04" },
    { views: "880K", metric: "4.2K shares", desc: "Buyer-myth series, run as a four-part hook test.", handle: "@client-handle", client: "05" },
    { views: "510K", metric: "11 weeks, zero missed", desc: "Ninety-second market update, delivered weekly.", handle: "@client-handle", client: "06" },
  ],
} as const;

export const testimonials = {
  label: "Testimonials",
  headline: "What entrepreneurs say after working with Stride",
  cards: [
    { quote: "Before Stride, we were posting randomly with no real strategy. Now every video has a purpose, and it shows in the results.", name: "[Client Name]", handle: "Real estate", stat: "2.3× engagement", initials: "01" },
    { quote: "I stopped introducing myself. People arrive already knowing what I do.", name: "[Client Name]", handle: "Real estate", stat: "41× reach", initials: "02" },
    { quote: "Two agencies before this. Stride is the first one that shipped every single week.", name: "[Client Name]", handle: "Coaching", stat: "11 weeks straight", initials: "03" },
    { quote: "I have not been on a filming call in four months and my feed has never looked better.", name: "[Client Name]", handle: "Consulting", stat: "Calendar full", initials: "04" },
    { quote: "The scripts are the thing. They write like they want it watched.", name: "[Client Name]", handle: "Founder", stat: "18K saves", initials: "05" },
    { quote: "Nine listings last quarter came out of content. None of them were cold.", name: "[Client Name]", handle: "Real estate", stat: "9 listings", initials: "06" },
    { quote: "We stopped guessing what to post. There is a plan, and the plan is working.", name: "[Client Name]", handle: "Fitness", stat: "4× saves", initials: "07" },
    { quote: "The first batch landed in five days. Two of them are still my best performing videos.", name: "[Client Name]", handle: "Property", stat: "5-day first batch", initials: "08" },
  ],
} as const;

export const finalCta = {
  pill: "Contact us",
  headline: ["Let's build", "your brand."],
  body: "Stop being the best-kept secret in your industry.",
  button: "Start project",
  calendlyHeader: "Book your free strategy call",
} as const;

export const faq = {
  label: "FAQ",
  items: [
    {
      q: "Do I need to film anything?",
      a: "No. Everything is AI-powered. No camera, no filming, no stress.",
    },
    {
      q: "What industries do you work with?",
      a: "We started with real estate agents and now work with entrepreneurs across industries: coaches, consultants, founders and creators.",
    },
    {
      q: "How fast will I see content?",
      a: "Your first content batch is delivered within days of your strategy call.",
    },
    {
      q: "Is this just editing, or do you write scripts too?",
      a: "Everything. Strategy, scripts, production and delivery, fully done-for-you.",
    },
    {
      q: "What if I don't like the direction?",
      a: "We work iteratively. If something's off, we refine it until it's right.",
    },
    {
      q: "Do you offer month-to-month or contracts?",
      a: "[Confirm terms — placeholder pending your input.]", // PLACEHOLDER
    },
  ],
} as const;

/** Replace these fields and image URLs when the founder material arrives. */
export const founders = {
  label: "The people behind Stride",
  headline: "FOUNDERS",
  people: [
    {
      n: "01",
      name: "Founder One",
      role: "Co-founder · Strategy",
      bio: "The point of view behind the positioning, scripts and systems that make every piece of content feel unmistakably yours.",
      image: "",
    },
    {
      n: "02",
      name: "Founder Two",
      role: "Co-founder · Creative",
      bio: "The creative direction behind Stride’s visual language, production quality and the details that make people stop scrolling.",
      image: "",
    },
  ],
  memories: [
    { n: "01", title: "The first working session", meta: "Where the Stride system started taking shape.", image: "" },
    { n: "02", title: "Building the first campaign", meta: "Testing the ideas that became our process.", image: "" },
    { n: "03", title: "A late studio night", meta: "One more pass became the final direction.", image: "" },
    { n: "04", title: "The first client win", meta: "The moment the system proved itself.", image: "" },
  ],
} as const;

/** The breather strips between major sections. */
export const marquee = {
  process: ["Strategy", "Scripts", "Production", "Delivery"],
  outcome: ["Authority", "Engagement", "Recognition", "Consistency"],
} as const;

export const footer = {
  wordmark: "STRIDE MEDIA",
  tagline: "AI Creators. Real Recognition.",
  /** Numbered, down the left. */
  nav: [
    { n: "01", label: "Home", href: "#top" },
    { n: "02", label: "What We Do", href: "#what-we-do" },
    { n: "03", label: "Work", href: "#results" },
    { n: "04", label: "Contact", href: "#contact" },
  ],
  /**
   * Right-hand column.
   *
   * An empty href is the real state: these accounts have no URLs yet. They
   * used to be href="#", which is worse than nothing — it looks like a link,
   * takes the click, and jumps the page to the top. Until a real URL is put
   * in, the footer renders these as plain text instead of as links.
   *
   * ── PASTE THE PROFILE URLS HERE ──────────────────────────────────────────
   */
  socials: [
    { label: "Instagram", href: "" },
    { label: "YouTube", href: "" },
    { label: "TikTok", href: "" },
    { label: "LinkedIn", href: "" },
  ],
  rights: "all rights reserved",
  basedLabel: "Based in",
  basedIn: "[City]", // PLACEHOLDER
  legal: ["Terms & conditions", "Privacy policy"],
} as const;
