import { useEffect, useRef, useState } from "react";
import { ArrowIcon, MicroLabel, StrideMark } from "../shared/primitives";
import { reels, type Reel } from "./videoData";
import Footer from "../Footer/Footer";

function ReelCard({ reel, activeId, setActiveId }: { reel: Reel; activeId: string | null; setActiveId: (id: string | null) => void }) {
  const playing = activeId === reel.id;
  const videoRef = useRef<HTMLVideoElement>(null);
  const src = `/case-studies/videos/ig-${reel.id}.mp4`;
  const poster = `/case-studies/videos/ig-${reel.id}.jpg`;
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) void video.play().catch(() => setActiveId(null));
    else video.pause();
  }, [playing, setActiveId]);

  const togglePlayback = () => {
    const video = videoRef.current;
    if (!video) return;
    if (playing) {
      video.pause();
      setActiveId(null);
      return;
    }
    video.muted = false;
    video.volume = 1;
    setActiveId(reel.id);
    void video.play().catch(() => setActiveId(null));
  };

  return <article className="video-library-card">
    <div className="video-library-frame">
      <video ref={videoRef} src={src} poster={poster} playsInline preload="none" onClick={togglePlayback} onEnded={() => setActiveId(null)} />
      <button type="button" className="video-library-play" onClick={togglePlayback} aria-label={`${playing ? "Pause" : "Play"} ${reel.title}`}><span>{playing ? "Ⅱ" : "▶"}</span></button>
    </div>
    <div className="video-library-copy"><span>{reel.handle}</span><h2>{reel.title}</h2><div><strong>{reel.views ? `${reel.views}+ views` : "Watch the reel"}</strong><a href={reel.instagram} target="_blank" rel="noreferrer">Instagram <ArrowIcon /></a></div></div>
  </article>;
}

export default function VideoLibrary() {
  const [activeId, setActiveId] = useState<string | null>(null);
  return <main className="video-library-page">
    <header className="video-library-nav"><a href="/" aria-label="Stride Media home"><StrideMark size={34} /><span>STRIDE MEDIA</span></a><a className="video-library-back" href="/#results"><span aria-hidden="true">←</span><span>Back to results</span></a></header>
    <section className="video-library-hero"><MicroLabel tone="accent">Real videos · real results</MicroLabel><h1>Every reel.<br />One place.</h1><p>Verified client work. Tap to play here, or open the original reel on Instagram.</p></section>
    <section className="video-library-grid" aria-label="Client video library">{reels.map((reel) => <ReelCard key={reel.id} reel={reel} activeId={activeId} setActiveId={setActiveId} />)}</section>
    <Footer />
  </main>;
}
