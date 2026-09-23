import { useState } from "react";
import { faq as copy } from "../shared/copy";
import { color, ease, hexA, layout, rhythm, space, typeScale } from "../shared/theme";
import { MicroLabel } from "../shared/primitives";
import GradientRevealText from "../shared/GradientRevealText";

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return <section id="faq" style={{ position: "relative", padding: `${layout.section} ${layout.pad}`, background: color.black, color: color.textOnDark, overflow: "hidden" }}>
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, background: `radial-gradient(circle at 82% 12%, ${hexA(color.accent, .13)}, transparent 28%)`, pointerEvents: "none" }} />
    <div style={{ position: "relative", width: "100%", maxWidth: 1280, margin: "0 auto" }}>
      <header style={{ display: "grid", gridTemplateColumns: "minmax(0, .72fr) minmax(280px, 1.28fr)", gap: "clamp(32px, 7vw, 110px)", alignItems: "end", paddingBottom: "clamp(34px, 5vw, 70px)", borderBottom: `1px solid ${color.hairlineOnDark}` }} className="faq-premium-header">
        <div><MicroLabel tone="accent">Questions, answered</MicroLabel><GradientRevealText as="h2" tone="dark" style={{ margin: `${rhythm.eyebrowToHeadline}px 0 0`, ...typeScale.h1, lineHeight: 1.02, color: color.textOnDark }}>{copy.label}</GradientRevealText></div>
        <p style={{ margin: 0, maxWidth: "48ch", ...typeScale.bodyLg, lineHeight: 1.55, color: color.textOnDarkMuted }}>Everything you need to know before building a consistent content system with Stride.</p>
      </header>

      <div style={{ marginTop: space.lg }}>
        {copy.items.map((item, i) => {
          const active = open === i;
          return <article key={item.q} style={{ borderBottom: `1px solid ${color.hairlineOnDark}` }}>
            <button type="button" id={`faq-q-${i}`} aria-expanded={active} aria-controls={`faq-a-${i}`} onClick={() => setOpen(active ? null : i)} style={{ width: "100%", display: "grid", gridTemplateColumns: "52px minmax(0,1fr) 36px", gap: space.md, alignItems: "center", padding: "clamp(22px, 2.8vw, 36px) 0", border: 0, background: "transparent", color: color.textOnDark, textAlign: "left", cursor: "pointer", font: "inherit" }}>
              <span style={{ ...typeScale.eyebrow, color: active ? color.accentOnDark : color.textOnDarkMuted, transition: `color 400ms ${ease.out}` }}>{String(i + 1).padStart(2, "0")}</span>
              <span style={{ ...typeScale.h3, lineHeight: 1.18 }}>{item.q}</span>
              <span aria-hidden="true" style={{ width: 34, height: 34, display: "grid", placeItems: "center", borderRadius: "50%", border: `1px solid ${active ? hexA(color.accent, .7) : color.hairlineOnDark}`, color: active ? color.accentOnDark : color.textOnDarkMuted, transform: `rotate(${active ? 45 : 0}deg)`, transition: `transform 500ms ${ease.out}, border-color 400ms ${ease.out}` }}>+</span>
            </button>
            <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} style={{ display: "grid", gridTemplateRows: active ? "1fr" : "0fr", transition: `grid-template-rows 520ms ${ease.out}` }}><div style={{ overflow: "hidden" }}><p style={{ margin: 0, padding: `0 52px ${space.xl}px 68px`, maxWidth: "70ch", ...typeScale.bodyLg, lineHeight: 1.6, color: color.textOnDarkMuted }}>{item.a}</p></div></div>
          </article>;
        })}
      </div>
    </div>
    <style>{`@media (max-width: 768px){.faq-premium-header{grid-template-columns:1fr!important;gap:18px!important}.faq-premium-header + div button{grid-template-columns:36px minmax(0,1fr) 32px!important;gap:10px!important}.faq-premium-header + div article p{padding-left:46px!important;padding-right:8px!important}}`}</style>
  </section>;
}
