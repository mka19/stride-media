import { useEffect } from "react";
import { initSmoothScroll } from "../components/shared/smoothScroll";
import Marquee from "../components/shared/Marquee";
import { marquee } from "../components/shared/copy";
import Nav from "../components/Nav/Nav";
import Hero from "../components/Hero/Hero";
import Problem from "../components/Problem/Problem";
import Solution from "../components/Solution/Solution";
import HowItWorks from "../components/HowItWorks/HowItWorks";
import CaseStudy from "../components/CaseStudy/CaseStudy";
import WhyStride from "../components/WhyStride/WhyStride";
import Results from "../components/Results/Results";
import Testimonials from "../components/Testimonials/Testimonials";
import FinalCTA from "../components/FinalCTA/FinalCTA";
import FAQ from "../components/FAQ/FAQ";
import Footer from "../components/Footer/Footer";
import Founders from "../components/Founders/Founders";
import Preloader from "../components/shared/Preloader";
import ComparisonTransition from "../components/ComparisonTransition/ComparisonTransition";
import CaseStudyDetail from "../components/CaseStudyDetail/CaseStudyDetail";
import { reels } from "../components/Videos/videoData";
import { findCaseStudy } from "../components/CaseStudyDetail/caseStudies";
import VideoLibrary from "../components/Videos/VideoLibrary";
import PageTransition from "../components/shared/PageTransition";

/**
 * Preview harness. Not part of the Framer deliverable — it exists so the
 * code components can be developed and checked in a real browser at real
 * scroll lengths before being pasted into Framer, in the locked order.
 */
export default function App() {
  const caseStudySlug = window.location.pathname.match(/^\/case-studies\/([^/]+)\/?$/)?.[1];
  const selectedStudy = caseStudySlug ? findCaseStudy(caseStudySlug) : undefined;
  const isVideoLibrary = /^\/videos\/?$/.test(window.location.pathname);
  // In Framer this call belongs in one code component that wraps the page,
  // or in a site-wide override — not in each section, or several instances
  // of Lenis end up fighting for the same scroller.
  useEffect(() => {
    const motion = new URLSearchParams(window.location.search).get("motion");
    if (motion === "on" || motion === "off") document.documentElement.dataset.motion = motion;
    const destroy = initSmoothScroll();
    return () => {
      destroy();
      delete document.documentElement.dataset.motion;
    };
  }, []);

  // Media is limited to components that already own image/video slots. This
  // keeps every restored animation and the original hero mark untouched.
  const verifiedHeroViews = new Map([
    ["DSH_yDNE7d_", "12M"],
    ["DRZkSxOj3oh", "1.55M"],
  ]);
  const heroTiles = reels.filter((reel) => Boolean(reel.views || verifiedHeroViews.has(reel.id))).map((reel) => ({
    src: `/case-studies/videos/ig-${reel.id}.mp4`,
    poster: `/case-studies/videos/ig-${reel.id}.jpg`,
    caption: reel.title,
    views: `${reel.views ?? verifiedHeroViews.get(reel.id)} views`,
    href: reel.instagram,
  }));

  const resultMedia = [
    "/case-studies/videos/ig-DSH_yDNE7d_.jpg",
    "/case-studies/videos/ig-DVdxAsbD1g7.jpg",
    "/case-studies/videos/ig-DY2K7TMMHux.jpg",
    "/case-studies/videos/ig-DRZkSxOj3oh.jpg",
    "/case-studies/videos/ig-DaS18_JMXYx.jpg",
    "/case-studies/videos/ig-DSaEmRggv4u.jpg",
  ];

  const caseStudyPortraits = [
    "/case-studies/portraits/anna-herbst-cover.png",
    "/case-studies/portraits/monish-bakhru-cover.png",
    "/case-studies/portraits/imtaz-ahmed-cover.png",
    "/case-studies/portraits/yasmin-shafi-cover.png",
    "/case-studies/portraits/maaz-kadri-cover.png",
    "/case-studies/portraits/anonymous-client.png",
  ];

  if (selectedStudy) return <><PageTransition /><CaseStudyDetail study={selectedStudy} /></>;
  if (isVideoLibrary) return <><PageTransition /><VideoLibrary /></>;

  return (
    <>
      <PageTransition />
      <Preloader />
      <Nav />
      <Hero
        tiles={heroTiles}
        clientFaces={[
          "/case-studies/portraits/anna-herbst-cover.png",
          "/case-studies/portraits/monish-bakhru-cover.png",
          "/case-studies/portraits/imtaz-ahmed-cover.png",
          "/case-studies/portraits/yasmin-shafi-cover.png",
          "/case-studies/portraits/maaz-kadri-cover.png",
        ]}
      />
      <Results clips={resultMedia} />
      <Solution />
      <CaseStudy gallery={caseStudyPortraits} />
      <HowItWorks />
      <Marquee items={marquee.process} />
      <Problem
        backgroundSrc="/problem-transition.png"
        cardMedia={["/problem-01.png", "/problem-02.png", "/problem-03.png"]}
      />
      <WhyStride />
      <Marquee items={marquee.outcome} direction={1} />
      <Testimonials
        videos={["/testimonials/client-story-01.mp4", "/testimonials/client-story-02.mp4", "/testimonials/client-story-03.mp4", "/testimonials/client-story-04.mp4"]}
        posters={["/testimonials/client-story-01-poster.jpg", "/testimonials/client-story-02-poster.jpg", "/testimonials/client-story-03.jpg", "/testimonials/client-story-04.jpg"]}
      />
      <Founders />
      <FinalCTA />
      <FAQ />
      <ComparisonTransition />
      <Footer />
    </>
  );
}
