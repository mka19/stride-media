import { useState } from "react";
import { ArrowIcon, MicroLabel, StrideMark } from "../shared/primitives";
import { reels, type Reel } from "./videoData";

function ReelCard({ reel }: { reel: Reel }) {
  const [playing, setPlaying] = useState(false);
  const src = `/case-studies/videos/ig-${reel.id}.mp4`;
  const poster = `/case-studies/videos/ig-${reel.id}.jpg`;
  return <article className="video-library-card">
    <div className="video-library-frame">
      {playing ? <video src={src} controls autoPlay playsInline preload="metadata" /> : <button type="button" onClick={() => setPlaying(true)} aria-label={`Play ${reel.title}`}><img src={poster} alt="" loading="lazy" decoding="async" /><span>▶</span></button>}
    </div>
    <div className="video-library-copy"><span>{reel.handle}</span><h2>{reel.title}</h2><div><strong>{reel.views ? `${reel.views}+ views` : "Watch the reel"}</strong><a href={reel.instagram} target="_blank" rel="noreferrer">Instagram <ArrowIcon /></a></div></div>
  </article>;
}

export default function VideoLibrary() {
  return <main className="video-library-page">
    <header className="video-library-nav"><a href="/" aria-label="Stride Media home"><StrideMark size={34} /><span>STRIDE MEDIA</span></a><a href="/#results">← Back to results</a></header>
    <section className="video-library-hero"><MicroLabel tone="accent">Real videos · real results</MicroLabel><h1>Every reel.<br />One place.</h1><p>Verified client work. Tap to play here, or open the original reel on Instagram.</p></section>
    <section className="video-library-grid" aria-label="Client video library">{reels.map((reel) => <ReelCard key={reel.id} reel={reel} />)}</section>
  </main>;
}
