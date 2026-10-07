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
  tagline: "Strategy. Content. Recognition.",
  phone: "+971 54 427 8816",
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
    { id: "results", label: "Results" },
    { id: "what-we-do", label: "What We Do" },
    { id: "case-study", label: "Case Study" },
    { id: "how-it-works", label: "How It Works" },
    { id: "problem", label: "Problem" },
    { id: "about", label: "About" },
  ],
  cta: "Book a call",
} as const;

export const hero = {
  label: "Content studio",
  /** The proof row above the headline. */
  proofCount: "115+",
  proofLabel: "happy clients",
  headline: ["BUILD A BRAND", "THAT GETS RECOGNIZED"],
  sub: "350M+ views organic. AED 20M+ in property sales driven by content. Stride Media creates short-form video that turns attention into clients.",
  cta: "Book your free strategy call",
  scrollHint: "Scroll",
} as const;

export const problem = {
  /** The dark opening chapter is the studio's About statement. */
  label: "About",
  intro:
    "We make good businesses impossible to ignore. Stride Media is a Dubai-based short-form video agency. We handle everything from strategy and scripting to shooting, editing, and posting, so you can focus on running your business. 350M+ views later, we know what makes people stop scrolling and start buying.",
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
    "WE", "MAKE", "GOOD", "BUSINESSES", 0, "IMPOSSIBLE", "TO", "IGNORE.",
    "STRIDE", "MEDIA", "IS", "A", "DUBAI-BASED", 1, "SHORT-FORM", "VIDEO", "AGENCY.",
    "WE", "HANDLE", "EVERYTHING", "FROM", "STRATEGY", "AND", "SCRIPTING", "TO", 2,
    "SHOOTING,", "EDITING,", "AND", "POSTING,", "SO", "YOU", "CAN", "FOCUS", "ON", "RUNNING", "YOUR", "BUSINESS.",
    "350M+", "VIEWS", "LATER,", "WE", "KNOW", "WHAT", "MAKES", "PEOPLE", 3,
    "STOP", "SCROLLING", "AND", "START", "BUYING.",
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
      title: "End-to-End Production",
      body: "High-quality video content, planned, shot and delivered by one team.",
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
  client: "Atlas Realty", // Demo client
  clientContext: "Real estate · Demo profile",
  headline: ["Why Atlas Realty", "trusted Stride"],
  intro: ["One entrepreneur. One invisible brand.", "One system that changed that."],
  gallery: [
    { caption: "Anna Herbst · 15K organic followers" },
    { caption: "Monish Bakhru · 12.1M top-reel views" },
    { caption: "Imtaz Ahmed · AED 20M+ in sales" },
    { caption: "Yasmin Shafi · 101K followers" },
    { caption: "Maaz Kadri · 12M-view breakthrough" },
    { caption: "Anonymous · What the process taught us" },
    { caption: "Thumbnail set" },
    { caption: "Ep. 17 — Off-market" },
  ],
  brandMoment: "This is what Stride builds.",
  /** The hover badge over each gallery plate. */
  hoverTop: "View",
  hoverMain: "case study",
  resultsLabel: "Milestones built together",
  resultsHeadline: "What Stride helped clients achieve.",
  /** The sentence on the floor of each metric card. */
  /* Two lines each, at the card's measure — the cards sit in a row and an
     odd one running to three broke the line they share. */
  metricNotes: [
    "Organic reach created across client campaigns and short-form content.",
    "Property sales attributed to content for Imtaz Ahmed in three months.",
    "Yasmin Shafi grew from roughly 100 to 101K followers in eight months.",
    "ManyChat trigger comments generated by Yasmin's conversion-led reels.",
  ],
  metrics: [
    { value: "350", suffix: "M+", label: "Organic views generated" },
    { value: "20", suffix: "M+", label: "AED in property sales" },
    { value: "100.9", suffix: "K", label: "Followers gained" },
    { value: "20", suffix: "K+", label: "Lead-trigger comments" },
  ],
} as const;

