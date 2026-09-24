"use client";

import { useRef, useState } from "react";

const TRACK_TITLE = "Back to You";

export function VinylPlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [pending, setPending] = useState(false);

  async function togglePlayback() {
    const track = audio.current;
    if (!track || pending) return;

    if (!track.paused) {
      track.pause();
      track.currentTime = 0;
      return;
    }

    setPending(true);
    try {
      await track.play();
    } catch {
      setPlaying(false);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className="vinyl-button absolute inset-0 cursor-pointer rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        data-playing={playing}
        aria-label={
          playing ? `Stop ${TRACK_TITLE}` : `Play my song, ${TRACK_TITLE}`
        }
        aria-pressed={playing}
        aria-busy={pending}
        onClick={togglePlayback}
      >
        <span className="vinyl-record" aria-hidden="true">
          <span className="vinyl-label" />
        </span>
        <span className="vinyl-tonearm" aria-hidden="true" />
      </button>
      <audio
        ref={audio}
        src="/audio/back-to-you.mp3"
        preload="none"
        onPlaying={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onError={() => {
          setPlaying(false);
          setPending(false);
        }}
      />
    </>
  );
}
