import { useEffect, useRef, useState } from "react";
import { founders as copy } from "../shared/copy";
import { color, ease, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { useBreakpoint, useStacked } from "../shared/responsive";
import { Grain, MicroLabel } from "../shared/primitives";
import GradientRevealText from "../shared/GradientRevealText";

type Person = (typeof copy.people)[number];
type MemoryItem = (typeof copy.memories)[number];

function Portrait({ person, index }: { person: Person; index: number }) {
  return <div style={{ position: "relative", width: "100%", height: "100%", minHeight: 360, overflow: "hidden", background: person.image ? `url(${person.image}) center/cover no-repeat` : `radial-gradient(circle at ${index ? "68% 24%" : "32% 24%"}, ${hexA(color.accentBright, .62)}, transparent 21%), radial-gradient(circle at ${index ? "30% 80%" : "72% 78%"}, ${hexA(color.accentDeep, .46)}, transparent 35%), linear-gradient(145deg, #30145f, #121017 48%, #050505)` }}>
    {!person.image && <><div style={{ position: "absolute", left: index ? "53%" : "29%", top: "17%", width: "17%", aspectRatio: "1 / 1.16", borderRadius: "48%", background: "radial-gradient(circle at 38% 28%, rgba(255,255,255,.28), rgba(255,255,255,.07) 46%, rgba(0,0,0,.32) 76%)", boxShadow: `0 0 90px ${hexA(color.accentBright, .17)}` }} /><div style={{ position: "absolute", left: index ? "29%" : "5%", bottom: "-15%", width: "66%", height: "64%", borderRadius: "50% 50% 8% 8% / 25% 25% 8% 8%", background: "linear-gradient(118deg, rgba(255,255,255,.17), rgba(255,255,255,.03) 40%, rgba(0,0,0,.54))" }} /></>}
    <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, transparent 52%, rgba(0,0,0,.78))" }} />
    <span style={{ position: "absolute", left: space.lg, bottom: space.lg, ...typeScale.eyebrow, color: hexA("#fff", .58) }}>Founder portrait · {person.n}</span>
  </div>;
}

function ProfileCard({ person, index, compact }: { person: Person; index: number; compact: boolean }) {
  return <article style={{ position: "relative", display: "grid", gridTemplateColumns: compact ? "1fr" : "minmax(300px, .9fr) minmax(420px, 1.1fr)", minHeight: compact ? undefined : "min(680px, 78vh)", overflow: "hidden", background: index ? "#111114" : "#0c0c0f", border: `1px solid ${hexA("#fff", .14)}`, boxShadow: "0 28px 90px rgba(0,0,0,.34)" }}>
    <div style={{ minHeight: compact ? "clamp(360px, 54vh, 500px)" : undefined }}><Portrait person={person} index={index} /></div>
    <div style={{ position: "relative", display: "flex", flexDirection: "column", justifyContent: "space-between", padding: compact ? "28px 22px 22px" : "clamp(36px, 5vw, 76px)", background: `radial-gradient(circle at 0 0, ${hexA(color.accent, .13)}, transparent 40%)` }}>
      <div><div style={{ display: "flex", alignItems: "start", justifyContent: "space-between", gap: space.lg }}><p style={{ margin: 0, ...typeScale.eyebrow, color: color.accentOnDark }}>{person.role}</p><span style={{ ...typeScale.numberXl, fontSize: compact ? 66 : undefined, lineHeight: .72, color: hexA(color.accentBright, .31) }}>{person.n}</span></div><h3 style={{ margin: `${space.lg}px 0 0`, ...typeScale.h1, color: color.textOnDark }}>{person.name}</h3><p style={{ margin: `${space.xl}px 0 0`, maxWidth: "48ch", ...typeScale.bodyLg, color: color.textOnDarkMuted }}>{person.bio}</p></div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", marginTop: compact ? 46 : space.xxl, borderTop: `1px solid ${hexA("#fff", .13)}` }}>{["Strategy", "Direction", "Delivery"].map((item, n) => <span key={item} style={{ padding: `${space.md}px 0`, borderRight: n < 2 ? `1px solid ${hexA("#fff", .13)}` : 0, textAlign: "center", ...typeScale.eyebrow, color: n === index ? color.accentOnDark : color.textOnDarkMuted }}>{item}</span>)}</div>
    </div>
  </article>;
}