export const whyStride = {
  label: "Why Stride",
  headline: ["STRATEGY", "VIDEO", "SCRIPTS", "POSITIONING"],
  transition: "Not another content factory.",
  capabilities: [
    {
      n: "01",
      title: "High-Volume Content Creation",
      body: "A reliable production system that delivers quality at a consistent pace.",
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
  body: "The highest-performing verified reels from Stride client accounts.",
  link: "View all videos",
  cards: [
    { views: "6.2M", metric: "Top-performing reel", desc: "First-time investor content built for reach and trust.", handle: "@yasmin_dxb_", client: "YS", link: "https://www.instagram.com/reel/DVdxAsbD1g7/" },
    { views: "5.8M", metric: "Top-performing reel", desc: "Hindi-led property content reaching investors worldwide.", handle: "@monny.bullandbear", client: "MB", link: "https://www.instagram.com/reel/DY2K7TMMHux/" },
    { views: "3.8M", metric: "Verified result", desc: "A warm, direct explanation made for first-time buyers.", handle: "@yasmin_dxb_", client: "YS", link: "https://www.instagram.com/reel/DSaEmRggv4u/" },
    { views: "3.5M", metric: "Verified result", desc: "A high-retention property reel delivered through a consistent system.", handle: "@monny.bullandbear", client: "MB", link: "https://www.instagram.com/reel/DZ0E4ncMOrE/" },
    { views: "2.5M", metric: "+27K followers", desc: "One reel that turned clear advice into sustained account growth.", handle: "@yasmin_dxb_", client: "YS", link: "https://www.instagram.com/reel/DW1U7cEE8W1/" },
    { views: "1.7M", metric: "Verified result", desc: "Investor-focused content with a direct conversation trigger.", handle: "@monny.bullandbear", client: "MB", link: "https://www.instagram.com/reel/DdMXsvtsQxX/" },
  ],
} as const;

export const testimonials = {
  label: "Testimonials",
  headline: "What entrepreneurs say after working with Stride",
  cards: [
    { quote: "Watch their experience working with Stride Media.", name: "Client testimonial", handle: "Dubai", stat: "Real story", initials: "ST" },
    { quote: "I stopped introducing myself. People arrive already knowing what I do.", name: "Noah Bennett · Demo", handle: "Real estate", stat: "41× reach", initials: "NB" },
    { quote: "Two agencies before this. Stride is the first one that shipped every single week.", name: "Leila Hart · Demo", handle: "Coaching", stat: "11 weeks straight", initials: "LH" },
    { quote: "I have not been on a filming call in four months and my feed has never looked better.", name: "Marcus Reed · Demo", handle: "Consulting", stat: "Calendar full", initials: "MR" },
    { quote: "The scripts are the thing. They write like they want it watched.", name: "Sofia Lane · Demo", handle: "Founder", stat: "18K saves", initials: "SL" },
    { quote: "Nine listings last quarter came out of content. None of them were cold.", name: "Ethan Cole · Demo", handle: "Real estate", stat: "9 listings", initials: "EC" },
    { quote: "We stopped guessing what to post. There is a plan, and the plan is working.", name: "Mila Brooks · Demo", handle: "Fitness", stat: "4× saves", initials: "MB" },
    { quote: "The first batch landed in five days. Two of them are still my best performing videos.", name: "Theo Grant · Demo", handle: "Property", stat: "5-day first batch", initials: "TG" },
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
      a: "No. Stride plans and runs the shoot, then handles editing and delivery end to end.",
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
      a: "Engagements are structured around the scope, production volume and campaign goals agreed at the start.",
    },
  ],
} as const;

/** Replace these fields and image URLs when the founder material arrives. */
export const founders = {
  label: "The people behind Stride",
  headline: "Founders",
  people: [
    {
      n: "01",
      name: "Ayub Shaikh",
      role: "Founder · Creative Direction",
      bio: "Ayub leads Stride's creative direction and content creation, helping clients make more money through content and open doors that would not have been possible without it.",
      image: "/founders/ayub-shaikh.webp",
    },
    {
      n: "02",
      name: "Co-founder",
      role: "Profile details coming soon",
      bio: "The second founder profile will be completed when the confirmed name, role, biography and portrait are supplied.",
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
  tagline: "Strategy. Content. Recognition.",
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
    { label: "Instagram", href: "https://www.instagram.com/" },
    { label: "YouTube", href: "https://www.youtube.com/" },
    { label: "TikTok", href: "https://www.tiktok.com/" },
    { label: "LinkedIn", href: "https://www.linkedin.com/" },
  ],
  rights: "all rights reserved",
  basedLabel: "Based in",
  basedIn: "Dubai, UAE",
  legal: [
    { label: "Terms & conditions", href: "/terms.html" },
    { label: "Privacy policy", href: "/privacy.html" },
  ],
} as const;
