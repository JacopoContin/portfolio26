"use client";

import BlurFade from "@/components/magicui/blur-fade";
import { VideoCard } from "@/components/video-card";
import { DATA } from "@/data/resume";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

const BLUR_FADE_DELAY = 0.04;
const ROTATE_MS = 6000;

function OnRepeat() {
  const tracks = DATA.music.onRepeat;
  const [active, setActive] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);

  useEffect(() => {
    if (!autoRotate) return;
    const timer = window.setInterval(
      () => setActive((prev) => (prev + 1) % tracks.length),
      ROTATE_MS
    );
    return () => window.clearInterval(timer);
  }, [autoRotate, tracks.length]);

  // Any deliberate interaction wins over the carousel, so a track the
  // viewer picked is never swapped out from under them.
  const stopRotating = () => setAutoRotate(false);
  const current = tracks[active];

  return (
    <div className="flex flex-col gap-4">
      <div
        className="rounded-xl border border-border overflow-hidden"
        onMouseEnter={stopRotating}
        onTouchStart={stopRotating}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={current.trackId}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          >
            <iframe
              title={`${current.artist} - ${current.track}`}
              src={`https://open.spotify.com/embed/track/${current.trackId}?utm_source=generator`}
              className="w-full block h-38"
              allow="clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            />
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="flex items-center justify-center gap-2">
        {tracks.map((track, index) => (
          <button
            key={track.trackId}
            type="button"
            onClick={() => {
              setActive(index);
              stopRotating();
            }}
            aria-label={`Play ${track.track} by ${track.artist}`}
            aria-pressed={index === active}
            className="h-9 w-10 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm"
          >
            <span
              className={cn(
                "h-0.5 w-7 rounded-full transition-colors duration-200",
                index === active ? "bg-foreground" : "bg-border"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function MusicSection() {
  return (
    <section id="music">
      <div className="flex min-h-0 flex-col gap-y-8">
        <div className="flex flex-col gap-y-4 items-center justify-center">
          <div className="flex items-center w-full">
            <div className="flex-1 h-px bg-linear-to-r from-transparent from-5% via-border via-95% to-transparent" />
            <div className="border bg-primary z-10 rounded-xl px-4 py-1">
              <span className="text-background text-sm font-medium">Music</span>
            </div>
            <div className="flex-1 h-px bg-linear-to-l from-transparent from-5% via-border via-95% to-transparent" />
          </div>
          <div className="flex flex-col gap-y-3 items-center justify-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">
              What I listen to, what I play
            </h2>
            <p className="text-muted-foreground md:text-lg/relaxed lg:text-base/relaxed xl:text-lg/relaxed text-balance text-center">
              A mix of what currently inspires me, plus a few original cuts and
              live recordings from my time gigging around Bangkok.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-10 max-w-200 mx-auto w-full">
          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-medium uppercase tracking-label text-muted-foreground">
              On repeat
            </h3>
            <BlurFade delay={BLUR_FADE_DELAY * 12}>
              <OnRepeat />
            </BlurFade>
          </div>

          <div className="flex flex-col gap-4">
            <h3 className="text-xs font-medium uppercase tracking-label text-muted-foreground">
              Sessions &amp; live
            </h3>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 auto-rows-fr">
              {DATA.music.sessions.map((session, id) => (
                <BlurFade
                  key={session.videoId}
                  delay={BLUR_FADE_DELAY * 13 + id * 0.05}
                  className="h-full"
                >
                  <VideoCard
                    videoId={session.videoId}
                    title={session.title}
                    description={session.description}
                  />
                </BlurFade>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
