import { useState } from "react";
import { founders as copy } from "../shared/copy";
import { gsap, SCRUB, useGsapContext } from "../shared/gsap";
import { color, ease, hexA, layout, space, typeScale } from "../shared/theme";
import { useBreakpoint, useStacked } from "../shared/responsive";
import { Grain, MicroLabel } from "../shared/primitives";

function Portrait({ person, index }: { person: (typeof copy.people)[number]; index: number }) {
  return (
    <div
      className="founder-portrait"
      style={{
        position: "relative",
        height: "100%",
        minHeight: 420,
        overflow: "hidden",
        background: person.image
          ? `url(${person.image}) center/cover no-repeat`
          : `radial-gradient(circle at ${index ? "68% 28%" : "32% 28%"}, ${hexA(color.accentBright, 0.7)}, transparent 21%), linear-gradient(145deg, #26124d 0%, #0e0e12 48%, #050505 100%)`,
      }}
    >
      {!person.image && (
        <>
          <div style={{ position: "absolute", inset: "17% 25% 0", borderRadius: "48% 48% 12% 12%", background: "linear-gradient(135deg, rgba(255,255,255,.2), rgba(255,255,255,.025))", filter: "blur(.2px)" }} />
          <span style={{ position: "absolute", left: space.lg, bottom: space.lg, ...typeScale.eyebrow, color: hexA("#fff", 0.58) }}>
            Portrait placeholder · {person.n}
          </span>
        </>
      )}
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 54%, rgba(0,0,0,.72))" }} />
    </div>
  );
}

function Memory({ item, index }: { item: (typeof copy.memories)[number]; index: number }) {
  const [active, setActive] = useState(false);
  const rotations = [-5, 4, -3, 6];
  return (
    <article
      tabIndex={0}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      onClick={() => setActive((v) => !v)}
      style={{
        position: "relative",
        zIndex: active ? 5 : index + 1,
        transform: `translate3d(0, ${active ? -30 : index % 2 ? 24 : 0}px, 0) rotate(${active ? 0 : rotations[index]}deg) scale(${active ? 1.035 : 1})`,
        transition: `transform 620ms ${ease.out}, filter 420ms ${ease.out}`,
        outline: "none",
      }}
    >
      <div style={{ padding: 9, background: "#ECECEF", boxShadow: active ? "0 30px 80px rgba(0,0,0,.5)" : "0 15px 35px rgba(0,0,0,.3)", transition: `box-shadow 500ms ${ease.out}` }}>
        <div
          style={{
            aspectRatio: "4 / 5",
            background: item.image
              ? `url(${item.image}) center/cover no-repeat`
              : `linear-gradient(${135 + index * 28}deg, ${hexA(color.accent, 0.82)}, #18131f 52%, #050505)`,
          }}
        />
      </div>
      <div
        aria-hidden={!active}
        style={{
          position: "absolute",
          left: "50%",
          top: "calc(100% + 22px)",
          width: "min(270px, 74vw)",
          color: color.textOnDark,
          opacity: active ? 1 : 0,
          transform: `translate3d(-50%, ${active ? 0 : 12}px, 0)`,
          transition: `opacity 300ms ${ease.out}, transform 500ms ${ease.out}`,
          pointerEvents: "none",
          textAlign: "center",
        }}
      >
        <strong style={{ ...typeScale.bodyLg, fontWeight: 500 }}>{item.title}</strong>
        <span style={{ display: "block", marginTop: 4, ...typeScale.eyebrow, color: color.textOnDarkMuted }}>{item.meta}</span>
      </div>
    </article>
  );
}

