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

  // Media is limited to components that already own image/video slots. This
  // keeps every restored animation and the original hero mark untouched.
  const heroTiles = [
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1200&q=82",
  ].map((src, i) => ({ src, caption: ["AI workflow", "Creative automation", "Production system", "Content strategy", "Campaign review", "Creator direction"][i] }));

  const resultMedia = [
    "https://images.unsplash.com/photo-1492724441997-5dc865305da7?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1485846234645-a62644f84728?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1574717024653-61fd2cf4d44d?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1536240478700-b869070f9279?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=1200&q=82",
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=1200&q=82",
  ];

  return (
    <>
      <Preloader />
      <Nav />
      <Hero tiles={heroTiles} />
      <Problem />
      <Solution />
      <HowItWorks />
      <Marquee items={marquee.process} />
      <CaseStudy />
      <WhyStride />
      <Marquee items={marquee.outcome} direction={1} />
      <Results clips={resultMedia} />
      <Testimonials />
      <Founders />
      <FinalCTA />
      <FAQ />
      <ComparisonTransition />
      <Footer />
    </>
  );
}
