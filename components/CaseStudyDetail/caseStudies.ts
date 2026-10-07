export type CaseStudyRecord = {
  slug: string; client: string; handle: string; descriptor: string; year: string; demo?: boolean;
  portrait?: string;
  headline: string; summary: string; metrics: { label: string; before: string; after: string }[];
  chapters: { id: string; label: string; title: string; body: string; bullets?: { title: string; body: string }[] }[];
  results: string[]; reels?: { url: string; views: string }[];
};

const serviceBullets = [
  { title: "Strategy and ideation", body: "Content pillars, positioning and a repeatable publishing plan." },
  { title: "Scripting", body: "Every script is built around a strong hook, a useful body and one clear action." },
  { title: "Production", body: "Stride handles shooting, editing and delivery in-house." },
  { title: "Publishing", body: "A consistent schedule turns the strategy into a dependable content system." },
];

export const caseStudies: CaseStudyRecord[] = [
  {
    slug: "anna-herbst", client: "Anna Herbst", handle: "@_annaherbst", year: "2026", portrait: "/case-studies/portraits/anna-herbst.webp",
    descriptor: "Dubai real estate expert · German-speaking investors across Germany, Austria and Switzerland",
    headline: "From 800 to 15K organic followers with a content system built to convert.",
    summary: "Anna was posting without direction. Stride built her positioning, production and lead-generation system from zero, then scaled it to more than 200 pieces a month.",
    metrics: [
      { label: "Followers", before: "800", after: "15K · verified · organic" },
      { label: "Content", before: "No direction or system", after: "6 videos a day + 1 post" },
      { label: "Reach", before: "Minimal growth", after: "1.55M views · 768K reached" },
      { label: "Leads", before: "None from content", after: "Leads, deals and new listings" },
    ],
    chapters: [
      { id: "client", label: "The client", title: "Dubai property, explained for German-speaking investors.", body: "Anna Herbst is a Dubai real estate agent and investor who helps German-speaking buyers build property portfolios. Her audience is sitting in Germany, Austria and Switzerland and seriously considering an investment in Dubai." },
      { id: "challenge", label: "The challenge", title: "Effort without a content identity or return.", body: "Anna had around 800 followers and was posting without direction. There was no content identity, no lead-generation system and no consistent growth. The effort was there, but nothing was coming back from it." },
      { id: "strategy", label: "The strategy", title: "One viewer, one identity and one job for every video.", body: "We built a complete system from zero.", bullets: [
        { title: "One clear viewer", body: "Every video speaks to the German-speaking investor weighing up Dubai from home." },
        { title: "A content identity", body: "A consistent look, voice and message makes Anna instantly recognisable." },
        { title: "Hook, body, CTA", body: "Each piece has one job: generate a qualified lead." },
        { title: "Volume with purpose", body: "Six videos a day plus a post, in German first with English versions." },
      ]},
      { id: "work", label: "What we did", title: "A-to-Z content operations, run by Stride.", body: "Stride owns the system from the first idea to the published post.", bullets: serviceBullets },
    ],
    results: ["800 to 15K followers, all organic with zero paid promotion", "1.55M views and 768K accounts reached", "92.9% of views from non-followers", "11,972 likes, 3,556 shares, 2,016 saves and 1,954 comments", "Real leads, closed deals and new property listings"],
  },
  {
    slug: "monish-bakhru", client: "Monish Bakhru", handle: "@monny.bullandbear", year: "2026", portrait: "/case-studies/portraits/monish-bakhru.webp",
    descriptor: "RERA-certified Dubai property advisor · Indian investors worldwide · With Stride since May 2026",
    headline: "A quiet 30K account became a 55.6K verified growth engine in four months.",
    summary: "Monny already had an audience. Stride restored the rhythm, sharpened the language and turned consistent publishing into millions of monthly views.",
    metrics: [
      { label: "Followers", before: "~30K", after: "55.6K · verified" },
      { label: "Views per reel", before: "400–500", after: "Top reel · 5.8M" },
      { label: "Monthly views", before: "Inactive for 5 months", after: "2.94M in 30 days" },
      { label: "Posting", before: "Inconsistent", after: "25 videos every month" },
    ],
    chapters: [
      { id: "client", label: "The client", title: "A trusted advisor for Indian off-plan investors.", body: "Monish Bakhru, known as Monny, is a RERA-certified Dubai property advisor focused on off-plan real estate. After working with us at a Dubai agency, he became one of Stride's first clients." },
      { id: "challenge", label: "The challenge", title: "The audience was there. The consistency was not.", body: "Monny had around 30K followers, but his page had been quiet for five months. When we restarted it, reels were receiving only 400 to 500 views." },
      { id: "strategy", label: "The strategy", title: "Restore momentum without reinventing the person.", body: "We kept what made Monny credible and fixed the system around him.", bullets: [
        { title: "Consistency first", body: "A steady weekly rhythm with no gaps." },
        { title: "Language", body: "Hindi-heavy scripts that speak to Indian investors in the language they think in." },
        { title: "Formats", body: "Talking-head explainers and two-speaker videos built for retention." },
        { title: "Clear CTAs", body: "Every video ends with a trigger that turns viewers into conversations." },
      ]},
      { id: "work", label: "What we did", title: "Twenty-five fact-checked videos every month.", body: "Stride manages the complete workflow from content pillars through publishing.", bullets: serviceBullets },
    ],
    results: ["30K to 55.6K followers in four months", "2.94M views and 1.81M viewers in the last 30 days", "97% of views from non-followers", "9.1K new followers and 191K interactions in 30 days", "Four top reels generated 12.1M combined views"],
    reels: [
      { url: "https://www.instagram.com/p/DY2K7TMMHux/", views: "5.8M" }, { url: "https://www.instagram.com/p/DZ0E4ncMOrE/", views: "3.5M" },
      { url: "https://www.instagram.com/p/DdMXsvtsQxX/", views: "1.7M" }, { url: "https://www.instagram.com/p/DaX_ktTMDQr/", views: "1.1M" },
    ],
  },
  {
    slug: "imtaz-ahmed", client: "Imtaz Ahmed", handle: "@realtyguru_", year: "2026", portrait: "/case-studies/portraits/imtaz-ahmed.webp",
    descriptor: "Founder, Prime Level Real Estate · Bangladeshi audience in the UAE and worldwide",
    headline: "AED 20M+ in property sold through content in three months.",
    summary: "Imtaz already had attention. Stride rebuilt the content around investor intent and clear calls to action, turning viewers into buyers.",
    metrics: [
      { label: "Sales", before: "Attention without conversion", after: "AED 20M+ in 3 months" },
      { label: "First week", before: "No clear CTA", after: "2 properties sold" },
      { label: "Top reels", before: "Broad audience", after: "1.56M combined views" },
      { label: "Publishing", before: "General content", after: "25 investor videos/month" },
    ],
    chapters: [
      { id: "client", label: "The client", title: "The biggest name in Bangla-language UAE real estate content.", body: "Imtaz Ahmed is the founder of Prime Level Real Estate. After working with us at a Dubai agency, he joined Stride as one of our first clients." },
      { id: "challenge", label: "The challenge", title: "Strong reach was not becoming buyer action.", body: "Imtaz had a loyal audience, but his videos did not tell viewers what to do next. The audience was also broad, with more casual viewers than serious investors." },
      { id: "strategy", label: "The strategy", title: "Shift from general attention to investor action.", body: "We focused the brand on conversion without losing Imtaz's established voice.", bullets: [
        { title: "Calls to action", body: "Every property video ends with a clear, direct next step." },
        { title: "Investors first", body: "Topics now attract serious investors instead of casual viewers." },
        { title: "Language", body: "Banglish scripts speak to the Bangladeshi community in its own voice." },
      ]},
      { id: "work", label: "What we did", title: "A conversion-focused publishing system.", body: "Stride repositioned the brand and handled scripting, shooting and editing for 25 videos each month.", bullets: serviceBullets.slice(0, 3) },
    ],
    results: ["2 properties sold in the first week", "AED 20M+ in property sales from content in three months", "An audience that now pulls investors, not only viewers", "Top reels reached 680K, 429K, 243K and 209K views"],
    reels: [
      { url: "https://www.instagram.com/reel/DaS18_JMXYx/", views: "680K" }, { url: "https://www.instagram.com/reel/DbbCMviJ4oY/", views: "429K" },
      { url: "https://www.instagram.com/reel/DclmArLMpTv/", views: "243K" }, { url: "https://www.instagram.com/reel/DbI8fPNAvvT/", views: "209K" },
    ],
  },
  {
    slug: "yasmin-shafi", client: "Yasmin Shafi", handle: "@yasmin_dxb_", year: "2026", portrait: "/case-studies/portraits/yasmin-shafi.webp",
    descriptor: "Dubai property advisor · First-time NRI and UAE investors · With Stride since January 2026",
    headline: "From 100 followers to 101K in eight months.",
    summary: "Stride positioned Yasmin as the trusted elder sister of Dubai property and built a warm, useful content system around the questions first-time investors actually ask.",
    metrics: [
      { label: "Followers", before: "~100", after: "101K" },
      { label: "Views per reel", before: "500–1,000", after: "Top reel · 6.2M" },
      { label: "Monthly views", before: "Not tracked", after: "3.9M" },
      { label: "Content", before: "No strategy", after: "28 videos/month" },
    ],
    chapters: [
      { id: "client", label: "The client", title: "A guide for first-time Dubai property investors.", body: "Yasmin Shafi helps first-time investors, especially NRIs worldwide and UAE residents, buy their first Dubai property. She knew the market well; almost nobody online knew her." },
      { id: "challenge", label: "The challenge", title: "Expertise without a visible point of view.", body: "Yasmin joined Stride with around 100 followers, reels averaging 500 to 1,000 views and no content strategy. Her personality was not coming through on camera." },
      { id: "strategy", label: "The strategy", title: "Make expertise feel like advice from family.", body: "We positioned Yasmin as calm, authoritative and firmly on the viewer's side.", bullets: [
        { title: "Her voice first", body: "Camera coaching helped her speak as naturally as she would to a friend." },
        { title: "Language and tone", body: "Warm, confident Hinglish scripts in 20 to 30 seconds." },
        { title: "Useful hooks", body: "Familiar money conversations become clear property lessons." },
        { title: "Lead capture", body: "Every reel ends with a comment trigger that opens an automated conversation." },
      ]},
      { id: "work", label: "What we did", title: "Positioning, coaching and 28 videos every month.", body: "Stride owns the workflow from fact-checked scripts and shoots through editing and publishing.", bullets: serviceBullets },
    ],
    results: ["100 to 101K followers in eight months", "3.9M reel views and 1.8M unique viewers in 30 days", "8.69M views and +21,012 net followers in 90 days", "Three reels reached 6.2M, 3.8M and 2.5M views", "57K shares and 20K saves in 30 days"],
    reels: [
      { url: "https://www.instagram.com/p/DVdxAsbD1g7/", views: "6.2M" }, { url: "https://www.instagram.com/reel/DSaEmRggv4u/", views: "3.8M" },
      { url: "https://www.instagram.com/reel/DW1U7cEE8W1/", views: "2.5M" },
    ],
  },
  {
    slug: "maaz-kadri", client: "Maaz Kadri", handle: "@maaz.realtor", year: "2026", portrait: "/case-studies/portraits/maaz-kadri.webp",
    descriptor: "Dubai real estate professional · Instagram and Facebook growth",
    headline: "One breakthrough reel turned consistency into 12 million views.",
    summary: "Research built the ideas, consistency built the base and Maaz gave the team room to experiment until the format clicked.",
    metrics: [{ label: "Instagram", before: "~6K followers", after: "26.3K followers" }, { label: "Facebook", before: "0 followers", after: "10,684 in ~3 months" }, { label: "Average views", before: "500–600", after: "10K–15K per video" }, { label: "Top reel", before: "No breakout video", after: "12M views" }],
    chapters: [
      { id: "client", label: "The client", title: "A Dubai real estate professional ready to scale beyond Instagram.", body: "Maaz Kadri built his personal brand around practical Dubai property content and stayed open to testing new formats." },
      { id: "challenge", label: "The challenge", title: "Good information was averaging 500 to 600 views.", body: "The page needed consistency, stronger research and enough creative freedom to discover a repeatable breakthrough format." },
      { id: "strategy", label: "Why it worked", title: "Consistency built the base. Experimentation found the winner.", body: "Research shaped the ideas and an open creative partnership gave Stride room to test. When the 12-million-view reel hit, older property videos began generating leads too.", bullets: serviceBullets },
      { id: "work", label: "Facebook", title: "An untapped channel became a second growth engine.", body: "Stride launched Maaz's Facebook page from zero. In one 28-day period it delivered 4M views, 2.4M viewers, 69,831 engagements and 5,074 net new followers." },
    ], results: ["Instagram grew from ~6K to 26.3K followers", "Facebook grew from 0 to 10,684 followers in about three months", "Average views rose from 500–600 to 10K–15K", "One reel reached 12M views", "Older property videos generated more leads than he could handle"],
  },
  {
    slug: "anonymous-learning", client: "Anonymous client", handle: "Client kept anonymous", year: "3 months",
    descriptor: "Dubai real estate professional · A transparent project retrospective",
    headline: "Not every project works. This one changed how every partnership starts.",
    summary: "The same team and process produced a very different outcome when creative roles became blurred and testing stopped.",
    metrics: [{ label: "Followers", before: "~100", after: "~150 after 3 months" }, { label: "Script length", before: "Under 1 minute planned", after: "2+ minute rewrites" }, { label: "Average views", before: "Growth target", after: "500–600" }],
    chapters: [
      { id: "client", label: "The client", title: "An experienced professional starting with a small Instagram page.", body: "The client wanted to build a personal brand in Dubai real estate and began at roughly 100 followers." },
      { id: "challenge", label: "What happened", title: "The process lost clarity at every creative handoff.", body: "Short scripts were repeatedly rewritten into report-style versions over two minutes. Ideas and edits went through repeated changes, proven formats were declined and there was little room left to test or optimise." },
      { id: "strategy", label: "What we learned", title: "A script is only half the video.", body: "Strong content needs clear roles and an on-camera delivery that feels owned rather than read. Confidence grows with coaching, simpler formats and practice, but the creative system needs room to work.", bullets: [{ title: "Agree direction first", body: "Hooks, formats, script structure and length are aligned during the discovery call." }, { title: "Show the reasoning", body: "Clients see where ideas come from and why each format is chosen." }, { title: "Listen, then lead", body: "Client goals and boundaries come first; inside them, Stride leads the creative direction." }] },
      { id: "work", label: "What we set up", title: "The full Stride process was in place.", body: "The same team behind the strongest results handled strategy, researched ideas, short-form scripting, shooting, editing and posting." },
    ], results: ["Around 150 followers after three months", "Videos averaged 500–600 views", "Creative direction is now agreed before the first shoot", "Every client now sees how formats and ideas are selected", "On-camera coaching is introduced earlier when needed"],
  },
];

export const findCaseStudy = (slug: string) => caseStudies.find((study) => study.slug === slug);