function MemoryCard({ item, index, compact }: { item: MemoryItem; index: number; compact: boolean }) {
  const root = useRef<HTMLElement | null>(null);
  const [active, setActive] = useState(false);
  const rotations = [-3.2, 2.6, -2.1, 3.4];
  useEffect(() => { if (!compact || !root.current) return; const observer = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), { rootMargin: "-28% 0px -34%", threshold: .24 }); observer.observe(root.current); return () => observer.disconnect(); }, [compact]);
  return <article ref={root} tabIndex={0} onMouseEnter={() => setActive(true)} onMouseLeave={() => setActive(false)} onFocus={() => setActive(true)} onBlur={() => setActive(false)} style={{ position: "relative", zIndex: active ? 10 : 4 - index, transform: `translate3d(0, ${active ? -14 : 0}px, 0) rotate(${active || compact ? 0 : rotations[index]}deg) scale(${active ? 1.025 : 1})`, filter: active ? "brightness(1)" : "brightness(.82)", transition: `transform 900ms ${ease.out}, filter 700ms ${ease.out}`, outline: "none" }}>
    <div style={{ padding: compact ? 8 : 11, background: "#ededf0", boxShadow: active ? "0 32px 85px rgba(0,0,0,.52)" : "0 14px 38px rgba(0,0,0,.32)", transition: `box-shadow 700ms ${ease.out}` }}><div style={{ aspectRatio: "4 / 5", background: item.image ? `url(${item.image}) center/cover no-repeat` : `linear-gradient(${132 + index * 27}deg, ${hexA(color.accent, .88)}, #21162f 48%, #08080a)`, transform: `scale(${active ? 1.018 : 1})`, transition: `transform 1000ms ${ease.out}` }} /></div>
    <div style={{ minHeight: compact ? 84 : 94, padding: `${space.lg}px ${space.s}px 0`, textAlign: "center", color: color.textOnDark, opacity: active || compact ? 1 : .42, transform: `translateY(${active || compact ? 0 : 8}px)`, transition: `opacity 600ms ${ease.out}, transform 700ms ${ease.out}` }}><strong style={{ ...typeScale.bodyLg, fontWeight: 500 }}>{item.title}</strong><span style={{ display: "block", marginTop: 5, ...typeScale.eyebrow, color: color.textOnDarkMuted }}>{item.meta}</span></div>
  </article>;
}

export default function Founders() {
  const bp = useBreakpoint();
  const compact = useStacked() || bp === "tablet";
  return <section id="founders" style={{ position: "relative", padding: `${layout.section} ${layout.pad}`, background: color.black, color: color.textOnDark, overflow: "clip" }}>
    <Grain opacity={.1} />
    <div style={{ position: "relative", zIndex: 1, maxWidth: 1600, margin: "0 auto" }}>
      <header style={{ maxWidth: 900, margin: "0 auto", textAlign: "center" }}><MicroLabel tone="accent">{copy.label}</MicroLabel><GradientRevealText as="h2" tone="dark" style={{ margin: `${rhythm.eyebrowToHeadline}px 0 0`, ...typeScale.h1, color: color.textOnDark }}>{copy.headline}</GradientRevealText><p style={{ margin: `${space.lg}px auto 0`, maxWidth: "52ch", ...typeScale.bodyLg, color: color.textOnDarkMuted }}>Two perspectives, one system, built to make expertise impossible to ignore.</p></header>
      <div style={{ position: "relative", marginTop: compact ? space.xl : layout.section }}>{copy.people.map((person, index) => <div key={person.n} style={{ position: compact ? "relative" : "sticky", top: compact ? undefined : `calc(${layout.navHeight}px + ${28 + index * 20}px)`, zIndex: index + 1, marginTop: index ? (compact ? space.xl : "22vh") : 0 }}><ProfileCard person={person} index={index} compact={compact} /></div>)}</div>
      <section style={{ marginTop: compact ? layout.section : "clamp(120px, 15vw, 230px)" }}><header style={{ textAlign: "center", marginBottom: compact ? space.xl : space.xxl }}><MicroLabel tone="accent">Shared history</MicroLabel><h3 style={{ margin: `${space.md}px 0 0`, ...typeScale.h1, color: color.textOnDark }}>Built together.</h3></header><div style={{ display: "grid", gridTemplateColumns: compact ? "1fr" : "repeat(4, minmax(0, 1fr))", alignItems: "center", gap: compact ? space.xl : "clamp(12px, 1.5vw, 28px)", maxWidth: compact ? 560 : undefined, margin: "0 auto" }}>{copy.memories.map((item, index) => <MemoryCard key={item.n} item={item} index={index} compact={compact} />)}</div></section>
    </div>
  </section>;
}
