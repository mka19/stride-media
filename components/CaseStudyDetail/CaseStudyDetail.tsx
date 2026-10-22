import { useEffect, useRef, useState } from "react";
import { ArrowIcon, MicroLabel, StrideMark } from "../shared/primitives";
import { caseStudies, type CaseStudyRecord } from "./caseStudies";

const sectionLinks = [
  ["summary", "Summary"], ["client", "The client"], ["challenge", "Challenge"],
  ["strategy", "Strategy"], ["work", "What we did"], ["results", "Results"],
] as const;

function BulletIcon({ title }: { title: string }) {
  const key = title.toLowerCase();
  const path = key.includes("voice") || key.includes("camera coaching")
    ? <><path d="M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM6 10v1a6 6 0 0 0 12 0v-1M12 17v4M9 21h6" /></>
    : key.includes("language") || key.includes("tone")
      ? <path d="M4 5h16v11H9l-5 4zm4 4h8M8 12h5" />
      : key.includes("hook")
        ? <path d="M7 4v8a5 5 0 0 0 10 0V7M7 7h4M13 7h4M5 4h4M15 4h4" />
        : key.includes("lead capture") || key.includes("cta") || key.includes("call")
          ? <path d="M4 5h16v11H9l-5 4zm5 5h6m-2-3 3 3-3 3" />
          : key.includes("viewer") || key.includes("investor")
            ? <path d="M12 4a3 3 0 1 0 0 6 3 3 0 0 0 0-6M6 20a6 6 0 0 1 12 0M18 4h3v3M21 4l-4 4" />
            : key.includes("identity") || key.includes("look")
              ? <path d="M12 3 4 8v8l8 5 8-5V8zm0 0v18M4 8l8 5 8-5" />
              : key.includes("format")
                ? <path d="M4 5h7v6H4zm9 0h7v10h-7zM4 13h7v6H4zm9 4h7v2h-7z" />
                : key.includes("script")
                  ? <path d="M6 3h9l3 3v15H6zM15 3v4h4M9 11h6M9 15h6" />
                  : key.includes("produc") || key.includes("shoot") || key.includes("edit")
                    ? <path d="M4 8h3l2-3h6l2 3h3v11H4zm8 3a3 3 0 1 0 0 6 3 3 0 0 0 0-6" />
                    : key.includes("publish") || key.includes("schedule") || key.includes("deliver") || key.includes("consistency")
                      ? <path d="M5 4h14v16H5zM8 2v4M16 2v4M5 9h14M8 13h3M8 16h6" />
                      : key.includes("volume")
                        ? <path d="m12 3 8 4-8 4-8-4zm-8 8 8 4 8-4M4 15l8 4 8-4" />
                        : key.includes("reason") || key.includes("direction") || key.includes("strategy") || key.includes("idea")
                          ? <path d="M9 18h6M10 22h4M8 14a6 6 0 1 1 8 0c-1 1-1.5 2-1.5 4h-5C9.5 16 9 15 8 14" />
                          : <path d="M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5M12 12l9-9m0 0v5m0-5h-5" />;
  return <span className="study-bullet-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">{path}</svg></span>;
}

