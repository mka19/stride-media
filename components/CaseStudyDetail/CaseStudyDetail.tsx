import { useEffect, useState } from "react";
import { ArrowIcon, MicroLabel, StrideMark } from "../shared/primitives";
import { caseStudies, type CaseStudyRecord } from "./caseStudies";

const sectionLinks = [
  ["summary", "Summary"], ["client", "The client"], ["challenge", "Challenge"],
  ["strategy", "Strategy"], ["work", "What we did"], ["results", "Results"],
] as const;

export default function CaseStudyDetail({ study }: { study: CaseStudyRecord }) {
  const [activeSection, setActiveSection] = useState("summary");

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
    <main className="study-page">
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
                {chapter.bullets && <div className="study-bullets">{chapter.bullets.map((bullet) => <div key={bullet.title}><h3>{bullet.title}</h3><p>{bullet.body}</p></div>)}</div>}
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
