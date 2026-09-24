/* eslint-disable @next/next/no-img-element */
"use client";

import { Play } from "lucide-react";
import { useState } from "react";

interface Props {
  videoId: string;
  title: string;
  description: string;
}

/**
 * YouTube card that only mounts the iframe once the viewer asks for it.
 * Until then it's just the poster frame, so a page full of these costs
 * nothing and sets no third-party cookies.
 */
export function VideoCard({ videoId, title, description }: Props) {
  const [playing, setPlaying] = useState(false);

  return (
    <article className="flex flex-col h-full border border-border rounded-xl overflow-hidden hover:ring-2 hover:ring-muted transition-all duration-200">
      <div className="relative aspect-video bg-muted">
        {playing ? (
          <iframe
            title={title}
            src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1`}
            className="absolute inset-0 h-full w-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
          />
        ) : (
          <button
            type="button"
            onClick={() => setPlaying(true)}
            aria-label={`Play ${title}`}
            className="group absolute inset-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-inset"
          >
            <img
              src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
              alt=""
              loading="lazy"
              className="absolute inset-0 h-full w-full object-cover"
            />
            <span className="absolute inset-0 bg-black/20 transition-colors duration-200 group-hover:bg-black/40" />
            <span className="absolute inset-0 flex items-center justify-center">
              <span className="flex size-12 items-center justify-center rounded-full border border-border bg-background/90 shadow-lg transition-transform duration-200 group-hover:scale-110">
                <Play className="size-5 translate-x-px fill-foreground text-foreground" />
              </span>
            </span>
          </button>
        )}
      </div>
      <div className="p-6 flex flex-col gap-1 flex-1">
        <h3 className="font-semibold text-sm">{title}</h3>
        <p className="text-xs text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </article>
  );
}
