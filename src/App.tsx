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
import { findCaseStudy } from "../components/CaseStudyDetail/caseStudies";
import VideoLibrary from "../components/Videos/VideoLibrary";

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
  const heroTiles = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=82",
  ].map((src, i) => ({ src, caption: ["Scripting workflow", "Creative direction", "Production system", "Content strategy", "Campaign review", "Creator direction"][i] }));

  const resultMedia = [
    "/case-studies/videos/ig-DVdxAsbD1g7.jpg",
    "/case-studies/videos/ig-DY2K7TMMHux.jpg",
    "/case-studies/videos/ig-DSaEmRggv4u.jpg",
    "/case-studies/videos/ig-DZ0E4ncMOrE.jpg",
    "/case-studies/videos/ig-DW1U7cEE8W1.jpg",
    "/case-studies/videos/ig-DdMXsvtsQxX.jpg",
  ];

  const caseStudyPortraits = [
    "/case-studies/portraits/anna-herbst.webp",
    "/case-studies/portraits/monish-bakhru.webp",
    "/case-studies/portraits/imtaz-ahmed.webp",
    "/case-studies/portraits/yasmin-shafi.webp",
    "/case-studies/portraits/maaz-home-cover.png",
  ];

  if (selectedStudy) return <CaseStudyDetail study={selectedStudy} />;
  if (isVideoLibrary) return <VideoLibrary />;

  return (
    <>
      <Preloader />
      <Nav />
      <Hero tiles={heroTiles} />
      <Results clips={resultMedia} />
      <Solution />
      <CaseStudy gallery={caseStudyPortraits} />
      <HowItWorks />
      <Marquee items={marquee.process} />
      <Problem
        backgroundSrc="/problem-transition.webp"
        cardMedia={["/problem-01.webp", "/problem-02.webp", "/problem-03.webp"]}
      />
      <WhyStride />
      <Marquee items={marquee.outcome} direction={1} />
      <Testimonials videos={["/testimonials/client-story-01.mp4"]} posters={["/testimonials/client-story-01-poster.jpg"]} />
      <Founders />
      <FinalCTA />
      <FAQ />
      <ComparisonTransition />
      <Footer />
    </>
  );
}
