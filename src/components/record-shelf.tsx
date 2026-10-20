/* eslint-disable @next/next/no-img-element */
"use client";

import { Icons } from "@/components/icons";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

export type ShelfRecord = {
  uri: string;
  artist: string;
  title: string;
  cover: string | null;
};

type PlaybackUpdate = { data: { isPaused: boolean; isBuffering: boolean } };

type SpotifyController = {
  loadUri: (uri: string) => void;
  play: () => void;
  togglePlay: () => void;
  addListener: (event: "playback_update", cb: (e: PlaybackUpdate) => void) => void;
  destroy: () => void;
};

type SpotifyIFrameAPI = {
  createController: (
    el: HTMLElement,
    options: { uri: string; width: string; height: number; theme?: "dark" },
    cb: (controller: SpotifyController) => void
  ) => void;
};

declare global {
  interface Window {
    onSpotifyIframeApiReady?: (api: SpotifyIFrameAPI) => void;
  }
}

let spotifyApi: Promise<SpotifyIFrameAPI> | null = null;

// The iFrame API script calls a global when it's ready, and only once, so
// every mount shares the same promise.
function loadSpotifyApi() {
  spotifyApi ??= new Promise((resolve) => {
    window.onSpotifyIframeApiReady = resolve;
    const script = document.createElement("script");
    script.src = "https://open.spotify.com/embed/iframe-api/v1";
    script.async = true;
    document.body.appendChild(script);
  });
  return spotifyApi;
}

const EASE = [0.22, 1, 0.36, 1] as const;

function toSpotifyLink(uri: string) {
  const [, type, id] = uri.split(":");
  return `https://open.spotify.com/${type}/${id}`;
}