export default function Founders({ scrollLength = "250vh" }: { scrollLength?: string }) {
  const stacked = useStacked();
  const compact = useBreakpoint() === "mobile";
  const rootRef = useGsapContext(
    (root) => {
      const q = gsap.utils.selector(root);
      gsap.set(q(".founder-panel"), { opacity: 0, yPercent: 7, scale: 0.975 });
      gsap.set(q(".founder-panel")[0], { opacity: 1, yPercent: 0, scale: 1 });
      gsap.set(q(".founder-title"), { yPercent: 110 });
      gsap.set(q(".founder-stage"), { opacity: 0, y: 26 });
      gsap.set(q(".founder-memory-intro"), { opacity: 0, y: 24 });

      const tl = gsap.timeline({
        scrollTrigger: { trigger: root, start: "top top", end: "bottom bottom", scrub: SCRUB },
      });
      tl.to(q(".founder-title"), { yPercent: 0, duration: 0.16, ease: "expo.out" }, 0.02)
        .to(q(".founder-intro"), { opacity: 0, scale: 0.96, y: -24, duration: 0.1, ease: "power2.in" }, 0.2)
        .to(q(".founder-stage"), { opacity: 1, y: 0, duration: 0.14, ease: "expo.out" }, 0.27)
        .to(q(".founder-panel")[0], { opacity: 0, yPercent: -6, scale: 0.98, duration: 0.14, ease: "power2.inOut" }, 0.51)
        .to(q(".founder-panel")[1], { opacity: 1, yPercent: 0, scale: 1, duration: 0.16, ease: "power3.out" }, 0.55)
        .to(q(".founder-stage"), { opacity: 0, y: -24, duration: 0.11, ease: "power2.in" }, 0.78)
        .to(q(".founder-memory-intro"), { opacity: 1, y: 0, duration: 0.14, ease: "expo.out" }, 0.82);
    },
    [stacked],
    (root) => {
      gsap.set(root.querySelectorAll(".founder-panel, .founder-title, .founder-memory-intro"), { opacity: 1, y: 0, yPercent: 0, scale: 1 });
    },
  );

  const panel = (person: (typeof copy.people)[number], i: number) => (
    <article
      key={person.n}
      className="founder-panel"
      style={{
        position: stacked ? "relative" : "absolute",
        inset: stacked ? undefined : 0,
        display: "grid",
        gridTemplateColumns: "1fr",
        minHeight: stacked ? undefined : "70vh",
        overflow: "hidden",
        background: i ? "#121215" : "#0d0d10",
      }}
    >
      <Portrait person={person} index={i} />
      <div style={{ position: stacked ? "relative" : "absolute", right: stacked || compact ? 0 : "4vw", bottom: stacked || compact ? 0 : "4vh", width: stacked || compact ? "100%" : "min(54vw, 760px)", padding: `clamp(26px, 4vw, 58px)`, background: "rgba(8,8,11,.9)", backdropFilter: "blur(24px)", border: `1px solid ${hexA("#fff", .13)}` }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: space.xl }}>
          <div>
            <p style={{ margin: 0, ...typeScale.eyebrow, color: color.accentOnDark }}>{person.role}</p>
            <h3 style={{ margin: `${space.md}px 0 0`, ...typeScale.h1, color: color.textOnDark }}>{person.name}</h3>
          </div>
          <span style={{ ...typeScale.numberXl, lineHeight: .75, color: hexA(color.accentBright, 0.34) }}>{person.n}</span>
        </div>
        <p style={{ margin: `${space.xl}px 0 0`, ...typeScale.bodyLg, color: color.textOnDarkMuted, maxWidth: "48ch" }}>{person.bio}</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: space.xl, borderTop: `1px solid ${hexA("#fff", .12)}` }}>
          {["Strategy", "Direction", "Delivery"].map((item, n) => <span key={item} style={{ padding: `${space.md}px 0 0`, ...typeScale.eyebrow, color: n === i ? color.accentOnDark : color.textOnDarkMuted }}>{item}</span>)}
        </div>
      </div>
    </article>
  );

  if (stacked) {
    return (
      <section id="founders" ref={rootRef} style={{ position: "relative", padding: `${layout.section} ${layout.pad}`, background: color.black, overflow: "hidden" }}>
        <MicroLabel tone="accent">{copy.label}</MicroLabel>
        <h2 style={{ margin: `${space.lg}px 0 ${space.xxl}px`, ...typeScale.displayLg, color: color.textOnDark }}>{copy.headline}</h2>
        <div style={{ display: "grid", gap: space.xxl }}>{copy.people.map(panel)}</div>
        <div style={{ marginTop: layout.section }}>
          <h3 style={{ ...typeScale.h1, color: color.textOnDark }}>Built together.</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: space.lg, paddingBottom: 120 }}>{copy.memories.map((m, i) => <Memory key={m.n} item={m} index={i} />)}</div>
        </div>
      </section>
    );
  }

  return (
    <section id="founders" ref={rootRef} style={{ position: "relative", height: scrollLength, background: color.black, color: color.textOnDark }}>
      <div style={{ position: "sticky", top: 0, height: "100vh", overflow: "hidden", padding: `${space.xl}px ${layout.pad}` }}>
        <Grain opacity={0.12} />
        <div className="founder-intro" style={{ position: "absolute", inset: 0, zIndex: 3, display: "grid", placeItems: "center" }}>
          <div style={{ position: "relative", width: "min(1040px, 76vw)", height: "clamp(220px, 31vh, 360px)", display: "grid", placeItems: "center", overflow: "hidden", background: "#141417" }}>
            <MicroLabel tone="accent" style={{ position: "absolute", top: space.xl, left: space.xl }}>{copy.label}</MicroLabel>
            <div style={{ width: "100%", overflow: "hidden" }}>
              <h2 className="founder-title" style={{ margin: 0, ...typeScale.displayLg, fontSize: "clamp(108px, 14vw, 230px)", fontWeight: 400, lineHeight: 0.78, whiteSpace: "nowrap", letterSpacing: "-0.065em", transform: "translateX(-7%)" }}>{copy.headline}</h2>
            </div>
          </div>
        </div>
        <div className="founder-stage" style={{ position: "absolute", left: layout.pad, right: layout.pad, top: "12vh", bottom: "7vh" }}>{copy.people.map(panel)}</div>
        <div className="founder-memory-intro" style={{ position: "absolute", inset: `${space.xxl}px ${layout.pad}`, opacity: 0, zIndex: 4 }}>
          <MicroLabel tone="accent">Shared history</MicroLabel>
          <h3 style={{ margin: `${space.md}px 0 0`, ...typeScale.h1 }}>Built together.</h3>
          <div style={{ position: "absolute", left: "4vw", right: "2vw", top: "22vh", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", alignItems: "center", gap: 0 }}>
            {copy.memories.map((m, i) => <Memory key={m.n} item={m} index={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