export default function CaseStudyDetail({ study }: { study: CaseStudyRecord }) {
  const [activeSection, setActiveSection] = useState("summary");
  const [edgeOffset, setEdgeOffset] = useState(0);
  const [edgeDragging, setEdgeDragging] = useState(false);
  const [edgeReturning, setEdgeReturning] = useState(false);
  const edgeStart = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
    document.title = `${study.client} — Stride Media`;
  }, [study]);

  useEffect(() => {
    const sections = sectionLinks
      .map(([id]) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => Math.abs(a.boundingClientRect.top) - Math.abs(b.boundingClientRect.top));
        if (visible[0]) setActiveSection(visible[0].target.id);
      },
      { rootMargin: "-22% 0px -62% 0px", threshold: 0 },
    );
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [study]);

  const current = caseStudies.indexOf(study);
  const next = caseStudies[(current + 1) % caseStudies.length];

  return (
    <main
      className="study-page"
      onTouchStart={(event) => {
        const touch = event.touches[0];
        if (touch && touch.clientX <= 32) { edgeStart.current = { x: touch.clientX, y: touch.clientY }; setEdgeDragging(true); }
      }}
      onTouchMove={(event) => {
        const start = edgeStart.current;
        const touch = event.touches[0];
        if (!start || !touch) return;
        const x = Math.max(0, touch.clientX - start.x);
        const y = Math.abs(touch.clientY - start.y);
        if (y > x) { edgeStart.current = null; setEdgeDragging(false); setEdgeOffset(0); return; }
        setEdgeOffset(Math.min(window.innerWidth * .72, x));
      }}
      onTouchEnd={() => {
        if (!edgeStart.current) return;
        edgeStart.current = null;
        setEdgeDragging(false);
        if (edgeOffset >= 76) {
          setEdgeReturning(true);
          setEdgeOffset(window.innerWidth);
          window.setTimeout(() => window.location.assign("/#case-study"), 220);
        } else setEdgeOffset(0);
      }}
      onTouchCancel={() => { edgeStart.current = null; setEdgeDragging(false); setEdgeOffset(0); }}
      style={{ transform: `translate3d(${edgeOffset}px,0,0)`, transition: edgeDragging ? "none" : `transform ${edgeReturning ? 220 : 280}ms cubic-bezier(.16,1,.3,1)`, boxShadow: edgeOffset ? "-18px 0 48px rgba(0,0,0,.5)" : undefined, willChange: edgeOffset ? "transform" : undefined }}
    >
      <header className="study-topbar">
        <a className="study-brand" href="/" aria-label="Stride Media home"><StrideMark size={34} /><span>STRIDE MEDIA</span></a>
        <a className="study-back" href="/#case-study"><span aria-hidden="true">←</span><span>Back to case studies</span></a>
      </header>

      <div className="study-shell">
        <aside className="study-rail" aria-label="Case study contents">
          <a className="study-rail-back" href="/#case-study"><span aria-hidden="true">←</span><span>Back</span></a>
          <nav>{sectionLinks.map(([id, label], index) => <a key={id} href={`#${id}`} className={activeSection === id ? "is-active" : undefined} aria-current={activeSection === id ? "location" : undefined}><span>{String(index + 1).padStart(2, "0")}</span>{label}</a>)}</nav>
        </aside>

        <article className="study-content">
          <section className={`study-hero${study.portrait ? "" : " study-hero--no-portrait"}`} id="summary">
            {study.portrait && <div className="study-hero-portrait" aria-hidden="true"><img src={study.portrait} alt="" /></div>}
            <div className="study-hero-copy">
              <div className="study-meta"><span>{study.client}</span><span>{study.year}</span></div>
              {study.demo && <MicroLabel tone="accent">Demo case study</MicroLabel>}
              <h1>{study.headline}</h1>
              <p className="study-summary">{study.summary}</p>
            </div>
            <div className="study-context">
              <div><span>Client</span><strong>{study.client}</strong><a href={study.demo ? undefined : `https://instagram.com/${study.handle.replace("@", "")}`} target="_blank" rel="noreferrer">{study.handle}</a></div>
              <div><span>Focus</span><strong>{study.descriptor}</strong></div>
              <div><span>Impact</span>{study.results.slice(0, 3).map((result) => <strong key={result}>{result}</strong>)}</div>
            </div>
          </section>

          <section className="study-glance" aria-labelledby="glance-title">
            <MicroLabel tone="accent">At a glance</MicroLabel>
            <h2 id="glance-title">Before Stride. After Stride.</h2>
            <div className="study-table" role="table">
              <div className="study-row study-row-head" role="row"><span>Metric</span><span>Before</span><span>After</span></div>
              {study.metrics.map((metric) => <div className="study-row" role="row" key={metric.label}><strong>{metric.label}</strong><span>{metric.before}</span><span>{metric.after}</span></div>)}
            </div>
          </section>

          {study.chapters.map((chapter, index) => (
            <section className="study-chapter" id={chapter.id} key={chapter.id}>
              <div className="study-chapter-index">{String(index + 1).padStart(2, "0")}</div>
              <div className="study-chapter-copy">
                <MicroLabel tone="accent">{chapter.label}</MicroLabel>
                <h2>{chapter.title}</h2>
                <p>{chapter.body}</p>
                {chapter.bullets && <div className={`study-bullets study-bullets-${chapter.bullets.length}`}>{chapter.bullets.map((bullet) => <div key={bullet.title}><BulletIcon title={bullet.title} /><h3>{bullet.title}</h3><p>{bullet.body}</p></div>)}</div>}
              </div>
            </section>
          ))}

          <section className="study-results" id="results">
            <MicroLabel tone="accent">The results</MicroLabel>
            <h2>{study.demo ? "How the final results chapter will read." : "The numbers that moved."}</h2>
            <div className="study-result-list">{study.results.map((result, index) => <div key={result}><span>{String(index + 1).padStart(2, "0")}</span><p>{result}</p></div>)}</div>
          </section>

          {study.reels && <section className="study-reels">
            <MicroLabel tone="accent">Top-performing content</MicroLabel>
            <h2>Watch the work.</h2>
            <div>{study.reels.map((reel, index) => <a href={reel.url} target="_blank" rel="noreferrer" key={reel.url}><span>Reel {String(index + 1).padStart(2, "0")}</span><strong>{reel.views} views</strong><ArrowIcon /></a>)}</div>
          </section>}

          <a className="study-next" href={`/case-studies/${next.slug}`}>
            <span>Next case study</span><strong>{next.client}</strong><ArrowIcon size={28} />
          </a>
        </article>
      </div>
    </main>
  );
}
