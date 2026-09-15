import Nav from "../components/Nav/Nav";
import Hero from "../components/Hero/Hero";
import Problem from "../components/Problem/Problem";
import Solution from "../components/Solution/Solution";

/**
 * Preview harness. Not part of the Framer deliverable — it exists so each
 * code component can be developed and checked in a real browser at real
 * scroll lengths before being pasted into Framer.
 *
 * Sections are added here as they are built; Nav and Hero are the first pass.
 */
export default function App() {
  return (
    <>
      <Nav />
      <Hero />
      <Problem />
      <Solution />
      {/* Placeholder runway for the section that comes next. */}
      <section
        id="how-it-works"
        style={{
          height: "120vh",
          background: "#0B0807",
          color: "rgba(246,241,236,0.4)",
          display: "grid",
          placeItems: "center",
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          letterSpacing: "0.2em",
          textTransform: "uppercase",
        }}
      >
        next up — how it works
      </section>
    </>
  );
}
