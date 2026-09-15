import { useEffect } from "react";
import { initSmoothScroll } from "../components/shared/smoothScroll";
import Marquee from "../components/shared/Marquee";
import Diagnostics from "../components/shared/Diagnostics";
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

/**
 * Preview harness. Not part of the Framer deliverable — it exists so the
 * code components can be developed and checked in a real browser at real
 * scroll lengths before being pasted into Framer, in the locked order.
 */
export default function App() {
  // In Framer this call belongs in one code component that wraps the page,
  // or in a site-wide override — not in each section, or several instances
  // of Lenis end up fighting for the same scroller.
  useEffect(() => initSmoothScroll(), []);

  return (
    <>
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      <HowItWorks />
      <Marquee items={marquee.process} />
      <CaseStudy />
      <WhyStride />
      <Marquee items={marquee.outcome} direction={1} />
      <Results />
      <Testimonials />
      <FinalCTA />
      <FAQ />
      <Footer />
      <Diagnostics />
    </>
  );
}