export function RecordShelf({ records }: { records: ShelfRecord[] }) {
  const [active, setActive] = useState(0);
  const [playing, setPlaying] = useState(false);
  const embedRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<SpotifyController | null>(null);
  const firstUri = useRef(records[0].uri);
  const current = records[active];

  useEffect(() => {
    const mount = embedRef.current;
    if (!mount) return;
    let cancelled = false;

    // The API swaps the element it's given for an iframe, so hand it a node
    // React doesn't own.
    const host = document.createElement("div");
    mount.appendChild(host);

    loadSpotifyApi().then((api) => {
      if (cancelled) return;
      api.createController(
        host,
        // The dark theme drops the per-album background color, so the bar
        // stays quiet next to the turntable.
        { uri: firstUri.current, width: "100%", height: 80, theme: "dark" },
        (controller) => {
          if (cancelled) return controller.destroy();
          controllerRef.current = controller;
          controller.addListener("playback_update", (e) =>
            setPlaying(!e.data.isPaused && !e.data.isBuffering)
          );
        }
      );
    });

    return () => {
      cancelled = true;
      controllerRef.current?.destroy();
      controllerRef.current = null;
      mount.replaceChildren();
    };
  }, []);

  function putOn(index: number) {
    if (index === active) {
      controllerRef.current?.togglePlay();
      return;
    }
    setActive(index);
    setPlaying(false);
    controllerRef.current?.loadUri(records[index].uri);
    controllerRef.current?.play();
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="shelf flex flex-col gap-3 rounded-2xl border p-3 sm:p-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="turntable w-full self-start rounded-xl border sm:w-2/3" data-playing={playing}>
            <div className="turntable-platter">
              <AnimatePresence initial={false}>
                <motion.div
                  key={current.uri}
                  className="turntable-disc"
                  initial={{ opacity: 0, scale: 1.08, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <div className="turntable-record">
                    <div className="turntable-label">
                      {current.cover && (
                        <img src={current.cover} alt="" className="size-full object-cover" />
                      )}
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
              <div className="turntable-sheen" />
            </div>

            {/* Tonearm, drawn in the plinth's 100x75 space. Colors and
                finishes come from data-part rules in globals.css. */}
            <svg className="turntable-arm" viewBox="0 0 100 75" aria-hidden="true">
              <defs>
                <radialGradient id="tt-metal" cx="35%" cy="30%" r="75%">
                  <stop offset="0" data-part="stop-hi" />
                  <stop offset="0.55" data-part="stop-mid" />
                  <stop offset="1" data-part="stop-lo" />
                </radialGradient>
              </defs>

              {/* Bearing housing and the rest the arm parks on. */}
              <circle cx="86" cy="11" r="7.5" data-part="base" />
              <circle cx="86" cy="11" r="5.2" fill="url(#tt-metal)" data-part="ring" />
              <rect x="84.2" y="31.5" width="3.6" height="3" rx="0.8" data-part="rest" />

              <g className="turntable-arm-swing">
                {/* Counterweight with machined ridges. */}
                <rect x="83.4" y="1.2" width="5.2" height="5.6" rx="1" fill="url(#tt-metal)" data-part="weight" />
                <path d="M83.6 2.8 H88.4 M83.6 4 H88.4 M83.6 5.2 H88.4" data-part="ridges" />

                {/* Tube: a body stroke with a thin highlight reads as polished metal. */}
                <path d="M86 6 L86 40 L82 50" data-part="tube" />
                <path d="M85.6 7 L85.6 40 L81.7 49.4" data-part="tube-hi" />

                {/* Headshell with finger lift and cartridge. */}
                <g transform="translate(82 50) rotate(22)">
                  <path d="M-1.5 -0.6 H1.5 L2.3 6.2 Q0 7 -2.3 6.2 Z" data-part="headshell" />
                  <path d="M2 0.8 L4.4 0.2" data-part="lift" />
                  <rect x="-1.4" y="2.2" width="2.8" height="3.2" rx="0.4" data-part="cartridge" />
                </g>
              </g>

              <circle cx="86" cy="11" r="2.2" fill="url(#tt-metal)" data-part="cap" />
            </svg>

            {/* A start/stop key on the plinth: it travels down when pressed,
                and the pilot light beside it shows the motor is on. */}
            <div className="turntable-start">
              <span aria-hidden="true" className="turntable-led" />
              <button
                type="button"
                onClick={() => controllerRef.current?.togglePlay()}
                aria-label={playing ? `Stop ${current.title}` : `Start ${current.title}`}
                aria-pressed={playing}
                className="turntable-key cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                <svg viewBox="0 0 20 10" aria-hidden="true" className="turntable-glyph">
                  <path d="M2 1.5 L8 5 L2 8.5 Z" />
                  <rect x="11.5" y="1.5" width="2" height="7" rx="0.4" />
                  <rect x="15.5" y="1.5" width="2" height="7" rx="0.4" />
                </svg>
              </button>
            </div>
          </div>

          <ul className="grid grid-cols-5 gap-2 sm:flex-1 sm:grid-cols-2 sm:content-start sm:gap-3">
            {records.map((record, index) => {
              const onPlatter = index === active;
              return (
                <li key={record.uri}>
                  <motion.button
                    type="button"
                    onClick={() => putOn(index)}
                    aria-label={`Put on ${record.title} by ${record.artist}`}
                    aria-current={onPlatter}
                    title={`${record.artist}, ${record.title}`}
                    whileHover="pulled"
                    whileFocus="pulled"
                    className="group relative block aspect-square w-full cursor-pointer rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {/* The record sliding out of its sleeve. The one on the
                        platter leaves its sleeve empty. */}
                    {!onPlatter && (
                      <motion.span
                        aria-hidden="true"
                        className="sleeve-record"
                        variants={{ pulled: { x: "18%" } }}
                        transition={{ duration: 0.3, ease: EASE }}
                      />
                    )}
                    <span
                      className={cn(
                        "relative block size-full overflow-hidden rounded-md border bg-muted shadow-sm transition-opacity duration-300",
                        onPlatter && "opacity-35"
                      )}
                    >
                      {record.cover && (
                        <img src={record.cover} alt="" loading="lazy" className="size-full object-cover" />
                      )}
                    </span>
                  </motion.button>
                </li>
              );
            })}
          </ul>
        </div>

        <div className="flex items-center justify-between gap-3 px-1 text-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={current.uri}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.2 }}
              className="truncate"
            >
              <span className="font-medium">{current.title}</span>
              <span className="text-muted-foreground"> · {current.artist}</span>
            </motion.p>
          </AnimatePresence>
          {/* Attribution for the hidden player below. */}
          <a
            href={toSpotifyLink(current.uri)}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Open ${current.title} in Spotify`}
            className="flex shrink-0 items-center gap-1.5 rounded-sm text-xs text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Icons.spotify className="size-3.5" />
            Spotify
          </a>
        </div>
      </div>

      {/* Spotify's player does the playing; the turntable is the interface.
          The embed stays laid out (display: none would stop it) but out of
          sight and out of reach. */}
      <div ref={embedRef} className="sr-only pointer-events-none opacity-0" aria-hidden="true" inert />
    </div>
  );
}
